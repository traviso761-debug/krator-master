#!/usr/bin/env python3
"""A probe view of each library card slot as the page draws it, before and after the cut check_cells.py proposes, without a
GPU: the core geometry (frond, ribbon, hang, one quad of a clump) is built by core/biome itself (card_probe.js, node), laid flat
on its own face, and filled with the slot's image through its uv, cell and alpha test, as BIO.libSwap and BIO.def draw it.
A kit's own geometry (a tuft, a fan) is drawn as an upright quad (v 1 at its foot), the usual convention, and so marked.

  python3 tools/textures/card_probe.py biomes/rift [...] [--all] [--before REV] [--out probe.png]

Each slot that check_cells.py faults (--all: every card slot) gets a pair of panels: left as it is, right with the proposal.
--before REV: left is the slot as materials.json had it at REV (git), right as it is now, for every slot that changed.
A frond is drawn with its stem at the bottom, a ribbon or hang with its hung end at the top, a clump quad the way up it stands.
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import check_cells as cc

CORE = ('frond', 'ribbon', 'hang', 'clump')
NODE = os.environ.get('NODE') or 'node'
_img = {}


def image(lib, n=256):
    if lib not in _img:
        im = Image.open(os.path.join(cc.LIB, lib, 'albedo.png')).convert('RGBA').resize((n, n), Image.BOX)
        _img[lib] = np.asarray(im).astype(np.float32) / 255
    return _img[lib]


def geometries(reqs):
    out = subprocess.run([NODE, os.path.join(HERE, 'card_probe.js'), json.dumps(reqs)], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def quad():
    """a kit's own upright card: x across, y up, v 1 at the foot (unflipped)"""
    a, b, c, d = [-.5, 0, 0, 1], [.5, 0, 1, 1], [.5, 1, 1, 0], [-.5, 1, 0, 0]
    return [[a, b, c], [a, c, d]]


def raster(tris, tex, cell, size=150, alpha_test=.4):
    """the triangles filled with the texture through uv -> cell (BIO.libSwap's offset and repeat), alpha tested, on a grey card"""
    xs = [p[0] for t in tris for p in t]
    ys = [p[1] for t in tris for p in t]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    s = (size - 8) / max(x1 - x0, y1 - y0, 1e-6)
    W = size
    out = np.zeros((W, W, 3), np.float32) + .16
    cover = np.zeros((W, W), bool)
    c = cell or [0, 0, 1, 1]
    th, tw = tex.shape[:2]
    gy, gx = np.mgrid[0:W, 0:W].astype(np.float32) + .5
    ox, oy = (W - (x1 - x0) * s) / 2, (W - (y1 - y0) * s) / 2
    for t in tris:
        P = np.array([[ox + (p[0] - x0) * s, W - (oy + (p[1] - y0) * s)] for p in t])
        UV = np.array([[p[2], p[3]] for p in t])
        (ax, ay), (bx, by), (qx, qy) = P
        den = (by - qy) * (ax - qx) + (qx - bx) * (ay - qy)
        if abs(den) < 1e-9:
            continue
        l1 = ((by - qy) * (gx - qx) + (qx - bx) * (gy - qy)) / den
        l2 = ((qy - ay) * (gx - qx) + (ax - qx) * (gy - qy)) / den
        l3 = 1 - l1 - l2
        m = (l1 >= -1e-4) & (l2 >= -1e-4) & (l3 >= -1e-4)
        cover |= m
        u = l1 * UV[0, 0] + l2 * UV[1, 0] + l3 * UV[2, 0]
        v = l1 * UV[0, 1] + l2 * UV[1, 1] + l3 * UV[2, 1]
        tu, tv = c[0] + u * (c[2] - c[0]), c[1] + v * (c[3] - c[1])   # texture wraps (three's default for a card is clamp; the
        tu, tv = np.clip(tu, 0, 1 - 1e-6), np.clip(tv, 0, 1 - 1e-6)  # library cards are clamped too)
        px = tex[(tv * th).astype(int), (tu * tw).astype(int)]
        hit = m & (px[..., 3] >= alpha_test)
        out[hit] = px[hit][:, :3]
    # the card's outline, faint, so a fully cut card still shows where it is
    im = Image.fromarray((out * 255).astype(np.uint8))
    edge = cover ^ np.roll(cover, 1, 0) | cover ^ np.roll(cover, 1, 1)
    a = np.asarray(im).copy()
    a[edge] = (a[edge] * .4 + np.array([90, 90, 110]) * .6).astype(np.uint8)
    return Image.fromarray(a)


def probe(builds, everything=False, out=None, rev=None):
    rows = []
    for b in builds:
        mj = os.path.join(cc.ROOT, b, 'materials.json')
        with open(mj, encoding='utf-8') as f:
            d = json.load(f)
        fams = d.get('families', d)
        old = None
        if rev:
            o = subprocess.run(['git', 'show', '%s:%s/materials.json' % (rev, b.replace(os.sep, '/'))], cwd=cc.ROOT, capture_output=True, text=True, encoding='utf-8')
            old = json.loads(o.stdout) if o.returncode == 0 else {}
            old = old.get('families', old)
        gk = cc.geometry(os.path.join(cc.ROOT, b))
        for slot, e in sorted(fams.items()):
            if not isinstance(e, dict) or not str(e.get('lib', '')).startswith('card.') or cc.plants(e['lib']) is None:
                continue
            ks = cc.kinds_of(slot, gk)
            faults = cc.check_slot(slot, e, ks)
            if old is not None:
                if old.get(slot) == e and not everything:
                    continue
                before = old.get(slot) or {'lib': e['lib']}
                rows.append((b, slot, before, e, next((k for k in CORE if k in ks), None),
                             'changed since %s' % rev + ('; still: ' + ', '.join(sorted({f[0] for f in faults})) if faults else ''), '/'.join(sorted(ks)) or '-'))
                continue
            if not faults and not everything:
                continue
            after = dict(e)
            for _, _, prop in faults:
                if prop:
                    after.update(prop)
            kind = next((k for k in CORE if k in ks), None)
            rows.append((b, slot, e, after, kind, ', '.join(sorted({f[0] for f in faults})) or 'ok', '/'.join(sorted(ks)) or '-'))
    reqs = []
    for r in rows:
        if r[4]:
            reqs += [{'kind': r[4], 'base': r[2].get('base')}, {'kind': r[4], 'base': r[3].get('base')}]
    geo = geometries(reqs) if reqs else []
    gi = iter(geo)
    S, H = 150, 30
    sheet = Image.new('RGB', (2 * S + 260, max(1, len(rows)) * (S + 4)), (30, 30, 40))
    dr = ImageDraw.Draw(sheet)
    for i, (b, slot, e, after, kind, why, ks) in enumerate(rows):
        tex = image(e['lib'])
        y = i * (S + 4)
        for j, slot_e in enumerate((e, after)):
            tris = next(gi)['tris'] if kind else quad()
            sheet.paste(raster(tris, tex, slot_e.get('cell')), (j * S, y))
        dr.text((2 * S + 8, y + 4), '%s  %s' % (b, slot), fill=(255, 255, 255))
        dr.text((2 * S + 8, y + 20), e['lib'], fill=(200, 200, 200))
        dr.text((2 * S + 8, y + 36), 'drawn on: %s%s' % (ks, '' if kind else ' (an upright quad)'), fill=(200, 200, 200))
        dr.text((2 * S + 8, y + 52), why, fill=(255, 200, 120))
        dr.text((2 * S + 8, y + 68), 'left: at %s   right: now' % rev if rev else 'left: as it is   right: proposed', fill=(150, 150, 150))
    path = out or os.path.join(cc.ROOT, 'card-probe.png')
    sheet.save(path)
    print('%d slot(s) drawn: %s' % (len(rows), path))
    return 0


if __name__ == '__main__':
    a = sys.argv[1:]
    o = a[a.index('--out') + 1] if '--out' in a else None
    r = a[a.index('--before') + 1] if '--before' in a else None
    sys.exit(probe([x for x in a if not x.startswith('--') and x not in (o, r)], '--all' in a, o, r))
