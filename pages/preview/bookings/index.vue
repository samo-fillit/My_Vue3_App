<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="bookings" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex items-start justify-between gap-6">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Bookings</h1>
              <p class="text-base text-muted-foreground">{{ subtitle }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <!-- Date range picker -->
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex h-8 w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <IconCalendar :size="13" stroke-width="1.5" class="text-muted-foreground" />
                    <span>{{ dateRangeLabel }}</span>
                    <IconChevronDown :size="12" stroke-width="2" class="shrink-0 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="end" :side-offset="8">
                  <div class="flex items-center justify-end gap-1.5 border-b border-border px-5 py-3">
                    <button
                      v-for="p in presets"
                      :key="p.label"
                      class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                      :class="isActivePreset(p)
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-foreground hover:border-foreground'"
                      @click="applyPreset(p)"
                    >
                      {{ p.label }}
                    </button>
                  </div>
                  <RangeCalendar v-model="dateRange" :number-of-months="2" />
                  <div class="flex items-center justify-end border-t border-border px-5 py-3">
                    <button
                      class="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      :class="{ 'opacity-40 pointer-events-none': !dateRange?.start }"
                      @click="dateRange = undefined"
                    >
                      Clear dates
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

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

              <Button v-if="isLandlord" size="sm" @click="router.push('/preview/booking-links?create=1')">Create booking</Button>
            </div>
          </div>

          <!-- Empty state: no bookings for this team at all -->
          <template v-if="!hasTeamData">
            <div class="flex flex-col items-center gap-3 py-20 text-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <IconCalendarEvent :size="22" class="text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">No bookings yet</p>
                <p class="mt-1 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {{ isLandlord ? "This team doesn't have any bookings yet." : "You don't have any bookings yet." }}
                </p>
              </div>
            </div>
          </template>
          <template v-else>

          <!-- Status tabs -->
          <div class="flex items-end border-b border-border">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              :class="activeTab === tab.value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
              <span
                v-if="tab.count > 0"
                class="ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums"
                :class="tab.value === 'action' && tab.count > 0
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>

          <!-- Search bar -->
          <div class="flex items-center gap-3">
            <div class="relative w-[400px]">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="h-10 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px]"
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
                <TableHead class="w-[130px]">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('periodFrom')">
                    Start date
                    <component :is="sortIcon('periodFrom')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>
                <TableHead class="w-[130px]">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('periodTo')">
                    End date
                    <component :is="sortIcon('periodTo')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>
                <TableHead class="w-[90px]">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking ID</span>
                </TableHead>
                <TableHead v-if="isLandlord">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('company')">
                    Tenant
                    <component :is="sortIcon('company')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('centreName')">
                    Centre / Space
                    <component :is="sortIcon('centreName')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>
                <TableHead class="w-[120px] text-right">
                  <button type="button" class="ml-auto inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('rate')">
                    Rate
                    <component :is="sortIcon('rate')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>
                <TableHead class="w-[180px] pl-8">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow
                v-for="b in filteredBookings"
                :key="b.id"
                class="group"
              >
                <TableCell class="text-sm text-foreground tabular-nums">
                  {{ formatDate(b.period.from) }}
                </TableCell>

                <TableCell class="text-sm text-muted-foreground tabular-nums">
                  {{ formatDate(b.period.to) }}
                </TableCell>

                <TableCell class="font-mono text-xs text-muted-foreground">
                  {{ b.id }}
                </TableCell>

                <TableCell v-if="isLandlord">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-medium text-foreground">{{ b.tenant.company }}</span>
                    <span class="text-xs text-muted-foreground">{{ b.tenant.contactName }}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div class="flex items-center gap-2.5">
                    <div
                      class="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                      :style="{ backgroundColor: b.space.centreColor }"
                    >
                      {{ b.space.centreName.charAt(0) }}
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm font-medium text-foreground">{{ b.space.centreName }}</span>
                      <span class="text-xs text-muted-foreground">{{ b.space.title }}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell class="text-right text-sm font-medium tabular-nums text-foreground">
                  {{ formatAmount(b.financials.rate) }}
                </TableCell>

                <TableCell class="pl-8">
                  <div class="inline-flex items-center gap-2.5">
                    <StatusDot :label="statusMeta(b).label" :dot-class="statusMeta(b).dotClass" :pulse="statusMeta(b).live" />
                    <TooltipProvider v-if="hasOverdue(b)" :delay-duration="150">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <span class="inline-flex text-red-600">
                            <IconFlagFilled :size="15" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p class="text-xs">Payment overdue</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow v-if="filteredBookings.length === 0">
                <TableCell :colspan="colspan" class="py-16 text-center text-sm text-muted-foreground">
                  {{ emptyTabMessage }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          </template><!-- end v-else -->

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DateRange } from 'reka-ui'
import { CalendarDate } from '@internationalized/date'
import {
  IconCalendar,
  IconCalendarEvent,
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconSearch,
  IconBuilding,
  IconCheck,
  IconFlagFilled,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import StatusDot from '@/components/StatusDot.vue'
import { useAppContext } from '@/composables/useAppContext'
import { useTeamContext } from '@/composables/useTeamContext'

const router = useRouter()

// Anchors the mock data's temporal states. The seed dates are framed around
// this date (the app's simulated "today"), not the real system clock.
const TODAY = new Date('2026-06-09T00:00:00Z')

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'enquiry' | 'quoted' | 'awaiting_signature' | 'confirmed' | 'declined' | 'cancelled'
type SortKey = 'periodFrom' | 'periodTo' | 'company' | 'centreName' | 'rate'
type TabValue = 'action' | 'upcoming' | 'past' | 'closed'

interface Booking {
  id: string
  status: BookingStatus
  period: { from: string; to: string }
  landlord: { teamId: string; teamName: string; teamColor: string; country: string }
  tenant: { teamId: string | null; company: string; contactName: string; email: string }
  space: { id: string; title: string; centreId: string; centreName: string; centreColor: string }
  financials: { currency: string; rate: number; paymentStatus?: string }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const { isUserType } = useAppContext()
const { activeTeamId } = useTeamContext()

const isLandlord = computed(() => isUserType('landlord'))
const viewerRole = computed<'landlord' | 'tenant'>(() => (isLandlord.value ? 'landlord' : 'tenant'))

const subtitle = computed(() =>
  isLandlord.value
    ? 'Manage enquiries and bookings across your spaces.'
    : 'Track your enquiries and bookings.',
)
const searchPlaceholder = computed(() =>
  isLandlord.value ? 'Search tenant, company or booking ID…' : 'Search centre or booking ID…',
)
const colspan = computed(() => (isLandlord.value ? 7 : 6))

// ─── Data ─────────────────────────────────────────────────────────────────────

const { data: bookingsData } = await useAsyncData<Booking[]>('bookings', () => $fetch('/api/bookings'))
const bookings = ref<Booking[]>(bookingsData.value ?? [])

// Scope to the active team: landlords see their team's bookings, tenants see their own.
const scopedBookings = computed(() => {
  if (isLandlord.value) {
    return bookings.value.filter(b => b.landlord.teamId === activeTeamId.value)
  }
  return bookings.value.filter(b => b.tenant.teamId === activeTeamId.value)
})

const hasTeamData = computed(() => scopedBookings.value.length > 0)

// ─── Derived state (the taxonomy) ───────────────────────────────────────────────

function temporalState(b: Booking): 'upcoming' | 'active' | 'completed' | null {
  if (b.status !== 'confirmed') return null
  const from = new Date(b.period.from)
  const to = new Date(b.period.to)
  if (to < TODAY) return 'completed'
  if (from > TODAY) return 'upcoming'
  return 'active'
}

function actionOwner(status: BookingStatus): 'landlord' | 'tenant' | null {
  if (status === 'enquiry') return 'landlord'
  if (status === 'quoted' || status === 'awaiting_signature') return 'tenant'
  return null
}

function isActionNeeded(b: Booking): boolean {
  return actionOwner(b.status) === viewerRole.value
}

// An overdue payment is a financial action item (tenant pays / landlord chases),
// so it pulls the booking into "Action needed" regardless of lifecycle/temporal state.
function hasOverdue(b: Booking): boolean {
  return b.financials.paymentStatus === 'overdue'
}

function bucket(b: Booking): TabValue {
  if (b.status === 'declined' || b.status === 'cancelled') return 'closed'
  if (isActionNeeded(b) || hasOverdue(b)) return 'action'
  if (temporalState(b) === 'completed') return 'past'
  return 'upcoming' // confirmed upcoming/active + pipeline awaiting the other party
}

// ─── Tabs ───────────────────────────────────────────────────────────────────────

const activeTab = ref<TabValue>('action')
const searchQuery = ref('')

const tabs = computed(() => {
  const s = scopedBookings.value
  const count = (k: TabValue) => s.filter(b => bucket(b) === k).length
  return [
    { value: 'action' as const,   label: 'Action needed', count: count('action') },
    { value: 'upcoming' as const, label: 'Upcoming',       count: count('upcoming') },
    { value: 'past' as const,     label: 'Past',           count: count('past') },
    { value: 'closed' as const,   label: 'Closed',         count: count('closed') },
  ]
})

// If the default tab is empty, fall back to the first tab that has content.
watch([scopedBookings, viewerRole], () => {
  if (tabs.value.find(t => t.value === activeTab.value)?.count === 0) {
    activeTab.value = tabs.value.find(t => t.count > 0)?.value ?? 'upcoming'
  }
}, { immediate: true })

const emptyTabMessage = computed(() => {
  if (searchQuery.value.trim()) return 'No bookings match your search.'
  switch (activeTab.value) {
    case 'action':   return isLandlord.value ? 'Nothing needs your attention.' : "You're all caught up — nothing to action."
    case 'upcoming': return 'No upcoming bookings.'
    case 'past':     return 'No past bookings.'
    case 'closed':   return 'No declined or cancelled bookings.'
  }
})

// ─── Sort ───────────────────────────────────────────────────────────────────────

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

function sortVal(b: Booking, key: SortKey): string | number {
  switch (key) {
    case 'periodFrom': return b.period.from
    case 'periodTo':   return b.period.to
    case 'company':    return isLandlord.value ? b.tenant.company : b.space.centreName
    case 'centreName': return b.space.centreName
    case 'rate':       return b.financials.rate
  }
}

// ─── Centre filter ────────────────────────────────────────────────────────────

const selectedCentreNames = ref<string[]>([])

const availableCentreNames = computed(() =>
  [...new Set(scopedBookings.value.map(b => b.space.centreName))].sort(),
)

const centreFilterLabel = computed(() => {
  if (!selectedCentreNames.value.length) return 'All centres'
  if (selectedCentreNames.value.length === 1) return selectedCentreNames.value[0]
  return `${selectedCentreNames.value.length} centres`
})

function toggleCentre(name: string) {
  const idx = selectedCentreNames.value.indexOf(name)
  if (idx >= 0) selectedCentreNames.value = selectedCentreNames.value.filter(n => n !== name)
  else selectedCentreNames.value = [...selectedCentreNames.value, name]
}

// ─── Date range ─────────────────────────────────────────────────────────────────

const dateRange = ref<DateRange | undefined>(undefined)

const presets = [
  { label: 'Q2', start: new CalendarDate(2026, 4, 1),  end: new CalendarDate(2026, 6, 30) },
  { label: 'Q3', start: new CalendarDate(2026, 7, 1),  end: new CalendarDate(2026, 9, 30) },
  { label: '2026', start: new CalendarDate(2026, 1, 1), end: new CalendarDate(2026, 12, 31) },
]

function applyPreset(p: typeof presets[0]) {
  dateRange.value = { start: p.start, end: p.end }
}

function isActivePreset(p: typeof presets[0]) {
  if (!dateRange.value?.start || !dateRange.value?.end) return false
  return dateRange.value.start.compare(p.start) === 0 && dateRange.value.end.compare(p.end) === 0
}

function calToIso(d: { year: number; month: number; day: number }): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

const dateRangeLabel = computed(() => {
  if (!dateRange.value?.start || !dateRange.value?.end) return 'All dates'
  const fmt = (d: { year: number; month: number; day: number }) =>
    new Date(d.year, d.month - 1, d.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(dateRange.value.start)} – ${fmt(dateRange.value.end)}`
})

// ─── Filtered + sorted list ─────────────────────────────────────────────────────

const filteredBookings = computed(() => {
  let list = scopedBookings.value.filter(b => bucket(b) === activeTab.value)

  if (selectedCentreNames.value.length) {
    list = list.filter(b => selectedCentreNames.value.includes(b.space.centreName))
  }

  if (dateRange.value?.start && dateRange.value?.end) {
    const s = calToIso(dateRange.value.start)
    const e = calToIso(dateRange.value.end)
    list = list.filter(b => b.period.from <= e && b.period.to >= s)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.tenant.company.toLowerCase().includes(q) ||
      b.tenant.contactName.toLowerCase().includes(q) ||
      b.space.centreName.toLowerCase().includes(q) ||
      b.space.title.toLowerCase().includes(q),
    )
  }

  if (sortKey.value) {
    const key = sortKey.value
    const dir = sortDir.value
    list = [...list].sort((a, b) => {
      const av = sortVal(a, key)
      const bv = sortVal(b, key)
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  } else {
    // Default order: soonest first, except Past/Closed show most recent first.
    const asc = !(activeTab.value === 'past' || activeTab.value === 'closed')
    list = [...list].sort((a, b) => {
      const cmp = a.period.from.localeCompare(b.period.from)
      return asc ? cmp : -cmp
    })
  }

  return list
})

// ─── Search ──────────────────────────────────────────────────────────────────

const searchCountLabel = computed(() => {
  if (!searchQuery.value.trim()) return ''
  const n = filteredBookings.value.length
  return n === 0 ? 'No results' : `${n} result${n === 1 ? '' : 's'}`
})

// ─── Display helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAmount(amount: number): string {
  // All amounts are EUR across the platform — never render £/GBP.
  return `€${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

interface StatusMeta { label: string; dotClass: string; live?: boolean }

// Dot + label style: colour lives only in the leading dot; the label stays in the
// foreground colour. Neutral/quiet states use the muted-foreground token.
function statusMeta(b: Booking): StatusMeta {
  const role = viewerRole.value
  switch (b.status) {
    case 'enquiry':
      return role === 'landlord'
        ? { label: 'New enquiry', dotClass: 'bg-blue-500' }
        : { label: 'Awaiting response', dotClass: 'bg-muted-foreground' }
    case 'quoted':
      return role === 'landlord'
        ? { label: 'Awaiting tenant', dotClass: 'bg-muted-foreground' }
        : { label: 'Quote received', dotClass: 'bg-amber-500' }
    case 'awaiting_signature':
      return { label: role === 'landlord' ? 'Awaiting signature' : 'Signature required', dotClass: 'bg-purple-500' }
    case 'confirmed': {
      const t = temporalState(b)
      if (t === 'active') return { label: 'Live now', dotClass: 'bg-green-500', live: true }
      if (t === 'upcoming') return { label: 'Upcoming', dotClass: 'bg-sky-500' }
      return { label: 'Completed', dotClass: 'bg-muted-foreground' }
    }
    case 'declined':  return { label: 'Declined', dotClass: 'bg-red-500' }
    case 'cancelled': return { label: 'Cancelled', dotClass: 'bg-muted-foreground' }
  }
}
</script>
