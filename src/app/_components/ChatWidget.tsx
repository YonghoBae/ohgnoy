"use client";

import { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { Message } from "@/interfaces/message";
import { UserInfo } from "@/interfaces/user";
import { userInfo } from "@/lib/user/token";
import { createStompClient } from "@/lib/socket";
import { chatApi } from "@/lib/api/chat";

const ROOM_ID = "1";
const PANEL_ID = "chat-widget-panel";
const TITLE_ID = "chat-widget-title";

const timeFormat = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateTimeFormat = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatSendDate(date: Date): string {
  const today = date.toDateString() === new Date().toDateString();
  return (today ? timeFormat : dateTimeFormat).format(date);
}

function getOrCreateAnonUser(): UserInfo {
  const stored = localStorage.getItem("anon_user");
  if (stored) return JSON.parse(stored) as UserInfo;
  const num = Math.floor(Math.random() * 9000) + 1000;
  // 음수 ID로 실제 유저 ID와 충돌 방지
  const anon: UserInfo = { userId: -(num), nickname: `익명_${num}`, email: "" };
  localStorage.setItem("anon_user", JSON.stringify(anon));
  return anon;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo>({ userId: 0, nickname: "", email: "" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");

  const stompClient = useRef<Client | null>(null);
  const userRef = useRef<UserInfo>({ userId: 0, nickname: "", email: "" });
  const openRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    openRef.current = open;
    if (open) setUnread(0);
    // No autofocus on touch: it would pop the on-screen keyboard.
    if (open && !window.matchMedia("(pointer: coarse)").matches) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    chatApi.getHistory(ROOM_ID)
      .then((messages) => setMessages(messages))
      .catch(()=>{});

    const connect = (userData: UserInfo) => {
      if (cancelled) return;
      setUser(userData);
      userRef.current = userData;

      const client = createStompClient();
      stompClient.current = client;

      client.onConnect = () => {
        setStatus("open");
        client.subscribe(`/sub/chat/room${ROOM_ID}`, (frame: IMessage) => {
          const msg: Message = JSON.parse(frame.body);
          setMessages((prev) => [...prev, msg]);
          if (
            !openRef.current &&
            msg.type === "TALK" &&
            msg.userId !== userRef.current.userId
          ) {
            setUnread((n) => n + 1);
          }
        });

        client.publish({
          destination: "/pub/chat/message",
          body: JSON.stringify({
            type: "ENTER",
            roomId: ROOM_ID,
            sender: userData.nickname,
            message: "",
            userId: userData.userId,
            sendDate: Date.now(),
          }),
        });
      };
      client.onWebSocketClose = () => setStatus("closed");

      client.activate();
    };

    const token = localStorage.getItem("token");
    if (token) {
      userInfo(token)
        .then(connect)
        .catch(() => connect(getOrCreateAnonUser()));
    } else {
      connect(getOrCreateAnonUser());
    }

    return () => {
      cancelled = true;
      const client = stompClient.current;
      if (client?.connected && userRef.current.userId !== 0) {
        client.publish({
          destination: "/pub/chat/message",
          body: JSON.stringify({
            type: "LEAVE",
            roomId: ROOM_ID,
            sender: userRef.current.nickname,
            message: "",
            userId: userRef.current.userId,
            sendDate: Date.now(),
          }),
        });
      }
      client?.deactivate();
    };
  }, []);

  useEffect(() => {
    if (open) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      messagesEndRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
  }, [messages, open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && open) close();
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stompClient.current?.connected || !message.trim()) return;
    stompClient.current.publish({
      destination: "/pub/chat/message",
      body: JSON.stringify({
        type: "TALK",
        roomId: ROOM_ID,
        sender: user.nickname,
        message,
        userId: user.userId,
        sendDate: Date.now(),
      }),
    });
    setMessage("");
    inputRef.current?.focus();
  };

  if (!mounted) return null;

  const statusText =
    status === "connecting" ? "연결 중…" : status === "closed" ? "연결 끊김" : "";
  const toggleLabel = open
    ? "채팅 닫기"
    : unread > 0
      ? `채팅 열기, 읽지 않은 메시지 ${unread}개`
      : "채팅 열기";

  return (
    <>
      {open && (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-labelledby={TITLE_ID}
          onKeyDown={handleEscape}
          className="chat-widget-root fixed z-50 flex h-[28rem] max-h-[calc(100dvh-6rem)] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-border bg-[#ECEFF4] shadow-2xl dark:bg-[#2E3440]"
          style={{
            bottom: "calc(5rem + env(safe-area-inset-bottom))",
            right: "calc(1rem + env(safe-area-inset-right))",
          }}
        >
          <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-on-primary">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span id={TITLE_ID} className="text-sm font-semibold">실시간 채팅</span>
              <span role="status" className="text-xs">{statusText}</span>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="채팅 닫기"
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <div
            role="log"
            aria-live="polite"
            aria-label="채팅 메시지"
            className="flex-1 space-y-2 overflow-y-auto px-3 py-3"
          >
            {messages.length === 0 && (
              <p className="py-6 text-center text-xs text-text-muted">아직 메시지가 없습니다.</p>
            )}
            {messages.map((msg, i) => {
              const key = `${i}-${msg.sendDate}`;
              const isSameUser =
                i > 0 &&
                messages[i - 1].type === "TALK" &&
                msg.userId === messages[i - 1].userId;
              if (msg.type !== "TALK") {
                if (!msg.message) return null;
                return (
                  <div key={key} className="py-1 text-center text-xs text-text-muted">
                    {msg.message}
                  </div>
                );
              }
              const isMe = msg.userId === user.userId;
              const sent = new Date(msg.sendDate);
              return (
                <div key={key} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  {!isSameUser && (
                    <span className="mb-0.5 px-1 text-xs text-text-muted">
                      {msg.sender}
                    </span>
                  )}
                  <div className={`flex max-w-[80%] items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`min-w-0 break-words [overflow-wrap:anywhere] rounded-2xl px-3 py-1.5 text-sm ${
                        isMe
                          ? "rounded-tr-sm bg-primary text-on-primary"
                          : "rounded-tl-sm bg-surface-2 text-text-base"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <time dateTime={sent.toISOString()} className="shrink-0 text-[10px] text-text-muted">
                      {formatSendDate(sent)}
                    </time>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-border px-3 py-2">
            <input
              ref={inputRef}
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                // Enter that commits a Korean IME syllable must not submit.
                if (e.key === "Enter" && e.nativeEvent.isComposing) e.preventDefault();
              }}
              placeholder="메시지를 입력하세요…"
              aria-label="메시지 입력"
              autoComplete="off"
              maxLength={1000}
              className="min-w-0 flex-1 rounded-full bg-surface px-3 py-1.5 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={status !== "open" || !message.trim()}
              aria-label="전송"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleEscape}
        aria-label={toggleLabel}
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
        className="chat-widget-root fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-[background-color,transform] duration-200 hover:bg-primary-hover motion-safe:hover:scale-110"
        style={{
          bottom: "calc(1rem + env(safe-area-inset-bottom))",
          right: "calc(1rem + env(safe-area-inset-right))",
        }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 w-5 motion-safe:animate-pulse items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
