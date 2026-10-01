#!/usr/bin/env python3
"""Assemble the shareable gallery in gallery/site/.

Rebuilds every world listed below (unless --no-build), copies each built page
to gallery/site/worlds/<slug>.html, and writes gallery/site/index.html from
index.template.html. Claude then publishes gallery/site/ as the Artifact named
in gallery/README.md.

Usage:  python3 gallery/build_gallery.py [--no-build] [--out DIR --local-three URL]

--out DIR writes the site somewhere else (host/sitectl writes host/site/), and --local-three URL points every page
at that copy of three.js instead of cdnjs and puts the copy in DIR/worlds/, so the LAN server needs no internet.
"""
import html, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, 'gallery')
SITE = os.path.join(HERE, 'site')

# (section, slug, built file, name, one line[, tag])
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

    ('kit', 'post-apoc-kit', 'kits/post-apoc/dist/post-apoc.html', 'Post-Apoc set',
     'Reclaimed-and-recycled buildings (containers, silos, tanks, buses, tyre and bottle walls) with sockets for any culture\'s marks: switch between Generic, Iziz, Voth and Republic.'),
    ('kit', 'ancients-kit', 'kits/ancients/dist/ancients-kit.html', 'Ancients',
     'Ruined megastructures of the ancient civilisation: 33 structure types at every level of decay.'),
    ('kit', 'ancients-worn', 'kits/ancients/dist/worn.html', 'Ancients, worn',
     'Every Ancients type intact beside its worn twin: whole, rust-streaked, the white skin tarnished.'),
    ('kit', 'ancient-iziz-style', 'kits/ancients/dist/iziz-style.html', 'Ancient Iziz Style',
     'The Iziz building families built the Ancient way, each intact, destroyed and rehabilitated, with the Iziz variants: cut-out apartments, offices and houses, towers on small plinths, and the tripod market.'),
    ('kit', 'ancient-engines', 'kits/ancients/dist/engines.html', 'The Engines',
     'Ten ruined cyclopean machines of unclear purpose on a red plain: the Harrow, Strider, Breech, Gyre, Press, Sleeper, Carapace, Retorts, Needle and Ram.', 'new'),
    # objects: things you place in a world rather than build in it (furniture, plants, watercraft)
    ('objects', 'ringsea-craft', 'kits/ringsea/dist/ringsea.html', 'Ring Sea watercraft',
     'Twenty-one vessels of the Ring Sea at anchor, warships and cargo ships: Hykkousoi triremes and a siege hexareme, the Voth Ordinator flagship, Iziz turtle and wheel ships, the Xanadu swan barge, canoes, outriggers and rafts.', 'new'),
    ('objects', 'yuni-furniture', 'settlements/yuni/yuni-furniture.html', 'Yuni furniture', 'The furniture catalogue, tagged by culture.'),
    ('objects', 'yuni-plants', 'settlements/yuni/yuni-plants.html', 'Yuni plants', 'The plants of Yuni\'s gardens and terraces.'),
    ('kit', 'voth-catalog', 'settlements/voth/catalog/index.html', 'Voth buildings',
     'Every Voth building on one walkable sheet: the structures the city builds, housing, manors, shops, taverns, warehouses, civic and military sets, with automatic LOD.'),
    ('kit', 'yuni-kit', 'settlements/yuni/yuni-assets.html', 'Yuni buildings', 'Every Yuni building type, laid out as a sheet.'),
    ('kit', 'dalab-set', 'settlements/dalab/dist/dalab-set.html', 'Dalab buildings', 'Dwellings, trade, civic, sacred and ranch buildings.'),
    ('kit', 'highlands-kit', 'settlements/highlands/dist/highlands.html', 'Highlands buildings', 'Republican, Rustic and Tribal building sets.'),
    ('kit', 'xanadu-kit', 'settlements/xanadu/dist/xanadu.html', 'Xanadu buildings',
     'Tibetan massing with Indian, Turkish and Persian detail: the whole kit in rows by family.'),
    ('kit', 'iziz-vernacular', 'settlements/iziz/dist/iziz-vernacular.html', 'Iziz Vernacular', 'The vernacular style: dwellings, trade, civic, guilds.'),
    ('kit', 'reedlake-kit', 'settlements/reedlake/dist/reedlake.html', 'Reed Lake buildings', 'Dwellings, workshops, farms and islands.'),
    ('kit', 'screamers-furniture', 'settlements/screamers/dist/furniture.html', 'Screamer furniture', 'The Screamers\' furniture set.'),
    ('kit', 'locus-kit', 'settlements/locus/locus-kit.html', 'Locus buildings', 'Dwellings, farm, infrastructure, petroleum and power.'),
    ('kit', 'abyss-kit', 'settlements/locus/abyss-kit.html', 'Eastern Abyssal buildings', 'The abyssal-desert city: salvage and stilt housing, shops, inn and tavern, caravanserai, cone-shell library, temple of the altar, the Headman\'s palace, walls and citadel, granary and windpump.'),

    # Arcologies: each its own kit target. 'new' marks this month's group (QA group arcC).
    ('arcology', 'arc-theodiga', 'kits/ancients/dist/theodiga.html', 'Theodiga',
     "Soleri's dam arcology: a city in the wall of a dam, the heaviest single structure in the kit.", 'earlier'),
    ('arcology', 'arc-veladiga', 'kits/ancients/dist/veladiga.html', 'Veladiga',
     "Soleri's other dam arcology, intact and breached.", 'earlier'),
    ('arcology', 'arc-hexahedron', 'kits/ancients/dist/hexahedron.html', 'Hexahedron',
     "Soleri's double pyramid, intact and sheared open.", 'earlier'),
    ('arcology', 'arc-forest', 'kits/ancients/dist/forest.html', 'Forest Tower',
     'Six columns carrying five planted toruses staggered up a hexagon.', 'earlier'),
    ('arcology', 'arc-ring', 'kits/ancients/dist/ring.html', 'Forest Ring',
     'The barrel arcology: one bulging tree-covered drum.', 'earlier'),
    ('arcology', 'arc-darco', 'kits/ancients/dist/darco.html', 'Darco Arcology',
     'The swept horn, intact and with the horn brought down.', 'earlier'),
    ('arcology', 'arc-launch', 'kits/ancients/dist/launch.html', 'Launch Arcology',
     'The city that meant to leave, intact and after it came back down.', 'earlier'),
    ('arcology', 'arc-plymouth', 'kits/ancients/dist/plymouth.html', 'Plymouth Arcology',
     'A residential mountain, stepped on a chamfered plan 732 by 524 m.', 'earlier'),
    ('arcology', 'arc-hill', 'kits/ancients/dist/hill.html', 'The Hill Arcology',
     'A city built into a slope: 111 garden terraces climbing sinuously.', 'earlier'),
    ('arcology', 'arc-arcoindian', 'kits/ancients/dist/arcoindian.html', 'Arcoindian I',
     'Three round towers on terraces in an overhang bitten out of a cliff.', 'earlier'),
    ('arcology', 'arc-arcoindian2', 'kits/ancients/dist/arcoindian2.html', 'Arcoindian II',
     'The half-cave: a city in a deep shelf on a canyon wall.', 'earlier'),
    ('arcology', 'arc-arcbeam', 'kits/ancients/dist/arcbeam.html', 'Arcbeam',
     'The bridge city across a 3.4 km gorge.', 'earlier'),
    ('arcology', 'arc-canyon', 'kits/ancients/dist/canyon.html', 'The Span',
     'Cross-canyon pipe works and everything hung beneath them.', 'earlier'),
    ('arcology', 'arc-spire', 'kits/ancients/dist/spire.html', 'Vashtir',
     'The recursive spire: a pale pyramid-mountain of self-similar towers.', 'earlier'),
    ('arcology', 'arc-arcube', 'kits/ancients/dist/arcube.html', 'Arcube',
     "Soleri's kilometre cube, stood on a horizontal diagonal.", 'new'),
    ('arcology', 'arc-wing', 'kits/ancients/dist/wing.html', 'The Wing',
     'A monument that is also a city: a coffered drum in a yoke with two stacked wings.', 'new'),
    ('arcology', 'arc-drum', 'kits/ancients/dist/drum.html', 'The Drum',
     'An 836 m round tower of radial fins and stacked dwelling blocks.', 'new'),
    ('arcology', 'arc-blades', 'kits/ancients/dist/blades.html', 'The Blades',
     'Six inhabited concrete slabs round a covered plaza, curling out like a flame.', 'new'),
    ('arcology', 'arc-trigon', 'kits/ancients/dist/trigon.html', 'Trigon',
     'A pyramid on an equilateral base, three times as tall as it is wide.', 'new'),
    ('arcology', 'arc-monolith', 'kits/ancients/dist/monolith.html', 'The Monolith',
     'A slab arcology with a through-arch at its foot and three oculi.', 'new'),
    ('arcology', 'arc-crescent', 'kits/ancients/dist/crescent.html', 'The Crescent',
     'A terraced moon 1 112 m tall, standing on its lower horn.', 'new'),
    ('arcology', 'arc-ledge', 'kits/ancients/dist/ledge.html', 'The Ledge',
     'Terraced slab layers cantilevered off a sandstone cliff.', 'new'),
    ('arcology', 'arc-wheel', 'kits/ancients/dist/wheel.html', 'The Wheel',
     'A raised ring of parkland on eight towers.', 'new'),

    # The Krator Ancient Port (settlements/port): every target, showcase first.
    ('port', 'port-showcase', 'settlements/port/dist/showcase.html', 'Showcase',
     'Every port segment in one continuous run per decay: intact, ruined and reclaimed, with natural coast between.'),
    ('port', 'port-segment', 'settlements/port/dist/segment.html', 'Pier',
     'The pier segment on its own, in every decay.'),
    ('port', 'port-cgBox', 'settlements/port/dist/cgBox.html', 'Container yard',
     'Container stacks worked by straddle carriers.'),
    ('port', 'port-cgCrane', 'settlements/port/dist/cgCrane.html', 'Container cranes',
     'A quay of ship-to-shore container cranes.'),
    ('port', 'port-cgStore', 'settlements/port/dist/cgStore.html', 'Silo battery',
     'Bulk storage: a battery of silos on the quay.'),
    ('port', 'port-ddDock', 'settlements/port/dist/ddDock.html', 'Dry dock',
     'A graving dock under a travelling gantry crane.'),
    ('port', 'port-ddShed', 'settlements/port/dist/ddShed.html', 'Covered graving dock',
     'A dry dock under its long shed.'),
    ('port', 'port-ddYard', 'settlements/port/dist/ddYard.html', 'Slipway',
     'A shipbuilding slipway and its yard.'),
    ('port', 'port-tmShip', 'settlements/port/dist/tmShip.html', 'Ship terminal',
     'The cargo terminal and its control tower.'),
    ('port', 'port-tmPass', 'settlements/port/dist/tmPass.html', 'Liner berth',
     'A passenger terminal with its liner berth platform.'),
    ('port', 'port-tmHeli', 'settlements/port/dist/tmHeli.html', 'Heliport',
     'A heliport reached by a raised walkway.'),
    ('port', 'port-hbFish', 'settlements/port/dist/hbFish.html', 'Fishing harbour',
     'The fishing harbour, each decay between plain quays.'),
    ('port', 'port-hbMarina', 'settlements/port/dist/hbMarina.html', 'Marina',
     'The marina, each decay between plain quays.'),
    ('port', 'port-hbHaven', 'settlements/port/dist/hbHaven.html', 'Haven and lighthouse',
     'The haven with its lighthouse.'),
    ('port', 'port-slCarrier', 'settlements/port/dist/slCarrier.html', 'Drone carrier berth',
     'The naval berth with its drone carrier, down to the reclaimed carrier.'),
    ('port', 'port-slSub', 'settlements/port/dist/slSub.html', 'Submarine berth',
     'A submarine at its berth.'),
    ('port', 'port-slBerth', 'settlements/port/dist/slBerth.html', 'Naval berth',
     'A naval berth with its fallen portal crane.'),
    ('port', 'port-slPen', 'settlements/port/dist/slPen.html', 'Submarine pen',
     'A hardened submarine pen.'),
    ('port', 'port-vsFeeder', 'settlements/port/dist/vsFeeder.html', 'Container feeder',
     'The smallest container ship: intact, ruined and reclaimed, moored off three quays.'),
    ('port', 'port-vsPanamax', 'settlements/port/dist/vsPanamax.html', 'Panamax ship',
     'A Panamax container ship: intact, ruined and reclaimed.'),
    ('port', 'port-vsGiant', 'settlements/port/dist/vsGiant.html', 'Ultra-large container ship',
     'The largest vessel: intact, ruined and reclaimed.'),
    ('port', 'port-edges', 'settlements/port/dist/edges.html', 'Pier edges',
     'Test sheet: the pier against every kind of side it can meet.'),
    ('port', 'port-cgEdges', 'settlements/port/dist/cgEdges.html', 'Silo battery edges',
     'Test sheet: the silo battery against every kind of side.'),
    ('port', 'port-tmEdges', 'settlements/port/dist/tmEdges.html', 'Liner berth edges',
     'Test sheet: the liner berth against every kind of side.'),
    ('port', 'port-hbEdges', 'settlements/port/dist/hbEdges.html', 'Harbour edges',
     'Test sheet: the small-craft harbours against every kind of side.'),

    ('biome', 'hyperjungle', 'biomes/hyperjungle/dist/hyperjungle.html', 'Central hyperjungle', 'Six hypertree species, understorey, epiphyte gardens, fauna.'),
    ('biome', 'eastabyss', 'biomes/eastabyss/dist/eastabyss.html', 'Eastern abyss', 'Salt lake, flats and marsh, coal-swamp jungle, mat reed beds.'),
    ('biome', 'sedesert', 'biomes/sedesert/dist/sedesert.html', 'Eastern high desert', 'Socotran flora, mesas, hoodoos, a canyon ending in a cataract.'),
    ('biome', 'rift', 'biomes/rift/dist/rift.html', 'The Rift', 'An algal salt lake, abyssal jungle, cloud forest on the mesas.'),
    ('biome', 'swbay', 'biomes/swbay/dist/swbay.html', 'Southwest bay', 'Bay hyperjungle, parasol savannah, the volcano, stepped cataracts.'),
    ('biome', 'swlowlands', 'biomes/swlowlands/dist/swlowlands.html', 'Southwestern lowlands', 'Sprawl oaks, an oak avenue, cork grove, crown-flowering trees.'),
    ('biome', 'nwlowlands', 'biomes/nwlowlands/dist/nwlowlands.html', 'Northwestern lowlands', 'Lake shore, Mediterranean foothills, bamboo groves, glow-willows.'),
    ('biome', 'xanadu', 'biomes/xanadu/dist/xanadu.html', 'Xanadu', 'An enclosed mountain lake and a sacred river; ornamental wildwood.'),
]


THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'


def bundle(path, three=THREE_CDN):
    """The page as one self-contained file: a page that loads local scripts (the Voth catalog) gets each one
    inlined, and a local three.min.js becomes the same r128 build from cdnjs. Built worlds pass through as is."""
    html = open(path, encoding='utf-8').read()
    here = os.path.dirname(path)
    def inline(m):
        src = m.group(1)
        if src.startswith(('http:', 'https:', '//')):
            return m.group(0)
        if os.path.basename(src) == 'three.min.js':
            return '<script src="%s"></script>' % three
        body = open(os.path.join(here, src.replace('%20', ' ')), encoding='utf-8').read()
        return '<script>\n' + body.replace('</script', '<\\/script') + '\n</script>'
    return re.sub(r'<script src="([^"]+)"></script>', inline, html).replace(THREE_CDN, three)


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None


def main():
    site = os.path.abspath(arg('--out') or SITE)
    three = arg('--local-three') or THREE_CDN
    if '--no-build' not in sys.argv:
        dirs = []
        for _, _, path, _, _, *_ in ENTRIES:
            d = os.path.dirname(path)
            while not os.path.exists(os.path.join(ROOT, d, 'build.py')):   # dist/, or a page beside its build (the Voth catalog)
                d = os.path.dirname(d)
            if d not in dirs:
                dirs.append(d)
        for d in dirs:
            r = subprocess.run([sys.executable, 'build.py'], cwd=os.path.join(ROOT, d),
                               capture_output=True, text=True)
            print('built' if r.returncode == 0 else 'BUILD FAILED', d)
            if r.returncode:
                sys.exit(r.stdout + r.stderr)
    if os.path.isdir(site):
        shutil.rmtree(site)
    os.makedirs(os.path.join(site, 'worlds'))
    if three != THREE_CDN:   # the same r128 build every settlement vendors
        shutil.copy(os.path.join(ROOT, 'settlements/voth/three.min.js'), os.path.join(site, 'worlds', 'three.min.js'))
    items = []
    for section, slug, path, name, blurb, *rest in ENTRIES:
        src = os.path.join(ROOT, path)
        with open(os.path.join(site, 'worlds', slug + '.html'), 'w', encoding='utf-8') as fh:
            fh.write(bundle(src, three))
        items.append({'section': section, 'slug': slug, 'name': name, 'blurb': blurb,
                      'mb': round(os.path.getsize(src) / 1048576, 1), 'source': path,
                      'tag': rest[0] if rest else None})
    tpl = open(os.path.join(HERE, 'index.template.html'), encoding='utf-8').read()
    page = tpl.replace('/*ENTRIES*/[]', json.dumps(items, ensure_ascii=False))
    with open(os.path.join(site, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(page)
    total = sum(os.path.getsize(os.path.join(site, 'worlds', i['slug'] + '.html')) for i in items)
    print('wrote %s/: %d pages, %.1f MB' % (os.path.relpath(site, ROOT), len(items), total / 1048576))


if __name__ == '__main__':
    main()
