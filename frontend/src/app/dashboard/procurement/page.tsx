"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listPRs, listPOs, listRFQs, listInvoices } from "@/lib/api";
export default function ProcurementPage() {
  const [prCount, setPrCount] = useState(0);
  const [poCount, setPoCount] = useState(0);
  const [rfqCount, setRfqCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      listPRs("PENDING_APPROVAL"),
      listPOs("GENERATED,SENT"),
      listRFQs("OPEN"),
      listInvoices()
        .then(
          (inv: unknown[]) =>
            (inv as Record<string, unknown>[]).filter(
              (i) => i.status === "PENDING",
            ).length,
        )
        .catch(() => 0),
    ])
      .then(([pendingPrs, pendingPos, openRfqs, overdueInvs]) => {
        setPrCount(pendingPrs.length);
        setPoCount(pendingPos.length);
        setRfqCount(openRfqs.length);
        setInvoiceCount(overdueInvs as number);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const stats = [
    {
      label: "Pending PRs",
      value: prCount,
      change: "Awaiting processing",
      color: "text-amber-400",
      loading,
    },
    {
      label: "Active POs",
      value: poCount,
      change: "In transit / sent",
      color: "text-gold",
      loading,
    },
    {
      label: "Open RFQs",
      value: rfqCount,
      change: "Accepting quotations",
      color: "text-green-400",
      loading,
    },
    {
      label: "Pending Invoices",
      value: invoiceCount,
      change: "Awaiting approval",
      color: "text-red-400",
      loading,
    },
  ];
  const quickLinks = [
    {
      label: "Purchase Requests",
      href: "/dashboard/procurement/purchase-requests",
      desc: "Review and manage incoming PRs",
    },
    {
      label: "Purchase Orders",
      href: "/dashboard/procurement/purchase-orders",
      desc: "Create and track purchase orders",
    },
    {
      label: "RFQs",
      href: "/dashboard/procurement/rfqs",
      desc: "Manage requests for quotation",
    },
    {
      label: "Quotations",
      href: "/dashboard/procurement/quotations",
      desc: "Evaluate supplier quotations",
    },
    {
      label: "AI Insights",
      href: "/dashboard/procurement/ai-insights",
      desc: "AI supplier ranking & recommendations",
    },
    {
      label: "Invoices",
      href: "/dashboard/procurement/invoices",
      desc: "Process incoming invoices",
    },
    {
      label: "Suppliers",
      href: "/dashboard/procurement/suppliers",
      desc: "Supplier directory & performance",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground ">
            Procurement Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of procurement operations
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/procurement/purchase-requests/new">
            Create Purchase Request
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  {stat.loading ? (
                    <div className="h-8 w-12 bg-muted/30 rounded animate-pulse" />
                  ) : (
                    <p
                      className={`text-2xl font-bold text-foreground ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  )}{" "}
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}{" "}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-card-border bg-muted/30 p-4 transition-all hover:border-gold/30 hover:bg-gold/5"
              >
                <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                  {link.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {link.desc}
                </p>
              </Link>
            ))}{" "}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 bg-muted/20 rounded animate-pulse"
                />
              ))}{" "}
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              {rfqCount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-green-400" />
                  <span className="text-foreground">
                    {rfqCount} RFQ{rfqCount > 1 ? "s" : ""} still open for
                    supplier responses
                  </span>
                </div>
              )}
              {prCount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-amber-400" />
                  <span className="text-foreground">
                    {prCount} purchase request{prCount > 1 ? "s" : ""} pending
                    approval
                  </span>
                </div>
              )}
              {poCount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-gold/60" />
                  <span className="text-foreground">
                    {poCount} active purchase order{poCount > 1 ? "s" : ""} to
                    process
                  </span>
                </div>
              )}
              {invoiceCount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-red-400" />
                  <span className="text-foreground">
                    {invoiceCount} pending invoice{invoiceCount > 1 ? "s" : ""}{" "}
                    awaiting approval
                  </span>
                </div>
              )}
              {prCount === 0 &&
                poCount === 0 &&
                rfqCount === 0 &&
                invoiceCount === 0 && (
                  <span className="text-muted-foreground">
                    No recent activity
                  </span>
                )}{" "}
            </div>
          )}{" "}
        </CardContent>
      </Card>
    </div>
  );
}
