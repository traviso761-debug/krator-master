#!/usr/bin/env python3
"""Assemble the Throne's own gallery in gallery/throne-site/: the biome kit's eleven stations, published as their own
artifact (gallery/README.md, "The Throne"). Together they are too big for the Krator Worlds artifact, which links to
this one from its index instead (build_gallery.py, ELSEWHERE).

Usage:  python3 gallery/build_throne.py [--build] [--out DIR]

--build rebuilds the eleven stations first (biomes/throne/build.py, then --station <name> for each); without it the
committed pages in biomes/throne/dist/ are used as they are. The pages load their library maps from shared sidecars
(throne.tex.throne.js; throne.tex.hyperjungle.js for the kipuka and the spice frontier), which build_gallery.bundle()
copies beside them once. The index is the Krator Worlds template with the Throne's own header, a link back to Krator
Worlds, and one card per station in station order; a card's size counts the page and the sidecars it loads.
"""
import json, os, re, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_gallery as bg

THRONE = os.path.join(bg.ROOT, 'biomes', 'throne')
OUT = os.path.join(bg.HERE, 'throne-site')
WORLDS_URL = 'https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9'   # Krator Worlds (gallery/README.md)

# station 1 builds from src/ alone and has no station.json: its line, in the stations' own form
STATION_ONE = ('throne.html', "The plume's edge (station 1): the south-east shoulder where the plume's edge crosses a "
               "rift of five vents, eight lava flows from 2 to 5,200 years old, a pit crater's acid lake, hot pools and "
               "bone bells in the steam; Krator's own life glows at night")

LEDE = ('Eleven stations on the Throne, the volcano at the heart of Krator, each a 6 km piece of one biome kit: rain '
        'forest and kipuka, a spice frontier, a geyser isle, cloud forest, savanna, ash desert, vent country, a glacier, '
        'the caldera rim and a lava tube. Each page generates its world in your browser with Three.js, so allow a few '
        'seconds. <strong>Drag to orbit, scroll to zoom;</strong> every station has preset views, an inspector and night '
        '(N). A desktop browser is recommended.')

BACK = ('  <section class="scale" aria-labelledby="worlds-h">\n'
        '    <h2 id="worlds-h">Krator Worlds</h2>\n'
        '    <p>Every other settlement, building kit and biome built so far, and the scale model of the continent.\n'
        '    <a href="%s" target="_blank" rel="noopener">Open Krator Worlds &rarr;</a></p>\n'
        '  </section>\n' % WORLDS_URL)

SECTION = {'key': 'throne', 'id': 'stations', 'title': 'The stations',
           'note': 'In station order: from the plume\'s edge on the south-east shoulder round the windward flank, '
                   'the isles and the summit, down into a lava tube.', 'after': 'port'}


def stations():
    """[(number, page, name, blurb)] for every station, station 1 first: from each station.json's one line
    ("The kipuka (station 2): islands of old hyperjungle ...")."""
    lines = [STATION_ONE]
    for d in sorted(os.listdir(os.path.join(THRONE, 'stations'))):
        sj = os.path.join(THRONE, 'stations', d, 'station.json')
        if os.path.isfile(sj):
            s = json.load(open(sj, encoding='utf-8'))
            lines.append((s['out'], s['name']))
    out = []
    for page, line in lines:
        m = re.match(r'(.*?) \(station (\d+)\):\s*(.*)', line)
        if not m:
            sys.exit('build_throne.py: a station line without "(station N):": %s' % line)
        name, n, blurb = m.group(1), int(m.group(2)), m.group(3)
        out.append((n, page, name, bg.cap(blurb) + '.'))
    return sorted(out)


def main():
    site = os.path.abspath(bg.arg('--out') or OUT)
    st = stations()
    if '--build' in sys.argv:
        for n, page, _, _ in st:
            stn = [] if page == STATION_ONE[0] else ['--station', next(
                d for d in os.listdir(os.path.join(THRONE, 'stations'))
                if json.load(open(os.path.join(THRONE, 'stations', d, 'station.json'), encoding='utf-8'))['out'] == page)]
            r = subprocess.run([sys.executable, 'build.py'] + stn, cwd=THRONE, capture_output=True, text=True)
            print(('built ' if r.returncode == 0 else 'BUILD FAILED ') + page)
            if r.returncode:
                sys.exit(r.stdout + r.stderr)
    if os.path.isdir(site):
        shutil.rmtree(site)
    worlds = os.path.join(site, 'worlds')
    os.makedirs(worlds)
    items = []
    for n, page, name, blurb in st:
        src = os.path.join(THRONE, 'dist', page)
        if not os.path.isfile(src):
            sys.exit('build_throne.py: %s is not built (run with --build)' % os.path.relpath(src, bg.ROOT))
        html = bg.bundle(src, bg.THREE_CDN, worlds)
        slug = os.path.splitext(page)[0]
        with open(os.path.join(worlds, page), 'w', encoding='utf-8') as fh:
            fh.write(html)
        side = re.findall(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>', html)
        size = os.path.getsize(src) + sum(os.path.getsize(os.path.join(worlds, f)) for f in side)
        items.append({'section': 'throne', 'slug': slug, 'name': name, 'blurb': blurb, 'mb': round(size / 1048576, 1),
                      'source': os.path.relpath(src, bg.ROOT).replace(os.sep, '/'), 'tag': None})
    tpl = open(os.path.join(bg.HERE, 'index.template.html'), encoding='utf-8').read()
    page = tpl.replace('<title>Krator Worlds</title>', '<title>The Throne Stations</title>', 1)
    page = page.replace('<h1>Krator Worlds</h1>', '<h1>The Throne</h1>', 1)
    page = re.sub(r'<p class="lede">.*?</p>', '<p class="lede">%s</p>' % LEDE, page, count=1, flags=re.S)
    page = re.sub(r'  <section class="scale".*?</section>\n', lambda m: BACK, page, count=1, flags=re.S)
    page = (page.replace('/*ENTRIES*/[]', json.dumps(items, ensure_ascii=False))
                .replace('/*SECTIONS*/[]', json.dumps([SECTION], ensure_ascii=False).replace('</', '<\\/')))
    for want in ('The Throne Stations', 'Open Krator Worlds', '"section": "throne"'):
        if want not in page:
            sys.exit('build_throne.py: the template changed; "%s" did not go in' % want)
    with open(os.path.join(site, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(page)
    files = sorted(os.listdir(worlds))
    total = sum(os.path.getsize(os.path.join(worlds, f)) for f in files)
    big = [f for f in files if os.path.getsize(os.path.join(worlds, f)) >= 16 * 1000 * 1000]
    print('wrote %s/: %d stations, %d files in worlds/, %.1f MB%s' % (
        os.path.relpath(site, bg.ROOT), len(items), len(files), total / 1048576,
        '' if not big else '; OVER 16 MB A FILE: ' + ', '.join(big)))


if __name__ == '__main__':
    main()
