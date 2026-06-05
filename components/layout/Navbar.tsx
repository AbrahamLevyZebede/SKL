"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, X, LogOut, User, Settings, Shield } from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import SKLLogo from "@/components/ui/SKLLogo";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  const { data: notifs = [] } = useQuery<any[]>({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    enabled: !!userId,
    refetchInterval: 30000,
  });
  const unread = notifs.filter((n: any) => !n.read).length;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <SKLLogo size="sm" showText={true} />
        </Link>

        <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link href="/tasks" className="px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">Explorar</Link>
          {session && role === "CLIENT" && (
            <Link href="/tasks/create" className="px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">Publicar</Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/notifications" className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                  {menuOpen ? <X className="w-4 h-4 text-slate-500" /> : <Menu className="w-4 h-4 text-slate-500" />}
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="font-bold text-slate-900 text-sm truncate">{session.user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{role}</span>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700" onClick={() => setMenuOpen(false)}>
                        <User className="w-4 h-4 text-slate-400" /> Dashboard
                      </Link>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700" onClick={() => setMenuOpen(false)}>
                        <Settings className="w-4 h-4 text-slate-400" /> Mi Perfil
                      </Link>
                      {role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-violet-700" onClick={() => setMenuOpen(false)}>
                          <Shield className="w-4 h-4 text-violet-400" /> Admin
                        </Link>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600">
                          <LogOut className="w-4 h-4" /> Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 hidden sm:block">
                Iniciar Sesión
              </Link>
              <Link href="/signup" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm">
                Comenzar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
