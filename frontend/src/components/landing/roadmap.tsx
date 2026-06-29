"use client";
import { useI18n } from "@/lib/i18n-provider";
const roadmapKeys = [
  {
    phaseKey: "roadmap.phase1",
    titleKey: "roadmap.phase1Title",
    items: [
      "roadmap.phase1Item1",
      "roadmap.phase1Item2",
      "roadmap.phase1Item3",
      "roadmap.phase1Item4",
    ],
    status: "current",
  },
  {
    phaseKey: "roadmap.phase2",
    titleKey: "roadmap.phase2Title",
    items: [
      "roadmap.phase2Item1",
      "roadmap.phase2Item2",
      "roadmap.phase2Item3",
      "roadmap.phase2Item4",
    ],
    status: "upcoming",
  },
  {
    phaseKey: "roadmap.phase3",
    titleKey: "roadmap.phase3Title",
    items: [
      "roadmap.phase3Item1",
      "roadmap.phase3Item2",
      "roadmap.phase3Item3",
      "roadmap.phase3Item4",
    ],
    status: "upcoming",
  },
  {
    phaseKey: "roadmap.phase4",
    titleKey: "roadmap.phase4Title",
    items: [
      "roadmap.phase4Item1",
      "roadmap.phase4Item2",
      "roadmap.phase4Item3",
      "roadmap.phase4Item4",
    ],
    status: "upcoming",
  },
];
export default function Roadmap() {
  const { t } = useI18n();
  return (
    <section
      id="roadmap"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-background via-gold/[0.02] to-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-sm mb-6">
            {" "}
            {t("roadmap.badge")}{" "}
          </div>{" "}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {" "}
            {t("roadmap.heading1")}{" "}
            <span className="text-gold">{t("roadmap.heading2")}</span>{" "}
          </h2>{" "}
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            {" "}
            {t("roadmap.description")}{" "}
          </p>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-4 gap-6">
          {roadmapKeys.map((phase, i) => (
            <div
              key={i}
              className="rounded-xl border border-card-border bg-card p-6 transition-all duration-500 hover:border-gold/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gold">
                  {t(phase.phaseKey)}
                </span>{" "}
                {phase.status === "current" ? (
                  <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs border border-gold/20">
                    {" "}
                    {t("roadmap.inProgress")}{" "}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                    {" "}
                    {t("roadmap.planned")}{" "}
                  </span>
                )}{" "}
              </div>{" "}
              <h3 className="text-lg font-semibold mb-4">
                {t(phase.titleKey)}
              </h3>{" "}
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gold shrink-0"
                    >
                      <path d="M5 12l5 5L20 7" />{" "}
                    </svg>{" "}
                    {t(item)}{" "}
                  </li>
                ))}{" "}
              </ul>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
