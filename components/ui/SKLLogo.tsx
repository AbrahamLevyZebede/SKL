import { cn } from "@/lib/utils";

interface SKLLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = { sm: 28, md: 36, lg: 48, xl: 64 };

export default function SKLLogo({ size = "md", showText = true, className }: SKLLogoProps) {
  const px = sizeMap[size];
  const textSize = { sm: "text-base", md: "text-xl", lg: "text-2xl", xl: "text-3xl" }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width={px} height={px} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="url(#sklGrad)" />
        <text x="24" y="32" textAnchor="middle" fill="white" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="16" letterSpacing="-0.5">SKL</text>
        <defs>
          <linearGradient id="sklGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={cn("font-extrabold tracking-tight text-slate-900", textSize)}>SKL</span>
      )}
    </div>
  );
}
