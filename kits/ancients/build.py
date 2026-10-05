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
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
ORIGIN = os.path.join(HERE, '.origin.html')
CORE = os.path.join(ROOT, 'core', 'materials')   # shared material fragments (core/README.md)
CORE_FILES = sorted(f for f in os.listdir(CORE) if f[0].isdigit())
LOD_DIR = os.path.join(ROOT, 'core', 'lod')        # shared level of detail (core/lod/README.md)
LOD_FILES = sorted(f for f in os.listdir(LOD_DIR) if f[0].isdigit())
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
    'kit': 'ancients-kit.html',            # the 32-type showcase
    'worn': 'worn.html',                   # every type intact and worn (decay 5)
    'iziz-style': 'iziz-style.html',       # the Ancient Iziz Style: families, wreck states, Iziz variants
    'theodiga': 'theodiga.html',           # the dam arcology, on its own
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
    'wing': 'wing.html',                     # memorial group: the Wing
    'drum': 'drum.html',                     # memorial group: the Drum
    'blades': 'blades.html',                 # memorial group: the Blades
    'trigon': 'trigon.html',                 # the triangular pyramid, 3:1
    'monolith': 'monolith.html',             # the slab with the arch and the oculi
    'crescent': 'crescent.html',             # the terraced crescent moon
    'ledge': 'ledge.html',                   # terraced slabs cantilevered off a cliff
    'wheel': 'wheel.html',                   # ring plate of parkland on eight towers
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
}

# Fragments with no builder in them: helpers, materials, the scene, the shell.
DETERMINISTIC = {
    '09-lod.js', '97-lod-auto.js',                     # core/lod: the shared level of detail
    '69a-world-uv.js',                                 # core/materials/opt: the shared world-UV hook
    '00-head.html', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '66-office-c.js', '68-mat-v5.js',
    '78-factory-silo.js', '80-aa-battery.js', '40-factory-extras.js', '90-scene.js',
    '69-mat-salvage.js', '69w-worn.js',
    '8ap-funicular.js',                  # its own hashed stream: no rng(), no reseed, moves nobody's rubble
    '91-probe.js', '92-camera.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',        # per-target site table and view list
}

# Seed ranges known to collide, kept here so the build stays green while the
# collision is tracked in KNOWN_ISSUES.md. Remove an entry when it is fixed;
# do not add one without an accompanying KNOWN_ISSUES entry.
SEED_COLLISION_EXCEPTIONS = set()   # Library/Campus and Gate/Mega were reseeded in the civic QA pass

RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED_ARG = re.compile(r'\breseed\(\s*([^)]*?)\s*\)')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)

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


def check(order, bodies):
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
        if not f.endswith('.js') or '-biome-' in f:    # closures: see above
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

# --- remind whoever is building of the open issues (see KNOWN_ISSUES.md) ---
_ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki, encoding='utf-8') if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md - tell the user before making changes:'
              % len(_open))
        for l in _open:
            print('  ' + l[6:])
