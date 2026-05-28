export interface CountryInfo {
  code: string
  name: string
  flag: string  // emoji
}

/** All countries eLeaseLoop currently operates in (or is piloting) */
export const ELEASELOOP_COUNTRIES: CountryInfo[] = [
  { code: 'es', name: 'Spain',  flag: '🇪🇸' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'it', name: 'Italy',  flag: '🇮🇹' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
]

export const COUNTRY_MAP: Record<string, CountryInfo> = Object.fromEntries(
  ELEASELOOP_COUNTRIES.map(c => [c.code, c])
)
