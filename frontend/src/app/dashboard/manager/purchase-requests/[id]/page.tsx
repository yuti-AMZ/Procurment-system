"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getPR, approveOrRejectPR } from "@/lib/api";
interface PRItem {
  id: number;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
}
interface ApprovalEntry {
  id: number;
  action: string;
  comment?: string;
  performedBy: string;
  createdAt: string;
}
interface PRDetail {
  id: number;
  prNumber: string;
  title: string;
  description?: string;
  department?: string;
  requestedBy: string;
  status: string;
  totalAmount: number;
  urgency?: string;
  createdAt: string;
  updatedAt?: string;
  items: PRItem[];
  approvalHistory: ApprovalEntry[];
}
export default function PRDetailPage() {
  const params = useParams();
  const [pr, setPr] = useState<PRDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [processing, setProcessing] = useState(false);
  useEffect(() => {
    const id = params.id as string;
    if (id) {
      getPR(Number(id))
        .then(setPr)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [params.id]);
  const handleAction = async (action: "approve" | "reject") => {
    if (!pr) return;
    setProcessing(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = await approveOrRejectPR(pr.id, {
        approverId: Number(user.id) || 0,
        approverName: user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.email,
        action: action === "approve" ? "APPROVE" : "REJECT",
        comments: comment,
      });
      setPr(updated);
      setDecision(action);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process");
    } finally {
      setProcessing(false);
    }
  };
  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !pr) {
    return (
      <div className="space-y-6 text-center py-20">
        <p className="text-destructive">{error || "Request not found"}</p>
        <Link href="/dashboard/manager/approvals">
          <Button variant="outline">Back to Approvals</Button>
        </Link>
      </div>
    );
  }
  const totalItems =
    pr.items?.reduce((s: number, i: PRItem) => s + i.quantity, 0) || 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/manager/approvals"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Approvals
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-mono text-gold">{pr.prNumber}</span>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-serif text-xl">
                    {pr.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {pr.prNumber}
                  </p>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  ${Number(pr.totalAmount).toFixed(2)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pr.description && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {pr.description}
                    </p>
                  </div>
                  <Separator />
                </>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-foreground font-medium">
                    {pr.department || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Urgency</p>
                  <p className="text-foreground font-medium">
                    {pr.urgency || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-foreground font-medium text-xs">
                    {pr.createdAt?.split("T")[0]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="text-foreground font-medium">
                    {pr.items?.length || 0} ({totalItems} units)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {pr.items && pr.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-card-border">
                      <th className="text-left py-2 text-muted-foreground text-xs font-medium">
                        Item
                      </th>
                      <th className="text-right py-2 text-muted-foreground text-xs font-medium">
                        Qty
                      </th>
                      <th className="text-right py-2 text-muted-foreground text-xs font-medium">
                        Unit Price
                      </th>
                      <th className="text-right py-2 text-muted-foreground text-xs font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pr.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-card-border/50 last:border-0"
                      >
                        <td className="py-2 text-foreground">
                          {item.itemName}
                        </td>
                        <td className="py-2 text-right text-foreground">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-right text-foreground">
                          ${Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-2 text-right text-foreground font-medium">
                          ${Number(item.totalPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
          {pr.approvalHistory && pr.approvalHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Approval Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {pr.approvalHistory.map((entry, i) => (
                    <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            entry.action === "APPROVED"
                              ? "bg-green-500 border-green-500"
                              : entry.action === "REJECTED"
                                ? "bg-destructive border-destructive"
                                : "bg-gold border-gold"
                          }`}
                        />
                        {i < pr.approvalHistory.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${entry.action === "APPROVED" ? "bg-green-500/50" : entry.action === "REJECTED" ? "bg-destructive/50" : "bg-card-border"}`}
                          />
                        )}
                      </div>
                      <div
                        className={`pb-6 ${i === pr.approvalHistory.length - 1 ? "pb-0" : ""}`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            entry.action === "APPROVED"
                              ? "text-green-500"
                              : entry.action === "REJECTED"
                                ? "text-destructive"
                                : "text-gold"
                          }`}
                        >
                          {entry.action === "APPROVED"
                            ? "Approved"
                            : entry.action === "REJECTED"
                              ? "Rejected"
                              : entry.action === "SUBMITTED"
                                ? "Submitted"
                                : entry.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.performedBy} &middot; ,
                          {entry.createdAt?.split("T")[0]} ,
                          {entry.comment && (
                            <span> &mdash; {entry.comment}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-base">Requester</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">
                  {pr.requestedBy
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {pr.requestedBy}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="text-foreground font-medium">
                    {pr.department || "—"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="text-foreground font-medium text-xs">
                    {pr.createdAt?.split("T")[0]}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
          {pr.status === "PENDING_APPROVAL" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-base">
                  Your Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Comment (optional)
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300 resize-none"
                    placeholder="Add notes or reason for your decision..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleAction("approve")}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Approve Request"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleAction("reject")}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Reject Request"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {pr.status === "APPROVED" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-base">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 text-sm font-medium text-center">
                  Approved
                </div>
              </CardContent>
            </Card>
          )}
          {pr.status === "REJECTED" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-base">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium text-center">
                  Rejected
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
