/**
 * Design tokens for Fillit email templates.
 * Mirror the CSS variable values from the Nuxt app's tailwind.css.
 * Email clients don't support CSS variables, so we inline these directly.
 */

export type Platform = 'fillit' | 'eleaseloop'

// Logos are inlined as base64 data URIs so they render in the React Email
// dev preview without needing a static file server, and work in any email
// client that supports <img>. For production, swap these for hosted PNG URLs
// (e.g. https://cdn.fillit.com/email/logo.png) in platformConfig below.
import { FILLIT_LOGO_URI, ELEASELOOP_LOGO_URI } from './logo-data'

export const platformConfig: Record<Platform, { logoUrl: string; siteUrl: string; siteName: string }> = {
  fillit: {
    logoUrl:  FILLIT_LOGO_URI,
    siteUrl:  'https://fillit.com',
    siteName: 'fillit.com',
  },
  eleaseloop: {
    logoUrl:  ELEASELOOP_LOGO_URI,
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
