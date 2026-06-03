import { Section, Row, Column, Link, Text, Hr } from '@react-email/components'
import { tokens } from '../tokens'

interface FooterProps {
  siteUrl:  string
  siteName: string
}

export function Footer({ siteUrl, siteName }: FooterProps) {
  return (
    <>
      <Hr style={{ borderColor: tokens.colorBorder, margin: 0 }} />
      <Section style={{ padding: '24px 40px' }}>
        <Row>
          <Column>
            <Text
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeMicro,
                color: tokens.colorMuted,
                margin: '0 0 4px',
                lineHeight: '1.5',
              }}
            >
              Fillit · Specialty Leasing Platform
            </Text>
            <Text
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeMicro,
                color: tokens.colorMuted,
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              <Link
                href={siteUrl}
                style={{ color: tokens.colorMuted, textDecoration: 'underline' }}
              >
                {siteName}
              </Link>
            </Text>
          </Column>
        </Row>
      </Section>
    </>
  )
}
