import * as fs from 'fs'
import * as xml2js from 'xml2js'

interface ServerSettings {
    [key: string]: string
}

interface ServerProperty {
    $: { name: string, value: string }
}

function isFileReadable(filePath: string): boolean {
    try {
        fs.accessSync(filePath, fs.constants.R_OK)
        return true
    } catch (err) {
        return false
    }
}

async function readServerSettings(filePath: string): Promise<ServerSettings> {
    try {
        const xmlData = fs.readFileSync(filePath, 'utf-8')
        const parser = new xml2js.Parser({ explicitArray: false })
        const result = await parser.parseStringPromise(xmlData)

        if (!result || !result.ServerSettings || !result.ServerSettings.property) {
            console.warn('Invalid XML structure: Missing ServerSettings or property elements.')
            return {}
        }

        const settings: ServerSettings = {}
        const properties = result.ServerSettings.property as ServerProperty[]

        properties.forEach((prop: ServerProperty) => {
            settings[prop.$.name] = prop.$.value
        })

        return settings
    } catch (error) {
        console.warn('Failed to parse server config file.', error)
        return {}
    }
}

export class ConfigReader {

    private readonly path: string
    private readonly setExternally: boolean
    private bloodMoonFrequency: number

    constructor(path: string, bloodMoonFrequency: string | undefined) {
        this.path = path
        this.setExternally = bloodMoonFrequency !== undefined
        this.bloodMoonFrequency = parseInt(bloodMoonFrequency ?? '7', 10)
    }

    async initialize() {
        if (this.setExternally) {
            return Promise.resolve('ready')
        }

        if (!isFileReadable(this.path)) {
            console.warn(`Unable to read server config file. BloodMoonFrequency=${this.bloodMoonFrequency}`)
            return Promise.resolve('ready')
        }

        return readServerSettings(this.path).then(settings => {
            this.bloodMoonFrequency = parseInt(settings?.BloodMoonFrequency ?? `${this.bloodMoonFrequency}`, 10)
            console.log(`BloodMoonFrequency=${this.bloodMoonFrequency}`)
            return 'ready'
        })
    }

    terminate() {
        return Promise.resolve()
    }

    getBloodMoonFrequency(): number {
        return this.bloodMoonFrequency
    }
}
