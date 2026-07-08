"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listApiKeys, generateApiKey, revokeApiKey, listWebhooks, createWebhook, toggleWebhook } from "@/lib/api";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  status: string;
}

interface Webhook {
  id: number;
  url: string;
  events: string;
  status: string;
}

export default function ApiManagementPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [showGen, setShowGen] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([listApiKeys(), listWebhooks()])
      .then(([k, w]) => { setKeys(k); setWebhooks(w); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!newKeyName) return;
    try {
      const result = await generateApiKey(newKeyName, 1, 1);
      setNewKeyResult(result.key ?? "Key generated (check console)");
      setNewKeyName("");
      load();
    } catch {}
  };

  const handleRevoke = async (id: number) => {
    try { await revokeApiKey(id); load(); } catch {}
  };

  const handleAddWebhook = async () => {
    if (!newWebhookUrl) return;
    try {
      await createWebhook({ url: newWebhookUrl, events: newWebhookEvents || "pr.created" });
      setNewWebhookUrl("");
      setNewWebhookEvents("");
      load();
    } catch {}
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor usage, manage keys & webhooks</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>API Keys</CardTitle>
            <Button variant="secondary" size="sm" onClick={() => setShowGen(!showGen)}>Generate New Key</Button>
          </div>
        </CardHeader>
        <CardContent>
          {showGen && (
            <div className="flex gap-2 mb-4">
              <Input placeholder="Key name (e.g. Production)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="max-w-xs" />
              <Button size="sm" onClick={handleGenerate}>Generate</Button>
            </div>
          )}
          {newKeyResult && (
            <div className="mb-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-sm">
              <p className="font-medium text-green-500 mb-1">New API Key:</p>
              <code className="text-xs bg-background px-2 py-1 rounded break-all">{newKeyResult}</code>
              <p className="text-xs text-muted-foreground mt-1">Copy this key now — it won't be shown again.</p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Key</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Created</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Last Used</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-card-border/50 last:border-0">
                    <td className="py-3 px-3 font-medium text-foreground">{k.name}</td>
                    <td className="py-3 px-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{k.key?.slice(0, 12) ?? "sk-..."}...{k.key?.slice(-4)}</code>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td className="py-3 px-3 text-muted-foreground">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${k.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-red-500/10 text-red-500 border border-red-500/30"}`}>{k.status}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        {k.status === "ACTIVE" && <Button size="sm" variant="destructive" onClick={() => handleRevoke(k.id)}>Revoke</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No API keys yet. Generate one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Webhooks</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Input placeholder="https://example.com/webhook" value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} className="max-w-sm" />
            <Input placeholder="pr.created,pr.approved" value={newWebhookEvents} onChange={e => setNewWebhookEvents(e.target.value)} className="max-w-xs" />
            <Button size="sm" onClick={handleAddWebhook}>Add Webhook</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">URL</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Events</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((w) => (
                  <tr key={w.id} className="border-b border-card-border/50 last:border-0">
                    <td className="py-3 px-3 text-sm text-muted-foreground font-mono max-w-[300px] truncate">{w.url}</td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">{w.events}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-red-500/10 text-red-500 border border-red-500/30"}`}>{w.status}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button size="sm" variant="secondary" onClick={() => toggleWebhook(w.id, w.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}>
                        {w.status === "ACTIVE" ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {webhooks.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No webhooks configured. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
