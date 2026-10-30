"use client";

import { useState } from "react";
import Link from "next/link";
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

  return (
    <>
      <header className="md:hidden flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-4 py-3 bg-[var(--surface-1)] glass backdrop-blur-md">
        <Link href="/" className="text-xl font-bold tracking-tight text-[var(--foreground)]">Tim AI</Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-[var(--surface-2)] transition-colors" aria-label="Toggle menu">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <aside className={`fixed left-0 top-[3.5rem] md:top-0 h-[calc(100vh-3.5rem)] md:h-screen w-64 glass backdrop-blur-md z-30 transition-transform duration-300 ease-[var(--ease)] ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative`}>
        <nav className="space-y-0.5 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-2)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all duration-150"
            >
              <item.icon className="h-4 w-4 shrink-0 text-[var(--text-3)]" />
              <span className="tracking-tight">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 text-[10px] text-[var(--text-4)] font-mono tracking-tighter">
          Mission Control · v1.0 · persistent
        </div>
      </aside>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden" />
      )}
    </>
  );
}
