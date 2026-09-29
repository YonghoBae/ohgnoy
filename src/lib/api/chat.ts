import { apiClient } from './client';
import { Message } from '@/interfaces/message';

type ChatHistoryResponse = {
  code:number;
  message:string;
  data: Message[];
};

// Backend sends ChatMessage.sendDate (a java Instant) as an ISO string, as
// epoch seconds (sub-second precision, < 1e12) or epoch ms (>= 1e12) when
// timestamps are enabled, or as Spring's LocalDateTime array
// [y, month(1-based), d, h, min, s, nanos?]. Returns null on anything else
// so callers can skip rendering a time instead of throwing on Invalid Date.
export function parseChatDate(x: unknown): Date | null {
  let date: Date;

  if (Array.isArray(x)) {
    const [y, month, d, h = 0, min = 0, s = 0, nanos = 0] = x;
    if (typeof y !== 'number' || typeof month !== 'number' || typeof d !== 'number') {
      return null;
    }
    // LocalDateTime has no zone: read as browser-local, i.e. assumes server and viewer share KST (the backend sends an Instant anyway).
    date = new Date(y, month - 1, d, h, min, s, Math.floor(nanos / 1e6));
  } else if (typeof x === 'number') {
    date = new Date(x < 1e12 ? x * 1000 : x);
  } else if (typeof x === 'string') {
    date = new Date(x);
  } else {
    return null;
  }

  return isNaN(date.getTime()) ? null : date;
}

export const chatApi = {
  getHistory: (roomId: string) =>
    apiClient
      .get<ChatHistoryResponse>(`/chat/rooms/${roomId}/messages`)
      .then(res => (Array.isArray(res?.data) ? res.data : [])),
};
