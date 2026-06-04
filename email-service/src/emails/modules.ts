import type { Brand } from '../brand'
import type { Locale } from '../i18n'
import type { EmailMeta } from '../registry'

import * as teamInvite     from './team-invite'
import * as signatoryAdded from './signatory-added'

export interface EmailModule {
  meta: EmailMeta
  Content: (props: { brand?: Brand; locale?: Locale }) => React.ReactElement
  previewText: (brand: Brand, locale: Locale) => string
}

export const EMAIL_MODULES: Record<string, EmailModule> = {
  'team-invite':     teamInvite as unknown as EmailModule,
  'signatory-added': signatoryAdded as unknown as EmailModule,
}
