<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import {
  IconX,
  IconBell,
  IconSparkles,
  IconSend,
  IconUsers,
  IconSearch,
  IconCalendar,
  IconCreditCard,
  IconMessage,
  IconFile,
  IconCircleCheck,
  IconPaperclip,
  IconPhoto,
} from '@tabler/icons-vue'
import { useRightPanel } from '@/composables/useRightPanel'
import type { AppNotification } from '@/composables/useRightPanel'

const {
  isOpen,
  activeTab,
  notifications,
  messages,
  unreadCount,
  toastNotification,
  close,
  toggle,
  markAllRead,
  markRead,
  dismissToast,
  pushNotification,
} = useRightPanel()


// ── Assistant state ────────────────────────────────────────────────────────────
const inputText = ref('')
const isTyping = ref(false)
const messageListRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

interface AttachedFile {
  id: string
  name: string
  size: string
  type: 'image' | 'file'
}

const attachments = ref<AttachedFile[]>([])

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  for (const file of Array.from(input.files)) {
    const isImage = file.type.startsWith('image/')
    const size = file.size < 1024 * 1024
      ? `${Math.round(file.size / 1024)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    attachments.value.push({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size,
      type: isImage ? 'image' : 'file',
    })
  }
  // Reset so the same file can be re-selected
  input.value = ''
}

function removeAttachment(id: string) {
  attachments.value = attachments.value.filter(a => a.id !== id)
}

const suggestedPrompts = [
  'How do I invite a new team member?',
  'Where can I view upcoming bookings?',
  'How do I set up a new space?',
  'How does the enquiry process work?',
]

// Maps event type prefix → icon (all events in a category share one icon)
const notificationIcon: Record<string, typeof IconBell> = {
  'team':     IconUsers,
  'enquiry':  IconSearch,
  'booking':  IconCalendar,
  'payment':  IconCreditCard,
  'message':  IconMessage,
  'document': IconFile,
}

function getNotificationIcon(type: string) {
  const prefix = type.split('.')[0]
  return notificationIcon[prefix] ?? IconBell
}

const mockReplies: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['invite', 'team member', 'add user'],
    reply: 'To invite a team member, go to Account → Teams, then click "Invite member". Enter their email and they\'ll receive an invitation to join.',
  },
  {
    keywords: ['booking', 'upcoming', 'calendar'],
    reply: 'You can view all bookings from the Bookings section in the sidebar, or switch to the Calendar view for a timeline overview.',
  },
  {
    keywords: ['space', 'new space', 'add space'],
    reply: 'To add a new space, go to Account → Spaces and click "+ Add new space". You\'ll be able to set the centre, floor, dimensions, rates, and images.',
  },
  {
    keywords: ['enquiry', 'enquiries'],
    reply: 'Enquiries come in when tenants submit interest in one of your spaces. You\'ll receive a notification and can view and respond from the Enquiries section.',
  },
  {
    keywords: ['payment', 'invoice', 'billing'],
    reply: 'Payment records are available under Account → Payments. You can view received payments and any outstanding invoices there.',
  },
]

function getReply(input: string): string {
  const lower = input.toLowerCase()
  for (const { keywords, reply } of mockReplies) {
    if (keywords.some(k => lower.includes(k))) return reply
  }
  return "I don't have a specific answer for that yet, but I'm here to help. You can also check the help documentation or reach out to support."
}

async function sendMessage(text: string = inputText.value.trim()) {
  if (!text && attachments.value.length === 0) return
  const messageText = text || (attachments.value.length > 0 ? `[Sent ${attachments.value.length} file${attachments.value.length > 1 ? 's' : ''}]` : '')
  inputText.value = ''
  attachments.value = []

  messages.value.push({ id: Date.now().toString(), role: 'user', content: messageText })
  await scrollToBottom()

  isTyping.value = true
  await scrollToBottom()

  await new Promise(r => setTimeout(r, 900 + Math.random() * 600))

  isTyping.value = false
  messages.value.push({ id: (Date.now() + 1).toString(), role: 'assistant', content: getReply(text) })
  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// Scroll to bottom when switching to assistant tab with existing messages
watch(activeTab, async (tab) => {
  if (tab === 'assistant' && messages.value.length > 0) {
    await scrollToBottom()
  }
})

// Notification formatting
function handleNotificationClick(n: AppNotification) {
  markRead(n.id)
}
</script>

<template>
  <Teleport to="body">
    <!-- Floating assistant button -->
    <Transition name="fab">
      <button
        v-if="!(isOpen && activeTab === 'assistant')"
        class="fab-btn fixed right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background"
        @click="toggle('assistant')"
      >
        <IconSparkles :size="18" stroke-width="1.75" class="fab-icon" />
      </button>
    </Transition>

    <!-- Notification toast -->
    <Transition name="toast">
      <div
        v-if="toastNotification && !isOpen"
        class="toast-card fixed right-6 top-20 z-50 w-72 cursor-pointer overflow-hidden rounded-xl border border-border bg-background shadow-md"
        @click="() => { markRead(toastNotification!.id); dismissToast(); toggle('notifications') }"
      >
        <div class="flex gap-3 px-4 py-3.5">
          <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <component :is="getNotificationIcon(toastNotification.type)" :size="13" stroke-width="1.75" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-foreground leading-snug">{{ toastNotification.title }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">{{ toastNotification.body }}</p>
          </div>
          <button
            class="ml-1 mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            @click.stop="dismissToast"
          >
            <IconX :size="13" stroke-width="2" />
          </button>
        </div>
        <!-- Progress bar -->
        <div class="toast-progress h-[2px] bg-primary" />
      </div>
    </Transition>

    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40"
        @click="close"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="panel">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 bottom-0 z-50 flex w-[400px] flex-col bg-background border-l border-border shadow-2xl"
      >
        <!-- Header: tabs + close -->
        <div class="flex shrink-0 items-center border-b border-border bg-background px-5 pt-4 pb-0 gap-1">
          <button
            class="relative flex items-center gap-2 px-3 pb-3.5 text-sm font-semibold border-b-2 transition-colors"
            :class="activeTab === 'notifications'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'"
            @click="toggle('notifications')"
          >
            <IconBell :size="16" stroke-width="1.75" />
            Notifications
            <span
              v-if="unreadCount > 0"
              class="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
            >
              {{ unreadCount }}
            </span>
          </button>

          <button
            class="flex items-center gap-2 px-3 pb-3.5 text-sm font-semibold border-b-2 transition-colors"
            :class="activeTab === 'assistant'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'"
            @click="toggle('assistant')"
          >
            <IconSparkles :size="16" stroke-width="1.75" />
            Assistant
          </button>

          <button
            class="ml-auto mb-3.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            @click="close"
          >
            <IconX :size="16" stroke-width="2" />
          </button>
        </div>

        <!-- ── Notifications tab ─────────────────────────────────────────── -->
        <template v-if="activeTab === 'notifications'">
          <!-- Toolbar -->
          <div class="flex shrink-0 items-center justify-between px-5 py-3.5 border-b border-border bg-background">
            <span class="text-sm text-muted-foreground">
              {{ unreadCount > 0 ? `${unreadCount} unread` : 'All caught up' }}
            </span>
            <button
              v-if="unreadCount > 0"
              class="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              @click="markAllRead"
            >
              Mark all read
            </button>
          </div>

          <!-- Feed -->
          <div class="flex-1 overflow-y-auto">
            <div
              v-for="n in notifications"
              :key="n.id"
              class="group relative flex gap-3.5 px-5 py-5 transition-colors hover:bg-muted/50 cursor-default border-b border-border/60 last:border-0"
              :class="{ 'bg-muted/30': !n.read }"
              @click="handleNotificationClick(n)"
            >
              <!-- Icon -->
              <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <component :is="getNotificationIcon(n.type)" :size="17" stroke-width="1.75" />
              </div>

              <!-- Content -->
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm leading-snug" :class="n.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'">
                    {{ n.title }}
                  </p>
                  <span class="mt-0.5 shrink-0 text-xs text-muted-foreground">{{ n.timestamp }}</span>
                </div>
                <p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{{ n.body }}</p>
                <button
                  v-if="n.actionLabel"
                  class="mt-2.5 text-sm font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {{ n.actionLabel }}
                </button>
              </div>

              <!-- Unread dot -->
              <div
                v-if="!n.read"
                class="absolute right-5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary"
              />
            </div>
          </div>
        </template>

        <!-- ── Assistant tab ────────────────────────────────────────────── -->
        <template v-else-if="activeTab === 'assistant'">
          <!-- Empty state OR conversation -->
          <div
            v-if="messages.length === 0"
            class="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <IconSparkles :size="26" stroke-width="1.5" />
            </div>
            <div class="text-center">
              <p class="text-base font-semibold text-foreground">How can I help?</p>
              <p class="mt-1.5 text-sm text-muted-foreground">Ask me anything about the platform.</p>
            </div>
            <div class="w-full space-y-2.5">
              <button
                v-for="prompt in suggestedPrompts"
                :key="prompt"
                class="w-full rounded-lg border border-border px-4 py-3.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                @click="sendMessage(prompt)"
              >
                {{ prompt }}
              </button>
            </div>
          </div>

          <div v-else ref="messageListRef" class="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                :class="msg.role === 'user'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-foreground'"
              >
                {{ msg.content }}
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3.5">
                <span class="typing-dot" />
                <span class="typing-dot" style="animation-delay: 0.15s" />
                <span class="typing-dot" style="animation-delay: 0.3s" />
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="shrink-0 border-t border-border p-4">
            <div class="rounded-xl border border-border bg-background transition-colors focus-within:border-foreground/30">
              <!-- Attachment chips -->
              <div v-if="attachments.length > 0" class="flex flex-wrap gap-1.5 px-3 pt-3 pb-0">
                <div
                  v-for="att in attachments"
                  :key="att.id"
                  class="flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1"
                >
                  <component :is="att.type === 'image' ? IconPhoto : IconFile" :size="13" class="shrink-0 text-muted-foreground" />
                  <span class="max-w-[120px] truncate text-xs text-foreground">{{ att.name }}</span>
                  <span class="text-[11px] text-muted-foreground">{{ att.size }}</span>
                  <button
                    type="button"
                    class="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    @click="removeAttachment(att.id)"
                  >
                    <IconX :size="11" stroke-width="2.5" />
                  </button>
                </div>
              </div>
              <!-- Textarea row -->
              <div class="flex items-end gap-2 px-3 pb-3 pt-3">
                <textarea
                  v-model="inputText"
                  rows="2"
                  placeholder="Ask a question…"
                  class="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed self-end"
                  style="max-height: 140px; overflow-y: auto;"
                  @keydown="handleKeydown"
                  @input="(e) => { const el = e.target as HTMLTextAreaElement; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }"
                />
              </div>
              <!-- Toolbar row -->
              <div class="flex items-center justify-between border-t border-border/60 px-3 py-2">
                <!-- Attach button -->
                <label
                  class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Attach image or file"
                >
                  <input
                    ref="fileInputRef"
                    type="file"
                    class="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                    multiple
                    @change="handleFileUpload"
                  />
                  <IconPaperclip :size="16" stroke-width="1.75" />
                </label>
                <!-- Send button -->
                <button
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                  :class="inputText.trim() || attachments.length > 0
                    ? 'bg-foreground text-background hover:opacity-80'
                    : 'text-muted-foreground opacity-40 cursor-default'"
                  @click="sendMessage()"
                >
                  <IconSend :size="15" stroke-width="2" />
                </button>
              </div>
            </div>
            <p class="mt-2.5 text-center text-xs text-muted-foreground">
              AI responses are for guidance only — always verify important details.
            </p>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Panel slide-in from right */
.panel-enter-active {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.panel-leave-active {
  transition: transform 0.2s cubic-bezier(0.55, 0, 1, 0.45);
}
.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
}

/* Backdrop fade */
.backdrop-enter-active {
  transition: opacity 0.2s ease;
}
.backdrop-leave-active {
  transition: opacity 0.15s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* ── Toast: cell-split grow from FAB circle ───────────────────────────────── */
.toast-enter-active {
  animation: cell-split 0.5s cubic-bezier(0.34, 1.38, 0.64, 1) forwards;
}
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(-4px);
}

/*
  Cell-split: begins as the same 40×40 circle as the FAB (top-right origin),
  width stretches out first (like a cell elongating before division),
  then height expands, border-radius morphs to card shape, slight overshoot.
*/
@keyframes cell-split {
  0% {
    opacity: 0.6;
    transform-origin: top right;
    transform: scale(0);
    border-radius: 50%;
    clip-path: circle(20px at calc(100% - 20px) 20px);
  }
  30% {
    opacity: 1;
    clip-path: circle(40px at calc(100% - 20px) 20px);
    border-radius: 40px;
  }
  60% {
    transform: scale(1.03);
    border-radius: 16px;
    clip-path: inset(0 0 0 0 round 16px);
  }
  80% {
    transform: scale(0.99);
    border-radius: 12px;
  }
  100% {
    transform: scale(1);
    border-radius: 12px;
    clip-path: inset(0 0 0 0 round 12px);
  }
}

/* Progress bar drains over 5s, matching the auto-dismiss timer */
.toast-progress {
  width: 100%;
  animation: toast-drain 5s linear forwards;
  transform-origin: left;
}
@keyframes toast-drain {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* FAB show/hide transition */
.fab-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fab-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* FAB base */
.fab-btn {
  animation: fab-attention 10s ease-in-out infinite;
}

@keyframes fab-attention {
  0%, 75%, 100% {
    transform: scale(1) translateY(0);
  }
  77% {
    transform: scale(1.14) translateY(-2px);
  }
  80% {
    transform: scale(0.96) translateY(1px);
  }
  83% {
    transform: scale(1.06) translateY(-1px);
  }
  87% {
    transform: scale(1) translateY(0);
  }
}

/* Icon */
.fab-icon {
  animation: fab-icon-spin 10s ease-in-out infinite;
}

@keyframes fab-icon-spin {
  0%, 75%, 100% {
    transform: rotate(0deg);
  }
  87% {
    transform: rotate(360deg);
  }
}

/* Typing dots */
.typing-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.4;
  animation: typing-bounce 1s ease-in-out infinite;
}

@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%            { transform: translateY(-4px); opacity: 1; }
}
</style>
