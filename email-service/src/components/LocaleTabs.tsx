import { Html, Head, Body, Container, Preview } from '@react-email/components'
import { tokens } from '../tokens'
import type { Brand } from '../brand'
import { BRAND_LOCALES } from '../i18n'
import { EmailFonts } from './Layout'
import { EmailCard } from './EmailCard'
import { PreviewMeta } from './PreviewMeta'
import { EMAIL_MODULES } from '../emails/modules'

// Pure-CSS language toggle: show the locale matching the URL hash (#lang-xx),
// falling back to the first locale when none is selected. Works in the preview
// iframe with no JavaScript. Preview-only — production sends a single locale.
const TOGGLE_CSS = `
.loc { display: none; }
.loc:target { display: block; }
.locales:not(:has(.loc:target)) .loc:first-child { display: block; }
`

interface LocaleTabsProps {
  email: string
  brand: Brand
}

/** One preview entry per email × brand. Renders the metadata card (with the
 *  language toggle) and every language stacked, switched via the toggle. */
export function LocaleTabs({ email, brand }: LocaleTabsProps) {
  const mod = EMAIL_MODULES[email]
  const locales = BRAND_LOCALES[brand]
  const first = locales[0]

  return (
    <Html lang={first}>
      <Head>
        <EmailFonts />
        <style dangerouslySetInnerHTML={{ __html: TOGGLE_CSS }} />
      </Head>
      <Preview>{mod.previewText(brand, first)}</Preview>
      <Body style={{ backgroundColor: '#f3f4f6', fontFamily: tokens.fontFamily, margin: 0, padding: '40px 0' }}>
        <Container style={{ maxWidth: tokens.containerWidth, margin: '0 auto 20px', padding: 0 }}>
          <PreviewMeta
            {...mod.meta}
            brand={brand}
            locale={first}
            locales={locales}
            hrefFor={(l) => `#lang-${l}`}
          />
        </Container>

        <div className="locales">
          {locales.map((locale) => (
            <div key={locale} className="loc" id={`lang-${locale}`}>
              <EmailCard brand={brand}>{mod.Content({ brand, locale })}</EmailCard>
            </div>
          ))}
        </div>
      </Body>
    </Html>
  )
}
