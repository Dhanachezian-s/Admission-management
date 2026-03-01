import axios, { AxiosRequestConfig } from 'axios';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuth(token: string, role: string, username: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('username', username);
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
}

export function getRole(): string | null {
  return localStorage.getItem('role');
}

export function getUsername(): string | null {
  return localStorage.getItem('username');
}

const axiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirecting if the user is already on the login page or attempting login
      if (window.location.pathname !== '/login' && !error.config.url.includes('/login')) {
        clearAuth();
        window.location.href = '/login';
      }
    } else if (error.response && error.response.status === 403) {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error.response?.data?.error || error.message);
  }
);

export async function api<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
  const method = options?.method?.toLowerCase() || 'get';
  const data = options?.data || (options as any)?.body; // support legacy fetch body option just in case

  if (method === 'get') {
    return axiosInstance.get<T, T>(path, options);
  } else if (method === 'post') {
    return axiosInstance.post<T, T>(path, data, options);
  } else if (method === 'put') {
    return axiosInstance.put<T, T>(path, data, options);
  } else if (method === 'patch') {
    return axiosInstance.patch<T, T>(path, data, options);
  } else if (method === 'delete') {
    return axiosInstance.delete<T, T>(path, options);
  }

  return axiosInstance(path, options);
}
