#!/usr/bin/env python3
"""Audit how every kit and biome is wired to the material library (core/materials/PLAN.md).

    python3 tools/textures/audit_wiring.py            # table + findings, exit 1 if any hard finding
    python3 tools/textures/audit_wiring.py --quiet    # findings only

Per build with a `materials.json` (kits/*, biomes/*) it checks:
  lib       every family's `lib` names a library set or pattern sheet that exists with its maps (an `optional` family
            whose set is missing is a note, not an error)
  pack      `tex/pack.json` has an entry for every family and the files it names exist (the byte-level staleness check
            is `pack.py <build> --check`: this one needs no image library)
  used      the family key is read somewhere in the build's sources (a slot name, a MAT key, a bundle's slots list)
  host      the build's `build.py` or bundle reads `tex/` or `materials.json`
Builds with no `materials.json` that make 3D surfaces (catalog, interiors, ancients-interiors) are listed as UNWIRED,
with why that is expected or not (they borrow their host's rows: Girder's `f_<family>`, 48-detail.js).
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'core/materials')
quiet = '--quiet' in sys.argv
errors, notes = [], []


def set_dir(lib):
    return os.path.join(LIB, lib if lib.startswith('patterns/') else 'library/' + lib)


def set_ok(lib, fam):
    d = set_dir(lib)
    if not os.path.isdir(d):
        return False
    m = os.path.join(d, 'meta.json')
    if not os.path.isfile(m):
        return False
    meta = json.load(open(m))
    maps = meta.get('maps') or {}
    for k in ('map', 'normalMap', 'roughnessMap'):
        p = maps.get(k)
        if p and not fam.get('mapOnly') and not os.path.isfile(os.path.normpath(os.path.join(d, p))):
            return False
        if k == 'map' and p and not os.path.isfile(os.path.normpath(os.path.join(d, p))):
            return False
    return True


def sources(b):
    out = []
    for pat in ('*.js', 'src/*.js', '*.py'):
        out += glob.glob(os.path.join(ROOT, b, pat))
    return out


def audit(b):
    mj = os.path.join(ROOT, b, 'materials.json')
    j = json.load(open(mj))
    fams = j['families']
    pack = {}
    pj = os.path.join(ROOT, b, 'tex/pack.json')
    if os.path.isfile(pj):
        p = json.load(open(pj))
        pack = p.get('families', p)
    else:
        errors.append('%s: no tex/pack.json (run pack.py)' % b)
    text = ''
    for f in sources(b):
        if os.path.basename(f) == 'materials.json':
            continue
        text += open(f, encoding='utf-8', errors='ignore').read()
    host = any(s in open(os.path.join(ROOT, b, 'build.py'), encoding='utf-8').read() +
               ''.join(open(f, encoding='utf-8').read() for f in glob.glob(os.path.join(ROOT, b, '*_bundle.py')))
               for s in ('materials.json', "'tex'", 'tex/', 'record/'))
    if not host:
        errors.append('%s: neither build.py nor a bundle reads tex/ or materials.json' % b)
    miss = unused = 0
    for k, fam in fams.items():
        lib = fam.get('lib')
        if not lib:
            continue
        if not set_ok(lib, fam):
            (notes if fam.get('optional') else errors).append('%s: family %s: set %s missing or incomplete%s' % (
                b, k, lib, ' (optional)' if fam.get('optional') else ''))
            miss += 1
            continue
        if pack and k not in pack and not fam.get('optional'):
            errors.append('%s: family %s has no entry in tex/pack.json' % (b, k))
        elif pack and k in pack:
            for key in ('map', 'normal', 'rough', 'file', 'albedo'):
                v = pack[k].get(key) if isinstance(pack[k], dict) else None
                if isinstance(v, str) and not v.startswith('data:') and v.endswith('.webp') and \
                        not os.path.isfile(os.path.join(ROOT, b, 'tex', v)):
                    errors.append('%s: pack.json names missing file %s' % (b, v))
        # a key is read as itself or with an index (bark0 = MAT.bark[0]); an f_<family> row is read from the catalog's
        # texFamily, not from the build's own sources, so it is not checked here
        base = k.split('.')[0].rstrip('0123456789') or k
        if not k.startswith('f_') and not re.search(r'\b%s' % re.escape(base), text):
            notes.append('%s: family key %s appears in no source file' % (b, k))
            unused += 1
    return len(fams), miss, unused, host


builds = sorted(glob.glob('kits/*/materials.json') + glob.glob('biomes/*/materials.json'))
if not quiet:
    print('%-28s %5s %5s %6s %5s' % ('build', 'fams', 'miss', 'unused', 'host'))
for mj in builds:
    b = os.path.dirname(mj)
    n, miss, unused, host = audit(b)
    if not quiet:
        print('%-28s %5d %5d %6d %5s' % (b, n, miss, unused, 'yes' if host else 'NO'))
for d in sorted(glob.glob('kits/*/')):
    d = d.rstrip('/')
    if not os.path.isfile(os.path.join(d, 'materials.json')):
        notes.append('UNWIRED (no materials.json): ' + d)
for n in notes:
    print('note:', n)
for e in errors:
    print('ERROR:', e)
sys.exit(1 if errors else 0)
