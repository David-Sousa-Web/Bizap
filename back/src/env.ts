import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  API_BASE_URL: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  ZABBIX_METRICS_ENABLED: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  ZABBIX_SERVER_HOST: z.string().default('localhost'),
  ZABBIX_SERVER_PORT: z.coerce.number().int().positive().default(10051),
  METRICS_TEMP_FILE: z.string().default(process.platform === 'win32' ? 'C:\\temp\\zabbix_bizap_metrics.txt' : '/tmp/zabbix_bizap_metrics.txt'),
  ZABBIX_METRICS_CRON: z.string().default('* * * * *'),
})

export const env = envSchema.parse(process.env)
