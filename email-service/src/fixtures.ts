/** A named test scenario for an email — drives the preview's Scenario toggle. */
export interface Fixture {
  id:    string
  label: string
  props: Record<string, string>
}

// Imported statically so the preview works without a build step.
import teamInviteFixtures     from './fixtures/team-invite.json'
import signatoryAddedFixtures from './fixtures/signatory-added.json'

export const FIXTURES: Record<string, Fixture[]> = {
  'team-invite':     teamInviteFixtures     as Fixture[],
  'signatory-added': signatoryAddedFixtures as Fixture[],
}

/** Returns fixtures for an email, or a single default entry if none defined. */
export function fixturesFor(emailId: string): Fixture[] {
  return FIXTURES[emailId] ?? [{ id: 'default', label: 'Default', props: {} }]
}
