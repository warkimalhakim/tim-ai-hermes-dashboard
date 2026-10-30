import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const HERMES_HOME = process.env.HERMES_HOME || path.join(process.env.HOME || "", ".hermes");
const PROFILES_DIR = path.join(HERMES_HOME, "profiles");
const KANBAN_DB = path.join(HERMES_HOME, "kanban.db");
const VAULT_ROOT = process.env.OBSIDIAN_VAULT_PATH || "/home/mywarkim/_agent/vault";

export const KANBAN_STATUSES = [
  "triage", "todo", "ready", "running", "review", "scheduled", "blocked", "done", "archived",
];

function sqliteJSON(query: string): any[] {
  try {
    const raw = execSync(
      `sqlite3 -json "${KANBAN_DB}" "${query.replace(/"/g, "'").replace(/\n/g, " ")}"`,
      { encoding: "utf8", timeout: 50000, env: process.env }
    );
    const parsed = JSON.parse(raw.trim() || "[]");
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

// ------------------------- Kanban (sqlite CLI) -------------------------

export interface KanbanTask {
  id: string; title: string; body: string | null; assignee: string | null; status: string;
  priority: number; created_by: string | null; created_at: number; started_at: number | null;
  completed_at: number | null; result: string | null; tenant: string | null;
  max_runtime_seconds: number | null; consecutive_failures: number | null; last_failure_error: string | null;
}

export function getKanbanTasks(): KanbanTask[] {
  const rows = sqliteJSON(
    `SELECT id, title, body, assignee, status, priority, created_by, created_at, started_at, completed_at, result, tenant, max_runtime_seconds FROM tasks ORDER BY created_at DESC`
  );
  return rows.map((r: any) => ({
    id: String(r.id || r.ID || ""),
    title: String(r.title || r.TITLE || ""),
    body: r.body ? String(r.body || r.BODY || "") : null,
    assignee: r.assignee ? String(r.assignee || r.ASSIGNEE || "") : null,
    status: String(r.status || r.STATUS || "todo"),
    priority: Number(r.priority || r.PRIORITY || 0),
    created_by: r.created_by ? String(r.created_by || r.CREATED_BY || "") : null,
    created_at: Number(r.created_at || r.CREATED_AT || 0),
    started_at: r.started_at ? Number(r.started_at || r.STARTED_AT || 0) : null,
    completed_at: r.completed_at ? Number(r.completed_at || r.COMPLETED_AT || 0) : null,
    result: r.result ? String(r.result || r.RESULT || "") : null,
    tenant: r.tenant ? String(r.tenant || r.TENANT || "") : null,
    max_runtime_seconds: r.max_runtime_seconds ? Number(r.max_runtime_seconds || r.MAX_RUNTIME_SECONDS || 0) : null,
    consecutive_failures: r.consecutive_failures ? Number(r.consecutive_failures || r.CONSECUTIVE_FAILURES || 0) : null,
    last_failure_error: r.last_failure_error ? String(r.last_failure_error || r.LAST_FAILURE_ERROR || "") : null,
  }));
}

export function getKanbanStats() {
  const tasks = getKanbanTasks();
  const byStatus: Record<string, number> = {};
  let done = 0;
  const nowSec = Date.now() / 1000;

  for (const t of tasks) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    if (t.status === "done") done++;
  }
  return {
    total: tasks.length,
    done,
    byStatus,
    active: tasks.filter((t) => !["done", "archived", "blocked"].includes(t.status)).length,
    recentActivity: tasks.slice(0, 8).map((t) => ({
      id: t.id, title: t.title, status: t.status, assignee: t.assignee, ageHours: Math.max(0, Math.round((nowSec - t.created_at) / 3600)),
    })),
  };
}

export function getKanbanComments(taskId: string) {
  const rows = sqliteJSON(
    `SELECT id, author, body, created_at FROM task_comments WHERE task_id='${taskId.replace(/'/g, "''")}' ORDER BY created_at DESC`
  );
  return rows.map((r: any) => ({ id: r.id, author: r.author || "system", body: r.body || r.BODY || "", created_at: Number(r.created_at || r.CREATED_AT || 0) }));
}

export function getKanbanRecentEvents(limit = 15) {
  const rows = sqliteJSON(
    `SELECT te.task_id, te.kind, te.payload, te.created_at, t.title FROM task_events te JOIN tasks t ON t.id=te.task_id ORDER BY te.created_at DESC LIMIT ${limit}`
  );
  return rows.map((r: any) => ({
    task_id: r.task_id || r.TASK_ID, kind: String(r.kind || r.KIND), payload: r.payload ? String(r.payload || r.PAYLOAD) : null, created_at: Number(r.created_at || r.CREATED_AT || 0), title: String(r.title || r.TITLE || ""),
  }));
}

// ------------------------- Profiles (filesystem + CLI) -------------------------

export interface AgentProfile {
  name: string; soul: string; role: string; model: string; apiPort: number | null; apiEnabled: boolean; status: "running" | "stopped" | "unknown"; tasks: number;
}

const PROFILE_META: Record<string, { role: string; avatar: string; color: string }> = {
  manager: { role: "Orchestrator", avatar: "M", color: "bg-blue-500" },
  "tim-copywritter": { role: "Copywriter & SEO", avatar: "C", color: "bg-purple-500" },
  "tim-qa": { role: "Quality Control", avatar: "Q", color: "bg-green-500" },
  "tim-poster-wp": { role: "Poster WordPress", avatar: "P", color: "bg-orange-500" },
};

function readProfileEnv(name: string): Record<string, string> {
  const envPath = path.join(PROFILES_DIR, name, ".env");
  if (!fs.existsSync(envPath)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function getProfileModel(profileYaml: string, env: Record<string, string>): string {
  const m = profileYaml.match(/model\s*:\s*["']?([^"'\n]+)["']?/);
  if (m) return m[1].trim();
  if (env.MODEL) return env.MODEL;
  return "default";
}

function getGatewayStatus(): Record<string, string> {
  try {
    const raw = execSync(`hermes gateway list 2>&1`, {
      encoding: "utf8", timeout: 15000,
      env: { ...process.env, HERMES_HOME },
    });
    const out: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*[✓✗]\s+([a-z0-9-]+)\s+—\s+(.+)$/);
      if (m) out[m[1].trim()] = m[2].trim();
    }
    return out;
  } catch {
    return {};
  }
}

export function getProfiles(): AgentProfile[] {
  const tasks = getKanbanTasks();
  const taskCountByAssignee: Record<string, number> = {};
  for (const t of tasks) {
    if (t.assignee) taskCountByAssignee[t.assignee] = (taskCountByAssignee[t.assignee] || 0) + 1;
  }
  const names = ["manager", "tim-copywritter", "tim-qa", "tim-poster-wp"];
  const gateways = getGatewayStatus();
  return names.map((name) => {
    const soulPath = path.join(PROFILES_DIR, name, "SOUL.md");
    const soul = fs.existsSync(soulPath) ? fs.readFileSync(soulPath, "utf8") : "";
    const env = readProfileEnv(name);
    const yamlPath = path.join(PROFILES_DIR, name, "profile.yaml");
    const yaml = fs.existsSync(yamlPath) ? fs.readFileSync(yamlPath, "utf8") : "";
    const gw = gateways[name] || "";
    const status: AgentProfile["status"] = /not running/i.test(gw) ? "stopped" : gw.includes("PID") || gw.includes("running") ? "running" : "unknown";
    return {
      name, soul, role: PROFILE_META[name]?.role || "Agent", model: getProfileModel(yaml, env),
      apiPort: env.API_SERVER_PORT ? parseInt(env.API_SERVER_PORT, 10) : null,
      apiEnabled: env.API_SERVER_ENABLED === "true", status, tasks: taskCountByAssignee[name] || 0,
    };
  });
}

// ------------------------- Vault (filesystem) -------------------------

export interface VaultEntry {
  name: string; path: string; type: "dir" | "file"; size: number; modified: number;
}

export function listVaultDir(relPath = ""): VaultEntry[] {
  const safe = path.normalize(relPath).replace(/^(\.\.(\/|$))+/, "");
  const target = path.join(VAULT_ROOT, safe);
  if (!target.startsWith(VAULT_ROOT) || !fs.existsSync(target)) return [];
  const st = fs.statSync(target);
  if (st.isFile()) {
    return [{ name: path.basename(target), path: safe, type: "file", size: st.size, modified: st.mtimeMs }];
  }
  return fs.readdirSync(target, { withFileTypes: true })
    .filter((d) => !d.name.startsWith("."))
    .map((d) => {
      const full = path.join(target, d.name);
      const s = fs.statSync(full);
      const type = d.isDirectory() ? ("dir" as const) : ("file" as const);
      return { name: d.name, path: path.join(safe, d.name), type, size: s.size, modified: s.mtimeMs };
    })
    .sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1);
}

export function getVaultFileContent(relPath: string): string | null {
  const safe = path.normalize(relPath).replace(/^(\.\.(\/|$))+/, "");
  const target = path.join(VAULT_ROOT, safe);
  if (!target.startsWith(VAULT_ROOT)) return null;
  try {
    return fs.readFileSync(target, "utf8");
  } catch {
    return null;
  }
}

export function getContentSummary(): Record<string, { count: number; files: { name: string; modified: number }[] }> {
  const folders: string[] = ["Drafts", "Approved", "Published"];
  const out: any = {};
  for (const f of folders) {
    const dir = path.join(VAULT_ROOT, "Content", f);
    if (!fs.existsSync(dir)) { out[f] = { count: 0, files: [] }; continue; }
    const files = fs.readdirSync(dir)
      .filter((n) => n.endsWith(".md"))
      .map((n) => {
        const s = fs.statSync(path.join(dir, n));
        return { name: n, modified: s.mtimeMs };
      })
      .sort((a, b) => b.modified - a.modified);
    out[f] = { count: files.length, files };
  }
  return out;
}

export function getWikiPages(): { folder: string; name: string; modtime: number }[] {
  const pages: { folder: string; name: string; modtime: number }[] = [];
  for (const folder of ["entities", "concepts", "comparisons", "queries", "raw/articles"]) {
    const dir = path.join(VAULT_ROOT, folder);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const full = path.join(dir, file);
      const s = fs.statSync(full);
      pages.push({ folder, name: file.replace(/\.md$/, ""), modtime: s.mtimeMs });
    }
  }
  return pages.sort((a, b) => b.modtime - a.modtime);
}