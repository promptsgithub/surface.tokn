const ID = 'picker-buckets'

const TITLES = {
  media: 'sovereign.media.tokn',
  cloud: 'sovereign.cloud.tokn',
  global: 'sovereign.global.tokn',
  allied: 'sovereign.allied.tokn',
  metal: 'sovereign.metal.tokn',
  moa: 'Mixture of Agents'
}

const ORDER = { media: 0, cloud: 1, global: 2, allied: 3, metal: 4, moa: 5 }

const ORG_RANK = {
  ANTHROPIC: 1,
  OPENAI: 2,
  GOOGLE: 3,
  SPACEXAI: 4,
  DEEPSEEK: 5,
  QWEN: 6,
  GLM: 7,
  XIAOMI: 8,
  NVIDIA: 9,
  META: 10,
  'THINKING MACHINES': 11,
  LIQUID: 12,
  MISTRAL: 13,
  MICROSOFT: 14,
  MINIMAX: 15
}

let expanded = 'allied'
let passNative = false
let sniff = { sitting: [], disk: [], note: 'this computer', loaded: false }
let sniffing = false
let lastPoke = 0

const CSS = `
  [data-tokn-hide="1"] { display: none !important; }

  [data-tokn-stack-wrap],
  [data-tokn-metal-wrap] {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }

  [data-tokn-stack-title] {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    font-size: 12.5px !important;
    font-weight: 600 !important;
    line-height: 1.2 !important;
    color: var(--ui-text-primary, var(--foreground, #f0f0f0)) !important;
    background: var(--ui-bg-elevated, var(--popover, #171a21)) !important;
    background-color: var(--ui-bg-elevated, var(--popover, #171a21)) !important;
    padding: 5px 8px !important;
    cursor: pointer !important;
    opacity: 1 !important;
    position: sticky !important;
    top: var(--tokn-sticky-top, 0px) !important;
    z-index: 35 !important;
    border-bottom: 1px solid var(--ui-border, #333) !important;
    box-shadow: none !important;
  }
  [data-tokn-stack-title]:hover {
    background: var(--ui-bg-elevated, var(--popover, #1c2029)) !important;
  }
  [data-tokn-label] {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [data-tokn-caret] {
    margin-left: auto;
    flex-shrink: 0;
    width: 1em;
    text-align: right;
    font-size: 11px;
    line-height: 1;
    opacity: 0.45;
    transform: rotate(0deg);
    transition: transform 120ms ease, opacity 120ms ease;
    pointer-events: none;
  }
  [data-tokn-stack-title][data-tokn-open="1"] [data-tokn-caret] {
    transform: rotate(90deg);
    opacity: 0.7;
  }

  [data-tokn-org] {
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    font-size: 0.6875rem !important;
    font-weight: 600 !important;
    line-height: 1.2 !important;
    color: var(--muted-foreground, #a8a8b2) !important;
    background: var(--popover, var(--ui-bg-elevated, #232428)) !important;
    background-color: var(--popover, var(--ui-bg-elevated, #232428)) !important;
    padding: 4px 8px !important;
    pointer-events: none !important;
    cursor: default !important;
    opacity: 1 !important;
    position: sticky !important;
    top: var(--tokn-sticky-top, 0) !important;
    z-index: 30 !important;
    border-bottom: 1px solid var(--ui-border, #333) !important;
    box-shadow: none !important;
  }
  [data-tokn-org] [data-tokn-caret],
  [data-tokn-org] [data-tokn-hide] { display: none !important; }

  /* Tight no-gap top stripe (nested flush to top of content area, no space above like OpenCode sticky headers) */
  [data-tokn-stack-title]:first-of-type,
  [data-tokn-org]:first-of-type,
  [data-tokn-body] > :first-child {
    margin-top: 0 !important;
    padding-top: 4px !important;
  }

  [data-tokn-body] {
    padding-top: 0 !important;
    margin-top: 0 !important;
  }

  [data-tokn-body] {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  [data-tokn-body][data-tokn-open="0"] { display: none !important; }

  /* Model rows inside buckets: breathing room, no hard truncation */
  [data-tokn-body] [data-slot="dropdown-menu-item"]:not([data-tokn-stack-title]):not([data-tokn-org]),
  [data-tokn-body] [data-slot="dropdown-menu-sub-trigger"] {
    padding: 5px 8px !important;
    min-height: 24px !important;
    white-space: normal !important;
    line-height: 1.3 !important;
    color: var(--foreground, #f0f0f0) !important;
    border-radius: 5px !important;
    margin: 1px 4px !important;
  }
  [data-tokn-body] [data-slot="dropdown-menu-item"]:not([data-tokn-stack-title]):not([data-tokn-org]):hover,
  [data-tokn-body] [data-slot="dropdown-menu-sub-trigger"]:hover {
    background: var(--ui-control-hover-background, rgba(255, 255, 255, 0.08)) !important;
  }
  /* Current/selected model row: readable accent, not a washed-out box */
  [data-tokn-body] [data-slot="dropdown-menu-item"][aria-selected="true"],
  [data-tokn-body] [data-slot="dropdown-menu-item"][data-state="checked"],
  [data-tokn-body] [data-slot="dropdown-menu-sub-trigger"][aria-selected="true"] {
    background: rgba(20, 184, 166, 0.12) !important;
    color: var(--foreground, #f0f0f0) !important;
    box-shadow: inset 2px 0 0 #14b8a6 !important;
  }
  [data-tokn-body] [data-slot="dropdown-menu-sub-trigger"] {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  /* Bucket sections breathe: separate stacks with a hair of air */
  [data-tokn-stack-wrap] + [data-tokn-stack-wrap],
  [data-tokn-stack-wrap] + [data-tokn-metal-wrap],
  [data-tokn-metal-wrap] + [data-tokn-stack-wrap] {
    margin-top: 6px !important;
  }

  /* Scroll belongs to the dropdown root, not the bucket bodies: cap its
     height so long catalogues scroll instead of clipping at the screen edge. */
  [data-slot="dropdown-menu-content"],
  [data-slot="popover-content"] {
    max-height: min(70vh, 560px) !important;
    overflow-y: auto !important;
    overscroll-behavior: contain !important;
  }
  [data-tokn-body] {
    overflow: visible !important;
  }

  [data-tokn-report] {
    display: flex;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.25;
    padding: 5px 8px;
    color: var(--foreground);
    pointer-events: none;
  }
  [data-tokn-report="sit"] { font-weight: 500; }
  [data-tokn-report="disk"] {
    color: var(--ui-text-tertiary, var(--muted-foreground));
  }
  [data-tokn-report="note"] {
    font-size: 0.625rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ui-text-tertiary, var(--muted-foreground));
    padding-top: 2px;
    opacity: 0.8;
  }
  [data-tokn-injected-org] { pointer-events: none; }

  /* Help sticky headers and close gaps */
  [data-tokn-body],
  [class*="overflow-y-auto"] {
    padding-top: 0 !important;
  }
  /* Bucket bodies follow the native theme instead of forcing #1a1a1d. The old
     rule painted every overflow-y-auto element dark, which also hit the composer
     input and blocked the Appearance page themes (e.g. a blue theme). */
  [data-tokn-body] {
    background: var(--ui-bg-chrome, var(--popover, #1a1a1d)) !important;
  }
`

function ensureStyle() {
  let s = document.getElementById(ID + '-css')
  if (!s) {
    s = document.createElement('style')
    s.id = ID + '-css'
    document.documentElement.appendChild(s)
  }
  if (s.textContent !== CSS) s.textContent = CSS
}

function isCatalog(node) {
  if (!node || node.nodeType !== 1) return false
  const t = node.textContent || ''
  if (!/refresh models|edit models/i.test(t)) return false
  if (node.querySelector('input')) return true
  return /search models/i.test(t)
}

function catalogs() {
  const out = []
  const seen = new Set()
  const push = (n) => {
    if (!n || seen.has(n)) return
    if (n.closest && n.closest('[data-slot="sidebar"]')) return // never bucket the sidebar
    seen.add(n)
    out.push(n)
  }
  const nodes = document.querySelectorAll('[data-slot="dropdown-menu-content"], [data-slot="popover-content"], [role="menu"], [role="listbox"]')
  for (const n of nodes) {
    if (isCatalog(n)) push(n)
  }
  for (const search of document.querySelectorAll('[data-slot="dropdown-menu-search"]')) {
    const host =
      search.closest('[data-slot="dropdown-menu-content"], [data-slot="popover-content"], [role="menu"]') ||
      search.parentElement
    if (host && isCatalog(host)) push(host)
  }
  if (!out.length) {
    for (const n of document.querySelectorAll('div')) {
      if (n.querySelector('input') && isCatalog(n) && n.childElementCount > 3) push(n)
    }
  }
  return out
}

function scrollParent(root) {
  return root.querySelector('[class*="overflow-y-auto"]') || root
}

function setStickyTop(root) {
  if (!root) return
  // Precise offset so the stripe/header is tight to the top of the content area,
  // right under the search bar, no gap (matching OpenCode sticky headers flush to top).
  // Calculate exact distance from root top to bottom of search area.
  let searchArea = root.querySelector('[data-slot="dropdown-menu-search"]') ||
                   root.querySelector('[data-slot="command-input"]') ||
                   root.querySelector('[cmdk-input]') ||
                   root.querySelector('input[type="text"]') ||
                   root.querySelector('input') ||
                   root.querySelector('[class*="search"]') ||
                   root.querySelector('[class*="Search"]')
  const scroller = scrollParent(root)
  let rootOffset = 0
  let scrollerOffset = 0
  if (searchArea) {
    const rootRect = root.getBoundingClientRect()
    const searchRect = searchArea.getBoundingClientRect()
    rootOffset = Math.max(0, Math.round(searchRect.bottom - rootRect.top) - 1)
    if (scroller && scroller !== root) {
      // Scroller starts BELOW Search models already: offset relative to scroller top is 0px.
      const scrollerRect = scroller.getBoundingClientRect()
      scrollerOffset = Math.max(0, Math.round(searchRect.bottom - scrollerRect.top))
    } else {
      scrollerOffset = rootOffset
    }
  }
  root.style.setProperty('--tokn-sticky-top', rootOffset + 'px')
  if (scroller && scroller !== root) {
    scroller.style.setProperty('--tokn-sticky-top', scrollerOffset + 'px')
  }
}

function groupsOf(root) {
  return [...root.querySelectorAll('[data-slot="dropdown-menu-group"]')].filter(
    (g) => !g.hasAttribute('data-tokn-stack-wrap') && !g.hasAttribute('data-tokn-metal-wrap')
  )
}

function titleOfGroup(group) {
  const items = [...group.querySelectorAll('[data-slot="dropdown-menu-item"]')]
  return (
    items.find((el) => /uppercase/.test(el.className || '')) ||
    items.find((el) => el.hasAttribute('data-tokn-native')) ||
    items.find((el) => {
      const t = rawText(el)
      return /^(media|allied|global|cloud|metal)\b/i.test(t) || /sovereign\.\w+\.tokn/i.test(t)
    }) ||
    items[0]
  )
}

function modelRows(group) {
  return [...group.querySelectorAll('[data-slot="dropdown-menu-sub-trigger"], [data-slot="dropdown-menu-item"]')]
}

function modelFingerprint(group, title) {
  return modelRows(group)
    .filter((row) => row !== title && !(title && title.contains(row)))
    .map((row) => rawText(row).replace(/medium|high|low|fast/gi, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .sort()
    .join('|')
}

// React owns Search models. appendChild during a filter = removeChild crash
// (session-tile failed to render). Park only when the box is empty; on
// keystroke send every native group back to the overflow parent and hide
// our synthetic wraps.
const homeOf = new WeakMap()

function isOurs(el) {
  if (!el || el.nodeType !== 1) return false
  return (
    el.hasAttribute('data-tokn-body') ||
    el.hasAttribute('data-tokn-stack-wrap') ||
    el.hasAttribute('data-tokn-metal-wrap')
  )
}

function park(group, dest) {
  if (!group || !dest) return
  const p = group.parentElement
  if (p && !isOurs(p)) homeOf.set(group, p)
  if (group.parentElement !== dest) dest.appendChild(group)
}

function sendHome(group, fallback) {
  if (!group) return
  let home = homeOf.get(group)
  if (!home || isOurs(home) || !home.isConnected) home = fallback
  if (!home || isOurs(home)) return
  if (group.parentElement !== home) home.appendChild(group)
}

function hide(el, on) {
  if (!el) return
  if (on) {
    el.setAttribute('data-tokn-hide', '1')
    el.style.setProperty('display', 'none', 'important')
  } else {
    el.removeAttribute('data-tokn-hide')
    el.style.removeProperty('display')
  }
}

function rawText(el) {
  return String(el?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function rememberNative(title) {
  if (!title || title.getAttribute('data-tokn-native')) return
  const trunc = title.querySelector('.truncate')
  const n = String(trunc?.textContent || rawText(title))
    .replace(/[›>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (n) title.setAttribute('data-tokn-native', n)
}

function orgFromText(text) {
  const t = String(text || '')
    .replace(/sovereign\.\w+\.tokn/gi, '')
    .replace(/mixture of agents/gi, '')
    .replace(/^(media|global|allied|cloud|metal)\s+/i, '')
    .trim()
  if (/opencode|open code/i.test(t)) return null
  if (/anthropic|claude|\bopus\b|\bsonnet\b|\bhaiku\b|\bfable\b/i.test(t)) return 'ANTHROPIC'
  if (/openai|\bgpt-|\bgpt \d|\bchatgpt\b|\bo1\b|\bo3\b|\bo4\b/i.test(t)) return 'OPENAI'
  if (/x-ai|\bxai\b|grok|spacex/i.test(t)) return 'SPACEXAI'
  if (/deepseek/i.test(t)) return 'DEEPSEEK'
  if (/\bglm\b|z-ai|zhipu/i.test(t)) return 'GLM'
  if (/qwen|\bqwq\b/i.test(t)) return 'QWEN'
  if (/lightning|nemotron/i.test(t)) return 'NVIDIA'
  if (/glimmer|\bmuse\b/i.test(t)) return 'META'
  if (/inkling|thinking machines/i.test(t)) return 'THINKING MACHINES'
  if (/liquid|\blfm/i.test(t)) return 'LIQUID'
  if (/minimax|hailuo/i.test(t)) return 'MINIMAX'
  if (/ministral|mistral|mixtral|codestral|pixtral|magistral/i.test(t)) return 'MISTRAL'
  if (/\bmimo\b/i.test(t)) return 'XIAOMI'
  if (/poolside|\blaguna\b/i.test(t)) return 'POOLSIDE'
  if (/mythomax|mytomax/i.test(t)) return 'GRYPHE'
  if (/\bphi-?\d|\bphi3\b|\bphi4\b/i.test(t)) return 'MICROSOFT'
  if (/llama|\bmeta\b/i.test(t)) return 'META'
  if (/gemini|gemma|google/i.test(t)) return 'GOOGLE'
  if (/perplexity|sonar/i.test(t)) return 'PERPLEXITY'
  if (/cohere|command-?r/i.test(t)) return 'COHERE'
  if (/\bnova\b|amazon|bedrock/i.test(t)) return 'AMAZON'
  if (/moonshot|\bkimi\b/i.test(t)) return 'MOONSHOT'
  if (/bytedance|\bseed\b/i.test(t)) return 'BYTEDANCE'
  if (/tencent|hunyuan/i.test(t)) return 'TENCENT'
  if (/nousresearch|\bnous\b/i.test(t) && !/\bhermes\b/i.test(t)) return 'NOUS'
  if (/\bmorph\b/i.test(t)) return 'MORPH'
  if (/ibm|granite/i.test(t)) return 'IBM'
  if (/microsoft/i.test(t)) return 'MICROSOFT'
  if (/nvidia/i.test(t)) return 'NVIDIA'
  if (/xiaomi/i.test(t)) return 'XIAOMI'
  if (/inception/i.test(t)) return 'INCEPTION'
  if (/inclusion/i.test(t)) return 'INCLUSION'
  if (/reka/i.test(t)) return 'REKA'
  if (/relace/i.test(t)) return 'RELACE'
  if (/stepfun|\bstep-?\d/i.test(t)) return 'STEPFUN'
  if (/baidu|ernie/i.test(t)) return 'BAIDU'
  if (/writer/i.test(t)) return 'WRITER'
  if (/upstage/i.test(t)) return 'UPSTAGE'
  if (/perceptron/i.test(t)) return 'PERCEPTRON'
  if (/mancer/i.test(t)) return 'MANCER'
  if (/gryphe/i.test(t)) return 'GRYPHE'
  if (/sao10k/i.test(t)) return 'SAO10K'
  if (/thedrummer|drummer/i.test(t)) return 'DRUMMER'
  if (/anthracite|magnum/i.test(t)) return 'ANTHRACITE'
  if (/cognitivecomputations|dolphin/i.test(t)) return 'COGNITIVE'
  if (/undi95/i.test(t)) return 'UNDI95'
  return null
}

function isDroppedModel(text) {
  const t = String(text || '')
  if (/opencode|open code/i.test(t)) return true
  if (/\bhermes\s*\d|\bhermes-[234]\b|nous-hermes|nousresearch\/hermes/i.test(t)) return true
  // ZDR policy: no free tiers and no contributor/community uploads in sovereign.cloud.
  if (/:free\b|\bcontributor\b|\bfree\b/i.test(t)) return true
  return false
}

function bucketOf(text) {
  const t = String(text || '')
  if (/opencode|open code/i.test(t)) return 'hide'
  if (/nous research|\bnousresearch\b|^nous$/i.test(t)) return 'hide'
  if (/mixture of agents|\bmoa\b/i.test(t)) return 'moa'
  // Package / fleet prefix FIRST. "ALLIED GEMMA 4" must not fall through
  // to the mothership `gemma` → sota rule or Allied never wraps.
  if (/sovereign\.media\.tokn|(^|\b)media\b/i.test(t)) return 'media'
  if (/sovereign\.metal\.tokn|(^|\s)metal(\s|$)|on metal|e2b|localhost|llama\.cpp|lm studio/i.test(t)) return 'metal'
  if (/sovereign\.global\.tokn|(^|\b)global\b|non allied/i.test(t)) return 'global'
  if (/sovereign\.allied\.tokn|(^|\b)allied\b/i.test(t)) return 'allied'
  if (/sovereign\.cloud\.tokn|(^|\b)cloud\b/i.test(t)) return 'cloud'
  if (/zenlm|goody|optics-/i.test(t)) return 'hide'
  // Native mothership folders (Anthropic / OpenAI / Gemini / Grok).
  // Chrome: blend under sovereign.cloud.tokn so the sign is one Cloud.
  // Routing stays the mothership provider for direct upstream routing.
  // Non-mothership / others: sovereign.cloud.tokn (OR with ZDR).
  // Do not put openai/* etc back on the OR list.
  // Gemini + Gemma both under GOOGLE. Bare "SOTA" chrome dropped.
  // Direct OpenAI SOTA added via custom provider for visibility and direct routing.
  if (/^sota$/i.test(t)) return 'sota'
  if (/anthropic|claude|\bopus\b|\bsonnet\b|\bhaiku\b|\bfable\b/i.test(t)) return 'sota'
  if (/openai|\bgpt-|\bchatgpt\b|\bo1\b|\bo3\b|\bo4\b/i.test(t)) return 'sota'
  if (/gemini|google|gemma/i.test(t)) return 'sota'
  if (/x-ai|\bxai\b|grok|spacex/i.test(t)) return 'sota'
  return 'cloud'
}

function rowHost(row, group) {
  const p = row.parentElement
  if (p && p !== group && p.getAttribute('data-slot') !== 'dropdown-menu-group') return p
  return row
}

function searching(root) {
  const box = root.querySelector('[data-slot="dropdown-menu-search"] input, input')
  if (!box) return false
  return String(box.value || '').trim().length > 0
}

function paintTitle(el, bucket, open) {
  const wanted = TITLES[bucket]
  el.removeAttribute('data-tokn-org')
  el.setAttribute('data-tokn-stack-title', bucket)
  el.setAttribute('data-tokn-open', open ? '1' : '0')
  let label = el.querySelector(':scope > [data-tokn-label]')
  if (!label) {
    label = document.createElement('span')
    label.setAttribute('data-tokn-label', '')
    el.insertBefore(label, el.firstChild)
  }
  if (label.textContent !== wanted) label.textContent = wanted
  hide(label, false)
  for (const n of [...el.childNodes]) {
    if (n === label) continue
    if (n.nodeType === 1 && n.hasAttribute('data-tokn-caret')) continue
    if (n.nodeType === 3) {
      n.textContent = ''
      continue
    }
    if (n.nodeType === 1) hide(n, true)
  }
  let caret = el.querySelector(':scope > [data-tokn-caret]')
  if (!caret) {
    caret = document.createElement('span')
    caret.setAttribute('data-tokn-caret', '')
    caret.setAttribute('aria-hidden', 'true')
    el.appendChild(caret)
  }
  if (caret.textContent !== '›') caret.textContent = '›'
  hide(caret, false)
}

function paintOrg(el, name) {
  el.removeAttribute('data-tokn-stack-title')
  el.removeAttribute('data-tokn-open')
  el.setAttribute('data-tokn-org', name)
  let label = el.querySelector(':scope > [data-tokn-label]')
  if (!label) {
    label = document.createElement('span')
    label.setAttribute('data-tokn-label', '')
    el.insertBefore(label, el.firstChild)
  }
  if (label.textContent !== name) label.textContent = name
  hide(label, false)
  for (const n of [...el.childNodes]) {
    if (n === label) continue
    if (n.nodeType === 3) {
      n.textContent = ''
      continue
    }
    if (n.nodeType === 1) hide(n, true)
  }
}

function bindTitle(el, bucket) {
  if (el.dataset.toknBound === bucket) return
  el.dataset.toknBound = bucket
  el.addEventListener(
    'click',
    (e) => {
      if (passNative) return
      e.preventDefault()
      e.stopImmediatePropagation()
      expanded = expanded === bucket ? '' : bucket
      catalogFrozen = false
      rewrite()
    },
    true
  )
}

const expandedNative = new WeakSet()
const emptyClicks = new Set()
let pendingExpand = false

function nativeExpandIfEmpty(title, group) {
  if (!title || !group) return
  if (group.querySelector('[data-slot="dropdown-menu-sub-trigger"]')) {
    expandedNative.add(group)
    return
  }
  // Do not WeakSet-lock an empty folder — OpenAI cache was empty until
  // force_refresh. Retry next catalog open; one click per name per open.
  const key = title.getAttribute('data-tokn-native') || rawText(title)
  if (!key || emptyClicks.has(key)) return
  emptyClicks.add(key)
  passNative = true
  try {
    title.click()
    pendingExpand = true
  } finally {
    passNative = false
  }
}

const PROVIDER_FOR = {
  'glm-5.3-flash-exl3': 'glm-direct',
  'deepseek-v4-flash-0731': 'deepseek-global',
  'qwen3.8-flash-next': 'qwen-global',
  'radixark/qwen3.8-flash-next-nvfp4': 'qwen-global',
  'qwen3-vl-8b': 'eyes-c14',
  'mimo-v2.6-flash': 'mimo-global',
  'nemotron-3.5-lightning': 'lightning-allied',
  'gemma-4-26b-a4b': 'gemma-allied',
  'inferact/muse-glimmer-30b-nvfp4-w4a4': 'glimmer-allied'
}

const PRETTY_MODEL = {
  'glm-5.3-flash-exl3': 'GLM 5.3',
  'nemotron-3.5-lightning': 'Nemotron 3.5 Lightning',
  'gemma-4-26b-a4b': 'Gemma 4 26B',
  'inferact/muse-glimmer-30b-nvfp4-w4a4': 'Muse Glimmer 30B',
  'deepseek-v4-flash-0731': 'DeepSeek V4 Flash',
  'qwen3.8-flash-next': 'Qwen 3.8 Flash',
  'radixark/qwen3.8-flash-next-nvfp4': 'Qwen 3.8 Flash',
  'qwen3-vl-8b': 'Qwen3-VL 8B',
  'mimo-v2.6-flash': 'MiMo 2.6 Flash'
}

function prettyModel(row) {
  const raw = String(rawText(row) || '').trim()
  const pretty = PRETTY_MODEL[raw.toLowerCase()]
  if (pretty) {
    const walkPretty = (n) => {
      if (n.nodeType === 3 && n.textContent.trim() === raw) { n.textContent = n.textContent.replace(raw, pretty); return true }
      if (n.nodeType === 1) for (const c of n.childNodes) if (walkPretty(c)) return true
      return false
    }
    if (walkPretty(row)) return
  }
  const walk = (n) => {
    if (n.nodeType === 3 && /^\s*\/?Model\s*$/.test(n.textContent)) {
      n.textContent = n.textContent.replace(/\/?Model/, 'Nemotron Lightning')
    }
    if (n.nodeType === 1) for (const c of n.childNodes) walk(c)
  }
  walk(row)

  // Clean OpenAI model display names to remove hyphens for consistency with other models
  // (e.g. "GPT-5.4 Med" -> "GPT 5.4 Med", "GPT-5.6-sol Med" -> "GPT 5.6 sol Med")
  // Internal model IDs/slugs in config remain correct for direct routing.
  // This only affects visible text in the picker.
  const cleanOpenAIName = (str) => {
    if (!/GPT-|\bO[0-9]-|gpt-|o[0-9]-/i.test(str)) return str
    let s = str
    s = s.replace(/GPT-(\d)/gi, 'GPT $1')
    s = s.replace(/\bO(\d)-/gi, 'O$1 ')
    s = s.replace(/-sol\b/gi, ' sol')
    s = s.replace(/-terra\b/gi, ' terra')
    s = s.replace(/-astra\b/gi, ' astra')
    s = s.replace(/-codex\b/gi, ' codex')
    s = s.replace(/-pro\b/gi, ' pro')
    s = s.replace(/-mini\b/gi, ' mini')
    return s
  }
  const applyClean = (n) => {
    if (n.nodeType === 3) {
      const cleaned = cleanOpenAIName(n.textContent)
      if (cleaned !== n.textContent) n.textContent = cleaned
    }
    if (n.nodeType === 1) for (const c of n.childNodes) applyClean(c)
  }
  applyClean(row)
}

function injectOrgHeaders(group, title) {
  const rows = modelRows(group).filter((row) => {
    if (row === title || row.hasAttribute('data-tokn-stack-title')) return false
    if (title && title.contains(row)) return false
    if (row.hasAttribute('data-tokn-org') || row.hasAttribute('data-tokn-injected-org')) return false
    if (row.getAttribute('data-tokn-hide') === '1') return false
    const slot = row.getAttribute('data-slot')
    return slot === 'dropdown-menu-sub-trigger' || slot === 'dropdown-menu-item'
  })
  if (!rows.length) return
  const ranked = [...rows].sort((a, b) => {
    const oa = orgFromText(rawText(a)) || 'ZZZ'
    const ob = orgFromText(rawText(b)) || 'ZZZ'
    const d = (ORG_RANK[oa] || 90) - (ORG_RANK[ob] || 90)
    if (d) return d
    return rawText(a).localeCompare(rawText(b))
  })
  const orgs = ranked.map((r) => orgFromText(rawText(r))).filter(Boolean)
  const unique = [...new Set(orgs)]
  if (!unique.length) return
  const wanted = orgs.join('|')
  const have = [...group.querySelectorAll('[data-tokn-injected-org]')]
    .map((h) => h.getAttribute('data-tokn-injected-org'))
    .join('|')
  if (have === wanted) return
  for (const h of [...group.querySelectorAll('[data-tokn-injected-org]')]) h.remove()
  for (const row of ranked) {
    const host = rowHost(row, group)
    group.appendChild(host)
  }
  let last = ''
  for (const row of ranked) {
    const org = orgFromText(rawText(row))
    if (!org || org === last) continue
    last = org
    const h = document.createElement('div')
    h.setAttribute('data-tokn-injected-org', org)
    h.setAttribute('data-tokn-org', org)
    h.textContent = org
    const host = rowHost(row, group)
    host.parentElement.insertBefore(h, host)
  }
}

function mergeDuplicateOrgs(root) {
  // Merge all models under duplicate GOOGLE (and other org) headers into the first one
  // This eliminates "two googles" when native Gemini sota and OR Gemma in sovereign.cloud.tokn
  // both create GOOGLE sections inside the cloud package.
  const cloudBodies = root.querySelectorAll('[data-tokn-body]');
  for (const body of cloudBodies) {
    const orgHeaders = [...body.querySelectorAll('[data-tokn-org="GOOGLE"]')];
    if (orgHeaders.length <= 1) continue;
    const firstHeader = orgHeaders[0];
    for (let i = 1; i < orgHeaders.length; i++) {
      const dup = orgHeaders[i];
      // Collect models following this dup header until next org header or end
      const toMove = [];
      let sib = dup.nextElementSibling;
      while (sib && !sib.hasAttribute('data-tokn-org') && !sib.hasAttribute('data-tokn-stack-title')) {
        toMove.push(sib);
        sib = sib.nextElementSibling;
      }
      // Move them after the last child of the first GOOGLE block
      let insertAfter = firstHeader;
      // Find last model after firstHeader that is not another org
      let after = firstHeader.nextElementSibling;
      while (after && !after.hasAttribute('data-tokn-org')) {
        insertAfter = after;
        after = after.nextElementSibling;
      }
      for (const el of toMove) {
        if (el.parentElement) el.parentElement.removeChild(el);
        insertAfter.parentElement.insertBefore(el, insertAfter.nextSibling);
        insertAfter = el;
      }
      // Hide the duplicate header
      dup.setAttribute('data-tokn-hide', '1');
      dup.style.display = 'none';
    }
  }
}

function rewriteMoa(root, q) {
  const label = [...root.querySelectorAll('[data-slot="dropdown-menu-label"]')].find((el) =>
    /moa|mixture of agents/i.test(el.textContent || '')
  )
  if (!label) return
  const open = q || expanded === 'moa'
  paintTitle(label, 'moa', open)
  bindTitle(label, 'moa')
  let n = label.nextElementSibling
  while (n && n.getAttribute('data-slot') !== 'dropdown-menu-separator') {
    if (n.getAttribute('data-slot') === 'dropdown-menu-item') hide(n, !open)
    n = n.nextElementSibling
  }
}

function groupLines(lines) {
  const buckets = {}
  for (const line of lines) {
    const org = orgFromText(line) || 'LOCAL'
    if (!buckets[org]) buckets[org] = []
    buckets[org].push(line)
  }
  return Object.keys(buckets)
    .sort((a, b) => (ORG_RANK[a] || 90) - (ORG_RANK[b] || 90))
    .map((org) => ({ org, lines: buckets[org] }))
}

function fillMetal(wrap, open) {
  let body = wrap.querySelector('[data-tokn-metal-body]')
  if (!body) {
    body = document.createElement('div')
    body.setAttribute('data-tokn-metal-body', '')
    wrap.appendChild(body)
  }
  hide(body, !open)
  if (!open) return
  const sig = JSON.stringify(sniff)
  if (body.dataset.sig === sig) return
  body.dataset.sig = sig
  body.textContent = ''
  const sits = sniff.sitting || []
  const disks = sniff.disk || []
  const lanes = sniff.lanes || []
  if (!sits.length && !disks.length && !lanes.length) {
    const r = document.createElement('div')
    r.setAttribute('data-tokn-report', 'note')
    r.textContent = sniff.note || 'nothing sniffed on this computer'
    body.appendChild(r)
    return
  }
  const sitGroups = groupLines(sits)
  const diskGroups = groupLines(disks)
  const seen = new Set()
  for (const g of sitGroups) {
    seen.add(g.org)
    const org = document.createElement('div')
    org.setAttribute('data-tokn-org', g.org)
    org.textContent = g.org
    body.appendChild(org)
    for (const line of g.lines) {
      const r = document.createElement('div')
      r.setAttribute('data-tokn-report', 'sit')
      r.textContent = line
      body.appendChild(r)
    }
  }
  for (const g of diskGroups) {
    if (!seen.has(g.org)) {
      const org = document.createElement('div')
      org.setAttribute('data-tokn-org', g.org)
      org.textContent = g.org
      body.appendChild(org)
    }
    for (const line of g.lines) {
      const r = document.createElement('div')
      r.setAttribute('data-tokn-report', 'disk')
      r.textContent = line
      body.appendChild(r)
    }
  }
  if (sniff.note) {
    const r = document.createElement('div')
    r.setAttribute('data-tokn-report', 'note')
    r.textContent = sniff.note
    body.appendChild(r)
  }
}

const FLEET_BUCKET = (tier) => {
  const t = String(tier || '').toLowerCase()
  // Fabric labels and raw bucket names from runtime config.
  if (/^(media|sovereign\.media\.tokn|fal|replicate|seedance)$/.test(t)) return 'media'
  if (/^(cloud|sovereign\.cloud\.tokn|openrouter)$/.test(t)) return 'cloud'
  if (/^(global|sovereign\.global\.tokn)$/.test(t)) return 'global'
  if (/^(allied|sovereign\.allied\.tokn)$/.test(t)) return 'allied'
  if (/muse|voice|macfast|gemma/.test(t)) return 'allied'
  if (/coding|glm|capable|frontier|deepseek|mimo|vl/.test(t)) return 'global'
  if (/openrouter/.test(t)) return 'cloud'
  return null
}

// Local sovereign lanes when runtime config has not loaded yet. These are the
// providers already present in the app config; direct rows bypass the native
// submenu path, which is not selectable in the packaged picker.
const FALLBACK_LANES = [
  { id: 'RadixArk/Qwen3.8-Flash-Next-NVFP4', name: 'Qwen3.8 Flash Next', provider: 'qwen-global', tier: 'global' },
  { id: 'deepseek-v4-flash-0731', name: 'DeepSeek V4.1 Flash', provider: 'deepseek-global', tier: 'global' },
  { id: 'GLM-5.3-Flash-EXL3', name: 'GLM-5.3 Flash', provider: 'glm-global', tier: 'global' },
  { id: 'MiMo-v2.6-Flash', name: 'MiMo v2.6 Flash', provider: 'mimo-global', tier: 'global' },
  { id: 'nemotron-3.5-lightning', name: 'Nemotron 3.5 Lightning', provider: 'lightning-allied', tier: 'allied' },
  { id: 'gemma-4-26b-a4b', name: 'Gemma 4 26B', provider: 'gemma-allied', tier: 'allied' },
  { id: 'Inferact/Muse-Glimmer-30B-NVFP4-W4A4', name: 'Muse Glimmer 30B', provider: 'glimmer-allied', tier: 'allied' },
  { id: 'qwen3-vl-8b', name: 'Qwen3-VL 8B', provider: 'eyes-c14', tier: 'global' }
]

function fillFleet(root) {
  const lanes = (sniff.lanes && sniff.lanes.length) ? sniff.lanes : FALLBACK_LANES
  if (!lanes.length) return
  const sig = JSON.stringify(lanes.map((l) => l.id + ':' + l.tier + ':' + (l.provider || '')))
  for (const bucket of ['media', 'allied', 'global', 'cloud']) {
    const body = root.querySelector(`[data-tokn-body="${bucket}"]`)
    if (!body || body.dataset.fleetSig === sig) continue
    body.dataset.fleetSig = sig
    body.querySelectorAll('[data-tokn-fleet-row]').forEach((e) => e.remove())
    const seen = new Set()
    for (const lane of lanes) {
      if (FLEET_BUCKET(lane.tier) !== bucket) continue
      if (bucket === 'cloud' && /:free|contributor|free/i.test(lane.id)) continue
      const name = lane.name || PRETTY_MODEL[lane.id.toLowerCase()] || lane.id
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      const row = document.createElement('div')
      row.setAttribute('data-tokn-fleet-row', bucket)
      row.setAttribute('data-slot', 'dropdown-menu-item')
      row.setAttribute('role', 'menuitem')
      row.textContent = name
      row.style.cssText = 'padding:6px 10px;font-size:12px;cursor:pointer;'
      const provider = lane.provider || PROVIDER_FOR[lane.id.toLowerCase()] || ''
      row.dataset.toknModel = lane.id
      row.dataset.toknProvider = provider
      row.addEventListener('click', async (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        const sdk = window.__HERMES_PLUGIN_SDK__
        const host = sdk && sdk.host
        if (!provider) return
        const sid = host && host.state && host.state.activeSessionId && host.state.activeSessionId.value
        try {
          if (sid && host) {
            await host.request('config.set', { session_id: sid, key: 'model', value: `${lane.id} --provider ${provider}`, confirm_expensive_model: true })
          } else if (window.hermesDesktop && window.hermesDesktop.api) {
            await window.hermesDesktop.api({ path: '/api/model/set', method: 'POST', body: { scope: 'main', provider, model: lane.id, confirm_expensive_model: true } })
            if (sdk && sdk.queryClient) { void sdk.queryClient.invalidateQueries() }
          }
          // The packaged picker does not always repaint the trigger after a
          // programmatic set; one renderer refresh makes the selection visible.
          setTimeout(() => { try { window.location.reload() } catch (_) {} }, 250)
        } catch (err) { console.error('model switch failed', err) }
      })
      body.appendChild(row)
    }
  }
}

function ensurePackage(root, parent, bucket) {
  if (parent && parent.closest && parent.closest('[data-slot="sidebar"]')) return { wrap: null, body: null, open: false }
  const sel = `[data-tokn-stack-wrap="${bucket}"]`
  let wrap = root.querySelector(sel)
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.setAttribute('data-tokn-stack-wrap', bucket)
    wrap.setAttribute('data-slot', 'dropdown-menu-group')
    const title = document.createElement('div')
    title.setAttribute('data-slot', 'dropdown-menu-item')
    const body = document.createElement('div')
    body.setAttribute('data-tokn-body', bucket)
    wrap.appendChild(title)
    wrap.appendChild(body)
    parent.appendChild(wrap)
  }
  let body = wrap.querySelector(':scope > [data-tokn-body]')
  if (!body) {
    body = document.createElement('div')
    body.setAttribute('data-tokn-body', bucket)
    wrap.appendChild(body)
  }
  wrap.style.order = String(ORDER[bucket] * 10)
  const title = wrap.querySelector(':scope > [data-slot="dropdown-menu-item"]')
  // If runtime fleet lanes have not loaded yet, do not render an empty picker.
  // Open the sovereign packages so real models stay selectable.
  const noFleet = !(sniff.lanes || []).length
  const open = searching(root) || expanded === bucket || expanded === 'all' || (noFleet && (bucket === 'global' || bucket === 'allied'))
  paintTitle(title, bucket, open)
  bindTitle(title, bucket)
  hide(wrap, false)
  hide(title, false)
  body.setAttribute('data-tokn-open', open ? '1' : '0')
  return { wrap, body, open }
}

function ensureMetal(root, parent) {
  if (parent && parent.closest && parent.closest('[data-slot="sidebar"]')) return
  let wrap = root.querySelector('[data-tokn-metal-wrap]')
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.setAttribute('data-tokn-metal-wrap', '')
    wrap.setAttribute('data-slot', 'dropdown-menu-group')
    const title = document.createElement('div')
    title.setAttribute('data-slot', 'dropdown-menu-item')
    wrap.appendChild(title)
    parent.appendChild(wrap)
  }
  wrap.style.order = String(ORDER.metal * 10)
  const title = wrap.querySelector(':scope > [data-slot="dropdown-menu-item"]')
  const open = searching(root) || expanded === 'metal' || expanded === 'all'
  paintTitle(title, 'metal', open)
  bindTitle(title, 'metal')
  hide(wrap, false)
  hide(title, false)
  fillMetal(wrap, open)
  pokeSniff()
}

function modelsFromHealth(h) {
  const out = []
  for (const m of h?.models || []) {
    const bytes = Number(m.size_bytes || 0)
    if (bytes > 0 && bytes < 1024) continue
    const size = m.size_human ? ` · ${m.size_human}` : ''
    out.push(`${m.name || m.filename}${size}`)
  }
  return out
}

async function pokeSniff() {
  if (sniffing) return
  const now = Date.now()
  if (now - lastPoke < 15000) return
  lastPoke = now
  sniffing = true
  let full = null
  try {
    const sdk = window.__HERMES_PLUGIN_SDK__
    if (sdk && sdk.host && sdk.host.request) {
      full = await sdk.host.request('config.get', { key: 'full' })
    }
  } catch (_) {}
  const providers = (full && full.providers) || {}
  const lanes = []
  for (const [provider, cfg] of Object.entries(providers)) {
    const models = Array.isArray(cfg && cfg.models) ? cfg.models : []
    for (const id of models) {
      if (!id) continue
      const tier = /media|fal|replicate|seedance/i.test(provider)
        ? 'media'
        : /allied/i.test(provider)
          ? 'allied'
          : /cloud|openrouter/i.test(provider)
            ? 'cloud'
            : 'global'
      lanes.push({
        id,
        provider,
        tier,
        name: PRETTY_MODEL[String(id).toLowerCase()] || id,
      })
    }
  }
  const next = { sitting: [], disk: [], note: '', lanes, loaded: true }
  if (JSON.stringify(next) !== JSON.stringify(sniff)) {
    sniff = next
    rewrite()
  }
  sniffing = false
}

let rewriting = false
let catalogFrozen = false
let wasCatalogOpen = false

function bindSearch(root) {
  const box = root.querySelector('[data-slot="dropdown-menu-search"] input, input')
  if (!box || box.dataset.toknSearch) return
  box.dataset.toknSearch = '1'
  box.addEventListener('input', () => {
    catalogFrozen = false
    rewrite()
  })
}

function rewrite() {
  if (rewriting) return
  rewriting = true
  try {
    rewriteNow()
  } finally {
    rewriting = false
  }
}

// Undo any picker-bucket injection that landed inside the sidebar. The sidebar's
// CRON JOBS section is rendered with the same Radix slots the plugin buckets, and
// a catalog open must never repaint real cron-job rows into sovereign.*.tokn
// stack titles. Restores the rows as plain items and removes wraps/bodies.
function restoreSidebar() {
  try {
    const sb = document.querySelector('[data-slot="sidebar"]')
    if (!sb) return
    for (const wrap of sb.querySelectorAll('[data-tokn-stack-wrap], [data-tokn-metal-wrap]')) {
      const title = wrap.querySelector(':scope > [data-slot="dropdown-menu-item"]')
      if (title) {
        const label = title.querySelector(':scope > [data-tokn-label]')
        const caret = title.querySelector(':scope > [data-tokn-caret]')
        const name = (label && label.textContent) || (title.textContent || '').replace(/›$/, '').trim()
        title.removeAttribute('data-tokn-stack-title')
        title.removeAttribute('data-tokn-open')
        title.removeAttribute('data-tokn-bound')
        title.removeAttribute('data-tokn-org')
        if (label) label.remove()
        if (caret) caret.remove()
        title.textContent = name.replace(/›$/, '').trim()
        title.style.cssText = ''
        wrap.parentElement.insertBefore(title, wrap)
      }
      wrap.remove()
    }
    for (const b of sb.querySelectorAll('[data-tokn-body], [data-tokn-metal-body]')) {
      b.remove()
    }
  } catch (e) {
    /* ignore */
  }
}

function rewriteNow() {
  ensureStyle()
  restoreSidebar()
  reorderSidebar()
  hideBadToknTheme()
  const roots = catalogs()
  if (!roots.length) {
    catalogFrozen = false
    return
  }
  for (const root of roots) {
    if (root.closest && root.closest('[data-slot="sidebar"]')) continue
    bindSearch(root)
    setStickyTop(root)
    const parent = scrollParent(root)
    const y = parent.scrollTop
    const opening = !wasCatalogOpen
    parent.style.display = 'flex'
    parent.style.flexDirection = 'column'

    if (searching(root)) {
      for (const wrap of root.querySelectorAll('[data-tokn-stack-wrap], [data-tokn-metal-wrap]')) {
        hide(wrap, true)
      }
      for (const group of groupsOf(root)) {
        sendHome(group, parent)
        hide(group, false)
        const title = titleOfGroup(group)
        if (title) hide(title, false)
        for (const row of modelRows(group)) hide(row, false)
      }
      rewriteMoa(root, true)
      parent.scrollTop = y
      continue
    }

    const pkgs = {
      cloud: ensurePackage(root, parent, 'cloud'),
      global: ensurePackage(root, parent, 'global'),
      allied: ensurePackage(root, parent, 'allied')
    }
    if ((sniff.lanes || []).some((l) => FLEET_BUCKET(l.tier) === 'media')) {
      pkgs.media = ensurePackage(root, parent, 'media')
    }
    ensureMetal(root, parent)
    fillFleet(root)

    const seenSota = new Set()
    const seenModel = new Set()
    for (const group of groupsOf(root)) {
      const title = titleOfGroup(group)
      if (!title) {
        hide(group, true)
        continue
      }
      rememberNative(title)
      const native = title.getAttribute('data-tokn-native') || rawText(title)
      // POSITIVE: Grok/xAI is never in the picker — not primary, not fallback, not
      // a sota row. The founder's sovereign metal owns the lanes; Grok only ever
      // exists as the x_search backend (x_search.model in config), never a chat default.
      if (/grok|x-ai|\bxai\b|spacex/i.test(native)) {
        hide(group, true)
        hide(title, true)
        continue
      }
      const bucket = bucketOf(native)
      if (bucket === 'hide' || bucket === 'moa' || bucket === 'metal') {
        hide(group, true)
        continue
      }
      if (bucket === 'sota') {
        // Sign: mothership SOTA sits inside sovereign.cloud.tokn with OR off-brands.
        // Bill-direct still rides native anthropic/openai/gemini/xai — not OpenRouter.
        const pkg = pkgs.cloud
        park(group, pkg.body)
        const fp = modelFingerprint(group, title)
        if (fp && seenSota.has(fp)) {
          hide(group, true)
          continue
        }
        if (fp) seenSota.add(fp)
        hide(group, !pkg.open)
        if (!pkg.open) continue
        // Click native disclosure BEFORE paintOrg hides its caret.
        // Freeze-after-first-paint used to swallow the remount, so
        // Anthropic/OpenAI/Gemini stayed headers while Grok (Search) showed 10.
        nativeExpandIfEmpty(title, group)
        const org = orgFromText(native) || orgFromText(fp)
        if (org) {
          hide(title, false)
          paintOrg(title, org)
          group.style.order = String(ORG_RANK[org] || 50)
        } else {
          // Bare "SOTA" header is chrome, not a manufacturer — drop it.
          hide(title, true)
          group.style.order = '50'
        }
        for (const row of modelRows(group)) {
          if (row === title || title.contains(row)) continue
          if (isDroppedModel(rawText(row))) {
            hide(row, true)
            continue
          }
          hide(row, false)
          prettyModel(row)
          const fp = rawText(row).trim().toLowerCase()
          if (fp && seenModel.has(fp)) { hide(row, true); continue }
          if (fp) seenModel.add(fp)
        }
        continue
      }
      if (bucket === 'media' && !pkgs.media) {
        pkgs.media = ensurePackage(root, parent, 'media')
      }
      if (!pkgs[bucket]) {
        hide(group, true)
        continue
      }
      const pkg = pkgs[bucket]
      park(group, pkg.body)
      hide(group, !pkg.open)
      if (!pkg.open) continue

      const isPackageName = /sovereign\.\w+\.tokn/i.test(native)
      if (isPackageName) {
        hide(title, true)
        nativeExpandIfEmpty(title, group)
        injectOrgHeaders(group, title)
      } else {
        hide(title, false)
        const org = orgFromText(native)
        if (org) paintOrg(title, org)
        nativeExpandIfEmpty(title, group)
      }
      let visible = 0
      for (const row of modelRows(group)) {
        if (row === title || row.hasAttribute('data-tokn-stack-title')) continue
        if (row.hasAttribute('data-tokn-org') || row.hasAttribute('data-tokn-injected-org')) continue
        if (title.contains(row)) continue
        if (isDroppedModel(rawText(row))) {
          hide(row, true)
          continue
        }
        hide(row, false)
        prettyModel(row)
        const fp = rawText(row).trim().toLowerCase()
        if (fp && seenModel.has(fp)) { hide(row, true); continue }
        if (fp) seenModel.add(fp)
        visible += 1
      }
      if (!visible && isPackageName) hide(group, true)
    }

    rewriteMoa(root, searching(root))
    mergeDuplicateOrgs(root)
    setStickyTop(root)

    // Extra safety: ensure only one GOOGLE title (in case merge didn't catch all)
    const googleHs = [...root.querySelectorAll('[data-tokn-org="GOOGLE"]')];
    for (let i = 1; i < googleHs.length; i++) {
      googleHs[i].setAttribute('data-tokn-hide', '1');
      googleHs[i].style.display = 'none';
    }

    // Optics-1: native still emits "SOVEREIGN.GLOBAL.TOKN / GLOBAL …" as a group
    // TITLE. Hide that residual title only. Never hide the group, wrap, or
    // model rows — that was evaporating Allied / Global / Metal from the sign.
    for (const group of groupsOf(root)) {
      const title = titleOfGroup(group)
      if (!title) continue
      if (title.hasAttribute('data-tokn-stack-title') || title.hasAttribute('data-tokn-org')) continue
      const t = title.getAttribute('data-tokn-native') || rawText(title)
      if (/sovereign\.(media|global|allied|cloud|metal)\.tokn/i.test(t)) hide(title, true)
    }

    if (opening) {
      const menu = root.closest('[data-slot="dropdown-menu-content"]') || root
      parent.scrollTop = 0
      if (menu) menu.scrollTop = 0
    } else {
      parent.scrollTop = y
    }
  }
  wasCatalogOpen = true
  if (pendingExpand) {
    pendingExpand = false
    catalogFrozen = false
    requestAnimationFrame(rewrite)
    return
  }
  // Freeze only after native fleet groups are actually parked inside a
  // stack wrap. First paint often hits an empty/partial catalog; freezing
  // then leaves ALLIED GEMMA 4 / ALLIED MUSE GLIMMER as top-level chrome
  // (12:55.22 shot) and never paints sovereign.*.tokn.
  let parked = 0
  let looseFleet = 0
  for (const root of catalogs()) {
    parked += root.querySelectorAll('[data-tokn-body] [data-slot="dropdown-menu-group"]').length
    for (const group of groupsOf(root)) {
      const title = titleOfGroup(group)
      const native = (title && (title.getAttribute('data-tokn-native') || rawText(title))) || ''
      const bucket = bucketOf(native)
      if ((bucket === 'media' || bucket === 'allied' || bucket === 'global' || bucket === 'cloud') && !group.closest('[data-tokn-body]')) {
        looseFleet += 1
      }
    }
  }
  catalogFrozen = parked > 0 && looseFleet === 0
}

const FAKE_EFFORT = /\b(extra\s*high|xhigh|max|ultra)\b/i

function openTriggerText() {
  const open = document.querySelector('[data-slot="dropdown-menu-sub-trigger"][data-state="open"]')
  return rawText(open)
}

function isFleetSit(text) {
  const t = String(text || '')
  // Cloud OR z-ai/glm and qwen/* still get Hermes reasoning extra_body.
  if (/z-ai\/|openrouter|qwen\//i.test(t)) return false
  return /GLM[- ]?5\.3|EXL3|Global GLM|deepseek[- ]?v4|Global DeepSeek|Flash-Next|Qwen[- ]?3\.8|Global Qwen|Nemotron|Lightning|Glimmer|Inkling|gemma-4-26b|Allied /i.test(
    t
  )
}

function sanitizeEffort() {
  const fleet = isFleetSit(openTriggerText())
  for (const item of document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]')) {
    const t = rawText(item)
    if (!FAKE_EFFORT.test(t)) continue
    hide(item, fleet)
  }
}

const UNHIDE_KEY = 'tokn.picker.unhide-motherships.v2'
let unhideBusy = false
let unhideStuck = 0

function unhideDone() {
  try {
    return sessionStorage.getItem(UNHIDE_KEY) === '1'
  } catch {
    return false
  }
}

function markUnhideDone() {
  try {
    sessionStorage.setItem(UNHIDE_KEY, '1')
  } catch {
    /* ignore */
  }
}

function unhideToast(r) {
  try {
    const el = document.createElement('div')
    el.textContent = `tokn picker: motherships ${r.flipped} switched on · ${r.already} already on`
    el.style.cssText =
      'position:fixed;right:14px;bottom:14px;z-index:2147483647;background:var(--popover,#1a1a1d);color:var(--foreground,#f0f0f0);border:1px solid var(--border,#333);border-radius:8px;padding:8px 12px;font-size:12px;font-family:inherit;opacity:0;transition:opacity 150ms;pointer-events:none'
    document.body.appendChild(el)
    requestAnimationFrame(() => {
      el.style.opacity = '1'
    })
    setTimeout(() => {
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 250)
    }, 4200)
  } catch {
    /* ignore */
  }
}

function isMothershipHead(text) {
  return /anthropic|openai|google|gemini|gemma|\bxai\b|x-ai|spacex/i.test(String(text || ''))
}

function isMothershipRow(text) {
  return /claude|\bopus\b|\bsonnet\b|\bhaiku\b|\bfable\b|\bgpt-|\bo[134]\b|chatgpt|gemini|gemma|\bgrok\b/i.test(
    String(text || '')
  )
}

function visibilityDialog() {
  for (const el of document.querySelectorAll('[data-slot="dialog-content"], [role="dialog"]')) {
    if (el.querySelector('button[role="switch"], [data-slot="switch"]')) return el
    if (/edit models|customize models|visible models/i.test(rawText(el.querySelector('h2, [data-slot="dialog-title"]')))) {
      return el
    }
  }
  return null
}

function flipMothershipSwitches(dialog) {
  const switches = dialog.querySelectorAll('button[role="switch"], [data-slot="switch"]')
  if (!switches.length) return { ready: false, flipped: 0, already: 0 }
  let flipped = 0
  let already = 0
  let seen = 0
  for (const sw of switches) {
    const label = sw.closest('label') || sw.parentElement
    const block = label && label.parentElement
    const head = rawText(block && block.querySelector('[class*="uppercase"], [class*="tracking"]'))
    const row = rawText(label)
    if (!isMothershipHead(head) && !isMothershipRow(row)) continue
    seen += 1
    const on = sw.getAttribute('data-state') === 'checked' || sw.getAttribute('aria-checked') === 'true'
    if (on) {
      already += 1
      continue
    }
    sw.click()
    flipped += 1
  }
  return { ready: true, flipped, already, seen }
}

function clickEditModels() {
  for (const item of document.querySelectorAll('[data-slot="dropdown-menu-item"]')) {
    if (!/edit models|customize models/i.test(rawText(item))) continue
    item.click()
    return true
  }
  return false
}

function maybeUnhideMotherships() {
  // Dead. Auto-clicking Edit models opened the visibility radios
  // instead of the catalog (operator 2026-09-11). Hide-set is manual
  // Edit models only. Grok is fallback_providers, not a picker click.
  return
}


function reorderSidebar() {
  const items = Array.from(document.querySelectorAll('li'))
  const newItem = items.find((li) => /New session/i.test(li.innerText || ''))
  if (!newItem) return
  const ul = newItem.parentElement
  if (!ul) return
  const signalItem = Array.from(ul.children).find((li) => /Signal/i.test(li.innerText || ''))
  if (!signalItem) return
  if (ul.firstElementChild === newItem && newItem.nextElementSibling === signalItem) return
  ul.insertBefore(newItem, ul.firstElementChild)
  ul.insertBefore(signalItem, newItem.nextElementSibling)
}

function hideBadToknTheme() {
  if (!window.location.hash.includes('settings')) return
  const nodes = Array.from(document.querySelectorAll('*')).filter((e) => e.children.length === 0 && /surface\.tokn skin/i.test(e.textContent || ''))
  for (const n of nodes) {
    const card = n.closest('button,[role="button"],[data-slot="card"],div[class*="rounded"]')
    if (card && card.getAttribute('data-tokn-bad-theme') !== '1') {
      card.setAttribute('data-tokn-bad-theme', '1')
      card.style.display = 'none'
    }
  }
}

function fixSurfaceChrome() {
  if (document.title !== 'surface.tokn') document.title = 'surface.tokn'
  const img = document.querySelector('img[src*="nous-girl"]')
  if (img) {
    const box = img.closest('span')
    ;(box || img).style.display = 'none'
  }
}

function boot() {
  try {
    const k = 'hermes.desktop.visible-models'
    const raw = window.localStorage.getItem(k) || ''
    const hasFleet =
      /custom:|Global Qwen|Glimmer|Inkling|Lightning|sovereign\.(media|cloud|global|allied|metal)|allied/i.test(raw)
    if (raw && !hasFleet) {
      window.localStorage.removeItem(k)
    }
  } catch {}
  ensureStyle()
  restoreSidebar()
  fixSurfaceChrome()
  pokeSniff()
  const obs = new MutationObserver(() => {
    sanitizeEffort()
    restoreSidebar()
    reorderSidebar()
    hideBadToknTheme()
    fixSurfaceChrome()
    if (rewriting) return
    const open = catalogs().length > 0
    if (!open) {
      catalogFrozen = false
      wasCatalogOpen = false
      emptyClicks.clear()
      return
    }
    // Remounted catalog with no stack wraps yet: first-paint freeze would
    // skip rewrite and leave native ALLIED / ANTHROPIC groups.
    if (catalogFrozen) {
      const hasWrap = document.querySelector('[data-tokn-stack-wrap]')
      if (!hasWrap) catalogFrozen = false
    }
    if (catalogFrozen) return
    cancelAnimationFrame(boot.raf)
    boot.raf = requestAnimationFrame(rewrite)
  })
  obs.observe(document.documentElement, { childList: true, subtree: true })
  rewrite()
  sanitizeEffort()
  return () => {
    obs.disconnect()
    cancelAnimationFrame(boot.raf)
  }
}

export default {
  id: 'picker-buckets',
  name: 'tokn picker buckets',
  defaultEnabled: true,
  register(ctx) {
    const stop = boot()
    ctx.onDispose(stop)
  }
}
