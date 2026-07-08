import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { I18nProvider } from "@/lib/i18n-provider";
import { TenantBrandingProvider } from "@/lib/tenant-branding-provider";
export const metadata: Metadata = {
  title: "ProcurAI - AI-Powered Procurement Intelligence",
  description:
    "Unlock the future of procurement with AI-driven insights, automated workflows, and strategic intelligence.",
  icons: { icon: "/favicon.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <TenantBrandingProvider>
            <I18nProvider>{children}</I18nProvider>
          </TenantBrandingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
