"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { listPRs, listUsers } from "@/lib/api";
interface HistoryItem {
  id: number;
  prNumber: string;
  title: string;
  requestedBy: string;
  totalAmount: number;
  decision: "APPROVED" | "REJECTED";
  date: string;
  comments: string;
}
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
export default function ApprovalHistoryPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();
  useEffect(() => {
    async function fetch() {
      try {
        const [approved, rejected] = await Promise.all([
          listPRs("APPROVED"),
          listPRs("REJECTED"),
        ]);
        const all = [...approved, ...rejected].sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime(),
        );
        setItems(
          all.map((pr: any) => ({
            id: pr.id,
            prNumber: pr.prNumber,
            title: pr.title,
            requestedBy: pr.requestedBy,
            totalAmount: Number(pr.totalAmount),
            decision: pr.status === "APPROVED" ? "APPROVED" : "REJECTED",
            date: (pr.updatedAt || pr.createdAt)?.split("T")[0] || "",
            comments: pr.approvalComment || "",
          })),
        );
      } catch {}
      setLoading(false);
    }
    fetch();
  }, []);
  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.prNumber.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q)
    );
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approval History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete record of approval decisions
          </p>
        </div>
        <Link href="/dashboard/manager/approvals">
          <Button variant="outline" size="sm">Pending Approvals</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="">Past Decisions ({items.length})</CardTitle>
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
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">PR ID</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Title</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Requester</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Decision</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-card-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-2">
                        <Link
                          href={`/dashboard/manager/purchase-requests/${item.id}`}
                          className="text-gold hover:underline font-mono text-xs"
                        >
                          {item.prNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/dashboard/manager/purchase-requests/${item.id}`}
                          className="text-foreground font-medium hover:text-gold transition-colors"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{item.requestedBy}</td>
                      <td className="py-3 px-2 text-right text-foreground font-medium">
                        ${item.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-md font-medium ${
                            item.decision === "APPROVED"
                              ? "text-green-500 bg-green-500/10"
                              : "text-destructive bg-destructive/10"
                          }`}
                        >
                          {item.decision === "APPROVED" ? "Approved" : "Rejected"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">{item.date}</td>
                      <td className="py-3 px-2 text-muted-foreground text-xs max-w-[200px] truncate">
                        {item.comments || "—"}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted-foreground py-8 text-sm">
                        {loading ? "Loading..." : "No history entries found."}
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
