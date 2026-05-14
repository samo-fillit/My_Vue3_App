<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="bookings-active" />
    <SidebarInset class="overflow-hidden">
      <div class="flex flex-col gap-8 p-12">
        <div>
          <p class="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-1">Preview</p>
          <h1 class="text-2xl font-bold text-foreground">App Sidebar</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Fillit navigation sidebar built on shadcn-vue primitives.
          </p>
        </div>
        <div class="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>← The sidebar on the left is the component.</p>
          <p>Use the <code class="rounded bg-muted px-1 py-0.5 text-xs font-mono text-foreground">active-item</code> prop to control the active state.</p>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/app-sidebar.vue'
</script>
