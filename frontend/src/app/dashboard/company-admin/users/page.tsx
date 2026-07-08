"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCompanyUsers } from "@/lib/api";
export default function CompanyUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    getCompanyUsers().then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);
  const filtered = users.filter((u: any) => {
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();
    return name.includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users in your organization</p>
        </div>
        <Link href="/dashboard/company-admin/users/invite"><Button>Invite User</Button></Link>
      </div>
      <Card>
        <CardHeader>
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Role</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={4} className="py-12 text-center text-muted-foreground">Loading...</td></tr>)}
                {!loading && filtered.length === 0 && (<tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No users found</td></tr>)}
                {filtered.map((u: any) => (
                  <tr key={u.id} className="border-b border-card-border/50 last:border-0 hover:bg-gold/5">
                    <td className="py-3 px-3 text-foreground font-medium">{u.firstName} {u.lastName}</td>
                    <td className="py-3 px-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full border border-gold/30 text-gold">{u.role}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.accountStatus === "APPROVED" ? "bg-green-500/10 text-green-500 border border-green-500/30" : u.accountStatus === "PENDING_APPROVAL" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" : "bg-destructive/10 text-destructive border border-destructive/30"}`}>
                        {u.accountStatus === "APPROVED" ? "ACTIVE" : u.accountStatus === "PENDING_APPROVAL" ? "PENDING" : "REJECTED"}
                      </span>
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