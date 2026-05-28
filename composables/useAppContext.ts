import { computed } from 'vue'
import { platformConfig, rolePermissions } from '@/config/platforms'
import type { Permission } from '@/config/platforms'

export type Platform = 'fillit' | 'eleaseloop'
export type UserType = 'landlord' | 'tenant'
export type Role = 'admin' | 'member' | 'accounts'

export interface AppContext {
  platform: Platform
  userType: UserType
  role: Role
}

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'fillit',     label: 'Fillit' },
  { value: 'eleaseloop', label: 'eLeaseLoop' },
]

export const USER_TYPES: { value: UserType; label: string }[] = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'tenant',   label: 'Tenant' },
]

export const ROLES: { value: Role; label: string }[] = [
  { value: 'admin',    label: 'Admin' },
  { value: 'member',   label: 'Member' },
  { value: 'accounts', label: 'Accounts' },
]

export function useAppContext() {
  const context = useState<AppContext>('app-context', () => ({
    platform: 'fillit',
    userType: 'landlord',
    role: 'admin',
  }))

  // ── Setters ──────────────────────────────────────────────────────────────────
  // Replace the entire value rather than mutating properties — ensures reactivity
  // across all consumers regardless of whether useState uses a shallow ref.
  function setPlatform(v: Platform) { context.value = { ...context.value, platform: v } }
  function setUserType(v: UserType) { context.value = { ...context.value, userType: v } }
  function setRole(v: Role)         { context.value = { ...context.value, role: v } }

  // ── Simple boolean helpers ───────────────────────────────────────────────────
  const isPlatform = (p: Platform) => context.value.platform === p
  const isUserType = (u: UserType) => context.value.userType === u
  const isRole     = (r: Role)     => context.value.role === r

  // ── Permission check ─────────────────────────────────────────────────────────
  // Returns true if the current role has the given permission.
  function can(permission: Permission): boolean {
    return rolePermissions[permission]?.includes(context.value.role) ?? false
  }

  // ── Active nav / org items for current platform × userType ───────────────────
  const activeNav = computed(() =>
    platformConfig[context.value.platform][context.value.userType].nav
  )

  const activeOrg = computed(() =>
    platformConfig[context.value.platform][context.value.userType].org
  )

  return {
    context,
    setPlatform,
    setUserType,
    setRole,
    isPlatform,
    isUserType,
    isRole,
    can,
    activeNav,
    activeOrg,
  }
}
