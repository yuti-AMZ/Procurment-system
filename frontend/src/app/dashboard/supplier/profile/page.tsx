"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupplier, updateSupplier } from "@/lib/api";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}
export default function SupplierProfilePage() {
  const localUser = getLocalUser();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [form, setForm] = useState({
    companyName: "", registrationNumber: "", email: "", phone: "", address: "", category: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const sid = localUser.supplierId || (localUser.id ? Number(localUser.id) : null);
    if (sid) {
      setSupplierId(sid);
      getSupplier(sid)
        .then((data) => {
          setForm({
            companyName: data.companyName || "",
            registrationNumber: data.registrationNumber || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            category: data.category || "",
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });
  const handleSave = async () => {
    if (!supplierId) return;
    setSaving(true);
    try {
      await updateSupplier(supplierId, form as any).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setEditing(false);
    } finally { setSaving(false); }
  };
  const userInitials = localUser.firstName && localUser.lastName
    ? `${localUser.firstName[0]}${localUser.lastName[0]}`
    : localUser.email ? localUser.email[0].toUpperCase() : "SP";
  const userName = localUser.firstName ? `${localUser.firstName} ${localUser.lastName || ""}`.trim() : "";
  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your supplier company information</p>
        </div>
        <Button variant={editing ? "default" : "outline"} onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center text-3xl font-bold text-gold shrink-0">
              {userInitials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{userName}</h2>
              <p className="text-sm text-muted-foreground">{localUser.email || ""}</p>
              <p className="text-xs text-muted-foreground mt-1">{localUser.role || "Supplier"}</p>
            </div>
          </div>
          {form.companyName && (
            <div className="flex items-center gap-6 mb-8 p-4 rounded-lg bg-gold/5 border border-gold/20">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold shrink-0">
                {(form.companyName.match(/\b\w/g) || []).slice(0, 2).join("")}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{form.companyName}</h3>
                <p className="text-sm text-muted-foreground">{form.category}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Company Name</Label><Input value={form.companyName} onChange={update("companyName")} disabled={!editing} /></div>
            <div className="space-y-2"><Label>Registration Number</Label><Input value={form.registrationNumber} onChange={update("registrationNumber")} disabled={!editing} /></div>
            <div className="space-y-2"><Label>Contact Email</Label><Input value={form.email} onChange={update("email")} disabled={!editing} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={update("phone")} disabled={!editing} /></div>
            <div className="space-y-2"><Label>Business Category</Label><Input value={form.category} onChange={update("category")} disabled={!editing} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={form.address} onChange={update("address")} disabled={!editing} /></div>
          </div>
          {editing && (
            <div className="mt-6 flex items-center gap-3 justify-end">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
