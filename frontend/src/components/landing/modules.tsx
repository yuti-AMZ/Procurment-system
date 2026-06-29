"use client";
import { useI18n } from "@/lib/i18n-provider";
const moduleKeys = [
  {
    titleKey: "modules.m1Title",
    descKey: "modules.m1Desc",
    tags: ["modules.m1Tag1", "modules.m1Tag2", "modules.m1Tag3"],
  },
  {
    titleKey: "modules.m2Title",
    descKey: "modules.m2Desc",
    tags: ["modules.m2Tag1", "modules.m2Tag2", "modules.m2Tag3"],
  },
  {
    titleKey: "modules.m3Title",
    descKey: "modules.m3Desc",
    tags: ["modules.m3Tag1", "modules.m3Tag2", "modules.m3Tag3"],
  },
  {
    titleKey: "modules.m4Title",
    descKey: "modules.m4Desc",
    tags: ["modules.m4Tag1", "modules.m4Tag2", "modules.m4Tag3"],
  },
  {
    titleKey: "modules.m5Title",
    descKey: "modules.m5Desc",
    tags: ["modules.m5Tag1", "modules.m5Tag2", "modules.m5Tag3"],
  },
  {
    titleKey: "modules.m6Title",
    descKey: "modules.m6Desc",
    tags: ["modules.m6Tag1", "modules.m6Tag2", "modules.m6Tag3"],
  },
];
export default function Modules() {
  const { t } = useI18n();
  return (
    <section
      id="modules"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-background via-gold/[0.02] to-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-sm mb-6">
            {" "}
            {t("modules.badge")}{" "}
          </div>{" "}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {" "}
            {t("modules.heading1")} <br />{" "}
            <span className="text-gold">{t("modules.heading2")}</span>{" "}
          </h2>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleKeys.map((mod, i) => (
            <div
              key={i}
              className="group rounded-xl border border-card-border bg-card p-8 transition-all duration-500 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5"
            >
              <span className="text-4xl font-bold text-gold/20 group-hover:text-gold/40 transition-all duration-500">
                {" "}
                {String(i + 1).padStart(2, "0")}{" "}
              </span>{" "}
              <h3 className="text-xl font-semibold mt-3 mb-3">
                {t(mod.titleKey)}
              </h3>{" "}
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {" "}
                {t(mod.descKey)}{" "}
              </p>{" "}
              <div className="flex flex-wrap gap-2">
                {mod.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-gold/5 border border-gold/10 text-gold text-xs"
                  >
                    {" "}
                    {t(tag)}{" "}
                  </span>
                ))}{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
