import { compare } from 'bcryptjs'
import { prisma } from '../../../lib/prisma.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { LoginBody } from '../schemas/auth.schema.js'

export async function loginService(data: LoginBody) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw new ApplicationError('Invalid credentials', 401)
  }

  const passwordMatch = await compare(data.password, user.password)

  if (!passwordMatch) {
    throw new ApplicationError('Invalid credentials', 401)
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}
