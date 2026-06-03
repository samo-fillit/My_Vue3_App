import { Section, Img, Text } from '@react-email/components'
import { tokens } from '../tokens'

export function Header() {
  return (
    <Section
      style={{
        padding: '32px 40px 24px',
        borderBottom: `1px solid ${tokens.colorBorder}`,
      }}
    >
      {/*
        Using a text mark as the logo until a hosted asset URL is confirmed.
        Replace the <Text> with an <Img> once the logo CDN URL is available:
        <Img src="https://cdn.fillit.com/email/logo.png" width="80" height="24" alt="Fillit" />
      */}
      <Text
        style={{
          fontFamily: tokens.fontFamily,
          fontSize: '20px',
          fontWeight: 700,
          color: tokens.colorForeground,
          margin: 0,
          letterSpacing: '-0.5px',
        }}
      >
        fillit
      </Text>
    </Section>
  )
}
