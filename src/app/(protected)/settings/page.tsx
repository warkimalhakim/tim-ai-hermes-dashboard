"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Server, HardDrive, KeyRound, Activity } from "lucide-react";

interface ProfileInfo {
  name: string;
  role: string;
  model: string;
  apiPort: number | null;
  apiEnabled: boolean;
  status: string;
  tasks: number;
}

export default function SettingsPage() {
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setProfiles(d.profiles || []);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Profile Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profiles.map((p) => (
            <div key={p.name} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <HardDrive className="h-3 w-3" />
                  {p.model}
                  {p.apiEnabled && p.apiPort && (
                    <span className="ml-2 flex items-center gap-1 text-emerald-500">
                      <KeyRound className="h-3 w-3" />
                      API :{p.apiPort}
                    </span>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs ${
                p.status === "running" ? "text-green-500" : "text-red-500"
              }`}>
                <Activity className="h-3 w-3" />
                {p.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vault path</span>
            <span className="font-mono text-xs">/home/mywarkim/_agent/vault</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kanban DB</span>
            <span className="font-mono text-xs">~/.hermes/kanban.db</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dashboard port</span>
            <span className="font-mono text-xs">3001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Domain</span>
            <span className="font-mono text-xs">tim.warkim.my.id</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}