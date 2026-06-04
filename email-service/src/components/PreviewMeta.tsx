import { Section, Row, Column, Text } from '@react-email/components'
import { tokens } from '../tokens'
import { BRAND_TAG_LABEL, type BrandTag, type Brand } from '../brand'
import { LOCALE_LABEL, type Locale } from '../i18n'

export interface PreviewMetaProps {
  id: string
  title: string
  context: string
  trigger?: string
  tag: BrandTag
  brand: Brand
  locale: Locale
  locales: Locale[]
  /** Builds the href for each language pill. Defaults to in-page #anchors. */
  hrefFor?: (locale: Locale) => string
}

const tagColor: Record<BrandTag, string> = {
  fillit: '#ff637d',
  eleaseloop: '#129B9B',
  general: '#6b7280',
}

const LOCALE_FLAG: Record<Locale, string> = {
  en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', it: '🇮🇹', pl: '🇵🇱',
}

/**
 * Dev-only banner shown above the email in the React Email preview.
 * Surfaces the email's metadata (title, context, trigger page) and the active
 * brand / language. NOT rendered in production sends (only when `preview`).
 */
export function PreviewMeta({ id, title, context, trigger, tag, brand, locale, locales, hrefFor }: PreviewMetaProps) {
  const linkFor = hrefFor ?? ((l: Locale) => `#lang-${l}`)
  return (
    <Section
      style={{
        backgroundColor: '#f9fafb',
        border: '1px dashed #cbd5e1',
        borderRadius: '8px',
        padding: '16px 20px',
        margin: '0 0 20px',
      }}
    >
      <Row>
        <Column>
          <Text style={{ margin: 0, fontFamily: tokens.fontFamily, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Preview · not part of the email
          </Text>
          <Text style={{ margin: '6px 0 0', fontFamily: tokens.fontFamily, fontSize: '16px', fontWeight: 700, color: tokens.colorForeground }}>
            {title}
          </Text>
          <Text style={{ margin: '4px 0 0', fontFamily: tokens.fontFamily, fontSize: '13px', color: tokens.colorMuted, lineHeight: '1.5' }}>
            {context}
          </Text>
          {trigger && (
            <Text style={{ margin: '6px 0 0', fontFamily: tokens.fontFamily, fontSize: '12px', color: tokens.colorMuted }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>Triggered from:</span> {trigger}
            </Text>
          )}
        </Column>
      </Row>

      {/* Brand chip */}
      <Row style={{ marginTop: '12px' }}>
        <Column>
          <span style={{ display: 'inline-block', backgroundColor: tagColor[tag], color: '#ffffff', fontFamily: tokens.fontFamily, fontSize: '11px', fontWeight: 700, borderRadius: '999px', padding: '3px 10px' }}>
            {BRAND_TAG_LABEL[tag]}
          </span>
        </Column>
      </Row>

      {/* Country / language toggle — clickable links that switch the preview locale */}
      <Row style={{ marginTop: '14px' }}>
        <Column>
          <Text style={{ margin: '0 0 8px', fontFamily: tokens.fontFamily, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Language · {locales.length} available
          </Text>
          {locales.map((l) => {
            const active = l === locale
            return (
              <a
                key={l}
                href={linkFor(l)}
                style={{
                  display: 'inline-block',
                  marginRight: '6px',
                  marginBottom: '6px',
                  textDecoration: 'none',
                  fontFamily: tokens.fontFamily,
                  fontSize: '12px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#ffffff' : '#334155',
                  backgroundColor: active ? tagColor[tag === 'general' ? brand : tag] : '#ffffff',
                  border: `1px solid ${active ? 'transparent' : '#cbd5e1'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                }}
              >
                <span style={{ marginRight: '6px' }}>{LOCALE_FLAG[l]}</span>{LOCALE_LABEL[l]}
              </a>
            )
          })}
        </Column>
      </Row>
    </Section>
  )
}
