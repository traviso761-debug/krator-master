#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/shade.html.

  00-head.html          page shell, opens <script>
  10..40                BIOME CORE      vendored from biomes/sedesert/src
  20-core-clock, -sched read from core/clock and core/sched (CORE_MODULES, one shared copy each, like Mungo)
  36-core-carve         the carve patches, read from core/terrain (one shared copy, not vendored)
  44-host-layout        HOST: where everything is (terrainH, waterH, the places, the switchback)
  45-host-stage         HOST: renderer, fields, flora mask, BIO.init, ground, water
  50..75                BIOME LEAVES    vendored from biomes/sedesert/src (flora and fauna)
  77-sim-*              the simulation records (SIM), read from core/simulation (CORE_MODULES)
  82-host-sky           HOST: the standard Krator sky (vendored from biomes/sedesert/src)
  83-host-world-json    generated: settlements/shade/world/*.json inlined as SHADE_WORLD_JSON for SIM.load
  84-host-life          HOST: the life layer declared into SIM (places, ports, the walkable grid as its
                        'pedestrian' layer, the population) and Shade's own audits
  86..91                HOST: overlays, build order, camera and dev tools, probe
  99-tail.html          closes <script>

  python3 build.py                 build, syntax-check, write VENDOR.json
  python3 build.py --vendor-check  also compare the vendored fragments with biomes/sedesert/src

The biome fragments never reference a host global except through BIO.host
(see biomes/sedesert/BIOME-API.md); the grep below fails the build if one does.
"""
import hashlib, json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
UP = os.path.normpath(os.path.join(HERE, '..', '..', 'biomes', 'sedesert', 'src'))
OUT = 'shade.html'
CORE_TERRAIN = ['36-core-carve.js']   # shared fragments read from core/terrain (opt-in by name; a local copy wins)
CORE_T = os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'terrain'))
CORE_MODULES = ['clock', 'sched', 'simulation']   # core/<module>/[0-9]*.js, every fragment (a local copy wins)
WORLD_DIR = os.path.join(HERE, 'world'); WORLD_FRAG = '83-host-world-json.js'
MATLIB_FRAG = '78a-host-matlib-pack.js'   # GENERATED: the library pack (main())
VENDORED = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '35-core-strata.js', '40-core-place.js',
            '50-biome-sedesert-species.js', '55-biome-sedesert-trees.js', '60-biome-sedesert-floor.js',
            '65-biome-sedesert-dress.js', '70-biome-sedesert.js', '75-biome-sedesert-fauna.js',
            '82-host-sky.js', '99-tail.html']
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'PLACES', 'SWB.', 'LIFE.', 'POOL.', 'BASIN.']

def sha(p): return hashlib.sha1(open(p, 'rb').read()).hexdigest()[:12]

def vendor_check():
    if not os.path.isdir(UP):
        print('vendor-check: %s not found; skipped' % UP); return 0
    # the biome core lives in core/biome since Oct 2026 (the kit reads it from there)
    CORE_UP = os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'biome'))
    up = lambda f: os.path.join(CORE_UP if f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') else UP, f)
    drift = [f for f in VENDORED if not os.path.exists(up(f)) or sha(up(f)) != sha(os.path.join(SRC, f))]
    print('vendor-check: ' + ('all %d vendored fragments identical to core/biome and biomes/sedesert/src' % len(VENDORED) if not drift
                              else 'DRIFT in ' + ', '.join(drift) + ' - fix upstream and re-vendor, or record it in KNOWN_ISSUES.md'))
    return 1 if drift else 0

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
    for f in CORE_TERRAIN:
        if f not in path: path[f] = os.path.join(CORE_T, f)
    for mod in CORE_MODULES:
        d = os.path.normpath(os.path.join(HERE, '..', '..', 'core', mod))
        for f in sorted(os.listdir(d)):
            if f[0].isdigit() and f.endswith('.js') and f not in path: path[f] = os.path.join(d, f)
    path[WORLD_FRAG] = None
    # the material library: core/materials/record (KMAT and the loader) and the GENERATED pack (tools/textures/matlib_pack.py
    # from tex/, written by tools/textures/pack.py from materials.json); src/78b-host-matlib.js binds it onto NOMAD.MAT
    REC = os.path.normpath(os.path.join(HERE, '..', '..', 'core', 'materials', 'record'))
    for f in ('23-mat-record.js', '25-matlib-host.js'):
        if f not in path: path[f] = os.path.join(REC, f)
    path[MATLIB_FRAG] = None
    sys.path.insert(0, os.path.normpath(os.path.join(HERE, '..', '..', 'tools', 'textures')))
    import matlib_pack
    frags = sorted(path)
    out, bad = [], []
    for f in frags:
        s = (world_json() if f == WORLD_FRAG else matlib_pack.fragment(HERE, 'shade') if f == MATLIB_FRAG
             else open(path[f], encoding='utf8').read())
        n = int(re.match(r'(\d+)', f).group(1))
        if 10 <= n < 80 and '-host-' not in f:
            for w in FORBID:
                if w in s: bad.append('%s: uses %s' % (f, w))
        out.append('\n// ==================== %s\n' % f if f.endswith('.js') else ''); out.append(s)
    if bad:
        print('BIOME FRAGMENT DEPENDS ON THE HOST:\n  ' + '\n  '.join(bad)); return 1
    os.makedirs(DIST, exist_ok=True)
    html = ''.join(out); open(os.path.join(DIST, OUT), 'w', encoding='utf8').write(html)
    m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
    chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf8').write(m.group(1) if m else '')
    try:
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    except FileNotFoundError:
        print('node is not installed: the syntax check did NOT run'); return 2
    print('built dist/%s  (%d fragments, %d KB, sha %s)  %s' % (OUT, len(frags), len(html) // 1024,
          hashlib.sha1(html.encode('utf8')).hexdigest()[:12], 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
    json.dump({f: sha(os.path.join(SRC, f)) for f in VENDORED}, open(os.path.join(HERE, 'VENDOR.json'), 'w'), indent=1)
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l for l in open(ki, encoding='utf8') if l.startswith('- [ ]')]
        if op: print('KNOWN_ISSUES.md: %d open item(s)' % len(op))
    rc = r.returncode
    if '--vendor-check' in sys.argv: rc = rc or vendor_check()
    return rc

if __name__ == '__main__':
    sys.exit(main())
