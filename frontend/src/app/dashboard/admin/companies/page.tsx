"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllCompanies, approveCompany, adminCreateCompany } from "@/lib/api";
import type { CompanyRegisterRequest } from "@/lib/api";
export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CompanyRegisterRequest>({
    companyName: "", registrationNumber: "", companyEmail: "", phone: "", address: "", city: "", country: "", industry: "", adminFirstName: "", adminLastName: "", adminEmail: "", adminPassword: "",
  });

  const load = () => {
    getAllCompanies().then(setCompanies).catch(() => setCompanies([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleApprove = async (companyId: number, approved: boolean) => {
    setActionId(companyId);
    try { await approveCompany(companyId, approved); load(); } catch {}
    finally { setActionId(null); }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await adminCreateCompany(createForm);
      setShowCreate(false);
      setCreateForm({ companyName: "", registrationNumber: "", companyEmail: "", phone: "", address: "", city: "", country: "", industry: "", adminFirstName: "", adminLastName: "", adminEmail: "", adminPassword: "" });
      load();
    } catch {}
    finally { setCreating(false); }
  };

  const filtered = companies.filter((c: any) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage registered organizations on the platform</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Create Company</Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create New Company</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input value={createForm.companyName} onChange={e => setCreateForm({...createForm, companyName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Number</label>
                <Input value={createForm.registrationNumber} onChange={e => setCreateForm({...createForm, registrationNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Email</label>
                <Input type="email" value={createForm.companyEmail} onChange={e => setCreateForm({...createForm, companyEmail: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input value={createForm.phone ?? ""} onChange={e => setCreateForm({...createForm, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input value={createForm.industry ?? ""} onChange={e => setCreateForm({...createForm, industry: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input value={createForm.city ?? ""} onChange={e => setCreateForm({...createForm, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input value={createForm.country ?? ""} onChange={e => setCreateForm({...createForm, country: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input value={createForm.address ?? ""} onChange={e => setCreateForm({...createForm, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin First Name</label>
                <Input value={createForm.adminFirstName} onChange={e => setCreateForm({...createForm, adminFirstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Last Name</label>
                <Input value={createForm.adminLastName} onChange={e => setCreateForm({...createForm, adminLastName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <Input type="email" value={createForm.adminEmail} onChange={e => setCreateForm({...createForm, adminEmail: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Password</label>
                <Input type="password" value={createForm.adminPassword} onChange={e => setCreateForm({...createForm, adminPassword: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Company</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Industry</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Admin</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Registered</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Loading...</td></tr>)}
                {!loading && filtered.length === 0 && (<tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No companies found</td></tr>)}
                {filtered.map((c: any) => (
                  <tr key={c.id} className="border-b border-card-border/50 last:border-0 hover:bg-gold/5">
                    <td className="py-3 px-3 text-foreground font-medium">{c.name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{c.email}</td>
                    <td className="py-3 px-3 text-muted-foreground">{c.industry || "-"}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "APPROVED" ? "bg-green-500/10 text-green-500 border border-green-500/30" : c.status === "PENDING_APPROVAL" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" : c.status === "SUSPENDED" ? "bg-red-500/10 text-red-500 border border-red-500/30" : "bg-destructive/10 text-destructive border border-destructive/30"}`}>
                        {c.status === "PENDING_APPROVAL" ? "PENDING" : c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{c.adminName || "-"}</td>
                    <td className="py-3 px-3 text-muted-foreground">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        {c.status === "PENDING_APPROVAL" && (
                          <>
                            <Button variant="secondary" size="sm" disabled={actionId === c.id} onClick={() => handleApprove(c.id, true)}>
                              {actionId === c.id ? "..." : "Approve"}
                            </Button>
                            <Button variant="destructive" size="sm" disabled={actionId === c.id} onClick={() => handleApprove(c.id, false)}>
                              {actionId === c.id ? "..." : "Reject"}
                            </Button>
                          </>
                        )}
                        {c.status === "APPROVED" && (
                          <Button variant="ghost" size="sm" disabled={actionId === c.id} onClick={() => handleApprove(c.id, false)}>
                            {actionId === c.id ? "..." : "Suspend"}
                          </Button>
                        )}
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
