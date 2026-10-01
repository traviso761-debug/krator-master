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
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CORE = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js']
RUNTIME = 'krator-furniture-runtime.js'


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


def bundle(cultures=None, harvested=False):
    fs = files(cultures, harvested)
    body = ''.join('/* ---- kits/catalog/%s ---- */\n%s\n' % (f, read(f)) for f in fs)
    return safe('/* kits/catalog furniture bundle (furniture_bundle.py): %s. GENERATED; edit the catalog files. */\n'
            'var KratorFurniture = (function () {\n%s\nreturn KF_API;\n})();\n' % (', '.join(fs), body))


if __name__ == '__main__':
    import sys
    print(bundle(sys.argv[1:] or None)[:400])
