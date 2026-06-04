import { Section, Row, Column, Text } from '@react-email/components'
import { tokens } from '../tokens'
import { BRAND_TAG_LABEL, type BrandTag, type Brand } from '../brand'
import { LOCALE_LABEL, type Locale } from '../i18n'

export interface PreviewMetaProps {
  title: string
  context: string
  trigger?: string
  tag: BrandTag
  brand: Brand
  locale: Locale
  locales: Locale[]
}

const tagColor: Record<BrandTag, string> = {
  fillit: '#ff637d',
  eleaseloop: '#129B9B',
  general: '#6b7280',
}

/**
 * Dev-only banner shown above the email in the React Email preview.
 * Surfaces the email's metadata (title, context, trigger page) and the active
 * brand / language. NOT rendered in production sends (only when `preview`).
 */
export function PreviewMeta({ title, context, trigger, tag, brand, locale, locales }: PreviewMetaProps) {
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

      <Row style={{ marginTop: '12px' }}>
        <Column>
          {/* Brand chip */}
          <span style={{ display: 'inline-block', backgroundColor: tagColor[tag], color: '#ffffff', fontFamily: tokens.fontFamily, fontSize: '11px', fontWeight: 700, borderRadius: '999px', padding: '3px 10px', marginRight: '6px' }}>
            {BRAND_TAG_LABEL[tag]}
          </span>
          {/* Active language chip */}
          <span style={{ display: 'inline-block', backgroundColor: '#e2e8f0', color: '#334155', fontFamily: tokens.fontFamily, fontSize: '11px', fontWeight: 600, borderRadius: '999px', padding: '3px 10px', marginRight: '6px' }}>
            {LOCALE_LABEL[locale]}
          </span>
          {/* Available languages */}
          <span style={{ fontFamily: tokens.fontFamily, fontSize: '11px', color: '#94a3b8' }}>
            Available: {locales.map((l) => LOCALE_LABEL[l]).join(', ')}
          </span>
        </Column>
      </Row>
    </Section>
  )
}
