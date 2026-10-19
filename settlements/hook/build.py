#!/usr/bin/env python3
"""Build Hook (settlements/hook/PLAN.md) on the Ancient Port kit: dist/hook.html.

Hook is a city on the Ancient Port kit (settlements/port). This build reads the kit IN PLACE: every fragment of
settlements/port/src, the kit's core/ lists (core/materials, core/lod, core/atmos, core/water, core/materials/record)
and the kit's texture pack (settlements/port/tex, through tools/textures/matlib_pack.py). Nothing of the kit is
copied here. The kit's own build rules (seed discipline, shared scope, registration keys) come from
settlements/port/build.py, imported, so Hook's fragments are checked by the same code.

Hook adds, in filename order with the kit's fragments:
  targets/<target>/*      the layout (89z-rows.js: TITLE, PORT_LAYOUT_DEF) and the views (91z-views.js)
  src/*                   Hook's own fragments, when it has any. A src/ file with the SAME NAME as a kit fragment
                          shadows it (an ADAPTED copy): `--vendor-check` diffs every such file against the kit's.

Usage:  python3 build.py [--target hook] [--no-checks] [--inline-packs]
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
    return sorted(t for t in os.listdir(TARGETS) if os.path.isfile(os.path.join(TARGETS, t, '89z-rows.js')))


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
              ('50-core-tags.js', 'core/tags/50-core-tags.js'), ('52-core-tags-vocab.js', 'core/tags/52-core-tags-vocab.js')]
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
P1_DETERMINISTIC = {n for n, _ in CORE_PLACE} | {KCITY_FRAG, SITE_FRAG, SKY_FRAG, '78a-host-0-lib.js', '76-hook-ground.js', '90a-hook-city.js', '90b-hook-city-draw.js'}


def rd(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


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
        bodies[name] = rd(os.path.join(ROOT, *rel.split('/')))
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
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s (expected %s)' % (target, tdir))
    paths = kit_paths()
    paths.update(own_src())                                 # Hook's own fragments; a same-named file shadows the kit's
    tgt = {f: os.path.join(tdir, f) for f in os.listdir(tdir) if f[0].isdigit()}
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
    order = sorted(paths)
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    # the kit's library pack, read from settlements/port/tex: one sidecar beside the page (dist/hook.tex.port.js),
    # or inlined with --inline-packs
    side = None if '--inline-packs' in sys.argv else {}
    bodies[PB.MATLIB_PACK] = matlib_pack.fragment(PORT, PACK_KEY, side=side)
    order = sorted(order + [PB.MATLIB_PACK])

    if do_checks:
        errs = PB.check(order, bodies)
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
