"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useState } from "react";
export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [done, setDone] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return setDone(true);
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />{" "}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher /> <ThemeToggle />{" "}
      </div>{" "}
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Change Password</h1>{" "}
          <p className="text-muted-foreground text-sm">
            Update your account password.
          </p>{" "}
        </div>{" "}
        <div className="rounded-xl border border-card-border bg-card p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />{" "}
                </svg>{" "}
              </div>{" "}
              <h2 className="text-lg font-semibold mb-2">Password changed</h2>{" "}
              <p className="text-sm text-muted-foreground mb-4">
                Your password has been updated successfully.
              </p>{" "}
              <Link href="/login">
                <Button>Back to Sign In</Button>
              </Link>{" "}
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>{" "}
                <Input
                  id="current"
                  type="password"
                  placeholder="Enter current password"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  required
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>{" "}
                <Input
                  id="new"
                  type="password"
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  required
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>{" "}
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                />{" "}
              </div>{" "}
              <Button type="submit" className="w-full" size="lg">
                Change Password
              </Button>{" "}
            </form>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
