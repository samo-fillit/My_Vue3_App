<script setup lang="ts">
import { ref } from 'vue'
import { IconUpload, IconX } from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import { FloatingLabelSelect, SelectItem } from '@/components/ui/select'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import { useAppContext } from '@/composables/useAppContext'

const { isUserType } = useAppContext()

// ── Form state ────────────────────────────────────────────────────────────────
const form = ref({
  brandName: '',
  website: '',
  city: '',
  country: '',
  // Tenant-only
  companyType: '',
  companySize: '',
  sector: '',
  description: '',
})

// ── Logo upload ───────────────────────────────────────────────────────────────
const logoPreview = ref<string | null>(null)
const logoInput = ref<HTMLInputElement | null>(null)

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { logoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

function removeLogo() {
  logoPreview.value = null
  if (logoInput.value) logoInput.value.value = ''
}

// ── Dropdown options ──────────────────────────────────────────────────────────
const companyTypes = [
  'Brand',
  'Retailer',
  'Agency',
  'Event organiser',
  'Startup',
  'Other',
]

const companySizes = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–500 employees',
  '500+ employees',
]

const sectors = [
  'Fashion & apparel',
  'Food & beverage',
  'Health & beauty',
  'Technology & electronics',
  'Home & living',
  'Sport & fitness',
  'Entertainment & media',
  'Financial services',
  'Other',
]

const countries = [
  'Australia',
  'France',
  'Germany',
  'Ireland',
  'Italy',
  'Netherlands',
  'Spain',
  'United Kingdom',
  'United States',
]
</script>

<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-profile" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex flex-col gap-3">
            <h1 class="text-[28px] font-bold leading-8 text-foreground">Organisation profile</h1>
            <p class="text-base text-muted-foreground">
              {{ isUserType('tenant')
                ? 'Your brand profile is shown to landlords and used to match you with relevant spaces.'
                : 'This information represents your organisation across the platform and on landlord communications.' }}
            </p>
          </div>

          <!-- Logo -->
          <section class="flex flex-col gap-8">
            <h3 class="text-xl font-semibold tracking-tight text-foreground">Logo</h3>
            <div class="flex items-start gap-6">
              <!-- Preview -->
              <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                <img v-if="logoPreview" :src="logoPreview" alt="Logo preview" class="h-full w-full object-contain" />
                <span v-else class="text-2xl font-bold text-muted-foreground/40">
                  {{ form.brandName ? form.brandName.charAt(0).toUpperCase() : '?' }}
                </span>
              </div>
              <!-- Upload controls -->
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onLogoChange"
                  />
                  <Button variant="outline" class="h-10 gap-2 px-4" @click="logoInput?.click()">
                    <IconUpload :size="15" stroke-width="1.75" />
                    Upload logo
                  </Button>
                  <Button
                    v-if="logoPreview"
                    variant="ghost"
                    class="h-10 gap-2 px-4 text-muted-foreground hover:text-foreground"
                    @click="removeLogo"
                  >
                    <IconX :size="15" stroke-width="1.75" />
                    Remove
                  </Button>
                </div>
                <p class="text-sm text-muted-foreground">PNG, JPG or SVG. Recommended 400×400px, max 2MB.</p>
              </div>
            </div>
          </section>

          <!-- Brand / company details -->
          <section class="flex flex-col gap-8">
            <h3 class="text-xl font-semibold tracking-tight text-foreground">
              {{ isUserType('tenant') ? 'Brand details' : 'Company details' }}
            </h3>
            <div class="flex flex-col gap-4">
              <FloatingLabelInput
                v-model="form.brandName"
                :label="isUserType('tenant') ? 'Brand name' : 'Company name'"
                :required="true"
              />
              <FloatingLabelInput v-model="form.website" label="Website" type="url" />
            </div>
          </section>

          <!-- Location -->
          <section class="flex flex-col gap-8">
            <h3 class="text-xl font-semibold tracking-tight text-foreground">Location</h3>
            <div class="flex flex-col gap-4">
              <FloatingLabelInput v-model="form.city" label="City" :required="true" />
              <FloatingLabelSelect v-model="form.country" label="Country" :required="true">
                <SelectItem v-for="c in countries" :key="c" :value="c">{{ c }}</SelectItem>
              </FloatingLabelSelect>
            </div>
          </section>

          <!-- Tenant-only: Brand profile for retargeting -->
          <section v-if="isUserType('tenant')" class="flex flex-col gap-8">
            <div class="flex flex-col gap-2">
              <h3 class="text-xl font-semibold tracking-tight text-foreground">Brand profile</h3>
              <p class="text-sm text-muted-foreground">
                Help landlords understand your brand. This information is used to match you with relevant spaces and audiences.
              </p>
            </div>
            <div class="flex flex-col gap-4">
              <FloatingLabelSelect v-model="form.companyType" label="Company type">
                <SelectItem v-for="t in companyTypes" :key="t" :value="t">{{ t }}</SelectItem>
              </FloatingLabelSelect>

              <FloatingLabelSelect v-model="form.companySize" label="Company size">
                <SelectItem v-for="s in companySizes" :key="s" :value="s">{{ s }}</SelectItem>
              </FloatingLabelSelect>

              <FloatingLabelSelect v-model="form.sector" label="Sector">
                <SelectItem v-for="s in sectors" :key="s" :value="s">{{ s }}</SelectItem>
              </FloatingLabelSelect>

              <!-- Brand description -->
              <div class="relative pt-2">
                <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
                  Brand description
                </span>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="flex w-full rounded-lg border border-border bg-background px-4 pb-3 pt-6 text-base text-foreground outline-none transition-[border-color,border-width] placeholder:text-muted-foreground/40 focus:border-[1.5px] focus:border-foreground resize-none"
                />
              </div>
              <p class="text-sm text-muted-foreground -mt-2">
                A short paragraph about your brand that landlords will see on your profile.
              </p>
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
