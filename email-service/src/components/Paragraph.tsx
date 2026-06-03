import { Text } from '@react-email/components'
import { tokens } from '../tokens'

interface ParagraphProps {
  children: React.ReactNode
  muted?: boolean
  small?: boolean
  style?: React.CSSProperties
}

export function Paragraph({ children, muted, small, style }: ParagraphProps) {
  return (
    <Text
      style={{
        fontFamily: tokens.fontFamily,
        fontSize: small ? tokens.fontSizeSmall : tokens.fontSizeBase,
        color: muted ? tokens.colorMuted : tokens.colorForeground,
        lineHeight: tokens.lineHeightBase,
        margin: '0 0 16px',
        ...style,
      }}
    >
      {children}
    </Text>
  )
}
