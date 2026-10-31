"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Kanban, FileText, Settings, Menu, X } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Kanban", href: "/kanban", icon: Kanban },
  { name: "Content", href: "/content", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // tutup menu mobile setiap ganti halaman
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
            isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
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

        <div className="p-4 text-[10px] text-[#6b6e73] font-mono tracking-tighter">
          Mission Control · v1.0 · persistent
        </div>
      </aside>
    </>
  );
}
