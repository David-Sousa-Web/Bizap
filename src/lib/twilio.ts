import Twilio from 'twilio'
import { env } from '../env.js'

export const twilioClient = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
