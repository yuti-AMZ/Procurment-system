"use client";
import { useState, useEffect } from "react";
import { getPendingUsers, approveUser, getPendingCompanies, approveCompany } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminApprovalsPage() {
  const [tab, setTab] = useState<"users" | "companies">("companies");
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "users") {
        const data = await getPendingUsers();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        const data = await getPendingCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleUserApproval = async (userId: number, approved: boolean) => {
    setActionLoading(userId);
    try {
      await approveUser(userId, approved);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompanyApproval = async (companyId: number, approved: boolean) => {
    setActionLoading(companyId);
    try {
      await approveCompany(companyId, approved);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and approve or reject pending registrations.</p>
      </div>
      <div className="flex gap-2 border-b border-card-border pb-2">
        <button onClick={() => setTab("companies")} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "companies" ? "text-gold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground"}`}>Company Registrations {companies.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-gold/20 text-gold rounded-full">{companies.length}</span>}</button>
        <button onClick={() => setTab("users")} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "users" ? "text-gold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground"}`}>Individual Users {users.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-gold/20 text-gold rounded-full">{users.length}</span>}</button>
      </div>
      {error && (<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>)}
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : tab === "companies" ? (
        companies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No Pending Companies</h3>
            <p className="text-sm text-muted-foreground">All company registrations have been processed.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-card-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Company</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Admin</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Industry</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>{companies.map((c: any) => (
                <tr key={c.id} className="border-b border-card-border last:border-0">
                  <td className="p-4 text-sm font-medium">{c.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{c.email}</td>
                  <td className="p-4 text-sm text-muted-foreground">{c.adminName || "-"}<br /><span className="text-xs">{c.adminEmail}</span></td>
                  <td className="p-4 text-sm"><span className="px-2 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">{c.industry || "-"}</span></td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={actionLoading === c.id} onClick={() => handleCompanyApproval(c.id, true)}>Approve</Button>
                    <Button size="sm" variant="destructive" disabled={actionLoading === c.id} onClick={() => handleCompanyApproval(c.id, false)}>Reject</Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      ) : (
        users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No Pending Users</h3>
            <p className="text-sm text-muted-foreground">All user registrations have been processed.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-card-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Registered</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>{users.map((user: any) => (
                <tr key={user.id} className="border-b border-card-border last:border-0">
                  <td className="p-4 text-sm font-medium">{user.firstName} {user.lastName}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-4 text-sm"><span className="px-2 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">{user.role}</span></td>
                  <td className="p-4 text-sm text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={actionLoading === user.id} onClick={() => handleUserApproval(user.id, true)}>Approve</Button>
                    <Button size="sm" variant="destructive" disabled={actionLoading === user.id} onClick={() => handleUserApproval(user.id, false)}>Reject</Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}