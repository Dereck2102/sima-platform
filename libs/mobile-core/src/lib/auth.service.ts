import { api } from './api';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
};