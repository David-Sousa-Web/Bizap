import pino, { stdSerializers } from 'pino'
import { env } from '../env.js'

const REDACTED_VALUE = '[REDACTED]'

function maskToken(value: string | null | undefined, prefixLength: number, suffixLength: number) {
  if (!value) {
    return undefined
  }

  if (value.length <= prefixLength + suffixLength) {
    return `${value.slice(0, 1)}***`
  }

  return `${value.slice(0, prefixLength)}***${value.slice(-suffixLength)}`
}

export function maskPhoneNumber(phoneNumber: string | null | undefined) {
  if (!phoneNumber) {
    return undefined
  }

  if (phoneNumber.length <= 4) {
    return '*'.repeat(phoneNumber.length)
  }

  const prefixLength = phoneNumber.startsWith('+') ? 3 : 2
  const safePrefixLength = Math.min(prefixLength, Math.max(phoneNumber.length - 4, 1))
  const prefix = phoneNumber.slice(0, safePrefixLength)
  const suffix = phoneNumber.slice(-4)
  const hiddenLength = Math.max(phoneNumber.length - safePrefixLength - suffix.length, 4)

  return `${prefix}${'*'.repeat(hiddenLength)}${suffix}`
}

export function maskEmail(email: string | null | undefined) {
  if (!email) {
    return undefined
  }

  const [localPart, domainPart] = email.split('@')

  if (!domainPart) {
    return maskToken(email, 1, 1)
  }

  const [domainName, ...domainRest] = domainPart.split('.')
  const domainSuffix = domainRest.length > 0 ? `.${domainRest.join('.')}` : ''

  return `${localPart.slice(0, 1)}***@${domainName.slice(0, 1)}***${domainSuffix}`
}

export function maskApiKey(apiKey: string | null | undefined) {
  return maskToken(apiKey, 4, 2)
}

export function maskAuthorizationHeader(authorization: string | null | undefined) {
  if (!authorization) {
    return undefined
  }

  const [scheme, credentials] = authorization.split(' ')

  if (!credentials) {
    return maskToken(authorization, 3, 2)
  }

  return `${scheme} ${maskToken(credentials, 4, 2)}`
}

export function maskMediaUrl(mediaUrl: string | null | undefined) {
  if (!mediaUrl) {
    return undefined
  }

  try {
    const parsedUrl = new URL(mediaUrl)
    return `${parsedUrl.origin}/[REDACTED]`
  } catch {
    return REDACTED_VALUE
  }
}

export const appLogger = pino({
  name: 'bizap',
  level: env.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: stdSerializers.err,
    error: stdSerializers.err,
  },
  redact: {
    paths: [
      'authorization',
      'headers.authorization',
      'headers.x-api-key',
      'req.headers.authorization',
      'req.headers.x-api-key',
      'request.headers.authorization',
      'request.headers.x-api-key',
      'apiKey',
      'xApiKey',
      'password',
      'body',
      'webhookBody',
      'email',
      'phoneNumber',
      'number',
      'from',
      'to',
      'mediaUrl',
      'imageUrl',
    ],
    censor: REDACTED_VALUE,
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      singleLine: true,
      ignore: 'pid,hostname',
    },
  },
})
