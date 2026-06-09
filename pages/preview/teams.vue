<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="account-teams" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">

      <div class="flex-1 overflow-y-auto px-24 py-12">
        <div class="mx-auto flex w-full max-w-[1200px] flex-col gap-12">

          <!-- Page heading -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-3">
              <h1 class="text-[28px] font-bold leading-8 text-foreground">Teams & Permissions</h1>
              <p class="text-base text-muted-foreground">
                {{ isUserType('tenant') ? 'Manage your team members and roles.' : 'Manage team members, roles, and signing authorities.' }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <TooltipProvider :delay-duration="300">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <span :class="!can('edit:team') ? 'cursor-not-allowed' : ''">
                      <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('edit:team') || !selectedTeam" @click="selectedTeam && openEditTeam(selectedTeam)">
                        Edit team
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent v-if="!can('edit:team')" side="top">
                    <p class="text-xs">This action can only be taken by admins</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider :delay-duration="300">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <span :class="!can('create:team') ? 'cursor-not-allowed' : ''">
                      <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('create:team')" @click="createTeamOpen = true">
                        + Create team
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent v-if="!can('create:team')" side="top">
                    <p class="text-xs">This action can only be taken by admins</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Dialog v-model:open="inviteUserOpen">
                <TooltipProvider :delay-duration="300">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span :class="!can('invite:users') ? 'cursor-not-allowed' : ''">
                        <DialogTrigger as-child>
                          <Button size="sm" class="disabled:pointer-events-none" :disabled="!can('invite:users')">
                            + Invite user
                          </Button>
                        </DialogTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent v-if="!can('invite:users')" side="top">
                      <p class="text-xs">This action can only be taken by admins</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DialogContent class="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Invite a team member</DialogTitle>
                    <DialogDescription>
                      They'll receive an email invitation to join the team.
                    </DialogDescription>
                  </DialogHeader>
                  <div class="flex flex-col gap-4 py-4">
                    <div class="grid grid-cols-2 gap-4">
                      <FloatingLabelInput v-model="newInvite.firstName" label="First name" :required="true" />
                      <FloatingLabelInput v-model="newInvite.lastName" label="Last name" :required="true" />
                    </div>
                    <FloatingLabelInput v-model="newInvite.email" label="Email address" type="email" :required="true" />

                    <!-- Role -->
                    <FloatingLabelSelect v-model="newInvite.role" label="Role" :required="true">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Accounts">Accounts</SelectItem>
                    </FloatingLabelSelect>

                    <!-- Assign as signatory (landlord only) -->
                    <div v-if="!isUserType('tenant')" class="relative w-full pt-2">
                      <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
                        Assign as signatory
                      </span>
                      <Popover v-model:open="signatoryPopoverOpen">
                        <PopoverTrigger as-child>
                          <button
                            type="button"
                            class="flex h-[72px] w-full items-center rounded-lg border border-border bg-background px-4 text-base transition-colors hover:bg-muted/40"
                          >
                            <span :class="signatoryDisplay ? 'text-foreground' : 'text-muted-foreground/40'">
                              {{ signatoryDisplay ?? 'Not assigned' }}
                            </span>
                            <IconChevronDown
                              :size="16"
                              stroke-width="1.5"
                              class="ml-auto shrink-0 text-muted-foreground transition-transform duration-200"
                              :class="{ 'rotate-180': signatoryPopoverOpen }"
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          class="[width:var(--reka-popper-anchor-width)] p-2"
                          :side-offset="4"
                        >
                          <!-- Not assigned -->
                          <div
                            class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                            @click="newInvite.signatoryCentres = []"
                          >
                            <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="newInvite.signatoryCentres.length === 0 ? 'bg-accent-foreground' : 'bg-transparent'">
                              <IconCheck v-if="newInvite.signatoryCentres.length === 0" :size="11" stroke-width="3" class="text-background" />
                            </div>
                            <span class="text-sm text-muted-foreground">Not assigned</span>
                          </div>
                          <!-- Centres -->
                          <div
                            v-for="centre in centres"
                            :key="centre"
                            class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                            @click="toggleSignatoryCentre(centre)"
                          >
                            <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="newInvite.signatoryCentres.includes(centre) ? 'bg-accent-foreground' : 'bg-transparent'">
                              <IconCheck v-if="newInvite.signatoryCentres.includes(centre)" :size="11" stroke-width="3" class="text-background" />
                            </div>
                            <span class="text-sm text-foreground">{{ centre }}</span>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm" @click="inviteUserOpen = false">
                      Cancel
                    </Button>
                    <Button size="sm" @click="sendInvite">
                      Send invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <!-- Empty state -->
          <template v-if="!hasTeamData">
            <div class="flex flex-col items-center gap-3 py-20 text-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <IconInbox :size="22" class="text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">Nothing here yet</p>
                <p class="mt-1 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  This team is new — start by inviting your first member.
                </p>
              </div>
              <Button size="sm" class="mt-4" @click="inviteUserOpen = true">Invite member</Button>
            </div>
          </template>

          <!-- Tabs -->
          <Tabs v-else v-model="activeTab" class="flex flex-col gap-0">
            <TabsList class="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                v-for="tab in tabs"
                :key="tab.value"
                :value="tab.value"
                class="h-10 rounded-none border-b-2 border-transparent px-5 text-sm font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {{ tab.label }}
              </TabsTrigger>
            </TabsList>

            <!-- Active members -->
            <TabsContent value="active" class="mt-6">
              <div v-if="adminCount === 0" class="mb-5 flex items-center gap-3 rounded-lg border border-[#f5e38c] bg-[#fffdf0] px-4 py-3 text-sm text-[#b45309]">
                <IconAlertTriangle :size="16" stroke-width="1.5" class="shrink-0" />
                This team has no admin. Assign an admin role to at least one member.
              </div>
              <Table>
                <TableHeader>
                  <TableRow class="border-border">
                    <TableHead class="w-[240px]">
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(activeSort, 'name')">
                        Name
                        <IconChevronUp v-if="activeSort.key === 'name' && activeSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="activeSort.key === 'name' && activeSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <div class="inline-flex items-center gap-1.5">
                        <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(activeSort, 'role')">
                          Role
                          <IconChevronUp v-if="activeSort.key === 'role' && activeSort.dir === 'asc'" :size="12" class="text-foreground" />
                          <IconChevronDown v-else-if="activeSort.key === 'role' && activeSort.dir === 'desc'" :size="12" class="text-foreground" />
                          <IconSelector v-else :size="12" class="opacity-30" />
                        </button>
                        <button type="button" class="text-muted-foreground/50 transition-colors hover:text-muted-foreground" title="View roles & permissions" @click="rolesSheetOpen = true">
                          <IconInfoCircle :size="13" stroke-width="1.75" />
                        </button>
                      </div>
                    </TableHead>
                    <TableHead class="pl-8">
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(activeSort, 'status')">
                        Status
                        <IconChevronUp v-if="activeSort.key === 'status' && activeSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="activeSort.key === 'status' && activeSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead v-if="!isUserType('tenant')">
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(activeSort, 'signatoryCentres')">
                        Signatory
                        <IconChevronUp v-if="activeSort.key === 'signatoryCentres' && activeSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="activeSort.key === 'signatoryCentres' && activeSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead class="pr-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="member in sortedActiveMembers" :key="member.email" class="border-border" :class="{ 'row-new': newlyAddedEmail === member.email }">
                    <TableCell class="py-3">
                      <div class="flex flex-col gap-0.5">
                        <span class="text-sm font-medium text-foreground">{{ member.name }}</span>
                        <span class="text-sm text-muted-foreground">{{ member.email }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="py-3">
                      <TooltipProvider v-if="isLastAdmin(member)" :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <button
                              type="button"
                              class="inline-flex cursor-default items-center gap-1.5 text-sm text-foreground"
                            >
                              {{ member.role }}
                              <IconLock :size="13" stroke-width="1.5" class="text-muted-foreground/50" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" class="max-w-[220px] text-center text-xs">
                            Assign another admin before changing this role
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider v-else :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span :class="!can('change:user-roles') ? 'cursor-not-allowed' : ''">
                              <button
                                type="button"
                                class="group inline-flex items-center gap-1.5 text-sm text-foreground hover:font-semibold disabled:pointer-events-none disabled:opacity-60"
                                :disabled="!can('change:user-roles')"
                                @click="openChangeRole(member)"
                              >
                                {{ member.role }}
                                <IconPencil v-if="can('change:user-roles')" :size="13" stroke-width="1.5" class="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                              </button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent v-if="!can('change:user-roles')" side="top">
                            <p class="text-xs">This action can only be taken by admins</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell class="py-3 pl-8">
                      <StatusDot :label="member.status" :dot-class="member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'" />
                    </TableCell>
                    <TableCell v-if="!isUserType('tenant')" class="py-3">
                      <TooltipProvider :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span :class="!can('manage:signatories') ? 'cursor-not-allowed' : ''">
                              <button
                                type="button"
                                class="group inline-flex items-center gap-1.5 text-sm hover:font-semibold disabled:pointer-events-none disabled:opacity-60"
                                :class="(member.signatoryCentres ?? []).length ? 'text-foreground' : 'text-muted-foreground'"
                                :disabled="!can('manage:signatories')"
                                @click="openAssignSignatory(member)"
                              >
                                <span>{{ (member.signatoryCentres ?? []).length || '—' }}</span>
                                <IconPencil v-if="can('manage:signatories')" :size="13" stroke-width="1.5" class="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                              </button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent v-if="!can('manage:signatories')" side="top">
                            <p class="text-xs">This action can only be taken by admins</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell class="py-3 pr-0 text-center">
                      <div class="inline-flex items-center gap-2">
                        <TooltipProvider v-if="otherTeams.length > 0" :delay-duration="300">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <span :class="!can('move:centre-team') ? 'cursor-not-allowed' : ''">
                                <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('move:centre-team')" @click="openSwitchTeam(member)">
                                  Switch team
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent v-if="!can('move:centre-team')" side="top">
                              <p class="text-xs">This action can only be taken by admins</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider :delay-duration="300">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <span :class="(!can('edit:team') || isLastAdmin(member)) ? 'cursor-not-allowed' : ''">
                                <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('edit:team') || isLastAdmin(member)" @click="openRemoveConfirm(member)">
                                  Remove
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent v-if="!can('edit:team')" side="top">
                              <p class="text-xs">This action can only be taken by admins</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <!-- Pending invites -->
            <TabsContent value="pending" class="mt-6">
              <Table>
                <TableHeader>
                  <TableRow class="border-border">
                    <TableHead class="w-[240px]">
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(pendingSort, 'email')">
                        Email
                        <IconChevronUp v-if="pendingSort.key === 'email' && pendingSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="pendingSort.key === 'email' && pendingSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead class="pl-8">
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(pendingSort, 'status')">
                        Invite status
                        <IconChevronUp v-if="pendingSort.key === 'status' && pendingSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="pendingSort.key === 'status' && pendingSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(pendingSort, 'role')">
                        Role
                        <IconChevronUp v-if="pendingSort.key === 'role' && pendingSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="pendingSort.key === 'role' && pendingSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(pendingSort, 'invitedBy')">
                        Invited by
                        <IconChevronUp v-if="pendingSort.key === 'invitedBy' && pendingSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="pendingSort.key === 'invitedBy' && pendingSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(pendingSort, 'sentOn')">
                        Sent on
                        <IconChevronUp v-if="pendingSort.key === 'sentOn' && pendingSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="pendingSort.key === 'sentOn' && pendingSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead class="pr-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="invite in sortedPendingInvites" :key="invite.email" class="border-border">
                    <TableCell class="py-3 text-sm text-foreground">{{ invite.email }}</TableCell>
                    <TableCell class="py-3 pl-8">
                      <StatusDot :label="invite.status" :dot-class="invite.status === 'Pending Approval' ? 'bg-amber-500' : 'bg-green-500'" />
                    </TableCell>
                    <TableCell class="py-3">
                      <TooltipProvider :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span :class="!can('change:user-roles') ? 'cursor-not-allowed' : ''">
                              <button
                                type="button"
                                class="group inline-flex items-center gap-1.5 text-sm text-foreground hover:font-semibold disabled:pointer-events-none disabled:opacity-60"
                                :disabled="!can('change:user-roles')"
                                @click="openChangeRole(invite)"
                              >
                                {{ invite.role }}
                                <IconPencil v-if="can('change:user-roles')" :size="13" stroke-width="1.5" class="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                              </button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent v-if="!can('change:user-roles')" side="top">
                            <p class="text-xs">This action can only be taken by admins</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell class="py-3 text-sm text-muted-foreground">{{ invite.invitedBy }}</TableCell>
                    <TableCell class="py-3 text-sm text-muted-foreground">{{ invite.sentOn }}</TableCell>
                    <TableCell class="py-3 pr-0 text-center">
                      <div v-if="invite.status === 'Pending Approval'" class="inline-flex items-center gap-2">
                        <TooltipProvider :delay-duration="300">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <span :class="!can('action:pending-invites') ? 'cursor-not-allowed' : ''">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  class="disabled:pointer-events-none"
                                  :disabled="!can('action:pending-invites')"
                                  @click="openConfirm('decline', invite)"
                                >
                                  Decline
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent v-if="!can('action:pending-invites')" side="top">
                              <p class="text-xs">This action can only be taken by admins</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider :delay-duration="300">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <span :class="!can('action:pending-invites') ? 'cursor-not-allowed' : ''">
                                <Button
                                  size="sm"
                                  class="disabled:pointer-events-none"
                                  :disabled="!can('action:pending-invites')"
                                  @click="openConfirm('approve', invite)"
                                >
                                  Approve
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent v-if="!can('action:pending-invites')" side="top">
                              <p class="text-xs">This action can only be taken by admins</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <TooltipProvider v-else :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span :class="!can('action:pending-invites') ? 'cursor-not-allowed' : ''">
                              <Button
                                variant="outline"
                                size="sm"
                                class="disabled:pointer-events-none"
                                :disabled="!can('action:pending-invites')"
                                @click="openConfirm('withdraw', invite)"
                              >
                                Withdraw invite
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent v-if="!can('action:pending-invites')" side="top">
                            <p class="text-xs">This action can only be taken by admins</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <!-- External signatories -->
            <TabsContent value="signatories" class="mt-6">
              <div class="flex flex-col gap-6">
                <Table>
                  <TableHeader>
                    <TableRow class="border-border">
                      <TableHead class="w-[240px]">
                        <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(signSort, 'name')">
                          Name
                          <IconChevronUp v-if="signSort.key === 'name' && signSort.dir === 'asc'" :size="12" class="text-foreground" />
                          <IconChevronDown v-else-if="signSort.key === 'name' && signSort.dir === 'desc'" :size="12" class="text-foreground" />
                          <IconSelector v-else :size="12" class="opacity-30" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(signSort, 'organisation')">
                          Organisation
                          <IconChevronUp v-if="signSort.key === 'organisation' && signSort.dir === 'asc'" :size="12" class="text-foreground" />
                          <IconChevronDown v-else-if="signSort.key === 'organisation' && signSort.dir === 'desc'" :size="12" class="text-foreground" />
                          <IconSelector v-else :size="12" class="opacity-30" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(signSort, 'centres')">
                          Centre
                          <IconChevronUp v-if="signSort.key === 'centres' && signSort.dir === 'asc'" :size="12" class="text-foreground" />
                          <IconChevronDown v-else-if="signSort.key === 'centres' && signSort.dir === 'desc'" :size="12" class="text-foreground" />
                          <IconSelector v-else :size="12" class="opacity-30" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(signSort, 'addedBy')">
                          Added by
                          <IconChevronUp v-if="signSort.key === 'addedBy' && signSort.dir === 'asc'" :size="12" class="text-foreground" />
                          <IconChevronDown v-else-if="signSort.key === 'addedBy' && signSort.dir === 'desc'" :size="12" class="text-foreground" />
                          <IconSelector v-else :size="12" class="opacity-30" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(signSort, 'addedOn')">
                          Added on
                          <IconChevronUp v-if="signSort.key === 'addedOn' && signSort.dir === 'asc'" :size="12" class="text-foreground" />
                          <IconChevronDown v-else-if="signSort.key === 'addedOn' && signSort.dir === 'desc'" :size="12" class="text-foreground" />
                          <IconSelector v-else :size="12" class="opacity-30" />
                        </button>
                      </TableHead>
                      <TableHead class="pr-0" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="sig in sortedSignatories" :key="sig.email" class="border-border">
                      <TableCell class="py-3">
                        <div class="flex flex-col gap-0.5">
                          <span class="text-sm font-medium text-foreground">{{ sig.name }}</span>
                          <span class="text-sm text-muted-foreground">{{ sig.email }}</span>
                        </div>
                      </TableCell>
                      <TableCell class="py-3 text-sm text-muted-foreground">{{ sig.organisation || '—' }}</TableCell>
                      <TableCell class="py-3">
                        <TooltipProvider :delay-duration="300">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <span :class="!can('manage:signatories') ? 'cursor-not-allowed' : ''">
                                <button
                                  type="button"
                                  class="group inline-flex items-center gap-1.5 text-sm text-foreground hover:font-semibold disabled:pointer-events-none disabled:opacity-60"
                                  :disabled="!can('manage:signatories')"
                                  @click="openEditSignatoryCentres(sig)"
                                >
                                  <span :class="!(sig.centres?.length) ? 'text-muted-foreground' : ''">{{ sig.centres?.length === 1 ? sig.centres[0] : sig.centres?.length || '—' }}</span>
                                  <IconPencil v-if="can('manage:signatories')" :size="13" stroke-width="1.5" class="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                </button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent v-if="!can('manage:signatories')" side="top">
                              <p class="text-xs">This action can only be taken by admins</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell class="py-3 text-sm text-muted-foreground">{{ sig.addedBy }}</TableCell>
                      <TableCell class="py-3 text-sm text-muted-foreground">{{ sig.addedOn }}</TableCell>
                      <TableCell class="py-3 pr-0 text-center">
                        <TooltipProvider :delay-duration="300">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <span :class="!can('manage:signatories') ? 'cursor-not-allowed' : ''">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  class="disabled:pointer-events-none"
                                  :disabled="!can('manage:signatories')"
                                  @click="openRemoveSignatoryConfirm(sig)"
                                >
                                  Remove
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent v-if="!can('manage:signatories')" side="top">
                              <p class="text-xs">This action can only be taken by admins</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Dialog v-model:open="addSignatoryOpen">
                  <TooltipProvider :delay-duration="300">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <span :class="!can('manage:signatories') ? 'cursor-not-allowed' : ''">
                          <DialogTrigger as-child>
                            <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('manage:signatories')">
                              + Add signatory
                            </Button>
                          </DialogTrigger>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent v-if="!can('manage:signatories')" side="top">
                        <p class="text-xs">This action can only be taken by admins</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DialogContent class="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Add external signatory</DialogTitle>
                      <DialogDescription>
                        Add an external signatory to sign lease agreements on behalf of a centre.
                      </DialogDescription>
                    </DialogHeader>
                    <div class="flex flex-col gap-4 py-4">
                      <FloatingLabelInput
                        v-model="newSignatory.name"
                        label="Full name"
                        :required="true"
                      />
                      <FloatingLabelInput
                        v-model="newSignatory.email"
                        label="Email address"
                        type="email"
                        :required="true"
                      />
                      <FloatingLabelInput
                        v-model="newSignatory.organisation"
                        label="Organisation"
                      />
                      <div class="relative w-full pt-2">
                        <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
                          Centres<span class="ml-0.5">*</span>
                        </span>
                        <Popover v-model:open="newSignatoryPopoverOpen">
                          <PopoverTrigger as-child>
                            <button
                              type="button"
                              class="flex h-[72px] w-full items-center rounded-lg border border-border bg-background px-4 text-base transition-colors hover:bg-muted/40"
                            >
                              <span :class="newSignatoryDisplay ? 'text-foreground' : 'text-muted-foreground/40'">
                                {{ newSignatoryDisplay ?? 'Select centres' }}
                              </span>
                              <IconChevronDown
                                :size="16"
                                stroke-width="1.5"
                                class="ml-auto shrink-0 text-muted-foreground transition-transform duration-200"
                                :class="{ 'rotate-180': newSignatoryPopoverOpen }"
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" class="[width:var(--reka-popper-anchor-width)] p-2" :side-offset="4">
                            <div
                              v-for="centre in centreNames"
                              :key="centre"
                              class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                              @click="toggleNewSignatoryCentre(centre)"
                            >
                              <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="newSignatory.centres.includes(centre) ? 'bg-accent-foreground' : 'bg-transparent'">
                                <IconCheck v-if="newSignatory.centres.includes(centre)" :size="11" stroke-width="3" class="text-background" />
                              </div>
                              <span class="text-sm text-foreground">{{ centre }}</span>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        @click="addSignatoryOpen = false"
                      >
                        Cancel
                      </Button>
                      <Button size="sm" @click="addSignatory">
                        Add signatory
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
            <!-- Assets -->
            <TabsContent value="assets" class="mt-6">
              <Table>
                <TableHeader>
                  <TableRow class="border-border">
                    <TableHead class="w-[280px]">
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(assetsSort, 'name')">
                        Centre name
                        <IconChevronUp v-if="assetsSort.key === 'name' && assetsSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="assetsSort.key === 'name' && assetsSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(assetsSort, 'centreId')">
                        Centre ID
                        <IconChevronUp v-if="assetsSort.key === 'centreId' && assetsSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="assetsSort.key === 'centreId' && assetsSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(assetsSort, 'country')">
                        Country
                        <IconChevronUp v-if="assetsSort.key === 'country' && assetsSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="assetsSort.key === 'country' && assetsSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(assetsSort, 'location')">
                        City
                        <IconChevronUp v-if="assetsSort.key === 'location' && assetsSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="assetsSort.key === 'location' && assetsSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead class="pl-8">
                      <button type="button" class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground" @click="toggleSort(assetsSort, 'status')">
                        Status
                        <IconChevronUp v-if="assetsSort.key === 'status' && assetsSort.dir === 'asc'" :size="12" class="text-foreground" />
                        <IconChevronDown v-else-if="assetsSort.key === 'status' && assetsSort.dir === 'desc'" :size="12" class="text-foreground" />
                        <IconSelector v-else :size="12" class="opacity-30" />
                      </button>
                    </TableHead>
                    <TableHead class="pr-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="sortedAssets.length === 0">
                    <TableCell colspan="6" class="py-16 text-center text-sm text-muted-foreground">
                      No centres have been added to this team yet.
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="centre in sortedAssets" :key="centre.id" class="border-border">
                    <TableCell class="py-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded"
                          :style="centre.logoUrl ? {} : { backgroundColor: centre.logo ?? '#2563eb' }"
                        >
                          <img v-if="centre.logoUrl" :src="centre.logoUrl" class="h-full w-full object-contain" :alt="centre.name" />
                          <span v-else class="text-xs font-bold text-white">{{ centre.name.charAt(0) }}</span>
                        </div>
                        <span class="text-sm font-medium text-foreground">{{ centre.name }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="py-3 font-mono text-xs text-muted-foreground">{{ centre.centreId }}</TableCell>
                    <TableCell class="py-3 text-sm text-muted-foreground">{{ countryAbbr(centre.country) }}</TableCell>
                    <TableCell class="py-3 text-sm text-muted-foreground">{{ centre.location }}</TableCell>
                    <TableCell class="py-3 pl-8">
                      <StatusDot :label="centre.status" :dot-class="centre.status === 'Listed' ? 'bg-green-500' : 'bg-amber-500'" />
                    </TableCell>
                    <TableCell class="py-3 pr-0 text-right">
                      <TooltipProvider v-if="otherTeams.length > 0" :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span :class="!can('move:centre-team') ? 'cursor-not-allowed' : ''">
                              <Button variant="outline" size="sm" class="disabled:pointer-events-none" :disabled="!can('move:centre-team')" @click="openSwitchCentreTeam(centre)">
                                Switch team
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent v-if="!can('move:centre-team')" side="top">
                            <p class="text-xs">This action can only be taken by admins</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

          </Tabs>

        </div>
      </div>

    </SidebarInset>
  </SidebarProvider>

  <!-- Edit team -->
  <Dialog v-model:open="editTeamOpen" @update:open="val => { if (!val) { showDeleteConfirm = false; deleteConfirmText = '' } }">
    <DialogContent class="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>Edit team</DialogTitle>
        <DialogDescription>Update the team name and logo colour.</DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-6 py-4">
        <FloatingLabelInput v-model="editTeamDraft.name" label="Team name" :required="true" />
        <div class="flex flex-col gap-3">
          <span class="text-sm font-medium text-foreground">Logo colour</span>
          <div class="flex items-center gap-3">
            <button
              v-for="colour in teamLogoColours"
              :key="colour"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
              :style="{ backgroundColor: colour }"
              :aria-label="colour"
              @click="editTeamDraft.logo = colour"
            >
              <IconCheck v-if="editTeamDraft.logo === colour" :size="14" stroke-width="3" class="text-white" />
            </button>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded text-sm font-bold text-white"
              :style="{ backgroundColor: editTeamDraft.logo }"
            >
              {{ editTeamDraft.name?.charAt(0).toUpperCase() || 'T' }}
            </div>
            <span class="text-sm text-muted-foreground">Preview</span>
          </div>
        </div>

        <!-- Delete confirmation -->
        <div v-if="showDeleteConfirm" class="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p class="text-sm text-foreground">
            Type <strong>DELETE</strong> to permanently remove this team and all its data.
          </p>
          <div class="flex items-center gap-2">
            <input
              v-model="deleteConfirmText"
              type="text"
              placeholder="DELETE"
              class="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-destructive focus:outline-none"
            />
            <Button
              variant="destructive"
              size="sm"
              class="shrink-0"
              :disabled="deleteConfirmText !== 'DELETE'"
              @click="confirmDeleteTeam"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
      <DialogFooter class="flex-row items-center">
        <Button
          variant="ghost"
          size="sm"
          class="mr-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
          @click="showDeleteConfirm = !showDeleteConfirm; deleteConfirmText = ''"
        >
          {{ showDeleteConfirm ? 'Cancel delete' : 'Delete team' }}
        </Button>
        <Button variant="outline" size="sm" @click="editTeamOpen = false">
          Cancel
        </Button>
        <Button size="sm" :disabled="!editTeamDraft.name" @click="confirmEditTeam">
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Change centre status -->
  <Dialog v-model:open="changeCentreStatusOpen">
    <DialogContent class="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>Change listing status</DialogTitle>
        <DialogDescription>
          Control whether <strong class="text-foreground font-medium">{{ changeCentreStatusTarget?.name }}</strong> is visible to tenants on the platform.
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-3 py-2">
        <button
          v-for="option in centreStatusOptions"
          :key="option.value"
          type="button"
          class="flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors"
          :class="changeCentreStatusSelected === option.value
            ? 'border-foreground bg-muted/40'
            : 'border-border hover:bg-muted/50'"
          @click="changeCentreStatusSelected = option.value"
        >
          <div class="flex flex-1 flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-foreground">{{ option.label }}</span>
              <span
                v-if="option.value === changeCentreStatusTarget?.status"
                class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                Current
              </span>
            </div>
            <span class="text-xs text-muted-foreground">{{ option.description }}</span>
          </div>
          <div
            class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
            :class="changeCentreStatusSelected === option.value ? 'border-foreground' : 'border-border'"
          >
            <div v-if="changeCentreStatusSelected === option.value" class="h-2 w-2 rounded-full bg-foreground" />
          </div>
        </button>
      </div>
      <DialogFooter class="mt-2">
        <Button variant="outline" size="sm" @click="changeCentreStatusOpen = false">
          Cancel
        </Button>
        <Button
          size="sm"
          :disabled="!changeCentreStatusSelected || changeCentreStatusSelected === changeCentreStatusTarget?.status"
          @click="confirmChangeCentreStatus"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Switch centre team -->
  <Dialog v-model:open="switchCentreTeamOpen">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>Switch team</DialogTitle>
        <DialogDescription>Select the team you wish to move this centre to.</DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <FloatingLabelSelect v-model="switchCentreTeamSelected" label="Team">
          <SelectItem v-for="team in otherTeams" :key="team.id" :value="team.id">
            {{ team.name }}
          </SelectItem>
        </FloatingLabelSelect>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" @click="switchCentreTeamOpen = false">
          Cancel
        </Button>
        <Button size="sm" :disabled="!switchCentreTeamSelected" @click="confirmSwitchCentreTeam">
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Remove member confirmation -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="removeMemberOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/50" @click="removeMemberOpen = false" />
        <div class="relative z-10 w-full max-w-[480px] rounded-xl border border-border bg-background shadow-2xl">
          <div class="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">Remove team member</h2>
              <p class="text-sm text-muted-foreground">{{ removeMemberTarget?.name }}</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="removeMemberOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-foreground">Are you sure you want to remove this user from the team?</p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="outline" size="sm" @click="removeMemberOpen = false">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" @click="confirmRemoveMember">
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Switch team -->
  <Dialog v-model:open="switchTeamOpen">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>Switch team</DialogTitle>
        <DialogDescription>Select the team you wish to move this user to.</DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <FloatingLabelSelect v-model="switchTeamSelected" label="Team">
          <SelectItem v-for="team in otherTeams" :key="team.id" :value="team.id">
            {{ team.name }}
          </SelectItem>
        </FloatingLabelSelect>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" @click="switchTeamOpen = false">
          Cancel
        </Button>
        <Button size="sm" :disabled="!switchTeamSelected" @click="confirmSwitchTeam">
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Change role -->
  <Dialog v-model:open="changeRoleOpen">
    <DialogContent class="sm:max-w-[440px]">
      <DialogHeader>
        <DialogTitle>Change role for {{ 'name' in (changeRoleTarget ?? {}) ? (changeRoleTarget as any).name : changeRoleTarget?.email }}</DialogTitle>
        <DialogDescription>
          Select a new role. Changes take effect immediately.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3 py-2">
        <button
          v-for="role in availableRoles"
          :key="role.value"
          type="button"
          class="flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors"
          :class="changeRoleSelected === role.value
            ? 'border-foreground bg-muted/40'
            : 'border-border hover:bg-muted/50'"
          @click="changeRoleSelected = role.value"
        >
          <div class="flex flex-1 flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-foreground">{{ role.label }}</span>
              <span
                v-if="role.value === changeRoleTarget?.role"
                class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                Current
              </span>
            </div>
            <span class="text-xs text-muted-foreground">{{ role.description }}</span>
          </div>
          <div
            class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
            :class="changeRoleSelected === role.value ? 'border-foreground' : 'border-border'"
          >
            <div v-if="changeRoleSelected === role.value" class="h-2 w-2 rounded-full bg-foreground" />
          </div>
        </button>
      </div>

      <DialogFooter class="mt-2">
        <Button variant="outline" size="sm" @click="changeRoleOpen = false">
          Cancel
        </Button>
        <Button
          size="sm"
          :disabled="!changeRoleSelected || changeRoleSelected === changeRoleTarget?.role"
          @click="confirmChangeRole"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Create team -->
  <Dialog v-model:open="createTeamOpen">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Create a team</DialogTitle>
        <DialogDescription>Set up a new team. You'll be added as Admin by default.</DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-6 py-4">
        <FloatingLabelInput v-model="newTeam.name" label="Team name" :required="true" />

        <!-- Logo colour -->
        <div class="flex flex-col gap-3">
          <span class="text-sm font-medium text-foreground">Logo colour</span>
          <div class="flex items-center gap-3">
            <button
              v-for="colour in teamLogoColours"
              :key="colour"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
              :style="{ backgroundColor: colour }"
              :aria-label="colour"
              @click="newTeam.logo = colour"
            >
              <IconCheck v-if="newTeam.logo === colour" :size="14" stroke-width="3" class="text-white" />
            </button>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded text-sm font-bold text-white"
              :style="{ backgroundColor: newTeam.logo }"
            >
              {{ newTeam.name?.charAt(0).toUpperCase() || 'T' }}
            </div>
            <span class="text-sm text-muted-foreground">Preview</span>
          </div>
        </div>

        <!-- Shopping centres (landlord only) -->
        <div v-if="!isUserType('tenant')" class="relative w-full pt-2">
          <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
            Shopping centres
          </span>
          <Popover v-model:open="createTeamCentresPopoverOpen">
            <PopoverTrigger as-child>
              <button
                type="button"
                class="flex h-[72px] w-full items-center rounded-lg border border-border bg-background px-4 text-base transition-colors hover:bg-muted/40"
              >
                <span :class="createTeamCentresDisplay ? 'text-foreground' : 'text-muted-foreground/40'">
                  {{ createTeamCentresDisplay ?? 'None selected' }}
                </span>
                <IconChevronDown
                  :size="16"
                  stroke-width="1.5"
                  class="ml-auto shrink-0 text-muted-foreground transition-transform duration-200"
                  :class="{ 'rotate-180': createTeamCentresPopoverOpen }"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" class="max-h-[240px] overflow-y-auto [width:var(--reka-popper-anchor-width)] p-2" :side-offset="4">
              <div
                v-for="centre in allCentresList"
                :key="centre.id"
                class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                @click="toggleCreateTeamCentre(centre.name)"
              >
                <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="newTeam.centres.includes(centre.name) ? 'bg-accent-foreground' : 'bg-transparent'">
                  <IconCheck v-if="newTeam.centres.includes(centre.name)" :size="11" stroke-width="3" class="text-background" />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm text-foreground">{{ centre.name }}</span>
                  <span class="text-xs text-muted-foreground">{{ centre.location }}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" @click="createTeamOpen = false; newTeam = { name: '', logo: '#2563eb', centres: [] }">
          Cancel
        </Button>
        <Button size="sm" :disabled="!newTeam.name" @click="confirmCreateTeam">
          Create team
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- View roles -->
  <Dialog v-model:open="viewRolesOpen">
    <DialogContent class="sm:max-w-[720px]">
      <DialogHeader>
        <DialogTitle>Team roles</DialogTitle>
        <DialogDescription>
          What each role can access and do within the platform.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-2 overflow-hidden rounded-lg border border-border">
        <!-- Header row -->
        <div class="grid grid-cols-[1fr_80px_80px_80px] border-b border-border bg-muted/40 px-5 py-3">
          <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Permission</span>
          <span class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</span>
          <span class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accounts</span>
          <span class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Member</span>
        </div>

        <!-- Role descriptions -->
        <div class="grid grid-cols-[1fr_80px_80px_80px] border-b border-border px-5 py-4">
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-medium text-foreground">Role overview</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 text-center">
            <span class="text-xs text-muted-foreground">Full access</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 text-center">
            <span class="text-xs text-muted-foreground">Finance focus</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 text-center">
            <span class="text-xs text-muted-foreground">Standard</span>
          </div>
        </div>

        <!-- Permission rows -->
        <template v-for="(perm, i) in rolePermissions" :key="perm.label">
          <div
            class="grid grid-cols-[1fr_80px_80px_80px] px-5 py-3.5"
            :class="i < rolePermissions.length - 1 ? 'border-b border-border' : ''"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-sm text-foreground">{{ perm.label }}</span>
              <span v-if="perm.description" class="text-xs text-muted-foreground">{{ perm.description }}</span>
            </div>
            <div class="flex items-center justify-center">
              <IconCheck v-if="perm.admin" :size="15" stroke-width="2.5" class="text-foreground" />
              <IconX v-else :size="15" stroke-width="2" class="text-muted-foreground/40" />
            </div>
            <div class="flex items-center justify-center">
              <IconCheck v-if="perm.accounts" :size="15" stroke-width="2.5" class="text-foreground" />
              <IconX v-else :size="15" stroke-width="2" class="text-muted-foreground/40" />
            </div>
            <div class="flex items-center justify-center">
              <IconCheck v-if="perm.member" :size="15" stroke-width="2.5" class="text-foreground" />
              <IconX v-else :size="15" stroke-width="2" class="text-muted-foreground/40" />
            </div>
          </div>
        </template>
      </div>

      <DialogFooter class="mt-2">
        <Button variant="outline" size="sm" @click="viewRolesOpen = false">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Assign signatory centres -->
  <Dialog v-model:open="assignSignatoryOpen">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Assign signatory centres</DialogTitle>
        <DialogDescription>
          Select the centres <strong class="text-foreground font-medium">{{ assignSignatoryTarget?.name }}</strong> can sign lease agreements on behalf of.
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <div class="relative w-full pt-2">
          <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
            Assign as signatory
          </span>
          <Popover v-model:open="assignSignatoryPopoverOpen">
            <PopoverTrigger as-child>
              <button
                type="button"
                class="flex h-[72px] w-full items-center rounded-lg border border-border bg-background px-4 text-base transition-colors hover:bg-muted/40"
              >
                <span :class="assignSignatoryDisplay ? 'text-foreground' : 'text-muted-foreground/40'">
                  {{ assignSignatoryDisplay ?? 'Not assigned' }}
                </span>
                <IconChevronDown
                  :size="16"
                  stroke-width="1.5"
                  class="ml-auto shrink-0 text-muted-foreground transition-transform duration-200"
                  :class="{ 'rotate-180': assignSignatoryPopoverOpen }"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              class="[width:var(--reka-popper-anchor-width)] p-2"
              :side-offset="4"
            >
              <div
                class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                @click="assignSignatorySelected = []"
              >
                <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="assignSignatorySelected.length === 0 ? 'bg-accent-foreground' : 'bg-transparent'">
                  <IconCheck v-if="assignSignatorySelected.length === 0" :size="11" stroke-width="3" class="text-background" />
                </div>
                <span class="text-sm text-muted-foreground">Not assigned</span>
              </div>
              <div
                v-for="centre in centreNames"
                :key="centre"
                class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                @click="toggleAssignSignatoryCentre(centre)"
              >
                <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="assignSignatorySelected.includes(centre) ? 'bg-accent-foreground' : 'bg-transparent'">
                  <IconCheck v-if="assignSignatorySelected.includes(centre)" :size="11" stroke-width="3" class="text-background" />
                </div>
                <span class="text-sm text-foreground">{{ centre }}</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" @click="assignSignatoryOpen = false">
          Cancel
        </Button>
        <Button size="sm" @click="saveAssignSignatory">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Edit external signatory centres -->
  <Dialog v-model:open="editSignatoryCentresOpen">
    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Edit signatory centres</DialogTitle>
        <DialogDescription>
          Select the centres <strong class="text-foreground font-medium">{{ editSignatoryCentresTarget?.name }}</strong> can sign lease agreements on behalf of.
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <div class="relative w-full pt-2">
          <span class="pointer-events-none absolute left-3 top-0 z-10 flex items-center gap-0.5 bg-background px-1 text-sm leading-none text-muted-foreground">
            Centres
          </span>
          <Popover v-model:open="editSignatoryCentresPopoverOpen">
            <PopoverTrigger as-child>
              <button
                type="button"
                class="flex h-[72px] w-full items-center rounded-lg border border-border bg-background px-4 text-base transition-colors hover:bg-muted/40"
              >
                <span :class="editSignatoryCentresDisplay ? 'text-foreground' : 'text-muted-foreground/40'">
                  {{ editSignatoryCentresDisplay ?? 'No centres selected' }}
                </span>
                <IconChevronDown
                  :size="16"
                  stroke-width="1.5"
                  class="ml-auto shrink-0 text-muted-foreground transition-transform duration-200"
                  :class="{ 'rotate-180': editSignatoryCentresPopoverOpen }"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" class="[width:var(--reka-popper-anchor-width)] p-2" :side-offset="4">
              <div
                class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                @click="editSignatoryCentresSelected = []"
              >
                <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="editSignatoryCentresSelected.length === 0 ? 'bg-accent-foreground' : 'bg-transparent'">
                  <IconCheck v-if="editSignatoryCentresSelected.length === 0" :size="11" stroke-width="3" class="text-background" />
                </div>
                <span class="text-sm text-muted-foreground">Not assigned</span>
              </div>
              <div
                v-for="centre in centreNames"
                :key="centre"
                class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
                @click="toggleEditSignatoryCentre(centre)"
              >
                <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-accent-foreground transition-colors" :class="editSignatoryCentresSelected.includes(centre) ? 'bg-accent-foreground' : 'bg-transparent'">
                  <IconCheck v-if="editSignatoryCentresSelected.includes(centre)" :size="11" stroke-width="3" class="text-background" />
                </div>
                <span class="text-sm text-foreground">{{ centre }}</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" @click="editSignatoryCentresOpen = false">
          Cancel
        </Button>
        <Button size="sm" @click="saveSignatoryCentres">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Confirmation dialog (withdraw / decline / approve) -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="confirmOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/50" @click="confirmOpen = false" />
        <div class="relative z-10 w-full max-w-[480px] rounded-xl border border-border bg-background shadow-2xl">
          <div class="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">{{ confirmConfig?.title }}</h2>
              <p class="text-sm text-muted-foreground">{{ confirmTarget?.email }}</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="confirmOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-foreground">{{ confirmConfig?.description }}</p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="outline" size="sm" @click="confirmOpen = false">
              Cancel
            </Button>
            <Button
              :variant="confirmConfig?.destructive ? 'destructive' : 'default'"
              size="sm"
              @click="executeConfirm"
            >
              {{ confirmConfig?.confirmLabel }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Remove external signatory confirmation -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="removeSignatoryOpen" class="fixed inset-0 z-50 flex items-center justify-center p-12">
        <div class="fixed inset-0 bg-black/50" @click="removeSignatoryOpen = false" />
        <div class="relative z-10 w-full max-w-[480px] rounded-xl border border-border bg-background shadow-2xl">
          <div class="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 class="text-lg font-semibold text-foreground">Remove external signatory</h2>
              <p class="text-sm text-muted-foreground">{{ removeSignatoryTarget?.name }}</p>
            </div>
            <button type="button" class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" @click="removeSignatoryOpen = false">
              <IconX :size="18" stroke-width="1.5" />
            </button>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-foreground">Are you sure you want to remove this signatory? They will no longer be able to sign lease agreements.</p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button variant="outline" size="sm" @click="removeSignatoryOpen = false">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" @click="confirmRemoveSignatory">
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Roles & Permissions dialog -->
  <Dialog v-model:open="rolesSheetOpen">
    <DialogContent class="flex max-h-[90vh] flex-col sm:max-w-[600px]">
      <DialogHeader class="shrink-0">
        <DialogTitle>Roles & Permissions</DialogTitle>
        <DialogDescription>Access control reference for landlord roles.</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-8 overflow-y-auto py-4">
        <div v-for="section in permSections" :key="section.heading" class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold text-foreground">{{ section.heading }}</h3>
          <Table>
            <TableHeader>
              <TableRow class="border-border">
                <TableHead class="w-1/2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Feature</TableHead>
                <TableHead class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <div class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-foreground" />Admin</div>
                </TableHead>
                <TableHead class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <div class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-blue-400" />Member</div>
                </TableHead>
                <TableHead class="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <div class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-green-500" />Accounts</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in section.rows" :key="row.feature" class="border-border">
                <TableCell class="py-2.5 text-sm text-foreground">{{ row.feature }}</TableCell>
                <TableCell class="py-2.5 text-center">
                  <IconCheck v-if="row.admin === true" :size="15" class="mx-auto text-green-600" />
                  <span v-else-if="typeof row.admin === 'string'" class="text-xs text-muted-foreground">{{ row.admin }}</span>
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
                <TableCell class="py-2.5 text-center">
                  <IconCheck v-if="row.member === true" :size="15" class="mx-auto text-green-600" />
                  <span v-else-if="typeof row.member === 'string'" class="text-xs text-muted-foreground">{{ row.member }}</span>
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
                <TableCell class="py-2.5 text-center">
                  <IconCheck v-if="row.accounts === true" :size="15" class="mx-auto text-green-600" />
                  <span v-else-if="typeof row.accounts === 'string'" class="text-xs text-muted-foreground">{{ row.accounts }}</span>
                  <span v-else class="text-muted-foreground">—</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
@keyframes row-pulse {
  0%   { background-color: transparent; }
  30%  { background-color: hsl(var(--background-highlight) / 0.2); }
  70%  { background-color: hsl(var(--background-highlight) / 0.2); }
  100% { background-color: transparent; }
}
.row-new {
  animation: row-pulse 1.8s ease-in-out 2;
}
.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, resolveComponent } from 'vue'

const NuxtLink = resolveComponent('NuxtLink')
import { IconCheck, IconX, IconChevronDown, IconChevronUp, IconPencil, IconSelector, IconAlertTriangle, IconLock, IconInfoCircle, IconInbox } from '@tabler/icons-vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FloatingLabelSelect,
  SelectItem,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import StatusDot from '@/components/StatusDot.vue'
import { useRightPanel } from '@/composables/useRightPanel'
import { useAppContext } from '@/composables/useAppContext'
import { useTeamContext } from '@/composables/useTeamContext'

const { pushNotification } = useRightPanel()
const { context: appContext, isUserType, can, isRole } = useAppContext()
const { activeTeamId, setActiveTeam, activeTeam: activeTeamSummary } = useTeamContext()

// ── Country flag helper ───────────────────────────────────────
const COUNTRY_CODES: Record<string, string> = {
  'United Kingdom': 'gb',
  'United States': 'us',
  'France': 'fr',
  'Germany': 'de',
  'Spain': 'es',
  'Italy': 'it',
  'Netherlands': 'nl',
  'Belgium': 'be',
  'Ireland': 'ie',
  'Australia': 'au',
}
function countryCode(country: string): string {
  return COUNTRY_CODES[country] ?? ''
}

const COUNTRY_ABBR: Record<string, string> = {
  'United Kingdom': 'UK',
  'United States': 'US',
  'France': 'FR',
  'Germany': 'DE',
  'Spain': 'ES',
  'Italy': 'IT',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Ireland': 'IE',
  'Australia': 'AU',
}
function countryAbbr(country: string): string {
  return COUNTRY_ABBR[country] ?? country
}

interface Member {
  name: string
  email: string
  role: string
  status: string
  signatoryCentres: string[]
}
interface PendingInvite {
  email: string
  status: string
  role: string
  invitedBy: string
  sentOn: string
}
interface Signatory {
  name: string
  email: string
  organisation?: string
  centres: string[]
  addedBy: string
  addedOn: string
}
interface Centre {
  id: string
  name: string
  location: string
  status: 'Listed' | 'Unlisted'
}
interface Team {
  id: string
  name: string
  logo: string
  platform?: string
  country?: string
  members: Member[]
  pendingInvites: PendingInvite[]
  signatories: Signatory[]
  centres: Centre[]
}
interface TeamsData {
  teams: Team[]
}

// ── Sort helpers ──────────────────────────────────────────────
type SortState = { key: string; dir: 'asc' | 'desc' }

const activeSort  = reactive<SortState>({ key: '', dir: 'asc' })
const pendingSort = reactive<SortState>({ key: '', dir: 'asc' })
const signSort    = reactive<SortState>({ key: '', dir: 'asc' })
const assetsSort  = reactive<SortState>({ key: '', dir: 'asc' })

function toggleSort(state: SortState, key: string) {
  if (state.key === key) {
    state.dir = state.dir === 'asc' ? 'desc' : 'asc'
  } else {
    state.key = key
    state.dir = 'asc'
  }
}

function sortRows<T extends Record<string, any>>(rows: T[], state: SortState): T[] {
  if (!state.key) return rows
  return [...rows].sort((a, b) => {
    const valA = String(a[state.key] ?? '').toLowerCase()
    const valB = String(b[state.key] ?? '').toLowerCase()
    const cmp = valA.localeCompare(valB)
    return state.dir === 'asc' ? cmp : -cmp
  })
}

// ── Team data (API-backed) ────────────────────────────────────
const teamsData = ref<TeamsData>({ teams: [] })
const rolesSheetOpen = ref(false)

// ── Roles & Permissions sheet data ────────────────────────────────────────────

interface PermRow { feature: string; admin: boolean | string; member: boolean | string; accounts: boolean | string }
interface PermSection { heading: string; rows: PermRow[] }

const permSections: PermSection[] = [
  {
    heading: 'Organisation Profile',
    rows: [
      { feature: 'View profile',  admin: true,  member: true,  accounts: true  },
      { feature: 'Edit profile',  admin: true,  member: false, accounts: false },
    ],
  },
  {
    heading: 'Teams & Permissions',
    rows: [
      { feature: 'View members',                 admin: true,           member: true,          accounts: true  },
      { feature: 'Invite users',                 admin: true,           member: 'Invite only', accounts: false },
      { feature: 'Action pending invites',       admin: true,           member: false,         accounts: false },
      { feature: 'Change user roles',            admin: true,           member: false,         accounts: false },
      { feature: 'Edit team info',               admin: true,           member: false,         accounts: false },
      { feature: 'Create / remove teams',        admin: true,           member: false,         accounts: false },
      { feature: 'Manage external signatories',  admin: true,           member: false,         accounts: false },
      { feature: 'Move centres between teams',   admin: true,           member: false,         accounts: false },
    ],
  },
  {
    heading: 'Centres',
    rows: [
      { feature: 'View centres',               admin: true, member: true,  accounts: true  },
      { feature: 'Add / edit / remove centres', admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Spaces',
    rows: [
      { feature: 'View spaces',               admin: true, member: true,  accounts: true  },
      { feature: 'Add / edit / remove spaces', admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Payouts',
    rows: [
      { feature: 'View payout accounts',           admin: true, member: true,  accounts: true  },
      { feature: 'Add / edit / remove accounts',   admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Notifications',
    rows: [
      { feature: 'View notification settings',   admin: true, member: true,  accounts: true  },
      { feature: 'Change notification settings', admin: true, member: false, accounts: false },
    ],
  },
  {
    heading: 'Transactions',
    rows: [
      { feature: 'View transactions', admin: true,  member: true,  accounts: true  },
      { feature: 'Export CSV',        admin: true,  member: false, accounts: true  },
      { feature: 'Send reminders',    admin: true,  member: false, accounts: true  },
    ],
  },
]

interface CentreRaw {
  id: string
  centreId: string
  name: string
  logo: string
  logoUrl?: string
  city: string
  country: string
  status: string
  teamId?: string
}
const allCentresRaw = ref<CentreRaw[]>([])
const allCentresList = computed(() =>
  allCentresRaw.value.map(c => ({
    id: c.id,
    centreId: c.centreId,
    name: c.name,
    logo: c.logo,
    logoUrl: c.logoUrl,
    location: c.city,
    country: c.country,
    status: c.status as 'Listed' | 'Unlisted',
    teamId: c.teamId,
  }))
)

onMounted(async () => {
  const [teamsRes, centresRes] = await Promise.all([
    $fetch<TeamsData>('/api/teams'),
    $fetch<{ centres: CentreRaw[] }>('/api/centres'),
  ])
  teamsData.value = teamsRes
  // Only set if not already set from a previous navigation
  if (!activeTeamId.value) setActiveTeam(teamsRes.teams[0]?.id ?? '')
  allCentresRaw.value = centresRes.centres
})

async function saveTeams() {
  await $fetch('/api/teams', { method: 'PUT', body: teamsData.value })
}

function getCurrentTeam(): Team | undefined {
  return teamsData.value.teams.find(t => t.id === activeTeamId.value)
}

const allTeams     = computed(() => {
  if (appContext.value.userType === 'tenant') {
    return teamsData.value.teams.filter(t => t.platform === 'tenant')
  }
  return teamsData.value.teams.filter(t => t.platform === appContext.value.platform)
})

const hasTeamData = computed(() => {
  if (!activeTeamId.value) return false
  return allTeams.value.some(t => t.id === activeTeamId.value)
})
const selectedTeam = computed(() => allTeams.value.find(t => t.id === activeTeamId.value) ?? allTeams.value[0])
const otherTeams   = computed(() => {
  const others = allTeams.value.filter(t => t.id !== activeTeamId.value)
  // On eLeaseLoop, only allow switching within the same country
  if (appContext.value.platform === 'eleaseloop') {
    const currentCountry = activeTeamSummary.value?.country
    return others.filter(t => t.country === currentCountry)
  }
  return others
})
const activeMembers  = computed(() => selectedTeam.value?.members ?? [])
const pendingInvites = computed(() => selectedTeam.value?.pendingInvites ?? [])
const signatories    = computed(() => selectedTeam.value?.signatories ?? [])
// Derive directly from centres.json using teamId — single source of truth.
const assets = computed(() =>
  allCentresList.value.filter(c => c.teamId === selectedTeam.value?.id)
)

const sortedActiveMembers  = computed(() => sortRows(activeMembers.value,  activeSort))
const sortedPendingInvites = computed(() => sortRows(pendingInvites.value, pendingSort))
const sortedSignatories    = computed(() => sortRows(signatories.value,    signSort))
const sortedAssets         = computed(() => sortRows(assets.value,         assetsSort))

// ── Tabs ──────────────────────────────────────────────────────
const activeTab = ref('active')
const allTabs = [
  { value: 'active',      label: 'Active members',       tenantVisible: true },
  { value: 'pending',     label: 'Pending invites',      tenantVisible: true },
  { value: 'signatories', label: 'External signatories', tenantVisible: false },
  { value: 'assets',      label: 'Managed assets',       tenantVisible: false },
]

const tabs = computed(() =>
  allTabs.filter(t => !isUserType('tenant') || t.tenantVisible)
)

const centres = ['Westfield London', 'Bluewater', 'Lakeside', 'Meadowhall']
const centreNames = computed(() => assets.value.map(c => c.name))

// ── Assign signatory centres ──────────────────────────────────
const assignSignatoryOpen = ref(false)
const assignSignatoryTarget = ref<Member | null>(null)
const assignSignatorySelected = ref<string[]>([])
const assignSignatoryPopoverOpen = ref(false)

const assignSignatoryDisplay = computed(() => {
  const sel = assignSignatorySelected.value
  if (sel.length === 0) return null
  if (sel.length === 1) return sel[0]
  return `${sel.length} centres selected`
})

function openAssignSignatory(member: Member) {
  assignSignatoryTarget.value = member
  assignSignatorySelected.value = [...(member.signatoryCentres ?? [])]
  assignSignatoryOpen.value = true
}

function toggleAssignSignatoryCentre(centre: string) {
  const idx = assignSignatorySelected.value.indexOf(centre)
  if (idx === -1) assignSignatorySelected.value.push(centre)
  else assignSignatorySelected.value.splice(idx, 1)
}

function saveAssignSignatory() {
  if (!assignSignatoryTarget.value) return
  const team = getCurrentTeam()
  if (!team) return
  const member = team.members.find(m => m.email === assignSignatoryTarget.value!.email)
  if (member) member.signatoryCentres = [...assignSignatorySelected.value]
  saveTeams()
  assignSignatoryOpen.value = false
  assignSignatoryTarget.value = null
}

// ── View roles ────────────────────────────────────────────────
const viewRolesOpen = ref(false)

const rolePermissions = [
  { label: 'Invite & remove team members',    description: undefined,                              admin: true,  accounts: false, member: false },
  { label: 'Approve or decline join requests', description: undefined,                            admin: true,  accounts: false, member: false },
  { label: 'Manage team settings',            description: 'Roles, permissions, lease details',   admin: true,  accounts: false, member: false },
  { label: 'Manage signatories',              description: 'Add or remove external signatories',  admin: true,  accounts: false, member: false },
  { label: 'Analytics & reports',             description: 'Access analytics and download reports', admin: true, accounts: true,  member: false },
  { label: 'Download invoices',               description: undefined,                              admin: true,  accounts: true,  member: false },
  { label: 'View bookings',                   description: 'Read-only access to booking information', admin: true, accounts: true, member: true  },
  { label: 'Manage bookings',                 description: 'Create, edit, and cancel bookings',   admin: true,  accounts: false, member: true  },
]

// ── Invite user ───────────────────────────────────────────────
const inviteUserOpen = ref(false)
const signatoryPopoverOpen = ref(false)
const newInvite = ref({ firstName: '', lastName: '', email: '', role: '', signatoryCentres: [] as string[] })

function toggleSignatoryCentre(centre: string) {
  const idx = newInvite.value.signatoryCentres.indexOf(centre)
  if (idx === -1) newInvite.value.signatoryCentres.push(centre)
  else newInvite.value.signatoryCentres.splice(idx, 1)
}

const signatoryDisplay = computed(() => {
  const sel = newInvite.value.signatoryCentres
  if (sel.length === 0) return null
  if (sel.length === 1) return sel[0]
  return `${sel.length} centres selected`
})

function sendInvite() {
  if (!newInvite.value.firstName || !newInvite.value.email || !newInvite.value.role) return
  const team = getCurrentTeam()
  if (!team) return
  team.pendingInvites.push({
    email: newInvite.value.email,
    status: 'Awaiting Signup',
    role: newInvite.value.role,
    invitedBy: "Sam O'Brien",
    sentOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  })
  saveTeams()
  newInvite.value = { firstName: '', lastName: '', email: '', role: '', signatoryCentres: [] }
  inviteUserOpen.value = false
  activeTab.value = 'pending'
}

// ── Active member actions ─────────────────────────────────────
const removeMemberOpen = ref(false)
const removeMemberTarget = ref<Member | null>(null)

function openRemoveConfirm(member: Member) {
  removeMemberTarget.value = member
  removeMemberOpen.value = true
}

function confirmRemoveMember() {
  if (!removeMemberTarget.value) return
  const team = getCurrentTeam()
  if (!team) return
  const idx = team.members.findIndex(m => m.email === removeMemberTarget.value!.email)
  if (idx !== -1) team.members.splice(idx, 1)
  saveTeams()
  removeMemberOpen.value = false
  removeMemberTarget.value = null
}

const switchTeamOpen = ref(false)
const switchTeamTarget = ref<Member | null>(null)
const switchTeamSelected = ref('')

function openSwitchTeam(member: Member) {
  switchTeamTarget.value = member
  switchTeamSelected.value = ''
  switchTeamOpen.value = true
}

function confirmSwitchTeam() {
  if (!switchTeamTarget.value || !switchTeamSelected.value) return
  const currentTeam = getCurrentTeam()
  const targetTeam = teamsData.value.teams.find(t => t.id === switchTeamSelected.value)
  if (!currentTeam || !targetTeam) return

  const idx = currentTeam.members.findIndex(m => m.email === switchTeamTarget.value!.email)
  if (idx !== -1) {
    const [moved] = currentTeam.members.splice(idx, 1)
    targetTeam.members.push(moved)
  }

  saveTeams()
  switchTeamOpen.value = false
  switchTeamTarget.value = null
  switchTeamSelected.value = ''
}

// ── Change role ───────────────────────────────────────────────
const changeRoleOpen = ref(false)
const changeRoleTarget = ref<Member | PendingInvite | null>(null)
const changeRoleSelected = ref('')

const availableRoles = [
  { value: 'Admin',    label: 'Admin',    description: 'Full access. Manage team settings, signatories, and all bookings.' },
  { value: 'Accounts', label: 'Accounts', description: 'Finance focus. Access analytics, reports, and download invoices.' },
  { value: 'Member',  label: 'Member',   description: 'Standard access. View and manage bookings.' },
]

function openChangeRole(target: Member | PendingInvite) {
  changeRoleTarget.value = target
  changeRoleSelected.value = target.role
  changeRoleOpen.value = true
}

function confirmChangeRole() {
  if (!changeRoleTarget.value || !changeRoleSelected.value) return
  const team = getCurrentTeam()
  if (!team) return
  const target = changeRoleTarget.value
  const isMember = 'signatoryCentres' in target
  if (isMember) {
    const member = team.members.find(m => m.email === target.email)
    if (member) member.role = changeRoleSelected.value
  } else {
    const invite = team.pendingInvites.find(i => i.email === target.email)
    if (invite) invite.role = changeRoleSelected.value
  }
  saveTeams()
  changeRoleOpen.value = false
  changeRoleTarget.value = null
  changeRoleSelected.value = ''
}

// ── Pending invite actions ────────────────────────────────────
type ConfirmAction = 'withdraw' | 'decline' | 'approve' | null
const confirmAction = ref<ConfirmAction>(null)
const confirmTarget = ref<PendingInvite | null>(null)
const confirmOpen = computed({
  get: () => confirmAction.value !== null,
  set: (val) => { if (!val) { confirmAction.value = null; confirmTarget.value = null } },
})

const confirmConfig = computed(() => {
  switch (confirmAction.value) {
    case 'withdraw': return {
      title: 'Withdraw invite',
      description: 'Are you sure you want to withdraw this invite?',
      confirmLabel: 'Withdraw invite',
      destructive: true,
    }
    case 'decline': return {
      title: 'Decline request',
      description: "Are you sure you want to decline this user's request to join the team?",
      confirmLabel: 'Decline request',
      destructive: true,
    }
    case 'approve': return {
      title: 'Approve request',
      description: "Are you sure you want to approve this request? You can always remove the user from the team if you change your mind.",
      confirmLabel: 'Approve',
      destructive: false,
    }
    default: return null
  }
})

function openConfirm(action: ConfirmAction, invite: PendingInvite) {
  confirmAction.value = action
  confirmTarget.value = invite
}

const newlyAddedEmail = ref<string | null>(null)

function executeConfirm() {
  if (!confirmTarget.value || !confirmAction.value) return
  const team = getCurrentTeam()
  if (!team) return
  const invite = confirmTarget.value

  if (confirmAction.value === 'approve') {
    const nameParts = invite.email.split('@')[0].split('.')
    const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    team.members.push({ name, email: invite.email, role: invite.role, status: 'Active', signatoryCentres: [] })
    newlyAddedEmail.value = invite.email
    setTimeout(() => { newlyAddedEmail.value = null }, 3600)
    activeTab.value = 'active'
    pushNotification({
      type: 'team.member_joined',
      title: 'Invitation accepted',
      body: `${name} has joined ${team.name}.`,
    })
  }

  const idx = team.pendingInvites.findIndex(i => i.email === invite.email)
  if (idx !== -1) team.pendingInvites.splice(idx, 1)
  saveTeams()
  confirmAction.value = null
  confirmTarget.value = null
}

// ── Add signatory ─────────────────────────────────────────────
const addSignatoryOpen = ref(false)
const newSignatoryPopoverOpen = ref(false)
const newSignatory = ref({ name: '', email: '', organisation: '', centres: [] as string[] })

const newSignatoryDisplay = computed(() => {
  const sel = newSignatory.value.centres
  if (sel.length === 0) return null
  if (sel.length === 1) return sel[0]
  return `${sel.length} centres selected`
})

function toggleNewSignatoryCentre(centre: string) {
  const idx = newSignatory.value.centres.indexOf(centre)
  if (idx === -1) newSignatory.value.centres.push(centre)
  else newSignatory.value.centres.splice(idx, 1)
}

function addSignatory() {
  if (!newSignatory.value.name || !newSignatory.value.email || newSignatory.value.centres.length === 0) return
  const team = getCurrentTeam()
  if (!team) return
  team.signatories.push({
    name: newSignatory.value.name,
    email: newSignatory.value.email,
    organisation: newSignatory.value.organisation || undefined,
    centres: [...newSignatory.value.centres],
    addedBy: "Sam O'Brien",
    addedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  })
  saveTeams()
  newSignatory.value = { name: '', email: '', organisation: '', centres: [] }
  addSignatoryOpen.value = false
}

// ── Edit external signatory centres ───────────────────────────
const editSignatoryCentresOpen = ref(false)
const editSignatoryCentresTarget = ref<Signatory | null>(null)
const editSignatoryCentresSelected = ref<string[]>([])
const editSignatoryCentresPopoverOpen = ref(false)

const editSignatoryCentresDisplay = computed(() => {
  const sel = editSignatoryCentresSelected.value
  if (sel.length === 0) return null
  if (sel.length === 1) return sel[0]
  return `${sel.length} centres selected`
})

function openEditSignatoryCentres(sig: Signatory) {
  editSignatoryCentresTarget.value = sig
  editSignatoryCentresSelected.value = [...(sig.centres ?? [])]
  editSignatoryCentresOpen.value = true
}

function toggleEditSignatoryCentre(centre: string) {
  const idx = editSignatoryCentresSelected.value.indexOf(centre)
  if (idx === -1) editSignatoryCentresSelected.value.push(centre)
  else editSignatoryCentresSelected.value.splice(idx, 1)
}

function saveSignatoryCentres() {
  if (!editSignatoryCentresTarget.value) return
  const team = getCurrentTeam()
  if (!team) return
  const sig = team.signatories.find(s => s.email === editSignatoryCentresTarget.value!.email)
  if (sig) sig.centres = [...editSignatoryCentresSelected.value]
  saveTeams()
  editSignatoryCentresOpen.value = false
  editSignatoryCentresTarget.value = null
}

const removeSignatoryOpen = ref(false)
const removeSignatoryTarget = ref<Signatory | null>(null)

function openRemoveSignatoryConfirm(sig: Signatory) {
  removeSignatoryTarget.value = sig
  removeSignatoryOpen.value = true
}

function confirmRemoveSignatory() {
  if (!removeSignatoryTarget.value) return
  const team = getCurrentTeam()
  if (!team) return
  const idx = team.signatories.findIndex(s => s.email === removeSignatoryTarget.value!.email)
  if (idx !== -1) team.signatories.splice(idx, 1)
  saveTeams()
  removeSignatoryOpen.value = false
  removeSignatoryTarget.value = null
}

function removeSignatory(sig: Signatory) {
  const team = getCurrentTeam()
  if (!team) return
  const idx = team.signatories.findIndex(s => s.email === sig.email)
  if (idx !== -1) team.signatories.splice(idx, 1)
  saveTeams()
}

// ── Admin enforcement ─────────────────────────────────────────
const adminCount = computed(() =>
  selectedTeam.value?.members.filter(m => m.role === 'Admin').length ?? 0
)

function isLastAdmin(member: Member): boolean {
  return member.role === 'Admin' && adminCount.value === 1
}

// ── Create team ───────────────────────────────────────────────
const createTeamOpen = ref(false)
const createTeamCentresPopoverOpen = ref(false)
const newTeam = ref({ name: '', logo: '#2563eb', centres: [] as string[] })

const createTeamCentresDisplay = computed(() => {
  const sel = newTeam.value.centres
  if (sel.length === 0) return null
  if (sel.length === 1) return sel[0]
  return `${sel.length} centres selected`
})

function toggleCreateTeamCentre(name: string) {
  const idx = newTeam.value.centres.indexOf(name)
  if (idx === -1) newTeam.value.centres.push(name)
  else newTeam.value.centres.splice(idx, 1)
}

function confirmCreateTeam() {
  if (!newTeam.value.name) return
  const id = `team-${Date.now()}`
  const centreObjects = allCentresList.value
    .filter(c => newTeam.value.centres.includes(c.name))
  teamsData.value.teams.push({
    id,
    name: newTeam.value.name,
    logo: newTeam.value.logo,
    members: [{
      name: "Sam O'Brien",
      email: 'sam@fillit.com',
      role: 'Admin',
      status: 'Active',
      signatoryCentres: [],
    }],
    pendingInvites: [],
    signatories: [],
    centres: centreObjects,
  })
  saveTeams()
  setActiveTeam(id)
  newTeam.value = { name: '', logo: '#2563eb', centres: [] }
  createTeamOpen.value = false
}

// ── Edit team ─────────────────────────────────────────────────
const editTeamOpen = ref(false)
const editTeamTarget = ref<Team | null>(null)
const editTeamDraft = ref({ name: '', logo: '' })
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')

const teamLogoColours = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']

function openEditTeam(team: Team) {
  editTeamTarget.value = team
  editTeamDraft.value = { name: team.name, logo: team.logo }
  showDeleteConfirm.value = false
  deleteConfirmText.value = ''
  editTeamOpen.value = true
}

function confirmEditTeam() {
  if (!editTeamTarget.value || !editTeamDraft.value.name) return
  const team = teamsData.value.teams.find(t => t.id === editTeamTarget.value!.id)
  if (team) {
    team.name = editTeamDraft.value.name
    team.logo = editTeamDraft.value.logo
  }
  saveTeams()
  editTeamOpen.value = false
  editTeamTarget.value = null
}

function confirmDeleteTeam() {
  if (!editTeamTarget.value || deleteConfirmText.value !== 'DELETE') return
  const idx = teamsData.value.teams.findIndex(t => t.id === editTeamTarget.value!.id)
  if (idx !== -1) teamsData.value.teams.splice(idx, 1)
  saveTeams()
  setActiveTeam(teamsData.value.teams[0]?.id ?? '')
  editTeamOpen.value = false
  editTeamTarget.value = null
  showDeleteConfirm.value = false
  deleteConfirmText.value = ''
}

// ── Change centre status ───────────────────────────────────────
const changeCentreStatusOpen = ref(false)
const changeCentreStatusTarget = ref<Centre | null>(null)
const changeCentreStatusSelected = ref('')

const centreStatusOptions = [
  {
    value: 'Listed',
    label: 'Listed',
    description: 'Visible to tenants. Brands can discover and enquire about this centre.',
  },
  {
    value: 'Unlisted',
    label: 'Unlisted',
    description: 'Hidden from tenants. The centre remains in your account and can be re-listed at any time.',
  },
]

function openChangeCentreStatus(centre: Centre) {
  changeCentreStatusTarget.value = centre
  changeCentreStatusSelected.value = centre.status
  changeCentreStatusOpen.value = true
}

function confirmChangeCentreStatus() {
  if (!changeCentreStatusTarget.value || !changeCentreStatusSelected.value) return
  const team = getCurrentTeam()
  if (!team) return
  const centre = team.centres.find(c => c.id === changeCentreStatusTarget.value!.id)
  if (centre) centre.status = changeCentreStatusSelected.value as 'Listed' | 'Unlisted'
  saveTeams()
  changeCentreStatusOpen.value = false
  changeCentreStatusTarget.value = null
  changeCentreStatusSelected.value = ''
}

// ── Switch centre team ─────────────────────────────────────────
const switchCentreTeamOpen = ref(false)
const switchCentreTeamTarget = ref<Centre | null>(null)
const switchCentreTeamSelected = ref('')

function openSwitchCentreTeam(centre: Centre) {
  switchCentreTeamTarget.value = centre
  switchCentreTeamSelected.value = ''
  switchCentreTeamOpen.value = true
}

function confirmSwitchCentreTeam() {
  if (!switchCentreTeamTarget.value || !switchCentreTeamSelected.value) return
  const currentTeam = getCurrentTeam()
  const targetTeam = teamsData.value.teams.find(t => t.id === switchCentreTeamSelected.value)
  if (!currentTeam || !targetTeam) return
  const idx = currentTeam.centres.findIndex(c => c.id === switchCentreTeamTarget.value!.id)
  if (idx !== -1) {
    const [moved] = currentTeam.centres.splice(idx, 1)
    targetTeam.centres.push(moved)
  }
  saveTeams()
  switchCentreTeamOpen.value = false
  switchCentreTeamTarget.value = null
  switchCentreTeamSelected.value = ''
}
</script>
