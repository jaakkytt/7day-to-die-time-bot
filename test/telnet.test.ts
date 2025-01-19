import { after, before, describe, it } from 'node:test'
import * as assert from 'node:assert'
import { Telnet } from '../src/service/telnet.js'

import { telnetHost, telnetPort, telnetPassword, timeout } from './config.js'
let client: Telnet

describe('integration', { skip:  !(telnetHost && telnetPort), timeout: timeout }, () => {

    before(async () => {
        client = new Telnet(telnetHost, telnetPort, telnetPassword)
        await client.initialize().catch(error => {
            console.error(error)
            assert.fail('Failed to initialize Telnet')
        })
    })

    after(async () => await client.terminate())

    it('should get daytime', async () => {
        const dayTime = await client.getDayTime(7)
        assert.equal(dayTime.day, 1)
        assert.equal(dayTime.time, '07:00')
        assert.equal(dayTime.isHordNight, false)
    })

    it('should get player count', async () => {
        const count = await client.getPlayers()
        assert.equal(count, 0)
    })

})
