"use client";
import { use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MapPin, ChevronLeft, MessageSquare, Flag, ShieldOff, Briefcase, Star, Clock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import SkillTags from "@/components/ui/SkillTags";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const REPORT_REASONS = [
  { value: "FRAUD", label: "Fraude o estafa" },
  { value: "INAPPROPRIATE", label: "Contenido inapropiado" },
  { value: "HARASSMENT", label: "Acoso" },
  { value: "FAKE_PROFILE", label: "Perfil falso" },
  { value: "OTHER", label: "Otro" },
];

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetch(`/api/users/${id}`).then((r) => r.json()),
  });

  const report = useMutation({
    mutationFn: () =>
      fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedId: id, reason: reportReason, details: reportDetails }),
      }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); }),
    onSuccess: () => { toast.success("Reporte enviado"); setReportOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const block = useMutation({
    mutationFn: () =>
      fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId: id }),
      }).then((r) => r.json()),
    onSuccess: () => toast.success("Usuario bloqueado"),
  });

  if (!profile) return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  );

  const isWorker = profile.role === "WORKER";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        {userId && userId !== id && (
          <div className="flex gap-2">
            <button onClick={() => setReportOpen(true)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Reportar">
              <Flag className="w-4 h-4" />
            </button>
            <button onClick={() => block.mutate()} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" title="Bloquear">
              <ShieldOff className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main card */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Avatar src={profile.image} name={profile.name} size="xl" />
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-slate-900 text-xl">{profile.name}</h1>
            <Badge variant={isWorker ? "info" : "purple"} className="mt-1">{isWorker ? "Trabajador" : "Cliente"}</Badge>
            {isWorker && (
              <div className="flex items-center gap-1.5 mt-2">
                <StarRating rating={profile.rating} size="md" />
                <span className="text-sm font-semibold">{profile.rating?.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({profile.reviewCount} reseñas)</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.verified && <VerifiedBadge type="identity" />}
              {profile.phoneVerified && <VerifiedBadge type="phone" />}
              {profile.emailVerified && <VerifiedBadge type="email" />}
            </div>
          </div>
        </div>

        {profile.bio && <p className="text-sm text-slate-600 mt-4 leading-relaxed border-t border-slate-100 pt-4">{profile.bio}</p>}
        {profile.location && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-2"><MapPin className="w-3 h-3" />{profile.location}</p>
        )}

        {userId && userId !== id && (
          <Link href={`/messages/${id}`} className="mt-4 block">
            <Button variant="outline" className="w-full"><MessageSquare className="w-4 h-4" /> Enviar Mensaje</Button>
          </Link>
        )}
      </Card>

      {/* Stats — worker */}
      {isWorker && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Trabajos", value: profile.jobsCompleted, icon: Briefcase },
            { label: "Éxito", value: `${profile.successRate?.toFixed(0)}%`, icon: Star },
            { label: "Exp.", value: profile.yearsExperience ? `${profile.yearsExperience}a` : "—", icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-3 text-center">
              <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-extrabold text-slate-900">{value}</p>
              <p className="text-[10px] text-slate-400">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Skills */}
      {isWorker && (profile.skills?.length > 0 || profile.specialties?.length > 0) && (
        <Card className="p-4">
          <h2 className="font-bold text-slate-900 mb-3">Habilidades</h2>
          {profile.skills?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Habilidades</p>
              <SkillTags skills={profile.skills} onChange={() => {}} readOnly />
            </div>
          )}
          {profile.specialties?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Especialidades</p>
              <SkillTags skills={profile.specialties} onChange={() => {}} readOnly />
            </div>
          )}
        </Card>
      )}

      {/* Portfolio */}
      {isWorker && profile.portfolio?.length > 0 && (
        <Card className="p-4">
          <h2 className="font-bold text-slate-900 mb-3">Portafolio</h2>
          <div className="grid grid-cols-3 gap-2">
            {profile.portfolio.map((url: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reviews */}
      {profile.receivedReviews?.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-900 mb-3">Reseñas ({profile.reviewCount})</h2>
          <div className="space-y-3">
            {profile.receivedReviews.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={r.reviewer.image} name={r.reviewer.name} size="xs" />
                  <span className="text-sm font-semibold">{r.reviewer.name}</span>
                  <StarRating rating={r.rating} className="ml-auto" />
                </div>
                <p className="text-sm text-slate-600">{r.comment}</p>
                <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(r.createdAt)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Reportar usuario">
        <div className="space-y-4">
          <Select
            label="Razón del reporte"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            options={REPORT_REASONS}
            placeholder="Selecciona una razón"
          />
          <Textarea label="Detalles adicionales" value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Describe lo que ocurrió…" rows={3} />
          <Button onClick={() => report.mutate()} loading={report.isPending} disabled={!reportReason} className="w-full" variant="danger">
            Enviar reporte
          </Button>
        </div>
      </Modal>
    </div>
  );
}
