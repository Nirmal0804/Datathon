"""In-Memory Response Cache Service with per-item TTL expiration.

Provides high-performance key-value caching for read-heavy CrimeIntel endpoints:
- Thread-safe storage with fine-grained locking
- Deterministic cache key generation with query parameter normalization
- Per-item configurable TTL (default: 600s / 10 minutes)
- Structured non-sensitive performance logging
"""

from __future__ import annotations

import json
import logging
import threading
import time
from datetime import date, datetime
from typing import Any, Optional

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
    """Thread-safe in-memory cache store with per-item TTL expiration."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[float, str]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[str]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            expiry, value = entry
            if time.time() > expiry:
                del self._store[key]
                return None
            return value

    def put(self, key: str, value: str, ttl_seconds: int) -> None:
        with self._lock:
            # Evict expired items periodically if cache grows large
            if len(self._store) > 1000:
                now = time.time()
                self._store = {k: v for k, v in self._store.items() if v[0] > now}
            self._store[key] = (time.time() + ttl_seconds, value)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()


class CacheService:
    """Manages thread-safe in-memory response caching for CrimeIntel APIs."""

    def __init__(self) -> None:
        self._enabled = settings.CACHE_ENABLED
        self._default_ttl = settings.CACHE_TTL_SECONDS
        self._store = InMemoryCacheStore()

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

        raw_val = self._store.get(key)
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

        self._store.put(key, serialized, ttl)
        logger.info("CACHE STORE: %s (TTL %ds)", key, ttl)
        return True

    def clear(self) -> None:
        """Clear all cached entries (useful for test isolation)."""
        self._store.clear()


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
