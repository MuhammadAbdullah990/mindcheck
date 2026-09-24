/**
 * API client. Wraps fetch with the auth header, the anonymous token, and
 * uniform error handling so no component has to deal with raw responses.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

const TOKEN_KEY = 'mindcheck.token';
const ANON_KEY = 'mindcheck.anonToken';

export type ApiErrorShape = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: { field: string; message: string }[];

  constructor(status: number, body: ApiErrorShape) {
    super(body.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Anonymous identifier. Generated once per browser so a user who never signs
 * in can still resume a screening or return to their history. This is a
 * random UUID with no personal data in it.
 */
export function getAnonToken(): string {
  let token = localStorage.getItem(ANON_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, token);
  }
  return token;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'X-Anon-Token': getAnonToken() };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch only rejects on network-level failure, so this is always
    // "couldn't reach the server", never an application error.
    throw new ApiError(0, {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Could not reach the server. Check your connection.' },
    });
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Non-JSON body (e.g. a proxy error page) — fall through to a generic error.
    }
  }

  if (!res.ok) {
    const body = (parsed ?? {
      success: false,
      error: { code: 'UNKNOWN_ERROR', message: `Request failed (${res.status})` },
    }) as ApiErrorShape;
    throw new ApiError(res.status, body);
  }

  // The API wraps every success response as { success: true, data }.
  return (parsed as { data: T }).data;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
};
