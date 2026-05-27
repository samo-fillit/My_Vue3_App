<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="invoices" />
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
                    class="flex h-8 w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <IconCalendar :size="13" stroke-width="1.5" class="text-muted-foreground" />
                    <span>{{ dateRangeLabel }}</span>
                    <IconChevronDown :size="12" stroke-width="2" class="shrink-0 text-muted-foreground" />
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
              <TooltipProvider :delay-duration="300">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <span :class="!can('view:transactions') ? 'cursor-not-allowed' : ''">
                      <Button
                        variant="outline"
                        size="sm"
                        class="disabled:pointer-events-none"
                        :disabled="!can('view:transactions')"
                      >
                        Export CSV
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent v-if="!can('view:transactions')" side="bottom">
                    <p class="text-xs">This action can only be taken by admins or accounts users</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <!-- Table -->
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">

                <TableHead class="w-[110px]">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    @click="toggleSort('dueDate')"
                  >
                    Due date
                    <component :is="sortIcon('dueDate')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[90px]">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking ID</span>
                </TableHead>

                <TableHead>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    @click="toggleSort('centreName')"
                  >
                    Centre / Space
                    <component :is="sortIcon('centreName')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead>
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Method</span>
                </TableHead>

                <TableHead class="text-right">
                  <button
                    type="button"
                    class="ml-auto inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    @click="toggleSort('grossAmount')"
                  >
                    Rate
                    <component :is="sortIcon('grossAmount')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[110px] text-center">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    @click="toggleSort('paymentType')"
                  >
                    Status
                    <component :is="sortIcon('paymentType')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="tx in filteredTransactions" :key="tx.id" class="group">

                <!-- Due date -->
                <TableCell class="text-sm text-muted-foreground">
                  {{ tx.dueDate ? formatDate(tx.dueDate) : '—' }}
                </TableCell>

                <!-- Booking ref -->
                <TableCell class="font-mono text-xs text-muted-foreground">
                  {{ tx.bookingRef }}
                </TableCell>

                <!-- Centre / Space -->
                <TableCell>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-medium text-foreground">{{ tx.centreName }}</span>
                    <span class="text-xs text-muted-foreground">{{ tx.spaceTitle }}</span>
                  </div>
                </TableCell>

                <!-- Method — interactive for actionable statuses, plain otherwise -->
                <TableCell>
                  <!--
                    For pending/overdue/failed transactions the tenant can change
                    their payment method. Render as a button with a hover pencil icon.
                  -->
                  <button
                    v-if="isMethodEditable(tx.paymentType)"
                    type="button"
                    class="group/method flex items-center gap-1.5 rounded transition-colors hover:text-foreground"
                    @click="openChangeMethod(tx)"
                  >
                    <component
                      :is="methodIcon(tx.paymentMethod)"
                      :size="13"
                      stroke-width="1.75"
                      class="shrink-0 text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground">{{ methodLabel(tx.paymentMethod) }}</span>
                    <IconPencil
                      :size="11"
                      stroke-width="2"
                      class="ml-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/method:opacity-100"
                    />
                  </button>

                  <!-- Non-editable statuses — plain text -->
                  <div v-else class="flex items-center gap-1.5">
                    <component
                      :is="methodIcon(tx.paymentMethod)"
                      :size="13"
                      stroke-width="1.75"
                      class="shrink-0 text-muted-foreground"
                    />
                    <span class="text-sm text-muted-foreground">{{ methodLabel(tx.paymentMethod) }}</span>
                  </div>
                </TableCell>

                <!-- Rate -->
                <TableCell class="text-right text-sm font-medium tabular-nums text-foreground">
                  {{ formatAmount(tx.grossAmount) }}
                </TableCell>

                <!-- Status — plain badge (tenant cannot change status) -->
                <TableCell class="text-center">
                  <span
                    class="cursor-default rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="statusClass(tx.paymentType)"
                  >
                    {{ statusLabel(tx.paymentType) }}
                  </span>
                </TableCell>

              </TableRow>

              <TableRow v-if="filteredTransactions.length === 0">
                <TableCell colspan="6" class="py-16 text-center text-sm text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- Change payment method overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="changeMethodOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/50" @click="changeMethodOpen = false" />
        <div class="relative z-10 w-full max-w-[480px] rounded-xl border border-border bg-background shadow-2xl">

          <!-- Header -->
          <div class="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">Change payment method</h2>
              <div class="flex flex-col gap-0.5 mt-0.5">
                <p class="text-sm text-muted-foreground">{{ changeMethodTx?.tenantCompany }}</p>
                <span class="font-mono text-xs text-muted-foreground">{{ changeMethodTx?.bookingRef }}</span>
              </div>
            </div>
            <button
              type="button"
              class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              @click="changeMethodOpen = false"
            >
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Method options + instrument picker -->
          <div class="overflow-y-auto px-6 py-5" style="max-height: 72vh">

            <!-- Duplicate charge warning -->
            <div
              v-if="showDuplicateWarning"
              class="mb-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
            >
              <IconAlertTriangle :size="16" stroke-width="1.75" class="mt-0.5 shrink-0 text-amber-600" />
              <p class="text-xs leading-relaxed text-amber-800">
                A <strong>{{ duplicateWarningMethodName }}</strong> payment attempt was already initiated for this
                invoice. Switching to another automated method may result in a duplicate charge. We recommend
                switching to bank transfer if you're unsure.
              </p>
            </div>

            <!-- Method selection cards -->
            <div class="flex flex-col gap-2">
              <button
                v-for="option in methodOptions"
                :key="option.value"
                type="button"
                class="flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors"
                :class="changeMethodSelected === option.value
                  ? 'border-foreground bg-muted/40'
                  : 'border-border hover:bg-muted/50'"
                @click="selectMethod(option.value)"
              >
                <component
                  :is="methodIcon(option.value)"
                  :size="18"
                  stroke-width="1.5"
                  class="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div class="flex flex-1 flex-col gap-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-foreground">{{ option.label }}</span>
                    <span
                      v-if="option.value === changeMethodCurrentValue"
                      class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      Current
                    </span>
                  </div>
                  <span class="text-xs text-muted-foreground">{{ option.description }}</span>
                </div>
                <div
                  class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                  :class="changeMethodSelected === option.value ? 'border-foreground' : 'border-border'"
                >
                  <div v-if="changeMethodSelected === option.value" class="h-2 w-2 rounded-full bg-foreground" />
                </div>
              </button>
            </div>

            <!-- ── Card instrument picker ───────────────────────────────────── -->
            <Transition name="instrument">
              <div v-if="changeMethodSelected === 'card'" class="mt-4">
                <h3 class="mb-2 text-sm font-semibold text-foreground">Select card</h3>
                <div class="flex flex-col gap-2">

                  <!-- Saved cards -->
                  <button
                    v-for="card in savedCards"
                    :key="card.id"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
                    :class="selectedCardId === card.id && !addingNewCard
                      ? 'border-foreground bg-muted/40'
                      : 'border-border hover:bg-muted/30'"
                    @click="selectedCardId = card.id; addingNewCard = false"
                  >
                    <IconCreditCard :size="15" stroke-width="1.75" class="shrink-0 text-muted-foreground" />
                    <div class="flex flex-1 flex-col gap-0.5">
                      <span class="text-sm font-medium text-foreground">{{ card.brand }} •••• {{ card.last4 }}</span>
                      <span class="text-xs text-muted-foreground">Expires {{ card.expiry }} · {{ card.name }}</span>
                    </div>
                    <div
                      class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      :class="selectedCardId === card.id && !addingNewCard ? 'border-foreground' : 'border-border'"
                    >
                      <div v-if="selectedCardId === card.id && !addingNewCard" class="h-2 w-2 rounded-full bg-foreground" />
                    </div>
                  </button>

                  <!-- Add new card toggle -->
                  <button
                    v-if="!addingNewCard"
                    type="button"
                    class="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    @click="addingNewCard = true; selectedCardId = null"
                  >
                    <IconPlus :size="14" stroke-width="2" />
                    Add new card
                  </button>

                  <!-- New card form (inline) -->
                  <div v-if="addingNewCard" class="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
                    <FloatingLabelInput v-model="newCard.name"   label="Cardholder name" :required="true" />
                    <FloatingLabelInput v-model="newCard.number" label="Card number"     :required="true" />
                    <div class="grid grid-cols-2 gap-3">
                      <FloatingLabelInput v-model="newCard.expiry" label="Expiry (MM/YY)" :required="true" />
                      <FloatingLabelInput v-model="newCard.cvc"    label="CVC"            :required="true" />
                    </div>
                    <button
                      type="button"
                      class="self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
                      @click="addingNewCard = false"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            </Transition>

            <!-- ── Direct debit instrument picker ──────────────────────────── -->
            <Transition name="instrument">
              <div v-if="changeMethodSelected === 'direct_debit'" class="mt-4">
                <h3 class="mb-2 text-sm font-semibold text-foreground">Select account</h3>
                <div class="flex flex-col gap-2">

                  <!-- Saved accounts -->
                  <button
                    v-for="account in savedBankAccounts"
                    :key="account.id"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
                    :class="selectedAccountId === account.id && !addingNewAccount
                      ? 'border-foreground bg-muted/40'
                      : 'border-border hover:bg-muted/30'"
                    @click="selectedAccountId = account.id; addingNewAccount = false"
                  >
                    <IconBuildingBank :size="15" stroke-width="1.75" class="shrink-0 text-muted-foreground" />
                    <div class="flex flex-1 flex-col gap-0.5">
                      <span class="text-sm font-medium text-foreground">{{ account.bankName }} •••• {{ account.ibanLast4 }}</span>
                      <span class="text-xs text-muted-foreground">{{ account.accountName }}</span>
                    </div>
                    <div
                      class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      :class="selectedAccountId === account.id && !addingNewAccount ? 'border-foreground' : 'border-border'"
                    >
                      <div v-if="selectedAccountId === account.id && !addingNewAccount" class="h-2 w-2 rounded-full bg-foreground" />
                    </div>
                  </button>

                  <!-- Add new account toggle -->
                  <button
                    v-if="!addingNewAccount"
                    type="button"
                    class="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    @click="addingNewAccount = true; selectedAccountId = null"
                  >
                    <IconPlus :size="14" stroke-width="2" />
                    Add new account
                  </button>

                  <!-- New account form (SEPA) -->
                  <div v-if="addingNewAccount" class="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
                    <FloatingLabelInput v-model="newAccount.name"     label="Account holder name" :required="true" />
                    <FloatingLabelInput v-model="newAccount.email"    label="Email"               :required="true" type="email" />
                    <FloatingLabelInput v-model="newAccount.bankName" label="Bank name"           :required="true" />
                    <FloatingLabelInput v-model="newAccount.iban"     label="IBAN"               :required="true" />
                    <FloatingLabelInput v-model="newAccount.bic"      label="BIC"                :required="true" />
                    <button
                      type="button"
                      class="self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
                      @click="addingNewAccount = false"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            </Transition>

            <!-- ── Bank transfer info ──────────────────────────────────────── -->
            <Transition name="instrument">
              <div v-if="changeMethodSelected === 'bank_transfer'" class="mt-4 rounded-lg bg-muted/50 px-4 py-4">
                <p class="text-sm leading-relaxed text-muted-foreground">
                  Bank transfer details and instructions will be sent to you via email. You can also find these details on your invoice.
                  Payments must be transferred a minimum of 8 days before the booking start date.
                </p>
              </div>
            </Transition>

          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="ghost" size="sm" @click="changeMethodOpen = false">Cancel</Button>
            <Button
              size="sm"
              class="px-5"
              :disabled="!canConfirm"
              @click="confirmChangeMethod"
            >
              Update method
            </Button>
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

.instrument-enter-active,
.instrument-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.instrument-enter-from,
.instrument-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { DateRange } from 'reka-ui'
import { CalendarDate } from '@internationalized/date'
import {
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconCreditCard,
  IconBuildingBank,
  IconRefresh,
  IconPencil,
  IconX,
  IconAlertTriangle,
  IconPlus,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import { FloatingLabelInput } from '@/components/ui/input'
import { useAppContext } from '@/composables/useAppContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentType = 'pending' | 'overdue' | 'paid' | 'pre_confirmed' | 'processing' | 'failed' | 'refunded' | 'cancelled' | 'paid_to_centre'
type PaymentMethod = 'card' | 'bank_transfer' | 'direct_debit'
type SortKey = 'dueDate' | 'centreName' | 'grossAmount' | 'paymentType'

interface Transaction {
  id: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  teamId: string | null
  bookingId: number
  bookingRef: string
  spaceTitle: string
  centreName: string
  tenantCompany: string
  periodFrom: string | null
  periodTo: string | null
  refPeriod: string | null
  grossAmount: number
  fillitFee: number
  netAmount: number
  chargeId: string | null
  dueDate: string | null
  paidOn: string | null
  paymentOutStatus: PaymentType | null
  transferDate: string | null
  invoiceUrl: string | null
  purchaseOrder: string | null
}

interface MethodOption {
  value: PaymentMethod
  label: string
  description: string
}

interface SavedCard {
  id: string
  brand: string
  last4: string
  expiry: string
  name: string
}

interface SavedBankAccount {
  id: string
  bankName: string
  ibanLast4: string
  accountName: string
}

// ─── Mock saved payment instruments ──────────────────────────────────────────
// In production these would come from the tenant's Stripe customer record.

const savedCards: SavedCard[] = [
  { id: 'card_1', brand: 'Visa',       last4: '4242', expiry: '08/27', name: "Sam O'Brien" },
  { id: 'card_2', brand: 'Mastercard', last4: '5555', expiry: '03/26', name: "Sam O'Brien" },
]

const savedBankAccounts: SavedBankAccount[] = [
  { id: 'ba_1', bankName: 'Deutsche Bank', ibanLast4: '3210', accountName: 'Fresh Co.' },
]

// ─── Permissions ──────────────────────────────────────────────────────────────

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
// Mutable local copy so method changes are reflected immediately in the table.

const { data: fetchedTransactions } = await useAsyncData<Transaction[]>(
  'transactions',
  () => $fetch('/api/transactions'),
)

const transactions = ref<Transaction[]>(fetchedTransactions.value ?? [])

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

// Apply date range filter only (no team filter — tenants see their own bookings)
const filteredByDate = computed(() => {
  let list = transactions.value
  if (dateRange.value?.start) {
    const start = `${dateRange.value.start.year}-${String(dateRange.value.start.month).padStart(2, '0')}-${String(dateRange.value.start.day).padStart(2, '0')}`
    list = list.filter(t => (t.dueDate ?? '') >= start)
  }
  if (dateRange.value?.end) {
    const end = `${dateRange.value.end.year}-${String(dateRange.value.end.month).padStart(2, '0')}-${String(dateRange.value.end.day).padStart(2, '0')}`
    list = list.filter(t => (t.dueDate ?? '') <= end)
  }
  return list
})

// Status tabs — "pending" is labelled "Due" from the tenant's perspective
const statusTabs = computed(() => {
  const base = filteredByDate.value
  return [
    { value: 'all' as const,      label: 'All',      count: base.length },
    { value: 'pending' as const,  label: 'Due',      count: base.filter(t => t.paymentType === 'pending').length },
    { value: 'overdue' as const,  label: 'Overdue',  count: base.filter(t => t.paymentType === 'overdue').length },
    { value: 'paid' as const,     label: 'Paid',     count: base.filter(t => t.paymentType === 'paid').length },
    { value: 'failed' as const,   label: 'Failed',   count: base.filter(t => t.paymentType === 'failed').length },
    { value: 'refunded' as const, label: 'Refunded', count: base.filter(t => t.paymentType === 'refunded').length },
  ]
})

const filteredTransactions = computed(() => {
  let list = filteredByDate.value
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

// ─── Change payment method ────────────────────────────────────────────────────

// The method column is interactive only for transactions the tenant still owes on.
function isMethodEditable(status: PaymentType): boolean {
  return status === 'pending' || status === 'overdue' || status === 'failed'
}

const methodOptions: MethodOption[] = [
  {
    value: 'card',
    label: 'Card',
    description: 'Pay securely by card. The amount will be charged immediately.',
  },
  {
    value: 'bank_transfer',
    label: 'Bank transfer',
    description: 'Transfer manually to our account details. No automated charging.',
  },
  {
    value: 'direct_debit',
    label: 'Direct debit',
    description: "We'll collect automatically from your bank account.",
  },
]

const changeMethodOpen = ref(false)
const changeMethodTx = ref<Transaction | null>(null)
const changeMethodSelected = ref<PaymentMethod | null>(null)

const changeMethodCurrentValue = computed<PaymentMethod | null>(() =>
  changeMethodTx.value?.paymentMethod ?? null
)

// Instrument selection state
const selectedCardId    = ref<string | null>(null)
const selectedAccountId = ref<string | null>(null)
const addingNewCard     = ref(false)
const addingNewAccount  = ref(false)
const newCard    = reactive({ name: '', number: '', expiry: '', cvc: '' })
const newAccount = reactive({ name: '', email: '', bankName: '', iban: '', bic: '' })

// The confirm button is enabled when a compatible instrument (or new-form) is selected
const canConfirm = computed(() => {
  const m = changeMethodSelected.value
  if (!m || m === changeMethodCurrentValue.value) return false
  if (m === 'bank_transfer') return true
  if (m === 'card')          return selectedCardId.value !== null || addingNewCard.value
  if (m === 'direct_debit')  return selectedAccountId.value !== null || addingNewAccount.value
  return false
})

// Show an amber warning if:
//   1. The original method was card or direct_debit
//   2. A charge was already initiated (chargeId is not null)
//   3. The newly selected method is also automated (card or direct_debit)
const showDuplicateWarning = computed(() => {
  if (!changeMethodTx.value || !changeMethodSelected.value) return false
  const originalIsAutomated = changeMethodTx.value.paymentMethod === 'card' || changeMethodTx.value.paymentMethod === 'direct_debit'
  const chargeWasAttempted = changeMethodTx.value.chargeId !== null
  const newIsAutomated = changeMethodSelected.value === 'card' || changeMethodSelected.value === 'direct_debit'
  return originalIsAutomated && chargeWasAttempted && newIsAutomated
})

// Human-readable name of the original automated method for the warning message
const duplicateWarningMethodName = computed<string>(() => {
  if (!changeMethodTx.value) return ''
  return changeMethodTx.value.paymentMethod === 'card' ? 'Card' : 'Direct debit'
})

function openChangeMethod(tx: Transaction) {
  changeMethodTx.value = tx
  changeMethodSelected.value = tx.paymentMethod
  selectedCardId.value    = null
  selectedAccountId.value = null
  addingNewCard.value    = false
  addingNewAccount.value = false
  Object.assign(newCard,    { name: '', number: '', expiry: '', cvc: '' })
  Object.assign(newAccount, { name: '', email: '', bankName: '', iban: '', bic: '' })
  changeMethodOpen.value = true
}

function selectMethod(method: PaymentMethod) {
  changeMethodSelected.value = method
  // Reset instrument state whenever the top-level method changes
  selectedCardId.value    = null
  selectedAccountId.value = null
  addingNewCard.value    = false
  addingNewAccount.value = false
}

function confirmChangeMethod() {
  if (!changeMethodTx.value || !changeMethodSelected.value) return
  const tx = transactions.value.find(t => t.id === changeMethodTx.value!.id)
  if (!tx) return
  tx.paymentMethod = changeMethodSelected.value
  changeMethodOpen.value = false
  changeMethodTx.value = null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAmount(amount: number): string {
  return `€${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// "pending" maps to "Due" on the tenant side — they owe the money.
function statusLabel(type: PaymentType): string {
  switch (type) {
    case 'paid':           return 'Paid'
    case 'pending':        return 'Due'
    case 'overdue':        return 'Overdue'
    case 'failed':         return 'Failed'
    case 'refunded':       return 'Refunded'
    case 'pre_confirmed':  return 'Pre-confirmed'
    case 'processing':     return 'Processing'
    case 'cancelled':      return 'Cancelled'
    case 'paid_to_centre': return 'Paid to LL bank'
  }
}

function statusClass(type: PaymentType): string {
  switch (type) {
    case 'paid':           return 'bg-green-50 text-green-700'
    case 'paid_to_centre': return 'bg-green-50 text-green-700'
    case 'pending':        return 'bg-blue-50 text-blue-600'
    case 'overdue':        return 'bg-amber-50 text-amber-700'
    case 'failed':         return 'bg-red-50 text-red-600'
    case 'refunded':       return 'bg-muted text-muted-foreground'
    case 'pre_confirmed':  return 'bg-purple-50 text-purple-700'
    case 'processing':     return 'bg-sky-50 text-sky-600'
    case 'cancelled':      return 'bg-muted text-muted-foreground'
  }
}

function methodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'card':          return 'Credit card'
    case 'bank_transfer': return 'Bank transfer'
    case 'direct_debit':  return 'Direct debit'
  }
}

function methodIcon(method: PaymentMethod) {
  switch (method) {
    case 'card':          return IconCreditCard
    case 'bank_transfer': return IconBuildingBank
    case 'direct_debit':  return IconRefresh
  }
}
</script>
