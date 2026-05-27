import type { Platform } from '@/composables/useAppContext'

export type SupportedLocale = 'en' | 'es' | 'it' | 'fr' | 'pl'

export interface LocaleOption {
  value: SupportedLocale
  /** English-language name */
  label: string
  /** Name in the language itself */
  nativeLabel: string
  /** Emoji flag */
  flag: string
}

export const LOCALE_OPTIONS: Record<SupportedLocale, LocaleOption> = {
  en: { value: 'en', label: 'English', nativeLabel: 'English',  flag: '🇬🇧' },
  es: { value: 'es', label: 'Spanish', nativeLabel: 'Español',  flag: '🇪🇸' },
  it: { value: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹' },
  fr: { value: 'fr', label: 'French',  nativeLabel: 'Français', flag: '🇫🇷' },
  pl: { value: 'pl', label: 'Polish',  nativeLabel: 'Polski',   flag: '🇵🇱' },
}

/** Locales available per platform */
export const PLATFORM_LOCALES: Record<Platform, SupportedLocale[]> = {
  fillit:     ['en', 'es'],
  eleaseloop: ['en', 'es', 'it', 'fr', 'pl'],
}

/** Maps a country ISO code to its local language locale */
export const COUNTRY_LOCALE: Record<string, SupportedLocale> = {
  es: 'es',
  it: 'it',
  fr: 'fr',
  pl: 'pl',
}
