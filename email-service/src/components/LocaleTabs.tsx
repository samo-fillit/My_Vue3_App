import { Html, Head, Body, Container, Preview } from '@react-email/components'
import { tokens } from '../tokens'
import { BRANDS, type Brand } from '../brand'
import { BRAND_LOCALES } from '../i18n'
import { EmailFonts } from './Layout'
import { EmailCard } from './EmailCard'
import { PreviewMeta } from './PreviewMeta'
import { EMAIL_MODULES } from '../emails/modules'

const RADIO = 'loc'
const SCHEME = 'scheme'

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
    // active language pill
    ...locales.map(
      (l) =>
        `#${RADIO}-${l}:checked ~ .meta-wrap .langpill-${l} { background: ${accent} !important; color: #ffffff !important; border-color: transparent !important; font-weight: 700 !important; }`,
    ),
    // active appearance pill
    `#${SCHEME}-light:checked ~ .meta-wrap .schemepill-light,`,
    `#${SCHEME}-dark:checked ~ .meta-wrap .schemepill-dark { background: #313d4f !important; color: #ffffff !important; border-color: transparent !important; font-weight: 700 !important; }`,
    // ── Dark-mode email simulation (when the dark radio is checked) ──
    `#${SCHEME}-dark:checked ~ .loc-stack { background: #15171c !important; }`,
    `#${SCHEME}-dark:checked ~ .loc-stack .email-card { background: #1f2329 !important; }`,
    `#${SCHEME}-dark:checked ~ .loc-stack .email-card p,`,
    `#${SCHEME}-dark:checked ~ .loc-stack .email-card a,`,
    `#${SCHEME}-dark:checked ~ .loc-stack .email-card span,`,
    `#${SCHEME}-dark:checked ~ .loc-stack .email-card strong { color: #e5e7eb !important; }`,
    `#${SCHEME}-dark:checked ~ .loc-stack .email-rule { border-color: #363b44 !important; }`,
    `#${SCHEME}-dark:checked ~ .loc-stack .email-datacard { background: #2a2f37 !important; border-color: #363b44 !important; }`,
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
          {/* Hidden radios — language (first locale checked by default) */}
          {locales.map((l) => (
            <input key={l} type="radio" name={RADIO} id={`${RADIO}-${l}`} className="locradio" defaultChecked={l === first} />
          ))}
          {/* Hidden radios — appearance (light checked by default) */}
          <input type="radio" name={SCHEME} id={`${SCHEME}-light`} className="locradio" defaultChecked />
          <input type="radio" name={SCHEME} id={`${SCHEME}-dark`} className="locradio" />

          {/* Metadata card with the language + appearance toggles */}
          <div className="meta-wrap">
            <Container style={{ maxWidth: tokens.containerWidth, margin: '0 auto 20px', padding: 0 }}>
              <PreviewMeta {...mod.meta} brand={brand} locale={first} locales={locales} radioName={RADIO} schemeRadio={SCHEME} />
            </Container>
          </div>

          {/* Stacked locales — CSS shows the one whose radio is checked */}
          <div className="loc-stack" style={{ padding: '24px 0' }}>
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
