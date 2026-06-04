import { FILLIT_LOGO_URI, ELEASELOOP_LOGO_URI } from './logo-data'

export type Brand = 'fillit' | 'eleaseloop'
/** Tag on each email: which brand(s) it belongs to. 'general' = both. */
export type BrandTag = Brand | 'general'

export interface BrandConfig {
  name: string
  primary: string
  primaryForeground: string
  logoUri: string
  siteUrl: string
  siteName: string
}

export const BRANDS: Record<Brand, BrandConfig> = {
  fillit: {
    name: 'Fillit',
    primary: '#ff637d',
    primaryForeground: '#ffffff',
    logoUri: FILLIT_LOGO_URI,
    siteUrl: 'https://fillit.com',
    siteName: 'fillit.com',
  },
  eleaseloop: {
    name: 'eLeaseLoop',
    primary: '#129B9B',
    primaryForeground: '#ffffff',
    logoUri: ELEASELOOP_LOGO_URI,
    siteUrl: 'https://eleaseloop.com',
    siteName: 'eleaseloop.com',
  },
}

export const BRAND_TAG_LABEL: Record<BrandTag, string> = {
  fillit: 'Fillit',
  eleaseloop: 'eLeaseLoop',
  general: 'General · both brands',
}

/** Resolve which concrete brands an email's tag applies to. */
export function brandsForTag(tag: BrandTag): Brand[] {
  return tag === 'general' ? ['fillit', 'eleaseloop'] : [tag]
}
