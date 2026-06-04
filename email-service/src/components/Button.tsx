import { Button as EmailButton, Section } from '@react-email/components'
import { tokens } from '../tokens'

interface ButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  align?: 'left' | 'center'
  /** Brand primary colour for the filled button (defaults to coral). */
  color?: string
}

export function Button({ href, children, variant = 'primary', align = 'left', color = tokens.colorPrimary }: ButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <Section style={{ textAlign: align, margin: '8px 0 24px' }}>
      <EmailButton
        href={href}
        style={{
          fontFamily: tokens.fontFamily,
          fontSize: tokens.fontSizeSmall,
          fontWeight: 600,
          color: isPrimary ? tokens.colorPrimaryForeground : tokens.colorForeground,
          backgroundColor: isPrimary ? color : 'transparent',
          border: isPrimary ? 'none' : `1.5px solid ${tokens.colorBorder}`,
          borderRadius: tokens.borderRadiusSm,
          padding: '12px 24px',
          textDecoration: 'none',
          display: 'inline-block',
          lineHeight: '1',
        }}
      >
        {children}
      </EmailButton>
    </Section>
  )
}
