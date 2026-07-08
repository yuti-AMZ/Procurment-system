"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPRs, generatePO } from "@/lib/api";
interface PRItem {
  id: number;
  prNumber: string;
  title: string;
  requestedBy: string;
  department: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}
const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PENDING_APPROVAL: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  PO_GENERATED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};
const formatCurrency = (n: number) => "$" + n.toLocaleString();
export default function PurchaseRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [prs, setPrs] = useState<PRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [poLoading, setPoLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    listPRs()
      .then(setPrs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = prs.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.prNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleGeneratePO = async (id: number) => {
    setPoLoading(id);
    setError("");
    try {
      const po = await generatePO(id);
      setPrs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "PO_GENERATED" } : p)),
      );
      alert(`PO ${po.poNumber} generated successfully`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate PO");
    } finally {
      setPoLoading(null);
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Purchase Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {prs.length} total requests
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/procurement/purchase-requests/new">
            New Purchase Request
          </Link>
        </Button>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle>All Requests</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-60"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:border-gold/50"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PO_GENERATED">PO Generated</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-3 sm:px-6 py-3 sm:py-4">ID</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Title</th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4">Requester</th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4">Department</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Amount</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4">Date</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pr) => (
                    <tr
                      key={pr.id}
                      className="border-b border-card-border hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gold font-mono">
                        {pr.prNumber}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-foreground max-w-[150px] truncate sm:max-w-none">
                        {pr.title}
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-muted-foreground">
                        {pr.requestedBy}
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-muted-foreground">
                        {pr.department || "—"}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-foreground font-medium">
                        {formatCurrency(pr.totalAmount)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[pr.status] || ""}`}
                        >
                          {pr.status === "PENDING_APPROVAL"
                            ? "PENDING"
                            : pr.status}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-muted-foreground">
                        {pr.createdAt?.split("T")[0]}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {pr.status === "APPROVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGeneratePO(pr.id)}
                            disabled={poLoading === pr.id}
                          >
                            {poLoading === pr.id
                              ? "Generating..."
                              : "Convert to PO"}
                          </Button>
                        )}
                        {pr.status === "PO_GENERATED" && (
                          <span className="text-xs text-muted-foreground">
                            PO Created
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No purchase requests found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
