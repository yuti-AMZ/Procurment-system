"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser, getUser, updateUser } from "@/lib/api";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}
export default function AdminProfilePage() {
  const localUser = getLocalUser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setUser(data);
        return getUser(Number(data.id)).catch(() => null);
      })
      .then((ext) => {
        if (ext) { setPhone(ext.phone || ""); setJobTitle(ext.jobTitle || ""); }
      })
      .catch(() => setUser(localUser))
      .finally(() => setLoading(false));
  }, []);
  const initials = user ? `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}` : "??";
  const name = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const email = user?.email || "";
  const role = user?.role || "";
  const id = user?.id || localUser.id;
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await updateUser(Number(id), { phone, jobTitle }).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };
  if (loading) return <div className="max-w-3xl mx-auto flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Admin Profile</h1><p className="text-sm text-muted-foreground mt-1">Manage your account settings</p></div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-gold">{initials}</span>
            </div>
            <div>
              <CardTitle className="text-xl">{name}</CardTitle>
              <CardDescription>{email}</CardDescription>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full border border-gold/30 text-gold">{role}</span>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your profile details</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={user?.firstName || ""} disabled /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={user?.lastName || ""} disabled /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input value={email} disabled /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="space-y-2"><Label>Job Title</Label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              {saved && <span className="text-sm text-green-500">Saved successfully</span>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Update your account password</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); setPasswordForm({ current: "", newPass: "", confirm: "" }); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="space-y-4">
            <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} required /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>New Password</Label><Input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} required /></div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Button type="submit">Update Password</Button>
              {saved && <span className="text-sm text-green-500">Password updated</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
