import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { getDashboardService } from '../services/get-dashboard.service.js'
import type { DashboardQuery } from '../schemas/dashboard.schema.js'

export async function getDashboardController(
  request: FastifyRequest<{ Querystring: DashboardQuery }>,
  reply: FastifyReply,
) {
  const observability = createObservabilityContext(request, {
    module: 'dashboard',
    operation: 'get',
  })

  const dashboard = await getDashboardService(
    request.query,
    observability,
  )

  return reply.status(200).send({
    success: true,
    message: 'Dashboard retrieved successfully',
    data: dashboard,
  })
}
