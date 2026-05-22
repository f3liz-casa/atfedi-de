import { ui, defaultLocale, type Locale } from './ui';

// t(key) returns the string for `lang`, falling back to English, then to the
// key itself (so a missing translation is visible rather than blank).
export function useTranslations(lang: Locale) {
  return (key: string): string => ui[lang][key] ?? ui[defaultLocale][key] ?? key;
}

// A tool's summary is written per language, with ja/ko optional.
// Missing translations fall back to English.
export type ToolSummary = { en: string; ja?: string; ko?: string };

export function localizedSummary(summary: ToolSummary, lang: Locale): string {
  return summary[lang] ?? summary.en;
}

// A tool link is either a plain URL string, or per-locale URLs for a site
// with language-specific pages. resolveUrl picks the URL matching the page's
// language, falling back to English.
export type LocalizedUrl = string | { en: string; ja?: string; ko?: string };

export function resolveUrl(url: LocalizedUrl, lang: Locale): string {
  return typeof url === 'string' ? url : (url[lang] ?? url.en);
}
