"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useI18n } from "@/lib/i18n-provider";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
export default function Navbar() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: t("nav.platform"), href: "#platform" },
    { label: t("nav.modules"), href: "#modules" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.roadmap"), href: "#roadmap" },
    { label: t("nav.pricing"), href: "#pricing" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">ProcurAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
              >
                {" "}
                {link.label}{" "}
              </a>
            ))}{" "}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {" "}
                {t("nav.signIn")}{" "}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm"> {t("nav.getStarted")} </Button>
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-muted-foreground hover:text-gold transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}{" "}
              </svg>
            </button>
          </div>
        </div>{" "}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-card-border animate-fade-in-up">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  {" "}
                  {link.label}{" "}
                </a>
              ))}{" "}
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">
                    {" "}
                    {t("nav.signIn")}{" "}
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button size="sm" className="w-full">
                    {" "}
                    {t("nav.getStarted")}{" "}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}{" "}
      </div>
    </nav>
  );
}
