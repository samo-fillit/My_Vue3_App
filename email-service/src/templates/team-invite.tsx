import { Layout }    from '../components/Layout'
import { Header }    from '../components/Header'
import { EmailBody } from '../components/Body'
import { Footer }    from '../components/Footer'
import { Paragraph } from '../components/Paragraph'
import { Button }    from '../components/Button'
import { Divider }   from '../components/Divider'

export interface TeamInviteProps {
  /** First name of the person being invited */
  recipientName: string
  /** Full name of the person who sent the invite */
  inviterName: string
  /** Display name of the team */
  teamName: string
  /** Invite accept URL */
  inviteUrl: string
}

export default function TeamInvite({
  recipientName = 'Sarah',
  inviterName   = 'Carlos García',
  teamName      = 'Nhood ES',
  inviteUrl     = 'https://app.fillit.com/invite/abc123',
}: TeamInviteProps) {
  return (
    <Layout preview={`${inviterName} has invited you to join ${teamName} on Fillit`}>
      <Header />

      <EmailBody>
        <Paragraph>Hi {recipientName},</Paragraph>

        <Paragraph>
          <strong>{inviterName}</strong> has invited you to join{' '}
          <strong>{teamName}</strong> on Fillit.
        </Paragraph>

        <Paragraph>
          Once you accept, you'll be able to collaborate with your team on
          bookings, spaces, and communications within Fillit.
        </Paragraph>

        <Button href={inviteUrl}>Accept invitation</Button>

        <Divider />

        <Paragraph muted small>
          This invitation was sent by {inviterName}. If you weren't expecting
          this, you can safely ignore this email — the invitation will expire
          after 7 days.
        </Paragraph>
      </EmailBody>

      <Footer />
    </Layout>
  )
}
