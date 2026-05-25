<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-security" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <h1 class="text-[28px] font-bold leading-8 text-foreground">Security</h1>

          <section class="flex flex-col gap-8">
            <div class="flex flex-col gap-3">
              <h3 class="text-xl font-semibold tracking-tight text-foreground">Password</h3>
              <p class="text-base text-muted-foreground">
                Password must be at least 8 digits long and contain at least one number and letter.
              </p>
            </div>
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <FloatingLabelInput
                  v-model="form.currentPassword"
                  label="Current password"
                  :type="showCurrent ? 'text' : 'password'"
                >
                  <template #suffix>
                    <button
                      type="button"
                      class="text-muted-foreground transition-colors hover:text-foreground"
                      @click="showCurrent = !showCurrent"
                    >
                      <IconEyeOff v-if="showCurrent" :size="20" stroke-width="1.5" />
                      <IconEye v-else :size="20" stroke-width="1.5" />
                    </button>
                  </template>
                </FloatingLabelInput>
                <p class="text-sm text-warning">Last updated 1 year ago</p>
              </div>
              <FloatingLabelInput
                v-model="form.newPassword"
                label="New password"
                type="password"
                :required="true"
              />
              <FloatingLabelInput
                v-model="form.confirmPassword"
                label="Confirm password"
                type="password"
                :required="true"
              />
            </div>
          </section>

          <Button class="h-14 min-w-[120px] self-start rounded-lg px-6">
            Update password
          </Button>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconEye, IconEyeOff } from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'

const showCurrent = ref(false)

const form = ref({
  currentPassword: '••••••••',
  newPassword: '',
  confirmPassword: '',
})
</script>
