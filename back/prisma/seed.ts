import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('123456', 10)

  const user = await prisma.user.create({
    data: {
      email: 'admin@bizap.com',
      password,
      name: 'Admin',
    },
  })

  console.log('User created:', user)
}

main()
  .finally(() => prisma.$disconnect())
