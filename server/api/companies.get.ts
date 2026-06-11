import { readFile } from 'fs/promises'
import { resolve } from 'path'

// Company master records keyed by lowercased company name: the company's own
// `category` (sector) and its `contacts[]` roster. The Tenants page enriches
// bookings-derived companies with this; bookings only carry booking-type data.
export default defineEventHandler(async () => {
  const filePath = resolve('server/data/companies.json')
  const content = await readFile(filePath, 'utf-8')
  const { companies } = JSON.parse(content)
  return companies as Record<string, { category?: string; contacts?: unknown[] }>
})
