"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listSuppliers, registerSupplier } from "@/lib/api";
export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: "", email: "", category: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    listSuppliers()
      .then(setSuppliers)
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const handleCreate = async () => {
    if (!form.companyName.trim() || !form.email.trim()) return;
    setCreating(true);
    setError("");
    try {
      await registerSupplier({
        companyName: form.companyName.trim(),
        registrationNumber: "",
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        category: form.category.trim() || undefined,
      });
      setForm({ companyName: "", email: "", category: "", phone: "" });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || "Failed to register supplier");
    } finally {
      setCreating(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Manage registered suppliers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Supplier"}
        </Button>
      </div>
      {showForm && (
        <Card className="border-gold/30">
          <CardHeader>
            <CardTitle>Register New Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Company Name *</label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="ABC Corp" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email *</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@abc.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. IT Hardware" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0000" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            <div className="mt-4">
              <Button onClick={handleCreate} disabled={creating || !form.companyName.trim() || !form.email.trim()}>
                {creating ? "Registering..." : "Register Supplier"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Category</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Contact</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Loading suppliers...</td></tr>)}
                {!loading && suppliers.length === 0 && (<tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No suppliers found</td></tr>)}
                {suppliers.map((s: any) => (
                  <tr key={s.id} className="border-b border-card-border last:border-0 hover:bg-muted/30">
                    <td className="p-4 font-medium text-foreground">{s.companyName}</td>
                    <td className="p-4 text-muted-foreground">{s.category || "-"}</td>
                    <td className="p-4 text-muted-foreground">{s.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === "APPROVED" || s.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" disabled>Edit</Button>
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
