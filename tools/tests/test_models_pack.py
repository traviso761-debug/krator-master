#!/usr/bin/env python3
"""models_pack.py refuses a mesh of two primitives: it reads one, and the other would vanish without a word."""
import json, os, struct, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PACK = os.path.join(ROOT, 'kits', 'fauna', 'models_pack.py')


def glb(path, prims):
    js = json.dumps({'nodes': [{'name': 'part', 'mesh': 0}], 'meshes': [{'primitives': [{} for _ in range(prims)]}]}).encode()
    js += b' ' * (-len(js) % 4)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', 0, 0x004E4942))


def run(prims):
    with tempfile.TemporaryDirectory() as d:
        g = os.path.join(d, 'x.glb'); glb(g, prims)
        return subprocess.run([sys.executable, PACK, g, os.path.join(d, 'x.json'), '--key', 'x', '--group', 'x', '--scale', '1'], capture_output=True, text=True, encoding='utf-8')


two, one = run(2), run(1)
REFUSED = 'a part is one primitive'
assert two.returncode != 0 and REFUSED in two.stderr, 'two primitives were not refused: ' + two.stderr[-300:]
assert REFUSED not in one.stderr, 'the negative: one primitive passes that check: ' + one.stderr[-300:]
print('ok: two primitives refused, one passes')
