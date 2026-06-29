"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
type Role = "ADMIN" | "PROCUREMENT" | "MANAGER" | "EMPLOYEE" | "SUPPLIER";
const ROLE_LINKS: Record<
  Role,
  { label: string; href: string; desc: string }[]
> = {
  EMPLOYEE: [
    {
      label: "Create Purchase Request",
      href: "/dashboard/employee/purchase-requests/new",
      desc: "Submit a new purchase request",
    },
    {
      label: "My Purchase Requests",
      href: "/dashboard/employee/purchase-requests",
      desc: "View and track your requests",
    },
    {
      label: "Notifications",
      href: "/dashboard/employee/notifications",
      desc: "Stay updated",
    },
  ],
  MANAGER: [
    {
      label: "Pending Approvals",
      href: "/dashboard/manager/approvals",
      desc: "Review requests awaiting approval",
    },
    {
      label: "Approval History",
      href: "/dashboard/manager/approvals/history",
      desc: "Past approvals and rejections",
    },
    {
      label: "Escalated Requests",
      href: "/dashboard/manager/approvals/escalated",
      desc: "Urgent items needing attention",
    },
  ],
  PROCUREMENT: [
    {
      label: "Purchase Requests",
      href: "/dashboard/procurement/purchase-requests",
      desc: "All incoming PRs",
    },
    {
      label: "Purchase Orders",
      href: "/dashboard/procurement/purchase-orders",
      desc: "Manage POs",
    },
    {
      label: "RFQs",
      href: "/dashboard/procurement/rfqs",
      desc: "Open and closed RFQs",
    },
    {
      label: "Quotations",
      href: "/dashboard/procurement/quotations",
      desc: "Supplier quotes",
    },
    {
      label: "Invoices",
      href: "/dashboard/procurement/invoices",
      desc: "Invoice management",
    },
    {
      label: "Suppliers",
      href: "/dashboard/procurement/suppliers",
      desc: "Supplier directory",
    },
  ],
  SUPPLIER: [
    {
      label: "Open RFQs",
      href: "/dashboard/supplier/rfqs",
      desc: "Browse open opportunities",
    },
    {
      label: "Submit Quotation",
      href: "/dashboard/supplier/quotations/new",
      desc: "Respond to an RFQ",
    },
    {
      label: "My Quotations",
      href: "/dashboard/supplier/quotations",
      desc: "Track your quotes",
    },
    {
      label: "Awards",
      href: "/dashboard/supplier/awards",
      desc: "Contracts awarded to you",
    },
    {
      label: "Invoices",
      href: "/dashboard/supplier/invoices",
      desc: "Upload and manage invoices",
    },
  ],
  ADMIN: [
    {
      label: "Users",
      href: "/dashboard/admin/users",
      desc: "Manage platform users",
    },
    {
      label: "Roles & Permissions",
      href: "/dashboard/admin/roles",
      desc: "Configure access control",
    },
    {
      label: "Departments",
      href: "/dashboard/admin/departments",
      desc: "Organize by department",
    },
    {
      label: "Notifications",
      href: "/dashboard/admin/notifications",
      desc: "System notifications",
    },
  ],
};
export default function DashboardPage() {
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    role?: Role;
  } | null>(null);
  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {
      /* ignore */
    }
  }, []);
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  const links = user.role ? (ROLE_LINKS[user.role] ?? []) : [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Requests"
          value="12"
          change="+3 this week"
          changeType="positive"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <StatsCard
          title="Approved"
          value="48"
          change="92% approval rate"
          changeType="positive"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          title="Pending Invoices"
          value="7"
          change="4,500 total"
          changeType="neutral"
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <StatsCard
          title="Active Suppliers"
          value="24"
          change="+2 this month"
          changeType="positive"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-card-border bg-muted/30 p-4 transition-all hover:border-gold/30 hover:bg-gold/5"
              >
                <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">
                  {link.label}{" "}
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
          <div className="space-y-4">
            {[
              {
                action: "Purchase Request #1042 was approved",
                time: "2 hours ago",
                type: "approval",
              },
              {
                action: "New quotation received for RFQ-023",
                time: "4 hours ago",
                type: "quotation",
              },
              {
                action: "Invoice INV-056 is due in 3 days",
                time: "1 day ago",
                type: "invoice",
              },
              {
                action: "Supplier ABC Corp updated their profile",
                time: "2 days ago",
                type: "supplier",
              },
              {
                action: "Purchase Order PO-089 was created",
                time: "3 days ago",
                type: "po",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-gold/60 shrink-0" />
                <span className="text-foreground">{item.action}</span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {item.time}
                </span>
              </div>
            ))}{" "}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
