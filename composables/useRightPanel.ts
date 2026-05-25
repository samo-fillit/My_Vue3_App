import { ref, computed } from 'vue'
import type { NotificationEventType } from './notifications.registry'

export type RightPanelTab = 'notifications' | 'assistant'

export interface AppNotification {
  id: string
  /** Maps to a key in notifications.registry.ts — enforces consistency with the backend contract */
  type: NotificationEventType
  title: string
  body: string
  timestamp: string
  read: boolean
  actionLabel?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Module-level singleton state — shared across all components
const isOpen = ref(false)
const activeTab = ref<RightPanelTab>('notifications')

const notifications = ref<AppNotification[]>([
  {
    id: '1',
    type: 'team.invitation_sent',
    title: 'Invitation sent',
    body: 'An invitation has been sent to sarah@brandco.com to join Team One.',
    timestamp: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'team.signatory_added',
    title: 'Signatory added',
    body: 'James Miller has been added as a DocuSign signatory for Westfield London.',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: '3',
    type: 'enquiry.received',
    title: 'New enquiry received',
    body: 'Zara has submitted a new enquiry for Unit 42, Westfield London.',
    timestamp: '3h ago',
    read: false,
    actionLabel: 'View enquiry',
  },
  {
    id: '4',
    type: 'booking.confirmed',
    title: 'Booking confirmed',
    body: 'The booking for Kiosk A3 by Nike has been confirmed for 12–26 May.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'payment.received',
    title: 'Payment received',
    body: '€2,400 received from Adidas for Sampling Stand S1.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: '6',
    type: 'message.received',
    title: 'New message from tenant',
    body: 'Nike sent a message about their upcoming booking at Westfield London.',
    timestamp: '2 days ago',
    read: true,
    actionLabel: 'View message',
  },
  {
    id: '7',
    type: 'booking.ending_soon',
    title: 'Booking ending soon',
    body: 'The booking for Billboard B2 by Samsung ends in 2 days.',
    timestamp: '2 days ago',
    read: true,
  },
])

const messages = ref<ChatMessage[]>([])
const toastNotification = ref<AppNotification | null>(null)

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useRightPanel() {
  function open(tab: RightPanelTab = 'notifications') {
    activeTab.value = tab
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  // Clicking the same tab button again closes the panel;
  // clicking a different tab switches without closing.
  function toggle(tab: RightPanelTab) {
    if (!isOpen.value) {
      activeTab.value = tab
      isOpen.value = true
    } else if (tab !== activeTab.value) {
      activeTab.value = tab
    } else {
      isOpen.value = false
    }
  }

  function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
  }

  function markRead(id: string) {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  function dismissToast() {
    toastNotification.value = null
    if (toastTimer) clearTimeout(toastTimer)
  }

  function pushNotification(n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const notification: AppNotification = {
      ...n,
      id: Date.now().toString(),
      timestamp: 'Just now',
      read: false,
    }
    notifications.value.unshift(notification)

    // Show toast (replace any existing one)
    if (toastTimer) clearTimeout(toastTimer)
    toastNotification.value = notification
    toastTimer = setTimeout(() => {
      toastNotification.value = null
    }, 5000)
  }

  return {
    isOpen,
    activeTab,
    notifications,
    messages,
    unreadCount,
    toastNotification,
    open,
    close,
    toggle,
    markAllRead,
    markRead,
    dismissToast,
    pushNotification,
  }
}
