"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  listRFQs,
  getAiDashboard,
  getSupplierRanking,
  getAiRecommendation,
  type AiDashboardStats,
  type SupplierRankingResult,
  type AiRecommendationResult,
} from "@/lib/api";

interface RfqOption {
  id: number;
  rfqNumber: string;
  title: string;
  status: string;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const recStyles: Record<string, string> = {
  "Strongly Recommended": "bg-green-500/20 text-green-400 border-green-500/30",
  Recommended: "bg-gold/20 text-gold border-gold/30",
  "Not Recommended": "bg-red-500/20 text-red-400 border-red-500/30",
};

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label} ({weight})</span>
        <span className="font-medium text-foreground">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function AiInsightsPage() {
  const [rfqs, setRfqs] = useState<RfqOption[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<number | "">("");
  const [dashboard, setDashboard] = useState<AiDashboardStats | null>(null);
  const [ranking, setRanking] = useState<SupplierRankingResult | null>(null);
  const [recommendation, setRecommendation] = useState<AiRecommendationResult | null>(null);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listRFQs()
      .then((data: RfqOption[]) => setRfqs(data))
      .catch(() => {})
      .finally(() => setLoadingRfqs(false));

    getAiDashboard()
      .then(setDashboard)
      .catch(() => {})
      .finally(() => setLoadingDashboard(false));
  }, []);

  const runAnalysis = useCallback(async (rfqId: number) => {
    setLoadingAnalysis(true);
    setError("");
    setRanking(null);
    setRecommendation(null);
    try {
      const [rankData, recData] = await Promise.all([
        getSupplierRanking(rfqId),
        getAiRecommendation(rfqId),
      ]);
      setRanking(rankData);
      setRecommendation(recData);
    } catch {
      setError("AI analysis failed. Please try again.");
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRfqId !== "") {
      runAnalysis(selectedRfqId);
    }
  }, [selectedRfqId, runAnalysis]);

  const selectedRfq = rfqs.find((r) => r.id === selectedRfqId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/15 text-gold border border-gold/25">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI-Powered
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supplier ranking using Price 50% · Delivery 30% · Reliability 20%
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedRfqId === "" || loadingAnalysis}
          onClick={() => selectedRfqId !== "" && runAnalysis(selectedRfqId)}
        >
          {loadingAnalysis ? "Analyzing…" : "Refresh analysis"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Dashboard stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Suppliers tracked", value: dashboard?.total_suppliers, loading: loadingDashboard },
          { label: "Quotations analyzed", value: dashboard?.total_quotations, loading: loadingDashboard },
          { label: "RFQs in AI store", value: dashboard?.total_rfqs, loading: loadingDashboard },
          { label: "Total spend tracked", value: dashboard ? formatCurrency(dashboard.total_spend) : undefined, loading: loadingDashboard },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              {stat.loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-gold">{stat.value ?? "—"}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RFQ selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select RFQ to analyze</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRfqs ? (
            <div className="h-10 bg-muted animate-pulse rounded-lg w-full max-w-md" />
          ) : (
            <select
              value={selectedRfqId}
              onChange={(e) => setSelectedRfqId(e.target.value ? Number(e.target.value) : "")}
              className="h-10 w-full max-w-md rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:border-gold/50"
            >
              <option value="">Choose an RFQ…</option>
              {rfqs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.rfqNumber} — {r.title} ({r.status})
                </option>
              ))}
            </select>
          )}
          {rfqs.length === 0 && !loadingRfqs && (
            <p className="text-sm text-muted-foreground mt-2">No RFQs yet. Create one and receive supplier quotations first.</p>
          )}
        </CardContent>
      </Card>

      {/* Recommendation highlight */}
      {recommendation?.recommended_supplier_name && (
        <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-xl font-semibold">{recommendation.recommended_supplier_name}</span>
              {recommendation.total_score != null && (
                <span className="text-3xl font-bold text-gold">{recommendation.total_score.toFixed(1)}</span>
              )}
              {recommendation.recommendation && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${recStyles[recommendation.recommendation] ?? recStyles.Recommended}`}>
                  {recommendation.recommendation}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{recommendation.summary}</p>
            {recommendation.reasons.length > 0 && (
              <ul className="grid sm:grid-cols-3 gap-3">
                {recommendation.reasons.map((r) => (
                  <li key={r.aspect} className="rounded-lg border border-card-border bg-card/50 p-3">
                    <p className="text-xs font-medium text-gold uppercase tracking-wide">{r.aspect}</p>
                    <p className="text-sm text-muted-foreground mt-1">{r.detail}</p>
                    {r.score != null && (
                      <p className="text-lg font-semibold mt-1">{r.score.toFixed(1)}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rankings table */}
      {selectedRfqId !== "" && (
        <Card>
          <CardHeader>
            <CardTitle>
              Supplier rankings
              {selectedRfq && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {selectedRfq.rfqNumber}
                </span>
              )}
            </CardTitle>
            {ranking?.summary && (
              <p className="text-sm text-muted-foreground">{ranking.summary}</p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loadingAnalysis ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Running AI analysis…</p>
                </div>
              </div>
            ) : ranking && ranking.rankings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm px-6">
                No quotations submitted for this RFQ yet. Once suppliers bid, rankings appear here automatically.
              </div>
            ) : ranking ? (
              <div className="divide-y divide-card-border">
                {ranking.rankings.map((item, index) => (
                  <div key={item.supplier_id} className="p-6 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? "bg-gold text-black" : "bg-muted text-muted-foreground"}`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{item.supplier_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.quotation_amount)}
                            {item.delivery_days != null && ` · ${item.delivery_days} days delivery`}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 grid sm:grid-cols-3 gap-3">
                        <ScoreBar label="Price" score={item.price_score} weight="50%" />
                        <ScoreBar label="Delivery" score={item.delivery_score} weight="30%" />
                        <ScoreBar label="Reliability" score={item.reliability_score} weight="20%" />
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-2xl font-bold text-gold">{item.total_score.toFixed(1)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs border ${recStyles[item.recommendation] ?? recStyles.Recommended}`}>
                          {item.recommendation}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 pl-11">{item.explanation}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Top performers from dashboard */}
      {dashboard && dashboard.top_suppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top performing suppliers (historical)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dashboard.top_suppliers.map((s) => (
                <div key={s.supplier_id} className="rounded-lg border border-card-border p-4">
                  <p className="font-medium truncate">{s.company_name}</p>
                  <p className="text-2xl font-bold text-gold mt-1">{s.score.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">{s.total_orders} orders completed</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
