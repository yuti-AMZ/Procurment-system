"use client";
import { useI18n } from "@/lib/i18n-provider";
const features = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2a10 10 0 1010 10" /> <path d="M12 6a6 6 0 106 6" />{" "}
        <path d="M12 10a2 2 0 102 2" />{" "}
      </svg>
    ),
    titleKey: "platform.feature1Title",
    descKey: "platform.feature1Desc",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 3v18h18" /> <path d="M7 16l4-8 4 4 4-6" />{" "}
      </svg>
    ),
    titleKey: "platform.feature2Title",
    descKey: "platform.feature2Desc",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />{" "}
      </svg>
    ),
    titleKey: "platform.feature3Title",
    descKey: "platform.feature3Desc",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 12a9 9 0 11-9-9" /> <path d="M21 3v6h-6" />{" "}
        <path d="M12 7v5l3 3" />{" "}
      </svg>
    ),
    titleKey: "platform.feature4Title",
    descKey: "platform.feature4Desc",
  },
];
export default function PlatformOverview() {
  const { t } = useI18n();
  return (
    <section id="platform" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {" "}
            {t("platform.heading1")} <br />{" "}
            <span className="text-gold">{t("platform.heading2")}</span>{" "}
          </h2>{" "}
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            {" "}
            {t("platform.description")}{" "}
          </p>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-xl border border-card-border bg-card p-8 transition-all duration-500 hover:border-gold/30 hover:bg-gold/[0.02]"
            >
              <div className="w-12 h-12 rounded-lg bg-gold/10 text-gold flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-all duration-500">
                {" "}
                {feature.icon}{" "}
              </div>{" "}
              <h3 className="text-xl font-semibold mb-3">
                {t(feature.titleKey)}
              </h3>{" "}
              <p className="text-muted-foreground leading-relaxed">
                {t(feature.descKey)}
              </p>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
