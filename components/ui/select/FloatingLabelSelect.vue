<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SelectRoot, SelectTrigger, SelectValue, SelectIcon, SelectPortal, SelectContent } from 'reka-ui'
import { IconChevronDown } from '@tabler/icons-vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string
  label: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <!--
    Wrapper: same pt-2 offset as FloatingLabelInput so the label sits on the border.
    Accepts an outer `class` prop for layout overrides (e.g. flex-1 inside a flex row).
  -->
  <div :class="cn('relative w-full pt-2', props.class)">
    <!-- Floating label — identical markup/position to FloatingLabelInput -->
    <span
      class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground"
    >
      {{ label }}<span v-if="required" class="ml-0.5">*</span>
    </span>

    <SelectRoot
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="emits('update:modelValue', $event)"
    >
      <SelectTrigger
        :class="cn(
          'flex h-[72px] w-full items-center justify-between rounded-lg border border-border bg-background px-4 text-base text-foreground outline-none transition-[border-color,border-width]',
          'data-[placeholder]:text-muted-foreground/40',
          'focus:border-[1.5px] focus:border-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )"
      >
        <!--
          #trigger-prefix slot: optional content rendered before SelectValue.
          Useful for team avatars, country flags, or icons inside the trigger.
        -->
        <div class="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <slot name="trigger-prefix" />
          <SelectValue
            :placeholder="placeholder ?? ''"
            class="truncate text-start data-[placeholder]:text-muted-foreground/40"
          />
        </div>
        <SelectIcon as-child>
          <IconChevronDown :size="16" stroke-width="1.75" class="ml-2 shrink-0 text-muted-foreground/60" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="4"
          class="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-[var(--reka-select-trigger-width)]"
        >
          <div class="p-1">
            <slot />
          </div>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>
