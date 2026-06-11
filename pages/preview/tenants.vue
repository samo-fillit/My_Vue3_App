<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="crm" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Heading -->
          <div class="flex flex-col gap-3">
            <h1 class="text-[28px] font-bold leading-8 text-foreground">Tenants</h1>
            <p class="text-base text-muted-foreground">Your brands and prospects — relationships, history, and renewals.</p>
          </div>

          <template v-if="!isLandlord">
            <div class="flex flex-col items-center gap-3 py-20 text-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <IconBuildingStore :size="22" class="text-muted-foreground" />
              </div>
              <p class="text-sm font-semibold text-foreground">Tenants is a landlord workspace</p>
              <p class="max-w-xs text-xs leading-relaxed text-muted-foreground">Switch to a landlord view to manage your tenant relationships.</p>
            </div>
          </template>
          <template v-else>

          <!-- Stage tabs -->
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
              <span v-if="tab.count > 0" class="ml-1.5 text-xs tabular-nums text-muted-foreground">{{ tab.count }}</span>
            </button>
          </div>

          <!-- Controls: search + renewals filter -->
          <div class="flex items-center gap-3">
            <div class="relative w-[400px]">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search company or contact…"
                class="h-10 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px]"
              />
              <IconSearch :size="16" stroke-width="1.5" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <button
              type="button"
              class="flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors"
              :class="renewalsOnly ? 'border-amber-500 bg-amber-500/10 text-foreground' : 'border-border text-foreground hover:bg-muted'"
              @click="renewalsOnly = !renewalsOnly"
            >
              <IconRefresh :size="15" stroke-width="1.75" :class="renewalsOnly ? 'text-amber-600' : 'text-muted-foreground'" />
              Renewals due
              <span v-if="renewalCount" class="rounded-full bg-amber-500/15 px-1.5 text-xs font-semibold tabular-nums text-amber-600">{{ renewalCount }}</span>
            </button>
            <span v-if="searchQuery.trim()" class="text-xs text-muted-foreground tabular-nums">{{ searchCountLabel }}</span>
          </div>

          <!-- Table -->
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead>
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</span>
                </TableHead>
                <TableHead class="w-[170px]">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</span>
                </TableHead>
                <TableHead class="w-[90px] text-right">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bookings</span>
                </TableHead>
                <TableHead class="w-[140px] text-right">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lifetime value</span>
                </TableHead>
                <TableHead class="w-[150px] pl-8">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage</span>
                </TableHead>
                <TableHead class="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="t in filteredTenants"
                :key="t.id"
                class="group cursor-pointer"
                @click="openTenant(t)"
              >
                <TableCell>
                  <div class="flex items-center gap-2.5">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                      {{ t.company.charAt(0) }}
                    </div>
                    <span class="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {{ t.company }}
                      <span v-if="t.confirmedCount >= 2" class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Repeat</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-sm text-muted-foreground">{{ t.category }}</TableCell>
                <TableCell class="text-right text-sm tabular-nums text-foreground">{{ t.confirmedCount || '—' }}</TableCell>
                <TableCell class="text-right text-sm font-medium tabular-nums text-foreground">{{ t.lifetimeValue ? formatAmount(t.lifetimeValue) : '—' }}</TableCell>
                <TableCell class="pl-8">
                  <StatusDot :label="stageMeta(t.stage).label" :dot-class="stageMeta(t.stage).dotClass" />
                </TableCell>
                <TableCell class="w-[120px]">
                  <TooltipProvider v-if="t.renewalDue" :delay-duration="150">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                          <IconRefresh :size="12" stroke-width="2" /> Renewal
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p class="text-xs">Booking ending soon — reach out to renew</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>

              <TableRow v-if="filteredTenants.length === 0">
                <TableCell :colspan="6" class="py-16 text-center text-sm text-muted-foreground">{{ emptyMessage }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          </template>
        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- Tenant 360 overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="selectedTenant" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/50" @click="selectedTenant = null" />
        <div class="relative z-10 flex w-full max-w-[640px] flex-col rounded-xl border border-border bg-background shadow-2xl" style="max-height: 90vh">

          <!-- Header -->
          <div class="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-foreground">
                {{ selectedTenant.company.charAt(0) }}
              </div>
              <div class="flex flex-col gap-0.5">
                <h2 class="flex items-center gap-2 text-lg font-semibold leading-tight text-foreground">
                  {{ selectedTenant.company }}
                  <span v-if="selectedTenant.confirmedCount >= 2" class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Repeat</span>
                </h2>
                <p class="text-sm text-muted-foreground">{{ formatCategory(selectedTenant.category) }}</p>
              </div>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="selectedTenant = null">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Stage strip -->
          <div class="flex shrink-0 items-center justify-between gap-3 px-6 py-3">
            <StatusDot :label="stageMeta(selectedTenant.stage).label" :dot-class="stageMeta(selectedTenant.stage).dotClass" />
            <span v-if="selectedTenant.source" class="text-xs text-muted-foreground">Source: {{ selectedTenant.source }}</span>
          </div>

          <!-- Tabs -->
          <div class="flex shrink-0 items-center gap-1 border-b border-border px-4">
            <button
              type="button"
              class="-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
              :class="detailTab === 'overview' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'"
              @click="detailTab = 'overview'"
            >Overview</button>
            <button
              type="button"
              class="-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
              :class="detailTab === 'people' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'"
              @click="detailTab = 'people'"
            >People <span class="ml-1 text-xs tabular-nums text-muted-foreground">{{ selectedTenant.contacts.length }}</span></button>
          </div>

          <!-- Body: Overview -->
          <div v-if="detailTab === 'overview'" class="flex-1 overflow-y-auto px-6 py-6">
            <div class="flex flex-col gap-7">

              <!-- Renewal callout -->
              <div v-if="selectedTenant.renewalDue" class="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3">
                <IconRefresh :size="16" stroke-width="1.75" class="mt-0.5 shrink-0 text-amber-600" />
                <div class="flex flex-col gap-0.5">
                  <span class="text-sm font-medium text-foreground">Renewal opportunity</span>
                  <span class="text-xs text-muted-foreground">{{ renewalLine(selectedTenant) }}</span>
                </div>
              </div>

              <!-- Contact (primary) -->
              <section class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Primary contact</span>
                    <span class="text-sm font-medium text-foreground">{{ primaryContact(selectedTenant).name }}</span>
                    <span v-if="primaryContact(selectedTenant).role" class="text-xs text-muted-foreground">{{ primaryContact(selectedTenant).role }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Member since</span>
                    <span class="text-sm tabular-nums text-foreground">{{ selectedTenant.since ? formatDate(selectedTenant.since) : '—' }}</span>
                  </div>
                </div>
                <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <a :href="`mailto:${primaryContact(selectedTenant).email}`" class="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-primary" @click.stop>
                    <IconMail :size="14" stroke-width="1.5" class="text-muted-foreground" /> {{ primaryContact(selectedTenant).email }}
                  </a>
                  <span v-if="primaryContact(selectedTenant).phone" class="inline-flex items-center gap-1.5 text-muted-foreground">
                    <IconPhone :size="14" stroke-width="1.5" /> {{ primaryContact(selectedTenant).phone }}
                  </span>
                </div>
                <button v-if="selectedTenant.contacts.length > 1" type="button" class="inline-flex w-fit items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary" @click="detailTab = 'people'">
                  See all {{ selectedTenant.contacts.length }} people <IconArrowRight :size="13" stroke-width="2" />
                </button>
              </section>

              <!-- Transactions -->
              <section class="flex flex-col gap-4 border-t border-border pt-6">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-semibold text-foreground">Transactions</h3>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary" @click="viewTransactions(selectedTenant)">
                    View all <IconArrowRight :size="13" stroke-width="2" />
                  </button>
                </div>
                <!-- Financial summary -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Lifetime value</span>
                    <span class="text-sm font-semibold tabular-nums text-foreground">{{ formatAmount(selectedTenant.lifetimeValue) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Bookings</span>
                    <span class="text-sm font-semibold tabular-nums text-foreground">{{ selectedTenant.confirmedCount }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Outstanding</span>
                    <span class="text-sm font-semibold tabular-nums" :class="selectedTenant.outstanding > 0 ? 'text-amber-600' : 'text-foreground'">{{ formatAmount(selectedTenant.outstanding) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Payments</span>
                    <span class="text-sm font-semibold" :class="selectedTenant.latePayments > 0 ? 'text-red-600' : 'text-green-600'">{{ selectedTenant.latePayments > 0 ? `${selectedTenant.latePayments} late` : 'On time' }}</span>
                  </div>
                </div>
                <!-- Upcoming + overdue -->
                <div class="flex flex-col gap-2.5 border-t border-border pt-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">Upcoming payments</span>
                    <span class="font-medium tabular-nums text-foreground">{{ upcomingCount(selectedTenant) }}</span>
                  </div>
                  <template v-if="overduePayments(selectedTenant).length">
                    <span class="text-xs font-medium uppercase tracking-wide text-red-600">Overdue</span>
                    <div v-for="p in overduePayments(selectedTenant)" :key="p.id" class="flex items-center justify-between gap-3">
                      <div class="flex min-w-0 flex-col gap-0.5">
                        <span class="truncate text-sm text-foreground">{{ p.label }} · #{{ p.bookingId }}</span>
                        <span class="text-xs tabular-nums text-muted-foreground">Due {{ formatDate(p.dueDate) }} · {{ p.centreName }}</span>
                      </div>
                      <span class="shrink-0 text-sm font-semibold tabular-nums text-red-600">{{ formatAmount(p.amount) }}</span>
                    </div>
                  </template>
                  <p v-else class="text-xs text-muted-foreground">No overdue payments.</p>
                </div>
              </section>

              <!-- Bookings -->
              <section class="flex flex-col gap-3 border-t border-border pt-6">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-semibold text-foreground">Bookings &amp; enquiries</h3>
                  <button v-if="selectedTenant.bookings.length" type="button" class="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary" @click="viewInBookings(selectedTenant)">
                    View in bookings <IconArrowRight :size="13" stroke-width="2" />
                  </button>
                </div>
                <div v-if="selectedTenant.bookings.length" class="flex flex-col gap-3">
                  <div v-for="b in selectedTenant.bookings" :key="b.id" class="flex items-center gap-3">
                    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span class="truncate text-sm text-foreground">{{ b.space.centreName }} · {{ b.space.title }}</span>
                      <span class="text-xs tabular-nums text-muted-foreground">{{ formatDate(b.period.from) }} – {{ formatDate(b.period.to) }}</span>
                    </div>
                    <span class="w-24 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">{{ formatAmount(b.financials.total ?? b.financials.rate) }}</span>
                    <div class="w-32 shrink-0">
                      <StatusDot :label="bookingStatusMeta(b).label" :dot-class="bookingStatusMeta(b).dotClass" />
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-muted-foreground">No bookings yet — this is a prospect.</p>
              </section>

              <!-- Notes -->
              <section class="flex flex-col gap-2 border-t border-border pt-6">
                <h3 class="text-sm font-semibold text-foreground">Notes</h3>
                <textarea
                  :value="noteText(selectedTenant)"
                  rows="3"
                  placeholder="Add a note about this tenant…"
                  class="w-full resize-none rounded-md border border-border bg-background p-2.5 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  @input="setNote(selectedTenant, ($event.target as HTMLTextAreaElement).value)"
                />
                <p v-if="selectedTenant.crmNote" class="text-xs text-muted-foreground">{{ selectedTenant.crmNote }}</p>
              </section>

            </div>
          </div>

          <!-- Body: People -->
          <div v-else class="flex-1 overflow-y-auto px-6 py-6">
            <div class="flex flex-col gap-3">
              <div v-for="c in selectedTenant.contacts" :key="c.email" class="flex items-start justify-between gap-3 rounded-lg border border-border px-4 py-3">
                <div class="flex items-start gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{{ initials(c.name) }}</div>
                  <div class="flex flex-col gap-0.5">
                    <span class="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {{ c.name }}
                      <span v-if="c.primary" class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Primary</span>
                    </span>
                    <span v-if="c.role" class="text-xs text-muted-foreground">{{ c.role }}</span>
                    <div class="mt-1 flex flex-col gap-0.5 text-xs">
                      <a :href="`mailto:${c.email}`" class="inline-flex w-fit items-center gap-1.5 text-foreground transition-colors hover:text-primary" @click.stop>
                        <IconMail :size="13" stroke-width="1.5" class="text-muted-foreground" /> {{ c.email }}
                      </a>
                      <span v-if="c.phone" class="inline-flex items-center gap-1.5 text-muted-foreground">
                        <IconPhone :size="13" stroke-width="1.5" /> {{ c.phone }}
                      </span>
                    </div>
                  </div>
                </div>
                <span v-if="contactBookings(selectedTenant, c).length" class="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                  {{ contactBookings(selectedTenant, c).length }} booking{{ contactBookings(selectedTenant, c).length === 1 ? '' : 's' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer actions -->
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="ghost" size="sm" @click="router.push('/preview/messages')">Message</Button>
            <Button variant="outline" size="sm" @click="viewInBookings(selectedTenant)">View bookings</Button>
            <Button size="sm" @click="createBooking()">Create booking</Button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IconSearch,
  IconX,
  IconBuildingStore,
  IconMail,
  IconPhone,
  IconArrowRight,
  IconRefresh,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import StatusDot from '@/components/StatusDot.vue'
import { useAppContext } from '@/composables/useAppContext'
import { useTeamContext } from '@/composables/useTeamContext'

const router = useRouter()

// Same simulated "today" as the bookings page — keeps derived states aligned.
const TODAY = new Date('2026-06-09T00:00:00Z')
const RENEWAL_WINDOW_DAYS = 45

// ─── Types ──────────────────────────────────────────────────────────────────
type Stage = 'active' | 'lead' | 'prospect' | 'lapsed'

interface Booking {
  id: string
  status: string
  createdAt?: string
  period: { from: string; to: string }
  landlord: { teamId: string }
  tenant: { company: string; contactName: string; email: string; phone?: string }
  space: { id: string; title: string; centreId: string; centreName: string; centreColor: string }
  enquiry?: { category: string }
  financials: { total?: number; totalLandlord?: number; rate: number; paymentStatus?: string }
  payments?: { id: string; label: string; amount: number; dueDate: string; status: string }[]
}
interface TenantCrm {
  id: string
  company: string
  contactName: string
  email: string
  phone?: string
  category: string
  teamId: string
  isProspect?: boolean
  source?: string
  createdAt?: string
  note?: string | null
}
interface Contact {
  name: string
  role?: string
  email: string
  phone?: string
  primary?: boolean
}
interface TenantRecord {
  id: string
  company: string
  contactName: string
  email: string
  phone?: string
  category: string
  source?: string
  contacts: Contact[]
  bookings: Booking[]
  confirmedCount: number
  lifetimeValue: number
  outstanding: number
  latePayments: number
  centresUsed: string[]
  since: string | null
  stage: Stage
  renewalDue: boolean
  crmNote?: string | null
}

// ─── Context + data ─────────────────────────────────────────────────────────
const { isUserType } = useAppContext()
const { activeTeamId } = useTeamContext()
const isLandlord = computed(() => isUserType('landlord'))

const { data: bookingsData } = await useAsyncData<Booking[]>('bookings', () => $fetch('/api/bookings'))
const { data: tenantsData } = await useAsyncData<TenantCrm[]>('tenants', () => $fetch('/api/tenants'))
const { data: companiesData } = await useAsyncData<Record<string, { category?: string; contacts?: Contact[] }>>('companies', () => $fetch('/api/companies'))
const bookings = computed(() => bookingsData.value ?? [])
const prospects = computed(() => tenantsData.value ?? [])
const companiesByName = computed(() => companiesData.value ?? {})

// The company's own category (sector) — set at company level, not derived from
// booking types (a company can run many kinds of booking).
function companyCategory(company: string): string {
  return companiesByName.value[company.toLowerCase()]?.category ?? 'Other'
}

// A company's people: seeded CRM contacts if present, else derived from the
// distinct contacts across its bookings (usually one). Primary first.
function contactsForCompany(company: string, bs: Booking[]): Contact[] {
  const seeded = companiesByName.value[company.toLowerCase()]?.contacts
  if (seeded?.length) return [...seeded].sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0))
  const seen = new Map<string, Contact>()
  for (const b of bs) {
    const key = b.tenant.email.toLowerCase()
    if (!seen.has(key)) seen.set(key, { name: b.tenant.contactName, email: b.tenant.email, phone: b.tenant.phone })
  }
  const list = [...seen.values()]
  if (list[0]) list[0].primary = true
  return list
}
function primaryContact(t: TenantRecord): Contact {
  return t.contacts.find(c => c.primary) ?? t.contacts[0]
}
// Bookings where a given contact is the booker (matched by email).
function contactBookings(t: TenantRecord, c: Contact): Booking[] {
  return t.bookings.filter(b => b.tenant.email.toLowerCase() === c.email.toLowerCase())
}

// ─── Derivation ───────────────────────────────────────────────────────────────
function daysFromToday(iso: string): number {
  return Math.round((new Date(iso + 'T00:00:00Z').getTime() - TODAY.getTime()) / 86400000)
}
function bookingOutstanding(b: Booking): number {
  const total = b.financials.total ?? b.financials.rate ?? 0
  if (b.financials.paymentStatus === 'paid') return 0
  const ps = b.payments ?? []
  if (!ps.length) return total
  const collected = ps.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  return Math.max(0, total - collected)
}

// Local per-tenant CRM notes (prototype — resets on reload).
const notes = ref<Record<string, string>>({})
function noteText(t: TenantRecord): string { return notes.value[t.id] ?? t.crmNote ?? '' }
function setNote(t: TenantRecord, v: string) { notes.value[t.id] = v }

const scopedTenants = computed<TenantRecord[]>(() => {
  const team = activeTeamId.value
  const mine = bookings.value.filter(b => b.landlord.teamId === team)

  // Group bookings by company.
  const groups = new Map<string, Booking[]>()
  for (const b of mine) {
    const key = b.tenant.company.toLowerCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(b)
  }

  const records: TenantRecord[] = []
  for (const [, bs] of groups) {
    const sorted = [...bs].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    const latest = sorted[0]
    const confirmed = bs.filter(b => b.status === 'confirmed')
    const hasActive = confirmed.some(b => daysFromToday(b.period.to) >= 0)
    const hasPipeline = bs.some(b => ['enquiry', 'quoted', 'awaiting_signature'].includes(b.status))
    const hasPast = confirmed.some(b => daysFromToday(b.period.to) < 0)
    const stage: Stage = hasActive ? 'active' : hasPipeline ? 'lead' : (hasPast ? 'lapsed' : 'lapsed')
    // Renewal opportunity: a confirmed booking ending within the window AND no
    // later confirmed booking already in place (they haven't rebooked yet).
    const renewalDue = confirmed.some(b => {
      const d = daysFromToday(b.period.to)
      if (d < 0 || d > RENEWAL_WINDOW_DAYS) return false
      return !confirmed.some(o => o.period.from > b.period.to)
    })
    const since = bs.map(b => b.createdAt ?? b.period.from).sort()[0] ?? null
    const crmMeta = prospects.value.find(p => p.company.toLowerCase() === latest.tenant.company.toLowerCase())

    records.push({
      id: latest.tenant.company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      company: latest.tenant.company,
      contactName: latest.tenant.contactName,
      email: latest.tenant.email,
      phone: latest.tenant.phone,
      category: companyCategory(latest.tenant.company),
      source: crmMeta?.source,
      contacts: contactsForCompany(latest.tenant.company, bs),
      bookings: [...bs].sort((a, b) => b.period.from.localeCompare(a.period.from)),
      confirmedCount: confirmed.length,
      lifetimeValue: confirmed.reduce((s, b) => s + (b.financials.totalLandlord ?? b.financials.total ?? b.financials.rate ?? 0), 0),
      outstanding: confirmed.reduce((s, b) => s + bookingOutstanding(b), 0),
      latePayments: bs.filter(b => b.financials.paymentStatus === 'overdue' || (b.payments ?? []).some(p => p.status === 'overdue' || p.status === 'failed')).length,
      centresUsed: [...new Set(bs.map(b => b.space.centreName))],
      since,
      stage,
      renewalDue,
      crmNote: crmMeta?.note ?? null,
    })
  }

  // Prospects (no bookings) for this team.
  const bookedCompanies = new Set(records.map(r => r.company.toLowerCase()))
  for (const p of prospects.value) {
    if (p.teamId !== team) continue
    if (bookedCompanies.has(p.company.toLowerCase())) continue
    records.push({
      id: p.id,
      company: p.company,
      contactName: p.contactName,
      email: p.email,
      phone: p.phone,
      category: p.category,
      source: p.source,
      contacts: contactsForCompany(p.company, []).length
        ? contactsForCompany(p.company, [])
        : [{ name: p.contactName, email: p.email, phone: p.phone, primary: true }],
      bookings: [],
      confirmedCount: 0,
      lifetimeValue: 0,
      outstanding: 0,
      latePayments: 0,
      centresUsed: [],
      since: p.createdAt ?? null,
      stage: 'prospect',
      renewalDue: false,
      crmNote: p.note ?? null,
    })
  }

  return records.sort((a, b) => b.lifetimeValue - a.lifetimeValue || a.company.localeCompare(b.company))
})

// ─── Tabs + filters ───────────────────────────────────────────────────────────
type TabValue = 'all' | 'active' | 'lead' | 'prospect' | 'lapsed'
const activeTab = ref<TabValue>('all')
const searchQuery = ref('')
const renewalsOnly = ref(false)

const tabs = computed(() => {
  const s = scopedTenants.value
  const n = (st: Stage) => s.filter(t => t.stage === st).length
  return [
    { value: 'all' as const,      label: 'All',       count: s.length },
    { value: 'active' as const,   label: 'Active',    count: n('active') },
    { value: 'lead' as const,     label: 'Leads',     count: n('lead') },
    { value: 'prospect' as const, label: 'Prospects', count: n('prospect') },
    { value: 'lapsed' as const,   label: 'Lapsed',    count: n('lapsed') },
  ]
})

const renewalCount = computed(() => scopedTenants.value.filter(t => t.renewalDue).length)

const filteredTenants = computed(() => {
  let list = scopedTenants.value
  if (activeTab.value !== 'all') list = list.filter(t => t.stage === activeTab.value)
  if (renewalsOnly.value) list = list.filter(t => t.renewalDue)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) list = list.filter(t => t.company.toLowerCase().includes(q) || t.contactName.toLowerCase().includes(q))
  return list
})

const searchCountLabel = computed(() => {
  if (!searchQuery.value.trim()) return ''
  const n = filteredTenants.value.length
  return n === 0 ? 'No results' : `${n} result${n === 1 ? '' : 's'}`
})
const emptyMessage = computed(() => {
  if (searchQuery.value.trim()) return 'No tenants match your search.'
  if (renewalsOnly.value) return 'No renewals due.'
  return 'No tenants in this stage.'
})

// ─── Tenant overlay ─────────────────────────────────────────────────────────
const selectedTenant = ref<TenantRecord | null>(null)
const detailTab = ref<'overview' | 'people'>('overview')
function openTenant(t: TenantRecord) {
  selectedTenant.value = t
  detailTab.value = 'overview'
}
function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function viewInBookings(t: TenantRecord) {
  router.push({ path: '/preview/bookings', query: { q: t.company } })
}
function viewTransactions(t: TenantRecord) {
  router.push({ path: '/preview/transactions', query: { q: t.company } })
}
function createBooking() {
  router.push('/preview/booking-links?create=1')
}

// Payment line items across a tenant's bookings, for the overlay's Transactions section.
interface PaymentRow { id: string; label: string; amount: number; dueDate: string; status: string; bookingId: string; centreName: string }
function tenantPayments(t: TenantRecord): PaymentRow[] {
  return t.bookings.flatMap(b => (b.payments ?? []).map(p => ({
    id: `${b.id}-${p.id}`, label: p.label, amount: p.amount, dueDate: p.dueDate, status: p.status,
    bookingId: b.id, centreName: b.space.centreName,
  })))
}
function upcomingCount(t: TenantRecord): number {
  return tenantPayments(t).filter(p => p.status === 'pending' && daysFromToday(p.dueDate) >= 0).length
}
function overduePayments(t: TenantRecord): PaymentRow[] {
  return tenantPayments(t).filter(p => p.status === 'overdue' || p.status === 'failed')
}

// ─── Display helpers ──────────────────────────────────────────────────────────
function formatCategory(c?: string | null): string {
  if (!c) return '—'
  return c.replace(/_/g, ' ').replace(/^\w/, m => m.toUpperCase())
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatAmount(amount: number): string {
  return `€${(amount || 0).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
}

interface DotMeta { label: string; dotClass: string }
function stageMeta(stage: Stage): DotMeta {
  switch (stage) {
    case 'active':   return { label: 'Active', dotClass: 'bg-green-500' }
    case 'lead':     return { label: 'Lead', dotClass: 'bg-blue-500' }
    case 'prospect': return { label: 'Prospect', dotClass: 'bg-sky-500' }
    case 'lapsed':   return { label: 'Lapsed', dotClass: 'bg-muted-foreground' }
  }
}
function bookingStatusMeta(b: Booking): DotMeta {
  switch (b.status) {
    case 'enquiry':            return { label: 'Enquiry', dotClass: 'bg-blue-500' }
    case 'quoted':             return { label: 'Quoted', dotClass: 'bg-amber-500' }
    case 'awaiting_signature': return { label: 'Awaiting signature', dotClass: 'bg-purple-500' }
    case 'confirmed':          return daysFromToday(b.period.to) < 0
      ? { label: 'Completed', dotClass: 'bg-muted-foreground' }
      : (daysFromToday(b.period.from) <= 0 ? { label: 'Live now', dotClass: 'bg-green-500' } : { label: 'Upcoming', dotClass: 'bg-sky-500' })
    case 'declined':           return { label: 'Declined', dotClass: 'bg-red-500' }
    case 'cancelled':          return { label: 'Cancelled', dotClass: 'bg-muted-foreground' }
    default:                   return { label: formatCategory(b.status), dotClass: 'bg-muted-foreground' }
  }
}
function renewalLine(t: TenantRecord): string {
  const ending = t.bookings
    .filter(b => b.status === 'confirmed' && daysFromToday(b.period.to) >= 0 && daysFromToday(b.period.to) <= RENEWAL_WINDOW_DAYS)
    .sort((a, b) => a.period.to.localeCompare(b.period.to))[0]
  if (!ending) return 'A booking is ending soon.'
  return `${ending.space.centreName} · ${ending.space.title} ends ${formatDate(ending.period.to)} — reach out to rebook.`
}
</script>
