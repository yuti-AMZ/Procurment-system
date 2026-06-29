"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n-provider";
import { getPR, updatePR } from "@/lib/api";
export default function EditPRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notDraft, setNotDraft] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "",
    budget: "",
    justification: "",
  });
  useEffect(() => {
    getPR(Number(id))
      .then((pr) => {
        if (pr.status !== "DRAFT") {
          setNotDraft(true);
          return;
        }
        setForm({
          title: pr.title || "",
          description: pr.description || "",
          category: pr.department || "",
          urgency: pr.urgency || "",
          budget: String(Number(pr.totalAmount || 0).toFixed(2)),
          justification: "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }
  if (notDraft) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-serif text-foreground">{t("portal.employee.editPR.notDraft")}</h2>
        <p className="text-sm text-muted-foreground">{t("portal.employee.editPR.notDraftDesc")}</p>
        <Link href={`/dashboard/employee/purchase-requests/${id}`}>
          <Button variant="outline">{t("portal.employee.editPR.goBack")}</Button>
        </Link>
      </div>
    );
  }
  async function handleUpdate() {
    setSaving(true);
    setError("");
    try {
      await updatePR(Number(id), {
        title: form.title,
        description: form.description,
        department: form.category,
        urgency: form.urgency,
      });
      router.push(`/dashboard/employee/purchase-requests/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }
  const inputClass =
    "flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300";
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-foreground">{t("portal.employee.editPR.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("portal.employee.editPR.subtitle")} {id}</p>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("portal.employee.editPR.formTitle")}</CardTitle>
          <CardDescription>{t("portal.employee.editPR.formDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">{t("portal.employee.editPR.titleLabel")}</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("portal.employee.editPR.descLabel")}</Label>
            <textarea id="description" rows={4} className={inputClass + " h-auto min-h-[100px] resize-y pt-2"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t("portal.employee.editPR.categoryLabel")}</Label>
              <select id="category" className={inputClass + " cursor-pointer"} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                <option value="IT_EQUIPMENT">IT Equipment</option>
                <option value="OFFICE_SUPPLIES">Office Supplies</option>
                <option value="FURNITURE">Furniture</option>
                <option value="SOFTWARE">Software & Licenses</option>
                <option value="SERVICES">Services & Consulting</option>
                <option value="TRAINING">Training & Development</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">{t("portal.employee.editPR.urgencyLabel")}</Label>
              <select id="urgency" className={inputClass + " cursor-pointer"} value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="">Select urgency</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">{t("portal.employee.editPR.budgetLabel")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input id="budget" type="number" min="0" step="0.01" className="pl-7" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href={`/dashboard/employee/purchase-requests/${id}`}>
            <Button variant="outline">{t("portal.employee.editPR.cancel")}</Button>
          </Link>
          <Button onClick={handleUpdate} disabled={saving}>
            {saving ? "Saving..." : t("portal.employee.editPR.update")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
