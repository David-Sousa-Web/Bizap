export function transformImageUrl(
  image: string | null,
  projectId: string,
  baseUrl: string,
): string | null {
  if (!image) return null
  return `${baseUrl}/v1/projects/${projectId}/image`
}
