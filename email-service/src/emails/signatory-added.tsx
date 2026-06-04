import { Layout }    from '../components/Layout'
import { EmailBody } from '../components/Body'
import { Paragraph } from '../components/Paragraph'
import { DataCard }  from '../components/DataCard'
import { Divider }   from '../components/Divider'
import { BRANDS, type Brand } from '../brand'
import { BRAND_LOCALES, type Locale } from '../i18n'
import { emailMeta } from '../registry'

const meta = emailMeta('signatory-added')

export interface SignatoryAddedProps {
  brand?:         Brand
  locale?:        Locale
  preview?:       boolean
  signatoryName?: string
  centreName?:    string
  teamName?:      string
  addedByName?:   string
  addedByEmail?:  string
}

interface Data { signatoryName: string; centreName: string; teamName: string; addedByName: string }

const T: Record<Locale, (d: Data) => {
  previewText: string; greeting: string; intro: string; body: string
  labelCentre: string; labelTeam: string; labelAddedBy: string; footer: (email: string) => string
}> = {
  en: (d) => ({
    previewText: `You've been added as a DocuSign signatory for ${d.centreName}`,
    greeting:    `Hi ${d.signatoryName},`,
    intro:       `You've been added as a DocuSign signatory for ${d.centreName} by ${d.teamName}.`,
    body:        `When a lease or contract document is ready for your signature, you'll receive a separate email from DocuSign with a link to review and sign electronically. No DocuSign account is required.`,
    labelCentre: 'Centre', labelTeam: 'Team', labelAddedBy: 'Added by',
    footer: (e) => `If you have questions or believe you've been added in error, contact ${d.addedByName} at ${e}.`,
  }),
  es: (d) => ({
    previewText: `Te han añadido como firmante de DocuSign para ${d.centreName}`,
    greeting:    `Hola ${d.signatoryName}:`,
    intro:       `${d.teamName} te ha añadido como firmante de DocuSign para ${d.centreName}.`,
    body:        `Cuando un contrato esté listo para tu firma, recibirás un correo independiente de DocuSign con un enlace para revisarlo y firmarlo electrónicamente. No se necesita una cuenta de DocuSign.`,
    labelCentre: 'Centro', labelTeam: 'Equipo', labelAddedBy: 'Añadido por',
    footer: (e) => `Si tienes preguntas o crees que te han añadido por error, contacta con ${d.addedByName} en ${e}.`,
  }),
  fr: (d) => ({
    previewText: `Vous avez été ajouté comme signataire DocuSign pour ${d.centreName}`,
    greeting:    `Bonjour ${d.signatoryName},`,
    intro:       `${d.teamName} vous a ajouté comme signataire DocuSign pour ${d.centreName}.`,
    body:        `Lorsqu'un bail ou un contrat sera prêt pour votre signature, vous recevrez un e-mail distinct de DocuSign avec un lien pour le consulter et le signer électroniquement. Aucun compte DocuSign n'est requis.`,
    labelCentre: 'Centre', labelTeam: 'Équipe', labelAddedBy: 'Ajouté par',
    footer: (e) => `Pour toute question ou en cas d'erreur, contactez ${d.addedByName} à l'adresse ${e}.`,
  }),
  it: (d) => ({
    previewText: `Sei stato aggiunto come firmatario DocuSign per ${d.centreName}`,
    greeting:    `Ciao ${d.signatoryName},`,
    intro:       `${d.teamName} ti ha aggiunto come firmatario DocuSign per ${d.centreName}.`,
    body:        `Quando un contratto sarà pronto per la tua firma, riceverai un'email separata da DocuSign con un link per esaminarlo e firmarlo elettronicamente. Non è necessario un account DocuSign.`,
    labelCentre: 'Centro', labelTeam: 'Team', labelAddedBy: 'Aggiunto da',
    footer: (e) => `Per domande o se ritieni di essere stato aggiunto per errore, contatta ${d.addedByName} all'indirizzo ${e}.`,
  }),
  pl: (d) => ({
    previewText: `Zostałeś dodany jako sygnatariusz DocuSign dla ${d.centreName}`,
    greeting:    `Cześć ${d.signatoryName},`,
    intro:       `${d.teamName} dodał(a) Cię jako sygnatariusza DocuSign dla obiektu ${d.centreName}.`,
    body:        `Gdy umowa będzie gotowa do podpisu, otrzymasz osobną wiadomość e-mail od DocuSign z linkiem do jej przejrzenia i elektronicznego podpisania. Konto DocuSign nie jest wymagane.`,
    labelCentre: 'Obiekt', labelTeam: 'Zespół', labelAddedBy: 'Dodany przez',
    footer: (e) => `W razie pytań lub jeśli uważasz, że dodano Cię przez pomyłkę, skontaktuj się z ${d.addedByName} pod adresem ${e}.`,
  }),
}

export default function SignatoryAdded({
  brand         = 'eleaseloop',
  locale        = 'en',
  preview       = false,
  signatoryName = 'James Miller',
  centreName    = 'Centro Comercial Xanadú',
  teamName      = 'Nhood ES',
  addedByName   = 'Carlos García',
  addedByEmail  = 'c.garcia@eleaseloop.es',
}: SignatoryAddedProps) {
  const cfg = BRANDS[brand]
  const t = T[locale]({ signatoryName, centreName, teamName, addedByName })

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
        <DataCard
          rows={[
            { label: t.labelCentre,  value: centreName },
            { label: t.labelTeam,    value: teamName },
            { label: t.labelAddedBy, value: addedByName },
          ]}
        />
        <Divider />
        <Paragraph muted small>{t.footer(addedByEmail)}</Paragraph>
      </EmailBody>
    </Layout>
  )
}
