<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="create-link" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex items-start justify-between gap-6">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Booking links</h1>
              <p class="text-base text-muted-foreground">Create and track direct booking invitations sent to tenants.</p>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <!-- Centre filter -->
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex h-8 w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <IconBuilding :size="13" stroke-width="1.5" class="text-muted-foreground" />
                    <span>{{ centreFilterLabel }}</span>
                    <IconChevronDown :size="12" stroke-width="2" class="shrink-0 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent class="w-[220px] p-2" align="end" :side-offset="8">
                  <p class="px-2 pb-2 pt-1 text-xs font-semibold text-muted-foreground">Filter by centre</p>
                  <button
                    v-for="name in availableCentreNames"
                    :key="name"
                    type="button"
                    class="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                    @click="toggleCentre(name)"
                  >
                    <div
                      class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors"
                      :class="selectedCentreNames.includes(name) ? 'border-foreground bg-foreground' : 'border-border'"
                    >
                      <IconCheck v-if="selectedCentreNames.includes(name)" :size="10" stroke-width="3" class="text-background" />
                    </div>
                    <span class="truncate text-left">{{ name }}</span>
                  </button>
                  <div v-if="selectedCentreNames.length" class="mt-1.5 border-t border-border pt-1.5">
                    <button
                      type="button"
                      class="w-full rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                      @click="selectedCentreNames = []"
                    >
                      Clear filter
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button size="sm" @click="openForm">Create booking</Button>
            </div>
          </div>

          <!-- Status tabs -->
          <div class="flex items-end border-b border-border">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              class="-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              :class="activeStatus === tab.value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'"
              @click="activeStatus = tab.value"
            >
              {{ tab.label }}
              <span v-if="tab.count > 0" class="ml-1.5 tabular-nums text-xs">{{ tab.count }}</span>
            </button>
          </div>

          <!-- Search bar -->
          <div class="flex items-center gap-3">
            <div class="relative w-[300px]">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search tenant, company or booking ID…"
                class="h-10 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px]"
                @keydown.enter="jumpToMatch"
              />
              <IconSearch :size="16" stroke-width="1.5" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <span v-if="searchQuery.trim()" class="text-xs text-muted-foreground tabular-nums">
              {{ searchCountLabel }}
            </span>
          </div>

          <!-- Table -->
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">

                <TableHead class="w-[110px]">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('createdAt')">
                    Created
                    <component :is="sortIcon('createdAt')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('tenantEmail')">
                    Tenant
                    <component :is="sortIcon('tenantEmail')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('tenantCompany')">
                    Company
                    <component :is="sortIcon('tenantCompany')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[110px]">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking ID</span>
                </TableHead>

                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('centreName')">
                    Centre / Space
                    <component :is="sortIcon('centreName')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[100px] text-right">
                  <button type="button" class="ml-auto inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('rate')">
                    Rate
                    <component :is="sortIcon('rate')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[130px] text-center">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow
                v-for="link in filteredLinks"
                :key="link.id"
                :ref="el => { if (el) rowRefs[link.id] = el as HTMLElement }"
                class="group"
                :class="{ 'row-highlight': highlightedId === link.id }"
              >

                <TableCell class="text-sm text-muted-foreground">
                  {{ formatDate(link.createdAt) }}
                </TableCell>

                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span v-if="link.tenantFirstName || link.tenantLastName" class="text-sm font-medium text-foreground">{{ [link.tenantFirstName, link.tenantLastName].filter(Boolean).join(' ') }}</span>
                    <span class="text-xs text-muted-foreground">{{ link.tenantEmail }}</span>
                  </div>
                </TableCell>

                <TableCell class="text-sm text-muted-foreground">
                  {{ link.tenantCompany || '—' }}
                </TableCell>

                <TableCell>
                  <a
                    v-if="link.bookingId"
                    href="/preview/bookings"
                    class="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {{ link.bookingId }}
                  </a>
                  <span v-else class="text-xs text-muted-foreground">—</span>
                </TableCell>

                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-medium text-foreground">{{ link.centreName }}</span>
                    <span class="text-xs text-muted-foreground">{{ link.spaceTitle }}</span>
                  </div>
                </TableCell>

                <TableCell class="text-right text-sm font-medium tabular-nums text-foreground">
                  {{ formatAmount(link.rate, link.currency) }}
                </TableCell>

                <TableCell class="text-center">
                  <TooltipProvider :delay-duration="150">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span
                          class="cursor-default rounded-full px-2.5 py-1 text-xs font-medium"
                          :class="statusClass(link.status)"
                        >
                          {{ statusLabel(link.status) }}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p class="text-xs">{{ statusTooltip(link) }}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

              </TableRow>

              <TableRow v-if="filteredLinks.length === 0">
                <TableCell colspan="7" class="py-16 text-center text-sm text-muted-foreground">
                  No booking links found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- Create booking overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="formOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/50" @click="formOpen = false" />
        <div class="relative z-10 flex w-full max-w-[560px] flex-col rounded-xl border border-border bg-background shadow-2xl" style="max-height: 90vh">

          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">Create booking</h2>
              <p class="text-sm text-muted-foreground">Send a direct booking invitation to a tenant.</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="formOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Form body -->
          <form class="flex flex-col gap-8 overflow-y-auto px-6 py-5" @submit.prevent="handleSend">

            <!-- Tenant -->
            <div class="flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-foreground">Tenant</h3>
              <div class="relative">
                <FloatingLabelInput
                  v-model="form.tenantEmail"
                  label="Email address"
                  :required="true"
                  autocomplete="off"
                />
                <!-- Autocomplete suggestions -->
                <div
                  v-if="showSuggestions"
                  class="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
                >
                  <button
                    v-for="tenant in tenantSuggestions"
                    :key="tenant.email"
                    type="button"
                    class="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-muted"
                    @click="selectTenant(tenant)"
                  >
                    <span class="text-sm font-medium text-foreground">{{ tenant.firstName }} {{ tenant.lastName }}</span>
                    <span class="text-xs text-muted-foreground">{{ tenant.email }}</span>
                  </button>
                </div>
              </div>

              <!-- Name + company — shown once a valid email is entered -->
              <Transition name="fields">
                <div v-if="isValidEmail" class="flex flex-col gap-4">
                  <div class="grid grid-cols-2 gap-4">
                    <FloatingLabelInput v-model="form.tenantFirstName" label="First name" :required="true" />
                    <FloatingLabelInput v-model="form.tenantLastName" label="Last name" :required="true" />
                  </div>
                  <FloatingLabelInput v-model="form.tenantCompany" label="Company name" :required="true" />
                </div>
              </Transition>
            </div>

            <!-- Booking period -->
            <div class="flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-foreground">Booking period</h3>
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex h-14 w-full items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm transition-colors hover:bg-muted"
                    :class="bookingDateLabel ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    <IconCalendar :size="15" stroke-width="1.5" class="shrink-0 text-muted-foreground" />
                    {{ bookingDateLabel || 'Select booking dates' }}
                  </button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start" :side-offset="8">
                  <RangeCalendar v-model="form.bookingPeriod" :number-of-months="2" />
                </PopoverContent>
              </Popover>
            </div>

            <!-- Location -->
            <div class="flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-foreground">Location</h3>
              <FloatingLabelSelect v-model="form.centreId" label="Centre" :required="true" @update:model-value="form.spaceId = ''">
                <SelectItem v-for="c in centres" :key="c.id" :value="c.id">{{ c.name }}</SelectItem>
              </FloatingLabelSelect>
              <FloatingLabelSelect v-model="form.spaceId" label="Space" :required="true" :disabled="!form.centreId">
                <SelectItem v-for="s in availableSpaces" :key="s.id" :value="s.id">{{ s.title }}</SelectItem>
              </FloatingLabelSelect>
            </div>

            <!-- Financials -->
            <div class="flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-foreground">Financials</h3>
              <div class="grid grid-cols-2 gap-4">
                <FloatingLabelInput v-model="form.rate" label="Rate (€)" :required="true" />
                <FloatingLabelInput v-model="form.deposit" label="Deposit (€)" />
              </div>
            </div>

          </form>

          <!-- Footer -->
          <div class="flex shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="ghost" size="sm" @click="formOpen = false">Cancel</Button>
            <Button size="sm" class="px-5" @click="handleSend">Send booking link</Button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.fields-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fields-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes row-search-pulse {
  0%   { background-color: transparent; }
  30%  { background-color: rgb(59 130 246 / 0.10); }
  70%  { background-color: rgb(59 130 246 / 0.10); }
  100% { background-color: transparent; }
}
.row-highlight {
  animation: row-search-pulse 1s ease-in-out 2;
}
</style>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from 'vue'
import type { DateRange } from 'reka-ui'
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconX,
  IconSearch,
  IconBuilding,
  IconCheck,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import { FloatingLabelSelect, SelectItem } from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import { useAppContext } from '@/composables/useAppContext'
import { useTeamContext } from '@/composables/useTeamContext'

// ─── Current user (mock) ──────────────────────────────────────────────────────

const CURRENT_USER_NAME = 'James Miller'

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingLinkStatus = 'sent' | 'declined' | 'completed'
type SortKey = 'createdAt' | 'tenantEmail' | 'tenantCompany' | 'centreName' | 'rate'

interface BookingLink {
  id: string
  createdAt: string
  tenantFirstName: string | null
  tenantLastName: string | null
  tenantCompany: string | null
  tenantEmail: string
  bookingId: string | null
  centreId: string
  centreName: string
  spaceTitle: string
  teamId: string | null
  rate: number
  currency: string
  periodFrom: string
  periodTo: string
  status: BookingLinkStatus
  statusChangedAt: string
  statusChangedBy: string
}

// ─── App context ──────────────────────────────────────────────────────────────

const { context: appContext, can } = useAppContext()
const { activeTeamId } = useTeamContext()

// ─── Mock tenants (for autocomplete) ─────────────────────────────────────────

const mockTenants = [
  { firstName: 'Alice',   lastName: 'Johnson',   email: 'alice@brandco.com',            company: 'Brand Co.' },
  { firstName: 'Marcus',  lastName: 'Lee',        email: 'm.lee@popupbrands.io',          company: 'Pop-up Brands' },
  { firstName: 'Sophie',  lastName: 'Turner',     email: 'sophie.turner@freshco.com',     company: 'Fresh Co.' },
  { firstName: 'David',   lastName: 'Chen',       email: 'd.chen@retailgroup.com',        company: 'Retail Group' },
  { firstName: 'Emma',    lastName: 'Wilson',     email: 'ewilson@brandstudio.co.uk',     company: 'Brand Studio' },
  { firstName: 'James',   lastName: 'Rodriguez',  email: 'james@launchpad.co',            company: 'Launchpad' },
  { firstName: 'Priya',   lastName: 'Patel',      email: 'priya.patel@kiosks.io',         company: 'Kiosks.io' },
]

// ─── Booking links data ───────────────────────────────────────────────────────

const { data: bookingLinksData } = await useAsyncData<BookingLink[]>(
  'booking-links',
  () => $fetch('/api/booking-links'),
)

// Mutable local copy so newly created links appear without a page refresh
const bookingLinks = ref<BookingLink[]>(bookingLinksData.value ?? [])

// ─── Sort ─────────────────────────────────────────────────────────────────────

const sortKey = ref<SortKey | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function sortIcon(key: SortKey) {
  if (sortKey.value !== key) return IconSelector
  return sortDir.value === 'asc' ? IconChevronUp : IconChevronDown
}

// ─── Filter ───────────────────────────────────────────────────────────────────

const activeStatus = ref<BookingLinkStatus | 'all'>('all')

const statusTabs = computed(() => {
  const all = bookingLinks.value
  return [
    { value: 'all' as const,       label: 'All',       count: all.length },
    { value: 'sent' as const,      label: 'Sent',      count: all.filter(l => l.status === 'sent').length },
    { value: 'declined' as const,  label: 'Declined',  count: all.filter(l => l.status === 'declined').length },
    { value: 'completed' as const, label: 'Completed', count: all.filter(l => l.status === 'completed').length },
  ]
})

const filteredLinks = computed(() => {
  let list = bookingLinks.value
  if (activeStatus.value !== 'all') {
    list = list.filter(l => l.status === activeStatus.value)
  }
  if (selectedCentreNames.value.length > 0) {
    list = list.filter(l => selectedCentreNames.value.includes(l.centreName))
  }
  if (sortKey.value) {
    const key = sortKey.value
    const dir = sortDir.value
    list = [...list].sort((a, b) => {
      const av = a[key] ?? ''
      const bv = b[key] ?? ''
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }
  return list
})

// ─── Search ───────────────────────────────────────────────────────────────────

const searchQuery = ref('')
const matchIndex = ref(-1)
const highlightedId = ref<string | null>(null)
const rowRefs = ref<Record<string, HTMLElement>>({})

const blMatchIds = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return filteredLinks.value
    .filter(l =>
      `${l.tenantFirstName ?? ''} ${l.tenantLastName ?? ''}`.toLowerCase().includes(q) ||
      (l.tenantCompany ?? '').toLowerCase().includes(q) ||
      (l.bookingId ?? '').toLowerCase().includes(q)
    )
    .map(l => l.id)
})

const searchCountLabel = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return ''
  if (blMatchIds.value.length === 0) return 'No results'
  if (matchIndex.value >= 0) return `${matchIndex.value + 1} / ${blMatchIds.value.length}`
  return `${blMatchIds.value.length} match${blMatchIds.value.length === 1 ? '' : 'es'}`
})

watch(searchQuery, () => {
  matchIndex.value = -1
  highlightedId.value = null
})

function jumpToMatch() {
  if (!blMatchIds.value.length) return
  matchIndex.value = (matchIndex.value + 1) % blMatchIds.value.length
  const id = blMatchIds.value[matchIndex.value]
  highlightedId.value = null
  nextTick(() => {
    highlightedId.value = id
    const el = rowRefs.value[id]
    if (el) {
      const row = (el as any).$el ?? el
      row.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => { highlightedId.value = null }, 2100)
  })
}

// ─── Centre filter ────────────────────────────────────────────────────────────

const selectedCentreNames = ref<string[]>([])

const availableCentreNames = computed(() => {
  const base = bookingLinks.value.filter(
    l => !l.teamId || l.teamId === activeTeamId.value,
  )
  return [...new Set(base.map(l => l.centreName))].sort()
})

const centreFilterLabel = computed(() => {
  if (!selectedCentreNames.value.length) return 'All centres'
  if (selectedCentreNames.value.length === 1) return selectedCentreNames.value[0]
  return `${selectedCentreNames.value.length} centres`
})

function toggleCentre(name: string) {
  const idx = selectedCentreNames.value.indexOf(name)
  if (idx >= 0) {
    selectedCentreNames.value = selectedCentreNames.value.filter(n => n !== name)
  } else {
    selectedCentreNames.value = [...selectedCentreNames.value, name]
  }
}

// ─── Centres / spaces (platform-aware mock) ───────────────────────────────────

const FILLIT_CENTRE_TEAM_MAP: Record<string, string> = {
  'centre-westfield':  'team-one',
  'centre-bluewater':  'team-one',
  'centre-lakeside':   'team-two',
  'centre-meadowhall': 'team-two',
  'centre-trafford':   'team-two',
}

const ELEASELOOP_CENTRE_TEAM_MAP: Record<string, string> = {
  'centre-xanadu':          'team-spain',
  'centre-la-maquinista':   'team-spain',
  'centre-quatre-temps':    'team-france',
  'centre-part-dieu':       'team-france',
  'centre-oriocenter':      'team-italy',
  'centre-adigeo':          'team-italy',
  'centre-galeria-mokotow': 'team-poland',
  'centre-silesia':         'team-poland',
}

const FILLIT_CENTRES = [
  { id: 'centre-westfield',  name: 'Westfield London' },
  { id: 'centre-bluewater',  name: 'Bluewater' },
  { id: 'centre-lakeside',   name: 'Lakeside' },
  { id: 'centre-meadowhall', name: 'Meadowhall' },
  { id: 'centre-trafford',   name: 'Trafford Centre' },
]

const ELEASELOOP_CENTRES = [
  { id: 'centre-xanadu',          name: 'Centro Comercial Xanadú' },
  { id: 'centre-la-maquinista',   name: 'La Maquinista' },
  { id: 'centre-quatre-temps',    name: 'Les Quatre Temps' },
  { id: 'centre-part-dieu',       name: 'Centre Commercial Part-Dieu' },
  { id: 'centre-oriocenter',      name: 'Oriocenter' },
  { id: 'centre-adigeo',          name: 'Adigeo' },
  { id: 'centre-galeria-mokotow', name: 'Galeria Mokotów' },
  { id: 'centre-silesia',         name: 'Silesia City Center' },
]

const FILLIT_SPACES = [
  { id: 's1',  centreId: 'centre-westfield',  title: 'Kiosk A1' },
  { id: 's2',  centreId: 'centre-westfield',  title: 'Kiosk A2' },
  { id: 's3',  centreId: 'centre-westfield',  title: 'Pop-up Space P1' },
  { id: 's4',  centreId: 'centre-bluewater',  title: 'Sampling Stand S1' },
  { id: 's5',  centreId: 'centre-bluewater',  title: 'Event Space E1' },
  { id: 's6',  centreId: 'centre-lakeside',   title: 'Kiosk A1' },
  { id: 's7',  centreId: 'centre-lakeside',   title: 'Billboard B2' },
  { id: 's8',  centreId: 'centre-meadowhall', title: 'Kiosk A1' },
  { id: 's9',  centreId: 'centre-meadowhall', title: 'Pop-up Space P1' },
  { id: 's10', centreId: 'centre-trafford',   title: 'Sampling Stand S1' },
  { id: 's11', centreId: 'centre-trafford',   title: 'Event Space E1' },
]

const ELEASELOOP_SPACES = [
  { id: 'ell-s1',  centreId: 'centre-xanadu',          title: 'Pop-up Unit P4' },
  { id: 'ell-s2',  centreId: 'centre-xanadu',          title: 'Kiosk K2' },
  { id: 'ell-s3',  centreId: 'centre-xanadu',          title: 'Billboard BD1' },
  { id: 'ell-s4',  centreId: 'centre-la-maquinista',   title: 'Event Space E1' },
  { id: 'ell-s5',  centreId: 'centre-la-maquinista',   title: 'Kiosk K5' },
  { id: 'ell-s6',  centreId: 'centre-quatre-temps',    title: 'Pop-up Unit P2' },
  { id: 'ell-s7',  centreId: 'centre-quatre-temps',    title: 'Kiosk K3' },
  { id: 'ell-s8',  centreId: 'centre-quatre-temps',    title: 'Event Space E2' },
  { id: 'ell-s9',  centreId: 'centre-part-dieu',       title: 'Pop-up Unit P7' },
  { id: 'ell-s10', centreId: 'centre-part-dieu',       title: 'Sampling Stand S2' },
  { id: 'ell-s11', centreId: 'centre-oriocenter',      title: 'Pop-up Unit P3' },
  { id: 'ell-s12', centreId: 'centre-oriocenter',      title: 'Kiosk K1' },
  { id: 'ell-s13', centreId: 'centre-oriocenter',      title: 'Event Space E3' },
  { id: 'ell-s14', centreId: 'centre-adigeo',          title: 'Pop-up Unit P1' },
  { id: 'ell-s15', centreId: 'centre-adigeo',          title: 'Terrace Kiosk K4' },
  { id: 'ell-s16', centreId: 'centre-galeria-mokotow', title: 'Pop-up Unit P5' },
  { id: 'ell-s17', centreId: 'centre-galeria-mokotow', title: 'Billboard BD2' },
  { id: 'ell-s18', centreId: 'centre-silesia',         title: 'Pop-up Unit P6' },
  { id: 'ell-s19', centreId: 'centre-silesia',         title: 'Event Space E4' },
]

const centreTeamMap = computed(() =>
  appContext.value.platform === 'eleaseloop' ? ELEASELOOP_CENTRE_TEAM_MAP : FILLIT_CENTRE_TEAM_MAP
)

const centres = computed(() =>
  appContext.value.platform === 'eleaseloop' ? ELEASELOOP_CENTRES : FILLIT_CENTRES
)

const allSpaces = computed(() =>
  appContext.value.platform === 'eleaseloop' ? ELEASELOOP_SPACES : FILLIT_SPACES
)

const availableSpaces = computed(() =>
  allSpaces.value.filter(s => s.centreId === form.centreId)
)

// ─── Form ─────────────────────────────────────────────────────────────────────

const formOpen = ref(false)
// Track the email at the moment of autocomplete selection — suggestions hide
// when current email matches this value, with no async watch side-effects.
const lastSelectedEmail = ref('')

const form = reactive({
  tenantEmail: '',
  tenantFirstName: '',
  tenantLastName: '',
  tenantCompany: '',
  bookingPeriod: undefined as DateRange | undefined,
  centreId: '',
  spaceId: '',
  rate: '',
  deposit: '',
})

const isValidEmail = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.tenantEmail)
)

const tenantSuggestions = computed(() => {
  if (form.tenantEmail.length < 2) return []
  const q = form.tenantEmail.toLowerCase()
  return mockTenants
    .filter(t =>
      t.email.toLowerCase().includes(q) ||
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.company.toLowerCase().includes(q)
    )
    .slice(0, 5)
})

const showSuggestions = computed(() =>
  form.tenantEmail !== lastSelectedEmail.value && tenantSuggestions.value.length > 0
)

function selectTenant(tenant: typeof mockTenants[0]) {
  form.tenantEmail = tenant.email
  form.tenantFirstName = tenant.firstName
  form.tenantLastName = tenant.lastName
  form.tenantCompany = tenant.company
  lastSelectedEmail.value = tenant.email
}

const bookingDateLabel = computed(() => {
  if (!form.bookingPeriod?.start) return ''
  const fmt = (d: { year: number; month: number; day: number }) =>
    new Date(d.year, d.month - 1, d.day).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  if (form.bookingPeriod.end) {
    return `${fmt(form.bookingPeriod.start)} – ${fmt(form.bookingPeriod.end)}`
  }
  return fmt(form.bookingPeriod.start)
})

function openForm() {
  resetForm()
  formOpen.value = true
}

function handleSend() {
  if (!form.tenantEmail || !form.centreId || !form.spaceId || !form.rate) return

  const centre = centres.find(c => c.id === form.centreId)
  const space = spaces.find(s => s.id === form.spaceId)
  const toIso = (d: { year: number; month: number; day: number }) =>
    `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`

  const newLink: BookingLink = {
    id: `bl_${Date.now()}`,
    createdAt: new Date().toISOString(),
    tenantFirstName: form.tenantFirstName || null,
    tenantLastName: form.tenantLastName || null,
    tenantCompany: form.tenantCompany || null,
    tenantEmail: form.tenantEmail,
    bookingId: null,
    centreId: form.centreId,
    centreName: centre?.name ?? '',
    spaceTitle: space?.title ?? '',
    teamId: centre ? (centreTeamMap[form.centreId] ?? null) : null,
    rate: parseFloat(form.rate) || 0,
    currency: 'EUR',
    periodFrom: form.bookingPeriod?.start ? toIso(form.bookingPeriod.start) : '',
    periodTo: form.bookingPeriod?.end ? toIso(form.bookingPeriod.end) : '',
    status: 'sent',
    statusChangedAt: new Date().toISOString(),
    statusChangedBy: CURRENT_USER_NAME,
  }

  bookingLinks.value = [newLink, ...bookingLinks.value]
  formOpen.value = false
}

function resetForm() {
  form.tenantEmail = ''
  form.tenantFirstName = ''
  form.tenantLastName = ''
  form.tenantCompany = ''
  form.bookingPeriod = undefined
  form.centreId = ''
  form.spaceId = ''
  form.rate = ''
  form.deposit = ''
  lastSelectedEmail.value = ''
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : '£'
  return `${symbol}${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function statusLabel(status: BookingLinkStatus): string {
  switch (status) {
    case 'sent':      return 'Sent'
    case 'declined':  return 'Declined'
    case 'completed': return 'Completed'
  }
}

function statusClass(status: BookingLinkStatus): string {
  switch (status) {
    case 'sent':      return 'bg-blue-50 text-blue-600'
    case 'declined':  return 'bg-red-50 text-red-600'
    case 'completed': return 'bg-green-50 text-green-700'
  }
}

function statusTooltip(link: BookingLink): string {
  const date = new Date(link.statusChangedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  switch (link.status) {
    case 'sent':      return `Sent by ${link.statusChangedBy} on ${date}`
    case 'declined':  return `Declined by ${link.statusChangedBy} on ${date}`
    case 'completed': return `Completed by ${link.statusChangedBy} on ${date}`
  }
}
</script>
