#!/usr/bin/env python3
"""Build kits/characters: the character editor page.

The page needs a web server (it fetches its pieces):  python3 -m http.server -d dist   then open /characters.html

  python3 build.py             # dist/characters.html (a whole page, the GLBs inside) and dist/characters.artifact.html
                               # (no <!doctype>/<html>/<body>, which the artifact host adds, and no GLBs: it fetches
                               # dist/pieces/*.txt (the GLBs as base64), published beside it, to stay under the host's 16 MB a page)
  python3 build.py --no-checks # skip the port lint and the node test

The pieces are made beforehand by tools/make_pieces.py (pieces/*.glb, data/*.json); this only packs them. The page is
src/00-head.html, then one inline script: core/rand (KRAND), the data (KCHAR_DATA) and the GLBs as base64
(KCHAR_GLB), then src/10-89 and src/90-editor.js. three.js r128 and its GLTFLoader load from the CDN, as in the hero
build. Deterministic: the same inputs give the same bytes; build-manifest.json holds a sha1 per input.
"""
import base64, hashlib, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
RAND = os.path.join(ROOT, 'core', 'rand', '08-core-rand.js')
CHECKS = '--no-checks' not in sys.argv

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if CHECKS and os.path.isfile(_cp) and subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def read(p, mode='r'):
    with open(p, mode) as f:
        return f.read()


BODIES = ('male', 'female')


def main():
    if CHECKS and subprocess.call(['node', os.path.join(HERE, 'tests', 'test-rig.js')]) != 0:
        sys.exit('build.py: tests/test-rig.js failed')
    J = lambda *p: json.loads(read(os.path.join(HERE, 'data', *p)))
    data = {'sliders': J('sliders.json'), 'bodies': {}}
    inputs = {'data/sliders.json': read(os.path.join(HERE, 'data', 'sliders.json'), 'rb')}
    for b in BODIES:
        if os.path.exists(os.path.join(HERE, 'data', b, 'kit.json')):
            data['bodies'][b] = {'skeleton': J(b, 'skeleton.json'), 'kit': J(b, 'kit.json')}
            for f in ('skeleton.json', 'kit.json'):
                inputs['data/%s/%s' % (b, f)] = read(os.path.join(HERE, 'data', b, f), 'rb')
    frags = sorted(f for f in os.listdir(SRC) if f.endswith('.js'))
    head = read(os.path.join(SRC, '00-head.html'))
    inputs['src/00-head.html'] = head.encode()
    js = ['/* core/rand/08-core-rand.js */', read(RAND)]
    inputs['core/rand/08-core-rand.js'] = js[-1].encode()
    js.append('var KCHAR_DATA = ' + json.dumps(data, separators=(',', ':')) + ';')
    for f in frags:
        t = read(os.path.join(SRC, f))
        inputs['src/' + f] = t.encode()
        js.append('/* src/%s */\n%s' % (f, t))
    # the pieces go beside the page as base64 text (the artifact host serves no binary type a GLB fits), fetched
    # when a record needs them: dist/pieces/<body>/<name>.txt
    for b in data['bodies']:
        src_dir, out_dir = os.path.join(HERE, 'pieces', b), os.path.join(DIST, 'pieces', b)
        os.makedirs(out_dir, exist_ok=True)
        for f in os.listdir(out_dir):
            os.remove(os.path.join(out_dir, f))
        for f in sorted(os.listdir(src_dir)):
            if f.endswith('.glb'):
                raw = read(os.path.join(src_dir, f), 'rb')
                inputs['pieces/%s/%s' % (b, f)] = raw
                with open(os.path.join(out_dir, f[:-4] + '.txt'), 'w') as o:
                    o.write(base64.b64encode(raw).decode())
    body = head + '<script>\n' + '\n'.join(js) + '\n</script>\n'
    os.makedirs(DIST, exist_ok=True)
    whole = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' \
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n' + \
            body + '</body>\n</html>\n'
    for name, text in (('characters.html', whole), ('characters.artifact.html', body)):
        with open(os.path.join(DIST, name), 'w', encoding='utf-8') as f:
            f.write(text)
    if CHECKS:
        script = os.path.join(DIST, '.check.js')
        open(script, 'w').write('\n'.join(js))
        rc = subprocess.call(['node', '--check', script])
        os.remove(script)
        if rc:
            sys.exit('build.py: the inline script does not parse')
    if '--thumbs' in sys.argv or not os.path.isdir(os.path.join(DIST, 'thumbs')):
        if subprocess.call(['node', os.path.join(HERE, 'tools', 'thumbs.mjs'), HERE]) != 0:
            print('build.py: thumbs.mjs failed; the chips show names only')
    man = {k: hashlib.sha1(v).hexdigest() for k, v in sorted(inputs.items())}
    man['dist/characters.html'] = hashlib.sha1(whole.encode()).hexdigest()
    json.dump(man, open(os.path.join(HERE, 'build-manifest.json'), 'w'), indent=1, sort_keys=True)
    print('dist/characters.html  %.2f MB, pieces %.1f MB' % (len(whole) / 1e6, sum(
        os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(os.path.join(DIST, 'pieces')) for f in fs) / 1e6))


if __name__ == '__main__':
    main()
