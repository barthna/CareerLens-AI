const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const api = {
  getTokens() {
    if (typeof window === 'undefined') return { access: null, refresh: null };
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    };
  },

  setTokens(access: string, refresh: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  },

  getUser() {
    if (typeof window === 'undefined') return null;
    const info = localStorage.getItem('user_info');
    return info ? JSON.parse(info) : null;
  },

  setUser(user: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_info', JSON.stringify(user));
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { access } = this.getTokens();
    const headers = new Headers(options.headers || {});
    
    if (access && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${access}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized (Expired token -> try refreshing)
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      const refreshed = await this.refresh();
      if (refreshed) {
        // Retry the original request
        const newHeaders = new Headers(options.headers || {});
        const tokens = this.getTokens();
        newHeaders.set('Authorization', `Bearer ${tokens.access}`);
        if (!newHeaders.has('Content-Type') && !(options.body instanceof FormData)) {
          newHeaders.set('Content-Type', 'application/json');
        }
        const retryRes = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });
        return await this.parseResponse<T>(retryRes);
      } else {
        this.clearTokens();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return await this.parseResponse<T>(response);
  },

  async parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      json = { detail: text || 'Raw parsing error' };
    }

    if (!response.ok) {
      // Return structured error
      const message = json.error?.message || json.detail || 'An error occurred';
      const code = json.error?.code || `ERR_${response.status}`;
      throw { success: false, error: { code, message } };
    }

    return json as T;
  },

  async refresh(): Promise<boolean> {
    const { refresh } = this.getTokens();
    if (!refresh) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh?refresh_token=${refresh}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (e) {
      console.error('Failed to refresh token', e);
    }
    return false;
  },
};
