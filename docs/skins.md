# Skins

A skin is a YAML file that restyles the terminal UI (TUI). It ships with the
app config, not in the app bundle, so an app update cannot remove it.

## Install location

```
$HERMES_HOME/skins/<name>.yaml
```

Activate a skin by name in the app config under `display: skin: <name>`.
A `/skin <name>` command in a session is temporary; the persistent way is the
config value.

## Schema

```yaml
name: my-skin
description: One line about the skin

colors:
  banner_border: "#2a2e37"
  banner_title: "#3d78d9"
  banner_accent: "#6ea8fe"
  banner_dim: "#99a0ab"
  banner_text: "#e6e8ec"
  ui_accent: "#3d78d9"
  ui_label: "#6ea8fe"
  ui_ok: "#22c55e"
  ui_error: "#f2382e"
  ui_warn: "#f59e0b"
  prompt: "#e6e8ec"
  input_rule: "#2a2e37"
  response_border: "#3d78d9"
  session_label: "#99a0ab"
  session_border: "#2a2e37"
  status_bar_bg: "#13151b"
  voice_status_bg: "#13151b"
  selection_bg: "#1c2029"
  completion_menu_bg: "#171a21"
  completion_menu_current_bg: "#1c2029"
  completion_menu_meta_bg: "#171a21"
  completion_menu_meta_current_bg: "#1c2029"

spinner:
  waiting_faces: ["(·)", "(o)", "(O)"]
  thinking_faces: ["(⌁)", "(◇)", "(◆)"]
  thinking_verbs: ["reasoning", "recalling", "routing", "verifying", "grounding"]
  wings: [["⟪", "⟫"]]

branding:
  agent_name: ".tokn"
  welcome: ".tokn · sovereign agent control. Type your message, or /help for commands."
  goodbye: "Sovereign session closed."
  response_label: " .tokn "
  prompt_symbol: "›"
  help_header: "(·) .tokn commands"

tool_prefix: "│"
tool_emojis:
  terminal: "▸"
  web_search: "◉"
  read_file: "▤"
```

## Field reference

| Field | Meaning |
|---|---|
| `name` | Skin id, used to activate it |
| `description` | One line shown in skin pickers |
| `colors.*` | ANSI color tokens for banners, prompts, responses, menus, and the status bar |
| `spinner.waiting_faces` | Frames shown while waiting |
| `spinner.thinking_faces` | Frames shown while thinking |
| `spinner.thinking_verbs` | Verb shown with the thinking spinner |
| `spinner.wings` | Left/right wings around the spinner |
| `branding.agent_name` | The agent name shown in the UI |
| `branding.welcome` | The first-run welcome line |
| `branding.goodbye` | The goodbye line |
| `branding.response_label` | Label attached to responses |
| `branding.prompt_symbol` | Symbol before the prompt |
| `branding.help_header` | Header for the /help command list |
| `banner_logo` | Optional ASCII art that replaces the stock startup banner |
| `banner_hero` | Optional ASCII hero shown under the banner |
| `tool_prefix` | Prefix drawn before tool calls |
| `tool_emojis.*` | Emoji or glyph per tool type |

Missing values inherit from the built-in default skin. A user skin
outranks a built-in skin of the same name.

## Guidance

- A skin is data only. No scripts, no commands, no machine identifiers.
- Use the brand palette from `branding/BRAND-TOKENS.yaml`.
- Keep spinners restrained: this is sovereign operator kit, not a toy.
