#!/usr/bin/env python3
"""tools/textures/libsearch.py without the model: sets are found under library and patterns with their meta.json's colour map,
LFS pointers are skipped, an unchanged set keeps its embedding on a re-index while a changed one is embedded again, the
index saves and loads, ranking and the duplicate pairs are right, and a missing model stops with the setup line. With the
model set up and openvino in this Python, it also checks that the words 'red' rank a red square above a blue one.
tools/test_all.py runs every tools/tests/test_*.py.

    python3 tools/tests/test_libsearch.py
"""
import json, os, sys, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import libsearch  # noqa: E402


def make_set(root, rel, colour, name='albedo.jpg'):
    d = os.path.join(root, 'core', 'materials', rel)
    os.makedirs(d, exist_ok=True)
    Image.new('RGB', (32, 32), colour).save(os.path.join(d, name))
    with open(os.path.join(d, 'meta.json'), 'w', encoding='utf-8') as fh:
        json.dump({'maps': {'map': name}}, fh)
    return os.path.join(d, name)


def main():
    fails = []
    def check(ok, what):
        print(('ok   ' if ok else 'FAIL ') + what)
        if not ok:
            fails.append(what)

    with tempfile.TemporaryDirectory() as tmp:
        old_models = os.environ.get('KRATOR_MODELS')
        os.environ['KRATOR_MODELS'] = os.path.join(tmp, 'models')
        try:
            make_set(tmp, 'library/brick.red', (200, 40, 30))
            make_set(tmp, 'library/brick.red.b', (198, 42, 31))
            make_set(tmp, 'library/glass.blue', (30, 60, 220))
            make_set(tmp, 'patterns/voth/tile', (40, 200, 60), 'albedo.png')
            ptr = os.path.join(tmp, 'core', 'materials', 'library', 'lfs.only')
            os.makedirs(ptr)
            with open(os.path.join(ptr, 'albedo.jpg'), 'wb') as fh:
                fh.write(b'version https://git-lfs.github.com/spec/v1\noid sha256:00\nsize 1\n')
            with open(os.path.join(ptr, 'meta.json'), 'w', encoding='utf-8') as fh:
                json.dump({'maps': {'map': 'albedo.jpg'}}, fh)

            found = [i for i, _ in libsearch.sets(tmp)]
            check(found == ['brick.red', 'brick.red.b', 'glass.blue', 'lfs.only', 'patterns/voth/tile'],
                  'sets are found under library and patterns, by their meta.json colour map: %s' % found)

            calls = []
            def embed(p):     # a stand-in: the mean colour, as a unit vector
                calls.append(p)
                return libsearch.unit(np.asarray(Image.open(p).convert('RGB'), np.float64).mean((0, 1)))
            ix, n = libsearch.build_index(tmp, embed)
            check(n == {'embedded': 4, 'kept': 0, 'pointers': 1} and 'lfs.only' not in ix[0], 'LFS pointers are skipped: %s' % n)
            libsearch.save_index(ix)
            back = libsearch.load_index()
            check(back[0] == ix[0] and np.allclose(back[3], ix[3]), 'the index saves and loads')

            Image.new('RGB', (32, 32), (10, 10, 10)).save(os.path.join(tmp, 'core', 'materials', 'library', 'glass.blue', 'albedo.jpg'))
            calls.clear()
            ix2, n2 = libsearch.build_index(tmp, embed, back)
            check(n2['embedded'] == 1 and n2['kept'] == 3 and calls and calls[0].replace('\\', '/').endswith('glass.blue/albedo.jpg'),
                  'a re-index embeds only the changed set: %s' % n2)

            hits = libsearch.top(ix[3], libsearch.unit(np.array([1.0, 0.2, 0.15])), 2)
            check([ix[0][i] for i, _ in hits] == ['brick.red', 'brick.red.b'], 'search ranks by cosine: the reds first')
            pairs = libsearch.dupes(ix[3], 0.999)
            check([(ix[0][i], ix[0][j]) for _, i, j in pairs] == [('brick.red', 'brick.red.b')], 'dupes pairs only the near copies')
            libsearch.sheet([('reds', hits)], ix[0], ix[1], os.path.join(tmp, 'sheet.jpg'))
            check(os.path.exists(os.path.join(tmp, 'sheet.jpg')), 'the contact sheet is written')

            try:
                libsearch.Model()
                check(False, 'a missing model stops with the setup line')
            except SystemExit as e:
                check('--setup' in str(e), 'a missing model (or no openvino) stops with the setup line')
        finally:
            if old_models is None:
                os.environ.pop('KRATOR_MODELS')
            else:
                os.environ['KRATOR_MODELS'] = old_models

        try:
            import openvino, tokenizers  # noqa: F401
            have = os.path.exists(os.path.join(libsearch.model_dir(), 'ir', 'siglip-vision_model.xml'))
        except ImportError:
            have = False
        if have:
            M = libsearch.Model()
            red, blue = os.path.join(tmp, 'red.png'), os.path.join(tmp, 'blue.png')
            Image.new('RGB', (64, 64), (210, 30, 30)).save(red); Image.new('RGB', (64, 64), (30, 40, 210)).save(blue)
            q = M.text('a red surface')
            check(float(M.image(red) @ q) > float(M.image(blue) @ q), 'the real model ranks a red square above a blue one for "a red surface" (on %s)' % M.device)
        else:
            print('skip the real model (not set up in this Python)')
    print('%d failed' % len(fails) if fails else 'all passed')
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
