"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n-provider";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useState } from "react";
import { register } from "@/lib/auth";
type Role = "EMPLOYEE" | "MANAGER" | "PROCUREMENT" | "SUPPLIER";
const ROLES: { value: Role; icon: string }[] = [
  {
    value: "EMPLOYEE",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    value: "MANAGER",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    value: "PROCUREMENT",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    value: "SUPPLIER",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
  },
];
export default function SignupPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "" as Role | "",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) {
      setError("Please select a role");
      return;
    }
    setLoading(true);
    setError("");
    setValidationErrors({});
    try {
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (result.ok) {
        setSuccess(true);
      } else {
        if (result.details && typeof result.details === "object") {
          setValidationErrors(result.details);
        }
        setError(result.error || t("signup.errorGeneric"));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("signup.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />
        <div className="relative w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Registration Successful</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created and is now pending admin approval.
            You will be able to log in once an administrator approves your account.
          </p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
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
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gold">
            ProcurAI
          </Link>
          <h1 className="text-2xl font-semibold mt-6 mb-2">
            {t("signup.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("signup.subtitle")}
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("signup.firstNameLabel")}</Label>
                <Input
                  id="firstName"
                  placeholder={t("signup.firstNamePlaceholder")}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-xs text-destructive">{validationErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("signup.lastNameLabel")}</Label>
                <Input
                  id="lastName"
                  placeholder={t("signup.lastNamePlaceholder")}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-destructive">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("signup.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("signup.emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              {validationErrors.email && (
                <p className="text-xs text-destructive">{validationErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("signup.passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("signup.passwordPlaceholder")}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("signup.passwordHint")}
              </p>
              {validationErrors.password && (
                <p className="text-xs text-destructive">{validationErrors.password}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label>{t("signup.roleLabel")}</Label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, icon }) => {
                  const selected = form.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all cursor-pointer ${
                        selected
                          ? "border-gold bg-gold/10 shadow-[0_0_12px_-4px_#c9a84c]"
                          : "border-card-border bg-muted/30 hover:border-gold/50 hover:bg-gold/5"
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${selected ? "text-gold" : "text-muted-foreground"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                      </svg>
                      <span className={`text-sm font-medium ${selected ? "text-gold" : "text-foreground"}`}>
                        {t(`signup.role${value.charAt(0) + value.slice(1).toLowerCase()}`)}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {t(`signup.role${value.charAt(0) + value.slice(1).toLowerCase()}Desc`)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : t("signup.submit")}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            {t("signup.agree")}{" "}
            <a href="#" className="text-gold hover:underline">
              {t("signup.terms")}
            </a>{" "}
            {t("signup.and")}{" "}
            <a href="#" className="text-gold hover:underline">
              {t("signup.privacy")}
            </a>
            .
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          {t("signup.hasAccount")}{" "}
          <Link href="/login" className="text-gold hover:underline font-medium">
            {t("signup.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
