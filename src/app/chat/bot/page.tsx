'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { Message } from '@/interfaces/message';
import { UserInfo } from '@/interfaces/user';
import { Ohgnoy_BackendAPI } from '@/lib/constants';

const Chat = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserInfo>({
    user_id: 0,
    nick_name: '',
    email: '',
  });

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/auth/login');
    }

    const userInfo = async () => {
      const response = await fetch(`${Ohgnoy_BackendAPI}/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      setUser(result.data);
    };

    userInfo();
  }, []);

  const sendMessage = () => {
    const msgData: Message = {
      user_id: user.user_id,
      nick_name: user.nick_name,
      profile: '',
      message: message,
      send_date: Date.now(),
    };

    setMessage('');
  };

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      buttonRef.current?.click(); // 버튼 클릭 이벤트 트리거
    }
  };

  return (
    <div className="dark:text-stone-50 flex flex-col min-h-screen justify-between px-6 py-12 lg:px-8">
      <div className="flex-grow overflow-y-auto">
        {' '}
        {/* 채팅 영역이 화면 크기에 맞게 늘어남 */}
        {messages.map((msg, index) => {
          const isSameUser =
            index > 0 && msg.user_id === messages[index - 1].user_id;
          return msg.user_id === user.user_id ? (
            <div key={index} className="flex gap-2.5 justify-end">
              <div className="">
                <div className="grid mb-2">
                  {isSameUser || (
                    <h5 className="text-right block text-sm font-medium leading-6">
                      {msg.nick_name}
                    </h5>
                  )}
                  <div className="px-3 py-2 bg-indigo-600 rounded">
                    <h2 className="text-white text-sm font-normal leading-snug">
                      {msg.message}
                    </h2>
                  </div>
                  <div className="justify-start items-center inline-flex">
                    <h3 className="text-gray-500 text-xs font-normal leading-4 py-1">
                      {moment(msg.send_date).format('YYYY-MM-DD HH:mm:ss')}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={index} className="flex gap-2.5 mb-4">
              <div className="grid">
                {isSameUser || (
                  <h5 className="block text-sm font-medium leading-6">
                    {msg.nick_name}
                  </h5>
                )}
                <div className="w-max grid">
                  <div className="px-3.5 py-2 bg-gray-100 rounded justify-start items-center gap-3 inline-flex">
                    <h5 className="text-gray-900 text-sm font-normal leading-snug">
                      {msg.message}
                    </h5>
                  </div>
                  <div className="justify-end items-center inline-flex mb-2.5">
                    <h6 className="text-gray-500 text-xs font-normal leading-4 py-1">
                      {moment(msg.send_date).format('YYYY-MM-DD HH:mm:ss')}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* 채팅 입력 영역 */}
      <div className="w-full pl-3 pr-1 py-1 rounded-3xl border items-center gap-2 flex flex-wrap justify-between dark:bg-gray-50 dark:border-gray-50">
        <div className="flex items-center gap-2 flex-grow">
          <input
            className="flex-grow text-xs font-medium leading-4 focus:outline-none dark:bg-gray-50 dark:text-black"
            placeholder="Type here..."
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            ref={buttonRef}
            onClick={sendMessage}
            className="items-center flex px-3 py-2 bg-indigo-600 rounded-full shadow"
          >
            <h3 className="text-white text-xs font-semibold leading-4 px-2">
              Send
            </h3>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
