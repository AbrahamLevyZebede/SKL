"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DollarSign, Clock, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Bid } from "@/types";
import { formatCurrency, formatRelativeTime, getCategoryIcon } from "@/lib/utils";

const FILTERS = ["ALL", "PENDING", "ACCEPTED", "REJECTED"];

export default function MyBidsPage() {
  const [filter, setFilter] = useState("ALL");

  const { data: bids = [], isLoading } = useQuery<Bid[]>({
    queryKey: ["my-bids"],
    queryFn: () => fetch("/api/bids").then((r) => r.json()),
  });

  const filtered = filter === "ALL" ? bids : bids.filter((b) => b.status === filter);
  const statusVariant: Record<string, any> = { PENDING: "warning", ACCEPTED: "success", REJECTED: "danger" };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">My Bids</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((n) => <div key={n} className="bg-white rounded-2xl h-24 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 text-sm">No bids found.</p>
          <Link href="/tasks" className="text-blue-600 text-sm font-medium mt-2 inline-block">Browse tasks →</Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((bid) => (
            <Link key={bid.id} href={`/tasks/${bid.taskId}`}>
              <Card hover className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-card flex items-center justify-center text-xl flex-shrink-0">
                    {getCategoryIcon(bid.task?.category ?? "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900 text-sm line-clamp-1">{bid.task?.title}</p>
                      <Badge variant={statusVariant[bid.status]}>{bid.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{bid.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-sm font-bold text-blue-600">
                        <DollarSign className="w-3.5 h-3.5" />{formatCurrency(bid.amount)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />{bid.estimatedDuration}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">{formatRelativeTime(bid.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
