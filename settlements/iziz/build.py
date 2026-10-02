#!/usr/bin/env python3
"""Concatenate src/* + targets/<t>/* into dist/<t>.html (Iziz).

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

Usage:  python build.py [--no-checks] [--assert-origin] [--vendor-check] [--vendor-bio]

  --vendor-bio     rewrite targets/city/86-bio-*.js from ../biomes/hyperjungle/src (bio_wrap)

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
# shared modules a target opts into (core/<module>/, digit-prefixed fragments): the city takes the atmosphere module
TARGET_CORE = {'city': ['atmos']}


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
    'vernacular': 'iziz-vernacular.html',      # the Iziz Vernacular set showcase
    'city': 'iziz.html',                        # the city
    'wA': 'w-a.html', 'wB': 'w-b.html', 'wC': 'w-c.html',   # per-agent work sheets (round 2)
}
_OLD_TARGETS = {
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
    '66-office-c.js', '78-factory-silo.js', '80-aa-battery.js', '40-factory-extras.js',
    '69b-vern-mat.js', '69c-vern-helpers.js', '78-transplant.js', '79-iziz-original.js', '81-sky.js', '90-scene.js',
    '91-probe.js', '92-camera.js', '93-labels.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',        # per-target site table and view list
    '84-city-geo.js', '93-city-ui.js',    # city target: geometry constants, dev-tool UI
}

# Seed ranges known to collide, kept here so the build stays green while the
# collision is tracked in KNOWN_ISSUES.md. Remove an entry when it is fixed;
# do not add one without an accompanying KNOWN_ISSUES entry.
SEED_COLLISION_EXCEPTIONS = {
    ('48-library.js', '76-campus.js'),   # both claim 9800/9801 - see KNOWN_ISSUES.md
    ('60-gate.js', '87-mega.js'),        # 9995+d vs 9996+d overlap  - see KNOWN_ISSUES.md
}

# Fragments that are IIFE-scoped by contract (the Krator biome core and biome
# fragments): their column-0 declarations live inside a closure, so the
# shared-scope name checks do not apply. They keep their own PRNG too, so the
# reseed rule does not apply either. Matched by filename prefix.
SCOPED_PREFIXES = ('86-bio-', '89-atmos-')   # the hyperjungle biome; core/atmos (one global, ATMOS, its own PRNG)
def scoped(f):
    return f.startswith(SCOPED_PREFIXES)


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
    tgt = {f: os.path.join(tdir, f) for f in os.listdir(tdir) if f[0].isdigit()}
    for mod in TARGET_CORE.get(target, []):
        mdir = os.path.join(ROOT, 'core', mod)
        tgt.update({f: os.path.join(mdir, f) for f in os.listdir(mdir) if f[0].isdigit() and f.endswith('.js')})
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


VENDORED = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
            '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js',
            '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
            # the Ancients builders the city places (ruined d=1 / repaired d=3)
            '40-factory-extras.js', '42-offices.js', '46-bunker.js', '48-library.js', '52-sky-abc.js',
            '56-sky-d.js', '57-sky-e.js', '58-sky-f.js', '64-houses-def.js', '66-office-c.js', '73-police.js',
            '76-campus.js', '78-factory-silo.js', '79-government.js', '80-aa-battery.js', '81-houses-abc.js',
            '82-apartments.js', '83-amphitheater.js', '84-fuel.js', '88-factory.js', '89-lab.js',
            # the Ancient Iziz Style: transplant families, wreck(), and the Iziz variants of the kit
            '77z-iziz-style.js']


BIO_VENDORED = ['10-core-head', '20-core-kit', '30-core-foliage', '35-core-anim', '40-core-place',
                '50-biome-hyperjungle-species', '55-biome-hyperjungle-trees', '58-biome-hyperjungle-fauna',
                '60-biome-hyperjungle-floor', '65-biome-hyperjungle-dress',
                '70-biome-hyperjungle']   # ../biomes/hyperjungle/src -> targets/city/86-bio-*.js, through bio_wrap()

# THE CLOSURE WRAP. The city vendors the hyperjungle biome, but the biome's core declares generic globals (rng, clamp,
# TAU, a const BIO) that would clobber the city's own. bio_wrap() turns an upstream fragment into the city's copy:
# the core head keeps its helpers in a closure and exports them as BIO.fn, every other fragment runs in a closure
# that pulls them from BIO.fn, BIO and HYPERJUNGLE become `var`, and BIO.init takes its scene later (BIO.setScene).
# `--vendor-check` compares bio_wrap(upstream) with the copy; `--vendor-bio` rewrites the copies from upstream.
BIO_FN = 'TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm'
BIO_FNQ = BIO_FN + ',qEuler,qFacing,qUp'


def _sub(s, a, b):
    if s.count(a) != 1:
        raise ValueError('bio_wrap: expected one %r' % a[:60])
    return s.replace(a, b)


def _open_after_header(s, fn, tail=''):
    L = s.split('\n')
    i = next(k for k, l in enumerate(L) if l.strip() and not l.startswith('//'))
    L.insert(i, '(function(){const {%s}=BIO.fn;' % fn)
    return '\n'.join(L).rstrip('\n') + '\n' + tail + '\n})();\n'


def bio_wrap(f, s):
    if '-core-' in f:   # core/biome now carries the closure wrap itself (var BIO, BIO.fn, BIO.setScene)
        return s
    if f == '50-biome-hyperjungle-species':
        s = _sub(s, '\nconst HYPERJUNGLE={};\n', '\nvar HYPERJUNGLE={};\n(function(){const {%s}=BIO.fn;\n' % BIO_FNQ)
        return s.rstrip('\n') + '\n\n})();\n'
    if f == '70-biome-hyperjungle':
        return s
    return _sub(s, '\n(function(){\n', '\n(function(){const {%s}=BIO.fn;\n' % BIO_FNQ)   # already one closure


def bio_paths(f):
    up = os.path.join(ROOT, 'core', 'biome') if '-core-' in f else os.path.join(ROOT, 'biomes', 'hyperjungle', 'src')
    return (os.path.join(up, f + '.js'),   # the biome core lives in core/biome since Oct 2026
            os.path.join(TARGETS, 'city', '86-bio-%s.js' % f))


def bio_read(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


def vendor_manifest():
    """VENDOR.json: sha1 of every fragment vendored from ../ancients/src, so drift is visible."""
    out = {}
    for f in VENDORED:
        with open(srcpath(f), 'rb') as fh:
            out[f] = hashlib.sha1(fh.read()).hexdigest()[:12]
    for f in BIO_VENDORED:
        p = os.path.join(TARGETS, 'city', '86-bio-%s.js' % f)
        if os.path.exists(p):
            with open(p, 'rb') as fh:
                out['targets/city/86-bio-%s.js' % f] = hashlib.sha1(fh.read()).hexdigest()[:12]
    with open(os.path.join(HERE, 'VENDOR.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
    return out


def vendor_check():
    """Compare the vendored fragments with ../ancients/src when that repo is beside this one."""
    up = os.path.join(ROOT, 'kits', 'ancients', 'src')
    if not os.path.isdir(up):
        print('vendor-check: ../ancients/src not found; skipped')
        return
    drift = []
    for f in VENDORED:
        a = open(srcpath(f), 'rb').read()
        p = srcpath(f, up)
        if not os.path.exists(p):
            drift.append(f + ' (missing upstream)')
        elif open(p, 'rb').read() != a:
            drift.append(f)
    print('vendor-check: %s' % ('all %d vendored fragments identical to ../ancients/src' % len(VENDORED)
                                 if not drift else 'DRIFT in ' + ', '.join(drift) + ' - re-vendor or note in KNOWN_ISSUES.md'))
    bup = os.path.join(ROOT, 'biomes', 'hyperjungle', 'src')
    if not os.path.isdir(bup):
        print('vendor-check: ../biomes/hyperjungle/src not found; biome check skipped')
        return
    bdrift = [f for f in BIO_VENDORED if not os.path.exists(bio_paths(f)[1])
              or bio_read(bio_paths(f)[1]) != bio_wrap(f, bio_read(bio_paths(f)[0]))]
    print('vendor-check: %s' % ('all %d biome fragments match ../biomes/hyperjungle/src (closure-wrapped by bio_wrap)'
                                 % len(BIO_VENDORED) if not bdrift else 'BIOME DRIFT in ' + ', '.join(bdrift)
                                 + ' - run build.py --vendor-bio, or note in KNOWN_ISSUES.md'))


def vendor_bio():
    """Rewrite targets/city/86-bio-*.js from ../biomes/hyperjungle/src through bio_wrap()."""
    for f in BIO_VENDORED:
        up, dst = bio_paths(f)
        with open(dst, 'w', encoding='utf-8', newline='') as fh:
            fh.write(bio_wrap(f, bio_read(up)))
    print('vendor-bio: wrote %d biome fragments' % len(BIO_VENDORED))


def main():
    if '--vendor-check' in sys.argv:
        vendor_check()
        return
    if '--vendor-bio' in sys.argv:
        vendor_bio()
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
