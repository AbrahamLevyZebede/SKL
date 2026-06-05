"use client";
import { Clock, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import { Bid } from "@/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface BidCardProps {
  bid: Bid;
  isOwner?: boolean;
  taskStatus?: string;
  onAccept?: (bidId: string) => void;
  onReject?: (bidId: string) => void;
  accepting?: boolean;
}

export default function BidCard({ bid, isOwner, taskStatus, onAccept, onReject, accepting }: BidCardProps) {
  const statusVariant: Record<string, any> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "danger",
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar src={bid.worker?.image} name={bid.worker?.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{bid.worker?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating rating={bid.worker?.rating ?? 0} />
                <span className="text-xs text-slate-500">
                  {bid.worker?.rating?.toFixed(1)} ({bid.worker?.reviewCount} reviews)
                </span>
              </div>
            </div>
            <Badge variant={statusVariant[bid.status]}>{bid.status}</Badge>
          </div>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{bid.message}</p>

          <div className="flex items-center gap-4 mt-2.5">
            <span className="flex items-center gap-1 text-sm font-bold text-blue-600">
              <DollarSign className="w-4 h-4" /> {formatCurrency(bid.amount)}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" /> {bid.estimatedDuration}
            </span>
            <span className="text-xs text-slate-400 ml-auto">{formatRelativeTime(bid.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500">
            <span>{bid.worker?.jobsCompleted} jobs completed</span>
          </div>

          {isOwner && bid.status === "PENDING" && taskStatus === "OPEN" && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              <Button
                size="sm"
                onClick={() => onAccept?.(bid.id)}
                loading={accepting}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Bid
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject?.(bid.id)}
                className="px-3"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
