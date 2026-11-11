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
    ('world', 'voth', 'settlements/voth/dist/voth-city.html', 'Voth',
     "A city of cantons on an enclosed brackish bay, laid out by the city builder (core/city): walled city, harbour and river port, clan compounds, a monastery, chinampas and the country round it, about 8,000 buildings, every one with its rooms. 53,000 citizens and slaves live in it, with homes, jobs, rotas, needs and belongings, an economy of goods, stores, carts and imports, herds, dogs and cats; the south-west bay's jungle in the parks and savannah outside, a 72-minute day with electric, lantern and torch light, ferries and elephant bugs on their lines."),
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
    ('world', 'pinnacle-rock', 'settlements/pinnacle-rock/dist/pinnacle-rock.html', 'Pinnacle Rock',
     "The Beast Riders' roost town on a red sandstone mesa at the hyperjungle's north-eastern edge: the stalls ringed round "
     "its fins and pinnacles with their flyers, the Stair and the lifts, the town on the top (the Crown, the house and trade "
     "quarters on core/city), the Garden's great-houses, the Deep Root cavern opening from the Garden's wall, the farm ring and "
     "the bands' camps; the hour slider and N for the night (the Crown's fires, the stall lamps, the beacons). Walk mode, the "
     "minimap (M) and the inspector.", 'new'),
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
    ('world', 'isle-demo', 'openworld/isle-demo/dist/isle-demo.html', 'Isle Demo (open world)',
     "The scale model's Ring Sea isles at 1:1, streamed: an archipelago of about 11,800 km2 of land, its sea readable from any height, the coast drawn as lagoons, reef crests and mangrove flats, the isles kit's flora by climate class (hypertropic jungle to salt steppe), seagrass and corals in the lagoons, and geyser fields at the scale model's fourteen vents. Kautoa and Valapo are marked; their towns are being laid out."),
    ('world', 'ys', 'settlements/ys/dist/ys.html', 'Ys',
     'The half-drowned capital of the Hykkousoi on the ruins of an Ancient city: grown shell houses on reclaimed and drowned skyscrapers, a bridge network over the bay, the Pharos, the Citadel on its karst stack, a river in travertine pools and the north-west bay jungle on the stacks.', 'new'),
    ('world', 'noahs-regret', 'settlements/noahs-regret/dist/noahs-regret.html', "Noah's Regret",
     "An Ancient floating harbour city that once sailed the Ring Sea, aground on the south shore: Bloody Ruephus's pirate base. A rounded catamaran of two hulls joined at the bow, the harbour open astern between them with the liner mole and finger piers, terraced sterns, holds half full of the sea, four decks of cabins with scalloped balconies, the grand atrium, the dining room, twin engine rooms, two crew messes, the greenhouse and fifteen ship's rooms; over the forward third of the harbour a plaza with a fountain, terraces and a grand stair up to the bridge house, the bridge on top. Every room furnished; pick a level to cut the decks open.", 'new'),

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
    ('objects', 'crops', 'kits/crops/dist/crops.html', 'Crops',
     'World content that belongs to no culture or biome: 118 crops in 25 buckets, each a range on warmth, air pressure and aridity, so a settlement can ask what its place could plausibly grow, with the dyes, fibres and fuels they give.'),
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
    ('objects', 'motor-vehicles', 'kits/motor-vehicles/dist/motor-vehicles.html', 'Motor Vehicles',
     "Five motor vehicles of five cultures: the Geomancers' dune buggy, the Iron Republic's eight-wheeled salvage crawler with its solar lid, the Izani armoured six-wheeler, the abyssal caravan truck under its tarps and the Post-Apoc tracked hab. Textured from the material library; wheels that roll and steer, tracks that run, lamps that switch (Drive R, Lights L, Night N).", 'new'),
    ('objects', 'mechs', 'kits/mechs/dist/mechs.html', 'Mechs and Robots',
     "Nineteen walkers, skinned and animated, with leg IK and planted feet, idle, walk, march with U-turns and attacks: seventeen Iziz war-walkers, Ancient industrial machines refitted for the legions, from a hound-sized drone to a walking siege tower (ballistae, a rotary polybolos, shears, pile driver, auger, saw, grapple, an iron fist, a clap); and the Stalkers of the Catch, man-sized and sleek in white enamel, the harpooner with its pneumatic harpoon guns and the blade with hooked blades on its long arms.", 'new'),
    ('kit', 'lizardmen', 'kits/lizardmen/dist/lizardmen.html', 'Lizardmen',
     "The Lizardmen of the Rift floor: ribs, horns and tusks outside the skin, walls that lean wrong, triangular doors sized by caste and nested seven deep, the squared spiral built and the round whorl carved, spiral eyes of rank; the caste dwellings, the nest hall's Fermat spiral of grown chambers, the bone hall, the camp's hide tents, the stone circle and the clapperless bells, the warlord's capital in cyclopean basalt with its gatehouse and twisted towers, and the reliquary with its dusty antechamber (C opens them).", 'new'),
    ('kit', 'pylon', 'kits/pylon/dist/pylon.html', 'Pylon',
     "Pylon, Iziz's vassal arcology city on a savannah plateau round the ruined Monolith: post-Cataclysm buildings imitating the Ancients in white render and Iziz orange (folk houses with orange cornice bands, concrete blocks with pill-shaped niches, vault houses, tank houses and hex cells for the poor), the scrap and salvage trade (yards under portal cranes, a breakers' floor, a smelter, the scrap exchange), the Salvagers' Guild and the watch, six Ancient families intact, ruined and repaired, the temple of the Ancients, the governor's palace, and the Monolith itself at full scale; with the Iziz Vernacular in mixed streets beside them. Nine of its buildings are furnished inside (X cuts them away): orange leather banquettes, hearth blocks and walnut beds among Iziz furniture.", 'new'),
    ('kit', 'talia', 'kits/talia/dist/talia.html', 'Talia',
     "Talia, Iziz's vassal university and caravan city at the foot of the eastern passes: Greek and Byzantine forms with baroque, neoclassical and Indian dress, white with Iziz orange and gilt. Whitewash cubes and loggias, the orange quarter's tenements, palazzi and jharokha fronts; the caravan trade (customs house, domed bourse, caravanserai, stoa, baths); the University (the great hall's clock tower, the cloister, the library rotunda, faculties, the observatory, colleges), the odeon, theatre and glasshouse; the temple of the Sun and the Giant, the Gate of the Passes, the governor's palace; real doors and glazed windows throughout, 64 buildings furnished inside (X cuts them away); with the Iziz Vernacular in mixed streets beside them.", 'new'),
    ('objects', 'resources', 'kits/resources/dist/resources.html', 'Resources',
     "Placeable resource nodes for any culture's mines: iron, copper, gold, tin, silver, rare earth, coal, sulphur, saltpetre and oil seeps, each in a low, medium and high grade. A mine works its nearest node, and the grade sets its yield (half, once, twice); oil needs a derrick."),
    ('kit', 'scyvoi', 'kits/scyvoi/dist/scyvoi.html', 'Scyvoi',
     "The salamander riders of the crater drylands, in polychrome and appliqué: gers, a bell tent, goat-hair tents, Tibetan white appliqué tents and halls under prayer flags, the chief's great tent and carved vardo, the shaman's ger, the smithy, hidemaker, supply and cartwright's tents, all furnished (C opens them); salamanders, goats, bison and cattle with their pens; chariots and carts; the Baelu, a fitted-stone fire redoubt."),
    ('kit', 'desert-nomads', 'kits/desert-nomads/dist/desert-nomads.html', 'Desert Nomads',
     "The camel nomads of the eastern desert and the abyss: black goat-hair tents with sadu valances, khaimas and square hair-cloth tents, white caidal tents, a Tuareg leather tent, the sheikh's tent and guest pavilion, the seer's and hookah tents, all austere outside and muted Moroccan within (C opens them); camels, horses and lizards under their saddles, a camel cart and litter, zaribas and folds.", 'new'),
    ('kit', 'beast-riders', 'kits/beast-riders/dist/beast-riders.html', 'Beast Riders',
     "The Beast Riders' buildings as a set of their own, in Girder's palette (tarred staves, shingle hips with verdigris ribs, red and gilt carved posts, beast-head finials): the mounts' raptor stable, great byre and rookery tower; the sedentary trades and larger houses with no electricity; the bands' camps of hide domes and barrel tents with their pens and trainers' yards; the Deep Root's rock-cut door, niches and storerooms; and Girder's and Mav's Refuge's own buildings ported in. Click to inspect, measure and cycle variants.", 'new'),
    ('kit', 'ash-nomads', 'kits/ash-nomads/dist/ash-nomads.html', 'Ash Nomads',
     "The beetle riders of the ash plains: black peaked tents of every kind under blue and saffron Nazca and Dunmer bands, the chieftain's five-spired tent, the assembly and mess hall under the gas giant emblem, the shaman's hut, smithy, chitin worker and supply tents, all furnished in chitin, banners and lanterns (C opens them); staghorn beetles, pack millipedes, millipede and runner pens.", 'new'),
    ('objects', 'fauna', 'kits/fauna/dist/fauna.html', 'Fauna',
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
    ('arcology', 'arc-sanctum', 'kits/ancients/dist/sanctum.html', 'The Sanctum',
     "The Eternal State's capital arcology: a six-storey hexagonal podium with a gate under a gold face in each side and a court behind each, a stalk, and on it a hexagonal solid two thirds as wide, its faces in balconies and great onyx lancets, light wells through it, a garden and towers on its roof.", 'new'),
    ('arcology', 'arc-podium', 'kits/ancients/dist/podium.html', 'The Podium',
     "A tapering drum 660 m high on a six-pointed star: three great arches and three small entrances, a staircase spiralling counterclockwise from arch to arch, thirty arches in all; as the Ancients built it and as the True Heirs keep it.", 'new'),
    ('arcology', 'arc-kept', 'kits/ancients/dist/kept.html', 'Plymouth and Arcoindian I, kept',
     'The two Ancient bodies as the Eternal State keeps them: glazing turned to lit alabaster in bronze tracery, the shells cleaned white with cyan strips alive.', 'new'),

    # The Krator Ancient Port (kits/port): every target, showcase first.
    ('port', 'port-showcase', 'kits/port/dist/showcase.html', 'Showcase',
     'Every port segment in one continuous run per decay: intact, ruined and reclaimed, with natural coast between.'),
    ('port', 'port-segment', 'kits/port/dist/segment.html', 'Pier',
     'The pier segment on its own, in every decay.'),
    ('port', 'port-cgBox', 'kits/port/dist/cgBox.html', 'Container yard',
     'Container stacks worked by straddle carriers.'),
    ('port', 'port-cgCrane', 'kits/port/dist/cgCrane.html', 'Container cranes',
     'A quay of ship-to-shore container cranes.'),
    ('port', 'port-cgStore', 'kits/port/dist/cgStore.html', 'Silo battery',
     'Bulk storage: a battery of silos on the quay.'),
    ('port', 'port-ddDock', 'kits/port/dist/ddDock.html', 'Dry dock',
     'A graving dock under a travelling gantry crane.'),
    ('port', 'port-ddShed', 'kits/port/dist/ddShed.html', 'Covered graving dock',
     'A dry dock under its long shed.'),
    ('port', 'port-ddYard', 'kits/port/dist/ddYard.html', 'Slipway',
     'A shipbuilding slipway and its yard.'),
    ('port', 'port-tmShip', 'kits/port/dist/tmShip.html', 'Ship terminal',
     'The cargo terminal and its control tower.'),
    ('port', 'port-tmPass', 'kits/port/dist/tmPass.html', 'Liner berth',
     'A passenger terminal with its liner berth platform.'),
    ('port', 'port-tmHeli', 'kits/port/dist/tmHeli.html', 'Heliport',
     'A heliport reached by a raised walkway.'),
    ('port', 'port-hbFish', 'kits/port/dist/hbFish.html', 'Fishing harbour',
     'The fishing harbour, each decay between plain quays.'),
    ('port', 'port-hbMarina', 'kits/port/dist/hbMarina.html', 'Marina',
     'The marina, each decay between plain quays.'),
    ('port', 'port-hbHaven', 'kits/port/dist/hbHaven.html', 'Haven and lighthouse',
     'The haven with its lighthouse.'),
    ('port', 'port-harbour', 'kits/port/dist/harbour.html', 'Harbour',
     'A Long-Beach-like composition: coastal run, land blocks two rows deep, container yards chained off the great pier.'),
    ('port', 'port-lbBlocks', 'kits/port/dist/lbBlocks.html', 'Land blocks',
     'Port authority (a fortress palace when reclaimed), warehouses and silos, a fuel-tank farm, behind the quays.'),
    ('port', 'port-chHousing', 'kits/port/dist/chHousing.html', 'Container housing',
     'Three blocks of container and tank houses with lanes between: towers, courtyard compounds, silo houses.'),
    ('port', 'port-spYard', 'kits/port/dist/spYard.html', 'Sea platform',
     'A 110 m container yard on a mole off the pier head, joined on any side to more platforms.'),
    ('port', 'port-slCarrier', 'kits/port/dist/slCarrier.html', 'Drone carrier berth',
     'The naval berth with its drone carrier, down to the reclaimed carrier.'),
    ('port', 'port-slSub', 'kits/port/dist/slSub.html', 'Submarine berth',
     'A submarine at its berth.'),
    ('port', 'port-slBerth', 'kits/port/dist/slBerth.html', 'Naval berth',
     'A naval berth with its fallen portal crane.'),
    ('port', 'port-slPen', 'kits/port/dist/slPen.html', 'Submarine pen',
     'A hardened submarine pen.'),
    ('port', 'port-vsFeeder', 'kits/port/dist/vsFeeder.html', 'Container feeder',
     'The smallest container ship: intact, ruined and reclaimed, moored off three quays.'),
    ('port', 'port-vsPanamax', 'kits/port/dist/vsPanamax.html', 'Panamax ship',
     'A Panamax container ship: intact, ruined and reclaimed.'),
    ('port', 'port-vsGiant', 'kits/port/dist/vsGiant.html', 'Ultra-large container ship',
     'The largest vessel: intact, ruined and reclaimed.'),
    ('port', 'port-edges', 'kits/port/dist/edges.html', 'Pier edges',
     'Test sheet: the pier against every kind of side it can meet.'),
    ('port', 'port-cgEdges', 'kits/port/dist/cgEdges.html', 'Silo battery edges',
     'Test sheet: the silo battery against every kind of side.'),
    ('port', 'port-tmEdges', 'kits/port/dist/tmEdges.html', 'Liner berth edges',
     'Test sheet: the liner berth against every kind of side.'),
    ('port', 'port-hbEdges', 'kits/port/dist/hbEdges.html', 'Harbour edges',
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
    ('biome', 'ringisles', 'biomes/ringisles/dist/ringisles.html', 'Ring Sea isles', "One island of the Ring Sea archipelago at the sea's level: zones by the scale model's climate classes (hypertropic jungle under the mountain, monsoon forest, tall-grass and abyssal savanna, hot steppe, salt steppe and a salt pan), the beach, a mangrove lagoon, the reef flat and tide pools, a geyser field, and a village's gardens of the islanders' crops (coconut, mango, banana, coffee, cloves, breadfruit; rice, taro, sweet potato, kava, herbs, greens, sugar cane)."),
    ('biome', 'oidong', 'biomes/oidong/dist/oidong.html', 'The Oidong Valley', "The History Monks' country east of Xanadu, the safest ground on Krator and serene before anything else: a chilly high valley of mirror-still pools with giant lotuses, moss woods, cherry and haze blossom, a marble grove of swirled-pastel boles, chalice trees spilling water from their caps in the cataract's mist, bamboo, and pale flats the wind rakes round standing stones in threes, fives and sevens; the holy plants and the monks' physic grow wild (peyote in the gravel, sky poppies, snow lotus, bell-pod willows); Longsong's rock stands empty for the monastery.", 'new'),
    ('biome', 'geyser', 'biomes/geyser/dist/geyser.html', 'The geyser basin', "A basin in the Steampits cut into the hyperjungle: geysers erupting on their own clocks (Erupt buttons, a timetable), the Great Prism and its mat-banded run-off, mud pots and fumaroles, a dead forest drowned in silica, travertine pools stepping down to the sea; thermophile life.", 'new'),
    ('biome', 'necanyons', 'biomes/necanyons/dist/necanyons.html', 'The north-eastern canyons', "The hyperjungle's transition to Korona's tepuis: red sandstone mesas, benches, buttes, towers and stacks rising out of the jungle (the Bench with its rim fins and its garden of spires and balanced rocks, the High Cap and its hoodoos), the forest filling the canyons between them and thinning northward, the tops bare and dry with pans and seeps; the first large carnivorous plants, their traps on their own cycles, none able to hold a person. Pinnacle Rock stands on the first of its mesas. The hour slider and N for the night; the creek and the rain pools on core/water.", 'new'),
    ('biome', 'guilin', 'biomes/guilin/dist/guilin.html', 'Guilin, the South China karst', "Guilin's tower karst on the Li River and the Stone Forest of Shilin on one misty plain: lone limestone towers and a fengcong's crowd of peaks, each a sheer grey cliff streaked black and ochre under a dome of scrub forest and Masson pines; nine hundred grey blades and pinnacles in the stone forest round a lotus pond; paddies along the river in every stage from flooded to ripe, bamboo on the banks, banyans, camphor and osmanthus groves, pomelo orchards; towers going on into the mist. N for the night.", 'new'),
    ('biome', 'nsemiarid', 'biomes/nsemiarid/dist/nsemiarid.html', 'Northern semiarid steppe', "The walking steppe of the north basin under the dams: plants that travel (crawlers, striders, bead chains) and a sky full of large wind-blown seeds, frill trees that shed their fins in a gale, helicopter trumpets, sail candelabras, mace heads and horn pipes, a stream on core/water, igneous and sedimentary rock; a high-wind setting that lifts the dust.", 'new'),
    ('biome', 'dambasins', 'biomes/dambasins/dist/port.html', 'The dam basins: the old port', "An overlay on the steppe: the drained bed of one of the north basin's dam lakes, its old port high and dry on the 900 m line, grounded hulks heeled and buried by the three populations that sailed it, wrecks snapped and stranded across the bed, the flood's debris (twisted plating, half-buried containers, rotting I-beams), dust lifting off the bed in the wind.", 'new'),
    ('biome', 'scablands', 'biomes/scablands/dist/coulee.html', 'The scablands: a coulee and its dry falls', "An overlay on the steppe: the ground the dam break's flood tore down, a coulee on the west breach with its stepped walls and a dry falls over a plunge-pool lake, potholes holding water with kolk lilies, quills and sedge, spray ferns in the seeps at the falls' foot, flood bars ribbed with giant current ripples, erratics of basalt and the dam's own concrete where the flood dropped them.", 'new'),
    ('korona', 'korona', 'biomes/korona/dist/korona.html', 'Korona 1 · the tepui', "Korona, the north-east under the gas giant: a corona of ring ridges round a trench country, each ring wet on its windward face and desert on its lee, built as stations like the Throne. Station 1, the tepui: a table of weathered quartzite beds over its gorge, the summit pavement with sphagnum bogs, lace pitchers, rainbow fans in its soil pockets, coin trees in its cracks and storm pods on the rim; hanging gardens and staghorns on every seep line, the Hum's contour carvings on the wall; great sundews at the walls' feet and the first man-eaters on the poor wet floor.", 'new'),
    ('korona', 'korona-hollow', 'biomes/korona/dist/korona-hollow.html', 'Korona 2 · the pitcher hollow', "Station 2, the pitcher hollow: a closed hollow with a wet acid floor where every plant is a trap (the moor of blood bulbs, man-eater pitchers with their lures, coil tendrils, ground stars, snare flowers, sucking pools with trap pads, the cobra meadow at the slopes' foot), one safe path lined with cairns; punji pits, bear-trap plants and numb thorns among the rest, the traps going off on their cycles.", 'new'),
    ('korona', 'korona-basin', 'biomes/korona/dist/korona-basin.html', 'Korona 3 · the fertile basin', "Station 3, the fertile basin: the Tiers' lake, a closed basin in the eastern rings, its shore meadows of reagents, the rainforest behind, one bog corner.", 'new'),
    ('korona', 'korona-trench', 'biomes/korona/dist/korona-trench.html', 'Korona 4 · the trenches', "Station 4, the trenches: a ring ridge's crest between two arms of the salt lake, wet and alive on its windward face, bare desert on its lee: the rule that carnivory follows poor x wet x warm, read across one ridge.", 'new'),
    ('korona', 'korona-gorge', 'biomes/korona/dist/korona-gorge.html', 'Korona 5 · the lee gorge', "Station 5, the lee gorge: a dry gorge between two ring walls in a ring's rain shadow, the eastern desert's flora (the sedesert kit read in place) under the walls, one spring and every trap in Korona round it.", 'new'),
    ('korona', 'korona-hoar', 'biomes/korona/dist/korona-hoar.html', 'Korona 6 · the hoar table', "Station 6, the hoar table: a tepui summit above 3,500 m in the high cold country (the eastern highlands kit read in place): cushions and snow wool leaning toward the giant, the Mother Cushion over a knoll, permanent snow in the lee hollows, melt pools with butterwort lawns, a cold sundew and the frost tank, the seep lines frozen to icefalls, the ice tribes' road-marks and cairns under the rim.", 'new'),

    # The biome rebuild's stations (2026-11-09): a listed build's other pages are never discovered, so each has its line,
    # named "<biome> · <station>" to sort beside its biome's first page; the new multi-page builds' pages likewise.
    ('biome', 'hyperjungle-savanna', 'biomes/hyperjungle/dist/hyperjungle-savanna.html', 'Central hyperjungle · the savanna edge', "Where the hyperjungle thins to savanna at its rim.", 'new'),
    ('biome', 'hyperjungle-lake', 'biomes/hyperjungle/dist/hyperjungle-lake.html', 'Central hyperjungle · the lake', "The lake and the flooded forest, the geyser basin's trees at its edge.", 'new'),
    ('biome', 'hyperjungle-savage', 'biomes/hyperjungle/dist/hyperjungle-savage.html', 'Central hyperjungle · the savage land', "The savage hyperjungle: its traps, its leafsets and its beasts (the Riders' mounts, beetles, spiders, flyers).", 'new'),
    ('biome', 'hyperjungle-north', 'biomes/hyperjungle/dist/hyperjungle-north.html', 'Central hyperjungle · Screamer wood', "Hyperjungle N: Screamer wood, bonewood and howling culms.", 'new'),
    ('biome', 'eastabyss-lakes', 'biomes/eastabyss/dist/eastabyss-lakes.html', 'Eastern abyss · the winding lakes', "Station 2: the abyss floor's chain of winding lakes.", 'new'),
    ('biome', 'sedesert-bowl', 'biomes/sedesert/dist/sedesert-bowl.html', 'Eastern high desert · the Bowl', "The south shore of the Bowl's salt lake at its river's delta: the abyssal salt basin under 1.83 atm.", 'new'),
    ('biome', 'sedesert-mantis', 'biomes/sedesert/dist/sedesert-mantis.html', "Eastern high desert · Mantis's pocket", "The Socotran monsoon forest round the springs on the Bowl's south-west shore, its savanna, the edge of the oasis town.", 'new'),
    ('biome', 'sedesert-steppe', 'biomes/sedesert/dist/sedesert-steppe.html', 'Eastern high desert · the steppe fringe', "Desert-steppe at about 330 mm: the kit's Socotran flora in its steppe forms, kopjes with tors and honeycomb faces, fairy circles.", 'new'),
    ('biome', 'rift-savannah', 'biomes/rift/dist/rift-savannah.html', 'The Rift · the rift savannah', "Gold and violet, open: a lee bench under the central island, grass plains, a dry wash, tors and the salt rim of the lake; giants spaced out.", 'new'),
    ('biome', 'rift-jungle', 'biomes/rift/dist/rift-jungle.html', 'The Rift · the rift jungle', "Teal and violet, closed: the river's mouth on the terminal sea, the delta's channels, frill trees to 140 m, the scarp into the haze.", 'new'),
    ('biome', 'rift-highland', 'biomes/rift/dist/rift-highland.html', 'The Rift · the cloud forest', "Green, grey and white: the central island's face in cloud, elfin forest dripping, the crest's heath knee-high.", 'new'),
    ('biome', 'rift-plateau', 'biomes/rift/dist/rift-plateau.html', "The Rift · Cube's plateau", "The east island's plateau: trees of 20 to 40 m, its families and old stock, the jungle's upper fringe.", 'new'),
    ('biome', 'swlowlands-gorge', 'biomes/swlowlands/dist/swlowlands-gorge.html', 'Southwestern lowlands · the gorge', "Station 2: the lowlands' river gorge.", 'new'),
    ('biome', 'swlowlands-delta', 'biomes/swlowlands/dist/swlowlands-delta.html', 'Southwestern lowlands · the delta', "Station 3: the delta and the floodplain.", 'new'),
    ('biome', 'nwlowlands-margins', 'biomes/nwlowlands/dist/nwlowlands-margins.html', 'Northwestern lowlands · the lake margins', "Station 2: the lake's margins.", 'new'),
    ('biome', 'xanadu-cloud', 'biomes/xanadu/dist/xanadu-cloud.html', 'Xanadu · the cloud slopes', "Station 2: the cloud slopes, the Oidong cherry as a deeper cousin and the mist tea.", 'new'),
    ('biome', 'xanadu-ranges', 'biomes/xanadu/dist/xanadu-ranges.html', 'Xanadu · the high ranges', "Station 3: the high ranges and their conifer belts.", 'new'),
    ('biome', 'xanadu-descent', 'biomes/xanadu/dist/xanadu-descent.html', 'Xanadu · the descent', "Station 4: the cataract and the abyssal south, from the lake's outlet down.", 'new'),
    ('biome', 'xanadu-floor', 'biomes/xanadu/dist/xanadu-floor.html', 'Xanadu · the Rift floor', "Station 5: native Rift flora and tall Xanadu flora competing for the floor.", 'new'),
    ('biome', 'xanadu-gills', 'biomes/xanadu/dist/xanadu-gills.html', 'Xanadu · the White Gills', "Alph's head: the White Gills' pipes, iced and steaming, with their collars, fringes and bellows pads.", 'new'),
    ('biome', 'nhighlands-montane', 'biomes/nhighlands/dist/nhighlands-montane.html', 'Northern highlands · the dry-summer montane', "Station 2: the dry-summer montane forest.", 'new'),
    ('biome', 'nhighlands-foothills', 'biomes/nhighlands/dist/nhighlands-foothills.html', 'Northern highlands · the foothills', "Station 3: the Mediterranean foothills, the lowlands' oaks, sycamore, manzanita and madrone.", 'new'),
    ('biome', 'nhighlands-alpine', 'biomes/nhighlands/dist/nhighlands-alpine.html', 'Northern highlands · the alpine', "Station 4: the alpine on the crater wall's megabreccia steps.", 'new'),
    ('biome', 'nhighlands-bogs', 'biomes/nhighlands/dist/nhighlands-bogs.html', 'Northern highlands · the bogs', "Station 5: the bog country on the Footfall plateau.", 'new'),
    ('biome', 'ebadlands-waste', 'biomes/ebadlands/dist/ebadlands-waste.html', 'Eastern badlands · the hot waste', "Station 1: the sulphur flats with their vents and acid pools, the painted badlands cut into gullies.", 'new'),
    ('biome', 'ebadlands-canyons', 'biomes/ebadlands/dist/ebadlands-canyons.html', 'Eastern badlands · canyons and green valleys', "Station 2: five steps of the canyon staircase, each bed's ledge in the ground.", 'new'),
    ('biome', 'ebadlands-montane', 'biomes/ebadlands/dist/ebadlands-montane.html', 'Eastern badlands · the montane forest', "Station 3: ponderosa and aspen, a wet meadow, a burn of snags and logs.", 'new'),
    ('biome', 'ebadlands-tundra', 'biomes/ebadlands/dist/ebadlands-tundra.html', 'Eastern badlands · tree line, tundra, glacier', "Station 4: the last spruce-fir and krummholz, bristlecones, patterned ground and the glacier.", 'new'),
    ('biome', 'nwbay-caverns', 'biomes/nwbay/dist/nwbay-caverns.html', 'North-west bay · the caverns', "The karst's caverns and dolines under the bay's dry slope.", 'new'),
    ('biome', 'crater-drylands-s', 'biomes/crater-drylands/dist/crater-drylands-s.html', 'Crater drylands · the south', "Station 2: the kiln climbing toward Godstep, old titanium-basalt flows with the black mallee.", 'new'),
    ('biome', 'crater-drylands-edge', 'biomes/crater-drylands/dist/crater-drylands-edge.html', 'Crater drylands · the savannah edge', "Station 3: the belt toward SW Bay, grass fires every year or two, umbrella thorns, baobabs and termite mounds.", 'new'),
    ('biome', 'crater-drylands-salt', 'biomes/crater-drylands/dist/crater-drylands-salt.html', 'Crater drylands · the salt floor', "Station 4: salt pans and brine pools by the Steampits, the kiln's scrub on the salt steppe.", 'new'),
    ('biome', 'shighlands-conifers', 'biomes/shighlands/dist/shighlands-conifers.html', 'Southern highlands · the spiral conifers', "Station 2: the spiral conifers at 3.8 km.", 'new'),
    ('biome', 'shighlands-fellfield', 'biomes/shighlands/dist/shighlands-fellfield.html', 'Southern highlands · the fellfield and the ice', "Station 3: the spiral fellfield and the ice at 5.2 km.", 'new'),
    ('biome', 'ehighlands-face', 'biomes/ehighlands/dist/ehighlands-face.html', 'Eastern highlands · the wet face', "Station 2: the cloud forest at the foot of the Inner Wall's windward face, 1-2 km.", 'new'),
    ('biome', 'ehighlands-lesser', 'biomes/ehighlands/dist/ehighlands-lesser.html', 'Eastern highlands · the Lesser Throne', "Station 3: the young volcano's summit caldera on the Inner Wall's crest, its fumaroles and the life round them.", 'new'),
    ('biome', 'ehighlands-treeline', 'biomes/ehighlands/dist/ehighlands-treeline.html', 'Eastern highlands · the treeline', "Station 4: spruce-fir thinning to flagged trees and krummholz under the crest.", 'new'),
    ('biome', 'ehighlands-mixed', 'biomes/ehighlands/dist/ehighlands-mixed.html', 'Eastern highlands · the mixed belt', "Station 5: the cool rainforest of the wet face, combed beeches, the last laurels, the first firs.", 'new'),
    ('biome', 'ehighlands-montane', 'biomes/ehighlands/dist/ehighlands-montane.html', 'Eastern highlands · the montane belt', "Station 6: fir and beech stands on the wet face.", 'new'),
    ('biome', 'ringisles-high', 'biomes/ringisles/dist/ringisles-high.html', 'Ring Sea isles · the high isle', "Station 2: the island's high ground.", 'new'),
    ('biome', 'ringisles-lagoon', 'biomes/ringisles/dist/ringisles-lagoon.html', 'Ring Sea isles · the lagoon', "Station 3: the lagoon.", 'new'),
    ('biome', 'oidong-passes', 'biomes/oidong/dist/oidong-passes.html', 'The Oidong Valley · the high passes', "Station 2: the high passes out of the valley.", 'new'),
    ('biome', 'oidong-hearths', 'biomes/oidong/dist/oidong-hearths.html', 'The Oidong Valley · the Cold Hearths', "Station 3: the Cold Hearths.", 'new'),
    ('biome', 'geyser-puna', 'biomes/geyser/dist/geyser-puna.html', 'The geyser basin · the high desert field', "Station 2: a geyser field in the high desert.", 'new'),
    ('biome', 'geyser-basin', 'biomes/geyser/dist/geyser-basin.html', 'The geyser basin · the mountain forest field', "Station 3: a geyser field in the mountain forest.", 'new'),
    ('biome', 'geyser-corona', 'biomes/geyser/dist/geyser-corona.html', 'The geyser basin · the corona field', "Station 4: a geyser field in Korona's rings.", 'new'),
    ('biome', 'geyser-ice', 'biomes/geyser/dist/geyser-ice.html', "The geyser basin · the ice field", "Station 5: a geyser field on Xanadu's wall in the ice.", 'new'),
    ('biome', 'geyser-stills', 'biomes/geyser/dist/geyser-stills.html', 'The geyser basin · the Stills', "The Hearths' station 6, the Stills.", 'new'),
    ('biome', 'necanyons-benches', 'biomes/necanyons/dist/necanyons-benches.html', 'The north-eastern canyons · the high benches', "Station 2: the high benches.", 'new'),
    ('biome', 'necanyons-savanna', 'biomes/necanyons/dist/necanyons-savanna.html', 'The north-eastern canyons · the savanna floor', "Station 3: the savanna floor toward Korona.", 'new'),
    ('biome', 'dambasins-east', 'biomes/dambasins/dist/east.html', 'The dam basins: the east bed', "The east bed inside Korona, drained.", 'new'),
    ('biome', 'dambasins-graveyard', 'biomes/dambasins/dist/graveyard.html', 'The dam basins: the ship graveyard', "The ship graveyard at the west notch.", 'new'),
    ('biome', 'abyssal-savannah', 'biomes/abyssal-savannah/dist/abyssal-savannah.html', 'Abyssal savannah', "The rim slope: the climb from the jungle's foot to the bench, gully galleries, parkland and kopjes, the caprock rim, the bench's steppe and pan, the burn mosaic over all of it.", 'new'),
    ('biome', 'abyssal-savannah-serim', 'biomes/abyssal-savannah/dist/abyssal-savannah-serim.html', 'Abyssal savannah · the south-east rim', "The savannah rims, station 1: between Talia and the laterite, the incense country.", 'new'),
    ('biome', 'abyssal-savannah-erim', 'biomes/abyssal-savannah/dist/abyssal-savannah-erim.html', 'Abyssal savannah · the east rim', "The savannah rims, station 2: the east rim near Fridon.", 'new'),
    ('biome', 'abyssal-savannah-north', 'biomes/abyssal-savannah/dist/abyssal-savannah-north.html', 'Abyssal savannah · the north', "The savannah rims, station 3: hyperjungle N's abyssal savannah.", 'new'),
    ('biome', 'catch', 'biomes/catch/dist/catch.html', 'The Catch', "The sealed basin south-east of the Godthrone, walled by 10-17 km crests, 18 mm of rain a year. Station 1, the sand sea: star and linear dunes.", 'new'),
    ('biome', 'catch-oasis', 'biomes/catch/dist/catch-oasis.html', "The Catch · Stair's oasis", "Station 2: the spring hollow, the tugai, the caravans' campground, the tunnel's southern portal.", 'new'),
    ('biome', 'catch-lake', 'biomes/catch/dist/catch-lake.html', 'The Catch · the lake and the lake beds', "Station 3: the terminal soda lake, its crusts and strandlines, a playa pan, yardangs.", 'new'),
    ('biome', 'catch-fan', 'biomes/catch/dist/catch-fan.html', 'The Catch · the north fan and the walls', "Station 4: the gravel fan under the 6.2 km notch, braided dry channels, the gorge mouth.", 'new'),
    ('biome', 'copperglacier', 'biomes/copperglacier/dist/copperglacier.html', 'Copper Glacier', "The southern Crook's glaciers. Station 1, Copper Tarn: a valley glacier calving into the turquoise tarn, the icefall, moraines and ice caves.", 'new'),
    ('biome', 'copperglacier-pass', 'biomes/copperglacier/dist/copperglacier-pass.html', 'Copper Glacier · the copper slope', "Station 2: a hanging glacier over the pass, the skarn's malachite and gossan, the copper nodes.", 'new'),
    ('biome', 'copperglacier-icefield', 'biomes/copperglacier/dist/copperglacier-icefield.html', 'Copper Glacier · the high icefield', "Station 3: plateau ice at 6.5 km, nunataks of gneiss, the ice cliff, ice caves in the wind's moats.", 'new'),
    ('biome', 'cut', 'biomes/cut/dist/cut.html', 'The Cut', "The bowl an Ancient eigenweapon left in the northern Inner Wall when it deleted the bottom of a sphere.", 'new'),
    ('biome', 'cut-wall', 'biomes/cut/dist/cut-wall.html', 'The Cut · the wall', "Station 2: Dilihan's side of the crater mouth, the lowlands' columns leaning along the field, terraces of measure melons.", 'new'),
    ('biome', 'cut-face', 'biomes/cut/dist/cut-face.html', 'The Cut · the cut face', "Station 3: the west lip at 4.8 km, the bare curved face, circle lichen, the whole bowl below.", 'new'),
    ('biome', 'farside', 'biomes/farside/dist/farside.html', 'Farside', "Farport and the kelp coast, where the tsunami reached.", 'new'),
    ('biome', 'farside-front', 'biomes/farside/dist/farside-front.html', 'Farside · the front', "Station 2: the kelp forest meets the land's, dead kauri and meranti hung with wine weed and wrack.", 'new'),
    ('biome', 'farside-strand', 'biomes/farside/dist/farside-strand.html', 'Farside · the strand', "Station 3: eelgrass dunes, sea palms on the surf rocks, spray coral reefs above the waterline.", 'new'),
    ('biome', 'farside-cloud', 'biomes/farside/dist/farside-cloud.html', 'Farside · the fog belt', "Station 4: the native wet forest in perpetual fog, its trunks crusted with fog sponges.", 'new'),
    ('biome', 'godthrone', 'biomes/godthrone/dist/godthrone.html', 'Godthrone', "The Godthrone, station 1: the summit vent, 21 km up.", 'new'),
    ('biome', 'godthrone-wall', 'biomes/godthrone/dist/godthrone-wall.html', 'Godthrone · the caldera wall', "Station 1b: the main wall's six collapse terraces, the floor at its foot, the rim and the sealed portal.", 'new'),
    ('biome', 'godthrone-flank', 'biomes/godthrone/dist/godthrone-flank.html', 'Godthrone · the high flank', "Station 2: the black lava plain at 11 km, a sinuous rille, a pit-crater chain over a tube, frost in the shadows.", 'new'),
    ('biome', 'godthrone-orange', 'biomes/godthrone/dist/godthrone-orange.html', 'Godthrone · the orange belt', "Station 3: the dry-cold line near Pluton, black flows going ochre downslope, palagonite cliffs with tafoni.", 'new'),
    ('biome', 'godthrone-scarp', 'biomes/godthrone/dist/godthrone-scarp.html', 'Godthrone · the basal escarpment', "Station 4: the south-western scarp, a stack of titanium-basalt flows in a cliff 600 m high.", 'new'),
    ('biome', 'godthrone-rim', 'biomes/godthrone/dist/godthrone-rim.html', 'Godthrone · the airless rim', "Station 5: the Outer Wall's crest at 10.9 km, the crater's megabreccia and its overturned flap.", 'new'),
    ('biome', 'godthrone-blood', 'biomes/godthrone/dist/godthrone-blood.html', 'Godthrone · the bloodfalls', "Station 6: the ice belt's southern edge at the head of Qol Drai.", 'new'),
    ('biome', 'godthrone-gills', 'biomes/godthrone/dist/godthrone-gills.html', 'Godthrone · the Red Gill', "Station 7: the Red Gill beside the bloodfalls.", 'new'),
    ('biome', 'godthrone-gills-ladder', 'biomes/godthrone/dist/godthrone-gills-ladder.html', 'Godthrone · the Red ladder', "Station 8: up the south-east flank at 8.2-8.9 km, the Red Gills' cracks iced over.", 'new'),
    ('biome', 'godthrone-tube', 'biomes/godthrone/dist/godthrone-tube.html', 'Godthrone · the Ilmenite Pillar Vault', "Station 9: a sealed lava-tube chamber 58 m under the north shield, 290 by 175 m and 54 m high.", 'new'),
    ('biome', 'hearths-hold', 'biomes/hearths/dist/hearths-hold.html', "The Hearths · the hold's active storey", "Warm water over every floor, scalding at the feeders, gypsum chandeliers, the fumarole.", 'new'),
    ('biome', 'hearths-crystals', 'biomes/hearths/dist/hearths-crystals.html', 'The Hearths · the Cave of Crystals', "The hold's drained storey: selenite beams over a bladed gypsum floor, hot and lethal.", 'new'),
    ('biome', 'highrift', 'biomes/highrift/dist/highrift.html', 'High Rift', "Station 1, the Caldron and the Opaline Cataract: the pool in its sinter bowl, the four-tier cataract, a geyser on the rimstone steps, steam over everything.", 'new'),
    ('biome', 'highrift-mirror', 'biomes/highrift/dist/highrift-mirror.html', 'High Rift · the Mirror', "Station 2: Lake Verdigris under the hematite fault mirror, rift larch parkland, acid springs.", 'new'),
    ('biome', 'highrift-wedge', 'biomes/highrift/dist/highrift-wedge.html', 'High Rift · the Dorsal Wedge', "Station 3: the horst's crest at 4.2 km, tors and patterned ground, both grabens below.", 'new'),
    ('biome', 'highrift-coulee', 'biomes/highrift/dist/highrift-coulee.html', 'High Rift · the Coulee', "Station 4: fire and ice on the old coulee's lobes and flow fronts.", 'new'),
    ('biome', 'highrift-gjar', 'biomes/highrift/dist/highrift-gjar.html', 'High Rift · the Singing Gjar', "Station 5: the plateau pulled apart along the master gja.", 'new'),
    ('biome', 'nwouterwall', 'biomes/nwouterwall/dist/nwouterwall.html', "The NW outer wall", "The Yeti's High Country. Station 1, Leng's forest-steppe: larch, plumegrass and furflowers, an aufeis valley, Leng's ruin on the horizon.", 'new'),
    ('biome', 'nwouterwall-taiga', 'biomes/nwouterwall/dist/nwouterwall-taiga.html', 'The NW outer wall · the taiga and alases', "Station 2: open fur larch on permafrost, alases with their lakes and cottongrass, a pingo.", 'new'),
    ('biome', 'nwouterwall-yeti', 'biomes/nwouterwall/dist/nwouterwall-yeti.html', 'The NW outer wall · the Yeti Valley', "Station 3: the Three Gifts' irrigated fields round the frozen lake, the capital's pycrete halls, the airless rim over it.", 'new'),
    ('biome', 'riftrim', 'biomes/riftrim/dist/riftrim.html', 'The rift rim', "The high country round the Rift, three biomes on one kit. Station 1, Ledge and the great lake on the veiled rim.", 'new'),
    ('biome', 'riftrim-lakes', 'biomes/riftrim/dist/riftrim-lakes.html', 'The rift rim · the north rim lakes', "Station 2: the glass rim's lakes, the Rift's cloud forest borrowed.", 'new'),
    ('biome', 'riftrim-ice', 'biomes/riftrim/dist/riftrim-ice.html', 'The rift rim · the cold lake', "Station 3: the black rim's cold lake, alpine giants in the sheltered hollows.", 'new'),
    ('biome', 'riftrim-gorge', 'biomes/riftrim/dist/riftrim-gorge.html', 'The rift rim · the gorge', "Station 4: the veiled rim's gorge, cork oak, veil willow and tier cedar.", 'new'),
    ('biome', 'riftrim-pass', 'biomes/riftrim/dist/riftrim-pass.html', 'The rift rim · the crossing', "Station 5: the pass at 6-8 km, where nothing borrowed grows.", 'new'),
    ('biome', 'riftrim-barrens', 'biomes/riftrim/dist/riftrim-barrens.html', 'The rift rim · the black barrens', "Station 6: the black rim's barrens, giant groundsel in the hollows.", 'new'),
    ('biome', 'swhighlands', 'biomes/swhighlands/dist/swhighlands.html', 'The ring folds', "South-western highlands, station 1: a ridge with an arch, a water gap, lattice oaks and bead cones, the river cave and the chevron fold.", 'new'),
    ('biome', 'swhighlands-pillars', 'biomes/swhighlands/dist/swhighlands-pillars.html', 'The ring folds · the pillar rim', "Station 4: red and white towers in mist with anemone trees on their tops, the green floor and Pan Riba's meanders.", 'new'),
    ('biome', 'swhighlands-pillars-span', 'biomes/swhighlands/dist/swhighlands-pillars-span.html', "The ring folds · the pillar rim with Span's post", "The pillar rim with a frozen snapshot of Span's watch post on the watch pillar.", 'new'),
    ('biome', 'swhighlands-treeline', 'biomes/swhighlands/dist/swhighlands-treeline.html', 'The ring folds · the treeline', "Station 6: the dry-summer woods under the crest, bottle brushes and whorl columns, the fellfield and a cirque.", 'new'),
]


THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

# Builds new to the gallery are listed without an ENTRIES line (discover): a build in one of these folders with no
# page above. One page joins its kind's section; several make a section of their own after it. Names come from the
# pages' <title>s, the description from the build's README.md or INDEX.md. An ENTRIES line replaces all of that.
KINDS = {'settlements': 'world', 'openworld': 'world', 'biomes': 'biome', 'kits': 'kit'}
UNLISTED = {'settlements/isle-demo'}   # build folders ('kits/furniture') never to list,
# though they have pages; the isle demo's site planner is a tool that saves through its own serve.py. Pinnacle Rock
# was listed once its town and its night were built (the owner, 2026-10-19)
# Builds published as their own artifact, each with the script that makes its site: left out of the Krator Worlds
# artifact (gallery/site/), whose index links to them instead (index.template.html), but kept in any other --out site
# (the LAN host's), where size does not matter. The Throne's eleven stations are about 25 MB with their shared maps.
ELSEWHERE = {'biomes/throne': 'gallery/build_throne.py',
             # the Ancients kit (city kits and arcologies) and the Ancient Port: about 105 MB with their shared packs
             'kits/ancients': 'gallery/build_ancients.py', 'kits/port': 'gallery/build_ancients.py',
             # Longsong: about 69 MB (its page, three packs and the dressed people's pieces, dist/kchar/), published as built
             # from settlements/longsong/dist (gallery/README.md, "Longsong: its own artifact")
             'settlements/longsong': 'settlements/longsong/build.py',
             # the Eternian kit: about 24 MB (its page and two packs), published as built from kits/eternian/dist
             # (gallery/README.md, "The Eternian kit: its own artifact")
             'kits/eternian': 'kits/eternian/build.py',
             # Voth's city plan: 19.7 MB, over 16 MB a file, and it made Krator Worlds P-V fail the sharing review
             # (2026-10-23); its own artifact. A page, not a build folder: the Voth catalog (voth-catalog) shares the
             # folder and stays in the parts
             'settlements/voth/dist/voth-city.html': 'settlements/voth/build.py',
             # the Isle Demo: about 84 MB with its packs, its own artifact since the live I-S index was edited in place
             'openworld/isle-demo': 'openworld/isle-demo/build.py'}
# Pages a build's own build.py does not write: made by another command in the build's folder, before the page is
# copied. Girder Hero is too big for the gallery as build_hero.py writes it (20.5 MB, over 16 MB a file), so the
# gallery takes the --slim one, written outside the committed pages (hero/dist/ is not committed).
# Builds published as their own artifact that still get a card in the parts (the owner, 2026-10-20): the card sorts
# under its letter in its section like any other and opens the build's artifact (href) instead of a page in worlds/.
# section, slug, name, blurb, the artifact, the build's files that make up its size (globs under the build folder)
THRONE_URL = 'https://claude.ai/artifact/TJaH7TYHoZf4p56C1i5xcX'   # the Throne Stations (gallery/README.md)
LINKED = {
    'kits/eternian': ('kit', 'eternian', 'Eternian Kit',
                      "The Eternal State of the north-western lowlands, where the True Heirs keep the Ancients' works: canal "
                      "houses of every tier, the State's ministries and exam halls, the Clock, the hexagonal kilns, works and "
                      "trades, the canals and the harbour, every building furnished, and closed-eyed faces in gold, bronze and "
                      "lead. Its own artifact.",
                      'https://claude.ai/artifact/VahvUzsCKyDZjtoZBu5Txu', ['dist/eternian.html', 'dist/eternian.tex.*.js']),
    'settlements/longsong': ('world', 'longsong', 'Longsong',
                             "The History Monks' monastery on its rock in the Oidong Valley: the White and Red Palaces "
                             "furnished room by room, the ward, the farms, the forbidden depths and the Procrastinator turning "
                             "under them; 1,494 people on their day (the nearest dressed and walking), day and night, and the "
                             "festival with its great thangka. Its own artifact (its people's clothes and bodies need the room).",
                             'https://claude.ai/artifact/H8dwc8PQetUMZBHo5NkJUY',
                             ['dist/longsong.html', 'dist/longsong.tex.*.js', 'dist/kchar/*']),
    'settlements/voth/dist/voth-city.html': ('world', 'voth', 'Voth', next(e[4] for e in ENTRIES if e[1] == 'voth') + ' Its own artifact (Voth City Plan).',
                                             'https://claude.ai/artifact/1W4BzV1Ss4VPUhcWG6zfsy', ['']),
    'openworld/isle-demo': ('world', 'isle-demo', 'Isle Demo (open world)',
                            next(e[4] for e in ENTRIES if e[1] == 'isle-demo') + ' Its own artifact.',
                            'https://claude.ai/artifact/8Gwe3uUG9Ex86Mp3YbHXEM', ['dist/isle-demo.html', 'dist/isle-demo.tex.*.js']),
}

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
            if build_dir(path) in skip_built or path in skip_built:
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
    entries = sorted([e for e in ENTRIES if build_dir(e[2]) not in skip and e[2] not in skip] + found,
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
    for d, (section, slug, name, blurb, url, files) in LINKED.items():   # a card for each, opening its own artifact
        if d not in skip:
            continue
        size = sum(os.path.getsize(f) for g in files for f in glob.glob(os.path.join(ROOT, d, g) if g else os.path.join(ROOT, d)))
        items.append({'section': section, 'slug': slug, 'name': name, 'blurb': blurb, 'mb': round(size / 1048576, 1),
                      'source': d, 'tag': 'new', 'href': url})
    if 'biomes/throne' in skip:   # the Throne's stations: a card each, in station order, opening the Throne's artifact
        import build_throne
        for n, pg, name, blurb in build_throne.stations():
            src = os.path.join(ROOT, 'biomes/throne/dist', pg)
            if not os.path.isfile(src):
                continue
            side = re.findall(r'<script src="([^"]+\.tex\.[\w-]+\.js)"></script>', open(src, encoding='utf-8').read())
            size = os.path.getsize(src) + sum(os.path.getsize(os.path.join(ROOT, 'biomes/throne/dist', f)) for f in side
                                              if os.path.isfile(os.path.join(ROOT, 'biomes/throne/dist', f)))
            items.append({'section': 'throne', 'slug': 'throne-' + os.path.splitext(pg)[0],
                          'name': 'Throne %d · %s' % (n, name[:1].lower() + name[1:]), 'blurb': blurb,
                          'mb': round(size / 1048576, 1), 'source': 'biomes/throne/dist/' + pg, 'tag': None,
                          'href': THRONE_URL, 'order': n})
    items.sort(key=lambda i: (i.get('order', 0), alpha(i['name'])))   # the stations keep their order in their section
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
    total = sum(os.path.getsize(os.path.join(site, 'worlds', i['slug'] + '.html')) for i in items if not i.get('href'))
    print('wrote %s/: %d pages, %.1f MB' % (os.path.relpath(site, ROOT), len(items), total / 1048576))


if __name__ == '__main__':
    main()
