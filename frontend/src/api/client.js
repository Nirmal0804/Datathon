import { supabase } from '../lib/supabase.js';

// Development default for local FastAPI; override via VITE_API_BASE_URL.
const DEFAULT_API_BASE = 'http://127.0.0.1:8000';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/+$/, '');

/**
 * Structured API error preserving the backend error contract
 * (status / code / message / request_id) when the backend provides one.
 */
export class ApiError extends Error {
  constructor(message, { status, code, requestId } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? 0;
    this.code = code ?? null;
    this.requestId = requestId ?? null;
  }
}

/** Read the current Supabase session access token (requires a session). */
async function getAccessToken() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Unable to read Supabase session token.', error);
    return null;
  }
  return data?.session?.access_token ?? null;
}

/**
 * Centralized API client.
 *
 * - builds URLs from VITE_API_BASE_URL
 * - attaches `Authorization: Bearer <access_token>` when a session exists
 * - parses JSON and preserves backend structured errors
 * - normalizes failures into ApiError (401/403/network/backend)
 *
 * Endpoint-specific functions live in src/api/<resource>.js.
 */
export async function apiRequest(path, { method = 'GET', query, headers = {}, body } = {}) {
  const token = await getAccessToken();

  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const queryString = new URLSearchParams(query).toString();
    if (queryString) url += `?${queryString}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check your connection and try again.',
      { status: 0, code: 'NETWORK_ERROR' },
    );
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: { message: text.slice(0, 200) } };
    }
  }

  if (!response.ok) {
    const errorInfo = payload?.error || {};
    throw new ApiError(
      errorInfo.message || `Request failed with status ${response.status}`,
      {
        status: response.status,
        code: errorInfo.code || null,
        requestId: errorInfo.request_id || null,
      },
    );
  }

  return payload;
}