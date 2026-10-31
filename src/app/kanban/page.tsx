"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PlusCircle, MoreHorizontal } from "lucide-react";

interface KanbanTask {
  id: string;
  title: string;
  body: string | null;
  assignee: string | null;
  status: string;
  priority: number;
  created_at: number;
}

interface Column {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

const statusColors: Record<string, string> = {
  triage: "bg-gray-400",
  todo: "bg-blue-400",
  ready: "bg-sky-400",
  running: "bg-yellow-400",
  review: "bg-purple-400",
  scheduled: "bg-cyan-400",
  blocked: "bg-red-500",
  done: "bg-emerald-500",
  archived: "bg-gray-600",
};

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("tim-copywritter");
  const [creating, setCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);

  async function loadBoard() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/kanban/board");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal load board");
      setColumns(data.columns || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/kanban/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), assignee: newAssignee }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal buat task");
      }
      setNewTitle("");
      setShowNew(false);
      await loadBoard();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, []);

  return (
    <>
    <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <PlusCircle className="h-4 w-4 inline mr-2" />
          New Task
        </button>
      </div>

      {showNew && (
        <form onSubmit={createTask} className="mb-6 p-4 rounded-xl border bg-card flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Judul task…"
            className="flex-1 rounded-md border p-2 text-sm bg-background"
          />
          <select
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="rounded-md border p-2 text-sm bg-background"
          >
            <option value="tim-copywritter">tim-copywritter</option>
            <option value="tim-qa">tim-qa</option>
            <option value="tim-poster-wp">tim-poster-wp</option>
            <option value="manager">manager</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {creating ? "Membuat…" : "Buat"}
          </button>
          <button
            type="button"
            onClick={() => setShowNew(false)}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Batal
          </button>
        </form>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Memuat…</div>
      ) : (
        <div className="flex-1 overflow-y-auto md:overflow-x-auto">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:h-full md:min-w-[800px]">
            {columns.map((col) => (
              <div key={col.id} className="flex-1 bg-card rounded-xl p-4 flex flex-col border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusColors[col.id] || "bg-gray-400"}`} />
                    {col.title}
                  </h2>
                  <span className="text-xs text-muted-foreground">{col.tasks.length}</span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {col.tasks.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">Kosong</div>
                  )}
                  {col.tasks.map((task) => (
                    <Card key={task.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedTask(task)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-sm mb-1 line-clamp-2">{task.title}</div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              {task.assignee && <div>@{task.assignee}</div>}
                              <div>{formatDate(task.created_at)}</div>
                            </div>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Detail View Modal */}
    {selectedTask && (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="glass w-full max-w-lg rounded-2xl mx-4 mb-4 md:mb-0 md:mx-0 p-6 relative shadow-2xl border border-[rgba(255,255,255,0.12)]">
          <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors" aria-label="Tutup">✕</button>
          <h2 className="text-xl font-bold mb-1">{selectedTask.title}</h2>
          <div className="text-xs text-muted-foreground mb-4">ID: {selectedTask.id}</div>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Assignee:</span> <span className="font-medium">{selectedTask.assignee || "—"}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="font-medium capitalize">{selectedTask.status}</span></div>
            <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium">{selectedTask.priority}</span></div>
            <div><span className="text-muted-foreground">Created:</span> {formatDate(selectedTask.created_at)}</div>
            {selectedTask.body && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
                <span className="text-muted-foreground">Body:</span>
                <p className="mt-1 text-foreground/90 whitespace-pre-wrap">{selectedTask.body}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}