"use client";
import { useState, useRef, useEffect } from "react";
import { useI18n, type Locale } from "@/lib/i18n-provider";
const flags: Record<Locale, string> = {
  en: "🇬🇧",
  am: "🇪🇹",
};
const labels: Record<Locale, string> = {
  en: "EN",
  am: "አማ",
};
export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const options: Locale[] = ["en", "am"];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all duration-300"
      >
        <span>{flags[locale]}</span>
        <span className="text-xs font-medium">{labels[locale]}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-28 rounded-lg border border-card-border bg-card shadow-lg py-1 z-50">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setLocale(opt);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                locale === opt
                  ? "text-gold bg-gold/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <span>{flags[opt]}</span>
              <span>{labels[opt]}</span>
            </button>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
