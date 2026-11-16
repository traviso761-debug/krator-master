#!/usr/bin/env python3
"""Build Loj Twenny: dist/loj-twenny.html (the first Tungang hold: PLAN.md; kits/tungang/PLAN.md sections 3.2, 5, 6).

Usage: python3 build.py [--no-checks]

The page is one <script> of, in this order (no filename sort: each piece is named here, as the ride lab's build does):
  00-head.html                    the page's head
  core/shader                     KHOOK, KCOLOR (core/host's SHADER: every page)
  core/rand, core/clock, core/sched, core/space, core/walk (+ frame/26), core/tags 50/52/53
  core/terrain 39 (KCAVERN), host/39e (drawRock), host/39h (the rock cut)
  core/city/cavern/10-city-cavern.js   the cavern setting the hold is laid on (KCITY.cavern)
  core/simulation 77-sim-*.js and ride/78-81   the people, the economies, the trades, riding
  core/cavelight/10                KCAVELIGHT: the lamp code and the wax light as records
  (KMAT is the sealed kit's: tungang_bundle's core/materials/record, exported to the page; the Line's pack registers on it and its
   lining reads it, so the page carries one material host, not two: tools/check_assembly CLASH)
  GENERATED  kits/motor-vehicles (vehicle_bundle: ancient, line, tungang): the Line's cars (KratorVehicles)
  GENERATED  kits/tungang (tungang_bundle: lean textures, the Tungang catalog pieces): TG, the Tungang set
  core/host FULL + UNDERGROUND (the follow camera, the deck cut, the deck map and the line map, the fade), the stocks panel,
  core/walk/frame/95 (riding), core/cavelight/90 (the light's host)
  src/20-lt-plan.js ... 90-lt-checks.js   the hold: its plan, its sim, its train, its cavern, its scene, its life, its checks,
                                  in filename order with station 3's fragments (biomes/line/stations: the site, the window, the
                                  lining, the way, the trains, the works), the transit kit's line kind and the Line's texture pack
  src/98-lt-take.js, src/99-tail.html
Checks: the port lint (tools/check_port.py), no top-level name declared in two of src/'s fragments, node --check.
"""
import json, os, re, subprocess, sys

import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places
    (/opt/node*/bin, /usr/local/bin, ~/.nvm, ~/.volta; the newest first). None when
    there is none: the build then says plainly that the syntax was NOT checked.
    Every build.py carries this same function; a fix belongs in all of them."""
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
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE)); CORE = os.path.join(ROOT, 'core')
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
sys.path.insert(0, os.path.join(CORE, 'host')); import host as khost
sys.path.insert(0, os.path.join(ROOT, 'kits', 'motor-vehicles')); import vehicle_bundle   # the Line's cars (KratorVehicles)
sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang')); import tungang_bundle   # the Tungang set (TG)
OUT = os.path.join(DIST, 'loj-twenny.html')
C = lambda *p: os.path.join(CORE, *p)
SIMD = C('simulation')
SIMF = sorted(f for f in os.listdir(SIMD) if f.startswith('77-sim-') and f.endswith('.js'))
OWN = sorted(f for f in os.listdir(SRC) if f[0].isdigit() and f.endswith('.js') and not f.startswith('98-'))
HOST = sorted(set(khost.FULL + khost.UNDERGROUND) - {'20-core-clock.js', '20-core-space.js'})
# station 3 of the Line (biomes/line, read in place): its window and its drawing are the hold's spine (PLAN.md section 1). Its data:
# the site, the state, the Line's core, its help, the Rift record, the window; its drawing: the lining, the way, the trains, the works
LINE_DIR = os.path.join(ROOT, 'biomes', 'line', 'stations')
LINE_FRAGS = [os.path.join(LINE_DIR, 'station', f) for f in ('44z-host-site.js', '44zs-host-station.js', '48-line-window.js', '88-host-station.js')]
LINE_FRAGS += [os.path.join(LINE_DIR, 'common', f) for f in ('47-line-core.js', '47b-line-help.js', '47c-line-record.js', '85-host-lining.js', '86-host-way.js', '87-host-train.js')]
# the transit kit's `line` kind (KTRANSIT: the record the window is cut from, and its drawing of the lining), as the Line's build takes it
LINE_FRAGS += [os.path.join(ROOT, 'kits', 'ancient-transit', 'src', f) for f in ('40-tr-records.js', '41-tr-path.js', '43b-tr-subway.js', '43c-tr-line.js', '46-tr-mats.js', '56c-tr-draw-line.js')]
PAGE = sorted([os.path.join(SRC, f) for f in OWN] + LINE_FRAGS + ['@44-host-matlib-pack.js'], key=lambda p: os.path.basename(p).lstrip('@'))
FRAGS = ([os.path.join(SRC, '00-head.html')] + [khost.path(f) for f in khost.SHADER]
         + [C('rand', '08-core-rand.js'), khost.path('20-core-clock.js'), C('sched', '20-core-sched.js'), C('space', '20-core-space.js'),
            C('walk', '20-core-walk.js'), C('walk', 'frame', '26-core-walk-frame.js')]
         + [C('tags', f) for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js')]
         + [C('terrain', '39-core-cavern.js'), C('terrain', 'host', '39e-core-cavern-draw.js'), C('terrain', 'host', '39h-core-cavern-cut.js')]
         + [C('city', 'cavern', '10-city-cavern.js')]
         + [os.path.join(SIMD, f) for f in SIMF]
         + [C('simulation', 'ride', f) for f in ('78-sim-ride.js', '79-sim-ride-porters.js', '80-sim-ride-line.js', '81-sim-ride-choose.js')]
         + [C('cavelight', '10-core-cavelight.js')]
         + ['@vehicles', '@tungang']
         + [khost.path(f) for f in HOST]
         + [C('walk', 'frame', '95-walk-frame-host.js'), C('cavelight', '90-core-cavelight-host.js')]
         + PAGE
         + [os.path.join(SRC, '98-lt-take.js'), os.path.join(SRC, '99-tail.html')])
TG_CULTURES = ['tungang', 'generic', 'generic-goods']


def main():
    files = [p for p in FRAGS if not p.startswith('@')]
    tg_js, tg_files = tungang_bundle.bundle(tex='lean', with_files=True, furniture=True, cultures=TG_CULTURES, furniture_tex=True)
    BSRC.report(files + [os.path.join(ROOT, *f.split('/')) for f in tg_files if not f.endswith('/tex')] + [os.path.join(ROOT, 'kits', 'catalog', 'tex', 'pack.json')] + [os.path.join(ROOT, 'biomes', 'line', 'tex', 'pack.json')] +
                [os.path.join(ROOT, 'kits', 'tungang', 'tungang_bundle.py'), os.path.join(ROOT, 'kits', 'motor-vehicles', 'vehicle_bundle.py')])
    if '--no-checks' not in sys.argv:
        RE = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
        seen, errs = {}, []
        for f in OWN:
            for n in RE.findall(open(os.path.join(SRC, f), encoding='utf-8').read()):
                if n in seen: errs.append('top-level name `%s` in %s and %s' % (n, seen[n], f))
                seen[n] = f
        if errs:
            print('BUILD RULES FAILED:'); [print('  -', e) for e in errs]; sys.exit(1)
    out = []
    for p in FRAGS:
        if p == '@vehicles':
            out.append('\n// ==================== kits/motor-vehicles (vehicle_bundle.bundle: ancient, line, tungang)\n' + vehicle_bundle.bundle(['ancient', 'line', 'tungang']))
            continue
        if p == '@44-host-matlib-pack.js':
            sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures')); import matlib_pack
            out.append('\n// ==================== biomes/line/tex (matlib_pack.fragment: the Line\'s own sets)\n' + matlib_pack.fragment(os.path.join(ROOT, 'biomes', 'line'), 'line', own=True))
            continue
        if p == '@tungang':
            out.append('\n// ==================== kits/tungang (tungang_bundle.bundle: lean, furniture %s)\n' % ', '.join(TG_CULTURES) + tg_js)
            continue
        s = open(p, encoding='utf-8').read()
        out.append(('\n// ==================== %s\n' % os.path.relpath(p, ROOT).replace(os.sep, '/') if p.endswith('.js') else '') + s)
    html = ''.join(out)
    os.makedirs(DIST, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    body = html.split('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8').write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode: print(r.stdout + r.stderr); sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node: verify.py is the check)'
    print('built dist/loj-twenny.html (%d fragments, %.0f KB)%s' % (len(FRAGS), os.path.getsize(OUT) / 1024, syn))


if __name__ == '__main__':
    main()
