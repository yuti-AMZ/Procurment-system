"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const awards = [
  {
    id: "AWD-001",
    rfq: "RFQ-032",
    title: "Office Furniture Supply",
    value: 78500.0,
    date: "2026-05-10",
    status: "ACTIVE" as const,
  },
  {
    id: "AWD-002",
    rfq: "RFQ-035",
    title: "IT Equipment Bundle",
    value: 44200.0,
    date: "2026-06-05",
    status: "ACTIVE" as const,
  },
  {
    id: "AWD-003",
    rfq: "RFQ-029",
    title: "Warehouse Racking System",
    value: 61800.0,
    date: "2026-04-20",
    status: "COMPLETED" as const,
  },
  {
    id: "AWD-004",
    rfq: "RFQ-030",
    title: "Cleaning Services Contract",
    value: 32000.0,
    date: "2026-03-15",
    status: "TERMINATED" as const,
  },
];
const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500",
  COMPLETED: "bg-blue-500/10 text-blue-500",
  TERMINATED: "bg-destructive/10 text-destructive",
};
const totalValue = awards.reduce((sum, a) => sum + a.value, 0);
export default function SupplierAwardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Awards & Contracts
        </h1>{" "}
        <p className="text-sm text-muted-foreground mt-1">
          View all contracts awarded to your company
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Total Contracts
          </p>{" "}
          <p className="text-2xl font-bold text-foreground mt-1">
            {awards.length}
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Active
          </p>{" "}
          <p className="text-2xl font-bold text-green-500 mt-1">
            {awards.filter((a) => a.status === "ACTIVE").length}
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Total Value
          </p>{" "}
          <p className="text-2xl font-bold text-gold mt-1">
            ${totalValue.toLocaleString("en-US")}
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
                    Award ID
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    RFQ Ref
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Title
                  </th>{" "}
                  <th className="text-right py-4 px-6 text-muted-foreground font-medium">
                    Value
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Award Date
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Status
                  </th>{" "}
                  <th className="py-4 px-6" />{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {awards.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-card-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-foreground">
                      {a.id}
                    </td>{" "}
                    <td className="py-4 px-6 font-mono text-muted-foreground">
                      {a.rfq}
                    </td>{" "}
                    <td className="py-4 px-6 text-foreground font-medium">
                      {a.title}
                    </td>{" "}
                    <td className="py-4 px-6 text-right text-foreground">
                      $
                      {a.value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6 text-muted-foreground">
                      {new Date(a.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${statusColors[a.status]}`}
                      >
                        {" "}
                        {a.status}{" "}
                      </span>{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <Button variant="ghost" size="sm">
                        View PO
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
