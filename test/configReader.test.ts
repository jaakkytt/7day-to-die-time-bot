import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { ConfigReader } from '../src/service/configReader.js'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { timeout } from './config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configFile = path.join(__dirname, './serverconfig.xml')
const missingFile = path.join(__dirname, './no-such-file.xml')

describe('config', { timeout: timeout }, () => {

    it('should read bloodMoonFrequency from config file', async () => {
        const configReader = new ConfigReader(configFile, undefined)
        await configReader.initialize()
        const frequency = configReader.getBloodMoonFrequency()

        assert.equal(frequency, 1)
    })

    it('should use frequency passed during construction', async () => {
        const configReader = new ConfigReader(configFile, '3')
        await configReader.initialize()
        const frequency = configReader.getBloodMoonFrequency()

        assert.equal(frequency, 3)
    })

    it('should use fall back to 7 when unable to determine frequency', async () => {
        const configReader = new ConfigReader(missingFile, undefined)
        await configReader.initialize()
        const frequency = configReader.getBloodMoonFrequency()

        assert.equal(frequency, 7)
    })

})
