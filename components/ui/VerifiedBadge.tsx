import { BadgeCheck, ShieldCheck, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  type?: "identity" | "phone" | "email";
  size?: "sm" | "md";
  className?: string;
}

export default function VerifiedBadge({ type = "identity", size = "sm", className }: VerifiedBadgeProps) {
  const configs = {
    identity: { icon: BadgeCheck, label: "Verificado", color: "text-blue-600 bg-blue-50" },
    phone: { icon: Phone, label: "Teléfono verificado", color: "text-emerald-600 bg-emerald-50" },
    email: { icon: Mail, label: "Email verificado", color: "text-violet-600 bg-violet-50" },
  };
  const { icon: Icon, label, color } = configs[type];
  const sz = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold rounded-full", color, sz, className)}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {label}
    </span>
  );
}
