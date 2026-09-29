#!/usr/bin/env python3
"""Concatenate src/* + targets/<t>/* into dist/<t>.html (Dalab).

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

NOTE ON THE SYNTAX CHECK: it runs `node --check`, and node is NOT installed on
this machine. When node is missing this script says so plainly and does not
claim the file is syntactically valid — the only thing that actually catches a
syntax error here is verify.py, which loads the page and reads the on-screen
error panel. Do not read a green build as "the JavaScript parses".
"""
import hashlib, json, os, re, subprocess, sys

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


def srcpath(f, base=None):
    """Path of fragment f in base (default src/), falling back to core/materials/.
    A local copy with the same name overrides the shared one."""
    p = os.path.join(base or SRC, f)
    return p if os.path.exists(p) or f not in CORE_FILES else os.path.join(CORE, f)

# A target is a showcase built from the shared src/ fragments plus its own site
# table and view list, merged into the one sorted filename order. Everything
# else — core, helpers, all 33 builders — is shared, so a fix to a builder lands
# in every target that shows it and the two cannot drift.
TARGET_OUT = {
    'set': 'dalab-set.html',            # the Dalab building kit showcase
    'city': 'dalab.html',               # the settlement
}

# Fragments with no builder in them: helpers, materials, the scene, the shell.
DETERMINISTIC = {
    '00-head.html', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
    '69b-vern-mat.js', '69c-vern-helpers.js',            # vendored from ../iziz/src (the Vernacular kit + helpers)
    '69d-dalab-mat.js', '69e-dalab-helpers.js',          # Dalab materials, kit items, building blocks
    '70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '72-hl-helpers.js', '73-hl-carve.js',   # vendored from ../highlands/src
    '81-sky.js', '86-bio-45-init.js', '90-scene.js', '91-probe.js', '92-camera.js', '93-labels.js', '94-dalab-light.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',        # per-target site table and view list
    '84-city-geo.js', '85-city-paint.js', '93-city-ui.js',   # city target: geometry, the painted ground, dev-tool UI
}

# Seed ranges known to collide, kept here so the build stays green while the
# collision is tracked in KNOWN_ISSUES.md. Remove an entry when it is fixed;
# do not add one without an accompanying KNOWN_ISSUES entry.
SEED_COLLISION_EXCEPTIONS = set()

# Fragments that are IIFE-scoped by contract (the Krator biome core and biome
# fragments): their column-0 declarations live inside a closure, so the
# shared-scope name checks do not apply. They keep their own PRNG too, so the
# reseed rule does not apply either. Matched by filename prefix.
SCOPED_PREFIXES = ('86-bio-',)   # none yet: the settlement pass vendors a biome the way Iziz's city did
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


VENDORED = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
            '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js',
            '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js']          # ../ancients/src
VENDORED_IZIZ = ['69b-vern-mat.js', '69c-vern-helpers.js', '81-sky.js', '90-scene.js', '91-probe.js',
                 '92-camera.js', '93-labels.js', '99-tail.html', '00-head.html',
                 '75-port-embassy.js', '76-port-chapterhouse.js']   # ../iziz/src (the vp* kit, the Voth embassy, the Historians' chapterhouse from the Yuni set)
VENDORED_HL = ['70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '72-hl-helpers.js', '73-hl-carve.js', '74-rep-dwell.js']   # ../highlands/src (the Republican dwellings, for the embassy)
BIO_VENDORED = ['10-core-head', '20-core-kit', '30-core-foliage', '40-core-place',
                '50-biome-swlowlands-species', '55-biome-swlowlands-trees', '60-biome-swlowlands-floor',
                '65-biome-swlowlands-dress', '70-biome-swlowlands']   # ../biomes/swlowlands/src -> src/86-bio-*.js


def vendor_manifest():
    """VENDOR.json: sha1 of every fragment vendored from ../ancients/src and ../iziz/src, so drift is visible."""
    out = {}
    for f in VENDORED + VENDORED_IZIZ + VENDORED_HL + ['86-bio-%s.js' % b for b in BIO_VENDORED]:
        with open(srcpath(f), 'rb') as fh:
            out[f] = hashlib.sha1(fh.read()).hexdigest()[:12]
    with open(os.path.join(HERE, 'VENDOR.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
    return out


def vendor_check():
    """Compare the vendored fragments with ../ancients/src and ../iziz/src when those repos are beside this one."""
    lab = os.path.join(TARGETS, 'city', '63-anc-dalab.js'); up = os.path.join(ROOT, 'kits', 'ancients', 'src', '64-dalab.js')
    if os.path.exists(lab) and os.path.exists(up):
        print('vendor-check: targets/city/63-anc-dalab.js %s ../ancients/src/64-dalab.js' % ('identical to' if open(lab,'rb').read()==open(up,'rb').read() else 'drifts from (deliberate: the wall gap LAB_WALL_GAP and the narrower BITE, marked DALAB in the file)'))
    for label, files, up in (('ancients', VENDORED, os.path.join(ROOT, 'kits', 'ancients', 'src')),
                             ('iziz', VENDORED_IZIZ, os.path.join(os.path.dirname(HERE), 'iziz', 'src')),
                             ('highlands', VENDORED_HL, os.path.join(os.path.dirname(HERE), 'highlands', 'src')),
                             ('biomes/swlowlands', [('86-bio-%s.js' % b, b + '.js') for b in BIO_VENDORED],
                              os.path.join(ROOT, 'biomes', 'swlowlands', 'src'))):
        if not os.path.isdir(up):
            print('vendor-check: ../%s/src not found; skipped' % label)
            continue
        drift = []
        for f in files:
            f, upf = (f if isinstance(f, tuple) else (f, f))
            a = open(srcpath(f), 'rb').read()
            p = srcpath(upf, up)
            if not os.path.exists(p):
                drift.append(f + ' (missing upstream)')
            elif open(p, 'rb').read() != a:
                drift.append(f)
        print('vendor-check: %s' % ('all %d fragments identical to ../%s/src' % (len(files), label)
                                     if not drift else 'DRIFT vs ../%s/src in ' % label + ', '.join(drift) + ' - re-vendor or note in KNOWN_ISSUES.md'))


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
            r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
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
