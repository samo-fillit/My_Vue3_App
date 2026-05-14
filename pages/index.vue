<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-8 bg-background p-8">
    <h1 class="text-4xl font-bold text-foreground">Design Lab</h1>

    <div class="flex flex-wrap gap-4 justify-center">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
    </div>

    <Card class="w-96">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>shadcn-vue is wired up and ready.</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <Label for="email">Email</Label>
          <Input id="email" type="email" placeholder="you@fillit.com" />
        </div>
        <Button class="w-full">Submit</Button>
      </CardContent>
    </Card>

    <div class="flex flex-col items-center gap-2">
      <p class="text-sm text-muted-foreground">Previews</p>
      <NuxtLink to="/preview" class="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Browse all previews →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>
