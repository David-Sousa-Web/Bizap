import type { ObservabilityContext } from '../../../lib/wide-event.js'
import type { UserRepository } from '../repositories/user-repository.js'
import { presentUser } from './user-presenter.js'

export async function listUsersService(
  page: number,
  limit: number,
  search: string | undefined,
  repository: UserRepository,
  _observability: ObservabilityContext,
) {
  const result = await repository.findAll(page, limit, search)

  return {
    items: result.items.map(presentUser),
    meta: result.meta,
  }
}
