"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listInvoices } from "@/lib/api";
interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  supplierName: string;
  poNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}
const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  APPROVED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};
const formatCurrency = (n: number) => "$" + n.toLocaleString();
export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listInvoices()
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const overdueInvoices = invoices.filter((inv) => inv.status === "PENDING");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground ">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {invoices.length} total invoices ,
          {overdueInvoices.length > 0 && (
            <span className="text-red-400 ml-2">
              &middot; {overdueInvoices.length} pending
            </span>
          )}{" "}
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="">All Invoices</CardTitle>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search invoices..."
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
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
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">PO Ref</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-card-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gold font-mono">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {inv.supplierName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {inv.poNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[inv.status] || ""}`}
                        >
                          {inv.status}{" "}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {inv.createdAt?.split("T")[0]}
                      </td>
                    </tr>
                  ))}{" "}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No invoices found.
                </div>
              )}{" "}
            </div>
          )}{" "}
        </CardContent>
      </Card>
    </div>
  );
}
