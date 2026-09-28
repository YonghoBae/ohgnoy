'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStompClient } from '@/lib/socket';
import { Client, IMessage } from '@stomp/stompjs';
import { Message } from '@/interfaces/message';
import { UserInfo } from '@/interfaces/user';
import { userInfo } from '@/lib/user/token';
import { parseChatDate } from '@/lib/api/chat';

const ROOM_ID = '1';

const timeFormat = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
});

const MessageTime = ({ sendDate }: { sendDate: number }) => {
  const date = parseChatDate(sendDate);
  if (!date) return null;
  return (
    <time
      dateTime={date.toISOString()}
      className="text-text-muted text-xs font-normal leading-4 py-1"
    >
      {timeFormat.format(date)}
    </time>
  );
};

const Chat = () => {
  const router = useRouter();
  const stompClient = useRef<Client | null>(null);
  const userRef = useRef<UserInfo>({ userId: 0, nickname: '', email: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserInfo>({
    userId: 0,
    nickname: '',
    email: '',
  });
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>(
    'connecting'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인이 필요합니다. 로그인 페이지로 이동합니다…');
        router.push('/auth/login');
        return;
      }

      let userData: UserInfo;
      try {
        userData = await userInfo(token);
      } catch {
        if (cancelled) return;
        setError('로그인 정보를 확인하지 못했습니다. 로그인 페이지로 이동합니다…');
        router.push('/auth/login');
        return;
      }
      if (cancelled) return;
      setUser(userData);
      userRef.current = userData;

      const client = createStompClient();
      stompClient.current = client;

      client.onConnect = () => {
        setStatus('open');
        client.subscribe(`/sub/chat/room${ROOM_ID}`, (frame: IMessage) => {
          const msg: Message = JSON.parse(frame.body);
          setMessages((prev) => [...prev, msg]);
        });

        client.publish({
          destination: '/pub/chat/message',
          body: JSON.stringify({
            type: 'ENTER',
            roomId: ROOM_ID,
            sender: userData.nickname,
            message: '',
            userId: userData.userId,
            sendDate: Date.now(),
          }),
        });
      };
      client.onWebSocketClose = () => {
        // A StrictMode remount deactivates the old client; only the current
        // client's close may flip the status.
        if (stompClient.current === client) setStatus('closed');
      };

      client.activate();
    };

    init();

    return () => {
      cancelled = true;
      const client = stompClient.current;
      if (client?.connected) {
        client.publish({
          destination: '/pub/chat/message',
          body: JSON.stringify({
            type: 'LEAVE',
            roomId: ROOM_ID,
            sender: userRef.current.nickname,
            message: '',
            userId: userRef.current.userId,
            sendDate: Date.now(),
          }),
        });
      }
      client?.deactivate();
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [messages]);

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stompClient.current?.connected || !message.trim()) return;

    stompClient.current.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify({
        type: 'TALK',
        roomId: ROOM_ID,
        sender: user.nickname,
        message,
        userId: user.userId,
        sendDate: Date.now(),
      }),
    });

    setMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter that commits a Korean IME syllable must not submit the form.
    // keyCode 229 covers Safari, which doesn't set isComposing.
    if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) {
      event.preventDefault();
    }
  };

  const statusText =
    error ||
    (status === 'connecting' ? '연결 중…' : status === 'closed' ? '연결 끊김' : '');

  return (
    <div
      className="flex flex-col h-[calc(100dvh-8rem)] min-h-80 px-6 py-6 lg:px-8"
    >
      <h1 className="sr-only">실시간 채팅</h1>
      <p role="status" className="text-center text-text-muted text-xs min-h-4">
        {statusText}
      </p>
      <div
        role="log"
        aria-live="polite"
        aria-label="채팅 메시지"
        className="flex-1 min-h-0 overflow-y-auto"
      >
        {messages.length === 0 && (
          <p className="text-center text-text-muted text-sm py-6">
            아직 메시지가 없습니다.
          </p>
        )}
        {messages.map((msg, index) => {
          const key = `${index}-${msg.sendDate}`;
          const isSameUser =
            index > 0 &&
            messages[index - 1].type === 'TALK' &&
            msg.userId === messages[index - 1].userId;
          if (msg.type !== 'TALK') {
            if (!msg.message) return null;
            return (
              <div key={key} className="text-center text-text-muted text-xs py-2">
                {msg.message}
              </div>
            );
          }
          return msg.userId === user.userId ? (
            <div key={key} className="flex gap-2.5 justify-end">
              <div className="grid max-w-[80%] mb-2">
                {isSameUser || (
                  <span className="text-right block text-sm font-medium leading-6">
                    {msg.sender}
                  </span>
                )}
                <div className="px-3 py-2 bg-primary rounded">
                  <p className="text-on-primary text-sm font-normal leading-snug break-words [overflow-wrap:anywhere]">
                    {msg.message}
                  </p>
                </div>
                <div className="justify-start items-center inline-flex">
                  <MessageTime sendDate={msg.sendDate} />
                </div>
              </div>
            </div>
          ) : (
            <div key={key} className="flex gap-2.5 mb-4">
              <div className="grid max-w-[80%]">
                {isSameUser || (
                  <span className="block text-sm font-medium leading-6">
                    {msg.sender}
                  </span>
                )}
                <div className="grid">
                  <div className="px-3.5 py-2 bg-surface-2 rounded justify-start items-center gap-3 inline-flex">
                    <p className="text-text-base text-sm font-normal leading-snug break-words [overflow-wrap:anywhere] min-w-0">
                      {msg.message}
                    </p>
                  </div>
                  <div className="justify-end items-center inline-flex mb-2.5">
                    <MessageTime sendDate={msg.sendDate} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="w-full pl-3 pr-1 py-1 rounded-3xl border border-border bg-surface has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-text-base items-center gap-2 flex flex-wrap justify-between mt-4 pb-4"
      >
        <div className="flex items-center gap-2 flex-grow">
          <input
            name="message"
            aria-label="메시지 입력"
            autoComplete="off"
            maxLength={1000}
            className="flex-grow text-sm font-medium leading-4 bg-transparent text-text-base focus:outline-none placeholder:text-text-muted"
            placeholder="메시지를 입력하세요…"
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={status !== 'open' || !message.trim()}
            className="items-center flex px-3 py-2 bg-primary enabled:hover:bg-primary-hover rounded-full shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-on-primary text-xs font-semibold leading-4 px-2">
              전송
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
