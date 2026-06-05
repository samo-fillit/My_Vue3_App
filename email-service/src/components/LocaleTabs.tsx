import { Html, Head, Body, Container, Preview } from '@react-email/components'
import { tokens } from '../tokens'
import { BRANDS, type Brand } from '../brand'
import { BRAND_LOCALES } from '../i18n'
import { EmailFonts } from './Layout'
import { EmailCard } from './EmailCard'
import { PreviewMeta } from './PreviewMeta'
import { EMAIL_MODULES } from '../emails/modules'
import { fixturesFor } from '../fixtures'

const RADIO = 'loc'

// ── Persistent scripts ────────────────────────────────────────────────────────
// Both toggles use the same pattern: localStorage + a class on <html>.
// The srcdoc iframe shares localStorage across all email previews, so switching
// either toggle once keeps the choice as you move between emails.

const SCRIPTS = `(function(){try{
  // ── Dark / Light ──
  var KD='email-preview-scheme';
  function applyScheme(d){
    document.documentElement.classList.toggle('scheme-dark',d);
    var b=document.getElementById('btn-scheme');
    if(b) b.textContent=d?'🌙 Dark':'☀️ Light';
  }
  var dark=localStorage.getItem(KD)==='dark';
  applyScheme(dark);
  window.__toggleScheme=function(){ dark=!dark; localStorage.setItem(KD,dark?'dark':'light'); applyScheme(dark); };

  // ── Data / Variables ──
  var KV='email-preview-view';
  function applyView(v){
    document.documentElement.classList.toggle('view-vars',v);
    var b=document.getElementById('btn-view');
    if(b) b.textContent=v?'🔤 Vars':'💾 Data';
  }
  var vars=localStorage.getItem(KV)==='vars';
  applyView(vars);
  window.__toggleView=function(){ vars=!vars; localStorage.setItem(KV,vars?'vars':'data'); applyView(vars); };
}catch(e){}})();`

const BUTTONS = `<div style="position:fixed;top:14px;right:14px;z-index:2147483647;display:flex;gap:6px;">
  <button id="btn-view" type="button" onclick="window.__toggleView&&window.__toggleView()"
    style="font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;color:#ffffff;background:#313d4f;border:none;border-radius:999px;padding:9px 15px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.25)">💾 Data</button>
  <button id="btn-scheme" type="button" onclick="window.__toggleScheme&&window.__toggleScheme()"
    style="font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;color:#ffffff;background:#313d4f;border:none;border-radius:999px;padding:9px 15px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.25)">☀️ Light</button>
</div>`

export function LocaleTabs({ email, brand }: { email: string; brand: Brand }) {
  const mod = EMAIL_MODULES[email]
  const locales = BRAND_LOCALES[brand]
  const first = locales[0]
  const accent = BRANDS[brand].primary
  const fixtures = fixturesFor(email)
  const fixture = fixtures[0] // use the first fixture as the default data set

  const css = [
    // Language radios
    '.loc { display: none; }',
    '.locradio { display: none !important; }',
    ...locales.map((l) => `#${RADIO}-${l}:checked ~ .stacks .loc-${l} { display: block; }`),
    ...locales.map((l) =>
      `#${RADIO}-${l}:checked ~ .meta-wrap .langpill-${l} { background: ${accent} !important; color: #fff !important; border-color: transparent !important; font-weight: 700 !important; }`
    ),
    // Data vs Variables view (driven by .view-vars class on <html>)
    '.view-vars-content  { display: none; }',
    '.view-data-content  { display: block; }',
    '.view-vars .view-vars-content { display: block; }',
    '.view-vars .view-data-content { display: none; }',
    // Amber outline so it's obvious you're in vars mode
    '.view-vars .email-card { outline: 2px solid #f59e0b !important; outline-offset: 3px !important; }',
    // Dark mode
    '.scheme-dark, .scheme-dark body { background: #15171c !important; }',
    '.scheme-dark .stacks { background: #15171c !important; }',
    '.scheme-dark .email-card { background: #1f2329 !important; }',
    '.scheme-dark .email-card p, .scheme-dark .email-card a, .scheme-dark .email-card span, .scheme-dark .email-card strong { color: #e5e7eb !important; }',
    '.scheme-dark .email-rule { border-color: #363b44 !important; }',
    '.scheme-dark .email-datacard { background: #2a2f37 !important; border-color: #363b44 !important; }',
  ].join('\n')

  // Variables version: every fixture prop becomes {propName}
  const varsProps = Object.fromEntries(
    Object.keys(fixture.props).map((k) => [k, `{${k}}`])
  )

  return (
    <Html lang={first}>
      <Head>
        <EmailFonts />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </Head>
      <Preview>{mod.previewText(brand, first)}</Preview>
      <Body style={{ backgroundColor: '#f3f4f6', fontFamily: tokens.fontFamily, margin: 0, padding: '40px 0' }}>
        {/* Persistent top-right buttons: Data/Vars + Light/Dark */}
        <div dangerouslySetInnerHTML={{ __html: BUTTONS }} />

        <div>
          {/* Language radios */}
          {locales.map((l) => (
            <input key={l} type="radio" name={RADIO} id={`${RADIO}-${l}`} className="locradio" defaultChecked={l === first} />
          ))}

          {/* Metadata card (language toggle only) */}
          <div className="meta-wrap">
            <Container style={{ maxWidth: tokens.containerWidth, margin: '0 auto 20px', padding: 0 }}>
              <PreviewMeta {...mod.meta} brand={brand} locale={first} locales={locales} radioName={RADIO} />
            </Container>
          </div>

          {/* Per-locale: data view + vars view (CSS shows the right one) */}
          <div className="stacks" style={{ padding: '24px 0' }}>
            {locales.map((locale) => (
              <div key={locale} className={`loc loc-${locale}`}>
                <div className="view-data-content">
                  <EmailCard brand={brand}>{mod.Content({ brand, locale, ...fixture.props })}</EmailCard>
                </div>
                <div className="view-vars-content">
                  <EmailCard brand={brand}>{mod.Content({ brand, locale, ...varsProps })}</EmailCard>
                </div>
              </div>
            ))}
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: SCRIPTS }} />
      </Body>
    </Html>
  )
}
