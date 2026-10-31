"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Kanban, FileText, Settings, Menu, X, LogOut, User as UserIcon,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Kanban", href: "/kanban", icon: Kanban },
  { name: "Content", href: "/content", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export interface SidebarUser {
  name: string;
  username: string;
  role: string;
}

export default function Sidebar({ user }: { user: SidebarUser | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const initials = (user?.name || user?.username || "?").slice(0, 1).toUpperCase();

  return (
    <>
      {/* ===== MOBILE / TABLET: sticky topbar pill ===== */}
      <div className="md:hidden sticky top-0 z-40 px-3 pt-3 pb-2 bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="glass rounded-full border border-[rgba(255,255,255,0.1)] px-4 py-2.5 flex items-center justify-between shadow-lg">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
            <span className="text-base font-semibold tracking-tight truncate">Tim AI</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 -mr-1 rounded-full hover:bg-[var(--surface-2)] active:scale-95 transition-all"
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* dropdown menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-[var(--ease)] ${
            isOpen ? "max-h-[32rem] opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="glass rounded-2xl border border-[rgba(255,255,255,0.1)] p-2 space-y-1 shadow-xl">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                      : "text-[#a0a3a8] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="tracking-tight">{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-[rgba(255,255,255,0.08)]">
              {user && (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-7 w-7 rounded-full bg-[var(--surface-2)] border border-[rgba(255,255,255,0.12)] text-xs font-semibold flex items-center justify-center shrink-0">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">{user.name}</span>
                    <span className="block text-[11px] text-[#6b6e73] truncate">@{user.username}</span>
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#a0a3a8] hover:text-[var(--down)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {loggingOut ? "Keluar…" : "Logout"}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* ===== DESKTOP: sidebar kiri ===== */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 glass border-r border-[rgba(255,255,255,0.08)] z-30">
        <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span className="text-lg font-semibold tracking-tight">Tim AI</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                    : "text-[#a0a3a8] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[rgba(255,255,255,0.06)] p-3">
          {user ? (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <span className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[rgba(255,255,255,0.12)] text-xs font-semibold flex items-center justify-center shrink-0">
                {initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium truncate">{user.name}</span>
                <span className="block text-[11px] text-[#6b6e73] truncate">@{user.username} · {user.role}</span>
              </span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="p-1.5 rounded-lg text-[#a0a3a8] hover:text-[var(--down)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-50"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-[#a0a3a8] hover:text-[var(--foreground)]">
              <UserIcon className="h-4 w-4" /> Login
            </Link>
          )}
          <div className="mt-2 px-2 text-[10px] text-[#6b6e73] font-mono tracking-tighter">
            Mission Control · v1.0 · persistent
          </div>
        </div>
      </aside>
    </>
  );
}
