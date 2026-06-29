"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface LineItem {
  id: number;
  item: string;
  description: string;
  quantity: number;
  unitPrice: number;
}
const rfqOptions = [
  { id: "RFQ-042", title: "Office Supplies & Stationery" },
  { id: "RFQ-043", title: "IT Equipment & Peripherals" },
  { id: "RFQ-044", title: "Packaging Materials Supply" },
  { id: "RFQ-047", title: "Network Infrastructure Upgrade" },
];
const defaultLineItem = (id: number): LineItem => ({
  id,
  item: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
});
export default function NewQuotationPage() {
  const [selectedRfq, setSelectedRfq] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem(1)]);
  const [deliveryTimeline, setDeliveryTimeline] = useState("");
  const [terms, setTerms] = useState("");
  const [nextId, setNextId] = useState(2);
  const addLineItem = () => {
    setLineItems([...lineItems, defaultLineItem(nextId)]);
    setNextId(nextId + 1);
  };
  const removeLineItem = (id: number) => {
    if (lineItems.length > 1)
      setLineItems(lineItems.filter((li) => li.id !== id));
  };
  const updateLineItem = (
    id: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setLineItems(
      lineItems.map((li) => (li.id === id ? { ...li, [field]: value } : li)),
    );
  };
  const totalAmount = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0,
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit Quotation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prepare and submit your quotation for an open RFQ
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="">RFQ Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Select RFQ</Label>
            <select
              value={selectedRfq}
              onChange={(e) => setSelectedRfq(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300"
            >
              <option value="" disabled>
                Choose an RFQ...
              </option>
              {rfqOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.title}
                </option>
              ))}{" "}
            </select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">
                    Item
                  </th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">
                    Description
                  </th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                    Qty
                  </th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                    Unit Price
                  </th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                    Total
                  </th>
                  <th className="py-2 px-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {lineItems.map((li) => (
                  <tr key={li.id} className="border-b border-card-border/50">
                    <td className="py-2 px-2">
                      <Input
                        value={li.item}
                        onChange={(e) =>
                          updateLineItem(li.id, "item", e.target.value)
                        }
                        placeholder="Item name"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        value={li.description}
                        onChange={(e) =>
                          updateLineItem(li.id, "description", e.target.value)
                        }
                        placeholder="Description"
                      />
                    </td>
                    <td className="py-2 px-2 w-20">
                      <Input
                        type="number"
                        min={1}
                        value={li.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            li.id,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-2 w-28">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={li.unitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            li.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="text-right"
                      />
                    </td>
                    <td className="py-2 px-2 text-right text-foreground font-medium">
                      $
                      {(li.quantity * li.unitPrice).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => removeLineItem(li.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
                      >
                        &times;{" "}
                      </button>
                    </td>
                  </tr>
                ))}{" "}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addLineItem}>
              + Add Line Item
            </Button>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                Total Amount:{" "}
              </span>
              <span className="text-xl font-bold text-gold">
                $
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <Label>Delivery Timeline</Label>
              <Input
                value={deliveryTimeline}
                onChange={(e) => setDeliveryTimeline(e.target.value)}
                placeholder="e.g. 14 days from PO issuance"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Terms & Conditions</Label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter your terms, warranty info, payment terms, etc..."
                rows={4}
                className="flex w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all duration-300 resize-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary">Save as Draft</Button>
            <Button>Submit Quotation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
