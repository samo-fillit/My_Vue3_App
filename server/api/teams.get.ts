import { readFile } from 'fs/promises'
import { resolve } from 'path'

export default defineEventHandler(async () => {
  const filePath = resolve('server/data/teams.json')
  const content = await readFile(filePath, 'utf-8')
  return JSON.parse(content)
})
