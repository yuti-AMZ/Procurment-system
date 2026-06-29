"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
const stats = [
  {
    title: "Total Users",
    value: "156",
    change: "12 new this month",
    changeType: "positive" as const,
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: "Active Users",
    value: "142",
    change: "91% active rate",
    changeType: "positive" as const,
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Departments",
    value: "8",
    change: "2 new this quarter",
    changeType: "neutral" as const,
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Suppliers",
    value: "24",
    change: "+2 this month",
    changeType: "positive" as const,
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
];
const recentRegistrations = [
  {
    name: "Alice Johnson",
    email: "alice.j@company.com",
    role: "Employee",
    department: "Engineering",
    date: "2 hours ago",
  },
  {
    name: "Bob Smith",
    email: "bob.s@company.com",
    role: "Manager",
    department: "Finance",
    date: "5 hours ago",
  },
  {
    name: "Carol White",
    email: "carol.w@company.com",
    role: "Employee",
    department: "HR",
    date: "1 day ago",
  },
  {
    name: "David Lee",
    email: "david.l@company.com",
    role: "Procurement",
    department: "Operations",
    date: "2 days ago",
  },
  {
    name: "Eva Martinez",
    email: "eva.m@company.com",
    role: "Supplier",
    department: "External",
    date: "3 days ago",
  },
];
const systemHealth = [
  {
    label: "API Response Time",
    status: "Normal",
    value: "124ms",
    color: "text-green-500",
  },
  {
    label: "Database",
    status: "Healthy",
    value: "98% uptime",
    color: "text-green-500",
  },
  {
    label: "Storage",
    status: "Warning",
    value: "72% used",
    color: "text-yellow-500",
  },
  {
    label: "Email Service",
    status: "Operational",
    value: "All queues clear",
    color: "text-green-500",
  },
];
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>{" "}
        <p className="text-sm text-muted-foreground mt-1">
          System overview and management
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="">Recent Registrations</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                      Name
                    </th>{" "}
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                      Email
                    </th>{" "}
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                      Role
                    </th>{" "}
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                      Dept
                    </th>{" "}
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                      Created
                    </th>{" "}
                  </tr>{" "}
                </thead>{" "}
                <tbody>
                  {recentRegistrations.map((u, i) => (
                    <tr
                      key={i}
                      className="border-b border-card-border/50 last:border-0"
                    >
                      <td className="py-3 px-2 text-foreground">{u.name}</td>{" "}
                      <td className="py-3 px-2 text-muted-foreground">
                        {u.email}
                      </td>{" "}
                      <td className="py-3 px-2">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-gold/30 text-gold">
                          {" "}
                          {u.role}{" "}
                        </span>{" "}
                      </td>{" "}
                      <td className="py-3 px-2 text-muted-foreground">
                        {u.department}
                      </td>{" "}
                      <td className="py-3 px-2 text-muted-foreground text-right">
                        {u.date}
                      </td>{" "}
                    </tr>
                  ))}{" "}
                </tbody>{" "}
              </table>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="">System Health</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="text-foreground">{item.label}</p>{" "}
                    <p className={`text-xs font-medium ${item.color}`}>
                      {item.status}
                    </p>{" "}
                  </div>{" "}
                  <span className="text-muted-foreground text-xs">
                    {item.value}
                  </span>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="">Quick Links</CardTitle>{" "}
        </CardHeader>{" "}
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/users">
              <Button variant="secondary" className="w-full justify-start">
                Manage Users
              </Button>{" "}
            </Link>{" "}
            <Link href="/dashboard/admin/roles">
              <Button variant="secondary" className="w-full justify-start">
                Roles & Permissions
              </Button>{" "}
            </Link>{" "}
            <Link href="/dashboard/admin/departments">
              <Button variant="secondary" className="w-full justify-start">
                Departments
              </Button>{" "}
            </Link>{" "}
            <Link href="/dashboard/admin/notifications">
              <Button variant="secondary" className="w-full justify-start">
                Notifications
              </Button>{" "}
            </Link>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
