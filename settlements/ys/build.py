#!/usr/bin/env python3
"""Concatenate src/* + targets/<t>/* into dist/<t>.html (Ys, the half-drowned capital).

Adapted from settlements/iziz/build.py and settlements/port/build.py. The rules
that make parallel agent work safe on the Ancients-lineage contract:

  1. SEED DISCIPLINE. The PRNG is one global stream. Every builder opens with
     reseed(N) so an edit inside one builder cannot move the rubble of every
     structure built after it. Checked: each top-level `function build*()`
     opens with a reseed, and no two fragments claim overlapping seeds. A
     builder may run once per decay state (`reseed(N+d)` claims N..N+4) or
     once per variant (`reseed(N+(o.v|0))` claims N..N+7).

  2. SHARED SCOPE. Every fragment is concatenated into one <script>, so a
     column-0 `function x` / `const x` declared in two fragments silently
     clobbers. Collisions and over-generic names are errors.

  3. TOP-LEVEL ORDER IS LOAD-BEARING. kdef() calls fix the order in which
     kbake() creates InstancedMeshes, and TEX/MAT literals must exist before
     the kdef()s naming them. Fragments are concatenated in filename order.

  4. VENDORING. Fragments taken from other builds are listed in VENDORED with
     their upstream; VENDOR.json records their sha1 and `--vendor-check`
     reports drift. ADAPTED names the ones edited on purpose (the drift is
     expected there and recorded in KNOWN_ISSUES.md).

TARGETS ARE DISCOVERED: every directory under targets/ that holds an
`89z-rows.js` is a target and builds to dist/<name>.html (`city` builds to
dist/ys.html). node IS installed here (v22), so the syntax check is real;
`python3 jscheck.py .syntax-<target>.js` is the fallback on a machine without it.

Usage:  python3 build.py [--target X] [--no-checks] [--vendor-check]
"""
import hashlib, json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
CORE = os.path.join(ROOT, 'core', 'materials')
CORE_FILES = sorted(f for f in os.listdir(CORE) if f[0].isdigit())
CORE_OPT = os.path.join(CORE, 'opt')   # opt-in shared fragments: a build takes only the ones it names
CORE_OPT_FILES = ['69a-world-uv.js']   # vWorldUV, the world-unit UV hook the vendored Iziz vernacular uses (core/README.md)
# the material records (core/materials/record: KMAT and the browser loader; GODOT-PLAN.md Phase 3). Not 24-tex-def.js:
# its TEX would clash with the lineage's TEX texture table (core/materials/20-textures.js)
RECORD_DIR = os.path.join(ROOT, 'core', 'materials', 'record')
RECORD_FILES = ['23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js']
TEX_DIR = os.path.join(HERE, 'tex')        # the library pack: tools/textures/pack.py writes it from materials.json
PACK_FRAGMENT = '26-matlib-pack.js'        # GENERATED at build time from tex/, never written to src/


sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp
SIDE = {}   # the library packs' maps, written to dist/ys.tex.<key>.js and shared by every target's page


def matlib_pack():
    """The library textures materials.json names, as data URLs (KMAT.pack). It reads the committed tex/ files only,
    never the library or an image encoder, so the build stays deterministic."""
    import base64
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return '/* no tex/pack.json: Ys runs on its procedural textures */\nKMAT.pack(\'ys\', {});\n'
    pack = json.load(open(pj, encoding='utf-8'))
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'), 'card': e.get('card', False), 'tint': e['tint']['keep']}
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX_DIR, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    # the maps go in dist/ys.tex.ys.js beside the pages (SIDE; tools/textures/matlib_pack.py): ys.html would pass the
    # gallery's 16 MB a file with them inlined
    SIDE['ys'] = '{\n' + ',\n'.join(out) + '\n}'
    return _mp.loader('ys')


TARGET_OUT = {'city': 'ys.html'}          # every other target builds to dist/<name>.html

# shared modules a target opts into (core/<module>/, digit-prefixed fragments). The city takes core/rand: its
# placement pass (PLAN.md P3) draws from KRAND streams and cell seeds, never from the lineage's rng() or the
# sin-based h3/fbm, so the city's layout reproduces in Godot (GODOT.md item 4; GODOT-PLAN.md Phase 2).
TARGET_CORE = {'city': ['rand']}


def srcpath(f, base=None):
    """Path of fragment f in base (default src/), falling back to core/materials/."""
    p = os.path.join(base or SRC, f)
    if os.path.exists(p) or f not in CORE_FILES + CORE_OPT_FILES:
        return p
    return os.path.join(CORE if f in CORE_FILES else CORE_OPT, f)


# fragment -> upstream directory (relative to the repo root)
VENDORED = {}
for _f in ['10-core.js', '12-stats.js', '30-kit.js', '42-offices.js', '56-sky-d.js', '71-sky-h.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js',
           '38-helpers2.js', '50-registry.js', '52-sky-abc.js', '54-mat-concrete.js', '69-mat-salvage.js', '99-tail.html',
           # the podded Ancient stumps (Oct 5 2026): Sky E and K, the alternates (the Pierced Stack, the Attraction, the
           # Undulant house, the office terrace, the library) with the helpers they share, and the worn pass (the Library)
           '57-sky-e.js', '58-sky-f.js', '89m-sky-k.js', '8aj-alt-a-bole.js', '8aj-alt-b-stack.js', '8aj-alt-c-hotel.js', '8ak-alt-a-houses.js',
           '8al-alt-00-lib.js', '8al-alt-01-office-terrace.js', '8al-alt-06-library.js', '69w-worn.js',
           # the original offices and apartments as land hosts (69j-host-offices.js) and the civic and industrial ruins
           # in the shallows (64b-ys-ruins.js), with the helpers they need (64-houses-def: domRoom; 80-aa-battery)
           '82-apartments.js', '66-office-c.js', '64-houses-def.js', '80-aa-battery.js', '62-robotics.js',   # 62: civMergeGeo for the Assembly's hoods
           '46-bunker.js', '48-library.js', '73-police.js', '74-hospital.js', '75-hotel.js', '79-government.js', '89-lab.js', '72-datacenter.js']:
    VENDORED[_f] = 'kits/ancients/src'
for _f in ['70-port-core.js', '71-port-terrain.js', '72-port-kit.js', '73-port-edges.js', '74-port-dress.js']:
    VENDORED[_f] = 'settlements/port/src'
for _f in ['69b-vern-mat.js', '69c-vern-helpers.js', '81-sky.js', '92-camera.js', '93-labels.js']:
    VENDORED[_f] = 'settlements/iziz/src'
# the foreign quarter (phase 3, DESIGN §2 and §6; NOTES.md "The foreign quarter"): the Iziz Vernacular dwellings and
# trade, the Voth embassy and the Historians' chapterhouse (the Yuni-set ports) from Iziz; the Highlands kit's
# Republican dwellings with the textures, materials, motifs, helpers and carving they need. Byte-identical copies
# (--vendor-check); the city target alone takes them (TARGET_ONLY). Not taken: 72-vern-civic (nothing in it fits a
# foreign plot), 73b-hl-frame (74 does not need it, and its overrides of vnWin/vnGableRoof/vnHipRoof would redraw the
# Iziz houses), 75-rep-trade and 89y-hl-furnish (FURNISH places furniture from the master catalog; 88c stubs it).
VENDORED_IZIZ_FQ = ['70-vern-dwellings.js', '71-vern-trade.js', '75-port-embassy.js', '76-port-chapterhouse.js']
VENDORED_HL = ['70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '72-hl-helpers.js', '73-hl-carve.js', '74-rep-dwell.js']
for _f in VENDORED_IZIZ_FQ:
    VENDORED[_f] = 'settlements/iziz/src'
for _f in VENDORED_HL:
    VENDORED[_f] = 'settlements/highlands/src'
# Build-time renames in a vendored fragment's body (the file on disk stays byte-identical to its upstream, so
# --vendor-check stays clean and a re-vendor is a plain copy). Only for collisions in the shared scope that cannot be
# avoided: Ys's 60-hyk-mat.js already declares `HPAL` (the Hykkousoi palette, read by 88b) and `hC`, both `const`, and
# the Highlands kit declares the same two names (its formline palette; its hC is vC, exactly what Ys's hC does); the kit
# also overwrites `MAT.rock` and `MAT.turf` from core/materials/68-mat-v5.js, which 36-decor.js and 64-houses-def.js
# draw with. Recorded in KNOWN_ISSUES.md. (regex, replacement) pairs, applied in order.
VENDOR_SUBST = {}
for _f in VENDORED_HL:
    VENDOR_SUBST[_f] = [(r'\bHPAL\b', 'HLPAL'), (r'\bMAT\.rock\b', 'MAT.hlRock'), (r'\bMAT\.turf\b', 'MAT.hlTurf')]
VENDOR_SUBST['71-hl-mat.js'].insert(0, (r'^const hC=vC;', '/* hC: Ys has it (60-hyk-mat.js: hC = vC) */'))


def subst(f, body):
    for rx, rep in VENDOR_SUBST.get(f, []):
        body = re.sub(rx, rep, body, flags=re.M)
    return body
# vendored under another name (Ys's load order: the five host-ready types must sort after 68-mat-v5 and before the city's
# placer, which reads their HOSTSPEC_* at load): Ys name -> upstream name
VENDOR_RENAME = {'69h-host-%s.js' % p: '8ap-host-%s.js' % p for p in ['0-lib', 'a-facet', 'b-bastion', 'c-arcades', 'd-stalks', 'e-bellhall']}
for _f in VENDOR_RENAME:
    VENDORED[_f] = 'kits/ancients/src'
# the biome (phase 3, DESIGN §8): the shared biome core from core/biome and the north-west bay kit from biomes/nwbay/src,
# byte-identical, as src/86-bio-*.js (the dalab pattern). Only the city target takes them (TARGET_ONLY); the city's host
# binding is targets/city/86-bio-45-city-init.js (THREE before fragment 50) and 89-city-biome.js (the facts, the build).
BIO_VENDORED = ['10-core-head', '20-core-kit', '30-core-foliage', '40-core-place',
                '50-biome-nwbay-species', '55-biome-nwbay-trees', '60-biome-nwbay-floor',
                '65-biome-nwbay-dress', '70-biome-nwbay', '75-biome-nwbay-fauna']
for _b in BIO_VENDORED:
    VENDOR_RENAME['86-bio-%s.js' % _b] = _b + '.js'
    VENDORED['86-bio-%s.js' % _b] = 'core/biome' if '-core-' in _b else 'biomes/nwbay/src'
# src fragments only the named targets take: prefix -> targets. The kit sheet and the mock carry no biome and no
# foreign kits.
TARGET_ONLY = {'86-bio-': ('city',)}
for _f in VENDORED_IZIZ_FQ + VENDORED_HL:
    TARGET_ONLY[_f] = ('city',)
# vendored with deliberate edits: drift expected, recorded in KNOWN_ISSUES.md
ADAPTED = {'52-sky-abc.js', '54-mat-concrete.js', '56-sky-d.js', '71-sky-h.js', '71-port-terrain.js', '92-camera.js',
           '57-sky-e.js', '58-sky-f.js', '89m-sky-k.js', '8aj-alt-b-stack.js', '8aj-alt-c-hotel.js', '8ak-alt-a-houses.js',
           '8al-alt-01-office-terrace.js', '8al-alt-06-library.js',
           '82-apartments.js', '42-offices.js', '66-office-c.js'}   # the Ys branch draws one building of each, holed for the ways in

# Fragments with no builder in them: helpers, materials, the scene, the shell.
DETERMINISTIC = {
    '00-head.html', '08-core-rand.js', '10-core.js', '69a-world-uv.js', '42-offices.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
    '69b-vern-mat.js', '69c-vern-helpers.js',
    '70-port-core.js', '72-port-kit.js', '73-port-edges.js', '74-port-dress.js',
    '60-ys-registries.js', '60-hyk-mat.js', '61-hyk-shell.js', '62-hyk-helpers.js', '64-hyk-accrete.js',
    '35-furn-frame.js', '84-kit-geo.js', '87-city-layout.js', '84b-city-shore.js', '87b-city-nav.js', '87c-city-paint.js',
    '81-sky.js', '91-ys-probe.js', '92-camera.js', '93-labels.js', '93-ys-ui.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',
    '84-city-geo.js', '84-mock-geo.js', '90-ys-scene.js', '88-city-place.js', '93z-city-api.js', '87d-city-karst.js', '69h-host-0-lib.js', '88a-city-floors.js', '88-city-spans.js',
    '86-city-edits.js', '94-city-editor.js',   # the edits as data, and the live editor (no builder, no reseed)
    '23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js', '26-matlib-pack.js', '79z-ys-matlib.js', '86-bio-00-matlib-pack.js',   # the material records, the pack, the adapter
    '69i-host-ancients.js', '69w-worn.js', '8al-alt-00-lib.js',
    '69j-host-offices.js', '64b-ys-ruins.js', '80-aa-battery.js',   # the office/apartment host specs, the ruin placer, the bunker's AA battery
    '89-city-biome.js',   # the biome's host binding and build: the biome keeps its own PRNG, the lineage's rng() is never drawn
    # the foreign quarter: the Highlands kit's textures, materials, motifs, helpers and carving carry no builder; the
    # city's foreign pass (88c) picks and places from KRAND streams, and every builder it calls reseeds itself
    '70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '72-hl-helpers.js', '73-hl-carve.js', '88c-city-foreign.js',
}

# IIFE-scoped by contract (the biome core and biome fragments): their column-0
# declarations live inside a closure and they keep their own PRNG.
SCOPED_PREFIXES = ('86-bio-',)
def scoped(f):
    return f.startswith(SCOPED_PREFIXES)


RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED_ARG = re.compile(r'\breseed\(\s*([^)]*?)\s*\)')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)

GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}

SEED_COLLISION_EXCEPTIONS = set()


def seeds_claimed(arg):
    """Expand a reseed() argument into the set of integer seeds it can produce."""
    arg = arg.replace(' ', '')
    m = re.fullmatch(r'(-?\d+)', arg)
    if m:
        return {int(m.group(1))}
    m = re.fullmatch(r'(-?\d+)\+d', arg)
    if m:
        n = int(m.group(1))
        return set(range(n, n + 5))
    m = re.fullmatch(r'd>0\?(-?\d+):(-?\d+)', arg)
    if m:
        return {int(m.group(1)), int(m.group(2))}
    m = re.fullmatch(r'(-?\d+)\+\(\(?[A-Za-z_$][\w$.]*\.v\|0\)?\)?', arg)   # reseed(N+(o.v|0)): variants 0..7
    if m:
        n = int(m.group(1))
        return set(range(n, n + 8))
    return set()


def check(order, bodies):
    errs, claims = [], {}
    for f in order:
        if not f.endswith('.js') or scoped(f):
            continue
        body = bodies[f]
        for m in RE_BUILDER.finditer(body):
            name, head = m.group(1), m.group(3)
            if 'reseed(' not in head:
                errs.append('%s: %s() does not open with reseed(N)' % (f, name))
        for m in RE_RESEED_ARG.finditer(body):
            for s in seeds_claimed(m.group(1)):
                claims.setdefault(s, set()).add(f)
        if f not in DETERMINISTIC and not RE_BUILDER.search(body) and 'reseed(' not in body:
            errs.append('%s: generative fragment with no builder and no reseed(N). Add one, or list the '
                        'file in DETERMINISTIC in build.py.' % f)
    collided = {}
    for s, files in sorted(claims.items()):
        if len(files) > 1:
            collided.setdefault(tuple(sorted(files)), []).append(s)
    for files, ss in sorted(collided.items()):
        if files in SEED_COLLISION_EXCEPTIONS:
            continue
        errs.append('seed(s) %s claimed by more than one fragment: %s'
                    % (','.join(str(x) for x in ss[:6]) + ('...' if len(ss) > 6 else ''), ', '.join(files)))
    decl = {}
    for f in order:
        if not f.endswith('.js') or scoped(f):
            continue
        for rx in (RE_DECL, RE_DECL_MULTI):
            for m in rx.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
    for name, files in sorted(decl.items()):
        if len(files) > 1:
            errs.append('top-level name `%s` declared in more than one fragment: %s' % (name, ', '.join(sorted(files))))
        elif name in GENERIC and files != {'10-core.js'}:
            errs.append('top-level name `%s` in %s is too generic for a shared scope; prefix it' % (name, ', '.join(files)))
    return errs


def discover():
    if not os.path.isdir(TARGETS):
        return []
    return sorted(t for t in os.listdir(TARGETS) if os.path.isfile(os.path.join(TARGETS, t, '89z-rows.js')))


def build_one(target, do_checks):
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s' % target)
    src = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()
           and all(target in tg for pre, tg in TARGET_ONLY.items() if f.startswith(pre))}
    src.update({f: os.path.join(CORE, f) for f in CORE_FILES if f not in src})
    src.update({f: os.path.join(CORE_OPT, f) for f in CORE_OPT_FILES if f not in src})
    src.update({f: os.path.join(RECORD_DIR, f) for f in RECORD_FILES if f not in src})
    for mod in TARGET_CORE.get(target, []):
        mdir = os.path.join(ROOT, 'core', mod)
        src.update({f: os.path.join(mdir, f) for f in os.listdir(mdir) if f[0].isdigit() and f.endswith('.js') and f not in src})
    tgt = {f: os.path.join(tdir, f) for f in os.listdir(tdir) if f[0].isdigit()}
    clash = set(src) & set(tgt)
    if clash:
        sys.exit('target %s shadows a src fragment: %s' % (target, ', '.join(sorted(clash))))
    paths = dict(src); paths.update(tgt)
    order = sorted(list(paths) + [PACK_FRAGMENT])
    SIDE.clear()   # this target's packs only (each target writes its own sidecars; they share names, so no pruning)
    bodies = {PACK_FRAGMENT: matlib_pack()}
    for f in order:
        if f == PACK_FRAGMENT:
            continue
        with open(paths[f], encoding='utf-8', newline='') as fh:
            bodies[f] = subst(f, fh.read())   # VENDOR_SUBST: the recorded renames, on the body only
    if any(f.startswith('86-bio-') for f in order):   # the vendored nwbay biome: its library pack, before the biome code
        bodies['86-bio-00-matlib-pack.js'] = _mp.fragment(os.path.join(ROOT, 'biomes', 'nwbay'), 'nwbay', side=SIDE)
        order = sorted(order + ['86-bio-00-matlib-pack.js'])
    if do_checks:
        errs = check(order, bodies)
        if errs:
            print('BUILD RULES FAILED (%s):' % target)
            for e in errs:
                print('  -', e)
            sys.exit(1)
    html = ''.join(bodies[f] for f in order)
    m = re.search(r"const TITLE\s*=\s*'([^']*)'", bodies.get('89z-rows.js', ''))
    if m:
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % m.group(1), html, count=1)
    out = os.path.join(DIST, TARGET_OUT.get(target, target + '.html'))
    os.makedirs(DIST, exist_ok=True)
    html = _mp.write_sidecar(SIDE, html, DIST, 'ys.tex.js', prune=False)
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest-%s.json' % target), 'w', encoding='utf-8') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order}, fh, indent=1, sort_keys=True)
    return order, html, out


def vendor_manifest():
    out = {}
    for f in sorted(VENDORED):
        p = srcpath(f)
        if os.path.exists(p):
            with open(p, 'rb') as fh:
                out[f] = {'sha1': hashlib.sha1(fh.read()).hexdigest()[:12], 'from': VENDORED[f],
                          'adapted': f in ADAPTED}
    with open(os.path.join(HERE, 'VENDOR.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
    return out


def vendor_check():
    same, adapted, drift, missing = [], [], [], []
    for f in sorted(VENDORED):
        up = os.path.join(ROOT, VENDORED[f], VENDOR_RENAME.get(f, f))
        here = srcpath(f)
        if not os.path.exists(up):
            missing.append(f); continue
        eq = open(up, 'rb').read() == open(here, 'rb').read()
        if eq:
            same.append(f)
        elif f in ADAPTED:
            adapted.append(f)
        else:
            drift.append(f)
    print('vendor-check: %d identical, %d adapted on purpose (%s)' % (len(same), len(adapted), ', '.join(adapted) or '-'))
    if missing:
        print('vendor-check: missing upstream: ' + ', '.join(missing))
    print('vendor-check: ' + ('DRIFT in ' + ', '.join(drift) + ' - re-vendor or move to ADAPTED and note it in KNOWN_ISSUES.md'
                              if drift else 'no unexpected drift'))


def main():
    if '--vendor-check' in sys.argv:
        vendor_check()
        return
    vendor_manifest()
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
        body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
        chk = os.path.join(HERE, '.syntax-%s.js' % target)
        with open(chk, 'w', encoding='utf-8') as fh:
            fh.write(body)
        try:
            r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
            if r.returncode:
                print(r.stdout + r.stderr)
                sys.exit(1)
            syntax = '  syntax OK'
        except FileNotFoundError:
            syntax = '  syntax NOT CHECKED (no node: run python3 jscheck.py %s)' % os.path.basename(chk)
        print('built %-22s (%2d fragments, %4.0f KB)%s%s'
              % (os.path.relpath(out, HERE), len(order), os.path.getsize(out) / 1024, syntax,
                 '' if do_checks else '  [checks skipped]'))


if __name__ == '__main__':
    main()

# --- remind whoever is building of the open issues (see KNOWN_ISSUES.md) ---
_ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki, encoding='utf-8') if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md - tell the user before making changes:' % len(_open))
        for l in _open:
            print('  ' + l[6:])
