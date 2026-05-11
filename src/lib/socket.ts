import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Ohgnoy_BackendAPI } from './constants';

export function createStompClient(): Client {
  return new Client({
    webSocketFactory: () => new SockJS(`${Ohgnoy_BackendAPI}/ws-chat`),
    reconnectDelay: 5000,
  });
}
