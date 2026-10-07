#!/usr/bin/env python3
"""The Fauna kit as ONE closure for another build: fauna_bundle.bundle(groups) -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/fauna'); import fauna_bundle
    js = fauna_bundle.bundle(['livestock', 'mounts'])     # or None: every species file

The text defines the single global `KratorFauna` (krator-fauna-runtime.js: list, entry, build, animate, profile,
lifeOf). Inside the closure: this kit's core (fauna-core.js: the ANIMAL registry, the vocabularies, the part
builder), the species files asked for (krator-fauna-<group>.js, filename order), the packed detail maps (FA_TEX,
from tex/: tools/textures/pack.py kits/fauna) and the runtime. Their top-level names stay inside the closure. It
needs only a global THREE (r128).

A name in `groups` is a FILE SUFFIX: 'livestock' picks krator-fauna-livestock.js. tex=False leaves the detail maps
out (vertex colours only).
"""
import base64, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CORE = 'fauna-core.js'
RUNTIME = 'krator-fauna-runtime.js'
PREFIX = 'krator-fauna-'
TEX = os.path.join(HERE, 'tex')


def species_files():
    return sorted(f for f in os.listdir(HERE) if f.startswith(PREFIX) and f.endswith('.js') and f != RUNTIME)


def read(f):
    with open(os.path.join(HERE, f), encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """Inline into a page's <script>: no script tag in the text (kits/catalog/furniture_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files(groups=None):
    out = [CORE]
    for f in species_files():
        if groups is None or f[len(PREFIX):-3] in groups:
            out.append(f)
    return out + [RUNTIME]


def textures(on=True):
    """FA_TEX: per material family the packed colour map (tex/<family>.albedo.webp) as a data URL, its scale (metres per
    tile) and its mean brightness (the runtime divides it back out)."""
    pj = os.path.join(TEX, 'pack.json')
    if not on or not os.path.isfile(pj):
        return 'const FA_TEX = null;\n'
    pack = json.load(open(pj, encoding='utf-8'))
    out = {}
    for fam, e in sorted(pack['families'].items()):
        name = e['files'].get('map')
        if not name:
            continue
        out[fam] = {'lib': e['lib'], 'scale': e['scale'][0], 'mean': e['tint']['mean'],
                    'map': 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX, name), 'rb').read()).decode()}
    return 'const FA_TEX = %s;\n' % json.dumps(out, sort_keys=True)


def bundle(groups=None, tex=True):
    fs = files(groups)
    body = ''.join('/* ---- kits/fauna/%s ---- */\n%s\n' % (f, read(f)) for f in fs[:-1])
    body += '/* ---- the packed detail maps (tex/) ---- */\n' + textures(tex)
    body += '/* ---- kits/fauna/%s ---- */\n%s\n' % (fs[-1], read(fs[-1]))
    return safe('/* kits/fauna bundle (fauna_bundle.py): %s. GENERATED; edit the kit files. */\n'
                'var KratorFauna = (function () {\n%s\nreturn KratorFaunaAPI;\n})();\n' % (', '.join(fs), body))
