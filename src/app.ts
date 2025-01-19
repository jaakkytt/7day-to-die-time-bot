import { Presence } from './presence.js'
import { DiscordClient } from './service/discordClient.js'
import { Telnet } from './service/telnet.js'
import { ConfigReader } from './service/configReader.js'

import {
    discordToken, updateInterval, loginTimeout,
    telnetHost, telnetPort, telnetPassword,
    bloodMoonFrequency, configFilePath,
} from './config.js'

const discord = new DiscordClient(discordToken, loginTimeout)
const startupTelnet = new Telnet(telnetHost, telnetPort, telnetPassword)
const configReader = new ConfigReader(configFilePath, bloodMoonFrequency)

const services = [discord, startupTelnet, configReader]

const setPresence = async (telnet: Telnet, frequency: number, ready: number) => {
    const daytime = await telnet.getDayTime(frequency)
    const online = await telnet.getPlayers()
    const presence = new Presence(daytime, online, frequency, ready, updateInterval)
    discord.setPresence(presence)
}

const main = async () => {
    for (const service of services) {
        console.debug(`Initializing ${service.constructor.name}`)
        await service.initialize()
    }

    const ready = Date.now()
    const frequency = configReader.getBloodMoonFrequency()

    await setPresence(startupTelnet, frequency, ready)
    await startupTelnet.terminate()

    setInterval(async () => {
        const updateTelnet = new Telnet(telnetHost, telnetPort, telnetPassword)
        await updateTelnet.initialize()
        await setPresence(updateTelnet, frequency, ready)
        await updateTelnet.terminate()
    }, updateInterval)
}

const terminateServices = async () => {
    for (const service of services) {
        console.debug(`Terminating ${service.constructor.name}`)
        await service.terminate().catch(e => {
            console.error(`Failed to terminate ${service.constructor.name}`, e)
        })
    }
}

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal. Gracefully shutting down...')
    await terminateServices()
    process.exit(0)
})

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Gracefully shutting down...')
    await terminateServices()
    process.exit(0)
})

process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception. Exiting...', error)
    await terminateServices()
    process.exit(1)
})

main().then(() => console.log('Bot started'))
