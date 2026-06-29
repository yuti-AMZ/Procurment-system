"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
const logs = [
  {
    id: 1,
    user: "admin@procureai.com",
    action: "User login",
    resource: "auth",
    detail: "Successful login",
    timestamp: "2026-06-27 09:15:23",
  },
  {
    id: 2,
    user: "jane@company.com",
    action: "Created PR",
    resource: "PR-1042",
    detail: "Created new purchase request",
    timestamp: "2026-06-27 09:10:12",
  },
  {
    id: 3,
    user: "mike@company.com",
    action: "Approved PR",
    resource: "PR-1040",
    detail: "Approved purchase request",
    timestamp: "2026-06-27 08:45:00",
  },
  {
    id: 4,
    user: "supplier@abcsupplies.com",
    action: "Submitted Quotation",
    resource: "RFQ-023",
    detail: "Submitted quotation for RFQ",
    timestamp: "2026-06-26 16:30:45",
  },
  {
    id: 5,
    user: "admin@procureai.com",
    action: "Created User",
    resource: "Users",
    detail: "Created new user sarah@company.com",
    timestamp: "2026-06-26 14:22:10",
  },
  {
    id: 6,
    user: "system",
    action: "Backup",
    resource: "Database",
    detail: "Automated daily backup completed",
    timestamp: "2026-06-26 03:00:00",
  },
  {
    id: 7,
    user: "jane@company.com",
    action: "Updated PR",
    resource: "PR-1041",
    detail: "Updated draft purchase request",
    timestamp: "2026-06-25 11:05:33",
  },
  {
    id: 8,
    user: "admin@procureai.com",
    action: "Role Change",
    resource: "Users",
    detail: "Changed user role: bob@company.com → MANAGER",
    timestamp: "2026-06-25 10:00:00",
  },
];
export default function AdminAuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold ">Audit Logs</h1>{" "}
        <p className="text-sm text-muted-foreground">
          System activity and security events
        </p>{" "}
      </div>{" "}
      <div className="flex gap-3">
        <Input placeholder="Search logs..." className="max-w-sm" />{" "}
        <select className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground">
          <option>All Actions</option> <option>Login</option>{" "}
          <option>Created</option> <option>Updated</option>{" "}
          <option>Deleted</option>{" "}
        </select>{" "}
      </div>{" "}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    User
                  </th>{" "}
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Action
                  </th>{" "}
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Resource
                  </th>{" "}
                  <th className="text-left p-4 text-muted-foreground font-medium">
                    Detail
                  </th>{" "}
                  <th className="text-right p-4 text-muted-foreground font-medium">
                    Timestamp
                  </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-card-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {log.user}
                    </td>{" "}
                    <td className="p-4">
                      <span className="text-gold">{log.action}</span>
                    </td>{" "}
                    <td className="p-4 text-muted-foreground">
                      {log.resource}
                    </td>{" "}
                    <td className="p-4 text-muted-foreground max-w-xs truncate">
                      {log.detail}
                    </td>{" "}
                    <td className="p-4 text-right text-muted-foreground text-xs">
                      {log.timestamp}
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
