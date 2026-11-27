#!/usr/bin/env node
/**
 * tools/check_openings.js — Automatic audit for full window/interior implementations.
 *
 * Verifies on a built Vernacular/Vassal kit page (e.g. kits/marr/dist/marr.html):
 *   1. RUNTIME_ERR: Zero exceptions or reportErr() calls when placing every matching VERN.def.
 *   2. VOID_ITEM:   Zero instances of legacy dark-void or opaque-glass kit items
 *                   (vHole, vRoomB, maRoomB, maHalfD, maDiscD, vWinGlass, maHalfP, maHalfW).
 *   3. UNCUT_WALL:  Inward raycast from every placed window pane (vWinClear, vWinLit, maHalfG,
 *                   maHalfL, maDiscG, maDiscL) verifies no uncut wall slab or shallow dark
 *                   backing card blocks the opening within [0.08 m, 0.42 m] behind the glass.
 *   4. BLIND_BODY:  Every hollow body (VHOLLOW.jobs with h >= 1.8 m and max(w, d) >= 2.2 m)
 *                   has at least one cut opening in B.ops.
 *
 * Usage:
 *   node tools/check_openings.js kits/marr/dist/marr.html [--prefix mar_]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.dirname(__dirname);
const args = process.argv.slice(2);
let htmlPath = 'kits/marr/dist/marr.html';
let prefix = 'mar_';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--prefix' && args[i + 1]) { prefix = args[++i]; }
  else if (args[i] === '--all') { prefix = ''; }
  else if (!args[i].startsWith('-')) { htmlPath = args[i]; }
}

const absHtml = path.isAbsolute(htmlPath) ? htmlPath : path.join(ROOT, htmlPath);
if (!fs.existsSync(absHtml)) {
  console.error('check_openings: file not found:', absHtml);
  process.exit(1);
}

const threeCandidates = [
  path.join(ROOT, 'kits/port/three.min.js'),
  path.join(ROOT, 'settlements/iziz/three.min.js'),
  path.join(ROOT, 'host/WorldMenagerie/vendor/three/three.min.js')
];
const threePath = threeCandidates.find(p => fs.existsSync(p));
if (!threePath) {
  console.error('check_openings: three.min.js not found');
  process.exit(1);
}

const threeSrc = fs.readFileSync(threePath, 'utf8');
const html = fs.readFileSync(absHtml, 'utf8');
const scripts = (html.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map(s => s.replace(/^<script>|<\/script>$/g, ''));
if (!scripts.length) {
  console.error('check_openings: no inline <script> found in', htmlPath);
  process.exit(1);
}
const mainScript = scripts[scripts.length - 1];
const cutIdx = mainScript.indexOf('const renderer=');
const defsScript = cutIdx > 0 ? mainScript.slice(0, cutIdx) : mainScript;

const noop = () => {};
const ctxProxy = new Proxy({
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  createImageData: () => ({ data: new Uint8ClampedArray(4) }),
  measureText: () => ({ width: 0 }),
  createLinearGradient: () => ({ addColorStop: noop }),
  createRadialGradient: () => ({ addColorStop: noop }),
}, {
  get(t, p) { return p in t ? t[p] : noop; }
});
const makeEl = () => ({
  style: {}, classList: { add: noop, remove: noop, toggle: noop },
  appendChild: noop, removeChild: noop, setAttribute: noop, addEventListener: noop,
  getContext: () => ctxProxy,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
  innerHTML: '', textContent: '', value: ''
});

const reportedErrs = [];
const sandbox = {
  innerWidth: 1280, innerHeight: 800, addEventListener: noop, devicePixelRatio: 1,
  location: { search: '', protocol: 'http:' },
  document: {
    write: noop,
    getElementById: () => makeEl(),
    createElement: () => makeEl(),
    createElementNS: () => makeEl(),
    querySelectorAll: () => [],
    querySelector: () => makeEl(),
    body: makeEl(),
    addEventListener: noop
  },
  console: { log: noop, warn: noop, error: console.error },
  Math, Date, Array, Object, String, Number, Boolean, RegExp, Map, Set, WeakMap, WeakSet,
  Float32Array, Float64Array, Int32Array, Uint32Array, Uint16Array, Uint8Array, Uint8ClampedArray,
  Error, TypeError, ReferenceError, SyntaxError, JSON, parseInt, parseFloat, isNaN, isFinite, Infinity, NaN, undefined,
  URLSearchParams, URL,
  Image: class Image { constructor() { this.width = 64; this.height = 64; } set src(v) { this._src = v; if (this.onload) this.onload(); } get src() { return this._src || ''; } },
  requestAnimationFrame: noop, setTimeout: noop, clearTimeout: noop,
  performance: { now: () => 0 }
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.top = sandbox;
sandbox._reportedErrs = reportedErrs;
vm.createContext(sandbox);

try {
  vm.runInContext(threeSrc, sandbox, { displayErrors: false });
  for (let i = 0; i < scripts.length - 1; i++) {
    if (!scripts[i].includes('document.write')) {
      vm.runInContext(scripts[i], sandbox, { displayErrors: false });
    }
  }
  vm.runInContext(
    defsScript +
    '\n;window.CITY = false; reportErr = function(ctx, e) { globalThis._reportedErrs.push({ctx, msg: e && e.message || String(e)}); };' +
    'globalThis._VERN = VERN; globalThis._KIT = KIT; globalThis._VHOLLOW = typeof VHOLLOW !== "undefined" ? VHOLLOW : {jobs:[]};',
    sandbox,
    { displayErrors: false }
  );
} catch (e) {
  console.error('check_openings INIT FAIL:', e.message);
  process.exit(1);
}

const VERN = sandbox._VERN;
const KIT = sandbox._KIT;
const VHOLLOW = sandbox._VHOLLOW;
const THREE = sandbox.THREE;

const keys = Object.keys(VERN.defs).filter(k => !prefix || k.startsWith(prefix));
if (!keys.length) {
  console.error('check_openings: no VERN.defs matching prefix', JSON.stringify(prefix));
  process.exit(1);
}

const VOID_ITEMS = ['vHole', 'vRoomB', 'maRoomB', 'maHalfD', 'maDiscD', 'vWinGlass', 'maHalfP', 'maHalfW'];
const GLASS_ITEMS = ['vWinClear', 'vWinLit', 'maHalfG', 'maHalfL', 'maDiscG', 'maDiscL'];
const WALL_ITEMS = ['vPlaster', 'vStone', 'vBrick', 'vStucco', 'vTapia', 'vCoral', 'vTileAz', 'vWood'];

const failures = [];
const scene = new THREE.Group();
let totalGlass = 0;
let totalHollow = 0;
let totalOps = 0;
const euler = new THREE.Euler();

// Point-in-OBB check for ray samples against solid wall/backing boxes
function pointInBox(px, py, pz, box, pad) {
  const dy = py - box.p[1];
  if (Math.abs(dy) > box.s[1] * 0.5 - pad) return false;
  const dx = px - box.p[0];
  const dz = pz - box.p[2];
  euler.setFromQuaternion(box.q, 'YXZ');
  const ry = euler.y;
  const c = Math.cos(ry), s = Math.sin(ry);
  const lx = dx * c - dz * s;
  const lz = dx * s + dz * c;
  const padX = box.s[0] < box.s[2] ? -0.04 : pad;
  const padZ = box.s[2] < box.s[0] ? -0.04 : pad;
  return Math.abs(lx) < box.s[0] * 0.5 - padX && Math.abs(lz) < box.s[2] * 0.5 - padZ;
}

for (const k of keys) {
  const startCounts = {};
  for (const name of [...VOID_ITEMS, ...GLASS_ITEMS, ...WALL_ITEMS]) {
    startCounts[name] = (KIT.items[name] || []).length;
  }
  const j0 = VHOLLOW.jobs.length;
  const err0 = reportedErrs.length;

  try {
    VERN.place(scene, k, 0, 0, 0, { v: 0 });
  } catch (e) {
    failures.push(`${k}: RUNTIME_ERR exception: ${e.message}`);
    continue;
  }
  for (let ei = err0; ei < reportedErrs.length; ei++) {
    failures.push(`${k}: RUNTIME_ERR reportErr(${reportedErrs[ei].ctx}): ${reportedErrs[ei].msg}`);
  }

  // 1. Check VOID_ITEM
  for (const vName of VOID_ITEMS) {
    const n = (KIT.items[vName] || []).length - startCounts[vName];
    if (n > 0) {
      failures.push(`${k}: VOID_ITEM emitted ${n} instance(s) of banned dark-void/opaque item '${vName}'`);
    }
  }

  // 2. Check BLIND_BODY on hollow jobs added by this placement
  for (let ji = j0; ji < VHOLLOW.jobs.length; ji++) {
    const b = VHOLLOW.jobs[ji];
    totalHollow++;
    const ops = b.ops || [];
    totalOps += ops.length;
    const h = b.h != null ? b.h : (b.y1 != null && b.y0 != null ? b.y1 - b.y0 : 0);
    if (ops.length === 0 && h >= 1.8 && Math.max(b.w || 0, b.d || 0) >= 2.2) {
      failures.push(`${k}: BLIND_BODY hollow body #${ji - j0} (${b.w}x${b.d}m) has 0 cut openings in ops`);
    }
  }

  // Collect dark backing cards (width >= 0.45m, thickness <= 0.12m, lum < 0.045)
  // and solid wall slabs (width >= 1.0m, thickness >= 0.18m, height >= 1.0m)
  const darkCards = [];
  const wallSlabs = [];
  for (const wName of WALL_ITEMS) {
    const arr = KIT.items[wName] || [];
    for (let i = startCounts[wName]; i < arr.length; i++) {
      const it = arr[i];
      if (!it) continue;
      const minDim = Math.min(it.s[0], it.s[2]);
      const maxDim = Math.max(it.s[0], it.s[2]);
      if (it.c) {
        const lum = 0.2126 * it.c.r + 0.7152 * it.c.g + 0.0722 * it.c.b;
        if (lum < 0.045 && minDim <= 0.12 && maxDim >= 0.45 && it.s[1] >= 0.5) {
          darkCards.push({ wName, box: it, lum });
        }
      }
      if (wName !== 'vWood' && minDim >= 0.18 && maxDim >= 0.45 && it.s[1] >= 0.8) {
        wallSlabs.push({ wName, box: it });
      }
    }
  }

  // 3. Check inward ray from each glass pane against dark backing cards and uncut wall slabs
  for (const gName of GLASS_ITEMS) {
    const arr = KIT.items[gName] || [];
    for (let i = startCounts[gName]; i < arr.length; i++) {
      const g = arr[i];
      if (!g) continue;
      totalGlass++;
      euler.setFromQuaternion(g.q, 'YXZ');
      const ry = euler.y;
      const nx = Math.sin(ry), nz = Math.cos(ry);
      for (const d of [0.04, 0.10, 0.18]) {
        const rx = g.p[0] - nx * d;
        const ryPt = g.p[1];
        const rz = g.p[2] - nz * d;
        for (const dc of darkCards) {
          if (pointInBox(rx, ryPt, rz, dc.box, -0.02)) {
            failures.push(`${k}: SHALLOW_DARK_CARD '${dc.wName}' (lum=${dc.lum.toFixed(3)}) sits ${d.toFixed(2)}m behind '${gName}' at (${g.p.map(v => v.toFixed(1)).join(',')})`);
            break;
          }
        }
      }
      // Check if the center of the glass pane sits inside an uncut masonry/plaster wall slab
      for (const ws of wallSlabs) {
        if (pointInBox(g.p[0], g.p[1], g.p[2], ws.box, 0.12)) {
          failures.push(`${k}: UNCUT_WALL '${ws.wName}' slab (${ws.box.s.map(v => v.toFixed(1)).join('x')}) encloses '${gName}' at (${g.p.map(v => v.toFixed(1)).join(',')})`);
          break;
        }
      }
    }
  }
}

if (failures.length) {
  console.error(`check_openings FAIL (${failures.length} issue(s) across ${keys.length} defs in ${htmlPath}):`);
  for (const f of failures.slice(0, 25)) console.error('  - ' + f);
  process.exit(1);
}

console.log(`check_openings OK  ${path.relative(ROOT, absHtml)} (${keys.length} defs, ${totalGlass} glass panes, ${totalHollow} hollow bodies, ${totalOps} cut ops, 0 dark voids)`);
