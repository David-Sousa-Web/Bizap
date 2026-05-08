import type { User } from '@prisma/client'
import type { PaginatedResult } from '../../../utils/pagination.js'

export type CreateUserData = {
  name: string
  email: string
  password: string
}

export type UpdateUserData = Partial<Pick<User, 'name' | 'email' | 'password'>>

export interface UserRepository {
  create(data: CreateUserData): Promise<User>
  findById(id: string): Promise<User | null>
  findAll(page: number, limit: number, search?: string): Promise<PaginatedResult<User>>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
}
