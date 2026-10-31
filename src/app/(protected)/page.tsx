import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { getKanbanStats, getProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatAge(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export default async function OverviewPage() {
  const stats = getKanbanStats();
  const profiles = getProfiles();
  const running = profiles.filter((p) => p.status === "running").length;

  const statCards = [
    { name: "Total Agents", value: profiles.length, icon: Users, color: "text-blue-500" },
    { name: "Running Gateways", value: running, icon: Activity, color: "text-green-500" },
    { name: "Done Tasks", value: stats.done, icon: CheckCircle, color: "text-emerald-500" },
    { name: "Active Tasks", value: stats.active, icon: Clock, color: "text-yellow-500" },
  ];

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agents Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profiles.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-xs text-muted-foreground">· {agent.tasks} tasks</span>
                </div>
                <span className={`text-sm flex items-center gap-1 ${
                  agent.status === "running" ? "text-green-500" : ""
                } ${agent.status === "stopped" ? "text-red-500" : ""}`}>
                  {agent.status === "running" && <Activity className="h-3 w-3" />}
                  {agent.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.byStatus).length === 0 && (
              <div className="text-sm text-muted-foreground">Belum ada task.</div>
            )}
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${statusColors[status] || "bg-gray-400"}`} />
                <span className="capitalize w-24">{status}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(count / Math.max(stats.total, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-8 text-right">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada aktivitas.</div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm">
                  <span className={`h-2 w-2 rounded-full ${statusColors[a.status] || "bg-gray-400"}`} />
                  <span className="font-medium">{a.title}</span>
                  <span className="text-xs text-muted-foreground">→ {a.status}</span>
                  {a.assignee && (
                    <span className="text-xs text-muted-foreground">@{a.assignee}</span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatAge(a.ageHours)} ago
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}