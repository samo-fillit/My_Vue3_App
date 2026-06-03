import { Layout }    from '../components/Layout'
import { EmailBody } from '../components/Body'
import { Paragraph } from '../components/Paragraph'
import { DataCard }  from '../components/DataCard'
import { Divider }   from '../components/Divider'
import type { Platform } from '../tokens'

export interface SignatoryAddedProps {
  /** Full name of the signatory being notified */
  signatoryName: string
  /** Name of the shopping centre they've been added for */
  centreName: string
  /** Name of the landlord team (e.g. "Nhood ES") */
  teamName: string
  /** Name of the person who added them */
  addedByName: string
  /** Email address of the person who added them (for follow-up questions) */
  addedByEmail: string
  /** Platform brand — determines logo and site URL in header/footer */
  platform?: Platform
}

export default function SignatoryAdded({
  signatoryName = 'James Miller',
  centreName    = 'Centro Comercial Xanadú',
  teamName      = 'Nhood ES',
  addedByName   = 'Carlos García',
  addedByEmail  = 'c.garcia@eleaseloop.es',
  platform      = 'eleaseloop',
}: SignatoryAddedProps) {
  return (
    <Layout
      preview={`You've been added as a DocuSign signatory for ${centreName}`}
      platform={platform}
    >
      <EmailBody>
        <Paragraph>Hi {signatoryName},</Paragraph>

        <Paragraph>
          You've been added as a DocuSign signatory for{' '}
          <strong>{centreName}</strong> by <strong>{teamName}</strong>.
        </Paragraph>

        <Paragraph>
          When a lease or contract document is ready for your signature, you'll
          receive a separate email from DocuSign with a link to review and sign
          electronically. No DocuSign account is required — you can sign directly
          from the email.
        </Paragraph>

        <DataCard
          rows={[
            { label: 'Centre',   value: centreName },
            { label: 'Team',     value: teamName },
            { label: 'Added by', value: addedByName },
          ]}
        />

        <Divider />

        <Paragraph muted small>
          If you have questions about this or believe you've been added in error,
          contact {addedByName} at{' '}
          <a href={`mailto:${addedByEmail}`} style={{ color: '#6b7280' }}>
            {addedByEmail}
          </a>
          .
        </Paragraph>
      </EmailBody>
    </Layout>
  )
}
