"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";

interface SkillTagsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  max?: number;
  readOnly?: boolean;
}

export default function SkillTags({ skills, onChange, placeholder = "Add skill…", max = 10, readOnly }: SkillTagsProps) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (!v || skills.includes(v) || skills.length >= max) return;
    onChange([...skills, v]);
    setInput("");
  }

  function remove(skill: string) {
    onChange(skills.filter((s) => s !== skill));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {s}
            {!readOnly && (
              <button type="button" onClick={() => remove(s)} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {!readOnly && skills.length < max && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={add} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
