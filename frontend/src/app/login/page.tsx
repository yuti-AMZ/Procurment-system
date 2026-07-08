"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n-provider";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useState } from "react";
import { login } from "@/lib/auth";
export default function LoginPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const [rejectedAccount, setRejectedAccount] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPendingApproval(false);
    setRejectedAccount(false);
    try {
      const result = await login(form.email, form.password);
      if (result.ok) {
        window.location.href = "/dashboard";
      } else {
        if (result.accountStatus === "PENDING_APPROVAL") {
          setPendingApproval(true);
        } else if (result.accountStatus === "REJECTED") {
          setRejectedAccount(true);
        } else {
          setError(result.error || "Login failed");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };
  if (pendingApproval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />
        <div className="relative w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Account Pending Approval</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created but is waiting for an administrator to approve it.
            You will be notified once your account is approved.
          </p>
          <Button onClick={() => { setPendingApproval(false); setForm({ email: "", password: "" }); }}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }
  if (rejectedAccount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />
        <div className="relative w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Account Rejected</h2>
          <p className="text-muted-foreground mb-6">
            Your account registration was rejected by an administrator. Please contact your administrator for more information.
          </p>
          <Button onClick={() => { setRejectedAccount(false); setForm({ email: "", password: "" }); }}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gold">
            ProcurAI
          </Link>
          <h1 className="text-2xl font-semibold mt-6 mb-2">
            {t("login.title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("login.subtitle")}</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.passwordLabel")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gold hover:underline"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : t("login.submit")}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          {t("login.noAccount")}{" "}
          <Link
            href="/signup"
            className="text-gold hover:underline font-medium"
          >
            {t("login.createOne")}
          </Link>
        </p>
      </div>
    </div>
  );
}
