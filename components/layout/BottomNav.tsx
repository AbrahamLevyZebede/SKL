"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  if (!session) return null;

  const role = (session.user as any)?.role;

  const links = role === "WORKER"
    ? [
        { href: "/dashboard", icon: Home, label: "Inicio" },
        { href: "/tasks", icon: Search, label: "Explorar" },
        { href: "/bids", icon: PlusCircle, label: "Mis Ofertas" },
        { href: "/messages", icon: MessageSquare, label: "Chat" },
        { href: "/profile", icon: User, label: "Perfil" },
      ]
    : [
        { href: "/dashboard", icon: Home, label: "Inicio" },
        { href: "/tasks/create", icon: PlusCircle, label: "Publicar" },
        { href: "/tasks/mine", icon: Search, label: "Mis Tareas" },
        { href: "/messages", icon: MessageSquare, label: "Chat" },
        { href: "/profile", icon: User, label: "Perfil" },
      ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-100 safe-bottom sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/tasks" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[52px]",
                active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "stroke-[2.5px]")} />
              <span className="text-[9px] font-semibold leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
