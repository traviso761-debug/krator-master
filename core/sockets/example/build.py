#!/usr/bin/env python3
"""Build the culture socket sheet: the smallest world that uses core/sockets/.

It borrows the post-apoc kit's engine fragments (page shell, rng, textures, materials, geometry, registry, scene, probe, camera) and adds
core/sockets/ (the socket + culture system) and one tiny demo building. The output shows the same wall dressed in every culture pack side by side.

    python3 build.py                      # -> sockets-example.html next to this file
    python3 ../../../kits/post-apoc/verify.py sockets-example.html --views "Cultures"

To start your own build on the socket system: copy the fragment list below, replace 40-demo.js with your buildings, keep 37-sockets.js, 38-symbols.js and 80-cultures.js from core/sockets/.
"""
import os, re, subprocess, sys


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

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
KIT = os.path.join(ROOT, 'kits', 'post-apoc', 'src'); CORE = os.path.join(HERE, '..')
# every post-apoc engine fragment, none of its buildings (4x-5x) or its showcase table (89): a hand-kept list
# broke twice as the scene grew new dependencies. Nor the two that need what only the kit's build.py generates or reads
# from core/: the material-library binding (29y: KMAT and the texture pack; the sheet keeps the procedural look, as the
# kit's ?mat=proc) and the furniture glue (91f: the catalog bundle, KFURN, KTAGS; the demo wall places no furniture)
FRAGS = [(KIT, f) for f in sorted(os.listdir(KIT)) if f[0].isdigit() and not re.match(r'(29y|4\d|5\d|89|91f)-', f)]
FRAGS += [(CORE, '37-sockets.js'), (CORE, '38-symbols.js'), (CORE, '80-cultures.js'), (HERE, '40-demo.js'), (HERE, '89-rows.js')]
FRAGS.sort(key=lambda t: t[1])
html = ''.join(open(os.path.join(d, f), encoding='utf-8', newline='').read() for d, f in FRAGS)
html = re.sub(r'<title>.*?</title>', '<title>Culture Socket Sheet</title>', html, count=1)
out = os.path.join(HERE, 'sockets-example.html'); open(out, 'w', encoding='utf-8', newline='').write(html)
body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]; chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8').write(body)
try:
    r = subprocess.run([find_node() or 'node', '--check', chk], capture_output=True, text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
    print('built sockets-example.html (%d fragments, %.0f KB)  syntax OK' % (len(FRAGS), os.path.getsize(out) / 1024))
except FileNotFoundError: print('built (no node: syntax not checked)')
