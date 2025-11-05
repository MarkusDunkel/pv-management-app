export interface AuthResponse {
  token: string;
  expiresAt: string;
  roles: string[];
  displayName: string;
  email: string;
}
