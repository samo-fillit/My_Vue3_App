import type { Brand } from './brand'

export type Locale = 'en' | 'es' | 'fr' | 'it' | 'pl'

/**
 * Languages each brand ships in:
 *  - Fillit:     English, Spanish
 *  - eLeaseLoop: English, Spanish, French, Italian, Polish
 */
export const BRAND_LOCALES: Record<Brand, Locale[]> = {
  fillit: ['en', 'es'],
  eleaseloop: ['en', 'es', 'fr', 'it', 'pl'],
}

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pl: 'Polski',
}
