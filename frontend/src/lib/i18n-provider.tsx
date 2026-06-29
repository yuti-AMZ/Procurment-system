"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import en from "./translations/en";
import am from "./translations/am";
export type Locale = "en" | "am";
type TranslationValue = string;
type TranslationMap = Record<string, TranslationValue>;
interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}
const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: (key: string) => key,
  setLocale: () => {},
});
function flatten(obj: Record<string, unknown>, prefix = ""): TranslationMap {
  let result: TranslationMap = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (typeof value === "object" && value !== null) {
      result = {
        ...result,
        ...flatten(value as Record<string, unknown>, fullKey),
      };
    }
  }
  return result;
}
const flatEn = flatten(en as unknown as Record<string, unknown>);
const flatAm = flatten(am as unknown as Record<string, unknown>);
const flatMap: Record<Locale, TranslationMap> = { en: flatEn, am: flatAm };
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored && (stored === "en" || stored === "am")) setLocale(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale === "am" ? "am" : "en";
  }, [locale]);
  const t = (key: string): string =>
    flatMap[locale][key] ?? flatMap.en[key] ?? key;
  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}{" "}
    </I18nContext.Provider>
  );
}
export const useI18n = () => useContext(I18nContext);
