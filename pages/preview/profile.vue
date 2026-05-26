<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="user-profile" />
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

          <Button class="h-14 min-w-[120px] self-start rounded-lg px-6" @click="save">
            Save changes
          </Button>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  teamId: string
  organisationId: string
  role: string
}

const form = ref({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  location: '',
})

let userId = ''

onMounted(async () => {
  const data = await $fetch<{ users: User[] }>('/api/users')
  const user = data.users[0]
  if (!user) return
  userId = user.id
  form.value = {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    location: user.location,
  }
})

async function save() {
  const data = await $fetch<{ users: User[] }>('/api/users')
  const idx = data.users.findIndex(u => u.id === userId)
  if (idx === -1) return
  data.users[idx] = { ...data.users[idx], ...form.value }
  await $fetch('/api/users', { method: 'PUT', body: data })
}
</script>
