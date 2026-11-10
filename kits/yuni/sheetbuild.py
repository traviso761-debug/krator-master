#!/usr/bin/env python3
"""The Yuni-lineage kit sheet's build (kits/yuni/README.md, "Its own sheet"): one page per culture kit that draws through a
fork of the Yuni engine, made of

  the sheet shell     kits/yuni/targets/sheet (SHELL): the page head and tail, the stage, the placeholder sky's binding,
                      the layout, the emit and ground, the labels and controls, the take on core/host. One shell for the
                      three kits on the lineage (kits/yuni on Yuni's fork; kits/locus and kits/eastern-abyssal on Locus's)
  06-ys-config.js     GENERATED: which kit the shell lays out (YS_KIT, YS_SUBKIT, the rows' order and names, the ground)
  the kit(s)          read in place (a kit's file list module: yunikit, locuskit, abysskit)
  the engine          read in place from the world that forked it (settlements/<town>/src): never copied (MODULARITY-PLAN.md
                      step 4b: the engine is not a core module; each world that runs it has its own)
  the core modules    read in place: core/rand, core/tags, core/materials/record, core/door, core/walk, core/host, the
                      placeholder sky (core/atmos/placeholder), and whatever else the engine fork needs (core/furnish)
  the library pack    GENERATED from the town's tex/ (its materials.json, tools/textures/pack.py): the engine's material
                      families are the town's palette (05-palette.js FAMMAT), so their binding to the library is too.
                      Written beside the page (dist/<name>.tex.<key>.js; --inline-packs puts it in)
  bundles             GENERATED where the fork needs them (Locus's: KratorFurniture and KratorInteriors, 66-locus-furnish.js)

Each kit's build.py names its parts and calls build(). Checks (the fragments share one function scope): every shell
fragment that draws from rnd() opens with reseed(N); no seed is used twice outside the engine; no column-0 var/function
is declared in two fragments; node --check on the script. The engine's and the kit's own rules are the town's build.py's,
which builds the same files.
"""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SHELL_DIR = os.path.join(HERE, 'targets', 'sheet')
SHELL = ['00-head.html', '20-ys-stage.js', '70-ys-sheet.js', '75-ys-emit.js', '82-ys-sky.js', '89-ys-sheetui.js',
         '98-ys-take.js', '99-tail.html']
SHELL_DETERMINISTIC = {'20-ys-stage.js', '30-ys-world.js', '75-ys-emit.js', '82-ys-sky.js', '89-ys-sheetui.js', '98-ys-take.js'}
CONFIG = '06-ys-config.js'
PACK = '46-matlib-pack.js'
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures')); import matlib_pack as _mp
sys.path.insert(0, os.path.join(ROOT, 'core', 'host')); import host as khost
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder')); import placeholder as psky

# ---- Yuni's fork of the engine (kits/yuni draws through it), read in place from settlements/yuni/src (kits/yuni/build.py
# says what each file is). 76-doors.js (the doors with the interiors and the walker) is the city's: the shell binds the doors.
YUNI_ENGINE = ['05-palette.js', '10-core.js', '45-kit.js', '47-texture.js', '50-structure.js', '51-fixtures.js', '53-assets.js',
               '72-lights.js', '81-glow.js', '86-inspect.js']
# ---- Locus's fork of the engine (kits/locus and kits/eastern-abyssal draw through it), read in place from
# settlements/locus/src. 66-locus-furnish.js is the fork's furniture hook (FURNISH, on core/furnish and the catalog), and
# 95-locus-doors.js its doors (core/door), so both are the engine's here; the rest of Locus's src/ is the town.
LOCUS_ENGINE = ['05-palette.js', '10-core.js', '45-kit.js', '47-texture.js', '50-structure.js', '53-assets.js',
                '66-locus-furnish.js', '72-lights.js', '81-glow.js', '86-inspect.js', '95-locus-doors.js']
# as settlements/locus/build.py: the catalog cultures and the interior sets its FURNISH and its interiors draw on
LOCUS_FURN_CULTURES = ['eastabyss', 'nomad', 'reedlake', 'generic', 'scrap', 'jobs']
LOCUS_INTERIOR_SETS = ['locus', 'abyss']


def locus_record_files():
    """core/materials/record as Locus takes it (KMAT and the browser loader; not 24-tex-def.js: no TEX.def painters)."""
    d = os.path.join(ROOT, 'core', 'materials', 'record')
    return {f: os.path.join(d, f) for f in ('23-mat-record.js', '25-matlib-host.js')}


def locus_bundles():
    """65z-furniture-bundle.js: the catalog (KratorFurniture: Locus's cultures and the harvested registry) and the
    interiors core with Locus's and the Abyss's sets (KratorInteriors), as Locus's page has it."""
    def gen():
        sys.path[:0] = [os.path.join(ROOT, 'kits', 'catalog'), os.path.join(ROOT, 'kits', 'interiors')]
        import furniture_bundle, kit_bundle
        return furniture_bundle.bundle(LOCUS_FURN_CULTURES, harvested=True) + kit_bundle.bundle(LOCUS_INTERIOR_SETS)
    return {'65z-furniture-bundle.js': gen}


RE_HEAD_SEED = re.compile(r'^reseed\(\s*(-?\d+)\s*\)\s*;')
RE_ANY_SEED = re.compile(r'\breseed\(\s*(-?\d+)\s*\)')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places
    (/opt/node*/bin, /usr/local/bin, ~/.nvm, ~/.volta; the newest first). None when
    there is none: the build then says plainly that the syntax was NOT checked.
    Every build.py carries this same function; a fix belongs in all of them."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
        print('NOTE: $NODE=%s is not a node binary; looking elsewhere' % env)
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


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


def config_js(cfg):
    """06-ys-config.js: the kit the shell lays out (70-ys-sheet.js reads it)."""
    out = ['/* ============================== KIT SHEET: WHICH KIT (generated by build.py) ==============================',
           '   kits/yuni/sheetbuild.py writes this from the kit\'s build.py. Do not edit. */']
    for k in ('YS_KIT', 'YS_SUBKIT', 'YS_BUILD', 'YS_GROUND_COL', 'YS_LIM', 'YS_FAM_ORDER', 'YS_FAM_NAME'):
        out.append('var %s = %s;' % (k, json.dumps(cfg[k], ensure_ascii=False, sort_keys=True)))
    return '\n'.join(out) + '\n'


def build(kit_dir, out_name, cfg, head, town, engine, kits, core_modules, core_files=None, core_host=None,
          pack_key=None, bundles=None, shell_extra=(), here_label=None):
    """Build kit_dir/dist/<out_name>.html. kits: {fragment: path} of the kit files (and any kit they lean on);
    engine: the fragment names read from settlements/<town>/src; core_modules: core/<m> folders whose numbered .js files
    are all taken; core_files: {name: path} single core files; bundles: {name: fn() -> text} generated fragments."""
    dist = os.path.join(kit_dir, 'dist')
    out = os.path.join(dist, out_name + '.html')
    town_dir = os.path.join(ROOT, 'settlements', town)
    side = None if '--inline-packs' in sys.argv else {}
    paths, core = {}, set()
    for m in core_modules:
        d = os.path.join(ROOT, 'core', *m.split('/'))
        for f in os.listdir(d):
            if f[0].isdigit() and f.endswith('.js') and not f.startswith('test'):
                paths[f] = os.path.join(d, f); core.add(f)
    for f, p in (core_files or {}).items():
        paths[f] = p; core.add(f)
    host_names = core_host or (khost.SHELL + ['93-host-inspect.js', '94-host-marks.js'])
    khost.resolve(paths, host_names); core |= set(host_names) | set(khost.SHADER)
    for f, p in psky.paths(psky.SKY_H3).items():
        paths[f] = p; core.add(f)
    eng = {f: os.path.join(town_dir, 'src', f) for f in engine}
    own = {f: os.path.join(SHELL_DIR, f) for f in list(SHELL) + list(shell_extra)}
    for group in (eng, kits, own):
        for f, p in group.items():
            if f in paths:
                sys.exit('build.py: %s is named twice (%s, %s)' % (f, paths[f], p))
            paths[f] = p
    virtual = {CONFIG: lambda: config_js(cfg), PACK: lambda: _mp.fragment(town_dir, pack_key or town, side=side)}
    virtual.update(bundles or {})
    for f in virtual:
        paths[f] = None
    order = sorted(paths)
    bodies = {f: fn() for f, fn in virtual.items()}   # generated first, so --list-sources sees what the generators read
    BSRC.report({f: p for f, p in paths.items() if p}, os.path.join(town_dir, 'tex'), os.path.join(town_dir, 'materials.json'))
    for f in order:
        if paths[f] is None:
            continue
        with open(paths[f], encoding='utf-8') as fh:
            bodies[f] = fh.read()
    for k, v in head.items():
        bodies['00-head.html'] = bodies['00-head.html'].replace(k, v)
    if '--no-checks' not in sys.argv:
        errs = check(order, bodies, core, set(eng), set(own), set(virtual))
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)
    html = ''.join(bodies[f] for f in order)
    os.makedirs(dist, exist_ok=True)
    if side:   # the pack beside the page
        html = _mp.write_sidecar(side, html, dist, out_name + '.tex.js')
    with open(out, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    with open(os.path.join(kit_dir, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order}, fh, indent=1, sort_keys=True)
        fh.write('\n')
    body = html.split('function BUILD(){', 1)[1].rsplit('</script>', 1)[0].rsplit('}', 1)[0]
    node = find_node()
    syn = 'syntax NOT CHECKED (no node: verify.py is the check)'
    if node:
        chk = os.path.join(kit_dir, '.syntax.js')
        with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write("function BUILD(){'use strict';\n" + body + "\n}\n")
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syn = 'syntax OK'
    print('built dist/%s.html (%d fragments: %d kit, %d engine from settlements/%s/src, %d sheet, %d core, %d generated; %.0f KB)  %s'
          % (out_name, len(order), len(kits), len(eng), town, len(own), len(core), len(virtual), os.path.getsize(out) / 1024, syn))


def check(order, bodies, core, engine, own, virtual):
    errs, seeds = [], {}
    skip = lambda f: not f.endswith('.js') or f in core or f in virtual
    for f in order:
        if skip(f):
            continue
        body = bodies[f]
        if f in own and f not in SHELL_DETERMINISTIC and not RE_HEAD_SEED.match(strip_head_comments(body)):
            errs.append('%s: a sheet fragment that draws does not open with reseed(N) (or list it in SHELL_DETERMINISTIC)' % f)
        if f not in engine:
            for m in RE_ANY_SEED.finditer(body):
                seeds.setdefault(m.group(1), set()).add(f)
    decl = {}
    for f in order:
        if skip(f):
            continue
        head = RE_HEAD_SEED.sub('', strip_head_comments(bodies[f]), 1)
        if strip_head_comments(head).startswith('(function'):
            continue
        if '-bio-' in f or re.match(r'var\s+[A-Za-z_$][\w$]*\s*=\s*\(function', strip_head_comments(head)):
            for m in re.finditer(r'^var\s+([A-Za-z_$][\w$]*)', bodies[f], re.M):
                decl.setdefault(m.group(1), set()).add(f)
            continue
        for m in re.finditer(r'^(?:var|function)\s+([A-Za-z_$][\w$]*)', bodies[f], re.M):
            decl.setdefault(m.group(1), set()).add(f)
        for m in re.finditer(r'^var\s+[^;\n(]*?,\s*([A-Za-z_$][\w$]*)\s*=', bodies[f], re.M):
            decl.setdefault(m.group(1), set()).add(f)
    for name, files in sorted(decl.items()):
        if len(files) > 1:
            errs.append('top-level name `%s` declared in more than one fragment: %s' % (name, ', '.join(sorted(files))))
        elif files & own and len(name) <= 2 and not name.isupper():
            errs.append('top-level name `%s` in %s is too generic for a shared scope; prefix it' % (name, ', '.join(files)))
    for key, files in sorted(seeds.items()):
        if len(files) > 1:
            errs.append('seed %s used in more than one fragment: %s' % (key, ', '.join(sorted(files))))
    return errs
