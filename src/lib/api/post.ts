import { apiClient } from './client';

type CreatePostResponse = { msg: string };

export const postApi = {
  create: (formData: FormData, token: string) =>
    apiClient.post<CreatePostResponse>('/posts', formData, { token }),
};
