#!/usr/bin/env python3
"""The Mechs kit as ONE closure for another build: mech_bundle.bundle(cultures) -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/mechs'); import mech_bundle
    js = mech_bundle.bundle(['iziz'])          # or None: every culture

The text defines the single global `KratorMechs` (mechs-runtime.js: list, build, update, setState, attack ...).
Inside the closure: the master catalog's engine-neutral core (kits/catalog/krator-furniture-core.js: mat, FPAL,
_target), the culture symbols (kits/catalog/krator-symbols.js: the Iziz sun on the banners), the vehicle frame
(kits/motor-vehicles/vehicles-core.js: vehicleFrame and its tube, disc and lamp helpers), this kit's core
(mechs-core.js: MECH, the rig, the mech frame, the skin merge), its parts (mechs-parts.js), the culture files
asked for and the runtime. Their top-level names stay inside the closure. It needs only a global THREE (r128).
The shared files are read from their kits at bundle time, so a fix there reaches the mechs on their next build.

A culture is a FILE SUFFIX: 'iziz' picks krator-mechs-iziz.js (the culture and its dressing) first, then every
krator-mechs-iziz-<mech>.js in filename order.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
KITS = os.path.dirname(HERE)
CORE = [(os.path.join(KITS, 'catalog'), 'krator-furniture-core.js'), (os.path.join(KITS, 'catalog'), 'krator-symbols.js'),
        (os.path.join(KITS, 'motor-vehicles'), 'vehicles-core.js'), (HERE, 'mechs-core.js'), (HERE, 'mechs-parts.js')]
RUNTIME = (HERE, 'mechs-runtime.js')
PREFIX = 'krator-mechs-'


def culture_of(f):
    return f[len(PREFIX):-3].split('-')[0]


def culture_files():
    fs = [f for f in os.listdir(HERE) if f.startswith(PREFIX) and f.endswith('.js')]
    # the culture's own file first (krator-mechs-<c>.js), then its mechs (krator-mechs-<c>-<mech>.js)
    return sorted(fs, key=lambda f: (culture_of(f), f != PREFIX + culture_of(f) + '.js', f))


def read(d, f):
    with open(os.path.join(d, f), encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """Inline in a page's <script>: no script tag may appear, not even in a comment (kits/catalog/furniture_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files(cultures=None):
    out = list(CORE)
    for f in culture_files():
        if cultures is None or culture_of(f) in cultures:
            out.append((HERE, f))
    return out + [RUNTIME]


def label(d, f):
    return os.path.relpath(os.path.join(d, f), os.path.dirname(KITS)).replace(os.sep, '/')


def bundle(cultures=None):
    fs = files(cultures)
    body = ''.join('/* ---- %s ---- */\n%s\n' % (label(d, f), read(d, f)) for d, f in fs)
    return safe('/* kits/mechs bundle (mech_bundle.py): %s. GENERATED; edit the kit files. */\n'
                'var KratorMechs = (function () {\n%s\nreturn KM_API;\n})();\n'
                % (', '.join(label(d, f) for d, f in fs), body))


if __name__ == '__main__':
    import sys
    print('\n'.join(label(d, f) for d, f in files(sys.argv[1:] or None)))
