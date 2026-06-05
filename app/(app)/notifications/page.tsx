"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { Notification } from "@/types";

const TYPE_ICONS: Record<string, string> = {
  NEW_BID: "💰",
  BID_ACCEPTED: "✅",
  NEW_MESSAGE: "💬",
  TASK_COMPLETED: "🎉",
  PAYMENT_RELEASED: "💸",
  NEW_REVIEW: "⭐",
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: 10000,
  });

  const markRead = useMutation({
    mutationFn: () => fetch("/api/notifications", { method: "PATCH" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
          {unread > 0 && <Badge variant="info">{unread}</Badge>}
        </div>
        {unread > 0 && (
          <Button size="sm" variant="ghost" onClick={() => markRead.mutate()}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-10 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={`p-4 ${!n.read ? "border-blue-200 bg-blue-50/50" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
