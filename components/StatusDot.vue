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
@keyframes status-change-pulse {
  0%   { transform: scale(1);    background-color: transparent; }
  25%  { transform: scale(1.08); background-color: hsl(var(--foreground) / 0.10); }
  50%  { transform: scale(1);    background-color: transparent; }
  75%  { transform: scale(1.08); background-color: hsl(var(--foreground) / 0.10); }
  100% { transform: scale(1);    background-color: transparent; }
}
/* Negative margin offsets the padding so neighbours don't shift while it pulses. */
.status-change-highlight {
  margin: -2px -6px;
  padding: 2px 6px;
  border-radius: 6px;
  transform-origin: left center;
  animation: status-change-pulse 0.85s ease-in-out 2;
}
</style>
