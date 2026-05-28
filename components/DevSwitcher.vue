<script setup lang="ts">
import { ref, computed } from 'vue'
import { IconChevronDown, IconCheck, IconCode } from '@tabler/icons-vue'
import {
  useAppContext,
  PLATFORMS,
  USER_TYPES,
  ROLES,
  type Platform,
  type UserType,
  type Role,
} from '@/composables/useAppContext'
import { useTeamContext } from '@/composables/useTeamContext'
import { ELEASELOOP_COUNTRIES } from '@/config/countries'

const { context, setPlatform, setUserType, setRole } = useAppContext()
const { activeCountry, setActiveCountry } = useTeamContext()

const openMenu = ref<'platform' | 'userType' | 'role' | 'country' | null>(null)

function toggle(menu: 'platform' | 'userType' | 'role' | 'country') {
  openMenu.value = openMenu.value === menu ? null : menu
}

function close() {
  openMenu.value = null
}

const platformLabel = computed(() => PLATFORMS.find(p => p.value === context.value.platform)?.label ?? '')
const userTypeLabel = computed(() => USER_TYPES.find(u => u.value === context.value.userType)?.label ?? '')
const roleLabel     = computed(() => ROLES.find(r => r.value === context.value.role)?.label ?? '')
const countryEmoji  = computed(() => ELEASELOOP_COUNTRIES.find(c => c.code === activeCountry.value)?.flag ?? '🌐')
</script>

<template>
  <!-- Click-outside backdrop -->
  <div v-if="openMenu" class="fixed inset-0 z-[199]" @click="close" />

  <!-- Floating toolbar -->
  <div class="dev-bar fixed bottom-3 right-3 z-[200] flex items-center select-none rounded-2xl">

    <!-- DEV badge -->
    <div class="flex items-center gap-1 border-r border-white/20 px-2.5 py-1.5">
      <IconCode :size="11" stroke-width="2.5" class="text-white/30" />
      <span class="text-[9px] font-bold uppercase tracking-widest text-white/30">Dev</span>
    </div>

    <!-- Platform selector -->
    <div class="relative">
      <button
        type="button"
        class="dev-btn flex items-center gap-1 border-r border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors"
        :class="{ 'bg-white/20': openMenu === 'platform' }"
        @click="toggle('platform')"
      >
        {{ platformLabel }}
        <IconChevronDown :size="10" stroke-width="3" class="text-white/40 transition-transform duration-150" :class="{ 'rotate-180': openMenu === 'platform' }" />
      </button>
      <Transition name="dropdown">
        <div v-if="openMenu === 'platform'" class="dev-dropdown absolute bottom-full left-0 mb-2 min-w-[130px] overflow-hidden rounded-xl">
          <button
            v-for="opt in PLATFORMS" :key="opt.value"
            type="button"
            class="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/20"
            :class="context.platform === opt.value ? 'text-white' : 'text-white/50'"
            @click="setPlatform(opt.value as Platform); close()"
          >
            {{ opt.label }}
            <IconCheck v-if="context.platform === opt.value" :size="11" stroke-width="3" class="text-white/50" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- User type selector -->
    <div class="relative">
      <button
        type="button"
        class="dev-btn flex items-center gap-1 border-r border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors"
        :class="{ 'bg-white/20': openMenu === 'userType' }"
        @click="toggle('userType')"
      >
        {{ userTypeLabel }}
        <IconChevronDown :size="10" stroke-width="3" class="text-white/40 transition-transform duration-150" :class="{ 'rotate-180': openMenu === 'userType' }" />
      </button>
      <Transition name="dropdown">
        <div v-if="openMenu === 'userType'" class="dev-dropdown absolute bottom-full left-0 mb-2 min-w-[130px] overflow-hidden rounded-xl">
          <button
            v-for="opt in USER_TYPES" :key="opt.value"
            type="button"
            class="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/20"
            :class="context.userType === opt.value ? 'text-white' : 'text-white/50'"
            @click="setUserType(opt.value as UserType); close()"
          >
            {{ opt.label }}
            <IconCheck v-if="context.userType === opt.value" :size="11" stroke-width="3" class="text-white/50" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- Role selector -->
    <div class="relative" :class="context.platform === 'eleaseloop' ? 'border-r border-white/20' : ''">
      <button
        type="button"
        class="dev-btn flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors"
        :class="[{ 'bg-white/20': openMenu === 'role' }, context.platform !== 'eleaseloop' ? 'rounded-r-2xl' : '']"
        @click="toggle('role')"
      >
        {{ roleLabel }}
        <IconChevronDown :size="10" stroke-width="3" class="text-white/40 transition-transform duration-150" :class="{ 'rotate-180': openMenu === 'role' }" />
      </button>
      <Transition name="dropdown">
        <div v-if="openMenu === 'role'" class="dev-dropdown absolute bottom-full right-0 mb-2 min-w-[130px] overflow-hidden rounded-xl">
          <button
            v-for="opt in ROLES" :key="opt.value"
            type="button"
            class="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/20"
            :class="context.role === opt.value ? 'text-white' : 'text-white/50'"
            @click="setRole(opt.value as Role); close()"
          >
            {{ opt.label }}
            <IconCheck v-if="context.role === opt.value" :size="11" stroke-width="3" class="text-white/50" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- Site country — eLeaseLoop only: simulates the URL subdomain (e.g. eleaseloop.com/es) -->
    <div v-if="context.platform === 'eleaseloop'" class="relative">
      <button
        type="button"
        class="dev-btn flex items-center gap-1.5 rounded-r-2xl px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors"
        :class="{ 'bg-white/20': openMenu === 'country' }"
        @click="toggle('country')"
      >
        <span class="text-sm leading-none">{{ countryEmoji }}</span>
        <span class="text-[10px] uppercase tracking-wider text-white/50">.com/{{ activeCountry }}</span>
        <IconChevronDown :size="10" stroke-width="3" class="text-white/40 transition-transform duration-150" :class="{ 'rotate-180': openMenu === 'country' }" />
      </button>
      <Transition name="dropdown">
        <div v-if="openMenu === 'country'" class="dev-dropdown absolute bottom-full right-0 mb-2 min-w-[160px] overflow-hidden rounded-xl">
          <div class="border-b border-white/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">Site country</div>
          <button
            v-for="c in ELEASELOOP_COUNTRIES" :key="c.code"
            type="button"
            class="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/20"
            :class="activeCountry === c.code ? 'text-white' : 'text-white/50'"
            @click="setActiveCountry(c.code); close()"
          >
            <span class="flex items-center gap-2">
              <span class="text-sm leading-none">{{ c.flag }}</span>
              {{ c.name }}
            </span>
            <IconCheck v-if="activeCountry === c.code" :size="11" stroke-width="3" class="text-white/50" />
          </button>
        </div>
      </Transition>
    </div>

  </div>
</template>

<style scoped>
/* Opaque dark bar */
.dev-bar {
  background: #1c1c1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.20);
}

/* Opaque dark dropdowns */
.dev-dropdown {
  background: #1c1c1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.dev-btn:hover {
  background: rgba(255, 255, 255, 0.07);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
