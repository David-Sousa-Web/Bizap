import { twilioClient } from '../../../lib/twilio.js'

export async function listTemplatesService() {
  const templates = await twilioClient.content.v1.contentAndApprovals.list()

  return templates.map((template) => ({
    name: template.friendlyName ?? '',
    status: template.approvalRequests
      ? JSON.stringify(template.approvalRequests)
      : 'unknown',
    body: template.types
      ? JSON.stringify(template.types)
      : '',
    type: template.types
      ? Object.keys(template.types).join(', ')
      : 'unknown',
  }))
}
