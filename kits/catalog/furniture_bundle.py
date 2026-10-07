#!/usr/bin/env python3
"""The catalog's furniture as ONE closure for another build: furniture_bundle.bundle(cultures) -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/catalog'); import furniture_bundle
    js = furniture_bundle.bundle(['republican', 'rustic', 'painted', 'generic', 'scrap'])   # or None: every culture

The text defines the single global `KratorFurniture` (krator-furniture-runtime.js: batches that
build catalog pieces with the catalog's own code and merge them). Inside the closure: the core
(krator-furniture-core.js), the culture symbols (krator-symbols.js), the parametric kit (krator-furniture-kit.js), the harvested
registry (krator-master-furniture.js) when `harvested` is True, the culture files asked for, and the
runtime. Their top-level names (TAU, shade, mat, PAL, FURN, FK, ...) stay inside the closure, so
they never meet the host build's own. A culture file's fallback chain (kits/interiors
IX.CULTURE_FAMILY) usually ends in `generic` and `scrap`: list them too.

A name in `cultures` is a FILE SUFFIX: 'eastabyss' picks krator-master-furniture-eastabyss.js. The category
files are picked the same way and only when named: 'generic-goods', 'generic-fruit' (not by 'generic') and
'jobs' (krator-master-furniture-jobs.js, the work items by trade: each keeps its own culture and adds its colours
to that culture's palette itself, so it needs no culture file beside it). Files load in filename order.
"""
import base64, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CORE = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js']
RUNTIME = 'krator-furniture-runtime.js'
DETAIL = 'krator-furniture-detail.js'      # joins only with tex=True
TEX = os.path.join(HERE, 'tex')              # tools/textures/pack.py kits/catalog (materials.json)


def culture_files():
    return sorted(f for f in os.listdir(HERE) if f.startswith('krator-master-furniture-') and f.endswith('.js'))


def read(f):
    with open(os.path.join(HERE, f), encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """The text goes inline into a page's <script>: no script tag may appear in it, not even in a comment
    (a '</script' ends the page's script; a '<script' fools tools that find the script by its tag).
    '\\x73' is 's' inside a string literal and plain text inside a comment, so nothing changes meaning."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files(cultures=None, harvested=False):
    out = list(CORE)
    if harvested:
        out.append('krator-master-furniture.js')
    for f in culture_files():
        c = f[len('krator-master-furniture-'):-3]
        if cultures is None or c in cultures:
            out.append(f)
    return out + [RUNTIME]


def textures():
    """KF_TEX: per texture family the packed colour map (tex/, committed) as a data URL, its tile size in metres and the
    mean brightness the shader divides back out. Every family is inlined (about 1 MB): a piece's family is known only
    when it is built."""
    pack = json.load(open(os.path.join(TEX, 'pack.json'), encoding='utf-8'))
    out = {}
    for fam, e in sorted(pack['families'].items()):
        name = e['files'].get('map')
        if name:
            out[fam] = {'lib': e['lib'], 'scale': e['scale'][0], 'mean': e['tint']['mean'],
                        'map': 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX, name), 'rb').read()).decode()}
    return 'const KF_TEX = %s;\n' % json.dumps(out, sort_keys=True)


def bundle(cultures=None, harvested=False, tex=False):
    """tex=True adds the library detail maps (KF_TEX and krator-furniture-detail.js): a batch's flush then gives each
    family's mesh its set as a triplanar detail map. tex=False is the bundle as before, byte for byte."""
    fs = files(cultures, harvested)
    body = ''.join('/* ---- kits/catalog/%s ---- */\n%s\n' % (f, read(f)) for f in fs)
    if tex:
        fs = fs + [DETAIL]
        body += '/* ---- the packed detail maps (tex/) ---- */\n' + textures()
        body += '/* ---- kits/catalog/%s ---- */\n%s\n' % (DETAIL, read(DETAIL))
    return safe('/* kits/catalog furniture bundle (furniture_bundle.py): %s. GENERATED; edit the catalog files. */\n'
            'var KratorFurniture = (function () {\n%s\nreturn KF_API;\n})();\n' % (', '.join(fs), body))


if __name__ == '__main__':
    import sys
    print(bundle(sys.argv[1:] or None)[:400])
