<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="transactions" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading + filters row -->
          <div class="flex items-center justify-between gap-6">
            <h1 class="text-[28px] font-bold leading-8 text-foreground">Transactions</h1>
            <div class="flex items-center gap-3">

              <!-- Date range picker -->
              <Popover>
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="flex h-9 w-fit items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <IconCalendar :size="15" stroke-width="1.5" class="text-muted-foreground" />
                    <span>{{ dateRangeLabel }}</span>
                    <IconChevronDown :size="13" stroke-width="2" class="shrink-0 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="end" :side-offset="8">
                  <!-- Presets bar -->
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
                  <!-- Calendar -->
                  <RangeCalendar
                    v-model="dateRange"
                    :number-of-months="2"
                  />
                  <!-- Footer -->
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

            </div>
          </div>

          <!-- Summary stats -->
          <div class="grid grid-cols-3 gap-8">
            <div class="flex flex-col gap-1.5">
              <p class="text-sm text-muted-foreground">Total earned (YTD)</p>
              <p class="text-3xl font-semibold tracking-tight text-foreground">€48,250</p>
              <p class="text-xs text-muted-foreground">Jan 1 – May 21, 2026</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <p class="text-sm text-muted-foreground">Pending payouts</p>
              <p class="text-3xl font-semibold tracking-tight text-foreground">€6,240</p>
              <p class="text-xs text-muted-foreground">2 transactions awaiting settlement</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <p class="text-sm text-muted-foreground">Overdue payments</p>
              <p class="text-3xl font-semibold tracking-tight text-foreground">€4,760</p>
              <p class="text-xs text-muted-foreground">2 bank transfer payments past due</p>
            </div>
          </div>

          <!-- Status filter tabs + export -->
          <div class="flex items-end justify-between border-b border-border">
            <div class="flex items-center">
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
            <div class="pb-2">
              <Button v-if="can('manage:transactions')" variant="outline" size="sm" class="h-8 px-3 text-xs">Export CSV</Button>
            </div>
          </div>

          <!-- Table -->
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">

                <TableHead class="w-[110px]">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('paidOn')">
                    Due date
                    <component :is="sortIcon('paidOn')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[90px]">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking</span>
                </TableHead>

                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('tenantCompany')">
                    Tenant
                    <component :is="sortIcon('tenantCompany')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('centreName')">
                    Centre
                    <component :is="sortIcon('centreName')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead>
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Method</span>
                </TableHead>

                <TableHead>
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Period</span>
                </TableHead>

                <TableHead class="text-right">
                  <button type="button" class="ml-auto inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('grossAmount')">
                    Rate
                    <component :is="sortIcon('grossAmount')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[110px] text-center">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                </TableHead>

                <TableHead class="w-[140px]" />

              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="tx in filteredTransactions" :key="tx.id" class="group">

                <TableCell class="text-sm text-muted-foreground">
                  {{ tx.paidOn ? formatDate(tx.paidOn) : '—' }}
                </TableCell>

                <TableCell class="font-mono text-xs text-muted-foreground">
                  #{{ String(tx.bookingId).padStart(5, '0') }}
                </TableCell>

                <TableCell class="text-sm font-medium text-foreground">{{ tx.tenantCompany }}</TableCell>

                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-medium text-foreground">{{ tx.centreName }}</span>
                    <span class="text-xs text-muted-foreground">{{ tx.spaceTitle }}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div class="flex items-center gap-1.5">
                    <component :is="methodIcon(tx.paymentMethod)" :size="13" stroke-width="1.75" class="shrink-0 text-muted-foreground" />
                    <span class="text-sm text-muted-foreground">{{ methodLabel(tx.paymentMethod) }}</span>
                  </div>
                </TableCell>

                <TableCell class="whitespace-nowrap text-xs text-muted-foreground">{{ formatPeriod(tx.periodFrom, tx.periodTo) }}</TableCell>

                <TableCell class="text-right text-sm font-medium tabular-nums text-foreground">{{ formatAmount(tx.grossAmount) }}</TableCell>

                <TableCell class="text-center">
                  <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(tx.paymentType)">
                    {{ statusLabel(tx.paymentType) }}
                  </span>
                </TableCell>

                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      v-if="tx.paymentType === 'pending' || tx.paymentType === 'overdue' || tx.paymentType === 'failed'"
                      variant="outline"
                      size="sm"
                      class="h-8 px-4 text-sm font-medium"
                    >
                      Send reminder
                    </Button>
                    <button
                      v-if="tx.invoiceUrl"
                      class="invisible flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground group-hover:visible"
                    >
                      <IconExternalLink :size="13" stroke-width="1.75" />
                    </button>
                  </div>
                </TableCell>

              </TableRow>

              <TableRow v-if="filteredTransactions.length === 0">
                <TableCell colspan="9" class="py-16 text-center text-sm text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DateRange } from 'reka-ui'
import { CalendarDate } from '@internationalized/date'
import {
  IconExternalLink,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconCreditCard,
  IconBuildingBank,
  IconRefresh,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  RangeCalendar,
} from '@/components/ui/range-calendar'
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
import { useTeamContext } from '@/composables/useTeamContext'
import { useAppContext } from '@/composables/useAppContext'

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentType = 'inward' | 'pending' | 'overdue' | 'failed' | 'refunded'
type PaymentMethod = 'card' | 'bank_transfer' | 'direct_debit'
type SortKey = 'paidOn' | 'tenantCompany' | 'centreName' | 'grossAmount'

interface Transaction {
  id: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  teamId: string
  bookingId: number
  spaceTitle: string
  centreName: string
  tenantCompany: string
  periodFrom: string
  periodTo: string
  grossAmount: number
  fillitFee: number
  netAmount: number
  chargeId: string | null
  paidOn: string | null
  invoiceUrl: string | null
}

// ─── Teams ────────────────────────────────────────────────────────────────────

const { activeTeamId } = useTeamContext()
const { can } = useAppContext()

// ─── Date range ───────────────────────────────────────────────────────────────

const dateRange = ref<DateRange | undefined>(undefined)

// ─── Presets ──────────────────────────────────────────────────────────────────

const presets = [
  { label: '2025', start: new CalendarDate(2025, 1, 1),  end: new CalendarDate(2025, 12, 31) },
  { label: '2026', start: new CalendarDate(2026, 1, 1),  end: new CalendarDate(2026, 12, 31) },
  { label: 'Q1',   start: new CalendarDate(2026, 1, 1),  end: new CalendarDate(2026, 3, 31)  },
  { label: 'Q2',   start: new CalendarDate(2026, 4, 1),  end: new CalendarDate(2026, 6, 30)  },
  { label: 'Q3',   start: new CalendarDate(2026, 7, 1),  end: new CalendarDate(2026, 9, 30)  },
  { label: 'Q4',   start: new CalendarDate(2026, 10, 1), end: new CalendarDate(2026, 12, 31) },
]

function applyPreset(p: typeof presets[0]) {
  dateRange.value = { start: p.start, end: p.end }
}

function isActivePreset(p: typeof presets[0]): boolean {
  if (!dateRange.value?.start || !dateRange.value?.end) return false
  return (
    dateRange.value.start.compare(p.start) === 0 &&
    dateRange.value.end.compare(p.end) === 0
  )
}

const dateRangeLabel = computed(() => {
  if (!dateRange.value?.start) return 'All dates'
  const fmt = (d: { year: number; month: number; day: number }) =>
    new Date(d.year, d.month - 1, d.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  if (dateRange.value.start && dateRange.value.end) {
    return `${fmt(dateRange.value.start)} – ${fmt(dateRange.value.end)}`
  }
  return fmt(dateRange.value.start)
})

// ─── Transactions data ────────────────────────────────────────────────────────

const transactions = ref<Transaction[]>([
  {
    id: 1,
    paymentType: 'inward',
    paymentMethod: 'card',
    teamId: 'team-one',
    bookingId: 10042,
    spaceTitle: 'Kiosk A3',
    centreName: 'Westfield London',
    tenantCompany: 'Nike',
    periodFrom: '2026-05-12',
    periodTo: '2026-05-26',
    grossAmount: 3360,
    fillitFee: 240,
    netAmount: 3120,
    chargeId: 'tr_3PkZ9vF2eZvKYlo21NB',
    paidOn: '2026-05-12',
    invoiceUrl: '#',
  },
  {
    id: 2,
    paymentType: 'inward',
    paymentMethod: 'bank_transfer',
    teamId: 'team-one',
    bookingId: 10038,
    spaceTitle: 'Sampling Stand S1',
    centreName: 'Bluewater',
    tenantCompany: 'Adidas',
    periodFrom: '2026-05-05',
    periodTo: '2026-05-11',
    grossAmount: 2800,
    fillitFee: 200,
    netAmount: 2600,
    chargeId: 'tr_3PkZ9vF2eZvKYlo20NA',
    paidOn: '2026-05-05',
    invoiceUrl: '#',
  },
  {
    id: 3,
    paymentType: 'inward',
    paymentMethod: 'card',
    teamId: 'team-one',
    bookingId: 10031,
    spaceTitle: 'Pop-up Space P2',
    centreName: 'Westfield Stratford',
    tenantCompany: 'Zara',
    periodFrom: '2026-04-28',
    periodTo: '2026-05-04',
    grossAmount: 4200,
    fillitFee: 300,
    netAmount: 3900,
    chargeId: 'tr_3PkZ9vF2eZvKYlo19NZ',
    paidOn: '2026-04-28',
    invoiceUrl: '#',
  },
  {
    id: 4,
    paymentType: 'inward',
    paymentMethod: 'direct_debit',
    teamId: 'team-two',
    bookingId: 10024,
    spaceTitle: 'Billboard B2',
    centreName: 'Lakeside',
    tenantCompany: 'H&M',
    periodFrom: '2026-04-14',
    periodTo: '2026-04-28',
    grossAmount: 1960,
    fillitFee: 140,
    netAmount: 1820,
    chargeId: 'tr_3PkZ9vF2eZvKYlo18NY',
    paidOn: '2026-04-14',
    invoiceUrl: '#',
  },
  {
    id: 5,
    paymentType: 'pending',
    paymentMethod: 'card',
    teamId: 'team-one',
    bookingId: 10055,
    spaceTitle: 'Billboard B2',
    centreName: 'Bluewater',
    tenantCompany: 'Samsung',
    periodFrom: '2026-06-02',
    periodTo: '2026-06-16',
    grossAmount: 3360,
    fillitFee: 240,
    netAmount: 3120,
    chargeId: null,
    paidOn: null,
    invoiceUrl: null,
  },
  {
    id: 6,
    paymentType: 'pending',
    paymentMethod: 'bank_transfer',
    teamId: 'team-two',
    bookingId: 10058,
    spaceTitle: 'Event Space E1',
    centreName: 'Westfield London',
    tenantCompany: 'L\'Oréal',
    periodFrom: '2026-06-09',
    periodTo: '2026-06-20',
    grossAmount: 3360,
    fillitFee: 240,
    netAmount: 3120,
    chargeId: null,
    paidOn: null,
    invoiceUrl: null,
  },
  {
    id: 7,
    paymentType: 'inward',
    paymentMethod: 'card',
    teamId: 'team-two',
    bookingId: 10015,
    spaceTitle: 'Kiosk A1',
    centreName: 'Lakeside',
    tenantCompany: 'Puma',
    periodFrom: '2026-03-03',
    periodTo: '2026-03-17',
    grossAmount: 2800,
    fillitFee: 200,
    netAmount: 2600,
    chargeId: 'tr_3PkZ9vF2eZvKYlo17NX',
    paidOn: '2026-03-03',
    invoiceUrl: '#',
  },
  {
    id: 8,
    paymentType: 'refunded',
    paymentMethod: 'card',
    teamId: 'team-one',
    bookingId: 10009,
    spaceTitle: 'Demo Stand D3',
    centreName: 'Westfield London',
    tenantCompany: 'Apple',
    periodFrom: '2026-03-10',
    periodTo: '2026-03-17',
    grossAmount: 1680,
    fillitFee: 120,
    netAmount: 1560,
    chargeId: 're_3PkZ9vF2eZvKYlo12NW',
    paidOn: '2026-03-17',
    invoiceUrl: '#',
  },
  {
    id: 9,
    paymentType: 'inward',
    paymentMethod: 'bank_transfer',
    teamId: 'team-two',
    bookingId: 10001,
    spaceTitle: 'Pop-up Space P1',
    centreName: 'Bluewater',
    tenantCompany: 'Dyson',
    periodFrom: '2026-02-17',
    periodTo: '2026-03-03',
    grossAmount: 5600,
    fillitFee: 400,
    netAmount: 5200,
    chargeId: 'tr_3PkZ9vF2eZvKYlo11NV',
    paidOn: '2026-02-17',
    invoiceUrl: '#',
  },
  {
    id: 10,
    paymentType: 'inward',
    paymentMethod: 'bank_transfer',
    teamId: 'team-two',
    bookingId: 10097,
    spaceTitle: 'Event Space E2',
    centreName: 'Westfield Stratford',
    tenantCompany: 'Sony',
    periodFrom: '2026-02-03',
    periodTo: '2026-02-17',
    grossAmount: 4200,
    fillitFee: 300,
    netAmount: 3900,
    chargeId: 'tr_3PkZ9vF2eZvKYlo10NU',
    paidOn: '2026-02-03',
    invoiceUrl: '#',
  },
  {
    id: 11,
    paymentType: 'failed',
    paymentMethod: 'direct_debit',
    teamId: 'team-one',
    bookingId: 10089,
    spaceTitle: 'Kiosk A2',
    centreName: 'Lakeside',
    tenantCompany: 'Uniqlo',
    periodFrom: '2026-01-20',
    periodTo: '2026-02-03',
    grossAmount: 2800,
    fillitFee: 200,
    netAmount: 2600,
    chargeId: null,
    paidOn: null,
    invoiceUrl: null,
  },
  {
    id: 12,
    paymentType: 'overdue',
    paymentMethod: 'bank_transfer',
    teamId: 'team-one',
    bookingId: 10062,
    spaceTitle: 'Pop-up Space P3',
    centreName: 'Westfield London',
    tenantCompany: 'Zara Home',
    periodFrom: '2026-04-07',
    periodTo: '2026-04-21',
    grossAmount: 2800,
    fillitFee: 200,
    netAmount: 2600,
    chargeId: null,
    paidOn: null,
    invoiceUrl: null,
  },
  {
    id: 13,
    paymentType: 'overdue',
    paymentMethod: 'bank_transfer',
    teamId: 'team-two',
    bookingId: 10071,
    spaceTitle: 'Event Space E3',
    centreName: 'Bluewater',
    tenantCompany: 'Mango',
    periodFrom: '2026-03-24',
    periodTo: '2026-04-07',
    grossAmount: 1960,
    fillitFee: 140,
    netAmount: 1820,
    chargeId: null,
    paidOn: null,
    invoiceUrl: null,
  },
])

// ─── Filters + sort ───────────────────────────────────────────────────────────

const activeStatus = ref<PaymentType | 'all'>('all')

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

const filteredByTeamAndDate = computed(() => {
  let list = transactions.value
  if (activeTeamId.value) {
    list = list.filter(t => t.teamId === activeTeamId.value)
  }
  if (dateRange.value?.start) {
    const start = `${dateRange.value.start.year}-${String(dateRange.value.start.month).padStart(2, '0')}-${String(dateRange.value.start.day).padStart(2, '0')}`
    list = list.filter(t => (t.paidOn ?? t.periodFrom) >= start)
  }
  if (dateRange.value?.end) {
    const end = `${dateRange.value.end.year}-${String(dateRange.value.end.month).padStart(2, '0')}-${String(dateRange.value.end.day).padStart(2, '0')}`
    list = list.filter(t => (t.paidOn ?? t.periodFrom) <= end)
  }
  return list
})

const statusTabs = computed(() => {
  const base = filteredByTeamAndDate.value
  return [
    { value: 'all' as const,      label: 'All',      count: base.length },
    { value: 'pending' as const,  label: 'Pending',  count: base.filter(t => t.paymentType === 'pending').length },
    { value: 'overdue' as const,  label: 'Overdue',  count: base.filter(t => t.paymentType === 'overdue').length },
    { value: 'inward' as const,   label: 'Paid',     count: base.filter(t => t.paymentType === 'inward').length },
    { value: 'failed' as const,   label: 'Failed',   count: base.filter(t => t.paymentType === 'failed').length },
    { value: 'refunded' as const, label: 'Refunded', count: base.filter(t => t.paymentType === 'refunded').length },
  ]
})

const filteredTransactions = computed(() => {
  let list = filteredByTeamAndDate.value
  if (activeStatus.value !== 'all') {
    list = list.filter(t => t.paymentType === activeStatus.value)
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPeriod(from: string, to: string): string {
  const f = new Date(from)
  const t = new Date(to)
  const fStr = f.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const tStr = t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fStr} – ${tStr}`
}

function formatAmount(amount: number): string {
  return `€${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function statusLabel(type: PaymentType): string {
  switch (type) {
    case 'inward':   return 'Paid'
    case 'pending':  return 'Pending'
    case 'overdue':  return 'Overdue'
    case 'failed':   return 'Failed'
    case 'refunded': return 'Refunded'
  }
}

function statusClass(type: PaymentType): string {
  switch (type) {
    case 'inward':   return 'bg-green-50 text-green-700'
    case 'pending':  return 'bg-blue-50 text-blue-600'
    case 'overdue':  return 'bg-amber-50 text-amber-700'
    case 'failed':   return 'bg-red-50 text-red-600'
    case 'refunded': return 'bg-muted text-muted-foreground'
  }
}

function methodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'card': return 'Credit card'
    case 'bank_transfer': return 'Bank transfer'
    case 'direct_debit': return 'Direct debit'
  }
}

function methodIcon(method: PaymentMethod) {
  switch (method) {
    case 'card': return IconCreditCard
    case 'bank_transfer': return IconBuildingBank
    case 'direct_debit': return IconRefresh
  }
}
</script>
