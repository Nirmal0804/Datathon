"""Request/correlation-ID middleware and structured logging.

Every inbound request receives a unique ``X-Request-ID``.
If the caller supplies a valid ``X-Request-ID`` header it is preserved;
otherwise a new UUID v4 is generated.

Structured log lines follow the format:
    request_id=<id> method=<M> path=<P> status=<S> duration_ms=<D>

Sensitive payloads (request bodies, FIR records, credentials, PII)
are **never** logged.

Both middlewares are implemented as raw ASGI to avoid the
ExceptionGroup-wrapping behaviour of Starlette's BaseHTTPMiddleware.
"""

from __future__ import annotations

import logging
import time
import uuid

from starlette.requests import Request
from starlette.types import ASGIApp, Receive, Scope, Send

logger = logging.getLogger("crime_analytics")

REQUEST_ID_HEADER = "X-Request-ID"
_REQUEST_ID_STATE_KEY = "request_id"


def _get_request_id(scope: Scope) -> str | None:
    state = scope.get("state")
    return state.get(_REQUEST_ID_STATE_KEY) if isinstance(state, dict) else None


def get_request_id(request: Request) -> str | None:
    """Return the correlation ID from request.state (used by exception handlers)."""
    return getattr(request.state, _REQUEST_ID_STATE_KEY, None)


# ---------------------------------------------------------------------------
# Request-ID middleware (pure ASGI)
# ---------------------------------------------------------------------------


class RequestIDMiddleware:
    """Attach a correlation ID to every request and response."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] not in ("http", "websocket"):
            await self.app(scope, receive, send)
            return

        raw = None
        for name, value in scope.get("headers", []):
            if name == REQUEST_ID_HEADER.lower().encode():
                if isinstance(value, bytes):
                    raw = value.decode("latin-1")
                else:
                    raw = value
                break
        request_id = raw if raw and len(raw) <= 128 else str(uuid.uuid4())

        state = scope.setdefault("state", {})
        state[_REQUEST_ID_STATE_KEY] = request_id

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                existing = list(message.get("headers", []))
                existing.append(
                    (REQUEST_ID_HEADER.lower().encode(), request_id.encode())
                )
                message["headers"] = existing
            await send(message)

        await self.app(scope, receive, send_wrapper)


# ---------------------------------------------------------------------------
# Structured-logging middleware (pure ASGI)
# ---------------------------------------------------------------------------


class StructuredLoggingMiddleware:
    """Log one structured line per completed HTTP request."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start = time.perf_counter()
        status_code = 500
        response_started = False

        async def send_wrapper(message):
            nonlocal status_code, response_started
            if message["type"] == "http.response.start":
                status_code = message.get("status", 500)
                response_started = True
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception:
            status_code = 500
            raise
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            request_id = _get_request_id(scope) or "-"
            method = scope.get("method", "?")
            path = scope.get("path", "?")
            logger.info(
                "request_id=%s method=%s path=%s status=%d duration_ms=%.2f",
                request_id,
                method,
                path,
                status_code,
                duration_ms,
            )
