"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Eye, Calendar, FileText, FolderOpen, BookOpen } from "lucide-react";

interface ContentSummary {
  count: number;
  files: { name: string; modified: number }[];
}

interface WikiPage {
  folder: string;
  name: string;
  modtime: number;
}

interface VaultData {
  content: Record<string, ContentSummary>;
  wiki: WikiPage[];
}

const folderColors: Record<string, string> = {
  Drafts: "bg-yellow-500",
  Approved: "bg-blue-500",
  Published: "bg-green-500",
};

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ContentPage() {
  const [data, setData] = useState<VaultData | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Memuat…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <span className="text-sm text-muted-foreground">Sumber: vault Obsidian</span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data &&
          Object.entries(data.content).map(([folder, info]) => (
            <Card key={folder}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {folder}
                </CardTitle>
                <span className={`h-2.5 w-2.5 rounded-full ${folderColors[folder] || "bg-gray-400"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{info.count}</div>
                <div className="text-xs text-muted-foreground mt-1">file markdown</div>
                <button
                  onClick={() => setExpanded(expanded === folder ? null : folder)}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  {expanded === folder ? "Tutup" : "Lihat file"}
                </button>
                {expanded === folder && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {info.files.length === 0 && (
                      <div className="text-xs text-muted-foreground">Kosong</div>
                    )}
                    {info.files.map((f) => (
                      <div key={f.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 truncate">
                          <FileText className="h-3 w-3 shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </span>
                        <span className="text-muted-foreground ml-2 shrink-0">{formatDate(f.modified)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            LLM Wiki Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.wiki.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada halaman wiki.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.wiki.map((p) => (
                <div key={`${p.folder}/${p.name}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{p.folder}</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">{formatDate(p.modtime)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}