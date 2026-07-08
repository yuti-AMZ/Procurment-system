"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listSubscriptions, listPlans } from "@/lib/api";

interface Subscription {
  id: number;
  companyId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string;
  renewals: number;
  planName?: string;
  planPrice?: number;
  companyName?: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listSubscriptions(), listPlans()])
      .then(([s, p]) => { setSubs(s); setPlans(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">Loading subscriptions...</div>;

  const mrr = subs.filter(s => s.status === "ACTIVE").reduce((sum, s) => sum + (s.planPrice ?? 0), 0);
  const enterpriseCount = plans.filter(p => p.name?.toLowerCase().includes("enterprise")).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign plans, track renewals & payment status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{subs.filter(s => s.status === "ACTIVE").length}</div><div className="text-sm text-muted-foreground">Active Subscriptions</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">${mrr.toLocaleString()}</div><div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-foreground">{enterpriseCount}</div><div className="text-sm text-muted-foreground">Enterprise Customers</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Subscriptions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Organization</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Price</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Renewals</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Expires</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-card-border/50 last:border-0">
                    <td className="py-3 px-3 font-medium text-foreground">{s.companyName ?? `Company #${s.companyId}`}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.planName === "Enterprise" ? "bg-purple-500/10 text-purple-500 border border-purple-500/30" : s.planName === "Pro" ? "bg-blue-500/10 text-blue-500 border border-blue-500/30" : "bg-gray-500/10 text-gray-500 border border-gray-500/30"}`}>{s.planName ?? "Unknown"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border border-green-500/30" : s.status === "TRIAL" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" : "bg-red-500/10 text-red-500 border border-red-500/30"}`}>{s.status}</span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">${(s.planPrice ?? 0).toLocaleString()}/mo</td>
                    <td className="py-3 px-3 text-muted-foreground">{s.renewals}</td>
                    <td className="py-3 px-3 text-muted-foreground">{s.endDate ? new Date(s.endDate).toLocaleDateString() : "N/A"}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary">Upgrade</Button>
                        <Button size="sm" variant="secondary">Manage</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
