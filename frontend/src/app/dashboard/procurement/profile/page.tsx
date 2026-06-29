"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser, getUser, updateUser } from "@/lib/api";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}
export default function ProfilePage() {
  const localUser = getLocalUser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
  const id = user?.id || localUser.id;
  const initials = user ? `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}` : "??";
  const name = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const email = user?.email || "";
  const role = user?.role || "";
  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateUser(Number(id), { phone, jobTitle }).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };
  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">My Profile</h1><p className="text-sm text-muted-foreground mt-1">Manage your account information</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-gold">{initials}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{name}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold/20 text-gold border border-gold/30">{role}</span>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">First Name</label><Input value={user?.firstName || ""} disabled /></div>
                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">Last Name</label><Input value={user?.lastName || ""} disabled /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">Email</label><Input value={email} disabled /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">Phone Number</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">Job Title</label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">Current Password</label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">New Password</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" /></div>
                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground">Confirm New Password</label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" /></div>
              </div>
              <div className="flex items-center gap-3 pt-2"><Button variant="outline">Update Password</Button></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
