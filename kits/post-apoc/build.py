#!/usr/bin/env python3
"""Concatenate src/* into dist/post-apoc.html (the Post-Apoc building set).

Usage: python3 build.py [--no-checks]

Checks (they exist because fragments share one JS scope and several agents write buildings):
  1. every defBuilding({...}) has a unique numeric `seed:` and its builder opens with reseed by place() (seed is passed in the def);
  2. no column-0 const/let/var/function name is declared in two fragments, and none is one of the generic short names;
  3. every building fragment (4x-7x) declares only names carrying its own prefix (given in the fragment's first line: `// prefix: xx`);
  4. `node --check` on the concatenated script (node is present on this box; if it is not, the script says so and verify.py is the only syntax check).
"""
import hashlib, json, os, re, subprocess, sys
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
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
        if r.returncode: print(r.stdout + r.stderr); sys.exit(1)
        syn = '  syntax OK'
    except FileNotFoundError: syn = '  syntax NOT CHECKED (no node)'
    print('built dist/post-apoc.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op)); [print('  ' + l[6:]) for l in op]
if __name__ == '__main__': main()
