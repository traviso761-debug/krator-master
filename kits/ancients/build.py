#!/usr/bin/env python3
"""Concatenate src/* into dist/ancients-kit.html (the Krator Ancients showcase).

Also enforces the rules that make subagent work safe on this kit:

  1. SEED DISCIPLINE. The PRNG is one global stream. Every builder opens with
     reseed(N) so that each structure is its own stream and an edit inside one
     builder cannot move the rubble of every structure built after it. This
     script checks two things: that each build*() actually opens with a
     reseed, and that no two fragments claim overlapping seeds. Note that a
     builder is called once per decay state, so `reseed(9100+d)` claims
     9100..9104 (decays 0-4) and `reseed(d>0?9801:9800)` claims 9800..9801 — the check
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

Usage:  python build.py [--no-checks] [--assert-origin]

  --assert-origin  fail unless the build is byte-identical to .origin.html
                   (the single-file kit this repo was split out of). Use it
                   to prove a pure refactor changed nothing. It stops being
                   meaningful the moment a fragment is deliberately edited;
                   without the flag the comparison is reported, not enforced.

NOTE ON THE SYNTAX CHECK: it runs `node --check` with the node find_node() finds
($NODE, PATH, /opt/node*/bin, ~/.nvm). When node is missing this script says so plainly and does not
claim the file is syntactically valid — the only thing that actually catches a
syntax error here is verify.py, which loads the page and reads the on-screen
error panel. Do not read a green build as "the JavaScript parses".
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
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
ORIGIN = os.path.join(HERE, '.origin.html')
CORE = os.path.join(ROOT, 'core', 'materials')   # shared material fragments (core/README.md)
CORE_FILES = sorted(f for f in os.listdir(CORE) if f[0].isdigit())
LOD_DIR = os.path.join(ROOT, 'core', 'lod')        # shared level of detail (core/lod/README.md)
LOD_FILES = sorted(f for f in os.listdir(LOD_DIR) if f[0].isdigit())
# core/door (core/door/README.md): KDOOR's records, KGLASS's glass, KDOORHOST's posing and key; src/8zo-anc-open.js is the
# kit's drawing of them (the windows' panes and room cards, the doors' records, the interiors' leaves)
DOOR_DIR = os.path.join(ROOT, 'core', 'door')
DOOR_FILES = ['10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js', '90-core-door-host.js']   # 30: KDOORLEAF, the leaves' look
CORE_OPT = os.path.join(CORE, 'opt')   # opt-in shared fragments: a build takes only the ones it names
# the material library (core/materials/record: KMAT, the loader and the in-place bind; not 24-tex-def.js, whose TEX
# clashes with core/materials 20-textures.js): materials.json -> tools/textures/pack.py -> tex/ -> the GENERATED
# 88x-matlib-pack.js (tools/textures/matlib_pack.py); src/88y-ancients-matlib.js binds it onto MAT (KMAT.bindMat)
RECORD_FILES = ['23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js']
MATLIB_PACK = '88x-matlib-pack.js'
CORE_OPT_FILES = ['69a-world-uv.js']   # vWorldUV, the world-unit UV hook (core/README.md)
# INTERIORS (kits/ancients-interiors: the rooms inside the kit's buildings, src/8zz-interiors.js and 92z-interior-ui.js).
# A target listed here gets the GENERATED 8zy-interiors-bundle.js (the catalog's Ancient furniture, kits/interiors'
# core with the arcology's set, kits/ancients-interiors' core) and the shared core/rand, core/tags and core/furnish;
# every other target builds exactly as before (the interior fragments do nothing without the bundle).
INTERIOR_TARGETS = {'interiors', 'theodiga-today'}   # theodiga-today: the arcology's inhabited levels (settlements/theodiga T-arc-1)
INTERIOR_BUNDLE = '8zy-interiors-bundle.js'
CORE_RAND = os.path.join(ROOT, 'core', 'rand')
CORE_TAGS = os.path.join(ROOT, 'core', 'tags')
CORE_FURNISH = os.path.join(ROOT, 'core', 'furnish')
INTERIOR_CORE = [(CORE_RAND, '08-core-rand.js'), (CORE_TAGS, '50-core-tags.js'), (CORE_TAGS, '52-core-tags-vocab.js'),
                 (CORE_TAGS, '53-core-tags-host.js'), (CORE_FURNISH, '50-core-furnish.js'), (CORE_FURNISH, '52-core-furnish-draw.js'),
                 (CORE_FURNISH, '53-core-furnish-host.js')]
# A target listed here takes the shared core/rand and core/tags (no interiors): its placement draws from KRAND and it
# registers what it places with KTAGS before drawing it (CLAUDE.md, "Write code that is the same on every machine").
TAGS_TARGETS = {'podium', 'sanctum', 'span', 'arcpile', 'theodiga', 'theodiga-today'}   # theodiga: the Dome on the Water (2026-11-11)
TAGS_CORE = INTERIOR_CORE[:4]
# fragments a target reads in place from another kit: the Sanctum's statuary is the Eternian kit's head generator
# (kits/eternian/src/42-et-head.js, [G data]: one generator for every build that carries the Eternians' faces)
TARGET_READS = {'podium': [(os.path.join(ROOT, 'kits', 'eternian', 'src'), '42-et-head.js')],
                # the engines' industrial set is watched by core/ruins (targets/engines/91y; the owner, 2026-11-10)
                'engines': [(os.path.join(ROOT, 'core', 'ruins'), '20-core-ruins.js'), (os.path.join(ROOT, 'core', 'ruins'), '21-core-ruins-host.js')],
                # Theodiga (the owner, 2026-11-15: "make sure this build is on core/water and all other relevant core modules"):
                # its lake, outlets, cascade and river on core/water, bound to core/atmos as kits/port binds it (targets/theodiga
                # 77c, 90w), and its ruin watched by core/ruins
                'theodiga': [(os.path.join(ROOT, 'core', 'ruins'), '20-core-ruins.js'), (os.path.join(ROOT, 'core', 'ruins'), '21-core-ruins-host.js')]
                            + [(os.path.join(ROOT, 'core', 'atmos'), f) for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js')]
                            + [(os.path.join(ROOT, 'core', 'water'), f) for f in ('20-core-water.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js')],
                # the Sanctum (2026-10-22) shares the Podium's skins and materials (MAT.sn*), read in place
                'sanctum': [(os.path.join(ROOT, 'kits', 'eternian', 'src'), '42-et-head.js'),
                            (os.path.join(HERE, 'targets', 'podium'), '8aq2-podium-skins.js')]}
# THEODIGA TODAY (settlements/theodiga, T-town-2, 2026-11-16): the ruined dam, its Dome and its water as the theodiga target
# draws them (its fragments read in place from targets/theodiga), and the town on the east rim: its drawer from the settlement
# (src/8ay1-th-town.js) and the isle demo's flattener (58-isle-protos.js), read in place; and three generated bodies, the first
# two sealed in closures of their own so their globals meet none of the kit's (core/city's clamp and segDist are the kit's names
# too): TH_CITY, core/space + core/city's [G data] fragments + kits/crops + the town's plan (src/40-th-town.js) as THCITY;
# TH_XAK, the Xanadu kit with the scrap set and the Qiblai kit's buildings as XAK (kits/xanadu/kit_bundle.py); and the packs
# their maps come from, Xanadu's and Qiblai's, sidecars beside the page. Every file is read live, never copied.
THEO_TARGET = os.path.join(HERE, 'targets', 'theodiga')
TARGET_READS['theodiga-today'] = (TARGET_READS['theodiga']
                                  + [(THEO_TARGET, f) for f in ('77-dam.js', '77a-theodiga-dome-plan.js', '77b-theodiga-dome-draw.js',
                                                                '77c-theodiga-water.js', '90w-theodiga-water.js')]
                                  + [(os.path.join(ROOT, 'settlements', 'theodiga', 'src'), f) for f in ('41-th-descent.js', '42-th-works.js', '43-th-arc-program.js', '43-th-arc.js', '8ay1-th-town.js', '8ay2-th-descent.js', '8ay3-th-works.js', '8zz1-th-arc-host.js')]
                                  + [(os.path.join(ROOT, 'core', 'terrain'), '37c-core-rubble.js'),   # the works' salvage heaps (KRUBBLE)
                                     (os.path.join(ROOT, 'settlements', 'isle-demo', 'src'), '58-isle-protos.js')])
TH_CITY, TH_XAK, TH_XPACK, TH_QPACK = '8ay8-th-city.js', '8ay9-th-xak.js', '8ay7-th-xanadu-pack.js', '8ay6-th-qiblai-pack.js'
SEALED = {TH_CITY, TH_XAK}   # generated closures: the build rules' scans do not reach inside them


def th_city_files():
    city = os.path.join(ROOT, 'core', 'city')
    return ([os.path.join(ROOT, 'core', 'space', '20-core-space.js')]
            + [os.path.join(city, f) for f in sorted(os.listdir(city)) if re.match(r'^\d\d-city-.*\.js$', f) and 'host' not in f]
            + [os.path.join(ROOT, 'kits', 'crops', 'src', f) for f in ('10-crop-core.js', '20-crop-records.js', '40-crop-query.js')]
            + [os.path.join(ROOT, 'settlements', 'theodiga', 'src', '40-th-town.js')])


def th_city():
    """core/city and the town's plan in one closure: var THCITY = {KCITY, KSPACE, town: TH_TOWN}"""
    body = ''
    for f in th_city_files():
        with open(f, encoding='utf-8', newline='') as fh:
            body += '/* ---- %s ---- */\n%s\n;\n' % (os.path.relpath(f, ROOT).replace(os.sep, '/'), fh.read())
    return ('/* THCITY: core/space, core/city, kits/crops and Theodiga\'s town plan sealed in one closure (kits/ancients/build.py '
            'th_city). GENERATED: edit core/city or settlements/theodiga/src. */\nvar THCITY = (function(){\n' + body
            + 'return { KCITY: KCITY, KSPACE: KSPACE, town: TH_TOWN, crops: CROPS };\n})();\n')


def th_xak():
    """the Xanadu kit, its scrap set and the Qiblai kit's buildings, sealed as XAK (kits/xanadu/kit_bundle.py, read live)"""
    import importlib.util
    spec = importlib.util.spec_from_file_location('th_xanadu_kit_bundle', os.path.join(ROOT, 'kits', 'xanadu', 'kit_bundle.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.bundle('XAK', scrap=True, qiblai=True)[0]
# the furniture an intact Ancient building takes: the harvested registry (the ancient pieces) and the goods
INTERIOR_FURN = ['generic-goods']
# a target's own furniture cultures beside them: Theodiga's inhabited levels are furnished as Xanadu's clergy would (T-arc-1)
INTERIOR_FURN_TARGET = {'theodiga-today': ['xanadu', 'generic']}


def interior_bundle(target=None):
    """kits/catalog furniture_bundle + kits/interiors kit_bundle (the noahs-regret set: its crew, bunkroom and mess
    kinds) + kits/ancients-interiors kit_bundle, each loaded under its own module name."""
    import importlib.util
    def load(name, path):
        spec = importlib.util.spec_from_file_location(name, path)
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
    fb = load('anc_furniture_bundle', os.path.join(ROOT, 'kits', 'catalog', 'furniture_bundle.py'))
    ib = load('anc_ix_bundle', os.path.join(ROOT, 'kits', 'interiors', 'kit_bundle.py'))
    ab = load('anc_ai_bundle', os.path.join(ROOT, 'kits', 'ancients-interiors', 'kit_bundle.py'))
    return ('/* GENERATED by build.py (interior_bundle): do not edit. The catalog\'s Ancient furniture, kits/interiors and\n'
            '   kits/ancients-interiors, for the interiors pass (src/8zz-interiors.js). */\n' +
            fb.bundle(INTERIOR_FURN + INTERIOR_FURN_TARGET.get(target, []), harvested=True) + ib.bundle(['noahs-regret']) + ab.bundle())


def srcpath(f, base=None):
    """Path of fragment f in base (default src/), falling back to core/materials/ (and to
    core/materials/opt/ for the opt-in files in CORE_OPT_FILES).
    A local copy with the same name overrides the shared one."""
    p = os.path.join(base or SRC, f)
    if os.path.exists(p) or f not in CORE_FILES + CORE_OPT_FILES:
        return p
    return os.path.join(CORE if f in CORE_FILES else CORE_OPT, f)

# A target is a showcase built from the shared src/ fragments plus its own site
# table and view list, merged into the one sorted filename order. Everything
# else — core, helpers, all 33 builders — is shared, so a fix to a builder lands
# in every target that shows it and the two cannot drift.
TARGET_OUT = {
    'kit': 'ancients-kit.html',            # the 32-type showcase
    'worn': 'worn.html',                   # every type intact and worn (decay 5)
    'iziz-style': 'iziz-style.html',       # the Ancient Iziz Style: families, wreck states, Iziz variants
    'theodiga': 'theodiga.html',           # the dam arcology, on its own
    'theodiga-today': 'theodiga-today.html',   # Theodiga as it stands now: the ruin, the Dome, the water and the town on the east rim (settlements/theodiga)
    'spire': 'spire.html',                 # the recursive spire, on its own
    'canyon': 'canyon.html',               # the cross-canyon span works
    'dalab': 'dalab.html',                 # the ancient lab domes (domes only)
    'veladiga': 'veladiga.html',
    'hexahedron': 'hexahedron.html',           # Soleri's other dam arcology
    'forest': 'forest.html',                   # the planted-torus arcology
    'darco': 'darco.html',                     # the swept-horn arcology
    'launch': 'launch.html',                   # the launch arcology
    'plymouth': 'plymouth.html',               # the plymouth arcology
    'hill': 'hill.html',                     # the sinuous hill arcology
    'arcoindian2': 'arcoindian2.html',       # the half-cave
    'arcube': 'arcube.html',                 # the 1 km cube on its diagonal
    'lozenge': 'lozenge.html',               # the cube at a quarter height, its upper faces terraced (targets/lozenge)
    'arcpile': 'arcpile.html',               # the pile of blocks, the Rift's ruin (targets/arcpile)
    'wing': 'wing.html',                     # memorial group: the Wing
    'drum': 'drum.html',                     # memorial group: the Drum
    'blades': 'blades.html',                 # memorial group: the Blades
    'trigon': 'trigon.html',                 # the triangular pyramid, 3:1
    'monolith': 'monolith.html',             # the slab with the arch and the oculi
    'crescent': 'crescent.html',             # the terraced crescent moon
    'ledge': 'ledge.html',                   # terraced slabs cantilevered off a cliff
    'wheel': 'wheel.html',                   # ring plate of parkland on eight towers
    'interiors': 'interiors.html',           # the original kit's buildings with their rooms (kits/ancients-interiors)
    'skyi': 'skyi.html',                     # Skyscraper I on its own (joins the kit rows)
    'skyj': 'skyj.html',                     # Skyscraper J on its own (joins the kit rows)
    'skyk': 'skyk.html',                     # Skyscraper K on its own (joins the kit rows)
    'lighthouse': 'lighthouse.html',         # lighthouse island (a modified Skyscraper J)
    'arcbeam': 'arcbeam.html',                 # the canyon-spanning beam arcology
    'ring': 'ring.html',                       # the barrel arcology, circular toruses
    'arcoindian': 'arcoindian.html',           # the cliff-topography arcology
    'engines': 'engines.html',                 # five cyclopean machines of unclear purpose
    'alt-domestic': 'alt-domestic.html',       # arco1/arco2 alternates of the domestic group (src/8ak-alt-*)
    'alt-towers': 'alt-towers.html',           # queue 3, towers group: arco alternates of six types
    'alt-civic': 'alt-civic.html',             # civic alternates (arco1/arco2), all decays
    'yuni-variants': 'yuni-variants.html',     # the Yuni fork's variants, ported (src/8am-yv-*)
    'iziz-variants': 'iziz-variants.html',     # dev: Sky C tripod market, small-podium A-C, tower stumps (8an-iz-*)
    'spaceport': 'spaceport.html',             # dev: the Iziz spaceport in every decay (8ao-iz-spaceport)
    'funicular': 'funicular.html',             # the broken Ancient funicular on an escarpment (8ap-funicular; Verge takes it)
    'hosts': 'hosts.html',                     # five types drawn as Hykkousoi hosts for Ys (src/8ap-host-*)
    'podium': 'podium.html',                   # the spiral arcology (the Sanctum until 2026-10-22: targets/podium)
    'sanctum': 'sanctum.html',                 # the Eternal State's capital arcology: podium, stalk and hexagonal solid
    'span': 'span.html',                       # Span's pieces (targets/span; settlements/span PLAN.md SP2): gallery, range, dome, pad, Cross, weir, portal
    'kept': 'kept.html',                       # the Wing and Arcoindian as the True Heirs keep them (targets/kept; kits/eternian P5)                 # the Eternians' capital arcology, as built and as the Heirs keep it (targets/sanctum)
    'quintagon': 'quintagon.html',             # the pentagonal star arcology (src/8au-quintagon.js, targets/quintagon)
}

# Fragments with no builder in them: helpers, materials, the scene, the shell.
DETERMINISTIC = {
    '23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js', '88x-matlib-pack.js', '88y-ancients-matlib.js',   # the material library (no rnd())
    '09-lod.js', '97-lod-auto.js',                     # core/lod: the shared level of detail
    '10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js', '90-core-door-host.js', '8zo-anc-open.js',   # core/door and the kit's openings (no rng())
    '08-core-rand.js', '50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js', '50-core-furnish.js',
    '52-core-furnish-draw.js', '53-core-furnish-host.js', '8zy-interiors-bundle.js', '8zz-interiors.js', '92z-interior-ui.js',   # interiors
    '69a-world-uv.js',                                 # core/materials/opt: the shared world-UV hook
    '00-head.html', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '66-office-c.js', '68-mat-v5.js',
    '78-factory-silo.js', '80-aa-battery.js', '40-factory-extras.js', '90-scene.js',
    '69-mat-salvage.js', '69w-worn.js',
    '8ap-funicular.js',                  # its own hashed stream: no rng(), no reseed, moves nobody's rubble
    '91-probe.js', '92-camera.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',        # per-target site table and view list
    '91y-engine-checks.js',               # targets/engines: the industrial set watched by core/ruins (measures the scene, places nothing)
    '20-core-ruins.js', '21-core-ruins-host.js',   # core/ruins: the ruins check (no rnd())
    '8ap-host-0-lib.js',                  # the host types' shared plan, plate and spec helpers (no builder)
    '8aq0-podium-plan.js', '8aq1-podium-kept.js', '8aq2-podium-skins.js',      # targets/podium: KRAND-hashed records, no rng()
    '8ar0-sanctum-plan.js',                                                     # targets/sanctum: KRAND-hashed records, no rng()
    '42-et-head.js',                                   # kits/eternian's head generator, read by the Sanctum: seeded by KRAND
    '8aq5-kept-pass.js',                               # targets/kept: a material pass, no placement
    '8at0-arcpile-plan.js',                            # targets/arcpile: KRAND-hashed records, no rng()
    '77a-theodiga-dome-plan.js', '77b-theodiga-dome-draw.js',   # targets/theodiga: the Dome on the Water, KRAND records, no rng()
    '77c-theodiga-water.js', '90w-theodiga-water.js',           # targets/theodiga: the water's records and their drawing (core/water)
    '89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js',   # core/atmos (IIFE, no rnd())
    '20-core-water.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js',      # core/water (IIFE, no rnd())
    '8ay1-th-town.js', '58-isle-protos.js', '8ay7-th-xanadu-pack.js', '8ay6-th-qiblai-pack.js',   # theodiga-today: the town drawn from core/city's records (KRAND), the flattener, the packs
    '41-th-descent.js', '8ay2-th-descent.js',          # theodiga-today: the ways down from the rim, records on the drawn wall and their drawing (no rng())
    '42-th-works.js', '8ay3-th-works.js', '37c-core-rubble.js',   # theodiga-today: the works below (KRAND by index) and their drawing; core/terrain's heaps
    '43-th-arc-program.js', '43-th-arc.js', '8zz1-th-arc-host.js',   # theodiga-today: the arcology's levels as plates (hashed by AI, no rng()) and their host
}
DETERMINISTIC |= {'06-core-khook.js', '06b-core-kcolor.js'}   # core/shader (no rnd())

# PARTS: a fragment cut at its section markers so it can be read (ROADMAP 3.4: none over 80 KB) -> the fragment it
# continues. A part may open in the middle of a builder: the rules read it joined to the fragment it continues, as one
# fragment, and the page is the same concatenation either way. A new part sorts right after the one before it.
CONTINUES = {
    '89b1-arcoindian-cut.js': '89b-arcoindian.js', '89b2-arcoindian-plinth.js': '89b-arcoindian.js',
    '89c1-arcoindian2-lens.js': '89c-arcoindian2.js', '89c2-arcoindian2-stalk.js': '89c-arcoindian2.js',
    '89d1-arcube-faces.js': '89d-arcube.js', '89d2-arcube-elevation.js': '89d-arcube.js', '89d3-arcube-ruin.js': '89d-arcube.js',
    '89d6-lozenge-faces.js': '89d5-lozenge.js', '89d7-lozenge-elevation.js': '89d5-lozenge.js', '89d8-lozenge-ruin.js': '89d5-lozenge.js',
}

# Seed ranges known to collide, kept here so the build stays green while the
# collision is tracked in KNOWN_ISSUES.md. Remove an entry when it is fixed;
# do not add one without an accompanying KNOWN_ISSUES entry.
SEED_COLLISION_EXCEPTIONS = set()   # Library/Campus and Gate/Mega were reseeded in the civic QA pass

RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED_ARG = re.compile(r'\breseed\(\s*([^)]*?)\s*\)')
# whole-line // comments and /* */ blocks: a rejected reseed(N+d) quoted in prose is not a claim
RE_JS_COMMENT = re.compile(r'^[ \t]*//[^\n]*|/\*.*?\*/', re.M | re.S)
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
# (it stops at an opening bracket: `const W=(function(){const a=1,TAU=...` declares TAU inside the closure, not at the top)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n({\[]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)

GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def seeds_claimed(arg):
    """Expand a reseed() argument into the set of integer seeds it can produce.

    Builders are invoked once per decay state, and the kit now shows d in
    {0,1,2,3} with a few rows adding 4 (the Projects), so `N+d` claims N..N+4.
    It used to claim N..N+2, which let a d=3 or d=4 stream land on another
    builder's seed unnoticed.
    """
    arg = arg.replace(' ', '')
    m = re.fullmatch(r'(-?\d+)', arg)
    if m:
        return {int(m.group(1))}
    m = re.fullmatch(r'(-?\d+)\+d', arg)
    if m:
        n = int(m.group(1))
        return {n, n + 1, n + 2, n + 3, n + 4}
    m = re.fullmatch(r'd>0\?(-?\d+):(-?\d+)', arg)
    if m:
        return {int(m.group(1)), int(m.group(2))}
    return set()      # e.g. reseed(s) inside the definition of reseed itself


def joined(order, bodies):
    """The fragments as the rules read them: every part (CONTINUES) appended to the fragment it continues."""
    bodies = dict(bodies)
    for f in order:
        if f in CONTINUES:
            if CONTINUES[f] not in bodies:
                sys.exit('build.py: %s continues %s, which is not in the build' % (f, CONTINUES[f]))
            bodies[CONTINUES[f]] += bodies.pop(f)
    return [f for f in order if f not in CONTINUES], bodies


def check(order, bodies):
    order, bodies = joined(order, bodies)
    errs, claims = [], {}

    for f in order:
        if not f.endswith('.js'):
            continue
        # BIOME FRAGMENTS are exempt, exactly as in the Screamers kit they came
        # from (src/75-biome-*, 76-*-biome-*). Every one is a closure that
        # declares nothing generic at the shared scope, keeps its OWN PRNG
        # stream and reseeds its own passes, so the host's seed discipline does
        # not apply to it and the column-0 scan below cannot see inside it --
        # it would flag every local helper. Do not edit a biome fragment here;
        # edit it in the biome's home tree and copy it across, or the two drift.
        if '-biome-' in f:
            continue
        # THE INTERIOR BUNDLE is generated from other kits (the catalog's buildFurn/buildPlant/buildAsset are not kit
        # builders and keep their own seeds), and the core/rand, core/tags and core/furnish fragments are shared
        # modules: none of them draws from the kit's stream
        if f == INTERIOR_BUNDLE or f in {n for _, n in INTERIOR_CORE} or f in SEALED:
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
        for m in RE_RESEED_ARG.finditer(RE_JS_COMMENT.sub('', body)):
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
        if not f.endswith('.js') or '-biome-' in f or f in SEALED:    # closures: see above
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


# PRUNE (the owner, 2026-11-15: "split off all these ancient assets apart from each other as much as possible"). Every src/
# fragment used to go into every target's page, so a change to one builder re-hashed all of them. Now a page carries the
# kit's core (everything that is not prunable, below) and, of the prunable fragments, only those its own rows' builders and
# its own target fragments reach: by a top-level name (a function, const, let or var at column 0), by a kit piece's name
# in a string (kdef('name') in one, 'name' in the other) or by a material or texture key (MAT.x = / TEX.x =). Reaching
# is over-generous by design (a comment-free scan of every word and every string): carrying a fragment it does not need
# costs bytes, missing one breaks the page. 90-scene.js names its builders as strings (ANC_BUILDER_NAMES) and takes
# those the page has. A fragment's parts (CONTINUES) and the biome cores' closures go as one group.
PRUNE_LIBS = {'40-factory-extras.js', '66-office-c.js', '77z-iziz-style.js', '78-factory-silo.js', '80-aa-battery.js',
              '8al-alt-00-lib.js', '8ap-funicular.js', '8ap-host-0-lib.js'}
# a prunable fragment only some targets carry, whatever reaches it (the interiors' fragments do nothing without the bundle;
# 90-scene asks for them with typeof)
ONLY_FOR = {'8zz-interiors.js': INTERIOR_TARGETS, '92z-interior-ui.js': INTERIOR_TARGETS}
RE_STR = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\]|\\.)*`", re.S)
RE_WORD = re.compile(r'[A-Za-z_$][\w$]*')
RE_MIDDECL = re.compile(r'^\S[^\n]*?;\s*(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_KDEF = re.compile(r"\bkdef\(\s*'([^']+)'")
RE_MATDEF = re.compile(r'\b((?:MAT|TEX)\.[A-Za-z_$][\w$]*)\s*=(?!=)')
RE_MATUSE = re.compile(r'\b((?:MAT|TEX)\.[A-Za-z_$][\w$]*)')


def top_level_names(text):
    """The names a fragment declares at its top level (brace and paren depth 0): function, class, const, let and var, with
    each name of a comma list; strings, template literals, comments and regex literals skipped. The column-0 rules of the
    checks above are not enough here: the biome closures and many builders' bodies start at column 0."""
    names, n, i, depth, par = [], len(text), 0, 0, 0
    prev = ';'                               # the last significant character, to tell a regex from a division
    word = re.compile(r'[A-Za-z_$][\w$]*')
    nextword = re.compile(r'\s*([A-Za-z_$][\w$]*)')
    pending = False                          # inside a const/let/var statement at depth 0: take each `, name =`
    while i < n:
        c = text[i]
        if c in ' \t\r\n':
            i += 1
            continue
        if text.startswith('//', i):
            j = text.find('\n', i)
            i = n if j < 0 else j
            continue
        if text.startswith('/*', i):
            j = text.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in '\'"`':
            j = i + 1
            while j < n and text[j] != c:
                j += 2 if text[j] == '\\' else 1
            i = j + 1
            prev = 'a'
            continue
        if c == '/' and prev in '(,=:[!&|?{};+-*%<>~^':
            j, cls = i + 1, False
            while j < n and text[j] != '\n':
                if text[j] == '\\':
                    j += 2
                    continue
                if text[j] == '[':
                    cls = True
                elif text[j] == ']':
                    cls = False
                elif text[j] == '/' and not cls:
                    break
                j += 1
            i = j + 1
            while i < n and text[i].isalpha():
                i += 1
            prev = 'a'
            continue
        m = word.match(text, i)
        if m:
            w = m.group(0)
            i = m.end()
            if depth == 0 and par == 0:
                if w in ('function', 'class', 'const', 'let', 'var'):
                    m2 = nextword.match(text, i)
                    if m2:
                        names.append(m2.group(1))
                    pending = w in ('const', 'let', 'var')
            prev = 'a' if w not in ('return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'throw') else '('
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth = max(0, depth - 1)
        elif c in '([':
            par += 1
        elif c in ')]':
            par = max(0, par - 1)
        elif c == ';' and depth == 0 and par == 0:
            pending = False
        elif c == ',' and pending and depth == 0 and par == 0:
            m3 = nextword.match(text, i + 1)
            if m3:
                names.append(m3.group(1))
        prev = c
        i += 1
    return names


def prune_group(f):
    if f in CONTINUES:
        return CONTINUES[f]
    if f.startswith('75-biome-'):
        return '75-biome'
    if f.startswith('76-') and 'biome-hyperjungle' in f:
        return '76-biome-hyperjungle'
    return f


def prune(target, order, bodies, paths):
    """The fragments this target's page needs (see PRUNE above), in the build's order."""
    srcdir = os.path.normcase(os.path.abspath(SRC))
    def prunable(f):
        if os.path.normcase(os.path.dirname(os.path.abspath(paths[f]))) != srcdir or not f.endswith('.js'):
            return False
        return (bool(RE_BUILDER.search(bodies[f])) or f in PRUNE_LIBS or f in CONTINUES or f in ONLY_FOR
                or prune_group(f) != f)
    groups = {}
    for f in order:
        if prunable(f):
            groups.setdefault(prune_group(f), []).append(f)
    for g in list(groups):
        if g in bodies and g not in groups[g]:
            groups[g].append(g)               # the parent of a part is in its group
    owner = {f: g for g, fs in groups.items() for f in fs}
    by_name, by_kdef, by_mat = {}, {}, {}
    for g, fs in groups.items():
        fs.sort(key=lambda f: order.index(f))
        # a part opens inside its parent's builder: the names are read from the group joined, in the build's order
        if g not in ONLY_FOR:
            for nm in top_level_names(''.join(bodies[f] for f in fs)):
                by_name.setdefault(nm, g)
        for f in fs:
            body = RE_JS_COMMENT.sub('', bodies[f])
            for m in RE_KDEF.finditer(body):
                by_kdef.setdefault(m.group(1), g)
            for m in RE_MATDEF.finditer(body):
                by_mat.setdefault(m.group(1), g)
    # the roots: the kit's core and the target's own fragments, and the builders of the target's rows
    rows = bodies.get('89z-rows.js', '')
    names = dict(re.findall(r"(\w+):'(build\w+)'", bodies.get('90-scene.js', '')))
    # every word of the rows fragment that is a builder's key (the ROWS keys among them; a stray match only adds a builder)
    rows_code = RE_JS_COMMENT.sub('', rows)
    keys = {w for w in RE_WORD.findall(RE_STR.sub("''", rows_code)) if w in names}
    keys |= {s[1:-1] for s in RE_STR.findall(rows_code) if s[1:-1] in names}    # row types listed as strings (interiors)
    keep = {f for f in order if f not in owner}
    todo = list(keep)
    taken = set()
    def take(g):
        if g in groups and g not in taken:
            taken.add(g)
            todo.extend(groups[g])
    for k in keys:
        if names.get(k) in by_name:
            take(by_name[names[k]])
    for g, targets in ONLY_FOR.items():
        if target in targets:
            take(g)
    tfiles = {f for f in order if os.path.normcase(os.path.dirname(os.path.abspath(paths[f]))) != srcdir}
    while todo:
        f = todo.pop()
        body = RE_JS_COMMENT.sub('', bodies[f])
        if f == '90-scene.js':      # its table of every builder's name is not a use of them
            body = re.sub(r'const ANC_BUILDER_NAMES=\{[^}]*\};', '', body)
        for s in RE_STR.findall(body):
            if s[1:-1] in by_kdef:
                take(by_kdef[s[1:-1]])
            elif f in tfiles and s[1:-1] in by_name:   # a target's own builders named as strings (the alt targets' window[fn])
                take(by_name[s[1:-1]])
        words = set(RE_WORD.findall(RE_STR.sub("''", body)))
        for w in words:
            if w in by_name:
                take(by_name[w])
        for mm in RE_MATUSE.findall(body):
            if mm in by_mat:
                take(by_mat[mm])
    kept = [f for f in order if f not in owner or owner[f] in taken]
    missing = sorted(k for k in keys if names.get(k) and names[k] not in by_name and not any(
        re.search(r'^function\s+%s\b' % names[k], bodies[f], re.M) for f in kept))
    if missing:
        sys.exit('target %s: no fragment declares the builder of row(s) %s' % (target, ', '.join(missing)))
    return kept


def build_one(target, do_checks, assert_origin):
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s (expected %s)' % (target, tdir))

    src = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}
    src.update({f: os.path.join(CORE, f) for f in CORE_FILES if f not in src})
    src.update({f: os.path.join(CORE_OPT, f) for f in CORE_OPT_FILES if f not in src})
    src.update({f: os.path.join(LOD_DIR, f) for f in LOD_FILES if f not in src})
    src.update({f: os.path.join(ROOT, 'core', 'shader', f) for f in ('06-core-khook.js', '06b-core-kcolor.js') if f not in src})   # the vendored biome core's check (tools/fragment_needs.json)
    src.update({f: os.path.join(DOOR_DIR, f) for f in DOOR_FILES if f not in src})
    src.update({f: os.path.join(ROOT, 'core', 'materials', 'record', f) for f in RECORD_FILES if f not in src})
    tgt = {f: os.path.join(tdir, f) for f in os.listdir(tdir) if f[0].isdigit()}
    clash = set(src) & set(tgt)
    if clash:
        sys.exit('target %s shadows a src fragment: %s' % (target, ', '.join(sorted(clash))))
    paths = dict(src); paths.update(tgt)
    order = sorted(paths)

    bodies = {}
    for f in order:
        with open(paths[f], encoding='utf-8', newline='') as fh:
            bodies[f] = fh.read()
    # what a target reads in place (core/tags, TARGET_READS) is read here. What it reads from OUTSIDE core/ (another target's
    # fragments, a settlement's, another kit's) is read BEFORE the prune, so it is a root like the target's own fragments: a
    # kit name it uses keeps its fragment on the page (2026-11-16; until then every read was added after the prune). A core
    # module never uses a kit's names, and the name scan is generous (core/ruins' self-test has a box it calls 'wreck', the Iziz
    # style's top-level function's name), so core reads are added after the prune, as before
    core_dir = os.path.normcase(os.path.join(ROOT, 'core')) + os.sep
    reads = (TAGS_CORE if target in TAGS_TARGETS else []) + TARGET_READS.get(target, [])
    late = [(d, f) for d, f in reads if os.path.normcase(os.path.abspath(d) + os.sep).startswith(core_dir)]
    if reads:
        for d, f in reads:
            if f in bodies or (d, f) in late:
                continue
            paths[f] = os.path.join(d, f)
            with open(paths[f], encoding='utf-8', newline='') as fh:
                bodies[f] = fh.read()
            order.append(f)
        order = sorted(order)
    if '--no-prune' not in sys.argv:          # PRUNE: only the fragments this target's page reaches
        order = prune(target, order, bodies, paths)
        bodies = {f: bodies[f] for f in order}
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    # the pack's maps go in ONE file beside the pages, dist/ancients.tex.ancients.js, that every target loads by <script src>
    # (tools/textures/matlib_pack.py, SIDECAR PACKS): a page is then its code alone, not its code plus a copy of the
    # same maps. --inline-packs puts them back in every page (one self-contained file each, as before 2026-10-07).
    side = None if '--inline-packs' in sys.argv else {}
    bodies[MATLIB_PACK] = matlib_pack.fragment(HERE, 'ancients', side=side, own=True)   # own: the Sanctum target's families (materials.json `own`)
    order = sorted(order + [MATLIB_PACK])
    if target in INTERIOR_TARGETS:
        extra = [INTERIOR_BUNDLE]
        bodies[INTERIOR_BUNDLE] = interior_bundle(target)
        for d, f in INTERIOR_CORE:
            with open(os.path.join(d, f), encoding='utf-8', newline='') as fh:
                bodies[f] = fh.read()
            extra.append(f)
        order = sorted(order + extra)
    if late:   # the core modules a target reads in place, after the prune (above)
        extra = []
        for d, f in late:
            if f in bodies:
                continue
            with open(os.path.join(d, f), encoding='utf-8', newline='') as fh:
                bodies[f] = fh.read()
            extra.append(f)
        order = sorted(order + extra)
    if target == 'theodiga-today':   # the town's sealed bodies and the packs its kits' maps come from (THEODIGA TODAY above)
        bodies[TH_CITY] = th_city()
        bodies[TH_XAK] = th_xak()
        bodies[TH_XPACK] = matlib_pack.fragment(os.path.join(ROOT, 'settlements', 'xanadu'), 'xanadu', side=side)
        bodies[TH_QPACK] = matlib_pack.fragment(os.path.join(ROOT, 'kits', 'qiblai'), 'qiblai', side=side)
        order = sorted(order + [TH_CITY, TH_XAK, TH_XPACK, TH_QPACK])

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
    if BSRC.LISTING:   # --list-sources: every file this target read is recorded; main() reports every target's
        return order, None, None
    out = os.path.join(DIST, TARGET_OUT[target])
    os.makedirs(DIST, exist_ok=True)
    if side:
        html = matlib_pack.write_sidecar(side, html, DIST, 'ancients.tex.js', prune=False)   # shared by every target
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest-%s.json' % target), 'w', encoding='utf-8') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order},
                  fh, indent=1, sort_keys=True)
    return order, html, out


def main():
    do_checks = '--no-checks' not in sys.argv
    assert_origin = '--assert-origin' in sys.argv
    wanted = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--target=')]
    if '--target' in sys.argv:
        wanted.append(sys.argv[sys.argv.index('--target') + 1])
    if not wanted:
        # A target is registered here BEFORE its directory exists, so an agent
        # can be dispatched without touching this shared file (the memorial
        # group went in that way). Building "everything" must not die on the
        # first of those: it used to stop at `wing` and silently leave every
        # target after it in this dict unbuilt. Skip them loudly instead. An
        # explicit --target for a missing directory is still a hard error.
        wanted = []
        for t in TARGET_OUT:
            if os.path.isdir(os.path.join(TARGETS, t)):
                wanted.append(t)
            else:
                print('skipped %-14s registered in TARGET_OUT, but targets/%s/ does not exist yet'
                      % (t, t))

    for target in wanted:
        order, html, out = build_one(target, do_checks, assert_origin)
        if BSRC.LISTING:
            continue

        # --- byte-identity with the single file this repo was split out of ---
        origin_note = ''
        if target == 'kit' and os.path.exists(ORIGIN):
            same = open(ORIGIN, encoding='utf-8', newline='').read() == html
            origin_note = '  origin: %s' % ('IDENTICAL' if same
                                            else 'differs (expected once fragments are edited)')
            if assert_origin and not same:
                print('FAILED --assert-origin: the build is no longer byte-identical to .origin.html')
                sys.exit(1)

        # --- syntax check (honest about node being absent) -------------------
        # The LARGEST script block, not the last one. rsplit('<script>', 1)
        # assumed the bundle was the final script in the document; for the kit
        # target it is not, and the file written was a 22 KB tail that does not
        # parse on its own — so jscheck.py reported a SyntaxError on a build
        # whose error panel was clean and whose invariants all passed. A false
        # positive on the project's only real syntax check is worse than no
        # check, because it sends you hunting a bug that is not there.
        blocks = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
        body = max(blocks, key=len) if blocks else ''
        chk = os.path.join(HERE, '.syntax-%s.js' % target)
        with open(chk, 'w', encoding='utf-8') as fh:
            fh.write(body)
        try:
            r = subprocess.run([find_node() or 'node', '--check', chk], capture_output=True, text=True)
            if r.returncode:
                print(r.stdout + r.stderr)
                sys.exit(1)
            syntax = '  syntax OK'
        except FileNotFoundError:
            syntax = '  syntax NOT CHECKED (no node - verify.py is this project\'s only syntax check)'

        print('built %-26s (%2d fragments, %3.0f KB)%s%s%s'
              % (os.path.relpath(out, HERE), len(order), os.path.getsize(out) / 1024,
                 syntax, origin_note, '' if do_checks else '  [checks skipped]'))


if __name__ == '__main__':
    main()
    BSRC.report()   # --list-sources: every target's files, then exit

# --- remind whoever is building of the open issues (see KNOWN_ISSUES.md) ---
_ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki, encoding='utf-8') if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md - tell the user before making changes:'
              % len(_open))
        for l in _open:
            print('  ' + l[6:])
