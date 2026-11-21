#!/usr/bin/env python3
"""openworld/oidong-highrift as Godot's one-world case (GODOT-PLAN.md section 8, M7; the owner, 2026-11-16: "set up
oidong/high rift/strongbow as a godot test to fulfill the multi settlement godot plan step").

    python3 tools/harness.py lock -- python3 openworld/oidong-highrift/tools/godot_case.py [--only flora|chunks|places|monastery|arcology|index]

Writes godot/data/world-oidong-highrift/ from the built page (dist/oidong-highrift.html, with core/export and core/world
94 in it) and the baked plan (plan/sites.json):
  flora/         shared 3D Hero (lv=2), Mid (lv=1), and Sapling ('s') flora prototype library (world.json, world.glb,
                 tex/, protos.json) for Godot's dual-LOD StreamFlora across the 450 km valley
  chunks/<id>/   the ground streamed: a CHUNK-metre cell of the region's grid on every cell the Sultanate's road from
                 Longsong to Strongbow passes within MARGIN of (plus surrounding cells at every site and the terminal
                 escarpment / cataract), each a krator-world box with terrain (WORLD.H every STEP metres, PBR surface
                 maps, probes), registry cropped to it, and flora.json (krator-chunk-flora placements outside places)
  places/<site>/ each site at 1:1: a lattice-snapped box round its pin, the page's camera settled across its villages/
                 canyon/cataract, every section core/export fills (Xanadu & Order pieces as buckets, bridges and Hero/Mid
                 3D flora as items, materials and maps, terrain every PLACE_STEP metres, water, registry); Strongbow
                 carries `arcology` (places/sfgtxw10kr-arcology) and Longsong carries `monastery` (places/sq80bzd7ep-monastery)
  index.json     krator-world-stream: the region, the plan's hash, the chunk grid and each chunk's box and case, each
                 place's site, pin, box and case, every road (the links and the villages' roads: their points and bridge
                 spans) and the route the test walks (Longsong to Strongbow)
The sim's week is openworld/oidong-highrift/tools/export-sim.js (sim.json, golden.json in the same folder).
Deterministic: the same page and plan write the same files (the exports' own dates aside)."""
import asyncio, base64, json, math, os, shutil, struct, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
REGION_DIR = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(REGION_DIR, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))

PAGE = 'openworld/oidong-highrift/dist/oidong-highrift.html'
OUT = os.path.join(ROOT, 'godot', 'data', 'world-oidong-highrift')
ROUTE = ('sq80bzd7ep', 'sfgtxw10kr')   # Longsong to Strongbow, the Sultanate's road down the valley
CHUNK, STEP, MARGIN = 16000, 64, 2000   # metres: a streamed cell, its ground's grid, the reach of the road into a cell
MARGIN_SITE = 8000                      # metres: surrounding chunk reach around off-route High Rift sites
PLACE, PLACE_STEP = 1600, 8             # metres: default place square round its pin, its ground's grid
# Custom lattice-snapped boxes (exact multiples of STEP = 64):
# - sfgtxw10kr (Strongbow): covers Strongbow's face/canyon, midway cliff, AND the 1,166 m Rīfar al-Jadwal Great Cataract (4,480 x 7,168 m)
# - sq80bzd7ep (Longsong): covers Longsong pin + Shar + Nub + Dzo-ling + the Biruk al-Ghaym river bridge (2,432 x 2,432 m)
SITE_BOXES = {
    'sfgtxw10kr': [-612672, -77824, -608192, -70656],
    'sq80bzd7ep': [-155456, -26752, -153024, -24320],
}
# Export all 5 sites at full architectural detail (Xanadu & Order monastery kits + High Rift / Oidong floor and flora)
FULL_PLACES = ('sq80bzd7ep', 'sfgtxw10kr', 'ssinggjar01', 'smirrorgrange01', 'scaldronhouse01')
MASS_CAM = 4600                               # metres: the camera's distance from a massing place's centre (past 88s FULL_V)
# Strongbow's arcology (the owner, 2026-11-16: "Yes, far detail"): kits/ancients' strongbow-today page
ARCOLOGY = {'site': 'sfgtxw10kr', 'page': 'kits/ancients/dist/strongbow-today.html', 'case': 'places/sfgtxw10kr-arcology',
            'ry': -math.pi / 2, 'box': [-3000, -3000, 3000, 3000],
            'root': os.environ.get('KRATOR_STRONGBOW') or os.path.normpath(os.path.join(ROOT, '..', 'keen-swanson-68a311'))}
# Longsong Monastery (settlements/longsong): Order monastery on the granite knoll above the Biruk al-Ghaym south bank
MONASTERY = {'site': 'sq80bzd7ep', 'page': 'settlements/longsong/dist/longsong.html', 'case': 'places/sq80bzd7ep-monastery',
             'ry': -28.6275 * math.pi / 180.0, 'box': [-356, -292, 336, 264]}


def plan():
    with open(os.path.join(REGION_DIR, 'plan', 'sites.json'), encoding='utf-8') as f:
        return json.load(f)


def link(P, a, b):
    for L in P['links']:
        if (L['from'], L['to']) in ((a, b), (b, a)):
            return L
    sys.exit('godot_case: no link %s - %s in the plan' % (a, b))


def cells_along(pts):
    """the chunk cells (i, j) the road passes within MARGIN of, in the order it reaches them"""
    seen, order = set(), []
    for k in range(len(pts) - 1):
        (x0, z0), (x1, z1) = pts[k][:2], pts[k + 1][:2]
        n = max(1, int(math.hypot(x1 - x0, z1 - z0) // 250))
        for s in range(n + 1):
            x, z = x0 + (x1 - x0) * s / n, z0 + (z1 - z0) * s / n
            for dx in (-MARGIN, 0, MARGIN):
                for dz in (-MARGIN, 0, MARGIN):
                    c = (math.floor((x + dx) / CHUNK), math.floor((z + dz) / CHUNK))
                    if c not in seen:
                        seen.add(c)
                        order.append(c)
    return order


def cells_with_sites(route_cells, P):
    """route_cells plus eastbound High Rift road links, surrounding 16 km chunks around all sites, and Strongbow's escarpment"""
    seen = set(route_cells)
    order = list(route_cells)
    for L in P.get('links') or []:
        for c in cells_along(L['pts']):
            if c not in seen:
                seen.add(c)
                order.append(c)
    for S in P['sites']:
        sx, sz = S['x'], S['z']
        for dx in (-MARGIN_SITE, 0, MARGIN_SITE):
            for dz in (-MARGIN_SITE, 0, MARGIN_SITE):
                c = (math.floor((sx + dx) / CHUNK), math.floor((sz + dz) / CHUNK))
                if c not in seen:
                    seen.add(c)
                    order.append(c)
    # Ensure continuous escarpment & lower canyon coverage north/south of Strongbow & Rīfar al-Jadwal
    for extra in ((-39, -6), (-38, -6), (-39, -4), (-38, -4)):
        if extra not in seen:
            seen.add(extra)
            order.append(extra)
    return order


def cid(c):
    return 'c%+04d%+04d' % c


def parse_micro(argv):
    for i, a in enumerate(argv):
        if a.startswith('--micro='):
            return int(a.split('=', 1)[1])
        if a == '--micro' and i + 1 < len(argv):
            return int(argv[i + 1])
    return None


def export(out, box, before, sections=None, micro=None, page_rel=PAGE):
    cmd = [sys.executable, os.path.join(ROOT, 'tools', 'harness.py'), 'export', page_rel, '--out', out,
           '--box=' + ','.join('%g' % v for v in box)]
    if before:
        cmd += ['--before', before]
    if micro is not None:
        cmd += ['--query', '?micro=%d' % micro]
    if sections:
        cmd += ['--sections', sections]
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
    tail = [l for l in r.stdout.splitlines() if l.startswith(('exported', 'sections', 'FAILED', 'wrote'))]
    print('  ' + os.path.relpath(out, ROOT).replace(os.sep, '/') + ': ' + ' | '.join(t[:160] for t in tail), flush=True)
    if r.returncode:
        sys.exit('godot_case: the export of %s failed\n%s\n%s' % (out, r.stdout[-2000:], r.stderr[-2000:]))
    for l in r.stdout.splitlines():   # what --before returned (harness.py prints it, cut at 300 characters)
        if l.startswith('before: '):
            try:
                return json.loads(l[8:])
            except ValueError:
                return None
    return None


def _copy_library_packs(H, w, page_abs, out_dir):
    packs = sorted({t['pack'] for t in w.get('textures', []) if t.get('from') == 'library'})
    if not packs:
        return 0
    dst = os.path.join(out_dir, 'tex')
    shutil.rmtree(dst, ignore_errors=True)
    os.makedirs(dst, exist_ok=True)
    copied = {}
    for name in packs:
        fams = {t['family'] for t in w['textures'] if t.get('pack') == name}
        src = H._pack_dir(name, page_abs, fams)
        if not src:
            sys.exit('godot_case: no tex/pack.json for library pack %s' % name)
        with open(os.path.join(src, 'pack.json'), encoding='utf-8') as f:
            pj = json.load(f)
        rename = {}
        for fam in sorted(fams):
            for fn in sorted(set(pj['families'].get(fam, {}).get('files', {}).values())):
                to = fn
                if fn in copied and copied[fn] != name:
                    to = rename[fn] = name + '.' + fn
                copied[to] = name
                shutil.copyfile(os.path.join(src, fn), os.path.join(dst, to))
        pjo = os.path.join(dst, 'pack.json' if len(packs) == 1 else name + '.pack.json')
        if rename:
            for e in pj['families'].values():
                e['files'] = {k: rename.get(v, v) for k, v in e.get('files', {}).items()}
            with open(pjo, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(pj, f, indent=1, sort_keys=True)
        else:
            shutil.copyfile(os.path.join(src, 'pack.json'), pjo)
    return sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst))


FLORA_LIB_JS = """([opt]) => {
  const protos = window.WORLD_EXPORT.prepareFloraLib();
  """ + """const KUID = w => (typeof KTAGS === 'undefined' || !KTAGS) ? null : !w.origin ? KTAGS.uid
    : (c, k, at) => KTAGS.uid(c, k, [at[0] + w.origin[0], at[1] + w.origin[1], at[2] + w.origin[2]]);""" + """
  const w = EXPORT.world(opt);
  const chk = EXPORT.check(w, { uid: KUID(w) });
  const g = EXPORT.glb(w);
  if (typeof FLORA !== 'undefined' && FLORA && FLORA.pools) {
    for (const p of FLORA.pools.values()) { p.n = 0; for (const m of p.meshes) { m.count = 0; m.visible = false; } }
  }
  window.WORLD_EXPORT.floraLibOnly = false;
  window.WORLD_EXPORT.origin = null;
  return { protos, world: g.json, glb: EXPORT.pack(g.glb).b64, glbStats: g.stats, check: chk };
}"""


async def _export_flora_lib_async(out_dir, micro=None):
    import harness as H
    from playwright.async_api import async_playwright
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir, exist_ok=True)
    q = ('?micro=%d' % micro) if micro is not None else ''
    page_abs = os.path.join(ROOT, PAGE)
    async with async_playwright() as p:
        b = await H.launch_chromium(p)
        with H.serve(ROOT) as port:
            pg, errs, ready = await H.open_page(b, page_abs, port, size='960x600', root=ROOT, query=q, init=[H.STAGE_HOOK])
            if not ready:
                sys.exit('godot_case: page never ready during flora library export')
            await pg.wait_for_function('!window._texPending', timeout=180000)
            injected = await H.inject_export(pg)
            opt = {'box': [-16, -16, 16, 16], 'sections': ['items', 'materials', 'textures', 'registry']}
            res = await H.evaluate_big(pg, FLORA_LIB_JS, [opt])
            await pg.close()
        await b.close()
    protos_doc = res['protos']
    w = res['world']
    if errs or w.get('errors') or not res['check']['ok'] or not w.get('items'):
        sys.exit('godot_case: flora library export failed: items=%d errs=%r world_errors=%r problems=%r'
                 % (len(w.get('items', [])), errs[:3], w.get('errors'), res['check']['problems'][:5]))
    files = {}
    with open(os.path.join(out_dir, 'world.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(w, f, separators=(',', ':'))
    files['world.json'] = os.path.getsize(os.path.join(out_dir, 'world.json'))
    with open(os.path.join(out_dir, 'world.glb'), 'wb') as f:
        f.write(base64.b64decode(res['glb']))
    files['world.glb'] = os.path.getsize(os.path.join(out_dir, 'world.glb'))
    with open(os.path.join(out_dir, 'protos.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(protos_doc, f, separators=(',', ':'))
    files['protos.json'] = os.path.getsize(os.path.join(out_dir, 'protos.json'))
    tex_sz = _copy_library_packs(H, w, page_abs, out_dir)
    if tex_sz:
        files['tex/'] = tex_sz
    meta = {'case': 'flora', 'page': PAGE, 'kind': 'flora-lib', 'route': 'WORLD_EXPORT.prepareFloraLib (core/export)',
            'box': [-16, -16, 16, 16], 'sections': w['sections'], 'files': files, 'injected': injected,
            'stats': w['stats'], 'glb': res.get('glbStats'), 'check': res['check']['joins'],
            'protos': len(protos_doc.get('protos', [])), 'page_errors': [], 'exported': time.strftime('%Y-%m-%d')}
    with open(os.path.join(out_dir, 'meta.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(meta, f, separators=(',', ':'))
    print('  %s: %d 3D prototypes (hero+mid+sapling), %d items, %.1f MB glb' % (
        os.path.relpath(out_dir, ROOT).replace(os.sep, '/'), len(protos_doc.get('protos', [])),
        len(w.get('items', [])), files['world.glb'] / 1e6), flush=True)


async def _export_places_batch_async(pl, out_root, micro=None):
    import harness as H
    from playwright.async_api import async_playwright
    q = ('?micro=%d' % micro) if micro is not None else ''
    page_abs = os.path.join(ROOT, PAGE)
    async with async_playwright() as p:
        b = await H.launch_chromium(p)
        with H.serve(ROOT) as port:
            pg, errs, ready = await H.open_page(b, page_abs, port, size='960x600', root=ROOT, query=q, init=[H.STAGE_HOOK])
            if not ready:
                sys.exit('godot_case: page never ready during places export')
            await pg.wait_for_function('!window._texPending', timeout=180000)
            injected = await H.inject_export(pg)
            await pg.evaluate('() => { window.requestAnimationFrame = () => 0; }')
            for p_info in pl:
                box = p_info['box']
                p_info['detail'] = 'full' if p_info['id'] in FULL_PLACES else 'massing'
                before_js = place_before_js(p_info)
                await pg.evaluate('() => { window.WORLD_EXPORT.floraLibOnly = false; window.WORLD_EXPORT.floraAnchors = null; window.WORLD_EXPORT.origin = null; window.WORLD_EXPORT.water = true; }')
                cut = await pg.evaluate(before_js)
                t1 = time.time()
                res = await H.evaluate_big(pg, H.EXPORT_JS, [{'box': list(box), 'sky': 64}, True])
                w = res['world']
                chk = res['check']
                if errs or w.get('errors') or not chk['ok']:
                    sys.exit('godot_case: place %s failed: errs=%r world_errors=%r problems=%r'
                             % (p_info['id'], errs[:3], w.get('errors'), chk['problems'][:5]))
                d = os.path.join(out_root, 'places', p_info['id'])
                shutil.rmtree(d, ignore_errors=True)
                os.makedirs(d, exist_ok=True)
                files = {}
                with open(os.path.join(d, 'world.json'), 'w', encoding='utf-8', newline='\n') as f:
                    json.dump(w, f, separators=(',', ':'))
                files['world.json'] = os.path.getsize(os.path.join(d, 'world.json'))
                with open(os.path.join(d, 'world.glb'), 'wb') as f:
                    f.write(base64.b64decode(res['glb']))
                files['world.glb'] = os.path.getsize(os.path.join(d, 'world.glb'))
                tex_sz = _copy_library_packs(H, w, page_abs, d)
                if tex_sz:
                    files['tex/'] = tex_sz
                if p_info['id'] == ARCOLOGY['site'] and cut:
                    with open(os.path.join(d, 'cut.json'), 'w', encoding='utf-8', newline='\n') as f:
                        json.dump(cut, f, separators=(',', ':'))
                meta = {'case': p_info['id'], 'page': PAGE, 'kind': 'world', 'route': 'godot_case.py batched places (core/export)',
                        'box': list(box), 'sections': w['sections'], 'files': files, 'injected': injected,
                        'stats': w['stats'], 'glb': res.get('glbStats'), 'check': chk['joins'],
                        'page_errors': [], 'exported': time.strftime('%Y-%m-%d')}
                with open(os.path.join(d, 'meta.json'), 'w', encoding='utf-8', newline='\n') as f:
                    json.dump(meta, f, separators=(',', ':'))
                print('  places/%s: %.1f s | %s | %.1f MB glb' % (
                    p_info['id'], time.time() - t1, json.dumps(w['stats']), files['world.glb'] / 1e6), flush=True)
            await pg.close()
        await b.close()


NODE_CHUNK_SHIM = r"""
const fs = require('fs'), path = require('path');
function makeCtx2D() {
  return new Proxy({
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    measureText: () => ({ width: 20 }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  }, { get: (t, k) => (k in t ? t[k] : () => {}) });
}
function makeEl(tag) {
  const st = {}, cl = { add() {}, remove() {}, toggle() {}, contains: () => false };
  return new Proxy({
    tagName: String(tag || 'DIV').toUpperCase(), style: st, classList: cl, children: [], dataset: {},
    width: 256, height: 256, value: '', textContent: '', innerHTML: '',
    getContext: () => makeCtx2D(), appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, setAttribute() {}, getAttribute: () => null, addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }),
    querySelectorAll: () => [], querySelector: () => null, select() {},
  }, { get: (t, k) => (k in t ? t[k] : () => {}) });
}
globalThis.window = globalThis;
globalThis.self = globalThis;
globalThis.innerWidth = 960; globalThis.innerHeight = 600; globalThis.devicePixelRatio = 1;
globalThis.location = { protocol: 'http:', search: globalThis.__KRATOR_QUERY || '', href: 'http://localhost/' };
globalThis.navigator = { clipboard: { writeText: async () => {} }, userAgent: 'node' };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
globalThis.reportErr = (m) => { console.error('PAGE_ERR:', m); };
const _els = new Map();
globalThis.document = {
  body: makeEl('body'), head: makeEl('head'), documentElement: makeEl('html'),
  getElementById(id) { if (!_els.has(id)) _els.set(id, makeEl('div')); return _els.get(id); },
  createElement(tag) { return makeEl(tag); },
  querySelector: () => makeEl('div'), querySelectorAll: () => [], addEventListener() {},
};
globalThis.Image = class { set src(_v) { if (this.onload) Promise.resolve().then(() => this.onload()); } };
globalThis.HTMLCanvasElement = class {};
"""


def _flora_corridor_pts(P):
    pts = []
    for L in (P.get('links') or []):
        rpts = L.get('pts', [])
        step_k = max(1, len(rpts) // 800)
        for k in range(0, len(rpts), step_k):
            pts.append([round(rpts[k][0], 1), round(rpts[k][1], 1)])
    for S in P.get('sites', []):
        pts.append([round(S['x'], 1), round(S['z'], 1)])
        for r in S.get('roads') or []:
            for p in (r.get('pts') or [])[::4]:
                pts.append([round(p[0], 1), round(p[1], 1)])
    for cz in range(-84000, -66000, 1200):
        pts.append([-612000.0, float(cz)])
        pts.append([-614500.0, float(cz)])
    return pts


def _export_chunks_node(cells, place_boxes, out_root, P, micro=None, prune=True, resume=False):
    import re, tempfile
    sys.path.insert(0, os.path.join(ROOT, 'core', 'world'))
    import world_data as WD
    chunks_dir = os.path.join(out_root, 'chunks')
    os.makedirs(chunks_dir, exist_ok=True)
    if prune:
        expected = {cid(c) for c in cells}
        for old_nm in os.listdir(chunks_dir):
            old_p = os.path.join(chunks_dir, old_nm)
            if os.path.isdir(old_p) and old_nm not in expected:
                shutil.rmtree(old_p, ignore_errors=True)
    if resume:
        todo = []
        for c in cells:
            mp = os.path.join(chunks_dir, cid(c), 'meta.json')
            wj = os.path.join(chunks_dir, cid(c), 'world.json')
            if os.path.isfile(mp) and os.path.isfile(wj):
                try:
                    with open(mp, encoding='utf-8') as mf:
                        md = json.load(mf)
                    if md.get('route') == 'godot_case.py node chunk export (core/export)' and md.get('exported') == time.strftime('%Y-%m-%d'):
                        continue
                except Exception:
                    pass
            todo.append(c)
        print('  resuming: %d chunks already up to date, %d remaining' % (len(cells) - len(todo), len(todo)), flush=True)
        cells = todo
    if not cells:
        return
    corr_pts = _flora_corridor_pts(P)
    html_path = os.path.join(ROOT, PAGE)
    with open(html_path, encoding='utf-8') as f:
        html_src = f.read()
    scripts = re.findall(r'<script(?:\s+[^>]*)?>(.*?)</script>', html_src, re.S)
    page_js = scripts[-1]
    three_path = os.path.join(ROOT, 'kits', 'ancients', 'three.min.js')
    stage_js = os.path.join(ROOT, 'core', 'biome', '44-core-stage.js')
    wr_frag = WD.fragment(os.path.join(REGION_DIR, 'data'), '', 'godot_case chunks', 'openworld/oidong-highrift/data')

    driver_js = r"""
(async () => {
  await new Promise(r => setTimeout(r, 50));
  const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  window.WORLD_EXPORT.step = cfg.step;
  window.WORLD_EXPORT.water = false;
  window.WORLD_EXPORT.floraLibOnly = false;
  window.WORLD_EXPORT.origin = null;
  const t0 = Date.now();
  let totalTrees = 0;
  for (let i = 0; i < cfg.cells.length; i++) {
    const c = cfg.cells[i], id = cfg.ids[i], box = [c[0] * cfg.chunk, c[1] * cfg.chunk, (c[0] + 1) * cfg.chunk, (c[1] + 1) * cfg.chunk];
    const d = path.join(cfg.chunksDir, id);
    fs.rmSync(d, { recursive: true, force: true });
    fs.mkdirSync(d, { recursive: true });
    window.WORLD_EXPORT.origin = null;
    const w = EXPORT.world({ box, sections: ['terrain', 'registry'] });
    const chk = EXPORT.check(w, {});
    if ((w.errors && w.errors.length) || !chk.ok) {
      console.error('CHUNK_FAIL', id, w.errors, chk.problems);
      process.exit(2);
    }
    const g = EXPORT.glb(w);
    const wStr = JSON.stringify(g.json);
    fs.writeFileSync(path.join(d, 'world.json'), wStr + '\n');
    const files = { 'world.json': Buffer.byteLength(wStr) + 1 };
    const fl = window._worldExport.exportChunkFlora(box, cfg.placeBoxes, { corridor: cfg.corridor, corridorR: 1850, maxElev: 3420 });
    let fcnt = 0;
    if (fl && (fl.count > 0 || (fl.covered && fl.covered.indexOf('1') >= 0))) {
      fcnt = fl.count;
      totalTrees += fcnt;
      const fStr = JSON.stringify(fl);
      fs.writeFileSync(path.join(d, 'flora.json'), fStr + '\n');
      files['flora.json'] = Buffer.byteLength(fStr) + 1;
    }
    const meta = {
      case: id, page: cfg.page, kind: 'world', route: 'godot_case.py node chunk export (core/export)',
      box, sections: g.json.sections, files, injected: ['core/biome/44-core-stage.js'],
      stats: g.json.stats, glb: g.stats, check: chk.joins, flora_count: fcnt, page_errors: [], exported: cfg.date
    };
    fs.writeFileSync(path.join(d, 'meta.json'), JSON.stringify(meta) + '\n');
    if ((i + 1) % 5 === 0 || (i + 1) === cfg.cells.length) {
      console.log('  worker ' + cfg.worker + ' [' + (i + 1) + '/' + cfg.cells.length + '] ' + id + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s, ' + totalTrees + ' stream trees)');
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
"""
    with tempfile.TemporaryDirectory() as tmp:
        with open(stage_js, encoding='utf-8') as fst:
            stage_src = fst.read()
        q_str = ('?micro=%d' % micro) if micro is not None else ''
        gl_patch = """
THREE.WebGLRenderer = function() {
  const base = {
    domElement: makeEl('canvas'), shadowMap: {}, capabilities: { isWebGL2: true, getMaxAnisotropy: () => 4 },
    info: { render: { calls: 0, triangles: 0 }, memory: {} },
    getSize: (v) => v ? v.set(960, 600) : { width: 960, height: 600 },
    getRenderTarget: () => null,
  };
  return new Proxy(base, { get: (t, k) => (k in t ? t[k] : () => {}) });
};
THREE.PMREMGenerator = function() {
  const base = { fromScene: () => ({ texture: new THREE.Texture() }), fromCubemap: () => ({ texture: new THREE.Texture() }), fromEquirectangular: () => ({ texture: new THREE.Texture() }) };
  return new Proxy(base, { get: (t, k) => (k in t ? t[k] : () => {}) });
};
"""
        payload_p = os.path.join(tmp, 'bundle.js')
        with open(payload_p, 'w', encoding='utf-8', newline='\n') as f:
            f.write(wr_frag + '\n')
            f.write(stage_src + '\n')
            f.write(page_js + '\n')
            f.write(driver_js + '\n')
        run_p = os.path.join(tmp, 'run_chunks.js')
        with open(run_p, 'w', encoding='utf-8', newline='\n') as f:
            f.write("const vm = require('vm');\n")
            f.write('globalThis.__KRATOR_QUERY = %s;\n' % json.dumps(q_str))
            f.write(NODE_CHUNK_SHIM + '\n')
            f.write('globalThis.fs = fs; globalThis.path = path;\n')
            f.write('globalThis.THREE = Object.assign({}, require(%s));\n' % json.dumps(three_path))
            f.write(gl_patch + '\n')
            f.write("vm.runInThisContext(fs.readFileSync(%s, 'utf8'), { filename: 'oidong-highrift.bundle.js' });\n" % json.dumps(payload_p))
        n_workers = min(len(cells), max(1, int(os.environ.get('KRATOR_CHUNK_WORKERS', '1'))))
        procs = []
        for wi in range(n_workers):
            w_cells = cells[wi::n_workers]
            cfg_p = os.path.join(tmp, 'cfg_%d.json' % wi)
            with open(cfg_p, 'w', encoding='utf-8', newline='\n') as f:
                json.dump({
                    'worker': wi,
                    'cells': [list(c) for c in w_cells],
                    'ids': [cid(c) for c in w_cells],
                    'chunk': CHUNK,
                    'step': STEP,
                    'chunksDir': chunks_dir,
                    'placeBoxes': place_boxes,
                    'corridor': corr_pts,
                    'page': PAGE,
                    'date': time.strftime('%Y-%m-%d'),
                }, f)
            procs.append(subprocess.Popen(['node', '--max-old-space-size=2048', run_p, cfg_p], cwd=ROOT))
        codes = [p.wait() for p in procs]
        if any(codes):
            sys.exit('godot_case: node chunk export failed (exit codes %r)' % codes)


def grid_h(case, x, z):
    """the place's ground (its terrain grid, bilinear) at (x, z)"""
    with open(os.path.join(OUT, case, 'world.json'), encoding='utf-8') as f:
        g = json.load(f)['terrain']['grid']
    H = struct.unpack('<%df' % g['heights']['n'], base64.b64decode(g['heights']['b64']))
    fi, fj = (x - g['x0']) / g['step'], (z - g['z0']) / g['step']
    i, j = min(int(fi), g['nx'] - 2), min(int(fj), g['nz'] - 2)
    u, v = fi - i, fj - j
    h = lambda a, b: H[b * g['nx'] + a]
    return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v


def git(root, *a):
    r = subprocess.run(['git', '-C', root] + list(a), capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None


def arcology(pl):
    """Strongbow's place gains `arcology`: its case and where it stands (after the places and the arcology's case exist)"""
    A = ARCOLOGY
    w = os.path.join(OUT, A['case'], 'world.json')
    if not os.path.isfile(w):
        return
    p = next(q for q in pl if q['id'] == A['site'])
    x, z = p['pin']
    with open(os.path.join(OUT, A['case'], 'meta.json'), encoding='utf-8') as f:
        m = json.load(f)
    cp = os.path.join(OUT, p['case'], 'cut.json')
    if os.path.isfile(cp):
        with open(cp, encoding='utf-8') as f:
            cut = json.load(f)
    else:
        cut = None
    if cut:   # the page's lip stands in front of the pin (OHR_CUT.spec.ahead), on the lip's level
        x, lip, z = cut['at']
    else:
        lip = grid_h(p['case'], x, z)
    p['arcology'] = {'case': A['case'], 'page': A['page'], 'branch': m.get('branch'), 'commit': m.get('commit'),
                     'at': [x, round(lip, 3), z], 'ry': A['ry'], 'cut': cut,
                     'note': "the case's meshes stand about the page's anchor (its world.json origin: the lip at the bay's centre); "
                             'a reader seats that anchor at `at` and turns the case by `ry` about +Y (the page faces +z, the site west)'}


def monastery(pl):
    """Longsong's place gains `monastery`: settlements/longsong seated on its granite knoll at sq80bzd7ep's pin"""
    M = MONASTERY
    w = os.path.join(OUT, M['case'], 'world.json')
    if not os.path.isfile(w):
        return
    p = next((q for q in pl if q['id'] == M['site']), None)
    if not p or not os.path.isfile(os.path.join(OUT, p['case'], 'world.json')):
        return
    x, z = p['pin']
    gh = grid_h(p['case'], x, z)
    p['monastery'] = {'case': M['case'], 'page': M['page'],
                      'at': [round(x, 3), round(gh, 3), round(z, 3)],
                      'ry': round(M['ry'], 8), 'box': list(M['box'])}


def places(P):
    out = []
    for S in P['sites']:
        half = PLACE / 2
        sn = lambda v, up: (math.ceil(v / STEP) if up else math.floor(v / STEP)) * STEP
        box = list(SITE_BOXES[S['id']]) if S['id'] in SITE_BOXES else [sn(S['x'] - half, False), sn(S['z'] - half, False), sn(S['x'] + half, True), sn(S['z'] + half, True)]
        hpois = []
        for h in S.get('hamlets') or []:
            st = h.get('site') or {}
            if 'x' in st and 'z' in st:
                hx, hz = float(st['x']), float(st['z'])
                if box[0] <= hx <= box[2] and box[1] <= hz <= box[3]:
                    hpois.append({'id': h['id'], 'name': h.get('name') or h['id'], 'focus': h.get('focus') or 'village',
                                  'x': round(hx, 1), 'z': round(hz, 1)})
        out.append({'id': S['id'], 'name': S['name'], 'type': S.get('type'), 'pin': [S['x'], S['z']],
                    'detail': 'full' if S['id'] in FULL_PLACES else 'massing',
                    'box': box, 'case': 'places/' + S['id'], 'hamlets': [h['id'] for h in S.get('hamlets') or []],
                    'hamlet_pois': hpois})
    return out


def roads(P):
    R = []
    for L in P['links']:
        R.append({'id': L['id'], 'kind': 'link', 'from': L['from'], 'to': L['to'], 'km': round(L['length_m'] / 1000, 2),
                  'pts': [[round(p[0], 1), round(p[1], 1), round(p[2], 2)] for p in L['pts']],
                  'spans': [list(sp) for sp in (L.get('spans') or [])]})
    for S in P['sites']:
        for r in S.get('roads') or []:
            pts = [[round(p[0], 1), round(p[1], 1), round(p[2], 2)] for p in r['pts']]
            spans = [list(sp) for sp in (r.get('spans') or [])]
            if r['id'] == 'sq80bzd7ep/road/4' and len(pts) >= 2:
                # Extend across the north half of Biruk al-Ghaym onto the dry bank terrace to match healed bridge/0
                pts.extend([[-154072.0, -25856.0, 2061.6], [-154084.4, -25826.6, 2063.8]])
                if spans:
                    spans[-1][1] = len(pts) - 1
            R.append({'id': r['id'], 'kind': 'village', 'from': r.get('from'), 'to': S['id'],
                      'pts': pts, 'spans': spans})
    return R


def place_before_js(p):
    b = p['box']
    cx, cz = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
    tick = 'for(const f of HOST.TICKS)f(.016,1);'
    if p['id'] not in FULL_PLACES:
        return ('(async()=>{window.WORLD_EXPORT.step=%d;CAM.setView(%.1f,%.1f,700,.78,-.3);_api.settle(15000);%sreturn OHR_CUT.info();})()'
                % (PLACE_STEP, cx, cz + MASS_CAM, tick))
    if p['id'] == 'sq80bzd7ep':
        # Settle across Longsong's bridge/pin, all 3 core Xanadu villages (Shar, Nub, Dzo-ling), and the NW bamboo/blossom woods
        spots = [[-154060.0, -25900.0], [-153602.0, -25123.0], [-155041.0, -25909.0], [-154130.0, -24739.0],
                 [-155045.0, -25285.0], [-154620.0, -25350.0]]
        anchors = [[round(b[0] + (i + 0.5) * (b[2] - b[0]) / 4, 1), round(b[1] + (j + 0.5) * (b[3] - b[1]) / 4, 1)]
                   for j in range(4) for i in range(4)]
        anc = json.dumps(anchors, separators=(',', ':'))
        steps = ''.join('CAM.setView(%.1f,%.1f,195,.78,-.35);_api.settle(10000);%s' % (sx, sz + 210.0, tick) for sx, sz in spots)
        return ('(async()=>{window.WORLD_EXPORT.step=%d;window.WORLD_EXPORT.floraAnchors=%s;%sreturn OHR_CUT.info();})()'
                % (PLACE_STEP, anc, steps))
    if p['id'] == 'sfgtxw10kr':
        # Settle across Strongbow's canyon floor, plateau, Rīfar al-Jadwal Great Cataract + cauldron, and midway cliff
        spots = [[-611200.0, -76000.0], [-609500.0, -76000.0], [-610200.0, -71668.0], [-611200.0, -73600.0]]
        anchors = [[round(b[0] + (i + 0.5) * (b[2] - b[0]) / 3, 1), round(b[1] + (j + 0.5) * (b[3] - b[1]) / 5, 1)]
                   for j in range(5) for i in range(3)]
        anc = json.dumps(anchors, separators=(',', ':'))
        steps = ''.join('CAM.setView(%.1f,%.1f,340,.78,-.32);_api.settle(10000);%s' % (sx, sz + 420.0, tick) for sx, sz in spots)
        return ('(async()=>{window.WORLD_EXPORT.step=%d;window.WORLD_EXPORT.floraAnchors=%s;%sreturn OHR_CUT.info();})()'
                % (PLACE_STEP, anc, steps))
    # High Rift monasteries: settle within FLOOR's 380 m reach so hydrothermal & tussock groundcover builds around the house
    return ('(async()=>{window.WORLD_EXPORT.step=%d;CAM.setView(%.1f,%.1f,190,.78,-.35);_api.settle(15000);%sreturn OHR_CUT.info();})()'
            % (PLACE_STEP, cx, cz + 240.0, tick))


def main():
    global OUT
    argv = sys.argv[1:]
    only = argv[argv.index('--only') + 1] if '--only' in argv else None
    for i, a in enumerate(argv):
        if a == '--index-only':
            only = 'index'
        elif a.startswith('--only='):
            only = a.split('=', 1)[1]
        elif a.startswith('--out='):
            OUT = os.path.abspath(a.split('=', 1)[1])
        elif a == '--out' and i + 1 < len(argv):
            OUT = os.path.abspath(argv[i + 1])
    micro = parse_micro(argv)
    if only not in ('index', 'chunks', 'monastery') and os.environ.get('KRATOR_GL') != 'gpu':   # under SwiftShader the page's start fails on a shader (CAM never made)
        sys.exit('godot_case: set KRATOR_GL=gpu (the page needs the GPU; SwiftShader fails its start)')
    P = plan()
    L = link(P, *ROUTE)
    pts = L['pts'] if L['from'] == ROUTE[0] else list(reversed(L['pts']))
    route_cells = cells_along(pts)
    cells = cells_with_sites(route_cells, P)
    os.makedirs(OUT, exist_ok=True)
    pl = places(P)
    place_boxes = [p['box'] for p in pl]
    if only in (None, 'flora'):
        print('flora library: shared 3D Hero (lv=2) + Mid (lv=1) + Sapling + Undergrowth prototypes', flush=True)
        asyncio.run(_export_flora_lib_async(os.path.join(OUT, 'flora'), micro=micro))
    if only in (None, 'places'):
        want_pl = [a.split('=', 1)[1] for a in argv if a.startswith('--place=')]
        run_pl = [p for p in pl if p['id'] in want_pl] if want_pl else pl
        print('places (%d): lattice-snapped boxes, single-boot camera settle across sites & villages' % len(run_pl), flush=True)
        asyncio.run(_export_places_batch_async(run_pl, OUT, micro=micro))
    if only in (None, 'monastery'):
        M = MONASTERY
        mpage = os.path.join(ROOT, M['page'])
        if not os.path.isfile(mpage):
            sys.exit('godot_case: missing Longsong page at %s' % mpage)
        print('monastery: %s -> %s' % (M['page'], M['case']), flush=True)
        d = os.path.join(OUT, M['case'])
        shutil.rmtree(d, ignore_errors=True)
        mcmd = [sys.executable, os.path.join(ROOT, 'tools', 'harness.py'), 'export', M['page'], '--out', d,
                '--query', '?floraR=360&q=0.75',
                '--box=' + ','.join('%g' % v for v in M['box']),
                '--sections', 'items,buckets,materials,textures,registry,terrain,water',
                '--before', '(()=>{window.requestAnimationFrame=()=>0;return true;})()']
        mr = subprocess.run(mcmd, cwd=ROOT)
        if mr.returncode:
            sys.exit('godot_case: monastery export failed (exit %d)' % mr.returncode)
    if only in (None, 'arcology'):
        A = ARCOLOGY
        page = os.path.join(A['root'], A['page'])
        if not os.path.isfile(page):
            if only == 'arcology':
                sys.exit("godot_case: no Strongbow page at %s (KRATOR_STRONGBOW: its branch's worktree, built)" % page)
            print('  arcology: preserving existing %s (no external worktree at %s)' % (A['case'], A['root']), flush=True)
        else:
            d = os.path.join(OUT, A['case'])
            shutil.rmtree(d, ignore_errors=True)
            cmd = [sys.executable, os.path.join(ROOT, 'tools', 'harness.py'), 'export', page, '--root', A['root'], '--out', d,
                   '--box=' + ','.join('%g' % v for v in A['box']), '--sections', 'items,buckets,materials,textures',
                   '--inject', os.path.join(ROOT, 'core', 'export', '10-core-export-scene.js'), '--inject', os.path.join(HERE, 'strongbow-export.js'),
                   '--before', '(async()=>{setView(0,1400,3500,0,450,0,false);await new Promise(r=>setTimeout(r,4000));return _sbExport;})()']
            r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
            print('  arcology: ' + ' | '.join(l[:160] for l in r.stdout.splitlines() if l.startswith(('exported', 'FAILED', 'wrote', 'OK'))), flush=True)
            if r.returncode:
                sys.exit("godot_case: the arcology's export failed\n%s\n%s" % (r.stdout[-2000:], r.stderr[-2000:]))
            mp = os.path.join(d, 'meta.json')
            with open(mp, encoding='utf-8') as f:
                m = json.load(f)
            m['branch'], m['commit'] = git(A['root'], 'rev-parse', '--abbrev-ref', 'HEAD'), git(A['root'], 'rev-parse', 'HEAD')
            m['page'] = A['page']
            with open(mp, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(m, f, separators=(',', ':'))
    if only in (None, 'chunks'):
        sub_cells = cells
        for a in argv:
            if a.startswith('--chunk-range='):
                lo, hi = [int(x) for x in a.split('=', 1)[1].split(':', 1)]
                sub_cells = cells[lo:hi]
        print('chunks (%d of %d: %d on road %s + %d High Rift/site/escarpment cells): %d m cells every %d m + full-chunk flora'
              % (len(sub_cells), len(cells), len(route_cells), L['id'], len(cells) - len(route_cells), CHUNK, STEP), flush=True)
        _export_chunks_node(sub_cells, place_boxes, OUT, P, micro=micro, prune=(len(sub_cells) == len(cells)), resume=('--resume' in argv))
    arcology(pl)
    monastery(pl)
    reg_meta = {}
    reg_json_p = os.path.join(REGION_DIR, 'data', 'region.json')
    if os.path.isfile(reg_json_p):
        with open(reg_json_p, encoding='utf-8') as rf:
            reg_meta = json.load(rf)
    rframe = reg_meta.get('frame') or {'origin_px': [1306, 1634], 'm_per_px': 2000.0}
    ox_px, oz_px = rframe['origin_px'][0], rframe['origin_px'][1]
    mpp = float(rframe.get('m_per_px') or 2000.0)
    vents = [[round((v['px'][0] - ox_px) * mpp, 1), round((v['px'][1] - oz_px) * mpp, 1), round(float(v.get('radius', 1.5)) * 400.0, 1)]
             for v in (reg_meta.get('vents') or []) if isinstance(v.get('px'), list) and len(v['px']) >= 2]
    idx = {'format': 'krator-world-stream', 'version': 1, 'region': P['region'], 'plan': P['hash'],
           'source': PAGE, 'by': 'openworld/oidong-highrift/tools/godot_case.py',
           'frame': {'origin_px': list(rframe['origin_px']), 'm_per_px': mpp},
           'vents': vents,
           'convention': 'metres, +Y up, x east, z south, the region\'s frame (openworld/oidong-highrift/data/region.json: '
                         'x = (px - origin) * 2000); a chunk\'s and a place\'s case is a krator-world (core/export) in the same frame',
           'chunk': {'size': CHUNK, 'step': STEP, 'margin': MARGIN,
                     'route_chunks': [cid(c) for c in route_cells],
                     'list': [{'id': cid(c), 'cell': list(c), 'box': [c[0] * CHUNK, c[1] * CHUNK, (c[0] + 1) * CHUNK, (c[1] + 1) * CHUNK],
                               'case': 'chunks/' + cid(c)} for c in cells]},
           'places': pl, 'roads': roads(P),
           'route': {'link': L['id'], 'from': ROUTE[0], 'to': ROUTE[1], 'km': round(L['length_m'] / 1000, 2)},
           'sim': {'sim': 'sim.json', 'golden': 'golden.json', 'by': 'openworld/oidong-highrift/tools/export-sim.js'}}
    if os.path.isfile(os.path.join(OUT, 'flora', 'protos.json')):
        idx['flora'] = {'case': 'flora', 'protos': 'flora/protos.json'}
    if micro is not None:
        idx['micro'] = micro
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(idx, f, separators=(',', ':'), ensure_ascii=False)
    print('wrote %s: %d chunks (%d route), %d places, %d roads (plan %s%s)' % (os.path.relpath(OUT, ROOT).replace(os.sep, '/'),
          len(cells), len(route_cells), len(pl), len(idx['roads']), P['hash'], ', micro=%d' % micro if micro is not None else ''))


if __name__ == '__main__':
    main()
