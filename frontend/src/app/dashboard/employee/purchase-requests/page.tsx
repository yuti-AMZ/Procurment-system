"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listPRs } from "@/lib/api";
interface PR {
  id: number;
  prNumber: string;
  title: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  requestedBy: string;
}
const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-card-border",
  SUBMITTED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};
export default function MyPurchaseRequestsPage() {
  const [search, setSearch] = useState("");
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listPRs()
      .then((data) => setPrs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = prs.filter(
    (pr) =>
      pr.prNumber?.toLowerCase().includes(search.toLowerCase()) ||
      pr.title?.toLowerCase().includes(search.toLowerCase()) ||
      pr.status?.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          My Purchase Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track the status of your purchase requests
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Purchase Requests</CardTitle>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by ID, title or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
                  <tr className="border-b border-card-border text-muted-foreground">
                    <th className="text-left py-3 px-2 font-medium">PR Number</th>
                    <th className="text-left py-3 px-2 font-medium">Title</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                    <th className="text-right py-3 px-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pr) => (
                    <tr
                      key={pr.id}
                      className="border-b border-card-border transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/dashboard/employee/purchase-requests/${pr.id}`)
                      }
                    >
                      <td className="py-3 px-2 text-gold font-mono text-xs">
                        {pr.prNumber}
                      </td>
                      <td className="py-3 px-2 text-foreground">{pr.title}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[pr.status] || "bg-muted text-muted-foreground"}`}
                        >
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {pr.createdAt?.split("T")[0]}
                      </td>
                      <td className="py-3 px-2 text-right text-foreground font-mono">
                        ${Number(pr.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No purchase requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
