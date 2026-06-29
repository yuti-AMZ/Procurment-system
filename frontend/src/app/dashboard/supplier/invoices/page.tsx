"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const invoices = [
  {
    num: "INV-009",
    po: "PO-012",
    amount: 12400.0,
    due: "2026-07-15",
    status: "PAID" as const,
  },
  {
    num: "INV-010",
    po: "PO-014",
    amount: 8750.0,
    due: "2026-07-22",
    status: "APPROVED" as const,
  },
  {
    num: "INV-011",
    po: "PO-015",
    amount: 22300.0,
    due: "2026-07-30",
    status: "SUBMITTED" as const,
  },
  {
    num: "INV-012",
    po: "PO-013",
    amount: 5600.0,
    due: "2026-08-05",
    status: "DRAFT" as const,
  },
  {
    num: "INV-013",
    po: "PO-016",
    amount: 18500.0,
    due: "2026-07-10",
    status: "REJECTED" as const,
  },
  {
    num: "INV-014",
    po: "PO-012",
    amount: 4100.0,
    due: "2026-08-12",
    status: "APPROVED" as const,
  },
  {
    num: "INV-015",
    po: "PO-017",
    amount: 9500.0,
    due: "2026-07-28",
    status: "SUBMITTED" as const,
  },
  {
    num: "INV-016",
    po: "PO-018",
    amount: 14200.0,
    due: "2026-08-01",
    status: "DRAFT" as const,
  },
];
const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/10 text-blue-500",
  APPROVED: "bg-amber-500/10 text-amber-500",
  PAID: "bg-green-500/10 text-green-500",
  REJECTED: "bg-destructive/10 text-destructive",
};
export default function SupplierInvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>{" "}
          <p className="text-sm text-muted-foreground mt-1">
            Submit and track your invoices
          </p>{" "}
        </div>{" "}
        <Button variant="default">+ Upload New Invoice</Button>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Total
          </p>{" "}
          <p className="text-2xl font-bold text-foreground mt-1">
            {invoices.length}
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Pending
          </p>{" "}
          <p className="text-2xl font-bold text-amber-500 mt-1">
            {
              invoices.filter(
                (i) => i.status === "SUBMITTED" || i.status === "APPROVED",
              ).length
            }
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Paid
          </p>{" "}
          <p className="text-2xl font-bold text-green-500 mt-1">
            {invoices.filter((i) => i.status === "PAID").length}
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Total Amount
          </p>{" "}
          <p className="text-2xl font-bold text-gold mt-1">
            $
            {invoices
              .reduce((s, i) => s + i.amount, 0)
              .toLocaleString("en-US")}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Invoice #
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    PO Ref
                  </th>{" "}
                  <th className="text-right py-4 px-6 text-muted-foreground font-medium">
                    Amount
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Due Date
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Status
                  </th>{" "}
                  <th className="py-4 px-6" />{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.num}
                    className="border-b border-card-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-foreground">
                      {inv.num}
                    </td>{" "}
                    <td className="py-4 px-6 font-mono text-muted-foreground">
                      {inv.po}
                    </td>{" "}
                    <td className="py-4 px-6 text-right text-foreground font-medium">
                      $
                      {inv.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6 text-muted-foreground">
                      {new Date(inv.due).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${statusColors[inv.status]}`}
                      >
                        {" "}
                        {inv.status}{" "}
                      </span>{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <Button variant="ghost" size="sm">
                        Download PDF
                      </Button>{" "}
                    </td>{" "}
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
