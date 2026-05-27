import { useState } from '#app'
import type { SupportedLocale } from '@/config/locales'

/**
 * Global locale preference for the current session.
 * Defaults to English. The language overlay in the sidebar writes to this.
 * In production this would be persisted to the user's profile and used by @nuxtjs/i18n.
 */
export function useLocale() {
  const locale = useState<SupportedLocale>('locale', () => 'en')

  function setLocale(l: SupportedLocale) {
    locale.value = l
  }

  return { locale, setLocale }
}
