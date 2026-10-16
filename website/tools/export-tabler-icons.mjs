// Copyright © 2026 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Writes data/tabler_icons.json: the Tabler outline icons the repository's own pages use (24px grid,
// 2px stroke), in the same shape as data/ttn_icons.json (name → SVG body), which the www platform's
// export-site-nav.mjs generates for the global header/footer. Tabler is the one icon set of
// www.thethingsnetwork.org (brand guidelines "Icons"); render with layouts/partials/icon.html.
//
//   node tools/export-tabler-icons.mjs <path to @iconify-json/tabler/icons.json>
//   e.g. node tools/export-tabler-icons.mjs \
//          ../../../.claude/worktrees/brand-integration/platform/node_modules/@iconify-json/tabler/icons.json
//
// Add a name to ICONS, re-run, and commit data/tabler_icons.json. The output is committed so the Hugo
// build needs no extra dependency.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ICONS = [
  'search',
  'filter',
  'layout-grid',
  'list',
  'chevron-right',
  'mail',
  'broadcast',
  'shield-check',
  'battery-2',
  'map',
  'bolt',
  'download',
  'file-text',
  'code',
  'brand-github',
  'shopping-cart',
  'info-circle',
  'check',
  'external-link',
]

const src = process.argv[2]
if (!src) {
  console.error('usage: node tools/export-tabler-icons.mjs <path to @iconify-json/tabler/icons.json>')
  process.exit(1)
}
const full = JSON.parse(fs.readFileSync(src, 'utf8'))
const out = {}
for (const n of ICONS) {
  const name = full.icons[n] ? n : full.aliases?.[n]?.parent
  if (!name || !full.icons[name]) throw new Error(`unknown Tabler icon: ${n}`)
  out[n] = full.icons[name].body
}
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'tabler_icons.json')
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
console.log(`${ICONS.length} Tabler icons → ${dest}`)
