import { after, before, describe, it } from 'node:test'
import * as assert from 'node:assert'
import { DiscordClient } from '../src/service/discordClient.js'
import { Presence } from '../src/presence.js'

import { timeout, token } from './config.js'
let discord: DiscordClient

describe('integration', { skip: !token, timeout: timeout }, () => {

    before(async () => {
        discord = new DiscordClient(token, 60000)
        await discord.initialize().catch(error => {
            console.error(error)
            assert.fail('Failed to initialize discord')
        })
    })

    after(async () => await discord.terminate())

    it('should set presence', async () => {
        const dayTime = { day: 7, time: '12:00', isHordNight: true }

        const presence = new Presence(dayTime, 1, 7, Date.now(), 60000)
        const clientPresence = discord.setPresence(presence)

        assert.equal(clientPresence.status, 'online')
        assert.equal(clientPresence.activities[0].state, '💀Day 7, 12:00 🧍1')
    })

})
