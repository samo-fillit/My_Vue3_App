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
const SCENARIO = 'scen'
const VIEW = 'view'

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

export function LocaleTabs({ email, brand }: { email: string; brand: Brand }) {
  const mod = EMAIL_MODULES[email]
  const locales = BRAND_LOCALES[brand]
  const first = locales[0]
  const accent = BRANDS[brand].primary
  const fixtures = fixturesFor(email)
  const firstScenario = fixtures[0]

  const css = [
    // ── Locale visibility ──────────────────────────────────────────────────────
    '.loc { display: none; }',
    '.locradio { display: none !important; }',
    ...locales.map((l) => `#${RADIO}-${l}:checked ~ .stacks .loc-${l} { display: block; }`),
    // active language pill
    ...locales.map((l) =>
      `#${RADIO}-${l}:checked ~ .meta-wrap .langpill-${l} { background: ${accent} !important; color: #fff !important; border-color: transparent !important; font-weight: 700 !important; }`
    ),
    // ── Scenario visibility ────────────────────────────────────────────────────
    '.scen { display: none; }',
    ...fixtures.map((f) =>
      `#${SCENARIO}-${f.id}:checked ~ .stacks .scen-${f.id} { display: block; }`
    ),
    // active scenario pill
    ...fixtures.map((f) =>
      `#${SCENARIO}-${f.id}:checked ~ .meta-wrap .scenpill-${f.id} { background: ${accent} !important; color: #fff !important; border-color: transparent !important; font-weight: 700 !important; }`
    ),
    // ── Data / Variables view ─────────────────────────────────────────────────
    // Default: data view shown, vars hidden
    '.view-vars { display: none; }',
    '.view-data { display: block; }',
    // When vars radio checked: flip
    `#${VIEW}-vars:checked ~ .stacks .view-vars { display: block; }`,
    `#${VIEW}-vars:checked ~ .stacks .view-data { display: none; }`,
    // Active view pills
    `#${VIEW}-data:checked ~ .meta-wrap .viewpill-data { background: #475569 !important; color: #fff !important; border-color: transparent !important; font-weight: 700 !important; }`,
    `#${VIEW}-vars:checked ~ .meta-wrap .viewpill-vars { background: #f59e0b !important; color: #fff !important; border-color: transparent !important; font-weight: 700 !important; }`,
    // Amber border on email card in vars mode so it's clearly not a real preview
    `#${VIEW}-vars:checked ~ .stacks .email-card { outline: 2px solid #f59e0b !important; outline-offset: 2px !important; }`,
    // ── Dark mode ─────────────────────────────────────────────────────────────
    '.scheme-dark, .scheme-dark body { background: #15171c !important; }',
    '.scheme-dark .stacks { background: #15171c !important; }',
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
        <div dangerouslySetInnerHTML={{ __html: SCHEME_BUTTON }} />

        <div>
          {/* Language radios */}
          {locales.map((l) => (
            <input key={l} type="radio" name={RADIO} id={`${RADIO}-${l}`} className="locradio" defaultChecked={l === first} />
          ))}
          {/* Scenario radios */}
          {fixtures.map((f) => (
            <input key={f.id} type="radio" name={SCENARIO} id={`${SCENARIO}-${f.id}`} className="locradio" defaultChecked={f.id === firstScenario.id} />
          ))}
          {/* View radios — data (default) or variables */}
          <input type="radio" name={VIEW} id={`${VIEW}-data`} className="locradio" defaultChecked />
          <input type="radio" name={VIEW} id={`${VIEW}-vars`} className="locradio" />

          {/* Metadata card */}
          <div className="meta-wrap">
            <Container style={{ maxWidth: tokens.containerWidth, margin: '0 auto 20px', padding: 0 }}>
              <PreviewMeta
                {...mod.meta}
                brand={brand}
                locale={first}
                locales={locales}
                radioName={RADIO}
                fixtures={fixtures}
                scenarioRadio={SCENARIO}
                viewRadio={VIEW}
              />
            </Container>
          </div>

          {/* Stacked scenario × locale grid (CSS shows the active combination) */}
          <div className="stacks" style={{ padding: '24px 0' }}>
            {fixtures.map((f) => {
              // Variables version: every fixture prop becomes {propName}
              const varsProps = Object.fromEntries(
                Object.keys(f.props).map((k) => [k, `{${k}}`])
              )
              return (
                <div key={f.id} className={`scen scen-${f.id}`}>
                  {locales.map((locale) => (
                    <div key={locale} className={`loc loc-${locale}`}>
                      {/* Data view */}
                      <div className="view-data">
                        <EmailCard brand={brand}>{mod.Content({ brand, locale, ...f.props })}</EmailCard>
                      </div>
                      {/* Variables view — {propName} in place of values */}
                      <div className="view-vars">
                        <EmailCard brand={brand}>{mod.Content({ brand, locale, ...varsProps })}</EmailCard>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: SCHEME_SCRIPT }} />
      </Body>
    </Html>
  )
}
