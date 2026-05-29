import { ref } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayoutCentre {
  name: string
  spaces: string[]
}

export interface PayoutAccount {
  id: string
  country: string
  type: 'stripe' | 'bank'
  title: string
  companyName: string
  companyType: string
  currency: string
  status: 'active' | 'pending'
  signatoryFirstName: string
  signatoryLastName: string
  signatoryRole: string
  vatNumber: string
  nif?: string
  shareCapital?: string
  commercialRegisterCity?: string
  commercialChamberCity?: string
  cnae?: string
  siren?: string
  mandateType?: string
  mandateDate?: string
  address: string
  city: string
  postcode: string
  bankName?: string
  bankAddress?: string
  stripeAccountId?: string
  dni?: string
  lrAddress: string
  lrZipCode: string
  centres: PayoutCentre[]
  last4?: string
  iban?: string
  bic?: string
}

// ─── Module-level singleton ───────────────────────────────────────────────────

const allAccounts = ref<PayoutAccount[]>([
  {
    id: 'acct_es_1',
    country: 'es',
    type: 'bank',
    title: 'Nhood ES — Main account',
    companyName: 'Nhood Spain S.A.',
    companyType: 'SA',
    currency: 'EUR',
    status: 'active',
    signatoryFirstName: 'Carlos',
    signatoryLastName: 'García',
    signatoryRole: 'Director',
    vatNumber: 'ESA28000000',
    nif: 'A28000000',
    cnae: '6820',
    dni: '12345678Z',
    address: 'Calle de Alcalá 41',
    city: 'Madrid',
    postcode: '28014',
    lrAddress: 'Calle de Alcalá 41',
    lrZipCode: '28014',
    iban: 'ES9121000418450200051332',
    bic: 'CAIXESBBXXX',
    bankName: 'CaixaBank',
    bankAddress: 'Calle de Pinar 7, Madrid',
    centres: [
      { name: 'Centro Comercial Xanadú', spaces: ['Pop-up Unit P4', 'Kiosk K2', 'Test'] },
      { name: 'La Maquinista',           spaces: ['Event Space E1', 'Kiosk K5'] },
    ],
  },
  {
    id: 'acct_es_2',
    country: 'es',
    type: 'bank',
    title: 'Nhood ES — Secondary account',
    companyName: 'Nhood Spain Operaciones S.L.',
    companyType: 'SL',
    currency: 'EUR',
    status: 'active',
    signatoryFirstName: 'Isabel',
    signatoryLastName: 'Martínez',
    signatoryRole: 'Apoderada',
    vatNumber: 'ESB91234567',
    nif: 'B91234567',
    cnae: '6820',
    dni: '87654321X',
    address: 'Calle de Alcalá 41',
    city: 'Madrid',
    postcode: '28014',
    lrAddress: 'Calle de Alcalá 41',
    lrZipCode: '28014',
    iban: 'ES7620770024003102575766',
    bic: 'BBVAESMMXXX',
    bankName: 'BBVA',
    bankAddress: 'Calle de Alcalá 16, Madrid',
    centres: [
      { name: 'Centro Comercial Xanadú', spaces: ['Billboard BD1'] },
      { name: 'La Maquinista',           spaces: ['Sampling Stand S3'] },
    ],
  },
  {
    id: 'acct_es_3',
    country: 'es',
    type: 'bank',
    title: 'Nhood ES — Tertiary account',
    companyName: 'Nhood Spain Retail S.L.',
    companyType: 'SL',
    currency: 'EUR',
    status: 'active',
    signatoryFirstName: 'Miguel',
    signatoryLastName: 'López',
    signatoryRole: 'Apoderado',
    vatNumber: 'ESB99876543',
    nif: 'B99876543',
    cnae: '6820',
    dni: '55566677P',
    address: 'Calle de Serrano 45',
    city: 'Madrid',
    postcode: '28001',
    lrAddress: 'Calle de Serrano 45',
    lrZipCode: '28001',
    iban: 'ES8900817212301234567890',
    bic: 'BSCHESMMXXX',
    bankName: 'Banco Santander',
    bankAddress: 'Calle de Alcalá 49, Madrid',
    centres: [],
  },
  {
    id: 'acct_fr_1',
    country: 'fr',
    type: 'bank',
    title: 'Nhood FR North — Main account',
    companyName: 'Nhood France SAS',
    companyType: 'SAS',
    currency: 'EUR',
    status: 'active',
    signatoryFirstName: 'Élodie',
    signatoryLastName: 'Bernard',
    signatoryRole: 'Directrice Générale',
    vatNumber: 'FR82542065479',
    siren: '542065479',
    mandateType: 'SEPA B2B',
    mandateDate: '2024-03-15',
    address: '40 Avenue des Terroirs de France',
    city: 'Paris',
    postcode: '75012',
    lrAddress: '40 Avenue des Terroirs de France',
    lrZipCode: '75012',
    iban: 'FR7630004000031234567890143',
    bic: 'BNPAFRPPXXX',
    bankName: 'BNP Paribas',
    bankAddress: '16 Boulevard des Italiens, Paris',
    centres: [
      { name: 'Les Quatre Temps', spaces: ['Kiosk A1', 'Pop-up P1', 'Sampling Stand S1'] },
      { name: 'Forum des Halles',  spaces: ['Kiosk B2', 'Billboard B1'] },
    ],
  },
  {
    id: 'acct_fr_2',
    country: 'fr',
    type: 'bank',
    title: 'Nhood FR South — Main account',
    companyName: 'Nhood France SAS',
    companyType: 'SAS',
    currency: 'EUR',
    status: 'active',
    signatoryFirstName: 'Lucas',
    signatoryLastName: 'Moreau',
    signatoryRole: 'Directeur Régional',
    vatNumber: 'FR82542065479',
    siren: '542065479',
    mandateType: 'SEPA B2B',
    mandateDate: '2024-03-15',
    address: '40 Avenue des Terroirs de France',
    city: 'Paris',
    postcode: '75012',
    lrAddress: '40 Avenue des Terroirs de France',
    lrZipCode: '75012',
    iban: 'FR7630004000039876543210987',
    bic: 'BNPAFRPPXXX',
    bankName: 'BNP Paribas',
    bankAddress: '16 Boulevard des Italiens, Paris',
    centres: [
      { name: 'Grand Place Grenoble', spaces: ['Kiosk A1', 'Kiosk A2', 'Pop-up P1'] },
      { name: 'Polygone Riviera',      spaces: ['Sampling Stand S1', 'Event Space E1'] },
    ],
  },
  {
    id: 'acct_it_1',
    country: 'it',
    type: 'bank',
    title: 'Nhood IT — Main account',
    companyName: 'Nhood Italia S.p.A.',
    companyType: 'S.p.A.',
    currency: 'EUR',
    status: 'active',
    signatoryFirstName: 'Marco',
    signatoryLastName: 'Rossi',
    signatoryRole: 'Amministratore Delegato',
    vatNumber: 'IT07643520967',
    nif: 'RSSMRC80A01F205Y',
    shareCapital: '€8,000,000',
    commercialRegisterCity: 'Milano',
    commercialChamberCity: 'Milano',
    address: 'Via Monte di Pietà 8',
    city: 'Milano',
    postcode: '20121',
    lrAddress: 'Via Monte di Pietà 8',
    lrZipCode: '20121',
    iban: 'IT60X0542811101000000123456',
    bic: 'SELBIT2BXXX',
    bankName: 'Intesa Sanpaolo',
    bankAddress: 'Piazza della Scala 6, Milano',
    centres: [
      { name: 'Il Centro Arese',  spaces: ['Kiosk K1', 'Pop-up P1', 'Sampling S1'] },
      { name: 'Porta di Roma',     spaces: ['Kiosk K2', 'Kiosk K3', 'Billboard B1'] },
    ],
  },
  {
    id: 'acct_pl_1',
    country: 'pl',
    type: 'bank',
    title: 'Nhood PL — Main account',
    companyName: 'Nhood Polska Sp. z o.o.',
    companyType: 'Sp. z o.o.',
    currency: 'EUR',
    status: 'active',
    signatoryFirstName: 'Anna',
    signatoryLastName: 'Kowalski',
    signatoryRole: 'Prezes Zarządu',
    vatNumber: 'PL5213000109',
    address: 'Al. Jana Pawła II 22',
    city: 'Warszawa',
    postcode: '00-133',
    lrAddress: 'Al. Jana Pawła II 22',
    lrZipCode: '00-133',
    iban: 'PL61109010140000071219812874',
    bic: 'WBKPPLPPXXX',
    bankName: 'Santander Bank Polska',
    bankAddress: 'Al. Jana Pawła II 17, Warszawa',
    centres: [
      { name: 'Arkadia Warsaw',  spaces: ['Kiosk K1', 'Pop-up P1', 'Sampling S1'] },
      { name: 'Galeria Mokotów', spaces: ['Kiosk K2', 'Billboard B1'] },
    ],
  },
])

// ─── Master spaces — source of truth for all available spaces per country ────
// Includes both assigned and unassigned spaces so the Manage Spaces dialog
// always shows the complete picture. New spaces created on the Spaces page
// are registered here via addToMasterSpaces().

// Supplementary in-session additions — spaces created while the app is running
// without a full page reload. Starts empty; payouts.vue derives its master list
// from the API and merges this ref on top.
const masterSpaces = ref<Record<string, { centreName: string; spaces: string[] }[]>>({})

function addToMasterSpaces(country: string, centreName: string, spaceName: string): void {
  if (!masterSpaces.value[country]) {
    masterSpaces.value[country] = []
  }
  const centre = masterSpaces.value[country].find(c => c.centreName === centreName)
  if (centre) {
    if (!centre.spaces.includes(spaceName)) centre.spaces.push(spaceName)
  } else {
    masterSpaces.value[country].push({ centreName, spaces: [spaceName] })
  }
}

export function usePayoutAccounts() {
  return { allAccounts, masterSpaces, addToMasterSpaces }
}

export type { PayoutAccount, PayoutCentre }
