#!/usr/bin/env python3
"""Pack a build's library textures (core/materials/PLAN.md, GODOT-PLAN.md Phase 3).

    python3 tools/textures/pack.py settlements/girder          # reads materials.json, writes tex/
    python3 tools/textures/pack.py settlements/girder --check  # says whether tex/ matches materials.json

A build's `materials.json` is its adapter: per material family the library set it uses and how (scale in world
metres per tile, how much of the set's own colour survives the build's tint, how much to lift roughness, metal).
This script reads each set from core/materials/library/<lib>/ (1024 px albedo.jpg, normal.png, roughness.png),
and writes small processed copies into <build>/tex/ (WebP, `size` px, default 512) plus tex/pack.json.

The build reads only those committed files (build.py inlines them as data URLs), so the build stays
deterministic on every machine; this script is run again only when materials.json or a library set changes.
Image encoders differ by version, so a re-pack on another machine may change bytes: commit tex/ with the change.

Processing, per family:
  albedo   tint mode (default): luminance L and colour C, both normalised so the mean luminance is `tint.mean`
           (default 0.78, the brightness of the procedural greys the builds were tuned on); out = L*(1-keep) + C*keep.
           keep 0 is a pure grey detail map that the vertex or instance colour colours; keep 1 keeps the set's hue.
           tint.contrast (default 1) scales each pixel's distance from the mean first: a set that reads flat at a
           distance gets its furrows and seams back.
  normal   resized and renormalised (OpenGL convention, as the library and Godot use)
  rough    r + (1 - r) * roughLift: the scan sets read wet under a sun with no environment map
Requires numpy and Pillow.
"""
import argparse, base64, hashlib, io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'core', 'materials', 'library')


def sha1(path):
    return hashlib.sha1(open(path, 'rb').read()).hexdigest()


def load(path, size, mode):
    im = Image.open(path).convert(mode)
    if im.size != (size, size):
        im = im.resize((size, size), Image.LANCZOS)
    return np.asarray(im).astype(np.float64) / 255.0


def webp(arr, quality, mode):
    a = np.clip(np.rint(arr * 255.0), 0, 255).astype(np.uint8)
    im = Image.fromarray(a, mode)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=quality, method=6)
    return buf.getvalue()


def process(fam, cfg, size):
    lib = cfg['lib']
    d = os.path.join(LIB, lib)
    meta = json.load(open(os.path.join(d, 'meta.json')))
    rec = meta.get('record', {})
    # map paths come from meta.json 'maps' (a neutral copy points at its sibling's normal and roughness)
    mp = meta.get('maps') or {}
    path = lambda k, default: os.path.normpath(os.path.join(d, mp.get(k, default)))
    pa, pn, pr = path('map', 'albedo.jpg'), path('normalMap', 'normal.png'), path('roughnessMap', 'roughness.png')
    out, files = {}, {}
    # albedo
    a = load(pa, size, 'RGB')
    t = cfg.get('tint', {})
    keep, target = float(t.get('keep', 0.0)), float(t.get('mean', 0.78))
    L = a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722
    m = float(L.mean()) or 1.0
    con = float(t.get('contrast', 1.0))            # >1 deepens the set's own light and dark around its mean
    k = (m + (L - m) * con) / np.maximum(L, 1e-4)  # per-pixel factor that applies the contrast to L and to the colour
    grey = np.repeat((L * k / m * target)[..., None], 3, axis=2)
    col = a * k[..., None] / m * target
    out['map'] = webp(grey * (1 - keep) + col * keep, 82, 'RGB')
    # normal
    if os.path.isfile(pn):
        n = load(pn, size, 'RGB') * 2 - 1
        n /= np.maximum(np.linalg.norm(n, axis=2, keepdims=True), 1e-6)
        out['normalMap'] = webp(n * 0.5 + 0.5, 92, 'RGB')
    # roughness
    if os.path.isfile(pr):
        r = load(pr, size, 'L')
        lift = float(cfg.get('roughLift', 0.0))
        out['roughnessMap'] = webp(r + (1 - r) * lift, 85, 'L')
    entry = {
        'lib': lib,
        'size': size,
        'scale': cfg.get('scale', rec.get('scale', [2, 2])),
        'metal': cfg.get('metal', rec.get('metal', 0)),
        'normalScale': cfg.get('normalScale', 1.0),
        'specular': cfg.get('specular', 0.5),
        'breakup': cfg.get('breakup'),
        'tint': {'keep': keep, 'mean': target, 'contrast': con, 'sourceMean': round(m, 4)},
        'roughLift': cfg.get('roughLift', 0.0),
        'source': {k: sha1(f) for k, f in (('albedo', pa), ('normal', pn), ('roughness', pr)) if os.path.isfile(f)},
        'files': {},
    }
    for k, data in out.items():
        name = '%s.%s.webp' % (fam, {'map': 'albedo', 'normalMap': 'normal', 'roughnessMap': 'rough'}[k])
        entry['files'][k] = name
        files[name] = data
    return entry, files


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('build')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args(argv)
    bdir = os.path.join(ROOT, a.build) if not os.path.isabs(a.build) else a.build
    cfg = json.load(open(os.path.join(bdir, 'materials.json')))
    size = int(cfg.get('size', 512))
    tdir = os.path.join(bdir, 'tex')
    pack = {'what': 'generated by tools/textures/pack.py from materials.json; do not edit', 'build': cfg['build'],
            'size': size, 'families': {}}
    allfiles = {}
    for fam in sorted(cfg['families']):
        e, files = process(fam, cfg['families'][fam], size)
        pack['families'][fam] = e
        allfiles.update(files)
    pj = json.dumps(pack, indent=1, sort_keys=True) + '\n'
    if a.check:
        old = open(os.path.join(tdir, 'pack.json')).read() if os.path.isfile(os.path.join(tdir, 'pack.json')) else ''
        strip = lambda s: {f: {k: v for k, v in e.items()} for f, e in json.loads(s)['families'].items()} if s else {}
        same = strip(old) == strip(pj)
        print('tex/ matches materials.json' if same else 'tex/ is stale: rerun tools/textures/pack.py ' + a.build)
        return 0 if same else 1
    os.makedirs(tdir, exist_ok=True)
    for f in os.listdir(tdir):
        if f.endswith('.webp') and f not in allfiles:
            os.remove(os.path.join(tdir, f))
    for name, data in allfiles.items():
        open(os.path.join(tdir, name), 'wb').write(data)
    open(os.path.join(tdir, 'pack.json'), 'w').write(pj)
    kb = sum(len(d) for d in allfiles.values()) / 1024
    print('packed %d families into %s (%d files, %.0f KB)' % (len(pack['families']), os.path.relpath(tdir, ROOT), len(allfiles), kb))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
