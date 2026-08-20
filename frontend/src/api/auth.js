import { apiRequest } from './client.js';

/**
 * GET /api/v1/auth/me — backend-verified identity for the current session.
 * Backend response: { user_id, authenticated, email }.
 * This endpoint intentionally exposes no role claims; the backend resolves
 * roles server-side only.
 */
export function fetchMe() {
  return apiRequest('/api/v1/auth/me');
}