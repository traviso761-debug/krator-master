#!/usr/bin/env python3
"""Concatenate src/* into a single self-contained world file (Voth).

Also enforces the rules that make subagent work safe:

  1. RESEED DISCIPLINE. Every generative fragment must open with reseed(N),
     and no seed is used in two different fragments. The PRNG is one global
     stream; without a reseed at each fragment head, a subagent that adds two
     rnd() calls in 55-chinampa.js silently moves every tree, hut and
     farmstead generated after it. With it, each fragment is its own stream
     and an edit cannot escape the file it was made in.

  2. NO LOCAL PALETTES. Colour arrays belong in 05-palette.js; everything
     else reads PAL.

  3. MANIFEST. Writes build-manifest.json: a sha1 per fragment, so the
     planner can see which fragments a subagent actually touched and confirm
     it stayed inside its contract.

  Files sharing a numeric prefix (78a-, 78b-, ...) are one fragment split
  into readable parts; the rules apply to the joined unit.

Usage:  python3 build.py [--no-checks]
"""
import hashlib, json, os, re, subprocess, sys
try:                                   # the docs are UTF-8; a Windows console defaults to cp1252 (as iziz/build.py)
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


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


HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
LOD_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'lod')   # shared level of detail (core/lod/README.md)
MINIMAP_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'minimap')   # shared minimap (core/minimap/88-core-minimap.js)
ATMOS_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'atmos')   # shared atmosphere: the bay's wave field (core/atmos/README.md)
RAND_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'rand')   # KRAND: the tags' uid is its hash
TAGS_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'tags')   # the registry PLACED is read into (src/97t-voth-tags.js; core/tags/README.md)
MASK_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'mask')   # KMASK: the placement mask as data (core/mask/README.md; src/40-ground.js)
CORE_FRAGS = set()   # core/rand, core/tags and core/mask fragments: each a unit of its own, never grouped with a src/ prefix (50a-cantons.js keeps its reseed check)
OUT = os.path.join(HERE, 'voth.html')
MANIFEST = os.path.join(HERE, 'build-manifest.json')

# fragments that legitimately contain no top-level generation
DETERMINISTIC = {'00-head.html', '05-palette.js', '09-lod.js', '97-lod-auto.js', '10-core.js', '15-shore.js',
                 '40-ground.js', '75-terrain.js', '80-camera.js', '85-probe.js',
                 '86-inspect.js', '87-pathviz.js', '88-core-minimap.js', '88a-core-minimap-host.js', '88b-voth-minimap.js', '99-tail.html',
                 '90-atmos-host.js', '98-start.js'}
DETERMINISTIC |= {'08-core-rand.js', '50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js', '97t-voth-tags.js'}   # core/rand, core/tags, the adapter (no rnd())
DETERMINISTIC |= {'25-core-mask.js', '26-core-mask-xform.js'}   # core/mask (no rnd())
DETERMINISTIC |= {f for f in os.listdir(ATMOS_DIR) if f.startswith('89-atmos-')}   # core/atmos: IIFE-scoped, its own PRNG
PALETTE_FILE = '05-palette.js'
# the material records (core/materials/record: KMAT and the browser loader; not 24-tex-def.js) and the library pack
# (materials.json -> tools/textures/pack.py -> tex/ -> the generated 46-matlib-pack.js, never written to src/)
RECORD_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'materials', 'record')
RECORD_FILES = ['23-mat-record.js', '25-matlib-host.js']
TEX_DIR = os.path.join(HERE, 'tex')
PACK_FRAGMENT = '46-matlib-pack.js'
DETERMINISTIC |= set(RECORD_FILES) | {PACK_FRAGMENT}
CORE_FRAGS |= set(RECORD_FILES) | {PACK_FRAGMENT}


def matlib_pack():
    """GENERATED fragment: the library textures materials.json names, as data URLs (KMAT.pack), as Girder's build.py.
    It reads the committed tex/ files only, so the build stays deterministic. With no tex/pack.json, Voth runs on its
    procedural textures."""
    import base64
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: Voth runs on its procedural textures */\nKMAT.pack('voth', {});\n"
    pack = json.load(open(pj, encoding='utf-8'))
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX_DIR, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    return ('/* ============================== LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit. */\n'
            "KMAT.pack('voth', {\n" + ',\n'.join(out) + '\n});\n')

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


PARTS = {}   # unit name -> [(offset of the part in the unit body, part file)]


def where(unit, body, pos):
    """'file:line' of offset pos in a unit body, naming the part file it falls in."""
    start, f = [p for p in PARTS.get(unit, [(0, unit)]) if p[0] <= pos][-1]
    return '%s:%d' % (f, body[start:pos].count('\n') + 1)


def units(order, bodies):
    """Files that share a numeric prefix (78a-life-core.js, 78b-life-nav.js, ...) are
    one fragment split for reading: one PRNG stream opened by the first file's
    reseed(N), and one unit for every rule below. Returns the unit names (each
    unit's first file) and the unit bodies."""
    groups = {}
    for f in order:
        groups.setdefault(f if f in CORE_FRAGS else re.match(r'\d+', f).group(0), []).append(f)
    PARTS.clear()
    for g in groups.values():
        start = 0
        for x in g:
            PARTS.setdefault(g[0], []).append((start, x))
            start += len(bodies[x])
    return ([g[0] for g in groups.values()],
            {g[0]: ''.join(bodies[x] for x in g) for g in groups.values()})


def check(order, bodies):
    errs, seeds = [], {}
    for f in order:
        if not f.endswith('.js'):
            continue
        body = bodies[f]

        if f not in DETERMINISTIC and not RE_HEAD_SEED.match(strip_head_comments(body)):
            errs.append('%s: generative fragment does not open with reseed(N). Add one, '
                        'or list the file in DETERMINISTIC in build.py.' % f)

        for m in RE_ANY_SEED.finditer(body):
            seeds.setdefault(m.group(1), set()).add(f)

        if f != PALETTE_FILE:
            for m in RE_COLOUR_ARRAY.finditer(body):
                errs.append('%s: colour array outside the palette. Move it to '
                            '05-palette.js and read it from PAL.'
                            % where(f, body, m.start() + len(m.group(0)) - len(m.group(0).lstrip())))

    for key, files in sorted(seeds.items()):
        if len(files) > 1:
            errs.append('seed %s used in more than one fragment: %s'
                        % (key, ', '.join(sorted(files))))
    return errs


def main():
    do_checks = '--no-checks' not in sys.argv
    paths = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}
    for d in (LOD_DIR, MINIMAP_DIR, ATMOS_DIR, RAND_DIR, TAGS_DIR, MASK_DIR):       # a src/ copy with the same name overrides
        for f in os.listdir(d):
            if f[0].isdigit() and f not in paths and (d not in (RAND_DIR, TAGS_DIR, MASK_DIR) or f.endswith('.js')):
                paths[f] = os.path.join(d, f)
                if d in (RAND_DIR, TAGS_DIR, MASK_DIR):
                    CORE_FRAGS.add(f)
    for f in RECORD_FILES:
        paths.setdefault(f, os.path.join(RECORD_DIR, f))
    paths[PACK_FRAGMENT] = None              # generated: matlib_pack()
    order = sorted(paths)
    bodies = {}
    for f in order:
        if paths[f] is None:
            bodies[f] = matlib_pack()
            continue
        with open(paths[f], encoding='utf-8') as fh:
            bodies[f] = fh.read()

    if do_checks:
        errs = check(*units(order, bodies))
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)

    html = ''.join(bodies[f] for f in order)
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(html)
    with open(MANIFEST, 'w', encoding='utf-8') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order},
                  fh, indent=1, sort_keys=True)

    body = html.split("function BUILD(){", 1)[1].rsplit("</script>", 1)[0]
    body = body.rsplit('}', 1)[0]
    chk = os.path.join(HERE, '.syntax.js')
    with open(chk, 'w', encoding='utf-8') as fh:
        fh.write("function BUILD(){'use strict';\n" + body + "\n}\n")
    try:
        r = subprocess.run([find_node() or 'node', '--check', chk], capture_output=True, text=True)
    except FileNotFoundError:
        print('NOTE: node not found, skipping the syntax check. Install Node to catch '
              'syntax errors here instead of in the browser.')
        r = None
    if r is not None and r.returncode:
        print(r.stdout + r.stderr)
        sys.exit(1)
    print('built %s  (%d files, %.0f KB)  %s%s'
          % (os.path.basename(OUT), len(order), os.path.getsize(OUT) / 1024,
             'syntax OK' if r is not None else 'syntax NOT CHECKED (no node)',
             '' if do_checks else '  [checks skipped]'))

    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        with open(ki, encoding='utf-8') as fh:
            open_items = [l.rstrip() for l in fh if l.startswith('- [ ]')]
        if open_items:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(open_items))
            for l in open_items:
                print('  ' + l[6:])


if __name__ == '__main__':
    main()
