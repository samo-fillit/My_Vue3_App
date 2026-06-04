import { Container } from '@react-email/components'
import { tokens } from '../tokens'
import { BRANDS, type Brand } from '../brand'
import { Header } from './Header'
import { Footer } from './Footer'

interface EmailCardProps {
  brand: Brand
  children: React.ReactNode
}

/** The visual email card (logo header + body + footer) without the <Html>
 *  document shell — so it can be used standalone (production) or stacked
 *  several times in one preview document (language tabs). */
export function EmailCard({ brand, children }: EmailCardProps) {
  const { logoUri, siteUrl, siteName } = BRANDS[brand]
  return (
    <Container
      className="email-card"
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
  )
}
