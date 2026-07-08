"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { getCompanyUsers, getPendingCompanyUsers } from "@/lib/api";
export default function CompanyAdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingUsers: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([getCompanyUsers(), getPendingCompanyUsers()]).then(([users, pending]) => {
      const all = Array.isArray(users) ? users : [];
      const pend = Array.isArray(pending) ? pending : [];
      setStats({
        totalUsers: all.length,
        pendingUsers: pend.length,
        activeUsers: all.filter((u: any) => u.enabled !== false && u.accountStatus === "APPROVED").length,
      });
      setRecentUsers(all.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const statCards = [
    { title: "Total Users", value: String(stats.totalUsers), change: `${stats.activeUsers} active`, changeType: "positive" as const, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { title: "Pending Approvals", value: String(stats.pendingUsers), change: "Awaiting review", changeType: stats.pendingUsers > 0 ? "positive" as const : "neutral" as const, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Active Users", value: String(stats.activeUsers), change: `${Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}% active rate`, changeType: "positive" as const, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your organization and team members</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((s) => <StatsCard key={s.title} {...s} />)}
          </div>
          <Card>
            <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-card-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Role</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u: any) => (
                      <tr key={u.id} className="border-b border-card-border/50 last:border-0">
                        <td className="py-3 px-2 text-foreground font-medium">{u.firstName} {u.lastName}</td>
                        <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-2">
                          <span className="text-xs px-2 py-0.5 rounded-full border border-gold/30 text-gold">{u.role}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.accountStatus === "APPROVED" ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"}`}>
                            {u.accountStatus === "APPROVED" ? "ACTIVE" : u.accountStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentUsers.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No team members yet. Invite your first user.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}