import Link from "next/link";
import { ArrowRight, Star, Shield, Zap, Users, CheckCircle, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import SKLLogo from "@/components/ui/SKLLogo";

const categories = [
  { icon: "🔨", label: "Reparaciones" },
  { icon: "🧹", label: "Limpieza" },
  { icon: "📦", label: "Mudanzas" },
  { icon: "🎨", label: "Pintura" },
  { icon: "🔧", label: "Plomería" },
  { icon: "⚡", label: "Electricidad" },
  { icon: "🪑", label: "Muebles" },
  { icon: "🌿", label: "Jardín" },
  { icon: "🚗", label: "Autos" },
  { icon: "💼", label: "Otros" },
];

const areas = [
  "Panamá City", "San Miguelito", "Costa del Este", "Punta Pacífica",
  "Obarrio", "El Cangrejo", "Arraiján", "La Chorrera", "Colón", "David", "Santiago", "Chitré",
];

const stats = [
  { value: "100%", label: "Panamá" },
  { value: "USD", label: "Moneda oficial" },
  { value: "4.9★", label: "Calificación promedio" },
  { value: "24h", label: "Primera oferta" },
];

const steps = [
  { n: "1", title: "Publica tu tarea", desc: "Describe lo que necesitas, fija tu presupuesto y sube fotos." },
  { n: "2", title: "Recibe ofertas", desc: "Trabajadores locales verificados te envían sus mejores precios." },
  { n: "3", title: "Elige al mejor", desc: "Compara perfiles, calificaciones y precios con confianza." },
  { n: "4", title: "Paga seguro", desc: "Tu dinero en custodia. Se libera solo cuando estés satisfecho." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
            <MapPin className="w-3.5 h-3.5" /> Solo en Panamá · 100% en USD
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Tu tarea, tu precio.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Tu trabajador local.
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Publica cualquier trabajo, recibe ofertas competitivas de trabajadores verificados en Panamá
            y contrata con total confianza.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-2xl transition-colors shadow-lg shadow-blue-200 text-base">
              Publicar una Tarea <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/tasks" className="flex items-center gap-2 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-bold px-7 py-3.5 rounded-2xl transition-colors text-base">
              Encontrar Trabajo
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="py-10 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-5">Cobertura en todo Panamá</p>
          <div className="flex flex-wrap justify-center gap-2">
            {areas.map((a) => (
              <span key={a} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <MapPin className="w-3 h-3 text-blue-400" /> {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">¿Qué necesitas?</h2>
          <p className="text-slate-500 text-sm text-center mb-8">Todas las categorías, un solo lugar</p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {categories.map((c) => (
              <Link key={c.label} href={`/tasks`} className="flex flex-col items-center gap-2 p-3 bg-slate-50 hover:bg-blue-50 rounded-2xl hover:border-blue-100 border border-slate-100 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">¿Cómo funciona?</h2>
          <p className="text-slate-500 text-center text-sm mb-10">Cuatro pasos simples</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="gradient-primary w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md shadow-blue-200">
                  {s.n}
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gradient-to-br from-blue-600 to-violet-700 py-14">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">¿Por qué confiar en SKL?</h2>
          <p className="text-white/70 text-sm mb-8">Construido para el mercado panameño</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "Pagos Seguros", desc: "Sistema de custodia — pagas solo cuando estés satisfecho." },
              { icon: Star, title: "Reseñas Verificadas", desc: "Calificaciones reales de trabajos completados." },
              { icon: Users, title: "Trabajadores Verificados", desc: "Perfiles revisados con badge de verificación." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 rounded-2xl p-6 backdrop-blur border border-white/10">
                <Icon className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm opacity-80">{desc}</p>
              </div>
            ))}
          </div>
          <Link href="/signup" className="inline-flex items-center gap-2 mt-10 bg-white text-blue-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg">
            Empieza Gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SKLLogo size="sm" />
          <p className="text-xs text-slate-400">© 2026 SKL — El mercado de servicios de Panamá</p>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="#" className="hover:text-slate-600">Privacidad</Link>
            <Link href="#" className="hover:text-slate-600">Términos</Link>
            <Link href="#" className="hover:text-slate-600">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
