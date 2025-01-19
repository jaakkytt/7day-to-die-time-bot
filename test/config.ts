import { config } from 'dotenv'
import { join } from 'path'
import { URL } from 'url'

config({ path: join(new URL('.', import.meta.url).pathname, '.env') })

export const timeout = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT) : undefined

export const token = process.env.DISCORD_TOKEN || ''

export const telnetHost = process.env.TELNET_HOST || ''
export const telnetPort = parseInt(process.env.TELNET_PORT || '')
export const telnetPassword = process.env.TELNET_PASSWORD || ''
