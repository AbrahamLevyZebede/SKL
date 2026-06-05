"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DollarSign, Calendar, FileText, ChevronLeft, Zap, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import ImageUpload from "@/components/ui/ImageUpload";
import LocationPicker from "@/components/ui/LocationPicker";
import { CATEGORIES } from "@/lib/utils";

export default function CreateTaskPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "", budget: "", deadline: "", urgent: false,
  });

  function set(key: string, val: any) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function buildLocation() {
    const parts = [area, district, province].filter(Boolean);
    return parts.length ? parts.join(", ") : "Panamá";
  }

  async function submit(isDraft = false) {
    if (!session?.user) { toast.error("Inicia sesión para publicar"); return; }
    if (!isDraft && (!form.title || !form.description || !form.category || !province)) {
      toast.error("Completa los campos requeridos");
      return;
    }
    isDraft ? setSavingDraft(true) : setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: parseFloat(form.budget) || 0,
          photos,
          province,
          district,
          location: buildLocation(),
          isDraft,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const task = await res.json();
      toast.success(isDraft ? "Borrador guardado" : "¡Tarea publicada!");
      router.push(isDraft ? "/tasks/mine" : `/tasks/${task.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Error al publicar");
    } finally {
      setLoading(false);
      setSavingDraft(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Publicar Tarea</h1>
        <p className="text-sm text-slate-500 mt-1">Cuéntanos qué necesitas y recibe ofertas</p>
      </div>

      <Card className="p-5 space-y-5">
        <Input
          label="Título de la tarea *"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="ej. Reparar llave del baño"
          icon={<FileText className="w-4 h-4" />}
        />

        <Textarea
          label="Descripción *"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe el trabajo con detalle: qué necesitas, condiciones, herramientas disponibles…"
          rows={4}
        />

        <Select
          label="Categoría *"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
          placeholder="Selecciona una categoría"
        />

        <LocationPicker
          province={province} district={district} area={area}
          onProvinceChange={setProvince}
          onDistrictChange={setDistrict}
          onAreaChange={setArea}
          required
        />

        <Input
          label="Presupuesto (USD) *"
          type="number"
          value={form.budget}
          onChange={(e) => set("budget", e.target.value)}
          placeholder="ej. 150"
          icon={<DollarSign className="w-4 h-4" />}
          min="1"
        />

        <Input
          label="Fecha límite (opcional)"
          type="date"
          value={form.deadline}
          onChange={(e) => set("deadline", e.target.value)}
          icon={<Calendar className="w-4 h-4" />}
        />

        <ImageUpload
          images={photos}
          onChange={setPhotos}
          max={5}
          label="Fotos del trabajo (opcional)"
        />

        {/* Urgent toggle */}
        <button
          type="button"
          onClick={() => set("urgent", !form.urgent)}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${form.urgent ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-amber-200"}`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${form.urgent ? "bg-amber-100" : "bg-slate-100"}`}>
            <Zap className={`w-4 h-4 ${form.urgent ? "text-amber-600" : "text-slate-400"}`} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${form.urgent ? "text-amber-700" : "text-slate-700"}`}>Tarea urgente</p>
            <p className="text-xs text-slate-400">Aparece destacada para trabajadores</p>
          </div>
          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.urgent ? "bg-amber-500 border-amber-500" : "border-slate-300"}`}>
            {form.urgent && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </button>

        {/* Preview */}
        {form.title && (
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl p-4 border border-blue-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Vista previa</p>
            <p className="font-bold text-slate-900 text-sm">{form.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {form.budget && <span className="text-blue-700 font-bold text-sm">${form.budget}</span>}
              {form.urgent && <span className="text-amber-600 text-xs font-bold flex items-center gap-0.5"><Zap className="w-3 h-3" />Urgente</span>}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => submit(true)}
            loading={savingDraft}
            size="md"
            className="flex-shrink-0"
          >
            <Save className="w-4 h-4" /> Borrador
          </Button>
          <Button
            type="button"
            onClick={() => submit(false)}
            loading={loading}
            size="lg"
            className="flex-1"
          >
            Publicar Tarea
          </Button>
        </div>
      </Card>
    </div>
  );
}
