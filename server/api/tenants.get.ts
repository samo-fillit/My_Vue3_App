import { readFile } from 'fs/promises'
import { resolve } from 'path'

// CRM tenant records (incl. prospects with no bookings yet). The Tenants page
// merges these with companies derived from bookings.json for live numbers.
export default defineEventHandler(async () => {
  const filePath = resolve('server/data/tenants.json')
  const content = await readFile(filePath, 'utf-8')
  const { tenants } = JSON.parse(content)
  return tenants
})
