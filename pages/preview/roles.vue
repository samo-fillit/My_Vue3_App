<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'

// ── Table data ─────────────────────────────────────────────────────────────────

interface PermRow {
  feature: string
  admin: boolean | string
  member: boolean | string
  accounts: boolean | string
}

interface PermSection {
  heading: string
  rows: PermRow[]
}

const sections: PermSection[] = [
  {
    heading: 'Organisation Profile',
    rows: [
      { feature: 'View profile',  admin: true,  member: true,  accounts: true  },
      { feature: 'Edit profile',  admin: true,  member: false, accounts: false },
    ],
  },
  {
    heading: 'Teams & Permissions',
    rows: [
      { feature: 'View members',                   admin: true,          member: true,          accounts: true  },
      { feature: 'Invite users',                   admin: true,          member: 'Invite only', accounts: false },
      { feature: 'Action pending invites',         admin: true,          member: false,         accounts: false },
      { feature: 'Change user roles',              admin: true,          member: false,         accounts: false },
      { feature: 'Edit team info',                 admin: true,          member: false,         accounts: false },
      { feature: 'Create / remove teams',          admin: true,          member: false,         accounts: false },
      { feature: 'Manage external signatories',    admin: true,          member: false,         accounts: false },
      { feature: 'Move centres between teams',     admin: true,          member: false,         accounts: false },
    ],
  },
  {
    heading: 'Centres',
    rows: [
      { feature: 'View centres',              admin: true, member: true,  accounts: true  },
      { feature: 'Add / edit / remove centres', admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Spaces',
    rows: [
      { feature: 'View spaces',              admin: true, member: true,  accounts: true  },
      { feature: 'Add / edit / remove spaces', admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Payouts',
    rows: [
      { feature: 'View payout accounts',            admin: true, member: true,  accounts: true  },
      { feature: 'Add / edit / remove accounts', admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Notifications',
    rows: [
      { feature: 'View notification settings',   admin: true, member: true,  accounts: true  },
      { feature: 'Change notification settings', admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Transactions',
    rows: [
      { feature: 'View transactions', admin: true,  member: true,  accounts: true  },
      { feature: 'Export CSV',        admin: true,  member: false, accounts: true  },
      { feature: 'Send reminders',    admin: true,  member: false, accounts: true  },
    ],
  },
]
</script>

<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="roles" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex flex-col gap-3">
            <h1 class="text-[28px] font-bold leading-8 text-foreground">Roles & Permissions</h1>
            <p class="text-base text-muted-foreground">Access control reference for landlord roles.</p>
          </div>

          <!-- Sections -->
          <div class="flex flex-col gap-12">
            <div v-for="section in sections" :key="section.heading" class="flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-foreground">{{ section.heading }}</h3>
              <Table>
                <TableHeader>
                  <TableRow class="border-border">
                    <TableHead class="w-1/2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Feature
                    </TableHead>
                    <TableHead class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <div class="inline-flex items-center gap-1.5">
                        <span class="h-2 w-2 rounded-full bg-foreground" />
                        Admin
                      </div>
                    </TableHead>
                    <TableHead class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <div class="inline-flex items-center gap-1.5">
                        <span class="h-2 w-2 rounded-full bg-blue-400" />
                        Member
                      </div>
                    </TableHead>
                    <TableHead class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <div class="inline-flex items-center gap-1.5">
                        <span class="h-2 w-2 rounded-full bg-green-500" />
                        Accounts
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="row in section.rows" :key="row.feature" class="border-border">
                    <TableCell class="py-3 text-sm text-foreground">{{ row.feature }}</TableCell>
                    <TableCell class="py-3 text-center">
                      <template v-if="row.admin === true">
                        <IconCheck :size="16" class="mx-auto text-green-600" />
                      </template>
                      <template v-else-if="typeof row.admin === 'string'">
                        <span class="text-xs text-muted-foreground">{{ row.admin }}</span>
                      </template>
                      <template v-else>
                        <span class="text-muted-foreground">—</span>
                      </template>
                    </TableCell>
                    <TableCell class="py-3 text-center">
                      <template v-if="row.member === true">
                        <IconCheck :size="16" class="mx-auto text-green-600" />
                      </template>
                      <template v-else-if="typeof row.member === 'string'">
                        <span class="text-xs text-muted-foreground">{{ row.member }}</span>
                      </template>
                      <template v-else>
                        <span class="text-muted-foreground">—</span>
                      </template>
                    </TableCell>
                    <TableCell class="py-3 text-center">
                      <template v-if="row.accounts === true">
                        <IconCheck :size="16" class="mx-auto text-green-600" />
                      </template>
                      <template v-else-if="typeof row.accounts === 'string'">
                        <span class="text-xs text-muted-foreground">{{ row.accounts }}</span>
                      </template>
                      <template v-else>
                        <span class="text-muted-foreground">—</span>
                      </template>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>
