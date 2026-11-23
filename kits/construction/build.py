#!/usr/bin/env python3
"""Build dist/construction.html: the Construction kit's sheet (KCONS round three cultures' houses at six stages).

Usage: python3 build.py [--no-checks] [--list-sources]

The kit itself is two fragments a settlement reads in place (README.md, API.md):
  src/10-cons-site.js   KCONS.site: the plot, the piles, the scaffold (the isle demo reads this one alone)
  src/20-cons-lib.js    KCONS.libMats: the library's maps on a shared material table (opt-in)
The sheet is the kit and what it is drawn round, each in a <script> of its own, in this order:
  core                  core/shader (KHOOK, KCOLOR), core/rand (KRAND), core/tags (KTAGS, its vocabulary and labels),
                        core/space (KSPACE: the inspector's index), core/walk (KWALK), core/materials/record (KMAT, TEX, the
                        library host and bind), the library packs (beside the page: dist/construction.tex.<key>.js), core/city's
                        54-city-host-construct.js (KCITY.constructMesh), the kit's src/1x-2x
  ISK, IZV              the Islanders kit and the Iziz Vernacular sealed as the isle demo seals them (settlements/isle-demo/
                        bundles.py isk_bundle, izv_bundle: read in place), their packs (kits/islanders/tex, settlements/iziz/tex: the families KEEP names)
  XAK                   the Xanadu kit sealed by its own kits/xanadu/kit_bundle.py, its pack (settlements/xanadu/tex)
  pieces, sky           settlements/isle-demo/src/58-isle-protos.js (isleProto, isleFlatten: read in place, as Longsong reads it)
                        and the placeholder sky (core/atmos/placeholder: 80-sky-hash.js, 81-sky.js, KratorSky)
  host                  core/host's shell (core/clock, camera, loop, panel, probe), the inspector and the polygon tool
  sheet                 src/80-cons-sheet.js (the rows, the stages, the records, window._api), src/99-tail.html
Nothing is copied: every file is read live at build time. Checks: the port lint (tools/check_port.py), unique top-level
names across the kit's own fragments, `node --check` on every script when node exists.
"""
import json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places. None when there is none."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
        print('NOTE: $NODE=%s is not a node binary; looking elsewhere' % env)
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node', 'C:/Program Files/nodejs/node.exe',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'), os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
NL = '\n'
KIT_ID = 'construction'
OUT = os.path.join(DIST, KIT_ID + '.html')
C = lambda *p: os.path.join(ROOT, 'core', *p)

# the core modules, by path (README.md "CORE MODULES ARE NOT OPTIONAL")
sys.path.insert(0, C('host'))
import host as khost
CORE_HOST = khost.SHELL + khost.KEYS + ['93-host-inspect.js', '94-host-polytool.js']   # KEYS: the one key map (core/host/92k-host-keys.js)
sys.path.insert(0, C('atmos', 'placeholder'))
import placeholder as psky   # the placeholder sky (KratorSky), read in place; the page's core has no h3(), so SKY_H3
CORE_JS = ([khost.path(f) for f in khost.SHADER] + [C('rand', '08-core-rand.js')] +
           [C('tags', f) for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js')] +
           [C('space', '20-core-space.js'), C('walk', '20-core-walk.js')] +
           [C('materials', 'record', f) for f in ('23-mat-record.js', '24-tex-def.js', '25-matlib-host.js', '26-matlib-bind.js')])
CORE_CITY = [C('city', '54-city-host-construct.js')]   # KCITY.constructMesh: the piece revealed in build order
KIT_JS = ['10-cons-site.js', '20-cons-lib.js']
SHEET_JS = ['80-cons-sheet.js']
ISLE = os.path.join(ROOT, 'settlements', 'isle-demo')
PROTOS = os.path.join(ISLE, 'src', '58-isle-protos.js')   # isleProto, isleFlatten (read in place)
XA = os.path.join(ROOT, 'settlements', 'xanadu')          # the Xanadu kit's pack is still the settlement's (as Longsong takes it)
# the families the sheet's three pieces draw (variant 0; read off the page 2026-11-09: each material's maps against the packs),
# so the page carries about 15 MB of maps, not 68 (the kits' whole packs). A new row or piece: add its families here (the sheet's
# _api.rows() names the pieces; a family left out draws the kit's procedural look, not an error)
KEEP = {'islanders': ('hull', 'iron', 'patBand', 'patGableW2', 'softwood', 'stone', 'tarredB', 'thatch', 'wood'),
        'iziz': ('cloth', 'corrugate', 'plaster', 'stone', 'thatch', 'white', 'wood', 'woodV'),
        'xanadu': ('cloth', 'corrugate', 'plaster', 'stone', 'thatch', 'white', 'wood', 'woodV', 'xEarth', 'xTiles', 'xWash')}


def fams(build_dir):
    with open(os.path.join(build_dir, 'tex', 'pack.json'), encoding='utf-8') as f:
        return list(json.load(f).get('families', {}))


def rd(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def cat(paths):
    return ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(p), NL, rd(p), NL, NL) for p in paths)


def load(name, path):
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)


def main():
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    side = {}
    dirs = {'islanders': os.path.join(ROOT, 'kits', 'islanders'), 'iziz': os.path.join(ROOT, 'settlements', 'iziz'), 'xanadu': XA}
    packs = matlib_pack.fragment(HERE, KIT_ID, side=side, own=True) + ''.join(
        matlib_pack.fragment(dirs[k], k, exclude=[f for f in fams(dirs[k]) if f not in KEEP[k]], side=side) for k in ('islanders', 'iziz', 'xanadu'))
    bundles = load('isle_bundles', os.path.join(ISLE, 'bundles.py'))
    isk, _ = bundles.isk_bundle()
    izv, _ = bundles.izv_bundle()
    xak, _ = load('xanadu_kit_bundle', os.path.join(ROOT, 'kits', 'xanadu', 'kit_bundle.py')).bundle('XAK')
    own = {f: rd(os.path.join(SRC, f)) for f in KIT_JS + SHEET_JS}
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f, body in own.items():
            for m in RE_DECL.finditer(body): decl.setdefault(m.group(1), set()).add(f)
        errs += ['top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))) for n, fs in sorted(decl.items()) if len(fs) > 1]
    if errs:
        print('BUILD RULES FAILED:'); [print('  -', e) for e in errs]; sys.exit(1)
    sc = lambda s: '<script>' + NL + s + '</script>' + NL
    kit = ''.join('/* ---- kits/construction/src/%s ---- */%s%s%s' % (f, NL, own[f], NL) for f in KIT_JS)
    scripts = [cat(CORE_JS) + packs + cat(CORE_CITY) + kit, isk, izv, xak,
               cat([PROTOS] + [psky.path(f) for f in psky.SKY_H3]),
               cat([khost.path(f) for f in sorted(CORE_HOST)]),
               ''.join('/* ---- kits/construction/src/%s ---- */%s%s%s' % (f, NL, own[f], NL) for f in SHEET_JS)]
    html = rd(os.path.join(SRC, '00-head.html')) + ''.join(sc(s) for s in scripts) + rd(os.path.join(SRC, '99-tail.html'))
    BSRC.report()   # --list-sources: every file read so far is what the page is made of; then exit
    os.makedirs(DIST, exist_ok=True)
    html = matlib_pack.write_sidecar(side, html, DIST, KIT_ID + '.tex.js')
    with open(OUT, 'w', encoding='utf-8', newline=NL) as f:
        f.write(html)
    node = find_node()
    syn = '  syntax NOT CHECKED (no node: verify.py is the check)'
    if node:
        chk = os.path.join(HERE, '.syntax.js')
        for i, js in enumerate(re.findall(r'<script>(.*?)</script>', html, re.S)):
            with open(chk, 'w', encoding='utf-8', newline=NL) as f:
                f.write(js)
            r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
            if r.returncode:
                os.remove(chk); print('script %d:' % i, r.stdout + r.stderr); sys.exit(1)
        os.remove(chk)
        syn = '  syntax OK'
    print('built dist/%s.html (%.0f KB, packs beside it)%s' % (KIT_ID, os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        with open(ki, encoding='utf-8') as f:
            op = [l.rstrip() for l in f if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op)); [print('  ' + l[6:]) for l in op]


if __name__ == '__main__':
    main()
