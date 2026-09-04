"""In-Memory Response Cache Service with LRU eviction, per-item TTL, and single-flight protection.

Provides high-performance key-value caching for read-heavy CrimeIntel endpoints:
- Thread-safe storage with fine-grained locking and OrderedDict LRU eviction
- Deterministic cache key generation with query parameter normalization
- Per-item configurable TTL (default: 600s / 10 minutes)
- Targeted prefix-based and single-key cache invalidation
- Single-flight stampede coordination for concurrent duplicate requests
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
from typing import Any, Callable, Generator, Optional

from app.core.config import settings

logger = logging.getLogger("crimeintel.cache")


class JSONEncoderWithDates(json.JSONEncoder):
    """Custom JSON encoder to handle date, datetime, and Pydantic models."""

    def default(self, obj: Any) -> Any:
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        return super().default(obj)


class InMemoryCacheStore:
    """Thread-safe LRU in-memory cache store with per-item TTL expiration."""

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

    def put(self, key: str, value: str, ttl_seconds: int) -> None:
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
        """Return non-sensitive operational cache statistics."""
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


class CacheService:
    """Manages thread-safe in-memory response caching for CrimeIntel APIs."""

    def __init__(
        self,
        enabled: Optional[bool] = None,
        default_ttl: Optional[int] = None,
        max_entries: Optional[int] = None,
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
        """Retrieve a cached value by key. Returns parsed JSON or None on miss."""
        if not self._enabled:
            logger.debug("CACHE BYPASS: caching disabled")
            return None

        try:
            raw_val = self._store.get(key)
        except Exception as exc:
            logger.error("Cache get error for key %s: %s", key, exc)
            return None

        if raw_val is not None:
            logger.info("CACHE HIT: %s", key)
            try:
                return json.loads(raw_val)
            except Exception:
                return raw_val

        logger.info("CACHE MISS: %s", key)
        return None

    def put(
        self,
        key: str,
        value: Any,
        ttl_seconds: Optional[int] = None,
        req: Optional[Any] = None,
    ) -> bool:
        """Store a value in cache with TTL. Returns True if stored successfully."""
        if not self._enabled:
            return False

        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl

        try:
            serialized = json.dumps(value, cls=JSONEncoderWithDates)
        except Exception as exc:
            logger.error("Failed to serialize value for cache key %s: %s", key, exc)
            return False

        try:
            self._store.put(key, serialized, ttl)
            logger.info("CACHE STORE: %s (TTL %ds)", key, ttl)
            return True
        except Exception as exc:
            logger.error("Cache store error for key %s: %s", key, exc)
            return False

    def invalidate(self, key: str) -> bool:
        """Invalidate a specific cache key."""
        return self._store.invalidate(key)

    def invalidate_prefix(self, prefix: str) -> int:
        """Invalidate all keys matching a prefix (e.g., 'dashboard_', 'map_')."""
        return self._store.invalidate_prefix(prefix)

    def clear(self) -> None:
        """Clear all cached entries (useful for test isolation)."""
        self._store.clear()

    def get_stats(self) -> dict[str, int]:
        """Return non-sensitive operational cache statistics."""
        return self._store.get_stats()

    @contextmanager
    def single_flight(self, key: str) -> Generator[bool, None, None]:
        """Context manager coordinating single-flight execution for identical concurrent keys.

        Yields True if the caller won the race and should perform the computation,
        or False if another thread is computing or has completed.
        """
        with self._flight_meta_lock:
            if key not in self._flight_locks:
                self._flight_locks[key] = threading.Lock()
            key_lock = self._flight_locks[key]

        with key_lock:
            try:
                # If value is now in cache, computation is not needed
                if self.get(key) is not None:
                    with self._store._lock:
                        self._store._stampede_prevented += 1
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
