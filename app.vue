<script setup lang="ts">
import { computed } from 'vue'
import { useAppContext } from '@/composables/useAppContext'

const { context } = useAppContext()
const themeClass = computed(() =>
  context.value.platform === 'eleaseloop' ? 'theme-eleaseloop' : ''
)
</script>

<template>
  <div :class="themeClass">
    <NuxtPage />
    <DevSwitcher />
  </div>
</template>
