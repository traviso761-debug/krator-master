#!/usr/bin/env python3
"""The port audit (GODOT-PLAN.md, section 3): tag every fragment of every build.

    python3 tools/audit_port.py            # refresh every PORT.md and PORT-INDEX.md
    python3 tools/audit_port.py --reset    # throw away hand-edited tags, retag everything
    python3 tools/audit_port.py settlements/voth   # one build only (the index is still rewritten)

For each build (a folder with a build.py under settlements/, kits/ or biomes/) and for core/,
it scans the fragments in src/ and targets/ for API families (three.js, canvas 2D, the DOM,
input events, the frame loop, shader hooks, InstancedMesh, Raycaster, storage and network),
assigns a provisional tag, and writes <build>/PORT.md: one row per fragment.

Tags (TODO.md and GODOT-PLAN.md section 2):
  [G data]    engine-neutral algorithm or data: port or export
  [G shader]  a shader trick: rewrite once into the shared .gdshader library
  [G native]  Godot has it built in: keep for the preview, port nothing
  [web]       browser or three.js host code: quarantine into core/host/
  [draw]      a three.js geometry builder: its OUTPUT crosses over as meshes through the exporter.
              A [draw] fragment whose name says it also decides placement or identity is noted
              "split": it needs a data pass and a draw pass.

Hand edits survive a rerun: the tool keeps the Tag and Note cells of any fragment already in
PORT.md and only retags fragments it has not seen (--reset retags all). Everything under the
"## Notes" heading is kept verbatim. The numbers are always refreshed.

PORT-INDEX.md (repo root) sums the KB per tag per build, lists which builds have an exporter,
a probe and assertions, and counts the copies and distinct versions of each host-shell fragment
family across builds (the drift core/host/ will replace).

tools/check_port.py is the lint that reads the tags this tool writes.
"""
import hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAGS = ['[G data]', '[G shader]', '[G native]', '[web]', '[draw]']

# The API families counted. Each is (column, regex). Counts are matching lines.
FAMILIES = [
    ('THREE',  r'THREE\.'),
    ('canvas', r'''getContext\(\s*['"]2d|createElement\(\s*['"]canvas|CanvasTexture|canvasTex\('''),
    ('DOM',    r'\bdocument\.|innerHTML|getElementById|querySelector|\.style\.[a-zA-Z]+\s*='),
    ('events', r'addEventListener|\bon(click|keydown|keyup|mousemove|mousedown|wheel)\s*=|[pP]ointer[lL]ock'),
    ('loop',   r'requestAnimationFrame|performance\.now'),
    ('geom',   r'\b(BOX|CYL|CONE|DOME|SPH|SLAB|LATHE|TUBE|RING|QUAD|PLANE|ROOF|WALL|kdef|kbake|pbFlush|'
               r'box|cyl|cone|lathe|rod|slab|prism|tube|mk[A-Z][A-Za-z0-9]*|[FB]\.[a-z][A-Za-z0-9]*)\(|'
               r'\b[A-Za-z]+Geometry\b|\bnew Mesh\b'),
    ('shader', r'onBeforeCompile|ShaderMaterial|gl_FragColor|gl_Position|#include <'),
    ('inst',   r'InstancedMesh|InstancedBufferAttribute'),
    ('ray',    r'Raycaster|intersectObjects?\('),
    ('store',  r'localStorage|sessionStorage|indexedDB|IndexedDB'),
    ('net',    r'\bfetch\(|XMLHttpRequest|new Worker|WebSocket|AudioContext|new Audio\('),
]
COLS = [c for c, _ in FAMILIES]

# Filename families (the name without its numeric prefix and extension).
WEB_NAMES = re.compile(r'(^|[-_])(camera|probe|inspect|inspector|polytool|polygon|hover|sheetui|sheet-ui|'
                       r'stats|host-stage|host-camera|host-probe|host-build|host-tower|host-polytool|'
                       r'loader|errors|hud|ui|start|underview|pathviz|walk)($|[-_])')
NATIVE_NAMES = re.compile(r'(^|[-_])(sky|sky-[a-z]+|host-sky|lod|lod-auto|daynight|day-night|glow|cull|fog|'
                          r'shadow|weather|lights|lanterns)($|[-_])')
SHADER_NAMES = re.compile(r'(^|[-_])(mat|mats|material|materials|shader|shaders|water|wind|foliage|'
                          r'leaf|leaves|world-uv|vern-mat|hl-mat|rl-mat|dalab-mat|mat-[a-z0-9]+|'
                          r'atmos-[0-9]-[a-z]+)($|[-_])')
DATA_NAMES = re.compile(r'(^|[-_])(layout|layouts|registry|palette|presets|kitdefs|life|life-[a-z]+|'
                        r'nav|roads|districts|terrain|carve|place|placement|schedule|faction|factions|'
                        r'tags|export|fixtures|sockets|cultures|catalog|sets|planner|program|programs|'
                        r'spec|fruit|plants|species|lore|data|rand|noise|core-head|core-kit|core-place|'
                        r'core-export|core-anim|budget|constants|convoys|strider-nav|jobs|symbols|'
                        r'shore|mainland-shore|wall-stations|chinampa|land|stations|rooms|furnish|'
                        r'interiors|doors|assets|zones|fields|climate)($|[-_])')
HOST_FAMILIES = ('camera', 'sky', 'probe', 'inspect', 'polytool', 'polygon', 'hover', 'sheetui', 'stats',
                 'host-stage', 'host-camera', 'host-probe', 'host-build', 'host-tower', 'host-sky',
                 'host-polytool', 'start', 'pathviz', 'underview', 'daynight', 'walk')


def family(name):
    base = os.path.basename(name)
    base = re.sub(r'\.(js|html)$', '', base)
    return re.sub(r'^[0-9]+[a-z]?-', '', base)


def scan(path):
    try:
        text = open(path, encoding='utf-8', errors='replace').read()
    except OSError:
        return None
    lines = text.split('\n')
    counts = {}
    canvas_rx = re.compile(dict(FAMILIES)['canvas'])
    for col, rx in FAMILIES:
        r = re.compile(rx)
        if col == 'DOM':
            counts[col] = sum(1 for ln in lines if r.search(ln) and not canvas_rx.search(ln))
        else:
            counts[col] = sum(1 for ln in lines if r.search(ln))
    return {'kb': len(text.encode('utf-8')) / 1024.0, 'counts': counts,
            'sha': hashlib.sha1(text.encode('utf-8')).hexdigest()[:10]}


def provisional(name, s):
    """The provisional tag and note for one fragment, from its name and counts."""
    c = s['counts']
    fam = family(name)
    if name.endswith('.html'):
        return '[web]', 'page shell'
    browser = c['DOM'] + c['events'] + c['loop'] + c['store'] + c['net']
    draws = c['THREE'] + c['canvas'] + (c['geom'] if c['geom'] > 2 else 0)
    if browser:
        if DATA_NAMES.search(fam) or draws == 0:
            return '[web]', 'split: data inside host code'
        return '[web]', ''
    if WEB_NAMES.search(fam):
        return '[web]', ''
    if NATIVE_NAMES.search(fam):
        return '[G native]', 'shader hook inside' if c['shader'] else ''
    if c['shader'] and SHADER_NAMES.search(fam):
        return '[G shader]', ''
    if DATA_NAMES.search(fam):
        if draws == 0:
            return '[G data]', ''
        return '[draw]', 'split: data candidate that also draws'
    if draws == 0 and c['shader'] == 0:
        return '[G data]', 'no three.js, no geometry, no DOM'
    if c['canvas'] and c['THREE'] + c['geom'] <= c['canvas']:
        return '[draw]', 'canvas painters: TEX.def or bake'
    if c['shader'] and not c['inst'] and c['geom'] <= 2:
        return '[G shader]', ''
    return '[draw]', ''


def fragments(build):
    """(relative name, absolute path) for every fragment of a build, src/ then targets/."""
    out = []
    if build == 'core':
        for mod in sorted(os.listdir(os.path.join(ROOT, 'core'))):
            d = os.path.join(ROOT, 'core', mod)
            if not os.path.isdir(d):
                continue
            for dp, dn, fn in os.walk(d):
                dn[:] = sorted(x for x in dn if x not in ('example', 'node_modules'))
                for f in sorted(fn):
                    if f.endswith('.js') and not f.startswith('test-') and not f.startswith('.'):
                        p = os.path.join(dp, f)
                        out.append((os.path.relpath(p, os.path.join(ROOT, 'core')), p))
        return out
    if build == 'kits/catalog':                     # its registries are top-level files (build.py SOURCES)
        d = os.path.join(ROOT, build)
        for f in sorted(os.listdir(d)):
            if f.endswith('.js') and not f.startswith('.') and not f.startswith('three'):
                out.append((f, os.path.join(d, f)))
    for sub in ('src', 'targets'):
        d = os.path.join(ROOT, build, sub)
        if not os.path.isdir(d):
            continue
        for dp, dn, fn in os.walk(d):
            dn[:] = sorted(dn)
            for f in sorted(fn):
                if (f.endswith('.js') or f.endswith('.html')) and not f.startswith('.') \
                        and not f.endswith('.min.js'):
                    p = os.path.join(dp, f)
                    out.append((os.path.relpath(p, os.path.join(ROOT, build)), p))
    return out


def builds():
    out = []
    for top in ('settlements', 'kits', 'biomes'):
        d = os.path.join(ROOT, top)
        for name in sorted(os.listdir(d)):
            if os.path.isfile(os.path.join(d, name, 'build.py')):
                out.append('%s/%s' % (top, name))
    return out


ROW = re.compile(r'^\|\s*`([^`]+)`\s*\|\s*([0-9.]+)\s*\|\s*(\[[^\]]+\])\s*\|(.*)\|\s*(.*?)\s*\|$')


def read_port(path):
    """Existing tags and notes per fragment, and the text under ## Notes."""
    tags, notes_text = {}, ''
    if not os.path.isfile(path):
        return tags, notes_text
    text = open(path, encoding='utf-8').read()
    for ln in text.split('\n'):
        m = ROW.match(ln)
        if m and m.group(3) in TAGS:
            tags[m.group(1)] = (m.group(3), m.group(5))
    if '\n## Notes' in text:
        notes_text = text[text.index('\n## Notes'):].lstrip('\n')
    return tags, notes_text


def build_meta(build):
    """Exporter, probe, assertions: what the port can already lean on."""
    meta = {'exporter': False, 'probe': False, 'assert': False}
    if build == 'core':
        for mod in ('atmos', 'biome'):
            meta['exporter'] |= os.path.isdir(os.path.join(ROOT, 'core', mod))
        return meta
    for name, p in fragments(build):
        t = open(p, encoding='utf-8', errors='replace').read()
        if re.search(r'KRATOR_EXPORT|\.export\s*=\s*function|\bexport\s*\(\s*\)\s*\{|download\s*\(', t):
            meta['exporter'] = True
        if 'window._api' in t:
            meta['probe'] = True
    v = os.path.join(ROOT, build, 'verify.py')
    if os.path.isfile(v) and '--assert' in open(v, encoding='utf-8', errors='replace').read():
        meta['assert'] = True
    return meta


def write_port(build, rows, notes_text):
    path = os.path.join(ROOT, build, 'PORT.md')
    kb = {t: 0.0 for t in TAGS}
    for r in rows:
        kb[r['tag']] += r['kb']
    total = sum(kb.values()) or 1
    lines = ['# %s: port audit' % build, '',
             '*Written by `tools/audit_port.py` (GODOT-PLAN.md, section 3). Edit the **Tag** and **Note** '
             'cells and the text under "Notes": a rerun keeps them and refreshes the numbers. '
             '`--reset` retags everything.*', '',
             'Tags: `[G data]` engine-neutral, port or export · `[G shader]` rewrite once as a .gdshader · '
             '`[G native]` Godot has it, keep for the preview · `[web]` host code, quarantine in `core/host/` · '
             '`[draw]` a three.js builder whose output crosses over as meshes. "split" in a note means the '
             'fragment mixes data with drawing or host code and needs a data pass and a draw pass.', '',
             '| | ' + ' | '.join(TAGS) + ' |', '|---|' + '---|' * len(TAGS),
             '| KB | ' + ' | '.join('%.0f (%d%%)' % (kb[t], round(100 * kb[t] / total)) for t in TAGS) + ' |',
             '', 'Columns: matching lines per API family. `canvas` is canvas 2D (texture painters), `DOM` and '
             '`events` and `loop` are the browser, `shader` is GLSL and shader hooks, `inst` is InstancedMesh, '
             '`ray` is Raycaster, `geom` is geometry-kit calls (BOX, F.box, kdef, *Geometry). `store` and `net` should stay 0.', '',
             '| Fragment | KB | Tag | ' + ' | '.join(COLS) + ' | Note |',
             '|---|---|---|' + '---|' * len(COLS) + '---|']
    for r in rows:
        lines.append('| `%s` | %.1f | %s | %s | %s |' % (
            r['name'], r['kb'], r['tag'], ' | '.join(str(r['counts'][c]) for c in COLS), r['note']))
    lines.append('')
    lines.append(notes_text if notes_text else '## Notes\n\n(none yet: the split lists and the overrides go here)\n')
    open(path, 'w', encoding='utf-8').write('\n'.join(lines))
    return kb


def audit(build, reset):
    tags, notes_text = read_port(os.path.join(ROOT, build, 'PORT.md'))
    rows = []
    for name, p in fragments(build):
        s = scan(p)
        if s is None:
            continue
        tag, note = provisional(name, s)
        if not reset and name in tags:
            tag, note = tags[name]
        rows.append({'name': name, 'kb': s['kb'], 'counts': s['counts'], 'tag': tag, 'note': note,
                     'sha': s['sha'], 'family': family(name)})
    kb = write_port(build, rows, notes_text)
    return rows, kb


def write_index(results):
    path = os.path.join(ROOT, 'PORT-INDEX.md')
    lines = ['# Krator: port index', '',
             '*Written by `tools/audit_port.py`. Do not edit; rerun it. The plan is `GODOT-PLAN.md`; '
             'each build\'s tags are in its `PORT.md`.*', '',
             'KB of source per tag. `[G data]` is what crosses over as it is; `[web]` is what `core/host/` '
             'absorbs; `[draw]` crosses over as meshes through the exporter; `[G shader]` is rewritten once; '
             '`[G native]` is not ported. "split" counts the fragments whose note says they mix data with '
             'drawing or host code. Exporter, probe and assert say what the port can test against today.', '',
             '| Build | Frags | KB | ' + ' | '.join(TAGS) + ' | split | exporter | probe | assert |',
             '|---|---|---|' + '---|' * len(TAGS) + '---|---|---|---|']
    tot = {t: 0.0 for t in TAGS}
    nfr, nkb, nsplit = 0, 0.0, 0
    for build, rows, kb, meta in results:
        split = sum(1 for r in rows if 'split' in r['note'])
        tkb = sum(kb.values())
        nfr += len(rows); nkb += tkb; nsplit += split
        for t in TAGS:
            tot[t] += kb[t]
        mark = lambda b: 'yes' if b else ''
        lines.append('| [`%s`](%s/PORT.md) | %d | %.0f | %s | %d | %s | %s | %s |' % (
            build, build, len(rows), tkb, ' | '.join('%.0f' % kb[t] for t in TAGS), split,
            mark(meta['exporter']), mark(meta['probe']), mark(meta['assert'])))
    lines.append('| **all** | %d | %.0f | %s | %d | | | |' % (
        nfr, nkb, ' | '.join('%.0f (%d%%)' % (tot[t], round(100 * tot[t] / (nkb or 1))) for t in TAGS), nsplit))
    # Host-shell copies: how many builds carry each family, and how many distinct versions.
    fams = {}
    for build, rows, kb, meta in results:
        for r in rows:
            if r['family'] in HOST_FAMILIES:
                fams.setdefault(r['family'], []).append((build, r['sha'], r['kb']))
    lines += ['', '## Host-shell copies', '',
              'The fragment families `core/host/` (Phase 1) and the `core/atmos` sky preset replace. '
              '"versions" is the number of byte-distinct copies: the drift to reconcile.', '',
              '| Family | Builds | Versions | KB total |', '|---|---|---|---|']
    for fam in sorted(fams, key=lambda f: -len(fams[f])):
        v = fams[fam]
        lines.append('| `%s` | %d | %d | %.0f |' % (fam, len(v), len(set(s for _, s, _ in v)), sum(k for _, _, k in v)))
    lines.append('')
    open(path, 'w', encoding='utf-8').write('\n'.join(lines))


def main(argv):
    reset = '--reset' in argv
    only = [a.rstrip('/') for a in argv if not a.startswith('--')]
    todo = ['core'] + builds()
    results = []
    for build in todo:
        if only and build not in only:
            # keep the index complete: read the existing PORT.md without retagging
            tags, _ = read_port(os.path.join(ROOT, build, 'PORT.md'))
            if not tags:
                continue
        rows, kb = audit(build, reset and (not only or build in only))
        results.append((build, rows, kb, build_meta(build)))
        print('%-28s %3d fragments  ' % (build, len(rows)) +
              '  '.join('%s %.0f' % (t, kb[t]) for t in TAGS))
    write_index(results)
    print('wrote PORT-INDEX.md and %d PORT.md files' % len(results))


if __name__ == '__main__':
    main(sys.argv[1:])
