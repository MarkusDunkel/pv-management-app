import { httpClient } from './httpClient';
import type { AuthResponse } from './types';
import { AuthUser } from '@/store/authStore';

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
  async demoLogin(slug: string) {
    const { data } = await httpClient.get<AuthResponse>('/auth/demo-login/' + slug);
    return data;
  },
  async register(email: string, password: string, displayName: string) {
    const { data } = await httpClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      displayName,
    });
    return data;
  },
  async logout() {
    await httpClient.post('/auth/logout');
  },
  async profile(): Promise<AuthUser> {
    const { data } = await httpClient.get('/auth/me');
    return {
      email: data.email,
      displayName: data.displayName,
      roles: data.roles ?? [],
    };
  },
};
