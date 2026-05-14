<script setup lang="ts">
import type { HTMLAttributes, InputHTMLAttributes } from 'vue'
import { useSlots } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string | number
  defaultValue?: string | number
  label: string
  required?: boolean
  type?: InputHTMLAttributes['type']
  placeholder?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const slots = useSlots()
</script>

<template>
  <div :class="cn('relative w-full pt-2', props.class)">
    <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
      {{ label }}<span v-if="required" class="ml-0.5">*</span>
    </span>
    <input
      v-model="modelValue"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="cn('h-[72px] w-full rounded-lg border border-border bg-background px-4 text-base text-foreground outline-none transition-[border-color,border-width] placeholder:text-muted-foreground/40 focus:border-1.5 focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50', slots.suffix && 'pr-12')"
    />
    <div v-if="slots.suffix" class="absolute right-4 top-[44px] -translate-y-1/2 flex items-center">
      <slot name="suffix" />
    </div>
  </div>
</template>
