#!/usr/bin/env python3
"""THE KIT SHEET for the kits on the Vernacular's contract (VERN.def / VERN.place over the Ancients core): the page each kit's
own build.py makes from its own fragments and core, with no settlement's page shell (kits/iziz-vernacular/README.md, "Its
own sheet"; MODULARITY-PLAN.md step 4). Taken by kits/iziz-vernacular, kits/highlands and kits/xanadu (2026-11-09), each by
path (the kits already draw through the Vernacular):

    sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
    import sheet as ksheet
    S = ksheet.compose(HERE, KIT_PATHS, generative=BUILDINGS, pack='highlands', virtual={...})
    BSRC.report()                       # --list-sources: before the first write
    ksheet.write(S, 'highlands.html')

The page is one <script>, in filename order, of:
  the shell            kits/iziz-vernacular/src/00-vsheet-head.html, 90-vsheet-scene.js (renderer, the placeholder sky's light,
                       the rows, the build), 95-vsheet-doors.js (core/door's host), 99-vsheet-start.js (KHOST.take), 99-vsheet-tail.html
  the Ancients core    kits/ancients/src (10-core ... 69-mat-salvage), read in place, with core/materials (20, 22, 68, opt/69a)
  core/rand            08-core-rand.js (KRAND: core/tags' uid is its hash)
  core/tags            50/52/53-core-tags*.js (KTAGS: every site registered, the inspector's words)
  core/walk            20-core-walk.js (KWALK: the doors' walk blocks, the walker)
  core/door            10-core-door.js, 20-core-glass.js, 30-core-door-leaf.js, 90-core-door-host.js (KDOOR, KGLASS, KDOORLEAF, KDOORHOST)
  core/host            the shell and the interface (khost.FULL but core/space and core/edits, as Iziz takes it), core/clock, core/shader
  core/atmos           placeholder/81-sky.js (KratorSky: the placeholder sky for a kit's viewer page), read by path
  core/materials       record/23, 25, 26 (KMAT) and the GENERATED 88x-matlib-pack.js from the kit's tex/ (tools/textures/pack.py
                       from its materials.json; the maps in a sidecar beside the page, <page>.tex.<pack>.js)
  the kit              its fragments (the caller's KIT_PATHS) and its targets/sheet/ (89z-rows.js: SHEET; 88y-*-matlib.js: the
                       library bind; 91t-*-tags.js: REG into core/tags with the kit's spellings)
  virtual              GENERATED bodies the caller adds (Highlands: the catalog furniture and the interiors core)

Checks, as the settlements' builds made them (the fragments share one scope): every build*() opens with reseed(N), no seed is
claimed by two fragments, a generative fragment has a builder or a reseed, no column-0 name is declared twice or is a generic
short name; `node --check` on the script when node exists (else the build says the syntax was NOT checked)."""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SHELL = ['00-vsheet-head.html', '90-vsheet-scene.js', '95-vsheet-doors.js', '99-vsheet-start.js', '99-vsheet-tail.html']
ANCIENTS_CORE = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js',
                 '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js']          # kits/ancients/src
CORE_MATERIALS = ['20-textures.js', '22-materials.js', '68-mat-v5.js']                  # core/materials
CORE_OPT = ['69a-world-uv.js']                                                          # core/materials/opt
RECORD_FILES = ['23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js']           # core/materials/record (not 24-tex-def.js: its TEX clashes)
CORE_RAND = ['08-core-rand.js']
CORE_TAGS = ['50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js']
CORE_WALK = ['20-core-walk.js']
CORE_DOOR = ['10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js', '90-core-door-host.js']
MATLIB_PACK = '88x-matlib-pack.js'

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost   # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky   # noqa: E402
CORE_HOST = [f for f in khost.FULL if f not in ('20-core-space.js', '40-core-edits.js')]   # no editor world; the inspector scans the records


def core_paths():
    """{fragment name: path} of the shell and every core file a sheet takes."""
    p = {f: os.path.join(HERE, 'src', f) for f in SHELL}
    p.update({f: os.path.join(ROOT, 'kits', 'ancients', 'src', f) for f in ANCIENTS_CORE})
    p.update({f: os.path.join(ROOT, 'core', 'materials', f) for f in CORE_MATERIALS})
    p.update({f: os.path.join(ROOT, 'core', 'materials', 'opt', f) for f in CORE_OPT})
    p.update({f: os.path.join(ROOT, 'core', 'materials', 'record', f) for f in RECORD_FILES})
    p.update({f: os.path.join(ROOT, 'core', 'rand', f) for f in CORE_RAND})
    p.update({f: os.path.join(ROOT, 'core', 'tags', f) for f in CORE_TAGS})
    p.update({f: os.path.join(ROOT, 'core', 'walk', f) for f in CORE_WALK})
    p.update({f: os.path.join(ROOT, 'core', 'door', f) for f in CORE_DOOR})
    p.update(psky.paths(psky.SKY))
    khost.resolve(p, CORE_HOST)
    return p


RE_BUILDER = re.compile(r'^function\s+(build[A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{(.{0,80})', re.M)
RE_RESEED_ARG = re.compile(r'\breseed\(\s*([^)]*?)\s*\)')
RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z',
           'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def seeds_claimed(arg):
    """The seeds a reseed() argument can produce (a builder runs once per decay state d in 0..2)."""
    arg = arg.replace(' ', '')
    m = re.fullmatch(r'(-?\d+)', arg)
    if m:
        return {int(m.group(1))}
    m = re.fullmatch(r'(-?\d+)\+d', arg)
    if m:
        n = int(m.group(1))
        return {n, n + 1, n + 2}
    m = re.fullmatch(r'd>0\?(-?\d+):(-?\d+)', arg)
    if m:
        return {int(m.group(1)), int(m.group(2))}
    return set()


def check(order, bodies, generative, scoped):
    errs, claims = [], {}
    for f in order:
        if not f.endswith('.js') or f in scoped:
            continue
        body = bodies[f]
        for m in RE_BUILDER.finditer(body):
            if 'reseed(' not in m.group(3):
                errs.append('%s: %s() does not open with reseed(N)' % (f, m.group(1)))
        for m in RE_RESEED_ARG.finditer(body):
            for s in seeds_claimed(m.group(1)):
                claims.setdefault(s, set()).add(f)
        if f in generative and not RE_BUILDER.search(body) and 'reseed(' not in body and 'VERN.def' not in body:
            errs.append('%s: generative fragment with no builder, no def and no reseed(N)' % f)
    for s, files in sorted(claims.items()):
        if len(files) > 1:
            errs.append('seed %d claimed by more than one fragment: %s' % (s, ', '.join(sorted(files))))
    decl = {}
    for f in order:
        if not f.endswith('.js') or f in scoped:
            continue
        for rx in (RE_DECL, RE_DECL_MULTI):
            for m in rx.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
    for name, files in sorted(decl.items()):
        if len(files) > 1:
            errs.append('top-level name `%s` declared in more than one fragment: %s' % (name, ', '.join(sorted(files))))
        elif name in GENERIC and files != {'10-core.js'}:
            errs.append('top-level name `%s` in %s is too generic for a shared scope' % (name, ', '.join(files)))
    return errs


def compose(kit_dir, kit_paths, generative=(), pack=None, virtual=None, target='sheet'):
    """Read every fragment of the sheet: the shell and core (core_paths()), the kit's (kit_paths: {name: path}) and its
    targets/<target>/; `virtual` {name: body} GENERATED bodies; `pack` the KMAT pack key of the kit's tex/. A kit file with a
    core file's name stops the build (the sheet reads core in place; nothing is vendored)."""
    paths = core_paths()
    tdir = os.path.join(kit_dir, 'targets', target)
    tgt = {f: os.path.join(tdir, f) for f in sorted(os.listdir(tdir)) if f[0].isdigit()}
    for group in (kit_paths, tgt):
        clash = sorted(set(group) & set(paths))
        if clash:
            raise SystemExit('kit sheet: %s shadows a fragment the sheet already takes: %s' % (os.path.relpath(kit_dir, ROOT), ', '.join(clash)))
        paths.update(group)
    virtual = dict(virtual or {})
    bodies = dict(virtual)
    for f, p in paths.items():
        with open(p, encoding='utf-8', newline='') as fh:
            bodies[f] = fh.read()
    side = {}
    if pack:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack
        bodies[MATLIB_PACK] = matlib_pack.fragment(kit_dir, pack, side=side)
        virtual[MATLIB_PACK] = bodies[MATLIB_PACK]
    order = sorted(bodies)
    scoped = set(CORE_HOST) | set(khost.SHADER) | set(virtual)
    return {'kit_dir': kit_dir, 'paths': paths, 'bodies': bodies, 'order': order, 'side': side, 'pack': pack,
            'generative': set(generative), 'scoped': scoped, 'target': target}


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places (as every build.py's find_node)."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env and (_sh.which(env) or os.path.isfile(env)):
        return _sh.which(env) or env
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node', os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


def write(S, out_name, do_checks=True):
    """Check, join and write dist/<out_name> (and its texture sidecar), the build manifest and the syntax check."""
    order, bodies = S['order'], S['bodies']
    if do_checks:
        errs = check(order, bodies, S['generative'], S['scoped'])
        if errs:
            print('BUILD RULES FAILED (%s):' % os.path.relpath(S['kit_dir'], ROOT).replace(os.sep, '/'))
            for e in errs:
                print('  -', e)
            sys.exit(1)
    html = ''.join(bodies[f] for f in order)
    m = re.search(r"title\s*:\s*'([^']*)'", bodies.get('89z-rows.js', ''))   # the gallery reads the static <title>: stamp SHEET.title in
    if m:
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % m.group(1), html, count=1)
    dist = os.path.join(S['kit_dir'], 'dist')
    os.makedirs(dist, exist_ok=True)
    if S['side']:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack
        html = matlib_pack.write_sidecar(S['side'], html, dist, out_name.rsplit('.html', 1)[0] + '.tex.js')
    out = os.path.join(dist, out_name)
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(S['kit_dir'], 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({f: hashlib.sha1(bodies[f].replace('\r\n', '\n').encode()).hexdigest()[:12] for f in order}, fh, indent=1, sort_keys=True)
        fh.write('\n')
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    chk = os.path.join(S['kit_dir'], '.syntax-sheet.js')
    with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(body)
    node = find_node()
    if node:
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syntax = 'syntax OK'
    else:
        syntax = 'syntax NOT CHECKED (no node: verify.py is the only syntax check)'
    print('built %s (%d fragments, %.0f KB)  %s%s' % (os.path.relpath(out, S['kit_dir']).replace(os.sep, '/'), len(order),
                                                     os.path.getsize(out) / 1024, syntax, '' if do_checks else '  [checks skipped]'))
    return out


def port_lint(kit_dir):
    """tools/check_port.py on the kit (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser."""
    cp = os.path.join(ROOT, 'tools', 'check_port.py')
    if os.path.isfile(cp) and '--no-checks' not in sys.argv and subprocess.call([sys.executable, cp, '--quiet', kit_dir]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')
