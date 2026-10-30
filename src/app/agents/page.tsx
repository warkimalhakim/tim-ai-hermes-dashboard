import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserRound, Zap, Activity, Cpu } from "lucide-react";
import { getProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";

const colorMap: Record<string, string> = {
  manager: "bg-blue-500",
  "tim-copywritter": "bg-purple-500",
  "tim-qa": "bg-green-500",
  "tim-poster-wp": "bg-orange-500",
};

export default async function AgentsPage() {
  const profiles = getProfiles();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agents</h1>
        <span className="text-sm text-muted-foreground">
          {profiles.filter((p) => p.status === "running").length}/{profiles.length} gateway running
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profiles.map((agent) => (
          <Card key={agent.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">@{agent.name}</CardTitle>
              <div className={`h-10 w-10 rounded-full ${colorMap[agent.name] || "bg-gray-500"} flex items-center justify-center text-white font-bold`}>
                {agent.name === "manager" ? "M" : agent.name === "tim-copywritter" ? "C" : agent.name === "tim-qa" ? "Q" : "P"}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{agent.name}</span>
                  <span className={`text-xs flex items-center gap-1 ${
                    agent.status === "running" ? "text-green-500" : "text-red-500"
                  }`}>
                    <Activity className="h-3 w-3" />
                    {agent.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{agent.role}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Cpu className="h-3 w-3" />
                  {agent.model}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  {agent.tasks} tasks
                </div>
                {agent.apiEnabled && agent.apiPort && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-emerald-500">API :{agent.apiPort}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}