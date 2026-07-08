"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { listFeatures, toggleFeature } from "@/lib/api";

interface Feature {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    listFeatures()
      .then(setFeatures)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id: number, enabled: boolean) => {
    try {
      await toggleFeature(id, !enabled);
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !enabled } : f));
    } catch {}
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading features...</div>;

  const categories = ["All", ...new Set(features.map(f => f.category))];
  const filtered = category === "All" ? features : features.filter(f => f.category === category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feature Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Enable or disable platform-wide features</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${category === c ? "bg-gold text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(f => (
          <Card key={f.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{f.name}</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{f.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                </div>
                <button onClick={() => toggle(f.id, f.enabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ml-4 shrink-0 ${f.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.enabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
