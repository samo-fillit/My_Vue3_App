import {
  Html,
  Head,
  Body,
  Container,
  Font,
  Preview,
} from '@react-email/components'
import { tokens, platformConfig, type Platform } from '../tokens'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  preview:   string
  platform?: Platform
  children:  React.ReactNode
}

export function Layout({ preview, platform = 'fillit', children }: LayoutProps) {
  const { logoUrl, siteUrl, siteName } = platformConfig[platform]

  return (
    <Html lang="en">
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
          <Header logoUrl={logoUrl} />
          {children}
          <Footer siteUrl={siteUrl} siteName={siteName} />
        </Container>
      </Body>
    </Html>
  )
}
