"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInvoice, type InvoiceRequest } from "@/lib/api";
import { MINIO_BUCKET_NAME, buildMinioObjectKey } from "@/lib/storage";

const invoices = [
  {
    num: "INV-009",
    po: "PO-012",
    amount: 12400.0,
    due: "2026-07-15",
    status: "PAID" as const,
  },
  {
    num: "INV-010",
    po: "PO-014",
    amount: 8750.0,
    due: "2026-07-22",
    status: "APPROVED" as const,
  },
  {
    num: "INV-011",
    po: "PO-015",
    amount: 22300.0,
    due: "2026-07-30",
    status: "SUBMITTED" as const,
  },
  {
    num: "INV-012",
    po: "PO-013",
    amount: 5600.0,
    due: "2026-08-05",
    status: "DRAFT" as const,
  },
  {
    num: "INV-013",
    po: "PO-016",
    amount: 18500.0,
    due: "2026-07-10",
    status: "REJECTED" as const,
  },
  {
    num: "INV-014",
    po: "PO-012",
    amount: 4100.0,
    due: "2026-08-12",
    status: "APPROVED" as const,
  },
  {
    num: "INV-015",
    po: "PO-017",
    amount: 9500.0,
    due: "2026-07-28",
    status: "SUBMITTED" as const,
  },
  {
    num: "INV-016",
    po: "PO-018",
    amount: 14200.0,
    due: "2026-08-01",
    status: "DRAFT" as const,
  },
];
const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/10 text-blue-500",
  APPROVED: "bg-amber-500/10 text-amber-500",
  PAID: "bg-green-500/10 text-green-500",
  REJECTED: "bg-destructive/10 text-destructive",
};
export default function SupplierInvoicesPage() {
  const [showComposer, setShowComposer] = useState(false);
  const [companyId, setCompanyId] = useState("42");
  const [documentType, setDocumentType] = useState("proforma-invoices");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [poId, setPoId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const generatedObjectKey = useMemo(() => {
    if (!companyId || !documentType || !selectedFile) {
      return "";
    }
    return buildMinioObjectKey(companyId, documentType, selectedFile.name);
  }, [companyId, documentType, selectedFile]);

  useEffect(() => {
    setDocumentUrl(generatedObjectKey);
  }, [generatedObjectKey]);

  const resetComposer = () => {
    setShowComposer(false);
    setCompanyId("42");
    setDocumentType("proforma-invoices");
    setInvoiceNumber("");
    setPoId("");
    setPoNumber("");
    setSupplierId("");
    setSupplierName("");
    setTotalAmount("");
    setCurrency("USD");
    setNotes("");
    setSelectedFile(null);
    setDocumentUrl("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!invoiceNumber || !poId || !supplierId || !supplierName || !totalAmount || !selectedFile) {
      setError("Fill in the invoice fields and choose a file before saving.");
      return;
    }

    if (!documentUrl) {
      setError("Generate a MinIO object key first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: InvoiceRequest = {
        invoiceNumber,
        poId: Number(poId),
        poNumber: poNumber || undefined,
        supplierId: Number(supplierId),
        supplierName: supplierName || undefined,
        totalAmount: Number(totalAmount),
        currency,
        notes: notes || undefined,
        documentUrl,
      };
      await createInvoice(payload);
      setSuccess(`Saved invoice metadata. Upload the file to MinIO bucket ${MINIO_BUCKET_NAME} at ${documentUrl}.`);
      resetComposer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>{" "}
          <p className="text-sm text-muted-foreground mt-1">
            Submit and track your invoices
          </p>{" "}
        </div>{" "}
        <Button variant="default" onClick={() => setShowComposer((value) => !value)}>
          + Upload New Invoice
        </Button>{" "}
      </div>{" "}
      {showComposer && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Invoice Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Company ID</label>
              <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="42" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Document Type</label>
              <Input value={documentType} onChange={(e) => setDocumentType(e.target.value)} placeholder="proforma-invoices" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Invoice Number</label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-1001" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">PO ID</label>
              <Input value={poId} onChange={(e) => setPoId(e.target.value)} placeholder="12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">PO Number</label>
              <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="PO-012" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Supplier ID</label>
              <Input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder="7" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Supplier Name</label>
              <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Acme Supplies" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Total Amount</label>
              <Input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="12400" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Currency</label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-muted-foreground">Notes</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-muted-foreground">Invoice File</label>
              <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 md:col-span-2 space-y-2 text-sm text-muted-foreground">
              <div>Bucket: <span className="text-foreground">{MINIO_BUCKET_NAME}</span></div>
              <div>Object key preview: <span className="text-foreground break-all">{documentUrl || "Select a file to preview the MinIO path"}</span></div>
            </div>
            <div className="flex gap-3 md:col-span-2">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : "Save Invoice Metadata"}
              </Button>
              <Button variant="ghost" onClick={resetComposer}>Cancel</Button>
            </div>
            {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
            {success && <p className="text-sm text-green-500 md:col-span-2">{success}</p>}
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Total
          </p>{" "}
          <p className="text-2xl font-bold text-foreground mt-1">
            {invoices.length}
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Pending
          </p>{" "}
          <p className="text-2xl font-bold text-amber-500 mt-1">
            {
              invoices.filter(
                (i) => i.status === "SUBMITTED" || i.status === "APPROVED",
              ).length
            }
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Paid
          </p>{" "}
          <p className="text-2xl font-bold text-green-500 mt-1">
            {invoices.filter((i) => i.status === "PAID").length}
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Total Amount
          </p>{" "}
          <p className="text-2xl font-bold text-gold mt-1">
            $
            {invoices
              .reduce((s, i) => s + i.amount, 0)
              .toLocaleString("en-US")}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Invoice #
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    PO Ref
                  </th>{" "}
                  <th className="text-right py-4 px-6 text-muted-foreground font-medium">
                    Amount
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Due Date
                  </th>{" "}
                  <th className="text-left py-4 px-6 text-muted-foreground font-medium">
                    Status
                  </th>{" "}
                  <th className="py-4 px-6" />{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.num}
                    className="border-b border-card-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-foreground">
                      {inv.num}
                    </td>{" "}
                    <td className="py-4 px-6 font-mono text-muted-foreground">
                      {inv.po}
                    </td>{" "}
                    <td className="py-4 px-6 text-right text-foreground font-medium">
                      $
                      {inv.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6 text-muted-foreground">
                      {new Date(inv.due).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${statusColors[inv.status]}`}
                      >
                        {" "}
                        {inv.status}{" "}
                      </span>{" "}
                    </td>{" "}
                    <td className="py-4 px-6">
                      <Button variant="ghost" size="sm">
                        Download PDF
                      </Button>{" "}
                    </td>{" "}
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
