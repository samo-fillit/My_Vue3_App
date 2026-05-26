<script setup lang="ts">
import { ref, computed } from 'vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import { useAppContext } from '@/composables/useAppContext'

const { isUserType, can } = useAppContext()

// ── Landlord notifications ────────────────────────────────────────────────────
const landlordRequired = [
  {
    id: 'bookings',
    label: 'Bookings',
    description: 'Confirmations, updates, and reminders for bookings across your spaces.',
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Payment received, overdue, and refund notifications.',
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'New messages from tenants and team members.',
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    description: 'New enquiries and status updates from tenants interested in your spaces.',
  },
  {
    id: 'documents',
    label: 'Document activity',
    description: 'Contract signatures, DocuSign updates, and declined documents.',
  },
  {
    id: 'team-activity',
    label: 'Team activity',
    description: 'Members joining your team, role changes, and signatory updates.',
  },
  {
    id: 'product-updates',
    label: 'Important product updates',
    description: 'Critical changes to the platform that may affect how you work.',
  },
]

const landlordOptionalBase = [
  {
    id: 'booking-reminders',
    label: 'Additional booking reminders',
    description: 'Reminders for bookings that are starting or ending soon.',
    enabled: true,
  },
  {
    id: 'weekly-summary',
    label: 'Weekly summary',
    description: 'A weekly summary of bookings, payments, and enquiry activity across your portfolio.',
    enabled: false,
  },
]

// ── Tenant notifications ──────────────────────────────────────────────────────
const tenantRequired = [
  {
    id: 'bookings',
    label: 'Bookings',
    description: 'Confirmations, updates, and reminders for your upcoming bookings.',
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Payment due dates, overdue notices, and confirmation when payments are processed.',
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'New messages from landlords and your team members.',
  },
  {
    id: 'documents',
    label: 'Document activity',
    description: 'Contract signatures, DocuSign updates, and declined documents.',
  },
  {
    id: 'team-activity',
    label: 'Team activity',
    description: 'Members joining your team and role changes.',
  },
  {
    id: 'product-updates',
    label: 'Important product updates',
    description: 'Critical changes to the platform that may affect how you work.',
  },
]

const tenantOptionalBase = [
  {
    id: 'booking-reminders',
    label: 'Booking reminders',
    description: 'Reminders for bookings that are starting or ending soon.',
    enabled: true,
  },
  {
    id: 'space-availability',
    label: 'Space availability',
    description: 'Notifications when spaces matching your saved preferences become available.',
    enabled: false,
  },
  {
    id: 'weekly-summary',
    label: 'Weekly summary',
    description: 'A weekly overview of your active bookings, upcoming renewals, and payment schedule.',
    enabled: false,
  },
]

// ── Active lists (reactive so toggles work) ───────────────────────────────────
const landlordOptional = ref(landlordOptionalBase.map(i => ({ ...i })))
const tenantOptional    = ref(tenantOptionalBase.map(i => ({ ...i })))

const required = computed(() => isUserType('tenant') ? tenantRequired : landlordRequired)
const optional  = computed(() => isUserType('tenant') ? tenantOptional.value : landlordOptional.value)

function save() {
  // Wire to Rails when ready
}
</script>

<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-notifications" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <div class="flex flex-col gap-3">
            <h1 class="text-[28px] font-bold leading-8 text-foreground">Notifications</h1>
            <p v-if="!can('edit:notifications')" class="text-sm text-muted-foreground">You have view-only access to this page.</p>
          </div>

          <!-- Required -->
          <section class="flex flex-col gap-8">
            <div class="flex flex-col gap-3">
              <h3 class="text-xl font-semibold tracking-tight text-foreground">Required</h3>
              <p class="text-base text-muted-foreground">These notifications are always on and cannot be disabled.</p>
            </div>
            <div class="flex flex-col divide-y divide-border">
              <div v-for="item in required" :key="item.id" class="flex items-center justify-between gap-8 py-5">
                <div class="flex flex-col gap-1">
                  <p class="text-sm font-medium text-foreground">{{ item.label }}</p>
                  <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                </div>
                <Switch :default-value="true" disabled class="shrink-0" :disabled="true" />
              </div>
            </div>
          </section>

          <Separator />

          <!-- Optional -->
          <section class="flex flex-col gap-8">
            <div class="flex flex-col gap-3">
              <h3 class="text-xl font-semibold tracking-tight text-foreground">Optional</h3>
              <p class="text-base text-muted-foreground">Choose which additional notifications you'd like to receive.</p>
            </div>
            <div class="flex flex-col divide-y divide-border">
              <div v-for="item in optional" :key="item.id" class="flex items-center justify-between gap-8 py-5">
                <div class="flex flex-col gap-1">
                  <p class="text-sm font-medium text-foreground">{{ item.label }}</p>
                  <p class="text-sm text-muted-foreground">{{ item.description }}</p>
                </div>
                <Switch :default-value="item.enabled" class="shrink-0" :disabled="!can('edit:notifications')" @update:model-value="(val) => { if (can('edit:notifications')) item.enabled = val as boolean }" />
              </div>
            </div>
          </section>

          <div v-if="can('edit:notifications')">
            <Button class="h-14 min-w-[120px] self-start rounded-lg px-6" @click="save">Save preferences</Button>
          </div>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>
