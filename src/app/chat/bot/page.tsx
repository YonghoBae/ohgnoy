'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Message } from '@/interfaces/message';
import { UserInfo } from '@/interfaces/user';
import { chatApi } from '@/lib/api/chat';

const Chat = () => {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserInfo>({
    userId: 0,
    nickname: '',
    email: '',
  });
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
    chatApi.getUserInfo(token!).then(setUser);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    await chatApi.sendMessage();
    setMessage('');
  };

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      buttonRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between px-6 py-6 lg:px-8">
      <div className="flex-grow overflow-y-auto">
        {messages.map((msg, index) => {
          const isSameUser = index > 0 && msg.userId === messages[index - 1].userId;
          return msg.userId === user.userId ? (
            <div key={index} className="flex gap-2.5 justify-end">
              <div className="grid mb-2">
                {isSameUser || (
                  <h5 className="text-right block text-sm font-medium leading-6">
                    {msg.sender}
                  </h5>
                )}
                <div className="px-3 py-2 bg-primary rounded">
                  <p className="text-white text-sm font-normal leading-snug">
                    {msg.message}
                  </p>
                </div>
                <div className="justify-start items-center inline-flex">
                  <span className="text-text-muted text-xs font-normal leading-4 py-1">
                    {format(new Date(msg.sendDate), 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div key={index} className="flex gap-2.5 mb-4">
              <div className="grid">
                {isSameUser || (
                  <h5 className="block text-sm font-medium leading-6">
                    {msg.sender}
                  </h5>
                )}
                <div className="w-max grid">
                  <div className="px-3.5 py-2 bg-surface-2 rounded justify-start items-center gap-3 inline-flex">
                    <p className="text-text-base text-sm font-normal leading-snug">
                      {msg.message}
                    </p>
                  </div>
                  <div className="justify-end items-center inline-flex mb-2.5">
                    <span className="text-text-muted text-xs font-normal leading-4 py-1">
                      {format(new Date(msg.sendDate), 'HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full pl-3 pr-1 py-1 rounded-3xl border border-border bg-surface items-center gap-2 flex flex-wrap justify-between mt-4 pb-4">
        <div className="flex items-center gap-2 flex-grow">
          <input
            aria-label="메시지 입력"
            className="flex-grow text-sm font-medium leading-4 bg-transparent text-text-base focus:outline-none placeholder:text-text-muted"
            placeholder="Type here..."
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            ref={buttonRef}
            onClick={sendMessage}
            aria-label="메시지 전송"
            className="items-center flex px-3 py-2 bg-primary hover:bg-primary-hover rounded-full shadow transition-colors"
          >
            <span className="text-white text-xs font-semibold leading-4 px-2">
              Send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
