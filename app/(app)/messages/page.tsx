"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageSquare } from "lucide-react";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";

export default function MessagesPage() {
  const { data: session } = useSession();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => fetch("/api/messages").then((r) => r.json()),
    refetchInterval: 5000,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Messages</h1>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((n) => <div key={n} className="bg-white rounded-2xl h-16 animate-pulse" />)}</div>
      ) : conversations.length === 0 ? (
        <Card className="p-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No conversations yet.</p>
          <p className="text-xs text-slate-400 mt-1">Start chatting from a task page.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((c: any) => (
            <Link key={c.partner.id} href={`/messages/${c.partner.id}`}>
              <Card hover className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={c.partner.image} name={c.partner.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 text-sm">{c.partner.name}</p>
                      <span className="text-xs text-slate-400">{c.lastMessage ? formatRelativeTime(c.lastMessage.createdAt) : ""}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {c.lastMessage?.senderId === (session?.user as any)?.id ? "You: " : ""}
                      {c.lastMessage?.content ?? "No messages yet"}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <Badge variant="info" className="flex-shrink-0">{c.unread}</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
