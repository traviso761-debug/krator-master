#!/usr/bin/env python3
"""The baked-lighting trial (README.md here): take the light out of a texture, scored where the truth is known.

    <venv>/python tools/textures/trials/npu-delight/trial.py LIBRARY_DIR SETS [--out DIR]

For each Poly Haven set (its colour map is near flat-lit, its normal map scanned) a lit copy is baked: the colour map times
the shading of a raking light (elevation 40 deg, an azimuth hashed from the id, ambient 0.3) on the scanned normals, times a
slow periodic brightness swell (+-20%). Each method then has to give back the colour map:
  none            the baked image as it is
  current         process.py step 2 as it is (delight 0.6 over a wide blur, lift 0.15)
  shadefit-model  step 2's gain without the lift, then the raking part of a fitted light (fit_light) divided out, on the
                  slopes of the depth model's height (tools/textures/depth.py, NPU)
  shadefit-true   the same on the scanned normals: the best this fit can do
  marigold        Marigold-IID lighting's albedo, read from OUT/<set>/marigold.png when marigold.py has written it
  marigold-ratio  only the light from Marigold: the baked image divided by (its luminance over Marigold's, both blurred
                  RATIO_BLUR px), so the baked image keeps its own fine detail
  marigold-npu    (--npu) the same through tools/textures/marigold_iid.py, as process.py --light-from marigold runs it
Scores, after a per-channel gain (exposure is unknowable): 'rmse' against the true colour map (0-255), and 'left' = the
correlation between what the method left in (its log luminance over the truth's) and the baked shading: 1 is all the light
still there, 0 all of it gone, below 0 overcorrected. Writes OUT/<set>/{truth,baked,<method>}.png, OUT/results.json.
"""
import argparse, json, os, sys, time, zlib
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import process

AMB, ELEV, SWELL = 0.3, 40.0, 0.2
RATIO_BLUR = 2.0                # marigold-ratio: the blur (px) past which Marigold's albedo is trusted for the light


def light(az, el):
    a, e = np.radians(az), np.radians(el)
    return np.array([np.cos(e) * np.cos(a), np.cos(e) * np.sin(a), np.sin(e)])


def shade(N, L, amb):
    """Lambert under light L plus ambient, 1 on a flat surface."""
    return amb + (1 - amb) * np.maximum((N * L).sum(-1), 0) / L[2]


def swell(H, W, sid):
    r = zlib.crc32(sid.encode())
    y, x = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
    return 1 + SWELL * np.sin(2 * np.pi * x + r % 7) * np.cos(2 * np.pi * y + r % 5)


def current(I):
    """process.py step 2, unchanged (delight 0.6, lift 0.15)."""
    L = process.lum(I)
    big = process.blur(L, sigma=min(I.shape[:2]) / 6.0)
    a = I * ((L.mean() / np.maximum(big, 1e-3)) ** 0.6)[..., None]
    a = np.clip(a, 0, 1)
    return np.clip(1 - (1 - a) ** 1.15, 0, 1)


def gain_only(I):
    """Step 2's large-scale gain at full strength, no lift: the swell out, the relief shading left for the fit."""
    L = process.lum(I)
    big = process.blur(L, sigma=min(I.shape[:2]) / 6.0)
    return I * (L.mean() / np.maximum(big, 1e-3))[..., None]


def normals_from_height(h, k):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * k
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * k
    n = np.stack([-dx, dy, np.ones_like(h)], -1)
    return n / np.linalg.norm(n, axis=-1, keepdims=True)


def hp(x, s=16.0):
    return x - process.blur(x, sigma=s)


def fit_light(I1, sx, sy):
    """The raking part of the light, by least squares: hp(log lum) = a*hp(sx) + b*hp(sy) + the albedo. sx, sy are the
    surface's slope fields (any scale: a and b absorb it). A light from one side darkens the slopes turned away from it and
    lifts the ones turned to it, which is odd in the slope; dirt and dark grout in the colour map darken every way (even),
    so they drop out of the fit instead of passing for light (a search over whole shading models matched the grout).
    Returns the fit (azimuth, strength, how much of the image's relief it explains) and the log shading to divide out.
    What it cannot take out: the even part of the shading (slopes darker than flats from every side), which looks the same
    as dirt."""
    D = hp(np.log(np.maximum(process.lum(I1), 1e-3)))
    X = np.stack([hp(sx).ravel(), hp(sy).ravel()], 1)
    (a, b), *_ = np.linalg.lstsq(X, D.ravel(), rcond=None)
    logS = a * hp(sx) + b * hp(sy)
    r2 = 1 - ((D - logS) ** 2).sum() / max((D ** 2).sum(), 1e-9)
    return {'az': round(float(np.degrees(np.arctan2(b, a))) % 360, 1), 'strength': round(float(np.hypot(a, b)), 4), 'r2': round(float(r2), 3)}, logS


def score(E, A, S):
    c = (A * E).sum((0, 1)) / np.maximum((E * E).sum((0, 1)), 1e-9)
    Ec = np.clip(E * c, 0, 1)
    rmse = float(np.sqrt(((Ec - A) ** 2).mean()) * 255)
    left = hp(np.log(np.maximum(process.lum(Ec), 1e-3)) - np.log(np.maximum(process.lum(A), 1e-3)))
    sh = hp(np.log(S))
    corr = float((left * sh).sum() / max(np.sqrt((left ** 2).sum() * (sh ** 2).sum()), 1e-9))
    return {'rmse': round(rmse, 2), 'left': round(corr, 3)}


def save(a, path):
    Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)).save(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('library')
    ap.add_argument('sets')
    ap.add_argument('--out', default=os.path.join(os.environ.get('LOCALAPPDATA', '.'), 'krator-models', 'trial-npu-delight'))
    ap.add_argument('--size', type=int, default=512)
    ap.add_argument('--npu', action='store_true', help="also score 'marigold-npu': process.py's --light-from marigold")
    a = ap.parse_args()
    import depth
    res = {}
    for sid in a.sets.split(','):
        d = os.path.join(a.library, sid)
        maps = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8'))['maps']
        A = np.asarray(Image.open(os.path.join(d, maps['map'])).convert('RGB').resize((a.size, a.size), Image.LANCZOS)) / 255.0
        Nt = np.asarray(Image.open(os.path.join(d, maps['normalMap'])).convert('RGB').resize((a.size, a.size), Image.BILINEAR)) / 127.5 - 1
        Nt /= np.linalg.norm(Nt, axis=-1, keepdims=True)
        az = zlib.crc32(sid.encode()) % 360
        S = shade(Nt, light(az, ELEV), AMB)
        I = np.clip(A * (S * swell(a.size, a.size, sid))[..., None], 0, 1)
        o = os.path.join(a.out, sid); os.makedirs(o, exist_ok=True)
        save(A, os.path.join(o, 'truth.png')); save(I, os.path.join(o, 'baked.png'))
        r = {'light': {'az': az, 'el': ELEV, 'amb': AMB}}
        out = {'none': I, 'current': current(I)}
        I1 = gain_only(I)
        t = time.time(); D, dev = depth.height(I); r['depth_s'] = round(time.time() - t, 2); r['device'] = dev
        hm = process.blur(D - process.blur(D, sigma=a.size / 24.0), sigma=0.8)
        sx, sy = (np.roll(hm, -1, 1) - np.roll(hm, 1, 1)) * 0.5, (np.roll(hm, 1, 0) - np.roll(hm, -1, 0)) * 0.5
        r['fit_model'], lm = fit_light(I1, sx, sy)
        out['shadefit-model'] = I1 * np.exp(-lm)[..., None]
        r['fit_true'], lt = fit_light(I1, Nt[..., 0], Nt[..., 1])
        out['shadefit-true'] = I1 * np.exp(-lt)[..., None]
        mp = os.path.join(o, 'marigold.png')
        if os.path.exists(mp):
            M = np.asarray(Image.open(mp).convert('RGB').resize((a.size, a.size), Image.LANCZOS)) / 255.0
            out['marigold'] = M
            # Marigold's albedo is smeared below a few pixels, but its light is right: take only the light from it (the
            # baked image's luminance over Marigold's, both blurred past the smear) and keep the baked image's own detail
            R = process.blur(process.lum(I), sigma=RATIO_BLUR) / np.maximum(process.blur(process.lum(M), sigma=RATIO_BLUR), 1e-3)
            out['marigold-ratio'] = I / np.maximum(R, 0.05)[..., None]
        if a.npu:     # what process.py --light-from marigold runs: marigold_iid.py on OpenVINO (wrap border, the UNet on the NPU)
            import marigold_iid
            t = time.time(); R, r['marigold_device'] = marigold_iid.baked_light(I, process.blur); r['marigold_s'] = round(time.time() - t, 1)
            out['marigold-npu'] = I / R[..., None]
        for m, E in out.items():
            r[m] = score(E, A, S)
            if m != 'none':
                save(E / max(np.percentile(E, 99.5), 1e-6) if m.startswith('shadefit') else E, os.path.join(o, m + '.png'))
        res[sid] = r
        print(sid, {m: r[m] for m in out}, 'fit', r['fit_model'], r['fit_true'])
    with open(os.path.join(a.out, 'results.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(res, fh, indent=1, sort_keys=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
