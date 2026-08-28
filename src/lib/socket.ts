import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Ohgnoy_BackendAPI } from './constants';

export function createStompClient(): Client {
  const token = localStorage.getItem('token');

  return new Client({
    webSocketFactory: () => new SockJS(`${Ohgnoy_BackendAPI}/ws-chat`),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
  });
}
