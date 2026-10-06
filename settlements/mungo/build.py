#!/usr/bin/env python3
"""Mungo: concatenate the fragments into dist/mungo.html.

Mungo is a FORK OF THE LOCUS ENGINE (settlements/locus), shared rather than copied:

  1. settlements/locus/src/  every digit-named fragment is read from there BY NAME, except the ones in
                             LOCUS_SKIP (Locus's own world: its layout, placement, lights, life ...).
                             A fragment of the same name in mungo/src/ overrides Locus's (Mungo's own
                             world: 10-core, 20-stage, 30-layout ...). So the Locus and Eastern Abyssal
                             kits, the Yuni base kit, the eastern-abyss biome port, the sky, the kit
                             engine, the inspector and the path tool are ONE copy, in Locus; a fix there
                             lands here on the next build (and moves Mungo's hash: tools/port_baseline.py).
  2. core/                   lod, clock, sched, rand and simulation (CORE_MODULES), like every core opt-in.
  3. virtual fragments       generated at build time, never written to src/:
       01-reedkit.html       the REED LAKE KIT (settlements/reedlake/src, its fragments below 90, plus
                             core/materials' shared ones) wrapped in ONE function, REEDKIT_MAKE(host), in a
                             <script> of its own BEFORE the strict BUILD() script: an Ancients-lineage kit
                             inside a Locus-lineage page, sharing no global with it. mungo/src/reed/ holds
                             the glue that runs inside that function (its return value is the API).
       65z-furniture-bundle  the catalog's furniture (KratorFurniture) and the interiors sets (KratorInteriors)
       65y-vehicles-bundle   the Motor Vehicles kit (KratorVehicles), when kits/motor-vehicles exists
       78a-world-json.js     settlements/mungo/world/*.json inlined as MUNGO_WORLD_JSON for SIM.load (core/simulation/PLAN.md 4.2)

The rules Locus enforces hold here too (every fragment in one function scope): a generative fragment opens
with reseed(N) and no two claim one seed; no top-level name in two fragments; colour arrays only in the
palette. Run with --no-checks to skip them. --list prints where every fragment came from.

Usage:  python build.py [--no-checks] [--list]
"""
import hashlib, json, os, re, subprocess, sys
try:                                   # the docs are UTF-8; a Windows console defaults to cp1252
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = os.path.join(DIST, 'mungo.html')
MANIFEST = os.path.join(HERE, 'build-manifest.json')
LOCUS_SRC = os.path.join(ROOT, 'settlements', 'locus', 'src')
REED_SRC = os.path.join(ROOT, 'settlements', 'reedlake', 'src')
MAT_DIR = os.path.join(ROOT, 'core', 'materials')
WORLD_DIR = os.path.join(HERE, 'world')

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# Locus's own world: Mungo replaces these (a file of the same name in src/) or does without them.
LOCUS_SKIP = {
    '68c-locus-crossings.js',   # Locus's marsh-pool bridges: Mungo's town has no pools in its streets
    '71g-locus-grid.js',        # Locus's distribution line: Mungo's grid is 71g-mungo-grid.js (the Geomancer quarter only)
    '76-locus-anim.js',         # the pumpjacks' animation: no pumpjacks in Mungo
    '84-life.js',               # Locus's life layer: Mungo's is the SIM-driven 84-mungo-life*.js
    '83-locus-fauna.js',        # Locus's ambient fauna, keyed to its delta: Mungo has its own (later) or none
}
# The eastern-abyss biome: core/biome and the canonical kit biomes/eastabyss, under Locus's slot names (69a*, 69c*),
# the same map as settlements/locus/build.py's BIO_CANON.
BIO_CANON = {}
for _slot, _rel in (('69a1-bio-core-head.js', 'core/biome/10-core-head.js'), ('69a2-bio-core-kit.js', 'core/biome/20-core-kit.js'),
                    ('69a3-bio-core-foliage.js', 'core/biome/30-core-foliage.js'), ('69a4-bio-core-place.js', 'core/biome/40-core-place.js'),
                    ('69c1-bio-eastabyss-species.js', 'biomes/eastabyss/src/50-biome-eastabyss-species.js'),
                    ('69c2-bio-eastabyss-trees.js', 'biomes/eastabyss/src/55-biome-eastabyss-trees.js'),
                    ('69c3-bio-eastabyss-floor.js', 'biomes/eastabyss/src/60-biome-eastabyss-floor.js'),
                    ('69c4-bio-eastabyss-dress.js', 'biomes/eastabyss/src/65-biome-eastabyss-dress.js'),
                    ('69c5-bio-eastabyss.js', 'biomes/eastabyss/src/70-biome-eastabyss.js')):
    BIO_CANON[_slot] = (os.path.join(ROOT, *_rel.split('/')), _rel.rsplit('/', 1)[0])
# shared core modules, by folder; every digit-named .js in each (core/<m>/README.md says what each is)
CORE_MODULES = ['lod', 'rand', 'mask', 'clock', 'sched', 'furnish', 'tags', 'atmos', 'minimap', 'simulation']

# fragments with no generation in them (no reseed needed)
DETERMINISTIC = {'00-head.html', '05-palette.js', '09-lod.js', '97-lod-auto.js', '10-core.js', '80-camera.js', '81-glow.js',
                 '85-probe.js', '86-inspect.js', '69z-locus-flora.js', '76-locus-anim.js', '69b-locus-biohost.js', '87-pathviz.js',
                 '88-underview.js', '89-sheetui.js', '53-assets.js', '71-catalog.js', '98-start.js', '99-tail.html',
                 '66-locus-furnish.js', '01b-build-open.html', '86b-mungo-inspect.js', '87b-mungo-hud.js', '65r-reed-village.js', '05b-mungo-palette.js', '78b-mungo-world.js', '84-mungo-life.js',
                 '50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js',   # core/furnish, core/tags (no rnd())
                 '50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js', '25-core-mask.js', '26-core-mask-xform.js', '90-atmos-host.js',
                 '88-core-minimap.js', '88a-core-minimap-host.js', '88b-locus-minimap.js', '88c-mungo-minimap.js'}
DETERMINISTIC |= {f for f in os.listdir(os.path.join(ROOT, 'core', 'atmos')) if f.startswith('89-atmos-')}   # core/atmos: IIFE-scoped, its own PRNG
PALETTE_FILE = '05-palette.js'
PALETTE_FILES = {'05-palette.js', '05b-mungo-palette.js'}

FURN_CULTURES = ['eastabyss', 'nomad', 'reedlake', 'generic', 'scrap', 'jobs']
INTERIOR_SETS_WANT = ['locus', 'abyss', 'reedlake', 'yuni']
VIRTUAL = {'01-reedkit.html', '65z-furniture-bundle.js', '65y-vehicles-bundle.js', '78a-world-json.js'}


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places. None when there is none:
    the build then says plainly that the syntax was NOT checked. (Every build.py carries this function.)"""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node', os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node'), 'C:/Program Files/nodejs/node.exe'):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


def read(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()


# ---------------------------------------------------------------- the reed kit, wrapped
def reed_kit():
    """REEDKIT_MAKE(host): the Reed Lake kit's fragments (below 90: core, kit, materials, vocabulary,
    helpers, builders) plus core/materials' shared files, in their own filename order, inside one function.
    Its last statements are mungo/src/reed/*.js (the glue), whose `return` hands Mungo the API."""
    names = {f: os.path.join(REED_SRC, f) for f in os.listdir(REED_SRC) if f[0].isdigit() and f.endswith('.js') and f < '90'}
    for f in os.listdir(MAT_DIR):                     # core/materials: 20-textures, 22-materials, 68-mat-v5
        if f[0].isdigit() and f.endswith('.js') and f not in names:
            names[f] = os.path.join(MAT_DIR, f)
    names.setdefault('69a-world-uv.js', os.path.join(MAT_DIR, 'opt', '69a-world-uv.js'))
    glue_dir = os.path.join(SRC, 'reed')
    glue = sorted(f for f in os.listdir(glue_dir) if f.endswith('.js')) if os.path.isdir(glue_dir) else []
    parts = ['<script>\n/* ============================== THE REED LAKE KIT (settlements/reedlake), wrapped ==============================\n'
             '   Generated by mungo/build.py from settlements/reedlake/src/<90 and core/materials. One function, called\n'
             '   from BUILD(): nothing inside is global, nothing outside is visible to it but THREE, the DOM and `host`. */\n'
             'function REEDKIT_MAKE(host){\n']
    order = sorted(names)
    for f in order:
        body = read(names[f]).replace('</script', '<\\/script')
        parts.append('/* ---- reedlake: %s ---- */\n%s\n' % (f, body))
    for f in glue:
        parts.append('/* ---- mungo glue: src/reed/%s ---- */\n%s\n' % (f, read(os.path.join(glue_dir, f))))
    parts.append('}\n</script>\n')
    return ''.join(parts), order + ['reed/' + g for g in glue]


def world_json():
    """settlements/mungo/world/*.json -> one SIM.load({...}) call. Each file is a list of records (one per
    line on disk); its name before the first '-' or '.' is the record kind (places-shore.json -> places)."""
    recs = {}
    if os.path.isdir(WORLD_DIR):
        for f in sorted(os.listdir(WORLD_DIR)):
            if not f.endswith('.json'):
                continue
            kind = re.split(r'[-.]', f, maxsplit=1)[0]
            try:
                data = json.loads(read(os.path.join(WORLD_DIR, f)))
            except Exception as e:
                sys.exit('world/%s: %s' % (f, e))
            if not isinstance(data, list):
                sys.exit('world/%s: must be a list of records' % f)
            for i, r in enumerate(data):
                if isinstance(r, dict):
                    r.setdefault('_src', '%s:%d' % (f, i + 1))
            recs.setdefault(kind, []).extend(data)
    body = json.dumps(recs, separators=(',', ':'), ensure_ascii=False)
    return ('/* ============================== WORLD DATA (generated from settlements/mungo/world/*.json) ==============================\n'
            '   The hand-edited overlay (core/simulation/PLAN.md 4.2): applied by SIM.load() on top of what the\n'
            '   geometry registered. Edit the JSON, never this. */\n'
            'var MUNGO_WORLD_JSON = %s;\n' % body)


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    sets_dir = os.path.join(ROOT, 'kits', 'interiors', 'sets')
    sets = [s for s in INTERIOR_SETS_WANT if os.path.isfile(os.path.join(sets_dir, s + '.js'))]
    vb = {'65z-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES, harvested=True) + kit_bundle.bundle(sets)}
    vdir = os.path.join(ROOT, 'kits', 'motor-vehicles')
    if os.path.isfile(os.path.join(vdir, 'vehicle_bundle.py')):
        sys.path.insert(0, vdir)
        try:
            import vehicle_bundle
            vb['65y-vehicles-bundle.js'] = vehicle_bundle.bundle(['geomancer'])   # the buggy only: the other cultures' vehicles are not used here
        except Exception as e:
            print('NOTE: kits/motor-vehicles bundle failed (%s): the buggies are left out' % e)
    if '65y-vehicles-bundle.js' not in vb:
        vb['65y-vehicles-bundle.js'] = '/* kits/motor-vehicles: not built yet; KratorVehicles absent */\nvar KratorVehicles = null;\n'
    rk, rk_order = reed_kit()
    vb['01-reedkit.html'] = rk
    vb['78a-world-json.js'] = world_json()
    return vb, sets, rk_order


RE_HEAD_SEED = re.compile(r'^reseed\(\s*(-?\d+)\s*\)\s*;')
RE_ANY_SEED = re.compile(r'\breseed\(\s*(-?\d+)\s*\)')
RE_COLOUR_ARRAY = re.compile(r'^\s*var\s+\w+\s*=\s*\[\s*0x[0-9a-fA-F]{6}\s*,', re.M)


def strip_head_comments(text):
    i = 0
    while True:
        while i < len(text) and text[i] in ' \t\r\n':
            i += 1
        if text.startswith('/*', i):
            k = text.find('*/', i)
            if k == -1:
                break
            i = k + 2
            continue
        if text.startswith('//', i):
            i = text.find('\n', i) + 1
            continue
        break
    return text[i:]


def check(order, bodies, origin):
    errs, seeds = [], {}
    for f in order:
        if not f.endswith('.js') or f in VIRTUAL or origin[f].startswith('core/'):
            continue
        body = bodies[f]
        if '-bio-' in f:
            for w in ['kdef(', 'kput(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLACED', 'ST.edges', 'SITES_L', 'LOCUS_FIELDS', 'MUNGO_']:
                if w in body:
                    errs.append('%s: biome fragment depends on a host global (%s)' % (f, w))
            continue
        if f not in DETERMINISTIC and not RE_HEAD_SEED.match(strip_head_comments(body)):
            errs.append('%s: generative fragment does not open with reseed(N). Add one, or list it in DETERMINISTIC.' % f)
        for m in RE_ANY_SEED.finditer(body):
            seeds.setdefault(m.group(1), set()).add(f)
        if f not in PALETTE_FILES:
            for m in RE_COLOUR_ARRAY.finditer(body):
                errs.append('%s:%d: colour array outside the palette. Move it to 05-palette.js and read it from PAL.'
                            % (f, body[:m.start()].count('\n') + 1))
    decl = {}
    for f in order:
        if not f.endswith('.js') or f in VIRTUAL or origin[f].startswith('core/'):
            continue
        head = RE_HEAD_SEED.sub('', strip_head_comments(bodies[f]), 1)
        if strip_head_comments(head).startswith('(function'):
            continue
        if '-bio-' in f:
            for m in re.finditer(r'^var\s+([A-Za-z_$][\w$]*)', bodies[f], re.M):
                decl.setdefault(m.group(1), set()).add(f)
            continue
        for m in re.finditer(r'^(?:var|function|const|let)\s+([A-Za-z_$][\w$]*)', bodies[f], re.M):
            decl.setdefault(m.group(1), set()).add(f)
        for m in re.finditer(r'^var\s+[^;\n(]*?,\s*([A-Za-z_$][\w$]*)\s*=', bodies[f], re.M):
            decl.setdefault(m.group(1), set()).add(f)
    for name, files in sorted(decl.items()):
        if len(files) > 1:
            errs.append('top-level name `%s` declared in more than one fragment: %s' % (name, ', '.join(sorted(files))))
        elif files != {'10-core.js'} and ((len(name) <= 2 and not name.isupper()) or name in ('seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z')):
            errs.append('top-level name `%s` in %s is too generic for a shared scope; prefix it' % (name, ', '.join(files)))
    for key, files in sorted(seeds.items()):
        if len(files) > 1:
            errs.append('seed %s used in more than one fragment: %s' % (key, ', '.join(sorted(files))))
    return errs


def collect():
    paths, origin = {}, {}
    for f in os.listdir(LOCUS_SRC):
        if f[0].isdigit() and f not in LOCUS_SKIP:
            paths[f] = os.path.join(LOCUS_SRC, f); origin[f] = 'locus'
    for f in os.listdir(SRC):
        p = os.path.join(SRC, f)
        if f[0].isdigit() and os.path.isfile(p):
            origin[f] = 'mungo (overrides locus)' if f in paths else 'mungo'
            paths[f] = p
    for f, (p, where) in BIO_CANON.items():                  # the biome in place, under Locus's slot names
        if f not in paths:
            paths[f] = p; origin[f] = where
    for mod in CORE_MODULES:
        d = os.path.join(ROOT, 'core', mod)
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f[0].isdigit() and f.endswith('.js') and f not in paths:
                paths[f] = os.path.join(d, f); origin[f] = 'core/' + mod
    return paths, origin


def main():
    do_checks = '--no-checks' not in sys.argv
    vb, sets, rk_order = virtual_bodies()
    paths, origin = collect()
    for f in vb:
        origin[f] = 'virtual'
    order = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    for f in order:
        if f not in vb:
            bodies[f] = read(paths[f])
    if '--list' in sys.argv:
        for f in order:
            print('%-34s %s' % (f, origin[f]))
        print('reed kit: ' + ', '.join(rk_order))
        print('interior sets: ' + ', '.join(sets))
        return
    if do_checks:
        errs = check(order, bodies, origin)
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)
    html = ''.join(bodies[f] for f in order)
    os.makedirs(DIST, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({f: [origin[f], hashlib.sha1(bodies[f].encode()).hexdigest()[:12]] for f in order}, fh, indent=1, sort_keys=True)
    # syntax: the BUILD() body and the reed kit, each checked on its own
    node = find_node()
    status = 'syntax NOT CHECKED (no node; check with verify.py or jsrun.py --html)'
    if node:
        body = html.split('function BUILD(){', 1)[1].rsplit('</script>', 1)[0].rsplit('}', 1)[0]
        chk = os.path.join(HERE, '.syntax.js')
        with open(chk, 'w', encoding='utf-8') as fh:
            fh.write("function BUILD(){'use strict';\n" + body + '\n}\n')
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        if r.returncode:
            print(r.stdout + r.stderr); sys.exit(1)
        rk = vb['01-reedkit.html'].split('<script>', 1)[1].rsplit('</script>', 1)[0]
        with open(chk, 'w', encoding='utf-8') as fh:
            fh.write(rk)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        if r.returncode:
            print('reed kit: ' + r.stdout + r.stderr); sys.exit(1)
        status = 'syntax OK'
    n_locus = sum(1 for f in order if origin[f] == 'locus')
    n_mungo = sum(1 for f in order if origin[f].startswith('mungo'))
    print('built dist/mungo.html  (%d fragments: %d mungo, %d from locus, %d core, %d virtual; %.0f KB)  %s%s'
          % (len(order), n_mungo, n_locus, sum(1 for f in order if origin[f].startswith('core/')), len(vb),
             os.path.getsize(OUT) / 1024, status, '' if do_checks else '  [checks skipped]'))
    print('interior sets: %s' % ', '.join(sets))


if __name__ == '__main__':
    main()

# --- remind whoever is building of the open issues (see KNOWN_ISSUES.md) ---
_ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki, encoding='utf-8') if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md - tell the user before making changes:' % len(_open))
        for l in _open:
            print('  ' + l[6:])
