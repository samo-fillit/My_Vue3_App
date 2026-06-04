import type { BrandTag } from './brand'

/** Plain metadata for every email — single source of truth (no JSX here so the
 *  generator script can import it cheaply). */
export interface EmailMeta {
  id:      string
  title:   string
  context: string
  trigger: string
  tag:     BrandTag
}

export const EMAILS: EmailMeta[] = [
  {
    id:      'team-invite',
    title:   'Team invitation',
    context: 'Sent to a person invited to join a team, prompting them to accept.',
    trigger: 'Teams page → "Invite user"',
    tag:     'general',
  },
  {
    id:      'signatory-added',
    title:   'Signatory added',
    context: 'Notifies an external signatory that they were added as a DocuSign signatory for a centre.',
    trigger: 'Teams page → centre signatories → "Add signatory"',
    tag:     'eleaseloop',
  },
]

export function emailMeta(id: string): EmailMeta {
  const m = EMAILS.find((e) => e.id === id)
  if (!m) throw new Error(`Unknown email id: ${id}`)
  return m
}
