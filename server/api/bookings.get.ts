import { readFile } from 'fs/promises'
import { resolve } from 'path'

// Bookings are seeded in server/data/bookings.json as clean JSON (no comments),
// so we can JSON.parse directly — unlike the legacy files that carry // comments.
export default defineEventHandler(async () => {
  const filePath = resolve('server/data/bookings.json')
  const content = await readFile(filePath, 'utf-8')
  const { bookings } = JSON.parse(content)
  return bookings
})
