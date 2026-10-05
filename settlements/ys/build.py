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

TARGET_OUT = {'city': 'ys.html'}          # every other target builds to dist/<name>.html

# shared modules a target opts into (core/<module>/, digit-prefixed fragments). The city takes core/rand: its
# placement pass (PLAN.md P3) draws from KRAND streams and cell seeds, never from the lineage's rng() or the
# sin-based h3/fbm, so the city's layout reproduces in Godot (GODOT.md item 4; GODOT-PLAN.md Phase 2).
TARGET_CORE = {'city': ['rand']}


def srcpath(f, base=None):
    """Path of fragment f in base (default src/), falling back to core/materials/."""
    p = os.path.join(base or SRC, f)
    return p if os.path.exists(p) or f not in CORE_FILES else os.path.join(CORE, f)


# fragment -> upstream directory (relative to the repo root)
VENDORED = {}
for _f in ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js',
           '38-helpers2.js', '50-registry.js', '52-sky-abc.js', '54-mat-concrete.js', '69-mat-salvage.js', '99-tail.html']:
    VENDORED[_f] = 'kits/ancients/src'
for _f in ['70-port-core.js', '71-port-terrain.js', '72-port-kit.js', '73-port-edges.js', '74-port-dress.js']:
    VENDORED[_f] = 'settlements/port/src'
for _f in ['69b-vern-mat.js', '69c-vern-helpers.js', '81-sky.js', '92-camera.js', '93-labels.js']:
    VENDORED[_f] = 'settlements/iziz/src'
# vendored with deliberate edits: drift expected, recorded in KNOWN_ISSUES.md
ADAPTED = {'52-sky-abc.js', '71-port-terrain.js', '92-camera.js'}

# Fragments with no builder in them: helpers, materials, the scene, the shell.
DETERMINISTIC = {
    '00-head.html', '08-core-rand.js', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
    '69b-vern-mat.js', '69c-vern-helpers.js',
    '70-port-core.js', '72-port-kit.js', '73-port-edges.js', '74-port-dress.js',
    '60-ys-registries.js', '60-hyk-mat.js', '61-hyk-shell.js', '62-hyk-helpers.js', '64-hyk-accrete.js',
    '35-furn-frame.js', '84-kit-geo.js', '87-city-layout.js', '84b-city-shore.js', '87b-city-nav.js', '87c-city-paint.js',
    '81-sky.js', '91-ys-probe.js', '92-camera.js', '93-labels.js', '93-ys-ui.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',
    '84-city-geo.js', '84-mock-geo.js', '90-ys-scene.js', '88-city-place.js', '93z-city-api.js',
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
    src = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}
    src.update({f: os.path.join(CORE, f) for f in CORE_FILES if f not in src})
    for mod in TARGET_CORE.get(target, []):
        mdir = os.path.join(ROOT, 'core', mod)
        src.update({f: os.path.join(mdir, f) for f in os.listdir(mdir) if f[0].isdigit() and f.endswith('.js') and f not in src})
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
    m = re.search(r"const TITLE\s*=\s*'([^']*)'", bodies.get('89z-rows.js', ''))
    if m:
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % m.group(1), html, count=1)
    out = os.path.join(DIST, TARGET_OUT.get(target, target + '.html'))
    os.makedirs(DIST, exist_ok=True)
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
        up = os.path.join(ROOT, VENDORED[f], f)
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
