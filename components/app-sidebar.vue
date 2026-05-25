<script setup lang="ts">
import { ref, computed, resolveComponent } from 'vue'
import {
  IconLayoutGrid,
  IconBook,
  IconCalendar,
  IconMessage,
  IconLink,
  IconReceipt,
  IconBuilding,
  IconMap,
  IconWorld,
  IconChevronRight,
  IconCheck,
  IconSettings,
  IconBell,
  IconSparkles,
  IconUser,
  IconLock,
  IconChartBar,
  IconAddressBook,
  IconFileInvoice,
} from '@tabler/icons-vue'
import { useRightPanel } from '@/composables/useRightPanel'
import { useAppContext } from '@/composables/useAppContext'
import { useTeamContext } from '@/composables/useTeamContext'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const panel = useRightPanel()
const { context: appContext, activeNav, activeOrg } = useAppContext()
const { teams, activeTeam, setActiveTeam } = useTeamContext()
const NuxtLink = resolveComponent('NuxtLink')

const teamSwitcherOpen = ref(false)

const props = withDefaults(defineProps<{
  activeItem?: string
}>(), {
  activeItem: 'dashboard',
})

const accountOpen = ref(props.activeItem?.startsWith('account') ?? false)

// ── All possible nav items (filtered by platform config at render time) ───────
const allMainNav = [
  { id: 'dashboard',    icon: IconLayoutGrid,   label: 'Dashboard' },
  { id: 'bookings',     icon: IconBook,         label: 'Bookings' },
  { id: 'calendar',     icon: IconCalendar,     label: 'Calendar' },
  { id: 'messages',     icon: IconMessage,      label: 'Messages', badge: 3 },
  { id: 'create-link',  icon: IconLink,         label: 'Create Link' },
  { id: 'transactions', icon: IconReceipt,      label: 'Transactions', route: '/preview/transactions' },
  // Tenant only
  { id: 'invoices',     icon: IconFileInvoice,  label: 'Invoices',     route: '/preview/invoices' },
  // Enterprise (eLeaseLoop) only
  { id: 'analytics',    icon: IconChartBar,     label: 'Analytics',    route: '/preview/analytics' },
  { id: 'crm',          icon: IconAddressBook,  label: 'CRM',          route: '/preview/crm' },
]

// ── All possible org sub-items ────────────────────────────────────────────────
const allOrgItems = [
  { id: 'account-profile',       label: 'Profile',       route: '/preview/org-profile' },
  { id: 'account-teams',         label: 'Teams',         route: '/preview/teams' },
  { id: 'account-centres',       label: 'Centres',       route: '/preview/centres' },
  { id: 'account-spaces',        label: 'Spaces',        route: '/preview/spaces' },
  { id: 'account-lease-info',    label: 'Lease Info',    route: '/preview/lease-details' },
  { id: 'account-payments',      label: 'Payouts',       route: '/preview/payments' },
  { id: 'account-notifications', label: 'Notifications', route: '/preview/notifications-settings' },
]

// ── Filtered lists driven by platform config ──────────────────────────────────
const visibleMainNav = computed(() =>
  allMainNav.filter(item => activeNav.value.includes(item.id as any))
)

const visibleOrgItems = computed(() =>
  allOrgItems.filter(item => activeOrg.value.includes(item.id as any))
)

const footerLinks = [
  { id: 'search-spaces', icon: IconMap,   label: 'Search spaces' },
  { id: 'language',      icon: IconWorld, label: 'Language' },
]
</script>

<template>
  <Sidebar collapsible="none" class="border-r border-sidebar-border">

    <SidebarHeader class="px-4 py-5">
      <div class="px-2">
        <img
          :src="appContext.platform === 'eleaseloop' ? '/eleaseloop-logo.svg' : '/fillit-logo.svg'"
          :alt="appContext.platform === 'eleaseloop' ? 'eLeaseLoop' : 'Fillit'"
          width="56" height="42" class="block shrink-0"
        />
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <!-- Team switcher — sits above nav, visually grouped with content not logo -->
        <div class="pb-2">
          <DropdownMenu v-model:open="teamSwitcherOpen">
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                :disabled="teams.length <= 1"
                class="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-sidebar-foreground transition-colors"
                :class="teams.length > 1 ? 'hover:bg-sidebar-accent cursor-pointer' : 'cursor-default'"
              >
                <div
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                  :style="{ backgroundColor: activeTeam?.color ?? '#6b7280' }"
                >
                  {{ activeTeam?.name.charAt(0).toUpperCase() ?? '?' }}
                </div>
                <span class="flex-1 truncate text-left font-medium leading-none">{{ activeTeam?.name ?? 'Select team' }}</span>
                <IconChevronRight
                  v-if="teams.length > 1"
                  :size="13"
                  stroke-width="2"
                  class="shrink-0 text-sidebar-foreground/40 transition-transform duration-200"
                  :class="{ 'rotate-90': teamSwitcherOpen }"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom" :side-offset="4" class="w-52">
              <DropdownMenuLabel class="text-xs font-normal text-muted-foreground">Switch team</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="team in teams"
                :key="team.id"
                class="flex cursor-pointer items-center gap-3 py-2"
                :class="{ 'font-medium': team.id === activeTeam?.id }"
                @click="setActiveTeam(team.id)"
              >
                <div
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                  :style="{ backgroundColor: team.color }"
                >
                  {{ team.name.charAt(0).toUpperCase() }}
                </div>
                <span class="flex-1 truncate">{{ team.name }}</span>
                <IconCheck v-if="team.id === activeTeam?.id" :size="13" stroke-width="2.5" class="text-foreground" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <SidebarSeparator class="mx-0 mb-2" />
        <SidebarGroupContent>
          <SidebarMenu>

            <!-- Main nav — filtered by platform config -->
            <SidebarMenuItem v-for="item in visibleMainNav" :key="item.id">
              <SidebarMenuButton
                :is-active="activeItem === item.id"
                :as="item.route ? NuxtLink : 'button'"
                :to="item.route"
              >
                <component :is="item.icon" stroke-width="1.5" />
                <span>{{ item.label }}</span>
                <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Organisation (collapsible) — org items filtered by platform config -->
            <SidebarMenuItem>
              <SidebarMenuButton
                :is-active="activeItem?.startsWith('account')"
                @click="accountOpen = !accountOpen"
              >
                <IconBuilding stroke-width="1.5" />
                <span>Organisation</span>
                <IconChevronRight
                  :size="14"
                  stroke-width="2"
                  class="ml-auto shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-90': accountOpen }"
                />
              </SidebarMenuButton>
              <SidebarMenuSub v-if="accountOpen">
                <SidebarMenuSubItem v-for="sub in visibleOrgItems" :key="sub.id">
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

      <!-- Panel triggers -->
      <div class="flex items-center gap-1 px-2 pb-2">
        <button
          class="relative flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          :class="{ 'bg-sidebar-accent text-sidebar-foreground': panel.isOpen.value && panel.activeTab.value === 'notifications' }"
          @click="panel.toggle('notifications')"
        >
          <IconBell :size="17" stroke-width="1.5" />
          <span
            v-if="panel.unreadCount.value > 0"
            class="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold leading-none text-primary-foreground"
          >
            {{ panel.unreadCount.value > 9 ? '9+' : panel.unreadCount.value }}
          </span>
        </button>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          :class="{ 'bg-sidebar-accent text-sidebar-foreground': panel.isOpen.value && panel.activeTab.value === 'assistant' }"
          @click="panel.toggle('assistant')"
        >
          <IconSparkles :size="17" stroke-width="1.5" />
        </button>
      </div>

      <SidebarSeparator class="mx-0" />

      <div class="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton size="lg" class="w-full">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-foreground">
                S
              </div>
              <div class="flex min-w-0 flex-col gap-0.5 leading-none">
                <span class="truncate text-sm font-semibold">Sam O'Brien</span>
                <span class="truncate text-xs text-sidebar-foreground/60">sam@fillit.com</span>
              </div>
              <IconSettings :size="14" stroke-width="1.75" class="ml-auto shrink-0 text-sidebar-foreground/40" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" class="w-56 mb-1">
            <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">sam@fillit.com</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem :as="NuxtLink" to="/preview/profile" class="gap-2">
              <IconUser :size="15" stroke-width="1.75" class="text-muted-foreground" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem :as="NuxtLink" to="/preview/security" class="gap-2">
              <IconLock :size="15" stroke-width="1.75" class="text-muted-foreground" />
              Security
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarFooter>

  </Sidebar>
</template>
