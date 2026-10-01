#!/usr/bin/env python3
"""Concatenate src/* (+ core/materials/*) into dist/ringsea.html: the Ring Sea watercraft kit.

Rules it enforces (the same ones the Ancients-lineage builds use):

  1. SEED DISCIPLINE. The PRNG is one global stream. Every vessel builder
     (`function buildRs...`) opens with reseed(N), so an edit inside one hull
     cannot move the rigging of every vessel built after it. No two fragments
     may claim the same seed.

  2. SHARED SCOPE. Every fragment is concatenated into one <script>, so a
     column-0 `function x` / `const x` declared in two fragments silently
     clobbers. Collisions and over-generic names are errors. Vessel keys
     (`RS_VESSEL({key:'...'`) must be unique.

  3. ONE VESSEL, ONE FRAGMENT. A fragment that registers a vessel must define
     its builder at column 0 as `function buildRs<Name>(...)` so the seed
     check can see it. Vessels depend only on 40-42 (core, hull, textures);
     that is what makes a vessel exportable to another world.

  4. MANIFEST. Writes build-manifest.json: a sha1 per fragment. Every build is
     deterministic: identical hashes prove nothing changed.

Usage:  python3 build.py [--no-checks]
Syntax: node --check runs when node is installed; otherwise run
        python3 jscheck.py .syntax-ringsea.js (headless Chromium's parser).
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
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
CORE = os.path.join(ROOT, 'core', 'materials')   # shared material fragments (core/README.md)
CORE_FILES = sorted(f for f in os.listdir(CORE) if f[0].isdigit())
OUT = 'ringsea'

RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED = re.compile(r'\breseed\(\s*(\d+)\s*\)')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)
RE_REG = re.compile(r'^RS_VESSEL\(\s*\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]', re.M)
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def check(order, bodies):
    errs, claims, keys, decl = [], {}, {}, {}
    for f in order:
        if not f.endswith('.js'):
            continue
        body = bodies[f]
        for m in RE_BUILDER.finditer(body):
            if 'reseed(' not in m.group(3):
                errs.append('%s: %s() does not open with reseed(N)' % (f, m.group(1)))
        regs = RE_REG.findall(body)
        for k in regs:
            keys.setdefault(k, []).append(f)
        if regs and not RE_BUILDER.search(body):
            errs.append('%s: registers %s but has no column-0 `function buildRs...`' % (f, ', '.join(regs)))
        for m in RE_RESEED.finditer(body):
            claims.setdefault(int(m.group(1)), set()).add(f)
        for rx in (RE_DECL, RE_DECL_MULTI):
            for m in rx.finditer(body):
                decl.setdefault(m.group(1), set()).add(f)
    for k, fs in sorted(keys.items()):
        if len(fs) > 1:
            errs.append('vessel key %r registered more than once: %s' % (k, ', '.join(fs)))
    for s, fs in sorted(claims.items()):
        if len(fs) > 1:
            errs.append('seed %d claimed by more than one fragment: %s' % (s, ', '.join(sorted(fs))))
    for name, fs in sorted(decl.items()):
        if len(fs) > 1:
            errs.append('top-level name `%s` declared in more than one fragment: %s' % (name, ', '.join(sorted(fs))))
        elif name in GENERIC and fs != {'10-core.js'}:
            errs.append('top-level name `%s` in %s is too generic for a shared scope' % (name, ', '.join(fs)))
    return errs


def main():
    do_checks = '--no-checks' not in sys.argv
    paths = {f: os.path.join(CORE, f) for f in CORE_FILES}
    paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})   # a src/ copy overrides
    order = sorted(paths)
    bodies = {}
    for f in order:
        with open(paths[f], encoding='utf-8', newline='') as fh:
            bodies[f] = fh.read()
    if do_checks:
        errs = check(order, bodies)
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)
    html = ''.join(bodies[f] for f in order)
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, OUT + '.html')
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order}, fh, indent=1, sort_keys=True)
    blocks = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
    chk = os.path.join(HERE, '.syntax-%s.js' % OUT)
    with open(chk, 'w', encoding='utf-8') as fh:
        fh.write(max(blocks, key=len) if blocks else '')
    try:
        r = subprocess.run([find_node() or 'node', '--check', chk], capture_output=True, text=True)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syntax = '  syntax OK (node)'
    except FileNotFoundError:
        syntax = '  syntax NOT CHECKED - run: python3 jscheck.py .syntax-%s.js' % OUT
    print('built %s (%d fragments, %.0f KB)%s' % (os.path.relpath(out, HERE), len(order),
                                                  os.path.getsize(out) / 1024, syntax))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        opened = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if opened:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(opened))
            for l in opened:
                print('  ' + l[6:])


if __name__ == '__main__':
    main()
