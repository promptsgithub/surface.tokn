/**
 * armorup-profile - ArmorUp profile pane for surface.tokn.
 *
 * Paints an ArmorUp profile panel from the hermes-achievements plugin API.
 * The app serves plugin APIs on the same origin, so this file reads them
 * with a same-origin request and never references a LAN address. It also
 * uses the SDK host channel for session context.
 *
 * No backend code and no new RPCs: this file only consumes existing data
 * sources. Every read degrades to a graceful placeholder on failure.
 *
 * Data sources (all existing):
 *   GET /api/plugins/hermes-achievements/achievements
 *   GET /api/plugins/hermes-achievements/recent-unlocks
 *   GET /api/plugins/hermes-achievements/scan-status
 *   host.request('session.list', ...)   (SDK channel, session context)
 */
import { jsx, jsxs } from 'react/jsx-runtime'
import { useEffect, useState } from 'react'
import { host } from '@hermes/plugin-sdk'

const ID = 'armorup-profile'
const TITLE = 'ArmorUp profile'

const ENDPOINTS = {
  achievements: '/api/plugins/hermes-achievements/achievements',
  unlocks: '/api/plugins/hermes-achievements/recent-unlocks',
  scan: '/api/plugins/hermes-achievements/scan-status',
}

async function getJson(url) {
  const r = await fetch(url, { credentials: 'same-origin' })
  if (!r.ok) throw new Error(`http ${r.status}`)
  return r.json()
}

/**
 * Pure display mapping. Unit testable without a browser.
 * Returns { state: 'ok', ... } or { state: 'unavailable' }.
 */
export function armorUpDisplay(data) {
  if (!data || !data.achievements || typeof data.achievements !== 'object') {
    return { state: 'unavailable' }
  }
  const a = data.achievements
  const unlockList = Array.isArray(data.unlocks) ? data.unlocks.slice(0, 5) : []
  return {
    state: 'ok',
    points: typeof a.points === 'number' ? a.points : null,
    tier: typeof a.tier === 'string' ? a.tier : null,
    rank: typeof a.rank === 'string' ? a.rank : null,
    scan: data.scan && typeof data.scan === 'object' ? data.scan : null,
    unlocks: unlockList,
  }
}

const PANE_STYLE = {
  display: 'flex', flexDirection: 'column', gap: 8,
  padding: '12px 14px', fontSize: 13,
}

const UNAVAILABLE = jsx('div', {
  style: PANE_STYLE,
  children: [
    jsx('div', {
      style: { fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6 },
      children: TITLE,
    }),
    jsx('p', {
      style: { margin: 0, opacity: 0.6 },
      children: 'ArmorUp unavailable. The profile service is not reachable right now.',
    }),
  ],
})

function Badge({ tier }) {
  if (!tier) return null
  return jsx('span', {
    style: {
      fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '0 6px', borderRadius: 999, color: '#d7b464',
      background: 'rgba(215,180,100,0.12)', border: '1px solid rgba(215,180,100,0.3)',
    },
    children: tier,
  })
}

function Panel({ display }) {
  const points = display.points == null ? 'n/a' : Math.round(display.points).toLocaleString()
  const scanLine = display.scan
    ? `${display.scan.total || 0} scanned · ${display.scan.unlocked || 0} unlocked`
    : 'scan status unavailable'
  return jsxs('div', {
    style: PANE_STYLE,
    children: [
      jsxs('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        children: [
          jsx('div', {
            style: { fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6 },
            children: TITLE,
          }),
          jsx(Badge, { tier: display.tier }),
        ],
      }),
      jsxs('div', {
        style: { display: 'flex', gap: 10 },
        children: [
          jsx('div', {
            style: { flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' },
            children: [
              jsx('div', { style: { fontSize: 9, opacity: 0.5 }, children: 'Points' }),
              jsx('div', { style: { fontSize: 16, fontWeight: 600 }, children: points }),
            ],
          }),
          jsx('div', {
            style: { flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' },
            children: [
              jsx('div', { style: { fontSize: 9, opacity: 0.5 }, children: 'Rank' }),
              jsx('div', { style: { fontSize: 16, fontWeight: 600 }, children: display.rank || 'n/a' }),
            ],
          }),
        ],
      }),
      jsx('div', { style: { fontSize: 11, opacity: 0.6 }, children: scanLine }),
      display.unlocks.length > 0
        ? jsxs('div', {
            style: { display: 'flex', flexDirection: 'column', gap: 4 },
            children: [
              jsx('div', { style: { fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6 }, children: 'Recent unlocks' }),
              ...display.unlocks.map((u) =>
                jsx('div', {
                  style: { fontSize: 12 },
                  children: typeof u === 'string' ? u : (u && u.name) || 'unlock',
                }),
              ),
            ],
          })
        : jsx('div', { style: { fontSize: 11, opacity: 0.5 }, children: 'No unlocks yet. Keep prompting.' }),
    ],
  })
}

function ArmorUpPane() {
  const [display, setDisplay] = useState({ state: 'loading' })

  useEffect(() => {
    let dead = false
    async function load() {
      try {
        const [achievements, unlocks, scan] = await Promise.all([
          getJson(ENDPOINTS.achievements),
          getJson(ENDPOINTS.unlocks),
          getJson(ENDPOINTS.scan),
        ])
        // Session context via the SDK channel. Optional; never blocks the panel.
        host
          .request('session.list', { limit: 5, order: 'recent' })
          .then(() => {})
          .catch(() => {})
        if (dead) return
        setDisplay(armorUpDisplay({ achievements, unlocks, scan }))
      } catch {
        if (dead) return
        setDisplay({ state: 'unavailable' })
      }
    }
    load()
    return () => { dead = true }
  }, [])

  if (display.state === 'loading') {
    return jsx('div', { style: PANE_STYLE, children: 'Loading ArmorUp profile…' })
  }
  if (display.state !== 'ok') return UNAVAILABLE
  return jsx(Panel, { display })
}

export default {
  id: ID,
  name: 'ArmorUp profile',
  defaultEnabled: true,
  register(ctx) {
    ctx.register({
      id: 'armorup-profile-pane',
      area: 'panes',
      title: TITLE,
      render: () => jsx(ArmorUpPane, {}),
    })
  },
}
