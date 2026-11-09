#!/usr/bin/env python3
"""Stage the open world for the Artifact service: the page (dist/little-demo.artifact.html) and each town tile as
base64 text in parts of under 15 MB (the service serves no binary type and caps a file at 16 MB):
towns/<name>.ktile.<i>.txt, which 88-world-towns.js joins when the plain tile is not there.

  python3 publish.py <staging dir>     # then publish <staging dir>/little-demo.artifact.html with its towns/*.txt
"""
import base64, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PART = 15 * 1000 * 1000


def main(out):
    os.makedirs(os.path.join(out, 'towns'), exist_ok=True)
    shutil.copy2(os.path.join(HERE, 'dist', 'little-demo.artifact.html'), out)
    files = []
    tiles = os.path.join(HERE, 'dist', 'towns')
    for fn in sorted(os.listdir(tiles)):
        if not fn.endswith('.ktile'):
            continue
        text = base64.b64encode(open(os.path.join(tiles, fn), 'rb').read()).decode('ascii')
        for i in range(0, len(text), PART):
            name = 'towns/%s.%d.txt' % (fn, i // PART)
            open(os.path.join(out, name), 'w', encoding='ascii').write(text[i:i + PART])
            files.append(name)
    for f in files:
        print(f, os.path.getsize(os.path.join(out, f)) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1])
