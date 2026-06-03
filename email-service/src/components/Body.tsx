import { Section } from '@react-email/components'
import { tokens } from '../tokens'

interface EmailBodyProps {
  children: React.ReactNode
}

/** Main content area — handles consistent padding so templates don't repeat it. */
export function EmailBody({ children }: EmailBodyProps) {
  return (
    <Section style={{ padding: `32px ${tokens.containerPadding}` }}>
      {children}
    </Section>
  )
}
