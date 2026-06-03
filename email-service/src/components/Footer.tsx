import { Section, Row, Column, Link, Text, Hr } from '@react-email/components'
import { tokens } from '../tokens'

const socialLinks = [
  { label: 'LinkedIn',  href: 'https://linkedin.com/company/fillit' },
  { label: 'Instagram', href: 'https://instagram.com/fillit' },
]

export function Footer() {
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
                margin: '0 0 8px',
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
              {socialLinks.map((link, i) => (
                <>
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{ color: tokens.colorMuted, textDecoration: 'underline' }}
                  >
                    {link.label}
                  </Link>
                  {i < socialLinks.length - 1 && '  ·  '}
                </>
              ))}
            </Text>
          </Column>
        </Row>
      </Section>
    </>
  )
}
