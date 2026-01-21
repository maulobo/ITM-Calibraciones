export enum EmailTemplate {
  HEADER = 'src/email/templates/header.hbs',
  FOOTER = 'src/email/templates/footer.hbs',
  EMAIL_WELCOME = 'src/email/templates/welcome.hbs',
  RESET_PASSWORD = 'src/email/templates/body-new-password.hbs',
  USER_UPDATE_PASSWORD = 'src/email/templates/body-updated-password.hbs',
  BETS_RECORDATORY = 'src/email/templates/bets-recordatory.hbs',
  NEW_INSTRUMENT = 'src/email/templates/new-instrument.hbs',
  NEW_Technical_INFORM = 'src/email/templates/new-technical-inform.hbs',
  INSTRUMENT_SOON_EXPIRED = 'src/email/templates/instrument-sonn-expired.hbs',
}

export enum EmailTemplateList {
  EMAIL_WELCOME = 'EMAIL_WELCOME',
  RESET_PASSWORD = 'RESET_PASSWORD',
  BETS_RECORDATORY = 'BETS_RECORDATORY',
  NEW_INSTRUMENT = 'NEW_INSTRUMENT',
  NEW_Technical_INFORM = 'NEW_Technical_INFORM',
  USER_UPDATE_PASSWORD = 'USER_UPDATE_PASSWORD',
  INSTRUMENT_SOON_EXPIRED = 'INSTRUMENT_SOON_EXPIRED'
}
