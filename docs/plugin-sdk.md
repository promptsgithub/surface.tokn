# Desktop plugin SDK contract

A desktop plugin is one JavaScript file that extends the surface.tokn desktop
app with panes and status bar items. This is the public, supported contract.
The runtime that loads these files is private; this document describes only
the surface a student builds against.

## File layout

A plugin is one file at:

```
~/.hermes/desktop-plugins/<name>/plugin.js
```

The directory is filesystem watched. Save the file and the app hot reloads
the plugin. No build step and no restart are needed for plugin code changes.
Chrome-level branding may still need an app restart to fully reapply.

## Module constraints

A plugin file may import only:

- `@hermes/plugin-sdk` (the SDK, gives you `host`)
- `react`
- `react/jsx-runtime`

That is the entire allowlist. CI enforces it. No other runtime, config, or
internal module may be imported.

## The plugin shape

A plugin's default export is a `HermesPlugin`:

```js
import { jsx } from 'react/jsx-runtime'
import { host } from '@hermes/plugin-sdk'

export default {
  id: 'my-plugin',
  name: 'My plugin',
  defaultEnabled: true,
  register(ctx) {
    // contribute panes and status bar items here
  },
}
```

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Stable, unique plugin id |
| `name` | string | Human readable name shown in the UI |
| `defaultEnabled` | boolean | Whether the plugin starts enabled |
| `register(ctx)` | function | Receives the `PluginContext` and contributes UI |

## PluginContext

The context offers `register`, which contributes UI areas:

```js
register({
  id: 'my-pane',
  area: 'panes',
  title: 'My pane',
  render: () => jsx('div', { children: 'Hello' }),
})
```

Supported areas:

| Area | What it renders |
|---|---|
| `panes` | A titled pane in the app shell |
| `statusBar.right` | A status bar item on the right side |

`render` returns a React element.

## The host channel

`host` is the gateway RPC channel:

```js
const res = await host.request('method', { params })
```

`host.request(method, params)` performs gateway JSON-RPC. Use it for data the
app already exposes. Do not invent new methods: a plugin may consume existing
methods only)Skip, never extend the backend.

Important: `host.listPersistedSessions` does not exist in the current SDK.
To list sessions, call `host.request('session.list', { ... })`.

Example:

```js
const res = await host.request('session.list', { limit: 30, order: 'recent' })
const sessions = res && res.sessions ? res.sessions : []
```

## Reading app APIs

Some app functionality is exposed as HTTP APIs on the same origin (no LAN
addresses, no private IPs). A plugin may read them with a same-origin fetch:

```js
const r = await fetch('/api/plugins/hermes-achievements/achievements', {
  credentials: 'same-origin',
})
```

Every read must degrade gracefully. If a fetch or RPC fails, render a
placeholder. Never throw into the app, never leak raw error internals.

## What a plugin may never do

- Import anything outside the allowlist.
- Add backend code or new RPCs.
- Read or write gateway configuration, connection stores, or provider keys.
- Reference LAN addresses (`10.0.x.x`, `127.0.0.1`) or internal topology.
- Touch billing, ledger, or spend data.

When in doubt, render. If a change needs backend access, it belongs in the
private runtime repo, not here.
