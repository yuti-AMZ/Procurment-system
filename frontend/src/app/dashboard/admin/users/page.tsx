"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllUsers, toggleUserStatus } from "@/lib/api";
const roles = [
  "All",
  "ADMIN",
  "PROCUREMENT",
  "MANAGER",
  "EMPLOYEE",
  "SUPPLIER",
];
function formatDate(d: string | undefined) {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [toggling, setToggling] = useState<number | null>(null);
  const loadUsers = () => {
    getAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadUsers, []);
  const handleToggle = async (userId: number, currentlyEnabled: boolean) => {
    setToggling(userId);
    try {
      await toggleUserStatus(userId, !currentlyEnabled);
      loadUsers();
    } catch { /* ignore */ }
    finally { setToggling(null); }
  };
  const filtered = users.filter((u: any) => {
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View platform users
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex h-10 rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
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
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Loading users...</td></tr>)}
                {!loading && filtered.length === 0 && (<tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No users found matching your criteria</td></tr>)}
                {filtered.map((u: any) => {
                  const isActive = u.enabled !== false && u.accountStatus === "APPROVED";
                  return (
                  <tr key={u.id} className="border-b border-card-border/50 last:border-0 transition-colors hover:bg-gold/5">
                    <td className="py-3 px-3 text-foreground font-medium">{`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}</td>
                    <td className="py-3 px-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-3"><span className="text-xs px-2 py-0.5 rounded-full border border-gold/30 text-gold">{u.role}</span></td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-gray-500/10 text-gray-400 border border-gray-500/30"}`}>
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.accountStatus === "APPROVED" && (
                        <Button variant="ghost" size="sm" disabled={toggling === u.id} onClick={() => handleToggle(u.id, isActive)}>
                          {toggling === u.id ? "..." : isActive ? "Deactivate" : "Activate"}
                        </Button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
