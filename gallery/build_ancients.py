#!/usr/bin/env python3
"""Assemble the Ancients' own gallery in gallery/ancients-site/: the Ancients kit's pages (the city kits and the
arcologies) and the Ancient Port, published as their own artifact (gallery/README.md, "The Ancients and the Port").
Together they are too big for the Krator Worlds artifact, which links to this one from its index instead
(build_gallery.py, ELSEWHERE; index.template.html).

Usage:  python3 gallery/build_ancients.py [--build] [--out DIR]

--build rebuilds kits/ancients and settlements/port first; without it the pages in their dist/ are used as they are
(the Port's dist/ is not committed: build it once on a fresh clone). The pages are the ENTRIES lines of
build_gallery.py whose build is one of these two, with their names, blurbs and sections (Ancient city kits,
Arcologies, Ancient Port). Each kit loads its library maps from one shared sidecar (ancients.tex.ancients.js,
port.tex.port.js), which build_gallery.bundle() copies beside the pages once; a card's size counts the page and the
sidecars it loads. The index is the Krator Worlds template with its own header and a link back to Krator Worlds.
"""
import json, os, re, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_gallery as bg

BUILDS = ('kits/ancients', 'settlements/port')
OUT = os.path.join(bg.HERE, 'ancients-site')
WORLDS_URL = 'https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9'   # Krator Worlds (gallery/README.md)

LEDE = ('The works of the Ancients, the civilisation that settled Krator and fell more than a thousand years ago: their '
        'megastructures type by type, the arcologies (whole cities in one structure) and the modular Ancient Port, each '
        'intact, ruined and reclaimed. Each page generates its world in your browser with Three.js, so allow a few '
        'seconds. <strong>Drag to orbit, scroll to zoom;</strong> most pages have preset views and an inspector. A '
        'desktop browser is recommended.')

BACK = ('  <section class="scale" aria-labelledby="worlds-h">\n'
        '    <h2 id="worlds-h">Krator Worlds</h2>\n'
        '    <p>Every other settlement, building kit and biome built so far, and the scale model of the continent.\n'
        '    <a href="%s" target="_blank" rel="noopener">Open Krator Worlds &rarr;</a></p>\n'
        '  </section>\n' % WORLDS_URL)


def entries():
    """build_gallery.ENTRIES lines whose page one of BUILDS makes, in ENTRIES order (the index sorts each section)."""
    return [e for e in bg.ENTRIES if bg.build_dir(e[2]) in BUILDS]


def main():
    site = os.path.abspath(bg.arg('--out') or OUT)
    if '--build' in sys.argv:
        for d in BUILDS:
            r = subprocess.run([sys.executable, 'build.py'], cwd=os.path.join(bg.ROOT, d), capture_output=True, text=True)
            print(('built ' if r.returncode == 0 else 'BUILD FAILED ') + d)
            if r.returncode:
                sys.exit(r.stdout + r.stderr)
    if os.path.isdir(site):
        shutil.rmtree(site)
    worlds = os.path.join(site, 'worlds')
    os.makedirs(worlds)
    items = []
    for section, slug, path, name, blurb, *rest in sorted(entries(), key=lambda e: bg.alpha(e[3])):
        src = os.path.join(bg.ROOT, path)
        if not os.path.isfile(src):
            sys.exit('build_ancients.py: %s is not built (run with --build)' % path)
        html = bg.bundle(src, bg.THREE_CDN, worlds)
        with open(os.path.join(worlds, slug + '.html'), 'w', encoding='utf-8') as fh:
            fh.write(html)
        side = re.findall(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>', html)
        size = os.path.getsize(src) + sum(os.path.getsize(os.path.join(worlds, f)) for f in side)
        items.append({'section': section, 'slug': slug, 'name': name, 'blurb': blurb, 'mb': round(size / 1048576, 1),
                      'source': path, 'tag': rest[0] if rest else None})
    tpl = open(os.path.join(bg.HERE, 'index.template.html'), encoding='utf-8').read()
    page = tpl.replace('<title>Krator Worlds</title>', '<title>The Ancients and the Port</title>', 1)
    page = page.replace('<h1>Krator Worlds</h1>', '<h1>The Ancients</h1>', 1)
    page = re.sub(r'<p class="lede">.*?</p>', '<p class="lede">%s</p>' % LEDE, page, count=1, flags=re.S)
    page = re.sub(r'(  <section class="scale".*?</section>\n)+', lambda m: BACK, page, count=1, flags=re.S)
    page = (page.replace('/*ENTRIES*/[]', json.dumps(items, ensure_ascii=False))
                .replace('/*SECTIONS*/[]', '[]'))
    for want in ('The Ancients and the Port', 'Open Krator Worlds', '"section": "port"', '"section": "arcology"'):
        if want not in page:
            sys.exit('build_ancients.py: the template changed; "%s" did not go in' % want)
    with open(os.path.join(site, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(page)
    files = sorted(os.listdir(worlds))
    total = sum(os.path.getsize(os.path.join(worlds, f)) for f in files)
    big = [f for f in files if os.path.getsize(os.path.join(worlds, f)) >= 16 * 1000 * 1000]
    print('wrote %s/: %d pages, %d files in worlds/, %.1f MB%s' % (
        os.path.relpath(site, bg.ROOT), len(items), len(files), total / 1048576,
        '' if not big else '; OVER 16 MB A FILE: ' + ', '.join(big)))


if __name__ == '__main__':
    main()
