import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { Presence } from '../src/presence.js'

import { timeout } from './config.js'

describe('presence', { timeout: timeout }, () => {

    it('should show next hord night in state for peaceful', async () => {
        const dayTime = { day: 118, time: '12:00', isHordNight: false }
        const presence = new Presence(dayTime, 1, 7, Date.now(), 60000)
        assert.equal(presence.activity.state, '🕊️Day 118/119, 12:00 🧍1')
    })

    it('should show no hord night if frequency 0', async () => {
        const dayTime = { day: 118, time: '12:00', isHordNight: false }
        const presence = new Presence(dayTime, 1, 0, Date.now(), 60000)
        assert.equal(presence.activity.state, '🕊️Day 118, 12:00 🧍1')
    })

    it('should show hord night if frequency 1', async () => {
        const dayTime = { day: 118, time: '12:00', isHordNight: true }
        const presence = new Presence(dayTime, 1, 1, Date.now(), 60000)
        assert.equal(presence.activity.state, '💀Day 118, 12:00 🧍1')
    })

    it('should show hord night if frequency 2', async () => {
        const dayTime = { day: 118, time: '12:00', isHordNight: true }
        const presence = new Presence(dayTime, 1, 2, Date.now(), 60000)
        assert.equal(presence.activity.state, '💀Day 118, 12:00 🧍1')
    })

    it('should omit next hord night in state for hord day', async () => {
        const dayTime = { day: 119, time: '12:00', isHordNight: true }
        const presence = new Presence(dayTime, 1, 7, Date.now(), 60000)
        assert.equal(presence.activity.state, '💀Day 119, 12:00 🧍1')
    })

    it('should omit next hord night in state for hord night', async () => {
        const dayTime = { day: 120, time: '03:00', isHordNight: true }
        const presence = new Presence(dayTime, 2, 7, Date.now(), 60000)
        assert.equal(presence.activity.state, '💀Day 120, 03:00 🧍2')
    })

})
