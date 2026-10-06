#!/usr/bin/env python3
"""Write INDEX.md at the repo root and in every build folder.

A build's INDEX.md lists each src/ fragment with its size and section
headings, so an agent can find the part it needs without opening large
files. The root INDEX.md lists every build.

Usage:  python3 tools/make_index.py      (from anywhere; rewrites every INDEX.md)
"""
import ast, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIG = 30 * 1024          # CLAUDE.md: never read a fragment this size whole

ABOUT = {
    'settlements/voth': 'Voth: a Venice/Vivec-like Dunmer city on an enclosed brackish bay, with the most complete life layer and collision system.',
    'settlements/yuni': 'Yuni: the city, plus its building-kit and plant sheets (its furniture is in kits/catalog).',
    'settlements/dalab': 'Dalab: the mound settlement of the southwestern lowlands, and its building set.',
    'settlements/highlands': 'Highlands: Republican, Rustic and Tribal building kits for the temperate highlands of the Inner Wall, and the town of Roketstad.',
    'settlements/iziz': 'Iziz: the city rebuilt on the Iziz Vernacular style and the Ancients kit.',
    'settlements/reedlake': 'Reed Lake: a floating reed-lake village and its kit.',
    'settlements/screamers': 'Hexahedron: the Screamers\' tribal village in and under a ruined arcology, forked from the Ancients kit.',
    'settlements/locus': 'Locus: a fork of the Yuni engine in the eastern abyss, with its own kit sheet and plant catalogue.',
    'settlements/verge': 'Verge: twin cities at the top and foot of an 860 m descent into the eastern abyss (Iziz Vernacular above, Yuni and Eastern Abyssal below), joined by a switchback trail; caravans, porters and nomads on a timetable; a Godot twin of its life layer.',
    'settlements/girder': 'Girder: an outlying Beast Rider village in the central-crater hyperjungle.',
    'settlements/mavs-refuge': "Mav's Refuge: a refuge in the hypertropic jungle on the lee shore of the Ring Sea.",
    'settlements/ys': 'Ys: the half-drowned Hykkousoi capital on the ruins of an Ancient city at the head of the north-west bay of the Ring Sea (phase 2: the Hykkousoi kit, 89 pieces on the kit sheet; phase 3 prep: the layout, shore and nav).',
    'settlements/xanadu': 'Xanadu: the building kit of the southern Sultanate (Tibetan massing, Indian, Turkish and Persian detail) and the city of Erewhon.',
    'settlements/mungo': "Mungo: a trade village at a river mouth on a salt lake in the Eastern Abyss: a floating reed village (the Reed Lake kit, run inside the page; Reed's Local), one pontoon to an Eastern Abyssal town, the Geomancers' chapterhouse among Yuni houses with their dune buggies. Shares the Locus engine and kits by name (build.py); the first world on core/simulation (SIM) and core/clock: a scheduled life layer whose data is world/*.json.",
    'settlements/shade': "Shade: the Eastern Nomads' sunken basin in the eastern high desert (falls, pool, carved face, switchback, slot canyon) on the sedesert biome kit: rock-cut and pueblo buildings, cliff dwellings round the rim, alcoves and an undercut behind the falls, the life layer's data and walkable grid.",
    'openworld/little-demo': "Little Demo: the scale model's eastern desert region at 1:1 (1.3 million km2), streamed: terrain from the scale model's heights, the sedesert, eastabyss, hyperjungle and ebadlands kits' flora placed by climate as cell-seeded instances, settlements marked.",
    'kits/mechs': 'Mechs: animated walking machines any world takes as one bundle (KratorMechs: a skinned rig, leg IK with planted feet, idle, walk and attack clips with fire and impact events, swinging banners and feathers) on the catalog core; ten Iziz war-walkers (the Castra in two variants); a verified kit sheet with a z-fighting audit.',
    'kits/motor-vehicles': 'Motor Vehicles: procedural motor vehicles any world takes as one bundle (KratorVehicles: wheels to spin and steer, switchable lamps, simulation data) on the catalog core; five vehicles in five culture files (the Geomancer dune buggy, the Republic salvage crawler, the Izani six-wheeler, the Abyssal caravan truck, the Post-Apoc tracked hab); a verified kit sheet.',
    'kits/ringsea': 'Ring Sea watercraft: 21 procedural vessels (warships, cargo ships, barges, canoes, outriggers, rafts) of the cultures round the Ring Sea.',
    'kits/scyvoi': "The Scyvoi kit: the salamander riders of the crater drylands. Five small and five large tents (gers, bell tents, goat-hair tents, khaimas, a pavilion, an appliqué tent), the chief's great tent, the shaman's hut, smithy and supply tents, all furnished from the catalog's Scyvoi culture (core/furnish) with a cut-away to see inside; salamanders (riding, war, draught) with life data, chariots and carts, tethering; and the Baelu, a fitted-stone fire redoubt on a rock outcrop. core/materials, core/tags and core/furnish from the start; a verified kit sheet.",
    'kits/post-apoc': 'The Post-Apoc set: reclaimed and recycled buildings (containers, silos, tanks, buses, bulkheads, tyre and bottle walls) with sockets for any culture\'s marks.',
    'kits/ancients': 'The Ancients kit: ruined megastructures of the ancient civilisation, 33 structure types, one target per site.',
    'kits/interiors': 'Interiors: ROOM() registration and an engine-neutral furniture placer (ported from Yuni) with a catalog adapter; building planner (storeys, partitions, stairs), walkers and a light budget; the building SETS (Highlands, Post-Apoc, Beast Rider, Locus, Abyss, Reed Lake, Yuni: every building\'s rooms as data, the residence rule checked); a verified demo, a sets sheet, and a walkable mockup of furnished rooms inside the real buildings.',
    'kits/catalog': 'The master catalog: asset engine, the parametric furniture kit and 1635 furniture pieces (kits/furniture SPEC shape, palette-keyed, tiered poor/common/court, plus trade and household pieces: forge, anvil, stall, vat, still, bunk, larder ..., and the furniture harvested from the Highlands, Post-Apoc, Beast Rider and Abyss kits) over 25 cultures, one file per culture, with generic goods (containers, food, drink, supplies), biome fruit and a jobs file (work items by trade); a verified contact sheet in five pages (indoor, outdoor, both, rugs, jobs).',
}
# Files that are generated or duplicated elsewhere: never edit or read them whole.
GENERATED = {
    'settlements/yuni/src/61a-ancients-kit.js': 'generated by tools/gen_ancients.py: a patched copy of the Ancients kit',
}
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
    return len(sizes), sum(sizes), max(sizes), outs


def main():
    builds = []
    for top in ('settlements', 'kits', 'biomes', 'openworld'):
        for name in sorted(os.listdir(os.path.join(ROOT, top))):
            b = '%s/%s' % (top, name)
            if os.path.isfile(os.path.join(ROOT, b, 'build.py')) and os.path.isdir(os.path.join(ROOT, b, 'src')):
                builds.append(b)
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
