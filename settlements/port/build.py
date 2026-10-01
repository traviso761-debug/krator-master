#!/usr/bin/env python3
"""Concatenate src/* + targets/<t>/* into dist/<t>.html (the Krator Ancient Port).

Adapted from voth/ancients/build.py. The rules it enforces are the same ones
that make parallel agent work safe on the ancients kit:

  1. SEED DISCIPLINE. The PRNG is one global stream. Every builder opens with
     reseed(N) so an edit inside one builder cannot move the rubble of every
     structure built after it. Checked: each top-level `function build*()`
     opens with a reseed, and no two fragments claim overlapping seeds. A
     builder runs once per decay state, so `reseed(20000+d)` claims
     20000..20004 (d 0..4) and `reseed(d>0?9801:9800)` claims both.
     Port rule on top: a fragment that registers a segment or a vessel
     (a column-0 `PORT_SEG(` / `PORT_VESSEL(` call) must define its builder as
     a top-level `function build...` so the reseed check can see it.

  2. SHARED SCOPE. Every fragment is concatenated into one <script>, so a
     column-0 `function x` / `const x` declared in two fragments silently
     clobbers. Collisions and over-generic names are errors. Registration keys
     (`PORT_SEG({key:'...'`) must be unique across fragments too.

  3. TOP-LEVEL ORDER IS LOAD-BEARING. kdef() calls fix the order in which
     kbake() creates InstancedMeshes, and TEX/MAT literals must exist before
     the kdef()s naming them. Fragments are concatenated in filename order.

  4. MANIFEST. Writes build-manifest-<target>.json: a sha1 per fragment.

TARGETS ARE DISCOVERED: every directory under targets/ that holds an
`89z-rows.js` is a target and builds to dist/<dirname>.html. There is no
table to edit. To make your own dev target, copy targets/segment/ to
targets/<yours>/ and change PORT_ONLY in its 89z-rows.js.

Usage:  python3 build.py [--target X] [--no-checks]

The syntax check runs `node --check` on .syntax-<target>.js with the node
find_node() finds ($NODE, PATH, /opt/node*/bin, ~/.nvm). Without node it says
so; then run `python3 jscheck.py .syntax-<target>.js` (headless Chromium's parser).
"""
import hashlib, json, os, re, subprocess, sys


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


try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))   # repo root: biomes/, core/, kits/, settlements/
SRC = os.path.join(HERE, 'src')
TARGETS = os.path.join(HERE, 'targets')
DIST = os.path.join(HERE, 'dist')
CORE = os.path.join(ROOT, 'core', 'materials')   # shared material fragments (core/README.md)
CORE_FILES = sorted(f for f in os.listdir(CORE) if f[0].isdigit())

# Fragments with no builder in them: helpers, materials, the scene, the shell,
# the port core, the per-target tables. Anything else must contain a builder.
DETERMINISTIC = {
    '00-head.html', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js',
    '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
    '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
    '70-port-core.js', '71-port-terrain.js', '72-port-kit.js', '73-port-edges.js',
    '74-port-dress.js',
    '90-scene.js', '91-probe.js', '92-camera.js', '99-tail.html',
    '89z-rows.js', '91z-views.js',
}

SEED_COLLISION_EXCEPTIONS = set()

RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED_ARG = re.compile(r'\breseed\(\s*([^)]*?)\s*\)')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)
RE_REGCALL = re.compile(r'^PORT_(SEG|VESSEL)\(\s*\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]', re.M)

GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def seeds_claimed(arg):
    """Expand a reseed() argument into the set of integer seeds it can produce.
    `N+d` claims N..N+4 (decays 0-4)."""
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
    return set()      # e.g. reseed(s) inside a helper that takes a seed


def check(order, bodies):
    errs, claims, keys = [], {}, {}

    for f in order:
        if not f.endswith('.js'):
            continue
        body = bodies[f]

        for m in RE_BUILDER.finditer(body):
            name, head = m.group(1), m.group(3)
            if 'reseed(' not in head:
                errs.append('%s: %s() does not open with reseed(N); without it the '
                            'structure inherits whatever stream the previous builder '
                            'left behind.' % (f, name))

        regs = RE_REGCALL.findall(body)
        for kind, key in regs:
            keys.setdefault(key, []).append(f)
        if regs and not RE_BUILDER.search(body):
            errs.append('%s: registers %s but has no top-level `function build...(scene,gx,gz,d,opt)`'
                        ' opening with reseed(N). Define the builder at column 0 and pass it as'
                        ' `build:` so the seed check can see it.' % (f, ', '.join(k for _, k in regs)))

        for m in RE_RESEED_ARG.finditer(body):
            for s in seeds_claimed(m.group(1)):
                claims.setdefault(s, set()).add(f)

        if f not in DETERMINISTIC and not RE_BUILDER.search(body) and 'reseed(' not in body:
            errs.append('%s: generative fragment with no builder and no reseed(N). Add '
                        'one, or list the file in DETERMINISTIC in build.py.' % f)

    for key, files in sorted(keys.items()):
        if len(files) > 1:
            errs.append('registration key %r claimed more than once: %s' % (key, ', '.join(files)))

    collided = {}
    for s, files in sorted(claims.items()):
        if len(files) > 1:
            collided.setdefault(tuple(sorted(files)), []).append(s)
    for files, ss in sorted(collided.items()):
        if files in SEED_COLLISION_EXCEPTIONS:
            continue
        errs.append('seed(s) %s claimed by more than one fragment: %s'
                    % (','.join(str(x) for x in ss), ', '.join(files)))

    decl = {}
    for f in order:
        if not f.endswith('.js'):
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


def discover():
    if not os.path.isdir(TARGETS):
        return []
    return sorted(t for t in os.listdir(TARGETS)
                  if os.path.isfile(os.path.join(TARGETS, t, '89z-rows.js')))


def build_one(target, do_checks):
    tdir = os.path.join(TARGETS, target)
    if not os.path.isdir(tdir):
        sys.exit('no such target: %s (expected %s)' % (target, tdir))

    src = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}
    src.update({f: os.path.join(CORE, f) for f in CORE_FILES if f not in src})   # a src/ copy overrides
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
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % m.group(1),
                      html, count=1)
    out = os.path.join(DIST, target + '.html')
    os.makedirs(DIST, exist_ok=True)
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest-%s.json' % target), 'w', encoding='utf-8') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order},
                  fh, indent=1, sort_keys=True)
    return order, html, out


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
        with open(chk, 'w', encoding='utf-8') as fh:
            fh.write(body)
        try:
            r = subprocess.run([find_node() or 'node', '--check', chk], capture_output=True, text=True)
            if r.returncode:
                print(r.stdout + r.stderr)
                sys.exit(1)
            syntax = '  syntax OK'
        except FileNotFoundError:
            syntax = '  syntax NOT CHECKED - run: python3 jscheck.py .syntax-%s.js' % target
        print('built %-24s (%2d fragments, %4.0f KB)%s%s'
              % (os.path.relpath(out, HERE), len(order), os.path.getsize(out) / 1024,
                 syntax, '' if do_checks else '  [checks skipped]'))


if __name__ == '__main__':
    main()

_ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki, encoding='utf-8') if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(_open))
        for l in _open:
            print('  ' + l[6:])
