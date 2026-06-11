<template>
  <span class="inline-flex items-center gap-2" :class="{ 'status-change-highlight': highlight }">
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
// Pass `highlight` briefly after a status change to draw the eye — a short
// scale + light↔dark pulse (see `pulseStatus` in the bookings page).
defineProps<{
  label: string
  dotClass: string
  pulse?: boolean
  highlight?: boolean
}>()
</script>

<style scoped>
/* Keep the single colour; just pulse the status size a couple of times. */
@keyframes status-change-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}
.status-change-highlight {
  transform-origin: left center;
  animation: status-change-pulse 1.36s ease-in-out 2;
}
</style>
