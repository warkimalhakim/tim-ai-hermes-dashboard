import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { getKanbanTasks, KANBAN_STATUSES } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tasks = getKanbanTasks();
    const columns = KANBAN_STATUSES.map((status) => ({
      id: status,
      title: status.charAt(0).toUpperCase() + status.slice(1),
      tasks: tasks.filter((t) => t.status === status),
    })).filter((c) => c.tasks.length > 0 || ["todo", "ready", "running", "done"].includes(c.id));
    return NextResponse.json({ columns, statuses: KANBAN_STATUSES, total: tasks.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

const VALID_ASSIGNEES = ["manager", "tim-copywritter", "tim-qa", "tim-poster-wp"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = (body?.title || "").trim();
    const assignee = (body?.assignee || "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title wajib diisi" }, { status: 400 });
    }
    if (assignee && !VALID_ASSIGNEES.includes(assignee)) {
      return NextResponse.json({ error: `Assignee tidak valid: ${assignee}` }, { status: 400 });
    }

    const args = ["hermes", "kanban", "create", title];
    if (assignee) args.push("--assignee", assignee);
    args.push("--json");

    const out = execSync(args.join(" "), {
      encoding: "utf8",
      timeout: 20000,
      env: {
        ...process.env,
        HERMES_HOME: process.env.HERMES_HOME || `${process.env.HOME}/.hermes`,
        PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}`,
      },
    });

    return NextResponse.json({ task: JSON.parse(out) }, { status: 201 });
  } catch (e) {
    const err = e as Error;
    const msg = err.message?.includes("stderr")
      ? err.message.split("stderr:")[1]?.trim().split("\n")[0] || err.message
      : err.message;
    return NextResponse.json({ error: `Gagal create task: ${msg}` }, { status: 500 });
  }
}