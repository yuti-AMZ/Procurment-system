"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const stats = [
  {
    title: "Open RFQs",
    value: "5",
    change: "+2 this week",
    changeType: "positive" as const,
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    title: "My Quotations",
    value: "12",
    change: "4 submitted, 8 drafts",
    changeType: "neutral" as const,
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Awards",
    value: "3",
    change: "4,500 total value",
    changeType: "positive" as const,
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Invoices",
    value: "8",
    change: "3 pending, 2,400 total",
    changeType: "neutral" as const,
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  },
];
const recentActivity = [
  {
    action: "RFQ-042 — Office Supplies — closing in 5 days",
    time: "1 hour ago",
    type: "rfq",
  },
  {
    action: "Quotation Q-023 status changed to EVALUATING",
    time: "3 hours ago",
    type: "quotation",
  },
  {
    action: "New award: PO-015 — IT Equipment — 5,000",
    time: "1 day ago",
    type: "award",
  },
  {
    action: "Invoice INV-009 was APPROVED for payment",
    time: "2 days ago",
    type: "invoice",
  },
  {
    action: "RFQ-040 — Packaging Materials — invitation received",
    time: "3 days ago",
    type: "rfq",
  },
  {
    action: "Quotation Q-019 was REJECTED",
    time: "4 days ago",
    type: "quotation",
  },
];
export default function SupplierDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Supplier Dashboard
        </h1>{" "}
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, partner. Here's your overview.
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const colors = {
            positive: "text-green-500",
            negative: "text-destructive",
            neutral: "text-muted-foreground",
          };
          return (
            <div
              key={i}
              className="rounded-xl border border-card-border bg-card p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {s.title}
                  </p>{" "}
                  <p className="text-2xl font-bold text-foreground">
                    {s.value}
                  </p>{" "}
                  {s.change && (
                    <p
                      className={`text-xs font-medium ${colors[s.changeType]}`}
                    >
                      {s.change}
                    </p>
                  )}{" "}
                </div>{" "}
                <div className="rounded-lg bg-gold/10 p-3">
                  <svg
                    className="w-5 h-5 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={s.icon}
                    />{" "}
                  </svg>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="">Quick Actions</CardTitle>{" "}
        </CardHeader>{" "}
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/supplier/rfqs"
              className="group rounded-xl border border-card-border bg-muted/30 p-4 transition-all hover:border-gold/30 hover:bg-gold/5"
            >
              <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                Browse Open RFQs
              </h3>{" "}
              <p className="text-xs text-muted-foreground mt-1">
                View and respond to active requests for quotation
              </p>{" "}
            </Link>{" "}
            <Link
              href="/dashboard/supplier/quotations/new"
              className="group rounded-xl border border-card-border bg-muted/30 p-4 transition-all hover:border-gold/30 hover:bg-gold/5"
            >
              <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                Submit a Quotation
              </h3>{" "}
              <p className="text-xs text-muted-foreground mt-1">
                Prepare and submit your quote for an open RFQ
              </p>{" "}
            </Link>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="">Recent Activity</CardTitle>{" "}
        </CardHeader>{" "}
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-gold/60 shrink-0" />{" "}
                <span className="text-foreground">{item.action}</span>{" "}
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {item.time}
                </span>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
