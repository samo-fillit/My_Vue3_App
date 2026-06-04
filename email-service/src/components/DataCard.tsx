import { Section, Row, Column, Text } from '@react-email/components'
import { tokens } from '../tokens'

export interface DataRow {
  label: string
  value: string
}

interface DataCardProps {
  title?: string
  rows: DataRow[]
}

export function DataCard({ title, rows }: DataCardProps) {
  return (
    <Section
      className="email-datacard"
      style={{
        backgroundColor: tokens.colorSurface,
        borderRadius: tokens.borderRadiusSm,
        border: `1px solid ${tokens.colorBorder}`,
        overflow: 'hidden',
        margin: '0 0 24px',
      }}
    >
      {title && (
        <Section
          style={{
            backgroundColor: tokens.colorBorder,
            padding: '10px 16px',
          }}
        >
          <Text
            style={{
              fontFamily: tokens.fontFamily,
              fontSize: tokens.fontSizeSmall,
              fontWeight: 600,
              color: tokens.colorForeground,
              margin: 0,
              lineHeight: '1',
            }}
          >
            {title}
          </Text>
        </Section>
      )}
      {rows.map((row, i) => (
        <Section
          key={i}
          style={{
            padding: '10px 16px',
            borderTop: i === 0 && !title ? 'none' : `1px solid ${tokens.colorBorder}`,
          }}
        >
          <Row>
            <Column style={{ width: '40%' }}>
              <Text
                style={{
                  fontFamily: tokens.fontFamily,
                  fontSize: tokens.fontSizeSmall,
                  color: tokens.colorMuted,
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                {row.label}
              </Text>
            </Column>
            <Column>
              <Text
                style={{
                  fontFamily: tokens.fontFamily,
                  fontSize: tokens.fontSizeSmall,
                  color: tokens.colorForeground,
                  fontWeight: 500,
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                {row.value}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}
    </Section>
  )
}
