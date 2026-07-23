"""Domain exceptions for the crime analytics backend.

Each exception carries a machine-readable code, a safe human message,
and the request_id for tracing.  None of these expose stack traces,
database details, or sensitive payload information.
"""

from __future__ import annotations


class DomainError(Exception):
    """Base class for all domain errors."""

    code: str = "INTERNAL_ERROR"
    status_code: int = 500
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None, request_id: str | None = None):
        self.message = message or self.__class__.message
        self.request_id = request_id
        super().__init__(self.message)


class ResourceNotFoundError(DomainError):
    code = "RESOURCE_NOT_FOUND"
    status_code = 404
    message = "The requested resource was not found."


class InvalidFilterError(DomainError):
    code = "INVALID_FILTER"
    status_code = 400
    message = "One or more query filters are invalid."


class DependencyUnavailableError(DomainError):
    code = "DEPENDENCY_UNAVAILABLE"
    status_code = 503
    message = "An external dependency is currently unavailable."


class ModelUnavailableError(DomainError):
    code = "MODEL_UNAVAILABLE"
    status_code = 503
    message = "The ML model or analytics artifact is unavailable."
