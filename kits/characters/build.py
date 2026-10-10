#!/usr/bin/env python3
"""Build kits/characters: the character editor page.

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


def main():
    if CHECKS and subprocess.call(['node', os.path.join(HERE, 'tests', 'test-rig.js')]) != 0:
        sys.exit('build.py: tests/test-rig.js failed')
    data = {k: json.loads(read(os.path.join(HERE, 'data', k + '.json'))) for k in ('skeleton', 'sliders', 'outfits')}
    glbs = {'anims': 'pieces/anims.glb'}
    for o in data['outfits']['outfits']:
        glbs[o['id']] = o['glb']
    inputs = {}
    frags = sorted(f for f in os.listdir(SRC) if f.endswith('.js'))
    head = read(os.path.join(SRC, '00-head.html'))
    inputs['src/00-head.html'] = head.encode()
    js = ['/* core/rand/08-core-rand.js */', read(RAND)]
    inputs['core/rand/08-core-rand.js'] = js[-1].encode()
    js.append('var KCHAR_DATA = ' + json.dumps(data, separators=(',', ':')) + ';')
    b64 = {}
    for k, rel in glbs.items():
        raw = read(os.path.join(HERE, rel), 'rb')
        inputs[rel] = raw
        b64[k] = base64.b64encode(raw).decode()
    js.append('var KCHAR_GLB = ' + json.dumps(b64, separators=(',', ':')) + ';')
    for f in frags:
        s = read(os.path.join(SRC, f))
        inputs['src/' + f] = s.encode()
        js.append('/* src/%s */\n%s' % (f, s))
    for k in ('skeleton', 'sliders', 'outfits'):
        inputs['data/%s.json' % k] = read(os.path.join(HERE, 'data', k + '.json'), 'rb')
    body = head + '<script>\n' + '\n'.join(js) + '\n</script>\n'
    # the artifact host takes 16 MB a page, so its copy fetches the GLBs published beside it (dist/pieces/)
    lean = [x if not x.startswith('var KCHAR_GLB = ') else 'var KCHAR_GLB = {};' for x in js]
    art = head + '<script>\n' + '\n'.join(lean) + '\n</script>\n'
    os.makedirs(DIST, exist_ok=True)
    whole = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' \
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n' + \
            body + '</body>\n</html>\n'
    for name, text in (('characters.html', whole), ('characters.artifact.html', art)):
        with open(os.path.join(DIST, name), 'w', encoding='utf-8') as f:
            f.write(text)
    os.makedirs(os.path.join(DIST, 'pieces'), exist_ok=True)
    for k, rel in glbs.items():
        # base64 text: the artifact host serves no binary type a GLB fits; the page decodes it
        with open(os.path.join(DIST, 'pieces', k + '.txt'), 'w') as f:
            f.write(b64[k])
    if CHECKS:
        script = os.path.join(DIST, '.check.js')
        open(script, 'w').write('\n'.join(js[:1] + js[1:2] + [read(os.path.join(SRC, f)) for f in frags]))
        rc = subprocess.call(['node', '--check', script])
        os.remove(script)
        if rc:
            sys.exit('build.py: the inline script does not parse')
    man = {k: hashlib.sha1(v).hexdigest() for k, v in sorted(inputs.items())}
    man['dist/characters.html'] = hashlib.sha1(whole.encode()).hexdigest()
    json.dump(man, open(os.path.join(HERE, 'build-manifest.json'), 'w'), indent=1, sort_keys=True)
    print('dist/characters.html  %.1f MB' % (len(whole) / 1e6))


if __name__ == '__main__':
    main()
