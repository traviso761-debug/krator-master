#!/usr/bin/env python3
"""Concatenate src/* and core/rand into dist/crops.html (the Crops kit: crops by warmth, pressure and aridity, in buckets).

Usage: python3 build.py [--no-checks]

The page is one <script> made of, in filename order:
  src/*                 00-head.html, 10-crop-core.js (axes, buckets, biomes), 20-crop-records.js and 22-crop-material.js (the records),
                        40-crop-query.js (the queries), 89-sheet.js (the browser sheet), 99-tail.html
  core/rand             08-core-rand.js (KRAND: CROPS.pick draws from it)
  26-crop-cards.js      GENERATED from tex/pack.json (python3 tools/textures/pack.py kits/crops): the library cards as data URLs
The data fragments (10, 20, 22, 40) are plain data and pure functions ([G data], PORT.md): a build that wants the crops reads them in
place the way kits/islanders reads kits/resources (CROPS_JS = 10, 20, 22, 40 and core/rand's 08). Nothing is vendored.
Tests: node test-crops.js. Checks (fragments share one scope): unique column-0 names, `node --check` when node exists.
"""
import base64, hashlib, json, os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and '--vendor-check' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places. None when there is none."""
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
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node', 'C:/Program Files/nodejs/node.exe',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'), os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))
KIT_ID = 'crops'
OUT = os.path.join(DIST, KIT_ID + '.html')
TEX_DIR = os.path.join(HERE, 'tex')
CORE_DIRS = [os.path.join(ROOT, 'core', 'rand')]
VIRTUAL = {'26-crop-cards.js'}


def cards_fragment():
    """The library cards the records name, as data URLs, from the committed tex/ files only (deterministic)."""
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: run python3 tools/textures/pack.py kits/crops */\nCROPS.CARDS = {};\n"
    pack = json.load(open(pj, encoding='utf-8'))
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        out.append(' %s: %s' % (json.dumps(e['lib']), json.dumps('data:image/webp;base64,' + base64.b64encode(
            open(os.path.join(TEX_DIR, e['files']['map']), 'rb').read()).decode())))
    return ('/* ============================== CARDS (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit. */\n'
            'CROPS.CARDS = {\n' + ',\n'.join(out) + '\n};\n')


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)


def main():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    files = sorted(list(paths) + list(VIRTUAL))
    bodies = {'26-crop-cards.js': cards_fragment()}
    bodies.update({f: open(paths[f], encoding='utf-8', newline='').read() for f in files if f not in VIRTUAL})
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if f.endswith('.js') and f not in VIRTUAL:
                for m in RE_DECL.finditer(bodies[f]): decl.setdefault(m.group(1), set()).add(f)
        for n, fs in sorted(decl.items()):
            if len(fs) > 1: errs.append('top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))))
    if errs:
        print('BUILD RULES FAILED:'); [print('  -', e) for e in errs]; sys.exit(1)
    html = ''.join(bodies[f] for f in files)
    os.makedirs(DIST, exist_ok=True)
    open(OUT, 'w', encoding='utf-8', newline='').write(html)
    json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in files},
              open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n'), indent=1, sort_keys=True)
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8').write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode: print(r.stdout + r.stderr); sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node: verify.py is the check)'
    print('built dist/' + KIT_ID + '.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op)); [print('  ' + l[6:]) for l in op]


if __name__ == '__main__':
    main()
