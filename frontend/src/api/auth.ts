import { httpClient } from './httpClient';
import { AuthUser } from '@/store/authStore';

interface AuthResponse {
  token: string;
  expiresAt: string;
  roles: string[];
  displayName: string;
  email: string;
}

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
  async register(email: string, password: string, displayName: string) {
    const { data } = await httpClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      displayName
    });
    return data;
  },
  async profile(): Promise<AuthUser> {
    const { data } = await httpClient.get('/auth/me');
    return {
      email: data.email,
      displayName: data.displayName,
      roles: data.roles ?? []
    };
  }
};
