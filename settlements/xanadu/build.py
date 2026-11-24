#!/usr/bin/env python3
"""Concatenate src/* + targets/<t>/* into dist/<t>.html (Xanadu building kit).

Also enforces the rules that make subagent work safe on this kit:

  1. SEED DISCIPLINE. The PRNG is one global stream. Every builder opens with
     reseed(N) so that each structure is its own stream and an edit inside one
     builder cannot move the rubble of every structure built after it. This
     script checks two things: that each build*() actually opens with a
     reseed, and that no two fragments claim overlapping seeds. Note that a
     builder is called once per decay state, so `reseed(9100+d)` claims
     9100..9102 and `reseed(d>0?9801:9800)` claims 9800..9801 — the check
     expands both forms before looking for collisions.

  2. SHARED SCOPE. Every fragment is concatenated into one <script>, so a
     column-0 `function x` / `const x` declared in two fragments silently
     clobbers. Collisions and over-generic names are errors.

  3. TOP-LEVEL ORDER IS LOAD-BEARING. kdef() calls fix the order in which
     kbake() creates InstancedMeshes, and the TEX/MAT object literals must
     exist before the kdef()s naming them. Fragments are therefore contiguous
     slices of the original file and are concatenated in filename order; never
     reorder a top-level statement across a fragment boundary.

  4. MANIFEST. Writes build-manifest.json: a sha1 per fragment, so the planner
     can see which fragments a subagent actually touched.

Usage:  python build.py [--no-checks] [--target xanadu] [--vendor-check]

NOTE ON THE SYNTAX CHECK: it runs `node --check` with the node find_node() finds
($NODE, PATH, /opt/node*/bin, ~/.nvm), and node may not be installed.
When node is missing this script says so plainly and does not claim the file is
syntactically valid — use jscheck.py (headless Chromium) or verify.py, which
loads the page and reads the on-screen error panel. Do not read a green build as
"the JavaScript parses".
"""
import hashlib, json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
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


try:                                   # KNOWN_ISSUES.md uses em dashes
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))   # repo root: biomes/, core/, kits/, settlements/
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
sys.path.insert(0, os.path.join(ROOT, 'kits', 'xanadu'))
import xanadu as kxa   # the Xanadu kit, read in place (MODULARITY-PLAN.md step 4)
UPSTREAM = {'highlands': os.path.join(ROOT, 'settlements', 'highlands'), 'iziz': os.path.join(ROOT, 'settlements', 'iziz'),
            'ancients': os.path.join(ROOT, 'kits', 'ancients'), 'iziz-vernacular': os.path.join(ROOT, 'kits', 'iziz-vernacular'),
            'placeholder': os.path.join(ROOT, 'core', 'atmos', 'placeholder')}
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
CORE = os.path.join(ROOT, 'core', 'materials')   # shared material fragments (core/README.md)
CORE_FILES = sorted(f for f in os.listdir(CORE) if f[0].isdigit())
LOD_DIR = os.path.join(ROOT, 'core', 'lod')        # shared level of detail (core/lod/README.md)
LOD_FILES = sorted(f for f in os.listdir(LOD_DIR) if f[0].isdigit())
# core/rand (KRAND: the tags' uid is its hash) and core/tags (the registry REG is read into: src/91t-xanadu-tags.js)
TAGS_FILES = {f: os.path.join(ROOT, 'core', d, f) for d in ('rand', 'tags') for f in os.listdir(os.path.join(ROOT, 'core', d))
              if f[0].isdigit() and f.endswith('.js')}
# core/host (core/host/README.md; ROADMAP.md section 10, step 5): the camera, loop, panel, probe, inspector, marks, pictures,
# minimap and cutaway, with core/clock and core/minimap, as Iziz and Highlands take them. Not core/space: the vendored biome's
# scatter takes another path when it is on the page (settlements/iziz/KNOWN_ISSUES.md, 2026-10-13). Not core/edits: no editor
# world yet.
sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost
CORE_HOST = [f for f in khost.FULL if f not in ('20-core-space.js', '40-core-edits.js')]
# core/door (KDOOR: the doors' records; KGLASS: the glass; KDOORHOST: posing a leaf, the frame tick, the E key) and the
# Vernacular's openings (69e5: IZDOOR.leaf, the vDoorLeaf and vWinClear items), read in place: the kit's real doors and glass
# (kits/xanadu/src/71c-xa-openings.js) draw through them; src/90-xa-doors.js hands each leaf to the host after a bake
DOOR_FILES = {f: os.path.join(ROOT, 'core', 'door', f) for f in kxa.DOOR + ['90-core-door-host.js']}
DOOR_FILES.update({f: os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src', f) for f in kxa.OPENINGS_VERN})
# the interiors (2026-11-09; kits/xanadu/README.md "Hollow walls and interiors"): the Vernacular's hollow and auto bodies (69e,
# 69e6), core/furnish (the placement pass), core/walk (the floors, walls, stairs and door blocks) and, GENERATED at build time,
# the catalog's furniture for the cultures below with the interiors core and its Xanadu set (69d, as Highlands takes it);
# src/89y-xa-interiors.js is the glue (?interiors=1 turns them on)
DOOR_FILES.update({f: os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src', f) for f in kxa.HOLLOW_VERN})
for _d in ('furnish', 'walk'):
    _dd = os.path.join(ROOT, 'core', _d)
    DOOR_FILES.update({f: os.path.join(_dd, f) for f in os.listdir(_dd) if f[0].isdigit() and f.endswith('.js')})
FURN_CULTURES = ['xanadu', 'iziz', 'generic', 'scrap']
VIRTUAL = {'69d-furniture-bundle.js'}


def virtual_bodies(more_sets=()):
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    # tex: the library's detail maps on every piece (2026-11-10); decals: the delivered pictures of the citadel's hangings
    # (kits/catalog/materials.json "decals", core/materials/PROMPTS-NEEDED.md section 57), the painted stand-ins until then.
    # more_sets: a --kit page with no interiors of its own adds its kit.json "interiorSets" here (Stage 8 B9, 2026-11-24:
    # Kirstabal's 'xanadu-lake', which was kits/xanadu/src/87k1 read in place). Without them the bundle is what it was
    sets = ['xanadu', 'xanadu-citadel'] + [s for s in more_sets if s not in ('xanadu', 'xanadu-citadel')]
    return {'69d-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES, tex=True, decals=True) + kit_bundle.bundle(sets)}
CORE_OPT = os.path.join(CORE, 'opt')   # opt-in shared fragments: a build takes only the ones it names
# the material library (core/materials/record: KMAT, the loader and the in-place bind; not 24-tex-def.js, whose TEX
# clashes with core/materials 20-textures.js): materials.json -> tools/textures/pack.py -> tex/ -> the GENERATED
# 88x-matlib-pack.js (tools/textures/matlib_pack.py); src/88y-xanadu-matlib.js binds it onto MAT (KMAT.bindMat)
RECORD_FILES = ['23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js']
MATLIB_PACK = '88x-matlib-pack.js'
PICS_PACK = '88x1-pics-pack.js'           # the citadel hangings' pictures (citadel/materials.json), generated
CORE_OPT_FILES = ['69a-world-uv.js']   # vWorldUV, the world-unit UV hook (core/README.md)


def srcpath(f, base=None):
    """Path of fragment f in base (default src/), falling back to core/materials/ (and to
    core/materials/opt/ for the opt-in files in CORE_OPT_FILES).
    A local copy with the same name overrides the shared one."""
    p = os.path.join(base or SRC, f)
    if os.path.exists(p) or f not in CORE_FILES + CORE_OPT_FILES:
        return p
    return os.path.join(CORE if f in CORE_FILES else CORE_OPT, f)

# A target is a showcase built from the shared src/ fragments plus its own site
# table and view list, merged into the one sorted filename order.
TARGET_CORE = {'erewhon': ['mask']}   # core/<module> fragments a target takes (core/mask: the placement raster)
# core/atmos (the wave clock, the skylight) and core/water (core/water/README.md: still water, its CPU twins) for the kit
# page: its pools, basins, channels and bowls are WATER.still records (targets/xanadu/90-xa-still.js). Listed by name.
ATMOS_DIR = os.path.join(ROOT, 'core', 'atmos')
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js']
WATER_DIR = os.path.join(ROOT, 'core', 'water')
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
CORE_WATER_EXT = ['56-core-water-breakup.js']   # the breakup (core/water ext/56), on by default since 2026-11-09
TARGET_FILES = {'xanadu': [(ATMOS_DIR, CORE_ATMOS), (WATER_DIR, CORE_WATER), (os.path.join(WATER_DIR, 'ext'), CORE_WATER_EXT)],
                'scrap': [(ATMOS_DIR, CORE_ATMOS), (WATER_DIR, CORE_WATER), (os.path.join(WATER_DIR, 'ext'), CORE_WATER_EXT),
                          (os.path.join(TARGETS, 'xanadu'), ['90-xa-still.js'])]}   # the scrap sheet's still water, read in place
TARGET_OUT = {
    'erewhon': 'erewhon.html',          # the city of Erewhon, Pearl of Xanadu
    'xanadu': 'xanadu.html',            # the whole kit in rows by family
    'scrap': 'xanadu-scrap.html',       # Scrap Xanadu (kits/xanadu/PLAN-SCRAP.md): the reclaimed set's sheet
}
# the kit files a target takes when not all of them (kxa.FILES): the scrap sheet shows the opt-in scrap package on the
# kit's foundation alone (86b-xa-plants: the plant shim xnTree routes through)
TARGET_KIT = {'scrap': kxa.FOUNDATION + ['86b-xa-plants.js'] + kxa.SCRAP}

# --kit <folder>: build a vassal kit written on the Xanadu kit's contract (XA.def on VERN.def, the xn* helpers; kits/qiblai,
# its PLAN.md section 6) on this build's page, with no copy of it, as settlements/iziz/build.py --kit builds Pylon and Talia.
# The kit folder holds src/ (its own fragments, merged into the one sorted order with this build's; a name that clashes stops
# the build), targets/<t>/ (rows and views, as here) and kit.json: {"targets": {"kit": "qiblai.html"}, "deterministic":
# [...], "external": ["repo/relative/fragment.js"], "externalDirs": ["kits/x/src"], "scoped": [closures], "packFrom": "kits/x",
# "core": {"kit": ["mask"]}, "files": {"kit": [["core/water", [...]]]}}
# ("external" fragments are read in place by their own names, or, as a pair ["repo/relative/file.js", "69m-name.js"], under the
# name given, so a file without a number prefix (core/region/data/xan-tune.js) sorts where the kit needs it instead of after
# 99-start.js (2026-11-23, settlements/marches' pitfall); "core" and "files" are TARGET_CORE and TARGET_FILES for the
# kit's targets). Its pages and manifests go to the kit's dist/ and folder; its KNOWN_ISSUES.md is the one printed. The
# kit's build.py calls this. Without --kit nothing below changes: Xanadu's own pages come out byte-identical.
KIT = None
if '--kit' in sys.argv:
    _kd = os.path.abspath(sys.argv[sys.argv.index('--kit') + 1])
    with open(os.path.join(_kd, 'kit.json'), encoding='utf-8') as _fh:
        KIT = json.load(_fh)
    KIT['dir'] = _kd
    TARGETS = os.path.join(_kd, 'targets')
    DIST = os.path.join(_kd, 'dist')
    TARGET_OUT = dict(KIT['targets'])
    TARGET_CORE = dict(KIT.get('core', {}))
    TARGET_FILES = {t: [(os.path.join(ROOT, *d.split('/')), fs) for d, fs in v] for t, v in KIT.get('files', {}).items()}
# a kit's targets with interiors (kit.json "interiors": [targets], "furniture": [catalog culture files], "furnitureTex": the
# library's detail maps on the pieces, "interiorSets": [kits/interiors sets]) take the catalog's furniture bundle and the interiors core as one generated fragment, as Iziz's
# --kit pages do (KratorFurniture, KratorInteriors, ROOM, furnishRoom: closures, so the shared-scope rules skip it)
KIT_FURN_BUNDLE = '88z-kit-furniture-bundle.js'
KIT_MATLIB_PACK = '88x2-kit-matlib-pack.js'   # a kit's own library pack (kit.json "pack"), generated

# Fragments with no builder in them: helpers, materials, the scene, the shell.
DETERMINISTIC = {
    '23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js', '86-bio-00-matlib-pack.js', '88x-matlib-pack.js', '88x1-pics-pack.js', '88y-xanadu-matlib.js',   # the material library (no rnd())
    '09-lod.js', '97-lod-auto.js',                     # core/lod: the shared level of detail
    '69a-world-uv.js',                                 # core/materials/opt: the shared world-UV hook
    '00-head.html', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
    '69b-vern-mat.js', '69c-vern-helpers.js',          # vendored from ../iziz/src (Iziz Vernacular helpers)
    '70-xa-tex.js', '71-xa-mat.js', '72-xa-helpers.js',   # the Xanadu vocabulary
    '78l-xa-moorish-data.js', '78m-xa-moorish.js',       # the citadel's Moorish and Mughal parameters and vocabulary (no rnd())
    '88-xa-dress.js',                                     # the Palopó paint twins
    '86-bio-45-init.js', '86b-xa-plants.js',              # the biome host binding and the plant shim
    '90-scene.js', '91-probe.js', '92-camera.js', '93-labels.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',        # per-target site table and view list
    '81-sky.js',                          # KratorSky, vendored from ../iziz/src
    '83-er-data.js', '84-er-geo.js', '85-er-paint.js', '86-bio-46-er-init.js', '87-er-layout.js', '88-er-place.js',
    '90a-er-world.js', '90b-er-build.js', '93-er-ui.js',   # the Erewhon city target
}
# core/mask: the placement raster and its transforms (no randomness); every fragment the module ships
DETERMINISTIC |= {'06-core-khook.js', '06b-core-kcolor.js'}   # core/shader (no rnd())
DETERMINISTIC |= {f for f in os.listdir(os.path.join(ROOT, 'core', 'mask')) if f[0].isdigit() and f.endswith('.js')}
DETERMINISTIC |= set(CORE_ATMOS) | set(CORE_WATER) | set(CORE_WATER_EXT) | {'90-xa-still.js'}   # core/atmos, core/water and their taker: nothing placed
DETERMINISTIC |= set(CORE_HOST) | set(TAGS_FILES) | {'99-start.js', '91t-xanadu-tags.js', '89-xa-trades.js'}   # core/host (no rnd()); core/rand, core/tags; the take; REG into core/tags (reads only)
DETERMINISTIC |= set(DOOR_FILES) | {'71c-xa-openings.js', '90-xa-doors.js', '89y-xa-interiors.js'}   # core/door, the openings (69e5, 71c), the leaves' hand-over: no rnd()
DETERMINISTIC |= {'78a-xa-pattern-data.js', '78b-xa-pattern.js', '78c-xa-dome-plan.js', '78d-xa-dome-in.js'}   # the Pleasure Dome's pattern system, plan and interior: drawn inside buildXaPleasureDome's reseed (78-xa-palace.js)
DETERMINISTIC |= {'87s-xs-mat.js', '87t-xs-helpers.js'}   # Scrap Xanadu's items and helpers: no rnd() outside its builders
if KIT:
    DETERMINISTIC |= set(KIT.get('deterministic', [])) | {KIT_MATLIB_PACK}

# Seed ranges known to collide, kept here so the build stays green while the
# collision is tracked in KNOWN_ISSUES.md. Remove an entry when it is fixed;
# do not add one without an accompanying KNOWN_ISSUES entry.
SEED_COLLISION_EXCEPTIONS = set()

# Fragments that are IIFE-scoped by contract (the Krator biome core and biome
# fragments): their column-0 declarations live inside a closure, so the
# shared-scope name checks do not apply. They keep their own PRNG too, so the
# reseed rule does not apply either. Matched by filename prefix.
SCOPED_PREFIXES = ('86-bio-',)
def scoped(f):
    return (f.startswith(SCOPED_PREFIXES) or f in VIRTUAL or f in CORE_HOST   # core/host: each file one IIFE (KHOST); the generated bundle
            or (KIT is not None and (f == KIT_FURN_BUNDLE or f in KIT.get('scoped', []))))   # a kit's furniture bundle and its own closures (kit.json "scoped")


RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED_ARG = re.compile(r'\breseed\(\s*([^)]*?)\s*\)')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)

GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def seeds_claimed(arg):
    """Expand a reseed() argument into the set of integer seeds it can produce.

    Builders are invoked once per decay state d in {0,1,2}, so the two forms
    used in this kit cover more than one seed each. The vernacular form
    `reseed(30101+(o.v|0))` claims its base seed.
    """
    arg = arg.replace(' ', '')
    m = re.fullmatch(r'(-?\d+)', arg)
    if m:
        return {int(m.group(1))}
    m = re.fullmatch(r'(-?\d+)\+d', arg)
    if m:
        n = int(m.group(1))
        return {n, n + 1, n + 2}
    m = re.fullmatch(r'd>0\?(-?\d+):(-?\d+)', arg)
    if m:
        return {int(m.group(1)), int(m.group(2))}
    m = re.fullmatch(r'(-?\d+)\+\(o\.v\|0\)', arg)
    if m:
        return {int(m.group(1))}
    return set()      # e.g. reseed(s) inside the definition of reseed itself


def check(order, bodies):
    errs, claims = [], {}

    for f in order:
        if not f.endswith('.js') or scoped(f):
            continue
        body = bodies[f]

        # 1a. every builder opens with a reseed
        for m in RE_BUILDER.finditer(body):
            name, head = m.group(1), m.group(3)
            if 'reseed(' not in head:
                errs.append('%s: %s() does not open with reseed(N); without it the '
                            'structure inherits whatever stream the previous builder '
                            'left behind.' % (f, name))

        # 1b. collect seed claims
        for m in RE_RESEED_ARG.finditer(body):
            for s in seeds_claimed(m.group(1)):
                claims.setdefault(s, set()).add(f)

        # a fragment that contains no builder and no reseed is fine; one that
        # generates at top level without reseeding is not
        if f not in DETERMINISTIC and not RE_BUILDER.search(body) and 'reseed(' not in body:
            errs.append('%s: generative fragment with no builder and no reseed(N). Add '
                        'one, or list the file in DETERMINISTIC in build.py.' % f)

    # 1c. seed collisions
    collided = {}
    for s, files in sorted(claims.items()):
        if len(files) > 1:
            collided.setdefault(tuple(sorted(files)), []).append(s)
    for files, ss in sorted(collided.items()):
        if files in SEED_COLLISION_EXCEPTIONS:
            continue
        errs.append('seed(s) %s claimed by more than one fragment: %s'
                    % (','.join(str(x) for x in ss), ', '.join(files)))

    # 2. shared-scope collisions
    decl = {}
    for f in order:
        if not f.endswith('.js') or scoped(f):
            continue
        for rx in (RE_DECL, RE_DECL_MULTI):
            for m in rx.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
    for name, files in sorted(decl.items()):
        if len(files) > 1:
            errs.append('top-level name `%s` declared in more than one fragment: %s'
                        % (name, ', '.join(sorted(files))))
        elif name in GENERIC and files != {'10-core.js'}:
            errs.append('top-level name `%s` in %s is too generic for a shared scope; '
                        'prefix it' % (name, ', '.join(files)))
    return errs


def build_one(target, do_checks):
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s (expected %s)' % (target, tdir))

    src = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}
    src.update({f: p for f, p in kxa.paths(TARGET_KIT.get(target)).items() if f not in src})   # the Xanadu kit (a src/ copy would win: none)
    if KIT is None and target not in TARGET_KIT:   # the scrap sheet takes the foundation and the scrap package alone; a --kit page (Qiblai) no citadel
        src.update({f: p for f, p in kxa.paths(kxa.CITADEL).items() if f not in src})   # the citadel's vocabulary and buildings (kits/xanadu/xanadu.py CITADEL)
        src.update({f: p for f, p in kxa.paths(['78o-xa-golden-way.js']).items() if f not in src})   # the Golden Way with it (named here, not in xanadu.py: Longsong reads that)
    src.update({f: os.path.join(CORE, f) for f in CORE_FILES if f not in src})
    src.update({f: os.path.join(CORE_OPT, f) for f in CORE_OPT_FILES if f not in src})
    src.update({f: os.path.join(ROOT, 'core', 'materials', 'record', f) for f in RECORD_FILES if f not in src})
    src.update({f: os.path.join(LOD_DIR, f) for f in LOD_FILES if f not in src})
    src.update({f: p for f, p in TAGS_FILES.items() if f not in src})
    src.update({f: p for f, p in DOOR_FILES.items() if f not in src})   # core/door and the Vernacular's openings, read in place
    khost.resolve(src, CORE_HOST)   # a src/ copy with a shell file's name would win (none)
    if KIT:   # the kit's own fragments join the one order; they may not shadow this build's
        ksrc = os.path.join(KIT['dir'], 'src')
        kf = {f: os.path.join(ksrc, f) for f in os.listdir(ksrc) if f[0].isdigit()} if os.path.isdir(ksrc) else {}
        clash = set(src) & set(kf)
        if clash:
            sys.exit('kit %s shadows a fragment of settlements/xanadu: %s' % (KIT['dir'], ', '.join(sorted(clash))))
        ext = list(KIT.get('external', []))
        for d in KIT.get('externalDirs', []):   # every numbered fragment of a folder read in place (another kit's src/)
            ext += sorted(d + '/' + f for f in os.listdir(os.path.join(ROOT, *d.split('/'))) if f[0].isdigit() and f.endswith('.js'))
        for rel in ext:   # fragments read in place from elsewhere in the repo (no copy); a pair is [path, the name it sorts by]
            if isinstance(rel, (list, tuple)):
                rel, f = rel[0], rel[1]
            else:
                f = os.path.basename(rel)
            if f in src or f in kf:
                sys.exit('kit %s: external fragment %s clashes with a fragment already in the order' % (KIT['dir'], f))
            kf[f] = os.path.join(ROOT, *rel.split('/'))
        src.update(kf)
    tgt = {f: os.path.join(tdir, f) for f in os.listdir(tdir) if f[0].isdigit()}
    for mod in TARGET_CORE.get(target, []):
        mdir = os.path.join(ROOT, 'core', mod)
        tgt.update({f: os.path.join(mdir, f) for f in os.listdir(mdir) if f[0].isdigit() and f.endswith('.js')})
    for d, files in TARGET_FILES.get(target, []):
        tgt.update({f: os.path.join(d, f) for f in files})
    clash = set(src) & set(tgt)
    if clash:
        sys.exit('target %s shadows a src fragment: %s' % (target, ', '.join(sorted(clash))))
    paths = dict(src); paths.update(tgt)
    # a --kit target with interiors of its own (kit.json "interiors": the kit's furniture bundle and interiors core, 88z below)
    # does not take Xanadu's (69d) too: two KratorFurniture bundles on one page put the Qiblai city over its cap. Xanadu's glue
    # (89y, which 99-start.js reads) stays and runs on the kit's bundle, which comes first in the order
    own_ix = bool(KIT and target in KIT.get('interiors', []))
    # a kit with no interiors of its own at all ("interiors": [] or none) puts its "interiorSets" into Xanadu's bundle (69d)
    vb = {} if own_ix else virtual_bodies((KIT.get('interiorSets') or []) if (KIT and not KIT.get('interiors')) else ())
    order = sorted(list(paths) + list(vb))

    bodies = dict(vb)
    for f in order:
        if f in vb:
            continue
        with open(paths[f], encoding='utf-8', newline='') as fh:
            bodies[f] = fh.read()
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    # --page-packs (OPT-IN until Stage 8 makes it the default: TODO.md's ride-along; XS1-CLASSES.md "Fixes after XS0"): each
    # page carries only the families its row in settlements/xanadu/page-packs.json keeps, checked against what a run of the
    # page used and what its own fragments name (tools/textures/page_pack.py), in sidecars named after the page. Off, nothing
    # below reads page-packs.json or page_pack.py, and every call is the one it was
    _pp = None
    if '--page-packs' in sys.argv:
        import page_pack
        own = [p for p in paths.values() if os.path.abspath(p).startswith(os.path.abspath(KIT['dir'] if KIT else tdir) + os.sep)]
        _pp = page_pack.Page(os.path.join(DIST, TARGET_OUT[target]), own)
    _ex = (lambda key, d: _pp.exclude(key, d)) if _pp else (lambda key, d: ())
    # the pack beside the pages (xanadu.tex.xanadu.js), one file every page of the build shares; --inline-packs puts it back in
    # each page (2026-10-14: the gallery outgrew an artifact with the pack in every page)
    side = None if '--inline-packs' in sys.argv else {}
    bodies[MATLIB_PACK] = matlib_pack.fragment(HERE, 'xanadu', side=side, exclude=_ex('xanadu', HERE))
    order = sorted(order + [MATLIB_PACK])
    # the pictures on the citadel's hangings (2026-11-17; citadel/FURNISHING.md): their own pack, KMAT.pack('xanadu-pics'), on the
    # two pages that draw the citadel, beside the page with Xanadu's own; the catalog's hangings read it (xanPic, the Xanadu culture)
    if not KIT and target in ('xanadu', 'erewhon') and os.path.isfile(os.path.join(HERE, 'citadel', 'tex', 'pack.json')):
        bodies[PICS_PACK] = matlib_pack.fragment(os.path.join(HERE, 'citadel'), 'xanadu-pics', side=side)
        order = sorted(order + [PICS_PACK])
    # a kit with library families of its own (kit.json "pack": its name; its materials.json packed into its tex/ by
    # tools/textures/pack.py): KMAT.pack('<name>') inlined here, bound by the kit's own fragment (KMAT.bindMat), as Iziz's --kit
    _pd = os.path.join(ROOT, *KIT['packFrom'].split('/')) if KIT and KIT.get('packFrom') else (KIT['dir'] if KIT else None)   # "packFrom": a kit's pack another folder's build takes (the city of Qiblai takes kits/qiblai's)
    # kit.json "sidePacks": true puts the kit's pack, the vendored biome's and the furniture's detail maps beside the page too
    # (xanadu.tex.<key>.js; settlements/lightwall, 2026-11-16: its page near the 16 MB cap). Absent, they stay inline as before
    _sp = side if KIT and KIT.get('sidePacks') else None
    if KIT and KIT.get('pack') and os.path.isfile(os.path.join(_pd, 'tex', 'pack.json')):
        # kit.json "packSide": true writes the kit's pack beside the page too (<page>.tex.<pack>.js, as Xanadu's own), so a
        # page near its size cap keeps its code inline and its images apart (the city of Qiblai, 2026-11-16: 7.5 MB of 15)
        bodies[KIT_MATLIB_PACK] = matlib_pack.fragment(_pd, KIT['pack'], side=side if KIT.get('packSide') else _sp,
                                                       exclude=_ex(KIT['pack'], _pd))
        order = sorted(order + [KIT_MATLIB_PACK])
    if KIT and target in KIT.get('interiors', []):   # a kit target with interiors: the furniture bundle and the interiors core
        sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
        sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
        import furniture_bundle, kit_bundle
        # kit.json "furnitureTex": true gives every piece the library's detail maps (KF_TEX, krator-furniture-detail.js)
        bodies[KIT_FURN_BUNDLE] = furniture_bundle.bundle(KIT.get('furniture'), tex=bool(KIT.get('furnitureTex')), side=_sp) + \
            kit_bundle.bundle(KIT.get('interiorSets', []))
        order = sorted(order + [KIT_FURN_BUNDLE])
    if any(f.startswith('86-bio-') for f in order):   # the vendored xanadu biome: its library pack, before the biome code
        # under its own key (2026-11-12): as 'xanadu' the building kit's pack (88x, after it) replaced it whole (KMAT.pack
        # sets, it does not merge), so its ground sets never reached the page. Erewhon's ground reads it (85-er-paint, 90a)
        _bd = os.path.join(ROOT, 'biomes', 'xanadu')
        bodies['86-bio-00-matlib-pack.js'] = matlib_pack.fragment(_bd, 'xanadu-bio', side=_sp if KIT else None, exclude=_ex('xanadu-bio', _bd))
        order = sorted(order + ['86-bio-00-matlib-pack.js'])

    if do_checks:
        errs = check(order, bodies)
        if errs:
            print('BUILD RULES FAILED (%s):' % target)
            for e in errs:
                print('  -', e)
            sys.exit(1)

    html = ''.join(bodies[f] for f in order)
    # 00-head.html is shared, so the static <title> carries the kit's name. Stamp
    # the target's own TITLE into it: the artifact gallery reads that tag, and
    # setting document.title at runtime is too late for it.
    m = re.search(r"const TITLE\s*=\s*'([^']*)'", bodies.get('89z-rows.js', ''))
    if m:
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % m.group(1),
                      html, count=1)
    out = os.path.join(DIST, TARGET_OUT[target])
    if BSRC.LISTING:   # --list-sources: every file this target read is recorded; main() reports every target's
        return order, None, None
    os.makedirs(DIST, exist_ok=True)
    if side:
        html = matlib_pack.write_sidecar(side, html, DIST, _pp.sidecar_name() if _pp else 'xanadu.tex.js', prune=False)
    if _pp:
        print('page packs %s: %s' % (TARGET_OUT[target], ', '.join('%s %d of %d' % (k, a, b) for k, (a, b) in sorted(_pp.kept.items())) or 'no lists: whole packs'))
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(KIT['dir'] if KIT else HERE, 'build-manifest-%s.json' % target), 'w', encoding='utf-8') as fh:
        json.dump({f: hashlib.sha1(bodies[f].replace('\r\n', '\n').encode()).hexdigest()[:12] for f in order},   # LF-normalised: one hash on every platform
                  fh, indent=1, sort_keys=True)
    return order, html, out


VENDORED = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
            '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js',
            '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js']          # ../ancients/src (via ../highlands)
IZIZ_VENDORED = ['69b-vern-mat.js', '69c-vern-helpers.js', '91-probe.js', '92-camera.js', '93-labels.js', '81-sky.js']   # ../iziz/src (via ../highlands)


def vendor_manifest():
    """VENDOR.json: sha1 of every vendored fragment, so drift is visible."""
    out = {}
    for f in VENDORED + IZIZ_VENDORED:
        with open(srcpath(f), 'rb') as fh:
            out[f] = hashlib.sha1(fh.read().replace(b'\r\n', b'\n')).hexdigest()[:12]   # LF-normalised, as the build manifest
    with open(os.path.join(HERE, 'VENDOR.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
    return out


def vendor_check():
    """Compare each vendored fragment with the module it comes from."""
    # Each copy is compared with the module it comes from (MODULARITY-PLAN.md step 6), not with Highlands' copy of it:
    # the Ancients core with kits/ancients (and core/materials), the Vernacular's two with kits/iziz-vernacular, the sky
    # with core/atmos/placeholder. The viewer shell (91-93) is Highlands' own (its 91-probe adapted on purpose), so it is
    # compared with Highlands'.
    vern, shell = ['69b-vern-mat.js', '69c-vern-helpers.js'], ['91-probe.js', '92-camera.js', '93-labels.js']
    groups = (('ancients', VENDORED, 'src'), ('iziz-vernacular', vern, 'src'), ('highlands', shell, 'src'),
              ('placeholder', ['81-sky.js'], ''))
    for up_name, files, sub in groups:
        up = os.path.join(UPSTREAM[up_name], sub)
        if not os.path.isdir(up):
            print('vendor-check: %s not found; skipped' % os.path.relpath(up, ROOT).replace(os.sep, '/'))
            continue
        drift = [f for f in files if not os.path.exists(srcpath(f, up))
                 or open(srcpath(f, up), 'rb').read() != open(srcpath(f), 'rb').read()]
        print('vendor-check %s: %s' % (up_name, 'all %d identical' % len(files) if not drift
                                       else 'DRIFT in ' + ', '.join(drift)))


def main():
    if '--vendor-check' in sys.argv:
        vendor_check()
        return
    if not BSRC.LISTING and not KIT:   # --list-sources writes nothing; a kit build (--kit) leaves Xanadu's VENDOR.json alone
        vendor_manifest()
    do_checks = '--no-checks' not in sys.argv
    wanted = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--target=')]
    if '--target' in sys.argv:
        wanted.append(sys.argv[sys.argv.index('--target') + 1])
    if not wanted:
        wanted = list(TARGET_OUT)

    for target in wanted:
        order, html, out = build_one(target, do_checks)
        if BSRC.LISTING:
            continue

        # --- syntax check (honest about node being absent) -------------------
        body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
        chk = os.path.join(KIT['dir'] if KIT else HERE, '.syntax-%s.js' % target)
        with open(chk, 'w', encoding='utf-8') as fh:
            fh.write(body)
        try:
            r = subprocess.run([find_node() or 'node', '--check', chk], capture_output=True, text=True)
            if r.returncode:
                print(r.stdout + r.stderr)
                sys.exit(1)
            syntax = '  syntax OK'
        except FileNotFoundError:
            syntax = '  syntax NOT CHECKED (no node - jscheck.py / verify.py are this project\'s syntax checks)'

        print('built %-26s (%2d fragments, %3.0f KB)%s%s'
              % (os.path.relpath(out, KIT['dir'] if KIT else HERE), len(order), os.path.getsize(out) / 1024,
                 syntax, '' if do_checks else '  [checks skipped]'))


if __name__ == '__main__':
    main()
    BSRC.report(vendor_check=None if KIT else vendor_check)   # --list-sources: every target's files (and what --vendor-check compares; a kit build keeps no copies), then exit

# --- remind whoever is building of the open issues (see KNOWN_ISSUES.md) ---
_ki = os.path.join(KIT['dir'] if KIT else HERE, 'KNOWN_ISSUES.md')
if os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki, encoding='utf-8') if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md - tell the user before making changes:'
              % len(_open))
        for l in _open:
            print('  ' + l[6:])
