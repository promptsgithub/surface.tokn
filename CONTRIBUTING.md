# Contributing to surface.tokn

This is a student overlay repository. Contributions are welcome and gated by
an automated review so the public repo never becomes a leak of the runtime.

## What students can build

- **Desktop plugins** under `plugins/`: panes and status bar add-ons that
  render a customer surface. They may call the SDK `host` channel for data
  the app already exposes, and may read app APIs on the same origin.
  Never add backend code and never invent new RPCs.
- **Skins** under `skins/`: a YAML file describing colors, spinner, and
  branding. See `docs/skins.md`.
- **Brand tokens and rules** under `branding/`: colors and copy rules.
  See `docs/branding.md`.
- **Documentation** under `docs/`.

## What is banned (hard fail, CI enforced)

A contribution fails review if it contains, in any shipped file:

- Billing, ledger, or spend identifiers (the words `billing`, `ledger`).
- Provider keys, API keys, or secrets of any kind.
- Gateway configuration or identifiers.
- `connection.json` or any connection store reference.
- LAN topology: any `10.0.x.x` address, any `127.0.0.1` address, any other
  private LAN IP.
- References to internal node names, internal hostnames, or internal ports.

CI runs a banned-content scan over `plugins/`, `skins/`, and `branding/`.
Docs may describe the rules but never ship machine identifiers.

## Review gating

1. Open a pull request against `main`.
2. CI must pass: plugin shape validation, import allowlist, banned-content
   scan, and the harness tests in `tests/`.
3. A maintainer reviews the diff for anything CI cannot see: copy, posture,
   and whether the change needs backend access (if it does, it belongs in
   the private runtime repo).
4. Merge to `main`.

## How merged work is applied to a live surface

Merged plugins and skins are not auto deployed from this repo. A maintainer
moves them into the private prompts.ai tree and runs the white-label install
pipeline:

1. Copy `plugins/<name>/` into `infra/hermes-skins/desktop-plugins/<name>/`.
2. Copy `skins/<name>.yaml` into `infra/hermes-skins/`.
3. Run `install-white-label.sh`, which places them under
   `~/.hermes/desktop-plugins/` and `~/.hermes/skins/`.
4. Quit surface.tokn (Cmd-Q) and reopen.

The full pipeline is documented in `docs/APPLYING.md`.

## Copy rules

- No em-dashes or en-dashes anywhere in copy. Use commas, periods, or
  restructure the sentence.
- Logo order: **prompts.ai first, then .tokn**.
- Posture language: "sovereign intelligence". Never name internal nodes,
  LAN topology, or vendor internals.
