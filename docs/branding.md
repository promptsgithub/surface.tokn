# Branding rules

These rules apply to every surface a student builds: plugins, skins, docs,
and demos.

## Logo order

When both logos appear: **prompts.ai first (left), then .tokn (right)**.
Never reverse this order.

## Punctuation

No em-dashes and no en-dashes anywhere in copy. Use commas, periods, or
restructure the sentence. This is a hard rule for every shipped file,
including code comments.

## Posture language

The product posture is **sovereign intelligence**: intelligence that runs on
a customer's own sovereign metal, not rented cloud, framed as empowerment for
every organization.

Use:

- "sovereign intelligence"
- "managed on sovereign metal"
- "sovereign agent control"
- "Pareto efficiency"

Never use:

- Internal node names or LAN topology (no hostnames, no `10.0.x.x`, no
  `127.0.0.1`, no internal ports).
- Vendor internals or framework brand names as the identity of the surface.
- Big brother or surveillance framing. The narrative is empowerment, not
  attack.

A customer should always see a sovereign posture and never a network map.

## Color tokens

The brand palette lives in `branding/BRAND-TOKENS.yaml`. The canonical values:

| Token | Value | Use |
|---|---|---|
| `signal` | `#3d78d9` | Primary accent |
| `board` | `#13151b` | Background (quantum chalkboard) |
| `ink` | `#e6e8ec` | Primary text |
| `success` | `#22c55e` | Success state |

`light_blue` (`#6ea8fe`) is secondary accent only. The retired teal
(`#14b8a6`) must not be used as a chalkboard accent.

## Example voice

- "Sovereign Intelligence"
- "Managed on sovereign metal, not rented cloud."
- "What can I prompt for you?"

Write copy that a customer's board can read aloud. No topology, no internals.
