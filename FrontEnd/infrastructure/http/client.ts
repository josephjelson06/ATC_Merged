// HTTP client — centralized fetch wrapper for future API calls.
// All API repositories will use this instead of raw fetch().

import { getCookie } from '../browser/cookies';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    if (path.startsWith('http')) return path;

    // Simple robust join
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const endpoint = path.startsWith('/') ? path : `/${path}`;
    
    // Construct new URL object to handle query params easily
    const url = new URL(base + endpoint);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(method: HttpMethod, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    
    // Read token from client-side cookie and send via Authorization header
    // This is needed because cross-origin cookies (localhost:3000 → localhost:8000)
    // are NOT automatically sent by the browser with SameSite=lax
    const headers: Record<string, string> = { ...this.defaultHeaders, ...options?.headers };
    if (!headers['Authorization']) {
      const cookieToken = getCookie('access_token');
      if (cookieToken) {
        // Cookie value already includes "Bearer " prefix
        headers['Authorization'] = cookieToken;
      }
    }
    
    console.log(`[HttpClient] Requesting: ${method} ${url}`);
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      let message = errorData.detail || errorData.message || `HTTP ${res.status}: ${res.statusText}`;
      
      if (typeof message === 'object') {
        message = JSON.stringify(message);
      }

      // For auth endpoints, throw a user-friendly error
      if (res.status === 401) {
        throw new Error('Invalid email or password');
      }
      if (res.status === 403) {
        throw new Error('Access denied');
      }
      
      throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  async delete<T = void>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

// Singleton instance — all API repositories import this
const API_URL = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:8000';

export const httpClient = new HttpClient(API_URL);
export default HttpClient;
