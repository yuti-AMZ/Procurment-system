"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listSuppliers } from "@/lib/api";
interface SupplierItem {
  id: number;
  companyName: string;
  category: string;
  email: string;
  phone: string;
  status: string;
  city: string;
  country: string;
}
const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  SUSPENDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};
export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    listSuppliers()
      .then(setSuppliers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const filtered = suppliers.filter(
    (s) =>
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground ">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {suppliers.length} registered suppliers
          </p>
        </div>
        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((supplier) => (
            <Card
              key={supplier.id}
              className="hover:border-gold/30 transition-all"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold">
                      {supplier.companyName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}{" "}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {supplier.companyName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {supplier.category || "—"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[supplier.status] || ""}`}
                  >
                    {supplier.status}{" "}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    <span>{supplier.email}</span>
                  </div>
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                      <span>{supplier.phone}</span>
                    </div>
                  )}{" "}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-card-border text-xs text-muted-foreground">
                  <span>
                    {supplier.city || "—"},
                    {supplier.city && supplier.country ? ", " : ""},
                    {supplier.country || ""}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}{" "}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No suppliers found.
        </div>
      )}{" "}
    </div>
  );
}
