<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import AppSidebar from '@/components/app-sidebar.vue'
import RightPanel from '@/components/right-panel.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  IconEdit,
  IconSearch,
  IconSend,
  IconPaperclip,
  IconPhoto,
  IconX,
  IconDots,
  IconFile,
  IconFileTypePdf,
  IconFileTypeXls,
  IconInbox,
  IconCheck,
  IconChecks,
  IconArrowLeft,
} from '@tabler/icons-vue'
import { useAppContext } from '@/composables/useAppContext'
import { useTeamContext } from '@/composables/useTeamContext'
import { useRightPanel } from '@/composables/useRightPanel'

const { context } = useAppContext()
const { activeTeam } = useTeamContext()
const { pushNotification } = useRightPanel()

// ─── Types ────────────────────────────────────────────────────────────────────

interface Attachment {
  id: string
  name: string
  type: 'pdf' | 'image' | 'spreadsheet' | 'file'
  size: string
  url?: string
}

interface Message {
  id: string
  senderId: string
  body: string
  sentAt: string // ISO
  read: boolean
  attachments?: Attachment[]
}

type ConvType = 'enquiry' | 'general' | 'booking'

interface Conversation {
  id: string
  teamId: string          // which team this thread belongs to
  type: ConvType          // NEW
  centreName?: string     // NEW – for enquiry + booking
  centreColor?: string    // NEW
  bookingId?: string      // NEW – for booking only
  orgName?: string        // NEW – landlord org name (shown in tenant view for general/booking)
  orgColor?: string       // NEW – landlord org color
  participantId: string
  participantName: string
  participantCompany: string
  participantRole: 'landlord' | 'tenant'
  participantAvatar?: string
  participantColor: string
  messages: Message[]
  closedAt?: string | null
}

interface SearchableUser {
  id: string
  name: string
  company: string
  email: string
  role: 'landlord' | 'tenant'
  color: string
}

// ─── Mock current user ────────────────────────────────────────────────────────

const ME = 'user-self'

// ─── Mock conversations ───────────────────────────────────────────────────────

const conversations = ref<Conversation[]>([
  // ── Nhood ES (team-spain) ──────────────────────────────────────────────────
  {
    id: 'conv-1',
    teamId: 'team-spain',
    type: 'booking',
    centreName: 'Centro Comercial Xanadú',
    centreColor: '#c0392b',
    bookingId: '10055',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'p-1',
    participantName: 'Sophie Laurent',
    participantCompany: 'Fresh Co.',
    participantRole: 'tenant',
    participantColor: '#16a34a',
    messages: [
      {
        id: 'm-1-1',
        senderId: ME,
        body: 'Hi Sophie, just a heads up — we\'ve updated the onboarding docs for your upcoming pop-up at Westfield London. I\'ve attached the latest version.',
        sentAt: '2026-05-26T09:12:00Z',
        read: true,
        attachments: [{ id: 'a1', name: 'Westfield_Onboarding_v3.pdf', type: 'pdf', size: '1.2 MB' }],
      },
      {
        id: 'm-1-2',
        senderId: 'p-1',
        body: 'Thanks! I\'ve had a look — all looks good. One question: the space dimensions on page 4 say 6m × 4m but the booking confirmation says 6m × 5m. Which is correct?',
        sentAt: '2026-05-26T10:34:00Z',
        read: true,
      },
      {
        id: 'm-1-3',
        senderId: ME,
        body: 'Good catch — it\'s 6m × 5m. I\'ll get that doc updated and resend today.',
        sentAt: '2026-05-26T11:05:00Z',
        read: true,
      },
      {
        id: 'm-1-4',
        senderId: 'p-1',
        body: 'Perfect, thank you. Also — are we still good for the site visit on Thursday at 2pm?',
        sentAt: '2026-05-28T08:47:00Z',
        read: false,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-2',
    teamId: 'team-spain',
    type: 'general',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'p-2',
    participantName: 'James Park',
    participantCompany: 'Nike',
    participantRole: 'tenant',
    participantColor: '#1d4ed8',
    messages: [
      {
        id: 'm-2-1',
        senderId: 'p-2',
        body: 'Hi, we\'re putting together our Q3 pop-up calendar. Can you share availability across your centres for July and August?',
        sentAt: '2026-05-24T14:20:00Z',
        read: true,
      },
      {
        id: 'm-2-2',
        senderId: ME,
        body: 'Of course — I\'ll pull together the availability sheet and send it over by end of day tomorrow.',
        sentAt: '2026-05-24T16:55:00Z',
        read: true,
      },
      {
        id: 'm-2-3',
        senderId: ME,
        body: 'Here\'s the availability overview for July–August across our top four sites.',
        sentAt: '2026-05-25T17:02:00Z',
        read: true,
        attachments: [{ id: 'a2', name: 'Space_Availability_Jul-Aug_2026.xlsx', type: 'spreadsheet', size: '84 KB' }],
      },
      {
        id: 'm-2-4',
        senderId: 'p-2',
        body: 'This is great, thank you. We\'ll review internally and come back to you by Friday.',
        sentAt: '2026-05-25T17:45:00Z',
        read: true,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-3',
    teamId: 'team-spain',
    type: 'booking',
    centreName: 'La Maquinista',
    centreColor: '#2c3e50',
    bookingId: '10042',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'p-3',
    participantName: 'Karim Benali',
    participantCompany: 'Adidas Originals',
    participantRole: 'tenant',
    participantColor: '#9333ea',
    messages: [
      {
        id: 'm-3-1',
        senderId: 'p-3',
        body: 'Quick question on the invoice for booking 10042 — the VAT amount looks off. Should it be 20% on the net or is there a reduced rate applied?',
        sentAt: '2026-05-26T13:10:00Z',
        read: false,
      },
      {
        id: 'm-3-2',
        senderId: 'p-3',
        body: 'I\'ve attached the invoice for reference.',
        sentAt: '2026-05-26T13:11:00Z',
        read: false,
        attachments: [{ id: 'a3', name: 'Invoice_10042.pdf', type: 'pdf', size: '340 KB' }],
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-4',
    teamId: 'team-spain',
    type: 'booking',
    centreName: 'Centro Comercial Xanadú',
    centreColor: '#c0392b',
    bookingId: '10031',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'p-4',
    participantName: 'Emma Chen',
    participantCompany: 'Lululemon',
    participantRole: 'tenant',
    participantColor: '#dc2626',
    messages: [
      {
        id: 'm-4-1',
        senderId: ME,
        body: 'Hi Emma, just confirming that the contract for your Bluewater booking has been sent to DocuSign. Please sign at your earliest convenience — we need it back before the 1st.',
        sentAt: '2026-05-20T10:00:00Z',
        read: true,
      },
      {
        id: 'm-4-2',
        senderId: 'p-4',
        body: 'Got it — will sign today.',
        sentAt: '2026-05-20T11:30:00Z',
        read: true,
      },
      {
        id: 'm-4-3',
        senderId: 'p-4',
        body: 'Done! Also, could you send over the setup guidelines for the space? Particularly power outlet locations.',
        sentAt: '2026-05-20T12:15:00Z',
        read: true,
      },
      {
        id: 'm-4-4',
        senderId: ME,
        body: 'Signed, thank you. Here\'s the setup pack — power outlet map is on page 3.',
        sentAt: '2026-05-21T09:05:00Z',
        read: true,
        attachments: [
          { id: 'a4', name: 'Bluewater_Space_Setup_Guide.pdf', type: 'pdf', size: '2.4 MB' },
          { id: 'a5', name: 'Outlet_Map_Unit_12B.jpg', type: 'image', size: '540 KB' },
        ],
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-5',
    teamId: 'team-spain',
    type: 'general',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'p-5',
    participantName: 'Pieter van der Berg',
    participantCompany: 'Rituals Cosmetics',
    participantRole: 'tenant',
    participantColor: '#0891b2',
    messages: [
      {
        id: 'm-5-1',
        senderId: 'p-5',
        body: 'We\'d like to rebook the same space at Meadowhall for December. Is it available?',
        sentAt: '2026-05-14T09:00:00Z',
        read: true,
      },
      {
        id: 'm-5-2',
        senderId: ME,
        body: 'I\'ll check and come back to you. The festive season fills up fast so it\'s worth locking it in early.',
        sentAt: '2026-05-14T09:45:00Z',
        read: true,
      },
      {
        id: 'm-5-3',
        senderId: ME,
        body: 'Good news — Unit 7A is available 1–31 December. I\'ve sent a booking link to your email. Let me know if you have any questions.',
        sentAt: '2026-05-15T11:20:00Z',
        read: true,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-6',
    teamId: 'team-spain',
    type: 'enquiry',
    centreName: 'Centro Comercial Xanadú',
    centreColor: '#c0392b',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'p-6',
    participantName: 'Sarah Mitchell',
    participantCompany: 'Dyson',
    participantRole: 'tenant',
    participantColor: '#b45309',
    messages: [
      {
        id: 'm-6-1',
        senderId: 'p-6',
        body: 'We\'re exploring a 6-week experiential setup in London — potentially Westfield or Bluewater. Who\'s the best person to speak to about large-format spaces?',
        sentAt: '2026-04-28T10:30:00Z',
        read: true,
      },
      {
        id: 'm-6-2',
        senderId: ME,
        body: 'Happy to help — I handle both sites. Can you share a brief on the concept and approximate square meterage? That\'ll help me point you to the right options.',
        sentAt: '2026-04-28T11:15:00Z',
        read: true,
      },
      {
        id: 'm-6-3',
        senderId: 'p-6',
        body: 'Here\'s our brief and some mood board images from our Berlin activation last year.',
        sentAt: '2026-04-28T14:00:00Z',
        read: true,
        attachments: [
          { id: 'a6', name: 'Dyson_London_2026_Brief.pdf', type: 'pdf', size: '1.8 MB' },
          { id: 'a7', name: 'Berlin_Activation_Moodboard.jpg', type: 'image', size: '3.2 MB' },
        ],
      },
      {
        id: 'm-6-4',
        senderId: ME,
        body: 'This looks brilliant — exactly the kind of activation both sites would love. I\'ll put together some space options and pricing this week.',
        sentAt: '2026-04-29T09:40:00Z',
        read: true,
      },
    ],
    closedAt: null,
  },

  // ── Nhood FR (team-france) ─────────────────────────────────────────────────
  {
    id: 'conv-fr-1',
    teamId: 'team-france',
    type: 'enquiry',
    centreName: 'Les Quatre Temps',
    centreColor: '#2980b9',
    orgName: 'Nhood FR North',
    orgColor: '#2980b9',
    participantId: 'fr-p-1',
    participantName: 'Isabelle Fontaine',
    participantCompany: 'Sephora',
    participantRole: 'tenant',
    participantColor: '#0f172a',
    messages: [
      {
        id: 'm-fr-1-1',
        senderId: 'fr-p-1',
        body: 'Bonjour, nous sommes intéressés par un espace pop-up aux Quatre Temps pour la période des fêtes. Pouvez-vous nous confirmer les disponibilités de novembre à janvier ?',
        sentAt: '2026-05-27T10:15:00Z',
        read: false,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-fr-2',
    teamId: 'team-france',
    type: 'booking',
    centreName: 'Centre Commercial Part-Dieu',
    centreColor: '#1a5276',
    bookingId: '10038',
    orgName: 'Nhood FR North',
    orgColor: '#2980b9',
    participantId: 'fr-p-2',
    participantName: 'Thomas Leblanc',
    participantCompany: 'L\'Oréal Paris',
    participantRole: 'tenant',
    participantColor: '#d97706',
    messages: [
      {
        id: 'm-fr-2-1',
        senderId: ME,
        body: 'Hi Thomas, confirming that the contract for your Part-Dieu activation has been countersigned. You\'re good to go for June 1st.',
        sentAt: '2026-05-22T09:00:00Z',
        read: true,
      },
      {
        id: 'm-fr-2-2',
        senderId: 'fr-p-2',
        body: 'Excellent, merci ! We\'ll have our setup crew on-site from May 30th. Can you confirm access arrangements with the centre manager?',
        sentAt: '2026-05-22T11:30:00Z',
        read: true,
      },
      {
        id: 'm-fr-2-3',
        senderId: ME,
        body: 'Confirmed — I\'ve copied the centre manager on this thread. They\'ll reach out directly to coordinate access passes and loading bay times.',
        sentAt: '2026-05-22T14:05:00Z',
        read: true,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-fr-3',
    teamId: 'team-france',
    type: 'enquiry',
    centreName: 'Les Quatre Temps',
    centreColor: '#2980b9',
    orgName: 'Nhood FR North',
    orgColor: '#2980b9',
    participantId: 'fr-p-3',
    participantName: 'Claire Moreau',
    participantCompany: 'Kiehl\'s',
    participantRole: 'tenant',
    participantColor: '#7c3aed',
    messages: [
      {
        id: 'm-fr-3-1',
        senderId: 'fr-p-3',
        body: 'We\'d like to rebook Unit 14B at Les Quatre Temps for Q4. Same footprint as last year — around 40m². Is it available?',
        sentAt: '2026-05-15T08:45:00Z',
        read: true,
      },
      {
        id: 'm-fr-3-2',
        senderId: ME,
        body: 'Great to hear from you! I\'ll check the availability calendar and come back to you by end of day.',
        sentAt: '2026-05-15T10:20:00Z',
        read: true,
      },
    ],
    closedAt: null,
  },

  // ── Team One (team-one, Fillit) ────────────────────────────────────────────
  {
    id: 'conv-t1-1',
    teamId: 'team-one',
    type: 'enquiry',
    centreName: 'Westfield London',
    centreColor: '#1a1a1a',
    orgName: 'Team One',
    orgColor: '#059669',
    participantId: 'uk-p-1',
    participantName: 'Rachel Thompson',
    participantCompany: 'ASOS',
    participantRole: 'tenant',
    participantColor: '#1d4ed8',
    messages: [
      {
        id: 'm-t1-1-1',
        senderId: 'uk-p-1',
        body: 'Hi, we\'re looking at a short-term pop-up at Westfield London for the launch of our new streetwear line. Targeting late September for 3 weeks. Anything suitable?',
        sentAt: '2026-05-28T09:00:00Z',
        read: false,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-t1-2',
    teamId: 'team-one',
    type: 'booking',
    centreName: 'Bluewater',
    centreColor: '#2d6a9f',
    bookingId: '10058',
    orgName: 'Team One',
    orgColor: '#059669',
    participantId: 'uk-p-2',
    participantName: 'Ben Hargreaves',
    participantCompany: 'Gymshark',
    participantRole: 'tenant',
    participantColor: '#059669',
    messages: [
      {
        id: 'm-t1-2-1',
        senderId: ME,
        body: 'Ben, the Bluewater unit is confirmed from July 5th. I\'ve sent the licence agreement to DocuSign — please sign at your earliest convenience.',
        sentAt: '2026-05-20T11:00:00Z',
        read: true,
      },
      {
        id: 'm-t1-2-2',
        senderId: 'uk-p-2',
        body: 'Signed! Really excited about this one. Can you send over the electrical spec for the unit? We\'re bringing our own lighting rig.',
        sentAt: '2026-05-20T13:45:00Z',
        read: true,
      },
      {
        id: 'm-t1-2-3',
        senderId: ME,
        body: 'Here you go — the full technical spec sheet is attached.',
        sentAt: '2026-05-21T08:30:00Z',
        read: true,
        attachments: [{ id: 'at1', name: 'Bluewater_Unit_8A_TechSpec.pdf', type: 'pdf', size: '890 KB' }],
      },
    ],
    closedAt: null,
  },

  // ── Fresh Co. / team-tenant ────────────────────────────────────────────────
  {
    id: 'conv-tenant-1',
    teamId: 'team-tenant',
    type: 'enquiry',
    centreName: 'Centro Comercial Xanadú',
    centreColor: '#c0392b',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'landlord-1',
    participantName: 'Carlos García',
    participantCompany: 'Nhood ES',
    participantRole: 'landlord',
    participantColor: '#c0392b',
    messages: [
      {
        id: 'm-ten-1-1',
        senderId: ME,
        body: 'Hi, we\'re interested in running a sampling activation at Xanadú for 2 weeks in July. Could you share available dates and space options?',
        sentAt: '2026-05-27T11:20:00Z',
        read: true,
      },
      {
        id: 'm-ten-1-2',
        senderId: 'landlord-1',
        body: 'Hi! Great to hear from you. We have a few ground-floor spots available in July — I\'ll put together an availability overview and send it across.',
        sentAt: '2026-05-27T14:05:00Z',
        read: false,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-tenant-2',
    teamId: 'team-tenant',
    type: 'booking',
    centreName: 'Centro Comercial Xanadú',
    centreColor: '#c0392b',
    bookingId: '10099',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'landlord-1',
    participantName: 'Carlos García',
    participantCompany: 'Nhood ES',
    participantRole: 'landlord',
    participantColor: '#c0392b',
    messages: [
      {
        id: 'm-ten-2-1',
        senderId: 'landlord-1',
        body: 'Hi Fresh Co. team — your contract for booking #10099 has been sent to DocuSign. Please sign before May 31st to hold the space.',
        sentAt: '2026-05-25T10:00:00Z',
        read: true,
      },
      {
        id: 'm-ten-2-2',
        senderId: ME,
        body: 'Signed and done! Could you also confirm the maximum display height allowed for the unit?',
        sentAt: '2026-05-25T11:30:00Z',
        read: true,
      },
      {
        id: 'm-ten-2-3',
        senderId: 'landlord-1',
        body: 'Maximum height is 2.2m. Please avoid obscuring the overhead signage. Let me know if you need anything else before move-in.',
        sentAt: '2026-05-25T13:15:00Z',
        read: false,
      },
    ],
    closedAt: null,
  },
  {
    id: 'conv-tenant-3',
    teamId: 'team-tenant',
    type: 'general',
    orgName: 'Nhood ES',
    orgColor: '#c0392b',
    participantId: 'landlord-1',
    participantName: 'Carlos García',
    participantCompany: 'Nhood ES',
    participantRole: 'landlord',
    participantColor: '#c0392b',
    messages: [
      {
        id: 'm-ten-3-1',
        senderId: 'landlord-1',
        body: 'We\'re running a landlord networking event on June 10th — thought Fresh Co. might be interested in attending as a featured brand. Would you like details?',
        sentAt: '2026-05-20T15:30:00Z',
        read: true,
      },
      {
        id: 'm-ten-3-2',
        senderId: ME,
        body: 'That sounds really interesting, we\'d love more details!',
        sentAt: '2026-05-21T09:00:00Z',
        read: true,
      },
    ],
    closedAt: null,
  },
])

// ─── Searchable user directory (for new conversations) ────────────────────────

const allUsers: SearchableUser[] = [
  { id: 'p-7', name: 'Alice Johnson', company: 'Zara', email: 'alice@zara.com', role: 'tenant', color: '#0f172a' },
  { id: 'p-8', name: 'Marcus Webb', company: 'Apple', email: 'm.webb@apple.com', role: 'tenant', color: '#6b7280' },
  { id: 'p-9', name: 'Léa Moreau', company: 'L\'Occitane', email: 'lea@loccitane.com', role: 'tenant', color: '#be185d' },
  { id: 'p-10', name: 'David Chen', company: 'Samsung', email: 'd.chen@samsung.com', role: 'tenant', color: '#1d4ed8' },
  { id: 'p-11', name: 'Fatima Al-Rashid', company: 'Majid Al Futtaim', email: 'f.alrashid@maf.com', role: 'landlord', color: '#047857' },
  { id: 'p-12', name: 'Tom Eriksson', company: 'Unibail-Rodamco', email: 'tom@ur.com', role: 'landlord', color: '#7c3aed' },
]

// ─── State ────────────────────────────────────────────────────────────────────

const activeConvId = ref<string | null>('conv-1')
const convSearchQuery = ref('')
const messageInput = ref('')
const leftPanelMode = ref<'list' | 'compose'>('list')
const newConvSearch = ref('')
const composeSearchRef = ref<HTMLInputElement | null>(null)
const pendingAttachments = ref<{ name: string; type: Attachment['type']; size: string }[]>([])
const messagesEndRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const closedConvIds = ref<Set<string>>(new Set())

// ─── Computed ─────────────────────────────────────────────────────────────────

const activeConversation = computed(() =>
  conversations.value.find(c => c.id === activeConvId.value) ?? null
)

const filteredConversations = computed(() => {
  const q = convSearchQuery.value.trim().toLowerCase()
  const teamId = activeTeam.value?.id ?? null
  return conversations.value
    .filter(c => !closedConvIds.value.has(c.id))
    .filter(c => !teamId || c.teamId === teamId)
    .filter(c => {
      if (!q) return true
      return (
        c.participantName.toLowerCase().includes(q) ||
        c.participantCompany.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.sentAt ?? ''
      const bLast = b.messages[b.messages.length - 1]?.sentAt ?? ''
      return bLast.localeCompare(aLast)
    })
})

const newConvResults = computed(() => {
  const q = newConvSearch.value.trim().toLowerCase()
  if (!q) return []
  const existing = new Set(conversations.value.map(c => c.participantId))
  return allUsers.filter(
    u =>
      !existing.has(u.id) &&
      (u.name.toLowerCase().includes(q) ||
        u.company.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q))
  )
})

const unreadCount = (conv: Conversation) =>
  conv.messages.filter(m => m.senderId !== ME && !m.read).length

const lastMessage = (conv: Conversation) =>
  conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null

const formatTime = (iso: string) => {
  const d = new Date(iso)
  const now = new Date('2026-05-28T12:00:00Z')
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'short' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const formatMessageTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const formatDateSeparator = (iso: string) => {
  const d = new Date(iso)
  const now = new Date('2026-05-28T12:00:00Z')
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Group messages by day for date separators
const groupedMessages = computed(() => {
  if (!activeConversation.value) return []
  const msgs = activeConversation.value.messages
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''
  for (const msg of msgs) {
    const date = msg.sentAt.split('T')[0]
    if (date !== currentDate) {
      currentDate = date
      groups.push({ date: msg.sentAt, messages: [] })
    }
    groups[groups.length - 1].messages.push(msg)
  }
  return groups
})

// ─── Actions ──────────────────────────────────────────────────────────────────

function selectConversation(id: string) {
  activeConvId.value = id
  // Mark all as read
  const conv = conversations.value.find(c => c.id === id)
  if (conv) {
    conv.messages.forEach(m => { m.read = true })
  }
  nextTick(scrollToBottom)
}

// ─── Notification helpers ─────────────────────────────────────────────────────

const AUTO_REPLIES = [
  'Thanks for the update — I\'ll review and come back to you shortly.',
  'Got it, appreciate the quick response!',
  'Perfect, that\'s exactly what we needed. We\'ll confirm our end soon.',
  'Understood — I\'ll check with the team and get back to you.',
  'Great, thanks for sorting that. Will keep you posted.',
]

function simulateReply(convId: string) {
  const conv = conversations.value.find(c => c.id === convId)
  if (!conv) return
  const body = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
  conv.messages.push({
    id: `m-auto-${Date.now()}`,
    senderId: conv.participantId,
    body,
    sentAt: new Date().toISOString(),
    read: activeConvId.value === convId, // mark read if the thread is already open
  })
  // Only toast if the thread isn't the one currently open
  if (activeConvId.value !== convId) nextTick(scrollToBottom)
  else nextTick(scrollToBottom)
  const display = getConvDisplay(conv)
  pushNotification({
    type: 'message.received',
    title: `New message from ${display.line1}`,
    body,
    actionLabel: 'View message',
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function sendMessage() {
  const body = messageInput.value.trim()
  if (!body && !pendingAttachments.value.length) return
  const conv = conversations.value.find(c => c.id === activeConvId.value)
  if (!conv) return

  conv.messages.push({
    id: `m-${Date.now()}`,
    senderId: ME,
    body,
    sentAt: new Date().toISOString(),
    read: true,
    attachments: pendingAttachments.value.length
      ? pendingAttachments.value.map((a, i) => ({ ...a, id: `att-${Date.now()}-${i}` }))
      : undefined,
  })

  messageInput.value = ''
  pendingAttachments.value = []
  nextTick(scrollToBottom)

  // Simulate the other party replying after a short delay
  const convId = conv.id
  setTimeout(() => simulateReply(convId), 2500)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function scrollToBottom() {
  messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function closeConversation(id: string) {
  closedConvIds.value.add(id)
  if (activeConvId.value === id) {
    const next = filteredConversations.value.find(c => c.id !== id)
    activeConvId.value = next?.id ?? null
  }
}

function openCompose() {
  leftPanelMode.value = 'compose'
  newConvSearch.value = ''
  nextTick(() => composeSearchRef.value?.focus())
}

function closeCompose() {
  leftPanelMode.value = 'list'
  newConvSearch.value = ''
}

function startNewConversation(user: SearchableUser) {
  const newConv: Conversation = {
    id: `conv-new-${user.id}`,
    teamId: activeTeam.value?.id ?? '',
    type: 'general',
    participantId: user.id,
    participantName: user.name,
    participantCompany: user.company,
    participantRole: user.role,
    participantColor: user.color,
    messages: [],
    closedAt: null,
  }
  conversations.value.unshift(newConv)
  activeConvId.value = newConv.id
  closeCompose()
}

function triggerFileInput() { fileInputRef.value?.click() }
function triggerImageInput() { imageInputRef.value?.click() }

function handleFileChange(e: Event, type: 'file' | 'image') {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    let fileType: Attachment['type'] = 'file'
    if (['pdf'].includes(ext)) fileType = 'pdf'
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) fileType = 'image'
    else if (['xls', 'xlsx', 'csv'].includes(ext)) fileType = 'spreadsheet'
    pendingAttachments.value.push({
      name: file.name,
      type: fileType,
      size: `${(file.size / 1024).toFixed(0)} KB`,
    })
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeAttachment(i: number) {
  pendingAttachments.value.splice(i, 1)
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Conversation display logic ───────────────────────────────────────────────

interface ConvDisplay {
  mainColor: string
  mainInitials: string
  mainIsSquare: boolean
  floatColor?: string
  floatInitials?: string
  line1: string
  line2?: string
}

function getConvDisplay(conv: Conversation): ConvDisplay {
  const isTenant = context.value.userType === 'tenant'
  // Tenant's own org — shown as the float overlay when they view centre-originated convs
  const myOrgColor  = activeTeam.value?.color  ?? '#0891b2'
  const myOrgName   = activeTeam.value?.name   ?? 'Fresh Co.'

  if (conv.type === 'enquiry') {
    if (isTenant) {
      // Square = centre, float = my org (I initiated this from the centre page)
      return {
        mainColor:    conv.centreColor ?? '#6b7280',
        mainInitials: getInitials(conv.centreName ?? '?'),
        mainIsSquare: true,
        floatColor:   myOrgColor,
        floatInitials: getInitials(myOrgName),
        line1: conv.centreName ?? conv.participantName,
        line2: undefined,
      }
    } else {
      // Landlord view: circle = tenant org, line1 = company, line2 = person name
      return {
        mainColor:    conv.participantColor,
        mainInitials: getInitials(conv.participantCompany),
        mainIsSquare: false,
        line1: conv.participantCompany,
        line2: conv.participantName,
      }
    }
  }

  if (conv.type === 'booking') {
    if (isTenant) {
      // Square = centre, float = landlord org
      return {
        mainColor:    conv.centreColor ?? '#6b7280',
        mainInitials: getInitials(conv.centreName ?? '?'),
        mainIsSquare: true,
        floatColor:   conv.orgColor ?? conv.participantColor,
        floatInitials: getInitials(conv.orgName ?? conv.participantName),
        line1: conv.centreName ?? conv.participantName,
        line2: conv.bookingId  ? `Booking #${conv.bookingId}` : undefined,
      }
    } else {
      // Landlord view: Square = centre, float = tenant org; line1 = tenant company
      return {
        mainColor:    conv.centreColor ?? '#6b7280',
        mainInitials: getInitials(conv.centreName ?? '?'),
        mainIsSquare: true,
        floatColor:   conv.participantColor,
        floatInitials: getInitials(conv.participantCompany),
        line1: conv.participantCompany,
        line2: conv.bookingId  ? `Booking #${conv.bookingId}` : conv.participantName,
      }
    }
  }

  // 'general'
  if (isTenant) {
    // Landlord initiated — show landlord org logo as simple circle
    return {
      mainColor:    conv.orgColor ?? conv.participantColor,
      mainInitials: getInitials(conv.orgName ?? conv.participantName),
      mainIsSquare: false,
      line1: conv.orgName ?? conv.participantName,
      line2: undefined,
    }
  } else {
    // Landlord view: circle = tenant org, line1 = company, line2 = person name
    return {
      mainColor:    conv.participantColor,
      mainInitials: getInitials(conv.participantCompany),
      mainIsSquare: false,
      line1: conv.participantCompany,
      line2: conv.participantName,
    }
  }
}

function attachmentIcon(type: Attachment['type']) {
  if (type === 'pdf') return IconFileTypePdf
  if (type === 'spreadsheet') return IconFileTypeXls
  if (type === 'image') return IconPhoto
  return IconFile
}

// On mount: notify for unread conversations in the active team (max 2, staggered)
onMounted(() => {
  const teamId = activeTeam.value?.id ?? null
  const unread = conversations.value
    .filter(c => teamId ? c.teamId === teamId : true)
    .filter(c => unreadCount(c) > 0)
    .slice(0, 2)

  unread.forEach((conv, i) => {
    const last = [...conv.messages].reverse().find(m => m.senderId !== ME)
    if (!last) return
    const display = getConvDisplay(conv)
    setTimeout(() => {
      pushNotification({
        type: 'message.received',
        title: `New message from ${display.line1}`,
        body: last.body,
        actionLabel: 'View message',
      })
    }, i * 1200)
  })
})

watch(activeConvId, () => {
  nextTick(scrollToBottom)
})

// When the active team changes, select the first conversation in the new team
watch(() => activeTeam.value?.id, () => {
  const first = filteredConversations.value[0]
  activeConvId.value = first?.id ?? null
  nextTick(scrollToBottom)
})
</script>

<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar active-item="messages" />
    <RightPanel />
    <SidebarInset class="overflow-hidden">
      <div class="flex h-full overflow-hidden">

        <!-- ── Left panel ──────────────────────────────────────────────── -->
        <div class="flex w-80 shrink-0 flex-col border-r border-border">

          <!-- Compose header -->
          <div v-show="leftPanelMode === 'compose'" class="flex items-center gap-2 border-b border-border px-4 py-4">
            <Button variant="ghost" size="sm" class="h-7 w-7 shrink-0 p-0" @click="closeCompose">
              <IconArrowLeft :size="15" />
            </Button>
            <h1 class="text-base font-semibold text-foreground">New message</h1>
          </div>

          <!-- Compose search -->
          <div v-show="leftPanelMode === 'compose'" class="border-b border-border px-3 py-2.5">
            <div class="relative">
              <IconSearch :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref="composeSearchRef"
                v-model="newConvSearch"
                type="text"
                placeholder="Search by name, company or email…"
                class="h-8 w-full rounded-md bg-muted pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <!-- Compose results -->
          <div v-show="leftPanelMode === 'compose'" class="flex-1 overflow-y-auto">
            <Button
              v-for="user in newConvResults"
              :key="user.id"
              variant="ghost"
              class="flex h-auto w-full items-center justify-start gap-3 rounded-none px-4 py-3 text-left"
              @click="startNewConversation(user)"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                :style="{ backgroundColor: user.color }"
              >
                {{ getInitials(user.name) }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-foreground">{{ user.name }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ user.company }} · {{ user.email }}</p>
              </div>
            </Button>
            <div v-if="leftPanelMode === 'compose' && !newConvSearch.trim()" class="px-4 pt-6 text-center">
              <p class="text-xs text-muted-foreground">Search to start a new conversation</p>
            </div>
            <div v-if="leftPanelMode === 'compose' && newConvSearch.trim() && newConvResults.length === 0" class="px-4 pt-6 text-center">
              <p class="text-xs text-muted-foreground">No users found</p>
            </div>
          </div>

          <!-- List header -->
          <div v-show="leftPanelMode === 'list'" class="flex items-center justify-between border-b border-border px-4 py-4">
            <h1 class="text-base font-semibold text-foreground">Messages</h1>
            <Button v-if="context.userType === 'landlord'" size="sm" @click="openCompose">
              <IconEdit :size="13" class="mr-1.5" />
              New message
            </Button>
          </div>

          <!-- List search -->
          <div v-show="leftPanelMode === 'list'" class="border-b border-border px-3 py-2.5">
            <div class="relative">
              <IconSearch :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="convSearchQuery"
                type="text"
                placeholder="Search conversations"
                class="h-8 w-full rounded-md bg-muted pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <!-- Conversation list -->
          <div v-show="leftPanelMode === 'list'" class="flex-1 overflow-y-auto">
            <Button
              v-for="conv in filteredConversations"
              :key="conv.id"
              variant="ghost"
              class="flex h-auto w-full items-start justify-start gap-3 rounded-none px-4 py-3.5 text-left"
              :class="activeConvId === conv.id ? 'bg-muted hover:bg-muted' : ''"
              @click="selectConversation(conv.id)"
            >
              <!-- Avatar: composite (square + float) or simple circle -->
              <div class="relative mt-0.5 h-10 w-10 shrink-0">
                <div
                  class="flex h-10 w-10 items-center justify-center text-xs font-bold text-white"
                  :class="getConvDisplay(conv).mainIsSquare ? 'rounded-lg' : 'rounded-full'"
                  :style="{ backgroundColor: getConvDisplay(conv).mainColor }"
                >
                  {{ getConvDisplay(conv).mainInitials }}
                </div>
                <!-- Floating org circle — only shown for composite convs -->
                <div
                  v-if="getConvDisplay(conv).floatColor"
                  class="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-bold text-white"
                  :style="{ backgroundColor: getConvDisplay(conv).floatColor }"
                >
                  {{ getConvDisplay(conv).floatInitials }}
                </div>
              </div>

              <!-- Text -->
              <div class="min-w-0 flex-1">
                <!-- Line 1: name + timestamp -->
                <div class="flex items-baseline justify-between gap-2">
                  <p class="truncate text-sm font-medium text-foreground">{{ getConvDisplay(conv).line1 }}</p>
                  <span v-if="lastMessage(conv)" class="shrink-0 text-[10px] text-muted-foreground">{{ formatTime(lastMessage(conv)!.sentAt) }}</span>
                </div>
                <!-- Line 2: context (booking ID / company / blank) -->
                <p class="truncate text-xs text-muted-foreground">
                  {{ getConvDisplay(conv).line2 ?? '&nbsp;' }}
                </p>
                <!-- Line 3: message preview + unread badge -->
                <div class="mt-0.5 flex items-center justify-between gap-2">
                  <p class="truncate text-xs text-muted-foreground">
                    <template v-if="lastMessage(conv)">
                      <span v-if="lastMessage(conv)!.senderId === ME" class="mr-0.5 text-muted-foreground/60">You: </span>{{ lastMessage(conv)!.body || (lastMessage(conv)!.attachments?.length ? '📎 Attachment' : '') }}
                    </template>
                    <template v-else>No messages yet</template>
                  </p>
                  <Badge
                    v-if="unreadCount(conv) > 0"
                    class="h-4 min-w-[16px] shrink-0 justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground"
                  >
                    {{ unreadCount(conv) }}
                  </Badge>
                </div>
              </div>
            </Button>
            <div v-if="leftPanelMode === 'list' && filteredConversations.length === 0" class="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <IconInbox :size="28" class="text-muted-foreground/40" />
              <p class="text-sm text-muted-foreground">No conversations found</p>
            </div>
          </div>

        </div>

        <!-- ── Right panel: active thread ──────────────────────────────── -->

        <!-- Empty state -->
        <div v-if="!activeConversation" class="flex flex-1 flex-col items-center justify-center gap-3">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <IconInbox :size="24" class="text-muted-foreground" />
          </div>
          <p class="text-sm font-medium text-foreground">No conversation selected</p>
          <p class="text-xs text-muted-foreground">Choose a conversation or start a new one</p>
          <Button v-if="context.userType === 'landlord'" size="sm" class="mt-2" @click="openCompose">
            <IconEdit :size="13" class="mr-1.5" />
            New message
          </Button>
        </div>

        <!-- Active thread -->
        <template v-else>
          <div class="flex flex-1 flex-col overflow-hidden">

            <!-- Thread header -->
            <div class="flex items-center justify-between border-b border-border px-6 py-3.5">
              <div class="flex items-center gap-3">
                <!-- Avatar -->
                <div class="relative h-9 w-9 shrink-0">
                  <div
                    class="flex h-9 w-9 items-center justify-center text-xs font-bold text-white"
                    :class="getConvDisplay(activeConversation).mainIsSquare ? 'rounded-lg' : 'rounded-full'"
                    :style="{ backgroundColor: getConvDisplay(activeConversation).mainColor }"
                  >
                    {{ getConvDisplay(activeConversation).mainInitials }}
                  </div>
                  <div
                    v-if="getConvDisplay(activeConversation).floatColor"
                    class="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white"
                    :style="{ backgroundColor: getConvDisplay(activeConversation).floatColor }"
                  >
                    {{ getConvDisplay(activeConversation).floatInitials }}
                  </div>
                </div>
                <!-- Name + context -->
                <div>
                  <p class="text-sm font-semibold text-foreground">{{ getConvDisplay(activeConversation).line1 }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ getConvDisplay(activeConversation).line2 ?? activeConversation.participantCompany }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                    <IconDots :size="16" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" :side-offset="6">
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    @click="closeConversation(activeConversation.id)"
                  >
                    Close conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <!-- Messages area -->
            <div class="flex-1 overflow-y-auto px-6 py-6">
              <div class="mx-auto flex max-w-[720px] flex-col gap-6">

                <template v-for="group in groupedMessages" :key="group.date">
                  <!-- Date separator -->
                  <div class="flex items-center gap-3">
                    <div class="h-px flex-1 bg-border" />
                    <span class="text-[11px] font-medium text-muted-foreground">{{ formatDateSeparator(group.date) }}</span>
                    <div class="h-px flex-1 bg-border" />
                  </div>

                  <!-- Messages in group -->
                  <div
                    v-for="(msg, idx) in group.messages"
                    :key="msg.id"
                    class="flex gap-3"
                    :class="msg.senderId === ME ? 'flex-row-reverse' : 'flex-row'"
                  >
                    <!-- Avatar — show for first in consecutive run from same sender -->
                    <div
                      v-if="msg.senderId !== ME && (idx === 0 || group.messages[idx - 1].senderId !== msg.senderId)"
                      class="mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      :style="{ backgroundColor: activeConversation.participantColor }"
                    >
                      {{ getInitials(activeConversation.participantName) }}
                    </div>
                    <div
                      v-else-if="msg.senderId !== ME"
                      class="w-7 shrink-0"
                    />

                    <!-- Bubble -->
                    <div
                      class="flex max-w-[65%] flex-col gap-1"
                      :class="msg.senderId === ME ? 'items-end' : 'items-start'"
                    >
                      <!-- Text bubble -->
                      <div
                        v-if="msg.body"
                        class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                        :class="msg.senderId === ME
                          ? 'rounded-tr-sm bg-foreground text-background'
                          : 'rounded-tl-sm bg-muted text-foreground'"
                      >
                        {{ msg.body }}
                      </div>

                      <!-- Attachments -->
                      <div
                        v-if="msg.attachments?.length"
                        class="flex flex-col gap-1.5"
                        :class="msg.senderId === ME ? 'items-end' : 'items-start'"
                      >
                        <div
                          v-for="att in msg.attachments"
                          :key="att.id"
                          class="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5"
                        >
                          <component
                            :is="attachmentIcon(att.type)"
                            :size="18"
                            class="shrink-0 text-muted-foreground"
                          />
                          <div class="min-w-0">
                            <p class="truncate text-xs font-medium text-foreground">{{ att.name }}</p>
                            <p class="text-[10px] text-muted-foreground">{{ att.size }}</p>
                          </div>
                        </div>
                      </div>

                      <!-- Timestamp + read receipt -->
                      <div class="flex items-center gap-1 px-1">
                        <span class="text-[10px] text-muted-foreground">{{ formatMessageTime(msg.sentAt) }}</span>
                        <IconChecks
                          v-if="msg.senderId === ME"
                          :size="12"
                          class="text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Empty thread state -->
                <div v-if="activeConversation.messages.length === 0" class="flex flex-col items-center gap-2 py-12 text-center">
                  <p class="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                </div>

                <div ref="messagesEndRef" />
              </div>
            </div>

            <!-- Input area -->
            <div class="border-t border-border bg-background px-6 py-4">
              <div class="mx-auto max-w-[720px]">

                <!-- Pending attachments -->
                <div v-if="pendingAttachments.length" class="mb-2.5 flex flex-wrap gap-2">
                  <div
                    v-for="(att, i) in pendingAttachments"
                    :key="i"
                    class="flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5"
                  >
                    <component :is="attachmentIcon(att.type)" :size="14" class="shrink-0 text-muted-foreground" />
                    <span class="max-w-[140px] truncate text-xs text-foreground">{{ att.name }}</span>
                    <button
                      type="button"
                      class="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      @click="removeAttachment(i)"
                    >
                      <IconX :size="12" />
                    </button>
                  </div>
                </div>

                <!-- Composer -->
                <div class="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-foreground/30 focus-within:ring-1 focus-within:ring-ring/20">
                  <textarea
                    v-model="messageInput"
                    placeholder="Write a message…"
                    rows="1"
                    class="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    @input="(e) => { const el = e.target as HTMLTextAreaElement; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 128) + 'px' }"
                    @keydown="handleKeydown"
                  />

                  <!-- Attachment buttons -->
                  <div class="flex shrink-0 items-center gap-0.5 pb-0.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <button
                            type="button"
                            class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            @click="triggerFileInput"
                          >
                            <IconPaperclip :size="16" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <button
                            type="button"
                            class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            @click="triggerImageInput"
                          >
                            <IconPhoto :size="16" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Attach image</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <!-- Send -->
                    <button
                      type="button"
                      class="ml-1 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                      :class="messageInput.trim() || pendingAttachments.length
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'bg-muted text-muted-foreground'"
                      :disabled="!messageInput.trim() && !pendingAttachments.length"
                      @click="sendMessage"
                    >
                      <IconSend :size="15" />
                    </button>
                  </div>
                </div>

                <p class="mt-1.5 text-[10px] text-muted-foreground">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </div>

          </div>
        </template>
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- Hidden file inputs -->
  <input ref="fileInputRef" type="file" class="hidden" multiple @change="e => handleFileChange(e, 'file')" />
  <input ref="imageInputRef" type="file" class="hidden" accept="image/*" multiple @change="e => handleFileChange(e, 'image')" />
</template>
