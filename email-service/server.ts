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

// ── Template registry ─────────────────────────────────────────────────────────
// Import every template here; the registry keys are used in POST /render bodies.

import TeamInvite,      { type TeamInviteProps }      from './src/templates/team-invite'
import SignatoryAdded,  { type SignatoryAddedProps }   from './src/templates/signatory-added'

type AnyProps = Record<string, unknown>

const templates: Record<string, (props: AnyProps) => React.ReactElement> = {
  'team-invite':      (p) => React.createElement(TeamInvite,     p as unknown as TeamInviteProps),
  'signatory-added':  (p) => React.createElement(SignatoryAdded, p as unknown as SignatoryAddedProps),
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
