#!/usr/bin/env python3
"""Unit tests (positive + negative) for tools/check_godot_exports.py."""
import json, os, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import check_godot_exports as CGE   # noqa: E402

fails = 0
checks = 0


def ok(cond, msg):
    global fails, checks
    checks += 1
    if not cond:
        fails += 1
        print('FAIL  ' + msg)


def _write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(obj, f)


def _write_glb(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(b'glTF\x02\x00\x00\x00\x14\x00\x00\x00JSON{}  ')


def _make_world(wdir, items=None, buckets=None, materials=None, textures=None, errors=None, write_glb=True):
    os.makedirs(wdir, exist_ok=True)
    w = {
        'format': 'krator-world',
        'version': 1,
        'errors': errors or [],
        'items': items or [],
        'buckets': buckets or [],
        'materials': materials or [],
        'textures': textures or [],
        'glb': {'file': 'world.glb'},
    }
    _write_json(os.path.join(wdir, 'world.json'), w)
    if write_glb and (w['items'] or w['buckets']):
        _write_glb(os.path.join(wdir, 'world.glb'))


def main():
    # 1. Repo's real godot/data passes cleanly
    names, issues = CGE.check_data_root(os.path.join(ROOT, 'godot', 'data'), os.path.join(ROOT, '.gitattributes'))
    ok(len(names) >= 13 and not issues, 'real godot/data clean (%d cases, %r)' % (len(names), issues[:2]))

    with tempfile.TemporaryDirectory() as tmp:
        # 2. Clean standalone world + LFS pointer glb accepted
        c1 = os.path.join(tmp, 'world-clean')
        _make_world(c1, items=[{'id': 'i0', 'name': 'tree', 'material': 'm0'}],
                    materials=[{'id': 'm0'}], write_glb=False)
        with open(os.path.join(c1, 'world.glb'), 'wb') as f:
            f.write(b'version https://git-lfs.github.com/spec/v1\noid sha256:00\nsize 128\n')
        _, iss = CGE.check_data_root(tmp)
        ok(not iss, 'LFS pointer world.glb passes standalone check: %r' % iss)

        # 3. Negative: missing world.glb when items > 0
        os.remove(os.path.join(c1, 'world.glb'))
        _, iss = CGE.check_data_root(tmp)
        ok(any('world.glb' in m for m in iss), 'catches missing world.glb')
        _write_glb(os.path.join(c1, 'world.glb'))

        # 4. Negative: unresolved material id on item
        _make_world(os.path.join(tmp, 'world-badmat'), items=[{'id': 'i0', 'name': 'x', 'material': 'missing'}], materials=[])
        _, iss = CGE.check_data_root(tmp)
        ok(any('missing material' in m for m in iss), 'catches unresolved item material')
        _make_world(os.path.join(tmp, 'world-badmat'), items=[], materials=[])

        # 5. Negative: world.json export errors non-empty
        _make_world(os.path.join(tmp, 'world-err'), errors=['shader failed'])
        _, iss = CGE.check_data_root(tmp)
        ok(any('export error' in m for m in iss), 'catches export errors in world.json')
        _make_world(os.path.join(tmp, 'world-err'))

        # 6. Negative: broken png texture (missing data URL) and missing library webp
        _make_world(os.path.join(tmp, 'world-tex'), textures=[{'id': 't0', 'from': 'png', 'png': ''}])
        _, iss = CGE.check_data_root(tmp)
        ok(any('broken png texture' in m for m in iss), 'catches broken from=png texture')
        _make_world(os.path.join(tmp, 'world-tex'),
                    textures=[{'id': 't1', 'from': 'library', 'pack': 'xa', 'family': 'stone', 'slot': 'map'}])
        _write_json(os.path.join(tmp, 'world-tex', 'tex', 'xa.pack.json'),
                    {'families': {'stone': {'files': {'map': 'stone.webp'}}}})
        _, iss = CGE.check_data_root(tmp)
        ok(any('missing texture file tex/stone.webp' in m for m in iss), 'catches missing library webp')
        with open(os.path.join(tmp, 'world-tex', 'tex', 'stone.webp'), 'wb') as f:
            f.write(b'RIFF\x00\x00\x00\x00WEBP')
        _, iss = CGE.check_data_root(tmp)
        ok(not iss, 'resolved library webp passes: %r' % iss)

        # 7. Clean streamed case
        st = os.path.join(tmp, 'world-stream')
        _make_world(os.path.join(st, 'chunks', 'c+000+000'))
        _make_world(os.path.join(st, 'places', 'p0'),
                    items=[{'id': 'f0', 'name': 'flora/0|1|0|2/leaf', 'material': 'm0'}],
                    materials=[{'id': 'm0'}])
        idx = {
            'format': 'krator-world-stream', 'version': 1, 'source': 'openworld/test/dist/test.html',
            'chunk': {'size': 16000, 'step': 64, 'list': [{'id': 'c+000+000', 'box': [0, 0, 16000, 16000], 'case': 'chunks/c+000+000'}]},
            'places': [{'id': 'p0', 'pin': [640, 640], 'box': [0, 0, 1280, 1280], 'case': 'places/p0'}],
        }
        _write_json(os.path.join(st, 'index.json'), idx)
        _, iss = CGE.check_data_root(tmp)
        ok(not iss, 'clean streamed case passes: %r' % iss)

        # 8. Negative: unsnapped place box (not a multiple of 64)
        idx['places'][0]['box'] = [0, 0, 1250, 1280]
        _write_json(os.path.join(st, 'index.json'), idx)
        _, iss = CGE.check_data_root(tmp)
        ok(any('not snapped' in m for m in iss), 'catches unsnapped place box')
        idx['places'][0]['box'] = [0, 0, 1280, 1280]

        # 9. Negative: pin outside place box
        idx['places'][0]['pin'] = [2500, 640]
        _write_json(os.path.join(st, 'index.json'), idx)
        _, iss = CGE.check_data_root(tmp)
        ok(any('outside box' in m for m in iss), 'catches pin outside place box')
        idx['places'][0]['pin'] = [640, 640]

        # 10. Negative: overlapping place boxes
        _make_world(os.path.join(st, 'places', 'p1'))
        idx['places'].append({'id': 'p1', 'pin': [960, 960], 'box': [640, 640, 1920, 1920], 'case': 'places/p1'})
        _write_json(os.path.join(st, 'index.json'), idx)
        _, iss = CGE.check_data_root(tmp)
        ok(any('overlaps' in m for m in iss), 'catches overlapping place boxes')
        idx['places'].pop()
        _write_json(os.path.join(st, 'index.json'), idx)

        # 11. Negative: orphan place folder left on disk (p1 still exists!)
        _, iss = CGE.check_data_root(tmp)
        ok(any('orphan place' in m for m in iss), 'catches orphan place folder')
        os.remove(os.path.join(st, 'places', 'p1', 'world.json'))
        os.rmdir(os.path.join(st, 'places', 'p1'))

        # 12. Negative: orphan chunk folder left on disk
        os.makedirs(os.path.join(st, 'chunks', 'c+099+099'), exist_ok=True)
        _, iss = CGE.check_data_root(tmp)
        ok(any('orphan chunk' in m for m in iss), 'catches orphan chunk folder')
        os.rmdir(os.path.join(st, 'chunks', 'c+099+099'))

        # 13. Negative: forbidden clunky lv=0 flora item in streamed place
        _make_world(os.path.join(st, 'places', 'p0'),
                    items=[{'id': 'f0', 'name': 'flora/0|1|0|0/far', 'material': 'm0'}],
                    materials=[{'id': 'm0'}])
        _, iss = CGE.check_data_root(tmp)
        ok(any('lv=0 flora' in m for m in iss), 'catches forbidden lv=0 flora item in streamed place')
        _make_world(os.path.join(st, 'places', 'p0'),
                    items=[{'id': 'f0', 'name': 'flora/0|1|0|2/leaf', 'material': 'm0'}],
                    materials=[{'id': 'm0'}])

        # 14. Negative: backslash path in index.json
        idx['source'] = 'openworld\\test\\dist\\test.html'
        _write_json(os.path.join(st, 'index.json'), idx)
        _, iss = CGE.check_data_root(tmp)
        ok(any('backslash' in m for m in iss), 'catches Windows backslash path in index.json')
        idx['source'] = 'openworld/test/dist/test.html'
        _write_json(os.path.join(st, 'index.json'), idx)

        # 15 & 16. .gitattributes LFS check positive + negative
        good_attr = os.path.join(tmp, '.gitattributes.good')
        bad_attr = os.path.join(tmp, '.gitattributes.bad')
        with open(good_attr, 'w', encoding='utf-8') as f:
            f.write('godot/data/**/*.glb filter=lfs diff=lfs merge=lfs -text\ngodot/data/**/tex/*.webp filter=lfs diff=lfs merge=lfs -text\n')
        with open(bad_attr, 'w', encoding='utf-8') as f:
            f.write('*.html filter=lfs\n')
        ok(not CGE.check_gitattributes(good_attr), 'good .gitattributes passes')
        ok(len(CGE.check_gitattributes(bad_attr)) == 2, 'bad .gitattributes catches missing glb & webp LFS rules')

    if fails:
        print('FAILED  test_godot_exports (%d checks, %d failed)' % (checks, fails))
        return 1
    print('PASS  test_godot_exports (%d checks, 0 failed)' % checks)
    return 0


if __name__ == '__main__':
    sys.exit(main())
