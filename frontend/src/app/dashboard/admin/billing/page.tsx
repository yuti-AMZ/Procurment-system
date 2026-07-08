"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listAdminInvoices } from "@/lib/api";

interface Invoice {
  id: number;
  organizationName?: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string;
  planName?: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAdminInvoices()
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">Loading invoices...</div>;

  const mrr = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Revenue</h1>
        <p className="text-sm text-muted-foreground mt-1">Track MRR, invoices, refunds & financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">${mrr.toLocaleString()}</div><div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{invoices.length}</div><div className="text-sm text-muted-foreground">Total Invoices</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{invoices.filter(i => i.status === "PAID").length}</div><div className="text-sm text-muted-foreground">Paid Invoices</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").length}</div><div className="text-sm text-muted-foreground">Pending Payments</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Button variant="secondary" size="sm">Export Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Invoice #</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Organization</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Due</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-card-border/50 last:border-0">
                    <td className="py-3 px-3 font-medium text-foreground">#{inv.id}</td>
                    <td className="py-3 px-3 text-muted-foreground">{inv.organizationName ?? "Unknown"}</td>
                    <td className="py-3 px-3 text-muted-foreground">{inv.planName ?? "N/A"}</td>
                    <td className="py-3 px-3 text-muted-foreground">${inv.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-muted-foreground">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === "PAID" ? "bg-green-500/10 text-green-500 border border-green-500/30" : inv.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" : inv.status === "OVERDUE" ? "bg-red-500/10 text-red-500 border border-red-500/30" : "bg-gray-500/10 text-gray-500 border border-gray-500/30"}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
