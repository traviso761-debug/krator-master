#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/shade.html.

  00-head.html          page shell, opens <script>
  10..40                BIOME CORE      read in place from core/biome (CORE_BIOME), with core/space
  20-core-clock, -sched read from core/clock and core/sched (CORE_MODULES, one shared copy each, like Mungo)
  36-core-carve         the carve patches, read from core/terrain (one shared copy, not vendored)
  44-host-layout        HOST: where everything is (terrainH, waterH, the places, the switchback)
  45-host-stage         HOST: renderer, fields, flora mask, BIO.init, ground, water
  50..75                BIOME LEAVES    read in place from biomes/sedesert/src (flora and fauna)
  77-sim-*              the simulation records (SIM), read from core/simulation (CORE_MODULES)
  89-atmos-*            core/atmos: its core and presets, the shared sky (sky/) and its host (host/) (CORE_ATMOS)
  89-host-sky           HOST: the shared sky, ATMOS.skyBiome at the south-east desert's place (as sedesert's own)
  83-host-world-json    generated: settlements/shade/world/*.json inlined as SHADE_WORLD_JSON for SIM.load
  84-host-life          HOST: the life layer declared into SIM (places, ports, the walkable grid as its
                        'pedestrian' layer, the population) and Shade's own audits
  86..88                HOST: overlays, the preset views, build order
  89t-shade-tags        HOST: the page's core/tags registry (KTAGS.page): buildings, places, trees, water, carve patches
  89s-shade-trades      DATA: the Voth census of trades, SHADE_TRADES (tools/check_trades.py)
  08-core-rand, 50..53-core-tags   read from core/rand and core/tags (CORE_MODULES)
  90..99-host-*, 20-core-space, 88-core-minimap   read from core/host (CORE_HOST: the whole interface less core/edits;
                        core/host/README.md): the camera, the loop, the panel, the inspector, marks, pictures, minimap,
                        cutaway, the probe
  91-shade-probe        HOST: Shade's own probe fields and checks (window._api, handed to the host's probe)
  99-shade-take         HOST: the take (KHOST.take: views, ground, layers, inspector words, the probe's fields)
  99-tail.html          closes <script>

  python3 build.py                 build, syntax-check
  python3 build.py --vendor-check  say what is read in place (nothing is vendored)

The biome fragments never reference a host global except through BIO.host
(see biomes/sedesert/BIOME-API.md); the grep below fails the build if one does.
"""
import hashlib, json, os, re, subprocess, sys
try:                                   # the docs are UTF-8; a Windows console defaults to cp1252 (as iziz/build.py)
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(HERE)), 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
UP = os.path.normpath(os.path.join(HERE, '..', '..', 'biomes', 'sedesert', 'src'))
OUT = 'shade.html'
CORE_TERRAIN = ['36-core-carve.js']   # shared fragments read from core/terrain (opt-in by name; a local copy wins)
CORE_T = os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'terrain'))
CORE_MODULES = ['clock', 'sched', 'simulation', 'rand', 'tags']   # core/<module>/[0-9]*.js, every fragment (a local copy wins)
# core/host (core/host/README.md; ROADMAP.md section 10, stage 3 step 5): the whole interface less core/edits (no editor world yet)
sys.path.insert(0, os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'host')))
import host as khost
CORE_HOST = [f for f in khost.FULL if f != '40-core-edits.js']
CORE_HOST = CORE_HOST + khost.KEYS   # the one key map and the one walk mode (core/host/92k-host-keys.js; TODO.md, Viewers)
WORLD_DIR = os.path.join(HERE, 'world'); WORLD_FRAG = '83-host-world-json.js'
MATLIB_FRAG = '78a-host-matlib-pack.js'   # GENERATED: the library pack (main())
# The south-east desert biome, READ IN PLACE (2026-11-03, MODULARITY-PLAN.md step 4's ride-along; until then src/ held
# copies that had fallen behind core/biome's move and the kits' BIO.kit hooks): the biome core from core/biome as the
# biome's own build lists it (CORE_BIOME, less its export and stage), core/space for its keep-clear and scatter grids,
# and the biome's flora, fauna, sky and tail from biomes/sedesert/src. A src/ copy with the same name still wins.
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '34-core-impostor.js', '35-core-anim.js',
              '40-core-place.js']   # 31b, 34, 35-anim: what the kit and sedesert's leaves now call (BIO.leafOn, BIO.impostor*, BIO.animMat)
CORE_B = os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'biome'))
CORE_SPACE = os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'space', '20-core-space.js'))
BIOME = ['35-core-strata.js', '50-biome-sedesert-species.js', '55-biome-sedesert-trees.js', '60-biome-sedesert-floor.js',
         '65-biome-sedesert-dress.js', '70-biome-sedesert.js', '75-biome-sedesert-fauna.js', '99-tail.html']
# the shared sky (core/atmos/SKY-PLAN.md section 9; 2026-11-08): sedesert's painted dome (its 82-host-sky.js) is gone, so this page
# takes core/atmos's core, presets, sky and its host by path, as biomes/sedesert/build.py does; src/89-host-sky.js calls ATMOS.skyBiome
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', 'sky/89-atmos-e-skymodel.js', 'sky/89-atmos-f-skypresets.js',
              'sky/89-atmos-g-sky.js', 'host/89-atmos-h-skyhost.js', 'host/89-atmos-i-skybiome.js']
VENDORED = []
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'PLACES', 'SWB.', 'LIFE.', 'POOL.', 'BASIN.']

def sha(p): return hashlib.sha1(open(p, 'rb').read()).hexdigest()[:12]

def vendor_check():
    missing = [p for p in [os.path.join(CORE_B, f) for f in CORE_BIOME] + [CORE_SPACE] + [os.path.join(UP, f) for f in BIOME]
               if not os.path.isfile(p)]
    print('vendor-check: nothing vendored; the biome (core/biome, core/space, biomes/sedesert/src: %d fragments) is read in place%s'
          % (len(CORE_BIOME) + 1 + len(BIOME), ('; MISSING ' + ', '.join(missing)) if missing else ''))
    return 1 if missing else 0

def world_json():
    """settlements/shade/world/*.json -> SHADE_WORLD_JSON, the argument of SIM.load (as Mungo's build.py). Each file
    is a list of records, one per line; its name before the first '-' or '.' is the record kind."""
    recs = {}
    for f in sorted(os.listdir(WORLD_DIR)) if os.path.isdir(WORLD_DIR) else []:
        if not f.endswith('.json'):
            continue
        try:
            data = json.load(open(os.path.join(WORLD_DIR, f), encoding='utf8'))
        except Exception as e:
            sys.exit('world/%s: %s' % (f, e))
        if not isinstance(data, list):
            sys.exit('world/%s: must be a list of records' % f)
        for i, r in enumerate(data):
            if isinstance(r, dict):
                r.setdefault('_src', '%s:%d' % (f, i + 1))
        recs.setdefault(re.split(r'[-.]', f, maxsplit=1)[0], []).extend(data)
    return ('// ==================== WORLD DATA (generated from settlements/shade/world/*.json; edit the JSON, never this)\n'
            '// The life layer\'s records for SIM.load (core/simulation/SCHEMA.md): activities, factions, orgs, roles, events.\n'
            'const SHADE_WORLD_JSON = %s;\n' % json.dumps(recs, separators=(',', ':'), ensure_ascii=False))

def main():
    path = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
    for f in CORE_BIOME:
        path.setdefault(f, os.path.join(CORE_B, f))
    path.setdefault('20-core-space.js', CORE_SPACE)
    for f in BIOME:
        path.setdefault(f, os.path.join(UP, f))
    for f in CORE_TERRAIN:
        if f not in path: path[f] = os.path.join(CORE_T, f)
    for f in CORE_ATMOS:
        path.setdefault(os.path.basename(f), os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'atmos', f)))
    for mod in CORE_MODULES:
        d = os.path.normpath(os.path.join(HERE, '..', '..', 'core', mod))
        for f in sorted(os.listdir(d)):
            if f[0].isdigit() and f.endswith('.js') and f not in path: path[f] = os.path.join(d, f)
    khost.resolve(path, CORE_HOST)   # a src/ copy with a shell file's name would win (none: 90-host-camera.js went, 2026-10-15)
    path[WORLD_FRAG] = None
    # the material library: core/materials/record (KMAT and the loader) and the GENERATED pack (tools/textures/matlib_pack.py
    # from tex/, written by tools/textures/pack.py from materials.json); src/78b-host-matlib.js binds it onto NOMAD.MAT
    REC = os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'materials', 'record'))
    for f in ('23-mat-record.js', '25-matlib-host.js'):
        if f not in path: path[f] = os.path.join(REC, f)
    path[MATLIB_FRAG] = None
    path['44-host-biome-pack.js'] = None   # the vendored sedesert biome's library pack, before the biome code (50-...)
    sys.path.insert(0, os.path.normpath(os.path.join(HERE, '..', '..', 'tools', 'textures')))
    import matlib_pack
    frags = sorted(path)
    out, bad = [], []
    for f in frags:
        s = (world_json() if f == WORLD_FRAG else matlib_pack.fragment(HERE, 'shade') if f == MATLIB_FRAG
             else matlib_pack.fragment(os.path.normpath(os.path.join(HERE, '..', '..', 'biomes', 'sedesert')), 'sedesert') if f == '44-host-biome-pack.js'
             else open(path[f], encoding='utf8').read())
        n = int(re.match(r'(\d+)', f).group(1))
        if 10 <= n < 80 and '-host-' not in f and not f.startswith('77-sim-'):   # core/simulation is no biome fragment (77-sim-6's comment says "THE POOL.")
            for w in FORBID:
                if w in s: bad.append('%s: uses %s' % (f, w))
        out.append('\n// ==================== %s\n' % f if f.endswith('.js') else ''); out.append(s)
    if bad:
        print('BIOME FRAGMENT DEPENDS ON THE HOST:\n  ' + '\n  '.join(bad)); return 1
    BSRC.report(vendor_check=vendor_check)   # --list-sources: every file read so far is what the page is made of (and what --vendor-check compares); then exit
    os.makedirs(DIST, exist_ok=True)
    html = ''.join(out); open(os.path.join(DIST, OUT), 'w', encoding='utf8', newline='\n').write(html)
    m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
    chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf8').write(m.group(1) if m else '')
    try:
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    except FileNotFoundError:
        print('node is not installed: the syntax check did NOT run'); return 2
    print('built dist/%s  (%d fragments, %d KB, sha %s)  %s' % (OUT, len(frags), len(html) // 1024,
          hashlib.sha1(html.encode('utf8')).hexdigest()[:12], 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l for l in open(ki, encoding='utf8') if l.startswith('- [ ]')]
        if op: print('KNOWN_ISSUES.md: %d open item(s)' % len(op))
    rc = r.returncode
    if '--vendor-check' in sys.argv: rc = rc or vendor_check()
    return rc

if __name__ == '__main__':
    sys.exit(main())
