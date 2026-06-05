import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const pixelMap = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (src) {
    return (
      <div className={cn("rounded-full overflow-hidden flex-shrink-0", sizeMap[size], className)}>
        <Image
          src={src}
          alt={name ?? "Avatar"}
          width={pixelMap[size]}
          height={pixelMap[size]}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 gradient-primary flex items-center justify-center text-white font-bold",
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
