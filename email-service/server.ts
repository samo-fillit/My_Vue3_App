/**
 * Fillit email render server
 *
 * POST /render
 *   Body: { template: string, props: Record<string, unknown> }
 *   Returns: { html: string, text: string }
 *
 * GET /health
 *   Returns: { ok: true }
 *
 * Run: npm run server  (port 3002, separate from the React Email preview on 3001)
 */

import { Hono }   from 'hono'
import { render } from '@react-email/render'
import React      from 'react'

// ── Email registry ────────────────────────────────────────────────────────────
// Import every email here; the keys are used in POST /render bodies. Brand and
// locale are passed as props: { template, props: { brand, locale, ...data } }.

import TeamInvite      from './src/emails/team-invite'
import SignatoryAdded  from './src/emails/signatory-added'

type AnyProps = Record<string, unknown>

const templates: Record<string, (props: AnyProps) => React.ReactElement> = {
  'team-invite':      (p) => React.createElement(TeamInvite,     p),
  'signatory-added':  (p) => React.createElement(SignatoryAdded, p),
}

// ── Server ────────────────────────────────────────────────────────────────────

const app = new Hono()

app.get('/health', (c) => c.json({ ok: true }))

app.post('/render', async (c) => {
  const body = await c.req.json<{ template: string; props: AnyProps }>()
  const { template, props = {} } = body

  const factory = templates[template]
  if (!factory) {
    return c.json({ error: `Unknown template: "${template}"` }, 400)
  }

  const element  = factory(props)
  const html     = await render(element)
  const text     = await render(element, { plainText: true })

  return c.json({ html, text })
})

// ── Boot ──────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3002)

export default {
  port,
  fetch: app.fetch,
}

console.log(`Email render server running on http://localhost:${port}`)
