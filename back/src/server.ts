import { buildApp } from './app.js'
import { env } from './env.js'

async function main() {
  const app = buildApp()

  await app.listen({ port: env.PORT, host: '0.0.0.0' })

  console.log(`Server running on http://localhost:${env.PORT}`)
  if (env.NODE_ENV !== 'production') {
    console.log(`Swagger docs: http://localhost:${env.PORT}/v1/docs`)
  }
}

main()
