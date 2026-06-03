import { Hr } from '@react-email/components'
import { tokens } from '../tokens'

interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingMap = { sm: '16px', md: '24px', lg: '32px' }

export function Divider({ spacing = 'md' }: DividerProps) {
  const gap = spacingMap[spacing]
  return (
    <Hr
      style={{
        borderColor: tokens.colorBorder,
        borderTopWidth: '1px',
        margin: `${gap} 0`,
      }}
    />
  )
}
