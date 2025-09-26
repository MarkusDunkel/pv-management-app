import { httpClient } from './httpClient';

export const userApi = {
  async updateProfile(displayName: string) {
    const { data } = await httpClient.patch('/users/me', { displayName });
    return data;
  }
};
