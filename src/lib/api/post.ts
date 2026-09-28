import { apiClient } from './client';

type CreatePostResponse = {
  postId?: number;
  title?: string;
  excerpt?: string;
  code?: string;
  message?: string;
};

export const postApi = {
  create: (formData: FormData, token: string) =>
    apiClient.post<CreatePostResponse>('/posts', formData, { token }),
};
