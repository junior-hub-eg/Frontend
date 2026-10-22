/** The two site languages. English is the default; Arabic turns the page right-to-left. */
export type Locale = "en" | "ar";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "jh_lang";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ar";
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** The BCP 47 tag to format dates and numbers with. */
export function intlLocale(locale: Locale): string {
  return locale === "ar" ? "ar-EG" : "en-US";
}
