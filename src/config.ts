import { config } from 'dotenv'

config()

export const discordToken = process.env.DISCORD_TOKEN || ''
export const updateInterval = parseInt(process.env.DISCORD_UPDATE_INTERVAL || '30000')
export const loginTimeout = parseInt(process.env.DISCORD_LOGIN_TIMEOUT || '60000')

export const telnetHost = process.env.TELNET_HOST || 'localhost'
export const telnetPort = parseInt(process.env.TELNET_PORT || '23')
export const telnetPassword = process.env.TELNET_PASSWORD || ''
