"use client";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Zap, X } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { CATEGORIES } from "@/lib/utils";
import { PANAMA_PROVINCES } from "@/lib/panama";
import { Task } from "@/types";

const SORTS = [
  { value: "newest", label: "Más recientes" },
  { value: "budget_desc", label: "Mayor presupuesto" },
  { value: "budget_asc", label: "Menor presupuesto" },
  { value: "deadline", label: "Fecha límite" },
];

export default function BrowseTasksPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [sort, setSort] = useState("newest");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debounce = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((globalThis as any).__st);
    (globalThis as any).__st = setTimeout(() => setDebouncedSearch(val), 400);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", debouncedSearch, category, province, sort, urgentOnly],
    queryFn: () => {
      const p = new URLSearchParams({ status: "OPEN", sort });
      if (debouncedSearch) p.set("search", debouncedSearch);
      if (category) p.set("category", category);
      if (province) p.set("province", province);
      if (urgentOnly) p.set("urgent", "true");
      return fetch(`/api/tasks?${p}`).then((r) => r.json());
    },
  });

  const tasks: Task[] = data?.tasks ?? [];
  const hasFilters = category || province || urgentOnly;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Explorar Tareas</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors ${showFilters || hasFilters ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros {hasFilters ? `(${[category, province, urgentOnly].filter(Boolean).length})` : ""}
        </button>
      </div>

      <Input
        placeholder="Buscar tareas…"
        value={search}
        onChange={(e) => debounce(e.target.value)}
        icon={<Search className="w-4 h-4" />}
        className="mb-3"
      />

      {/* Filter panel */}
      {showFilters && (
        <Card className="p-4 mb-4 space-y-4">
          {/* Categories */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Categoría</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(category === c.value ? "" : c.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${category === c.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Province */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Provincia</p>
            <div className="flex flex-wrap gap-2">
              {PANAMA_PROVINCES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProvince(province === p.value ? "" : p.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${province === p.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort + Urgent */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${urgentOnly ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
            >
              <Zap className="w-3.5 h-3.5" /> Solo urgentes
            </button>
            {hasFilters && (
              <button
                onClick={() => { setCategory(""); setProvince(""); setUrgentOnly(false); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Category quick scroll */}
      {!showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setCategory("")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${!category ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >Todos</button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(category === c.value ? "" : c.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${category === c.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 font-medium">{data?.total ?? 0} tareas disponibles</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((n) => <div key={n} className="bg-white rounded-2xl border border-slate-100 p-4 h-28 animate-pulse" />)}</div>
      ) : tasks.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 text-sm">No se encontraron tareas. Intenta con otros filtros.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}
