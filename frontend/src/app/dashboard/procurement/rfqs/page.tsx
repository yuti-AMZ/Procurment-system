"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { listRFQs } from "@/lib/api";
interface RfqItem {
  id: number;
  rfqNumber: string;
  title: string;
  status: string;
  deadline: string;
  createdAt: string;
  invitedSuppliers?: { responseStatus: string }[];
}
const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  OPEN: "bg-green-500/20 text-green-400 border-green-500/30",
  CLOSED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  AWARDED: "bg-gold/20 text-gold border-gold/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};
export default function RfqsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rfqs, setRfqs] = useState<RfqItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listRFQs()
      .then(setRfqs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = rfqs.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.rfqNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground ">
            Requests for Quotation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rfqs.length} total RFQs
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/procurement/rfqs/new">Create New RFQ</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="">All RFQs</CardTitle>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search RFQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-60"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:border-gold/50"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="AWARDED">Awarded</option>
                <option value="CANCELLED">Cancelled</option>
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
                    <th className="px-6 py-4">RFQ ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rfq) => {
                    const responses =
                      rfq.invitedSuppliers?.filter(
                        (s) => s.responseStatus === "SUBMITTED",
                      ).length || 0;
                    return (
                      <tr
                        key={rfq.id}
                        className="border-b border-card-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gold font-mono">
                          {rfq.rfqNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {rfq.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {rfq.createdAt?.split("T")[0]}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {rfq.deadline || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[rfq.status] || ""}`}
                          >
                            {rfq.status}{" "}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {responses}
                        </td>
                      </tr>
                    );
                  })}{" "}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No RFQs found.
                </div>
              )}{" "}
            </div>
          )}{" "}
        </CardContent>
      </Card>
    </div>
  );
}
