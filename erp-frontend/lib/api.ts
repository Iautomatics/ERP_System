const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

const refreshToken = async (): Promise<boolean> => {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      return true;
    }
  } catch { /* ignorar */ }
  return false;
};

const request = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`;
      return fetch(`${API_URL}${url}`, { ...options, headers });
    }
    removeTokens();
    if (typeof window !== 'undefined') window.location.href = '/login';
  }
  return res;
};

export const api = {
  get: async (url: string) => {
    try {
      const res = await request(url);
      return res.json();
    } catch {
      return null;
    }
  },

  post: async (url: string, data: unknown) => {
    try {
      const res = await request(url, { method: 'POST', body: JSON.stringify(data) });
      return res.json();
    } catch {
      return null;
    }
  },

  put: async (url: string, data: unknown) => {
    try {
      const res = await request(url, { method: 'PUT', body: JSON.stringify(data) });
      return res.json();
    } catch {
      return null;
    }
  },

  delete: (url: string) => request(url, { method: 'DELETE' }).catch(() => null),

  login: async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.access) setTokens(data.access, data.refresh);
      return data;
    } catch {
      return { detail: 'No se pudo conectar al servidor' };
    }
  },

  logout: () => removeTokens(),

  isAuthenticated: () => !!getToken(),
};
