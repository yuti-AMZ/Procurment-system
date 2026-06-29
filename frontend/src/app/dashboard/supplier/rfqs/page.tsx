"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const categories = [
  "All",
  "Information Technology",
  "Office Supplies",
  "Packaging Materials",
  "Logistics",
  "Industrial Equipment",
];
const rfqs = [
  {
    id: "RFQ-042",
    title: "Office Supplies & Stationery",
    category: "Office Supplies",
    closing: "2026-07-02",
    status: "OPEN" as const,
  },
  {
    id: "RFQ-043",
    title: "IT Equipment & Peripherals",
    category: "Information Technology",
    closing: "2026-07-05",
    status: "OPEN" as const,
  },
  {
    id: "RFQ-044",
    title: "Packaging Materials Supply",
    category: "Packaging Materials",
    closing: "2026-06-29",
    status: "OPEN" as const,
  },
  {
    id: "RFQ-045",
    title: "Logistics & Freight Services",
    category: "Logistics",
    closing: "2026-07-18",
    status: "OPEN" as const,
  },
  {
    id: "RFQ-046",
    title: "Industrial Machinery Parts",
    category: "Industrial Equipment",
    closing: "2026-06-15",
    status: "CLOSED" as const,
  },
  {
    id: "RFQ-047",
    title: "Network Infrastructure Upgrade",
    category: "Information Technology",
    closing: "2026-07-22",
    status: "OPEN" as const,
  },
];
function daysUntil(dateStr: string) {
  const now = new Date();
  const closing = new Date(dateStr);
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
export default function SupplierRfqsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = rfqs.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || r.category === category;
    return matchSearch && matchCat;
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Open RFQs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and respond to active requests for quotation
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by RFQ ID or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                category === c
                  ? "bg-gold text-black"
                  : "bg-card border border-card-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              {c}{" "}
            </button>
          ))}{" "}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rfq) => {
          const days = daysUntil(rfq.closing);
          const closingSoon = rfq.status === "OPEN" && days >= 0 && days <= 7;
          return (
            <div
              key={rfq.id}
              className="rounded-xl border border-card-border bg-card p-5 transition-all duration-300 hover:border-gold/20"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-muted-foreground font-mono">
                  {rfq.id}
                </span>
                <div className="flex gap-2">
                  {closingSoon && (
                    <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold uppercase tracking-wider">
                      Closing Soon{" "}
                    </span>
                  )}{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      rfq.status === "OPEN"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {rfq.status}{" "}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {rfq.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                {rfq.category}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Closes: ,
                {new Date(rfq.closing).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {days > 0 && ` (${days} days)`}{" "}
              </p>
              {rfq.status === "OPEN" && (
                <Link href={`/dashboard/supplier/quotations/new?rfq=${rfq.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Submit Quotation
                  </Button>
                </Link>
              )}{" "}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No RFQs found matching your criteria.{" "}
          </div>
        )}{" "}
      </div>
    </div>
  );
}
