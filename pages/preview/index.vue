<template>
  <div class="min-h-screen bg-background">
    <div class="mx-auto max-w-[1100px] px-12 py-12">

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Fillit Design Lab</p>
          <h1 class="mt-1 text-2xl font-bold text-foreground">Preview pages</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ totalPages }} screens across {{ groups.length }} areas</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-for="s in statuses"
            :key="s.value"
            class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
            :class="activeFilter === s.value
              ? 'border-foreground bg-foreground text-background'
              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'"
            @click="activeFilter = activeFilter === s.value ? null : s.value"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="s.dot" />
            {{ s.label }}
            <span class="tabular-nums opacity-60">{{ countByStatus(s.value) }}</span>
          </button>
        </div>
      </div>

      <!-- Groups -->
      <div class="mt-10 flex flex-col gap-10">
        <div v-for="group in filteredGroups" :key="group.label">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{{ group.label }}</p>
          <div class="grid grid-cols-3 gap-3">
            <NuxtLink
              v-for="page in group.pages"
              :key="page.path"
              :to="page.path"
              class="group flex flex-col gap-3 rounded-xl border border-border p-5 transition-colors hover:border-foreground/30 hover:bg-muted/40"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-sm font-semibold text-foreground leading-snug">{{ page.label }}</span>
                <span
                  class="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="statusStyle(page.status)"
                >
                  {{ page.status }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground leading-relaxed">{{ page.description }}</p>
              <div class="flex flex-wrap gap-1 mt-auto pt-1">
                <span
                  v-for="tag in page.tags"
                  :key="tag"
                  class="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border"
                >
                  {{ tag }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Status = 'In progress' | 'Ready for review' | 'Signed off'

interface PreviewPage {
  path: string
  label: string
  description: string
  status: Status
  tags: string[]
}

interface Group {
  label: string
  pages: PreviewPage[]
}

const statuses: { value: Status; label: string; dot: string }[] = [
  { value: 'In progress',      label: 'In progress',      dot: 'bg-amber-400' },
  { value: 'Ready for review', label: 'Ready for review', dot: 'bg-blue-400' },
  { value: 'Signed off',       label: 'Signed off',       dot: 'bg-green-500' },
]

const activeFilter = ref<Status | null>(null)

const groups: Group[] = [
  {
    label: 'Navigation',
    pages: [
      {
        path: '/preview/sidebar',
        label: 'App sidebar',
        description: 'Global navigation with team switcher, platform-filtered nav items, notification badge, AI assistant trigger, and user menu.',
        status: 'Signed off',
        tags: ['landlord', 'tenant', 'fillit', 'eleaseloop'],
      },
    ],
  },
  {
    label: 'Account',
    pages: [
      {
        path: '/preview/profile',
        label: 'Profile',
        description: 'Personal account settings — display name, email, avatar, and password change.',
        status: 'In progress',
        tags: ['landlord', 'tenant'],
      },
      {
        path: '/preview/security',
        label: 'Security',
        description: 'Two-factor authentication setup and active session management.',
        status: 'In progress',
        tags: ['landlord', 'tenant'],
      },
    ],
  },
  {
    label: 'Organisation',
    pages: [
      {
        path: '/preview/org-profile',
        label: 'Org profile',
        description: 'Organisation branding, contact details, and (tenant-only) company type, sector, and brand description.',
        status: 'In progress',
        tags: ['landlord', 'tenant'],
      },
      {
        path: '/preview/teams',
        label: 'Teams & permissions',
        description: 'Manage team members, roles, pending invites, external signatories, and managed assets. Tenant view hides signatory and asset tabs.',
        status: 'Signed off',
        tags: ['landlord', 'tenant', 'api-backed'],
      },
      {
        path: '/preview/centres',
        label: 'Centres',
        description: 'List and manage shopping centre locations. Includes inline editing, signatory assignment, and team filtering.',
        status: 'Signed off',
        tags: ['landlord', 'api-backed'],
      },
      {
        path: '/preview/spaces',
        label: 'Spaces',
        description: 'Manage lettable spaces within centres — type, size, price, status, and images.',
        status: 'Signed off',
        tags: ['landlord', 'api-backed'],
      },
      {
        path: '/preview/lease-details',
        label: 'Lease details',
        description: 'Tenant-side lease information used to pre-fill contract templates on Docusign.',
        status: 'In progress',
        tags: ['tenant'],
      },
      {
        path: '/preview/payments',
        label: 'Payouts',
        description: 'Payout account management — Stripe Connect or bank transfer, with centre/space assignment per account.',
        status: 'In progress',
        tags: ['landlord'],
      },
      {
        path: '/preview/notifications-settings',
        label: 'Notification settings',
        description: 'Required and optional notification toggles. Landlord and tenant see different relevant options.',
        status: 'Signed off',
        tags: ['landlord', 'tenant'],
      },
    ],
  },
  {
    label: 'Core pages',
    pages: [
      {
        path: '/preview/transactions',
        label: 'Transactions',
        description: 'Full transaction history with status tabs, date range filter, sortable table, and summary stats.',
        status: 'Signed off',
        tags: ['landlord', 'fillit', 'eleaseloop'],
      },
      {
        path: '/preview/invoices',
        label: 'Transactions (tenant)',
        description: 'Tenant-side transaction history with status filter, date range picker, sortable table, and change payment method overlay.',
        status: 'In progress',
        tags: ['tenant'],
      },
      {
        path: '/preview/booking-links',
        label: 'Booking links',
        description: 'Create direct booking invitations for tenants and track their status — sent, declined, or completed.',
        status: 'In progress',
        tags: ['landlord'],
      },
      {
        path: '/preview/messages',
        label: 'Messages',
        description: 'One-thread-per-contact messaging between landlords and tenants, with file/image attachments and new conversation search.',
        status: 'In progress',
        tags: ['landlord', 'tenant', 'fillit', 'eleaseloop'],
      },
    ],
  },
]

const totalPages = computed(() =>
  groups.reduce((n, g) => n + g.pages.length, 0)
)

function countByStatus(status: Status) {
  return groups.flatMap(g => g.pages).filter(p => p.status === status).length
}

const filteredGroups = computed(() => {
  if (!activeFilter.value) return groups
  return groups
    .map(g => ({ ...g, pages: g.pages.filter(p => p.status === activeFilter.value) }))
    .filter(g => g.pages.length > 0)
})

function statusStyle(status: Status) {
  if (status === 'Signed off')       return 'bg-green-50 text-green-700'
  if (status === 'Ready for review') return 'bg-blue-50 text-blue-700'
  return 'bg-amber-50 text-amber-700'
}
</script>
