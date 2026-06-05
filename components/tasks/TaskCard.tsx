import Link from "next/link";
import { MapPin, Clock, DollarSign, Users, Zap } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { Task } from "@/types";
import { formatCurrency, formatRelativeTime, getCategoryIcon, getCategoryLabel } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  showClient?: boolean;
}

export default function TaskCard({ task, showClient = true }: TaskCardProps) {
  const statusVariant: Record<string, any> = {
    OPEN: "success", IN_PROGRESS: "info", COMPLETED: "default", CANCELLED: "danger",
  };

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card hover className={`p-4 ${task.urgent ? "border-amber-200 bg-amber-50/30" : ""}`}>
        {task.urgent && (
          <div className="flex items-center gap-1 text-amber-600 text-[10px] font-bold mb-2">
            <Zap className="w-3 h-3 fill-amber-500" /> URGENTE
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-card flex items-center justify-center text-xl">
            {getCategoryIcon(task.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{task.title}</h3>
              <Badge variant={statusVariant[task.status] ?? "default"} className="flex-shrink-0 text-[10px]">
                {task.status === "OPEN" ? "Abierto" : task.status === "IN_PROGRESS" ? "Activo" : task.status === "COMPLETED" ? "Completado" : "Cancelado"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2.5">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" /> {task.location}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                <DollarSign className="w-3 h-3" /> {formatCurrency(task.budget)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Users className="w-3 h-3" /> {task._count?.bids ?? task.bids?.length ?? 0} ofertas
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                <Clock className="w-3 h-3" /> {formatRelativeTime(task.createdAt)}
              </span>
            </div>

            {showClient && (
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
                <Avatar src={task.client?.image} name={task.client?.name} size="xs" />
                <span className="text-xs text-slate-500">{task.client?.name ?? "Anónimo"}</span>
                {task.client?.verified && (
                  <span className="text-[10px] text-blue-600 font-semibold">✓ Verificado</span>
                )}
                <span className="ml-auto text-[10px] font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
                  {getCategoryLabel(task.category)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
