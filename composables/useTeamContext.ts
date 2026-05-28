import { computed, watch } from 'vue'
import { useAppContext } from '@/composables/useAppContext'
import { COUNTRY_LOCALE } from '@/config/locales'
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
const ELEASELOOP_TEAMS: TeamSummary[] = [
  { id: 'team-spain',  name: 'Nhood ES', color: '#c0392b', country: 'es', countryLocale: 'es' },
  { id: 'team-france',       name: 'Nhood FR North', color: '#2980b9', country: 'fr', countryLocale: 'fr' },
  { id: 'team-france-south', name: 'Nhood FR South', color: '#1a5276', country: 'fr', countryLocale: 'fr' },
  { id: 'team-italy',  name: 'Nhood IT', color: '#27ae60', country: 'it', countryLocale: 'it' },
  { id: 'team-poland', name: 'Nhood PL', color: '#8e44ad', country: 'pl', countryLocale: 'pl' },
]

// ── Tenant base team ───────────────────────────────────────────────────────────
// Fresh Co. operates in Spain on eLeaseLoop.
const TENANT_TEAM: TeamSummary = {
  id: 'team-tenant',
  name: 'Fresh Co.',
  color: '#0891b2',
  country: 'es',
}

export function useTeamContext() {
  const { context } = useAppContext()

  const activeTeamId  = useState<string>('active-team-id',  () => FILLIT_TEAMS[0]?.id ?? '')
  const activeCountry = useState<string>('active-country',  () => 'es')

  // ── Reactive landlord eLeaseLoop memberships ───────────────────────────────
  const landlordTeamIds = useState<string[]>(
    'landlord-team-ids',
    () => ['team-spain', 'team-france', 'team-france-south'],
  )

  // ── Custom teams created in-session (both landlord and tenant) ─────────────
  // IDs follow a predictable pattern so pages can detect "no mock data" reliably:
  //   landlord: "team-new-{country}"
  //   tenant:   "team-tenant-{country}"
  const customTeams = useState<TeamSummary[]>('custom-teams', () => [])

  // ── All teams the current user is a member of (platform-filtered, unscoped) ──
  const allUserTeams = computed<TeamSummary[]>(() => {
    if (context.value.platform !== 'eleaseloop') {
      return context.value.userType === 'tenant' ? [TENANT_TEAM] : FILLIT_TEAMS
    }
    if (context.value.userType === 'tenant') {
      // Base Spain team + any country teams created in-session
      const tenantCustom = customTeams.value.filter(t => t.id.startsWith('team-tenant-'))
      return [TENANT_TEAM, ...tenantCustom]
    }
    // Landlord: fixed Nhood teams the user is in + any newly created custom ones
    const allKnown = [
      ...ELEASELOOP_TEAMS,
      ...customTeams.value.filter(t => t.id.startsWith('team-new-')),
    ]
    return allKnown.filter(t => landlordTeamIds.value.includes(t.id))
  })

  // ── Countries where the user has eLeaseLoop teams ──────────────────────────
  const userCountries = computed<string[]>(() => {
    if (context.value.platform !== 'eleaseloop') return []
    return [...new Set(allUserTeams.value.filter(t => t.country).map(t => t.country!))]
  })

  // ── Whether the user has access to the active country ─────────────────────
  const hasCountryAccess = computed<boolean>(() => {
    if (context.value.platform !== 'eleaseloop') return true
    return allUserTeams.value.some(t => t.country === activeCountry.value)
  })

  // ── Teams visible in the sidebar team switcher (country-scoped) ────────────
  const teams = computed<TeamSummary[]>(() => {
    if (context.value.platform !== 'eleaseloop') {
      return context.value.userType === 'tenant' ? [TENANT_TEAM] : FILLIT_TEAMS
    }
    return allUserTeams.value.filter(t => t.country === activeCountry.value)
  })

  // Reset to a sensible state when platform or user type changes
  watch(
    () => [context.value.platform, context.value.userType] as const,
    ([platform]) => {
      if (platform === 'eleaseloop') {
        const first = allUserTeams.value.find(t => t.country)?.country ?? 'es'
        activeCountry.value = first
      }
      activeTeamId.value = teams.value[0]?.id ?? ''
    },
  )

  const activeTeam = computed<TeamSummary | null>(() =>
    teams.value.find(t => t.id === activeTeamId.value) ?? teams.value[0] ?? null
  )

  function setActiveTeam(id: string) {
    activeTeamId.value = id
  }

  function setActiveCountry(code: string) {
    activeCountry.value = code
    const first = allUserTeams.value.find(t => t.country === code)
    activeTeamId.value = first?.id ?? ''
  }

  /**
   * Create a brand-new team in `country` with no pre-existing mock data,
   * so new-team pages start clean. The ID pattern ensures no API mock data
   * matches these teams, giving a genuine empty-state experience.
   *
   * - Landlord team ID: "team-new-{country}"   e.g. "team-new-it"
   * - Tenant team ID:   "team-tenant-{country}" e.g. "team-tenant-fr"
   */
  function createTeamInCountry(country: string, teamName: string) {
    const isTenant = context.value.userType === 'tenant'
    const teamId   = isTenant ? `team-tenant-${country}` : `team-new-${country}`
    const locale   = COUNTRY_LOCALE[country] as SupportedLocale | undefined
    const color    = isTenant
      ? TENANT_TEAM.color
      : (ELEASELOOP_TEAMS.find(t => t.country === country)?.color ?? '#6b7280')

    if (!customTeams.value.find(t => t.id === teamId)) {
      customTeams.value = [
        ...customTeams.value,
        { id: teamId, name: teamName, color, country, countryLocale: locale },
      ]
    }

    if (!isTenant && !landlordTeamIds.value.includes(teamId)) {
      landlordTeamIds.value = [...landlordTeamIds.value, teamId]
    }

    setActiveCountry(country)
  }

  return {
    teams,
    allUserTeams,
    activeTeamId,
    activeTeam,
    setActiveTeam,
    activeCountry,
    userCountries,
    hasCountryAccess,
    setActiveCountry,
    createTeamInCountry,
  }
}
