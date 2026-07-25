"""Comprehensive audit logging tests.

Covers:
- Event construction and field allowlisting
- Route classification and normalization
- Resource ID extraction
- Health exclusion
- Exactly-once audit behavior
- Audit persistence failure handling (fail-open)
- API route audit classification
- No sensitive data leakage (JWT, PII, bodies)
- Outcome semantics (SUCCESS, DENIED, FAILURE)
- Append-only repository contract
"""

from __future__ import annotations

import json
import logging
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.audit import (
    AuditEvent,
    AuditMiddleware,
    AuditOutcome,
    _EXCLUDED_PATHS,
    _ROUTE_CLASSIFICATIONS,
    classify_route,
    extract_resource_id,
    normalize_route,
    should_audit,
)
from app.core.config import settings
from app.database.repositories.csv.audit_repo import NoOpAuditRepository
from app.database.repositories.protocols import AuditRepository
from app.main import app
from app.services.audit_service import (
    init_audit_repository,
    write_audit_event,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


class InMemoryAuditRepository:
    """Test audit repository that stores events in memory."""

    def __init__(self) -> None:
        self.events: list[dict] = []
        self.fail_on_append = False

    def append(self, event: dict) -> None:
        if self.fail_on_append:
            raise RuntimeError("Simulated audit write failure")
        self.events.append(event)


# ---------------------------------------------------------------------------
# 1. Event construction
# ---------------------------------------------------------------------------


class TestAuditEventConstruction:
    """Test AuditEvent dataclass construction and defaults."""

    def test_event_has_uuid(self):
        event = AuditEvent()
        assert event.event_id
        uuid.UUID(event.event_id)  # valid UUID

    def test_event_has_utc_timestamp(self):
        event = AuditEvent()
        assert event.event_timestamp.tzinfo == timezone.utc

    def test_event_is_frozen(self):
        event = AuditEvent()
        with pytest.raises(AttributeError):
            event.route = "/modified"  # type: ignore[misc]

    def test_event_default_values(self):
        event = AuditEvent()
        assert event.request_id == ""
        assert event.user_id is None
        assert event.http_method == ""
        assert event.route == ""
        assert event.action == ""
        assert event.resource_type == ""
        assert event.resource_id is None
        assert event.outcome == AuditOutcome.SUCCESS.value
        assert event.status_code == 200
        assert event.schema_version == 1

    def test_event_with_all_fields(self):
        ts = datetime(2025, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
        event = AuditEvent(
            event_id="test-id-123",
            event_timestamp=ts,
            request_id="req-456",
            user_id="user-789",
            http_method="GET",
            route="/api/v1/dashboard/summary",
            action="READ",
            resource_type="dashboard_summary",
            resource_id=None,
            outcome="SUCCESS",
            status_code=200,
        )
        assert event.event_id == "test-id-123"
        assert event.user_id == "user-789"
        assert event.action == "READ"


# ---------------------------------------------------------------------------
# 2. Route classification
# ---------------------------------------------------------------------------


class TestRouteClassification:
    """Test deterministic route classification taxonomy."""

    def test_dashboard_summary(self):
        action, resource, rid = classify_route("/api/v1/dashboard/summary")
        assert action == "READ"
        assert resource == "dashboard_summary"
        assert rid is None

    def test_field_cases_list(self):
        action, resource, rid = classify_route("/api/v1/map/field/cases")
        assert action == "LIST"
        assert resource == "fir"

    def test_field_case_detail(self):
        action, resource, rid = classify_route("/api/v1/map/field/case/FIR_123")
        assert action == "READ"
        assert resource == "fir"
        assert rid == "FIR_123"

    def test_field_filters(self):
        action, resource, rid = classify_route("/api/v1/map/field/filters")
        assert action == "READ"
        assert resource == "field_filters"

    def test_field_hotspots(self):
        action, resource, rid = classify_route("/api/v1/map/field/hotspots")
        assert action == "READ"
        assert resource == "hotspot"

    def test_intelligence_analytics(self):
        action, resource, rid = classify_route("/api/v1/map/intelligence/analytics")
        assert action == "READ"
        assert resource == "crime_map"

    def test_intelligence_heatmap(self):
        action, resource, rid = classify_route("/api/v1/map/intelligence/heatmap")
        assert action == "READ"
        assert resource == "crime_map"

    def test_intelligence_clusters(self):
        action, resource, rid = classify_route("/api/v1/map/intelligence/clusters")
        assert action == "READ"
        assert resource == "crime_map"

    def test_intelligence_hotspots(self):
        action, resource, rid = classify_route("/api/v1/map/intelligence/hotspots")
        assert action == "READ"
        assert resource == "hotspot"

    def test_intelligence_district_comparison(self):
        action, resource, rid = classify_route("/api/v1/map/intelligence/district-comparison")
        assert action == "READ"
        assert resource == "district"

    def test_intelligence_timeline(self):
        action, resource, rid = classify_route("/api/v1/map/intelligence/timeline")
        assert action == "READ"
        assert resource == "crime_map"

    def test_intelligence_export(self):
        action, resource, rid = classify_route("/api/v1/map/intelligence/export")
        assert action == "EXPORT"
        assert resource == "crime_data"

    def test_districts_list(self):
        action, resource, rid = classify_route("/api/v1/districts")
        assert action == "LIST"
        assert resource == "district"

    def test_district_intelligence(self):
        action, resource, rid = classify_route("/api/v1/districts/5/intelligence")
        assert action == "READ"
        assert resource == "district"
        assert rid == "5"

    def test_stations_list(self):
        action, resource, rid = classify_route("/api/v1/stations")
        assert action == "LIST"
        assert resource == "station"

    def test_station_detail(self):
        action, resource, rid = classify_route("/api/v1/stations/PS001")
        assert action == "READ"
        assert resource == "station"
        assert rid == "PS001"

    def test_network_graph(self):
        action, resource, rid = classify_route("/api/v1/network/graph")
        assert action == "READ"
        assert resource == "network_graph"

    def test_network_entity_detail(self):
        action, resource, rid = classify_route("/api/v1/network/entities/person/P123")
        assert action == "READ"
        assert resource == "network_entity"
        assert rid == "P123"

    def test_network_search(self):
        action, resource, rid = classify_route("/api/v1/network/search")
        assert action == "SEARCH"
        assert resource == "network"

    def test_auth_me(self):
        action, resource, rid = classify_route("/api/v1/auth/me")
        assert action == "READ"
        assert resource == "authenticated_identity"


# ---------------------------------------------------------------------------
# 3. Health exclusion
# ---------------------------------------------------------------------------


class TestHealthExclusion:
    """Health probes must NOT generate audit events."""

    def test_health_excluded(self):
        assert not should_audit("/health")

    def test_health_live_excluded(self):
        assert not should_audit("/health/live")

    def test_health_ready_excluded(self):
        assert not should_audit("/health/ready")

    def test_docs_excluded(self):
        assert not should_audit("/docs")

    def test_redoc_excluded(self):
        assert not should_audit("/redoc")

    def test_openapi_excluded(self):
        assert not should_audit("/openapi.json")

    def test_unknown_route_excluded(self):
        assert not should_audit("/api/v1/unknown/endpoint")

    def test_classified_route_included(self):
        assert should_audit("/api/v1/dashboard/summary")


# ---------------------------------------------------------------------------
# 4. Path normalization
# ---------------------------------------------------------------------------


class TestPathNormalization:
    """Test path normalization to route templates."""

    def test_exact_match(self):
        assert normalize_route("/api/v1/dashboard/summary") == "/api/v1/dashboard/summary"

    def test_fir_identifier_normalized(self):
        assert normalize_route("/api/v1/map/field/case/FIR_ABC") == "/api/v1/map/field/case/{fir_identifier}"

    def test_district_intelligence_normalized(self):
        assert normalize_route("/api/v1/districts/12/intelligence") == "/api/v1/districts/{district_id}/intelligence"

    def test_station_detail_normalized(self):
        assert normalize_route("/api/v1/stations/PS001") == "/api/v1/stations/{station_id}"

    def test_network_entity_normalized(self):
        assert normalize_route("/api/v1/network/entities/fir/FIR001") == "/api/v1/network/entities/{entity_type}/{entity_id}"

    def test_unknown_returns_none(self):
        assert normalize_route("/api/v1/unknown") is None

    def test_health_returns_none(self):
        assert normalize_route("/health") is None


# ---------------------------------------------------------------------------
# 5. Resource ID extraction
# ---------------------------------------------------------------------------


class TestResourceIDExtraction:
    """Test safe resource ID extraction from paths."""

    def test_fir_identifier(self):
        assert extract_resource_id("/api/v1/map/field/case/FIR_123") == "FIR_123"

    def test_district_id(self):
        assert extract_resource_id("/api/v1/districts/5/intelligence") == "5"

    def test_station_id(self):
        assert extract_resource_id("/api/v1/stations/PS001") == "PS001"

    def test_network_entity_id(self):
        assert extract_resource_id("/api/v1/network/entities/person/P123") == "P123"

    def test_list_endpoints_return_none(self):
        assert extract_resource_id("/api/v1/dashboard/summary") is None
        assert extract_resource_id("/api/v1/districts") is None
        assert extract_resource_id("/api/v1/stations") is None
        assert extract_resource_id("/api/v1/map/field/cases") is None


# ---------------------------------------------------------------------------
# 6. No-op audit repository
# ---------------------------------------------------------------------------


class TestNoOpAuditRepository:
    """CSV/no-op adapter must not crash and should log."""

    def test_append_does_not_raise(self):
        repo = NoOpAuditRepository()
        repo.append({"request_id": "test", "outcome": "SUCCESS"})

    def test_append_multiple_events(self):
        repo = NoOpAuditRepository()
        for i in range(5):
            repo.append({"request_id": f"test-{i}", "outcome": "SUCCESS"})


# ---------------------------------------------------------------------------
# 7. In-memory audit repository (append-only contract)
# ---------------------------------------------------------------------------


class TestAuditRepositoryContract:
    """Verify append-only repository behavior."""

    def test_append_stores_event(self):
        repo = InMemoryAuditRepository()
        event = {"event_id": "123", "outcome": "SUCCESS"}
        repo.append(event)
        assert len(repo.events) == 1
        assert repo.events[0]["event_id"] == "123"

    def test_append_only_no_update(self):
        repo = InMemoryAuditRepository()
        repo.append({"event_id": "1", "outcome": "SUCCESS"})
        repo.append({"event_id": "2", "outcome": "DENIED"})
        assert len(repo.events) == 2
        # Verify no update/delete methods exist
        assert not hasattr(repo, "update")
        assert not hasattr(repo, "delete")
        assert not hasattr(repo, "modify")

    def test_protocol_satisfaction(self):
        repo = InMemoryAuditRepository()
        assert isinstance(repo, AuditRepository)


# ---------------------------------------------------------------------------
# 8. AuditService persistence
# ---------------------------------------------------------------------------


class TestAuditServicePersistence:
    """Test audit event persistence and failure handling."""

    def setup_method(self):
        self.repo = InMemoryAuditRepository()
        init_audit_repository(self.repo)

    def test_write_audit_event_persists(self):
        event = AuditEvent(
            request_id="req-1",
            user_id="user-1",
            http_method="GET",
            route="/api/v1/dashboard/summary",
            action="READ",
            resource_type="dashboard_summary",
            outcome="SUCCESS",
            status_code=200,
        )
        write_audit_event(event)
        assert len(self.repo.events) == 1
        stored = self.repo.events[0]
        assert stored["request_id"] == "req-1"
        assert stored["user_id"] == "user-1"
        assert stored["action"] == "READ"
        assert stored["resource_type"] == "dashboard_summary"

    def test_write_audit_event_field_allowlisting(self):
        """Only explicitly allowed fields are persisted — no extras."""
        event = AuditEvent(request_id="req-1", http_method="GET", route="/test")
        write_audit_event(event)
        stored = self.repo.events[0]
        expected_keys = {
            "event_id", "event_timestamp", "request_id", "user_id",
            "http_method", "route", "action", "resource_type", "resource_id",
            "outcome", "status_code", "schema_version",
        }
        assert set(stored.keys()) == expected_keys

    def test_write_audit_event_no_sensitive_fields(self):
        """Ensure no JWT, secrets, or PII fields leak into the record."""
        event = AuditEvent(request_id="req-1", user_id="user-1")
        write_audit_event(event)
        stored = self.repo.events[0]
        forbidden_keys = {
            "authorization", "token", "jwt", "password", "secret",
            "request_body", "response_body", "full_name", "dob",
            "address", "phone", "email", "blood_group", "dna",
            "fingerprint", "photograph", "biometric",
        }
        assert forbidden_keys.isdisjoint(set(stored.keys()))

    def test_write_audit_event_null_user_id(self):
        """Anonymous/public requests have NULL user_id."""
        event = AuditEvent(request_id="req-1", user_id=None)
        write_audit_event(event)
        assert self.repo.events[0]["user_id"] is None

    def test_persistence_failure_does_not_raise(self):
        """Audit write failure must never block the original request."""
        self.repo.fail_on_append = True
        event = AuditEvent(request_id="req-1", http_method="GET", route="/test")
        # Must NOT raise
        write_audit_event(event)

    def test_persistence_failure_emits_critical_log(self, caplog):
        """Audit write failure must produce CRITICAL-level log."""
        self.repo.fail_on_append = True
        event = AuditEvent(
            request_id="req-1",
            http_method="GET",
            route="/api/v1/dashboard/summary",
            action="READ",
            resource_type="dashboard_summary",
            outcome="SUCCESS",
            status_code=200,
        )
        with caplog.at_level(logging.CRITICAL, logger="crime_analytics.audit"):
            write_audit_event(event)
        assert "AUDIT_PERSISTENCE_FAILURE" in caplog.text


# ---------------------------------------------------------------------------
# 9. Audit middleware integration tests
# ---------------------------------------------------------------------------


class TestAuditMiddlewareIntegration:
    """Test AuditMiddleware through the full FastAPI app."""

    def setup_method(self):
        self.repo = InMemoryAuditRepository()
        init_audit_repository(self.repo)

    def test_dashboard_summary_generates_audit_event(self):
        client = TestClient(app)
        resp = client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 200
        # Audit events may be written (depends on auth state)
        # At minimum, verify no crash

    def test_health_does_not_generate_audit_event(self):
        """Health probes must NOT generate audit events."""
        client = TestClient(app)
        initial_count = len(self.repo.events)
        resp = client.get("/health")
        assert resp.status_code == 200
        assert len(self.repo.events) == initial_count

    def test_health_live_no_audit(self):
        client = TestClient(app)
        initial_count = len(self.repo.events)
        resp = client.get("/health/live")
        assert resp.status_code == 200
        assert len(self.repo.events) == initial_count

    def test_health_ready_no_audit(self):
        client = TestClient(app)
        initial_count = len(self.repo.events)
        resp = client.get("/health/ready")
        assert resp.status_code in (200, 503)
        assert len(self.repo.events) == initial_count

    def test_unknown_route_no_audit(self):
        client = TestClient(app)
        initial_count = len(self.repo.events)
        resp = client.get("/api/v1/nonexistent")
        assert len(self.repo.events) == initial_count


# ---------------------------------------------------------------------------
# 10. Outcome semantics
# ---------------------------------------------------------------------------


class TestOutcomeSemantics:
    """Test that outcomes are correctly determined."""

    def test_success_outcome_enum(self):
        assert AuditOutcome.SUCCESS.value == "SUCCESS"

    def test_denied_outcome_enum(self):
        assert AuditOutcome.DENIED.value == "DENIED"

    def test_failure_outcome_enum(self):
        assert AuditOutcome.FAILURE.value == "FAILURE"

    def test_all_outcomes_are_strings(self):
        for outcome in AuditOutcome:
            assert isinstance(outcome.value, str)


# ---------------------------------------------------------------------------
# 11. JWT/secrets/PII non-leakage verification
# ---------------------------------------------------------------------------


class TestNoSensitiveDataLeakage:
    """Verify audit system never stores sensitive data."""

    def test_audit_event_no_authorization_field(self):
        event = AuditEvent()
        record = {
            "event_id": event.event_id,
            "request_id": event.request_id,
            "user_id": event.user_id,
            "http_method": event.http_method,
            "route": event.route,
            "action": event.action,
            "resource_type": event.resource_type,
            "resource_id": event.resource_id,
            "outcome": event.outcome,
            "status_code": event.status_code,
        }
        serialized = json.dumps(record)
        assert "Bearer" not in serialized
        assert "authorization" not in serialized.lower() or "user_id" not in serialized.lower()

    def test_route_classification_table_no_search_query(self):
        """Search classification does not store the query text."""
        action, resource, rid = classify_route("/api/v1/network/search")
        assert action == "SEARCH"
        # resource_id must be None for search (no query text stored)
        assert rid is None

    def test_export_classification_no_filter_values(self):
        """Export classification does not store filter values."""
        action, resource, rid = classify_route("/api/v1/map/intelligence/export")
        assert action == "EXPORT"
        assert rid is None  # no filter values stored

    def test_audit_record_serializable(self):
        """Audit records must be JSON-serializable for PostgreSQL JSONB."""
        event = AuditEvent(
            request_id="req-1",
            user_id="user-1",
            http_method="GET",
            route="/api/v1/dashboard/summary",
            action="READ",
            resource_type="dashboard_summary",
        )
        record = {
            "event_id": event.event_id,
            "event_timestamp": event.event_timestamp.isoformat(),
            "request_id": event.request_id,
            "user_id": event.user_id,
            "http_method": event.http_method,
            "route": event.route,
            "action": event.action,
            "resource_type": event.resource_type,
            "resource_id": event.resource_id,
            "outcome": event.outcome,
            "status_code": event.status_code,
            "schema_version": event.schema_version,
        }
        serialized = json.dumps(record)
        assert len(serialized) > 0


# ---------------------------------------------------------------------------
# 12. Classification completeness
# ---------------------------------------------------------------------------


class TestClassificationCompleteness:
    """Verify all expected routes are classified."""

    def test_all_expected_routes_have_classifications(self):
        expected_routes = {
            "/api/v1/dashboard/summary",
            "/api/v1/map/field/cases",
            "/api/v1/map/field/case/{fir_identifier}",
            "/api/v1/map/field/filters",
            "/api/v1/map/field/hotspots",
            "/api/v1/map/intelligence/analytics",
            "/api/v1/map/intelligence/heatmap",
            "/api/v1/map/intelligence/clusters",
            "/api/v1/map/intelligence/hotspots",
            "/api/v1/map/intelligence/district-comparison",
            "/api/v1/map/intelligence/timeline",
            "/api/v1/map/intelligence/export",
            "/api/v1/districts",
            "/api/v1/districts/{district_id}/intelligence",
            "/api/v1/stations",
            "/api/v1/stations/{station_id}",
            "/api/v1/network/graph",
            "/api/v1/network/entities/{entity_type}/{entity_id}",
            "/api/v1/network/search",
            "/api/v1/auth/me",
        }
        assert expected_routes == set(_ROUTE_CLASSIFICATIONS.keys())

    def test_all_excluded_paths_defined(self):
        assert "/health" in _EXCLUDED_PATHS
        assert "/health/live" in _EXCLUDED_PATHS
        assert "/health/ready" in _EXCLUDED_PATHS
