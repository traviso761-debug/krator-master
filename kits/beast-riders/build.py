#!/usr/bin/env python3
"""Build dist/beast-riders.html: the Beast Riders kit's sheet (owner, 2026-10-18: the riders' buildings as a set of
their own).

The kit is the catalog's Beast Rider buildings (Girder's and Mav's Refuge's: kits/catalog/krator-master-buildings-
beast-rider.js) and its own, the mounts' buildings (src/50-br-mounts.js: the raptor stable, the great byre, the
rookery tower), all catalog ASSETs on the catalog's engine. Everything is READ IN PLACE, never copied; src/ holds the
kit's own buildings and the page round them. One <script>, in this order:

  src/00-head.html                         page head, toolbar, error panel, three.js r128 loader
  kits/catalog: krator-furniture-core.js, krator-asset-engine.js, krator-symbols.js, krator-furniture-kit.js,
                krator-master-furniture.js and the beast-rider and generic culture files (the pieces the buildings
                place with F.furn), krator-master-buildings-beast-rider.js
  src/50-br-mounts.js                      the kit's own buildings
  kits/catalog: krator-furniture-runtime.js, then KF_TEX (GENERATED: the catalog's packed detail maps with this kit's
                tex/ over them, materials.json), then krator-furniture-detail.js: the detail maps (KF_API.detailize)
  src/90-br-sheet.js                       lays out every building and variant; the probe window._kit
  kits/catalog: inspector.js, src/92-hover.js, src/93-polygon.js   the click inspector, the hover inspector (T) and the
                polygon tool (P), the catalog's own
  src/99-tail.html

build.py refuses a top-level name declared in two files and a key registered twice, and runs `node --check` on the
script. Deterministic: build-manifest.json holds a sha1 per input. Other builds take the kit's own buildings by
reading src/50-br-mounts.js in place after the catalog's buildings file (settlements/isle-demo/bundles.py CAT).

Usage:  python3 build.py [--no-checks]
"""
import base64, hashlib, json, os, re, shutil, subprocess, sys

import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
CAT = os.path.join(ROOT, 'kits', 'catalog')
OUT = 'beast-riders'
BEFORE = ['krator-furniture-core.js', 'krator-asset-engine.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js',
          'krator-master-furniture-beast-rider.js', 'krator-master-furniture-generic.js', 'krator-master-buildings-beast-rider.js']
OWN = ['50-br-mounts.js']
AFTER = ['krator-furniture-runtime.js']
DETAIL = 'krator-furniture-detail.js'
SHEET = ['90-br-sheet.js']
# the catalog's dev tools, read in place (the repo README's "DEV TOOLS"): the click inspector (select, measure, isolate,
# cycle variants, audit declared sizes), the hover inspector (T) and the polygon tool (P)
TOOLS = ['inspector.js', 'src/92-hover.js', 'src/93-polygon.js']

RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_REG = re.compile(r'^(FURN|PLANT|ASSET)\(\s*\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]', re.M)


def read(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


def kf_tex():
    """KF_TEX: the catalog's packed detail maps (kits/catalog/tex), with this kit's (tex/, materials.json) over them by
    family: the same shape kits/catalog/furniture_bundle.py textures() writes"""
    out = {}
    for d in (os.path.join(CAT, 'tex'), os.path.join(HERE, 'tex')):
        pack = json.load(open(os.path.join(d, 'pack.json'), encoding='utf-8'))
        for fam, e in sorted(pack['families'].items()):
            name = e['files'].get('map')
            if name:
                out[fam] = {'lib': e['lib'], 'scale': e['scale'][0], 'mean': e['tint']['mean'],
                            'map': 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(d, name), 'rb').read()).decode()}
    return 'const KF_TEX = %s;\n' % json.dumps(out, sort_keys=True)


def main():
    parts = [('kits/catalog/' + f, read(os.path.join(CAT, f))) for f in BEFORE] + [('src/' + f, read(os.path.join(SRC, f))) for f in OWN] + \
            [('kits/catalog/' + f, read(os.path.join(CAT, f))) for f in AFTER] + [('KF_TEX (GENERATED)', kf_tex())] + \
            [('kits/catalog/' + DETAIL, read(os.path.join(CAT, DETAIL)))] + [('src/' + f, read(os.path.join(SRC, f))) for f in SHEET] +             [('kits/catalog/' + f, read(os.path.join(CAT, f))) for f in TOOLS]
    if '--no-checks' not in sys.argv:
        errs, decl, keys = [], {}, {}
        for name, body in parts:
            for m in RE_DECL.finditer(body):
                decl.setdefault(m.group(1), set()).add(name)
            for kind, key in RE_REG.findall(body):
                keys.setdefault((kind, key), []).append(name)
        errs += ['top-level name `%s` declared in more than one file: %s' % (n, ', '.join(sorted(fs))) for n, fs in sorted(decl.items()) if len(fs) > 1]
        errs += ['%s key %r registered more than once: %s' % (k[0], k[1], ', '.join(fs)) for k, fs in sorted(keys.items()) if len(fs) > 1]
        own = [k for (kind, k), fs in keys.items() if any(f.startswith('src/') for f in fs)]
        errs += ['%s: the kit\'s own keys start br_bldg_' % k for k in own if not k.startswith('br_bldg_')]
        if errs:
            print('BUILD RULES FAILED:'); [print('  -', e) for e in errs]; sys.exit(1)
    script = ''.join('/* ---------- %s ---------- */\n%s%s' % (n, b, '' if b.endswith('\n') else '\n') for n, b in parts)
    html = read(os.path.join(SRC, '00-head.html')) + '<script>\n' + script.replace('</script', '<\\/script') + read(os.path.join(SRC, '99-tail.html'))
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, OUT + '.html')
    with open(out, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({n: hashlib.sha1(b.encode('utf-8')).hexdigest()[:12] for n, b in parts}, fh, indent=1, sort_keys=True)
    node = os.environ.get('NODE') or shutil.which('node')
    syn = 'syntax NOT CHECKED (no node)'
    if node:
        chk = os.path.join(DIST, '.syntax.js')
        open(chk, 'w', encoding='utf-8').write(script)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode:
            print(r.stderr[-2000:]); sys.exit(1)
        syn = 'syntax OK'
    print('built dist/%s.html (%d KB)  %s' % (OUT, os.path.getsize(out) // 1024, syn))


if __name__ == '__main__':
    main()
