import { apiClient } from './client';

type CreatePostResponse = {
  postId?: number;
  code?: number;
  message?: string;
};

export const postApi = {
  create: (formData: FormData, token: string) =>
    apiClient.post<CreatePostResponse>('/posts', formData, { token }),
};
