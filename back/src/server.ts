import { buildApp } from './app.js'
import { env } from './env.js'
import { appLogger } from './lib/logger.js'

async function main() {
  const app = buildApp()

  await app.listen({ port: env.PORT, host: '0.0.0.0' })

  appLogger.info({
    event: 'app.server.started',
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    url: `http://localhost:${env.PORT}`,
  }, 'Server started')

  if (env.NODE_ENV !== 'production') {
    appLogger.info({
      event: 'app.server.docs_ready',
      url: `http://localhost:${env.PORT}/v1/docs`,
    }, 'Swagger docs available')
  }
}

main().catch((error) => {
  appLogger.error({
    event: 'app.server.start_failed',
    err: error,
  }, 'Failed to start server')

  process.exit(1)
})
