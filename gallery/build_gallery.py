#!/usr/bin/env python3
"""Assemble the shareable gallery in gallery/site/.

Rebuilds every world listed below (unless --no-build), copies each built page
to gallery/site/worlds/<slug>.html, and writes gallery/site/index.html from
index.template.html. Claude then publishes gallery/site/ as the Artifact named
in gallery/README.md.

Usage:  python3 gallery/build_gallery.py [--no-build]
"""
import html, json, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, 'gallery')
SITE = os.path.join(HERE, 'site')

# (section, slug, built file, name, one line)
ENTRIES = [
    ('world', 'voth', 'settlements/voth/voth.html', 'Voth',
     'A city of cantons on an enclosed brackish bay, with barges, ferries, monks and ordinators on the move.'),
    ('world', 'yuni', 'settlements/yuni/yuni.html', 'Yuni',
     'Rich, middle and poor quarters on canals, with an underground and an Ancients quarter.'),
    ('world', 'dalab', 'settlements/dalab/dist/dalab.html', 'Dalab',
     'The mound settlement of the southwestern lowlands, under sprawl oaks.'),
    ('world', 'roketstad', 'settlements/highlands/dist/roketstad.html', 'Roketstad',
     'The Republic\'s highland town, with the Hall of the Republic and the shipbreakers\' yards.'),
    ('world', 'iziz', 'settlements/iziz/dist/iziz.html', 'Iziz',
     'Settler streets in the Iziz Vernacular around reclaimed Ancient towers.'),
    ('world', 'reedlake', 'settlements/reedlake/dist/reedlake-village.html', 'Reed Lake',
     'A floating village of reed islands and moored boats.'),
    ('world', 'hexahedron', 'settlements/screamers/dist/screamers.html', 'Hexahedron',
     'The Screamers\' tribal village in and under a ruined arcology.'),
    ('world', 'locus', 'settlements/locus/locus.html', 'Locus',
     'A petroleum and power town at the edge of the eastern abyss.'),
    ('world', 'erewhon', 'settlements/xanadu/dist/erewhon.html', 'Erewhon',
     'The Pearl of Xanadu: a gilded valley city stepping up the hillsides, on the terrain of Travis\'s map.'),
    ('world', 'girder', 'settlements/girder/girder.html', 'Girder',
     'An outlying Beast Rider village in the central-crater hyperjungle.'),
    ('world', 'mavs-refuge', 'settlements/mavs-refuge/mavs-refuge.html', "Mav's Refuge",
     'A refuge in the hypertropic jungle on the lee shore of the Ring Sea.'),

    ('kit', 'ancients-kit', 'kits/ancients/dist/ancients-kit.html', 'Ancients',
     'Ruined megastructures of the ancient civilisation: 33 structure types at every level of decay.'),
    ('kit', 'ancients-worn', 'kits/ancients/dist/worn.html', 'Ancients, worn',
     'Every Ancients type intact beside its worn twin: whole, rust-streaked, the white skin tarnished.'),
    ('kit', 'yuni-kit', 'settlements/yuni/yuni-assets.html', 'Yuni buildings', 'Every Yuni building type, laid out as a sheet.'),
    ('kit', 'yuni-furniture', 'settlements/yuni/yuni-furniture.html', 'Yuni furniture', 'The furniture catalogue, tagged by culture.'),
    ('kit', 'yuni-plants', 'settlements/yuni/yuni-plants.html', 'Yuni plants', 'The plants of Yuni\'s gardens and terraces.'),
    ('kit', 'dalab-set', 'settlements/dalab/dist/dalab-set.html', 'Dalab buildings', 'Dwellings, trade, civic, sacred and ranch buildings.'),
    ('kit', 'highlands-kit', 'settlements/highlands/dist/highlands.html', 'Highlands buildings', 'Republican, Rustic and Tribal building sets.'),
    ('kit', 'xanadu-kit', 'settlements/xanadu/dist/xanadu.html', 'Xanadu buildings',
     'Tibetan massing with Indian, Turkish and Persian detail: the whole kit in rows by family.'),
    ('kit', 'iziz-vernacular', 'settlements/iziz/dist/iziz-vernacular.html', 'Iziz Vernacular', 'The vernacular style: dwellings, trade, civic, guilds.'),
    ('kit', 'reedlake-kit', 'settlements/reedlake/dist/reedlake.html', 'Reed Lake buildings', 'Dwellings, workshops, farms and islands.'),
    ('kit', 'screamers-furniture', 'settlements/screamers/dist/furniture.html', 'Screamer furniture', 'The Screamers\' furniture set.'),
    ('kit', 'locus-kit', 'settlements/locus/locus-kit.html', 'Locus buildings', 'Dwellings, farm, infrastructure, petroleum and power.'),

    ('biome', 'hyperjungle', 'biomes/hyperjungle/dist/hyperjungle.html', 'Central hyperjungle', 'Six hypertree species, understorey, epiphyte gardens, fauna.'),
    ('biome', 'eastabyss', 'biomes/eastabyss/dist/eastabyss.html', 'Eastern abyss', 'Salt lake, flats and marsh, coal-swamp jungle, mat reed beds.'),
    ('biome', 'sedesert', 'biomes/sedesert/dist/sedesert.html', 'Eastern high desert', 'Socotran flora, mesas, hoodoos, a canyon ending in a cataract.'),
    ('biome', 'rift', 'biomes/rift/dist/rift.html', 'The Rift', 'An algal salt lake, abyssal jungle, cloud forest on the mesas.'),
    ('biome', 'swbay', 'biomes/swbay/dist/swbay.html', 'Southwest bay', 'Bay hyperjungle, parasol savannah, the volcano, stepped cataracts.'),
    ('biome', 'swlowlands', 'biomes/swlowlands/dist/swlowlands.html', 'Southwestern lowlands', 'Sprawl oaks, an oak avenue, cork grove, crown-flowering trees.'),
    ('biome', 'nwlowlands', 'biomes/nwlowlands/dist/nwlowlands.html', 'Northwestern lowlands', 'Lake shore, Mediterranean foothills, bamboo groves, glow-willows.'),
    ('biome', 'xanadu', 'biomes/xanadu/dist/xanadu.html', 'Xanadu', 'An enclosed mountain lake and a sacred river; ornamental wildwood.'),
]


def main():
    if '--no-build' not in sys.argv:
        dirs = []
        for _, _, path, _, _ in ENTRIES:
            d = os.path.dirname(path)
            d = os.path.dirname(d) if os.path.basename(d) == 'dist' else d
            if d not in dirs:
                dirs.append(d)
        for d in dirs:
            r = subprocess.run([sys.executable, 'build.py'], cwd=os.path.join(ROOT, d),
                               capture_output=True, text=True)
            print('built' if r.returncode == 0 else 'BUILD FAILED', d)
            if r.returncode:
                sys.exit(r.stdout + r.stderr)
    if os.path.isdir(SITE):
        shutil.rmtree(SITE)
    os.makedirs(os.path.join(SITE, 'worlds'))
    items = []
    for section, slug, path, name, blurb in ENTRIES:
        src = os.path.join(ROOT, path)
        shutil.copyfile(src, os.path.join(SITE, 'worlds', slug + '.html'))
        items.append({'section': section, 'slug': slug, 'name': name, 'blurb': blurb,
                      'mb': round(os.path.getsize(src) / 1048576, 1), 'source': path})
    tpl = open(os.path.join(HERE, 'index.template.html'), encoding='utf-8').read()
    page = tpl.replace('/*ENTRIES*/[]', json.dumps(items, ensure_ascii=False))
    with open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(page)
    total = sum(os.path.getsize(os.path.join(SITE, 'worlds', i['slug'] + '.html')) for i in items)
    print('wrote gallery/site/: %d pages, %.1f MB' % (len(items), total / 1048576))


if __name__ == '__main__':
    main()
