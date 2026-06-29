"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
export function DashboardHeader() {
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null>(null);
  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    } catch {
      /* ignore */
    }
  }, []);
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-card-border bg-card/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {user ? `Welcome, ${user.firstName ?? "User"}` : "Dashboard"}{" "}
          </h2>
          {user?.role && (
            <p className="text-xs text-muted-foreground capitalize">
              {user.role.toLowerCase()}
            </p>
          )}{" "}
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
