#!/usr/bin/env python3
"""Build Hook (settlements/hook/PLAN.md) on the Ancient Port kit: dist/hook.html.

Hook is a city on the Ancient Port kit (settlements/port). This build reads the kit IN PLACE: every fragment of
settlements/port/src, the kit's core/ lists (core/materials, core/lod, core/atmos, core/water, core/materials/record)
and the kit's texture pack (settlements/port/tex, through tools/textures/matlib_pack.py). Nothing of the kit is
copied here. The kit's own build rules (seed discipline, shared scope, registration keys) come from
settlements/port/build.py, imported, so Hook's fragments are checked by the same code.

Hook adds, in filename order with the kit's fragments:
  75a/75b (core/terrain)  KRELIEF and KLAND, the open world's ground rule, read in place; 75c the scale model's cut round
                          Hook (world/, inlined as HOOK_WORLD_DATA); then src/75d-hook-world.js lays the kit's frame on it
  targets/<target>/*      the layout (89z-rows.js: TITLE, PORT_LAYOUT_DEF) and the views (91z-views.js)
  src/*                   Hook's own fragments, when it has any. A src/ file with the SAME NAME as a kit fragment
                          shadows it (an ADAPTED copy): `--vendor-check` diffs every such file against the kit's.

The site editor (targets/hook-site, dist/hook-site.html) is Hook's page again, with Voth's site editor read in place
(settlements/voth/targets/voth-site: the model, the tools and the DOM of its head) and Hook's adapter and model layer
over them (SITE_TARGETS below).

Usage:  python3 build.py [--target hook|hook-site] [--no-checks] [--inline-packs]
        python3 build.py --vendor-check     (every src/ file that shadows a settlements/port/src fragment)
"""
import contextlib, hashlib, importlib.util, io, json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and '--vendor-check' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))            # repo root
PORT = os.path.join(ROOT, 'settlements', 'port')         # the Ancient Port kit, read in place
PORT_SRC = os.path.join(PORT, 'src')
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
PACK_KEY = 'port'                                        # the kit's pack (src/88y-port-matlib.js binds KMAT.pack('port'))


def port_build():
    """settlements/port/build.py as a module: its check(), find_node(), DETERMINISTIC and core file lists. Its import-time
    side effects (the port lint on its own folder, the open-issues print) are skipped and silenced."""
    spec = importlib.util.spec_from_file_location('port_build', os.path.join(PORT, 'build.py'))
    mod = importlib.util.module_from_spec(spec)
    argv = sys.argv
    sys.argv = [argv[0], '--no-checks']
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            spec.loader.exec_module(mod)
    finally:
        sys.argv = argv
    return mod


PB = port_build()


def discover():
    if not os.path.isdir(TARGETS):
        return []
    return sorted(t for t in os.listdir(TARGETS)
                  if os.path.isfile(os.path.join(TARGETS, t, '89z-rows.js')) or (t in SITE_TARGETS and os.path.isdir(os.path.join(TARGETS, t))))


def kit_paths():
    """{fragment name: path} of the kit as settlements/port/build.py assembles it (its src/, then the core lists it
    names), without the pack fragment."""
    src = {f: os.path.join(PORT_SRC, f) for f in os.listdir(PORT_SRC) if f[0].isdigit()}
    src.update({f: os.path.join(PB.CORE, f) for f in PB.CORE_FILES if f not in src})
    src.update({f: os.path.join(PB.LOD_DIR, f) for f in PB.LOD_FILES if f not in src})
    src.update({f: os.path.join(PB.ATMOS_DIR, f) for f in PB.CORE_ATMOS if f not in src})
    src.update({f: os.path.join(PB.WATER_DIR, f) for f in PB.CORE_WATER if f not in src})
    src.update({f: os.path.join(ROOT, 'core', 'materials', 'record', f) for f in PB.RECORD_FILES if f not in src})
    return src


def own_src():
    return {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()} if os.path.isdir(SRC) else {}


# ---------------------------------------------------------------- P1: the placement core, the city builder, the site, the hosts
# core/rand, core/space and core/tags, read in place under their own names (each one global: KRAND, KSPACE, KTAGS)
CORE_PLACE = [('08-core-rand.js', 'core/rand/08-core-rand.js'), ('20-core-space.js', 'core/space/20-core-space.js'),
              ('50-core-tags.js', 'core/tags/50-core-tags.js'), ('52-core-tags-vocab.js', 'core/tags/52-core-tags-vocab.js'),
              # the ground: core/terrain's relief noise and KLAND, the open world's land rule, before Hook's world fragment
              ('75a-core-relief.js', 'core/terrain/38-core-relief.js'), ('75b-core-land.js', 'core/terrain/40-core-land.js')]
# a core module is one closure: its column-0 declarations are not the page's, so they step in one space for the kit's
# shared-scope rule (as kcity_bundle does)
CORE_CLOSURE = {'75a-core-relief.js', '75b-core-land.js'}
# the scale model's cut round Hook (world/: cut.py), inlined as HOOK_WORLD_DATA for 75d-hook-world.js
WORLD_DIR = os.path.join(HERE, 'world')
WORLD_FRAG = '75c-hook-world-data.js'
# core/city in one closure, as Verge takes it (settlements/verge/build.py kcity_bundle): its globals (SL, PLAN, TUNE, V,
# clamp, CG...) stay inside, where they cannot clash with the Port page's; Hook reads KCITY and KCITY.lib
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js', '50-city-host-streets.js']
KCITY_FRAG = '76-kcity-bundle.js'
SITE_FRAG = '76-hook-site-data.js'
SITE_JSON = os.path.join(HERE, 'site', 'hook-site.json')
# the Ancient host types (kits/ancients/src/8ap-host-*), read in place under names that load before the layout; the
# Bell Hall's constant HBH is renamed HBLH (the Port's haven is HBH): the one adaptation, recorded in KNOWN_ISSUES.md
HOST_FILES = [('78a-host-0-lib.js', '8ap-host-0-lib.js'), ('78b-host-a-facet.js', '8ap-host-a-facet.js'), ('78c-host-b-bastion.js', '8ap-host-b-bastion.js'),
              ('78d-host-c-arcades.js', '8ap-host-c-arcades.js'), ('78e-host-d-stalks.js', '8ap-host-d-stalks.js'), ('78f-host-e-bellhall.js', '8ap-host-e-bellhall.js')]
HOST_SUBST = {'78f-host-e-bellhall.js': [(r'\bHBH\b', 'HBLH')]}
SKY_FRAG = '78-sky-helpers.js'   # the skyscraper helpers the hosts call (skyPlinth, skyRooms, skyHoist...): 52-sky-abc.js before its builders
ANCIENTS_SRC = os.path.join(ROOT, 'kits', 'ancients', 'src')
P1_DETERMINISTIC = {n for n, _ in CORE_PLACE} | {KCITY_FRAG, SITE_FRAG, SKY_FRAG, WORLD_FRAG, '78a-host-0-lib.js', '75d-hook-world.js', '76-hook-ground.js',
                                                 '90a-hook-city.js', '90b-hook-city-draw.js'}


# ---------------------------------------------------------------- P2: the kits the town draws with, each sealed in a closure
# Each culture's kit is READ IN PLACE and sealed in a closure of its own (its MAT, REG, rng, terrainH... meet neither the
# Port page's nor another kit's), with proto(key, v) building one piece at the origin into a group, as the isle demo's
# city page takes them (settlements/isle-demo/bundles.py: ISK the Islanders, IZV the Vernacular, both imported from
# there). VCAT (the Voth building catalog on the catalog's core), HYK (the Hykkousoi, on settlements/voth/foreign.py's
# file list) and KPA (kits/post-apoc through its own apoc_bundle) are sealed here the same way. The kits' boxes are
# scraped from their sources into HOOK_DIMS (dims_fragment) so the plan needs none of the drawing. The library packs
# the Islanders and the Vernacular bind come first (77-hook-packs.js), beside the page as sidecars.
PACKS_FRAG = '77-hook-packs.js'
DIMS_FRAG = '77f-hook-dims.js'
BUNDLE_FRAGS = {'77a-isk-bundle.js': 'isk', '77b-izv-bundle.js': 'izv', '77c-vcat-bundle.js': 'vcat', '77d-hyk-bundle.js': 'hyk', '77e-apoc-bundle.js': 'apoc'}
VOTH_CAT = os.path.join(ROOT, 'settlements', 'voth', 'catalog', 'registry')
VCAT_FILES = [os.path.join(ROOT, 'kits', 'catalog', 'krator-furniture-core.js'), os.path.join(ROOT, 'kits', 'catalog', 'krator-master-buildings-voth.js')] + \
             [os.path.join(VOTH_CAT, f) for f in ('voth-housing.js', 'voth-manors.js', 'voth-shops.js', 'voth-taverns.js', 'voth-warehouses.js')]
HYK_EXTRA = ['70-hyk-housing.js', '71-hyk-shops.js', '72-hyk-hospitality.js', '76-hyk-industry.js', '76b-hyk-warehouse-round.js']
APOC_DEFS = ['40-dw-small.js', '42-lg-dwell.js', '44-civic.js', '46-shops.js', '48-industry.js']
P2_DETERMINISTIC = {PACKS_FRAG, DIMS_FRAG, '88-hook-programme.js'} | set(BUNDLE_FRAGS)


def closure(js):
    """the kit's shared-scope rule reads declarations at column 0; a closure's are not shared, so they step in one space"""
    return re.sub(r'^(const|let|var|function)\b', r' \1', js, flags=re.M)


def shim_head():
    return ('var window = new Proxy(globalThis.window || globalThis, { get: function (t, k) { var v = t[k]; return typeof v === "function" && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },\n'
            '  set: function (t, k, v) { if (k === "onerror") return true; t[k] = v; return true; } });\n'
            'var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };\n'
            'var SVF = { WEALTH: {}, missing: {}, placed: [] }; function svfNewBatch() {} function FURNISH() { return null; } function FURNISH_HANG() { return null; } function svfH(k, v, d) { return d; }\n'
            'var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, setDetail: function () {},\n'
            '  batch: function () { return { place: function () { return null; }, flush: function () { return new THREE.Group(); }, count: 0 }; } };\n'
            'var KratorInteriors = { sets: { find: function () { return null; } }, runtimeAdapter: function () { return null; } };\n')


def vcat_bundle():
    body = ''.join('/* ---- %s ---- */\n%s\n;\n' % (os.path.relpath(f, ROOT).replace(os.sep, '/'), rd(f)) for f in VCAT_FILES)
    return ('/* VCAT: the Voth building catalog on the catalog core, one closure (settlements/hook/build.py). GENERATED: edit kits/catalog or settlements/voth/catalog. */\n'
            'var VCAT = (function(){\n' + shim_head() + body +
            'function vcatProto(key, v) { var A = ASSET_BY_KEY[key]; if (!A) return null; var g = buildAsset(key, 0, 0, 0, { variant: v | 0, seed: 1, y: 0 }); if (!g) return null;\n'
            '  scene.remove(g); INSTANCES.length = 0; var d = entryDims(A, v | 0); g.userData = { key: key, v: v | 0, w: d.w, d: d.d, h: d.h, error: g.userData.error }; return g; }\n'
            'return { proto: vcatProto, ASSET_BY_KEY: ASSET_BY_KEY };\n})();\n')


def hyk_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'voth'))
    import foreign
    B = [b for b in foreign.BUILDS if b['name'] == 'ys'][0]
    files = [f for f in B['files'] if f != '74f-hyk-civic-minor.js'] + HYK_EXTRA
    body = foreign._head_js(B['src']).replace("const ERRS=document.getElementById('errs');", 'var ERRS = { style: {}, textContent: "" };')
    body += ''.join('/* ---- %s ---- */\n%s\n' % (os.path.relpath(foreign._path(B['src'], f), ROOT).replace(os.sep, '/'), rd(foreign._path(B['src'], f))) for f in sorted(files))
    return ('/* HYK: the Hykkousoi kit of Ys, one closure (settlements/hook/build.py, on settlements/voth/foreign.py\'s file list). GENERATED: edit settlements/ys/src. */\n'
            'var HYK = (function(){\n' + shim_head() + body +
            'var HYK_ERRS = []; reportErr = function (m) { HYK_ERRS.push(String(m).slice(0, 600)); if (typeof console !== "undefined") console.error("HYK: " + m); };\n'
            'function hykProto(key, v) { var D = HYK.defs[key]; if (!D) return null; var G = new THREE.Group(); G.name = key + "#" + (v | 0);\n'
            '  for (var n in KIT.items) KIT.items[n].length = 0; REG.length = 0;\n'
            '  HYK.place(G, key, 0, 0, 0, { y: 0, v: v | 0 }); hykFlush(G); kbake(G);\n'
            '  G.userData = { key: key, v: v | 0, w: D.w, d: D.d, h: D.h }; return G; }\n'
            'return { proto: hykProto, HYK: HYK, errors: HYK_ERRS };\n})();\n')


def apoc_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'post-apoc'))
    import apoc_bundle as ab
    return ('/* KPA: kits/post-apoc through its apoc_bundle, sealed again with the furniture and interiors stubbed (no furniture on the town page). GENERATED: edit kits/post-apoc. */\n'
            'var KPA = (function(){\n' + shim_head() + ab.bundle(APOC_DEFS) + '\n'
            'function kpaProto(key, v) { var D = KratorPostApoc.DEFS[key]; if (!D) return null;\n'
            '  var G = KratorPostApoc.build([{ key: key, x: 0, z: 0, ry: 0, o: { v: v | 0, y: 0 } }], { culture: "generic" }); if (!G) return null;\n'
            '  G.userData = { key: key, v: v | 0, w: D.w, d: D.d, h: D.h }; return G; }\n'
            'return { proto: kpaProto, DEFS: KratorPostApoc.DEFS, K: KratorPostApoc };\n})();\n')


def dims_fragment():
    """every kit piece's declared box, read from the kits' sources (as settlements/isle-demo/build.py dims_fragment):
    the plan places by these, so it needs none of the drawing bundles"""
    import glob
    out = {}
    num = lambda s, n: (re.search(r'\b%s\s*:\s*([\d.]+)' % n, s) or [None, None])[1]
    strv = lambda s, n: (re.search(r"\b%s\s*:\s*['\"]([^'\"]*)['\"]" % n, s) or [None, None])[1]
    rec = lambda b, kit, h=None: {'w': float(num(b, 'w')), 'd': float(num(b, 'd')), 'h': float(num(b, 'h') or h or 8), 'kit': kit, 'wealth': strv(b, 'wealth')}
    for f in sorted(glob.glob(os.path.join(ROOT, 'kits', 'islanders', 'src', '*.js'))):
        for m in re.finditer(r"defBuilding\(\{\s*key\s*:\s*'([^']+)'(.*?)\bbuild\s*[:(]", rd(f), re.S):
            b = m.group(2)
            if re.search(r"cls\s*:\s*'(life|flora)'", b) or not num(b, 'w'):
                continue
            out[m.group(1)] = rec(b, 'isk')
    for f in sorted(glob.glob(os.path.join(ROOT, 'settlements', 'iziz', 'src', '7*-vern-*.js'))):
        for m in re.finditer(r"VERN\.def\(\{key:'([^']+)'(.*?)build:", rd(f)):
            out[m.group(1)] = rec(m.group(2), 'izv', 8)
    for f in HYK_EXTRA:
        for m in re.finditer(r"HYK\.def\(\{key:'([^']+)'(.*?)build:", rd(os.path.join(ROOT, 'settlements', 'ys', 'src', f))):
            if num(m.group(2), 'w'):
                out[m.group(1)] = rec(m.group(2), 'hyk')
    for f in VCAT_FILES[1:]:
        for m in re.finditer(r"ASSET\(\{\s*key:\s*'([^']+)'(.*?)\bbuild\s*:", rd(f), re.S):
            b = m.group(2)
            if not num(b, 'w'):
                continue
            r = rec(b, 'vcat')
            vd = re.search(r'variantDims\s*:\s*\[(.*?)\]', b, re.S)
            if vd:
                r['vd'] = [{'w': float(x[0]), 'd': float(x[1]), 'h': float(x[2])} for x in re.findall(r'\{\s*w:\s*([\d.]+),\s*d:\s*([\d.]+),\s*h:\s*([\d.]+)', vd.group(1))]
            out[m.group(1)] = r
    for f in APOC_DEFS:
        for m in re.finditer(r"defBuilding\(\{key:'([^']+)'(.*?)build:", rd(os.path.join(ROOT, 'kits', 'post-apoc', 'src', f))):
            if num(m.group(2), 'w'):
                out[m.group(1)] = rec(m.group(2), 'apoc')
    return ('/* GENERATED by build.py: the kits\' declared boxes (kits/islanders, settlements/iziz, settlements/ys, the Voth catalog, kits/post-apoc) */\n'
            'var HOOK_DIMS = ' + json.dumps(out, sort_keys=True, separators=(',', ':')) + ';\n')


def p2_bodies(bodies, side):
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'isle-demo'))
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import bundles, matlib_pack
    izp = os.path.join(ROOT, 'settlements', 'iziz')
    izfams = json.load(open(os.path.join(izp, 'tex', 'pack.json'), encoding='utf-8')).get('families', {})
    bodies[PACKS_FRAG] = (matlib_pack.fragment(os.path.join(ROOT, 'kits', 'islanders'), 'islanders', side=side) +
                          matlib_pack.fragment(izp, 'iziz', exclude=[k for k in izfams if k.startswith(('fauna', 'city'))], side=side))
    bodies['77a-isk-bundle.js'] = closure(bundles.isk_bundle()[0])
    bodies['77b-izv-bundle.js'] = closure(bundles.izv_bundle()[0])
    bodies['77c-vcat-bundle.js'] = closure(vcat_bundle())
    bodies['77d-hyk-bundle.js'] = closure(hyk_bundle())
    bodies['77e-apoc-bundle.js'] = closure(apoc_bundle())
    bodies[DIMS_FRAG] = dims_fragment()


# ---------------------------------------------------------------- the site editor (targets/hook-site -> dist/hook-site.html)
# A site target is the base target's page (its layout and views) plus Voth's editor fragments read in place under names
# that load after the kit's camera (92): the model (10-site-model.js: SITE, TERR, undo), the tools (55-site-tools.js) and
# the panels of its head (00-head.html, lifted into a fragment that inserts them into the Port page). Not Voth's ground
# (20-site-cantons.js, 50-site-scene.js): Hook's adapter (targets/hook-site/94-hook-site-adapter.js) gives the tools
# what they read from Voth's scene, on the Port kit's terrain; its model layer (96) adds the quarters' fields, the
# hosts and the grid; 98 starts it. KNOWN_ISSUES.md, "The site editor".
VOTH_SITE = os.path.join(ROOT, 'settlements', 'voth', 'targets', 'voth-site')
EDITOR_FILES = [('93-site-model.js', '10-site-model.js'), ('95-site-tools.js', '55-site-tools.js')]
EDITOR_DOM = '93a-site-dom.js'
SITE_TARGETS = {'hook-site': {'base': 'hook', 'title': 'Krator — Hook, the site editor'}}


def rd(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


def editor_dom():
    """Voth's editor panels and their style (settlements/voth/targets/voth-site/00-head.html), as a fragment that inserts
    them into the Port page's body: the editor's DOM read in place, never copied. The engine's #app (the catalog
    engine's canvas holder) is dropped: the Port page has its own canvas."""
    t = rd(os.path.join(VOTH_SITE, '00-head.html'))
    style = t[t.index('<style>') + 7:t.index('</style>')]
    body = t[t.index('<body>') + 6:]
    body = re.sub(r'<div id="app"></div>\s*', '', body)
    return ('/* GENERATED by settlements/hook/build.py from settlements/voth/targets/voth-site/00-head.html: the editor\'s panels and\n'
            '   style, inserted into the Port page (the Hook adapter, 94-hook-site-adapter.js, then adapts them). Edit Voth\'s file. */\n'
            'document.head.insertAdjacentHTML(\'beforeend\', \'<style>\' + %s + \'</style>\');\n'
            'document.body.insertAdjacentHTML(\'beforeend\', %s);\n' % (json.dumps(style), json.dumps(body)))


def site_bodies(paths, bodies):
    for name, src in EDITOR_FILES:
        bodies[name] = rd(os.path.join(VOTH_SITE, src))
        paths[name] = None
    bodies[EDITOR_DOM] = editor_dom()
    paths[EDITOR_DOM] = None


def kcity_bundle():
    d = os.path.join(ROOT, 'core', 'city')
    body = ''.join('\n/* ---- core/city/%s ---- */\n' % f + rd(os.path.join(d, f)) for f in CITY_JS)
    # the Port build's shared-scope rule reads declarations at column 0; the closure's are not shared, so they step in one space
    body = re.sub(r'^(const|let|var|function)\b', r' \1', body, flags=re.M)
    return ('/* KCITY: core/city in one closure (settlements/hook/build.py, as settlements/verge/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(){\n' + body +
            '\nKCITY.lib = { SL: SL, OCC: OCC, Raster: Raster, V: V, obb: obb, obbCorners: obbCorners, inPoly: inPoly, offsetConvex: offsetConvex,\n'
            '  resample: resample, plLen: plLen, segDist: segDist, ryFacing: ryFacing, polyCentroid: polyCentroid, HOST: HOST, plan: function () { return PLAN; } };\n'
            'return KCITY;\n})();\n')


def site_fragment():
    data = rd(SITE_JSON) if os.path.isfile(SITE_JSON) else '{"site": "hook", "districts": [], "markers": [], "avenues": [], "hosts": []}'
    return '/* GENERATED by build.py from site/hook-site.json (the site editor saves there) */\nvar HOOK_SITE = ' + data.strip() + ';\n'


def world_fragment():
    """settlements/hook/world (the scale model's cut: region.json and the rasters extract_region.py wrote) as one data
    fragment: the 16-bit heights as their raw integers (75d-hook-world.js decodes them with the open world's own
    arithmetic, lo + q/65535*(hi-lo), so Hook and the open world read the same land), the 8-bit maps as they are."""
    from PIL import Image
    meta = json.loads(rd(os.path.join(WORLD_DIR, 'region.json')))

    def px(name):
        im = Image.open(os.path.join(WORLD_DIR, name + '.png')).convert('RGB')
        w, h = im.size
        d = list(im.getdata())
        return w, h, d
    out = {}
    for k in ('elev', 'wlev', 'scarpl', 'scarpu'):
        w, h, d = px(k)
        key = {'scarpl': 'scarpL', 'scarpu': 'scarpU'}.get(k, k)
        out[key] = [(p[0] << 8) | p[1] for p in d]
        if k == 'elev':
            out['wflag'] = [1 if p[2] > 127 else 0 for p in d]
        if k == 'wlev':
            out['whas'] = [1 if p[2] > 127 else 0 for p in d]
        assert (w, h) == tuple(meta['heights']['grid']), '%s.png is %dx%d, region.json says %s' % (k, w, h, meta['heights']['grid'])
    for k in ('scarpw', 'clim', 'rain', 'temp', 'biome', 'mask'):
        w, h, d = px(k)
        out[{'scarpw': 'scarpW'}.get(k, k)] = [p[0] for p in d]
    # the frame, the heights' grid, the biomes and the drainage are what KLAND reads; the rest of region.json stays in world/
    keep = {k: meta[k] for k in ('format', 'version', 'source', 'frame', 'heights', 'rain', 'temp', 'pressure', 'classes', 'biomes',
                                 'drainage', 'rivers', 'settlements')}
    body = ',\n'.join(' %s:%s' % (k, json.dumps(v, separators=(',', ':'))) for k, v in [('meta', keep)] + sorted(out.items()))
    return ('/* GENERATED by build.py from settlements/hook/world (cut.py: the %s round Hook\'s pixel). Edit the cut, not this. */\n'
            'var HOOK_WORLD_DATA={\n%s};\n' % (meta['source'], body))


def sky_helpers():
    """kits/ancients/src/52-sky-abc.js up to its first builder: the helpers the host builders share with the skyscrapers."""
    t = rd(os.path.join(ANCIENTS_SRC, '52-sky-abc.js'))
    i = t.index('\nfunction buildSkyA(')
    # ...and the glass-shard helper skyShards calls, with its own two helpers and its outline, from 42-offices.js
    o = rd(os.path.join(ANCIENTS_SRC, '42-offices.js'))
    a, b = o.index('\nfunction civDef('), o.index('\nconst CIV_WIN=')
    c, d = o.index('\nfunction civShardAt('), o.index('\n// INTERIORS.')
    return ('/* LIFTED by settlements/hook/build.py from kits/ancients/src/52-sky-abc.js (its helpers, before its builders) and '
            '42-offices.js (civDef, civTriGeo, CIV_SHARD_XY, civShardAt). GENERATED: edit the kit. */\n' + t[:i] + '\n' + o[a:b] + '\n' + o[c:d] + '\n')


def p1_bodies(paths, bodies):
    """The P1 fragments that are generated or read from elsewhere than the kit and src/: into `bodies` under their names."""
    for name, rel in CORE_PLACE:
        t = rd(os.path.join(ROOT, *rel.split('/')))
        if name in CORE_CLOSURE:
            t = re.sub(r'^(const|let|var|function)\b', r' \1', t, flags=re.M)
        bodies[name] = t
    bodies[WORLD_FRAG] = world_fragment()
    bodies[KCITY_FRAG] = kcity_bundle()
    bodies[SITE_FRAG] = site_fragment()
    bodies[SKY_FRAG] = sky_helpers()
    for name, src in HOST_FILES:
        t = rd(os.path.join(ANCIENTS_SRC, src))
        for rx, rep in HOST_SUBST.get(name, []):
            t = re.sub(rx, rep, t)
        bodies[name] = t
    for n in bodies:
        if n not in paths:
            paths[n] = None


def build_one(target, do_checks):
    site = SITE_TARGETS.get(target)
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s (expected %s)' % (target, tdir))
    paths = kit_paths()
    paths.update(own_src())                                 # Hook's own fragments; a same-named file shadows the kit's
    tdirs = [os.path.join(TARGETS, site['base']), tdir] if site else [tdir]   # a site target: its base's fragments, then its own
    for d in tdirs:
        tgt = {f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit()}
        clash = set(paths) & set(tgt)
        if clash:
            sys.exit('target %s shadows a fragment: %s' % (target, ', '.join(sorted(clash))))
        paths.update(tgt)
    bodies = {}
    for f in sorted(paths):
        with open(paths[f], encoding='utf-8', newline='') as fh:
            bodies[f] = fh.read()
    p1_bodies(paths, bodies)
    PB.DETERMINISTIC |= P1_DETERMINISTIC
    if site:
        site_bodies(paths, bodies)
        PB.DETERMINISTIC |= {n for n, _ in EDITOR_FILES} | {EDITOR_DOM} | {f for f in os.listdir(tdir) if f[0].isdigit()}
    order = sorted(paths)
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    # the kit's library pack, read from settlements/port/tex: one sidecar beside the page (dist/hook.tex.port.js),
    # or inlined with --inline-packs
    side = None if '--inline-packs' in sys.argv else {}
    bodies[PB.MATLIB_PACK] = matlib_pack.fragment(PORT, PACK_KEY, side=side)
    p2_bodies(bodies, side)
    for n in list(bodies):
        if n not in paths:
            paths[n] = None
    PB.DETERMINISTIC |= P2_DETERMINISTIC
    order = sorted(set(order) | set(bodies))

    if do_checks:
        errs = PB.check(order, bodies)
        if errs:
            print('BUILD RULES FAILED (%s):' % target)
            for e in errs:
                print('  -', e)
            sys.exit(1)

    html = ''.join(bodies[f] for f in order)
    m = re.search(r"const TITLE\s*=\s*'([^']*)'", bodies.get('89z-rows.js', ''))
    title = site['title'] if site else (m.group(1) if m else None)
    if title:
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % title, html, count=1)
    out = os.path.join(DIST, target + '.html')
    os.makedirs(DIST, exist_ok=True)
    if side:
        html = matlib_pack.write_sidecar(side, html, DIST, target + '.tex.js')
    with open(out, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest-%s.json' % target), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order}, fh, indent=1, sort_keys=True)
    return order, html, out


def vendor_check():
    """Every src/ file that shadows a settlements/port/src fragment is an adapted copy: report whether it still matches
    the kit's. Drift that is deliberate is recorded in KNOWN_ISSUES.md."""
    kit = {f: os.path.join(PORT_SRC, f) for f in os.listdir(PORT_SRC)}
    shadow = sorted(f for f in own_src() if f in kit)
    if not shadow:
        print('vendor-check: nothing vendored (src/ shadows no settlements/port/src fragment)')
        return True
    bad = 0
    for f in shadow:
        a = open(os.path.join(SRC, f), 'rb').read().replace(b'\r\n', b'\n')
        b = open(kit[f], 'rb').read().replace(b'\r\n', b'\n')
        same = a == b
        bad += not same
        print('  %-28s %s' % (f, 'same' if same else 'DRIFT from settlements/port/src/' + f))
    print('vendor-check: ' + ('OK' if not bad else '%d adapted file(s) differ (see KNOWN_ISSUES.md)' % bad))
    return True


def main():
    do_checks = '--no-checks' not in sys.argv
    wanted = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--target=')]
    if '--target' in sys.argv:
        wanted.append(sys.argv[sys.argv.index('--target') + 1])
    if not wanted:
        wanted = discover()
        if not wanted:
            sys.exit('no targets found under targets/*/89z-rows.js')
    for target in wanted:
        order, html, out = build_one(target, do_checks)
        blocks = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
        body = max(blocks, key=len) if blocks else ''
        chk = os.path.join(HERE, '.syntax-%s.js' % target)
        with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(body)
        try:
            r = subprocess.run([PB.find_node() or 'node', '--check', chk], capture_output=True, text=True)
            if r.returncode:
                print(r.stdout + r.stderr)
                sys.exit(1)
            syntax = '  syntax OK'
        except FileNotFoundError:
            syntax = '  syntax NOT CHECKED - run: python3 ../port/jscheck.py .syntax-%s.js' % target
        print('built %-24s (%2d fragments, %4.0f KB)%s%s'
              % (os.path.relpath(out, HERE).replace(os.sep, '/'), len(order), os.path.getsize(out) / 1024,
                 syntax, '' if do_checks else '  [checks skipped]'))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        with open(ki, encoding='utf-8') as fh:
            opened = [l.rstrip() for l in fh if l.startswith('- [ ]')]
        if opened:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(opened))
            for l in opened:
                print('  ' + l[6:])


if __name__ == '__main__':
    if '--vendor-check' in sys.argv:
        sys.exit(0 if vendor_check() else 1)
    main()
