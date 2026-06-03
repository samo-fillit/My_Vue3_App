# Fillit — Email Service

React Email component system for all Fillit transactional emails.
Built alongside the design lab so templates evolve in sync with the app.

## Stack

- [React Email](https://react.email) — component primitives and dev preview
- [Hono](https://hono.dev) — lightweight render server (POST /render → HTML + plain text)
- TypeScript with typed props per template

## Design system

Tokens in `src/tokens.ts` mirror the Nuxt app's CSS variables:

| Token | Value | Notes |
|-------|-------|-------|
| `colorPrimary` | `#ff637d` | Coral — CTAs only |
| `colorForeground` | `#111111` | Body text |
| `colorMuted` | `#6b7280` | Secondary text, footer |
| `colorSurface` | `#f9fafb` | Data card backgrounds |
| `fontFamily` | Inter → Arial fallback | @font-face injected in Layout |

## Commands

```bash
# Install
npm install

# Live preview (http://localhost:3001)
npm run dev

# Render server (http://localhost:3002)
npm run server

# Export static HTML to /dist
npm run export
```

## Render API

```
POST http://localhost:3002/render
Content-Type: application/json

{
  "template": "team-invite",
  "props": {
    "recipientName": "Sarah",
    "inviterName": "Carlos García",
    "teamName": "Nhood ES",
    "inviteUrl": "https://app.fillit.com/invite/abc123"
  }
}
```

Returns `{ html: string, text: string }`.

## Templates

| Key | File | Trigger |
|-----|------|---------|
| `team-invite` | `src/templates/team-invite.tsx` | User invited to join a team |
| `signatory-added` | `src/templates/signatory-added.tsx` | External signatory added for a centre |

## Adding a new template

1. Create `src/templates/your-template.tsx` — default export a React component, named export for the props interface
2. Register it in `server.ts` (two lines: import + entry in `templates` map)
3. Run `npm run dev` to preview it

## File structure

```
email-service/
  src/
    components/      # Shared building blocks
      Layout.tsx     # Outer shell — font injection, body bg, card wrapper
      Header.tsx     # Logo mark
      Body.tsx       # Content padding wrapper
      Footer.tsx     # Social links + company name
      Paragraph.tsx  # Body text block
      Button.tsx     # Primary (coral) or outline CTA
      Divider.tsx    # 1px rule separator
      DataCard.tsx   # Key–value summary card (bookings, spaces, etc.)
    templates/       # One file per email
    tokens.ts        # Design token constants
  server.ts          # Hono render server
  README.md
  package.json
  tsconfig.json
```
