#!/usr/bin/env python3
"""The Motor Vehicles kit as ONE closure for another build: vehicle_bundle.bundle(cultures) -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/motor-vehicles'); import vehicle_bundle
    js = vehicle_bundle.bundle(['geomancer'])          # or None: every culture file

The text defines the single global `KratorVehicles` (krator-vehicles-runtime.js: list, build, roll, steer,
lights ...). Inside the closure: the master catalog's engine-neutral core (kits/catalog/krator-furniture-core.js:
makeFrame, the mk* primitives, mat, FPAL), this kit's core (vehicles-core.js: the VEHICLE registry, the vehicle
frame, the balloon tyre), the culture files asked for (krator-vehicles-<culture>.js, filename order) and the
runtime. Their top-level names (TAU, shade, mat, PAL, FPAL, VEHICLE, ...) stay inside the closure, so they never
meet the host build's own (a Locus-lineage build has its own TAU, PAL, rnd inside its BUILD scope). It needs only a
global THREE (r128). The catalog core is read from kits/catalog at bundle time, so a fix there reaches every
vehicle build on its next build.

A name in `cultures` is a FILE SUFFIX: 'geomancer' picks krator-vehicles-geomancer.js.
tex=False leaves the detail maps out (KV_TEX null: vertex colours only, as before 2026-10-06).
"""
import base64, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CATALOG = os.path.join(os.path.dirname(HERE), 'catalog')
CORE = [(CATALOG, 'krator-furniture-core.js'), (HERE, 'vehicles-core.js'), (HERE, 'vehicles-detail.js')]
TEX = os.path.join(HERE, 'tex')                 # tools/textures/pack.py kits/motor-vehicles (materials.json)
DEFAULT_SLOTS = ('paint', 'metal', 'rubber')    # vehicles-detail.js falls back to these for any culture
RUNTIME = (HERE, 'krator-vehicles-runtime.js')
PREFIX = 'krator-vehicles-'


def culture_files():
    return sorted(f for f in os.listdir(HERE)
                  if f.startswith(PREFIX) and f.endswith('.js') and f != RUNTIME[1])


def read(d, f):
    with open(os.path.join(d, f), encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """The text goes inline into a page's <script>: no script tag may appear in it, not even in a comment
    (kits/catalog/furniture_bundle.py: '\\x73' is 's' inside a string literal and plain text in a comment)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files(cultures=None):
    out = list(CORE)
    for f in culture_files():
        c = f[len(PREFIX):-3]
        if cultures is None or c in cultures:
            out.append((HERE, f))
    return out + [RUNTIME]


def label(d, f):
    return ('kits/catalog/' if d == CATALOG else 'kits/motor-vehicles/') + f


def textures(fs, on=True):
    """KV_TEX: the packed detail maps (tex/, committed) as data URLs, only the families the culture files name
    (a quoted slot name: a palette key's detail, or a family passed to a primitive) plus the defaults. No image
    library: the files are read as bytes, so the bundle is deterministic."""
    pj = os.path.join(TEX, 'pack.json')
    if not on or not os.path.isfile(pj):
        return 'const KV_TEX = null;\n'
    pack = json.load(open(pj, encoding='utf-8'))
    slots = json.load(open(os.path.join(HERE, 'materials.json'), encoding='utf-8'))['slots']
    text = ''.join(read(d, f) for d, f in fs if f.startswith(PREFIX))
    used = [s for s in slots if s in DEFAULT_SLOTS or ("'%s'" % s) in text]
    fam = {}
    for s in used:
        e = pack['families'].get(s)
        if not e:
            continue
        m = (e.get('tint') or {}).get('mean') or 0.5
        f = {'tile': e['scale'][0], 'gain': round(1 / max(0.05, m ** 2.2), 5), 'ns': e.get('normalScale', 1.0), 'lib': e['lib']}
        for k, name in sorted(e['files'].items()):
            raw = open(os.path.join(TEX, name), 'rb').read()
            f[k] = 'data:image/webp;base64,' + base64.b64encode(raw).decode('ascii')
        fam[s] = f
    top = max([slots.index(s) for s in fam] or [0])          # the atlas grows to 4 rows only when a slot past 8 is packed
    return 'const KV_TEX = %s;\n' % json.dumps({'size': pack['size'], 'cols': 4, 'rows': 2 if top < 8 else 4, 'slots': slots, 'fam': fam},
                                                sort_keys=True, separators=(',', ':'))


def bundle(cultures=None, tex=True):
    fs = files(cultures)
    body = ''.join('/* ---- %s ---- */\n%s\n' % (label(d, f), read(d, f)) for d, f in fs)
    body = '/* ---- kits/motor-vehicles/tex (generated: the detail maps, materials.json) ---- */\n' + textures(fs, tex) + body
    return safe('/* kits/motor-vehicles bundle (vehicle_bundle.py): %s. GENERATED; edit the kit files. */\n'
                'var KratorVehicles = (function () {\n%s\nreturn KV_API;\n})();\n'
                % (', '.join(label(d, f) for d, f in fs), body))


if __name__ == '__main__':
    import sys
    print(bundle(sys.argv[1:] or None)[:400])
