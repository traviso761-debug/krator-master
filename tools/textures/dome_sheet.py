#!/usr/bin/env python3
"""Rework a painted sky sheet (a 2:1 panorama: sky, its motifs, an ornamental band along the bottom edge) for the inside of a
hemispherical dome, where a 2:1 sheet wrapped once round is stretched about 2x across at the rim and pinched toward the crown.

    python3 tools/textures/dome_sheet.py SRC OUT --widen 2 --raise 0.47 [--band-row 785] [--strip 100] [--seed 7]

  widen   the sheet's width times this: the gap (from the source's right edge round to its left) is filled with the source's
          own sky, so its motifs appear once and keep their proportions round the dome
  raise   sky added above, as a share of the source's height: the motifs move down into the dome's lower half, where it is
          nearly upright; the added sky darkens toward the top edge and its stars fade out there (the crown, where every row
          meets at a point, gets no stars to streak)
  band-row  the first row of the ornamental band (the rim): below it the filler copies the band's own columns (it repeats
          across, and the source's left and right edges meet), so the band runs unbroken round the rim
  strip   the source's top rows that hold only sky and stars: the filler is tiled from them (each tile flipped and shifted
          on a seeded stream, its rows recoloured to the background the source has at that height)

The filler is cross-faded into the source at both of its edges. Deterministic. Requires numpy and Pillow.
"""
import argparse
import numpy as np
from PIL import Image


def row_background(a, band):
    """The sky's colour at each row: the median over the row (the motifs are a minority of it), smoothed down the rows."""
    m = np.median(a[:band], axis=1)
    k = 15
    pad = np.pad(m, ((k, k), (0, 0)), mode='edge')
    ker = np.ones(2 * k + 1) / (2 * k + 1)
    return np.stack([np.convolve(pad[:, c], ker, mode='valid') for c in range(3)], -1)


def tiled_sky(strip, rows, width, bg_strip, target, seed, fade=None):
    """`rows` rows of sky `width` wide from the star strip: tiles flipped and shifted, recoloured row by row to `target`."""
    rng = np.random.default_rng(seed)
    h, w, _ = strip.shape
    detail = strip - bg_strip[:, None, :]          # the stars and the plaster's grain, off the strip's own background
    out = np.zeros((rows, width, 3))
    y = 0
    while y < rows:
        t = detail[::-1] if rng.random() < .5 else detail
        if rng.random() < .5:
            t = t[:, ::-1]
        sh = int(rng.integers(0, w))
        t = np.roll(t, sh, axis=1)
        reps = int(np.ceil(width / w)) + 1
        t = np.concatenate([t] * reps, axis=1)[:, :width]
        n = min(h, rows - y)
        out[y:y + n] = t[:n]
        y += n
    k = np.ones(rows) if fade is None else fade
    return target[:, None, :] + out * k[:, None, None]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src'); ap.add_argument('out')
    ap.add_argument('--widen', type=float, default=2.0); ap.add_argument('--raise', dest='rise', type=float, default=0.47)
    ap.add_argument('--band-row', type=int, default=0); ap.add_argument('--strip', type=int, default=100)
    ap.add_argument('--blend', type=int, default=80); ap.add_argument('--seed', type=int, default=7)
    o = ap.parse_args()
    a = np.asarray(Image.open(o.src).convert('RGB')).astype(np.float64) / 255.0
    h, w, _ = a.shape
    band = o.band_row or h
    bg = row_background(a, band)                      # the sky's colour by row (above the band)
    strip = a[:o.strip]
    W = int(round(w * o.widen)); F = W - w
    # the filler: sky from the strip, recoloured to each row's background; under the band row, the band's own columns
    fill = np.zeros((h, F, 3))
    fill[:band] = tiled_sky(strip, band, F, bg[:o.strip], bg, o.seed)
    cols = np.arange(F) % w
    fill[band:] = a[band:, cols]
    wide = np.concatenate([a, fill], axis=1)
    # cross-fade the filler into the source at both its ends (the source's right edge, and round to its left edge)
    b = o.blend
    t = (np.arange(b) + 0.5) / b; t = t * t * (3 - 2 * t)
    # at x = w: the source's last b columns continue into the filler's first b (blend the filler's start toward the source's edge)
    edge_l = a[:band, w - b:w]                      # the source's right edge
    edge_r = a[:band, 0:b]                          # the source's left edge (the filler's end wraps onto it)
    wide[:band, w:w + b] = edge_l[:, ::-1] * (1 - t)[None, :, None] + wide[:band, w:w + b] * t[None, :, None]
    wide[:band, W - b:W] = wide[:band, W - b:W] * (1 - t)[None, :, None] + edge_r[:, ::-1] * t[None, :, None]
    # the sky above: darker toward the top edge, its stars fading out over the top third of it
    R = int(round(h * o.rise))
    top = bg[0]
    target = np.array([top * (0.55 + 0.45 * (i / max(R - 1, 1))) for i in range(R)])
    fade = np.clip((np.arange(R) / R - 0.3) / 0.45, 0, 1)
    above = tiled_sky(strip, R, W, bg[:o.strip], target, o.seed + 1, fade)
    # (the added sky's last rows are recoloured to the sheet's top row: the two meet in colour, only their stars differ)
    out = np.concatenate([above, wide], axis=0)
    Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)).save(o.out, optimize=True)
    print('%s: %dx%d -> %dx%d (widen %.2f, raise %d rows)' % (o.out, w, h, W, h + R, o.widen, R))


if __name__ == '__main__':
    main()
