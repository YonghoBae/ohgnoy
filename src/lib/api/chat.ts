import { apiClient } from './client';
import { userApi } from './user';
import { Message } from '@/interfaces/message';

type ChatHistoryResponse = {
  code:number;
  message:string;
  data: Message[];
};

export const chatApi = {
  getUserInfo: userApi.getInfo,

  sendMessage: () =>
    apiClient.post('/chatbot', {}),

  getHistory: (roomId: string) =>
    apiClient.get<ChatHistoryResponse>(`/chat/rooms/${roomId}/messages`).then(res => res.data),
};
