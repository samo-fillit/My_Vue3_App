<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-lease-info" />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading + country selector -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Lease details</h1>
              <p class="text-base text-muted-foreground">
                This information will be used to generate your lease agreements.
              </p>
            </div>

            <DropdownMenu v-model:open="countryOpen">
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="flex h-14 w-40 shrink-0 items-center gap-3 rounded-lg border border-border bg-background px-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span class="text-xl leading-none">{{ selectedCountry.flag }}</span>
                  <span class="flex-1 text-left">{{ selectedCountry.name }}</span>
                  <IconChevronDown
                    :size="14"
                    stroke-width="2"
                    class="shrink-0 text-muted-foreground transition-transform duration-200"
                    :class="{ 'rotate-180': countryOpen }"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40 p-2">
                <DropdownMenuItem
                  v-for="country in countries"
                  :key="country.code"
                  class="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-medium"
                  @click="selectedCountry = country"
                >
                  <span class="text-xl leading-none">{{ country.flag }}</span>
                  <span>{{ country.name }}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Signatory details -->
          <section class="flex flex-col gap-8">
            <h3 class="text-xl font-semibold tracking-tight text-foreground">Signatory details</h3>
            <div class="flex flex-col gap-4">
              <FloatingLabelInput v-model="form.firstNameSignatory"   label="First name of signatory"   :required="true" />
              <FloatingLabelInput v-model="form.firstSurnameSignatory"  label="First surname of signatory"  :required="true" />
              <FloatingLabelInput v-model="form.secondSurnameSignatory" label="Second surname of signatory" :required="true" />
              <FloatingLabelInput v-model="form.nationality"  label="Nationality"   :required="true" />
              <FloatingLabelInput v-model="form.title"        label="Title"         :required="true" />
              <FloatingLabelInput v-model="form.dni"          label="DNI"           :required="true" />
              <FloatingLabelInput v-model="form.roleInCompany" label="Role in company" :required="true" />
            </div>
          </section>

          <!-- Company details -->
          <section class="flex flex-col gap-8">
            <h3 class="text-xl font-semibold tracking-tight text-foreground">Company details</h3>
            <div class="flex flex-col gap-4">
              <FloatingLabelInput v-model="form.street"             label="Street"               :required="true" />
              <FloatingLabelInput v-model="form.number"             label="Number"               :required="true" />
              <FloatingLabelInput v-model="form.floor"              label="Floor"                :required="true" />
              <FloatingLabelInput v-model="form.letter"             label="Letter"               :required="true" />
              <FloatingLabelInput v-model="form.postalCode"         label="Postal code"          :required="true" />
              <FloatingLabelInput v-model="form.city"               label="City"                 :required="true" />
              <FloatingLabelInput v-model="form.province"           label="Province"             :required="true" />
              <FloatingLabelInput v-model="form.cnae"               label="CNAE"                 :required="true" />
              <FloatingLabelInput v-model="form.dateOfRegistration" label="Date of registration" :required="true" />
              <FloatingLabelInput v-model="form.bookNumber"         label="Book number"          :required="true" />
              <FloatingLabelInput v-model="form.bookSection"        label="Book section"         :required="true" />
              <FloatingLabelInput v-model="form.folio"              label="Folio"                :required="true" />
              <FloatingLabelInput v-model="form.paperNumber"        label="Paper number"         :required="true" />
              <FloatingLabelInput v-model="form.inscription"        label="Inscription"          :required="true" />
              <FloatingLabelInput v-model="form.cif"                label="CIF"                  :required="true" />
            </div>
          </section>

          <Button class="h-14 min-w-[120px] self-start rounded-lg px-6">
            Save changes
          </Button>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconChevronDown } from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AppSidebar from '@/components/app-sidebar.vue'

const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy',  flag: '🇮🇹' },
  { code: 'ES', name: 'Spain',  flag: '🇪🇸' },
]

const selectedCountry = ref(countries[2]) // Spain default
const countryOpen = ref(false)

const form = ref({
  firstNameSignatory: '',
  firstSurnameSignatory: '',
  secondSurnameSignatory: '',
  nationality: '',
  title: '',
  dni: '',
  roleInCompany: '',
  street: '',
  number: '',
  floor: '',
  letter: '',
  postalCode: '',
  city: '',
  province: '',
  cnae: '',
  dateOfRegistration: '',
  bookNumber: '',
  bookSection: '',
  folio: '',
  paperNumber: '',
  inscription: '',
  cif: '',
})
</script>
