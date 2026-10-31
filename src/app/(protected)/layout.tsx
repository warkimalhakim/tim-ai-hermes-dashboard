import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";
import { getUserBySession, SESSION_COOKIE } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const user = getUserBySession(store.get(SESSION_COOKIE)?.value);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar user={user ? { name: user.name, username: user.username, role: user.role } : null} />
      <main className="relative flex-1 min-w-0 px-3 sm:px-6 md:px-10 lg:px-12 pt-1 pb-6 md:py-8 page-enter">
        <div className="pb-safe">{children}</div>
      </main>
    </div>
  );
}
