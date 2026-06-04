<script setup lang="ts">
import { computed } from 'vue'
import { useAppContext } from '@/composables/useAppContext'

const { context } = useAppContext()
const themeClass = computed(() =>
  context.value.platform === 'eleaseloop' ? 'theme-eleaseloop' : ''
)

// Apply the theme class to <body> as well as the wrapper. shadcn-vue / Reka UI
// overlays (dialogs, sheets, popovers, toasts, right panel) teleport to <body>,
// so they sit outside the wrapper div and would otherwise miss the theme's CSS
// variable overrides — falling back to the coral :root primary.
useHead({
  bodyAttrs: {
    class: themeClass,
  },
})
</script>

<template>
  <div :class="themeClass">
    <NuxtPage />
    <DevSwitcher />
  </div>
</template>
