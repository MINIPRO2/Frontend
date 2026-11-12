export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  username: string | null;
  usernameLower?: string | null;
  email: string;
  avatar: string;
  provider: 'password' | 'google';
  requiresUsername: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiUserResponse {
  ok: boolean;
  message?: string;
  token?: string;
  requiresUsername?: boolean;
  requiresRegistration?: boolean;
  field?: string;
  error?: string;
  data?: UserProfile;
}

export interface UsernameCheckResponse {
  ok: boolean;
  available?: boolean;
  username?: string;
  message?: string;
  field?: string;
  error?: string;
}
