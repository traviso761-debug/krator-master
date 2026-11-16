#!/usr/bin/env python3
"""The NPU cut-out trial (README.md here): every method on every sheet, its alpha and colour, the measures, and a contact sheet.

    <venv>/python -I tools/textures/trials/npu-cutout/trial.py SRC_DIR [--devices NPU,CPU] [--out DIR]

Methods: 'key' (cards.py's default key_out), 'unmix' (cards.py's key_unmix), 'isnet' / 'birefnet' (the model's alpha, colour
despilled as key_out's 'all'), and 'hybrid' (the model's mask, dilated, as the support; inside it cards.py's key_unmix for the alpha
and colour). The models are OpenVINO IR in %LOCALAPPDATA%/krator-models/ir (setup in README.md). Writes OUT/<sheet>.<method>.png
(RGBA), OUT/contact.jpg and OUT/results.json.
"""
import argparse, glob, json, os, sys, time
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import cards

KEY = '#ff00ff'
K = np.array([255.0, 0.0, 255.0])
MODELS = {'isnet': ('isnet-general-use', (0.5, 0.5, 0.5), (1.0, 1.0, 1.0), False),
          'birefnet': ('BiRefNet-general-bb_swin_v1_tiny-epoch_232', (0.485, 0.456, 0.406), (0.229, 0.224, 0.225), True)}


def model_dir():
    return os.path.join(os.environ.get('LOCALAPPDATA', os.path.expanduser('~/.cache')), 'krator-models')


class Matte:
    """One model compiled on one device: alpha(im) -> float array in [0, 1] at the image's size."""
    def __init__(self, name, device):
        import openvino as ov
        self.file, self.mean, self.std, self.sigmoid = MODELS[name]
        t = time.time()
        self.net = ov.Core().compile_model(os.path.join(model_dir(), 'ir', self.file + '.xml'), device)
        self.compile_s = time.time() - t

    def alpha(self, im):
        """A salient-object model keeps one object per frame (the middle cell of a 3 x 3 sheet), so it runs once per blob: each
        connected patch of not-the-key (closed by 41 px, so a plant's blades join) in a box padded by 8%, the results maxed."""
        P = np.asarray(im.convert('RGB')).astype(np.float64)
        sub = Image.fromarray(((np.sqrt(((P - K) ** 2).sum(-1)) > 60) * 255).astype(np.uint8))
        sub = np.asarray(sub.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.MinFilter(21))) > 0
        out = np.zeros(sub.shape, np.float32)
        for (y0, y1, x0, x1) in blobs(sub):
            py, px = int((y1 - y0) * 0.08) + 8, int((x1 - x0) * 0.08) + 8
            box = (max(x0 - px, 0), max(y0 - py, 0), min(x1 + px, sub.shape[1]), min(y1 + py, sub.shape[0]))
            out[box[1]:box[3], box[0]:box[2]] = np.maximum(out[box[1]:box[3], box[0]:box[2]], self.whole(im.crop(box)))
        return out

    def whole(self, im):
        x = np.asarray(im.convert('RGB').resize((1024, 1024), Image.BILINEAR)).astype(np.float32) / 255.0
        x = ((x - self.mean) / self.std).transpose(2, 0, 1)[None].astype(np.float32)
        y = self.net(x)[0][0, 0]
        if self.sigmoid:
            y = 1 / (1 + np.exp(-y))
        else:
            y = (y - y.min()) / max(y.max() - y.min(), 1e-6)
        return np.asarray(Image.fromarray(y.astype(np.float32), 'F').resize(im.size, Image.BILINEAR)).clip(0, 1)


def blobs(mask, min_px=400):
    """Bounding boxes (y0, y1, x0, x1) of the 4-connected patches of a boolean mask, by a flood fill on a quarter-size copy."""
    small = mask[::4, ::4]
    lab = np.zeros(small.shape, np.int32)
    boxes, n = [], 0
    for sy, sx in zip(*np.nonzero(small)):
        if lab[sy, sx]:
            continue
        n += 1; lab[sy, sx] = n; stack = [(sy, sx)]; ys, xs = [], []
        while stack:
            y, x = stack.pop(); ys.append(y); xs.append(x)
            for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= yy < small.shape[0] and 0 <= xx < small.shape[1] and small[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n; stack.append((yy, xx))
        if len(ys) * 16 >= min_px:
            boxes.append((min(ys) * 4, max(ys) * 4 + 4, min(xs) * 4, max(xs) * 4 + 4))
    return boxes


def despill_all(rgb):
    s = np.maximum(np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1], 0)[..., None] * 0.9
    return np.clip(rgb - np.concatenate([s, 0 * s, s], -1), 0, 255)


def rgba(rgb, a):
    return Image.fromarray(np.rint(np.concatenate([np.clip(rgb, 0, 255), np.clip(a, 0, 1)[..., None] * 255], -1)).astype(np.uint8), 'RGBA')


def run_model(im, a):
    return rgba(despill_all(np.asarray(im.convert('RGB')).astype(np.float64)), a)


def run_vlahos(im):
    """The trial's winner, now cards.py's spill 'vlahos'."""
    return cards.key_vlahos(im, KEY)


def run_hybrid(im, a):
    support = Image.fromarray(((a > 0.3) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    u = np.asarray(cards.key_unmix(im, KEY, 200)).astype(np.float64)
    ua = u[..., 3] / 255 * (np.asarray(support) > 0)
    return rgba(u[..., :3], ua)


def measures(src, out):
    """The trial's numbers. 'subject' = pixels clearly not the key (distance > 60), opened by a pixel; 'core' = the solid inside it
    (distance > 150, eroded 2 px). kept: share of the subject at alpha > 0.1; semi: share of the kept subject at 0.1 < alpha < 0.9;
    holes: share of the core at alpha < 0.5; cast: mean magenta excess min(R,B)-G over pixels at alpha > 0.1, alpha-weighted;
    fringe: the same excess on the edge band (0.05 < alpha < 0.95, or within 2 px of the alpha = 0.5 line)."""
    P = np.asarray(src.convert('RGB')).astype(np.float64)
    d = np.sqrt(((P - K) ** 2).sum(-1))
    subj = np.asarray(Image.fromarray(((d > 60) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))) > 0
    core = np.asarray(Image.fromarray(((d > 150) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5))) > 0
    o = np.asarray(out).astype(np.float64)
    a = o[..., 3] / 255
    ex = np.maximum(np.minimum(o[..., 0], o[..., 2]) - o[..., 1], 0)
    kept = a > 0.1
    hard = Image.fromarray(((a > 0.5) * 255).astype(np.uint8))
    band = (np.asarray(hard.filter(ImageFilter.MaxFilter(5))) > 0) & ~(np.asarray(hard.filter(ImageFilter.MinFilter(5))) > 0)
    band |= (a > 0.05) & (a < 0.95)
    w = lambda m: float((ex * a)[m].sum() / max(a[m].sum(), 1e-6))
    return {'kept': float((kept & subj).sum() / max(subj.sum(), 1)), 'semi': float(((a > 0.1) & (a < 0.9) & subj).sum() / max((kept & subj).sum(), 1)),
            'holes': float(((a < 0.5) & core).sum() / max(core.sum(), 1)), 'cast': w(kept), 'fringe': w(band & kept),
            'stray': float(((a > 0.1) & ~(np.asarray(Image.fromarray((subj * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0)).mean())}


def tile(im, bg, size):
    t = Image.new('RGBA', im.size, bg + (255,))
    t.alpha_composite(im)
    return t.convert('RGB').resize((size, size), Image.LANCZOS)


def contact(rows, methods, path, size=300, crops=None):
    """rows: [(sheet, {method: RGBA image})]. One row per sheet x background (grey, dark, light); one column per method."""
    bgs = [('grey', (128, 128, 128)), ('dark', (24, 24, 28)), ('light', (236, 236, 232))]
    lab = 22
    W, H = lab * 0 + 110 + size * len(methods), lab + len(rows) * len(bgs) * size
    sheet = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(sheet)
    for j, m in enumerate(methods):
        dr.text((110 + j * size + 6, 5), m, fill=(0, 0, 0))
    y = lab
    for name, outs in rows:
        for bn, bg in bgs:
            dr.text((4, y + size // 2 - 12), name[:16], fill=(0, 0, 0))
            dr.text((4, y + size // 2 + 2), bn, fill=(80, 80, 80))
            for j, m in enumerate(methods):
                im = outs[m]
                if crops and name in crops:
                    im = im.crop(crops[name])
                sheet.paste(tile(im, bg, size), (110 + j * size, y))
            y += size
    sheet.save(path, quality=90)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src_dir')
    ap.add_argument('--devices', default='NPU,CPU', help='devices to time each model on; the first one makes the images')
    ap.add_argument('--models', default='isnet,birefnet')
    ap.add_argument('--out', default=os.path.join(model_dir(), 'trial-npu-cutout'))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    srcs = sorted(glob.glob(os.path.join(a.src_dir, 'card.*.webp')))
    names = [os.path.basename(s)[5:-5] for s in srcs]
    ims = [Image.open(s).convert('RGB') for s in srcs]
    res = {'timing': {}, 'quality': {}}
    alphas, rows = {}, []
    for mname in [m for m in a.models.split(',') if m]:
        for i, dev in enumerate(a.devices.split(',')):
            try:
                mt = Matte(mname, dev)
            except Exception as e:
                res['timing']['%s/%s' % (mname, dev)] = {'error': str(e).strip().splitlines()[-1][:200]}
                print(mname, dev, 'FAILED'); continue
            mt.alpha(ims[0])
            ts = []
            for n, im in zip(names, ims):
                t = time.time(); al = mt.alpha(im); ts.append(time.time() - t)
                alphas.setdefault((mname, n), al)
            res['timing']['%s/%s' % (mname, dev)] = {'compile_s': round(mt.compile_s, 2), 'per_sheet_s': round(float(np.mean(ts)), 3)}
            print(mname, dev, res['timing']['%s/%s' % (mname, dev)])
    for n, im in zip(names, ims):
        t = time.time(); key = cards.key_out(im.convert('RGBA'), KEY, 45, 120, 'edge'); tk = time.time() - t
        t = time.time(); un = cards.key_unmix(im, KEY, 200); tu = time.time() - t
        res['timing'].setdefault('key/CPU', {'per_sheet_s': 0})['per_sheet_s'] += round(tk / len(ims), 3)
        res['timing'].setdefault('unmix/CPU', {'per_sheet_s': 0})['per_sheet_s'] += round(tu / len(ims), 3)
        t = time.time(); vl = run_vlahos(im); tv = time.time() - t
        res['timing'].setdefault('vlahos/CPU', {'per_sheet_s': 0})['per_sheet_s'] += round(tv / len(ims), 3)
        outs = {'key': key, 'unmix': un, 'line': cards.key_line(im, KEY, '#ffffff', 60), 'vlahos': vl}
        for mname in a.models.split(','):
            if (mname, n) in alphas:
                outs[mname] = run_model(im, alphas[(mname, n)])
                outs['hybrid-' + mname] = run_hybrid(im, alphas[(mname, n)])
        for m, o in outs.items():
            o.save(os.path.join(a.out, '%s.%s.png' % (n, m)))
            res['quality']['%s/%s' % (n, m)] = {k: round(v, 4) for k, v in measures(im, o).items()}
        rows.append((n, outs))
    methods = list(rows[0][1])
    contact(rows, methods, os.path.join(a.out, 'contact.jpg'))
    zoom = {'glasscane': (100, 10, 330, 240), 'sedge.fen': (20, 110, 250, 340), 'dwarfbirch': (0, 0, 418, 418),
            'breathfringe': (0, 0, 418, 418), 'turf.limed': (0, 0, 418, 418)}
    contact(rows, methods, os.path.join(a.out, 'contact-zoom.jpg'), crops=zoom)
    with open(os.path.join(a.out, 'results.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(res, fh, indent=1, sort_keys=True)
    print(json.dumps(res['quality'], indent=0))
    return 0


if __name__ == '__main__':
    sys.exit(main())
