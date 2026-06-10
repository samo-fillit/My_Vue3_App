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
                <TableHead class="w-[60px]" />
                <TableHead class="w-[52px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow
                v-for="b in filteredBookings"
                :key="b.id"
                class="group cursor-pointer"
                @click="openDetail(b)"
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
                  {{ rateDisplay(b) }}
                </TableCell>

                <TableCell class="pl-8">
                  <div class="flex flex-col items-start gap-1">
                    <StatusDot :label="statusMeta(b).label" :dot-class="statusMeta(b).dotClass" :pulse="statusMeta(b).live" />
                    <TooltipProvider v-if="b.autoChanged" :delay-duration="150">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <span class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Auto</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p class="text-xs">{{ autoChangedLabel(b.autoChanged) }}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>

                <TableCell class="w-[60px]">
                  <div class="flex items-center gap-1.5">
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
                    <TooltipProvider v-if="hasBlockingConflict(b)" :delay-duration="150">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <span class="inline-flex text-amber-600">
                            <IconAlertTriangle :size="15" stroke-width="1.75" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p class="text-xs">Dates clash with a confirmed booking</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>

                <TableCell class="w-[52px] text-center">
                  <Popover>
                    <PopoverTrigger as-child>
                      <button
                        type="button"
                        class="inline-flex rounded p-1 transition-colors hover:bg-muted"
                        :title="hasNote(b) ? 'Edit note' : 'Add note'"
                        @click.stop
                      >
                        <IconNote
                          :size="18"
                          stroke-width="1.5"
                          :fill="hasNote(b) ? 'currentColor' : 'none'"
                          :class="hasNote(b) ? 'text-yellow-400' : 'text-muted-foreground/40'"
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent class="w-72 p-3" align="end" :side-offset="6" @click.stop>
                      <div class="flex flex-col gap-2">
                        <span class="text-xs font-semibold text-foreground">Note</span>
                        <textarea
                          :value="noteText(b)"
                          rows="3"
                          placeholder="Add a note…"
                          class="w-full resize-none rounded-md border border-border bg-background p-2 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                          @input="setNote(b, ($event.target as HTMLTextAreaElement).value)"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
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

  <!-- Booking detail overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="detailOpen && selectedBooking" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/50" @click="closeDetail" />
        <div class="relative z-10 flex w-full max-w-[640px] flex-col rounded-xl border border-border bg-background shadow-2xl" style="max-height: 90vh">

          <!-- Header -->
          <div class="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                :style="{ backgroundColor: selectedBooking.space.centreColor }"
              >
                {{ selectedBooking.space.centreName.charAt(0) }}
              </div>
              <div class="flex flex-col gap-0.5">
                <h2 class="text-lg font-semibold leading-tight text-foreground">{{ selectedBooking.space.centreName }}</h2>
                <p class="text-sm text-muted-foreground">{{ selectedBooking.space.title }}</p>
              </div>
            </div>
            <button
              type="button"
              class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              @click="closeDetail"
            >
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Status + ID strip -->
          <div class="flex shrink-0 items-center justify-between gap-3 border-b border-border px-6 py-3">
            <div class="inline-flex items-center gap-3">
              <StatusDot :label="statusMeta(selectedBooking).label" :dot-class="statusMeta(selectedBooking).dotClass" :pulse="statusMeta(selectedBooking).live" />
              <span v-if="hasOverdue(selectedBooking)" class="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                <IconFlagFilled :size="13" /> Overdue
              </span>
            </div>
            <span class="font-mono text-xs text-muted-foreground">#{{ selectedBooking.id }}</span>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <div class="flex flex-col gap-7">

              <!-- Closed reason (declined / cancelled) -->
              <div v-if="closedSummary(selectedBooking)" class="flex items-start gap-2.5 rounded-lg bg-muted px-4 py-3">
                <IconAlertTriangle :size="16" stroke-width="1.5" class="mt-0.5 shrink-0 text-muted-foreground" />
                <div class="flex flex-col gap-0.5">
                  <span class="text-sm font-medium text-foreground">{{ closedSummary(selectedBooking)!.title }}</span>
                  <span v-if="closedSummary(selectedBooking)!.detail" class="text-xs text-muted-foreground">{{ closedSummary(selectedBooking)!.detail }}</span>
                  <span v-if="refundLine(selectedBooking)" class="text-xs text-muted-foreground">{{ refundLine(selectedBooking) }}</span>
                </div>
              </div>

              <!-- Double-booking conflict (landlord) -->
              <div v-if="hasBlockingConflict(selectedBooking)" class="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3">
                <IconAlertTriangle :size="16" stroke-width="1.5" class="mt-0.5 shrink-0 text-amber-600" />
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-foreground">Date clash with a confirmed booking</span>
                  <span class="text-xs text-muted-foreground">This space is already booked for overlapping dates:</span>
                  <ul class="mt-0.5 flex flex-col gap-0.5">
                    <li v-for="c in blockingConflictsFor(selectedBooking)" :key="c.id" class="text-xs tabular-nums text-muted-foreground">
                      #{{ c.id }} · {{ c.tenant.company }} · {{ formatDate(c.period.from) }} – {{ formatDate(c.period.to) }}
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Key facts -->
              <section class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Dates</span>
                    <span class="text-sm tabular-nums text-foreground">{{ formatDate(selectedBooking.period.from) }} – {{ formatDate(selectedBooking.period.to) }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-medium text-muted-foreground">Rate</span>
                    <span class="text-sm font-medium tabular-nums text-foreground">{{ formatAmount(selectedBooking.financials.rate) }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs font-medium text-muted-foreground">{{ isLandlord ? 'Tenant' : 'Centre' }}</span>
                  <template v-if="isLandlord">
                    <span class="text-sm font-medium text-foreground">{{ selectedBooking.tenant.company }}</span>
                    <span class="text-xs text-muted-foreground">{{ selectedBooking.tenant.contactName }} · {{ selectedBooking.tenant.email }}</span>
                  </template>
                  <template v-else>
                    <span class="text-sm font-medium text-foreground">{{ selectedBooking.space.centreName }}</span>
                    <span class="text-xs text-muted-foreground">{{ selectedBooking.landlord.organisationName ?? selectedBooking.landlord.teamName }}</span>
                  </template>
                </div>
              </section>

              <!-- Financials -->
              <section class="flex flex-col gap-2 border-t border-border pt-6">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-foreground">Financials</h3>
                  <span v-if="isPoa(selectedBooking)" class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Price on application</span>
                </div>
                <dl v-if="isPoa(selectedBooking) && !canNegotiate(selectedBooking)" class="flex flex-col gap-1.5 text-sm">
                  <div class="flex items-center justify-between">
                    <dt class="text-muted-foreground">Price</dt>
                    <dd class="font-medium text-foreground">Price on application</dd>
                  </div>
                </dl>
                <dl v-else class="flex flex-col gap-1.5 text-sm">
                  <div class="flex items-center justify-between">
                    <dt class="text-muted-foreground">Rate</dt>
                    <dd v-if="canNegotiate(selectedBooking)" class="relative">
                      <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                      <input
                        v-model.number="rateDraft"
                        type="number"
                        min="0"
                        step="50"
                        class="h-8 w-32 rounded-md border border-border bg-background pl-6 pr-2 text-right text-sm tabular-nums text-foreground outline-none transition-colors focus:border-foreground"
                      />
                    </dd>
                    <dd v-else class="tabular-nums text-foreground">{{ formatAmount(liveFinancials.rate) }}</dd>
                  </div>
                  <div v-if="liveFinancials.vat" class="flex items-center justify-between">
                    <dt class="text-muted-foreground">VAT</dt>
                    <dd class="tabular-nums text-foreground">{{ formatAmount(liveFinancials.vat) }}</dd>
                  </div>
                  <div v-if="liveFinancials.deposit" class="flex items-center justify-between">
                    <dt class="text-muted-foreground">Deposit</dt>
                    <dd class="tabular-nums text-foreground">{{ formatAmount(liveFinancials.deposit) }}</dd>
                  </div>
                  <div v-if="isLandlord && liveFinancials.fillitFee" class="flex items-center justify-between">
                    <dt class="text-muted-foreground">Fillit fee</dt>
                    <dd class="tabular-nums text-foreground">−{{ formatAmount(liveFinancials.fillitFee) }}</dd>
                  </div>
                  <div class="mt-1 flex items-center justify-between border-t border-border pt-2">
                    <dt class="font-medium text-foreground">{{ isLandlord ? 'You receive' : 'Total' }}</dt>
                    <dd class="font-semibold tabular-nums text-foreground">{{ formatAmount(isLandlord ? liveFinancials.totalLandlord : liveFinancials.total) }}</dd>
                  </div>
                </dl>
                <p v-if="canNegotiate(selectedBooking)" class="text-xs text-muted-foreground">Adjust the rate, then send the terms to the tenant to accept or decline.</p>
              </section>

              <!-- Payment schedule -->
              <section v-if="selectedBooking.payments && selectedBooking.payments.length" class="flex flex-col gap-3 border-t border-border pt-6">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-semibold text-foreground">Payment schedule</h3>
                  <div v-if="!editingSchedule" class="flex items-center gap-4">
                    <button v-if="isLandlord" type="button" class="text-xs font-medium text-foreground transition-colors hover:text-primary" @click="startEditSchedule">Edit</button>
                    <button type="button" class="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary" @click="viewTransactions(selectedBooking)">
                      View transactions
                      <IconArrowRight :size="13" stroke-width="2" />
                    </button>
                  </div>
                </div>

                <!-- Display mode -->
                <template v-if="!editingSchedule">
                  <div class="flex flex-col gap-3">
                    <div v-for="p in selectedBooking.payments" :key="p.id" class="flex items-center justify-between gap-3">
                      <div class="flex flex-col gap-0.5">
                        <span class="text-sm text-foreground">{{ p.label }}</span>
                        <span class="text-xs tabular-nums text-muted-foreground">Due {{ formatDate(p.dueDate) }}</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="text-sm font-medium tabular-nums text-foreground">{{ formatAmount(p.amount) }}</span>
                        <StatusDot :label="paymentMeta(p.status).label" :dot-class="paymentMeta(p.status).dotClass" />
                        <button
                          v-if="isLandlord && selectedBooking.status === 'confirmed' && p.status !== 'paid' && p.status !== 'refunded'"
                          type="button"
                          class="text-xs font-medium text-foreground transition-colors hover:text-primary"
                          @click="openMarkPaid(p)"
                        >
                          Mark paid
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span><span class="font-medium tabular-nums text-foreground">{{ formatAmount(paymentSummary(selectedBooking).collected) }}</span> collected</span>
                    <span><span class="font-medium tabular-nums text-foreground">{{ formatAmount(paymentSummary(selectedBooking).outstanding) }}</span> outstanding</span>
                  </div>
                </template>

                <!-- Edit mode (landlord) -->
                <template v-else>
                  <div class="flex flex-col gap-2">
                    <div v-for="(p, i) in scheduleDraft" :key="p.id" class="flex items-center gap-2">
                      <template v-if="p.status === 'paid'">
                        <div class="flex flex-1 flex-col gap-0.5">
                          <span class="text-sm text-foreground">{{ p.label }}</span>
                          <span class="text-xs tabular-nums text-muted-foreground">{{ formatDate(p.dueDate) }} · paid</span>
                        </div>
                        <span class="text-sm font-medium tabular-nums text-muted-foreground">{{ formatAmount(p.amount) }}</span>
                        <span class="w-7" />
                      </template>
                      <template v-else>
                        <input
                          v-model="p.dueDate"
                          type="date"
                          :max="selectedBooking.period.to"
                          class="h-9 rounded-md border border-border bg-background px-2 text-xs tabular-nums text-foreground outline-none transition-colors focus:border-foreground"
                        />
                        <div class="relative flex-1">
                          <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                          <input
                            v-model.number="p.amount"
                            type="number"
                            min="0"
                            class="h-9 w-full rounded-md border border-border bg-background pl-6 pr-2 text-right text-sm tabular-nums text-foreground outline-none transition-colors focus:border-foreground"
                          />
                        </div>
                        <button type="button" class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-red-600" @click="removeScheduleRow(i)">
                          <IconTrash :size="15" stroke-width="1.5" />
                        </button>
                      </template>
                    </div>
                  </div>
                  <button type="button" class="inline-flex w-fit items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary" @click="addScheduleRow">
                    <IconPlus :size="14" stroke-width="2" /> Add payment
                  </button>
                  <div class="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span class="text-muted-foreground">Scheduled <span class="font-medium tabular-nums text-foreground">{{ formatAmount(scheduleDraftTotal) }}</span> of {{ formatAmount(scheduleBookingTotal) }}</span>
                    <span class="font-medium tabular-nums" :class="scheduleRemaining === 0 ? 'text-green-600' : 'text-red-600'">
                      {{ scheduleRemaining === 0 ? 'Balanced' : (scheduleRemaining > 0 ? formatAmount(scheduleRemaining) + ' left' : formatAmount(-scheduleRemaining) + ' over') }}
                    </span>
                  </div>
                  <p v-if="!scheduleDatesOk" class="text-xs text-red-600">Payment dates must be in order and within the booking period.</p>
                  <div class="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="cancelEditSchedule">Cancel</Button>
                    <Button size="sm" :disabled="!scheduleValid" @click="saveSchedule">Save schedule</Button>
                  </div>
                </template>
              </section>

              <!-- Documents -->
              <section v-if="selectedBooking.documents && selectedBooking.documents.length" class="flex flex-col gap-3 border-t border-border pt-6">
                <h3 class="text-sm font-semibold text-foreground">Documents</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(d, i) in selectedBooking.documents" :key="i" class="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                    <div class="flex items-center gap-2.5">
                      <IconFileText :size="16" stroke-width="1.5" class="shrink-0 text-muted-foreground" />
                      <div class="flex flex-col">
                        <span class="text-sm text-foreground">{{ d.name }}</span>
                        <span class="text-xs capitalize text-muted-foreground">{{ d.status }}</span>
                      </div>
                    </div>
                    <button type="button" class="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary">
                      <IconDownload :size="14" stroke-width="1.5" /> View
                    </button>
                  </div>
                </div>
              </section>

              <!-- Enquiry -->
              <section v-if="selectedBooking.enquiry" class="flex flex-col gap-2 border-t border-border pt-6">
                <h3 class="text-sm font-semibold text-foreground">Enquiry</h3>
                <span class="text-sm font-medium text-foreground">{{ selectedBooking.enquiry.title }}</span>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span v-if="selectedBooking.enquiry.category">{{ formatCategory(selectedBooking.enquiry.category) }}</span>
                  <span v-if="selectedBooking.enquiry.dimensions">{{ selectedBooking.enquiry.dimensions }}</span>
                </div>
                <p v-if="selectedBooking.enquiry.description" class="text-sm leading-relaxed text-muted-foreground">{{ selectedBooking.enquiry.description }}</p>
                <p v-if="selectedBooking.enquiry.additionalInfo" class="text-sm leading-relaxed text-muted-foreground">{{ selectedBooking.enquiry.additionalInfo }}</p>
              </section>

              <!-- Manager approval (Nhood) -->
              <section v-if="selectedBooking.managerApproval" class="flex flex-col gap-3 border-t border-border pt-6">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-semibold text-foreground">Manager approval</h3>
                  <span v-if="selectedBooking.managerApproval.status === 'approved'" class="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                    <IconCircleCheck :size="14" /> Approved
                  </span>
                  <span v-else-if="selectedBooking.managerApproval.status === 'rejected'" class="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <IconCircleX :size="14" /> Rejected
                  </span>
                </div>
                <div class="flex flex-col gap-2.5">
                  <div v-for="(ap, i) in selectedBooking.managerApproval.approvers" :key="i" class="flex items-center justify-between gap-3">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm text-foreground">{{ ap.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ formatCategory(ap.role) }}</span>
                    </div>
                    <StatusDot :label="managerDecisionMeta(ap).label" :dot-class="managerDecisionMeta(ap).dotClass" />
                  </div>
                </div>
                <!-- Approve / reject (Nhood approver only) -->
                <div v-if="canActOnApproval(selectedBooking)" class="flex items-center justify-end gap-2 border-t border-border pt-3">
                  <Button variant="outline" size="sm" @click="openActionModal('rejectApproval')">Reject</Button>
                  <Button size="sm" @click="approveManagerStep(selectedBooking)">Approve</Button>
                </div>
                <p v-else-if="pendingApprover(selectedBooking) && isPlatform('eleaseloop') && isLandlord && isRole('accounts')" class="border-t border-border pt-3 text-xs text-muted-foreground">
                  Accounts can view approvals but can't approve — this needs a commercial or regional manager.
                </p>
              </section>

              <!-- Activity -->
              <section v-if="selectedBooking.actions && selectedBooking.actions.length" class="flex flex-col gap-3 border-t border-border pt-6">
                <h3 class="text-sm font-semibold text-foreground">Activity</h3>
                <ol class="flex flex-col">
                  <li v-for="(ev, i) in selectedBooking.actions" :key="i" class="flex gap-3">
                    <div class="flex flex-col items-center pt-1">
                      <span class="h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                      <span v-if="i < selectedBooking.actions.length - 1" class="mt-1 w-px flex-1 bg-border" />
                    </div>
                    <div class="flex flex-col gap-0.5 pb-4">
                      <span class="text-sm text-foreground">{{ ev.description }}</span>
                      <span class="text-xs tabular-nums text-muted-foreground">{{ formatDate(ev.at) }} · {{ ev.actor }}</span>
                    </div>
                  </li>
                </ol>
              </section>

              <!-- Notes (current viewer's own note) -->
              <section v-if="hasNote(selectedBooking)" class="flex flex-col gap-2 border-t border-border pt-6">
                <h3 class="text-sm font-semibold text-foreground">Notes</h3>
                <p class="text-sm leading-relaxed text-muted-foreground">{{ noteText(selectedBooking) }}</p>
              </section>

            </div>
          </div>

          <!-- Footer: status-aware CTAs -->
          <div class="flex shrink-0 flex-col gap-2.5 border-t border-border px-6 py-5">
            <p v-if="detailWaitingHint(selectedBooking)" class="text-xs text-muted-foreground">{{ detailWaitingHint(selectedBooking) }}</p>
            <p v-if="cancelLocked(selectedBooking)" class="flex items-start gap-1.5 text-xs text-muted-foreground">
              <IconInfoCircle :size="13" stroke-width="1.5" class="mt-0.5 shrink-0" />
              This lease is signed and can't be cancelled here. Use messaging to request a change.
            </p>
            <p v-if="detailBlockHint(selectedBooking)" class="flex items-start gap-1.5 text-xs text-amber-600">
              <IconAlertTriangle :size="13" stroke-width="1.5" class="mt-0.5 shrink-0" />
              {{ detailBlockHint(selectedBooking) }}
            </p>
            <div class="flex flex-wrap items-center justify-end gap-3">
              <Button
                v-for="cta in detailActions(selectedBooking)"
                :key="cta.key"
                :variant="cta.variant"
                size="sm"
                :disabled="cta.disabled"
                @click="onCta(cta.key)"
              >
                {{ cta.label }}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Action modal: cancel / withdraw / decline / report -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="actionModal && selectedBooking" class="fixed inset-0 z-[60] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/50" @click="closeActionModal" />
        <div class="relative z-10 flex w-full max-w-[440px] flex-col rounded-xl border border-border bg-background shadow-2xl">
          <div class="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <h2 class="text-base font-semibold text-foreground">{{ actionModal.title }}</h2>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="closeActionModal">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>
          <div class="flex flex-col gap-4 px-6 py-5">
            <p class="text-sm text-muted-foreground">{{ actionModal.description }}</p>

            <!-- Refund window (cancelling a confirmed booking) -->
            <div v-if="actionModal.showRefund" class="flex items-start gap-2.5 rounded-lg bg-muted px-4 py-3">
              <IconInfoCircle :size="16" stroke-width="1.5" class="mt-0.5 shrink-0 text-muted-foreground" />
              <div class="flex flex-col gap-0.5">
                <span class="text-sm font-medium text-foreground">{{ refundWindow(selectedBooking).beforeCutoff ? 'Eligible for a full refund' : 'No refund' }}</span>
                <span class="text-xs text-muted-foreground">
                  {{ refundWindow(selectedBooking).beforeCutoff
                    ? 'Cancelling now refunds ' + formatAmount(refundWindow(selectedBooking).amount) + ' in full.'
                    : 'The free-cancellation deadline (' + formatDate(refundWindow(selectedBooking).cutoffIso) + ') has passed — no refund will be issued.' }}
                </span>
              </div>
            </div>

            <!-- Reason picker -->
            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium text-muted-foreground">{{ actionModal.reasonLabel }}</span>
              <button
                v-for="r in actionModal.reasons"
                :key="r"
                type="button"
                class="flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors"
                :class="actionReason === r ? 'border-foreground bg-muted text-foreground' : 'border-border text-foreground hover:border-foreground'"
                @click="actionReason = r"
              >
                <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border" :class="actionReason === r ? 'border-foreground' : 'border-border'">
                  <span v-if="actionReason === r" class="h-2 w-2 rounded-full bg-foreground" />
                </span>
                {{ r }}
              </button>
              <textarea
                v-if="actionReason === 'Other'"
                v-model="actionOther"
                rows="2"
                placeholder="Tell us more…"
                class="mt-1 w-full resize-none rounded-md border border-border bg-background p-2.5 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            <Button variant="ghost" size="sm" @click="closeActionModal">Back</Button>
            <Button :variant="actionModal.confirmVariant" size="sm" :disabled="!actionReady" @click="confirmActionModal">{{ actionModal.confirmLabel }}</Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Mark payment received -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="markPaidPayment && selectedBooking" class="fixed inset-0 z-[60] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/50" @click="closeMarkPaid" />
        <div class="relative z-10 flex w-full max-w-[440px] flex-col rounded-xl border border-border bg-background shadow-2xl">
          <div class="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <h2 class="text-base font-semibold text-foreground">Record payment</h2>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="closeMarkPaid">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>
          <div class="flex flex-col gap-4 px-6 py-5">
            <div class="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
              <div class="flex flex-col gap-0.5">
                <span class="text-sm text-foreground">{{ markPaidPayment.label }}</span>
                <span class="text-xs tabular-nums text-muted-foreground">Due {{ formatDate(markPaidPayment.dueDate) }}</span>
              </div>
              <span class="text-sm font-semibold tabular-nums text-foreground">{{ formatAmount(markPaidPayment.amount) }}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-medium text-muted-foreground">Date received</span>
              <input
                v-model="markPaidDate"
                type="date"
                :max="TODAY_ISO"
                class="h-9 w-fit rounded-md border border-border bg-background px-2 text-sm tabular-nums text-foreground outline-none transition-colors focus:border-foreground"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-medium text-muted-foreground">Payment method</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="m in paymentMethods"
                  :key="m.value"
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                  :class="markPaidMethod === m.value ? 'border-foreground bg-muted text-foreground' : 'border-border text-muted-foreground hover:border-foreground'"
                  @click="markPaidMethod = m.value"
                >
                  {{ m.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-medium text-muted-foreground">Proof of payment <span class="font-normal">(optional)</span></span>
              <label
                class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-border px-4 py-3 text-sm transition-colors hover:border-foreground"
                :class="markPaidProof ? 'text-foreground' : 'text-muted-foreground'"
              >
                <IconUpload :size="16" stroke-width="1.5" class="shrink-0" />
                <span class="truncate">{{ markPaidProof || 'Upload a receipt or bank confirmation' }}</span>
                <input type="file" class="hidden" @change="onProofChange" />
              </label>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            <Button variant="ghost" size="sm" @click="closeMarkPaid">Cancel</Button>
            <Button size="sm" :disabled="!markPaidDate" @click="confirmMarkPaid">Mark as received</Button>
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
</style>

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
  IconX,
  IconFileText,
  IconDownload,
  IconArrowRight,
  IconNote,
  IconPlus,
  IconTrash,
  IconAlertTriangle,
  IconInfoCircle,
  IconUpload,
  IconCircleCheck,
  IconCircleX,
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
const TODAY_ISO = '2026-06-09'

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'enquiry' | 'quoted' | 'awaiting_signature' | 'confirmed' | 'declined' | 'cancelled'
type SortKey = 'periodFrom' | 'periodTo' | 'company' | 'centreName' | 'rate'
type TabValue = 'action' | 'upcoming' | 'past' | 'closed'

interface BookingPayment {
  id: string
  label: string
  amount: number
  dueDate: string
  status: string
  method: string | null
  paidOn: string | null
  invoiceUrl: string | null
}
interface BookingDocument {
  type: string
  name: string
  status: string
  url: string
  signedAt?: string | null
  expiry?: string | null
}
interface BookingActivity {
  type: string
  actor: string
  actorType: string
  at: string
  description: string
}
interface ManagerApprover {
  name: string
  role: string
  decision: string | null
  at: string | null
}

interface Booking {
  id: string
  status: BookingStatus
  createdAt?: string
  approvalType?: string
  bookingLinkId?: string | null
  period: { from: string; to: string }
  landlord: { teamId: string; teamName: string; teamColor: string; organisationName?: string; country: string }
  tenant: { teamId: string | null; company: string; contactName: string; email: string; phone?: string; isSelfEmployed?: boolean }
  space: { id: string; title: string; type?: string; centreId: string; centreName: string; centreColor: string; dimensions?: string }
  enquiry?: { title: string; category: string; description: string; dimensions?: string; additionalInfo?: string | null }
  financials: { currency: string; rate: number; vat?: number; deposit?: number; discount?: number; fillitFee?: number; total?: number; totalLandlord?: number; quote?: number; paymentStatus?: string; paidBy?: string | null }
  payments?: BookingPayment[]
  documents?: BookingDocument[]
  docusign?: { status: string | null; envelopeId: string | null; sentAt: string | null; completedAt: string | null }
  managerApproval?: { required: boolean; stage: string; status: string; approvers: ManagerApprover[] } | null
  autoChanged?: string
  priceOnApplication?: boolean
  cancellation?: { by: string; reason: string; refund: string; at: string }
  decline?: { by: string; reason: string; at: string }
  actions?: BookingActivity[]
  notes?: { landlord: string | null; tenant: string | null }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const { isUserType, isPlatform, isRole } = useAppContext()
const { activeTeamId } = useTeamContext()

const isLandlord = computed(() => isUserType('landlord'))
const viewerRole = computed<'landlord' | 'tenant'>(() => (isLandlord.value ? 'landlord' : 'tenant'))

// Manager approval is a Nhood (eLeaseLoop) concept. Mirrors production's
// `can_approve_bookings?` — regional/commercial managers can approve; the
// accountant role can view but not approve. We map "accounts" → cannot approve.
const canApproveManager = computed(() => isPlatform('eleaseloop') && isLandlord.value && !isRole('accounts'))

const subtitle = computed(() =>
  isLandlord.value
    ? 'Manage enquiries and bookings across your spaces.'
    : 'Track your enquiries and bookings.',
)
const searchPlaceholder = computed(() =>
  isLandlord.value ? 'Search tenant, company or booking ID…' : 'Search centre or booking ID…',
)
const colspan = computed(() => (isLandlord.value ? 9 : 8))

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

// ─── Detail overlay ─────────────────────────────────────────────────────────────

const selectedBooking = ref<Booking | null>(null)
const detailOpen = ref(false)
const rateDraft = ref(0)
const editingSchedule = ref(false)

function openDetail(b: Booking) {
  selectedBooking.value = b
  rateDraft.value = b.financials.rate
  editingSchedule.value = false
  detailOpen.value = true
}

// Records an activity entry for an action the current viewer just took (prototype).
function pushAction(b: Booking, type: string, description: string) {
  b.actions = b.actions ?? []
  b.actions.push({ type, actor: 'You', actorType: viewerRole.value, at: TODAY.toISOString(), description })
}

// ─── Rate negotiation (landlord, on an enquiry) ────────────────────────────────
// The landlord can set a new rate and send the terms to the tenant (→ quoted),
// who then accepts (→ confirmed) or declines (→ declined). VAT/fee/totals are
// re-derived from the booking's existing ratios so the panel updates live.
function canNegotiate(b: Booking): boolean {
  return isLandlord.value && b.status === 'enquiry'
}

function deriveFinancials(b: Booking, rate: number) {
  const f = b.financials
  const vatRate = f.rate ? (f.vat ?? 0) / f.rate : 0.2
  const feeRate = f.rate ? (f.fillitFee ?? 0) / f.rate : 0.1
  const vat = Math.round(rate * vatRate)
  const fee = Math.round(rate * feeRate)
  return { rate, vat, deposit: f.deposit ?? 0, fillitFee: fee, total: rate + vat, totalLandlord: rate + vat - fee }
}

const liveFinancials = computed(() => {
  const b = selectedBooking.value
  if (!b) return { rate: 0, vat: 0, deposit: 0, fillitFee: 0, total: 0, totalLandlord: 0 }
  if (canNegotiate(b)) return deriveFinancials(b, rateDraft.value || 0)
  const f = b.financials
  return {
    rate: f.rate,
    vat: f.vat ?? 0,
    deposit: f.deposit ?? 0,
    fillitFee: f.fillitFee ?? 0,
    total: f.total ?? f.rate,
    totalLandlord: f.totalLandlord ?? f.rate,
  }
})

function sendQuote() {
  const b = selectedBooking.value
  if (!b) return
  const d = deriveFinancials(b, rateDraft.value || b.financials.rate)
  Object.assign(b.financials, { ...d, quote: d.rate })
  b.priceOnApplication = false
  b.status = 'quoted'
  pushAction(b, 'quote_sent', `Terms sent to tenant — ${formatAmount(d.rate)}`)
}

// ─── Edit payment schedule (landlord) ──────────────────────────────────────────
// Mirrors production rules: scheduled amounts must sum to the booking total
// (gross, VAT-incl), dates ascending and within the booking window. Paid rows are
// locked; unpaid rows can be edited/added/removed. Save is gated on validity.
const scheduleDraft = ref<BookingPayment[]>([])
const scheduleRowSeq = ref(0)

function startEditSchedule() {
  const b = selectedBooking.value
  if (!b?.payments) return
  scheduleDraft.value = b.payments.map(p => ({ ...p }))
  editingSchedule.value = true
}
function cancelEditSchedule() {
  editingSchedule.value = false
  scheduleDraft.value = []
}
function addScheduleRow() {
  scheduleDraft.value.push({
    id: `new-${scheduleRowSeq.value++}`,
    label: `Payment ${scheduleDraft.value.length + 1}`,
    amount: 0,
    dueDate: selectedBooking.value?.period.from ?? '',
    status: 'pending',
    method: null,
    paidOn: null,
    invoiceUrl: null,
  })
}
function removeScheduleRow(i: number) {
  scheduleDraft.value.splice(i, 1)
}

const scheduleBookingTotal = computed(() =>
  selectedBooking.value ? (selectedBooking.value.financials.total ?? selectedBooking.value.financials.rate) : 0,
)
const scheduleDraftTotal = computed(() =>
  scheduleDraft.value.reduce((s, p) => s + (Number(p.amount) || 0), 0),
)
const scheduleRemaining = computed(() =>
  Math.round((scheduleBookingTotal.value - scheduleDraftTotal.value) * 100) / 100,
)
const scheduleDatesOk = computed(() => {
  const b = selectedBooking.value
  if (!b) return false
  const dates = scheduleDraft.value.map(p => p.dueDate).filter(Boolean)
  for (let i = 1; i < dates.length; i++) if (dates[i] < dates[i - 1]) return false
  const start = b.createdAt ? b.createdAt.slice(0, 10) : null
  return dates.every(d => d <= b.period.to && (!start || d >= start))
})
const scheduleValid = computed(() =>
  scheduleDraft.value.length > 0 &&
  scheduleRemaining.value === 0 &&
  scheduleDatesOk.value &&
  scheduleDraft.value.every(p => Number(p.amount) > 0 && !!p.dueDate),
)
function saveSchedule() {
  const b = selectedBooking.value
  if (!b || !scheduleValid.value) return
  b.payments = scheduleDraft.value.map(p => ({ ...p, amount: Number(p.amount) }))
  editingSchedule.value = false
  pushAction(b, 'change_schedule', 'Payment schedule updated')
}
function closeDetail() {
  detailOpen.value = false
  editingSchedule.value = false
}

function formatCategory(c?: string | null): string {
  if (!c) return ''
  return c.replace(/_/g, ' ').replace(/^\w/, m => m.toUpperCase())
}

interface DotMeta { label: string; dotClass: string }
function paymentMeta(status: string): DotMeta {
  switch (status) {
    case 'paid':     return { label: 'Paid', dotClass: 'bg-green-500' }
    case 'pending':  return { label: 'Pending', dotClass: 'bg-blue-500' }
    case 'overdue':  return { label: 'Overdue', dotClass: 'bg-amber-500' }
    case 'failed':   return { label: 'Failed', dotClass: 'bg-red-500' }
    case 'refunded': return { label: 'Refunded', dotClass: 'bg-muted-foreground' }
    default:         return { label: formatCategory(status), dotClass: 'bg-muted-foreground' }
  }
}

// Status-driven CTAs. The primary action is the one the *current viewer* owns
// (action ownership) and is ordered last so it renders right-most in the footer.
// When the ball is with the other party there is no primary — see detailWaitingHint.
type CtaVariant = 'default' | 'outline' | 'ghost'
interface BookingCta { key: string; label: string; variant: CtaVariant; disabled?: boolean }

function detailActions(b: Booking): BookingCta[] {
  const role = viewerRole.value
  const overdue = hasOverdue(b)
  const t = temporalState(b)
  const a: BookingCta[] = []

  if (role === 'landlord') {
    switch (b.status) {
      case 'enquiry': // landlord's turn: review terms, optionally adjust the rate, send to tenant
        a.push({ key: 'message', label: 'Message tenant', variant: 'ghost' })
        a.push({ key: 'decline', label: 'Decline', variant: 'outline' })
        a.push({ key: 'sendQuote', label: 'Send to tenant', variant: 'default', disabled: (rateDraft.value || 0) <= 0 || hasBlockingConflict(b) })
        break
      case 'quoted': // waiting on tenant to accept
        a.push({ key: 'message', label: 'Message tenant', variant: 'ghost' })
        a.push({ key: 'cancel', label: 'Cancel', variant: 'ghost' })
        a.push({ key: 'edit', label: 'Edit terms', variant: 'outline' })
        a.push({ key: 'remind', label: 'Send reminder', variant: 'outline' })
        break
      case 'awaiting_signature': // waiting on tenant to sign
        a.push({ key: 'message', label: 'Message tenant', variant: 'ghost' })
        a.push({ key: 'cancel', label: 'Cancel', variant: 'ghost' })
        a.push({ key: 'viewLease', label: 'View lease', variant: 'outline' })
        a.push({ key: 'resend', label: 'Resend for signature', variant: 'outline' })
        break
      case 'confirmed':
        a.push({ key: 'message', label: 'Message tenant', variant: 'ghost' })
        a.push({ key: 'report', label: 'Report', variant: 'ghost' })
        if (t === 'upcoming' && !cancelLocked(b)) a.push({ key: 'cancel', label: 'Cancel booking', variant: 'ghost' })
        a.push({ key: 'viewDocs', label: 'View documents', variant: 'outline' })
        if (overdue) a.push({ key: 'remind', label: 'Send payment reminder', variant: 'default' })
        break
      case 'declined':
      case 'cancelled':
        a.push({ key: 'report', label: 'Report', variant: 'ghost' })
        a.push({ key: 'message', label: 'Message tenant', variant: 'outline' })
        break
    }
  } else {
    switch (b.status) {
      case 'enquiry': // waiting on the centre to review
        a.push({ key: 'message', label: 'Message', variant: 'ghost' })
        a.push({ key: 'withdraw', label: 'Withdraw enquiry', variant: 'ghost' })
        a.push({ key: 'editEnquiry', label: 'Edit enquiry', variant: 'outline' })
        break
      case 'quoted': // tenant's turn: accept or decline the quote
        a.push({ key: 'message', label: 'Message', variant: 'ghost' })
        a.push({ key: 'decline', label: 'Decline', variant: 'outline' })
        a.push({ key: 'accept', label: 'Accept quote', variant: 'default' })
        break
      case 'awaiting_signature': // tenant's turn: sign the lease
        a.push({ key: 'message', label: 'Message', variant: 'ghost' })
        a.push({ key: 'cancel', label: 'Cancel', variant: 'ghost' })
        a.push({ key: 'viewLease', label: 'View lease', variant: 'outline' })
        a.push({ key: 'sign', label: 'Sign lease', variant: 'default' })
        break
      case 'confirmed':
        a.push({ key: 'message', label: 'Message', variant: 'ghost' })
        a.push({ key: 'report', label: 'Report', variant: 'ghost' })
        if (t === 'upcoming' && !cancelLocked(b)) a.push({ key: 'cancel', label: 'Cancel booking', variant: 'ghost' })
        a.push({ key: 'viewDocs', label: 'View documents', variant: 'outline' })
        a.push({ key: 'invoice', label: 'Download invoice', variant: 'outline' })
        if (overdue) a.push({ key: 'pay', label: 'Pay now', variant: 'default' })
        break
      case 'declined':
      case 'cancelled':
        a.push({ key: 'report', label: 'Report', variant: 'ghost' })
        a.push({ key: 'message', label: 'Message', variant: 'ghost' })
        a.push({ key: 'browse', label: 'Find another space', variant: 'outline' })
        break
    }
  }
  return a
}

function detailWaitingHint(b: Booking): string {
  const role = viewerRole.value
  const owner = actionOwner(b.status)
  if (!owner || owner === role) return ''
  if (role === 'landlord') {
    if (b.status === 'quoted') return 'Waiting on the tenant to accept your terms.'
    if (b.status === 'awaiting_signature') return 'Waiting on the tenant to sign the lease.'
  } else if (b.status === 'enquiry') {
    return 'Waiting on the centre to review your enquiry.'
  }
  return ''
}

// Explains why the landlord's "Send to tenant" is blocked on an enquiry:
// a confirmed-booking date clash, or a missing/zero rate (incl. price-on-application).
function detailBlockHint(b: Booking): string {
  if (viewerRole.value !== 'landlord' || b.status !== 'enquiry') return ''
  if (hasBlockingConflict(b)) return 'These dates clash with a confirmed booking on this space. Adjust the dates before sending terms.'
  if ((rateDraft.value || 0) <= 0) return isPoa(b) ? 'Set a rate to send terms to the tenant.' : 'Enter a rate above zero to send terms.'
  return ''
}

function onCta(key: string) {
  if (key === 'message') {
    router.push('/preview/messages')
    return
  }
  const b = selectedBooking.value
  if (!b) return
  switch (key) {
    case 'sendQuote': sendQuote(); break                                              // landlord: enquiry → quoted
    case 'accept': b.status = 'confirmed'; pushAction(b, 'quote_accepted', 'Quote accepted'); break   // tenant: quoted → confirmed
    case 'sign': b.status = 'confirmed'; pushAction(b, 'lease_signed', 'Lease signed'); break          // tenant: awaiting_signature → confirmed
    case 'decline':  openActionModal('decline'); break
    case 'cancel':   openActionModal('cancel'); break
    case 'withdraw': openActionModal('withdraw'); break
    case 'report':   openActionModal('report'); break
    // viewDocs / invoice / remind / pay / resend / edit / editEnquiry / browse / viewLease → prototype stubs
  }
}

// ─── Auto-status & closed reasons ──────────────────────────────────────────────
// Production records *why* a booking changed automatically in an `autoChanged`
// flag. We surface a human label on closed bookings (list badge + overlay banner).
function autoChangedLabel(reason?: string): string {
  switch (reason) {
    case 'auto_decline':              return 'Auto-declined — no landlord response'
    case 'auto_cancel':               return 'Auto-cancelled — no response'
    case 'auto_cancel_no_card':       return 'Auto-cancelled — no card on file'
    case 'auto_cancel_card_failed':   return 'Auto-cancelled — card payment failed'
    case 'auto_declined_date_passed': return 'Auto-declined — booking dates passed'
    default:                          return 'Automatically updated'
  }
}

// Summary shown at the top of the overlay for declined/cancelled bookings.
function closedSummary(b: Booking): { title: string; detail?: string } | null {
  if (b.status !== 'declined' && b.status !== 'cancelled') return null
  if (b.autoChanged) {
    const info = b.cancellation ?? b.decline
    return { title: autoChangedLabel(b.autoChanged), detail: info?.reason }
  }
  const info = b.status === 'declined' ? b.decline : b.cancellation
  const verb = b.status === 'declined' ? 'Declined' : 'Cancelled'
  const who = info?.by === 'landlord' ? 'the centre' : info?.by === 'tenant' ? 'the tenant' : info?.by === 'system' ? 'the system' : null
  return { title: who ? `${verb} by ${who}` : verb, detail: info?.reason }
}

function refundLine(b: Booking): string {
  if (b.status !== 'cancelled' || !b.cancellation) return ''
  switch (b.cancellation.refund) {
    case 'none': return 'No refund issued.'
    case 'full': return 'Full refund issued.'
    case 'n/a':  return ''
    default:     return b.cancellation.refund ? `Refund: ${b.cancellation.refund}` : ''
  }
}

// ─── Double-booking conflicts ──────────────────────────────────────────────────
// Mirrors production's BookingConflictsService: other live bookings on the SAME
// space whose dates overlap. A *blocking* conflict is an overlap with a confirmed
// booking — you can't quote or confirm a space that's already taken for those dates.
function periodsOverlap(a: { from: string; to: string }, b: { from: string; to: string }): boolean {
  return a.from <= b.to && a.to >= b.from
}
function conflictsFor(b: Booking): Booking[] {
  return bookings.value.filter(o =>
    o.id !== b.id &&
    o.space.id === b.space.id &&
    o.status !== 'declined' && o.status !== 'cancelled' &&
    periodsOverlap(b.period, o.period),
  )
}
function blockingConflictsFor(b: Booking): Booking[] {
  return conflictsFor(b).filter(o => o.status === 'confirmed')
}
// Landlord-only: a confirmed-booking overlap that should block quoting/confirming.
function hasBlockingConflict(b: Booking): boolean {
  return isLandlord.value && blockingConflictsFor(b).length > 0
}

// ─── Price on application ───────────────────────────────────────────────────────
// A POA enquiry has no set price; the landlord must quote a rate before it can
// proceed. Mirrors production's listing.price_on_application / "A consultar".
function isPoa(b: Booking): boolean {
  return !!b.priceOnApplication && (b.financials.rate ?? 0) <= 0
}
function rateDisplay(b: Booking): string {
  return isPoa(b) ? 'POA' : formatAmount(b.financials.rate)
}

// ─── Cancellation: refund window + post-signature lock ──────────────────────────
// Forward-looking policy shown before cancelling a confirmed booking: a full
// refund applies up to 14 days before the start date, none after.
function refundWindow(b: Booking) {
  const from = new Date(b.period.from + 'T00:00:00Z')
  const cutoff = new Date(from)
  cutoff.setUTCDate(cutoff.getUTCDate() - 14)
  const beforeCutoff = TODAY < cutoff
  const total = b.financials.total ?? b.financials.rate
  return { beforeCutoff, amount: beforeCutoff ? total : 0, cutoffIso: cutoff.toISOString() }
}

// eLeaseLoop (Nhood) locks cancellation once the lease is signed — changes must
// go through the centre. Surfaced as a footer hint instead of a Cancel button.
function cancelLocked(b: Booking): boolean {
  return isPlatform('eleaseloop') && b.status === 'confirmed' && b.docusign?.status === 'completed'
}

// ─── Action modal (cancel / withdraw / decline / report) ───────────────────────
// One reusable confirm modal that collects a reason before a terminal transition.
type ActionKind = 'cancel' | 'withdraw' | 'decline' | 'report' | 'rejectApproval'
interface ActionModalConfig {
  kind: ActionKind
  title: string
  description: string
  reasonLabel: string
  reasons: string[]
  confirmLabel: string
  confirmVariant: 'default' | 'destructive'
  showRefund?: boolean
}

const actionModal = ref<ActionModalConfig | null>(null)
const actionReason = ref('')
const actionOther = ref('')

const actionReady = computed(() => {
  if (!actionModal.value || !actionReason.value) return false
  if (actionReason.value === 'Other' && !actionOther.value.trim()) return false
  return true
})

function openActionModal(kind: ActionKind) {
  const b = selectedBooking.value
  if (!b) return
  const role = viewerRole.value
  let cfg: ActionModalConfig
  if (kind === 'cancel') {
    cfg = {
      kind,
      title: 'Cancel booking',
      description: "Let the other party know why you're cancelling. This can't be undone.",
      reasonLabel: 'Reason for cancelling',
      reasons: role === 'landlord'
        ? ['Double-booked', 'Circumstances out of our control', 'Emergency closure', 'Other']
        : ['No longer needed', 'Need a larger space', 'Double-booked', 'Other'],
      confirmLabel: 'Cancel booking',
      confirmVariant: 'destructive',
      showRefund: b.status === 'confirmed',
    }
  } else if (kind === 'withdraw') {
    cfg = {
      kind,
      title: 'Withdraw enquiry',
      description: 'Withdraw this enquiry from the centre.',
      reasonLabel: 'Reason',
      reasons: ['No longer needed', 'Found another space', 'Changed my mind', 'Other'],
      confirmLabel: 'Withdraw enquiry',
      confirmVariant: 'destructive',
    }
  } else if (kind === 'decline') {
    cfg = {
      kind,
      title: role === 'landlord' ? 'Decline enquiry' : 'Decline quote',
      description: role === 'landlord'
        ? "Let the tenant know why you can't take this booking."
        : "Let the centre know why you're declining.",
      reasonLabel: 'Reason for declining',
      reasons: role === 'landlord'
        ? ['Space no longer available', 'Product category not permitted', 'Dates unavailable', 'Other']
        : ['Rate too high', 'No longer needed', 'Found another space', 'Other'],
      confirmLabel: 'Decline',
      confirmVariant: 'destructive',
    }
  } else if (kind === 'rejectApproval') {
    cfg = {
      kind,
      title: 'Reject approval',
      description: "Let the team know why this booking can't be approved.",
      reasonLabel: 'Reason for rejecting',
      reasons: ['Pricing not approved', 'Terms need revision', 'Space allocation issue', 'Other'],
      confirmLabel: 'Reject',
      confirmVariant: 'destructive',
    }
  } else {
    cfg = {
      kind,
      title: 'Report a problem',
      description: 'Flag an issue with this booking to the Fillit team.',
      reasonLabel: "What's the problem?",
      reasons: ['Payment issue', 'Dispute with the other party', 'Space condition', 'Other'],
      confirmLabel: 'Submit report',
      confirmVariant: 'default',
    }
  }
  actionReason.value = ''
  actionOther.value = ''
  actionModal.value = cfg
}

function closeActionModal() {
  actionModal.value = null
}

function confirmActionModal() {
  const b = selectedBooking.value
  const cfg = actionModal.value
  if (!b || !cfg || !actionReady.value) return
  const reason = actionReason.value === 'Other' ? actionOther.value.trim() : actionReason.value
  const role = viewerRole.value
  const at = TODAY.toISOString()
  switch (cfg.kind) {
    case 'cancel': {
      const rw = b.status === 'confirmed' ? refundWindow(b) : null
      b.status = 'cancelled'
      b.cancellation = { by: role, reason, refund: rw ? (rw.beforeCutoff ? 'full' : 'none') : 'n/a', at }
      pushAction(b, 'cancelled', `Booking cancelled — ${reason}`)
      break
    }
    case 'withdraw':
      b.status = 'cancelled'
      b.cancellation = { by: role, reason, refund: 'n/a', at }
      pushAction(b, 'withdrawn', `Enquiry withdrawn — ${reason}`)
      break
    case 'decline':
      b.status = 'declined'
      b.decline = { by: role, reason, at }
      pushAction(b, 'declined', `Declined — ${reason}`)
      break
    case 'report':
      pushAction(b, 'reported', `Reported to support — ${reason}`)
      break
    case 'rejectApproval':
      rejectManagerStep(b, reason)
      break
  }
  actionModal.value = null
  if (cfg.kind !== 'report' && cfg.kind !== 'rejectApproval') closeDetail()
}

// ─── Mark payment received (landlord, "paid to centre") ────────────────────────
// Records an offline payment against a scheduled instalment + optional proof.
const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card',          label: 'Card' },
  { value: 'direct_debit',  label: 'Direct debit' },
  { value: 'sepa',          label: 'SEPA credit transfer' },
  { value: 'cash',          label: 'Cash' },
]
const markPaidPayment = ref<BookingPayment | null>(null)
const markPaidDate = ref('')
const markPaidMethod = ref('bank_transfer')
const markPaidProof = ref('')

function openMarkPaid(p: BookingPayment) {
  markPaidPayment.value = p
  markPaidDate.value = TODAY.toISOString().slice(0, 10)
  markPaidMethod.value = p.method ?? 'bank_transfer'
  markPaidProof.value = ''
}
function closeMarkPaid() {
  markPaidPayment.value = null
}
function onProofChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  markPaidProof.value = file ? file.name : ''
}
function recomputePaymentStatus(b: Booking) {
  const ps = b.payments ?? []
  if (ps.length && ps.every(p => p.status === 'paid')) b.financials.paymentStatus = 'paid'
  else if (ps.some(p => p.status === 'overdue')) b.financials.paymentStatus = 'overdue'
  else b.financials.paymentStatus = 'pending'
}
function confirmMarkPaid() {
  const b = selectedBooking.value
  const p = markPaidPayment.value
  if (!b || !p) return
  const row = (b.payments ?? []).find(x => x.id === p.id)
  if (row) {
    row.status = 'paid'
    row.paidOn = markPaidDate.value
    row.method = markPaidMethod.value
  }
  recomputePaymentStatus(b)
  pushAction(b, 'mark_paid', `Marked ${p.label} as received (${formatAmount(p.amount)})`)
  closeMarkPaid()
}

// ─── Manager approval actions (Nhood) ──────────────────────────────────────────
// The read-only approval chain becomes actionable for an approver. Approving the
// asset-manager step escalates to a senior approver (2-stage, mirrors production's
// ManagerApproval); approving the final step completes it. Rejecting ends the chain.
function pendingApprover(b: Booking): ManagerApprover | null {
  const ma = b.managerApproval
  if (!ma || ma.status === 'approved' || ma.status === 'rejected') return null
  return ma.approvers.find(a => !a.decision) ?? null
}
function canActOnApproval(b: Booking): boolean {
  return canApproveManager.value && !!pendingApprover(b)
}
function managerDecisionMeta(ap: ManagerApprover): DotMeta {
  if (ap.decision === 'approved') return { label: ap.at ? `Approved · ${formatDate(ap.at)}` : 'Approved', dotClass: 'bg-green-500' }
  if (ap.decision === 'not_approved') return { label: ap.at ? `Not approved · ${formatDate(ap.at)}` : 'Not approved', dotClass: 'bg-red-500' }
  return { label: 'Awaiting review', dotClass: 'bg-muted-foreground' }
}
function approveManagerStep(b: Booking) {
  const ma = b.managerApproval
  if (!ma) return
  const ap = ma.approvers.find(a => !a.decision)
  if (!ap) return
  ap.decision = 'approved'
  ap.at = TODAY.toISOString()
  const hasSenior = ma.approvers.some(a => a.role === 'senior_asset_manager')
  if (ap.role === 'asset_manager' && !hasSenior) {
    ma.approvers.push({ name: 'Carlos Vidal', role: 'senior_asset_manager', decision: null, at: null })
    ma.stage = 'senior_review'
    ma.status = 'pending'
    pushAction(b, 'manager_approved', 'Approved by asset manager — escalated to senior approval')
  } else if (ma.approvers.every(a => a.decision === 'approved')) {
    ma.status = 'approved'
    ma.stage = 'approved'
    pushAction(b, 'manager_approved', 'Manager approval complete')
  } else {
    pushAction(b, 'manager_approved', `Approved by ${formatCategory(ap.role)}`)
  }
}
function rejectManagerStep(b: Booking, reason: string) {
  const ma = b.managerApproval
  if (!ma) return
  const ap = ma.approvers.find(a => !a.decision)
  if (ap) { ap.decision = 'not_approved'; ap.at = TODAY.toISOString() }
  ma.status = 'rejected'
  ma.stage = 'rejected'
  pushAction(b, 'manager_rejected', `Manager approval rejected — ${reason}`)
}

// Switching team or viewer role (via the dev switcher) scopes out the current
// booking — close any open overlay/modal so they can't show stale data.
watch([activeTeamId, viewerRole], () => {
  closeDetail()
  actionModal.value = null
  markPaidPayment.value = null
})

// ─── Transactions summary ────────────────────────────────────────────────────

function viewTransactions(b: Booking) {
  router.push({ path: '/preview/transactions', query: { q: b.id } })
}

function paymentSummary(b: Booking) {
  const total = b.financials.total ?? b.financials.rate
  const collected = (b.payments ?? [])
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0)
  return { collected, outstanding: Math.max(0, total - collected) }
}

// ─── Notes (per viewer role) ──────────────────────────────────────────────────
// Landlord and tenant each keep their own note; the table icon fills yellow when
// the current viewer has added one. Edits auto-save to the local booking.
function noteText(b: Booking): string {
  return b.notes?.[viewerRole.value] ?? ''
}
function hasNote(b: Booking): boolean {
  return !!noteText(b).trim()
}
function setNote(b: Booking, value: string) {
  if (!b.notes) b.notes = { landlord: null, tenant: null }
  b.notes[viewerRole.value] = value.trim() ? value : null
}

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
