"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useSidebar } from "@/lib/sidebar-context";
export function DashboardHeader() {
  const { openMobile } = useSidebar();
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
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={openMobile}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm sm:text-lg font-semibold text-foreground">
              {user ? `Welcome, ${user.firstName ?? "User"}` : "Dashboard"}
            </h2>
            {user?.role && (
              <p className="text-xs text-muted-foreground capitalize">
                {user.role.toLowerCase()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
