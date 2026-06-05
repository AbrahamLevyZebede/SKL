"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PlusCircle, TrendingUp, Clock, CheckCircle, Star, ArrowRight, DollarSign, Gavel, MessageSquare, Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import TaskCard from "@/components/tasks/TaskCard";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Task, Bid, Notification } from "@/types";

function KPI({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: any; sub?: string; color: string }) {
  return (
    <Card className="p-4">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2.5`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-extrabold text-slate-900 leading-none">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </Card>
  );
}

function MiniChart({ data, color = "#2563EB" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: i === data.length - 1 ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}

function ActivityItem({ notif }: { notif: Notification }) {
  const icons: Record<string, string> = {
    NEW_BID: "💰", BID_ACCEPTED: "✅", NEW_MESSAGE: "💬",
    TASK_COMPLETED: "🎉", PAYMENT_RELEASED: "💸", NEW_REVIEW: "⭐", ADMIN_REPORT: "🚨",
  };
  return (
    <div className={`flex items-start gap-3 py-2.5 ${!notif.read ? "opacity-100" : "opacity-70"}`}>
      <span className="text-lg flex-shrink-0 mt-0.5">{icons[notif.type] ?? "🔔"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{notif.title}</p>
        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{notif.message}</p>
      </div>
      <span className="text-[10px] text-slate-400 flex-shrink-0">{formatRelativeTime(notif.createdAt)}</span>
    </div>
  );
}

function ClientDashboard({ user }: { user: any }) {
  const { data: tasksData } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => fetch("/api/tasks/mine").then((r) => r.json()),
  });
  const { data: notifs = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
  });

  const tasks: Task[] = tasksData?.tasks ?? [];
  const open = tasks.filter((t) => t.status === "OPEN").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalBids = tasks.reduce((s, t) => s + (t._count?.bids ?? 0), 0);
  const recent = notifs.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Hero card */}
      <Card className="p-5 bg-gradient-to-br from-blue-600 to-violet-700 text-white border-0">
        <div className="flex items-center gap-3">
          <Avatar src={user?.image} name={user?.name} size="lg" />
          <div className="flex-1">
            <p className="text-blue-200 text-xs font-semibold">Bienvenido de vuelta</p>
            <h1 className="font-extrabold text-xl leading-tight">{user?.name}</h1>
            <div className="flex gap-1.5 mt-1">
              {user?.verified && <VerifiedBadge type="identity" className="bg-white/20 text-white border-0" />}
            </div>
          </div>
          <Link href="/tasks/create">
            <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 shadow-none border-0">
              <PlusCircle className="w-4 h-4" /> Publicar
            </Button>
          </Link>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KPI icon={Clock} label="Tareas abiertas" value={open} color="text-emerald-600 bg-emerald-50" />
        <KPI icon={TrendingUp} label="En progreso" value={inProgress} color="text-blue-600 bg-blue-50" />
        <KPI icon={CheckCircle} label="Completadas" value={completed} color="text-violet-600 bg-violet-50" />
        <KPI icon={Gavel} label="Ofertas recibidas" value={totalBids} color="text-amber-600 bg-amber-50" />
      </div>

      {/* Activity feed */}
      {recent.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 text-sm">Actividad reciente</h2>
            <Link href="/notifications" className="text-xs text-blue-600 font-semibold">Ver todo →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.map((n) => <ActivityItem key={n.id} notif={n} />)}
          </div>
        </Card>
      )}

      {/* Recent tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Mis Tareas</h2>
          <Link href="/tasks/mine" className="text-sm text-blue-600 font-semibold flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {tasks.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-slate-400 text-sm mb-4">Aún no tienes tareas publicadas.</p>
            <Link href="/tasks/create"><Button>Publicar mi primera tarea</Button></Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 4).map((t) => <TaskCard key={t.id} task={t} showClient={false} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkerDashboard({ user }: { user: any }) {
  const { data: bids = [] } = useQuery<Bid[]>({
    queryKey: ["my-bids"],
    queryFn: () => fetch("/api/bids").then((r) => r.json()),
  });
  const { data: tasksData } = useQuery({
    queryKey: ["open-tasks"],
    queryFn: () => fetch("/api/tasks?status=OPEN&limit=4").then((r) => r.json()),
  });
  const { data: notifs = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
  });

  const openTasks: Task[] = tasksData?.tasks ?? [];
  const pending = bids.filter((b) => b.status === "PENDING").length;
  const accepted = bids.filter((b) => b.status === "ACCEPTED").length;
  const earned = bids.filter((b) => b.status === "ACCEPTED").reduce((s, b) => s + b.amount, 0);
  const recent = notifs.slice(0, 5);

  // Fake weekly chart data from bids
  const chartData = [2, 3, 1, 4, accepted, pending, bids.length].slice(-7);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Hero card */}
      <Card className="p-5 bg-gradient-to-br from-blue-600 to-violet-700 text-white border-0">
        <div className="flex items-center gap-3">
          <Avatar src={user?.image} name={user?.name} size="lg" />
          <div className="flex-1">
            <p className="text-blue-200 text-xs font-semibold">Tu panel de trabajo</p>
            <h1 className="font-extrabold text-xl leading-tight">{user?.name}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating rating={user?.rating ?? 0} size="sm" />
              <span className="text-xs text-white/80">{user?.rating?.toFixed(1)} ({user?.reviewCount})</span>
            </div>
          </div>
          <Link href="/tasks">
            <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 shadow-none">
              Explorar
            </Button>
          </Link>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KPI icon={Clock} label="Ofertas pendientes" value={pending} color="text-amber-600 bg-amber-50" />
        <KPI icon={CheckCircle} label="Trabajos ganados" value={accepted} color="text-emerald-600 bg-emerald-50" />
        <KPI icon={DollarSign} label="Ingresos totales" value={formatCurrency(earned)} color="text-blue-600 bg-blue-50" />
        <KPI icon={Star} label="Calificación" value={`${user?.rating?.toFixed(1) ?? "—"}★`} sub={`${user?.jobsCompleted ?? 0} completados`} color="text-violet-600 bg-violet-50" />
      </div>

      {/* Mini chart */}
      {bids.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 text-sm">Actividad de ofertas</h2>
            <span className="text-xs text-slate-400">Últimos 7 días</span>
          </div>
          <MiniChart data={chartData} />
        </Card>
      )}

      {/* Activity */}
      {recent.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 text-sm">Actividad reciente</h2>
            <Link href="/notifications" className="text-xs text-blue-600 font-semibold">Ver todo →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.map((n) => <ActivityItem key={n.id} notif={n} />)}
          </div>
        </Card>
      )}

      {/* Open tasks nearby */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Tareas disponibles</h2>
          <Link href="/tasks" className="text-sm text-blue-600 font-semibold flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {openTasks.map((t) => <TaskCard key={t.id} task={t} />)}
          {openTasks.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-slate-400 text-sm">No hay tareas abiertas ahora. ¡Vuelve pronto!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
    enabled: !!userId,
  });

  if (!session) return null;
  return role === "WORKER"
    ? <WorkerDashboard user={profile ?? session.user} />
    : <ClientDashboard user={profile ?? session.user} />;
}
