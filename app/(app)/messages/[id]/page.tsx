"use client";
import { use, useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, Send, Paperclip, CheckCheck, Check, Image as ImageIcon } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { Message } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: otherId } = use(params);
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", otherId],
    queryFn: () => fetch(`/api/messages?with=${otherId}`).then((r) => r.json()),
    refetchInterval: 3000,
  });

  const { data: partner } = useQuery({
    queryKey: ["user", otherId],
    queryFn: () => fetch(`/api/users/${otherId}`).then((r) => r.json()),
  });

  const send = useMutation({
    mutationFn: (content: string) =>
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherId, content }),
      }).then((r) => r.json()),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["messages", otherId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && text.trim()) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try { await send.mutateAsync(text.trim()); }
    finally { setSending(false); }
  }

  // Group messages by date
  function formatDay(date: string) {
    const d = new Date(date);
    const today = new Date();
    const diff = (today.getTime() - d.getTime()) / 86400000;
    if (diff < 1) return "Hoy";
    if (diff < 2) return "Ayer";
    return d.toLocaleDateString("es-PA", { day: "numeric", month: "long" });
  }

  let lastDay = "";

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shadow-sm flex-shrink-0">
        <Link href="/messages" className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <Avatar src={partner?.image} name={partner?.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">{partner?.name ?? "…"}</p>
          <p className="text-xs text-slate-400">{partner?.role === "WORKER" ? "Trabajador" : "Cliente"}</p>
        </div>
        {partner && (
          <Link href={`/profile/${otherId}`} className="text-xs text-blue-600 font-semibold hover:underline">
            Ver perfil
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Send className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Inicia la conversación</p>
            <p className="text-slate-300 text-xs mt-1">Escribe tu primer mensaje</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const mine = msg.senderId === userId;
          const day = formatDay(msg.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          const isLast = i === messages.length - 1;

          return (
            <div key={msg.id}>
              {showDay && (
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-semibold text-slate-400 px-2">{day}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}
              <div className={cn("flex gap-2 items-end mb-1", mine ? "flex-row-reverse" : "flex-row")}>
                {!mine && (
                  <Avatar
                    src={msg.sender?.image}
                    name={msg.sender?.name}
                    size="xs"
                    className={cn("mb-1 flex-shrink-0", messages[i + 1]?.senderId === msg.senderId ? "opacity-0" : "")}
                  />
                )}
                <div className={cn("max-w-[78%]", mine ? "items-end" : "items-start", "flex flex-col")}>
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
                    mine
                      ? "bg-blue-600 text-white rounded-br-md shadow-sm shadow-blue-200"
                      : "bg-white text-slate-800 rounded-bl-md border border-slate-100 shadow-sm"
                  )}>
                    {msg.content}
                  </div>
                  {(isLast || messages[i + 1]?.senderId !== msg.senderId) && (
                    <div className={cn("flex items-center gap-1 mt-0.5 px-1", mine ? "flex-row-reverse" : "flex-row")}>
                      <span className="text-[10px] text-slate-400">{formatRelativeTime(msg.createdAt)}</span>
                      {mine && (
                        msg.read
                          ? <CheckCheck className="w-3 h-3 text-blue-500" />
                          : <Check className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje…"
              rows={1}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-28 bg-white"
              style={{ minHeight: "44px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-11 h-11 gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity shadow-md shadow-blue-200"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
