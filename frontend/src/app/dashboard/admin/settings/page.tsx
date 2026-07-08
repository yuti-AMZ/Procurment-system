"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listSettings, updateSetting } from "@/lib/api";

interface Setting {
  id: number;
  settingKey: string;
  settingValue: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platformName, setPlatformName] = useState("ProcurAI");
  const [supportEmail, setSupportEmail] = useState("support@procureai.com");
  const [currency, setCurrency] = useState("USD");
  const [autoApproveThreshold, setAutoApproveThreshold] = useState("1000");
  const [escalationDays, setEscalationDays] = useState("3");
  const [notifyEscalated, setNotifyEscalated] = useState(true);

  useEffect(() => {
    listSettings()
      .then((data: Setting[]) => {
        setSettings(data);
        data.forEach(s => {
          if (s.settingKey === "PLATFORM_NAME") setPlatformName(s.settingValue);
          if (s.settingKey === "SUPPORT_EMAIL") setSupportEmail(s.settingValue);
          if (s.settingKey === "CURRENCY") setCurrency(s.settingValue);
          if (s.settingKey === "AUTO_APPROVE_THRESHOLD") setAutoApproveThreshold(s.settingValue);
          if (s.settingKey === "ESCALATION_DAYS") setEscalationDays(s.settingValue);
          if (s.settingKey === "NOTIFY_ESCALATED") setNotifyEscalated(s.settingValue === "true");
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSetting({ PLATFORM_NAME: platformName, SUPPORT_EMAIL: supportEmail, CURRENCY: currency, AUTO_APPROVE_THRESHOLD: autoApproveThreshold, ESCALATION_DAYS: escalationDays, NOTIFY_ESCALATED: String(notifyEscalated) });
      const updated = await listSettings();
      setSettings(updated);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">System Settings</h1>
        <p className="text-sm text-muted-foreground">Configure global platform settings</p>
      </div>
      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input value={platformName} onChange={e => setPlatformName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <select className="w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="ETB">ETB (ብር)</option>
            </select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Approval Rules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Auto-approve threshold ($)</Label>
            <Input type="number" value={autoApproveThreshold} onChange={e => setAutoApproveThreshold(e.target.value)} />
            <p className="text-xs text-muted-foreground">Requests below this amount skip manager approval</p>
          </div>
          <div className="space-y-2">
            <Label>Escalation after (days)</Label>
            <Input type="number" value={escalationDays} onChange={e => setEscalationDays(e.target.value)} />
            <p className="text-xs text-muted-foreground">Pending approvals escalate after this many days</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="notify" className="rounded border-card-border" checked={notifyEscalated} onChange={e => setNotifyEscalated(e.target.checked)} />
            <Label htmlFor="notify">Notify admins of escalated requests</Label>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => window.location.reload()}>Reset</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
      </div>
    </div>
  );
}
