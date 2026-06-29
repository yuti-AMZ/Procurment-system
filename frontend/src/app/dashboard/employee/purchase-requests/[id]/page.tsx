"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPR, submitPR } from "@/lib/api";
const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/10 text-blue-500",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-destructive/10 text-destructive",
};
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
export default function PRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [pr, setPr] = useState<PRDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    getPR(Number(id))
      .then(setPr)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updated = await submitPR(Number(id));
      setPr(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !pr) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 space-y-4">
        <p className="text-destructive">{error || "Request not found"}</p>
        <Link href="/dashboard/employee/purchase-requests">
          <Button variant="outline">Back to My Requests</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/employee/purchase-requests"
            className="text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            &larr; Back to My Requests
          </Link>
          <h1 className="text-2xl font-bold font-serif text-foreground mt-1">
            {pr.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {pr.status === "DRAFT" && (
            <>
              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit for Approval"}
              </Button>
              <Link
                href={`/dashboard/employee/purchase-requests/${pr.id}/edit`}
              >
                <Button variant="outline">Edit</Button>
              </Link>
            </>
          )}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[pr.status] || ""}`}
          >
            {pr.status}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Request ID</p>
              <p className="text-gold font-mono mt-0.5">{pr.prNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="text-foreground mt-0.5">
                {pr.createdAt?.split("T")[0]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Department</p>
              <p className="text-foreground mt-0.5">{pr.department || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Urgency</p>
              <p className="text-foreground mt-0.5">{pr.urgency || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Amount</p>
              <p className="text-foreground mt-0.5 font-mono">
                ${Number(pr.totalAmount).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-foreground">
              {pr.description || "No description provided."}
            </p>
          </CardContent>
        </Card>
      </div>
      {pr.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-sm">Line Items</CardTitle>
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
                    <td className="py-2 text-foreground">{item.itemName}</td>
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
      {pr.approvalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-sm">
              Approval Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {pr.approvalHistory.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex gap-4 pb-4 relative last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ring-2 ring-card z-10 ${
                        entry.action === "APPROVED"
                          ? "bg-green-500"
                          : entry.action === "REJECTED"
                            ? "bg-destructive"
                            : "bg-gold/60"
                      }`}
                    />
                    {i < pr.approvalHistory.length - 1 && (
                      <div className="w-px flex-1 bg-card-border mt-1" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-foreground">
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
                      {entry.comment && <span> &mdash; {entry.comment}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
