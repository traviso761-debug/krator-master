#!/usr/bin/env python3
"""Concatenate src/* into dist/post-apoc.html (the Post-Apoc building set).

Usage: python3 build.py [--no-checks]
       python3 build.py --vendor-check   (shared-file drift; exit 1 if a local file shadows core/sockets)

Checks (they exist because fragments share one JS scope and several agents write buildings):
  1. every defBuilding({...}) has a unique numeric `seed:` and its builder opens with reseed by place() (seed is passed in the def);
  2. no column-0 const/let/var/function name is declared in two fragments, and none is one of the generic short names;
  3. every building fragment (4x-7x) declares only names carrying its own prefix (given in the fragment's first line: `// prefix: xx`);
  4. `node --check` on the concatenated script (node is present on this box; if it is not, the script says so and verify.py is the only syntax check).
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

try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
CORE_SOCK = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'sockets')   # shared: the socket + culture system (core/sockets/README.md)
OUT = os.path.join(DIST, 'post-apoc.html')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
GENERIC = {'seed','base','dir','pos','tmp','i','j','k','n','p','t','x','y','z','a','b','c','d','e','f','g','h','m','q','r','s','u','v','w','P','W'}
ALLOW_GENERIC = {'P', 'W', 'PI', 'TAU'}   # engine names on purpose

def main():
    paths = {f: os.path.join(CORE_SOCK, f) for f in os.listdir(CORE_SOCK) if f[0].isdigit()}
    paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})   # a local copy with the same name overrides the shared one
    files = sorted(paths)
    bodies = {f: open(paths[f], encoding='utf-8', newline='').read() for f in files}
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js'): continue
            for m in RE_DECL.finditer(bodies[f]): decl.setdefault(m.group(1), set()).add(f)
        for n, fs in sorted(decl.items()):
            if len(fs) > 1: errs.append('top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))))
        seeds = {}
        for f in files:
            for m in RE_SEED.finditer(bodies[f]): seeds.setdefault(int(m.group(1)), []).append(f)
            keys = RE_KEY.findall(bodies[f]); nseed = len(RE_SEED.findall(bodies[f]))
            if len(keys) != nseed: errs.append('%s: %d defBuilding keys but %d seeds' % (f, len(keys), nseed))
        for s, fs in seeds.items():
            if len(fs) > 1: errs.append('seed %d claimed twice: %s' % (s, ', '.join(fs)))
        for f in files:   # building fragments own a prefix
            m = re.match(r'// prefix: (\w+)', bodies[f])
            if re.match(r'(4\d|5\d|6\d|7\d)-', f) and f.endswith('.js'):
                if not m: errs.append('%s: building fragments start with `// prefix: xx`' % f); continue
                pre = m.group(1)
                for n in RE_DECL.findall(bodies[f]):
                    if not n.startswith(pre): errs.append('%s: top-level name `%s` does not start with prefix `%s`' % (f, n, pre))
    if errs:
        print('BUILD RULES FAILED:'); [print('  -', e) for e in errs]; sys.exit(1)
    html = ''.join(bodies[f] for f in files)
    os.makedirs(DIST, exist_ok=True)
    open(OUT, 'w', encoding='utf-8', newline='').write(html)
    json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in files}, open(os.path.join(HERE, 'build-manifest.json'), 'w'), indent=1, sort_keys=True)
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8').write(body)
    try:
        r = subprocess.run([find_node() or 'node', '--check', chk], capture_output=True, text=True)
        if r.returncode: print(r.stdout + r.stderr); sys.exit(1)
        syn = '  syntax OK'
    except FileNotFoundError: syn = '  syntax NOT CHECKED (no node)'
    print('built dist/post-apoc.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op)); [print('  ' + l[6:]) for l in op]
# ---------------------------------------------------------------- vendor check
# core/sockets/ is read live, so the only way to drift from it is a local src/ file of the same name, which
# silently wins in main(). That is an error. The shell (head, core, camera, tail) is a FORK of the Ancients-lineage
# shell, not a copy: its distance from kits/ancients/src is printed for information only.
ANCIENTS = os.path.join(os.path.dirname(HERE), 'ancients', 'src')
SHELL = ['00-head.html', '10-core.js', '92-camera.js', '99-tail.html']
def vendor_check():
    bad = []
    for f in sorted(x for x in os.listdir(CORE_SOCK) if x[0].isdigit()):
        local = os.path.join(SRC, f)
        if os.path.exists(local):
            same = open(local, 'rb').read() == open(os.path.join(CORE_SOCK, f), 'rb').read()
            print('  !  src/%-14s shadows core/sockets/%s (%s)' % (f, f, 'identical: delete it' if same else 'DRIFTS'))
            bad.append(f)
        else:
            print('  =  %-18s read from core/sockets' % f)
    import difflib
    for f in SHELL:
        up, local = os.path.join(ANCIENTS, f), os.path.join(SRC, f)
        if not os.path.exists(up): print('  ?  %-18s no upstream in kits/ancients/src' % f); continue
        a = open(local, encoding='utf-8').read().splitlines(); b = open(up, encoding='utf-8').read().splitlines()
        n = sum(1 for l in difflib.unified_diff(a, b, lineterm='', n=0) if l[:1] in '+-' and l[:3] not in ('+++', '---'))
        print('  ~  %-18s %s' % (f, 'matches kits/ancients/src (line endings aside)' if n == 0 else 'forked from kits/ancients/src (%d lines differ; informational)' % n))
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT: ' + ', '.join(bad)))
    return not bad
if __name__ == '__main__':
    if '--vendor-check' in sys.argv: sys.exit(0 if vendor_check() else 1)
    main()
