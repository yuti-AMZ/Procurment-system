"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { listPOs } from "@/lib/api";
interface POItem {
  id: number;
  poNumber: string;
  prNumber: string;
  vendorName: string;
  status: string;
  totalAmount: number;
  orderDate: string;
}
const statusStyles: Record<string, string> = {
  GENERATED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PARTIALLY_RECEIVED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  RECEIVED: "bg-green-500/20 text-green-400 border-green-500/30",
  CLOSED: "bg-green-700/20 text-green-600 border-green-700/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};
const formatCurrency = (n: number) => "$" + n.toLocaleString();
export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [orders, setOrders] = useState<POItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listPOs()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      o.prNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground ">
            Purchase Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} total orders
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="">All Orders</CardTitle>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Search orders..."
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
                <option value="GENERATED">Generated</option>
                <option value="SENT">Sent</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Received</option>
                <option value="CLOSED">Closed</option>
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
                    <th className="px-6 py-4">PO ID</th>
                    <th className="px-6 py-4">PR Ref</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((po) => (
                    <tr
                      key={po.id}
                      className="border-b border-card-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gold font-mono">
                        {po.poNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                        {po.prNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {po.vendorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[po.status] || ""}`}
                        >
                          {po.status}{" "}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {po.orderDate?.split("T")[0]}
                      </td>
                    </tr>
                  ))}{" "}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No purchase orders found.
                </div>
              )}{" "}
            </div>
          )}{" "}
        </CardContent>
      </Card>
    </div>
  );
}
