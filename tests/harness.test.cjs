/**
 * surface.tokn harness.
 *
 * Mirrors the tokn-brand test convention: node:test + Playwright, with
 * routines extracted from plugin sources and exercised in a real page.
 * Browser tests skip when Playwright is not installed so `node --test`
 * always works in CI.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

let chromium = null;
try {
  ({ chromium } = require('playwright'));
} catch {
  chromium = null;
}

const ROOT = path.join(__dirname, '..');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.js') || ent.name.endsWith('.yaml')) out.push(p);
  }
  return out;
}

const PLUGIN_FILES = walk(path.join(ROOT, 'plugins')).filter((p) => p.endsWith('.js'));
const DATA_FILES = [
  ...walk(path.join(ROOT, 'skins')),
  ...walk(path.join(ROOT, 'branding')),
];

const ALLOWED_IMPORTS = new Set([
  '@hermes/plugin-sdk',
  'react',
  'react/jsx-runtime',
]);

const BANNED_WORDS = /\b(billing|ledger|gateway)\b/i;
const BANNED_KEYS = /\b(api_key|apikey|connection\.json)\b/i;
const BANNED_LAN = /127\.0\.0\.1|\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

test('every plugin exports a valid HermesPlugin shape', () => {
  assert.ok(PLUGIN_FILES.length >= 3, 'expected template plus examples');
  for (const file of PLUGIN_FILES) {
    const source = fs.readFileSync(file, 'utf8');
    const block = source.match(/export\s+default\s*\{[\s\S]*?\n\}/);
    assert.ok(block, `${file} must have a default export object`);
    assert.match(block[0], /id:\s*['"][^'"]+['"]/, `${file} default export needs id`);
    assert.match(block[0], /register\s*\(/, `${file} default export needs register(ctx)`);
    assert.match(block[0], /name:\s*['"]/, `${file} default export needs name`);
  }
});

test('plugins import only the allowlist', () => {
  for (const file of PLUGIN_FILES) {
    const source = fs.readFileSync(file, 'utf8');
    const imports = source.match(/^\s*import\b[^\n]*/gm) || [];
    for (const stmt of imports) {
      const m = stmt.match(/from\s+['"]([^'"]+)['"]/);
      assert.ok(m, `unparseable import in ${file}: ${stmt}`);
      assert.ok(
        ALLOWED_IMPORTS.has(m[1]),
        `${file} imports ${m[1]} which is not on the allowlist`
      );
    }
  }
});

test('plugins, skins, and branding contain no banned content', () => {
  const targets = [...PLUGIN_FILES, ...DATA_FILES];
  assert.ok(targets.length > 0, 'expected files to scan');
  for (const file of targets) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, BANNED_WORDS, `${file} mentions a banned identifier`);
    assert.doesNotMatch(source, BANNED_KEYS, `${file} mentions a key or connection store`);
    assert.doesNotMatch(source, BANNED_LAN, `${file} mentions a LAN address`);
  }
});

test(
  'welcome-pane fillComposer fills the composer input',
  { skip: chromium ? false : 'playwright not installed' },
  async () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'plugins/examples/welcome-pane/plugin.js'),
      'utf8'
    );
    const routine = source.match(/function fillComposer\(text\) \{[\s\S]*?\n\}/)[0];
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });
    try {
      const page = await browser.newPage();
      await page.setContent('<html><body><main><textarea></textarea></main></body></html>');
      await page.evaluate(`(() => { ${routine} fillComposer('hello there'); })()`);
      const value = await page.evaluate(() => document.querySelector('textarea').value);
      assert.equal(value, 'hello there');
    } finally {
      await browser.close();
    }
  }
);

test(
  'armorup-profile degrades gracefully and maps a good payload',
  { skip: chromium ? false : 'playwright not installed' },
  async () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'plugins/examples/armorup-profile/plugin.js'),
      'utf8'
    );
    const routine = source.match(/export function armorUpDisplay\(data\) \{[\s\S]*?\n\}/)[0];
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });
    try {
      const page = await browser.newPage();
      await page.setContent('<html><body></body></html>');
      const result = await page.evaluate(`
        (() => {
          ${routine.replace('export function', 'function')}
          return {
            bad: armorUpDisplay(null),
            badShape: armorUpDisplay({ achievements: 'nope' }),
            good: armorUpDisplay({
              achievements: { points: 71.42, tier: 'Gold', rank: 'operator' },
              unlocks: [{ name: 'First prompt' }],
              scan: { total: 12, unlocked: 3 },
            }),
          };
        })()
      `);
      assert.equal(result.bad.state, 'unavailable');
      assert.equal(result.badShape.state, 'unavailable');
      assert.equal(result.good.state, 'ok');
      assert.equal(result.good.tier, 'Gold');
      assert.equal(result.good.points, 71.42);
      assert.equal(result.good.unlocks.length, 1);
    } finally {
      await browser.close();
    }
  }
);
