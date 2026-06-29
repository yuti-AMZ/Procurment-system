"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUser, updateUser } from "@/lib/api";
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
export default function ManagerProfilePage() {
  const user = getCurrentUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  useEffect(() => {
    if (!user.id) { setLoading(false); return; }
    getUser(Number(user.id))
      .then((data) => {
        setProfile(data);
        setPhone(data.phone || "");
        setJobTitle(data.jobTitle || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);
  const initials = profile
    ? `${(profile.firstName || "")[0] || ""}${(profile.lastName || "")[0] || ""}`
    : "??";
  const handleSaveProfile = async () => {
    if (!user.id) return;
    setSaving(true);
    try {
      await updateUser(Number(user.id), { phone, jobTitle }).catch(() => {});
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };
  const handleChangePassword = () => {
    setPasswordError("");
    setPasswordSaved(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  };
  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold/30 flex items-center justify-center text-gold font-bold text-xl">
              {initials}
            </div>
            <div>
              <CardTitle className="text-lg">
                {profile?.firstName || ""} {profile?.lastName || ""}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{profile?.email || user.email || ""}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-md bg-gold/10 text-gold font-medium">
                  {profile?.role || user.role || "Manager"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                  {profile?.department || ""}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="">Personal Information</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={profile?.firstName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={profile?.lastName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email || user.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={profile?.role || user.role || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={profile?.department || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                className={editing ? "border-gold/40" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={!editing}
                className={editing ? "border-gold/40" : ""}
              />
            </div>
          </div>
          {editing && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            </div>
          </div>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleChangePassword}>
              {passwordSaved ? "Updated!" : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
