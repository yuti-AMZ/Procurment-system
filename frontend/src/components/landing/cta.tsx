"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-provider";
export default function CTA() {
  const { t } = useI18n();
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-gold/5 to-background pointer-events-none" />{" "}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />{" "}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">
          {" "}
          {t("cta.heading1")} <br />{" "}
          <span className="text-gold">{t("cta.heading2")}</span>{" "}
        </h2>{" "}
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
          {" "}
          {t("cta.description")}{" "}
        </p>{" "}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="xl" className="w-full sm:w-auto">
              {" "}
              {t("cta.cta")}{" "}
            </Button>{" "}
          </Link>{" "}
          <a href="#platform">
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              {" "}
              {t("cta.secondary")}{" "}
            </Button>{" "}
          </a>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
