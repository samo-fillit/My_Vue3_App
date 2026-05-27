/**
 * GET /api/booking-links
 *
 * Serves booking link history from the local JSON fixture.
 * When Rails exposes an endpoint for this data, add a fetch + fallback
 * here following the same pattern as transactions.get.ts.
 */

import { readFile } from 'fs/promises'
import { resolve } from 'path'

export default defineEventHandler(async () => {
  const filePath = resolve('server/data/booking-links.json')
  const content = await readFile(filePath, 'utf-8')
  const { bookingLinks } = JSON.parse(content)
  return bookingLinks
})
