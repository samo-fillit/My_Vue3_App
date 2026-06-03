import { Button as EmailButton, Section } from '@react-email/components'
import { tokens } from '../tokens'

interface ButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  align?: 'left' | 'center'
}

export function Button({ href, children, variant = 'primary', align = 'left' }: ButtonProps) {
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
          backgroundColor: isPrimary ? tokens.colorPrimary : 'transparent',
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
