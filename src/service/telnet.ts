import { Telnet as TelnetClient } from 'telnet-client'

export interface DayTime {
    day: number
    time: string
    isHordNight: boolean
}

export class Telnet {

    private readonly host: string
    private readonly port: number
    private readonly password: string
    private client: TelnetClient | null

    constructor(host: string, port: number, password: string) {
        this.host = host
        this.port = port
        this.password = password
        this.client = null
    }

    async initialize() {
        if (this.client) {
            return Promise.reject(new Error('Telnet is already initialized'))
        }

        const client = new TelnetClient()

        client.on('close', () => {
            console.log('Telnet connection closed')
        })

        client.on('data', (payload) => {
            console.log('Telnet response:')
            console.log(payload.toString())
        })

        client.on('timeout', () => {
            console.log('Telnet socket timeout!')
            this.terminate()
        })

        return client.connect({
            host: this.host,
            port: this.port,
            shellPrompt: null,
            negotiationMandatory: false,
            timeout: 15000,
            execTimeout: 15000,
            sendTimeout: 15000,
        }).then(() => {
            this.client = client
            console.log('Telnet connected!')
            return this.send(this.password, '^Logon successful.')
        })
    }

    async terminate() {
        if (!this.client) {
            return Promise.resolve()
        }
        await this.client.end()
        return this.client.destroy().then(() => {
            console.log('Telnet disconnected!')
            this.client = null
        })
    }

    async getDayTime(bloodMoonFrequency: number): Promise<DayTime> {
        return this.send('gettime', '^Day').then(response => {
            const result = response.trim().match('Day (\\d+), (..):(..)')
            if (!result) {
                console.warn('Failed to match gettime entry from: ', response)
                return { day: 0, time: '07:00', isHordNight: false }
            }

            const day = parseInt(result[1])
            const hour = parseInt(result[2])
            const time = `${result[2]}:${result[3]}`
            const isHordNight = bloodMoonFrequency > 0
                ? day % bloodMoonFrequency == 0 || day % bloodMoonFrequency == 1 && hour < 4
                : false

            return { day, time, isHordNight }
        })
    }

    async getPlayers(): Promise<number> {
        return this.send('listplayers', '^Total of (\\d+) in the game').then(response => {
            const result = response.match('Total of (\\d+) in the game')
            if (!result) {
                console.warn('Failed to match listplayers entry from: ', response)
                return 0
            }

            return parseInt(result[1])
        })
    }

    async send(message: string, waitFor: string) {
        if (!this.client) {
            return Promise.reject(new Error('Telnet is not initialized'))
        }

        return this.client.send(message, { waitFor: new RegExp(waitFor) })
    }

}
