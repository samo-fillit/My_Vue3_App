import { writeFile } from 'fs/promises'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const filePath = resolve('server/data/centres.json')
  await writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8')
  return { ok: true }
})
