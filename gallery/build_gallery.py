#!/usr/bin/env python3
"""Assemble the shareable gallery in gallery/site/.

Rebuilds every world listed below (unless --no-build), copies each built page
to gallery/site/worlds/<slug>.html, and writes gallery/site/index.html from
index.template.html. Claude then publishes gallery/site/ as the Artifact named
in gallery/README.md.

Usage:  python3 gallery/build_gallery.py [--no-build | --build-missing] [--out DIR --local-three URL] [--lod CONFIG]
                                         [--no-discover]

A build in settlements/, openworld/, biomes/ or kits/ that no ENTRIES line names is listed anyway, tagged new
(discover): its one page in its kind's section, or its pages in a section of their own after it. --no-discover
lists ENTRIES only. Give a new build its ENTRIES lines to choose its section, names and blurbs. Each section is
alphabetical by name (alpha), whatever the order of ENTRIES.

--lod CONFIG (a TOML file: host/lod.toml) puts gallery/krator-bar.js first in every page: a bar to go to the other
worlds, set the level of detail, or go home, and that world's level of detail; see both files. Without it the pages
are exactly as built.

--build-missing rebuilds only the worlds whose built page is absent (a fresh clone lacks the port's, which are
not committed) and reuses every other built page as it is: what host/sitectl.bat does on Windows, where the
biome builds' node syntax check is usually unavailable.

--out DIR writes the site somewhere else (host/sitectl writes host/site/), and --local-three URL points every page
at that copy of three.js instead of cdnjs and puts the copy in DIR/worlds/, so the LAN server needs no internet.
"""
import glob, html, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, 'gallery')
SITE = os.path.join(HERE, 'site')

# (section, slug, built file, name, one line[, tag])
ENTRIES = [
    ('world', 'voth', 'settlements/voth/voth.html', 'Voth - old',
     'A city of cantons on an enclosed brackish bay, with barges, ferries, monks and ordinators on the move. The first Voth, kept beside the new one.'),
    ('world', 'voth-new', 'settlements/streetlab/dist/voth-city.html', 'Voth - new',
     "Voth laid out again by the city builder (core/city) on the owner's site: walled city, harbour and river port, clan compounds, a monastery, chinampas and the country round it, about 8,000 buildings; the south-west bay's jungle in the parks and savannah outside, a 72-minute day with electric, lantern and torch light, ferries and elephant bugs on their lines."),
    ('world', 'yuni', 'settlements/yuni/yuni.html', 'Yuni',
     'Rich, middle and poor quarters on canals, with an underground and an Ancients quarter. Every surface from the material library, inside the houses too; the wild valley planted by the eastern badlands kit, its Zion side (oak, maple, cottonwood galleries, hanging gardens on the butte). Run time for the day, M for the map.'),
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
     'An outlying Beast Rider village in the central-crater hyperjungle: every tower home, shop, workshop, hut and the Assembly Hall planned into rooms and furnished from the catalog, doors open; press G to walk in.', 'new'),
    ('world', 'girder-hero', 'settlements/girder/hero/dist/girder-hero.html', 'Girder · Hero',
     'Girder with Styv, a third-person character you order about with the mouse, and people to talk to (Phil in the '
     'Assembly Hall). Same village, same rooms; the models slimmed to fit the gallery (MADE).', 'new'),
    ('world', 'mavs-refuge', 'settlements/mavs-refuge/mavs-refuge.html', "Mav's Refuge",
     'A refuge in the hypertropic jungle on the lee shore of the Ring Sea: every apartment, workshop, storehouse, house '
     'and hut planned into rooms and furnished from the catalog, real windows, and lamps and hearths lit at night.'),
    ('world', 'shade', 'settlements/shade/dist/shade.html', 'Shade',
     'The Eastern Nomads\' sunken basin in the high desert: a waterfall into a turquoise pool, a carved Petra face, pueblos round the rim and cliff dwellings under alcoves.', 'new'),
    ('world', 'verge', 'settlements/verge/dist/verge.html', 'Verge',
     'Twin cities on the abyss escarpment: the upper on the plateau, the lower on the floor beneath the cataracts, joined by a switchback trail and a funicular; caravans on the trail.', 'new'),
    ('world', 'little-demo', 'openworld/little-demo/dist/little-demo.html', 'Little Demo (open world)',
     "The scale model's eastern desert at 1:1, 1,080 by 1,370 km, streamed: the abyss escarpment, the Yuni river, the desert, abyss and jungle flora by climate, and twelve highways. Its six built towns load only in the standalone artifact (https://claude.ai/artifact/Y3GKfn8fuaDPmtJnHW62RJ): the gallery's frame cannot fetch their tiles.", 'new'),
    ('world', 'ys', 'settlements/ys/dist/ys.html', 'Ys',
     'The half-drowned capital of the Hykkousoi on the ruins of an Ancient city: grown shell houses on reclaimed and drowned skyscrapers, a bridge network over the bay, the Pharos, the Citadel on its karst stack, a river in travertine pools and the north-west bay jungle on the stacks.', 'new'),
    ('world', 'noahs-regret', 'settlements/noahs-regret/dist/noahs-regret.html', "Noah's Regret",
     "An Ancient floating harbour city that once sailed the Ring Sea, aground on the south shore: Bloody Ruephus's pirate base. A rounded catamaran of two hulls joined at the bow, the harbour open astern between them with the liner mole and finger piers, terraced sterns, holds half full of the sea, four decks of cabins with scalloped balconies, the grand atrium, the dining room, twin engine rooms, two crew messes, the greenhouse and fifteen ship's rooms; over the forward third of the harbour a plaza with a fountain, terraces and a grand stair up to the bridge house, the bridge on top. Every room furnished; pick a level to cut the decks open.", 'new'),
    ('world', 'ys-mock', 'settlements/ys/dist/mock.html', 'Ys (mockup)',
     'Two drowned Ancient towers with grown-on Hykkousoi houses, a bridge and its runners: the phase 1 gate of the half-drowned capital.'),

    ('world', 'mungo', 'settlements/mungo/dist/mungo.html', 'Mungo',
     "A trade village on a salt lake in the Eastern Abyss: a floating reed village with its great tavern, Reed's Local, one pontoon to an abyssal town at a marshy river mouth, and the Geomancers' chapterhouse with their dune buggies. Its people live by core/simulation: fishers out at dawn, caravans and lizard riders stopping overnight, a buggy off the map and back.", 'new'),

    ('kit', 'jimjam-kit', 'settlements/jimjam/dist/jimjam-kit.html', 'Jimjam',
     'The exotic city of red and yellow brick with white marble trim: domes, thick staged spires, raised plazas, ornamental brick chimneys, and a temple whose arch frames the solstice sunset.'),
    ('kit', 'post-apoc-kit', 'kits/post-apoc/dist/post-apoc.html', 'Post-Apoc set',
     'Reclaimed-and-recycled buildings (containers, silos, tanks, buses, tyre and bottle walls) with sockets for any culture\'s marks: switch between eight culture packs. Cloth flutters, stovepipes smoke, and at night the windows go dark one by one.', 'new'),
    ('ancients', 'ancients-kit', 'kits/ancients/dist/ancients-kit.html', 'Ancients',
     'Ruined megastructures of the ancient civilisation at every level of decay: the 33 original types, the Lighthouse, 29 arco alternates and five Yuni variants, each intact, ruined and rehabilitated.', 'new'),
    ('ancients', 'ancients-worn', 'kits/ancients/dist/worn.html', 'Ancients, worn',
     'Every Ancients type intact beside its worn twin: whole, rust-streaked, the white skin tarnished.'),
    ('ancients', 'ancient-iziz-style', 'kits/ancients/dist/iziz-style.html', 'Ancient Iziz Style',
     'The Iziz building families built the Ancient way, each intact, destroyed and rehabilitated, with the Iziz variants: cut-out apartments, offices and houses, towers on small plinths, and the tripod market.'),
    ('ancients', 'ancient-engines', 'kits/ancients/dist/engines.html', 'The Engines',
     'Ten ruined cyclopean machines of unclear purpose on a red plain: the Harrow, Strider, Breech, Gyre, Press, Sleeper, Carapace, Retorts, Needle and Ram.', 'new'),
    ('ancients', 'ancient-alt-towers', 'kits/ancients/dist/alt-towers.html', 'Ancients alternates: towers',
     'Six new towers after the arco references, each intact, ruined, reclaimed and rehabilitated: the Bole, the Stack, the Attraction hotel, the Undulant flatiron, the Rig and the Bloom.', 'new'),
    ('ancients', 'ancient-alt-domestic', 'kits/ancients/dist/alt-domestic.html', 'Ancients alternates: domestic',
     'Ten new houses, apartments and works: the Undulant and Bridge houses, Fin apartments, a garden amphitheater, trestle fuel station, rotor radar, flower dish, the Rampart, Pilotis works and the Star laboratory.', 'new'),
    ('ancients', 'ancient-alt-civic', 'kits/ancients/dist/alt-civic.html', 'Ancients alternates: civic',
     'Thirteen new civic buildings: three offices, a saucer starport, bastion bunker, reading-star library, the Horns gate, robotics rig, data center, watch-cup police, linked hospital, garden-bowl campus and the Citadel.', 'new'),
    ('ancients', 'ancient-spaceport', 'kits/ancients/dist/spaceport.html', 'The Iziz spaceport',
     'The Iziz spaceport rebuilt as an Ancients type in all six states: intact, ruined, toppled tower, rehabilitated, reclaimed (fires, gardens, a market) and worn.', 'new'),
    ('ancients', 'ancient-lighthouse', 'kits/ancients/dist/lighthouse.html', 'The Lighthouse',
     'A modified Skyscraper J on its own island with a turning beacon, a cliff stair and a jetty, at every level of decay; the beams sweep at night.', 'new'),
    # objects: things you place in a world rather than build in it (furniture, plants, watercraft)
    ('objects', 'ringsea-craft', 'kits/ringsea/dist/ringsea.html', 'Ring Sea watercraft',
     'Twenty-one vessels of the Ring Sea on a rolling swell, warships and cargo ships: Hykkousoi triremes and a siege hexareme, the Voth Ordinator flagship, Iziz turtle and wheel ships, the Xanadu swan barge, canoes, outriggers and rafts. Press Under way to set the fleet sailing, or walk aboard.', 'new'),
    ('objects', 'krator-catalog', 'kits/catalog/dist/catalog.html', 'Master catalog',
     'Furniture for the interiors phase: 1635 pieces on five pages (indoor, outdoor, indoor and outdoor, rugs, and job items by trade), a row per culture and tier, with tapestries, banners, friezes, scrolls and painted hangings carrying each culture\'s emblem. Generic wood and scrap for the poor, regional materials for the middle class, bespoke court sets with tapestries and wall art for Voth, Iziz, the Beast Riders, Lizardmen, the East Abyss, the Eastern Nomads, Xanadu, Screamers, Islanders, Republicans, Rustic Highlanders, the Painted Men, Reed Lake, the salvage lords and the Scyvoi (cushions, toshaks, bolsters, pierced lanterns, glass chandeliers, samovars), beside the harvested Yuni and Ancients sets, and the furniture the Highlands, Post-Apoc, Beast Rider, Abyss and Locus kits used to draw for themselves. Plus the generic goods that sit on all of it (barrels, crates, sacks, jars, bread, cheese, roasts, pies, wine, tea, candles, medicines) and a fruit for every fruiting plant in the biomes: scalefruit, gatepods, lantern pods, frillpods, ballmelons, cacao, pinyon nuts, canyon grapes.', 'new'),
    ('objects', 'interiors', 'kits/interiors/dist/interiors.html', 'Interiors',
     'Buildings planned into rooms and furnished from the catalog: a townhouse, an inn, a three-storey tower, with a storey cut-away and people walking in from the street to sit, sleep and work.', 'new'),
    ('objects', 'ancients-interiors', 'kits/ancients-interiors/dist/ancients-interiors.html', 'Ancients interiors',
     "The Ancients' ship interiors as a kit, from Noah's Regret: fourteen halls laid out the way a ship would (crew mess, dining hall, greenhouse, engine room, bridge, officers' hall, chart deck, chain locker, store hall, drill hall, gallery, stern lounge, plaza, quay), each as the Ancients fitted it and as the pirates hold it, plus the ship's rooms (sick bay, chart room, strongroom, armoury, brig, sail loft, laundry) and cabins furnished by the placer. Every room audited; C cycles the cut-away.", 'new'),
    ('objects', 'interiors-walk', 'kits/interiors/dist/interiors-walk.html', 'Interiors walk-through',
     'The Highlands, Post-Apoc, Beast Rider, Locus and Abyss buildings with their rooms planned and furnished from the catalog: every residence with a bed, a food store and an item store. Walk in through the doors and up the stairs.', 'new'),
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
    ('kit', 'motor-vehicles', 'kits/motor-vehicles/dist/motor-vehicles.html', 'Motor Vehicles',
     "Five motor vehicles of five cultures: the Geomancers' dune buggy, the Iron Republic's eight-wheeled salvage crawler with its solar lid, the Izani armoured six-wheeler, the abyssal caravan truck under its tarps and the Post-Apoc tracked hab. Textured from the material library; wheels that roll and steer, tracks that run, lamps that switch (Drive R, Lights L, Night N).", 'new'),
    ('kit', 'iziz-mechs', 'kits/mechs/dist/mechs.html', 'Iziz war-walkers',
     "Eleven Iziz mechs, Ancient industrial walkers refitted for the legions (and a supply variant with a horn-blower): leg IK with planted feet, idle, plodding walk, march with U-turns and attacks (ballistae, a rotary polybolos, shears, pile driver, auger, saw, grapple).", 'new'),
    ('kit', 'scyvoi', 'kits/scyvoi/dist/scyvoi.html', 'Scyvoi',
     "The salamander riders of the crater drylands, in polychrome and appliqué: gers, a bell tent, goat-hair tents, Tibetan white appliqué tents and halls under prayer flags, the chief's great tent and carved vardo, the shaman's ger, the smithy, hidemaker, supply and cartwright's tents, all furnished (C opens them); salamanders, goats, bison and cattle with their pens; chariots and carts; the Baelu, a fitted-stone fire redoubt."),
    ('kit', 'desert-nomads', 'kits/desert-nomads/dist/desert-nomads.html', 'Desert Nomads',
     "The camel nomads of the eastern desert and the abyss: black goat-hair tents with sadu valances, khaimas and square hair-cloth tents, white caidal tents, a Tuareg leather tent, the sheikh's tent and guest pavilion, the seer's and hookah tents, all austere outside and muted Moroccan within (C opens them); camels, horses and lizards under their saddles, a camel cart and litter, zaribas and folds.", 'new'),
    ('kit', 'ash-nomads', 'kits/ash-nomads/dist/ash-nomads.html', 'Ash Nomads',
     "The beetle riders of the ash plains: black peaked tents of every kind under blue and saffron Nazca and Dunmer bands, the chieftain's five-spired tent, the assembly and mess hall under the gas giant emblem, the shaman's hut, smithy, chitin worker and supply tents, all furnished in chitin, banners and lanterns (C opens them); staghorn beetles, pack millipedes, millipede and runner pens.", 'new'),
    ('kit', 'fauna', 'kits/fauna/dist/fauna.html', 'Fauna',
     "Every animal of Krator in one kit, 51 species (now with the bison, the rideable staghorn beetle and the six-legged ash runner): farm stock, mounts, the desert, bay, abyss and hyperjungle fauna, giant flyers and crawlers, Voth's beasts. Each tagged by biome, diet, temperament, traits, yields and life (hover with T); Idle, Graze, Walk, Fly and Swim set what they all do.", 'new'),
    ('kit', 'ys-kit', 'settlements/ys/dist/kit.html', 'Hykkousoi kit',
     'The grown building kit of Ys: 93 pieces on the sheet, pods on Scallop Stack hosts, spans, harbour, civic landmarks, furniture.'),

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
    ('arcology', 'arc-spire', 'kits/ancients/dist/spire.html', 'The Hanging City',
     'A lattice pyramid after Shimizu\'s mega-city: an octahedral megatruss 1 km across in its own lagoon, towers hung in its cells; intact, ruined and rehabilitated.', 'new'),
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
    ('port', 'port-harbour', 'settlements/port/dist/harbour.html', 'Harbour',
     'A Long-Beach-like composition: coastal run, land blocks two rows deep, container yards chained off the great pier.'),
    ('port', 'port-lbBlocks', 'settlements/port/dist/lbBlocks.html', 'Land blocks',
     'Port authority (a fortress palace when reclaimed), warehouses and silos, a fuel-tank farm, behind the quays.'),
    ('port', 'port-chHousing', 'settlements/port/dist/chHousing.html', 'Container housing',
     'Three blocks of container and tank houses with lanes between: towers, courtyard compounds, silo houses.'),
    ('port', 'port-spYard', 'settlements/port/dist/spYard.html', 'Sea platform',
     'A 110 m container yard on a mole off the pier head, joined on any side to more platforms.'),
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
    ('biome', 'sedesert', 'biomes/sedesert/dist/sedesert.html', 'Eastern high desert', 'Socotran flora, mesas, hoodoos, a canyon ending in a cataract that pours off an undercut lip.'),
    ('biome', 'rift', 'biomes/rift/dist/rift.html', 'The Rift', 'An algal salt lake, abyssal jungle, cloud forest on the mesas.'),
    ('biome', 'swbay', 'biomes/swbay/dist/swbay.html', 'Southwest bay', 'Bay hyperjungle, parasol savannah, the volcano, stepped cataracts.'),
    ('biome', 'swlowlands', 'biomes/swlowlands/dist/swlowlands.html', 'Southwestern lowlands', 'Sprawl oaks, an oak avenue, cork grove, crown-flowering trees.'),
    ('biome', 'nwlowlands', 'biomes/nwlowlands/dist/nwlowlands.html', 'Northwestern lowlands', 'Lake shore, Mediterranean foothills, bamboo groves, glow-willows.'),
    ('biome', 'xanadu', 'biomes/xanadu/dist/xanadu.html', 'Xanadu', 'An enclosed mountain lake and a sacred river; ornamental wildwood.'),
    ('biome', 'nhighlands', 'biomes/nhighlands/dist/nhighlands.html', 'Northern highlands', 'Old-growth temperate to boreal forest, trumpet trees, glowing bell-bulbs, a stream from its tarn.'),
    ('biome', 'ebadlands', 'biomes/ebadlands/dist/ebadlands.html', 'Eastern badlands', 'Sulphur flats and alien flora, painted badlands, a Zion canyon with a hanging-garden ruin, sagebrush and pinyon-juniper, pine and spruce-fir up to the ice of the outer rim; real textures, trees as variants.', 'new'),
    ('biome', 'nwbay', 'biomes/nwbay/dist/nwbay.html', 'North-west bay', "The bay of Ys: karst stacks, an igneous shore, travertine terraces, mangroves; up the dry slope a tsingy of knife-edged limestone fins with spinewands and rock bottles, a tiankeng with a rainforest of traveller's fans, cenotes to the water table, avenue baobabs; trees as variants.", 'new'),
    ('biome', 'crater-drylands', 'biomes/crater-drylands/dist/crater-drylands.html', 'Crater drylands', "The Throne's rain shadow at 1.9 atm, a mosaic of wildfires of every age from the kit's own fire model: fresh char and ash, the superbloom that follows (fireweed, poppies, lupine, flame plumes, fire lilies), regrowth and old scrub; prism mallees resprouting from their root crowns, pyre pillars, frill-trees burst over their seedlings, granite kopjes where the Scyvoi live; the dense air's light.", 'new'),
    ('biome', 'shighlands', 'biomes/shighlands/dist/shighlands.html', 'Southern highlands', "The spiral biome: the Inner Wall's flank above the cloud sea, where the hyperjungle's air pools below the Wall and laps against the scarp. Every plant grows in a spiral (whorl, twist, coil or shell), and every spiral turns the same way, but for the rare mirror-handed tree. A cloud forest of coilbarks, spiral trumpets with fluted twisting funnels, volute trees whose limbs end in leafy scrolls, spiral frill trees, tree ferns and screw palms, over a sea of drifting cloud; above it a paramo of ruffle-crowns, giant groundsels, spiral lobelias and spiral aloes, bogs of sphagnum; the Whorl Stone, a tor whose ledge spirals to its top.", 'new'),
    ('biome', 'ehighlands', 'biomes/ehighlands/dist/ehighlands.html', 'Eastern highlands', "The cushion plateau: a cold altiplano in thin air under a deep blue sky, snow-capped volcanoes on every horizon, where everything grows toward the giant. Poured cushions and the Mother Cushion, one plant over a whole hill; woolbacks, thorn cushions, a stand of vigil spikes in flower all leaning one way, dead torches, ragbark woods in the gullies, glass towers lit from within; a cushion bog and a frozen tarn, a geyser field; wormwick in the turf and tower honey under the cliffs.", 'new'),
]


THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

# Builds new to the gallery are listed without an ENTRIES line (discover): a build in one of these folders with no
# page above. One page joins its kind's section; several make a section of their own after it. Names come from the
# pages' <title>s, the description from the build's README.md or INDEX.md. An ENTRIES line replaces all of that.
KINDS = {'settlements': 'world', 'openworld': 'world', 'biomes': 'biome', 'kits': 'kit'}
UNLISTED = set()   # build folders ('kits/furniture') never to list, though they have pages
# Builds published as their own artifact, each with the script that makes its site: left out of the Krator Worlds
# artifact (gallery/site/), whose index links to them instead (index.template.html), but kept in any other --out site
# (the LAN host's), where size does not matter. The Throne's eleven stations are about 25 MB with their shared maps.
ELSEWHERE = {'biomes/throne': 'gallery/build_throne.py',
             # the Ancients kit (city kits and arcologies) and the Ancient Port: about 105 MB with their shared packs
             'kits/ancients': 'gallery/build_ancients.py', 'settlements/port': 'gallery/build_ancients.py'}
# Pages a build's own build.py does not write: made by another command in the build's folder, before the page is
# copied. Girder Hero is too big for the gallery as build_hero.py writes it (20.5 MB, over 16 MB a file), so the
# gallery takes the --slim one, written outside the committed pages (hero/dist/ is not committed).
MADE = {'settlements/girder/hero/dist/girder-hero.html':
        ['build_hero.py', '--slim', '--out', 'hero/dist/girder-hero.html']}


def build_dir(path):
    """The folder of the build.py that makes a page: dist/'s parent, or the page's own (the Voth catalog's parent)."""
    d = os.path.dirname(path)
    while not os.path.exists(os.path.join(ROOT, d, 'build.py')):
        d = os.path.dirname(d)
    return d


def built_pages(d):
    """A build's pages: dist/*.html, else the .html beside its build.py; its namesake first."""
    for where in ('dist/*.html', '*.html'):
        pages = [p for p in sorted(glob.glob(os.path.join(ROOT, d, where)))
                 if not os.path.basename(p).startswith('.') and not re.search(r'\.(artifact|origin)\.html$', p)]
        if pages:
            name = os.path.basename(d)
            pages.sort(key=lambda p: os.path.splitext(os.path.basename(p))[0] != name)
            return [os.path.relpath(p, ROOT).replace(os.sep, '/') for p in pages]
    return []


def page_title(path):
    with open(os.path.join(ROOT, path), encoding='utf-8', errors='replace') as f:
        m = re.search(r'<title>([^<]*)</title>', f.read(65536), re.I)
    t = html.unescape(m.group(1)).strip() if m else ''
    return re.sub(r'^Krator\b[^—–:]*?(?:\s[—–-]\s|:\s)', '', t).strip()   # "Krator biome — the Throne" -> "the Throne"


def describe(d, limit=320):
    """The first paragraph of the build's README.md, else of its INDEX.md, as plain text of about `limit` letters."""
    for doc in ('README.md', 'INDEX.md'):
        try:
            text = open(os.path.join(ROOT, d, doc), encoding='utf-8').read()
        except OSError:
            continue
        for para in re.split(r'\n\s*\n', text):
            p = ' '.join(para.split())
            if p and not p.startswith(('#', '*', '|', '`', '>', '-', '<', 'Docs:')):
                p = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', p).replace('`', '')
                if len(p) <= limit:
                    return p
                cut = p.rfind('. ', 0, limit)
                return p[:cut + 1] if cut > limit // 4 else p[:limit].rsplit(' ', 1)[0] + '...'
    return ''


def cap(s):
    return s[:1].upper() + s[1:]


def discover(build=False, skip=()):
    """Entries and sections for the builds no ENTRIES line names. build: make the pages of one that has none.
    skip: build folders to leave out (ELSEWHERE, for the artifact's site)."""
    listed = {build_dir(e[2]) for e in ENTRIES}
    used = {e[1] for e in ENTRIES}
    found, sections = [], []
    for top, kind in KINDS.items():
        for script in sorted(glob.glob(os.path.join(ROOT, top, '*', 'build.py'))):
            d = os.path.relpath(os.path.dirname(script), ROOT).replace(os.sep, '/')
            if d in listed or d in UNLISTED or d in skip:
                continue
            pages = built_pages(d)
            if not pages and build:
                r = subprocess.run([sys.executable, 'build.py'], cwd=os.path.join(ROOT, d), capture_output=True, text=True)
                print('built' if r.returncode == 0 else 'BUILD FAILED (left out of the gallery)', d)
                pages = built_pages(d)
            if not pages:
                continue
            folder = os.path.basename(d)
            titles = [page_title(p) for p in pages]
            heads = {t.split(': ', 1)[0] for t in titles if t}
            title = cap(heads.pop()) if len(heads) == 1 else cap(folder.replace('-', ' '))
            key = kind
            if len(pages) > 1:   # its own section, after its kind's
                key = 'new-' + folder
                sections.append({'key': key, 'id': folder, 'title': title, 'note': describe(d), 'after': kind})
            for p, t in zip(pages, titles):
                stem = os.path.splitext(os.path.basename(p))[0]
                slug = stem if stem not in used else '%s-%s' % (folder, stem)
                used.add(slug)
                name = cap(t.split(': ', 1)[1] if ': ' in t else t) or cap(stem.replace('-', ' '))
                found.append((key, slug, p, name, describe(d) if len(pages) == 1 else '', 'new'))
            print('new to the gallery: %s (%d page%s)' % (d, len(pages), '' if len(pages) == 1 else 's'))
    return found, sections


def alpha(name):
    """Where a name sorts within its section: letters only, case and a leading article ignored ("The Wing": W)."""
    n = re.sub(r'^(the|an?)\s+', '', name.casefold())
    return re.sub(r'[^\w\s]', '', n).strip(), n


def ordered_sections(extra):
    """The template's sections with the discovered ones after their kind's, as the index page orders them."""
    tpl = open(os.path.join(HERE, 'index.template.html'), encoding='utf-8').read()
    out = [{'key': k, 'title': t} for k, t in re.findall(r"\{key:'([^']+)',\s*id:'[^']*',\s*title:'([^']+)'", tpl)]
    for s in extra:
        i = next((n for n, x in enumerate(out) if x['key'] == s['after']), len(out) - 1)
        while i + 1 < len(out) and out[i + 1].get('after') == s['after']:
            i += 1
        out.insert(i + 1, {'key': s['key'], 'title': s['title'], 'after': s['after']})
    return [{'key': s['key'], 'title': s['title']} for s in out]


def bundle(path, three=THREE_CDN, worlds=None):
    """The page as one self-contained file: a page that loads local scripts (the Voth catalog) gets each one
    inlined, and a local three.min.js becomes the same r128 build from cdnjs. Built worlds pass through as is.
    A library-pack sidecar (<page>.tex.<key>.js, tools/textures/matlib_pack.py) is NOT inlined: it is copied into
    `worlds` beside the page and keeps its tag, so no gallery file passes the artifact's 16 MB a file."""
    html = open(path, encoding='utf-8').read()
    here = os.path.dirname(path)
    def inline(m):
        src = m.group(1)
        if src.startswith(('http:', 'https:', '//')):
            return m.group(0)
        if os.path.basename(src) == 'three.min.js':
            return '<script src="%s"></script>' % three
        if worlds and re.search(r'\.tex\.[\w-]+\.js$', src):
            shutil.copy(os.path.join(here, src), os.path.join(worlds, os.path.basename(src)))
            return '<script src="%s"></script>' % os.path.basename(src)
        body = open(os.path.join(here, src.replace('%20', ' ')), encoding='utf-8').read()
        return '<script>\n' + body.replace('</script', '<\\/script') + '\n</script>'
    return re.sub(r'<script src="([^"]+)"></script>', inline, html).replace(THREE_CDN, three)


def bar_head(cfg, slug, entries=ENTRIES, extra=()):
    """The <script>s that give a world its bar and level of detail: the config for this page, then krator-bar.js."""
    conf = {'slug': slug, 'level': cfg.get('worlds', {}).get(slug, cfg.get('default', 'high')),
            'levels': cfg.get('levels', {}), 'home': '/', 'share': cfg.get('share', '/share'),
            'sections': ordered_sections(extra),
            'scenes': [{'slug': e[1], 'name': e[3], 'section': e[0], 'blurb': e[4], 'href': '/worlds/%s.html' % e[1]}
                       for e in entries],
            'extra': cfg.get('extra', [])}
    js = open(os.path.join(HERE, 'krator-bar.js'), encoding='utf-8').read().replace('</script', '<\\/script')
    return ('<script>window.KRATOR_BAR=%s;</script>\n<script>\n%s\n</script>\n'
            % (json.dumps(conf, ensure_ascii=False).replace('</', '<\\/'), js))


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else None


def main():
    site = os.path.abspath(arg('--out') or SITE)
    three = arg('--local-three') or THREE_CDN
    if '--no-build' not in sys.argv:
        missing = '--build-missing' in sys.argv
        dirs = []
        skip_built = set(ELSEWHERE) if site == os.path.abspath(SITE) else set()
        made = []
        for _, _, path, _, _, *_ in ENTRIES:
            if missing and os.path.exists(os.path.join(ROOT, path)):
                continue
            if build_dir(path) in skip_built:
                continue
            if path in MADE:
                made.append(path)
                continue
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
        for path in made:
            os.makedirs(os.path.join(ROOT, os.path.dirname(path)), exist_ok=True)
            r = subprocess.run([sys.executable] + MADE[path], cwd=os.path.join(ROOT, build_dir(path)),
                               capture_output=True, text=True)
            print('made' if r.returncode == 0 else 'MAKE FAILED', path)
            if r.returncode:
                sys.exit(r.stdout + r.stderr)
    skip = set(ELSEWHERE) if site == os.path.abspath(SITE) else set()   # their own artifacts; the LAN site keeps them
    found, sections = ([], []) if '--no-discover' in sys.argv else discover(build='--no-build' not in sys.argv, skip=skip)
    entries = sorted([e for e in ENTRIES if build_dir(e[2]) not in skip] + found,
                     key=lambda e: alpha(e[3]))   # each section alphabetical, the bar's menu too
    if os.path.isdir(site):
        shutil.rmtree(site)
    os.makedirs(os.path.join(site, 'worlds'))
    if three != THREE_CDN:   # the same r128 build every settlement vendors
        shutil.copy(os.path.join(ROOT, 'settlements/voth/three.min.js'), os.path.join(site, 'worlds', 'three.min.js'))
    lod = None
    if arg('--lod'):
        import tomllib   # Python 3.11+; only the LAN build needs it
        with open(arg('--lod'), 'rb') as f:
            lod = tomllib.load(f)
        unknown = set(lod.get('worlds', {})) - {e[1] for e in entries}
        if unknown:
            print('lod: no gallery page named %s (names are the file names under /worlds/)' % ', '.join(sorted(unknown)))
    items = []
    for section, slug, path, name, blurb, *rest in entries:
        src = os.path.join(ROOT, path)
        page = bundle(src, three, os.path.join(site, 'worlds'))
        if lod is not None:
            page = page.replace('<head>', '<head>\n' + bar_head(lod, slug, entries, sections), 1)
        with open(os.path.join(site, 'worlds', slug + '.html'), 'w', encoding='utf-8') as fh:
            fh.write(page)
        side = re.findall(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>', page)   # its library-pack sidecars
        size = os.path.getsize(src) + sum(os.path.getsize(os.path.join(site, 'worlds', f)) for f in side)
        items.append({'section': section, 'slug': slug, 'name': name, 'blurb': blurb,
                      'mb': round(size / 1048576, 1), 'source': path,
                      'tag': rest[0] if rest else None})
    tpl = open(os.path.join(HERE, 'index.template.html'), encoding='utf-8').read()
    page = (tpl.replace('/*ENTRIES*/[]', json.dumps(items, ensure_ascii=False))
               .replace('/*SECTIONS*/[]', json.dumps(sections, ensure_ascii=False).replace('</', '<\\/')))
    if lod is not None:   # the LAN site: a way to bring a phone or tablet in
        share = lod.get('share', '/share')
        page += ('\n<a id="krator-share" href="%s" style="position:fixed;top:12px;right:12px;z-index:10;'
                 'background:rgba(18,14,58,.85);color:#e8c98a;border:1px solid #c99a55;padding:7px 12px;'
                 'font:14px Georgia,serif;text-decoration:none;border-radius:2px">Open on your phone or tablet</a>\n'
                 % html.escape(share))
        # and, at the foot of the page, the way to the World Menagerie the same server carries
        page = page.replace('</footer>', ' · <a href="%s">The World Menagerie &rarr;</a></footer>'
                            % html.escape(lod.get('menagerie', '/menagerie')), 1)
    with open(os.path.join(site, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(page)
    total = sum(os.path.getsize(os.path.join(site, 'worlds', i['slug'] + '.html')) for i in items)
    print('wrote %s/: %d pages, %.1f MB' % (os.path.relpath(site, ROOT), len(items), total / 1048576))


if __name__ == '__main__':
    main()
