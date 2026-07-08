"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listAuditLogs } from "@/lib/api";

interface AuditLog {
  id: number;
  email?: string;
  action: string;
  resource: string;
  detail: string;
  createdAt: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  useEffect(() => {
    listAuditLogs()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">Loading audit logs...</div>;

  const actions = ["All", ...new Set(logs.map(l => l.action))];
  const filtered = logs.filter(l => {
    if (actionFilter !== "All" && l.action !== actionFilter) return false;
    if (search && !l.email?.toLowerCase().includes(search.toLowerCase()) && !l.detail?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">System activity and security events</p>
      </div>
      <div className="flex gap-3">
        <Input placeholder="Search logs..." className="max-w-sm" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          {actions.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Action</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Resource</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Detail</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-card-border last:border-0 hover:bg-muted/30">
                    <td className="p-4 font-medium text-foreground">{log.email ?? "system"}</td>
                    <td className="p-4"><span className="text-gold">{log.action}</span></td>
                    <td className="p-4 text-muted-foreground">{log.resource}</td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">{log.detail}</td>
                    <td className="p-4 text-right text-muted-foreground text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No audit logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
