<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-payments" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <!-- eLeaseLoop only -->
      <div v-if="isPlatform('eleaseloop')" class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Payouts</h1>
              <p class="text-base text-muted-foreground">Manage payout accounts and control which centres and spaces each account pays out to.</p>
            </div>
            <TooltipProvider :delay-duration="300">
              <Tooltip>
                <TooltipTrigger as-child>
                  <span :class="!can('edit:payouts') ? 'cursor-not-allowed' : ''">
                    <Button variant="outline" size="sm" class="shrink-0 disabled:pointer-events-none" :disabled="!can('edit:payouts')" @click="openAddDialog">Add account</Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent v-if="!can('edit:payouts')" side="bottom">
                  <p class="text-xs">This action can only be taken by admins</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <!-- Accounts list -->
          <div class="flex flex-col gap-4">
            <div
              v-for="account in countryAccounts"
              :key="account.id"
              class="flex flex-col rounded-lg border border-border"
            >
              <!-- Account row -->
              <div class="flex items-center gap-4 px-5 py-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <IconBrandStripe v-if="account.type === 'stripe'" :size="20" stroke-width="1.5" />
                  <IconBuildingBank v-else :size="20" stroke-width="1.5" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-foreground">{{ account.title || account.companyName }}</p>
                  <p class="mt-0.5 text-xs text-muted-foreground">{{ account.companyName }}{{ account.companyType ? ` · ${account.companyType}` : '' }}</p>
                  <p class="mt-0.5 text-xs text-muted-foreground">{{ account.signatoryFirstName }} {{ account.signatoryLastName }}, {{ account.signatoryRole }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">
                    <template v-if="account.type === 'stripe'">Stripe Connect · •••• {{ account.last4 }} · {{ account.currency }}</template>
                    <template v-else>{{ maskedIban(account.iban!) }} · {{ account.bic }} · {{ account.currency }}</template>
                  </p>
                </div>

                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="account.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'"
                >
                  {{ account.status === 'active' ? 'Active' : 'Pending verification' }}
                </span>

                <div class="flex shrink-0 items-center gap-1">
                  <TooltipProvider :delay-duration="300">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="!can('edit:payouts') ? 'cursor-not-allowed' : ''">
                          <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('edit:payouts')" @click="openManageSpaces(account)">Manage spaces</Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent v-if="!can('edit:payouts')" side="top">
                        <p class="text-xs">This action can only be taken by admins</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider :delay-duration="300">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="!can('edit:payouts') ? 'cursor-not-allowed' : ''">
                          <Button variant="ghost" size="sm" class="text-muted-foreground disabled:pointer-events-none" :disabled="!can('edit:payouts')" @click="openEditDialog(account)">Edit</Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent v-if="!can('edit:payouts')" side="top">
                        <p class="text-xs">This action can only be taken by admins</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider :delay-duration="300">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="!can('edit:payouts') ? 'cursor-not-allowed' : ''">
                          <Button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none" :disabled="!can('edit:payouts')" @click="openRemoveDialog(account)">Remove</Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent v-if="!can('edit:payouts')" side="top">
                        <p class="text-xs">This action can only be taken by admins</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <!-- Centre/space tree -->
              <div class="border-t border-border px-5 py-3">
                <div class="ml-14 flex flex-col gap-2">
                  <div
                    v-for="centre in account.centres"
                    :key="centre.name"
                    class="border-l border-border pl-4"
                  >
                    <p class="text-xs font-medium text-muted-foreground">{{ centre.name }}</p>
                    <div class="mt-1 flex flex-wrap gap-1.5">
                      <span
                        v-for="space in centre.spaces"
                        :key="space"
                        class="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border"
                      >
                        {{ space }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Fillit platform — not available -->
      <div v-else class="flex flex-1 items-center justify-center px-8 py-24">
        <div class="flex max-w-sm flex-col items-center gap-4 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconBuildingBank :size="26" stroke-width="1.5" />
          </div>
          <div>
            <p class="text-base font-semibold text-foreground">Payouts not available</p>
            <p class="mt-1.5 text-sm text-muted-foreground">Payout account management is only available on eLeaseLoop. Switch platforms using the DevSwitcher to preview this page.</p>
          </div>
        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- Add / Edit account dialog -->
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="flex max-h-[90vh] flex-col sm:max-w-[600px]">
      <DialogHeader class="shrink-0">
        <DialogTitle>{{ isEditMode ? 'Edit payout account' : 'Add payout account' }}</DialogTitle>
        <DialogDescription>
          {{ isEditMode ? 'Update the company, banking, and signatory details for this account.' : 'Enter company, banking, and signatory details for the new account.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-1 flex-col gap-8 overflow-y-auto py-4" @submit.prevent="handleSave">

        <!-- Account -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-foreground">Account</h3>
          <FloatingLabelInput :required="true" v-model="form.title" label="Account title" />
        </div>

        <!-- Company details -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-foreground">Company details</h3>
          <FloatingLabelInput :required="true" v-model="form.companyName" label="Company name" />
          <div class="grid grid-cols-2 gap-4">
            <FloatingLabelInput :required="true" v-model="form.companyType" :label="companyTypeLabel" />
            <FloatingLabelInput :required="true" v-model="form.vatNumber" :label="vatLabel" />
          </div>

          <!-- Spain: NIF + CNAE -->
          <template v-if="activeCountry === 'es'">
            <div class="grid grid-cols-2 gap-4">
              <FloatingLabelInput :required="true" v-model="form.nif" label="NIF" />
              <FloatingLabelInput :required="true" v-model="form.cnae" label="CNAE code" />
            </div>
          </template>

          <!-- France: SIREN -->
          <template v-if="activeCountry === 'fr'">
            <FloatingLabelInput :required="true" v-model="form.siren" label="SIREN number" />
          </template>

          <!-- Italy: Tax ID + share capital + register cities -->
          <template v-if="activeCountry === 'it'">
            <div class="grid grid-cols-2 gap-4">
              <FloatingLabelInput :required="true" v-model="form.nif" label="Tax ID (Codice Fiscale)" />
              <FloatingLabelInput :required="true" v-model="form.shareCapital" label="Share capital (Capitale sociale)" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <FloatingLabelInput :required="true" v-model="form.commercialRegisterCity" label="Registro delle Imprese city" />
              <FloatingLabelInput :required="true" v-model="form.commercialChamberCity" label="Camera di Commercio city" />
            </div>
          </template>

          <FloatingLabelInput :required="true" v-model="form.address" label="Company address" />
          <div class="grid grid-cols-2 gap-4">
            <FloatingLabelInput :required="true" v-model="form.city" label="City" />
            <FloatingLabelInput :required="true" v-model="form.postcode" label="Postcode" />
          </div>
        </div>

        <!-- Banking -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-foreground">Banking</h3>

          <div class="flex rounded-lg border border-border p-1">
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              :class="form.bankingType === 'stripe' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'"
              @click="form.bankingType = 'stripe'"
            >
              <IconBrandStripe :size="16" stroke-width="1.5" />
              Stripe Connect
            </button>
            <button
              type="button"
              class="flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              :class="form.bankingType === 'bank' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'"
              @click="form.bankingType = 'bank'"
            >
              <IconBuildingBank :size="16" stroke-width="1.5" />
              Bank transfer
            </button>
          </div>

          <template v-if="form.bankingType === 'stripe'">
            <FloatingLabelInput :required="true" v-model="form.stripeAccountId" label="Stripe account ID" />
          </template>
          <template v-else>
            <FloatingLabelInput :required="true" v-model="form.bankName" label="Bank name" />
            <FloatingLabelInput :required="true" v-model="form.bankAddress" label="Bank address" />
            <FloatingLabelInput :required="true" v-model="form.iban" label="IBAN" />
            <FloatingLabelInput :required="true" v-model="form.bic" label="BIC / SWIFT" />
          </template>

          <!-- France: mandate details -->
          <template v-if="activeCountry === 'fr'">
            <div class="grid grid-cols-2 gap-4">
              <FloatingLabelInput :required="true" v-model="form.mandateType" label="Mandate type" />
              <FloatingLabelInput :required="true" v-model="form.mandateDate" label="Mandate date" type="date" />
            </div>
          </template>
        </div>

        <!-- Signatory -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-foreground">Signatory</h3>
          <div class="grid grid-cols-2 gap-4">
            <FloatingLabelInput :required="true" v-model="form.firstName" label="First name" />
            <FloatingLabelInput :required="true" v-model="form.lastName" label="Last name" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <FloatingLabelInput :required="true" v-model="form.signatoryRole" label="Role / Title" />
            <!-- Spain: DNI -->
            <FloatingLabelInput v-if="activeCountry === 'es'" :required="true" v-model="form.dni" label="DNI" />
          </div>
          <FloatingLabelInput :required="true" v-model="form.lrAddress" label="Legal representative address" />
          <FloatingLabelInput :required="true" v-model="form.lrZipCode" label="Legal representative postcode" />
        </div>

      </form>

      <DialogFooter class="shrink-0 gap-2">
        <Button variant="ghost" size="sm" @click="dialogOpen = false">Cancel</Button>
        <Button size="sm" @click="handleSave">{{ isEditMode ? 'Save changes' : 'Save account' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Remove account dialog -->
  <Dialog v-model:open="removeDialogOpen" @update:open="val => { if (!val) deleteConfirmText = '' }">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Remove payout account</DialogTitle>
        <DialogDescription>
          You are about to remove <strong class="text-foreground font-medium">{{ removingAccount?.title || removingAccount?.companyName }}</strong>. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div class="py-2">
        <div class="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p class="text-sm text-foreground">
            Type <strong>DELETE</strong> to permanently remove this account and all its data.
          </p>
          <div class="flex items-center gap-2">
            <input
              v-model="deleteConfirmText"
              type="text"
              placeholder="DELETE"
              class="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-destructive focus:outline-none"
            />
            <Button
              variant="destructive"
              size="sm"
              class="shrink-0"
              :disabled="deleteConfirmText !== 'DELETE'"
              @click="confirmRemoveAccount"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" @click="removeDialogOpen = false">Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Assign unassigned spaces dialog — non-dismissable until all spaces are assigned -->
  <Dialog :open="assignUnassignedOpen" @update:open="() => {}">
    <DialogContent class="flex max-h-[80vh] flex-col sm:max-w-[560px]" :hide-close="true">
      <DialogHeader class="shrink-0">
        <DialogTitle>Assign unassigned spaces</DialogTitle>
        <DialogDescription>
          {{ pendingUnassignedSpaces.length }} space{{ pendingUnassignedSpaces.length === 1 ? '' : 's' }} no longer have an account assigned. All spaces must be assigned before you can continue.
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto px-px py-2">
        <div class="flex flex-col gap-6">
          <div
            v-for="{ centreName, spaces } in unassignedGroupedByCentre"
            :key="centreName"
            class="flex flex-col gap-2"
          >
            <p class="text-sm font-semibold text-foreground">{{ centreName }}</p>
            <div
              v-for="spaceName in spaces"
              :key="spaceName"
              class="flex items-center gap-4 border-l border-border pl-4 py-1"
            >
              <span class="min-w-0 flex-1 text-sm text-foreground">{{ spaceName }}</span>
              <Select v-model="unassignedAssignments[spaceKey(centreName, spaceName)]">
                <SelectTrigger class="h-9 w-[200px] shrink-0 text-sm">
                  <SelectValue placeholder="Select account…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="acct in countryAccounts"
                    :key="acct.id"
                    :value="acct.id"
                  >
                    {{ acct.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="shrink-0 border-t border-border pt-4">
        <Button size="sm" :disabled="!allUnassignedAssigned" @click="confirmAssignUnassigned">Confirm assignments</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Manage spaces dialog -->
  <Dialog v-model:open="manageSpacesOpen">
    <DialogContent class="flex max-h-[80vh] flex-col sm:max-w-[560px]">
      <DialogHeader class="shrink-0">
        <DialogTitle>Manage spaces</DialogTitle>
        <DialogDescription>
          Assign spaces to <strong class="font-medium text-foreground">{{ manageSpacesAccount?.title }}</strong>. Each space can only be linked to one account at a time.
        </DialogDescription>
      </DialogHeader>

      <!-- Search -->
      <div class="shrink-0 border-b border-border px-1 pb-3 pt-1">
        <div class="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-foreground/30 transition-colors">
          <IconSearch :size="14" stroke-width="1.75" class="shrink-0 text-muted-foreground" />
          <input
            v-model="centreSearch"
            type="text"
            placeholder="Search centres…"
            class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <!-- No results -->
        <p v-if="filteredMasterSpaces.length === 0" class="py-10 text-center text-sm text-muted-foreground">
          No centres match "{{ centreSearch }}"
        </p>

        <div v-else class="flex flex-col divide-y divide-border">
          <div v-for="centre in filteredMasterSpaces" :key="centre.centreName" class="flex flex-col py-4">

            <!-- Centre header -->
            <div class="flex items-center gap-2">
              <!-- Select-all / deselect-all -->
              <button
                type="button"
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors"
                :class="isCentreFullyAssigned(centre)
                  ? 'border-foreground bg-foreground text-background'
                  : isCentrePartiallyAssigned(centre)
                    ? 'border-foreground/50 bg-background'
                    : 'border-border bg-background hover:border-foreground/40'"
                @click="toggleCentre(centre.centreName, centre.spaces)"
              >
                <IconCheck v-if="isCentreFullyAssigned(centre)" :size="10" stroke-width="3" />
                <IconMinus v-else-if="isCentrePartiallyAssigned(centre)" :size="10" stroke-width="2.5" class="text-foreground" />
              </button>

              <!-- Centre name — click to collapse/expand -->
              <button
                type="button"
                class="flex flex-1 items-center gap-2 text-left"
                @click="toggleCentreCollapse(centre.centreName)"
              >
                <span class="flex-1 text-sm font-semibold text-foreground">{{ centre.centreName }}</span>
                <span class="text-xs text-muted-foreground">
                  {{ assignedCountForCentre(centre) }} / {{ centre.spaces.length }}
                </span>
                <IconChevronDown
                  :size="14"
                  stroke-width="2"
                  class="shrink-0 text-muted-foreground transition-transform duration-200"
                  :class="collapsedCentres.has(centre.centreName) ? '-rotate-90' : ''"
                />
              </button>
            </div>

            <!-- Space rows -->
            <div
              v-if="!collapsedCentres.has(centre.centreName)"
              class="ml-[26px] mt-3 flex flex-col gap-2.5 border-l border-border pl-4"
            >
              <div
                v-for="space in centre.spaces"
                :key="space"
                class="flex items-center gap-2.5"
              >
                <button
                  type="button"
                  class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors"
                  :class="isSpaceAssigned(centre.centreName, space)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background hover:border-foreground/40'"
                  @click="toggleSpace(centre.centreName, space)"
                >
                  <IconCheck v-if="isSpaceAssigned(centre.centreName, space)" :size="10" stroke-width="3" />
                </button>
                <span
                  class="flex-1 cursor-pointer select-none text-sm text-foreground"
                  @click="toggleSpace(centre.centreName, space)"
                >{{ space }}</span>
                <span
                  v-if="getOtherAccountTitle(centre.centreName, space)"
                  class="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border"
                >
                  {{ getOtherAccountTitle(centre.centreName, space) }}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <DialogFooter class="shrink-0 border-t border-border pt-4">
        <Button variant="ghost" size="sm" @click="manageSpacesOpen = false">Cancel</Button>
        <Button size="sm" @click="saveManageSpaces">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  IconBuildingBank,
  IconBrandStripe,
  IconChevronDown,
  IconSearch,
  IconCheck,
  IconMinus,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import AppSidebar from '@/components/app-sidebar.vue'
import { useTeamContext } from '@/composables/useTeamContext'
import RightPanel from '@/components/right-panel.vue'
import { useAppContext } from '@/composables/useAppContext'
import { usePayoutAccounts } from '@/composables/usePayoutAccounts'
import type { PayoutAccount, PayoutCentre } from '@/composables/usePayoutAccounts'

const { activeCountry } = useTeamContext()
const { can, isPlatform } = useAppContext()

const { allAccounts, masterSpaces } = usePayoutAccounts()

// ─── API data for dynamic master spaces ──────────────────────────────────────

interface ApiSpace  { id: string; centreId: string; name: string }
interface ApiCentre { id: string; name: string }
interface ApiTeam   { id: string; country?: string; centres?: { id: string; name: string }[] }

const apiSpaces  = ref<ApiSpace[]>([])
const apiCentres = ref<ApiCentre[]>([])
const apiTeams   = ref<ApiTeam[]>([])

onMounted(async () => {
  const [spacesData, centresData, teamsData] = await Promise.all([
    $fetch<{ spaces: ApiSpace[] }>('/api/spaces'),
    $fetch<{ centres: ApiCentre[] }>('/api/centres'),
    $fetch<{ teams: ApiTeam[] }>('/api/teams'),
  ])
  apiSpaces.value  = spacesData.spaces
  apiCentres.value = centresData.centres
  apiTeams.value   = teamsData.teams
})

const countryAccounts = computed(() =>
  allAccounts.value.filter(a => a.country === activeCountry.value)
)

// ─── Country-aware form labels ────────────────────────────────────────────────

const vatLabel = computed(() => {
  if (activeCountry.value === 'it') return 'Partita IVA'
  return 'VAT number'
})

const companyTypeLabel = computed(() => {
  if (activeCountry.value === 'it') return 'Forma giuridica'
  if (activeCountry.value === 'fr') return 'Forme juridique'
  if (activeCountry.value === 'es') return 'Forma jurídica'
  return 'Company type'
})

// ─── Dialog / Form ────────────────────────────────────────────────────────────

const dialogOpen = ref(false)
const editingAccountId = ref<string | null>(null)
const isEditMode = computed(() => editingAccountId.value !== null)

const emptyForm = () => ({
  title: '',
  companyName: '',
  companyType: '',
  vatNumber: '',
  nif: '',
  shareCapital: '',
  commercialRegisterCity: '',
  commercialChamberCity: '',
  cnae: '',
  siren: '',
  address: '',
  city: '',
  postcode: '',
  bankingType: 'bank' as 'stripe' | 'bank',
  stripeAccountId: '',
  bankName: '',
  bankAddress: '',
  iban: '',
  bic: '',
  mandateType: '',
  mandateDate: '',
  firstName: '',
  lastName: '',
  signatoryRole: '',
  dni: '',
  lrAddress: '',
  lrZipCode: '',
})

const form = reactive(emptyForm())

function openAddDialog() {
  editingAccountId.value = null
  Object.assign(form, emptyForm())
  dialogOpen.value = true
}

function openEditDialog(account: PayoutAccount) {
  editingAccountId.value = account.id
  Object.assign(form, {
    title:                  account.title,
    companyName:            account.companyName,
    companyType:            account.companyType,
    vatNumber:              account.vatNumber,
    nif:                    account.nif ?? '',
    shareCapital:           account.shareCapital ?? '',
    commercialRegisterCity: account.commercialRegisterCity ?? '',
    commercialChamberCity:  account.commercialChamberCity ?? '',
    cnae:                   account.cnae ?? '',
    siren:                  account.siren ?? '',
    address:                account.address,
    city:                   account.city,
    postcode:               account.postcode,
    bankingType:            account.type,
    stripeAccountId:        account.stripeAccountId ?? '',
    bankName:               account.bankName ?? '',
    bankAddress:            account.bankAddress ?? '',
    iban:                   account.iban ?? '',
    bic:                    account.bic ?? '',
    mandateType:            account.mandateType ?? '',
    mandateDate:            account.mandateDate ?? '',
    firstName:              account.signatoryFirstName,
    lastName:               account.signatoryLastName,
    signatoryRole:          account.signatoryRole,
    dni:                    account.dni ?? '',
    lrAddress:              account.lrAddress,
    lrZipCode:              account.lrZipCode,
  })
  dialogOpen.value = true
}

function handleSave() {
  if (isEditMode.value) {
    const idx = allAccounts.value.findIndex(a => a.id === editingAccountId.value)
    if (idx !== -1) {
      allAccounts.value[idx] = {
        ...allAccounts.value[idx],
        title:                  form.title,
        companyName:            form.companyName,
        companyType:            form.companyType,
        vatNumber:              form.vatNumber,
        nif:                    form.nif || undefined,
        shareCapital:           form.shareCapital || undefined,
        commercialRegisterCity: form.commercialRegisterCity || undefined,
        commercialChamberCity:  form.commercialChamberCity || undefined,
        cnae:                   form.cnae || undefined,
        siren:                  form.siren || undefined,
        address:                form.address,
        city:                   form.city,
        postcode:               form.postcode,
        type:                   form.bankingType,
        stripeAccountId:        form.stripeAccountId || undefined,
        bankName:               form.bankName || undefined,
        bankAddress:            form.bankAddress || undefined,
        iban:                   form.iban || undefined,
        bic:                    form.bic || undefined,
        mandateType:            form.mandateType || undefined,
        mandateDate:            form.mandateDate || undefined,
        signatoryFirstName:     form.firstName,
        signatoryLastName:      form.lastName,
        signatoryRole:          form.signatoryRole,
        dni:                    form.dni || undefined,
        lrAddress:              form.lrAddress,
        lrZipCode:              form.lrZipCode,
      }
    }
  }
  dialogOpen.value = false
}

// ─── Master spaces — source of truth per country ─────────────────────────────
// Includes all spaces, both assigned and unassigned, so the manage dialog
// always shows the complete picture regardless of account assignments.

// ─── Manage spaces ────────────────────────────────────────────────────────────

const manageSpacesOpen = ref(false)
const manageSpacesAccountId = ref<string | null>(null)
const centreSearch = ref('')
const collapsedCentres = ref<Set<string>>(new Set())

// Working set of space keys assigned to the account being managed.
// Keys are `centreName::spaceName`. Mutated via toggleSpace / toggleCentre.
const draftSpaces = ref<Set<string>>(new Set())

const manageSpacesAccount = computed(() =>
  allAccounts.value.find(a => a.id === manageSpacesAccountId.value) ?? null
)

// Derived from live API data so it always reflects the spaces JSON.
// In-session additions (e.g. a space just created on the Spaces page without
// a full reload) are merged from the composable's supplementary ref.
const masterSpacesForCountry = computed(() => {
  const country = activeCountry.value

  // Collect centre IDs for this country's teams
  const centreIds = new Set<string>()
  for (const team of apiTeams.value) {
    if (team.country === country) {
      for (const c of (team.centres ?? [])) centreIds.add(c.id)
    }
  }

  // Build centreName → spaces[] map from API data
  const centreMap: Record<string, string[]> = {}
  for (const centreId of centreIds) {
    const centre = apiCentres.value.find(c => c.id === centreId)
    if (!centre) continue
    centreMap[centre.name] = apiSpaces.value
      .filter(s => s.centreId === centreId)
      .map(s => s.name)
  }

  // Merge in-session additions (new spaces created without a page reload)
  for (const { centreName, spaces } of (masterSpaces.value[country] ?? [])) {
    if (!centreMap[centreName]) centreMap[centreName] = []
    for (const s of spaces) {
      if (!centreMap[centreName].includes(s)) centreMap[centreName].push(s)
    }
  }

  return Object.entries(centreMap).map(([centreName, spaces]) => ({ centreName, spaces }))
})

const filteredMasterSpaces = computed(() => {
  const q = centreSearch.value.trim().toLowerCase()
  if (!q) return masterSpacesForCountry.value
  return masterSpacesForCountry.value.filter(c =>
    c.centreName.toLowerCase().includes(q)
  )
})

function toggleCentreCollapse(centreName: string): void {
  const next = new Set(collapsedCentres.value)
  if (next.has(centreName)) next.delete(centreName)
  else next.add(centreName)
  collapsedCentres.value = next
}

function spaceKey(centreName: string, spaceName: string): string {
  return `${centreName}::${spaceName}`
}

function isSpaceAssigned(centreName: string, spaceName: string): boolean {
  return draftSpaces.value.has(spaceKey(centreName, spaceName))
}

// Returns the title of whichever *other* account currently holds this space
// (based on saved data, not the draft). Returns null if unassigned or if it
// belongs to the account being managed.
function getOtherAccountTitle(centreName: string, spaceName: string): string | null {
  if (!manageSpacesAccountId.value) return null
  if (draftSpaces.value.has(spaceKey(centreName, spaceName))) return null
  for (const account of allAccounts.value) {
    if (account.country !== activeCountry.value) continue
    if (account.id === manageSpacesAccountId.value) continue
    const centre = account.centres.find(c => c.name === centreName)
    if (centre?.spaces.includes(spaceName)) return account.title || account.companyName
  }
  return null
}

function assignedCountForCentre(centre: { centreName: string; spaces: string[] }): number {
  return centre.spaces.filter(s => draftSpaces.value.has(spaceKey(centre.centreName, s))).length
}

function isCentreFullyAssigned(centre: { centreName: string; spaces: string[] }): boolean {
  return centre.spaces.every(s => draftSpaces.value.has(spaceKey(centre.centreName, s)))
}

function isCentrePartiallyAssigned(centre: { centreName: string; spaces: string[] }): boolean {
  const count = assignedCountForCentre(centre)
  return count > 0 && count < centre.spaces.length
}

function toggleSpace(centreName: string, spaceName: string): void {
  const key = spaceKey(centreName, spaceName)
  const next = new Set(draftSpaces.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  draftSpaces.value = next
}

function toggleCentre(centreName: string, spaces: string[]): void {
  const allAssigned = spaces.every(s => draftSpaces.value.has(spaceKey(centreName, s)))
  const next = new Set(draftSpaces.value)
  if (allAssigned) spaces.forEach(s => next.delete(spaceKey(centreName, s)))
  else spaces.forEach(s => next.add(spaceKey(centreName, s)))
  draftSpaces.value = next
}

function openManageSpaces(account: PayoutAccount): void {
  manageSpacesAccountId.value = account.id
  centreSearch.value = ''
  collapsedCentres.value = new Set()
  const initial = new Set<string>()
  for (const centre of account.centres) {
    for (const space of centre.spaces) initial.add(spaceKey(centre.name, space))
  }
  draftSpaces.value = initial
  manageSpacesOpen.value = true
}

function saveManageSpaces(): void {
  if (!manageSpacesAccountId.value) return
  const country = activeCountry.value

  for (const account of allAccounts.value) {
    if (account.country !== country) continue

    if (account.id === manageSpacesAccountId.value) {
      // Rebuild this account's centres from the draft
      const centresMap: Record<string, string[]> = {}
      for (const key of draftSpaces.value) {
        const sep = key.indexOf('::')
        const centreName = key.slice(0, sep)
        const spaceName  = key.slice(sep + 2)
        if (!centresMap[centreName]) centresMap[centreName] = []
        centresMap[centreName].push(spaceName)
      }
      account.centres = Object.entries(centresMap).map(([name, spaces]) => ({ name, spaces }))
    } else {
      // Strip any spaces now claimed by the managed account to prevent duplicates
      account.centres = account.centres
        .map(c => ({ ...c, spaces: c.spaces.filter(s => !draftSpaces.value.has(spaceKey(c.name, s))) }))
        .filter(c => c.spaces.length > 0)
    }
  }

  manageSpacesOpen.value = false

  // Check if any spaces are now unassigned — prompt user to assign them
  const unassigned = getUnassignedSpaces(country)
  if (unassigned.length > 0) {
    pendingUnassignedSpaces.value = unassigned
    unassignedAssignments.value = Object.fromEntries(
      unassigned.map(({ centreName, spaceName }) => [spaceKey(centreName, spaceName), ''])
    )
    assignUnassignedOpen.value = true
  }
}

// ─── Assign unassigned spaces ─────────────────────────────────────────────────

const assignUnassignedOpen = ref(false)
const pendingUnassignedSpaces = ref<{ centreName: string; spaceName: string }[]>([])
const unassignedAssignments = ref<Record<string, string>>({}) // spaceKey → accountId

const unassignedGroupedByCentre = computed(() => {
  const groups: Record<string, string[]> = {}
  for (const { centreName, spaceName } of pendingUnassignedSpaces.value) {
    if (!groups[centreName]) groups[centreName] = []
    groups[centreName].push(spaceName)
  }
  return Object.entries(groups).map(([centreName, spaces]) => ({ centreName, spaces }))
})

const allUnassignedAssigned = computed(() =>
  pendingUnassignedSpaces.value.length > 0 &&
  pendingUnassignedSpaces.value.every(({ centreName, spaceName }) =>
    !!unassignedAssignments.value[spaceKey(centreName, spaceName)]
  )
)

function getUnassignedSpaces(country: string): { centreName: string; spaceName: string }[] {
  const assigned = new Set<string>()
  for (const account of allAccounts.value) {
    if (account.country !== country) continue
    for (const centre of account.centres) {
      for (const space of centre.spaces) {
        assigned.add(spaceKey(centre.name, space))
      }
    }
  }
  const unassigned: { centreName: string; spaceName: string }[] = []
  // Use the API-derived computed — always up to date with the JSON files
  for (const { centreName, spaces } of masterSpacesForCountry.value) {
    for (const spaceName of spaces) {
      if (!assigned.has(spaceKey(centreName, spaceName))) {
        unassigned.push({ centreName, spaceName })
      }
    }
  }
  return unassigned
}

function confirmAssignUnassigned(): void {
  for (const [key, accountId] of Object.entries(unassignedAssignments.value)) {
    if (!accountId) continue
    const sep = key.indexOf('::')
    const centreName = key.slice(0, sep)
    const spaceName  = key.slice(sep + 2)
    const account = allAccounts.value.find(a => a.id === accountId)
    if (!account) continue
    const centre = account.centres.find(c => c.name === centreName)
    if (centre) {
      if (!centre.spaces.includes(spaceName)) centre.spaces.push(spaceName)
    } else {
      account.centres.push({ name: centreName, spaces: [spaceName] })
    }
  }
  assignUnassignedOpen.value = false
}

// ─── Remove account ───────────────────────────────────────────────────────────

const removeDialogOpen = ref(false)
const removingAccount = ref<PayoutAccount | null>(null)
const deleteConfirmText = ref('')

function openRemoveDialog(account: PayoutAccount) {
  removingAccount.value = account
  deleteConfirmText.value = ''
  removeDialogOpen.value = true
}

function confirmRemoveAccount() {
  if (deleteConfirmText.value !== 'DELETE' || !removingAccount.value) return
  allAccounts.value = allAccounts.value.filter(a => a.id !== removingAccount.value!.id)
  removeDialogOpen.value = false
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskedIban(iban: string): string {
  return `${iban.slice(0, 4)} ···· ${iban.slice(-4)}`
}
</script>
