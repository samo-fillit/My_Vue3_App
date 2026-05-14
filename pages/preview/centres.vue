<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-centres" />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Centres</h1>
              <p class="text-base text-muted-foreground">
                Manage your shopping centre portfolio, spaces, and listing settings.
              </p>
            </div>
            <Button class="h-10 shrink-0 px-5 text-sm font-medium">
              + Add new centre
            </Button>
          </div>

          <div class="flex flex-col gap-6">
          <!-- Search -->
          <div class="relative w-full max-w-sm">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search centres…"
              class="h-10 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px]"
              @keydown.enter="jumpToMatch"
            />
            <IconSearch :size="16" stroke-width="1.5" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          <!-- Table -->
          <Table ref="tableRef">
            <TableHeader>
              <TableRow class="border-border">
                <TableHead class="w-[260px]">
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('name')">
                    Centre name
                    <IconChevronUp v-if="sort.key === 'name' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                    <IconChevronDown v-else-if="sort.key === 'name' && sort.dir === 'desc'" :size="12" class="text-foreground" />
                    <IconSelector v-else :size="12" class="opacity-30" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('city')">
                    City
                    <IconChevronUp v-if="sort.key === 'city' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                    <IconChevronDown v-else-if="sort.key === 'city' && sort.dir === 'desc'" :size="12" class="text-foreground" />
                    <IconSelector v-else :size="12" class="opacity-30" />
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('country')">
                    Country
                    <IconChevronUp v-if="sort.key === 'country' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                    <IconChevronDown v-else-if="sort.key === 'country' && sort.dir === 'desc'" :size="12" class="text-foreground" />
                    <IconSelector v-else :size="12" class="opacity-30" />
                  </button>
                </TableHead>
                <TableHead class="text-center">
                  <button type="button" class="inline-flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('totalSqm')">
                    Size (sqm)
                    <IconChevronUp v-if="sort.key === 'totalSqm' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                    <IconChevronDown v-else-if="sort.key === 'totalSqm' && sort.dir === 'desc'" :size="12" class="text-foreground" />
                    <IconSelector v-else :size="12" class="opacity-30" />
                  </button>
                </TableHead>
                <TableHead class="text-center">
                  <button type="button" class="inline-flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('footfallPerWeek')">
                    Weekly footfall
                    <IconChevronUp v-if="sort.key === 'footfallPerWeek' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                    <IconChevronDown v-else-if="sort.key === 'footfallPerWeek' && sort.dir === 'desc'" :size="12" class="text-foreground" />
                    <IconSelector v-else :size="12" class="opacity-30" />
                  </button>
                </TableHead>
                <TableHead class="text-center">
                  <button type="button" class="inline-flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('status')">
                    Status
                    <IconChevronUp v-if="sort.key === 'status' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                    <IconChevronDown v-else-if="sort.key === 'status' && sort.dir === 'desc'" :size="12" class="text-foreground" />
                    <IconSelector v-else :size="12" class="opacity-30" />
                  </button>
                </TableHead>
                <TableHead class="pr-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="centre in sortedCentres"
                :key="centre.id"
                :ref="el => { if (el) rowRefs[centre.id] = el as HTMLElement }"
                class="border-border"
                :class="{ 'row-highlight': highlightedId === centre.id }"
              >
                <TableCell class="py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded"
                      :style="centre.logoUrl ? {} : { backgroundColor: centre.logo ?? '#2563eb' }"
                    >
                      <img
                        v-if="centre.logoUrl"
                        :src="centre.logoUrl"
                        class="h-full w-full object-contain"
                        :alt="centre.name"
                      />
                      <span v-else class="text-xs font-bold text-white">{{ centre.name.charAt(0) }}</span>
                    </div>
                    <span class="text-sm font-medium text-foreground">{{ centre.name }}</span>
                  </div>
                </TableCell>
                <TableCell class="py-3 text-sm text-muted-foreground">{{ centre.city }}</TableCell>
                <TableCell class="py-3 text-sm text-muted-foreground">{{ centre.country }}</TableCell>
                <TableCell class="py-3 text-center text-sm text-foreground">{{ centre.totalSqm?.toLocaleString() ?? '—' }}</TableCell>
                <TableCell class="py-3 text-center text-sm text-foreground">{{ centre.footfallPerWeek?.toLocaleString() ?? '—' }}</TableCell>
                <TableCell class="py-3 text-center">
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                    :class="centre.status === 'Listed' ? 'bg-[#f2fbf8] text-[#4dbd9f]' : 'bg-[#fef9f0] text-[#d97706]'"
                  >
                    {{ centre.status }}
                  </span>
                </TableCell>
                <TableCell class="py-3 pr-0 text-right">
                  <div class="inline-flex items-center gap-2">
                    <Button variant="outline" size="sm" class="h-8 px-4 text-sm font-medium" @click="openEditCentre(centre)">
                      Edit centre
                    </Button>
                    <Button variant="outline" size="sm" class="h-8 px-4 text-sm font-medium" @click="openManageSpaces(centre)">
                      Manage spaces
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div><!-- end search+table wrapper -->

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- ── Edit centre modal ──────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="editCentreOpen" class="fixed inset-12 z-50 flex justify-center">
        <div class="fixed inset-0 bg-black/50" @click="editCentreOpen = false" />
        <div class="relative z-10 flex h-full w-full max-w-[964px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">

          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-border px-8 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">Edit centre</h2>
              <p class="text-sm text-muted-foreground">{{ editDraft.name }}</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="editCentreOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Scrollable body -->
          <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="mx-auto max-w-[900px] px-8 py-8">
              <div class="flex flex-col gap-10">

                <!-- Identity -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-base font-semibold text-foreground/70">Identity</h3>
                  <div class="flex flex-col gap-5">

                    <!-- Logo upload -->
                    <div class="flex flex-col gap-2">
                      <span class="text-sm text-muted-foreground">Logo</span>
                      <div class="flex items-center gap-4">
                        <button
                          type="button"
                          class="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:bg-muted/70"
                          @click="triggerLogoUpload"
                        >
                          <img
                            v-if="editDraft.logoUrl"
                            :src="editDraft.logoUrl"
                            class="h-full w-full object-contain p-2"
                            alt="Centre logo"
                          />
                          <div v-else class="flex flex-col items-center gap-1 text-muted-foreground">
                            <IconPhoto :size="24" stroke-width="1.5" />
                            <span class="text-xs">No logo</span>
                          </div>
                          <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <IconUpload :size="18" stroke-width="1.5" class="text-white" />
                          </div>
                        </button>
                        <div class="flex flex-col gap-1">
                          <p class="text-sm text-foreground">Click to upload</p>
                          <p class="text-xs text-muted-foreground">SVG or PNG. Max 1 MB.</p>
                          <button
                            v-if="editDraft.logoUrl"
                            type="button"
                            class="mt-1 text-left text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                            @click="editDraft.logoUrl = ''"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          ref="logoFileInputRef"
                          type="file"
                          accept=".svg,.png,image/svg+xml,image/png"
                          class="sr-only"
                          @change="handleLogoUpload"
                        />
                      </div>
                    </div>

                    <FloatingLabelInput v-model="editDraft.name" label="Centre name" :required="true" />
                    <div class="relative w-full pt-2">
                      <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
                        Description
                      </span>
                      <textarea
                        v-model="editDraft.description"
                        rows="3"
                        class="w-full rounded-lg border border-border bg-background px-4 pb-3 pt-6 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px] resize-none"
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                <!-- Details -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-base font-semibold text-foreground/70">Details</h3>
                  <div class="grid grid-cols-2 gap-5">
                    <FloatingLabelInput v-model.number="editDraft.totalSqm" label="Total size (sqm)" type="number" />
                    <FloatingLabelInput v-model.number="editDraft.numberOfStores" label="Number of stores" type="number" />
                    <FloatingLabelInput v-model.number="editDraft.avgVisitTimeMinutes" label="Avg. visit time (minutes)" type="number" />
                    <FloatingLabelInput v-model.number="editDraft.footfallPerWeek" label="Weekly footfall" type="number" />
                  </div>
                </section>

                <Separator />

                <!-- Amenities -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-base font-semibold text-foreground/70">Amenities</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="amenity in allAmenities"
                      :key="amenity"
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
                      :class="editDraft.amenities.includes(amenity)
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-transparent text-foreground hover:bg-muted'"
                      @click="toggleAmenity(amenity)"
                    >
                      <IconCheck v-if="editDraft.amenities.includes(amenity)" :size="12" stroke-width="2.5" />
                      {{ amenity }}
                    </button>
                  </div>
                  <!-- Add new amenity -->
                  <div class="flex items-center gap-3">
                    <input
                      v-model="newAmenity"
                      type="text"
                      placeholder="Add new amenity…"
                      class="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px]"
                      @keydown.enter.prevent="addAmenity"
                    />
                    <Button variant="outline" size="sm" class="h-9 px-4 text-sm" :disabled="!newAmenity.trim()" @click="addAmenity">
                      Add
                    </Button>
                  </div>
                </section>

                <Separator />

                <!-- Images -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-base font-semibold text-foreground/70">Images</h3>
                  <div class="flex flex-wrap gap-3">
                    <div
                      v-for="(img, i) in editDraft.images"
                      :key="i"
                      class="relative h-24 w-32 overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <img :src="img" class="h-full w-full object-cover" />
                      <button
                        type="button"
                        class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
                        @click="editDraft.images.splice(i, 1)"
                      >
                        <IconX :size="10" stroke-width="2" />
                      </button>
                      <button
                        v-if="editDraft.thumbnailIndex !== i"
                        type="button"
                        class="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-xs text-foreground hover:bg-background"
                        @click="editDraft.thumbnailIndex = i"
                      >
                        Set thumbnail
                      </button>
                      <span v-else class="absolute bottom-1 left-1 rounded bg-foreground px-1.5 py-0.5 text-xs text-background">
                        Thumbnail
                      </span>
                    </div>
                    <button
                      type="button"
                      class="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted"
                      @click="triggerImageUpload"
                    >
                      <IconPlus :size="20" stroke-width="1.5" />
                      <span class="text-xs">Add image</span>
                    </button>
                  </div>
                </section>

                <Separator />

                <!-- Address -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-base font-semibold text-foreground/70">Address</h3>
                  <div class="grid grid-cols-2 gap-5">
                    <div class="col-span-2">
                      <FloatingLabelInput v-model="editDraft.address" label="Street address" />
                    </div>
                    <FloatingLabelInput v-model="editDraft.city" label="City" />
                    <FloatingLabelInput v-model="editDraft.postcode" label="Postcode" />
                    <FloatingLabelInput v-model="editDraft.country" label="Country" />
                  </div>
                  <div class="grid grid-cols-2 gap-5">
                    <FloatingLabelInput v-model.number="editDraft.coordinates.lat" label="Latitude" type="number" />
                    <FloatingLabelInput v-model.number="editDraft.coordinates.lng" label="Longitude" type="number" />
                  </div>
                </section>

                <Separator />

                <!-- Signatories -->
                <section class="flex flex-col gap-6">
                  <div>
                    <h3 class="text-base font-semibold text-foreground/70">User signatories</h3>
                    <p class="mt-1 text-xs text-muted-foreground">At least one required. Must be a team member with signatory permission.</p>
                  </div>
                  <div class="flex flex-col gap-3">
                    <div v-for="(sig, i) in editDraft.userSignatories" :key="i" class="flex items-center gap-3">
                      <div class="relative flex-1 pt-2">
                        <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
                          Signatory {{ i + 1 }}<span class="ml-0.5">*</span>
                        </span>
                        <Select v-model="editDraft.userSignatories[i]">
                          <SelectTrigger class="h-[72px] w-full rounded-lg border border-border text-base focus:ring-0 focus:border-foreground focus:border-[1.5px]">
                            <SelectValue placeholder="Select a team member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem v-for="member in teamMemberOptions" :key="member.email" :value="member.email">
                              {{ member.name }} — {{ member.email }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        v-if="editDraft.userSignatories.length > 1"
                        type="button"
                        class="mt-2 shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        @click="editDraft.userSignatories.splice(i, 1)"
                      >
                        <IconTrash :size="16" stroke-width="1.5" />
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" class="w-fit px-0 text-sm text-muted-foreground hover:text-foreground" @click="editDraft.userSignatories.push('')">
                      + Add signatory
                    </Button>
                  </div>

                  <div>
                    <h3 class="text-base font-semibold text-foreground/70">External signatories</h3>
                    <p class="mt-1 text-xs text-muted-foreground">Optional. External parties authorised to sign on behalf of this centre.</p>
                  </div>
                  <div class="flex flex-col gap-3">
                    <div v-for="(sig, i) in editDraft.externalSignatories" :key="i" class="flex items-center gap-3">
                      <div class="relative flex-1 pt-2">
                        <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
                          External signatory {{ i + 1 }}
                        </span>
                        <Select v-model="editDraft.externalSignatories[i]">
                          <SelectTrigger class="h-[72px] w-full rounded-lg border border-border text-base focus:ring-0 focus:border-foreground focus:border-[1.5px]">
                            <SelectValue placeholder="Select an external signatory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem v-for="opt in externalSignatoryOptions" :key="opt.email" :value="opt.email">
                              {{ opt.name }} — {{ opt.email }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        type="button"
                        class="mt-2 shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        @click="editDraft.externalSignatories.splice(i, 1)"
                      >
                        <IconTrash :size="16" stroke-width="1.5" />
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" class="w-fit px-4 text-sm text-muted-foreground hover:text-foreground" @click="editDraft.externalSignatories.push('')">
                      + Add external signatory
                    </Button>
                  </div>
                </section>

              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex shrink-0 items-center justify-end gap-3 border-t border-border px-8 py-5">
            <Button variant="outline" class="h-10 px-5 text-sm font-medium" @click="editCentreOpen = false">
              Cancel
            </Button>
            <Button class="h-10 px-5 text-sm font-medium" :disabled="!editDraft.name || editDraft.userSignatories.filter(s => s.trim()).length === 0" @click="saveEditCentre">
              Save changes
            </Button>
          </div>

        </div>
      </div>
    </Transition>
    <input ref="imageFileInputRef" type="file" accept="image/*" class="sr-only" @change="handleImageUpload" />
  </Teleport>

  <!-- ── Manage spaces modal ────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="manageSpacesOpen" class="fixed inset-12 z-50 flex justify-center">
        <div class="fixed inset-0 bg-black/50" @click="manageSpacesOpen = false" />
        <div class="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">

          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-border px-8 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">Manage spaces</h2>
              <p class="text-sm text-muted-foreground">{{ manageSpacesCentre?.name }}</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="manageSpacesOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Body placeholder -->
          <div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Space management table — coming next.
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes row-search-pulse {
  0%   { background-color: transparent; }
  30%  { background-color: rgb(59 130 246 / 0.10); }
  70%  { background-color: rgb(59 130 246 / 0.10); }
  100% { background-color: transparent; }
}
.row-highlight {
  animation: row-search-pulse 1s ease-in-out 2;
}

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
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
import {
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconX,
  IconCheck,
  IconPlus,
  IconTrash,
  IconPhoto,
  IconUpload,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FloatingLabelInput } from '@/components/ui/input'
import AppSidebar from '@/components/app-sidebar.vue'

interface Centre {
  id: string
  name: string
  logo: string
  description: string
  address: string
  city: string
  postcode: string
  country: string
  coordinates: { lat: number; lng: number }
  status: 'Listed' | 'Unlisted'
  teamId: string
  totalSqm: number
  numberOfStores: number
  avgVisitTimeMinutes: number
  footfallPerWeek: number
  amenities: string[]
  images: string[]
  thumbnailIndex?: number
  logoUrl?: string
  contactName: string
  contactEmail: string
  userSignatories: string[]
  externalSignatories: string[]
}

interface TeamMember { name: string; email: string }
interface ExternalSignatory { name: string; email: string; centre: string }
interface Team { id: string; name: string; members: TeamMember[]; signatories: ExternalSignatory[] }

// ── Data ──────────────────────────────────────────────────────
const centres = ref<Centre[]>([])
const teams = ref<Team[]>([])

onMounted(async () => {
  const [centresData, teamsData] = await Promise.all([
    $fetch<{ centres: Centre[] }>('/api/centres'),
    $fetch<{ teams: Team[] }>('/api/teams'),
  ])
  centres.value = centresData.centres
  teams.value = teamsData.teams
})

const teamMemberOptions = computed(() => {
  const seen = new Set<string>()
  return teams.value.flatMap(t => t.members).filter(m => {
    if (seen.has(m.email)) return false
    seen.add(m.email)
    return true
  })
})

const externalSignatoryOptions = computed(() => {
  const seen = new Set<string>()
  return teams.value.flatMap(t => t.signatories ?? []).filter(s => {
    if (seen.has(s.email)) return false
    seen.add(s.email)
    return true
  })
})

async function saveCentres() {
  await $fetch('/api/centres', { method: 'PUT', body: { centres: centres.value } })
}

// ── Sort ──────────────────────────────────────────────────────
type SortDir = 'asc' | 'desc'
const sort = reactive<{ key: string; dir: SortDir }>({ key: '', dir: 'asc' })

function toggleSort(key: string) {
  if (sort.key === key) {
    sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.key = key
    sort.dir = 'asc'
  }
}

const sortedCentres = computed(() => {
  if (!sort.key) return centres.value
  return [...centres.value].sort((a, b) => {
    const aVal = String((a as any)[sort.key] ?? '').toLowerCase()
    const bVal = String((b as any)[sort.key] ?? '').toLowerCase()
    const cmp = aVal.localeCompare(bVal, undefined, { numeric: true })
    return sort.dir === 'asc' ? cmp : -cmp
  })
})

// ── Search & highlight ────────────────────────────────────────
const searchQuery = ref('')
const highlightedId = ref<string | null>(null)
const rowRefs = ref<Record<string, HTMLElement>>({})
const tableRef = ref<HTMLElement | null>(null)

function jumpToMatch() {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return
  const match = sortedCentres.value.find(c => c.name.toLowerCase().includes(q))
  if (!match) return
  highlightedId.value = null
  nextTick(() => {
    highlightedId.value = match.id
    const el = rowRefs.value[match.id]
    if (el) {
      const row = (el as any).$el ?? el
      row.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => { highlightedId.value = null }, 2100)
  })
}

// ── Edit centre ───────────────────────────────────────────────
const editCentreOpen = ref(false)
const editTarget = ref<Centre | null>(null)
const editDraft = ref<Omit<Centre, 'id' | 'status' | 'teamId' | 'contactName' | 'contactEmail'> & { thumbnailIndex: number; logoUrl: string }>({
  name: '',
  logo: '#2563eb',
  logoUrl: '',
  description: '',
  address: '',
  city: '',
  postcode: '',
  country: '',
  coordinates: { lat: 0, lng: 0 },
  totalSqm: 0,
  numberOfStores: 0,
  avgVisitTimeMinutes: 0,
  footfallPerWeek: 0,
  amenities: [],
  images: [],
  thumbnailIndex: 0,
  userSignatories: [''],
  externalSignatories: [],
})

const logoFileInputRef = ref<HTMLInputElement | null>(null)
const imageFileInputRef = ref<HTMLInputElement | null>(null)

function triggerLogoUpload() {
  logoFileInputRef.value?.click()
}

function triggerImageUpload() {
  imageFileInputRef.value?.click()
}

function handleLogoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  editDraft.value.logoUrl = URL.createObjectURL(file)
  ;(e.target as HTMLInputElement).value = ''
}

const defaultAmenities = [
  'Free Wi-Fi', 'Parking', 'Food court', 'Cinema', 'Accessible facilities',
  'Baby changing', 'ATM', 'Click & collect', 'Information desk',
  'Electric vehicle charging', 'Left luggage', 'Toilets',
]
const extraAmenities = ref<string[]>([])
const newAmenity = ref('')

const allAmenities = computed(() => {
  const combined = [...defaultAmenities, ...extraAmenities.value]
  editDraft.value.amenities.forEach(a => { if (!combined.includes(a)) combined.push(a) })
  return combined
})

function toggleAmenity(amenity: string) {
  const idx = editDraft.value.amenities.indexOf(amenity)
  if (idx === -1) editDraft.value.amenities.push(amenity)
  else editDraft.value.amenities.splice(idx, 1)
}

function addAmenity() {
  const val = newAmenity.value.trim()
  if (!val || allAmenities.value.includes(val)) return
  extraAmenities.value.push(val)
  editDraft.value.amenities.push(val)
  newAmenity.value = ''
}

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  editDraft.value.images.push(url)
  ;(e.target as HTMLInputElement).value = ''
}

function openEditCentre(centre: Centre) {
  editTarget.value = centre
  editDraft.value = {
    name: centre.name,
    logo: centre.logo ?? '#2563eb',
    logoUrl: centre.logoUrl ?? '',
    description: centre.description ?? '',
    address: centre.address ?? '',
    city: centre.city ?? '',
    postcode: centre.postcode ?? '',
    country: centre.country ?? '',
    coordinates: { ...(centre.coordinates ?? { lat: 0, lng: 0 }) },
    totalSqm: centre.totalSqm ?? 0,
    numberOfStores: centre.numberOfStores ?? 0,
    avgVisitTimeMinutes: centre.avgVisitTimeMinutes ?? 0,
    footfallPerWeek: centre.footfallPerWeek ?? 0,
    amenities: [...(centre.amenities ?? [])],
    images: [...(centre.images ?? [])],
    thumbnailIndex: centre.thumbnailIndex ?? 0,
    userSignatories: centre.userSignatories?.length ? [...centre.userSignatories] : [''],
    externalSignatories: [...(centre.externalSignatories ?? [])],
  }
  newAmenity.value = ''
  editCentreOpen.value = true
}

function saveEditCentre() {
  if (!editTarget.value) return
  const idx = centres.value.findIndex(c => c.id === editTarget.value!.id)
  if (idx === -1) return
  const existing = centres.value[idx]
  const { logoUrl, thumbnailIndex, ...rest } = editDraft.value
  centres.value[idx] = {
    ...existing,
    ...rest,
    ...(logoUrl ? { logoUrl } : {}),
    userSignatories: editDraft.value.userSignatories.filter(s => s.trim()),
    externalSignatories: editDraft.value.externalSignatories.filter(s => s.trim()),
  }
  saveCentres()
  editCentreOpen.value = false
  editTarget.value = null
}

// ── Manage spaces ─────────────────────────────────────────────
const manageSpacesOpen = ref(false)
const manageSpacesCentre = ref<Centre | null>(null)

function openManageSpaces(centre: Centre) {
  manageSpacesCentre.value = centre
  manageSpacesOpen.value = true
}
</script>
