#!/usr/bin/env python3
"""Concatenate src/* + targets/<t>/* into dist/<t>.html (Highlands building kit).

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
ROOT = os.path.dirname(os.path.dirname(HERE))   # repo root: biomes/, kits/, settlements/
UPSTREAM = {'ancients': os.path.join(ROOT, 'kits', 'ancients'), 'iziz': os.path.join(ROOT, 'settlements', 'iziz'),
            'highlands': os.path.join(ROOT, 'settlements', 'highlands')}
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
ORIGIN = os.path.join(HERE, '.origin.html')
CORE = os.path.join(ROOT, 'core', 'materials')   # shared material fragments (core/README.md)
CORE_FILES = sorted(f for f in os.listdir(CORE) if f[0].isdigit())
LOD_DIR = os.path.join(ROOT, 'core', 'lod')        # shared level of detail (core/lod/README.md)
LOD_FILES = sorted(f for f in os.listdir(LOD_DIR) if f[0].isdigit())
FURNISH_DIR = os.path.join(ROOT, 'core', 'furnish')   # the furniture placement pass (core/furnish/README.md)
FURNISH_FILES = sorted(f for f in os.listdir(FURNISH_DIR) if f[0].isdigit() and f.endswith('.js'))
CORE_OPT = os.path.join(CORE, 'opt')   # opt-in shared fragments: a build takes only the ones it names
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
# table and view list, merged into the one sorted filename order. Everything
# else — core, helpers, all 33 builders — is shared, so a fix to a builder lands
# in every target that shows it and the two cannot drift.
TARGET_OUT = {
    'highlands': 'highlands.html',            # the whole kit: Republican, Rustic, Tribal rows + the cliff settlement
    'roketstad': 'roketstad.html',            # the town: Roketstad and its spaceport (reclaimed East Highland Republican)
}
_OLD_TARGETS = {
    'republican': 'highlands-republican.html',   # round 10: merged into the one kit page (highlands)
    'rustic': 'highlands-rustic.html',
    'tribal': 'highlands-tribal.html',
    'kit': 'ancients-kit.html',            # the 32-type showcase
    'theodiga': 'theodiga.html',           # the dam arcology, on its own
    'spire': 'spire.html',                 # the recursive spire, on its own
    'repaired': 'repaired.html',           # every type at decay level 3
    'canyon': 'canyon.html',               # the cross-canyon span works
    'dalab': 'dalab.html',                 # the ancient lab domes (domes only)
    'veladiga': 'veladiga.html',
    'hexahedron': 'hexahedron.html',           # Soleri's other dam arcology
    'forest': 'forest.html',                   # the planted-torus arcology
    'darco': 'darco.html',                     # the swept-horn arcology
    'launch': 'launch.html',                   # the launch arcology
    'plymouth': 'plymouth.html',               # the plymouth arcology
    'arcbeam': 'arcbeam.html',                 # the canyon-spanning beam arcology
    'ring': 'ring.html',                       # the barrel arcology, circular toruses
    'arcoindian': 'arcoindian.html',           # the cliff-topography arcology
}

# Fragments with no builder in them: helpers, materials, the scene, the shell.
DETERMINISTIC = {
    '09-lod.js', '97-lod-auto.js',                     # core/lod: the shared level of detail
    '69a-world-uv.js',                                 # core/materials/opt: the shared world-UV hook
    '00-head.html', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
    '69b-vern-mat.js', '69c-vern-helpers.js',          # vendored from ../iziz/src (Iziz Vernacular helpers)
    '70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '72-hl-helpers.js', '73-hl-carve.js', '73b-hl-frame.js',   # the Highlands vocabulary
    '88-hl-dress.js', '90-scene.js', '91-probe.js', '92-camera.js', '93-labels.js', '94-hl-anim.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',        # per-target site table and view list
    '89y-hl-furnish.js',                  # furniture placed through the catalog (FURNISH) and the interiors hook
    '50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js',   # core/furnish (no rnd())
    '81-rk-sky.js', '84-rk-geo.js', '93-rk-ui.js', '93b-rk-lod.js', '82e-anc-aa.js',   # roketstad: the vendored Krator sky, the geometry (noise only), the dev tools
}

# Seed ranges known to collide, kept here so the build stays green while the
# collision is tracked in KNOWN_ISSUES.md. Remove an entry when it is fixed;
# do not add one without an accompanying KNOWN_ISSUES entry.
SEED_COLLISION_EXCEPTIONS = set()

# Fragments that are IIFE-scoped by contract (the Krator biome core and biome
# fragments): their column-0 declarations live inside a closure, so the
# shared-scope name checks do not apply. They keep their own PRNG too, so the
# reseed rule does not apply either. Matched by filename prefix.
SCOPED_PREFIXES = ('86-bio-',)
# GENERATED fragments: the catalog's furniture (kits/catalog/furniture_bundle.py: one closure exposing
# KratorFurniture) and the interiors core with this kit's interior set (kits/interiors/kit_bundle.py:
# KratorInteriors, ROOM, furnishRoom). Inserted at build time between the vernacular helpers and the
# Highlands vocabulary; never written to src/. 89y-hl-furnish.js is the glue (after 73-hl-carve's own VERN.place, before the scene) (FURNISH, the interiors hook).
FURN_CULTURES = ['republican', 'rustic', 'painted', 'iziz', 'generic', 'scrap', 'post-apoc']
VIRTUAL = {'69d-furniture-bundle.js'}


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    return {'69d-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES) + kit_bundle.bundle(['highlands'])}
def scoped(f):
    return f.startswith(SCOPED_PREFIXES) or f in VIRTUAL


RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED_ARG = re.compile(r'\breseed\(\s*([^)]*?)\s*\)')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)

GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def seeds_claimed(arg):
    """Expand a reseed() argument into the set of integer seeds it can produce.

    Builders are invoked once per decay state d in {0,1,2}, so the two forms
    used in this kit cover more than one seed each.
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


def build_one(target, do_checks, assert_origin):
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s (expected %s)' % (target, tdir))

    src = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}
    src.update({f: os.path.join(CORE, f) for f in CORE_FILES if f not in src})
    src.update({f: os.path.join(CORE_OPT, f) for f in CORE_OPT_FILES if f not in src})
    src.update({f: os.path.join(LOD_DIR, f) for f in LOD_FILES if f not in src})
    src.update({f: os.path.join(FURNISH_DIR, f) for f in FURNISH_FILES if f not in src})
    tgt = {f: os.path.join(tdir, f) for f in os.listdir(tdir) if f[0].isdigit()}
    clash = set(src) & set(tgt)
    if clash:
        sys.exit('target %s shadows a src fragment: %s' % (target, ', '.join(sorted(clash))))
    paths = dict(src); paths.update(tgt)
    vb = virtual_bodies()
    order = sorted(list(paths) + list(vb))

    bodies = dict(vb)
    for f in order:
        if f in vb:
            continue
        with open(paths[f], encoding='utf-8', newline='') as fh:
            bodies[f] = fh.read()

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
    os.makedirs(DIST, exist_ok=True)
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest-%s.json' % target), 'w', encoding='utf-8') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order},
                  fh, indent=1, sort_keys=True)
    return order, html, out


VENDORED = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
            '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js',
            '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js']          # ../ancients/src
IZIZ_VENDORED = ['69b-vern-mat.js', '69c-vern-helpers.js', '91-probe.js', '92-camera.js', '93-labels.js']   # ../iziz/src


def vendor_manifest():
    """VENDOR.json: sha1 of every vendored fragment, so drift is visible."""
    out = {}
    for f in VENDORED + IZIZ_VENDORED:
        with open(srcpath(f), 'rb') as fh:
            out[f] = hashlib.sha1(fh.read()).hexdigest()[:12]
    with open(os.path.join(HERE, 'VENDOR.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
    return out


def vendor_check():
    """Compare vendored fragments with ../ancients/src and ../iziz/src."""
    for up_name, files in (('ancients', VENDORED), ('iziz', IZIZ_VENDORED)):
        up = os.path.join(UPSTREAM[up_name], 'src')
        if not os.path.isdir(up):
            print('vendor-check: ../%s/src not found; skipped' % up_name)
            continue
        drift = [f for f in files if not os.path.exists(srcpath(f, up))
                 or open(srcpath(f, up), 'rb').read() != open(srcpath(f), 'rb').read()]
        print('vendor-check %s: %s' % (up_name, 'all %d identical' % len(files) if not drift
                                         else 'DRIFT in ' + ', '.join(drift)))


def main():
    if '--vendor-check' in sys.argv:
        vendor_check()
        return
    vendor_manifest()
    do_checks = '--no-checks' not in sys.argv
    assert_origin = '--assert-origin' in sys.argv
    wanted = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--target=')]
    if '--target' in sys.argv:
        wanted.append(sys.argv[sys.argv.index('--target') + 1])
    if not wanted:
        wanted = list(TARGET_OUT)

    for target in wanted:
        order, html, out = build_one(target, do_checks, assert_origin)

        # --- byte-identity with the single file this repo was split out of ---
        origin_note = ''
        if False:
            same = open(ORIGIN, encoding='utf-8', newline='').read() == html
            origin_note = '  origin: %s' % ('IDENTICAL' if same
                                            else 'differs (expected once fragments are edited)')
            if assert_origin and not same:
                print('FAILED --assert-origin: the build is no longer byte-identical to .origin.html')
                sys.exit(1)

        # --- syntax check (honest about node being absent) -------------------
        body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
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

# --- remind whoever is building of the open issues (see KNOWN_ISSUES.md) ---
_ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki, encoding='utf-8') if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md - tell the user before making changes:'
              % len(_open))
        for l in _open:
            print('  ' + l[6:])
