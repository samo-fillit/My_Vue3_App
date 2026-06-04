import { Html, Head, Body, Container, Preview } from '@react-email/components'
import { tokens } from '../tokens'
import { BRANDS, type Brand } from '../brand'
import { BRAND_LOCALES } from '../i18n'
import { EmailFonts } from './Layout'
import { EmailCard } from './EmailCard'
import { PreviewMeta } from './PreviewMeta'
import { EMAIL_MODULES } from '../emails/modules'

const RADIO = 'loc'

interface LocaleTabsProps {
  email: string
  brand: Brand
}

/**
 * One preview entry per email × brand. Shows the metadata card (with the
 * language toggle) and every language stacked. Switching is a pure-CSS
 * radio-button toggle — no links, no URL hash, so the preview iframe never
 * navigates (which previously duplicated the whole app). Preview-only;
 * production sends a single brand+locale via the email's default export.
 */
export function LocaleTabs({ email, brand }: LocaleTabsProps) {
  const mod = EMAIL_MODULES[email]
  const locales = BRAND_LOCALES[brand]
  const first = locales[0]
  const accent = BRANDS[brand].primary

  const css = [
    '.loc { display: none; }',
    '.locradio { display: none !important; }',
    ...locales.map((l) => `#${RADIO}-${l}:checked ~ .loc-stack .loc-${l} { display: block; }`),
    // active pill styling
    ...locales.map(
      (l) =>
        `#${RADIO}-${l}:checked ~ .meta-wrap .langpill-${l} { background: ${accent} !important; color: #ffffff !important; border-color: transparent !important; font-weight: 700 !important; }`,
    ),
  ].join('\n')

  return (
    <Html lang={first}>
      <Head>
        <EmailFonts />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </Head>
      <Preview>{mod.previewText(brand, first)}</Preview>
      <Body style={{ backgroundColor: '#f3f4f6', fontFamily: tokens.fontFamily, margin: 0, padding: '40px 0' }}>
        <div className="lang-root">
          {/* Hidden radios — first locale checked by default */}
          {locales.map((l) => (
            <input key={l} type="radio" name={RADIO} id={`${RADIO}-${l}`} className="locradio" defaultChecked={l === first} />
          ))}

          {/* Metadata card with the language toggle (labels drive the radios) */}
          <div className="meta-wrap">
            <Container style={{ maxWidth: tokens.containerWidth, margin: '0 auto 20px', padding: 0 }}>
              <PreviewMeta {...mod.meta} brand={brand} locale={first} locales={locales} radioName={RADIO} />
            </Container>
          </div>

          {/* Stacked locales — CSS shows the one whose radio is checked */}
          <div className="loc-stack">
            {locales.map((locale) => (
              <div key={locale} className={`loc loc-${locale}`}>
                <EmailCard brand={brand}>{mod.Content({ brand, locale })}</EmailCard>
              </div>
            ))}
          </div>
        </div>
      </Body>
    </Html>
  )
}
