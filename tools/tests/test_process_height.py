#!/usr/bin/env python3
"""process.py's `height` option and tools/textures/depth.py, proven without the model: the default ('lum') writes what
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
