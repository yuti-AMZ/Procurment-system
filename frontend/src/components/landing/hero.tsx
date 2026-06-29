"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-provider";
export default function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />{" "}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />{" "}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          {t("hero.badge")}{" "}
        </div>{" "}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
          {" "}
          {t("hero.heading1")} <br />{" "}
          <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            {" "}
            {t("hero.heading2")}{" "}
          </span>{" "}
        </h1>{" "}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
          {" "}
          {t("hero.description")}{" "}
        </p>{" "}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="xl" className="w-full sm:w-auto">
              {" "}
              {t("hero.cta")}{" "}
            </Button>{" "}
          </Link>{" "}
          <a href="#platform">
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              {" "}
              {t("hero.explore")}{" "}
            </Button>{" "}
          </a>{" "}
        </div>{" "}
        <div className="mt-16 flex items-center justify-center gap-8 sm:gap-12 text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gold">10x</div>{" "}
            <div className="text-xs sm:text-sm mt-1">
              {t("hero.stat1Label")}
            </div>{" "}
          </div>{" "}
          <div className="w-px h-12 bg-card-border" />{" "}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gold">85%</div>{" "}
            <div className="text-xs sm:text-sm mt-1">
              {t("hero.stat2Label")}
            </div>{" "}
          </div>{" "}
          <div className="w-px h-12 bg-card-border" />{" "}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gold">
              99.9%
            </div>{" "}
            <div className="text-xs sm:text-sm mt-1">
              {t("hero.stat3Label")}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gold/50"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />{" "}
        </svg>{" "}
      </div>{" "}
    </section>
  );
}
