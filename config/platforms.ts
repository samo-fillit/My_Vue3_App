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
  | 'manage:team'
  | 'manage:payouts'
  | 'manage:spaces'
  | 'manage:centres'
  | 'view:transactions'
  | 'view:analytics'
  | 'manage:crm'
  | 'export:data'

export const rolePermissions: Record<Permission, Role[]> = {
  'manage:team':       ['admin'],
  'manage:payouts':    ['admin', 'accounts'],
  'manage:spaces':     ['admin'],
  'manage:centres':    ['admin'],
  'view:transactions': ['admin', 'accounts'],
  'view:analytics':    ['admin', 'accounts', 'member'],
  'manage:crm':        ['admin', 'member'],
  'export:data':       ['admin', 'accounts'],
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
      nav: ['dashboard', 'bookings', 'calendar', 'messages', 'create-link', 'transactions'],
      org: ['account-profile', 'account-teams', 'account-centres', 'account-spaces', 'account-payments', 'account-notifications'],
    },
    tenant: {
      nav: ['dashboard', 'bookings', 'calendar', 'messages', 'invoices'],
      org: ['account-profile', 'account-teams', 'account-lease-info', 'account-notifications'],
    },
  },
  eleaseloop: {
    landlord: {
      nav: ['dashboard', 'bookings', 'calendar', 'messages', 'create-link', 'transactions', 'analytics', 'crm'],
      org: ['account-profile', 'account-teams', 'account-centres', 'account-spaces', 'account-payments', 'account-notifications'],
    },
    tenant: {
      nav: ['dashboard', 'bookings', 'calendar', 'messages', 'invoices'],
      org: ['account-profile', 'account-teams', 'account-lease-info', 'account-notifications'],
    },
  },
}
