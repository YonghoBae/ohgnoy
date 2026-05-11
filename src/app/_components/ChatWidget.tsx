"use client";

import { useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { format } from "date-fns";
import { Message } from "@/interfaces/message";
import { UserInfo } from "@/interfaces/user";
import { userInfo } from "@/lib/user/token";
import { createStompClient } from "@/lib/socket";

const ROOM_ID = "1";

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

  const stompClient = useRef<Client | null>(null);
  const userRef = useRef<UserInfo>({ userId: 0, nickname: "", email: "" });
  const openRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    openRef.current = open;
    if (open) setUnread(0);
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    setMounted(true);

    const connect = (userData: UserInfo) => {
      setUser(userData);
      userRef.current = userData;

      const client = createStompClient();
      stompClient.current = client;

      client.onConnect = () => {
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
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = () => {
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

  return (
    <>
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 flex w-80 flex-col rounded-2xl border border-border bg-[#ECEFF4] shadow-2xl dark:bg-[#2E3440]"
          style={{ height: "28rem" }}
        >
          <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <span className="text-sm font-semibold">실시간 채팅</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="채팅 닫기"
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.map((msg, i) => {
              const isSameUser =
                i > 0 &&
                messages[i - 1].type === "TALK" &&
                msg.userId === messages[i - 1].userId;
              if (msg.type !== "TALK") {
                return (
                  <div key={i} className="py-1 text-center text-xs text-text-muted">
                    {msg.message}
                  </div>
                );
              }
              const isMe = msg.userId === user.userId;
              return (
                <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  {!isSameUser && (
                    <span className="mb-0.5 px-1 text-xs text-text-muted">
                      {msg.sender}
                    </span>
                  )}
                  <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`max-w-[200px] break-words rounded-2xl px-3 py-1.5 text-sm ${
                        isMe
                          ? "rounded-tr-sm bg-primary text-white"
                          : "rounded-tl-sm bg-surface-2 text-text-base"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="shrink-0 text-[10px] text-text-muted">
                      {format(new Date(msg.sendDate), "HH:mm")}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-border px-3 py-2">
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지 입력..."
              aria-label="메시지 입력"
              className="flex-1 rounded-full bg-surface px-3 py-1.5 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={sendMessage}
              aria-label="전송"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "채팅 닫기" : "채팅 열기"}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-primary-hover"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
