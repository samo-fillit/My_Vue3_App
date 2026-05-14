<script setup lang="ts">
import { ref, resolveComponent } from 'vue'
import {
  IconLayoutGrid,
  IconBook,
  IconCalendar,
  IconMessage,
  IconLink,
  IconUser,
  IconSearch,
  IconWorld,
  IconChevronRight,
  IconSelector,
} from '@tabler/icons-vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'

const NuxtLink = resolveComponent('NuxtLink')

const props = withDefaults(defineProps<{
  activeItem?: string
}>(), {
  activeItem: 'dashboard',
})

const accountOpen = ref(props.activeItem?.startsWith('account') ?? false)

const mainNav = [
  { id: 'dashboard',   icon: IconLayoutGrid, label: 'Dashboard' },
  { id: 'bookings',    icon: IconBook,        label: 'Bookings' },
  { id: 'calendar',    icon: IconCalendar,    label: 'Calendar' },
  { id: 'messages',    icon: IconMessage,     label: 'Messages', badge: 3 },
  { id: 'create-link', icon: IconLink,        label: 'Create Link' },
]

const accountSubItems = [
  { id: 'account-profile',       label: 'Profile',       route: '/preview/profile' },
  { id: 'account-security',      label: 'Security',      route: '/preview/security' },
  { id: 'account-teams',         label: 'Teams',     route: '/preview/teams' },
  { id: 'account-centres',       label: 'Centres',       route: '/preview/centres' },
  { id: 'account-lease-info',    label: 'Lease Info',    route: '/preview/lease-details' },
  { id: 'account-payments',      label: 'Payments' },
  { id: 'account-notifications', label: 'Notifications' },
]

const footerLinks = [
  { id: 'search',   icon: IconSearch, label: 'Search' },
  { id: 'language', icon: IconWorld,  label: 'Language' },
]
</script>

<template>
  <Sidebar collapsible="none" class="border-r border-sidebar-border">

    <SidebarHeader class="px-4 py-5">
      <div class="px-2">
        <img src="/fillit-logo.svg" alt="Fillit" width="56" height="42" class="block shrink-0" />
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>

            <!-- Main nav items -->
            <SidebarMenuItem v-for="item in mainNav" :key="item.id">
              <SidebarMenuButton :is-active="activeItem === item.id">
                <component :is="item.icon" stroke-width="1.5" />
                <span>{{ item.label }}</span>
                <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Account (collapsible) -->
            <SidebarMenuItem>
              <SidebarMenuButton
                :is-active="activeItem?.startsWith('account')"
                @click="accountOpen = !accountOpen"
              >
                <IconUser stroke-width="1.5" />
                <span>Account</span>
                <IconChevronRight
                  :size="14"
                  stroke-width="2"
                  class="ml-auto shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-90': accountOpen }"
                />
              </SidebarMenuButton>
              <SidebarMenuSub v-if="accountOpen">
                <SidebarMenuSubItem v-for="sub in accountSubItems" :key="sub.id">
                  <SidebarMenuSubButton
                    :as="sub.route ? NuxtLink : 'a'"
                    :to="sub.route"
                    :is-active="activeItem === sub.id"
                  >
                    {{ sub.label }}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="gap-0">
      <SidebarGroup class="pb-2 pt-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in footerLinks" :key="item.id">
              <SidebarMenuButton>
                <component :is="item.icon" stroke-width="1.5" />
                <span>{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator class="mx-0" />

      <div class="p-2">
        <SidebarMenuButton size="lg" class="w-full">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-foreground">
            S
          </div>
          <div class="flex min-w-0 flex-col gap-0.5 leading-none">
            <span class="truncate text-sm font-semibold">Sam O'Brien</span>
            <span class="truncate text-xs text-sidebar-foreground/60">sam@fillit.com</span>
          </div>
          <IconSelector :size="14" stroke-width="1.5" class="ml-auto shrink-0 text-sidebar-foreground/40" />
        </SidebarMenuButton>
      </div>
    </SidebarFooter>

  </Sidebar>
</template>
