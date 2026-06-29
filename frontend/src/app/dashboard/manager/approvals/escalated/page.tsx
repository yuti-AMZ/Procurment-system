"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { listPRs, approveOrRejectPR } from "@/lib/api";
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
interface EscalatedRequest {
  id: number;
  prNumber: string;
  title: string;
  requestedBy: string;
  department: string;
  totalAmount: number;
  createdAt: string;
  daysOverdue: number;
}
export default function EscalatedPage() {
  const [requests, setRequests] = useState<EscalatedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const user = getCurrentUser();
  useEffect(() => {
    async function fetch() {
      try {
        const pending = await listPRs("PENDING_APPROVAL,SUBMITTED");
        const now = Date.now();
        const escalated: EscalatedRequest[] = (Array.isArray(pending) ? pending : [])
          .filter((pr: any) => {
            if (!pr.createdAt) return false;
            const days = Math.floor((now - new Date(pr.createdAt).getTime()) / 86400000);
            return days >= 7;
          })
          .map((pr: any) => ({
            id: pr.id,
            prNumber: pr.prNumber,
            title: pr.title,
            requestedBy: pr.requestedBy,
            department: pr.department || "",
            totalAmount: Number(pr.totalAmount),
            createdAt: pr.createdAt,
            daysOverdue: Math.floor((now - new Date(pr.createdAt).getTime()) / 86400000),
          }))
          .sort((a: EscalatedRequest, b: EscalatedRequest) => b.daysOverdue - a.daysOverdue);
        setRequests(escalated);
      } catch {}
      setLoading(false);
    }
    fetch();
  }, []);
  async function handleAction(id: number, action: "approve" | "reject") {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    setError("");
    try {
      await approveOrRejectPR(id, {
        approverId: Number(user.id) || 0,
        approverName: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
        action: action === "approve" ? "APPROVE" : "REJECT",
        comments: "Escalated request",
      });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Escalated Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading..." : `${requests.length} urgent items requiring immediate attention`}
          </p>
        </div>
        <Link href="/dashboard/manager/approvals">
          <Button variant="outline" size="sm">All Pending</Button>
        </Link>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-sm">No escalated requests at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="border-destructive/30 hover:border-destructive/50"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                      <CardTitle className="text-base">{req.title}</CardTitle>
                    </div>
                    <span className="text-xs font-mono text-gold">{req.prNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-bold text-destructive">{req.daysOverdue}d</span>
                    <span className="text-xs text-muted-foreground">overdue</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Requester</p>
                    <p className="text-foreground font-medium">{req.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-foreground font-medium">{req.department || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-foreground font-medium">${req.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-foreground font-medium text-xs">
                      {req.createdAt?.split("T")[0]}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                  <p className="text-xs text-muted-foreground">Escalation Reason</p>
                  <p className="text-sm text-foreground mt-0.5">
                    Pending approval for {req.daysOverdue} days — exceeds 7-day escalation threshold.
                  </p>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={processing[req.id]}
                  >
                    {processing[req.id] ? "..." : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={processing[req.id]}
                  >
                    {processing[req.id] ? "..." : "Reject"}
                  </Button>
                  <Link href={`/dashboard/manager/purchase-requests/${req.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
