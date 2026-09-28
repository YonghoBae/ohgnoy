import { apiClient } from './client';
import { Message } from '@/interfaces/message';

type ChatHistoryResponse = {
  code:number;
  message:string;
  data: Message[];
};

export const chatApi = {
  getHistory: (roomId: string) =>
    apiClient.get<ChatHistoryResponse>(`/chat/rooms/${roomId}/messages`).then(res => res.data),
};
