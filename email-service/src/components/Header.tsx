import { Section, Img } from '@react-email/components'
import { tokens } from '../tokens'

interface HeaderProps {
  logoUrl: string
}

export function Header({ logoUrl }: HeaderProps) {
  return (
    <Section
      className="email-rule"
      style={{
        padding: '32px 40px 28px',
        borderBottom: `1px solid ${tokens.colorBorder}`,
      }}
    >
      <Img
        src={logoUrl}
        width={60}
        height={45}
        alt="Fillit"
        style={{ display: 'block' }}
      />
    </Section>
  )
}
