"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { getAllCompanies, getAdminAnalytics, listTickets } from "@/lib/api";

interface Section {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

const sections: Section[] = [
  { title: "Organizations", description: "View, approve, suspend & manage tenants", href: "/dashboard/admin/companies", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "from-blue-500/20 to-blue-600/10" },
  { title: "Subscriptions", description: "Assign plans, track renewals & payments", href: "/dashboard/admin/subscriptions", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "from-emerald-500/20 to-emerald-600/10" },
  { title: "Users", description: "Monitor users, disable accounts, reset admins", href: "/dashboard/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "from-purple-500/20 to-purple-600/10" },
  { title: "Analytics", description: "Usage trends, KPIs & platform metrics", href: "/dashboard/admin/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "from-amber-500/20 to-amber-600/10" },
  { title: "System Health", description: "Monitor services, DB, RabbitMQ & Redis", href: "/dashboard/admin/system-health", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "from-rose-500/20 to-rose-600/10" },
  { title: "Features", description: "Enable/disable platform-wide features", href: "/dashboard/admin/features", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", color: "from-cyan-500/20 to-cyan-600/10" },
  { title: "Billing & Revenue", description: "MRR, invoices, refunds & reports", href: "/dashboard/admin/billing", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-green-500/20 to-green-600/10" },
  { title: "API Management", description: "API keys, rate limits & webhooks", href: "/dashboard/admin/api-management", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4", color: "from-violet-500/20 to-violet-600/10" },
  { title: "Security Center", description: "Audit logs, login activity & alerts", href: "/dashboard/admin/audit-logs", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "from-red-500/20 to-red-600/10" },
  { title: "Support Center", description: "Tickets, account recovery & troubleshooting", href: "/dashboard/admin/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", color: "from-indigo-500/20 to-indigo-600/10" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    companies: 0, pendingCompanies: 0, approvedCompanies: 0, users: 0,
    activeSubscriptions: 0, mrr: 0, openTickets: 0, highPriorityTickets: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllCompanies(),
      getAdminAnalytics(),
      listTickets().catch(() => []),
    ]).then(([companies, analytics, tickets]) => {
      const comps = Array.isArray(companies) ? companies : [];
      const tick = Array.isArray(tickets) ? tickets : [];
      setStats({
        companies: comps.length,
        pendingCompanies: comps.filter((c: any) => c.status === "PENDING_APPROVAL").length,
        approvedCompanies: comps.filter((c: any) => c.status === "APPROVED").length,
        users: analytics?.totalUsers ?? 0,
        activeSubscriptions: analytics?.activeSubscriptions ?? 0,
        mrr: analytics?.mrr ?? 0,
        openTickets: tick.filter((t: any) => t.status !== "RESOLVED").length,
        highPriorityTickets: tick.filter((t: any) => t.priority === "HIGH").length,
      });
      setRecentCompanies(comps.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const ct1: "positive" | "neutral" = stats.pendingCompanies > 0 ? "positive" : "neutral";
  const ct3: "positive" | "neutral" = stats.mrr > 0 ? "positive" : "neutral";
  const ct4: "positive" | "neutral" = stats.highPriorityTickets > 0 ? "positive" : "neutral";
  const statCards = [
    { title: "Total Organizations", value: String(stats.companies), change: `${stats.approvedCompanies} active · ${stats.pendingCompanies} pending`, changeType: ct1, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { title: "Total Users", value: String(stats.users), change: "Across all organizations", changeType: "neutral" as const, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
    { title: "Active Subscriptions", value: String(stats.activeSubscriptions), change: `$${stats.mrr.toLocaleString()} MRR`, changeType: ct3, icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
    { title: "Open Tickets", value: String(stats.openTickets), change: `${stats.highPriorityTickets} high priority`, changeType: ct4, icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your SaaS platform — tenants, subscriptions, security & operations</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground py-4">Loading dashboard data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => <StatsCard key={s.title} {...s} />)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="group">
            <Card className="h-full hover:shadow-md hover:border-gold/30 transition-all duration-200">
              <CardContent className="p-0">
                <div className={`h-2 w-full rounded-t-xl bg-gradient-to-r ${s.color}`} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${s.color}`}>
                      <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Organizations</CardTitle>
            <Link href="/dashboard/admin/companies" className="text-sm text-gold hover:text-gold/80 transition-colors">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Organization</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Admin</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Industry</th>
                </tr>
              </thead>
              <tbody>
                {recentCompanies.map((c: any) => (
                  <tr key={c.id} className="border-b border-card-border/50 last:border-0">
                    <td className="py-3 px-2 text-foreground font-medium">{c.name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{c.email}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "APPROVED" ? "bg-green-500/10 text-green-500 border border-green-500/30" : c.status === "PENDING_APPROVAL" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" : c.status === "SUSPENDED" ? "bg-red-500/10 text-red-500 border border-red-500/30" : "bg-destructive/10 text-destructive border border-destructive/30"}`}>
                        {c.status === "PENDING_APPROVAL" ? "Pending" : c.status === "APPROVED" ? "Active" : c.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{c.adminName || "-"}</td>
                    <td className="py-3 px-2 text-muted-foreground">{c.industry || "-"}</td>
                  </tr>
                ))}
                {recentCompanies.length === 0 && (<tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No organizations registered yet</td></tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
