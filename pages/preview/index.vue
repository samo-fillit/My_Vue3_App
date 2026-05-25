<template>
  <div class="min-h-screen bg-background p-12">
    <div class="max-w-2xl">
      <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground">← Design Lab</NuxtLink>
      <h1 class="mt-6 text-2xl font-bold text-foreground">Previews</h1>
      <p class="mt-1 text-sm text-muted-foreground">In-progress designs and prototypes.</p>

      <ul class="mt-8 flex flex-col gap-2">
        <li v-for="route in previews" :key="route.path">
          <NuxtLink
            :to="route.path"
            class="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-foreground hover:bg-muted"
          >
            <span class="font-medium">{{ route.label }}</span>
            <span class="text-muted-foreground">→</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const previews = [
  { path: '/preview/sidebar',                label: 'App Sidebar' },
  { path: '/preview/profile',                label: 'Account — Profile' },
  { path: '/preview/security',               label: 'Account — Security' },
  { path: '/preview/org-profile',            label: 'Organisation — Profile' },
  { path: '/preview/lease-details',          label: 'Organisation — Lease Details' },
  { path: '/preview/teams',                  label: 'Organisation — Teams & Permissions' },
  { path: '/preview/centres',               label: 'Organisation — Centres' },
  { path: '/preview/spaces',                label: 'Organisation — Spaces' },
  { path: '/preview/payments',              label: 'Organisation — Payouts' },
  { path: '/preview/notifications-settings', label: 'Organisation — Notification Settings' },
  { path: '/preview/transactions',           label: 'Transactions' },
]
</script>
