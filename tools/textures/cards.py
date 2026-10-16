#!/usr/bin/env python3
"""Turn a cut-out image (a leaf spray, a frond, a flower chain) into a library CARD set (core/materials/PLAN.md).

    python3 tools/textures/cards.py --batch tools/textures/batches/girder-cards-2026-10.json SRC_DIR

A card is drawn on a quad with alpha testing, not tiled, so it has no seams to fix and no normal map: just
OUT_DIR/albedo.png (RGBA, SIZE x SIZE) and meta.json (record.kind = 'card').

Steps:
  0. key      (option `key`: "#ff00ff" or "#00ff00", with `key_lo`/`key_hi` distances) cuts a flat-colour background out first;
              `spill` ('edge', 'all', 'none') says where the key's tint is taken out (key_out), or 'unmix' (key_unmix:
              each blended pixel split back into the subject's colour and an alpha; key_hi is then the distance from the
              key beyond which a pixel is solid subject); `choke` (n pixels) then
              shrinks the alpha to drop a tinted fringe the spill pass leaves.
  1. crop     (anchor 'tight': the opaque box only, stretched square on resize, for a wing mapped by its bounding box) to the opaque pixels (alpha > 16), then pad back to a square. `anchor` says where the content sits:
              'center' (a spray seen from above), 'bottom' (a frond or a plant: its base on the bottom edge,
              centred) or 'top' (a hanging chain: its hung end on the top edge, centred). `pad` is the margin.
  2. resize   to SIZE.
  3. bleed    the colour of the opaque pixels outward into the transparent ones (alpha-weighted blurs at
              growing radii), so mipmaps and alpha testing never pull in the generator's white or black
              background as a halo round every leaf.
Requires numpy and Pillow. Deterministic for a given Pillow version.
"""
import argparse, hashlib, json, os, sys
import numpy as np
from PIL import Image, ImageFilter

VERSION = 1


def crop_square(im, anchor, pad):
    a = np.asarray(im.getchannel('A'))
    ys, xs = np.nonzero(a > 16)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    im = im.crop((x0, y0, x1, y1))
    if anchor == 'tight':     # no squaring: the opaque box itself, stretched to the square later (a quad that maps the whole image onto the object's box un-stretches it)
        return im
    w, h = im.size
    side = int(round(max(w, h) * (1 + 2 * pad)))
    out = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    m = int(round(max(w, h) * pad))
    x = (side - w) // 2
    y = {'center': (side - h) // 2, 'bottom': side - h - m // 3, 'top': m // 3}[anchor]
    out.paste(im, (x, y))
    return out


def box(img, r):
    """A box blur of radius r on a 2D or 3D float array (edges clamped), by running sums along each axis."""
    out = img
    for ax in (0, 1):
        n = out.shape[ax]
        pad = [(0, 0)] * out.ndim; pad[ax] = (r + 1, r)
        c = np.cumsum(np.pad(out, pad, mode='edge'), axis=ax)
        hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=ax)
        lo = np.take(c, np.arange(0, n), axis=ax)
        out = (hi - lo) / (2 * r + 1)
    return out


def bleed(rgba):
    a = rgba[..., 3:4] / 255.0
    rgb = rgba[..., :3].astype(np.float64)
    solid = (a > 0.5).astype(np.float64)
    acc_c, acc_w = rgb * solid, solid.copy()
    out = rgb.copy()
    filled = solid[..., 0] > 0
    for r in (2, 4, 8, 16, 32, 64):
        c = box(acc_c, r)
        w = box(acc_w, r)
        ok = (w[..., 0] > 1e-3) & ~filled
        out[ok] = (c / np.maximum(w, 1e-6))[ok]
        filled |= ok
    if (~filled).any():                        # far from any leaf: the card's mean colour, for the smallest mipmaps
        out[~filled] = (rgb * solid).sum((0, 1)) / max(solid.sum(), 1)
    # semi-transparent edge pixels: lean on the bled colour so their light or dark fringe goes
    k = np.clip((a - 0.15) / 0.7, 0, 1)
    edge = (a > 0) & (a < 0.98)
    blend = np.where(edge, k, np.where(a >= 0.98, 1.0, 0.0))
    res = rgb * blend + out * (1 - blend)
    return np.concatenate([np.clip(res, 0, 255), rgba[..., 3:4]], -1).astype(np.uint8)


def key_out(im, key, lo, hi, spill_mode='edge'):
    """Chroma key: alpha from the RGB distance to the key colour (0 inside `lo`, 1 beyond `hi`), and the key's tint removed from the
    semi-transparent edge pixels (their red and blue are pulled down to the green when the key is magenta; their green down to the
    larger of red and blue when the key is green). For a sheet drawn on a flat background colour, as PROMPTS-ready.md asks (#ff00ff).
    Pink petals stay opaque: a deep pink is ~150 from pure magenta.
    spill_mode (option `spill`): 'edge' (the default, as before), 'all' (every pixel: for fine needles and plumes whose generated
    anti-aliasing is opaque but tinted by the key; only for a sheet with no colour of the key's own family in it) or 'none'."""
    k = np.array([int(key.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)
    rgb = np.asarray(im.convert('RGB')).astype(np.float64)
    d = np.sqrt(((rgb - k) ** 2).sum(-1))
    a = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)
    edge = (a < 1)[..., None] if spill_mode == 'edge' else np.full(a.shape + (1,), spill_mode == 'all')
    if k[0] > 200 and k[2] > 200 and k[1] < 60:      # magenta: spill is red and blue above green
        spill = np.maximum(np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1], 0)[..., None] * 0.9
        rgb = np.where(edge, rgb - np.concatenate([spill, 0 * spill, spill], -1), rgb)
    elif k[1] > 200 and k[0] < 60 and k[2] < 60:     # green: spill is green above the larger of red and blue
        spill = np.maximum(rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2]), 0)[..., None] * 0.9
        rgb = np.where(edge, rgb - np.concatenate([0 * spill, spill, 0 * spill], -1), rgb)
    out = np.concatenate([np.clip(rgb, 0, 255), (a * 255)[..., None]], -1)
    return Image.fromarray(np.rint(out).astype(np.uint8), 'RGBA')


def key_unmix(im, key, solid_d):
    """Chroma key by UNMIXING (option `spill`: 'unmix'): for fine, translucent subjects (needles, filaments, straw ends, water
    beads) whose pixels are a blend of the subject and the key, where 'edge' and 'all' leave a mauve fringe or turn the blend
    grey-blue. Pixels further than `solid_d` (option `key_hi`) from the key are the subject as it is; every other pixel P is
    taken as a*S + (1 - a)*K, with S the colour of the nearest solid subject (bled outward by growing box blurs, as bleed()
    does) and K the key: a = (P - K).(S - K) / |S - K|^2 (least squares), and the colour (P - (1 - a)K) / a, leaning on S as a
    falls (where the division is noisy). So a filament half covering the key keeps its own colour at half alpha."""
    k = np.array([int(key.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)
    P = np.asarray(im.convert('RGB')).astype(np.float64)
    d = np.sqrt(((P - k) ** 2).sum(-1))
    solid = (d > solid_d).astype(np.float64)[..., None]
    acc_c, acc_w = P * solid, solid.copy()
    S = P.copy(); filled = solid[..., 0] > 0
    for r in (1, 2, 4, 8, 16, 32, 64):
        c, w = box(acc_c, r), box(acc_w, r)
        ok = (w[..., 0] > 1e-3) & ~filled
        S[ok] = (c / np.maximum(w, 1e-6))[ok]; filled |= ok
    if (~filled).any():
        S[~filled] = (P * solid).sum((0, 1)) / max(solid.sum(), 1)
    SK, PK = S - k, P - k
    a = np.clip((PK * SK).sum(-1) / np.maximum((SK * SK).sum(-1), 1.0), 0, 1)
    a = np.where(solid[..., 0] > 0, 1.0, a)
    raw = (P - (1 - a[..., None]) * k) / np.maximum(a[..., None], 1e-3)
    t = np.clip((a - 0.15) / 0.6, 0, 1)[..., None]           # trust the unmixed colour as alpha rises
    col = np.where(solid > 0, P, np.clip(raw, 0, 255) * t + S * (1 - t))
    a = np.where(a < 0.08, 0.0, a)
    out = np.concatenate([np.clip(col, 0, 255), (a * 255)[..., None]], -1)
    return Image.fromarray(np.rint(out).astype(np.uint8), 'RGBA')


def run_one(src, out_dir, rec, opt):
    size, anchor, pad = int(opt.get('size', 1024)), opt.get('anchor', 'center'), float(opt.get('pad', 0.03))
    im = Image.open(src).convert('RGBA')
    if opt.get('key') and opt.get('spill') == 'unmix':
        im = key_unmix(im, opt['key'], float(opt.get('key_hi', 200)))
    elif opt.get('key'):
        im = key_out(im, opt['key'], float(opt.get('key_lo', 45)), float(opt.get('key_hi', 120)), opt.get('spill', 'edge'))
    if int(opt.get('choke', 0)):          # shrink the alpha by n source pixels: drops a key-tinted fringe the spill pass leaves (a WebP's colour bleed)
        im.putalpha(im.getchannel('A').filter(ImageFilter.MinFilter(2 * int(opt['choke']) + 1)))
    sq =crop_square(im, anchor, pad).resize((size, size), Image.LANCZOS)
    arr = bleed(np.asarray(sq).astype(np.float64))
    os.makedirs(out_dir, exist_ok=True)
    Image.fromarray(arr, 'RGBA').save(os.path.join(out_dir, 'albedo.png'), optimize=True)
    with open(src, 'rb') as fh:
        sha = hashlib.sha1(fh.read()).hexdigest()
    rec = dict(rec); src_meta = rec.pop('_source', {})
    rec['kind'] = 'card'
    meta = {'record': rec, 'maps': {'map': 'albedo.png'},
            'source': dict({'file': os.path.basename(src), 'sha1': sha}, **src_meta),
            'processing': {'script': 'tools/textures/cards.py', 'version': VERSION,
                           'options': dict({'size': size, 'anchor': anchor, 'pad': pad}, **{k: opt[k] for k in ('key', 'key_lo', 'key_hi', 'spill', 'choke') if k in opt}), 'source_size': list(im.size)}}
    with open(os.path.join(out_dir, 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=1, sort_keys=True)
    cover = float((arr[..., 3] > 127).mean())
    print('%-28s %s, anchor %s, coverage %.2f' % (rec['id'], 'x'.join(map(str, im.size)), anchor, cover))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--batch', required=True)
    ap.add_argument('src_dir')
    a = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for e in json.load(open(a.batch)):
        run_one(os.path.join(a.src_dir, e['src']), os.path.join(root, e['out']), e['record'], e.get('options', {}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
