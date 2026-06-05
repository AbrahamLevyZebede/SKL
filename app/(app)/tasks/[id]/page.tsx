"use client";
import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Clock, DollarSign, ChevronLeft, Send, MessageSquare, CheckCircle, Star, Edit2, Copy, Zap, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import BidCard from "@/components/tasks/BidCard";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import { Task } from "@/types";
import { formatCurrency, formatDate, getCategoryIcon, getCategoryLabel } from "@/lib/utils";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const [bidOpen, setBidOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMsg, setBidMsg] = useState("");
  const [bidDuration, setBidDuration] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: () => fetch(`/api/tasks/${id}`).then((r) => r.json()),
  });

  const submitBid = useMutation({
    mutationFn: () =>
      fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id, amount: bidAmount, message: bidMsg, estimatedDuration: bidDuration }),
      }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); }),
    onSuccess: () => { toast.success("¡Oferta enviada!"); setBidOpen(false); qc.invalidateQueries({ queryKey: ["task", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const acceptBid = useMutation({
    mutationFn: (bidId: string) =>
      fetch(`/api/bids/${bidId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "accept" }) }).then((r) => r.json()),
    onSuccess: () => { toast.success("¡Oferta aceptada!"); qc.invalidateQueries({ queryKey: ["task", id] }); },
  });

  const releasePayment = useMutation({
    mutationFn: () =>
      fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: id, action: "release" }) }).then((r) => r.json()),
    onSuccess: () => { toast.success("¡Pago liberado!"); qc.invalidateQueries({ queryKey: ["task", id] }); },
  });

  const submitReview = useMutation({
    mutationFn: () =>
      fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id, revieweeId: task?.acceptedBid?.workerId, rating: reviewRating, comment: reviewComment }),
      }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); }),
    onSuccess: () => { toast.success("¡Reseña enviada!"); setReviewOpen(false); qc.invalidateQueries({ queryKey: ["task", id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  async function duplicate() {
    if (!task) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${task.title} (copia)`,
        description: task.description,
        category: task.category,
        location: task.location,
        province: task.province,
        district: task.district,
        budget: task.budget,
        urgent: task.urgent,
        photos: task.photos,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      toast.success("Tarea duplicada");
      router.push(`/tasks/${t.id}`);
    }
  }

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8"><div className="h-64 bg-slate-100 rounded-2xl animate-pulse" /></div>;
  if (!task || (task as any).error) return <div className="p-8 text-center text-slate-400">Tarea no encontrada</div>;

  const isOwner = task.clientId === userId;
  const hasAlreadyBid = task.bids?.some((b) => b.workerId === userId);
  const statusVariant: Record<string, any> = { OPEN: "success", IN_PROGRESS: "info", COMPLETED: "default", CANCELLED: "danger" };
  const statusLabel: Record<string, string> = { OPEN: "Abierta", IN_PROGRESS: "En progreso", COMPLETED: "Completada", CANCELLED: "Cancelada" };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        {isOwner && task.status === "OPEN" && (
          <div className="flex items-center gap-2">
            <Link href={`/tasks/${id}/edit`}>
              <Button size="sm" variant="outline"><Edit2 className="w-3.5 h-3.5" /> Editar</Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={duplicate}>
              <Copy className="w-3.5 h-3.5" /> Duplicar
            </Button>
          </div>
        )}
      </div>

      {/* Task header */}
      <Card className="p-5 mb-4">
        {task.urgent && (
          <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 fill-amber-500" /> TAREA URGENTE
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-card flex items-center justify-center text-2xl flex-shrink-0">
            {getCategoryIcon(task.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{task.title}</h1>
              <Badge variant={statusVariant[task.status]}>{statusLabel[task.status] ?? task.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{getCategoryLabel(task.category)}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-4 leading-relaxed">{task.description}</p>

        {/* Photos */}
        {task.photos?.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {task.photos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Presupuesto</p>
            <p className="font-bold text-blue-600 flex items-center gap-1 text-lg"><DollarSign className="w-3.5 h-3.5" />{formatCurrency(task.budget)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Ubicación</p>
            <p className="font-semibold text-slate-700 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{task.location}</p>
          </div>
          {task.deadline && (
            <div className="bg-slate-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-slate-400 mb-0.5">Fecha límite</p>
              <p className="font-semibold text-slate-700 text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(task.deadline)}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <Eye className="w-3 h-3" /> {task.viewCount} vistas
        </div>
      </Card>

      {/* Client card */}
      <Card className="p-4 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase mb-3">Publicado por</p>
        <div className="flex items-center gap-3">
          <Avatar src={task.client?.image} name={task.client?.name} size="md" />
          <div>
            <p className="font-bold text-slate-900 text-sm">{task.client?.name}</p>
            <StarRating rating={task.client?.rating ?? 0} size="sm" />
          </div>
          {!isOwner && userId && (
            <Link href={`/messages?with=${task.clientId}`} className="ml-auto">
              <Button size="sm" variant="outline"><MessageSquare className="w-3.5 h-3.5" /> Mensaje</Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Owner: complete */}
      {isOwner && task.status === "IN_PROGRESS" && (
        <Card className="p-4 mb-4 border-emerald-200 bg-emerald-50">
          <p className="text-sm font-bold text-emerald-800 mb-3">El trabajo está en progreso — marca como completado cuando termines</p>
          <Button onClick={() => releasePayment.mutate()} loading={releasePayment.isPending} className="w-full">
            <CheckCircle className="w-4 h-4" /> Completar y liberar pago
          </Button>
        </Card>
      )}

      {/* Owner: review after completion */}
      {isOwner && task.status === "COMPLETED" && !task.reviews?.some((r) => r.reviewerId === userId) && task.acceptedBid && (
        <Card className="p-4 mb-4 border-amber-200 bg-amber-50">
          <p className="text-sm font-bold text-amber-800 mb-2">¿Cómo fue el trabajo?</p>
          <Button variant="outline" onClick={() => setReviewOpen(true)} className="w-full">
            <Star className="w-4 h-4" /> Dejar reseña al trabajador
          </Button>
        </Card>
      )}

      {/* Bids */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-slate-900">Ofertas ({task.bids?.length ?? 0})</h2>
          {role === "WORKER" && task.status === "OPEN" && !hasAlreadyBid && !isOwner && (
            <Button size="sm" onClick={() => setBidOpen(true)}>
              <Send className="w-3.5 h-3.5" /> Hacer oferta
            </Button>
          )}
          {role === "WORKER" && hasAlreadyBid && (
            <Badge variant="info">Ya ofertaste</Badge>
          )}
        </div>

        {task.bids?.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-slate-400 text-sm">Sin ofertas aún. ¡Sé el primero!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {task.bids?.map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                isOwner={isOwner}
                taskStatus={task.status}
                onAccept={(bidId) => acceptBid.mutate(bidId)}
                accepting={acceptBid.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bid Modal */}
      <Modal open={bidOpen} onClose={() => setBidOpen(false)} title="Enviar oferta">
        <div className="space-y-4">
          <Input label="Tu oferta (USD)" type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="ej. 150" min="1" icon={<DollarSign className="w-4 h-4" />} />
          <Input label="Tiempo estimado" value={bidDuration} onChange={(e) => setBidDuration(e.target.value)} placeholder="ej. 2-3 horas, 1 día" icon={<Clock className="w-4 h-4" />} />
          <Textarea label="Tu mensaje" value={bidMsg} onChange={(e) => setBidMsg(e.target.value)} placeholder="Describe tu experiencia y enfoque para este trabajo…" rows={4} />
          <Button onClick={() => submitBid.mutate()} loading={submitBid.isPending} className="w-full" size="lg">Enviar oferta</Button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Dejar reseña">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Calificación</p>
            <StarRating rating={reviewRating} size="lg" interactive onRate={setReviewRating} />
          </div>
          <Textarea label="Tu reseña" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="¿Cómo fue la experiencia?" rows={4} />
          <Button onClick={() => submitReview.mutate()} loading={submitReview.isPending} className="w-full" size="lg">Enviar reseña</Button>
        </div>
      </Modal>
    </div>
  );
}
