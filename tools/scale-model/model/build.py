#!/usr/bin/env python3
"""The Krator Scale Model page, built from `src/` (markup, style and script fragments) and `data/` (the `DATA` object:
rasters as PNG/JPEG, lists and objects as JSON, the key order and scalars in `data/model.json`).

    python3 tools/scale-model/model/build.py                  # writes dist/scale-model.html
    python3 tools/scale-model/model/build.py --check <page>   # and asserts it is byte-identical to <page>

<page> is a saved copy of the live artifact (the `read` action's file; the service's document skeleton is dropped
before comparing). Publish `dist/scale-model.html` to https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q. Deterministic:
the same src/ and data/ always give the same page. `smodel.page.load(<this folder's data/>)` reads the data an edit
works on, and `smodel.page.save_data` writes it back (../README.md).
"""
import base64, hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DATA_DIR = os.path.join(HERE, 'data')
OUT = os.path.join(HERE, 'dist', 'scale-model.html')
DATA_PREFIX = 'const DATA = '
# the page, in order; 'DATA' is the `const DATA = {...};` line, written from data/
ORDER = ['00-head.html', '10-panel.html', 'DATA', '20-decode.js', '21-scene.js', '22-temp-ramp.js', '23-wind.js',
         '24-temp-map.js', '25-zones.js', '26-overlay.js', '27-water.js', '30-vents.js', '31-orbit.js', '32-fly.js',
         '33-hover.js', '40-regions.js', '41-region-layers.js', '42-labels.js', '43-region-list.js',
         '44-region-draw.js', '45-region-status.js', '50-measure.js', '51-region-store.js', '60-settlements.js',
         '90-ui.js', '99-tail.html']


def strip_wrapper(text):
    """the page without the artifact service's document skeleton (everything before <title>, and </body></html>)"""
    if not text.startswith('<title>'):
        text = text[text.index('<title>'):]
    if text.endswith('</body></html>'):
        text = text[:-len('</body></html>')]
    return text


def write_json(path, v):
    """a list one record per line, an object indented: diffable, and read back to the same values"""
    if isinstance(v, list):
        s = '[\n' + ',\n'.join(json.dumps(x, ensure_ascii=False) for x in v) + '\n]\n' if v else '[]\n'
    else:
        s = json.dumps(v, ensure_ascii=False, indent=1) + '\n'
    open(path, 'w', encoding='utf-8', newline='\n').write(s)


def load_data(folder=DATA_DIR):
    """DATA as the page holds it: rasters as base64 strings, in the page's key order"""
    D = {}
    for o in json.load(open(os.path.join(folder, 'model.json'), encoding='utf-8'))['keys']:
        if 'value' in o:
            D[o['key']] = o['value']
        elif o['file'].endswith('.json'):
            D[o['key']] = json.load(open(os.path.join(folder, o['file']), encoding='utf-8'))
        else:
            D[o['key']] = base64.b64encode(open(os.path.join(folder, o['file']), 'rb').read()).decode()
    return D


def page(D):
    parts = []
    for name in ORDER:
        if name == 'DATA':
            parts.append(DATA_PREFIX + json.dumps(D) + ';\n')
        else:
            parts.append(open(os.path.join(SRC, name), encoding='utf-8', newline='').read())
    return ''.join(parts)


def split(D, cap=12_000_000):
    """the page with DATA in side files, for the artifact's 16 MB page cap (5.1's page is 20.8 MB). The page keeps
    `const DATA = {}` where the DATA line was, closes its script, loads data-1.js, data-2.js... (each
    `Object.assign(DATA, {...});`, at most `cap` bytes, in the page's key order) as classic scripts, and reopens
    its script: the decode code after it reads DATA as before. Returns (page, [(name, text), ...])"""
    files, cur, size = [], {}, 0
    for k, v in D.items():
        n = len(json.dumps(v))
        if cur and size + n > cap:
            files.append(cur); cur, size = {}, 0
        cur[k] = v; size += n
    if cur:
        files.append(cur)
    names = ['data-%d.js' % (i + 1) for i in range(len(files))]
    tags = ''.join('<script src="%s"></script>\n' % nm for nm in names)
    parts = []
    for name in ORDER:
        if name == 'DATA':
            parts.append(DATA_PREFIX + '{};\n</script>\n' + tags + '<script>\n')
        else:
            parts.append(open(os.path.join(SRC, name), encoding='utf-8', newline='').read())
    return ''.join(parts), [(nm, 'Object.assign(DATA, ' + json.dumps(f) + ');\n') for nm, f in zip(names, files)]


def main():
    if '--split' in sys.argv:
        """python3 build.py --split: dist/split/index.html and its data-N.js, the copy to publish (files beside the page)"""
        html, files = split(load_data())
        out = os.path.join(os.path.dirname(OUT), 'split')
        os.makedirs(out, exist_ok=True)
        for nm, text in [('index.html', html)] + files:
            open(os.path.join(out, nm), 'w', encoding='utf-8', newline='').write(text)
            print('%s  %d bytes' % (os.path.relpath(os.path.join(out, nm)).replace(os.sep, '/'), len(text.encode('utf-8'))))
        return
    html = page(load_data())
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8', newline='').write(html)
    print('%s  %d bytes  sha256 %s' % (os.path.relpath(OUT).replace(os.sep, '/'), len(html.encode('utf-8')),
                                        hashlib.sha256(html.encode('utf-8')).hexdigest()[:16]))
    if '--check' in sys.argv:
        live = strip_wrapper(open(sys.argv[sys.argv.index('--check') + 1], encoding='utf-8', newline='').read())
        if live != html:
            n = next((i for i, (a, b) in enumerate(zip(live, html)) if a != b), min(len(live), len(html)))
            sys.exit('DIFFERS from the page at character %d: %r vs %r' % (n, live[n - 40:n + 40], html[n - 40:n + 40]))
        print('identical to %s (skeleton dropped)' % sys.argv[sys.argv.index('--check') + 1])


if __name__ == '__main__':
    main()
