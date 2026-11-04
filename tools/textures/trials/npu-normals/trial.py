#!/usr/bin/env python3
"""The NPU normal-map trial (README.md here): process.py's height (luminance minus its wide blur) against a depth model's
(Depth Anything V2 Small on OpenVINO), scored on Poly Haven sets whose normal maps are scanned, and shown on sets without one.

    <venv>/python -I tools/textures/trials/npu-normals/trial.py LIBRARY_DIR SETS [--device NPU] [--out DIR] [--src DELIVERY_DIR]

SETS is a comma list of library set ids. Methods: 'lum' (process.py steps 4-5 as they are), 'model' (the depth model's
relative depth as the height, then the same high-pass, soften and normal), 'blend' (half each, after standardising), 'split' (the model's height for the shapes wider than a few pixels,
luminance for the grain finer than that).
Scores, per method, against the set's own normal map when the set came from tools/textures/ingest_polyhaven.py (scanned):
'cos' = the cosine between the predicted and the scanned slope fields (scale-free: 1 is perfect, 0 unrelated, below 0 the
relief upside down) and 'deg' = the mean angle to the scanned normal at the best single strength. Writes OUT/<set>/<method>/
(albedo.jpg, normal.jpg, roughness.png, meta.json: a set preview.py can show) and OUT/results.json.
"""
import argparse, json, os, shutil, sys, time
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import process, depth

MEAN, STD, WIN = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225]), 518
SPLIT, GRAIN = 3.0, 0.5         # the 'split' method's crossover (px, a blur sigma) and the weight of the grain against the shapes


def model_dir():
    return os.path.join(os.environ.get('LOCALAPPDATA', os.path.expanduser('~/.cache')), 'krator-models')


class Depth:
    def __init__(self, device):
        import openvino as ov
        t = time.time()
        self.net = ov.Core().compile_model(os.path.join(model_dir(), 'ir', 'depth-anything-v2-small.xml'), device)
        self.compile_s, self.frames, self.infer_s = time.time() - t, 0, 0.0

    def frame(self, a):
        x = ((a - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
        t = time.time(); y = self.net(x)[0].reshape(WIN, WIN); self.infer_s += time.time() - t; self.frames += 1
        return y.astype(np.float64)

    def height(self, a):
        """Relative depth of a periodic image, still periodic: depth.py's windows round the torus (what process.py uses)."""
        return depth.periodic_height(a, self.frame)


def highpass(Hraw, size, soften):
    """process.py step 4 from any raw height: minus its wide blur, softened."""
    hp = Hraw - process.blur(Hraw, sigma=size / 24.0)
    return process.blur(hp, sigma=soften)


def unit(h):
    return (h - h.min()) / max(h.max() - h.min(), 1e-6)


def normal(h, strength, size):
    """process.py step 5, unchanged."""
    s = strength * size / 1024.0
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * s * 8
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * s * 8
    n = np.stack([-dx, dy, np.ones_like(h)], -1)
    return n / np.linalg.norm(n, axis=-1, keepdims=True)


def score(h, truth):
    """truth: the scanned normal (OpenGL), HxWx3 in [-1, 1]. Its slopes are (-x/z, y/z); h's are (dx, -dy) as step 5 makes them."""
    tz = np.maximum(truth[..., 2], 0.2)
    tx, ty = -truth[..., 0] / tz, truth[..., 1] / tz
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5
    cos = float((dx * tx + dy * ty).sum() / max(np.sqrt((dx * dx + dy * dy).sum() * (tx * tx + ty * ty).sum()), 1e-9))
    best = None
    for k in np.geomspace(1, 2000, 40):
        n = np.stack([-dx * k, dy * k, np.ones_like(h)], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True)
        deg = float(np.degrees(np.arccos(np.clip((n * truth).sum(-1) / np.linalg.norm(truth, axis=-1).clip(1e-6), -1, 1))).mean())
        best = deg if best is None else min(best, deg)
    flat = float(np.degrees(np.arccos(np.clip(truth[..., 2] / np.linalg.norm(truth, axis=-1).clip(1e-6), -1, 1))).mean())
    return {'cos': round(cos, 3), 'deg': round(best, 2), 'flat_deg': round(flat, 2)}


def write_set(out, src_dir, alb, n, rough_src):
    os.makedirs(out, exist_ok=True)
    Image.fromarray((np.clip(alb, 0, 1) * 255 + 0.5).astype(np.uint8)).save(os.path.join(out, 'albedo.jpg'), quality=92, subsampling=0)
    Image.fromarray((np.clip(n * 0.5 + 0.5, 0, 1) * 255 + 0.5).astype(np.uint8)).save(os.path.join(out, 'normal.jpg'), quality=95, subsampling=0)
    shutil.copyfile(rough_src, os.path.join(out, 'roughness.png'))
    with open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({'record': {'id': os.path.basename(os.path.dirname(out)) + '/' + os.path.basename(out)}, 'source': src_dir}, fh)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('library')
    ap.add_argument('sets')
    ap.add_argument('--device', default='NPU', help='falls back to CPU when it does not compile')
    ap.add_argument('--out', default=os.path.join(model_dir(), 'trial-npu-normals'))
    a = ap.parse_args()
    try:
        dm = Depth(a.device)
    except Exception as e:
        print('%s: %s; CPU instead' % (a.device, str(e).strip().splitlines()[-1][:120])); dm = Depth('CPU')
    res = {'device': a.device, 'compile_s': round(dm.compile_s, 1), 'sets': {}}
    for sid in a.sets.split(','):
        d = os.path.join(a.library, sid)
        meta = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8'))
        proc = meta.get('processing', {})
        o = dict(process.DEFAULTS); o.update(proc.get('options', {}) if proc.get('script', '').endswith('process.py') else {})
        alb = np.asarray(Image.open(os.path.join(d, meta.get('maps', {}).get('map', 'albedo.jpg'))).convert('RGB')).astype(np.float64) / 255
        size = alb.shape[1]
        t = time.time(); Hm = dm.height(alb); tm = time.time() - t
        hl = highpass(process.lum(alb), size, o['height_soften'])
        if o['invert_height']:
            hl = -hl
        hm = highpass(Hm, size, o['height_soften'])
        z = lambda h: (h - h.mean()) / max(h.std(), 1e-9)
        # split: the model for the shapes (bricks, cobbles, tiles: wider than a few pixels), luminance for the grain below them
        fine = hl - process.blur(hl, sigma=SPLIT)
        hs = {'lum': unit(hl), 'model': unit(hm), 'blend': unit(z(hl) + z(hm)),
              'split': unit(z(process.blur(hm, sigma=SPLIT)) + z(fine) * GRAIN)}
        r = {'model_s': round(tm, 2), 'scanned': proc.get('script', '').endswith('ingest_polyhaven.py')}
        maps = meta.get('maps', {})
        rough = os.path.join(d, maps.get('roughnessMap', 'roughness.png'))
        if r['scanned']:
            truth = np.asarray(Image.open(os.path.join(d, maps.get('normalMap', 'normal.jpg'))).convert('RGB')).astype(np.float64) / 127.5 - 1
        for m, h in hs.items():
            if r['scanned']:
                r[m] = score(h, truth)
            write_set(os.path.join(a.out, sid, m), d, alb, normal(h, o['normal_strength'], size), rough)
        if r['scanned']:
            write_set(os.path.join(a.out, sid, 'scanned'), d, alb, truth, rough)
        res['sets'][sid] = r
        print(sid, r)
    res['per_frame_s'] = round(dm.infer_s / max(dm.frames, 1), 3)
    with open(os.path.join(a.out, 'results.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(res, fh, indent=1, sort_keys=True)
    print('per frame %.3f s on %s' % (res['per_frame_s'], a.device))
    return 0


if __name__ == '__main__':
    sys.exit(main())
