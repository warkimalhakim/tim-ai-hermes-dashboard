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
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main className="relative flex-1 min-w-0 px-3 sm:px-6 md:px-10 lg:px-12 pt-1 pb-6 md:py-8 page-enter">
            <div className="pb-safe">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
