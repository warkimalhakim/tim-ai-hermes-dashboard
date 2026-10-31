"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      router.replace(nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-xs font-medium text-[#a0a3a8] mb-1.5">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          className="w-full rounded-lg bg-[var(--surface-2)] border border-[rgba(255,255,255,0.1)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition-colors"
          placeholder="username"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-[#a0a3a8] mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg bg-[var(--surface-2)] border border-[rgba(255,255,255,0.1)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition-colors"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--down)]/30 bg-[var(--down)]/10 px-3 py-2 text-xs text-[var(--down)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--foreground)] text-[var(--background)] font-semibold text-sm px-4 py-2.5 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Masuk…" : "Masuk"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          <span className="text-lg font-semibold tracking-tight">Tim AI</span>
          <span className="text-xs text-[#6b6e73]">Mission Control</span>
        </div>

        <div className="glass rounded-2xl border border-[rgba(255,255,255,0.1)] p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
              <Lock className="h-4 w-4 text-[#a0a3a8]" />
            </span>
            <div>
              <h1 className="text-sm font-semibold">Login</h1>
              <p className="text-xs text-[#6b6e73]">Masuk untuk akses dashboard</p>
            </div>
          </div>

          <Suspense fallback={<div className="text-xs text-[#6b6e73]">Memuat…</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#6b6e73]">
          Belum punya akun? Tambahkan lewat CLI di server.
        </p>
      </div>
    </div>
  );
}
