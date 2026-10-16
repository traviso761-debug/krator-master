#!/usr/bin/env python3
"""Turn a source image into a material-library set (core/materials/PLAN.md, "Processing pipeline").

    python3 tools/textures/process.py SOURCE OUT_DIR --id roof.thatch [options]
    python3 tools/textures/process.py --batch tools/textures/batches/beast-riders.json SRC_DIR

Writes OUT_DIR/albedo.jpg, normal.jpg, roughness.png (all SIZE x SIZE) and meta.json.
Every step works on a periodic (wrap-around) image, so the outputs tile.

Steps, in order:
  1. seamless   (`--seam-axes x`: across only, the height left whole: a dome's sky) pattern sheets: crop each axis to the pattern's own period (found by self-similarity),
                so motifs stay whole; everything else: cross-fade a band of the far edge into the near
                edge (the image loses `--band` of its width and becomes exactly periodic).
  2. delight    divide out the large-scale luminance (a wide periodic blur), so baked lighting gradients
                and vignettes go; `--lift` raises baked shadows a little so a normal map does not shade
                them twice.
  3. resize     to SIZE (a power of two).
  4. height     luminance minus its wide blur, normalised: the relief the normal and roughness come from.
  5. normal     OpenGL convention (+Y up), which three.js and Godot both expect.
  6. roughness  a base value per material, varied by the relief; `--dark-gloss` makes dark areas smoother
                (tar, lacquer, polished nacre).
  3b. --keep-aspect  a non-square sheet keeps its shape (long side = SIZE) instead of being squeezed square.
  7. mute       optional, for library surfaces a culture palette will tint (`--mute`).

Requires numpy and Pillow. Deterministic: the same source and options give the same bytes.
"""
import argparse, hashlib, json, os, sys
import numpy as np
from PIL import Image

VERSION = 1


# ---------------------------------------------------------------- periodic helpers
def blur(a, sigma):
    """Gaussian blur with wrap-around, by FFT. a: HxW or HxWxC float."""
    h, w = a.shape[:2]
    fy = np.fft.fftfreq(h)[:, None]; fx = np.fft.fftfreq(w)[None, :]
    g = np.exp(-2 * (np.pi ** 2) * (sigma ** 2) * (fx ** 2 + fy ** 2))
    if a.ndim == 2:
        return np.real(np.fft.ifft2(np.fft.fft2(a) * g))
    return np.stack([np.real(np.fft.ifft2(np.fft.fft2(a[..., c]) * g)) for c in range(a.shape[2])], -1)


def lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def seam_score(a):
    """Mismatch across the wrap seams relative to an ordinary neighbour step: about 1 means seamless."""
    ax = np.abs(np.diff(a, axis=1)).mean() + 1e-6       # an ordinary step across columns
    ay = np.abs(np.diff(a, axis=0)).mean() + 1e-6       # and across rows (stripes make these differ)
    return float(np.abs(a[:, -1] - a[:, 0]).mean() / ax), float(np.abs(a[-1] - a[0]).mean() / ay)


def resize_periodic(a, size, pad=24):
    """size: an int (square) or a (W, H) tuple."""
    h, w = a.shape[:2]
    tw, th = (size, size) if isinstance(size, int) else size
    p = np.pad(a, ((pad, pad), (pad, pad), (0, 0)), mode='wrap')
    im = Image.fromarray((np.clip(p, 0, 1) * 255 + 0.5).astype(np.uint8))
    W2, H2 = int(round((w + 2 * pad) * tw / w)), int(round((h + 2 * pad) * th / h))
    q = np.asarray(im.resize((W2, H2), Image.LANCZOS)).astype(np.float64) / 255.0
    ox, oy = int(round(pad * tw / w)), int(round(pad * th / h))
    return q[oy:oy + th, ox:ox + tw]


# ---------------------------------------------------------------- step 1: seamless
def best_period(a, axis, lo_frac=0.80):
    """The crop length L in [lo_frac*N, N] for which the image best continues into itself: the slice that
    would follow the crop (index L) matches the slice at index 0, judged over a few slices on each side."""
    n = a.shape[axis]
    best, bestL = None, n
    k = 6
    for L in range(int(n * lo_frac), n - k):
        if axis == 1:
            d = np.abs(a[:, L:L + k] - a[:, 0:k]).mean()
        else:
            d = np.abs(a[L:L + k] - a[0:k]).mean()
        if best is None or d < best:
            best, bestL = d, L
    return bestL, float(best)


def crossfade(a, axis, band):
    """Make one axis periodic: the last `band` slices are blended into the first `band` and dropped."""
    n = a.shape[axis]
    b = max(2, int(round(n * band)))
    t = (np.arange(b) + 0.5) / b
    t = t * t * (3 - 2 * t)
    if axis == 1:
        t = t[None, :, None]
        head = a[:, :b] * t + a[:, n - b:] * (1 - t)
        return np.concatenate([head, a[:, b:n - b]], axis=1)
    t = t[:, None, None]
    head = a[:b] * t + a[n - b:] * (1 - t)
    return np.concatenate([head, a[b:n - b]], axis=0)


# ---------------------------------------------------------------- the pipeline
def process(src, out_dir, opt):
    img = Image.open(src).convert('RGB')
    a = np.asarray(img).astype(np.float64) / 255.0
    log = {'source_size': list(img.size), 'seam_before': seam_score(a)}

    # 1. seamless
    # seam_axes 'x': a sheet that wraps across only (a dome's sky, its rim at the bottom edge), its height left whole
    # seam_axes 'none': a picture that does not repeat (a disc painted for a dome, mapped round its zenith): left whole
    ys, xs = 'y' in opt['seam_axes'], 'x' in opt['seam_axes']
    if opt['pattern']:
        Lx, ex = best_period(a, 1) if xs else (a.shape[1], 0.0); Ly, ey = best_period(a, 0) if ys else (a.shape[0], 0.0)
        a = a[:Ly, :Lx]
        log['pattern_crop'] = [Lx, Ly]
        # a short cross-fade cleans up the last pixel of mismatch without visible ghosting
        if xs: a = crossfade(a, 1, 0.015)
        if ys: a = crossfade(a, 0, 0.015)
    else:
        if xs: a = crossfade(a, 1, opt['band'])
        if ys: a = crossfade(a, 0, opt['band'])

    # 2. delight
    if opt['delight'] > 0:
        L = lum(a)
        big = blur(L, sigma=min(a.shape[:2]) / 6.0)
        gain = (L.mean() / np.maximum(big, 1e-3)) ** opt['delight']
        a = a * gain[..., None]
    if opt['lift'] > 0:
        a = np.clip(a, 0, 1)
        a = 1 - (1 - a) ** (1 + opt['lift'])           # raises the darks, leaves the lights
    a = np.clip(a, 0, 1)

    # 3. resize, periodically: pad with wrapped copies so the filter sees across the seam, then crop
    size = opt['size']
    if opt['keep_aspect']:      # tall or wide sheets keep their shape: the long side is `size`
        k = size / max(a.shape[:2])
        a = resize_periodic(a, (int(round(a.shape[1] * k)), int(round(a.shape[0] * k))))
    else:
        a = resize_periodic(a, size)

    # 7. mute (before the derived maps, which read luminance only)
    if opt['mute'] > 0:
        L = lum(a)[..., None]
        a = L + (a - L) * (1 - opt['mute'])
        a = 0.5 + (a - 0.5) * (1 - opt['mute'] * 0.4)

    # 4. height
    L = lum(a)
    hp = L - blur(L, sigma=size / 24.0)
    hp = blur(hp, sigma=opt['height_soften'])
    h = (hp - hp.min()) / max(hp.max() - hp.min(), 1e-6)
    if opt['invert_height']:
        h = 1 - h

    # 5. normal (OpenGL, +Y up): central differences with wrap
    s = opt['normal_strength'] * size / 1024.0
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * s * 8
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * s * 8
    n = np.stack([-dx, dy, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)

    # 6. roughness
    r = opt['rough'] + (0.5 - h) * opt['rough_var']
    if opt['dark_gloss'] > 0:
        r = r - (1 - L / max(L.max(), 1e-6)) * opt['dark_gloss']
    r = np.clip(r, 0.04, 1.0)

    os.makedirs(out_dir, exist_ok=True)
    def save(arr, name, mode='RGB'):
        Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8), mode).save(
            os.path.join(out_dir, name), optimize=True)
    # the colour map as high-quality JPEG (a fifth of the PNG size; the engine recompresses it anyway);
    # the normal map as JPEG q95 with no chroma subsampling: X and Y live in red and green, so 4:2:0 would
    # halve their resolution (about 5 degrees mean error); 4:4:4 keeps it near 1.6. Roughness stays lossless.
    # The height map is not kept: it is derived from the colour map and can be regenerated.
    Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)).save(
        os.path.join(out_dir, 'albedo.jpg'), quality=92, subsampling=0, optimize=True)
    Image.fromarray((np.clip(n * 0.5 + 0.5, 0, 1) * 255 + 0.5).astype(np.uint8)).save(
        os.path.join(out_dir, 'normal.jpg'), quality=95, subsampling=0, optimize=True)
    save(r, 'roughness.png', 'L')

    log['seam_after'] = seam_score(a)
    log['seam_after'] = [round(v, 3) for v in log['seam_after']]
    log['seam_before'] = [round(v, 3) for v in log['seam_before']]
    return log


DEFAULTS = dict(keep_aspect=False, pattern=False, band=0.06, delight=0.6, lift=0.15, size=1024, mute=0.0,
                height_soften=0.8, invert_height=False, normal_strength=1.0,
                rough=0.75, rough_var=0.25, dark_gloss=0.0, seam_axes='xy')


def run_one(src, out_dir, rec, opt):
    o = dict(DEFAULTS); o.update(opt)
    log = process(src, out_dir, o)
    with open(src, 'rb') as fh:
        sha = hashlib.sha1(fh.read()).hexdigest()
    meta = {
        'record': rec,
        'maps': {'map': 'albedo.jpg', 'normalMap': 'normal.jpg', 'roughnessMap': 'roughness.png'},
        'source': {'file': os.path.basename(src), 'sha1': sha},
        'processing': {'script': 'tools/textures/process.py', 'version': VERSION, 'options': o, 'log': log},
    }
    meta['source'].update(rec.pop('_source', {}))
    with open(os.path.join(out_dir, 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=1, sort_keys=True)
    print('%-34s seams %.2f/%.2f -> %.2f/%.2f%s' % (
        rec['id'], log['seam_before'][0], log['seam_before'][1], log['seam_after'][0], log['seam_after'][1],
        ('  crop ' + str(log['pattern_crop'])) if 'pattern_crop' in log else ''))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src', nargs='?')
    ap.add_argument('out', nargs='?')
    ap.add_argument('--batch', help='a JSON list of {src, out, record, options}; src is relative to SRC_DIR')
    ap.add_argument('--id')
    for k, v in DEFAULTS.items():
        if isinstance(v, bool):
            ap.add_argument('--' + k.replace('_', '-'), action='store_true')
        else:
            ap.add_argument('--' + k.replace('_', '-'), type=type(v), default=v)
    a = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if a.batch:
        src_dir = a.src or '.'
        for job in json.load(open(a.batch)):
            run_one(os.path.join(src_dir, job['src']), os.path.join(root, job['out']), dict(job['record']),
                    job.get('options', {}))
        return
    if not (a.src and a.out and a.id):
        ap.error('SRC, OUT and --id are required without --batch')
    opt = {k: getattr(a, k) for k in DEFAULTS}
    run_one(a.src, a.out, {'id': a.id}, opt)


if __name__ == '__main__':
    main()
