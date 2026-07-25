const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiError extends Error {
  constructor(status, message, request_id) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.request_id = request_id;
  }
}

async function request(path, { method = 'GET', params, body, headers: extraHeaders } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        url.searchParams.set(k, v);
      }
    });
  }

  const headers = { 'Content-Type': 'application/json', ...extraHeaders };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errBody;
    try {
      errBody = await res.json();
    } catch {
      errBody = { error: { code: String(res.status), message: res.statusText } };
    }
    const msg = errBody?.error?.message || res.statusText;
    const reqId = res.headers.get('x-request-id') || errBody?.error?.request_id;
    throw new ApiError(res.status, msg, reqId);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/plain')) {
    return res.text();
  }
  return res.json();
}

function getStoredToken() {
  try {
    const stored = localStorage.getItem('sb-gcxppkdtbvmleynrzqao-auth-token');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.access_token || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function get(path, params) {
  return request(path, { params });
}

export function post(path, body) {
  return request(path, { method: 'POST', body });
}

export { ApiError, getStoredToken };
export default { get, post, ApiError, getStoredToken };
