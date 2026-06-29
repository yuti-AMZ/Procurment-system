"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const statuses = [
  "All",
  "DRAFT",
  "SUBMITTED",
  "EVALUATING",
  "ACCEPTED",
  "REJECTED",
];
const quotations = [
  {
    id: "Q-019",
    rfq: "RFQ-038",
    amount: 12450.0,
    status: "REJECTED" as const,
    date: "2026-06-10",
  },
  {
    id: "Q-020",
    rfq: "RFQ-039",
    amount: 8750.0,
    status: "SUBMITTED" as const,
    date: "2026-06-14",
  },
  {
    id: "Q-021",
    rfq: "RFQ-040",
    amount: 22300.0,
    status: "EVALUATING" as const,
    date: "2026-06-18",
  },
  {
    id: "Q-022",
    rfq: "RFQ-041",
    amount: 5675.0,
    status: "DRAFT" as const,
    date: "2026-06-20",
  },
  {
    id: "Q-023",
    rfq: "RFQ-042",
    amount: 18900.0,
    status: "EVALUATING" as const,
    date: "2026-06-22",
  },
  {
    id: "Q-024",
    rfq: "RFQ-035",
    amount: 44200.0,
    status: "ACCEPTED" as const,
    date: "2026-06-05",
  },
  {
    id: "Q-025",
    rfq: "RFQ-043",
    amount: 3100.0,
    status: "DRAFT" as const,
    date: "2026-06-25",
  },
];
const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/10 text-blue-500",
  EVALUATING: "bg-amber-500/10 text-amber-500",
  ACCEPTED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-destructive/10 text-destructive",
};
export default function SupplierQuotationsPage() {
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All"
      ? quotations
      : quotations.filter((q) => q.status === filter);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Quotations</h1>{" "}
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all your submitted quotes
          </p>{" "}
        </div>{" "}
        <Link href="/dashboard/supplier/quotations/new">
          <Button variant="default">+ New Quotation</Button>{" "}
        </Link>{" "}
      </div>{" "}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${filter === s ? "bg-gold text-black" : "bg-card border border-card-border text-muted-foreground hover:border-gold/30 hover:text-foreground"}`}
          >
            {" "}
            {s}{" "}
          </button>
        ))}{" "}
      </div>{" "}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Quotation ID
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    RFQ Ref
                  </th>{" "}
                  <th className="text-right py-4 px-6 text-muted-foreground font-medium">
                    Amount
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Status
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Date
                  </th>{" "}
                  <th className="py-4 px-6" />{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {filtered.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-card-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-foreground">
                      {q.id}
                    </td>{" "}
                    <td className="py-4 px-6 font-mono text-muted-foreground">
                      {q.rfq}
                    </td>{" "}
                    <td className="py-4 px-6 text-right text-foreground font-medium">
                      $
                      {q.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${statusColors[q.status]}`}
                      >
                        {" "}
                        {q.status}{" "}
                      </span>{" "}
                    </td>{" "}
                    <td className="py-4 px-6 text-muted-foreground">
                      {new Date(q.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>{" "}
                    </td>{" "}
                  </tr>
                ))}{" "}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No quotations found.
                    </td>{" "}
                  </tr>
                )}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
