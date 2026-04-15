import type { MultipartFile } from '@fastify/multipart'
import type { FastifyBaseLogger, FastifyRequest } from 'fastify'
import {
  maskApiKey,
  maskAuthorizationHeader,
  maskEmail,
  maskPhoneNumber,
} from './logger.js'

export interface WideEventError {
  type?: string
  message?: string
  code?: string
  retriable?: boolean
}

export interface WideIntegrationEvent {
  provider: string
  operation: string
  outcome: 'success' | 'error'
  durationMs?: number
  statusCode?: number
  code?: string
}

export interface WideEvent {
  event: 'request.summary'
  timestamp: string
  requestId: string
  service: string
  module?: string
  operation?: string
  outcome?: 'success' | 'client_error' | 'server_error'
  durationMs?: number
  http: {
    method: string
    path: string
    route?: string
    statusCode?: number
    headers?: {
      authorizationMasked?: string
      xApiKeyMasked?: string
      userAgent?: string
    }
  }
  actor?: {
    userId?: string
    emailMasked?: string
    authType?: 'jwt' | 'api_key' | 'password'
  }
  project?: {
    projectId?: string
    projectName?: string
    phoneNumberMasked?: string
    changedFields?: string[]
    flowMessageLength?: number
  }
  number?: {
    bizapId?: string
    numberMasked?: string
    numberName?: string
  }
  media?: {
    mediaRequestId?: string
    mimeType?: string
    sizeBytes?: number
    status?: string
    storage?: string
  }
  webhook?: {
    fromMasked?: string
    bodyLength?: number
    replyCategory?: 'confirm' | 'decline' | 'unknown'
    previousStatus?: string
    nextStatus?: string
  }
  error?: WideEventError
  integrations?: WideIntegrationEvent[]
}

export interface ObservabilityContext {
  log: FastifyBaseLogger
  wideEvent: WideEvent
}

declare module 'fastify' {
  interface FastifyRequest {
    startTimeNs?: bigint
    wideEvent: WideEvent
    observability: ObservabilityContext
  }
}

function toHeaderString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return undefined
}

function getRoutePath(request: FastifyRequest) {
  return request.routeOptions.url || request.url
}

function getRequestDurationMs(request: FastifyRequest) {
  if (!request.startTimeNs) {
    return undefined
  }

  const durationMs = Number(process.hrtime.bigint() - request.startTimeNs) / 1_000_000

  return Number(durationMs.toFixed(2))
}

function summarizeRequestHeaders(headers: Record<string, unknown>) {
  const authorizationMasked = maskAuthorizationHeader(toHeaderString(headers.authorization))
  const xApiKeyMasked = maskApiKey(toHeaderString(headers['x-api-key']))
  const userAgent = toHeaderString(headers['user-agent'])

  const summary = {
    authorizationMasked,
    xApiKeyMasked,
    userAgent,
  }

  return removeEmpty(summary) as WideEvent['http']['headers'] | undefined
}

export function summarizeFileUpload(file: Pick<MultipartFile, 'filename' | 'mimetype' | 'file'>) {
  return {
    fileName: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.file.bytesRead || undefined,
  }
}

function mergeSection<T extends object>(target: T | undefined, source: Partial<T>) {
  return {
    ...(target ?? {}),
    ...source,
  }
}

function removeEmpty<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeEmpty(item))
      .filter((item) => item !== undefined && item !== null) as T
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, entryValue]) => [key, removeEmpty(entryValue)] as const)
      .filter(([, entryValue]) => {
        if (entryValue === undefined || entryValue === null) {
          return false
        }

        if (Array.isArray(entryValue)) {
          return entryValue.length > 0
        }

        if (typeof entryValue === 'object') {
          return Object.keys(entryValue as Record<string, unknown>).length > 0
        }

        return true
      })

    return Object.fromEntries(entries) as T
  }

  return value
}

export function buildErrorCode(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const code = Reflect.get(error, 'code')

    if (typeof code === 'string') {
      return code
    }
  }

  return undefined
}

export function createWideEvent(request: FastifyRequest): WideEvent {
  return {
    event: 'request.summary',
    timestamp: new Date().toISOString(),
    requestId: request.id,
    service: 'bizap',
    http: {
      method: request.method,
      path: request.url,
      headers: summarizeRequestHeaders(request.headers),
    },
    integrations: [],
  }
}

export function createObservabilityContext(
  request: FastifyRequest,
  metadata: { module: string; operation: string },
): ObservabilityContext {
  request.wideEvent.module = metadata.module
  request.wideEvent.operation = metadata.operation

  const context = {
    log: request.log.child(metadata),
    wideEvent: request.wideEvent,
  }

  request.observability = context

  return context
}

export function setActorContext(wideEvent: WideEvent, actor: Partial<NonNullable<WideEvent['actor']>>) {
  wideEvent.actor = mergeSection(wideEvent.actor, actor)
}

export function setProjectContext(
  wideEvent: WideEvent,
  project: Partial<NonNullable<WideEvent['project']>>,
) {
  wideEvent.project = mergeSection(wideEvent.project, project)
}

export function setNumberContext(
  wideEvent: WideEvent,
  number: Partial<NonNullable<WideEvent['number']>>,
) {
  wideEvent.number = mergeSection(wideEvent.number, number)
}

export function setMediaContext(wideEvent: WideEvent, media: Partial<NonNullable<WideEvent['media']>>) {
  wideEvent.media = mergeSection(wideEvent.media, media)
}

export function setWebhookContext(
  wideEvent: WideEvent,
  webhook: Partial<NonNullable<WideEvent['webhook']>>,
) {
  wideEvent.webhook = mergeSection(wideEvent.webhook, webhook)
}

export function pushIntegrationEvent(wideEvent: WideEvent, integration: WideIntegrationEvent) {
  wideEvent.integrations ??= []
  wideEvent.integrations.push(integration)
}

export function setErrorContext(wideEvent: WideEvent, error: WideEventError) {
  wideEvent.error = mergeSection(wideEvent.error, error)
}

export function setActorFromJwtPayload(
  wideEvent: WideEvent,
  payload: { sub?: string; email?: string },
) {
  setActorContext(wideEvent, {
    authType: 'jwt',
    userId: payload.sub,
    emailMasked: maskEmail(payload.email),
  })
}

export function setRequestOutcome(wideEvent: WideEvent, statusCode: number) {
  if (statusCode >= 500) {
    wideEvent.outcome = 'server_error'
    return
  }

  if (statusCode >= 400) {
    wideEvent.outcome = 'client_error'
    return
  }

  wideEvent.outcome = 'success'
}

export function getWideEventLogLevel(wideEvent: WideEvent) {
  if (wideEvent.outcome === 'server_error') {
    return 'error' as const
  }

  if (wideEvent.outcome === 'client_error') {
    return 'warn' as const
  }

  return 'info' as const
}

export function finalizeWideEvent(request: FastifyRequest, statusCode: number) {
  request.wideEvent.http = {
    ...request.wideEvent.http,
    route: getRoutePath(request),
    statusCode,
  }
  request.wideEvent.durationMs = getRequestDurationMs(request)
  setRequestOutcome(request.wideEvent, statusCode)

  return removeEmpty(structuredClone(request.wideEvent))
}

export function markUnauthorizedJwt(wideEvent: WideEvent) {
  setActorContext(wideEvent, { authType: 'jwt' })
  setErrorContext(wideEvent, {
    type: 'AuthenticationError',
    code: 'invalid_jwt',
    message: 'Unauthorized',
  })
}

export function markUnauthorizedApiKey(wideEvent: WideEvent, projectId?: string) {
  setActorContext(wideEvent, { authType: 'api_key' })
  setProjectContext(wideEvent, { projectId })
}

export function setNotFoundError(wideEvent: WideEvent, code: string, message: string) {
  setErrorContext(wideEvent, {
    type: 'ApplicationError',
    code,
    message,
  })
}

export function setUnknownErrorContext(
  wideEvent: WideEvent,
  error: unknown,
  fallback: { type: string; message: string; code?: string; retriable?: boolean },
) {
  if (error instanceof Error) {
    setErrorContext(wideEvent, {
      type: error.name || fallback.type,
      message: error.message || fallback.message,
      code: buildErrorCode(error) ?? fallback.code,
      retriable: fallback.retriable,
    })
    return
  }

  setErrorContext(wideEvent, fallback)
}

export function maskActorEmail(email: string | undefined) {
  return maskEmail(email)
}

export function maskActorPhone(phoneNumber: string | undefined) {
  return maskPhoneNumber(phoneNumber)
}
