import crypto from 'node:crypto'
import { env } from '../env.js'

export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc'
  private readonly key: Buffer
  private readonly ivLength = 16

  constructor(masterKey: string) {
    this.key = crypto.createHash('sha256').update(masterKey).digest()
  }

  encrypt(text: string): string {
    const ivBase = crypto.createHash('sha256').update(text + this.key.toString('hex')).digest()
    const iv = ivBase.slice(0, this.ivLength)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `${iv.toString('hex')}:${encrypted}`
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
}

export const encryptionService = new EncryptionService(env.ENCRYPTION_MASTER_KEY)
