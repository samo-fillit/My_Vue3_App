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

            </div>
          </div>

          <!-- Empty state -->
          <template v-if="!hasTeamData">
            <div class="flex flex-col items-center gap-3 py-20 text-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <IconInbox :size="22" class="text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">Nothing here yet</p>
                <p class="mt-1 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  This team doesn't have any transactions yet.
                </p>
              </div>
            </div>
          </template>
          <template v-else>

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
              <TooltipProvider :delay-duration="300">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <span :class="!can('manage:transactions') ? 'cursor-not-allowed' : ''">
                      <Button variant="outline" size="sm" class="h-8 px-3 text-xs disabled:pointer-events-none" :disabled="!can('manage:transactions')">Export CSV</Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent v-if="!can('manage:transactions')" side="bottom">
                    <p class="text-xs">This action can only be taken by admins or accounts users</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <!-- Search bar -->
          <div class="flex items-center gap-3">
            <div class="relative w-[300px]">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search booking or tenant…"
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
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('dueDate')">
                    Due date
                    <component :is="sortIcon('dueDate')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[90px]">
                  <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking ID</span>
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

                <TableHead class="text-right">
                  <button type="button" class="ml-auto inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('grossAmount')">
                    Rate
                    <component :is="sortIcon('grossAmount')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[110px] text-center">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('paymentType')">
                    Payment in
                    <component :is="sortIcon('paymentType')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[140px] text-center">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('paymentOutStatus')">
                    Payment out
                    <component :is="sortIcon('paymentOutStatus')" :size="12" stroke-width="2" />
                  </button>
                </TableHead>

                <TableHead class="w-[160px] text-center" />

                <TableHead class="w-[60px]" />

              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow
                v-for="tx in filteredTransactions"
                :key="tx.id"
                :ref="el => { if (el) rowRefs[tx.id] = el as HTMLElement }"
                class="group"
                :class="{ 'row-highlight': highlightedId === tx.id }"
              >

                <TableCell class="text-sm text-muted-foreground">
                  {{ tx.dueDate ? formatDate(tx.dueDate) : '—' }}
                </TableCell>

                <TableCell class="font-mono text-xs text-muted-foreground">
                  {{ tx.bookingRef }}
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

                <TableCell class="text-right text-sm font-medium tabular-nums text-foreground">{{ formatAmount(tx.grossAmount) }}</TableCell>

                <!-- Payment in status — tenant → platform -->
                <TableCell class="text-center">
                  <TooltipProvider :delay-duration="150">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <button
                          v-if="can('manage:transactions')"
                          type="button"
                          class="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-75"
                          :class="statusClass(tx.paymentType)"
                          @click="openChangeStatus(tx, 'paymentType')"
                        >
                          {{ statusLabel(tx.paymentType) }}
                          <IconPencil :size="10" stroke-width="2" class="opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                        <span
                          v-else
                          class="cursor-default rounded-full px-2.5 py-1 text-xs font-medium"
                          :class="statusClass(tx.paymentType)"
                        >
                          {{ statusLabel(tx.paymentType) }}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent v-if="manualChanges[`${tx.id}-paymentType`] || tx.paidOn" side="top">
                        <p class="text-xs">
                          <template v-if="manualChanges[`${tx.id}-paymentType`]">
                            Manually changed by {{ manualChanges[`${tx.id}-paymentType`].by }} on {{ formatDate(manualChanges[`${tx.id}-paymentType`].at) }}
                          </template>
                          <template v-else>Received {{ formatDate(tx.paidOn!) }}</template>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                <!-- Payment out status — platform → landlord -->
                <TableCell class="text-center">
                  <TooltipProvider :delay-duration="150">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <button
                          v-if="can('manage:transactions')"
                          type="button"
                          class="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-75"
                          :class="statusClass(tx.paymentOutStatus ?? 'pending')"
                          @click="openChangeStatus(tx, 'paymentOutStatus')"
                        >
                          {{ statusLabel(tx.paymentOutStatus ?? 'pending') }}
                          <IconPencil :size="10" stroke-width="2" class="opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                        <span
                          v-else
                          class="cursor-default rounded-full px-2.5 py-1 text-xs font-medium"
                          :class="statusClass(tx.paymentOutStatus ?? 'pending')"
                        >
                          {{ statusLabel(tx.paymentOutStatus ?? 'pending') }}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent v-if="manualChanges[`${tx.id}-paymentOutStatus`] || tx.transferDate" side="top">
                        <p class="text-xs">
                          <template v-if="manualChanges[`${tx.id}-paymentOutStatus`]">
                            Manually changed by {{ manualChanges[`${tx.id}-paymentOutStatus`].by }} on {{ formatDate(manualChanges[`${tx.id}-paymentOutStatus`].at) }}
                          </template>
                          <template v-else>Transferred {{ formatDate(tx.transferDate!) }}</template>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                <!-- Document column — invoice or PO -->
                <TableCell class="text-center">
                  <!-- View Invoice — payment received -->
                  <Button
                    v-if="tx.paymentType === 'paid' || tx.paymentType === 'refunded'"
                    variant="outline"
                    size="sm"
                    :as="tx.invoiceUrl ? 'a' : 'button'"
                    :href="tx.invoiceUrl ?? undefined"
                    target="_blank"
                    class="h-8 gap-1.5 px-3 disabled:pointer-events-none"
                    :disabled="!tx.invoiceUrl"
                  >
                    <IconFileInvoice :size="14" stroke-width="1.75" />
                    Invoice
                  </Button>

                  <!-- View PO — pending / overdue / failed -->
                  <Button
                    v-else-if="tx.paymentType === 'pending' || tx.paymentType === 'overdue' || tx.paymentType === 'failed'"
                    variant="outline"
                    size="sm"
                    class="h-8 gap-1.5 px-3 disabled:pointer-events-none"
                    :disabled="!tx.purchaseOrder"
                  >
                    <IconFileText :size="14" stroke-width="1.75" />
                    PO
                  </Button>
                </TableCell>

                <!-- Actions column — send reminder (icon only) -->
                <TableCell class="text-center">
                  <TooltipProvider v-if="tx.paymentType === 'pending' || tx.paymentType === 'overdue'" :delay-duration="200">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="(!can('manage:transactions') || isReminderDisabled(tx.id)) ? 'cursor-not-allowed' : 'inline-flex'">
                          <Button
                            size="sm"
                            :class="[
                              'h-8 w-8 p-0',
                              (!can('manage:transactions') || isReminderDisabled(tx.id))
                                ? 'pointer-events-none opacity-40'
                                : '',
                            ]"
                            @click="sendReminder(tx)"
                          >
                            <IconBell :size="14" stroke-width="1.75" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <template v-if="!can('manage:transactions')">
                          <p class="text-xs">This action can only be taken by admins or accounts users</p>
                        </template>
                        <template v-else-if="isReminderDisabled(tx.id)">
                          <p class="text-xs">Last reminder sent {{ reminderSentAt(tx.id) }}</p>
                          <p class="mt-0.5 text-xs">Email status: <span class="font-semibold capitalize">{{ reminderEmailStatus(tx.id) }}</span></p>
                        </template>
                        <template v-else>
                          <p class="text-xs">Send reminder</p>
                        </template>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

              </TableRow>

              <TableRow v-if="filteredTransactions.length === 0">
                <TableCell colspan="10" class="py-16 text-center text-sm text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          </template><!-- end v-else -->

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- Change payment status overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="changeStatusOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/50" @click="changeStatusOpen = false" />
        <div class="relative z-10 w-full max-w-[480px] rounded-xl border border-border bg-background shadow-2xl">

          <!-- Header -->
          <div class="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">
                {{ changeStatusField === 'paymentType' ? 'Change payment in status' : 'Change payment out status' }}
              </h2>
              <div class="flex flex-col gap-0.5">
                <p class="text-sm text-muted-foreground">{{ changeStatusTx?.tenantCompany }}</p>
                <span class="font-mono text-xs text-muted-foreground">{{ changeStatusTx?.bookingRef }}</span>
              </div>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="changeStatusOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Options -->
          <div class="flex flex-col gap-2 overflow-y-auto px-6 py-5" style="max-height: 60vh">
            <button
              v-for="option in changeStatusOptions"
              :key="option.value"
              type="button"
              class="flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors"
              :class="changeStatusSelected === option.value
                ? 'border-foreground bg-muted/40'
                : 'border-border hover:bg-muted/50'"
              @click="changeStatusSelected = option.value"
            >
              <div class="flex flex-1 flex-col gap-0.5">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="statusClass(option.value)"
                  >
                    {{ option.label }}
                  </span>
                  <span
                    v-if="option.value === changeStatusCurrentValue"
                    class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    Current
                  </span>
                </div>
                <span class="mt-1 text-xs text-muted-foreground">{{ option.description }}</span>
              </div>
              <div
                class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                :class="changeStatusSelected === option.value ? 'border-foreground' : 'border-border'"
              >
                <div v-if="changeStatusSelected === option.value" class="h-2 w-2 rounded-full bg-foreground" />
              </div>
            </button>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="outline" size="sm" @click="changeStatusOpen = false">Cancel</Button>
            <Button
              size="sm"
              class="px-5"
              :disabled="changeStatusSelected === changeStatusCurrentValue"
              @click="confirmChangeStatus"
            >
              Save
            </Button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Reminder sent confirmation overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="reminderOverlayOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/40" @click="reminderOverlayOpen = false" />
        <div class="relative z-10 flex w-full max-w-[400px] flex-col items-center gap-6 rounded-xl border border-border bg-background px-8 py-10 text-center shadow-2xl">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <IconCheck :size="22" stroke-width="2.5" class="text-green-600" />
          </div>
          <div class="flex flex-col gap-1.5">
            <p class="text-base font-semibold text-foreground">Reminder sent</p>
            <p class="text-sm text-muted-foreground">An email and in-app notification has been sent to the tenant.</p>
            <p class="mt-2 text-sm text-muted-foreground">
              You can send another after<br>
              <span class="font-medium text-foreground">{{ reminderNextTime }}</span>
            </p>
          </div>
          <Button size="sm" class="px-6" @click="reminderOverlayOpen = false">Got it</Button>
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
import { ref, computed, nextTick, watch } from 'vue'
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
  IconFileInvoice,
  IconFileText,
  IconBell,
  IconCheck,
  IconPencil,
  IconX,
  IconSearch,
  IconBuilding,
  IconInbox,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import { useTeamContext } from '@/composables/useTeamContext'
import { useAppContext } from '@/composables/useAppContext'

// ─── Current user (mock — replace with real auth in production) ──────────────

const CURRENT_USER_NAME = 'Sarah Mitchell'

// ─── Types ───────────────────────────────────────────────────────────────────

// Aligned with Rails payment_type string values:
// outward → paid (tenant→platform), inward → paid (platform→landlord),
// paid_to_centre → paid to LL bank, overdue is Vue-derived (pending + past due)
type PaymentType = 'pending' | 'overdue' | 'paid' | 'pre_confirmed' | 'processing' | 'failed' | 'refunded' | 'cancelled' | 'paid_to_centre'
type PaymentMethod = 'card' | 'bank_transfer' | 'direct_debit'
type SortKey = 'dueDate' | 'tenantCompany' | 'centreName' | 'grossAmount' | 'paymentType' | 'paymentOutStatus'

interface ManualChange {
  by: string
  at: string
}

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
  /** Full period dates — present in mock data; null when data comes from Rails (not exposed by get_payments) */
  periodFrom: string | null
  periodTo: string | null
  /** "May 2026" label derived from payment_date — always present from Rails */
  refPeriod: string | null
  grossAmount: number
  fillitFee: number
  netAmount: number
  chargeId: string | null
  dueDate: string | null
  paidOn: string | null
  /** Platform → landlord payout status (Rails get_payments col 9) */
  paymentOutStatus: PaymentType | null
  /** ISO date when funds were transferred to landlord (Rails get_payments col 13) */
  transferDate: string | null
  invoiceUrl: string | null
  purchaseOrder: string | null
}

// ─── Teams ────────────────────────────────────────────────────────────────────

const { activeTeamId } = useTeamContext()
const { can } = useAppContext()

// ─── Search ───────────────────────────────────────────────────────────────────

const searchQuery = ref('')
const matchIndex = ref(-1)
const highlightedId = ref<number | null>(null)
const rowRefs = ref<Record<number, HTMLElement>>({})

const txMatchIds = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return filteredTransactions.value
    .filter(tx =>
      tx.bookingRef.toLowerCase().includes(q) ||
      tx.tenantCompany.toLowerCase().includes(q)
    )
    .map(tx => tx.id)
})

const searchCountLabel = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return ''
  if (txMatchIds.value.length === 0) return 'No results'
  if (matchIndex.value >= 0) return `${matchIndex.value + 1} / ${txMatchIds.value.length}`
  return `${txMatchIds.value.length} match${txMatchIds.value.length === 1 ? '' : 'es'}`
})

watch(searchQuery, () => {
  matchIndex.value = -1
  highlightedId.value = null
})

function jumpToMatch() {
  if (!txMatchIds.value.length) return
  matchIndex.value = (matchIndex.value + 1) % txMatchIds.value.length
  const id = txMatchIds.value[matchIndex.value]
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
  const base = (transactions.value ?? []).filter(
    t => !activeTeamId.value || t.teamId === null || t.teamId === activeTeamId.value,
  )
  return [...new Set(base.map(t => t.centreName))].sort()
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

// ─── Reminder state ───────────────────────────────────────────────────────────
// In-memory only — resets on page refresh, which avoids SSR hydration mismatches.

const REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000

type ReminderEmailStatus = 'delivered' | 'opened' | 'clicked' | 'bounced'

// Mock email statuses — in production these would come from the email provider webhook.
const MOCK_EMAIL_STATUSES: Record<number, ReminderEmailStatus> = {
  10001: 'opened',
  10002: 'clicked',
  10003: 'bounced',
  10004: 'delivered',
  10005: 'opened',
  20001: 'clicked',
  20005: 'opened',
  20010: 'bounced',
}

function reminderEmailStatus(txId: number): ReminderEmailStatus {
  return MOCK_EMAIL_STATUSES[txId] ?? 'delivered'
}

const reminderSentMap = ref<Record<number, string>>({})
const reminderOverlayOpen = ref(false)
const reminderOverlayTimestamp = ref<string | null>(null)

function isReminderDisabled(txId: number): boolean {
  const sent = reminderSentMap.value[txId]
  if (!sent) return false
  return Date.now() - new Date(sent).getTime() < REMINDER_COOLDOWN_MS
}

function reminderSentAt(txId: number): string {
  const sent = reminderSentMap.value[txId]
  if (!sent) return ''
  return new Date(sent).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const reminderNextTime = computed(() => {
  if (!reminderOverlayTimestamp.value) return ''
  const next = new Date(new Date(reminderOverlayTimestamp.value).getTime() + REMINDER_COOLDOWN_MS)
  return next.toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
})

function sendReminder(tx: Transaction) {
  if (!can('manage:transactions') || isReminderDisabled(tx.id)) return
  const now = new Date().toISOString()
  reminderSentMap.value = { ...reminderSentMap.value, [tx.id]: now }
  reminderOverlayTimestamp.value = now
  reminderOverlayOpen.value = true
}

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
// Fetched from the Nuxt server route, which tries Rails first and falls back
// to mock data so the page works offline during design iteration.

const { data: transactions } = await useAsyncData<Transaction[]>(
  'transactions',
  () => $fetch('/api/transactions'),
)

const hasTeamData = computed(() => {
  if (!activeTeamId.value) return false
  return (transactions.value ?? []).some(t => t.teamId === activeTeamId.value)
})

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
  let list = transactions.value ?? []
  if (activeTeamId.value) {
    list = list.filter(t => t.teamId === null || t.teamId === activeTeamId.value)
  }
  if (dateRange.value?.start) {
    const start = `${dateRange.value.start.year}-${String(dateRange.value.start.month).padStart(2, '0')}-${String(dateRange.value.start.day).padStart(2, '0')}`
    list = list.filter(t => (t.dueDate ?? '') >= start)
  }
  if (dateRange.value?.end) {
    const end = `${dateRange.value.end.year}-${String(dateRange.value.end.month).padStart(2, '0')}-${String(dateRange.value.end.day).padStart(2, '0')}`
    list = list.filter(t => (t.dueDate ?? '') <= end)
  }
  if (selectedCentreNames.value.length > 0) {
    list = list.filter(t => selectedCentreNames.value.includes(t.centreName))
  }
  return list
})

const statusTabs = computed(() => {
  const base = filteredByTeamAndDate.value
  return [
    { value: 'all' as const,      label: 'All',      count: base.length },
    { value: 'pending' as const,  label: 'Pending',  count: base.filter(t => t.paymentType === 'pending').length },
    { value: 'overdue' as const,  label: 'Overdue',  count: base.filter(t => t.paymentType === 'overdue').length },
    { value: 'paid' as const,     label: 'Paid',     count: base.filter(t => t.paymentType === 'paid').length },
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

// ─── Change status ────────────────────────────────────────────────────────────

type ChangeStatusField = 'paymentType' | 'paymentOutStatus'

interface StatusOption {
  value: PaymentType
  label: string
  description: string
}

const paymentInOptions: StatusOption[] = [
  { value: 'pending',       label: 'Pending',       description: 'Awaiting payment from the tenant.' },
  { value: 'pre_confirmed', label: 'Pre-confirmed',  description: 'Tenant has pre-confirmed; payment not yet charged.' },
  { value: 'processing',    label: 'Processing',     description: 'Payment is currently being processed.' },
  { value: 'paid',          label: 'Paid',           description: 'Payment received from the tenant (Rails: outward).' },
  { value: 'failed',        label: 'Failed',         description: 'Payment attempt failed.' },
  { value: 'refunded',      label: 'Refunded',       description: 'Payment has been refunded to the tenant.' },
  { value: 'cancelled',     label: 'Cancelled',      description: 'Payment has been cancelled.' },
]

const paymentOutOptions: StatusOption[] = [
  { value: 'pending',        label: 'Pending',         description: 'Awaiting transfer to landlord account.' },
  { value: 'processing',     label: 'Processing',      description: 'Transfer to landlord is being processed.' },
  { value: 'paid',           label: 'Paid',            description: 'Funds transferred to landlord account (Rails: inward).' },
  { value: 'paid_to_centre', label: 'Paid to LL bank', description: 'Funds paid directly to the landlord bank account.' },
  { value: 'failed',         label: 'Failed',          description: 'Transfer to landlord failed.' },
  { value: 'cancelled',      label: 'Cancelled',       description: 'Payout has been cancelled.' },
]

const changeStatusOpen = ref(false)
const changeStatusTx = ref<Transaction | null>(null)
const changeStatusField = ref<ChangeStatusField>('paymentType')
const changeStatusSelected = ref<PaymentType | null>(null)
// Keyed by `${txId}-${field}` — records who manually changed a status and when
const manualChanges = ref<Record<string, ManualChange>>({})

// 'overdue' is derived (pending + past due) — map it back to 'pending' for editing
const changeStatusCurrentValue = computed<PaymentType | null>(() => {
  if (!changeStatusTx.value) return null
  const val = changeStatusField.value === 'paymentType'
    ? changeStatusTx.value.paymentType
    : (changeStatusTx.value.paymentOutStatus ?? 'pending')
  return val === 'overdue' ? 'pending' : val
})

const changeStatusOptions = computed<StatusOption[]>(() =>
  changeStatusField.value === 'paymentType' ? paymentInOptions : paymentOutOptions
)

function openChangeStatus(tx: Transaction, field: ChangeStatusField) {
  if (!can('manage:transactions')) return
  changeStatusTx.value = tx
  changeStatusField.value = field
  const current = field === 'paymentType' ? tx.paymentType : (tx.paymentOutStatus ?? 'pending')
  changeStatusSelected.value = current === 'overdue' ? 'pending' : current
  changeStatusOpen.value = true
}

function confirmChangeStatus() {
  if (!changeStatusTx.value || !changeStatusSelected.value || !transactions.value) return
  const tx = transactions.value.find(t => t.id === changeStatusTx.value!.id)
  if (!tx) return
  if (changeStatusField.value === 'paymentType') {
    tx.paymentType = changeStatusSelected.value
  } else {
    tx.paymentOutStatus = changeStatusSelected.value
  }
  const key = `${tx.id}-${changeStatusField.value}`
  manualChanges.value = {
    ...manualChanges.value,
    [key]: { by: CURRENT_USER_NAME, at: new Date().toISOString() },
  }
  changeStatusOpen.value = false
  changeStatusTx.value = null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}


function formatAmount(amount: number): string {
  return `€${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function statusLabel(type: PaymentType): string {
  switch (type) {
    case 'paid':          return 'Paid'
    case 'pending':       return 'Pending'
    case 'overdue':       return 'Overdue'
    case 'failed':        return 'Failed'
    case 'refunded':      return 'Refunded'
    case 'pre_confirmed': return 'Pre-confirmed'
    case 'processing':    return 'Processing'
    case 'cancelled':     return 'Cancelled'
    case 'paid_to_centre':return 'Paid to LL bank'
  }
}

function statusClass(type: PaymentType): string {
  switch (type) {
    case 'paid':          return 'bg-green-50 text-green-700'
    case 'paid_to_centre':return 'bg-green-50 text-green-700'
    case 'pending':       return 'bg-blue-50 text-blue-600'
    case 'overdue':       return 'bg-amber-50 text-amber-700'
    case 'failed':        return 'bg-red-50 text-red-600'
    case 'refunded':      return 'bg-muted text-muted-foreground'
    case 'pre_confirmed': return 'bg-purple-50 text-purple-700'
    case 'processing':    return 'bg-sky-50 text-sky-600'
    case 'cancelled':     return 'bg-muted text-muted-foreground'
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
