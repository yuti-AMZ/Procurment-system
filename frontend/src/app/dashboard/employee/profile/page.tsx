"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n-provider";
import { getUser, updateUser } from "@/lib/api";
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
export default function ProfilePage() {
  const { t } = useI18n();
  const user = getCurrentUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const handleSave = async () => {
    if (!user.id) return;
    setSaving(true);
    try {
      await updateUser(Number(user.id), { phone, jobTitle }).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("portal.employee.profile.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("portal.employee.profile.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-gold">{initials}</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {profile?.firstName || ""} {profile?.lastName || ""}
            </h2>
            <p className="text-sm text-muted-foreground">{jobTitle || profile?.jobTitle || ""}</p>
            <p className="text-xs text-muted-foreground mt-1">{profile?.departmentName || ""}</p>
            <div className="mt-4 w-full pt-4 border-t border-card-border">
              <p className="text-xs text-muted-foreground">{t("portal.employee.profile.email")}</p>
              <p className="text-sm text-foreground">{profile?.email || user.email || ""}</p>
            </div>
            <div className="mt-3 w-full">
              <p className="text-xs text-muted-foreground">{t("portal.employee.profile.role")}</p>
              <p className="text-sm text-foreground">{profile?.role || user.role || ""}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="">{t("portal.employee.profile.editTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("portal.employee.profile.firstName")}</Label>
                <Input id="firstName" value={profile?.firstName || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("portal.employee.profile.lastName")}</Label>
                <Input id="lastName" value={profile?.lastName || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("portal.employee.profile.emailLabel")}</Label>
              <Input id="email" value={profile?.email || user.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("portal.employee.profile.phoneLabel")}</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">{t("portal.employee.profile.jobTitleLabel")}</Label>
                <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{t("portal.employee.profile.deptLabel")}</Label>
                <Input id="department" value={profile?.departmentName || ""} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : saved ? "Saved!" : t("portal.employee.profile.save")}</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
