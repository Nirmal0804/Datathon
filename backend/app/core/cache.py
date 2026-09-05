"""Multi-Tier Response Cache Service: L1 In-Memory LRU + L2 Zoho Catalyst Cache.

Provides high-performance multi-tier caching for read-heavy CrimeIntel endpoints:
- L1: Process-local thread-safe OrderedDict LRU with fine-grained locking and fast access (<0.1ms)
- L2: Optional shared Zoho Catalyst Cache segment with safe failover and payload protection
- Two-Tier Promotion: L1 Miss -> L2 Hit -> Populate L1 -> Return result
- Single-flight stampede coordination for concurrent duplicate requests
- Multi-tier invalidation (single-key, prefix-based, clear) executing across L1 and L2
- Non-sensitive operational statistics and telemetry
"""

from __future__ import annotations

import json
import logging
import threading
import time
from collections import OrderedDict
from contextlib import contextmanager
from datetime import date, datetime
from typing import Any, Callable, Generator, Optional, Protocol, runtime_checkable

from app.core.config import settings

logger = logging.getLogger("crimeintel.cache")

# Catalyst Cache single-value size safety limit (512 KB)
MAX_CATALYST_PAYLOAD_BYTES = 512 * 1024


class JSONEncoderWithDates(json.JSONEncoder):
    """Custom JSON encoder to handle date, datetime, and Pydantic models."""

    def default(self, obj: Any) -> Any:
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        return super().default(obj)


@runtime_checkable
class CacheBackend(Protocol):
    """Abstract protocol for cache storage backends."""

    def get(self, key: str) -> Optional[str]: ...

    def put(self, key: str, value: str, ttl_seconds: int) -> bool: ...

    def invalidate(self, key: str) -> bool: ...

    def invalidate_prefix(self, prefix: str) -> int: ...

    def clear(self) -> None: ...


class InMemoryCacheStore:
    """Thread-safe LRU in-memory cache store (L1) with per-item TTL expiration."""

    def __init__(self, max_entries: Optional[int] = None) -> None:
        self._max_entries = (
            max_entries
            if max_entries is not None
            else getattr(settings, "CACHE_MAX_ENTRIES", 1000)
        )
        self._store: OrderedDict[str, tuple[float, str]] = OrderedDict()
        self._lock = threading.Lock()

        # Telemetry counters
        self._hits: int = 0
        self._misses: int = 0
        self._sets: int = 0
        self._evictions: int = 0
        self._invalidations: int = 0
        self._expired_evictions: int = 0
        self._stampede_prevented: int = 0

    def get(self, key: str) -> Optional[str]:
        """Retrieve a value by key. Updates LRU order on hit."""
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                self._misses += 1
                return None

            expiry, value = entry
            if time.time() > expiry:
                del self._store[key]
                self._expired_evictions += 1
                self._misses += 1
                return None

            # Mark as most recently used
            self._store.move_to_end(key)
            self._hits += 1
            return value

    def put(self, key: str, value: str, ttl_seconds: int) -> bool:
        """Store a key-value pair with TTL and enforce LRU capacity bounds."""
        with self._lock:
            now = time.time()

            # If existing key is updated, move to most recent
            if key in self._store:
                self._store.move_to_end(key)

            self._store[key] = (now + ttl_seconds, value)
            self._sets += 1

            # Bounded memory enforcement (LRU eviction)
            if len(self._store) > self._max_entries:
                # First pass: clean expired entries
                expired_keys = [k for k, v in self._store.items() if v[0] <= now]
                for k in expired_keys:
                    del self._store[k]
                    self._expired_evictions += 1

                # Second pass: evict oldest entries until within capacity
                while len(self._store) > self._max_entries:
                    self._store.popitem(last=False)
                    self._evictions += 1
            return True

    def invalidate(self, key: str) -> bool:
        """Invalidate a specific cache key."""
        with self._lock:
            if key in self._store:
                del self._store[key]
                self._invalidations += 1
                return True
            return False

    def invalidate_prefix(self, prefix: str) -> int:
        """Invalidate all cache entries matching a prefix."""
        with self._lock:
            matching_keys = [k for k in self._store if k.startswith(prefix)]
            for k in matching_keys:
                del self._store[k]
            self._invalidations += len(matching_keys)
            return len(matching_keys)

    def clear(self) -> None:
        """Clear all cached entries."""
        with self._lock:
            count = len(self._store)
            self._store.clear()
            self._invalidations += count

    def get_stats(self) -> dict[str, int]:
        """Return operational L1 statistics."""
        with self._lock:
            return {
                "hits": self._hits,
                "misses": self._misses,
                "sets": self._sets,
                "evictions": self._evictions,
                "invalidations": self._invalidations,
                "expired_evictions": self._expired_evictions,
                "stampede_prevented": self._stampede_prevented,
                "current_entries": len(self._store),
                "max_entries": self._max_entries,
            }


class CatalystCacheStore:
    """Zoho Catalyst L2 Cache adapter with fail-safe error handling."""

    def __init__(
        self,
        enabled: Optional[bool] = None,
        segment_id: Optional[str] = None,
        default_ttl: Optional[int] = None,
        client: Optional[Any] = None,
    ) -> None:
        self._enabled = (
            enabled
            if enabled is not None
            else getattr(settings, "CATALYST_CACHE_ENABLED", False)
        )
        self._segment_id = (
            segment_id
            if segment_id is not None
            else getattr(settings, "CATALYST_CACHE_SEGMENT_ID", "")
        )
        self._default_ttl = (
            default_ttl
            if default_ttl is not None
            else getattr(settings, "CATALYST_CACHE_TTL_SECONDS", 600)
        )
        self._client = client
        self._lock = threading.Lock()

        # Telemetry counters
        self._hits: int = 0
        self._misses: int = 0
        self._sets: int = 0
        self._errors: int = 0
        self._invalidations: int = 0

    @property
    def is_enabled(self) -> bool:
        return self._enabled

    def _get_segment(self, req: Optional[Any] = None) -> Any:
        """Resolve Catalyst Cache segment instance via client or zcatalyst_sdk."""
        if self._client is not None:
            return self._client

        try:
            import zcatalyst_sdk

            app = zcatalyst_sdk.initialize(req=req) if req else zcatalyst_sdk.initialize()
            cache_service = app.cache()
            return (
                cache_service.segment(self._segment_id)
                if self._segment_id
                else cache_service.segment()
            )
        except Exception as exc:
            with self._lock:
                self._errors += 1
            logger.debug("Catalyst Cache SDK unavailable: %s", exc)
            return None

    def get(self, key: str, req: Optional[Any] = None) -> Optional[str]:
        """Retrieve value from Catalyst Cache segment. Returns None on miss or error."""
        if not self._enabled:
            return None

        try:
            segment = self._get_segment(req=req)
            if segment is None:
                return None

            # Catalyst Python SDK uses get_value(key) or get(key)
            if hasattr(segment, "get_value"):
                val = segment.get_value(key)
            elif hasattr(segment, "get"):
                val = segment.get(key)
            else:
                return None

            if val is not None:
                with self._lock:
                    self._hits += 1
                logger.info("CATALYST CACHE L2 HIT: %s", key)
                return str(val)

            with self._lock:
                self._misses += 1
            return None
        except Exception as exc:
            with self._lock:
                self._errors += 1
            logger.warning("Catalyst Cache L2 get error for key %s (falling back to L1/DB): %s", key, exc)
            return None

    def put(
        self,
        key: str,
        value: str,
        ttl_seconds: Optional[int] = None,
        req: Optional[Any] = None,
    ) -> bool:
        """Store value in Catalyst Cache segment with payload size validation."""
        if not self._enabled:
            return False

        # Payload size safeguard: prevent storing oversized blobs in Catalyst segment
        if len(value.encode("utf-8")) > MAX_CATALYST_PAYLOAD_BYTES:
            logger.debug("Payload for key %s exceeds Catalyst Cache limit (%d bytes), skipping L2", key, len(value))
            return False

        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl

        try:
            segment = self._get_segment(req=req)
            if segment is None:
                return False

            # In Catalyst SDK, put accepts key and value string with optional expiry
            if hasattr(segment, "put"):
                try:
                    # Pass ttl if supported by SDK implementation
                    segment.put(key, value, expiry_in_hours=max(1, ttl // 3600))
                except TypeError:
                    segment.put(key, value)
            else:
                return False

            with self._lock:
                self._sets += 1
            logger.info("CATALYST CACHE L2 STORE: %s (TTL %ds)", key, ttl)
            return True
        except Exception as exc:
            with self._lock:
                self._errors += 1
            logger.warning("Catalyst Cache L2 put error for key %s: %s", key, exc)
            return False

    def invalidate(self, key: str, req: Optional[Any] = None) -> bool:
        """Delete a key from Catalyst Cache segment."""
        if not self._enabled:
            return False

        try:
            segment = self._get_segment(req=req)
            if segment is None:
                return False

            if hasattr(segment, "delete"):
                segment.delete(key)
            elif hasattr(segment, "delete_value"):
                segment.delete_value(key)
            else:
                return False

            with self._lock:
                self._invalidations += 1
            return True
        except Exception as exc:
            with self._lock:
                self._errors += 1
            logger.warning("Catalyst Cache L2 invalidate error for key %s: %s", key, exc)
            return False

    def invalidate_prefix(self, prefix: str) -> int:
        """Purge prefix in Catalyst Cache if client supports key enumeration or clear."""
        if not self._enabled:
            return 0

        # Most remote key-value cache segments don't support full namespace scans without segment reset
        # If the client provides an invalidation or key scan, invoke it safely
        try:
            if self._client and hasattr(self._client, "invalidate_prefix"):
                count = self._client.invalidate_prefix(prefix)
                with self._lock:
                    self._invalidations += count
                return count
            return 0
        except Exception as exc:
            with self._lock:
                self._errors += 1
            logger.warning("Catalyst Cache L2 invalidate_prefix error: %s", exc)
            return 0

    def clear(self) -> None:
        """Reset or clear L2 segment if client supports segment clearing."""
        if not self._enabled:
            return

        try:
            if self._client and hasattr(self._client, "clear"):
                self._client.clear()
        except Exception as exc:
            with self._lock:
                self._errors += 1
            logger.warning("Catalyst Cache L2 clear error: %s", exc)

    def get_stats(self) -> dict[str, Any]:
        """Return operational L2 statistics."""
        with self._lock:
            return {
                "enabled": self._enabled,
                "segment_id": self._segment_id or "default",
                "hits": self._hits,
                "misses": self._misses,
                "sets": self._sets,
                "errors": self._errors,
                "invalidations": self._invalidations,
            }


class CacheService:
    """Manages multi-tier (L1 In-Memory + L2 Catalyst) response caching for CrimeIntel APIs."""

    def __init__(
        self,
        enabled: Optional[bool] = None,
        default_ttl: Optional[int] = None,
        max_entries: Optional[int] = None,
        l2_store: Optional[CatalystCacheStore] = None,
    ) -> None:
        self._enabled = (
            enabled if enabled is not None else settings.CACHE_ENABLED
        )
        self._default_ttl = (
            default_ttl
            if default_ttl is not None
            else settings.CACHE_TTL_SECONDS
        )
        self._store = InMemoryCacheStore(max_entries=max_entries)
        self._l1 = self._store
        self._l2 = l2_store if l2_store is not None else CatalystCacheStore()

        # Single-flight coordination locks
        self._flight_locks: dict[str, threading.Lock] = {}
        self._flight_meta_lock = threading.Lock()

    def make_cache_key(self, prefix: str, **params: Any) -> str:
        """Create a deterministic cache key from prefix and sorted query parameters."""
        if not params:
            return prefix

        parts = []
        for k in sorted(params.keys()):
            v = params[k]
            if v is not None:
                if isinstance(v, (date, datetime)):
                    v_str = v.isoformat()
                elif isinstance(v, bool):
                    v_str = "1" if v else "0"
                else:
                    v_str = str(v).strip()
                parts.append(f"{k}={v_str}")

        if not parts:
            return prefix

        param_str = "&".join(parts)
        return f"{prefix}:{param_str}"

    def get(self, key: str, req: Optional[Any] = None) -> Optional[Any]:
        """Retrieve a cached value across L1 and L2 layers. Returns parsed JSON or None on miss."""
        if not self._enabled:
            logger.debug("CACHE BYPASS: caching disabled")
            return None

        # 1. Check L1 Cache
        try:
            raw_l1 = self._l1.get(key)
        except Exception as exc:
            logger.error("L1 Cache get error for key %s: %s", key, exc)
            raw_l1 = None

        if raw_l1 is not None:
            logger.info("CACHE L1 HIT: %s", key)
            try:
                return json.loads(raw_l1)
            except Exception:
                return raw_l1

        # 2. Check L2 Catalyst Cache (if active)
        if self._l2 and self._l2.is_enabled:
            raw_l2 = self._l2.get(key, req=req)
            if raw_l2 is not None:
                logger.info("CACHE L2 HIT -> POPULATING L1: %s", key)
                # Populate L1 on L2 hit
                self._l1.put(key, raw_l2, self._default_ttl)
                try:
                    return json.loads(raw_l2)
                except Exception:
                    return raw_l2

        logger.info("CACHE MISS (L1 & L2): %s", key)
        return None

    def put(
        self,
        key: str,
        value: Any,
        ttl_seconds: Optional[int] = None,
        req: Optional[Any] = None,
    ) -> bool:
        """Store a value in both L1 and L2 caches with TTL. Returns True if stored in at least L1."""
        if not self._enabled:
            return False

        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl

        try:
            serialized = json.dumps(value, cls=JSONEncoderWithDates)
        except Exception as exc:
            logger.error("Failed to serialize value for cache key %s: %s", key, exc)
            return False

        # Store in L1
        l1_ok = False
        try:
            self._l1.put(key, serialized, ttl)
            l1_ok = True
            logger.info("CACHE STORE (L1): %s (TTL %ds)", key, ttl)
        except Exception as exc:
            logger.error("L1 cache store error for key %s: %s", key, exc)

        # Store in L2 (if enabled)
        if self._l2 and self._l2.is_enabled:
            try:
                self._l2.put(key, serialized, ttl, req=req)
            except Exception as exc:
                logger.warning("L2 cache store failed for key %s: %s", key, exc)

        return l1_ok

    def invalidate(self, key: str, req: Optional[Any] = None) -> bool:
        """Invalidate a specific cache key in both L1 and L2."""
        l1_res = self._l1.invalidate(key)
        l2_res = self._l2.invalidate(key, req=req) if (self._l2 and self._l2.is_enabled) else False
        return l1_res or l2_res

    def invalidate_prefix(self, prefix: str) -> int:
        """Invalidate all keys matching a prefix across L1 and L2."""
        l1_count = self._l1.invalidate_prefix(prefix)
        l2_count = self._l2.invalidate_prefix(prefix) if (self._l2 and self._l2.is_enabled) else 0
        return l1_count + l2_count

    def clear(self) -> None:
        """Clear all cached entries in both L1 and L2."""
        self._l1.clear()
        if self._l2 and self._l2.is_enabled:
            self._l2.clear()

    def get_stats(self) -> dict[str, Any]:
        """Return combined operational cache statistics for L1 and L2."""
        l1_stats = self._l1.get_stats()
        l2_stats = self._l2.get_stats() if self._l2 else {}

        return {
            "l1": l1_stats,
            "l2": l2_stats,
            # Backward-compatible flat keys
            "hits": l1_stats["hits"] + l2_stats.get("hits", 0),
            "misses": l1_stats["misses"],
            "sets": l1_stats["sets"],
            "evictions": l1_stats["evictions"],
            "invalidations": l1_stats["invalidations"] + l2_stats.get("invalidations", 0),
            "expired_evictions": l1_stats["expired_evictions"],
            "stampede_prevented": l1_stats["stampede_prevented"],
            "current_entries": l1_stats["current_entries"],
            "max_entries": l1_stats["max_entries"],
        }

    @contextmanager
    def single_flight(self, key: str) -> Generator[bool, None, None]:
        """Context manager coordinating single-flight execution for identical concurrent keys."""
        with self._flight_meta_lock:
            if key not in self._flight_locks:
                self._flight_locks[key] = threading.Lock()
            key_lock = self._flight_locks[key]

        with key_lock:
            try:
                # If value is now in cache, computation is not needed
                if self.get(key) is not None:
                    with self._l1._lock:
                        self._l1._stampede_prevented += 1
                    logger.info("CACHE STAMPEDE PREVENTED: %s", key)
                    yield False
                else:
                    yield True
            finally:
                with self._flight_meta_lock:
                    if key in self._flight_locks and not key_lock.locked():
                        self._flight_locks.pop(key, None)

    def get_or_compute(
        self,
        key: str,
        compute_fn: Callable[[], Any],
        ttl_seconds: Optional[int] = None,
        req: Optional[Any] = None,
    ) -> Any:
        """Retrieve from cache or compute once using single-flight stampede protection."""
        val = self.get(key, req=req)
        if val is not None:
            return val

        if not self._enabled:
            return compute_fn()

        with self.single_flight(key) as should_compute:
            if not should_compute:
                cached_val = self.get(key, req=req)
                if cached_val is not None:
                    return cached_val

            result = compute_fn()
            self.put(key, result, ttl_seconds=ttl_seconds, req=req)
            return result


# Backward compatibility aliases
CatalystCacheService = CacheService
InMemoryCacheFallback = InMemoryCacheStore

# Global singleton instance provider
_cache_instance: Optional[CacheService] = None
_cache_lock = threading.Lock()


def get_cache_service() -> CacheService:
    """Dependency provider returning the singleton CacheService."""
    global _cache_instance
    if _cache_instance is None:
        with _cache_lock:
            if _cache_instance is None:
                _cache_instance = CacheService()
    return _cache_instance
