<script lang="ts" setup>
import type { RangeCalendarRootEmits, RangeCalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { RangeCalendarRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarNextButton,
  RangeCalendarPrevButton,
} from "."

const props = defineProps<RangeCalendarRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<RangeCalendarRootEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)

function formatMonth(calDate: { year: number; month: number }) {
  return new Date(calDate.year, calDate.month - 1, 1)
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}
</script>

<template>
  <RangeCalendarRoot
    v-slot="{ grid, weekDays }"
    :class="cn('p-5', props.class)"
    v-bind="forwarded"
  >
    <div class="flex gap-8">
      <div
        v-for="(month, monthIndex) in grid"
        :key="month.value.toString()"
        class="flex flex-1 flex-col gap-4"
      >
        <!-- Month header — nav buttons on outer edges only -->
        <div class="flex items-center">
          <!-- Prev button on first month's left -->
          <RangeCalendarPrevButton v-if="monthIndex === 0" class="shrink-0" />
          <span v-else class="h-7 w-7 shrink-0" />

          <!-- Month title centred -->
          <span class="flex-1 text-center text-sm font-semibold text-foreground">
            {{ formatMonth(month.value) }}
          </span>

          <!-- Next button on last month's right -->
          <RangeCalendarNextButton v-if="monthIndex === grid.length - 1" class="shrink-0" />
          <span v-else class="h-7 w-7 shrink-0" />
        </div>

        <!-- Day-of-week row -->
        <RangeCalendarGrid>
          <RangeCalendarGridHead>
            <RangeCalendarGridRow class="flex">
              <RangeCalendarHeadCell
                v-for="day in weekDays"
                :key="day"
                class="w-9 text-center text-xs font-medium text-muted-foreground"
              >
                {{ day }}
              </RangeCalendarHeadCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridHead>

          <!-- Date cells -->
          <RangeCalendarGridBody>
            <RangeCalendarGridRow
              v-for="(weekDates, index) in month.rows"
              :key="`weekDate-${index}`"
              class="mt-1 flex w-full"
            >
              <RangeCalendarCell
                v-for="weekDate in weekDates"
                :key="weekDate.toString()"
                :date="weekDate"
                class="flex-1 p-0 text-center text-sm"
              >
                <RangeCalendarCellTrigger
                  :day="weekDate"
                  :month="month.value"
                  class="mx-auto h-9 w-9 rounded-full"
                />
              </RangeCalendarCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridBody>
        </RangeCalendarGrid>
      </div>
    </div>
  </RangeCalendarRoot>
</template>
