"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listPRs } from "@/lib/api";
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
export default function EmployeeDashboardPage() {
  const user = getCurrentUser();
  const userId = user.id;
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listPRs()
      .then((all) => {
        const mine = Array.isArray(all)
          ? all.filter((p: any) => p.requestedBy === user.email || p.createdBy === userId)
          : [];
        setPrs(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, user.email]);
  const totalRequests = prs.length;
  const pending = prs.filter(
    (p) => p.status === "PENDING_APPROVAL" || p.status === "SUBMITTED",
  ).length;
  const approved = prs.filter((p) => p.status === "APPROVED").length;
  const drafts = prs.filter((p) => p.status === "DRAFT").length;
  const recentPrs = prs.slice(-5).reverse();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Employee Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your purchase requests
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="My Requests" value={String(totalRequests)} />
            <StatCard label="Pending" value={String(pending)} />
            <StatCard label="Approved" value={String(approved)} />
            <StatCard label="Drafts" value={String(drafts)} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPrs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No purchase requests yet</p>
                  )}
                  {recentPrs.map((pr: any) => (
                    <div key={pr.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gold/60 shrink-0" />
                      <span className="text-foreground">{pr.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">{pr.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/employee/purchase-requests/new">
                  <Button className="w-full">New Purchase Request</Button>
                </Link>
                <Link href="/dashboard/employee/purchase-requests">
                  <Button variant="outline" className="w-full">My Purchase Requests</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
