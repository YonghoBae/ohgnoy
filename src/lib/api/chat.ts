import { apiClient } from './client';
import { userApi } from './user';

export const chatApi = {
  getUserInfo: userApi.getInfo,

  sendMessage: () =>
    apiClient.post('/chatbot', {}),
};
