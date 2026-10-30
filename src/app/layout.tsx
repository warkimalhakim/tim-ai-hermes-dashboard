import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tim AI Dashboard",
  description: "AI Team Mission Control Dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="relative flex-1 overflow-auto pt-14 md:pt-0 px-4 sm:px-6 md:px-10 lg:px-12 py-4 md:py-8 page-enter">
            <div className="pb-safe">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
