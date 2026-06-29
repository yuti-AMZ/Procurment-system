"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold ">System Settings</h1>{" "}
        <p className="text-sm text-muted-foreground">
          Configure global platform settings
        </p>{" "}
      </div>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="">General</CardTitle>{" "}
        </CardHeader>{" "}
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Platform Name</Label> <Input defaultValue="ProcurAI" />{" "}
          </div>{" "}
          <div className="space-y-2">
            <Label>Support Email</Label>{" "}
            <Input defaultValue="support@procureai.com" />{" "}
          </div>{" "}
          <div className="space-y-2">
            <Label>Currency</Label>{" "}
            <select className="w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground">
              <option>USD ($)</option> <option>EUR (€)</option>{" "}
              <option>GBP (£)</option> <option>ETB (ብር)</option>{" "}
            </select>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="">Approval Rules</CardTitle>{" "}
        </CardHeader>{" "}
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Auto-approve threshold ($)</Label>{" "}
            <Input type="number" defaultValue="1000" />{" "}
            <p className="text-xs text-muted-foreground">
              Requests below this amount skip manager approval
            </p>{" "}
          </div>{" "}
          <div className="space-y-2">
            <Label>Escalation after (days)</Label>{" "}
            <Input type="number" defaultValue="3" />{" "}
            <p className="text-xs text-muted-foreground">
              Pending approvals escalate after this many days
            </p>{" "}
          </div>{" "}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notify"
              className="rounded border-card-border"
              defaultChecked
            />{" "}
            <Label htmlFor="notify">
              Notify admins of escalated requests
            </Label>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="">Email Notifications</CardTitle>{" "}
        </CardHeader>{" "}
        <CardContent className="space-y-3">
          {[
            "PR Created",
            "PR Approved",
            "PR Rejected",
            "PO Issued",
            "Invoice Received",
            "New Supplier Registration",
          ].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{item}</span>{" "}
              <input
                type="checkbox"
                className="rounded border-card-border"
                defaultChecked
              />{" "}
            </div>
          ))}{" "}
        </CardContent>{" "}
      </Card>{" "}
      <div className="flex justify-end gap-3">
        <Button variant="ghost">Reset</Button>{" "}
        <Button>Save Settings</Button>{" "}
      </div>{" "}
    </div>
  );
}
