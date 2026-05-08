import type { User } from '@prisma/client'

export function presentUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}
