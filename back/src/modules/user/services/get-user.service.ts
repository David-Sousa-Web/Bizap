import {
  type ObservabilityContext,
  setErrorContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { UserRepository } from '../repositories/user-repository.js'
import { presentUser } from './user-presenter.js'

export async function getUserService(
  id: string,
  repository: UserRepository,
  observability: ObservabilityContext,
) {
  const user = await repository.findById(id)

  if (!user) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'user_not_found',
      message: 'User not found',
    })

    throw new ApplicationError('User not found', 404)
  }

  return presentUser(user)
}
