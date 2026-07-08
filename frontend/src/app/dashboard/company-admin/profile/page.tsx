"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/api";
export default function CompanyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your organization information</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Organization Details</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {user?.companyId && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><Label>Company ID</Label><p className="text-foreground">{user.companyId}</p></div>
              <div><Label>Company Name</Label><p className="text-foreground">{user.companyName || "-"}</p></div>
              <div><Label>Admin Email</Label><p className="text-foreground">{user.email}</p></div>
              <div><Label>Admin Name</Label><p className="text-foreground">{user.firstName} {user.lastName}</p></div>
              <div><Label>Role</Label><p className="text-foreground">{user.role}</p></div>
              <div><Label>Account Status</Label>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.accountStatus === "APPROVED" ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"}`}>
                  {user.accountStatus}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}