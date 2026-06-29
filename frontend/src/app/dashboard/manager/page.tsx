"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { listPRs } from "@/lib/api";
export default function ManagerDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [recentPrs, setRecentPrs] = useState<
    {
      id: number;
      prNumber: string;
      title: string;
      requestedBy: string;
      totalAmount: number;
      status: string;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      listPRs("PENDING_APPROVAL,SUBMITTED"),
      listPRs("APPROVED"),
      listPRs("REJECTED"),
    ])
      .then(([pending, approved, rejected]) => {
        setPendingCount(pending.length);
        setApprovedCount(approved.length);
        setRejectedCount(rejected.length);
        const combined = [...pending, ...approved, ...rejected]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);
        setRecentPrs(combined);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground ">
            Manager Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage purchase requests
          </p>
        </div>
        <Link href="/dashboard/manager/approvals">
          <Button variant="default">Review All Pending</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Approvals"
          value={String(pendingCount)}
          change={loading ? "Loading..." : "Awaiting your review"}
          changeType={pendingCount > 0 ? "negative" : "positive"}
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
        <StatsCard
          title="Approved (Total)"
          value={String(approvedCount)}
          change={loading ? "Loading..." : "All time"}
          changeType="positive"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          title="Rejected (Total)"
          value={String(rejectedCount)}
          change={loading ? "Loading..." : "All time"}
          changeType="neutral"
          icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          title="Total Requests"
          value={String(pendingCount + approvedCount + rejectedCount)}
          change={loading ? "Loading..." : "All time"}
          changeType="neutral"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-muted/20 rounded animate-pulse"
                />
              ))}{" "}
            </div>
          ) : recentPrs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No requests found.
            </p>
          ) : (
            <div className="space-y-3">
              {recentPrs.map((req, idx) => (
                <div key={req.id}>
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {req.prNumber}
                        </span>
                        <span className="font-medium text-foreground truncate">
                          {req.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{req.requestedBy}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="font-medium text-foreground">
                          ${Number(req.totalAmount).toFixed(2)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-md font-medium capitalize ${
                            req.status === "PENDING_APPROVAL"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : req.status === "APPROVED"
                                ? "bg-green-500/10 text-green-500"
                                : req.status === "REJECTED"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {idx < recentPrs.length - 1 && <Separator />}{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/manager/approvals"
              className="group rounded-xl border border-card-border bg-muted/30 p-4 transition-all hover:border-gold/30 hover:bg-gold/5"
            >
              <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                Pending Approvals
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingCount} requests awaiting your decision
              </p>
            </Link>
            <Link
              href="/dashboard/manager/approvals/history"
              className="group rounded-xl border border-card-border bg-muted/30 p-4 transition-all hover:border-gold/30 hover:bg-gold/5"
            >
              <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                Approval History
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                View all past approvals and rejections
              </p>
            </Link>
            <Link
              href="/dashboard/manager/approvals/escalated"
              className="group rounded-xl border border-card-border bg-muted/30 p-4 transition-all hover:border-gold/30 hover:bg-gold/5"
            >
              <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                Escalated Requests
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Urgent items needing attention
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
