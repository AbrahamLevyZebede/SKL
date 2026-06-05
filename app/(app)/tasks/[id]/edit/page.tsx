"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, DollarSign, Calendar, FileText, Zap } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import ImageUpload from "@/components/ui/ImageUpload";
import LocationPicker from "@/components/ui/LocationPicker";
import { CATEGORIES } from "@/lib/utils";
import { Task } from "@/types";

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", category: "", budget: "", deadline: "", urgent: false });
  const [photos, setPhotos] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: () => fetch(`/api/tasks/${id}`).then((r) => r.json()),
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        category: task.category,
        budget: String(task.budget),
        deadline: task.deadline ? task.deadline.split("T")[0] : "",
        urgent: task.urgent,
      });
      setPhotos(task.photos ?? []);
      setProvince(task.province ?? "");
      setDistrict(task.district ?? "");
    }
  }, [task]);

  const save = useMutation({
    mutationFn: () =>
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: parseFloat(form.budget),
          photos,
          province,
          district,
          location: [district, province].filter(Boolean).join(", ") || "Panamá",
        }),
      }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); }),
    onSuccess: () => { toast.success("Tarea actualizada"); router.push(`/tasks/${id}`); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="max-w-lg mx-auto px-4 py-8"><div className="h-48 bg-slate-100 rounded-2xl animate-pulse" /></div>;

  function set(k: string, v: any) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link href={`/tasks/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Editar Tarea</h1>
      </div>
      <Card className="p-5 space-y-5">
        <Input label="Título *" value={form.title} onChange={(e) => set("title", e.target.value)} icon={<FileText className="w-4 h-4" />} />
        <Textarea label="Descripción *" value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
        <Select label="Categoría" value={form.category} onChange={(e) => set("category", e.target.value)} options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))} />
        <LocationPicker province={province} district={district} onProvinceChange={setProvince} onDistrictChange={setDistrict} />
        <Input label="Presupuesto (USD)" type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} icon={<DollarSign className="w-4 h-4" />} />
        <Input label="Fecha límite" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} icon={<Calendar className="w-4 h-4" />} />
        <ImageUpload images={photos} onChange={setPhotos} max={5} label="Fotos" />
        <button
          type="button"
          onClick={() => set("urgent", !form.urgent)}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${form.urgent ? "border-amber-400 bg-amber-50" : "border-slate-200"}`}
        >
          <Zap className={`w-4 h-4 ${form.urgent ? "text-amber-600" : "text-slate-400"}`} />
          <span className={`text-sm font-bold ${form.urgent ? "text-amber-700" : "text-slate-600"}`}>Tarea urgente</span>
          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.urgent ? "bg-amber-500 border-amber-500" : "border-slate-300"}`}>
            {form.urgent && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </button>
        <Button onClick={() => save.mutate()} loading={save.isPending} className="w-full" size="lg">Guardar cambios</Button>
      </Card>
    </div>
  );
}
