/**
 * GET /api/transactions
 *
 * Adapter for the existing Rails GET /api/data_management/get_payments endpoint.
 *
 * Rails returns an array of arrays. Column positions (confirmed from source):
 *   [0]  booking_id
 *   [1]  tenant company name
 *   [2]  centre name (listing_group.title)
 *   [3]  space title (listing.title)
 *   [4]  landlord account name (may be null)
 *   [5]  booking reference (booking.invoice_id)
 *   [6]  amount string  e.g. "€3360,00"  (€ + no-delimiter + comma-decimal)
 *   [7]  tenant tax ID / NIF (may be null)
 *   [8]  payment-in status string  e.g. "Paid", "Pending", "Failed", "Refunded"
 *   [9]  payment-out (landlord) status string
 *   [10] payment method string  "Card" | "Credit Transfer" | "Direct Debit"
 *   [11] due date string  "dd/mm/yyyy" (payment_date) or null
 *   [12] paid-on date string  "dd/mm/yyyy" (paid_on) or null
 *   [13] transfer date string  "dd/mm/yyyy" (ll paid_on) or null
 *   [14] reference period string  "May 2026"  (derived from payment_date)
 *   [15] landlord charge ID (may be null)
 *   [16] ct_amount_available (float or null)
 *   [17] internal comment (may be null)
 *
 * Note: booking period dates (from_date / to_date) and document_url are not
 * exposed by this endpoint. The Vue page uses ref_period as a fallback label.
 *
 * Falls back to mock data when Rails is unavailable or the user isn't signed in.
 */

import type { H3Event } from 'h3'

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded'
type PaymentMethod = 'card' | 'bank_transfer' | 'direct_debit'

export interface Transaction {
  id: number
  paymentType: PaymentStatus
  paymentMethod: PaymentMethod
  teamId: string | null
  bookingId: number
  /** Human-readable booking reference from Rails invoice_id */
  bookingRef: string
  spaceTitle: string
  centreName: string
  tenantCompany: string
  /** ISO date string, null when coming from Rails (not exposed by get_payments) */
  periodFrom: string | null
  /** ISO date string, null when coming from Rails (not exposed by get_payments) */
  periodTo: string | null
  /** "May 2026" style label derived from payment_date — always present */
  refPeriod: string | null
  grossAmount: number
  fillitFee: number
  netAmount: number
  chargeId: string | null
  dueDate: string | null
  paidOn: string | null
  /** Platform → landlord payout status (Rails get_payments col 9) */
  paymentOutStatus: PaymentStatus | null
  /** ISO date when funds were transferred to landlord (Rails get_payments col 13) */
  transferDate: string | null
  invoiceUrl: string | null
  purchaseOrder: string | null
}

// ── Centre → team mapping ─────────────────────────────────────────────────────
// Keyed on listing_group.title from Rails. Extend as new centres are added.

const centreTeamMap: Record<string, string> = {
  // Fillit
  'Westfield London': 'team-one',
  'Bluewater':        'team-one',
  'Lakeside':         'team-two',
  'Meadowhall':       'team-two',
  'Trafford Centre':  'team-two',
  // eLeaseLoop — Spain
  'Centro Comercial Xanadú': 'team-spain',
  'La Maquinista':           'team-spain',
  // eLeaseLoop — France
  'Les Quatre Temps':            'team-france',
  'Centre Commercial Part-Dieu': 'team-france',
  // eLeaseLoop — Italy
  'Oriocenter': 'team-italy',
  'Adigeo':     'team-italy',
  // eLeaseLoop — Poland
  'Galeria Mokotów':     'team-poland',
  'Silesia City Center': 'team-poland',
}

// ── Parsers ───────────────────────────────────────────────────────────────────

/**
 * Parse the Rails amount string "€3360,00" → 3360.
 * Format: currency symbol + no thousands delimiter + comma decimal separator.
 */
function parseAmount(str: string | null | undefined): number {
  if (!str) return 0
  // Strip currency symbol and whitespace, replace comma decimal with period
  const cleaned = str.replace(/[€£$\s]/g, '').replace(',', '.')
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}

/**
 * Parse a "dd/mm/yyyy" date string to ISO "yyyy-mm-dd".
 * Returns null for blank/invalid input.
 */
function parseDDMMYYYY(str: string | null | undefined): string | null {
  if (!str) return null
  const [d, m, y] = str.split('/')
  if (!d || !m || !y) return null
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

/**
 * Map Rails payment method label to Vue key.
 * Rails (English locale): "Card" | "Credit Transfer" | "Direct Debit"
 */
function parseMethod(str: string | null | undefined): PaymentMethod {
  if (!str) return 'card'
  const s = str.toLowerCase()
  if (s.includes('credit') || s.includes('transfer')) return 'bank_transfer'
  if (s.includes('direct') || s.includes('debit') || s.includes('sofort')) return 'direct_debit'
  return 'card'
}

/**
 * Derive a five-state Vue status from the Rails status string and due date.
 * Rails (English): "Paid" | "Pending" | "Failed" | "Refunded" | "Paid to LL bank" | ""
 * "Pending" is split into pending/overdue using the due date.
 */
function deriveStatus(statusStr: string | null | undefined, dueDate: string | null): PaymentStatus {
  const s = (statusStr ?? '').toLowerCase()
  if (s === 'paid' || s === 'paid to ll bank') return 'paid'
  if (s === 'failed') return 'failed'
  if (s === 'refunded') return 'refunded'
  // Pending — check whether the due date has passed
  if (dueDate && dueDate < new Date().toISOString().slice(0, 10)) return 'overdue'
  return 'pending'
}

// ── Transform a single Rails row ──────────────────────────────────────────────

function transformRow(row: unknown[]): Transaction | null {
  if (!Array.isArray(row) || row.length < 12) return null

  const bookingId   = Number(row[0])
  const company     = String(row[1] ?? '')
  const centre      = String(row[2] ?? '')
  const space       = String(row[3] ?? '')
  const bookingRef  = String(row[5] ?? bookingId)
  const amountStr   = row[6] as string | null
  const statusStr   = row[8] as string | null
  const methodStr   = row[10] as string | null
  const dueDateStr      = row[11] as string | null
  const paidOnStr       = row[12] as string | null
  const transferDateStr = row[13] as string | null
  const refPeriod       = row[14] as string | null
  const outStatusStr    = row[9] as string | null

  const dueDate      = parseDDMMYYYY(dueDateStr)
  const paidOn       = parseDDMMYYYY(paidOnStr)
  const transferDate = parseDDMMYYYY(transferDateStr)
  const grossAmount  = parseAmount(amountStr)

  return {
    id:              bookingId,   // no payment.id from this endpoint; use bookingId
    paymentType:     deriveStatus(statusStr, dueDate),
    paymentMethod:   parseMethod(methodStr),
    teamId:          centreTeamMap[centre] ?? null,
    bookingId,
    bookingRef,
    spaceTitle:      space,
    centreName:      centre,
    tenantCompany:   company,
    periodFrom:      null,        // not exposed by get_payments
    periodTo:        null,        // not exposed by get_payments
    refPeriod,
    grossAmount,
    fillitFee:       parseFloat((grossAmount * 0.07).toFixed(2)),
    netAmount:       parseFloat((grossAmount * 0.93).toFixed(2)),
    chargeId:        null,        // not exposed by get_payments
    dueDate,
    paidOn,
    paymentOutStatus: deriveStatus(outStatusStr, transferDate),
    transferDate,
    invoiceUrl:      null,        // not exposed by get_payments
    purchaseOrder:   null,        // not exposed by get_payments
  }
}

// ── Mock data (offline fallback) ──────────────────────────────────────────────
// Matches the real Transaction shape. periodFrom/periodTo are present here
// since mock data is generated by us, not constrained by the Rails endpoint.

function mockTransactions(): Transaction[] {
  return [
    {
      id: 10042, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-one',
      bookingId: 10042, bookingRef: '10042', spaceTitle: 'Kiosk A3', centreName: 'Westfield London', tenantCompany: 'Nike',
      periodFrom: '2026-05-12', periodTo: '2026-05-26', refPeriod: 'May 2026',
      grossAmount: 3360, fillitFee: 235.20, netAmount: 3124.80,
      chargeId: 'tr_3PkZ9vF2eZvKYlo21NB', dueDate: '2026-05-12', paidOn: '2026-05-12',
      paymentOutStatus: 'paid', transferDate: '2026-05-14', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 10038, paymentType: 'paid', paymentMethod: 'bank_transfer', teamId: 'team-one',
      bookingId: 10038, bookingRef: '10038', spaceTitle: 'Sampling Stand S1', centreName: 'Bluewater', tenantCompany: 'Adidas',
      periodFrom: '2026-05-05', periodTo: '2026-05-11', refPeriod: 'May 2026',
      grossAmount: 2800, fillitFee: 196, netAmount: 2604,
      chargeId: 'tr_3PkZ9vF2eZvKYlo20NA', dueDate: '2026-05-05', paidOn: '2026-05-05',
      paymentOutStatus: 'paid', transferDate: '2026-05-07', invoiceUrl: '#', purchaseOrder: 'PO-2026-884',
    },
    {
      id: 10031, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-one',
      bookingId: 10031, bookingRef: '10031', spaceTitle: 'Pop-up Space P2', centreName: 'Westfield London', tenantCompany: 'Zara',
      periodFrom: '2026-04-28', periodTo: '2026-05-04', refPeriod: 'April 2026',
      grossAmount: 4200, fillitFee: 294, netAmount: 3906,
      chargeId: 'tr_3PkZ9vF2eZvKYlo19NZ', dueDate: '2026-04-28', paidOn: '2026-04-28',
      paymentOutStatus: 'paid', transferDate: '2026-04-30', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 10024, paymentType: 'paid', paymentMethod: 'direct_debit', teamId: 'team-two',
      bookingId: 10024, bookingRef: '10024', spaceTitle: 'Billboard B2', centreName: 'Lakeside', tenantCompany: 'H&M',
      periodFrom: '2026-04-14', periodTo: '2026-04-28', refPeriod: 'April 2026',
      grossAmount: 1960, fillitFee: 137.20, netAmount: 1822.80,
      chargeId: 'tr_3PkZ9vF2eZvKYlo18NY', dueDate: '2026-04-14', paidOn: '2026-04-14',
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: '#', purchaseOrder: 'PO-2026-731',
    },
    {
      id: 10055, paymentType: 'pending', paymentMethod: 'card', teamId: 'team-one',
      bookingId: 10055, bookingRef: '10055', spaceTitle: 'Billboard B2', centreName: 'Bluewater', tenantCompany: 'Samsung',
      periodFrom: '2026-06-02', periodTo: '2026-06-16', refPeriod: 'June 2026',
      grossAmount: 3360, fillitFee: 235.20, netAmount: 3124.80,
      chargeId: null, dueDate: '2026-06-02', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },
    {
      id: 10058, paymentType: 'pending', paymentMethod: 'bank_transfer', teamId: 'team-two',
      bookingId: 10058, bookingRef: '10058', spaceTitle: 'Event Space E1', centreName: 'Westfield London', tenantCompany: "L'Oréal",
      periodFrom: '2026-06-09', periodTo: '2026-06-20', refPeriod: 'June 2026',
      grossAmount: 3360, fillitFee: 235.20, netAmount: 3124.80,
      chargeId: null, dueDate: '2026-06-09', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: 'PO-2026-912',
    },
    {
      id: 10015, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-two',
      bookingId: 10015, bookingRef: '10015', spaceTitle: 'Kiosk A1', centreName: 'Lakeside', tenantCompany: 'Puma',
      periodFrom: '2026-03-03', periodTo: '2026-03-17', refPeriod: 'March 2026',
      grossAmount: 2800, fillitFee: 196, netAmount: 2604,
      chargeId: 'tr_3PkZ9vF2eZvKYlo17NX', dueDate: '2026-03-03', paidOn: '2026-03-03',
      paymentOutStatus: 'paid', transferDate: '2026-03-05', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 10009, paymentType: 'refunded', paymentMethod: 'card', teamId: 'team-one',
      bookingId: 10009, bookingRef: '10009', spaceTitle: 'Demo Stand D3', centreName: 'Westfield London', tenantCompany: 'Apple',
      periodFrom: '2026-03-10', periodTo: '2026-03-17', refPeriod: 'March 2026',
      grossAmount: 1680, fillitFee: 117.60, netAmount: 1562.40,
      chargeId: 're_3PkZ9vF2eZvKYlo12NW', dueDate: '2026-03-17', paidOn: null,
      paymentOutStatus: 'refunded', transferDate: null, invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 10001, paymentType: 'paid', paymentMethod: 'bank_transfer', teamId: 'team-two',
      bookingId: 10001, bookingRef: '10001', spaceTitle: 'Pop-up Space P1', centreName: 'Bluewater', tenantCompany: 'Dyson',
      periodFrom: '2026-02-17', periodTo: '2026-03-03', refPeriod: 'February 2026',
      grossAmount: 5600, fillitFee: 392, netAmount: 5208,
      chargeId: 'tr_3PkZ9vF2eZvKYlo11NV', dueDate: '2026-02-17', paidOn: '2026-02-17',
      paymentOutStatus: 'paid', transferDate: '2026-02-19', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 10097, paymentType: 'paid', paymentMethod: 'bank_transfer', teamId: 'team-two',
      bookingId: 10097, bookingRef: '10097', spaceTitle: 'Event Space E2', centreName: 'Meadowhall', tenantCompany: 'Sony',
      periodFrom: '2026-02-03', periodTo: '2026-02-17', refPeriod: 'February 2026',
      grossAmount: 4200, fillitFee: 294, netAmount: 3906,
      chargeId: 'tr_3PkZ9vF2eZvKYlo10NU', dueDate: '2026-02-03', paidOn: '2026-02-03',
      paymentOutStatus: 'paid', transferDate: '2026-02-05', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 10089, paymentType: 'failed', paymentMethod: 'direct_debit', teamId: 'team-one',
      bookingId: 10089, bookingRef: '10089', spaceTitle: 'Kiosk A2', centreName: 'Lakeside', tenantCompany: 'Uniqlo',
      periodFrom: '2026-01-20', periodTo: '2026-02-03', refPeriod: 'January 2026',
      grossAmount: 2800, fillitFee: 196, netAmount: 2604,
      chargeId: null, dueDate: '2026-01-20', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },
    {
      id: 10062, paymentType: 'overdue', paymentMethod: 'bank_transfer', teamId: 'team-one',
      bookingId: 10062, bookingRef: '10062', spaceTitle: 'Pop-up Space P3', centreName: 'Westfield London', tenantCompany: 'Zara Home',
      periodFrom: '2026-04-07', periodTo: '2026-04-21', refPeriod: 'April 2026',
      grossAmount: 2800, fillitFee: 196, netAmount: 2604,
      chargeId: null, dueDate: '2026-04-07', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },
    {
      id: 10071, paymentType: 'overdue', paymentMethod: 'bank_transfer', teamId: 'team-two',
      bookingId: 10071, bookingRef: '10071', spaceTitle: 'Event Space E3', centreName: 'Bluewater', tenantCompany: 'Mango',
      periodFrom: '2026-03-24', periodTo: '2026-04-07', refPeriod: 'March 2026',
      grossAmount: 1960, fillitFee: 137.20, netAmount: 1822.80,
      chargeId: null, dueDate: '2026-03-24', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },

    // ── eLeaseLoop — Spain ────────────────────────────────────────────────────
    {
      id: 20001, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-spain',
      bookingId: 20001, bookingRef: '20001', spaceTitle: 'Pop-up Unit P4', centreName: 'Centro Comercial Xanadú', tenantCompany: 'Zara',
      periodFrom: '2026-05-05', periodTo: '2026-05-19', refPeriod: 'May 2026',
      grossAmount: 4200, fillitFee: 294, netAmount: 3906,
      chargeId: 'tr_ELL20001A', dueDate: '2026-05-05', paidOn: '2026-05-05',
      paymentOutStatus: 'paid', transferDate: '2026-05-07', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 20002, paymentType: 'paid', paymentMethod: 'bank_transfer', teamId: 'team-spain',
      bookingId: 20002, bookingRef: '20002', spaceTitle: 'Event Space E1', centreName: 'La Maquinista', tenantCompany: 'Mango',
      periodFrom: '2026-04-21', periodTo: '2026-04-28', refPeriod: 'April 2026',
      grossAmount: 3200, fillitFee: 224, netAmount: 2976,
      chargeId: 'tr_ELL20002A', dueDate: '2026-04-21', paidOn: '2026-04-21',
      paymentOutStatus: 'paid', transferDate: '2026-04-23', invoiceUrl: '#', purchaseOrder: 'PO-ES-441',
    },
    {
      id: 20003, paymentType: 'pending', paymentMethod: 'card', teamId: 'team-spain',
      bookingId: 20003, bookingRef: '20003', spaceTitle: 'Kiosk K2', centreName: 'Centro Comercial Xanadú', tenantCompany: 'Pull&Bear',
      periodFrom: '2026-06-02', periodTo: '2026-06-09', refPeriod: 'June 2026',
      grossAmount: 1680, fillitFee: 117.60, netAmount: 1562.40,
      chargeId: null, dueDate: '2026-06-02', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },
    {
      id: 20004, paymentType: 'overdue', paymentMethod: 'bank_transfer', teamId: 'team-spain',
      bookingId: 20004, bookingRef: '20004', spaceTitle: 'Kiosk K5', centreName: 'La Maquinista', tenantCompany: 'Desigual',
      periodFrom: '2026-04-07', periodTo: '2026-04-14', refPeriod: 'April 2026',
      grossAmount: 1190, fillitFee: 83.30, netAmount: 1106.70,
      chargeId: null, dueDate: '2026-04-07', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },

    // ── eLeaseLoop — France ───────────────────────────────────────────────────
    {
      id: 20005, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-france',
      bookingId: 20005, bookingRef: '20005', spaceTitle: 'Pop-up Unit P2', centreName: 'Les Quatre Temps', tenantCompany: 'L\'Oréal',
      periodFrom: '2026-05-12', periodTo: '2026-05-26', refPeriod: 'May 2026',
      grossAmount: 5200, fillitFee: 364, netAmount: 4836,
      chargeId: 'tr_ELL20005A', dueDate: '2026-05-12', paidOn: '2026-05-12',
      paymentOutStatus: 'paid', transferDate: '2026-05-14', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 20006, paymentType: 'paid', paymentMethod: 'direct_debit', teamId: 'team-france',
      bookingId: 20006, bookingRef: '20006', spaceTitle: 'Event Space E2', centreName: 'Les Quatre Temps', tenantCompany: 'LVMH',
      periodFrom: '2026-04-28', periodTo: '2026-05-05', refPeriod: 'April 2026',
      grossAmount: 9500, fillitFee: 665, netAmount: 8835,
      chargeId: 'tr_ELL20006A', dueDate: '2026-04-28', paidOn: '2026-04-28',
      paymentOutStatus: 'paid', transferDate: '2026-04-30', invoiceUrl: '#', purchaseOrder: 'PO-FR-218',
    },
    {
      id: 20007, paymentType: 'paid', paymentMethod: 'bank_transfer', teamId: 'team-france',
      bookingId: 20007, bookingRef: '20007', spaceTitle: 'Pop-up Unit P7', centreName: 'Centre Commercial Part-Dieu', tenantCompany: 'Hermès',
      periodFrom: '2026-03-17', periodTo: '2026-03-31', refPeriod: 'March 2026',
      grossAmount: 6300, fillitFee: 441, netAmount: 5859,
      chargeId: 'tr_ELL20007A', dueDate: '2026-03-17', paidOn: '2026-03-17',
      paymentOutStatus: 'paid', transferDate: '2026-03-19', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 20008, paymentType: 'pending', paymentMethod: 'bank_transfer', teamId: 'team-france',
      bookingId: 20008, bookingRef: '20008', spaceTitle: 'Sampling Stand S2', centreName: 'Centre Commercial Part-Dieu', tenantCompany: 'Lancôme',
      periodFrom: '2026-06-09', periodTo: '2026-06-16', refPeriod: 'June 2026',
      grossAmount: 1120, fillitFee: 78.40, netAmount: 1041.60,
      chargeId: null, dueDate: '2026-06-09', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: 'PO-FR-301',
    },
    {
      id: 20009, paymentType: 'failed', paymentMethod: 'direct_debit', teamId: 'team-france',
      bookingId: 20009, bookingRef: '20009', spaceTitle: 'Kiosk K3', centreName: 'Les Quatre Temps', tenantCompany: 'Sephora',
      periodFrom: '2026-03-03', periodTo: '2026-03-10', refPeriod: 'March 2026',
      grossAmount: 2200, fillitFee: 154, netAmount: 2046,
      chargeId: null, dueDate: '2026-03-03', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },

    // ── eLeaseLoop — Italy ────────────────────────────────────────────────────
    {
      id: 20010, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-italy',
      bookingId: 20010, bookingRef: '20010', spaceTitle: 'Pop-up Unit P3', centreName: 'Oriocenter', tenantCompany: 'Gucci',
      periodFrom: '2026-05-19', periodTo: '2026-06-02', refPeriod: 'May 2026',
      grossAmount: 4800, fillitFee: 336, netAmount: 4464,
      chargeId: 'tr_ELL20010A', dueDate: '2026-05-19', paidOn: '2026-05-19',
      paymentOutStatus: 'paid', transferDate: '2026-05-21', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 20011, paymentType: 'paid', paymentMethod: 'bank_transfer', teamId: 'team-italy',
      bookingId: 20011, bookingRef: '20011', spaceTitle: 'Pop-up Unit P1', centreName: 'Adigeo', tenantCompany: 'Prada',
      periodFrom: '2026-04-14', periodTo: '2026-04-28', refPeriod: 'April 2026',
      grossAmount: 3500, fillitFee: 245, netAmount: 3255,
      chargeId: 'tr_ELL20011A', dueDate: '2026-04-14', paidOn: '2026-04-14',
      paymentOutStatus: 'paid', transferDate: '2026-04-16', invoiceUrl: '#', purchaseOrder: 'PO-IT-109',
    },
    {
      id: 20012, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-italy',
      bookingId: 20012, bookingRef: '20012', spaceTitle: 'Event Space E3', centreName: 'Oriocenter', tenantCompany: 'Ferrari',
      periodFrom: '2026-03-10', periodTo: '2026-03-17', refPeriod: 'March 2026',
      grossAmount: 7200, fillitFee: 504, netAmount: 6696,
      chargeId: 'tr_ELL20012A', dueDate: '2026-03-10', paidOn: '2026-03-10',
      paymentOutStatus: 'paid', transferDate: '2026-03-12', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 20013, paymentType: 'pending', paymentMethod: 'card', teamId: 'team-italy',
      bookingId: 20013, bookingRef: '20013', spaceTitle: 'Terrace Kiosk K4', centreName: 'Adigeo', tenantCompany: 'Versace',
      periodFrom: '2026-06-16', periodTo: '2026-06-23', refPeriod: 'June 2026',
      grossAmount: 1890, fillitFee: 132.30, netAmount: 1757.70,
      chargeId: null, dueDate: '2026-06-16', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },
    {
      id: 20014, paymentType: 'refunded', paymentMethod: 'card', teamId: 'team-italy',
      bookingId: 20014, bookingRef: '20014', spaceTitle: 'Kiosk K1', centreName: 'Oriocenter', tenantCompany: 'Armani',
      periodFrom: '2026-02-10', periodTo: '2026-02-17', refPeriod: 'February 2026',
      grossAmount: 1540, fillitFee: 107.80, netAmount: 1432.20,
      chargeId: 're_ELL20014A', dueDate: '2026-02-10', paidOn: null,
      paymentOutStatus: 'refunded', transferDate: null, invoiceUrl: '#', purchaseOrder: null,
    },

    // ── eLeaseLoop — Poland ───────────────────────────────────────────────────
    {
      id: 20015, paymentType: 'paid', paymentMethod: 'card', teamId: 'team-poland',
      bookingId: 20015, bookingRef: '20015', spaceTitle: 'Pop-up Unit P5', centreName: 'Galeria Mokotów', tenantCompany: 'Reserved',
      periodFrom: '2026-05-05', periodTo: '2026-05-19', refPeriod: 'May 2026',
      grossAmount: 3800, fillitFee: 266, netAmount: 3534,
      chargeId: 'tr_ELL20015A', dueDate: '2026-05-05', paidOn: '2026-05-05',
      paymentOutStatus: 'paid', transferDate: '2026-05-07', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 20016, paymentType: 'paid', paymentMethod: 'direct_debit', teamId: 'team-poland',
      bookingId: 20016, bookingRef: '20016', spaceTitle: 'Event Space E4', centreName: 'Silesia City Center', tenantCompany: 'CD Projekt',
      periodFrom: '2026-04-07', periodTo: '2026-04-14', refPeriod: 'April 2026',
      grossAmount: 6200, fillitFee: 434, netAmount: 5766,
      chargeId: 'tr_ELL20016A', dueDate: '2026-04-07', paidOn: '2026-04-07',
      paymentOutStatus: 'paid', transferDate: '2026-04-09', invoiceUrl: '#', purchaseOrder: 'PO-PL-076',
    },
    {
      id: 20017, paymentType: 'paid', paymentMethod: 'bank_transfer', teamId: 'team-poland',
      bookingId: 20017, bookingRef: '20017', spaceTitle: 'Pop-up Unit P6', centreName: 'Silesia City Center', tenantCompany: 'Allegro',
      periodFrom: '2026-03-17', periodTo: '2026-03-31', refPeriod: 'March 2026',
      grossAmount: 4100, fillitFee: 287, netAmount: 3813,
      chargeId: 'tr_ELL20017A', dueDate: '2026-03-17', paidOn: '2026-03-17',
      paymentOutStatus: 'paid', transferDate: '2026-03-19', invoiceUrl: '#', purchaseOrder: null,
    },
    {
      id: 20018, paymentType: 'pending', paymentMethod: 'bank_transfer', teamId: 'team-poland',
      bookingId: 20018, bookingRef: '20018', spaceTitle: 'Billboard BD2', centreName: 'Galeria Mokotów', tenantCompany: 'LPP Group',
      periodFrom: '2026-06-02', periodTo: '2026-06-16', refPeriod: 'June 2026',
      grossAmount: 2500, fillitFee: 175, netAmount: 2325,
      chargeId: null, dueDate: '2026-06-02', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: 'PO-PL-119',
    },
    {
      id: 20019, paymentType: 'overdue', paymentMethod: 'card', teamId: 'team-poland',
      bookingId: 20019, bookingRef: '20019', spaceTitle: 'Kiosk K6', centreName: 'Galeria Mokotów', tenantCompany: 'CCC Shoes',
      periodFrom: '2026-04-21', periodTo: '2026-04-28', refPeriod: 'April 2026',
      grossAmount: 1960, fillitFee: 137.20, netAmount: 1822.80,
      chargeId: null, dueDate: '2026-04-21', paidOn: null,
      paymentOutStatus: 'pending', transferDate: null, invoiceUrl: null, purchaseOrder: null,
    },
  ]
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const railsUrl = config.railsBaseUrl as string
  const cookie = getHeader(event, 'cookie') ?? ''

  try {
    // Existing Rails endpoint — returns array of arrays
    const rows = await $fetch<unknown[][]>(`${railsUrl}/api/data_management/get_payments`, {
      headers: { cookie },
      timeout: 3000,
    })

    const results = rows
      .map(row => transformRow(row))
      .filter((t): t is Transaction => t !== null)

    // If Rails returned nothing useful, fall through to mock
    if (results.length === 0) return mockTransactions()

    return results
  } catch {
    // Rails unavailable or user not authenticated — serve mock data so the
    // design lab works offline without any code changes.
    return mockTransactions()
  }
})
