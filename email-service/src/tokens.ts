/**
 * Design tokens for Fillit email templates.
 * Mirror the CSS variable values from the Nuxt app's tailwind.css.
 * Email clients don't support CSS variables, so we inline these directly.
 */

export type Platform = 'fillit' | 'eleaseloop'

export const platformConfig: Record<Platform, { logoUrl: string; siteUrl: string; siteName: string }> = {
  fillit: {
    // Dev: served from email-service/static/ by `npm run dev`
    // Prod: replace with absolute CDN URL, e.g. https://cdn.fillit.com/email/logo.png
    logoUrl:  '/static/fillit-logo.svg',
    siteUrl:  'https://fillit.com',
    siteName: 'fillit.com',
  },
  eleaseloop: {
    logoUrl:  '/static/eleaseloop-logo.svg',
    siteUrl:  'https://eleaseloop.com',
    siteName: 'eleaseloop.com',
  },
}

export const tokens = {
  // Typography
  fontFamily: 'Inter, Arial, sans-serif',
  fontSizeBase: '15px',
  fontSizeSmall: '13px',
  fontSizeMicro: '11px',
  lineHeightBase: '1.6',

  // Colours
  colorForeground:        '#111111',
  colorMuted:             '#6b7280',
  colorBackground:        '#ffffff',
  colorSurface:           '#f9fafb',
  colorBorder:            '#e5e7eb',
  colorPrimary:           '#ff637d', // coral — CTAs only
  colorPrimaryForeground: '#ffffff',

  // Layout
  containerWidth: '600px',
  containerPadding: '40px',
  borderRadius: '8px',
  borderRadiusSm: '6px',
} as const
