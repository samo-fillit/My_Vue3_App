<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-profile" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <h1 class="text-[28px] font-bold leading-8 text-foreground">Profile</h1>

          <section class="flex flex-col gap-8">
            <h3 class="text-xl font-semibold tracking-tight text-foreground">Personal Details</h3>
            <div class="flex flex-col gap-4">
              <FloatingLabelInput
                v-model="form.email"
                label="Email"
                type="email"
                placeholder="sam@fillit.com"
                :required="true"
              />
              <FloatingLabelInput
                v-model="form.firstName"
                label="First name"
                :required="true"
              />
              <FloatingLabelInput
                v-model="form.lastName"
                label="Last name"
                :required="true"
              />
              <FloatingLabelInput
                v-model="form.phone"
                label="Phone number"
                type="tel"
                :required="true"
              />
              <FloatingLabelInput
                v-model="form.location"
                label="Location"
              />
            </div>
          </section>

          <Button class="h-14 min-w-[120px] self-start rounded-lg px-6">
            Save changes
          </Button>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'

const form = ref({
  email: '',
  firstName: 'Sam',
  lastName: "O'Brien",
  phone: '087 123 4567',
  location: '',
})
</script>
