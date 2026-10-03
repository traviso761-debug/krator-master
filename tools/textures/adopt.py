#!/usr/bin/env python3
"""Put chosen sets into the library: Poly Haven picks from an ingest folder, and neutral muted copies.

    python3 tools/textures/adopt.py --neutral roof.thatch roof.thatch.neutral [--mute 0.9] [--lum 0.65]
    python3 tools/textures/adopt.py --polyhaven INGEST_DIR tools/textures/batches/polyhaven.json

--neutral SRC DST   a near-grey, albedo-only copy of library/SRC as library/DST. Iziz and Voth colour every
                    instance by a tint over a near-grey texture, so a tinted copy of a full-colour set would
                    be doubly coloured. DST holds only albedo.jpg and meta.json: its meta points `maps` at the
                    sibling set's normal and roughness (../SRC/...), so the 2 MB of PNGs are not stored twice.
                    The colour is muted with process.py's formula (--mute, default 0.9) and the mean luminance
                    set to --lum (default 0.65: a tint multiplies, so the base must not be dark).
--polyhaven DIR B   B is a list of {slug, id, family?, mute?, neutral?, scale?, tint?, note?, rough_lift?, rough_floor?, metal?}. For each, the set
                    DIR/sets/<slug> (from ingest_polyhaven.py) becomes library/<id>: the colour map is muted
                    lightly when the id is tintable (mute 0.35 unless given), normal and roughness are copied
                    unchanged, meta.json is updated (id, scale, tint, adoption). neutral:true also writes
                    <id>.neutral. Nothing in DIR is modified.
Requires numpy and Pillow. Deterministic.
"""
import argparse, json, os, shutil
import numpy as np
from PIL import Image, ImageFile

ImageFile.MAXBLOCK = 1 << 26
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'core/materials/library')


def lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def mute(a, amount, mean_lum=None):
    """process.py's mute (desaturate, compress contrast), then optionally move the mean luminance."""
    if amount > 0:
        L = lum(a)[..., None]
        a = L + (a - L) * (1 - amount)
        a = 0.5 + (a - 0.5) * (1 - amount * 0.4)
    if mean_lum:
        a = a * (mean_lum / max(lum(a).mean(), 1e-4))
    return np.clip(a, 0, 1)


def save_albedo(a, path):
    Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)).save(path, quality=92, subsampling=0, optimize=True)


def read_albedo(path):
    return np.asarray(Image.open(path).convert('RGB')).astype(np.float64) / 255.0


def neutral(src_id, dst_id, amount=0.9, mean_lum=0.65):
    sd = os.path.join(LIB, src_id); dd = os.path.join(LIB, dst_id)
    meta = json.load(open(os.path.join(sd, 'meta.json')))
    a = read_albedo(os.path.join(sd, meta['maps']['map'] if not meta['maps']['map'].startswith('..') else 'albedo.jpg'))
    os.makedirs(dd, exist_ok=True)
    save_albedo(mute(a, amount, mean_lum), os.path.join(dd, 'albedo.jpg'))
    rec = dict(meta['record']); rec.update(id=dst_id, tint=True, colour='#ffffff')
    out = {'record': rec,
           'maps': {'map': 'albedo.jpg', 'normalMap': '../%s/normal.png' % src_id, 'roughnessMap': '../%s/roughness.png' % src_id},
           'source': dict(meta['source'], derived_from=src_id),
           'processing': {'script': 'tools/textures/adopt.py', 'version': 1,
                          'options': {'neutral_of': src_id, 'mute': amount, 'mean_luminance': mean_lum},
                          'note': 'albedo only; normal and roughness are the sibling set\'s'}}
    with open(os.path.join(dd, 'meta.json'), 'w') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
    print('%-26s <- %-22s mute %.2f lum %.2f' % (dst_id, src_id, amount, mean_lum))


def adopt_polyhaven(ingest, batch):
    for job in json.load(open(batch)):
        sd = os.path.join(ingest, 'sets', job['slug'])
        if not os.path.isdir(sd):
            print('MISSING in ingest folder: %s' % job['slug']); continue
        meta = json.load(open(os.path.join(sd, 'meta.json')))
        rec = meta['record']
        tint = job.get('tint', rec['tint'])
        amount = job.get('mute', 0.35 if tint else 0.0)
        dd = os.path.join(LIB, job['id'])
        os.makedirs(dd, exist_ok=True)
        a = read_albedo(os.path.join(sd, 'albedo.jpg'))
        save_albedo(mute(a, amount) if amount > 0 else a, os.path.join(dd, 'albedo.jpg'))
        shutil.copyfile(os.path.join(sd, 'normal.png'), os.path.join(dd, 'normal.png'))
        lift, floor = job.get('rough_lift', 0.0), job.get('rough_floor', 0.0)
        if lift > 0 or floor > 0:       # scan roughness maps run wet under sun and environment light: r' = max(r + (1-r)*lift, floor)
            r = np.asarray(Image.open(os.path.join(sd, 'roughness.png')).convert('L')).astype(np.float64) / 255.0
            r = np.maximum(r + (1 - r) * lift, floor)
            Image.fromarray((np.clip(r, 0, 1) * 255 + 0.5).astype(np.uint8), 'L').save(os.path.join(dd, 'roughness.png'), optimize=True)
        else:
            shutil.copyfile(os.path.join(sd, 'roughness.png'), os.path.join(dd, 'roughness.png'))
        rec.update(id=job['id'], family=job.get('family', job['id'].split('.')[0]), tint=tint)
        if 'scale' in job:
            rec['scale'] = job['scale']
        meta['processing']['adopt'] = {'script': 'tools/textures/adopt.py', 'mute': amount, 'rough_lift': lift, 'rough_floor': floor, 'note': job.get('note', '')}
        if 'metal' in job: rec['metal'] = job['metal']
        meta['processing']['stats'].pop('scale_note', None) if 'scale' in job else None
        with open(os.path.join(dd, 'meta.json'), 'w') as fh:
            json.dump(meta, fh, indent=1, sort_keys=True)
        print('%-26s <- %-30s tint %-5s mute %.2f' % (job['id'], job['slug'], tint, amount))
        if job.get('neutral'):
            neutral(job['id'], job['id'] + '.neutral')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--neutral', nargs=2, metavar=('SRC', 'DST'))
    ap.add_argument('--polyhaven', nargs=2, metavar=('INGEST_DIR', 'BATCH'))
    ap.add_argument('--mute', type=float, default=0.9)
    ap.add_argument('--lum', type=float, default=0.65)
    a = ap.parse_args()
    if a.neutral:
        neutral(a.neutral[0], a.neutral[1], a.mute, a.lum)
    if a.polyhaven:
        adopt_polyhaven(*a.polyhaven)
    if not (a.neutral or a.polyhaven):
        ap.error('give --neutral or --polyhaven')


if __name__ == '__main__':
    main()
