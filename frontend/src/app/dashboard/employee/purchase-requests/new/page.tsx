"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createPR, submitPR } from "@/lib/api";
export default function NewPurchaseRequestPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "",
    budget: "",
    justification: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.urgency) e.urgency = "Please select urgency level";
    if (!form.budget || Number(form.budget) <= 0)
      e.budget = "Enter a valid budget amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const pr = await createPR({
        title: form.title,
        description: form.description,
        requestedBy: user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.email || "Unknown",
        department: form.category,
        urgency: form.urgency,
        items: [
          {
            itemName: form.title,
            description: form.description,
            quantity: 1,
            unitPrice: Number(form.budget),
          },
        ],
      });
      await submitPR(pr.id);
      router.push("/dashboard/employee/purchase-requests");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create purchase request");
    } finally {
      setSubmitting(false);
    }
  }
  async function handleSaveDraft() {
    setSubmitting(true);
    setError("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await createPR({
        title: form.title,
        description: form.description,
        requestedBy: user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.email || "Unknown",
        department: form.category,
        urgency: form.urgency,
        items: [
          {
            itemName: form.title,
            description: form.description,
            quantity: 1,
            unitPrice: Number(form.budget) || 0,
          },
        ],
      });
      router.push("/dashboard/employee/purchase-requests");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSubmitting(false);
    }
  }
  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  }
  const inputClass = (field: string) =>
    `flex h-10 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300 ${
      errors[field] ? "border-destructive" : "border-card-border"
    }`;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          New Purchase Request
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit a new purchase request for approval
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Request Details</CardTitle>
          <CardDescription>
            Fill in the details below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Dell UltraSharp 27 inch Monitor"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the item or service you need, including specifications, quantity, and any relevant details..."
              className={
                inputClass("description") +
                " h-auto min-h-[100px] resize-y pt-2"
              }
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                className={inputClass("category") + " cursor-pointer"}
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                <option value="">Select a category</option>
                <option value="IT_EQUIPMENT">IT Equipment</option>
                <option value="OFFICE_SUPPLIES">Office Supplies</option>
                <option value="FURNITURE">Furniture</option>
                <option value="SOFTWARE">Software & Licenses</option>
                <option value="SERVICES">Services & Consulting</option>
                <option value="TRAINING">Training & Development</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency *</Label>
              <select
                id="urgency"
                className={inputClass("urgency") + " cursor-pointer"}
                value={form.urgency}
                onChange={(e) => setField("urgency", e.target.value)}
              >
                <option value="">Select urgency</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              {errors.urgency && (
                <p className="text-xs text-destructive">{errors.urgency}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={form.budget}
                onChange={(e) => setField("budget", e.target.value)}
              />
            </div>
            {errors.budget && (
              <p className="text-xs text-destructive">{errors.budget}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="justification">Justification</Label>
            <textarea
              id="justification"
              rows={4}
              placeholder="Explain why this purchase is necessary."
              className={
                inputClass("justification") +
                " h-auto min-h-[100px] resize-y pt-2"
              }
              value={form.justification}
              onChange={(e) => setField("justification", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
