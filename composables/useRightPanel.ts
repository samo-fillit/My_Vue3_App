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

// ── Seeded notification sets, swapped by role ──────────────────────────────

const landlordSeedNotifications: AppNotification[] = [
  {
    id: 'l1',
    type: 'team.invitation_sent',
    title: 'Invitation sent',
    body: 'An invitation has been sent to sarah@brandco.com to join Nhood ES.',
    timestamp: '2m ago',
    read: false,
  },
  {
    id: 'l2',
    type: 'enquiry.received',
    title: 'New enquiry received',
    body: 'Zara has submitted a new enquiry for Unit 42, Xanadú Shopping.',
    timestamp: '1h ago',
    read: false,
    actionLabel: 'View enquiry',
  },
  {
    id: 'l3',
    type: 'booking.confirmed',
    title: 'Booking confirmed',
    body: 'The booking for Kiosk A3 by Nike has been confirmed for 12–26 May.',
    timestamp: '3h ago',
    read: false,
  },
  {
    id: 'l4',
    type: 'payment.received',
    title: 'Payment received',
    body: '€2,400 received from Adidas for Sampling Stand S1, Xanadú Shopping.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'l5',
    type: 'message.received',
    title: 'New message from Nike',
    body: 'Nike sent a message about their upcoming booking at Xanadú Shopping.',
    timestamp: 'Yesterday',
    read: true,
    actionLabel: 'View message',
  },
  {
    id: 'l6',
    type: 'booking.ending_soon',
    title: 'Booking ending soon',
    body: 'The booking for Billboard B2 by Samsung ends in 2 days.',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'l7',
    type: 'team.signatory_added',
    title: 'Signatory added',
    body: 'James Miller has been added as a DocuSign signatory for Xanadú Shopping.',
    timestamp: '3 days ago',
    read: true,
  },
]

const tenantSeedNotifications: AppNotification[] = [
  {
    id: 't1',
    type: 'booking_link.received',
    title: 'New booking invitation',
    body: 'Nhood ES has sent a booking invitation for a space at Xanadú Shopping. Complete your enquiry to proceed.',
    timestamp: '15m ago',
    read: false,
    actionLabel: 'Complete enquiry',
  },
  {
    id: 't2',
    type: 'document.awaiting_signature',
    title: 'Document ready to sign',
    body: 'Your lease agreement for Sampling Space S2 at Gran Via 2 is awaiting your signature.',
    timestamp: '2h ago',
    read: false,
    actionLabel: 'Sign document',
  },
  {
    id: 't3',
    type: 'booking.confirmed',
    title: 'Booking confirmed',
    body: 'Your booking for Pop-up Stand P3 at Xanadú Shopping has been confirmed for 15–30 Jun.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 't4',
    type: 'message.received',
    title: 'New message from Nhood ES',
    body: 'Carlos García sent a message about your upcoming booking at Xanadú Shopping.',
    timestamp: 'Yesterday',
    read: true,
    actionLabel: 'View message',
  },
  {
    id: 't5',
    type: 'payment.overdue',
    title: 'Invoice overdue',
    body: 'Invoice #INV-2041 for €1,800 is overdue. Please settle to avoid any disruption to your booking.',
    timestamp: '2 days ago',
    read: true,
    actionLabel: 'View invoice',
  },
  {
    id: 't6',
    type: 'booking.ending_soon',
    title: 'Booking ending soon',
    body: 'Your booking for Kiosk K1 at Gran Via 2 ends in 7 days. Contact Nhood ES to discuss renewal.',
    timestamp: '3 days ago',
    read: true,
  },
]

const notifications = ref<AppNotification[]>([...landlordSeedNotifications])

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

  function resetNotificationsForUserType(userType: 'landlord' | 'tenant') {
    notifications.value = userType === 'tenant'
      ? [...tenantSeedNotifications]
      : [...landlordSeedNotifications]
  }

  function clearMessages() {
    messages.value = []
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
    resetNotificationsForUserType,
    clearMessages,
  }
}
