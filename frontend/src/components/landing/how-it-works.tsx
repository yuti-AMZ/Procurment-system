"use client";
import { useI18n } from "@/lib/i18n-provider";
const stepKeys = [
  { titleKey: "how.step1Title", descKey: "how.step1Desc" },
  { titleKey: "how.step2Title", descKey: "how.step2Desc" },
  { titleKey: "how.step3Title", descKey: "how.step3Desc" },
];
export default function HowItWorks() {
  const { t } = useI18n();
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {" "}
            {t("how.heading1")}{" "}
            <span className="text-gold">{t("how.heading2")}</span>{" "}
          </h2>{" "}
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            {" "}
            {t("how.description")}{" "}
          </p>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {stepKeys.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gold">
                  {i + 1}
                </span>{" "}
              </div>{" "}
              <h3 className="text-xl font-semibold mb-3">{t(step.titleKey)}</h3>{" "}
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {" "}
                {t(step.descKey)}{" "}
              </p>{" "}
              {i < stepKeys.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-gradient-to-r from-gold/40 to-transparent" />
              )}{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
