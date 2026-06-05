"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Task } from "@/types";

const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function MyTasksPage() {
  const [filter, setFilter] = useState("ALL");

  const { data } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => fetch("/api/tasks/mine").then((r) => r.json()),
  });

  const allTasks: Task[] = data?.tasks ?? [];
  const tasks = filter === "ALL" ? allTasks : allTasks.filter((t) => t.status === filter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-900">My Tasks</h1>
        <Link href="/tasks/create"><Button size="sm"><PlusCircle className="w-4 h-4" /> Post New</Button></Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 text-sm mb-4">No tasks here yet.</p>
          <Link href="/tasks/create"><Button>Post a Task</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => <TaskCard key={t.id} task={t} showClient={false} />)}
        </div>
      )}
    </div>
  );
}
