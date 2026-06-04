import {
  Html,
  Head,
  Body,
  Container,
  Font,
  Preview,
} from '@react-email/components'
import { tokens } from '../tokens'
import { BRANDS, type Brand } from '../brand'
import type { Locale } from '../i18n'
import { Header } from './Header'
import { Footer } from './Footer'
import { PreviewMeta, type PreviewMetaProps } from './PreviewMeta'

interface LayoutProps {
  preview:  string
  brand?:   Brand
  lang?:    Locale
  /** When set, renders the dev metadata banner above the email (preview only). */
  meta?:    PreviewMetaProps
  children: React.ReactNode
}

export function Layout({ preview, brand = 'fillit', lang = 'en', meta, children }: LayoutProps) {
  const { logoUri, siteUrl, siteName } = BRANDS[brand]

  return (
    <Html lang={lang}>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: '#f3f4f6',
          fontFamily: tokens.fontFamily,
          margin: 0,
          padding: '40px 0',
        }}
      >
        {/* Dev metadata banner — preview only */}
        {meta && (
          <Container style={{ maxWidth: tokens.containerWidth, margin: '0 auto 20px', padding: 0 }}>
            <PreviewMeta {...meta} />
          </Container>
        )}

        <Container
          style={{
            backgroundColor: tokens.colorBackground,
            borderRadius: tokens.borderRadius,
            maxWidth: tokens.containerWidth,
            margin: '0 auto',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <Header logoUrl={logoUri} />
          {children}
          <Footer siteUrl={siteUrl} siteName={siteName} />
        </Container>
      </Body>
    </Html>
  )
}
