/**
 * API client service for connecting React frontend to FastAPI ML endpoints.
 * Base URL defaults to http://localhost:8000/api/v1
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch pre-computed DBSCAN spatial cluster summaries and assigned FIR hotspot records.
 * Endpoint: GET /api/v1/analytics/hotspots
 */
export async function getMLHotspots() {
  return fetchAPI('/analytics/hotspots');
}

/**
 * Fetch station-level CCRI risk ranks, scores, tiers, and factor breakdowns.
 * Endpoint: GET /api/v1/analytics/risk-scores
 */
export async function getMLRiskScores() {
  return fetchAPI('/analytics/risk-scores');
}

/**
 * Fetch daily crime incident volume forecast for N days (1 to 30).
 * Endpoint: GET /api/v1/analytics/forecast?forecast_days=N
 */
export async function getMLForecast(forecastDays = 30) {
  return fetchAPI(`/analytics/forecast?forecast_days=${forecastDays}`);
}

/**
 * Fetch aggregate spatial hotspot totals, station risk distributions, and 30-day forecast volume.
 * Endpoint: GET /api/v1/analytics/summary
 */
export async function getMLSummary() {
  return fetchAPI('/analytics/summary');
}
