/**
 * welcome-pane - a clean example surface.
 *
 * Sanitized for the public repo: no LAN telemetry, no routing headers, no
 * tenant wiring. It greets the user and offers example prompts that fill the
 * composer through the app's own SDK channel.
 */
import { jsx, jsxs } from 'react/jsx-runtime'
import { useEffect, useState } from 'react'
import { host } from '@hermes/plugin-sdk'

const ID = 'welcome-pane'

const EXAMPLES = [
  { dept: 'Finance', label: 'Model an acquisition', prompt: 'Model this acquisition with an LBO, IRR and MOIC.' },
  { dept: 'Engineering', label: 'Port a kernel', prompt: 'Port this kernel to the NPU and keep the tests green.' },
  { dept: 'Research', label: 'Summarize a standard', prompt: 'Summarize IEEE 802.11be and what changed from 802.11ax.' },
  { dept: 'Legal', label: 'Review an NDA', prompt: 'Review this NDA and flag anything unusual in the indemnity clause.' },
  { dept: 'Operations', label: 'Draft the Monday brief', prompt: 'Draft the Monday operations brief from last week.' },
]

function greet() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function fillComposer(text) {
  // The composer may be a textarea or an input depending on the build. Try
  // both so chips keep working across updates.
  let ta =
    document.querySelector('main textarea') ||
    document.querySelector('textarea') ||
    document.querySelector('[placeholder^="Message"]') ||
    document.querySelector('main input[type="text"]')
  if (!ta) return
  const proto =
    ta.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype
  const desc = Object.getOwnPropertyDescriptor(proto, 'value')
  if (desc && desc.set) desc.set.call(ta, text)
  else ta.value = text
  ta.dispatchEvent(new Event('input', { bubbles: true }))
  ta.dispatchEvent(new Event('change', { bubbles: true }))
  ta.focus()
}

function Welcome() {
  const [userName, setUserName] = useState('there')
  const [routeMsg, setRouteMsg] = useState(null)

  useEffect(() => {
    let dead = false
    host
      .request('config.get', { key: 'full' })
      .then((res) => {
        if (dead) return
        const name = res && res.config && res.config.user && res.config.user.name
        if (name && typeof name === 'string') setUserName(name)
      })
      .catch(() => {})
    return () => { dead = true }
  }, [])

  function onChip(ex) {
    fillComposer(ex.prompt)
    setRouteMsg(`Prompt ready: ${ex.label}`)
  }

  return jsxs('div', {
    style: {
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: '12px 14px', fontSize: 13,
    },
    children: [
      jsxs('h2', {
        style: { margin: 0, fontSize: 16, fontWeight: 600 },
        children: [`Good ${greet()}, ${userName}`],
      }),
      jsx('p', {
        style: { margin: 0, opacity: 0.55 },
        children: 'What can I prompt for you? Pick an example to fill the composer.',
      }),
      jsxs('div', {
        style: { display: 'flex', flexDirection: 'column', gap: 6 },
        children: EXAMPLES.map((ex) =>
          jsxs('button', {
            type: 'button',
            onClick: () => onChip(ex),
            style: {
              textAlign: 'left', padding: '6px 10px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
            },
            children: [
              jsx('span', {
                style: { fontSize: 9, textTransform: 'uppercase', marginRight: 8, opacity: 0.6 },
                children: ex.dept,
              }),
              ex.label,
            ],
          }),
        ),
      }),
      routeMsg ? jsx('p', { style: { margin: 0, fontSize: 12, opacity: 0.7 }, children: routeMsg }) : null,
    ],
  })
}

export default {
  id: ID,
  name: 'Welcome pane',
  defaultEnabled: true,
  register(ctx) {
    ctx.register({
      id: 'welcome-pane-view',
      area: 'panes',
      title: 'Welcome',
      render: () => jsx(Welcome, {}),
    })
  },
}
