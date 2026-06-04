import { Layout }    from '../components/Layout'
import { EmailBody } from '../components/Body'
import { Paragraph } from '../components/Paragraph'
import { Button }    from '../components/Button'
import { Divider }   from '../components/Divider'
import { BRANDS, type Brand } from '../brand'
import { BRAND_LOCALES, type Locale } from '../i18n'
import { emailMeta } from '../registry'

const meta = emailMeta('team-invite')

export interface TeamInviteProps {
  brand?:         Brand
  locale?:        Locale
  preview?:       boolean
  recipientName?: string
  inviterName?:   string
  teamName?:      string
  inviteUrl?:     string
}

interface Data { recipientName: string; inviterName: string; teamName: string; brandName: string }

const T: Record<Locale, (d: Data) => { previewText: string; greeting: string; intro: string; body: string; cta: string; disclaimer: string }> = {
  en: (d) => ({
    previewText: `${d.inviterName} has invited you to join ${d.teamName} on ${d.brandName}`,
    greeting:    `Hi ${d.recipientName},`,
    intro:       `${d.inviterName} has invited you to join ${d.teamName} on ${d.brandName}.`,
    body:        `Once you accept, you'll be able to collaborate with your team on bookings, spaces, and communications.`,
    cta:         'Accept invitation',
    disclaimer:  `This invitation was sent by ${d.inviterName}. If you weren't expecting it, you can safely ignore this email — the invitation expires after 7 days.`,
  }),
  es: (d) => ({
    previewText: `${d.inviterName} te ha invitado a unirte a ${d.teamName} en ${d.brandName}`,
    greeting:    `Hola ${d.recipientName}:`,
    intro:       `${d.inviterName} te ha invitado a unirte a ${d.teamName} en ${d.brandName}.`,
    body:        `Una vez que aceptes, podrás colaborar con tu equipo en reservas, espacios y comunicaciones.`,
    cta:         'Aceptar invitación',
    disclaimer:  `Esta invitación fue enviada por ${d.inviterName}. Si no la esperabas, puedes ignorar este correo: la invitación caduca a los 7 días.`,
  }),
  fr: (d) => ({
    previewText: `${d.inviterName} vous a invité à rejoindre ${d.teamName} sur ${d.brandName}`,
    greeting:    `Bonjour ${d.recipientName},`,
    intro:       `${d.inviterName} vous a invité à rejoindre ${d.teamName} sur ${d.brandName}.`,
    body:        `Une fois votre invitation acceptée, vous pourrez collaborer avec votre équipe sur les réservations, les espaces et les communications.`,
    cta:         'Accepter l’invitation',
    disclaimer:  `Cette invitation a été envoyée par ${d.inviterName}. Si vous ne l'attendiez pas, vous pouvez ignorer cet e-mail — l'invitation expire après 7 jours.`,
  }),
  it: (d) => ({
    previewText: `${d.inviterName} ti ha invitato a unirti a ${d.teamName} su ${d.brandName}`,
    greeting:    `Ciao ${d.recipientName},`,
    intro:       `${d.inviterName} ti ha invitato a unirti a ${d.teamName} su ${d.brandName}.`,
    body:        `Una volta accettato, potrai collaborare con il tuo team su prenotazioni, spazi e comunicazioni.`,
    cta:         'Accetta l’invito',
    disclaimer:  `Questo invito è stato inviato da ${d.inviterName}. Se non te lo aspettavi, puoi ignorare questa email — l'invito scade dopo 7 giorni.`,
  }),
  pl: (d) => ({
    previewText: `${d.inviterName} zaprosił(a) Cię do zespołu ${d.teamName} w ${d.brandName}`,
    greeting:    `Cześć ${d.recipientName},`,
    intro:       `${d.inviterName} zaprosił(a) Cię do dołączenia do zespołu ${d.teamName} w ${d.brandName}.`,
    body:        `Po zaakceptowaniu zaproszenia będziesz mieć możliwość współpracy z zespołem w zakresie rezerwacji, przestrzeni i komunikacji.`,
    cta:         'Zaakceptuj zaproszenie',
    disclaimer:  `To zaproszenie zostało wysłane przez ${d.inviterName}. Jeśli się go nie spodziewałeś(-aś), możesz zignorować tę wiadomość — zaproszenie wygasa po 7 dniach.`,
  }),
}

export default function TeamInvite({
  brand         = 'fillit',
  locale        = 'en',
  preview       = false,
  recipientName = 'Sarah',
  inviterName   = 'Carlos García',
  teamName      = 'Nhood ES',
  inviteUrl     = 'https://app.example.com/invite/abc123',
}: TeamInviteProps) {
  const cfg = BRANDS[brand]
  const t = T[locale]({ recipientName, inviterName, teamName, brandName: cfg.name })

  return (
    <Layout
      preview={t.previewText}
      brand={brand}
      lang={locale}
      meta={preview ? { ...meta, brand, locale, locales: BRAND_LOCALES[brand] } : undefined}
    >
      <EmailBody>
        <Paragraph>{t.greeting}</Paragraph>
        <Paragraph>{t.intro}</Paragraph>
        <Paragraph>{t.body}</Paragraph>
        <Button href={inviteUrl} color={cfg.primary}>{t.cta}</Button>
        <Divider />
        <Paragraph muted small>{t.disclaimer}</Paragraph>
      </EmailBody>
    </Layout>
  )
}
