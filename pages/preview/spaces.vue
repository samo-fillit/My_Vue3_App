<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-spaces" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Spaces</h1>
              <p class="text-base text-muted-foreground">
                Manage spaces across your shopping centre portfolio.
              </p>
            </div>
            <TooltipProvider :delay-duration="300">
              <Tooltip>
                <TooltipTrigger as-child>
                  <span :class="!can('edit:spaces') ? 'cursor-not-allowed' : ''">
                    <Button class="h-10 shrink-0 px-5 text-sm font-medium disabled:pointer-events-none" :disabled="!can('edit:spaces')" @click="openAddSpace">
                      + Add new space
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent v-if="!can('edit:spaces')" side="bottom">
                  <p class="text-xs">This action can only be taken by admins</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div class="flex flex-col gap-6">

            <!-- Toolbar: Team selector + Centre selector + Search -->
            <div class="flex items-center gap-4">

              <!-- Centre selector -->
              <DropdownMenu v-model:open="centreDropdownOpen">
                <DropdownMenuTrigger as-child>
                  <button
                    type="button"
                    class="flex h-10 shrink-0 items-center gap-3 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    :class="{ 'centre-auto-selected': centreAutoSelected }"
                  >
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded"
                      :style="selectedCentre?.logoUrl ? {} : { backgroundColor: selectedCentre?.logo ?? '#2563eb' }"
                    >
                      <img
                        v-if="selectedCentre?.logoUrl"
                        :src="selectedCentre.logoUrl"
                        class="h-full w-full object-contain"
                        alt=""
                      />
                      <span v-else class="text-xs font-bold text-white">{{ selectedCentre?.name.charAt(0) }}</span>
                    </div>
                    <span>{{ selectedCentre?.name ?? 'Select centre' }}</span>
                    <IconChevronDown
                      :size="14"
                      stroke-width="2"
                      class="shrink-0 text-muted-foreground transition-transform duration-200"
                      :class="{ 'rotate-180': centreDropdownOpen }"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-64 p-2">
                  <DropdownMenuItem
                    v-for="centre in teamFilteredCentres"
                    :key="centre.id"
                    class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm"
                    :class="selectedCentreId === centre.id ? 'bg-muted' : ''"
                    @click="selectCentre(centre.id)"
                  >
                    <div
                      class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded"
                      :style="centre.logoUrl ? {} : { backgroundColor: centre.logo ?? '#2563eb' }"
                    >
                      <img
                        v-if="centre.logoUrl"
                        :src="centre.logoUrl"
                        class="h-full w-full object-contain"
                        alt=""
                      />
                      <span v-else class="text-xs font-bold text-white">{{ centre.name.charAt(0) }}</span>
                    </div>
                    <span class="font-medium">{{ centre.name }}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <!-- Search -->
              <div class="relative w-full max-w-sm">
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search spaces…"
                  class="h-10 w-full rounded-lg border border-border bg-background px-4 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[1.5px] focus:border-foreground"
                  @keydown.enter="jumpToMatch"
                />
                <IconSearch :size="16" stroke-width="1.5" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>

            </div>

            <!-- Table -->
            <Table>
              <TableHeader>
                <TableRow class="border-border">
                  <TableHead class="w-[220px]">
                    <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('name')">
                      Space name
                      <IconChevronUp v-if="sort.key === 'name' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                      <IconChevronDown v-else-if="sort.key === 'name' && sort.dir === 'desc'" :size="12" class="text-foreground" />
                      <IconSelector v-else :size="12" class="opacity-30" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort('id')">
                      Space ID
                      <IconChevronUp v-if="sort.key === 'id' && sort.dir === 'asc'" :size="12" class="text-foreground" />
                      <IconChevronDown v-else-if="sort.key === 'id' && sort.dir === 'desc'" :size="12" class="text-foreground" />
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
                  v-for="space in filteredSpaces"
                  :key="space.id"
                  :ref="el => { if (el) rowRefs[space.id] = el as HTMLElement }"
                  class="border-border"
                  :class="{ 'row-highlight': highlightedId === space.id }"
                >
                  <TableCell class="py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted text-muted-foreground">
                        <IconBuildingStore :size="16" stroke-width="1.5" />
                      </div>
                      <span class="text-sm font-medium text-foreground">{{ space.name }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="py-3 font-mono text-xs text-muted-foreground">{{ space.id }}</TableCell>
                  <TableCell class="py-3 text-center">
                    <span
                      class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                      :class="space.listed === false ? 'bg-[#fef9f0] text-[#d97706]' : 'bg-[#f2fbf8] text-[#4dbd9f]'"
                    >
                      {{ space.listed === false ? 'Unlisted' : 'Listed' }}
                    </span>
                  </TableCell>
                  <TableCell class="py-3 pr-0 text-right">
                    <div class="inline-flex items-center gap-2">
                      <TooltipProvider :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span :class="!can('edit:spaces') ? 'cursor-not-allowed' : ''">
                              <Button variant="outline" size="sm" class="h-8 px-4 text-sm font-medium disabled:pointer-events-none" :disabled="!can('edit:spaces')" @click="openEditSpace(space)">
                                Edit space
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent v-if="!can('edit:spaces')" side="top">
                            <p class="text-xs">This action can only be taken by admins</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span :class="!can('edit:spaces') ? 'cursor-not-allowed' : ''">
                              <Button
                                variant="outline"
                                size="sm"
                                class="h-8 px-4 text-sm font-medium disabled:pointer-events-none"
                                :disabled="!can('edit:spaces')"
                                @click="promptToggleListed(space)"
                              >
                                {{ space.listed === false ? 'List' : 'Unlist' }}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent v-if="!can('edit:spaces')" side="top">
                            <p class="text-xs">This action can only be taken by admins</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow v-if="filteredSpaces.length === 0">
                  <TableCell colspan="4" class="py-12 text-center text-sm text-muted-foreground">
                    {{ searchQuery ? 'No spaces match your search.' : 'No spaces found for this centre.' }}
                  </TableCell>
                </TableRow>

              </TableBody>
            </Table>

          </div>
        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- ── List / Unlist confirm overlay ────────────────────── -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="confirmListingOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/50" @click="confirmListingOpen = false" />
        <div class="relative z-10 w-full max-w-[480px] rounded-xl border border-border bg-background shadow-2xl">
          <div class="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">
                {{ confirmListingSpace?.listed === false ? 'List space' : 'Unlist space' }}
              </h2>
              <p class="text-sm text-muted-foreground">{{ confirmListingSpace?.name }}</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="confirmListingOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-foreground">
              {{ confirmListingSpace?.listed === false
                ? 'This space will become visible to tenants and available for enquiry.'
                : 'This space will be hidden from tenants and removed from your active listings.'
              }}
            </p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="outline" class="h-10 px-5 text-sm font-medium" @click="confirmListingOpen = false">
              Cancel
            </Button>
            <Button class="h-10 px-5 text-sm font-medium" @click="confirmToggleListed">
              {{ confirmListingSpace?.listed === false ? 'List space' : 'Unlist space' }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Add / Edit space modal ───────────────────────────────── -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="editSpaceOpen" class="fixed inset-12 z-50 flex justify-center">
        <div class="fixed inset-0 bg-black/50" @click="editSpaceOpen = false" />
        <div class="relative z-10 flex h-full w-full max-w-[964px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">

          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between border-b border-border px-8 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">{{ spaceModalMode === 'create' ? 'Add new space' : 'Edit space' }}</h2>
              <p class="text-sm text-muted-foreground">{{ spaceModalMode === 'create' ? 'Fill in the details below to add a new space.' : editSpaceTarget?.name }}</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="editSpaceOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>

          <!-- Scrollable body -->
          <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="mx-auto max-w-[900px] px-8 py-8">
              <div class="flex flex-col gap-10">

                <!-- Centre (new space only) -->
                <section v-if="spaceModalMode === 'create'" class="flex flex-col gap-6">
                  <h3 class="text-sm font-semibold text-foreground">Centre</h3>
                  <FloatingLabelSelect v-model="spaceDraft.centreId" label="Assigned centre" :required="true">
                    <SelectItem v-for="c in teamFilteredCentres" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </SelectItem>
                  </FloatingLabelSelect>
                </section>

                <!-- Identity -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-sm font-semibold text-foreground">Identity</h3>
                  <div class="grid grid-cols-2 gap-5">
                    <FloatingLabelInput v-model="spaceDraft.name" label="Space name" :required="true" />
                    <FloatingLabelSelect v-model="spaceDraft.floor" label="Floor" :required="true">
                      <SelectItem v-for="f in floorOptions" :key="f" :value="f">{{ f }}</SelectItem>
                    </FloatingLabelSelect>
                  </div>
                  <!-- Use case -->
                  <div class="flex flex-col gap-3">
                    <span class="text-sm text-muted-foreground">Use case<span class="ml-0.5 text-foreground">*</span></span>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="uc in useCaseOptions"
                        :key="uc"
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors"
                        :class="spaceDraft.type === uc
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-transparent text-foreground hover:bg-muted'"
                        @click="spaceDraft.type = spaceDraft.type === uc ? '' : uc"
                      >
                        <IconCheck v-if="spaceDraft.type === uc" :size="12" stroke-width="2.5" />
                        {{ uc }}
                      </button>
                    </div>
                  </div>
                </section>

                <!-- Description -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-sm font-semibold text-foreground">Description</h3>
                  <div class="relative w-full pt-2">
                    <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
                      Description<span class="ml-0.5">*</span>
                    </span>
                    <textarea
                      v-model="spaceDraft.description"
                      rows="4"
                      class="w-full rounded-lg border border-border bg-background px-4 pb-3 pt-6 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px] resize-none"
                    />
                  </div>
                </section>

                <!-- Images -->
                <section class="flex flex-col gap-6">
                  <div>
                    <h3 class="text-sm font-semibold text-foreground">Images</h3>
                    <p class="mt-1 text-xs text-muted-foreground">At least 3 images required.<span class="ml-0.5">*</span></p>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <div
                      v-for="(img, i) in spaceDraft.images"
                      :key="i"
                      class="relative h-24 w-32 overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <img :src="img" class="h-full w-full object-cover" />
                      <button
                        type="button"
                        class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
                        @click="spaceDraft.images.splice(i, 1)"
                      >
                        <IconX :size="10" stroke-width="2" />
                      </button>
                      <button
                        v-if="spaceDraft.thumbnailIndex !== i"
                        type="button"
                        class="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-xs text-foreground hover:bg-background"
                        @click="spaceDraft.thumbnailIndex = i"
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
                      @click="triggerSpaceImageUpload"
                    >
                      <IconPlus :size="20" stroke-width="1.5" />
                      <span class="text-xs">Add image</span>
                    </button>
                  </div>
                </section>

                <!-- Dimensions -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-sm font-semibold text-foreground">Dimensions</h3>
                  <div class="grid grid-cols-3 gap-5">
                    <FloatingLabelInput v-model.number="spaceDraft.length" label="Length (m)" type="number" />
                    <FloatingLabelInput v-model.number="spaceDraft.width" label="Width (m)" type="number" />
                    <FloatingLabelInput v-model.number="spaceDraft.height" label="Height (m)" type="number" />
                  </div>
                </section>

                <!-- Rates -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-sm font-semibold text-foreground">Rates</h3>
                  <div class="grid grid-cols-2 gap-5">
                    <FloatingLabelInput v-model.number="spaceDraft.pricePerDay" label="Daily rate (€)" type="number" />
                    <FloatingLabelInput v-model.number="spaceDraft.pricePerWeekend" label="Weekend rate (€)" type="number" />
                    <FloatingLabelInput v-model.number="spaceDraft.pricePerWeek" label="Weekly rate (€)" type="number" />
                    <FloatingLabelInput v-model.number="spaceDraft.pricePerMonth" label="Monthly rate (€)" type="number" />
                  </div>
                </section>

                <!-- Amenities -->
                <section class="flex flex-col gap-6">
                  <h3 class="text-sm font-semibold text-foreground">Amenities</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="amenity in allSpaceAmenities"
                      :key="amenity"
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
                      :class="spaceDraft.amenities.includes(amenity)
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-transparent text-foreground hover:bg-muted'"
                      @click="toggleSpaceAmenity(amenity)"
                    >
                      <IconCheck v-if="spaceDraft.amenities.includes(amenity)" :size="12" stroke-width="2.5" />
                      {{ amenity }}
                    </button>
                  </div>
                  <div class="flex items-center gap-3">
                    <input
                      v-model="newSpaceAmenity"
                      type="text"
                      placeholder="Add new amenity…"
                      class="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground focus:border-[1.5px]"
                      @keydown.enter.prevent="addSpaceAmenity"
                    />
                    <Button variant="outline" size="sm" class="h-9 px-4 text-sm" :disabled="!newSpaceAmenity.trim()" @click="addSpaceAmenity">
                      Add
                    </Button>
                  </div>
                </section>

              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex shrink-0 items-center justify-end gap-3 border-t border-border px-8 py-5">
            <Button variant="outline" class="h-10 px-5 text-sm font-medium" @click="editSpaceOpen = false">
              Cancel
            </Button>
            <Button class="h-10 px-5 text-sm font-medium" :disabled="!isSpaceFormValid" @click="saveSpaceEdit">
              {{ spaceModalMode === 'create' ? 'Add space' : 'Save changes' }}
            </Button>
          </div>

        </div>
      </div>
    </Transition>
    <input ref="spaceImageFileInputRef" type="file" accept="image/*" class="sr-only" @change="handleSpaceImageUpload" />
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
.centre-auto-selected {
  animation: row-search-pulse 0.9s ease-in-out 3;
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
  IconBuildingStore,
} from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FloatingLabelSelect,
  SelectItem,
} from '@/components/ui/select'
import { FloatingLabelInput } from '@/components/ui/input'
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

interface Space {
  id: string
  centreId: string
  name: string
  type: string
  floor: string
  zone: string
  sqm: number | null
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance'
  listed?: boolean
  pricePerDay: number
  pricePerWeek: number
  pricePerWeekend?: number
  pricePerMonth?: number
  minDurationDays: number
  features: string[]
  description?: string
  images?: string[]
  thumbnailIndex?: number
  length?: number
  width?: number
  height?: number
  amenities?: string[]
}

interface Centre {
  id: string
  name: string
  logo: string
  logoUrl?: string
}

interface TeamCentre { id: string; name: string }
interface Team { id: string; name: string; logo: string; centres: TeamCentre[] }

const LAST_CENTRE_KEY = 'fillit:last-selected-centre'
const LAST_CENTRE_KEY_SPACES = 'fillit:last-selected-centre-spaces'

// ── Data ──────────────────────────────────────────────────────
const spaces = ref<Space[]>([])
const centres = ref<Centre[]>([])
const teams = ref<Team[]>([])
const selectedCentreId = ref('')
const centreAutoSelected = ref(false)

const { activeTeamId } = useTeamContext()
const { can } = useAppContext()

onMounted(async () => {
  const [spacesData, centresData, teamsData] = await Promise.all([
    $fetch<{ spaces: Space[] }>('/api/spaces'),
    $fetch<{ centres: Centre[] }>('/api/centres'),
    $fetch<{ teams: Team[] }>('/api/teams'),
  ])
  spaces.value = spacesData.spaces
  centres.value = centresData.centres
  teams.value = teamsData.teams

  const teamCentreIds = getTeamCentreIds(activeTeamId.value, teamsData.teams)
  const sorted = [...centresData.centres]
    .filter(c => teamsData.teams.length <= 1 || teamCentreIds.includes(c.id))
    .sort((a, b) => a.name.localeCompare(b.name))
  const last = typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_CENTRE_KEY) : null
  if (last && sorted.find(c => c.id === last)) {
    selectedCentreId.value = last
  } else if (sorted.length > 0) {
    selectedCentreId.value = sorted[0].id
  }

  if (typeof localStorage !== 'undefined' && localStorage.getItem('fillit:centre-auto-selected')) {
    localStorage.removeItem('fillit:centre-auto-selected')
    centreAutoSelected.value = true
    setTimeout(() => { centreAutoSelected.value = false }, 3000)
  }
})

const sortedCentresAlpha = computed(() =>
  [...centres.value].sort((a, b) => a.name.localeCompare(b.name))
)

const selectedCentre = computed(() =>
  centres.value.find(c => c.id === selectedCentreId.value) ?? null
)

function selectCentre(id: string) {
  selectedCentreId.value = id
  if (typeof localStorage !== 'undefined') localStorage.setItem(LAST_CENTRE_KEY, id)
}

function getTeamCentreIds(teamId: string, teamsList = teams.value): string[] {
  const team = teamsList.find(t => t.id === teamId)
  return team?.centres?.map(c => c.id) ?? []
}

const teamFilteredCentres = computed(() => {
  if (teams.value.length <= 1) return sortedCentresAlpha.value
  const ids = getTeamCentreIds(activeTeamId.value)
  return sortedCentresAlpha.value.filter(c => ids.includes(c.id))
})

async function saveSpaces() {
  await $fetch('/api/spaces', { method: 'PUT', body: { spaces: spaces.value } })
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

// ── Search & highlight ────────────────────────────────────────
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const highlightedId = ref<string | null>(null)
const rowRefs = ref<Record<string, HTMLElement>>({})

function jumpToMatch() {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return
  const match = filteredSpaces.value.find(s =>
    s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
  )
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

const filteredSpaces = computed(() => {
  let list = spaces.value.filter(s => s.centreId === selectedCentreId.value)

  if (!sort.key) return list
  return [...list].sort((a, b) => {
    const derive = (s: Space) => sort.key === 'status'
      ? (s.listed === false ? 'unlisted' : 'listed')
      : String((s as any)[sort.key] ?? '').toLowerCase()
    const cmp = derive(a).localeCompare(derive(b), undefined, { numeric: true })
    return sort.dir === 'asc' ? cmp : -cmp
  })
})

// ── List / Unlist ─────────────────────────────────────────────
const confirmListingOpen = ref(false)
const confirmListingSpace = ref<Space | null>(null)

function promptToggleListed(space: Space) {
  confirmListingSpace.value = space
  confirmListingOpen.value = true
}

function confirmToggleListed() {
  const space = confirmListingSpace.value
  if (!space) return
  const idx = spaces.value.findIndex(s => s.id === space.id)
  if (idx !== -1) {
    spaces.value[idx] = { ...spaces.value[idx], listed: space.listed === false }
    saveSpaces()
  }
  confirmListingOpen.value = false
  confirmListingSpace.value = null
}

// ── Add / Edit space ──────────────────────────────────────────
const editSpaceOpen = ref(false)
const editSpaceTarget = ref<Space | null>(null)
const centreDropdownOpen = ref(false)
const spaceModalMode = ref<'create' | 'edit'>('create')
const spaceImageFileInputRef = ref<HTMLInputElement | null>(null)

const floorOptions = ['Lower ground', 'Ground', '1st', '2nd', '3rd']
const useCaseOptions = ['Pop-up', 'Kiosk', 'Stand', 'Display', 'External']

const defaultSpaceAmenities = [
  'Power outlets', 'Wi-Fi access', 'Storage', 'Lighting',
  'Water access', 'Climate control', 'Security camera', 'Accessible location',
]
const extraSpaceAmenities = ref<string[]>([])
const newSpaceAmenity = ref('')

const allSpaceAmenities = computed(() => {
  const combined = [...defaultSpaceAmenities, ...extraSpaceAmenities.value]
  spaceDraft.value.amenities.forEach(a => { if (!combined.includes(a)) combined.push(a) })
  return combined
})

function toggleSpaceAmenity(amenity: string) {
  const idx = spaceDraft.value.amenities.indexOf(amenity)
  if (idx === -1) spaceDraft.value.amenities.push(amenity)
  else spaceDraft.value.amenities.splice(idx, 1)
}

function addSpaceAmenity() {
  const val = newSpaceAmenity.value.trim()
  if (!val || allSpaceAmenities.value.includes(val)) return
  extraSpaceAmenities.value.push(val)
  spaceDraft.value.amenities.push(val)
  newSpaceAmenity.value = ''
}

type SpaceDraftShape = {
  centreId: string
  name: string
  type: string
  floor: string
  description: string
  images: string[]
  thumbnailIndex: number
  length: number
  width: number
  height: number
  pricePerDay: number
  pricePerWeekend: number
  pricePerWeek: number
  pricePerMonth: number
  amenities: string[]
}

const blankSpaceDraft = (): SpaceDraftShape => ({
  centreId: selectedCentreId.value,
  name: '',
  type: '',
  floor: '',
  description: '',
  images: [],
  thumbnailIndex: 0,
  length: 0,
  width: 0,
  height: 0,
  pricePerDay: 0,
  pricePerWeekend: 0,
  pricePerWeek: 0,
  pricePerMonth: 0,
  amenities: [],
})

const spaceDraft = ref<SpaceDraftShape>(blankSpaceDraft())

const isSpaceFormValid = computed(() => {
  const d = spaceDraft.value
  const imageOk = spaceModalMode.value === 'create' ? d.images.length >= 3 : true
  return (
    !!d.centreId &&
    !!d.name.trim() &&
    !!d.floor &&
    !!d.type &&
    !!d.description.trim() &&
    imageOk
  )
})

function triggerSpaceImageUpload() {
  spaceImageFileInputRef.value?.click()
}

function handleSpaceImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  spaceDraft.value.images.push(URL.createObjectURL(file))
  ;(e.target as HTMLInputElement).value = ''
}

function openAddSpace() {
  spaceModalMode.value = 'create'
  editSpaceTarget.value = null
  spaceDraft.value = blankSpaceDraft()
  extraSpaceAmenities.value = []
  newSpaceAmenity.value = ''
  editSpaceOpen.value = true
}

function openEditSpace(space: Space) {
  spaceModalMode.value = 'edit'
  editSpaceTarget.value = space
  spaceDraft.value = {
    centreId: space.centreId,
    name: space.name,
    type: space.type ?? '',
    floor: space.floor ?? '',
    description: space.description ?? '',
    images: [...(space.images ?? [])],
    thumbnailIndex: space.thumbnailIndex ?? 0,
    length: space.length ?? 0,
    width: space.width ?? 0,
    height: space.height ?? 0,
    pricePerDay: space.pricePerDay ?? 0,
    pricePerWeekend: space.pricePerWeekend ?? 0,
    pricePerWeek: space.pricePerWeek ?? 0,
    pricePerMonth: space.pricePerMonth ?? 0,
    amenities: [...(space.amenities ?? space.features ?? [])],
  }
  extraSpaceAmenities.value = []
  newSpaceAmenity.value = ''
  editSpaceOpen.value = true
}

function saveSpaceEdit() {
  const d = spaceDraft.value
  const sqm = d.length && d.width ? Math.round(d.length * d.width * 100) / 100 : null

  if (spaceModalMode.value === 'create') {
    const newId = `space-${Date.now()}`
    spaces.value.push({
      id: newId,
      centreId: d.centreId,
      name: d.name,
      type: d.type,
      floor: d.floor,
      zone: '',
      sqm,
      status: 'Available',
      listed: false,
      pricePerDay: d.pricePerDay,
      pricePerWeek: d.pricePerWeek,
      pricePerWeekend: d.pricePerWeekend || undefined,
      pricePerMonth: d.pricePerMonth || undefined,
      minDurationDays: 1,
      features: d.amenities,
      description: d.description,
      images: d.images,
      thumbnailIndex: d.thumbnailIndex,
      length: d.length || undefined,
      width: d.width || undefined,
      height: d.height || undefined,
      amenities: d.amenities,
    })
    saveSpaces()
    editSpaceOpen.value = false
    editSpaceTarget.value = null
    // Switch to the relevant centre and pulse the new row
    selectedCentreId.value = d.centreId
    if (typeof localStorage !== 'undefined') localStorage.setItem(LAST_CENTRE_KEY, d.centreId)
    nextTick(() => {
      highlightedId.value = newId
      const el = rowRefs.value[newId]
      if (el) {
        const row = (el as any).$el ?? el
        row.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      }
      setTimeout(() => { highlightedId.value = null }, 2100)
    })
  } else {
    if (!editSpaceTarget.value) return
    const idx = spaces.value.findIndex(s => s.id === editSpaceTarget.value!.id)
    if (idx === -1) return
    spaces.value[idx] = {
      ...spaces.value[idx],
      name: d.name,
      type: d.type,
      floor: d.floor,
      sqm: d.length && d.width ? Math.round(d.length * d.width * 100) / 100 : spaces.value[idx].sqm,
      pricePerDay: d.pricePerDay,
      pricePerWeek: d.pricePerWeek,
      pricePerWeekend: d.pricePerWeekend || undefined,
      pricePerMonth: d.pricePerMonth || undefined,
      features: d.amenities,
      description: d.description,
      images: d.images,
      thumbnailIndex: d.thumbnailIndex,
      length: d.length || undefined,
      width: d.width || undefined,
      height: d.height || undefined,
      amenities: d.amenities,
    }
    saveSpaces()
    editSpaceOpen.value = false
    editSpaceTarget.value = null
  }
}
</script>
