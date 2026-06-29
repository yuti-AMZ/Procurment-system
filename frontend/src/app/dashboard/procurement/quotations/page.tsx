"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listQuotations } from "@/lib/api";
interface QuotationItem {
  id: number;
  quotationNumber: string;
  supplierName: string;
  rfqNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}
const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SUBMITTED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  UNDER_EVALUATION: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ACCEPTED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
};
const formatCurrency = (n: number) => "$" + n.toLocaleString();
export default function QuotationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listQuotations()
      .then(setQuotations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      q.rfqNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground ">Quotations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {quotations.length} quotations received
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="">All Quotations</CardTitle>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search quotations..."
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
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_EVALUATION">Evaluating</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
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
                    <th className="px-6 py-4">Quotation #</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">RFQ Ref</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr
                      key={q.id}
                      className="border-b border-card-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gold font-mono">
                        {q.quotationNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {q.supplierName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {q.rfqNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {formatCurrency(q.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[q.status] || ""}`}
                        >
                          {q.status === "UNDER_EVALUATION"
                            ? "EVALUATING"
                            : q.status}{" "}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {q.createdAt?.split("T")[0]}
                      </td>
                    </tr>
                  ))}{" "}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No quotations found.
                </div>
              )}{" "}
            </div>
          )}{" "}
        </CardContent>
      </Card>
    </div>
  );
}
