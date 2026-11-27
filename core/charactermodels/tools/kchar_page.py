#!/usr/bin/env python3
"""core/charactermodels for a settlement's page: the records' data cut to the peoples it draws, and the pieces as sidecars.

Longsong's build.py (_kchar, 2026-10-19) made a function, for any page that dresses its people from this module (the Flashing
Eye's, 2026-11-23). A page reads src/10-rig.js (KCHAR), src/50-figure.js (KCharFigure), src/60-crowd.js (KCharCrowd) and
tools/vendor/GLTFLoader.r128.js in place; this gives it the rest:

    js = kchar_page.fragment('FE_KCHAR', peoples=('historians', 'xanadu'), items=[...], beards={...}, out=<dist>/kchar,
                             also=[<another page's dist/kchar>])

  - the data: sliders.json, posture.json, the peoples named (data/peoples.json) and, per body, its skeleton and its kit cut to
    `items` (ids of the peoples' clothes the page dresses in; None: all of the peoples' own), the hair their styles name and the
    beards listed: `var <name>={...}; <name>.pieces=[...]`
  - the pieces each kept item needs (and each body's base and anims) beside the page: <out>/<body>__<piece>.js, each one
    `KCHAR_SIDE(key, text)`, a page loading each the first time a figure needs it. A sidecar is made from
    dist/pieces/<body>/<piece>.txt (this build's output; not in Git) when that is here, else copied from the first `also` folder
    that holds it (a page that already carries it: Longsong's dist/kchar). A sidecar that is a Git LFS pointer is not a piece:
    the build stops and says which to pull.
Every source it reads is named by sources(...) for tools/build_sources.py. Nothing here draws or decides who wears what.
"""
import io, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CM = os.path.dirname(HERE)
BODIES = ('mpfb_male', 'mpfb_female')
LFS = 'version https://git-lfs'


def _j(*p):
    with io.open(os.path.join(CM, 'data', *p), encoding='utf-8') as fh:
        return json.load(fh)


def _cut(peoples, items, beards):
    """the peoples' records and each body's kit cut to what the page dresses in, and the pieces that needs"""
    ps = [p for p in _j('peoples.json')['peoples'] if p['id'] in peoples]
    bodies, need = {}, []
    for b in BODIES:
        kit = _j(b, 'kit.json')
        sty = {x for p in ps for x in p['styles'].get(b[5:], [])}
        keep = lambda it: ((it.get('culture') in peoples and (items is None or it['id'] in items)) or (it['slot'] == 'hair' and it['id'] in sty)
                           or (it['slot'] == 'beard' and it['id'] in beards.get(b, ())))
        kit['items'] = [it for it in kit['items'] if keep(it)]
        bodies[b] = {'skeleton': _j(b, 'skeleton.json'), 'kit': kit}
        need += [b + '/base', b + '/anims'] + [it['glb'][len('pieces/'):-len('.glb')] for it in kit['items']]
    return ps, bodies, need


def sources(peoples, items=None, beards=None, also=()):
    """the files fragment() reads, for build_sources' listing"""
    _, _, need = _cut(peoples, items, beards or {})
    out = [os.path.join(CM, 'data', f) for f in ('peoples.json', 'sliders.json', 'posture.json')]
    out += [os.path.join(CM, 'data', b, f) for b in BODIES for f in ('kit.json', 'skeleton.json')]
    for k in need:
        src = os.path.join(CM, 'dist', 'pieces', k + '.txt')
        if os.path.exists(src):
            out.append(src)
        else:
            out += [os.path.join(a, k.replace('/', '__') + '.js') for a in also if os.path.exists(os.path.join(a, k.replace('/', '__') + '.js'))][:1]
    return out


def fragment(name, peoples, items=None, beards=None, out=None, also=()):
    beards = beards or {}
    ps, bodies, need = _cut(peoples, items, beards)
    os.makedirs(out, exist_ok=True)
    keep, missing, pointers = set(), [], []
    for k in need:
        fn = k.replace('/', '__') + '.js'
        dst, src = os.path.join(out, fn), os.path.join(CM, 'dist', 'pieces', k + '.txt')
        keep.add(fn)
        body = None
        if os.path.exists(src):
            with io.open(src, encoding='utf-8') as fh:
                t = fh.read().strip('\n')
            mo = os.path.join(CM, 'dist', 'pieces', k + '.morph.txt')
            if '\n' not in t and os.path.exists(mo):   # a piece whose deltas were published in a file of their own
                with io.open(mo, encoding='utf-8') as fh:
                    t += '\n' + fh.read().strip('\n')
            body = 'KCHAR_SIDE(%s,%s);\n' % (json.dumps(k), json.dumps(t))
        else:
            for a in also:
                p = os.path.join(a, fn)
                if os.path.exists(p) and os.path.abspath(p) != os.path.abspath(dst):
                    with io.open(p, encoding='utf-8') as fh:
                        body = fh.read()
                    break
        if body is None:
            if not os.path.exists(dst):
                missing.append(k)
            continue
        if body.startswith(LFS):
            pointers.append(k)
            continue
        old = None
        if os.path.exists(dst):
            with io.open(dst, encoding='utf-8') as fh:
                old = fh.read()
        if old != body:
            with io.open(dst, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(body)
    for f in os.listdir(out):
        if f not in keep:
            os.remove(os.path.join(out, f))
    if pointers:
        raise SystemExit('KCHAR PIECES ARE LFS POINTERS (git lfs pull --include="%s"): %s'
                         % (','.join(sorted({os.path.relpath(a, os.path.dirname(os.path.dirname(CM))).replace(os.sep, '/') + '/*' for a in also})), ', '.join(pointers)))
    if missing:
        raise SystemExit('KCHAR PIECES MISSING (build core/charactermodels, or a page that carries them): ' + ', '.join(missing))
    data = {'sliders': _j('sliders.json'), 'posture': _j('posture.json'), 'peoples': ps, 'bodies': bodies}
    return 'var %s=%s;\n%s.pieces=%s;\n' % (name, json.dumps(data, separators=(',', ':')), name, json.dumps(need))
