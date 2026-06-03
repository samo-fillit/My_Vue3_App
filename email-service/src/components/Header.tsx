import { Section, Img } from '@react-email/components'
import { tokens } from '../tokens'

interface HeaderProps {
  logoUrl: string
}

export function Header({ logoUrl }: HeaderProps) {
  return (
    <Section
      style={{
        padding: '32px 40px 28px',
        borderBottom: `1px solid ${tokens.colorBorder}`,
      }}
    >
      <Img
        src={logoUrl}
        width={120}
        height={90}
        alt="Fillit"
        style={{ display: 'block' }}
      />
    </Section>
  )
}
