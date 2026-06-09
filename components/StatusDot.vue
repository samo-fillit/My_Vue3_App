<template>
  <span class="inline-flex items-center gap-2">
    <span class="relative flex h-2 w-2 shrink-0">
      <span
        v-if="pulse"
        class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        :class="dotClass"
      />
      <span class="relative inline-flex h-2 w-2 rounded-full" :class="dotClass" />
    </span>
    <span class="text-sm font-medium text-foreground">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
// Shared status indicator: a coloured dot + foreground label. Colour lives only
// in the dot (e.g. `bg-green-500`; `bg-muted-foreground` for neutral/terminal states).
// Pass `pulse` for active/live states to add a pinging halo.
defineProps<{
  label: string
  dotClass: string
  pulse?: boolean
}>()
</script>
