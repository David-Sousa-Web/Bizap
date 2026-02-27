import { twilioClient } from '../../../lib/twilio.js'

interface WhatsAppApproval {
  type: string
  name: string
  category: string
  content_type: string
  status: string
  rejection_reason: string
  allow_category_change: boolean
}

interface ApprovalRequests {
  whatsapp?: WhatsAppApproval
}

const USER_INITIATED_NO_APPROVAL = [
  'twilio/text',
  'twilio/media',
  'twilio/quick-reply',
  'twilio/location',
  'twilio/list-picker',
  'twilio/catalog',
]

const BUSINESS_NOT_SUPPORTED = [
  'twilio/location',
  'twilio/list-picker',
]

function resolveEligibility(type: string, approved: boolean) {
  const businessSupported = !BUSINESS_NOT_SUPPORTED.includes(type)
  const userFree = USER_INITIATED_NO_APPROVAL.includes(type)

  return {
    businessInitiated: businessSupported && approved,
    userInitiated: userFree || approved,
  }
}

export async function listTemplatesService(page: number, limit: number, search?: string) {
  const templates = await twilioClient.content.v1.contentAndApprovals.list()

  const mapped = templates.map((template) => {
    const approvals = template.approvalRequests as ApprovalRequests | undefined
    const whatsapp = approvals?.whatsapp
    const types = template.types as Record<string, Record<string, unknown>> | undefined
    const typeKey = types ? Object.keys(types)[0] : null
    const typeContent = typeKey && types ? types[typeKey] : null
    const approved = whatsapp?.status === 'approved'
    const eligibility = resolveEligibility(typeKey ?? '', approved)

    return {
      sid: template.sid ?? '',
      name: template.friendlyName ?? '',
      type: typeKey ?? 'unknown',
      body: typeContent,
      whatsappStatus: whatsapp?.status ?? 'unsubmitted',
      businessInitiated: eligibility.businessInitiated,
      userInitiated: eligibility.userInitiated,
    }
  })

  const filtered = search
    ? mapped.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : mapped

  const total = filtered.length
  const start = (page - 1) * limit
  const items = filtered.slice(start, start + limit)

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
