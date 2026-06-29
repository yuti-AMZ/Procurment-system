"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
interface Permission {
  module: string;
  read: boolean;
  write: boolean;
}
interface RoleData {
  name: string;
  label: string;
  description: string;
  userCount: number;
  permissions: Permission[];
}
const rolesData: RoleData[] = [
  {
    name: "ADMIN",
    label: "Administrator",
    description: "Full system access with all administrative privileges",
    userCount: 3,
    permissions: [
      { module: "Purchase Requests", read: true, write: true },
      { module: "Purchase Orders", read: true, write: true },
      { module: "RFQs", read: true, write: true },
      { module: "Quotations", read: true, write: true },
      { module: "Invoices", read: true, write: true },
      { module: "Suppliers", read: true, write: true },
      { module: "Users & Roles", read: true, write: true },
      { module: "Reports", read: true, write: true },
    ],
  },
  {
    name: "PROCUREMENT",
    label: "Procurement Officer",
    description:
      "Manage procurement lifecycle including PRs, POs, RFQs, and supplier interactions",
    userCount: 8,
    permissions: [
      { module: "Purchase Requests", read: true, write: true },
      { module: "Purchase Orders", read: true, write: true },
      { module: "RFQs", read: true, write: true },
      { module: "Quotations", read: true, write: true },
      { module: "Invoices", read: true, write: true },
      { module: "Suppliers", read: true, write: true },
      { module: "Users & Roles", read: false, write: false },
      { module: "Reports", read: true, write: false },
    ],
  },
  {
    name: "MANAGER",
    label: "Department Manager",
    description:
      "Approve purchase requests and review departmental procurement activity",
    userCount: 12,
    permissions: [
      { module: "Purchase Requests", read: true, write: false },
      { module: "Purchase Orders", read: true, write: false },
      { module: "RFQs", read: true, write: false },
      { module: "Quotations", read: false, write: false },
      { module: "Invoices", read: true, write: false },
      { module: "Suppliers", read: true, write: false },
      { module: "Users & Roles", read: false, write: false },
      { module: "Reports", read: true, write: false },
    ],
  },
  {
    name: "EMPLOYEE",
    label: "Employee",
    description: "Create and track purchase requests for departmental needs",
    userCount: 97,
    permissions: [
      { module: "Purchase Requests", read: true, write: true },
      { module: "Purchase Orders", read: true, write: false },
      { module: "RFQs", read: false, write: false },
      { module: "Quotations", read: false, write: false },
      { module: "Invoices", read: true, write: false },
      { module: "Suppliers", read: true, write: false },
      { module: "Users & Roles", read: false, write: false },
      { module: "Reports", read: false, write: false },
    ],
  },
  {
    name: "SUPPLIER",
    label: "Supplier",
    description: "View RFQs, submit quotations, and manage invoices",
    userCount: 24,
    permissions: [
      { module: "Purchase Requests", read: false, write: false },
      { module: "Purchase Orders", read: true, write: false },
      { module: "RFQs", read: true, write: false },
      { module: "Quotations", read: true, write: true },
      { module: "Invoices", read: true, write: true },
      { module: "Suppliers", read: false, write: false },
      { module: "Users & Roles", read: false, write: false },
      { module: "Reports", read: false, write: false },
    ],
  },
];
function ToggleSwitch({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-9 h-5 rounded-full transition-colors duration-300 relative cursor-not-allowed ${
        checked ? "bg-gold/60" : "bg-card-border"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  );
}
export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Roles & Permissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure role-based access control for the platform
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rolesData.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{role.label}</CardTitle>
                  <CardDescription className="mt-1">
                    {role.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold">
                    {role.userCount}
                  </p>
                  <p className="text-xs text-muted-foreground">users</p>
                </div>
              </div>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full border border-gold/30 text-gold w-fit">
                {role.name}{" "}
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-card-border">
                  <span>Module</span>
                  <span className="text-center">Read</span>
                  <span className="text-center">Write</span>
                </div>
                {role.permissions.map((perm) => (
                  <div
                    key={perm.module}
                    className="grid grid-cols-3 gap-2 items-center text-sm"
                  >
                    <span className="text-foreground">{perm.module}</span>
                    <div className="flex justify-center">
                      <ToggleSwitch checked={perm.read} />
                    </div>
                    <div className="flex justify-center">
                      <ToggleSwitch checked={perm.write} />
                    </div>
                  </div>
                ))}{" "}
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full" disabled>
                  Edit Role
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}{" "}
      </div>
    </div>
  );
}
