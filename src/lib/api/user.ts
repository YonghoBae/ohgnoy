import { UserInfo, UserLogin, UserRegist } from '@/interfaces/user';
import { apiClient } from './client';

type LoginResponse = { code: number; data: string; message?: string };
type RegisterResponse = { code: number; msg?: string };
type EmailResponse = { code: number; message: string; data: number };

export const userApi = {
  login: (user: UserLogin) =>
    apiClient.post<LoginResponse>('/users/login', user),

  sendVerificationEmail: (email: string) =>
    apiClient.post<EmailResponse>('/users/email', { email }),

  register: (user: UserRegist) =>
    apiClient.post<RegisterResponse>('/users', user),

  getInfo: async (token: string): Promise<UserInfo> => {
    const result = await apiClient.get<{ data: UserInfo }>('/users/token', { token });
    if (!result.data) throw new Error('Invalid token');
    return result.data;
  },
};

// lib/user/token.ts 에서 사용하던 함수명 유지 (하위 호환)
export const userInfo = (token: string): Promise<UserInfo> =>
  userApi.getInfo(token);
