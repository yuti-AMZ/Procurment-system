"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { listPRs, approveOrRejectPR } from "@/lib/api";
interface PRItem {
  id: number;
  prNumber: string;
  title: string;
  requestedBy: string;
  department: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  urgency: string;
}
const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/10 text-blue-500",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-destructive/10 text-destructive",
};
const urgencyStyles: Record<string, string> = {
  LOW: "bg-blue-500/10 text-blue-500",
  MEDIUM: "bg-yellow-500/10 text-yellow-500",
  HIGH: "bg-orange-500/10 text-orange-500",
  CRITICAL: "bg-destructive/10 text-destructive",
};
interface ConfirmDialogProps {
  request: PRItem;
  decision: "approve" | "reject";
  comment: string;
  onCommentChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}
function ConfirmDialog({
  request,
  decision,
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="">
            {decision === "approve" ? "Approve" : "Reject"} Purchase Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">
              Request:{" "}
              <span className="text-foreground">{request.prNumber}</span>
            </p>
            <p className="text-muted-foreground">
              Title: <span className="text-foreground">{request.title}</span>
            </p>
            <p className="text-muted-foreground">
              Amount:{" "}
              <span className="text-foreground">
                ${Number(request.totalAmount).toFixed(2)}
              </span>
            </p>
            <p className="text-muted-foreground">
              Requester:{" "}
              <span className="text-foreground">{request.requestedBy}</span>
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Optional Comment
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300 resize-none"
              placeholder="Add a note..."
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={decision === "approve" ? "default" : "destructive"}
              className="flex-1"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : decision === "approve"
                  ? "Confirm Approve"
                  : "Confirm Reject"}{" "}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default function PendingApprovalsPage() {
  const [search, setSearch] = useState("");
  const [prs, setPrs] = useState<PRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    request: PRItem;
    decision: "approve" | "reject";
  } | null>(null);
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    listPRs("PENDING_APPROVAL,SUBMITTED")
      .then(setPrs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = prs.filter((r) => {
    if (
      search &&
      !r.prNumber.toLowerCase().includes(search.toLowerCase()) &&
      !r.title.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });
  const handleConfirm = async () => {
    if (!confirmDialog) return setProcessing(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await approveOrRejectPR(confirmDialog.request.id, {
        approverId: Number(user.id) || 0,
        approverName: user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.email,
        action: confirmDialog.decision === "approve" ? "APPROVE" : "REJECT",
        comments: comment,
      });
      setPrs((prev) => prev.filter((p) => p.id !== confirmDialog.request.id));
      setConfirmDialog(null);
      setComment("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process");
    } finally {
      setProcessing(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground ">
            Pending Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} requests awaiting your decision
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/manager/approvals/history">
            <Button variant="outline" size="sm">
              History
            </Button>
          </Link>
          <Link href="/dashboard/manager/approvals/escalated">
            <Button variant="outline" size="sm">
              Escalated
            </Button>
          </Link>
        </div>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}{" "}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="">All Pending Requests</CardTitle>
            <Input
              placeholder="Search by PR ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                      PR ID
                    </th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-card-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <Link
                          href={`/dashboard/manager/purchase-requests/${req.id}`}
                          className="text-gold hover:underline font-mono text-xs"
                        >
                          {req.prNumber}{" "}
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-foreground font-medium">
                          {req.title}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {req.requestedBy}
                      </td>
                      <td className="py-3 px-2 text-right text-foreground font-medium">
                        ${Number(req.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">
                        {req.createdAt?.split("T")[0]}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-md font-medium capitalize ${statusStyles[req.status] || ""}`}
                        >
                          {req.status}{" "}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() =>
                              setConfirmDialog({
                                request: req,
                                decision: "approve",
                              })
                            }
                          >
                            Approve{" "}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setConfirmDialog({
                                request: req,
                                decision: "reject",
                              })
                            }
                          >
                            Reject{" "}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}{" "}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No pending requests found.
                </p>
              )}{" "}
            </div>
          )}{" "}
        </CardContent>
      </Card>
      {confirmDialog && (
        <ConfirmDialog
          request={confirmDialog.request}
          decision={confirmDialog.decision}
          comment={comment}
          onCommentChange={setComment}
          onConfirm={handleConfirm}
          onCancel={() => {
            setConfirmDialog(null);
            setComment("");
          }}
          loading={processing}
        />
      )}{" "}
    </div>
  );
}
