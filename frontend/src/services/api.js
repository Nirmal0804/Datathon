/**
 * CrimeIntel Unified API Service Client
 * Connects the React frontend to the deployed CrimeIntel FastAPI backend.
 *
 * Backend Base URL: https://crimeintel-backend-50044367664.development.catalystappsail.in/api/v1
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://crimeintel-backend-50044367664.development.catalystappsail.in/api/v1';

// Normalize base URL (strip trailing slash)
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

// Root URL without /api/v1 for health endpoints
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Helper to build full URL with query parameters
 */
function buildUrl(endpoint, params = null, isRoot = false) {
  const base = isRoot ? API_ROOT_URL : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${base}${cleanEndpoint}`;

  if (params && typeof params === 'object') {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }
  return url;
}

/**
 * Generic API fetch wrapper with authentication and error handling
 */
export async function fetchAPI(endpoint, options = {}) {
  const { params, isRoot = false, ...customFetchOptions } = options;
  const url = buildUrl(endpoint, params, isRoot);

  const headers = {
    'Content-Type': 'application/json',
    ...(customFetchOptions.headers || {}),
  };

  // Retrieve token from browser storage or Catalyst session
  try {
    const token =
      (typeof localStorage !== 'undefined' && (localStorage.getItem('token') || localStorage.getItem('access_token'))) ||
      (typeof sessionStorage !== 'undefined' && (sessionStorage.getItem('token') || sessionStorage.getItem('access_token'))) ||
      (typeof window !== 'undefined' && window.catalyst?.auth?.getAccessToken?.()) ||
      (typeof window !== 'undefined' && window.catalyst?.auth?.token);

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // Non-blocking credential lookup
  }

  try {
    const response = await fetch(url, {
      ...customFetchOptions,
      headers,
    });

    if (!response.ok) {
      let errorDetails = null;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      const error = new Error(`API Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    return await response.json();
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[CrimeIntel API] ${endpoint} request failed:`, err);
    }
    throw err;
  }
}

/* ==========================================================================
   1. Health Check Endpoints
   ========================================================================== */

export async function getHealth() {
  return fetchAPI('/health', { isRoot: true });
}

export async function getHealthLive() {
  return fetchAPI('/health/live', { isRoot: true });
}

export async function getHealthReady() {
  return fetchAPI('/health/ready', { isRoot: true });
}

/* ==========================================================================
   2. Dashboard Endpoints
   ========================================================================== */

/**
 * Fetch aggregate KPIs and case status summaries
 * Endpoint: GET /api/v1/dashboard/summary
 */
export async function getDashboardSummary(params = {}) {
  return fetchAPI('/dashboard/summary', { params });
}

/* ==========================================================================
   3. Districts & Intelligence Profile Endpoints
   ========================================================================== */

/**
 * List all districts with statistical summaries
 * Endpoint: GET /api/v1/districts
 */
export async function getDistricts(params = {}) {
  return fetchAPI('/districts', { params });
}

/**
 * Fetch comprehensive intelligence profile for a specific district
 * Endpoint: GET /api/v1/districts/{district_id}/intelligence
 */
export async function getDistrictIntelligence(districtId, params = {}) {
  return fetchAPI(`/districts/${districtId}/intelligence`, { params });
}

/* ==========================================================================
   4. Police Stations Endpoints
   ========================================================================== */

/**
 * List police stations with optional district filtering and pagination
 * Endpoint: GET /api/v1/stations
 */
export async function getStations(params = {}) {
  return fetchAPI('/stations', { params });
}

/**
 * Fetch station details by station ID
 * Endpoint: GET /api/v1/stations/{station_id}
 */
export async function getStationDetail(stationId) {
  return fetchAPI(`/stations/${stationId}`);
}

/* ==========================================================================
   5. ML Analytics Endpoints
   ========================================================================== */

/**
 * Fetch executive ML dashboard summary metrics
 * Endpoint: GET /api/v1/analytics/summary
 */
export async function getMLSummary() {
  return fetchAPI('/analytics/summary');
}
export const getAnalyticsSummary = getMLSummary;

/**
 * Fetch pre-computed DBSCAN spatial cluster summaries
 * Endpoint: GET /api/v1/analytics/hotspots
 */
export async function getMLHotspots(params = {}) {
  return fetchAPI('/analytics/hotspots', { params });
}
export const getAnalyticsHotspots = getMLHotspots;

/**
 * Fetch station-level CCRI risk ranks, scores, and tiers
 * Endpoint: GET /api/v1/analytics/risk-scores
 */
export async function getMLRiskScores(params = {}) {
  return fetchAPI('/analytics/risk-scores', { params });
}
export const getAnalyticsRiskScores = getMLRiskScores;

/**
 * Fetch daily crime incident volume forecast for N days (1 to 30)
 * Endpoint: GET /api/v1/analytics/forecast?forecast_days=N
 */
export async function getMLForecast(forecastDays = 30) {
  return fetchAPI('/analytics/forecast', { params: { forecast_days: forecastDays } });
}
export const getAnalyticsForecast = getMLForecast;

/* ==========================================================================
   6. Field Map Endpoints
   ========================================================================== */

/**
 * Fetch filter metadata for field map
 * Endpoint: GET /api/v1/map/field/filters
 */
export async function getFieldMapFilters() {
  return fetchAPI('/map/field/filters');
}

/**
 * Fetch paginated FIR case list for field map
 * Endpoint: GET /api/v1/map/field/cases
 */
export async function getFieldMapCases(params = {}) {
  return fetchAPI('/map/field/cases', { params });
}

/**
 * Fetch case detail by FIR identifier
 * Endpoint: GET /api/v1/map/field/case/{fir_identifier}
 */
export async function getFieldMapCase(firIdentifier) {
  return fetchAPI(`/map/field/case/${encodeURIComponent(firIdentifier)}`);
}

/**
 * Fetch grid-based crime hotspots for field officers
 * Endpoint: GET /api/v1/map/field/hotspots
 */
export async function getFieldMapHotspots(params = {}) {
  return fetchAPI('/map/field/hotspots', { params });
}

/* ==========================================================================
   7. Intelligence Map Endpoints
   ========================================================================== */

/**
 * Fetch intelligence analytics KPIs (density, crime type distribution)
 * Endpoint: GET /api/v1/map/intelligence/analytics
 */
export async function getIntelligenceMapAnalytics(params = {}) {
  return fetchAPI('/map/intelligence/analytics', { params });
}

/**
 * Fetch station-based crime clusters
 * Endpoint: GET /api/v1/map/intelligence/clusters
 */
export async function getIntelligenceMapClusters(params = {}) {
  return fetchAPI('/map/intelligence/clusters', { params });
}

/**
 * Fetch grid-based crime hotspots with centroids
 * Endpoint: GET /api/v1/map/intelligence/hotspots
 */
export async function getIntelligenceMapHotspots(params = {}) {
  return fetchAPI('/map/intelligence/hotspots', { params });
}

/**
 * Fetch comparative crime statistics across Karnataka districts
 * Endpoint: GET /api/v1/map/intelligence/district-comparison
 */
export async function getIntelligenceMapDistrictComparison(params = {}) {
  return fetchAPI('/map/intelligence/district-comparison', { params });
}

/**
 * Fetch grid-aggregated heatmap data
 * Endpoint: GET /api/v1/map/intelligence/heatmap
 */
export async function getIntelligenceMapHeatmap(params = {}) {
  return fetchAPI('/map/intelligence/heatmap', { params });
}

/**
 * Fetch time-series crime trends with configurable granularity
 * Endpoint: GET /api/v1/map/intelligence/timeline
 */
export async function getIntelligenceMapTimeline(params = {}) {
  return fetchAPI('/map/intelligence/timeline', { params });
}

/**
 * Build CSV export URL for filtered intelligence dataset
 * Endpoint: GET /api/v1/map/intelligence/export
 */
export function getIntelligenceMapExportUrl(params = {}) {
  return buildUrl('/map/intelligence/export', params);
}

/* ==========================================================================
   8. Criminal Network Analysis Endpoints
   ========================================================================== */

/**
 * Fetch graph visualization nodes and edges
 * Endpoint: GET /api/v1/network/graph
 */
export async function getNetworkGraph(params = {}) {
  return fetchAPI('/network/graph', { params });
}

/**
 * Fetch specific entity detail (person, fir, station, etc.)
 * Endpoint: GET /api/v1/network/entities/{entity_type}/{entity_id}
 */
export async function getNetworkEntity(entityType, entityId) {
  return fetchAPI(`/network/entities/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`);
}

/**
 * Search network entities with minimum query length guard
 * Endpoint: GET /api/v1/network/search?q={query}
 * Note: q must be at least 2 characters.
 */
export async function searchNetwork(query, limit = 20) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return { results: [], total: 0 };
  }
  return fetchAPI('/network/search', { params: { q: query.trim(), limit } });
}

/* ==========================================================================
   9. Authentication & Security Audit Endpoints
   ========================================================================== */

/**
 * Fetch current authenticated user profile
 * Endpoint: GET /api/v1/auth/me
 */
export async function getAuthMe() {
  return fetchAPI('/auth/me');
}

/**
 * Fetch paginated security audit trail (Admin only)
 * Endpoint: GET /api/v1/admin/audit/events
 */
export async function getAdminAuditEvents(params = {}) {
  return fetchAPI('/admin/audit/events', { params });
}

export default {
  API_BASE_URL,
  API_ROOT_URL,
  fetchAPI,
  getHealth,
  getHealthLive,
  getHealthReady,
  getDashboardSummary,
  getDistricts,
  getDistrictIntelligence,
  getStations,
  getStationDetail,
  getMLSummary,
  getAnalyticsSummary,
  getMLHotspots,
  getAnalyticsHotspots,
  getMLRiskScores,
  getAnalyticsRiskScores,
  getMLForecast,
  getAnalyticsForecast,
  getFieldMapFilters,
  getFieldMapCases,
  getFieldMapCase,
  getFieldMapHotspots,
  getIntelligenceMapAnalytics,
  getIntelligenceMapClusters,
  getIntelligenceMapHotspots,
  getIntelligenceMapDistrictComparison,
  getIntelligenceMapHeatmap,
  getIntelligenceMapTimeline,
  getIntelligenceMapExportUrl,
  getNetworkGraph,
  getNetworkEntity,
  searchNetwork,
  getAuthMe,
  getAdminAuditEvents,
};
