#!/usr/bin/env python3
"""process.py's `height` and `light_from` options (tools/textures/depth.py, tools/textures/marigold_iid.py), proven
without the models: the default ('lum') writes what
process.py wrote before the option (meta.json too), the windows round the torus give a height that still tiles, 'model' and
'split' run on a stand-in depth and record the device, a bad value is refused, and a missing model stops with the setup line.
With the model set up (depth.py --setup) and openvino in this Python, it also runs the real model once. tools/test_all.py runs
every tools/tests/test_*.py.

    python3 tools/tests/test_process_height.py
"""
import json, os, sys, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import process, depth  # noqa: E402


def main():
    fails = []
    def check(ok, what):
        print(('ok   ' if ok else 'FAIL ') + what)
        if not ok:
            fails.append(what)

    rng = np.random.default_rng(7)
    small = process.blur(rng.random((96, 96, 3)), 3.0)
    small = (small - small.min()) / (small.max() - small.min())
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'src.png')
        Image.fromarray((small * 255).astype(np.uint8)).resize((300, 300), Image.BICUBIC).save(src)
        read = lambda d, f: open(os.path.join(tmp, d, f), 'rb').read()

        process.run_one(src, os.path.join(tmp, 'default'), {'id': 't.default'}, {'size': 128})
        process.run_one(src, os.path.join(tmp, 'lum'), {'id': 't.default'}, {'size': 128, 'height': 'lum'})
        check(all(read('default', f) == read('lum', f) for f in ('albedo.jpg', 'normal.jpg', 'roughness.png', 'meta.json')),
              "height 'lum' is the default, byte for byte, meta.json included")
        meta = json.load(open(os.path.join(tmp, 'default', 'meta.json'), encoding='utf-8'))
        check('height' not in meta['processing']['options'], "meta.json of a 'lum' set has no height key (as before the option)")

        # a stand-in depth: the window's own luminance, so the windowing and the torus can be checked without the model
        a = np.asarray(Image.open(src).convert('RGB').resize((200, 200))).astype(np.float64) / 255
        H = depth.periodic_height(np.tile(a, (1, 1, 1)), lambda w: process.lum(w), win=96)
        step = np.abs(np.diff(H, axis=1)).mean()
        check(np.abs(H[:, -1] - H[:, 0]).mean() < 3 * step, 'the windowed height tiles: the seam step is an ordinary step')
        check(np.corrcoef(H.ravel(), process.lum(a).ravel())[0, 1] > 0.9, 'the windowed height follows what the windows saw')

        real = depth.height
        depth.height = lambda arr, device=None: (process.lum(arr) * 2 + 1, 'stand-in')
        try:
            for m in ('model', 'split'):
                process.run_one(src, os.path.join(tmp, m), {'id': 't.' + m}, {'size': 128, 'height': m})
                mm = json.load(open(os.path.join(tmp, m, 'meta.json'), encoding='utf-8'))
                check(mm['processing']['options']['height'] == m and mm['processing']['log']['height_device'] == 'stand-in',
                      "height '%s' runs and records the option and the device" % m)
            check(read('model', 'normal.jpg') == read('lum', 'normal.jpg'),
                  "height 'model' with a depth that is luminance (scaled) gives the 'lum' normal: the same high-pass and normal steps")
            check(read('split', 'normal.jpg') != read('lum', 'normal.jpg'), "height 'split' mixes two scales, so it differs")
        finally:
            depth.height = real
        try:
            process.run_one(src, os.path.join(tmp, 'bad'), {'id': 't.bad'}, {'size': 128, 'height': 'deep'})
            check(False, 'a bad height value is refused')
        except ValueError:
            check(True, 'a bad height value is refused')

        # light_from: the default 'blur' is the old step 2 (proven above with the default bytes); 'marigold' divides by the
        # light marigold_iid gives, here a stand-in: a light with a bright right half must come out of a flat grey
        import marigold_iid
        real_light = marigold_iid.baked_light
        flat = os.path.join(tmp, 'flat.png')
        lit = np.full((300, 300, 3), 0.4); lit[:, 150:] *= 1.5
        Image.fromarray((lit * 255).astype(np.uint8)).save(flat)
        def stand_in(arr, blur, device=None):
            R = np.ones(arr.shape[:2]); R[:, arr.shape[1] // 2:] = 1.5
            return R / np.median(R), 'stand-in'
        marigold_iid.baked_light = stand_in
        try:
            process.run_one(flat, os.path.join(tmp, 'mg'), {'id': 't.mg'}, {'size': 128, 'light_from': 'marigold', 'lift': 0.0, 'seam_axes': 'none'})
            alb = np.asarray(Image.open(os.path.join(tmp, 'mg', 'albedo.jpg')).convert('L'), np.float64)
            mm = json.load(open(os.path.join(tmp, 'mg', 'meta.json'), encoding='utf-8'))
            check(abs(alb[:, :50].mean() - alb[:, -50:].mean()) < 3, "light_from 'marigold' divides the light out (the halves %.0f, %.0f)" % (alb[:, :50].mean(), alb[:, -50:].mean()))
            check(mm['processing']['options']['light_from'] == 'marigold' and mm['processing']['log']['light_device'] == 'stand-in',
                  "light_from 'marigold' records the option and the device")
            check('light_from' not in meta['processing']['options'], "meta.json of a default set has no light_from key")
        finally:
            marigold_iid.baked_light = real_light
        try:
            process.run_one(src, os.path.join(tmp, 'badl'), {'id': 't.badl'}, {'size': 128, 'light_from': 'sun'})
            check(False, 'a bad light_from is refused')
        except ValueError:
            check(True, 'a bad light_from is refused')
        ts, ac, final = marigold_iid.schedule()
        check(list(ts) == [999, 749, 499, 249] and ac[-1] < 1e-12 and abs(final - ac[0]) < 1e-15 and np.all(np.diff(ac) < 0),
              "Marigold's DDIM schedule: trailing steps 999/749/499/249, zero terminal SNR, final alpha = alphas_cumprod[0]")

        old = os.environ.get('KRATOR_MODELS')
        os.environ['KRATOR_MODELS'] = os.path.join(tmp, 'no-models')
        depth._cached = None
        try:
            depth.Depth()
            check(False, 'a missing model stops with the setup line')
        except SystemExit as e:
            check('depth.py --setup' in str(e), 'a missing model (or no openvino) stops with the setup line')
        finally:
            if old is None:
                os.environ.pop('KRATOR_MODELS')
            else:
                os.environ['KRATOR_MODELS'] = old

        try:
            import openvino  # noqa: F401
            have = os.path.exists(depth.ir_path())
        except ImportError:
            have = False
        if have:
            depth._cached = None
            process.run_one(src, os.path.join(tmp, 'real'), {'id': 't.real'}, {'size': 128, 'height': 'model'})
            dev = json.load(open(os.path.join(tmp, 'real', 'meta.json'), encoding='utf-8'))['processing']['log']['height_device']
            check(bool(dev), 'the real model runs (on %s)' % dev)
        else:
            print('skip the real model (not set up in this Python)')
    print('%d failed' % len(fails) if fails else 'all passed')
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
