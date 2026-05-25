import { computed } from 'vue'

// Lightweight team shape used for the global selector.
// Full team data (members, centres, signatories) is loaded per-page from the API.
export interface TeamSummary {
  id: string
  name: string
  color: string
}

// ── Mock seed (matches server/data/teams.json) ────────────────────────────────
// In production this comes from the authenticated user's session.
const SEED_TEAMS: TeamSummary[] = [
  { id: 'team-one', name: 'Team One', color: '#059669' },
  { id: 'team-two', name: 'Team Two', color: '#2563eb' },
]

export function useTeamContext() {
  const teams       = useState<TeamSummary[]>('team-list',      () => SEED_TEAMS)
  const activeTeamId = useState<string>('active-team-id',       () => SEED_TEAMS[0]?.id ?? '')

  const activeTeam  = computed(() =>
    teams.value.find(t => t.id === activeTeamId.value) ?? teams.value[0] ?? null
  )

  function setActiveTeam(id: string) {
    activeTeamId.value = id
  }

  return { teams, activeTeamId, activeTeam, setActiveTeam }
}
