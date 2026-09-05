"""Rate limiting for the crime analytics backend.

A deterministic, in-process fixed-window rate limiter implemented as ASGI
middleware.

Design notes
-----------
* In-process (per-instance) accounting using a monotonic clock. This is
  a single-instance control — it is NOT shared across replicas. Deploying
  multiple backend instances requires a distributed limit store or an
  API gateway. This limitation is documented in PRODUCTION_DATABASE.md.
* Fixed-window buckets keyed by ``route template + client identifier``.
  Limits are configured per route class (default / export / auth /
  audit) via ``RATE_LIMIT_*`` settings.
* Middleware position: CORS → Security → RequestID → Logging →
  RateLimit → Audit → Auth → App, i.e. rate limiting runs BEFORE
  authentication (throttles anonymous floods cheaply) and BEFORE the
  audit middleware, so rate-limited (429) requests are logged but never
  enter the security audit trail.
* Health probes and docs are never rate-limited.
* Responses over the limit are HTTP 429 with ``Retry-After`` and a
  structured error body (code ``RATE_LIMITED``).
* Clock and store are injectable so behaviour is deterministic in tests.
"""

from __future__ import annotations

import json
import time
from typing import Callable

from starlette.types import ASGIApp, Receive, Scope, Send

from app.core.config import settings

_LIMIT_BODY = {
    "error": {
        "code": "RATE_LIMITED",
        "message": "Too many requests. Please retry later.",
    }
}


class FixedWindowRateLimiter:
    """Fixed-window counter keyed by ``window_id:key``.

    A request is allowed if the request count within the current window
    does not exceed the limit. Requests that exceed the limit still
    increment the counter so the abusive client stays blocked for the
    remainder of the window.
    """

    def __init__(
        self,
        now: Callable[[], float] | None = None,
        store: dict[str, int] | None = None,
    ) -> None:
        self._now = now if now is not None else lambda: time.monotonic()
        self._store = store if store is not None else {}

    def allow(self, key: str, limit: int, window_seconds: int) -> bool:
        """Register one request; return True if within the limit."""
        window_id = int(self._now() // window_seconds)
        bucket = f"{window_id}:{key}"
        count = self._store.get(bucket, 0) + 1
        self._store[bucket] = count
        return count <= limit

    def reset(self) -> None:
        """Clear all counters (test/reset helper)."""
        self._store.clear()


# Module-level shared limiter used by the middleware so tests can reset
# counters deterministically between cases.
_default_limiter = FixedWindowRateLimiter()


def _route_group(path: str) -> str:
    """Map a request path to a stable rate-limit key.

    Uses the audited route template when available so dynamic segments
    (entity IDs) do not fragment the counter; otherwise falls back to the
    first three path segments.
    """
    try:
        from app.core.audit import normalize_route

        template = normalize_route(path)
        if template:
            return template
    except Exception:
        pass
    parts = [p for p in path.split("/") if p]
    return "/" + "/".join(parts[:3])


class RateLimitMiddleware:
    """ASGI middleware enforcing per-route-token rate limits."""

    def __init__(self, app: ASGIApp, limiter: FixedWindowRateLimiter | None = None) -> None:
        self.app = app
        self.limiter = limiter if limiter is not None else _default_limiter

    def reset(self) -> None:
        """Reset the shared limiter counters (test helper)."""
        self.limiter.reset()

    def _limits_for_path(self, path: str) -> tuple[int, int]:
        """Return (limit, window_seconds) for an API path."""
        if "/map/intelligence/export" in path:
            return settings.RATE_LIMIT_EXPORT_LIMIT, settings.RATE_LIMIT_EXPORT_WINDOW
        if "/network/search" in path:
            return settings.RATE_LIMIT_SEARCH_LIMIT, settings.RATE_LIMIT_SEARCH_WINDOW
        if "/admin/audit/events" in path:
            return settings.RATE_LIMIT_AUDIT_LIMIT, settings.RATE_LIMIT_AUDIT_WINDOW
        return settings.RATE_LIMIT_DEFAULT_LIMIT, settings.RATE_LIMIT_DEFAULT_WINDOW

    def _client_key(self, scope: Scope) -> str:
        """Derive a stable client identifier for rate limiting.

        Prefers the first ``X-Forwarded-For`` value (standard proxy
        header) when present; otherwise falls back to the socket peer.
        The header name is configurable via ``RATE_LIMIT_CLIENT_HEADER``.
        """
        client = scope.get("client")
        peer = client[0] if client else "unknown"
        header = settings.RATE_LIMIT_CLIENT_HEADER.encode("latin-1").lower()
        for name, value in scope.get("headers", []):
            if name == header:
                first = value.decode("latin-1").split(",")[0].strip()
                if first:
                    return f"{peer}:{first}"
        return peer

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")

        # Health/docs/root are never rate-limited
        if path == "/" or path.startswith("/health") or path.startswith("/docs") or path == "/openapi.json" or path == "/redoc":
            await self.app(scope, receive, send)
            return

        if not settings.RATE_LIMIT_ENABLED:
            await self.app(scope, receive, send)
            return

        limit, window = self._limits_for_path(path)
        key = f"{self._client_key(scope)}:{_route_group(path)}"
        if not self.limiter.allow(key, limit, window):
            await self._reject(scope, receive, send, window)
            return

        await self.app(scope, receive, send)

    async def _reject(
        self, scope: Scope, receive: Receive, send: Send, window: int
    ) -> None:
        """Send a 429 response and terminate the request."""
        import json

        request_id = get_request_id_from_scope(scope)
        body = json.dumps({
            "error": {
                "code": _LIMIT_BODY["error"]["code"],
                "message": _LIMIT_BODY["error"]["message"],
                "request_id": request_id,
            }
        }).encode("utf-8")

        await send({
            "type": "http.response.start",
            "status": 429,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(body)).encode()),
                (b"retry-after", str(window).encode()),
            ],
        })
        await send({
            "type": "http.response.body",
            "body": body,
            "more_body": False,
        })


def get_request_id_from_scope(scope: Scope) -> str:
    """Extract the request id from scope state without a Request object."""
    state = scope.get("state")
    if isinstance(state, dict):
        rid = state.get("request_id", "")
        return rid if isinstance(rid, str) else ""
    return ""