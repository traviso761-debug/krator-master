#!/usr/bin/env python3
"""A page of chosen models: python3 rig/showcase.py <out.html> <credits> <model or family>...

Inlines the catalog and the runtime into rig/showcase.html, and writes the named models/*.json to models.js beside it (three.js from cdnjs).
Each animal is drawn by the kit's real build, so what the page shows is what a world gets. The page lists every catalog variant whose model it holds.
"""
import base64, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)


def main():
    args = sys.argv[1:]; skin = None
    if '--skin' in args:      # a skinned trial shown beside the catalog: its GLB, measured in skin_view
        i = args.index('--skin'); skin = json.load(open(args[i + 1], encoding='utf-8')); del args[i:i + 2]
        skin['glb'] = base64.b64encode(open(skin.pop('path'), 'rb').read()).decode('ascii')
    out, credits, names = args[0], args[1], args[2:]
    models, size = {}, 0
    for n in names:
        p = os.path.join(KIT, 'models', n + '.json'); size += os.path.getsize(p)
        models[n] = json.load(open(p, encoding='utf-8'))
    specs = sorted(f for f in os.listdir(KIT) if f.startswith('krator-fauna-') and f.endswith('.js') and f != 'krator-fauna-runtime.js')
    body = '\n'.join(open(os.path.join(KIT, f), encoding='utf-8').read() for f in ['fauna-core.js'] + specs + ['krator-fauna-runtime.js'])
    assert '</script' not in body
    page = open(os.path.join(HERE, 'showcase.html'), encoding='utf-8').read()
    notes = {'mb': '%.1f' % (size / 1e6), 'credits': credits}      # the credits are the caller's count: a run may spend on models that were not kept
    page = page.replace('/*BUNDLE*/', body)
    with open(out, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(page)
    data = os.path.join(os.path.dirname(os.path.abspath(out)), 'models.js')      # beside the page, which alone would pass the 16 MB a page may be
    with open(data, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('window.__MODELS=%s;window.__NOTES=%s;window.__SKIN=%s;\n' % (json.dumps(models, separators=(',', ':')), json.dumps(notes), json.dumps(skin)))
    print('%s: %.1f MB, models.js %.1f MB' % (out, os.path.getsize(out) / 1e6, os.path.getsize(data) / 1e6))


if __name__ == '__main__':
    main()
