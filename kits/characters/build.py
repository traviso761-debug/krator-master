#!/usr/bin/env python3
"""Concatenate src/* into dist/barbarian.html: the Krator character kit demo.

Same shape as the other builds: numbered fragments, one <script>, a
build-manifest.json with a sha1 per fragment (identical hashes prove nothing
changed), and `node --check` on the concatenated JS when node is present.

Usage:  python3 build.py
"""
import hashlib, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = 'barbarian'


def main():
    order = sorted(f for f in os.listdir(SRC) if f[0].isdigit())
    bodies = {f: open(os.path.join(SRC, f), encoding='utf-8').read() for f in order}
    js = '\n'.join(bodies[f] for f in order if f.endswith('.js'))
    syntax = os.path.join(HERE, '.syntax-%s.js' % OUT)
    open(syntax, 'w', encoding='utf-8').write(js)
    try:
        subprocess.run(['node', '--check', syntax], check=True)
    except FileNotFoundError:
        print('node not found: syntax not checked')
    except subprocess.CalledProcessError:
        sys.exit('syntax error (see above)')
    html = ''.join(bodies[f] if f.endswith('.html') else '\n/* ---- %s ---- */\n%s\n' % (f, bodies[f])
                   for f in order)
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, OUT + '.html')
    open(out, 'w', encoding='utf-8').write(html)
    manifest = {f: hashlib.sha1(bodies[f].encode('utf-8')).hexdigest() for f in order}
    manifest['dist/%s.html' % OUT] = hashlib.sha1(html.encode('utf-8')).hexdigest()
    json.dump(manifest, open(os.path.join(HERE, 'build-manifest.json'), 'w'), indent=1, sort_keys=True)
    print('wrote %s (%d KB, %d fragments)' % (out, len(html) // 1024, len(order)))


if __name__ == '__main__':
    main()
