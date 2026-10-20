#!/usr/bin/env python3
"""Build core/charactermodels: two pages over the same pieces.

  dist/cosmetic-lab.html    the Cosmetic Lab: one figure, every face, hair, skin, body and clothing choice (the future
                            player character editor), and strangers in bulk for NPCs (src/00-head.html, 90-editor.js)
  dist/animation-lab.html   the Animation Lab: six figures (each body neutral, short and broad, tall and lanky) side by
                            side, every clip on all of them at once, with a review mark per clip (src/01-animlab.html,
                            92-animlab.js)

The pages need a web server (they fetch their pieces):  python3 -m http.server -d dist   then open /cosmetic-lab.html

  python3 build.py             # dist/<page>.html (whole pages) and dist/<page>.artifact.html (no <!doctype>/<html>/
                               # <body>, which the artifact host adds); both fetch dist/pieces/*.txt (the GLBs and
                               # morph deltas as a second line, gzipped, as base64), published beside them, to stay under the host's 16 MB a page
  python3 build.py --no-checks # skip the port lint and the node test
  python3 build.py --meshy     # also pack the earlier Meshy-donor bodies (data/male, data/female)

The pieces are made beforehand by tools/make_pieces.py (pieces/*.glb, data/*.json); this only packs them. The page is
its head fragment (PAGES), then one inline script: core/rand (KRAND), the data (KCHAR_DATA), then the shared
fragments src/10-89 and the page's own 9x fragment. three.js r128 and its GLTFLoader load from the CDN, as in the hero
build. Deterministic: the same inputs give the same bytes; build-manifest.json holds a sha1 per input.
"""
import base64, gzip, hashlib, json, os, shutil, subprocess, sys

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
    with open(p, mode, **({} if 'b' in mode else {'encoding': 'utf-8'})) as f:    # (cp1252 on Windows: the pages came out in mojibake)
        return f.read()


# the MakeHuman bodies (tools/make_mpfb.py); the earlier Meshy-donor kits (tools/make_kit.py) only with --meshy
BODIES = tuple(sorted(b for b in os.listdir(os.path.join(HERE, 'data')) if os.path.exists(os.path.join(HERE, 'data', b, 'kit.json'))
                      and (b.startswith('mpfb_') or '--meshy' in sys.argv)))


# page -> (its head fragment, its own script fragment); every page also takes the shared src/10-89*.js
PAGES = {'cosmetic-lab': ('00-head.html', '90-editor.js'), 'animation-lab': ('01-animlab.html', '92-animlab.js')}


def main():
    if CHECKS and subprocess.call(['node', os.path.join(HERE, 'tests', 'test-rig.js')]) != 0:
        sys.exit('build.py: tests/test-rig.js failed')
    J = lambda *p: json.loads(read(os.path.join(HERE, 'data', *p)))
    data = {'sliders': J('sliders.json'), 'peoples': J('peoples.json')['peoples'], 'clips': J('clips.json'),
            'props': J('props.json')['props'], 'posture': J('posture.json'), 'bodies': {}}
    inputs = {'data/%s' % f: read(os.path.join(HERE, 'data', f), 'rb')
              for f in ('sliders.json', 'peoples.json', 'clips.json', 'props.json', 'posture.json')}
    for b in BODIES:
        if os.path.exists(os.path.join(HERE, 'data', b, 'kit.json')):
            data['bodies'][b] = {'skeleton': J(b, 'skeleton.json'), 'kit': J(b, 'kit.json')}
            for f in ('skeleton.json', 'kit.json'):
                inputs['data/%s/%s' % (b, f)] = read(os.path.join(HERE, 'data', b, f), 'rb')
    shared = sorted(f for f in os.listdir(SRC) if f.endswith('.js') and f < '90')
    js = ['/* core/rand/08-core-rand.js */', read(RAND)]
    inputs['core/rand/08-core-rand.js'] = js[-1].encode()
    js.append('var KCHAR_DATA = ' + json.dumps(data, separators=(',', ':')) + ';')
    for f in shared:
        t = read(os.path.join(SRC, f))
        inputs['src/' + f] = t.encode()
        js.append('/* src/%s */\n%s' % (f, t))
    # the pieces go beside the page as base64 text (the artifact host serves no binary type a GLB fits), fetched
    # when a record needs them: dist/pieces/<body>/<name>.txt
    if os.path.isdir(os.path.join(DIST, 'pieces')):           # bodies no longer built
        for b in os.listdir(os.path.join(DIST, 'pieces')):
            if b not in data['bodies'] and b != 'props':
                q = os.path.join(DIST, 'pieces', b)
                shutil.rmtree(q) if os.path.isdir(q) else os.remove(q)
    for b in list(data['bodies']) + ['props']:          # each body's pieces, and the hand-held props they share
        src_dir, out_dir = os.path.join(HERE, 'pieces', b), os.path.join(DIST, 'pieces', b)
        if not os.path.isdir(src_dir):
            # pieces/ is not in Git: a checkout without the Blender half has none of a body's, or only those a
            # partial build made (make_mpfb.py --merge). The page is built all the same; publish only what is here
            print('build.py: no pieces/%s here: the page is built, its pieces are not' % b)
            continue
        os.makedirs(out_dir, exist_ok=True)
        for f in os.listdir(out_dir):
            os.remove(os.path.join(out_dir, f))
        # one file per piece: its GLB, and on a second line its morph deltas (make_mpfb.py), each gzipped (the page
        # unzips them) as base64: one fetch, and half the files (a published artifact holds at most 512)
        lines = {}
        for f in sorted(os.listdir(src_dir)):
            if f.endswith('.glb') or f.endswith('.morph.bin'):
                raw = read(os.path.join(src_dir, f), 'rb')
                inputs['pieces/%s/%s' % (b, f)] = raw
                name, k = (f[:-10], 1) if f.endswith('.morph.bin') else (f[:-4], 0)
                lines.setdefault(name, ['', ''])[k] = base64.b64encode(gzip.compress(raw, 9, mtime=0)).decode()
        for name, (glb, morph) in lines.items():
            with open(os.path.join(out_dir, name + '.txt'), 'w', encoding='utf-8', newline='\n') as o:
                o.write(glb + ('\n' + morph if morph else ''))
    os.makedirs(DIST, exist_ok=True)
    for old in ('characters.html', 'characters.artifact.html'):              # the single page before the split
        if os.path.exists(os.path.join(DIST, old)):
            os.remove(os.path.join(DIST, old))
    wholes = {}
    for page, (headf, own) in sorted(PAGES.items()):
        head, t = read(os.path.join(SRC, headf)), read(os.path.join(SRC, own))
        inputs['src/' + headf], inputs['src/' + own] = head.encode(), t.encode()
        pjs = js + ['/* src/%s */\n%s' % (own, t)]
        body = head + '<script>\n' + '\n'.join(pjs) + '\n</script>\n'
        whole = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' \
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n' + \
                body + '</body>\n</html>\n'
        for name, text in ((page + '.html', whole), (page + '.artifact.html', body)):
            with open(os.path.join(DIST, name), 'w', encoding='utf-8', newline='\n') as f:
                f.write(text)
        wholes[page] = whole
        if CHECKS:
            script = os.path.join(DIST, '.check.js')
            open(script, 'w', encoding='utf-8').write('\n'.join(pjs))
            rc = subprocess.call(['node', '--check', script])
            os.remove(script)
            if rc:
                sys.exit('build.py: %s: the inline script does not parse' % page)
    if '--thumbs' in sys.argv or not os.path.isdir(os.path.join(DIST, 'thumbs')):
        if subprocess.call(['node', os.path.join(HERE, 'tools', 'thumbs.mjs'), HERE]) != 0:
            print('build.py: thumbs.mjs failed; the chips show names only')
    pack_thumbs()
    man = {k: hashlib.sha1(v).hexdigest() for k, v in sorted(inputs.items())}
    # the pieces this checkout does not have keep the hashes the last whole build wrote (they did not change here)
    old = os.path.join(HERE, 'build-manifest.json')
    if os.path.exists(old):
        kept = {k: v for k, v in json.load(open(old, encoding='utf-8')).items() if k.startswith('pieces/') and k not in man
                and not os.path.exists(os.path.join(HERE, k)) and (k.split('/')[1] == 'props' or os.path.isfile(os.path.join(HERE, 'data', k.split('/')[1], 'kit.json')))}
        man.update(kept)
        if kept:
            print('build.py: %d pieces not here keep their last hashes' % len(kept))
    for page, whole in wholes.items():
        man['dist/%s.html' % page] = hashlib.sha1(whole.encode()).hexdigest()
    json.dump(man, open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n'), indent=1, sort_keys=True)
    print('%s  pieces %.1f MB' % ('  '.join('dist/%s.html %.2f MB' % (p, len(w) / 1e6) for p, w in sorted(wholes.items())), sum(
        os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(os.path.join(DIST, 'pieces')) for f in fs) / 1e6))


def pack_thumbs(size=128, cols=16):
    """each body's thumbnails as one atlas (dist/thumbs/<body>.png, cols across) and its index (<body>.json: per
    '<name>__<mesh>', its cell): one file where there were a hundred (an artifact holds at most 512)"""
    from PIL import Image
    root = os.path.join(DIST, 'thumbs')
    if not os.path.isdir(root):
        return
    for body in sorted(d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))):
        names = sorted(f[:-4] for f in os.listdir(os.path.join(root, body)) if f.endswith('.png'))
        if not names:
            continue
        rows = (len(names) + cols - 1) // cols
        atlas = Image.new('RGBA', (cols * size, rows * size), (0, 0, 0, 0))
        for i, n in enumerate(names):
            im = Image.open(os.path.join(root, body, n + '.png')).convert('RGBA').resize((size, size), Image.LANCZOS)
            atlas.paste(im, ((i % cols) * size, (i // cols) * size))
        atlas.save(os.path.join(root, body + '.png'), optimize=True)
        json.dump({'cols': cols, 'rows': rows, 'keys': {n: i for i, n in enumerate(names)}}, open(os.path.join(root, body + '.json'), 'w'),
                  separators=(',', ':'))


if __name__ == '__main__':
    main()
