#!/usr/bin/env python3
"""Build the dam basins overlay (biomes/dambasins/PLAN.md) on the Ancient Port kit: dist/<station>.html.

The dam basins are an OVERLAY (biomes/nsemiarid/PLAN.md, section 3): the drained beds of the north basin's two dam lakes.
Their docks and hulks are the Ancient Port kit's (kits/port), so this build reads the kit IN PLACE, as Hook does
(settlements/hook/build.py, from which this file is adapted): every fragment of kits/port/src, the kit's core/
lists and its texture pack. It adds core/rand (KRAND) and core/terrain's basin (KBASIN, the bed's marks) and its own
fragments. Nothing of the kit is copied, except src/71-port-terrain.js: an ADAPTED copy (a dry port: the bed's ground,
no sea, no underwater fade, no port scrub), which `--vendor-check` reports (KNOWN_ISSUES.md).

Stations are targets: targets/<station>/89z-rows.js (the layout) and 91z-views.js (the views).
  targets/port      station 1, the old port on the 900 m line (PLAN.md, section 3)

Usage:  python3 build.py [--target port] [--no-checks] [--inline-packs]
        python3 build.py --vendor-check     (every src/ file that shadows a kits/port/src fragment)
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
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
PORT = os.path.join(ROOT, 'kits', 'port')         # the Ancient Port kit, read in place
PORT_SRC = os.path.join(PORT, 'src')
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
PACK_KEY = 'port'                                        # the kit's pack (src/88y-port-matlib.js binds KMAT.pack('port'))


def port_build():
    """kits/port/build.py as a module: its check(), find_node(), DETERMINISTIC and core file lists. Its import-time
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
# core/rand and core/terrain's basin: IIFE-scoped, their own hashes, nothing drawn from the kit's stream; and this
# build's deterministic fragments (the bed is a function of x and z; the layout and views are tables)
EXTRA_CORE = {'08-core-rand.js': os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'),
              '50-core-tags.js': os.path.join(ROOT, 'core', 'tags', '50-core-tags.js'),   # core/tags: the wrecks and the debris are records (91a, 91b)
              '52-core-tags-vocab.js': os.path.join(ROOT, 'core', 'tags', '52-core-tags-vocab.js'),
              '53-core-tags-host.js': os.path.join(ROOT, 'core', 'tags', '53-core-tags-host.js'),
              '40-core-basin.js': os.path.join(ROOT, 'core', 'terrain', '40-core-basin.js'),
              '44-core-farfield.js': os.path.join(ROOT, 'core', 'terrain', '44-core-farfield.js'),   # KFAR: the land past the grid (91e, 2026-11-08)
              '44-core-farfield-draw.js': os.path.join(ROOT, 'core', 'terrain', 'host', '44-core-farfield-draw.js'),
              '89-atmos-3d-dust.js': os.path.join(ROOT, 'core', 'atmos', '89-atmos-3d-dust.js'),   # the bed's dust (91c)
              '89-atmos-4-weather.js': os.path.join(ROOT, 'core', 'atmos', '89-atmos-4-weather.js'),   # the weather (91d, 2026-10-26)
              '89-atmos-9-host.js': os.path.join(ROOT, 'core', 'atmos', '89-atmos-9-host.js'),   # its selector
              '89-atmos-e-weatherhost.js': os.path.join(ROOT, 'core', 'atmos', 'host', '89-atmos-e-weatherhost.js')}   # ATMOS.bindWeather (91d)
PB.DETERMINISTIC |= set(EXTRA_CORE) | {'50-db-wrecks.js', '80-db-bed.js', '81-db-hulks.js', '89c-db-ground.js', '91a-db-wrecks.js', '52-db-flotsam.js', '91b-db-flotsam.js', '91c-db-dust.js', '91d-db-weather.js',
                   '79-db-site.js', '91y-db-dam.js', '91e-db-far.js', '44-core-farfield.js', '44-core-farfield-draw.js'}   # the stations' sites and the graveyard's dam (2026-11-08): KRAND hashes, no stream   # the wrecks: KRAND hashes, no stream   # 81: the hulks' pose from KRAND hashes, no stream


# A STATION'S FLORA (PLAN.md, D2; 2026-11-08): the biome kits that own the ground a station lies over, read in place, the way
# Ys reads the north-west bay's (settlements/ys/build.py, BIO_VENDORED): the shared biome core and the kit's fragments under a
# '91m-bio-' prefix (after the scene and the wrecks, before the camera: the ground is final, and the first frame has them),
# the kit's library pack beside them, and the station's own binding (its target's 91m-bio-45-*.js and 91m-bio-89-*.js). The
# biome core and the kits are closure-scoped and keep their own PRNG, so the port lineage's rule check (its column-0 names,
# its seeds) leaves them out (BIO_PREFIX).
BIO_PREFIX = '91m-bio-'
BIO_CORE = {'05-core-space.js': ('core', 'space', '20-core-space.js'), '10-core-head.js': ('core', 'biome', '10-core-head.js'),
            '20-core-kit.js': ('core', 'biome', '20-core-kit.js'), '30-core-foliage.js': ('core', 'biome', '30-core-foliage.js'),
            '31j-core-joint.js': ('core', 'biome', '31j-core-joint.js'), '40-core-place.js': ('core', 'biome', '40-core-place.js')}
TARGET_KITS = {
    # station 2: the n semiarid kit on the old bed (its overlay's flora, nsemiarid/PLAN.md section 5)
    'graveyard': {'pack': ('nsemiarid', 'nsemiarid'),
                  'files': {'50-ns-species.js': ('biomes', 'nsemiarid', 'src', '50-biome-nsemiarid-species.js'),
                            '55-ns-trees.js': ('biomes', 'nsemiarid', 'src', '55-biome-nsemiarid-trees.js'),
                            '60-ns-floor.js': ('biomes', 'nsemiarid', 'src', '60-biome-nsemiarid-floor.js'),
                            '70-ns-build.js': ('biomes', 'nsemiarid', 'src', '70-biome-nsemiarid.js')}},
    # station 3: the hyperjungle on the east bed (Korona's warm wet floor, biomes/korona/BIOME-API.md), read inside a closure of its
    # own: its 41-globals declares the core's helpers at top level, which the port lineage declares too (open/close below)
    'east': {'pack': ('hyperjungle', 'hyperjungle'),
             'core': {'32-core-variants.js': ('core', 'biome', '32-core-variants.js'), '33-core-fungoid.js': ('core', 'biome', '33-core-fungoid.js'),
                      '34-core-impostor.js': ('core', 'biome', '34-core-impostor.js'), '35-core-anim.js': ('core', 'biome', '35-core-anim.js'),
                      '36-core-walker.js': ('core', 'biome', '36-core-walker.js'), '38-core-fire.js': ('core', 'biome', '38-core-fire.js')},
             'files': {'47-hj-globals.js': ('biomes', 'hyperjungle', 'src', '41-hyperjungle-globals.js'),
                       '50-hj-species.js': ('biomes', 'hyperjungle', 'src', '50-biome-hyperjungle-species.js'),
                       '55-hj-trees.js': ('biomes', 'hyperjungle', 'src', '55-biome-hyperjungle-trees.js'),
                       '60-hj-floor.js': ('biomes', 'hyperjungle', 'src', '60-biome-hyperjungle-floor.js'),
                       '65-hj-dress.js': ('biomes', 'hyperjungle', 'src', '65-biome-hyperjungle-dress.js'),
                       '70-hj-build.js': ('biomes', 'hyperjungle', 'src', '70-biome-hyperjungle.js')},
             'virtual': {'46-hj-open.js': '\n(function(){   /* the hyperjungle closure (build.py TARGET_KITS) */\n',
                         '71-hj-close.js': '\nwindow.HYPERJUNGLE=HYPERJUNGLE;})();   /* only the kit leaves its closure */\n'}},
}


def target_kits(target):
    """{fragment name: path} of the biome core and the kits a station reads in place, or {}."""
    T = TARGET_KITS.get(target)
    if not T:
        return {}
    out = {BIO_PREFIX + f: os.path.join(ROOT, *p) for f, p in BIO_CORE.items()}
    out.update({BIO_PREFIX + f: os.path.join(ROOT, *p) for f, p in T.get('core', {}).items()})
    out.update({BIO_PREFIX + f: os.path.join(ROOT, *p) for f, p in T['files'].items()})
    return out


def discover():
    if not os.path.isdir(TARGETS):
        return []
    return sorted(t for t in os.listdir(TARGETS) if os.path.isfile(os.path.join(TARGETS, t, '89z-rows.js')))


def kit_paths():
    """{fragment name: path} of the kit as kits/port/build.py assembles it (its src/, then the core lists it
    names), without the pack fragment."""
    src = {f: os.path.join(PORT_SRC, f) for f in os.listdir(PORT_SRC) if f[0].isdigit()}
    src.update({f: os.path.join(PB.CORE, f) for f in PB.CORE_FILES if f not in src})
    src.update({f: os.path.join(PB.LOD_DIR, f) for f in PB.LOD_FILES if f not in src})
    src.update({f: os.path.join(PB.SHADER_DIR, f) for f in PB.CORE_SHADER if f not in src})
    src.update({f: os.path.join(PB.ATMOS_DIR, f) for f in PB.CORE_ATMOS if f not in src})
    src.update({f: os.path.join(PB.WATER_DIR, f) for f in PB.CORE_WATER if f not in src})
    src.update({f: os.path.join(ROOT, 'core', 'materials', 'record', f) for f in PB.RECORD_FILES if f not in src})
    src.update({f: q for f, q in PB.DOOR_FILES.items() if f not in src})   # core/door and the kit's openings (kits/port/build.py)
    src.update({f: p for f, p in EXTRA_CORE.items() if f not in src})
    return src


def own_src():
    return {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()} if os.path.isdir(SRC) else {}


def build_one(target, do_checks):
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s (expected %s)' % (target, tdir))
    paths = kit_paths()
    paths.update(own_src())                                 # this build's own fragments; a same-named file shadows the kit's
    tgt = {f: os.path.join(tdir, f) for f in os.listdir(tdir) if f[0].isdigit()}
    clash = set(paths) & set(tgt)
    if clash:
        sys.exit('target %s shadows a fragment: %s' % (target, ', '.join(sorted(clash))))
    paths.update(tgt)
    paths.update(target_kits(target))                       # a station's flora: the biome core and its kits, in place
    order = sorted(paths)

    bodies = {}
    for f in order:
        with open(paths[f], encoding='utf-8', newline='') as fh:
            bodies[f] = fh.read()
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    # the kit's library pack, read from kits/port/tex: one sidecar beside the page (dist/<station>.tex.port.js),
    # or inlined with --inline-packs
    side = None if '--inline-packs' in sys.argv else {}
    bodies[PB.MATLIB_PACK] = matlib_pack.fragment(PORT, PACK_KEY, side=side)
    order = sorted(order + [PB.MATLIB_PACK])
    if target in TARGET_KITS:                               # the kit's own pack, before its species read it
        kd, key = TARGET_KITS[target]['pack']
        bodies[BIO_PREFIX + '44-matlib-pack.js'] = matlib_pack.fragment(os.path.join(ROOT, 'biomes', kd), key, side=side)
        order = sorted(order + [BIO_PREFIX + '44-matlib-pack.js'])
        for vf, text in TARGET_KITS[target].get('virtual', {}).items():   # a kit's closure, opened and closed
            bodies[BIO_PREFIX + vf] = text
            order = sorted(order + [BIO_PREFIX + vf])
    if BSRC.LISTING:   # --list-sources: what this station's page is made of; main() reports every station's
        BSRC.note(paths)
        return order, None, None

    if do_checks:
        errs = PB.check([f for f in order if not f.startswith(BIO_PREFIX)], bodies)   # the biome's closure-scoped files keep their own rules
        if errs:
            print('BUILD RULES FAILED (%s):' % target)
            for e in errs:
                print('  -', e)
            sys.exit(1)

    html = ''.join(bodies[f] for f in order)
    m = re.search(r"const TITLE\s*=\s*'([^']*)'", bodies.get('89z-rows.js', ''))
    if m:
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % m.group(1), html, count=1)
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
    """Every src/ file that shadows a kits/port/src fragment is an adapted copy: report whether it still matches
    the kit's. Drift that is deliberate is recorded in KNOWN_ISSUES.md."""
    kit = {f: os.path.join(PORT_SRC, f) for f in os.listdir(PORT_SRC)}
    shadow = sorted(f for f in own_src() if f in kit)
    if not shadow:
        print('vendor-check: nothing vendored (src/ shadows no kits/port/src fragment)')
        return True
    bad = 0
    for f in shadow:
        a = open(os.path.join(SRC, f), 'rb').read().replace(b'\r\n', b'\n')
        b = open(kit[f], 'rb').read().replace(b'\r\n', b'\n')
        same = a == b
        bad += not same
        print('  %-28s %s' % (f, 'same' if same else 'DRIFT from kits/port/src/' + f))
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
        if BSRC.LISTING:
            continue
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
    BSRC.report(vendored=[os.path.join(PORT_SRC, f) for f in own_src() if os.path.isfile(os.path.join(PORT_SRC, f))])
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
