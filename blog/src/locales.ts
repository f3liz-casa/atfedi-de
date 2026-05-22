export const locales = ['en', 'ja', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  ko: '한국어',
};
