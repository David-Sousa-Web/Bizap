import fs from 'node:fs/promises'
import { prisma } from '../src/lib/prisma.js'
import { encryptionService } from '../src/lib/encryption.js'

type Result = {
  phone: string
  projectId: string | null
  projectName: string | null
  numberId: string | null
  mediaRequestId: string | null
  previousStatus: string | null
  nextStatus: string | null
  action: string
}

function getArgValue(name: string) {
  const prefix = `--${name}=`
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix))

  return arg?.slice(prefix.length)
}

function normalizePhone(input: string) {
  const withoutWhatsappPrefix = input.trim().replace(/^whatsapp:/i, '')
  const digits = withoutWhatsappPrefix.replace(/\D/g, '')

  if (digits.length === 0) {
    return null
  }

  return `+${digits}`
}

function getPhoneLookupValues(phone: string) {
  const digits = phone.replace(/\D/g, '')

  return Array.from(new Set([
    phone,
    digits,
  ]))
}

async function main() {
  const filePath = getArgValue('file')
  const projectId = getArgValue('project-id')
  const shouldApply = process.argv.includes('--apply')

  if (!filePath) {
    throw new Error('Missing --file=<path> argument')
  }

  const content = await fs.readFile(filePath, 'utf8')
  const phones = Array.from(new Set(
    content
      .split(/\r?\n/)
      .map(normalizePhone)
      .filter((phone): phone is string => Boolean(phone)),
  ))

  const results: Result[] = []

  for (const phone of phones) {
    const encryptedLookupValues = getPhoneLookupValues(phone)
      .map((lookupValue) => encryptionService.encrypt(lookupValue))

    const numbers = await prisma.number.findMany({
      where: {
        number: { in: encryptedLookupValues },
        ...(projectId ? { projectId } : {}),
      },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    })

    if (numbers.length === 0) {
      results.push({
        phone,
        projectId: null,
        projectName: null,
        numberId: null,
        mediaRequestId: null,
        previousStatus: null,
        nextStatus: null,
        action: 'number_not_found',
      })
      continue
    }

    for (const number of numbers) {
      const mediaRequest = await prisma.mediaRequest.findFirst({
        where: {
          numberId: number.id,
          status: 'TEMPLATE_SENT',
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          status: true,
        },
      })

      if (!mediaRequest) {
        results.push({
          phone,
          projectId: number.projectId,
          projectName: number.project.name,
          numberId: number.id,
          mediaRequestId: null,
          previousStatus: null,
          nextStatus: null,
          action: 'template_sent_request_not_found',
        })
        continue
      }

      if (shouldApply) {
        await prisma.mediaRequest.update({
          where: { id: mediaRequest.id },
          data: { status: 'TEMPLATE_SEND_FAILED' },
        })
      }

      results.push({
        phone,
        projectId: number.projectId,
        projectName: number.project.name,
        numberId: number.id,
        mediaRequestId: mediaRequest.id,
        previousStatus: mediaRequest.status,
        nextStatus: 'TEMPLATE_SEND_FAILED',
        action: shouldApply ? 'updated' : 'dry_run',
      })
    }
  }

  console.table(results)
  console.log(JSON.stringify({
    apply: shouldApply,
    totalPhones: phones.length,
    matchedRows: results.filter((result) => result.mediaRequestId).length,
    updatedRows: results.filter((result) => result.action === 'updated').length,
    missingNumbers: results.filter((result) => result.action === 'number_not_found').length,
    missingTemplateSentRequests: results.filter((result) => (
      result.action === 'template_sent_request_not_found'
    )).length,
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
