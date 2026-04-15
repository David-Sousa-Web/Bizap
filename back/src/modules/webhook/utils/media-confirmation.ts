export const INVALID_REPLY_LIMIT = 2

export const INVALID_REPLY_MESSAGE = 'Quando você quiser sua imagem mande sim ou não'

export const DECLINE_REPLY_MESSAGE = 'Claro, você tem 24 horas para enviar qualquer mensagem e receber sua imagem!'

export const DECLINED_EXPIRATION_HOURS = 24

const VALID_MEDIA_CONFIRMATION_REPLIES = new Set(['sim', 'yes'])

export function isValidMediaConfirmationReply(reply: string) {
  return VALID_MEDIA_CONFIRMATION_REPLIES.has(reply)
}

const DECLINE_MEDIA_CONFIRMATION_REPLIES = new Set(['nao', 'no'])

export function isDeclineMediaConfirmationReply(reply: string) {
  return DECLINE_MEDIA_CONFIRMATION_REPLIES.has(reply)
}
