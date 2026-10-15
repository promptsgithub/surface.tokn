# surface.tokn (public overlay)

Student surfaces, plugins, skins, and branding for **surface.tokn**.

This is an **overlay** repository. It is public, student-facing, and safe by
construction. Everything here is something a student can build for a customer
without touching billing, backends, providers, gateways, or any load-bearing
runtime code.

The runtime itself stays in the private repository `promptsgithub/agent.tokn`.
This repo never mirrors it, never forks it, and never accepts patches that
reference it.

## What lives here

| Path | What it is | Where it lands on a live machine |
|---|---|---|
| `plugins/` | Desktop plugins: panes and status bar add-ons | `~/.hermes/desktop-plugins/<name>/plugin.js` |
| `skins/` | TUI skins (colors, spinner, branding) | `~/.hermes/skins/<name>.yaml` |
| `branding/` | Brand tokens (colors, logo rules) | reference copy, applied with skins |
| `docs/` | SDK contract, skin schema, branding rules, apply pipeline | documentation only |

A live surface is a Hermes desktop app (`surface.tokn`) whose user config
lives in `~/.hermes`. Plugins are watched and hot reloaded, so a merged plugin
reaches the machine without a rebuild.

## The one rule

No billing. No ledgers. No provider keys. No gateway configuration. No LAN
addresses (no `10.0.x.x`, no `127.0.0.1`). No `connection.json`. Anything a
student builds here must render, brand, or describe a customer surface. If a
change needs backend access, it belongs in the private runtime repo, not here.

See `CONTRIBUTING.md` for the full gate, and `docs/` for each contract.

## Quick start for students

1. Read `docs/plugin-sdk.md` (the desktop plugin contract).
2. Copy `plugins/template/plugin.js` and give it a name.
3. Build a pane or a status bar add-on. Render, do not fetch private data.
4. Open a pull request. CI validates shape and banned content.

Merged work is applied to live surfaces through the pipeline in
`docs/APPLYING.md`.
