"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, ListTodo, Gavel, DollarSign, TrendingUp, Shield, Flag, CheckCircle, Ban, Eye } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { formatCurrency, formatDate, formatRelativeTime, getCategoryLabel } from "@/lib/utils";

const TABS = ["Resumen", "Usuarios", "Tareas", "Reportes"];

export default function AdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin"],
    queryFn: () => fetch("/api/admin").then((r) => r.json()),
    enabled: role === "ADMIN",
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => fetch("/api/reports").then((r) => r.json()),
    enabled: role === "ADMIN",
  });

  const userAction = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }).then((r) => r.json()),
    onSuccess: (_, v) => {
      toast.success(`Acción "${v.action}" aplicada`);
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  if (role !== "ADMIN") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Acceso restringido a administradores</p>
      </div>
    );
  }

  const { stats, recentUsers, recentTasks } = data ?? {};
  const pendingReports = reports.filter((r: any) => r.status === "PENDING").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Admin SKL</h1>
          <p className="text-xs text-slate-500">Panel de administración</p>
        </div>
        {pendingReports > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <Flag className="w-3 h-3" /> {pendingReports} reportes pendientes
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${tab === i ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t}
            {i === 3 && pendingReports > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">{pendingReports}</span>
            )}
          </button>
        ))}
      </div>

      {/* Summary */}
      {tab === 0 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Usuarios", value: stats?.users, color: "text-blue-600 bg-blue-50" },
              { icon: ListTodo, label: "Tareas", value: stats?.tasks, color: "text-violet-600 bg-violet-50" },
              { icon: Gavel, label: "Ofertas", value: stats?.bids, color: "text-amber-600 bg-amber-50" },
              { icon: DollarSign, label: "Volumen", value: formatCurrency(stats?.volume ?? 0), color: "text-emerald-600 bg-emerald-50" },
              { icon: TrendingUp, label: "Comisiones", value: formatCurrency(stats?.revenue ?? 0), color: "text-pink-600 bg-pink-50" },
              { icon: Flag, label: "Reportes", value: pendingReports, color: "text-red-600 bg-red-50" },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="p-4">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 1 && (
        <Card className="divide-y divide-slate-100">
          {(recentUsers ?? []).map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={u.name} src={u.image} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant={u.role === "WORKER" ? "info" : "default"}>{u.role}</Badge>
                {u.verified && <span className="text-blue-500 text-xs font-bold">✓</span>}
                {u.isBlocked && <Badge variant="danger">Bloqueado</Badge>}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => userAction.mutate({ id: u.id, action: u.isBlocked ? "unblock" : "block" })}
                  title={u.isBlocked ? "Desbloquear" : "Bloquear"}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {u.isBlocked ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Ban className="w-4 h-4 text-red-400" />}
                </button>
                <button
                  onClick={() => userAction.mutate({ id: u.id, action: u.verified ? "unverify" : "verify" })}
                  title={u.verified ? "Quitar verificación" : "Verificar"}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Shield className={`w-4 h-4 ${u.verified ? "text-blue-500" : "text-slate-300"}`} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Tasks */}
      {tab === 2 && (
        <Card className="divide-y divide-slate-100">
          {(recentTasks ?? []).map((t: any) => (
            <Link key={t.id} href={`/tasks/${t.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors block">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{t.title}</p>
                <p className="text-xs text-slate-400">{t.client?.name} · {getCategoryLabel(t.category)} · {t.location}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {t.urgent && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">⚡ Urgente</span>}
                <Badge variant={t.status === "OPEN" ? "success" : t.status === "IN_PROGRESS" ? "info" : "default"}>
                  {t.status.replace("_", " ")}
                </Badge>
                <span className="text-xs font-bold text-blue-600">{formatCurrency(t.budget)}</span>
              </div>
            </Link>
          ))}
        </Card>
      )}

      {/* Reports */}
      {tab === 3 && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <Card className="p-10 text-center">
              <Flag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No hay reportes</p>
            </Card>
          ) : reports.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flag className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">{r.reason.replace(/_/g, " ")}</p>
                    <Badge variant={r.status === "PENDING" ? "warning" : "default"}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold">{r.reporter?.name}</span> reportó a{" "}
                    <Link href={`/profile/${r.reportedId}`} className="font-semibold text-blue-600 hover:underline">{r.reported?.name}</Link>
                  </p>
                  {r.details && <p className="text-xs text-slate-400 mt-1 italic">&quot;{r.details}&quot;</p>}
                  <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(r.createdAt)}</p>
                  {!r.reported?.isBlocked && (
                    <button
                      onClick={() => userAction.mutate({ id: r.reportedId, action: "block" })}
                      className="mt-2 text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" /> Bloquear usuario reportado
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
