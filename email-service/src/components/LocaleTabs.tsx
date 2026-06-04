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

// Persistent light/dark toggle. The preview iframe is a same-origin srcdoc, so
// localStorage is shared across every email — flip it once and it stays as you
// move between emails. The button is fixed to the top-right of the preview.
const SCHEME_SCRIPT = `(function(){try{
  var K='email-preview-scheme';
  function apply(d){
    document.documentElement.classList.toggle('scheme-dark', d);
    var b=document.getElementById('scheme-toggle');
    if(b) b.textContent = d ? '🌙 Dark' : '☀️ Light';
  }
  var dark = localStorage.getItem(K)==='dark';
  apply(dark);
  window.__toggleScheme=function(){ dark=!dark; localStorage.setItem(K, dark?'dark':'light'); apply(dark); };
}catch(e){}})();`

const SCHEME_BUTTON = `<button id="scheme-toggle" type="button"
  onclick="window.__toggleScheme&&window.__toggleScheme()"
  style="position:fixed;top:14px;right:14px;z-index:2147483647;font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;color:#ffffff;background:#313d4f;border:none;border-radius:999px;padding:9px 15px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.25)">☀️ Light</button>`

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
    // ── Dark-mode email simulation (toggled by the fixed button → .scheme-dark on <html>) ──
    '.scheme-dark, .scheme-dark body { background: #15171c !important; }',
    '.scheme-dark .loc-stack { background: #15171c !important; }',
    '.scheme-dark .email-card { background: #1f2329 !important; }',
    '.scheme-dark .email-card p, .scheme-dark .email-card a, .scheme-dark .email-card span, .scheme-dark .email-card strong { color: #e5e7eb !important; }',
    '.scheme-dark .email-rule { border-color: #363b44 !important; }',
    '.scheme-dark .email-datacard { background: #2a2f37 !important; border-color: #363b44 !important; }',
  ].join('\n')

  return (
    <Html lang={first}>
      <Head>
        <EmailFonts />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </Head>
      <Preview>{mod.previewText(brand, first)}</Preview>
      <Body style={{ backgroundColor: '#f3f4f6', fontFamily: tokens.fontFamily, margin: 0, padding: '40px 0' }}>
        {/* Persistent light/dark toggle — fixed top-right of the preview */}
        <div dangerouslySetInnerHTML={{ __html: SCHEME_BUTTON }} />

        <div className="lang-root">
          {/* Hidden radios — language (first locale checked by default) */}
          {locales.map((l) => (
            <input key={l} type="radio" name={RADIO} id={`${RADIO}-${l}`} className="locradio" defaultChecked={l === first} />
          ))}

          {/* Metadata card with the language toggle */}
          <div className="meta-wrap">
            <Container style={{ maxWidth: tokens.containerWidth, margin: '0 auto 20px', padding: 0 }}>
              <PreviewMeta {...mod.meta} brand={brand} locale={first} locales={locales} radioName={RADIO} />
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

        {/* Apply persisted scheme on load (srcdoc iframe executes this) */}
        <script dangerouslySetInnerHTML={{ __html: SCHEME_SCRIPT }} />
      </Body>
    </Html>
  )
}
