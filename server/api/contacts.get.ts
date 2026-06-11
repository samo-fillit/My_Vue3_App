import { readFile } from 'fs/promises'
import { resolve } from 'path'

// Extra CRM contacts per company (keyed by lowercased company name) — lets a
// company carry multiple people (marketing, finance, etc.) beyond the single
// contact embedded on each booking. The Tenants page merges these in.
export default defineEventHandler(async () => {
  const filePath = resolve('server/data/contacts.json')
  const content = await readFile(filePath, 'utf-8')
  const { contacts } = JSON.parse(content)
  return contacts as Record<string, unknown[]>
})
