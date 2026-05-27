import { computed, watch } from 'vue'
import { useAppContext } from '@/composables/useAppContext'
import type { SupportedLocale } from '@/config/locales'

// Lightweight team shape used for the global selector.
// Full team data (members, centres, signatories) is loaded per-page from the API.
export interface TeamSummary {
  id: string
  name: string
  color: string
  /** ISO 3166-1 alpha-2 country code — eLeaseLoop country teams only */
  country?: string
  /** Local language locale for this country team */
  countryLocale?: SupportedLocale
}

// ── Landlord teams — Fillit ────────────────────────────────────────────────────
const FILLIT_TEAMS: TeamSummary[] = [
  { id: 'team-one', name: 'Team One', color: '#059669' },
  { id: 'team-two', name: 'Team Two', color: '#2563eb' },
]

// ── Landlord teams — eLeaseLoop ────────────────────────────────────────────────
// One country team per active market. Each has a local language.
const ELEASELOOP_TEAMS: TeamSummary[] = [
  { id: 'team-spain',  name: 'Spain',  color: '#c0392b', country: 'es', countryLocale: 'es' },
  { id: 'team-france', name: 'France', color: '#2980b9', country: 'fr', countryLocale: 'fr' },
  { id: 'team-italy',  name: 'Italy',  color: '#27ae60', country: 'it', countryLocale: 'it' },
  { id: 'team-poland', name: 'Poland', color: '#8e44ad', country: 'pl', countryLocale: 'pl' },
]

// ── Tenant teams ───────────────────────────────────────────────────────────────
// Tenants belong to a single company team — no need for multi-team switching.
// Same team is used regardless of platform so the prototype stays simple.
const TENANT_TEAM: TeamSummary = { id: 'team-tenant', name: 'Fresh Co.', color: '#0891b2' }

export function useTeamContext() {
  const { context } = useAppContext()

  const activeTeamId = useState<string>('active-team-id', () => FILLIT_TEAMS[0]?.id ?? '')

  const teams = computed<TeamSummary[]>(() => {
    // Tenants are always a single-team company — no switcher needed
    if (context.value.userType === 'tenant') return [TENANT_TEAM]
    return context.value.platform === 'eleaseloop' ? ELEASELOOP_TEAMS : FILLIT_TEAMS
  })

  // When the platform or user type changes, reset to the first available team
  watch(
    () => [context.value.platform, context.value.userType] as const,
    () => { activeTeamId.value = teams.value[0]?.id ?? '' },
  )

  const activeTeam = computed<TeamSummary | null>(() =>
    teams.value.find(t => t.id === activeTeamId.value) ?? teams.value[0] ?? null
  )

  function setActiveTeam(id: string) {
    activeTeamId.value = id
  }

  return { teams, activeTeamId, activeTeam, setActiveTeam }
}
