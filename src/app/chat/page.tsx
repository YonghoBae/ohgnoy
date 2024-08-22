'use client';

import { Message } from '@/interfaces/message';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { UserInfo } from '@/interfaces/user';

const Chat = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserInfo>({
    user_id: 0,
    nick_name: '',
    email: '',
  });

  const [message, setMessage] = useState<string>();

  const [messages, setmessages] = useState<Message[]>([
    {
      user_id: 1,
      nick_name: 'Alice',
      profile: 'https://example.com/profiles/alice.jpg',
      message: 'Hello! How are you?',
      send_date: '2024-08-20T14:00:00Z',
    },
    {
      user_id: 1,
      nick_name: 'Alice',
      profile: 'https://example.com/profiles/alice.jpg',
      message: 'I’m working on the project right now.',
      send_date: '2024-08-20T14:15:00Z',
    },
    {
      user_id: 2,
      nick_name: 'Bob',
      profile: 'https://example.com/profiles/bob.jpg',
      message: "I'm good, thanks! How about you?",
      send_date: '2024-08-20T14:05:00Z',
    },
    {
      user_id: 2,
      nick_name: 'Bob',
      profile: 'https://example.com/profiles/bob.jpg',
      message: 'Just finished my lunch!',
      send_date: '2024-08-20T14:20:00Z',
    },
    {
      user_id: 3,
      nick_name: 'Charlie',
      profile: 'https://example.com/profiles/charlie.jpg',
      message: "Hey everyone, what's up?",
      send_date: '2024-08-20T14:10:00Z',
    },
    {
      user_id: 3,
      nick_name: 'Charlie',
      profile: 'https://example.com/profiles/charlie.jpg',
      message: "I'm heading out for a walk.",
      send_date: '2024-08-20T14:25:00Z',
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token == undefined) {
      router.push('/auth/login');
    }

    const userInfo = async () => {
      const response = await fetch('http://localhost:3130/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      setUser(result.data);

      console.log(result);
    };

    userInfo();

    socket.connect();

    socket.on('connect', () => {
      console.log('socekt connect');
    });

    socket.on('disconnect', () => {
      console.log('socket disconnect');
    });

    socket.on('receiveAll', (msg: Message) => {
      console.log('서버소켓에서 전달된 데이터 확인-receiveAll:', msg);
      setmessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receiveAll');
    };
  }, []);

  const sendMessage = () => {
    const msgData:Message = {
      user_id: user.user_id,
      name: user.nick_name,
      profile: "",
      message: message,
      send_date: Date.now().toString(),
    };

    socket.emit('broadcast', msgData);

    setMessage('');
  };

  return (
    <div className="dark:text-stone-50 flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="grid pb-11">
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
                      {msg.send_date}
                    </h3>
                  </div>
                </div>
              </div>
              {/* <img
              src="https://pagedone.io/asset/uploads/1704091591.png"
              alt="Hailey image"
              className="w-10 h-11"
            /> */}
            </div>
          ) : (
            <div key={index} className="flex gap-2.5 mb-4">
              {/* <img
              src="https://pagedone.io/asset/uploads/1710412177.png"
              alt="Shanay image"
              className="w-10 h-11"
            /> */}
              <div className="grid">
                {isSameUser || (
                  <h5 className="block text-sm font-medium leading-6">
                    {msg.nick_name}
                  </h5>
                )}
                <div className="w-max grid">
                  <div className="px-3.5 py-2 bg-gray-100 rounded justify-start  items-center gap-3 inline-flex">
                    <h5 className="text-gray-900 text-sm font-normal leading-snug">
                      {msg.message}
                    </h5>
                  </div>
                  <div className="justify-end items-center inline-flex mb-2.5">
                    <h6 className="text-gray-500 text-xs font-normal leading-4 py-1">
                      {msg.send_date}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* 채팅입력 영역 */}
      <div className="w-full pl-3 pr-1 py-1 rounded-3xl border items-center gap-2 flex flex-wrap justify-between dark:bg-gray-50 dark:border-gray-50">
        <div className="flex items-center gap-2 flex-grow">
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <g id="user_circle">
              <path
                id="icon"
                d="M6.05 17.6C6.05 15.3218 8.26619 13.475 11 13.475C13.7338 13.475 15.95 15.3218 15.95 17.6M13.475 8.525C13.475 9.89191 12.3669 11 11 11C9.6331 11 8.525 9.89191 8.525 8.525C8.525 7.1581 9.6331 6.05 11 6.05C12.3669 6.05 13.475 7.1581 13.475 8.525ZM19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11Z"
                stroke="#4F46E5"
              />
            </g>
          </svg> */}

          <input
            className="flex-grow text-xs font-medium leading-4 focus:outline-none dark:bg-gray-50 dark:text-black"
            placeholder="Type here..."
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* <svg
            className="cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <g id="attach_file">
              <g id="Vector">
                <path
                  d="M14.9332 7.79175L8.77551 14.323C8.23854 14.8925 7.36794 14.8926 6.83097 14.323C6.294 13.7535 6.294 12.83 6.83097 12.2605L12.9887 5.72925M12.3423 6.41676L13.6387 5.04176C14.7126 3.90267 16.4538 3.90267 17.5277 5.04176C18.6017 6.18085 18.6017 8.02767 17.5277 9.16676L16.2314 10.5418M16.8778 9.85425L10.72 16.3855C9.10912 18.0941 6.49732 18.0941 4.88641 16.3855C3.27549 14.6769 3.27549 11.9066 4.88641 10.198L11.0441 3.66675"
                  stroke="#9CA3AF"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </g>
          </svg> */}
          <button
            onClick={sendMessage}
            className="items-center flex px-3 py-2 bg-indigo-600 rounded-full shadow"
          >
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <g id="send_arrow">
                <path
                  id="icon"
                  d="M9.04071 6.959L6.54227 9.45744M6.89902 10.0724L7.03391 10.3054C8.31034 12.5102 8.94855 13.6125 9.80584 13.5252C10.6631 13.4379 11.0659 12.2295 11.8715 9.81261L13.0272 6.34566C13.7631 4.13794 14.1311 3.03408 13.5484 2.45139C12.9657 1.8687 11.8618 2.23666 9.65409 2.97257L6.18714 4.12822C3.77029 4.93383 2.56187 5.33664 2.47454 6.19392C2.38721 7.0512 3.48957 7.68941 5.69431 8.96584L5.92731 9.10074C6.23326 9.27786 6.38623 9.36643 6.50978 9.48998C6.63333 9.61352 6.72189 9.7665 6.89902 10.0724Z"
                  stroke="white"
                  stroke-linecap="round"
                />
              </g>
            </svg> */}
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
