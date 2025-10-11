import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore, type AuthUser } from '@/store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

type AuthResponse = {
  token: string;
  expiresAt: string;
  roles: string[];
  displayName: string;
  email: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const refreshExclusionList = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']);

const toAuthUser = (response: AuthResponse): AuthUser => ({
  email: response.email,
  displayName: response.displayName,
  roles: response.roles ?? []
});

export const httpClient = axios.create({
  baseURL,
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true
});

let refreshPromise: Promise<AuthResponse> | null = null;

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (!response || response.status !== 401 || !config) {
      return Promise.reject(error);
    }

    const originalRequest = config as RetryableRequestConfig;
    const requestPath = (originalRequest.url ?? '').split('?')[0];

    if (refreshExclusionList.has(requestPath) || originalRequest._retry) {
      useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = refreshClient.post<AuthResponse>('/auth/refresh')
        .then((res) => res.data)
        .then((data) => {
          const { setSession } = useAuthStore.getState();
          setSession(data.token, toAuthUser(data));
          return data;
        })
        .catch((refreshError) => {
          useAuthStore.getState().clearSession();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      originalRequest._retry = true;
      return httpClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);
