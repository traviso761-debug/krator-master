"""Shapes on the model's grids: smoothsteps, polygon masks (map px to the height grid), and river strokes.

Lifted unchanged from history/edit_heights.py (sstep, poly, chaikin, meander) and history/edit_422.py (region_mask,
strokes); region_mask raises KeyError instead of exiting.
"""
import numpy as np
from PIL import Image, ImageDraw


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def poly(pts, su, sv, shape):
    m = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(m).polygon([(a * su, b * sv) for a, b in pts], fill=1)
    return np.array(m).astype(bool)


def poly_mask(pts, VW, VH, su=1.0, sv=1.0):
    return poly(pts, su, sv, (VH, VW))


def chaikin(pts, n=2):
    for _ in range(n):
        q = [pts[0]]
        for a_, b_ in zip(pts[:-1], pts[1:]):
            q += [(a_[0] * .75 + b_[0] * .25, a_[1] * .75 + b_[1] * .25), (a_[0] * .25 + b_[0] * .75, a_[1] * .25 + b_[1] * .75)]
        q.append(pts[-1])
        pts = q
    return pts


def meander(pts, amp=.55):
    """a routed course follows the grid's eight directions in ruled runs: each point is pushed sideways by two sines of
    the distance along it (map px; amp px is about 1 km), faded to nothing at both ends so the source and the mouth stay put"""
    P = np.array(pts, float)
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
    tg = np.gradient(P, axis=0)
    nrm = np.stack([-tg[:, 1], tg[:, 0]], 1) / (np.hypot(tg[:, 0], tg[:, 1])[:, None] + 1e-9)
    fade = np.clip(np.minimum(seg, seg[-1] - seg) / 4.0, 0, 1)
    off = amp * (np.sin(seg / 2.3) + .5 * np.sin(seg / .9 + 1.7)) * fade
    return [tuple(v) for v in P + nrm * off[:, None]]


def region_mask(R, nm, su, sv, shape, full=False):
    r_ = next((r for r in R if r.get('name', '').strip() == nm), None)
    if r_ is None:
        raise KeyError('no region named %r' % nm)
    im = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(im).polygon([(a, b) if full else (a * su, b * sv) for a, b in r_['points']], fill=1)
    return np.array(im).astype(bool)


def strokes(rec):
    """the pieces 4.21 paints a river with: [(points, width, alpha)] (edit_rivers step 6)"""
    pts = rec['drawn_px'] if 'drawn_px' in rec else meander(chaikin([tuple(p) for p in rec['px']], 2), .35)
    qs, n, out = rec['q_m3s'], len(pts), []
    for a in range(0, n - 1, 4):
        q = qs[min(len(qs) - 1, int(a / max(1, n - 1) * (len(qs) - 1)))]
        out.append((tuple((round(x, 2), round(y, 2)) for x, y in pts[a:a + 5]), 1 if q < 100 else 2 if q < 800 else 3,
                    150 if q < 50 else 205))
    return out
