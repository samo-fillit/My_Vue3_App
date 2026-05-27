<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-payments" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Payouts</h1>
              <p class="text-base text-muted-foreground">Manage accounts and control which centres and spaces each account pays out to.</p>
            </div>
            <TooltipProvider :delay-duration="300">
              <Tooltip>
                <TooltipTrigger as-child>
                  <span :class="!can('edit:payouts') ? 'cursor-not-allowed' : ''">
                    <Button variant="outline" size="sm" class="shrink-0 disabled:pointer-events-none" :disabled="!can('edit:payouts')" @click="dialogOpen = true">Add account</Button>
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
              v-for="account in accounts"
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
                  <p class="text-sm font-semibold text-foreground">{{ account.companyName }}</p>
                  <p class="mt-0.5 text-xs text-muted-foreground">{{ account.signatoryName }}, {{ account.signatoryRole }}</p>
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
                          <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('edit:payouts')">Manage spaces</Button>
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
                          <Button variant="ghost" size="sm" class="text-muted-foreground disabled:pointer-events-none" :disabled="!can('edit:payouts')">Edit</Button>
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
                          <Button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none" :disabled="!can('edit:payouts')">Remove</Button>
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

    </SidebarInset>
  </SidebarProvider>

  <!-- Add account dialog -->
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="flex max-h-[90vh] flex-col sm:max-w-[580px]">
      <DialogHeader class="shrink-0">
        <DialogTitle>Add payout account</DialogTitle>
        <DialogDescription>
          Enter company, banking, and signatory details for the new account.
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-1 flex-col gap-8 overflow-y-auto py-4" @submit.prevent="handleSave">

        <!-- Company details -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-foreground">Company details</h3>
          <FloatingLabelInput v-model="form.companyName" label="Company name" :required="true" />
          <FloatingLabelInput v-model="form.vatNumber" label="VAT number" />
          <FloatingLabelInput v-model="form.address" label="Company address" />
          <div class="grid grid-cols-2 gap-4">
            <FloatingLabelInput v-model="form.city" label="City" />
            <FloatingLabelInput v-model="form.postcode" label="Postcode" />
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
            <FloatingLabelInput v-model="form.stripeAccountId" label="Stripe account ID" />
          </template>
          <template v-else>
            <FloatingLabelInput v-model="form.bankName" label="Bank name" />
            <FloatingLabelInput v-model="form.iban" label="IBAN" />
            <FloatingLabelInput v-model="form.bic" label="BIC / SWIFT" />
          </template>
        </div>

        <!-- Signatory -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-foreground">Signatory</h3>
          <div class="grid grid-cols-2 gap-4">
            <FloatingLabelInput v-model="form.firstName" label="First name" />
            <FloatingLabelInput v-model="form.lastName" label="Last name" />
          </div>
          <FloatingLabelInput v-model="form.role" label="Role / Title" />
        </div>

      </form>

      <DialogFooter class="shrink-0 gap-2">
        <Button variant="ghost" size="sm" @click="dialogOpen = false">Cancel</Button>
        <Button size="sm" @click="handleSave">Save account</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  IconBuildingBank,
  IconBrandStripe,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

const { activeTeamId } = useTeamContext()
const { can } = useAppContext()

// ─── Types ────────────────────────────────────────────────────────────────────

interface Centre {
  name: string
  spaces: string[]
}

interface PayoutAccount {
  id: string
  type: 'stripe' | 'bank'
  companyName: string
  currency: string
  status: 'active' | 'pending'
  signatoryName: string
  signatoryRole: string
  vatNumber: string
  centres: Centre[]
  last4?: string
  iban?: string
  bic?: string
}

// ─── Payout accounts ──────────────────────────────────────────────────────────

const accounts = ref<PayoutAccount[]>([
  {
    id: 'acct_1',
    type: 'stripe',
    companyName: 'Westfield Group Ltd',
    currency: 'GBP',
    status: 'active',
    signatoryName: 'James Miller',
    signatoryRole: 'Director',
    vatNumber: 'GB123456789',
    last4: '4532',
    centres: [
      { name: 'Westfield London',    spaces: ['Kiosk A1', 'Kiosk A2', 'Kiosk A3', 'Pop-up Space P1'] },
      { name: 'Westfield Stratford', spaces: ['Sampling Stand S1', 'Sampling Stand S2', 'Event Space E1'] },
    ],
  },
  {
    id: 'acct_2',
    type: 'bank',
    companyName: 'Lakeside Properties Ltd',
    currency: 'EUR',
    status: 'active',
    signatoryName: 'Sarah Chen',
    signatoryRole: 'Authorised Signatory',
    vatNumber: 'IE8256796U',
    iban: 'IE29AIBK93115212345678',
    bic: 'AIBKIE2D',
    centres: [
      { name: 'Lakeside',   spaces: ['Kiosk A1', 'Billboard B2'] },
      { name: 'Bluewater',  spaces: ['Sampling Stand S1'] },
    ],
  },
])

// ─── Dialog / Form ────────────────────────────────────────────────────────────

const dialogOpen = ref(false)

const form = reactive({
  companyName: '',
  vatNumber: '',
  address: '',
  city: '',
  postcode: '',
  bankingType: 'stripe' as 'stripe' | 'bank',
  stripeAccountId: '',
  bankName: '',
  iban: '',
  bic: '',
  firstName: '',
  lastName: '',
  role: '',
})

function handleSave() {
  dialogOpen.value = false
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskedIban(iban: string): string {
  return `${iban.slice(0, 4)} ···· ${iban.slice(-4)}`
}
</script>
