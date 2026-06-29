"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-provider";
export default function Pricing() {
  const { t } = useI18n();
  const plans = [
    {
      nameKey: "pricing.plan1Name",
      priceKey: "pricing.plan1Price",
      periodKey: "pricing.plan1Period",
      descKey: "pricing.plan1Desc",
      features: [
        "pricing.plan1Feature1",
        "pricing.plan1Feature2",
        "pricing.plan1Feature3",
        "pricing.plan1Feature4",
        "pricing.plan1Feature5",
      ],
      ctaKey: "pricing.plan1Cta",
      variant: "secondary" as const,
    },
    {
      nameKey: "pricing.plan2Name",
      priceKey: "pricing.plan2Price",
      periodKey: "pricing.plan2Period",
      descKey: "pricing.plan2Desc",
      features: [
        "pricing.plan2Feature1",
        "pricing.plan2Feature2",
        "pricing.plan2Feature3",
        "pricing.plan2Feature4",
        "pricing.plan2Feature5",
        "pricing.plan2Feature6",
      ],
      ctaKey: "pricing.plan2Cta",
      variant: "default" as const,
      popular: true,
    },
    {
      nameKey: "pricing.plan3Name",
      priceKey: "pricing.plan3Price",
      periodKey: "pricing.plan3Period",
      descKey: "pricing.plan3Desc",
      features: [
        "pricing.plan3Feature1",
        "pricing.plan3Feature2",
        "pricing.plan3Feature3",
        "pricing.plan3Feature4",
        "pricing.plan3Feature5",
        "pricing.plan3Feature6",
      ],
      ctaKey: "pricing.plan3Cta",
      variant: "secondary" as const,
    },
  ];
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {" "}
            {t("pricing.heading1")}{" "}
            <span className="text-gold">{t("pricing.heading2")}</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            {" "}
            {t("pricing.description")}{" "}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-xl border p-8 transition-all duration-500 ${plan.popular ? "border-gold/40 bg-gradient-to-b from-gold/5 to-card shadow-lg shadow-gold/10" : "border-card-border bg-card hover:border-gold/20"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-black text-xs font-semibold">
                  {" "}
                  {t("pricing.popular")}{" "}
                </div>
              )}{" "}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">
                  {t(plan.nameKey)}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t(plan.descKey)}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{t(plan.priceKey)}</span>{" "}
                  {t(plan.periodKey) && (
                    <span className="text-muted-foreground">
                      {t(plan.periodKey)}
                    </span>
                  )}{" "}
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gold shrink-0"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>{" "}
                    {t(feature)}{" "}
                  </li>
                ))}{" "}
              </ul>
              <Link href={i === 2 ? "/contact" : "/signup"}>
                <Button variant={plan.variant} size="lg" className="w-full">
                  {" "}
                  {t(plan.ctaKey)}{" "}
                </Button>
              </Link>
            </div>
          ))}{" "}
        </div>
      </div>
    </section>
  );
}
