#!/usr/bin/env python3
"""The Extraplanar kit as ONE closure for another build: extraplanar_bundle.bundle() -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/extraplanar'); import extraplanar_bundle
    js = extraplanar_bundle.bundle()

The text defines the single global `KratorExtraplanar` (xp-runtime.js: the hunters by the mechs' calls, the
records, the drawing, the far tier). Inside the closure, in this order: the master catalog's engine-neutral core
(kits/catalog/krator-furniture-core.js), the culture symbols (kits/catalog/krator-symbols.js: the mechs core expects
them), the vehicle frame (kits/motor-vehicles/vehicles-core.js), the mechs core and parts (kits/mechs/mechs-core.js,
mechs-parts.js: MECH, the rig, the frame, MP), this kit's records (xp-records.js), its culture and hunters
(krator-extraplanar.js, then krator-extraplanar-<hunter>.js in filename order), the mechs runtime (mechs-runtime.js:
KM_API, which stays inside), the drawing (xp-draw.js) and the API (xp-runtime.js). Their top-level names stay inside
the closure. It needs the globals THREE (r128), KRAND (core/rand) and KSPACE (core/space) on the page; KTAGS
(core/tags) for the registry's records and ATMOS (core/atmos) for the weather when those are used.

The shared files are read from their kits at bundle time, so a fix there reaches the hunters on their next build:
the hunters' culture is registered in THIS closure only (KratorMechs never sees it).
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
KITS = os.path.dirname(HERE)
MECHS = os.path.join(KITS, 'mechs')
CORE = [(os.path.join(os.path.dirname(KITS), 'core', 'catalog'), 'krator-furniture-core.js'), (os.path.join(os.path.dirname(KITS), 'core', 'sockets'), '38-symbols.js'),   # as mech_bundle.py (the catalog's engine is core/catalog since 2026-11-03)
        (os.path.join(KITS, 'motor-vehicles'), 'vehicles-core.js'), (MECHS, 'mechs-core.js'), (MECHS, 'mechs-parts.js'),
        (HERE, 'xp-records.js')]
RUNTIME = [(MECHS, 'mechs-runtime.js'), (HERE, 'xp-draw.js'), (HERE, 'xp-runtime.js')]
PREFIX = 'krator-extraplanar'


def culture_files():
    fs = [f for f in os.listdir(HERE) if f.startswith(PREFIX) and f.endswith('.js')]
    # the culture's own file first (krator-extraplanar.js), then its hunters (krator-extraplanar-<name>.js)
    return sorted(fs, key=lambda f: (f != PREFIX + '.js', f))


def read(d, f):
    with open(os.path.join(d, f), encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """Inline in a page's <script>: no script tag may appear, not even in a comment (kits/catalog/furniture_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files():
    return list(CORE) + [(HERE, f) for f in culture_files()] + list(RUNTIME)


def fragments():
    """The files of the bundle, in order, as repo-relative paths with '/'."""
    return [label(d, f) for d, f in files()]


def label(d, f):
    return os.path.relpath(os.path.join(d, f), os.path.dirname(KITS)).replace(os.sep, '/')


def bundle():
    fs = files()
    body = ''.join('/* ---- %s ---- */\n%s\n' % (label(d, f), read(d, f)) for d, f in fs)
    return safe('/* kits/extraplanar bundle (extraplanar_bundle.py): %s. GENERATED; edit the kit files. */\n'
                'var KratorExtraplanar = (function () {\n%s\nreturn XP_API;\n})();\n'
                % (', '.join(label(d, f) for d, f in fs), body))


if __name__ == '__main__':
    print('\n'.join(fragments()))
