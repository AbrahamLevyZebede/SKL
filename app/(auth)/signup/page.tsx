"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Briefcase, Users } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SKLLogo from "@/components/ui/SKLLogo";
import LocationPicker from "@/components/ui/LocationPicker";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"CLIENT" | "WORKER">("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, province, district }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al registrarse");
      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3"><SKLLogo size="lg" showText={false} /></div>
          <h1 className="text-2xl font-extrabold text-slate-900">Únete a SKL</h1>
          <p className="text-slate-500 text-sm mt-1">Paso {step} de 2</p>
          <div className="flex gap-1 justify-center mt-2">
            {[1, 2].map((n) => (
              <div key={n} className={`h-1 w-10 rounded-full transition-colors ${n <= step ? "bg-blue-600" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {step === 1 ? (
            <>
              <h2 className="font-bold text-slate-900 mb-1 text-lg">¿Qué quieres hacer?</h2>
              <p className="text-sm text-slate-500 mb-4">Elige tu rol para comenzar</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { value: "CLIENT", label: "Contratar", icon: Users, desc: "Publica tareas y encuentra ayuda" },
                  { value: "WORKER", label: "Trabajar", icon: Briefcase, desc: "Ofrece tus servicios y gana" },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <Icon className={`w-7 h-7 ${role === value ? "text-blue-600" : "text-slate-400"}`} />
                    <div className="text-center">
                      <p className={`text-sm font-bold ${role === value ? "text-blue-700" : "text-slate-700"}`}>{label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">Continuar</Button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nombre completo" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez" icon={<User className="w-4 h-4" />} required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" icon={<Mail className="w-4 h-4" />} required />
              <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" icon={<Lock className="w-4 h-4" />} minLength={8} required />
              <LocationPicker
                province={province} district={district}
                onProvinceChange={setProvince} onDistrictChange={setDistrict}
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">Crear Cuenta</Button>
              <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-full">Atrás</Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
