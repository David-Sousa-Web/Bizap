import type { ProjectRepository } from '../repositories/project-repository.js'

export async function listProjectsService(
  userId: string,
  repository: ProjectRepository,
) {
  return repository.findAllByUserId(userId)
}
