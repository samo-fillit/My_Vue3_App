/**
 * Notification Registry
 *
 * Single source of truth for every in-app notification the platform can produce.
 *
 * FRONTEND: drives the type system — useRightPanel, the notifications feed UI,
 *           and the icon/label mappings all derive from these definitions.
 *
 * RAILS:    when wiring up the backend, each entry here maps to one
 *           `Notification.create(...)` call in the relevant Rails service/callback.
 *           The `railsTrigger` comment on each type tells you exactly where.
 *           The payload interface tells you exactly what columns/associations
 *           the serializer needs to include.
 *
 * ADDING A NEW NOTIFICATION:
 *   1. Add a key to NotificationEventType below
 *   2. Add a payload interface (or use `Record<string, never>` if no data needed)
 *   3. Add an entry to NOTIFICATION_REGISTRY with label, body template, and railsTrigger
 *   4. The UI (icon mapping, feed rendering) will pick it up automatically
 */

// ─── Event type keys ───────────────────────────────────────────────────────────

export type NotificationEventType =
  // Team
  | 'team.invitation_sent'
  | 'team.member_joined'
  | 'team.signatory_added'
  // Booking link (Create Link flow)
  | 'booking_link.received'
  | 'booking_link.completed'
  | 'booking_link.declined'
  // Enquiry
  | 'enquiry.received'
  | 'enquiry.updated'
  | 'enquiry.expired'
  // Booking
  | 'booking.confirmed'
  | 'booking.ending_soon'
  | 'booking.ended'
  | 'booking.cancelled'
  // Payment
  | 'payment.received'
  | 'payment.overdue'
  | 'payment.refunded'
  // Message
  | 'message.received'
  // Document
  | 'document.awaiting_signature'
  | 'document.signed'
  | 'document.declined'

// ─── Per-event payload shapes ──────────────────────────────────────────────────
// Rails serializer must return these fields alongside the base notification fields.

export interface TeamInvitationSentPayload {
  recipientEmail: string
  teamName: string
}

export interface TeamMemberJoinedPayload {
  memberName: string
  teamName: string
}

export interface TeamSignatoryAddedPayload {
  signatoryName: string
  centreName: string
}

export interface BookingLinkReceivedPayload {
  /** The shopping centre name shown in the notification body */
  centreName: string
  spaceName: string
  bookingLinkId: string
}

export interface BookingLinkCompletedPayload {
  tenantName: string
  centreName: string
  spaceName: string
  bookingLinkId: string
}

export interface BookingLinkDeclinedPayload {
  tenantName: string
  centreName: string
  spaceName: string
  bookingLinkId: string
}

export interface EnquiryReceivedPayload {
  tenantName: string
  spaceName: string
  centreName: string
  enquiryId: string
}

export interface EnquiryUpdatedPayload {
  tenantName: string
  spaceName: string
  enquiryId: string
  status: string
}

export interface EnquiryExpiredPayload {
  tenantName: string
  spaceName: string
  enquiryId: string
}

export interface BookingConfirmedPayload {
  tenantName: string
  spaceName: string
  startDate: string
  endDate: string
  bookingId: string
}

export interface BookingEndingSoonPayload {
  tenantName: string
  spaceName: string
  endDate: string
  daysRemaining: number
  bookingId: string
}

export interface BookingEndedPayload {
  tenantName: string
  spaceName: string
  bookingId: string
}

export interface BookingCancelledPayload {
  tenantName: string
  spaceName: string
  bookingId: string
}

export interface PaymentReceivedPayload {
  tenantName: string
  spaceName: string
  amount: number
  currency: string
  paymentId: string
}

export interface PaymentOverduePayload {
  tenantName: string
  spaceName: string
  amount: number
  currency: string
  dueSince: string
  paymentId: string
}

export interface PaymentRefundedPayload {
  tenantName: string
  amount: number
  currency: string
  paymentId: string
}

export interface MessageReceivedPayload {
  senderName: string
  centreName: string
  conversationId: string
  preview: string
}

export interface DocumentAwaitingSignaturePayload {
  documentName: string
  centreName: string
  documentId: string
}

export interface DocumentSignedPayload {
  signatoryName: string
  documentName: string
  centreName: string
  documentId: string
}

export interface DocumentDeclinedPayload {
  signatoryName: string
  documentName: string
  centreName: string
  documentId: string
}

// ─── Registry ──────────────────────────────────────────────────────────────────

export interface NotificationDefinition {
  /** Display label for the notification title */
  label: string
  /** Body copy template — use {placeholders} matching payload keys */
  bodyTemplate: string
  /** Icon category used by the UI feed */
  iconType: 'team' | 'enquiry' | 'booking' | 'payment' | 'message' | 'document'
  /** Optional CTA label shown in the feed */
  actionLabel?: string
  /**
   * RAILS INTEGRATION
   * Where in the Rails codebase this notification should be triggered.
   * Format: "ClassName#method_name — description"
   */
  railsTrigger: string
  /**
   * Whether a corresponding email should also be sent.
   * When true, the Rails trigger should also call the mailer.
   */
  sendsEmail: boolean
}

export const NOTIFICATION_REGISTRY: Record<NotificationEventType, NotificationDefinition> = {

  // ── Team ────────────────────────────────────────────────────────────────────

  'team.invitation_sent': {
    label: 'Invitation sent',
    bodyTemplate: 'An invitation has been sent to {recipientEmail} to join {teamName}.',
    iconType: 'team',
    railsTrigger: 'TeamInvitationsController#create — after_create callback on TeamInvitation model',
    sendsEmail: true,
  },

  'team.member_joined': {
    label: 'New team member',
    bodyTemplate: '{memberName} has joined {teamName}.',
    iconType: 'team',
    railsTrigger: 'TeamInvitationsController#accept — after invitation is accepted',
    sendsEmail: false,
  },

  'team.signatory_added': {
    label: 'Signatory added',
    bodyTemplate: '{signatoryName} has been added as a DocuSign signatory for {centreName}.',
    iconType: 'team',
    railsTrigger: 'SignatoriesController#create — after_create on Signatory model',
    sendsEmail: true,
  },

  // ── Booking link (Create Link flow) ─────────────────────────────────────────

  'booking_link.received': {
    label: 'New enquiry request',
    bodyTemplate: 'You have a new enquiry request from {centreName} for {spaceName}. Complete your enquiry to confirm the booking.',
    iconType: 'enquiry',
    actionLabel: 'Complete enquiry',
    railsTrigger: 'BookingLinksController#create — after_create on BookingLink model; sent to tenant',
    sendsEmail: true,
  },

  'booking_link.completed': {
    label: 'Booking link completed',
    bodyTemplate: '{tenantName} has completed the booking link for {spaceName}, {centreName}.',
    iconType: 'booking',
    actionLabel: 'View booking',
    railsTrigger: 'BookingLinksController#complete — after status transitions to :completed; sent to landlord team',
    sendsEmail: false,
  },

  'booking_link.declined': {
    label: 'Booking link declined',
    bodyTemplate: '{tenantName} has declined the booking link for {spaceName}, {centreName}.',
    iconType: 'enquiry',
    actionLabel: 'View booking link',
    railsTrigger: 'BookingLinksController#decline — after status transitions to :declined; sent to landlord team',
    sendsEmail: false,
  },

  // ── Enquiry ─────────────────────────────────────────────────────────────────

  'enquiry.received': {
    label: 'New enquiry received',
    bodyTemplate: '{tenantName} has submitted a new enquiry for {spaceName}, {centreName}.',
    iconType: 'enquiry',
    actionLabel: 'View enquiry',
    railsTrigger: 'EnquiriesController#create — after_create on Enquiry model',
    sendsEmail: false,
  },

  'enquiry.updated': {
    label: 'Enquiry updated',
    bodyTemplate: '{tenantName} updated their enquiry for {spaceName}.',
    iconType: 'enquiry',
    actionLabel: 'View enquiry',
    railsTrigger: 'EnquiriesController#update — after status change on Enquiry model',
    sendsEmail: false,
  },

  'enquiry.expired': {
    label: 'Enquiry expired',
    bodyTemplate: 'The enquiry from {tenantName} for {spaceName} has expired.',
    iconType: 'enquiry',
    railsTrigger: 'EnquiryExpiryJob — scheduled job, runs daily',
    sendsEmail: false,
  },

  // ── Booking ─────────────────────────────────────────────────────────────────

  'booking.confirmed': {
    label: 'Booking confirmed',
    bodyTemplate: 'The booking for {spaceName} by {tenantName} has been confirmed for {startDate}–{endDate}.',
    iconType: 'booking',
    railsTrigger: 'BookingsController#confirm — after booking status transitions to :confirmed',
    sendsEmail: true,
  },

  'booking.ending_soon': {
    label: 'Booking ending soon',
    bodyTemplate: 'The booking for {spaceName} by {tenantName} ends in {daysRemaining} days.',
    iconType: 'booking',
    railsTrigger: 'BookingExpiryReminderJob — scheduled job, runs daily, fires at 7 and 2 days remaining',
    sendsEmail: false,
  },

  'booking.ended': {
    label: 'Booking ended',
    bodyTemplate: 'The booking for {spaceName} by {tenantName} has ended.',
    iconType: 'booking',
    railsTrigger: 'BookingExpiryJob — scheduled job, runs daily on booking end date',
    sendsEmail: false,
  },

  'booking.cancelled': {
    label: 'Booking cancelled',
    bodyTemplate: 'The booking for {spaceName} by {tenantName} has been cancelled.',
    iconType: 'booking',
    railsTrigger: 'BookingsController#cancel — after booking status transitions to :cancelled',
    sendsEmail: true,
  },

  // ── Payment ─────────────────────────────────────────────────────────────────

  'payment.received': {
    label: 'Payment received',
    bodyTemplate: '{currency}{amount} received from {tenantName} for {spaceName}.',
    iconType: 'payment',
    railsTrigger: 'PaymentsController#webhook — on Mandrill/Stripe payment.succeeded webhook',
    sendsEmail: false,
  },

  'payment.overdue': {
    label: 'Payment overdue',
    bodyTemplate: 'A payment of {currency}{amount} from {tenantName} for {spaceName} is overdue.',
    iconType: 'payment',
    actionLabel: 'View payment',
    railsTrigger: 'PaymentOverdueJob — scheduled job, runs daily',
    sendsEmail: true,
  },

  'payment.refunded': {
    label: 'Payment refunded',
    bodyTemplate: '{currency}{amount} has been refunded to {tenantName}.',
    iconType: 'payment',
    railsTrigger: 'PaymentsController#refund — after refund is issued',
    sendsEmail: true,
  },

  // ── Message ─────────────────────────────────────────────────────────────────

  'message.received': {
    label: 'New message',
    bodyTemplate: '{senderName} sent a message about their booking at {centreName}.',
    iconType: 'message',
    actionLabel: 'View message',
    railsTrigger: 'MessagesController#create — after_create on Message model',
    sendsEmail: false,
  },

  // ── Document ─────────────────────────────────────────────────────────────────

  'document.awaiting_signature': {
    label: 'Signature required',
    bodyTemplate: '{documentName} for {centreName} is awaiting your signature.',
    iconType: 'document',
    actionLabel: 'View document',
    railsTrigger: 'DocuSignWebhooksController#envelope_sent — on DocuSign envelope.sent webhook',
    sendsEmail: true,
  },

  'document.signed': {
    label: 'Document signed',
    bodyTemplate: '{signatoryName} has signed {documentName} for {centreName}.',
    iconType: 'document',
    railsTrigger: 'DocuSignWebhooksController#envelope_completed — on DocuSign envelope.completed webhook',
    sendsEmail: false,
  },

  'document.declined': {
    label: 'Document declined',
    bodyTemplate: '{signatoryName} declined to sign {documentName} for {centreName}.',
    iconType: 'document',
    actionLabel: 'View document',
    railsTrigger: 'DocuSignWebhooksController#envelope_declined — on DocuSign envelope.declined webhook',
    sendsEmail: true,
  },
}
