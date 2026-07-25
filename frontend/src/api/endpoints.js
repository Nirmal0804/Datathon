import { get } from './client';

// ── DASHBOARD ──────────────────────────────────────────────
export async function getDashboardSummary(params) {
  return get('/dashboard/summary', params);
}

// ── DISTRICTS / STATIONS ───────────────────────────────────
export async function getDistricts() {
  return get('/districts');
}

export async function getDistrictIntelligence(districtId, params) {
  return get(`/districts/${districtId}/intelligence`, params);
}

export async function getStations(params) {
  return get('/stations', params);
}

export async function getStationDetail(stationId) {
  return get(`/stations/${stationId}`);
}

// ── FIELD MAP ──────────────────────────────────────────────
export async function getFieldMapCases(params) {
  return get('/map/field/cases', params);
}

// NOT_USED: No case detail interaction exists in the UI
export async function getFieldMapCaseDetail(firId) {
  return get(`/map/field/case/${firId}`);
}

export async function getFieldMapFilters() {
  return get('/map/field/filters');
}

export async function getFieldMapHotspots(params) {
  return get('/map/field/hotspots', params);
}

// ── INTELLIGENCE / ANALYTICS ───────────────────────────────
export async function getIntelligenceAnalytics(params) {
  return get('/map/intelligence/analytics', params);
}

// NOT_USED: Local Circle overlay in GISMap handles heatmap visually
export async function getIntelligenceHeatmap(params) {
  return get('/map/intelligence/heatmap', params);
}

// NOT_USED: Local district aggregation in AnalyticsPanel covers this
export async function getIntelligenceClusters(params) {
  return get('/map/intelligence/clusters', params);
}

export async function getIntelligenceHotspots(params) {
  return get('/map/intelligence/hotspots', params);
}

// NOT_USED: Local AnalyticsPanel compute handles district comparison
export async function getDistrictComparison(params) {
  return get('/map/intelligence/district-comparison', params);
}

export async function getIntelligenceTimeline(params) {
  return get('/map/intelligence/timeline', params);
}

// NOT_USED: PDF snapshot export is a different capability (not CSV)
export async function exportIntelligenceCSV(params) {
  return get('/map/intelligence/export', params);
}

// ── NETWORK ANALYSIS ───────────────────────────────────────
export async function getNetworkGraph(params) {
  return get('/network/graph', params);
}

export async function getNetworkEntityDetail(entityType, entityId) {
  return get(`/network/entities/${entityType}/${entityId}`);
}

export async function searchNetwork(params) {
  return get('/network/search', params);
}

// ── AUTH ───────────────────────────────────────────────────
export async function getAuthMe() {
  return get('/auth/me');
}
