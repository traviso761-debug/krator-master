#!/usr/bin/env python3
"""Write INDEX.md at the repo root and in every build folder.

A build's INDEX.md lists each src/ fragment with its size and section
headings, so an agent can find the part it needs without opening large
files. The root INDEX.md lists every build.

Usage:  python3 tools/make_index.py      (from anywhere; rewrites every INDEX.md)
"""
import ast, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# core modules that are builds of their own (a build.py and src/): indexed and audited like a kit
CORE_BUILDS = ['core/charactermodels']
BIG = 30 * 1024          # CLAUDE.md: never read a fragment this size whole

ABOUT = {
    'biomes/throne': "The Throne: the central volcano. Station 1, the plume's edge on the south-east shoulder: a rift of cones, an acid lake, lava flows of every age (the kit's flow model), the shoulder's familiar trees giving way under the plume to Krator's own glowing life.",
    'settlements/voth': "Voth: a Venice/Vivec-like Dunmer city on an enclosed brackish bay: the city plan on core/city with its citizen simulation (dist/voth-city.html) and the site editor (dist/voth-site.html). src/ is Voth's source library, the first Voth's fragments (its page is retired: archive/voth-first), which build.py runs whole or lifts by name; catalog/ is Voth's building catalog.",
    'settlements/yuni': 'Yuni: the city, plus its building-kit and plant sheets (its furniture is in kits/catalog).',
    'settlements/dalab': 'Dalab: the mound settlement of the southwestern lowlands, and its building set.',
    'settlements/highlands': 'Highlands: Republican, Rustic and Tribal building kits for the temperate highlands of the Inner Wall, and the town of Roketstad.',
    'settlements/iziz': 'Iziz: the city rebuilt on the Iziz Vernacular style and the Ancients kit.',
    'settlements/reedlake': 'Reed Lake: a floating reed-lake village and its kit.',
    'settlements/screamers': 'Hexahedron: the Screamers\' tribal village in and under a ruined arcology, forked from the Ancients kit.',
    'settlements/locus': 'Locus: a fork of the Yuni engine in the eastern abyss, with its own kit sheet and plant catalogue.',
    'settlements/dhelv': "Dhelv: the Zeijani's capital, carved into an old spur on the Throne's flank: the hall under its dome, the light wells' grassy floors, the braid of ways, the catacombs and the cistern, the outpost at the west foot; 650 ramblers on core/simulation; the Godot case (godot/: dhelv).",
    'kits/zeijani': "The Zeijani building kit: carved and built dwellings, galleries, estates, shops, the temple, council, kiva, cistern, portal, works and the outpost, each carved by the cavern module (core/terrain/39-core-cavern.js) from the void plans in kits/interiors/sets/zeijani.js.",
    'settlements/verge': 'Verge: twin cities at the top and foot of an 860 m descent into the eastern abyss (Iziz Vernacular above, Yuni and Eastern Abyssal below), joined by a switchback trail; caravans, porters and nomads on a timetable; a Godot twin of its life layer.',
    'settlements/girder': 'Girder: an outlying Beast Rider village in the central-crater hyperjungle.',
    'settlements/longsong': "Longsong: the History Monks' monastery in the Oidong Valley, built in situ on the scale model (px 954,1296: the region cut in region/, the open world's fields read in place) on its own granite rock over the Longsong stream (PLAN.md): the plan as data (src/40-ls-plan.js: the rock, the ward, 30 buildings, the Vault, the sealed things, 162 people and their schedules), the Order's architecture in stone, lime and fired brick (Tibetan massing in the chapterhouses' neo-African forms: brick drums under terracotta cones, parabolic arcades, glyph panels, the mosaic course, the Archive's wavy roofs and louvre tower; no earth), the farms and gardens on the Crops kit (src/40b-ls-farms.js), the SCP-like register's dress, the forbidden depths with the Procrastinator, the Oidong kit read in place, the far land to 60 km. Verified: build.py, verify.py --assert. Read README.md",
    'settlements/pinnacle-rock': "Pinnacle Rock: the Beast Riders' roost town on a red sandstone mesa at the hyperjungle's north-eastern edge (PLAN.md). So far the rock and the site (P0-P1): the mesa, its ten fins, the Garden and spurs as KSTACKS records from the settled plan (src/40-pr-layout.js), the necanyons and hyperjungle kits read in place, the floor and the far land to 60 km from the scale model (region/: its cut; the open world's fields read in place); and the roosts (P2): deck rings fitted to the stacks, Girder's stalls and perches, climbs, rope bridges, the two lifts and the Stair as records (src/43-pr-roosts.js, PRR) drawn in the Beast Riders kit's maps, and Girder's flyers read in place on them (flyers/); and the town on the top (P3a): one core/city instance (src/54-pr-town.js, PRT) laid from the settled zones, about 600 of the Beast Riders kit's buildings and its ports, instanced; and the farms (P3b): six terraces of field cells inside the palisade (src/55-pr-farms.js, PRF), twelve farmhouses, the gates; and the bands' grounds (P3c): BR_CAMP's eighteen grounds on the top and the floor, hedged, with their tracks (src/56-pr-camps.js, PRC); and the Deep Root cavern (P3d) on core/terrain's KCAVERN: the court, the passage of the tribes, the hall, the light well, the kit's rock-cut dressing (src/57-pr-cavern.js, PRD); and the Garden (P3e): its stair and ramp and the stair up the Heart, its great-houses round the Heart (src/58-pr-garden.js, PRG); and the night (necanyons' 89n-host-night.js read in place, the fires and lamps on core/atmos: src/89y-host-night.js). Verified: build.py, verify.py --assert. Read README.md",
    'settlements/noahs-regret': "Noah's Regret: an Ancient floating harbour city of the Ring Sea, aground on the south shore, Bloody Ruephus's pirate base: a catamaran of two hulls joined at the bow, the harbour open astern (holds half full of the sea, four decks, rounded terraced sterns, scalloped balconies), the grand atrium, the bridge, the grand dining room, twin silent engine rooms, two crew messes, the greenhouse, fifteen ship's rooms, the bridge house with the bridge on top, a forecourt plaza over the forward third of the harbour with terraces and a grand stair, nine Ancient buildings (barracks, a mess hall, the HQ under his flag on the plaza), the liner mole and finger piers, every room furnished from the catalog through the interiors kit, a deck cut to see inside; no life layer yet.",
    'settlements/mavs-refuge': "Mav's Refuge: a refuge in the hypertropic jungle on the lee shore of the Ring Sea.",
    'settlements/port': 'The Ancient Port kit (a kit, not a settlement, despite the folder): modular Ancient port segments and vessels tiling along a coast, a sibling of kits/ancients built the same way. It will build Hook (the ancient port city recently retaken from Voth, LORE.md) and may serve other coasts after. Read CONTRACT.md, then API.md.',
    'settlements/hook': "Hook: the Ancient port city of the Ring Sea's south-western shore, the Izani Empire's premier port, retaken from Voth a few months before game start (LORE.md 6.2; PLAN.md). Built on the Ancient Port kit (settlements/port), read in place: P0 is the waterfront, every Port segment and vessel placed at least once in one coastal run with the Customs' and the Sun Canton's land blocks behind and the hooked L of sea platforms off the great pier.",
    'settlements/ys': 'Ys: the half-drowned Hykkousoi capital on the ruins of an Ancient city at the head of the north-west bay of the Ring Sea (phase 2: the Hykkousoi kit, 89 pieces on the kit sheet; phase 3 prep: the layout, shore and nav).',
    'settlements/xanadu': 'Xanadu: the building kit of the southern Sultanate (Tibetan massing, Indian, Turkish and Persian detail) and the city of Erewhon.',
    'settlements/mungo': "Mungo: a trade village at a river mouth on a salt lake in the Eastern Abyss: a floating reed village (the Reed Lake kit, run inside the page; Reed's Local), one pontoon to an Eastern Abyssal town, the Geomancers' chapterhouse among Yuni houses with their dune buggies. Shares the Locus engine and kits by name (build.py); the first world on core/simulation (SIM) and core/clock: a scheduled life layer whose data is world/*.json.",
    'settlements/shade': "Shade: the Eastern Nomads' sunken basin in the eastern high desert (falls, pool, carved face, switchback, slot canyon) on the sedesert biome kit: rock-cut and pueblo buildings, cliff dwellings round the rim, alcoves and an undercut behind the falls, the life layer's data and walkable grid.",
    'openworld/little-demo': "Little Demo: the scale model's eastern desert region at 1:1 (1.3 million km2), streamed: terrain from the scale model's heights, the sedesert, eastabyss, hyperjungle and ebadlands kits' flora placed by climate as cell-seeded instances, settlements marked.",
    'kits/mechs': 'Mechs: animated walking machines any world takes as one bundle (KratorMechs: a skinned rig, leg IK with planted feet, idle, walk and attack clips with fire and impact events, swinging banners and feathers) on the catalog core; seventeen Iziz walkers, from a hound-sized drone to a walking siege tower (the Castra in two variants); a verified kit sheet with a z-fighting audit.',
    'kits/motor-vehicles': 'Motor Vehicles: procedural motor vehicles any world takes as one bundle (KratorVehicles: wheels to spin and steer, switchable lamps, simulation data) on the catalog core; five vehicles in five culture files (the Geomancer dune buggy, the Republic salvage crawler, the Izani six-wheeler, the Abyssal caravan truck, the Post-Apoc tracked hab); a verified kit sheet.',
    'kits/ringsea': 'Ring Sea watercraft: 31 procedural vessels (warships, cargo ships, barges, canoes, outriggers, rafts) of the cultures round the Ring Sea.',
    'kits/pylon': "Pylon: Iziz's vassal arcology city round the ruined Monolith, its post-Cataclysm buildings imitating the Ancients in white render and Iziz orange; built on the Iziz Vernacular contract (settlements/iziz/build.py --kit), so the Vernacular stands beside it on the sheet (the mixed street). PLAN.md is the design.",
    'kits/talia': "Talia: Iziz's vassal university and caravan city at the foot of the eastern passes, Greek and Byzantine forms with baroque and Indian dress, white with Iziz orange; built on the Iziz Vernacular contract (settlements/iziz/build.py --kit), so the Vernacular stands beside it on the sheet (the mixed street). PLAN.md is the design.",
    'kits/fauna': "The Fauna kit: one kit for every animal (KratorFauna), data first: tags by biome and climate, diet, activity and temperament; traits (edible, milkable, tameable, rideable, draught, eggs), yields and life on every animal; drawn as parts that idle, graze, walk, fly and swim by gait. 51 species gathered from every biome kit and settlement (farm stock, mounts, desert, bay, abyss and hyperjungle fauna, giant flyers and crawlers, Voth's beasts) and drawn for the cultures (the Scyvoi's bison, the Ash Nomads' staghorn beetle and ash runner, the Beast Rider tribes' missing mounts: riding tiger, riding raptor, threehorn, hardshell, jungle mammoth), each listing the builds that draw it; a verified sheet with a check that every Beast Rider tribe has its mount.",
    'kits/scyvoi': "The Scyvoi kit: the salamander riders of the crater drylands, gers and Tibetan tents in polychrome and appliqué. Five small and five large tents (gers, a bell tent, goat-hair tents, a white appliqué tent and a gur, two Tibetan halls, an appliqué tent), the chief's great tent and carved vardo, the shaman's ger, the smithy, hidemaker, supply and cartwright's tents, all furnished from the catalog's Scyvoi culture (core/furnish) with a cut-away; salamanders (riding, war, draught), goats, bison and cattle from kits/fauna with life data and their pens, chariots and carts, tethering; and the Baelu, a fitted-stone fire redoubt. Its engine (the KIT record, materials, tent kit, scene) is vendored by the Desert and Ash Nomads kits; a verified kit sheet.",
    'kits/desert-nomads': "The Desert Nomads kit (catalog culture nomad, the Eastern Nomads): the camel nomads of the eastern high desert and the eastern abyss. Black goat-hair tents, khaimas, square hair-cloth tents, white caidal tents, a Tuareg leather tent, the Saharan pavilion (austere outside: brown or white with simple contrasting bands; Moroccan and Arabian inside, muted), the sheikh's tent and guest pavilion, the seer's tent, the hookah tent, smithy, hidemaker and supply tents; camels (riding, war, pack), horses, riding and pack lizards with tack, a camel cart and litter, goats, sheep, cattle and emus in zaribas and folds; forked from kits/scyvoi; a verified kit sheet.",
    'biomes/ringisles': "The Ring Sea isles biome kit (the isle demo, settlements/isle-demo/PLAN.md): one kit whose zones follow the scale model's climate classes (XA, Af, Am rainforest; Aw, XV tall-grass savanna in a burn mosaic; BSh hot steppe; XS salt steppe and pans), with the strand, a mangrove lagoon, a reef flat, tide pools, a geyser field and town gardens of the owner's crops (coconut, mango, banana, coffee, cloves, breadfruit; rice, taro, sweet potato, kava, herbs, greens, sugar cane). Borrows the Throne, swbay, eastabyss, sedesert and geyser kits' species in place; the showcase is one synthetic island. Verified: build.py, verify.py --assert.",
    'kits/eternian': "The Eternian kit (catalog culture eternian): the Eternal State of the north-western lowlands, Gothic remixed with Art Deco, the Soviet monumental and the faceted head (PLAN.md). So far P0: the Scyvoi engine vendored, the toolkit (walls with shuttered openings under stepped heads, the household's mask over every door, the oculus, flutes, stepped parapets, cast pattern block) and the canal house, furnished from the catalog's Eternian pieces. The capital's arcology and the Heirs' Sanctum are kits/ancients/targets/coil. Verified: build.py, verify.py --assert. Read README.md",
    'kits/beast-riders': "The Beast Riders kit (catalog culture beast-rider): the riders' buildings as a set of their own, on the catalog's engine: its own mounts' buildings (the raptor stable with its paddock, the great byre for threehorns and hardshells, the rookery tower for the flyers) and Girder's and Mav's Refuge's thirteen (kits/catalog, read in place); the sedentary trades for every Voth census trade without electricity (BR_TRADES) and the larger houses and the farmhouse (src/51-54); the rock-cut pieces and the Deep Root cavern's dressing (BR_ROCK, src/55-56; rooms in kits/interiors/sets/beast-rider-rock.js); the tent set of hide domes and barrel pavilions with every Scyvoi trade, the pens and trainers, the thorn hedge and rail fence, and BR_CAMP, each of the twelve tribes' camp (src/70-79); the library's detail maps at building scale; the catalog's inspector, hover and polygon tools. Verified: build.py, verify.py --assert. Read README.md",
    'settlements/isle-demo': "The isle demo (roadmap stage 6's example): PLAN.md, the assay and the plan for two Islander towns on the Ring Sea isles; the site planner (dist/isle-site.html, P4): Voth's site editor read in place on the open world's ground, one town at a time in its own frame, saving both towns to site/isle-site.json through serve.py; the city page (dist/isle-city.html, P6): Kautoa and Valapo on core/city from the owner's site file scaled to the town (tools/scale-site.js), on the Islanders kit, the Iziz Vernacular (Izanitown) and the catalog's Beast Rider buildings (Ridertown), with harbours, vessels, the wall and farmland; verify.py --assert and tests/test-isle-city.js",
    'openworld/isle-demo': "Isle Demo: the scale model's Ring Sea isles at 1:1 (the isle demo, settlements/isle-demo/PLAN.md, P3): an archipelago of about 9,800 km2 of land in 128 x 250 km, Kautoa and Valapo marked, twelve geyser vents. The world is openworld/little-demo's, read in place; this build adds the isles' fields (the climate classes as weights, the coast), its config and its kit registry (empty until the flora step).",
    'kits/resources':"The Resources kit: world content that belongs to no culture. So far the resource nodes the building kits' works draw on: iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter and oil, each in a low, a medium and a high grade, placeable. A mine works the nearest node it can within 400 m (everything but oil); oil takes a derrick (Locus's pumpjack, ind_pumpjack); the grade sets the yield (x0.5, x1, x2); nodes do not run out. The rule (42r-res-ore.js) is plain data for core/simulation. Runs on the Scyvoi engine, read in place; kits/islanders reads its two fragments in place.",
    'kits/islanders': "The Islanders kit (catalog culture islander): the Ring Sea Islanders in two related styles. The WEST builds after the Indonesian rumah (long houses on piles under saddle roofs sagging into horns: gonjong spikes, Batak gables, Toraja prows; black palm thatch, red-black-white painted gables); KAUTOA, the old island kingdom of the EAST, after Sumba (spire towers over golden thatch skirts, woven facades, megalith tombs). Each: three poor (patched with scrap: corrugated iron, tin, tarps, tyres), three middle and three rich houses, a village hall, a ceremonial square, a school, farms, granaries, a turning windmill, a warehouse, a smithy, six shops, a fishing dock, a great dockyard, palisade or wall, gate, watch tower and barracks; Kautoa's palace of seven courts under a 44 m spire; carved posts, buffalo horns and the white island moon shared by both; farm stock from kits/fauna, placeholder crops, the shore and the Ring Sea; forked from the Scyvoi engine; a verified kit sheet.",
    'kits/ash-nomads': "The Ash Nomads kit (catalog culture ashnomad): the beetle riders of the ash plains. Peaked tents of every kind, black to grey under ornate yellow and red Nazca and Dunmer patterns: spire tents, hide domes, ridge and petal bell tents, the star tent, the chieftain's five-spired tent, the assembly and mess hall under its sun disc, the shaman's hut, smithy, chitin worker and supply tents; staghorn beetles (riding, war, pack), pack millipedes, herds of millipedes and six-legged runners in their pens; no wheels; forked from kits/scyvoi; a verified kit sheet.",
    'kits/post-apoc': 'The Post-Apoc set: reclaimed and recycled buildings (containers, silos, tanks, buses, bulkheads, tyre and bottle walls) with sockets for any culture\'s marks.',
    'kits/ancients': 'The Ancients kit: ruined megastructures of the ancient civilisation, 33 structure types, one target per site.',
    'kits/interiors': 'Interiors: ROOM() registration and an engine-neutral furniture placer (ported from Yuni) with a catalog adapter; building planner (storeys, partitions, stairs), walkers and a light budget; the building SETS (Highlands, Post-Apoc, Beast Rider, Locus, Abyss, Reed Lake, Yuni: every building\'s rooms as data, the residence rule checked); a verified demo, a sets sheet, and a walkable mockup of furnished rooms inside the real buildings.',
    'kits/ancients-interiors': 'Ancients interiors: the Ancients\' ship interiors backported from Noah\'s Regret, on kits/interiors: the ship\'s room kinds as programmes (sick bay, chart room, strongroom, armoury, brig, sail loft, laundry), ship\'s rooms and cabins as room shapes, and fourteen hall recipes (crew mess, dining hall, greenhouse, engine room, bridge, officers\' hall, chart deck, chain locker, store hall, drill hall, gallery, stern lounge, plaza, quay) in two dresses (as built, as the pirates hold them), each audited; a verified demo sheet.',
    'kits/catalog': 'The master catalog: asset engine, the parametric furniture kit and 1674 furniture pieces (kits/furniture SPEC shape, palette-keyed, tiered poor/common/court, plus trade and household pieces: forge, anvil, stall, vat, still, bunk, larder ..., and the furniture harvested from the Highlands, Post-Apoc, Beast Rider and Abyss kits) over 25 cultures, one file per culture, with generic goods (containers, food, drink, supplies), biome fruit and a jobs file (work items by trade); a verified contact sheet in five pages (indoor, outdoor, both, rugs, jobs).',
    'core/charactermodels': 'Characters: MakeHuman (MPFB2) bodies with morphing face, build and ancestry; library clothes, hair and beards that follow the morphs; skin and hair tint; peoples (data/peoples.json) that keep a culture\'s strangers in range; two pages: the Cosmetic Lab (one figure, every look; strangers in bulk for NPCs) and the Animation Lab (six bodies, every clip, a review mark per clip); a Godot twin (godot/krator/character/, behind).',
}
# Files that are generated or duplicated elsewhere: never edit or read them whole.
GENERATED = {
    'settlements/yuni/src/61a-ancients-kit.js': 'generated by tools/gen_ancients.py: a patched copy of the Ancients kit',
}
GENERATED.update({'settlements/yuni/src/61a%d-ancients-kit-%s.js' % (i + 1, n):
                  'generated by tools/gen_ancients.py: part %d of the patched Ancients kit (61a)' % (i + 1)
                  for i, n in enumerate(['helpers', 'civic', 'towers', 'towers2', 'houses', 'works', 'factory'])})
RE_SECTION = [re.compile(r'^/\*\s*={3,}\s*(.+?)\s*=*\s*(?:\*/)?\s*$'),
              re.compile(r'^//\s*-{8,}\s*(\S.*?)\s*$')]



def fsize(p):
    """A file's size with CRLF counted as LF, so a Windows checkout (core.autocrlf) indexes the same sizes."""
    with open(p, 'rb') as fh:
        return len(fh.read().replace(b'\r\n', b'\n'))


def sections(path):
    out = []
    with open(path, encoding='utf-8', errors='replace') as fh:
        for n, line in enumerate(fh, 1):
            for rx in RE_SECTION:
                m = rx.match(line)
                if m:
                    t = re.sub(r'\s*={2,}.*$', '', m.group(1)).strip(' *')
                    if t:
                        out.append('%s (%d)' % (t[:48], n))
                    break
    return out


def kb(n):
    return '%d' % round(n / 1024) if n >= 1024 else '<1'


def core_files(build):
    """Files a build pulls from core/materials/ (see srcpath() in its build.py)."""
    bp = os.path.join(ROOT, build, 'build.py')
    text = open(bp).read()
    if 'CORE_FILES' not in text:
        return []
    d = os.path.join(ROOT, 'core', 'materials')
    out = [f for f in os.listdir(d) if f[0].isdigit()]
    m = re.search(r'^CORE_OPT_FILES\s*=\s*(\[[^\]]*\])', text, re.M)   # opt-in files from core/materials/opt/
    if m:
        out += ['opt/' + f for f in ast.literal_eval(m.group(1))]
    return sorted(out, key=lambda f: f.split('/')[-1])


def core_lists(build):
    """The core/biome and core/terrain fragments a build lists (CORE_BIOME, CORE_TERRAIN in its build.py)."""
    import ast, re
    out = []
    for line in open(os.path.join(ROOT, build, 'build.py'), encoding='utf8'):
        m = re.match(r'\s*(CORE_BIOME|CORE_TERRAIN)\s*=\s*(\[.*\])', line)
        if m:
            files = ast.literal_eval(m.group(2))
            if files:
                out.append(('core/biome' if m.group(1) == 'CORE_BIOME' else 'core/terrain', files))
        # the host shell (core/host/host.py): CORE_HOST = khost.SHELL, khost.FULL, khost.SHELL+[...], a comprehension over them,
        # or a literal list: the expression is evaluated against host.py itself, nothing else in scope
        m = re.match(r'\s*CORE_HOST\s*=\s*([^#\n]+)', line)
        if m:
            import importlib.util
            spec = importlib.util.spec_from_file_location('khost', os.path.join(ROOT, 'core', 'host', 'host.py'))
            mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
            try:
                files = list(eval(m.group(1).strip(), {'__builtins__': {}}, {'khost': mod}))
            except Exception:
                continue
            for where in sorted(set(mod.WHERE.get(f, 'host') for f in files)):
                fs = [f for f in files if mod.WHERE.get(f, 'host') == where]
                out.append(('core/' + where, fs))
    return out


def frag_table(build, folder, rel):
    rows = []
    for f in sorted(os.listdir(folder)):
        p = os.path.join(folder, f)
        if not os.path.isfile(p) or not f[0].isdigit():
            continue
        size = fsize(p)
        note = GENERATED.get('%s/%s/%s' % (build, rel, f))
        secs = '; '.join(sections(p)[:10]) if f.endswith('.js') else ''
        flag = ' **big**' if size >= BIG else ''
        rows.append('| `%s` | %s%s | %s |' % (f, kb(size), flag,
                                          ('*%s.* ' % note if note else '') + secs))
    return rows


def outputs(build):
    d = os.path.join(ROOT, build)
    out = [f for f in sorted(os.listdir(d)) if f.endswith('.html') and not f.startswith('.')]
    if os.path.isdir(os.path.join(d, 'dist')):
        out += ['dist/' + f for f in sorted(os.listdir(os.path.join(d, 'dist'))) if f.endswith('.html')]
    return out


def build_index(build):
    d = os.path.join(ROOT, build)
    src = os.path.join(d, 'src')
    lines = ['# %s: index' % build, '',
             '*Generated by `tools/make_index.py`. Do not edit; rerun it after adding or splitting fragments.*', '']
    if build in ABOUT:
        lines += [ABOUT[build], '']
    docs = [f for f in sorted(os.listdir(d)) if f.endswith('.md') and f != 'INDEX.md']
    if docs:
        lines += ['Docs: ' + ', '.join('`%s`' % f for f in docs), '']
    outs = outputs(build)
    if outs:
        lines += ['Built output (never open it; edit `src/` and rebuild): ' + ', '.join('`%s`' % f for f in outs), '']
    lines += ['Build: `cd %s && python3 build.py`. Fragments are concatenated in filename order.' % build]
    if 'def units(' in open(os.path.join(d, 'build.py')).read():
        lines += ['Files that share a numeric prefix (`78a-`, `78b-`) are one fragment split into parts: '
                  'one `reseed(N)` stream, one unit for the build rules.']
    lines += ['Fragments marked **big** are over 30 KB: find the section below and read only that range.', '']
    cf = core_files(build)
    if cf:
        lines += ['From `core/materials/` (shared; see `core/README.md`): ' + ', '.join('`%s`' % f for f in cf), '']
    for where, files in core_lists(build):
        lines += ['From `%s/` (shared; see `core/README.md`): ' % where + ', '.join('`%s`' % f for f in files), '']
    top = [f for f in sorted(os.listdir(d)) if f.endswith('.js') and not f.startswith('.') and f != 'three.min.js']
    if top:
        lines += ['## Top-level sources', '',
                  'Read by `build.py` in its own order (`SOURCES`), and loaded by path by other builds, so they stay here.', '',
                  '| File | KB | Sections (line) |', '|---|---|---|']
        for f in top:
            p = os.path.join(d, f)
            size = fsize(p)
            lines.append('| `%s` | %s%s | %s |' % (f, kb(size), ' **big**' if size >= BIG else '',
                                                  '; '.join([t for t in sections(p) if not t.startswith('= (')][:10])))
        lines += ['']
    lines += ['## src/', '', '| Fragment | KB | Sections (line) |', '|---|---|---|']
    lines += frag_table(build, src, 'src')
    tdir = os.path.join(d, 'targets')
    if os.path.isdir(tdir):
        lines += ['', '## targets/', '',
                  'Each target adds its own fragments to `src/` and builds one output.', '',
                  '| Target | Fragments | KB |', '|---|---|---|']
        for t in sorted(os.listdir(tdir)):
            td = os.path.join(tdir, t)
            if os.path.isdir(td):
                fs = [f for f in os.listdir(td) if f[0].isdigit()]
                lines.append('| `%s` | %s | %s |' % (t, ', '.join('`%s`' % f for f in sorted(fs)),
                                                    kb(sum(fsize(os.path.join(td, f)) for f in fs))))
    with open(os.path.join(d, 'INDEX.md'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines) + '\n')
    sizes = [fsize(os.path.join(src, f)) for f in os.listdir(src) if f[0].isdigit()]
    sizes += [fsize(os.path.join(d, f)) for f in top]
    return len(sizes), sum(sizes), max(sizes) if sizes else 0, outs   # a build whose fragments all live elsewhere (Hook on the Port kit)


def main():
    builds = []
    for top in ('settlements', 'kits', 'biomes', 'openworld'):
        for name in sorted(os.listdir(os.path.join(ROOT, top))):
            b = '%s/%s' % (top, name)
            if os.path.isfile(os.path.join(ROOT, b, 'build.py')) and os.path.isdir(os.path.join(ROOT, b, 'src')):
                builds.append(b)
    builds += CORE_BUILDS
    rows = []
    for b in builds:
        n, total, biggest, outs = build_index(b)
        about = ABOUT.get(b, 'Biome kit: see `biomes/README.md`.' if b.startswith('biomes/') else '')
        rows.append('| [`%s`](%s/INDEX.md) | %d | %s | %s | %s |' % (b, b, n, kb(total), kb(biggest), about))
    lines = ['# Krator: index', '',
             '*Generated by `tools/make_index.py`. Do not edit; rerun it after adding a build or fragments.*', '',
             'Every build is a folder with `src/` fragments and a `build.py`. Open a build\'s `INDEX.md` '
             'before its source. Design rules for all builds are in `README.md`; working rules for agents '
             'are in `CLAUDE.md`.', '',
             '| Build | Fragments | src KB | Largest KB | What |', '|---|---|---|---|---|'] + rows + [
             '', '## Not builds', '',
             '| Path | What |', '|---|---|',
             '| `core/` | shared code (see `core/README.md`): `core/materials/`, `core/biome/` (the biome core every kit reads), `core/terrain/` (carve patches), `core/atmos/` (atmosphere), `core/sockets/` (cultural sockets, banners and awnings, with a runnable example), `core/furnish/` (the furniture placement pass six builds share), `core/rand/`, `core/clock/` (the world clock), `core/sched/` (motion as a function of time), `core/simulation/` (SIM: the data, resolver and stepper of the life layers; SCHEMA.md) |',
             '| `kits/furniture/` | spec only |',
             '| `godot/` | the Godot project: the port spike\'s importers, shaders and test exports (`godot/README.md`, GODOT-PLAN.md Phase 7) |',
             '| `gallery/` | the shareable gallery of every built world |',
             '| `host/` | the LAN site server: Krator Worlds plus the World Menagerie pages (`host/README.md`) |',
             '| `tools/` | repo-wide scripts: this index |',
             '| `archive/` | old scratch and screenshots; do not build from it |']
    with open(os.path.join(ROOT, 'INDEX.md'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines) + '\n')
    print('wrote INDEX.md and %d build indexes' % len(builds))


if __name__ == '__main__':
    main()
