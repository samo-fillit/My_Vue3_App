import type { Platform, UserType, Role } from '@/composables/useAppContext'

// ─── Nav & feature IDs ────────────────────────────────────────────────────────

export type NavItemId =
  | 'dashboard'
  | 'bookings'
  | 'calendar'
  | 'messages'
  | 'create-link'
  | 'transactions'
  | 'invoices'
  | 'analytics'
  | 'crm'

export type OrgItemId =
  | 'account-profile'
  | 'account-teams'
  | 'account-centres'
  | 'account-spaces'
  | 'account-lease-info'
  | 'account-payments'
  | 'account-notifications'

export type FeatureId = NavItemId | OrgItemId

// ─── Role permissions ─────────────────────────────────────────────────────────
// Maps a permission key to the roles that have it.
// Used by can() in useAppContext.

export type Permission =
  // org-profile
  | 'edit:org-profile'
  // teams
  | 'invite:users'
  | 'action:pending-invites'
  | 'move:centre-team'
  | 'manage:signatories'
  | 'edit:team'
  | 'create:team'
  | 'change:user-roles'
  // centres / spaces / payouts
  | 'edit:centres'
  | 'edit:spaces'
  | 'edit:payouts'
  // notifications
  | 'edit:notifications'
  // transactions
  | 'manage:transactions'
  // legacy (keep existing ones)
  | 'view:analytics'
  | 'manage:crm'

export const rolePermissions: Record<Permission, Role[]> = {
  'edit:org-profile':       ['admin'],
  'invite:users':           ['admin', 'member'],
  'action:pending-invites': ['admin'],
  'move:centre-team':       ['admin'],
  'manage:signatories':     ['admin'],
  'edit:team':              ['admin'],
  'create:team':            ['admin'],
  'change:user-roles':      ['admin'],
  'edit:centres':           ['admin'],
  'edit:spaces':            ['admin'],
  'edit:payouts':           ['admin'],
  'edit:notifications':     ['admin'],
  'manage:transactions':    ['admin', 'accounts'],
  'view:analytics':         ['admin', 'accounts', 'member'],
  'manage:crm':             ['admin', 'member'],
}

// ─── Platform × UserType config ───────────────────────────────────────────────

interface PlatformUserConfig {
  /** Main nav items shown in the sidebar, in order */
  nav: NavItemId[]
  /** Organisation sub-items shown under the collapsible */
  org: OrgItemId[]
}

type PlatformConfig = Record<Platform, Record<UserType, PlatformUserConfig>>

export const platformConfig: PlatformConfig = {
  fillit: {
    landlord: {
      nav: ['dashboard', 'bookings', 'transactions', 'crm', 'calendar', 'messages', 'create-link'],
      org: ['account-profile', 'account-teams', 'account-centres', 'account-spaces', 'account-notifications'],
    },
    tenant: {
      nav: ['dashboard', 'bookings', 'invoices', 'calendar', 'messages'],
      org: ['account-profile', 'account-teams', 'account-lease-info', 'account-notifications'],
    },
  },
  eleaseloop: {
    landlord: {
      nav: ['dashboard', 'bookings', 'transactions', 'crm', 'calendar', 'messages', 'create-link', 'analytics'],
      org: ['account-profile', 'account-teams', 'account-centres', 'account-spaces', 'account-payments', 'account-notifications'],
    },
    tenant: {
      nav: ['dashboard', 'bookings', 'invoices', 'calendar', 'messages'],
      org: ['account-profile', 'account-teams', 'account-lease-info', 'account-notifications'],
    },
  },
}
