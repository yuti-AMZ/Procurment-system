"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useState } from "react";
import { registerCompany } from "@/lib/api";
export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    registrationNumber: "",
    companyEmail: "",
    industry: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await registerCompany(form);
      if (result && result.userId) {
        setSuccess(true);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />
        <div className="relative w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Registration Submitted</h2>
          <p className="text-muted-foreground mb-6">
            Your organization has been registered. A platform administrator will review and approve your account before you can log in.
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
            Create Your Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Register your organization to get started with ProcurAI
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-2 ${step === 1 ? "text-gold" : "text-muted-foreground"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${step === 1 ? "border-gold bg-gold/10" : "border-border"}`}>1</span>
            <span className="text-sm font-medium hidden sm:inline">Organization</span>
          </div>
          <div className={`w-8 h-px ${step === 2 ? "bg-gold" : "bg-border"}`} />
          <div className={`flex items-center gap-2 ${step === 2 ? "text-gold" : "text-muted-foreground"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${step === 2 ? "border-gold bg-gold/10" : "border-border"}`}>2</span>
            <span className="text-sm font-medium hidden sm:inline">Admin Account</span>
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleStep1}>
              <div className="space-y-2">
                <Label htmlFor="companyName">Organization Name</Label>
                <Input id="companyName" placeholder="e.g. Acme Corporation" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input id="registrationNumber" placeholder="e.g. REG-12345" value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="e.g. Technology" value={form.industry} onChange={(e) => update("industry", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Organization Email</Label>
                <Input id="companyEmail" type="email" placeholder="e.g. admin@acme.com" value={form.companyEmail} onChange={(e) => update("companyEmail", e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">First Name</Label>
                  <Input id="adminFirstName" placeholder="First name" value={form.adminFirstName} onChange={(e) => update("adminFirstName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Last Name</Label>
                  <Input id="adminLastName" placeholder="Last name" value={form.adminLastName} onChange={(e) => update("adminLastName", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input id="adminEmail" type="email" placeholder="e.g. john@acme.com" value={form.adminEmail} onChange={(e) => update("adminEmail", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.adminPassword}
                    onChange={(e) => update("adminPassword", e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                  {loading ? "Registering..." : "Create Account"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By creating an account you agree to our{" "}
          <a href="#" className="text-gold hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-gold hover:underline">Privacy Policy</a>.
        </p>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
