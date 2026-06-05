"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, MapPin, Phone, Edit2, Save, X, Star, Briefcase, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import SkillTags from "@/components/ui/SkillTags";
import ImageUpload from "@/components/ui/ImageUpload";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import LocationPicker from "@/components/ui/LocationPicker";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const userId = (session?.user as any)?.id;
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
    enabled: !!userId,
  });

  const [form, setForm] = useState<any>({});

  function startEdit() {
    setForm({
      name: profile?.name ?? "",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      image: profile?.image ?? "",
      province: profile?.province ?? "",
      district: profile?.district ?? "",
      skills: profile?.skills ?? [],
      specialties: profile?.specialties ?? [],
      yearsExperience: profile?.yearsExperience ?? "",
      portfolio: profile?.portfolio ?? [],
    });
    setEditing(true);
  }

  const save = useMutation({
    mutationFn: () =>
      fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : null,
        }),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast.success("Perfil actualizado");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      update();
    },
    onError: () => toast.error("Error al guardar"),
  });

  if (!profile) return <div className="max-w-lg mx-auto px-4 py-8"><div className="h-48 bg-slate-100 rounded-2xl animate-pulse" /></div>;

  const isWorker = profile.role === "WORKER";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header card */}
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-extrabold text-slate-900 text-xl leading-tight">{profile.name}</h1>
                <Badge variant={isWorker ? "info" : "purple"} className="mt-1">{isWorker ? "Trabajador" : "Cliente"}</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={editing ? () => setEditing(false) : startEdit}>
                {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </Button>
            </div>

            {isWorker && (
              <div className="flex items-center gap-1.5 mt-2">
                <StarRating rating={profile.rating} size="md" />
                <span className="text-sm font-semibold text-slate-700">{profile.rating?.toFixed(1)}</span>
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

        {!editing && (
          <>
            {profile.bio && <p className="text-sm text-slate-600 mt-4 leading-relaxed border-t border-slate-100 pt-4">{profile.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
              {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
              {profile.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.phone}</span>}
            </div>
          </>
        )}
      </Card>

      {/* Stats row — worker only */}
      {isWorker && !editing && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Trabajos", value: profile.jobsCompleted, icon: Briefcase },
            { label: "Éxito", value: `${profile.successRate?.toFixed(0)}%`, icon: Star },
            { label: "Años exp.", value: profile.yearsExperience ?? "—", icon: User },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-3 text-center">
              <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-extrabold text-slate-900">{value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-slate-900">Editar perfil</h2>
          <ImageUpload images={form.image ? [form.image] : []} onChange={(imgs) => setForm((f: any) => ({ ...f, image: imgs[0] ?? "" }))} max={1} label="Foto de perfil" />
          <Input label="Nombre" value={form.name} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} icon={<User className="w-4 h-4" />} />
          <Textarea label="Bio" value={form.bio} onChange={(e) => setForm((f: any) => ({ ...f, bio: e.target.value }))} placeholder="Cuéntanos sobre ti y tu experiencia…" rows={3} />
          <Input label="Teléfono" value={form.phone} onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))} icon={<Phone className="w-4 h-4" />} />
          <LocationPicker
            province={form.province} district={form.district}
            onProvinceChange={(v) => setForm((f: any) => ({ ...f, province: v }))}
            onDistrictChange={(v) => setForm((f: any) => ({ ...f, district: v }))}
          />
          {isWorker && (
            <>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Habilidades</p>
                <SkillTags skills={form.skills} onChange={(s) => setForm((f: any) => ({ ...f, skills: s }))} placeholder="Agrega una habilidad…" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Especialidades</p>
                <SkillTags skills={form.specialties} onChange={(s) => setForm((f: any) => ({ ...f, specialties: s }))} placeholder="Agrega una especialidad…" />
              </div>
              <Input label="Años de experiencia" type="number" value={form.yearsExperience} onChange={(e) => setForm((f: any) => ({ ...f, yearsExperience: e.target.value }))} min="0" />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Portafolio (fotos de trabajos)</p>
                <ImageUpload images={form.portfolio} onChange={(imgs) => setForm((f: any) => ({ ...f, portfolio: imgs }))} max={8} label="" />
              </div>
            </>
          )}
          <div className="flex gap-2 pt-1">
            <Button onClick={() => save.mutate()} loading={save.isPending} className="flex-1"><Save className="w-4 h-4" /> Guardar</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Skills display */}
      {isWorker && !editing && (profile.skills?.length > 0 || profile.specialties?.length > 0) && (
        <Card className="p-4">
          <h2 className="font-bold text-slate-900 mb-3">Habilidades</h2>
          {profile.skills?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-slate-400 font-semibold mb-1.5">HABILIDADES</p>
              <SkillTags skills={profile.skills} onChange={() => {}} readOnly />
            </div>
          )}
          {profile.specialties?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1.5">ESPECIALIDADES</p>
              <SkillTags skills={profile.specialties} onChange={() => {}} readOnly />
            </div>
          )}
        </Card>
      )}

      {/* Portfolio */}
      {isWorker && !editing && profile.portfolio?.length > 0 && (
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
                  <span className="text-sm font-semibold text-slate-800">{r.reviewer.name}</span>
                  <StarRating rating={r.rating} className="ml-auto" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                <p className="text-xs text-slate-400 mt-1.5">{formatRelativeTime(r.createdAt)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
