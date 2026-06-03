/**
 * Design tokens for Fillit email templates.
 * Mirror the CSS variable values from the Nuxt app's tailwind.css.
 * Email clients don't support CSS variables, so we inline these directly.
 */

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
