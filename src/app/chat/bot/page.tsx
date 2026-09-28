'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// The backend has no /chatbot endpoint yet, so this page only states that the
// bot is not available; the input stays visible but disabled.
const Chat = () => {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/auth/login');
    }
  }, []);

  return (
    <div
      className="flex flex-col h-[calc(100dvh-8rem)] min-h-80 px-6 py-6 lg:px-8"
    >
      <h1 className="sr-only">챗봇</h1>
      <div
        role="log"
        aria-live="polite"
        aria-label="챗봇 메시지"
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <div id="chatbot-notice" className="text-center text-text-muted text-sm py-6">
          <p>챗봇은 아직 준비 중입니다.</p>
          <p>
            다른 사용자와 대화하려면{' '}
            <Link href="/chat/user" className="underline text-text-base">
              실시간 채팅
            </Link>
            을 이용하세요.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full pl-3 pr-1 py-1 rounded-3xl border border-border bg-surface opacity-60 items-center gap-2 flex flex-wrap justify-between mt-4 pb-4"
      >
        <div className="flex items-center gap-2 flex-grow">
          <input
            name="message"
            aria-label="메시지 입력"
            aria-describedby="chatbot-notice"
            autoComplete="off"
            maxLength={1000}
            disabled
            className="flex-grow text-sm font-medium leading-4 bg-transparent text-text-base placeholder:text-text-muted cursor-not-allowed"
            placeholder="메시지를 입력하세요…"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled
            className="items-center flex px-3 py-2 bg-primary rounded-full shadow cursor-not-allowed"
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
