#!/usr/bin/env python3
"""Concatenate src/* into a single self-contained world file (Mav's Refuge).

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

Usage:  python3 build.py [--no-checks]
"""
import hashlib, json, os, re, subprocess, sys

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
ROOT = os.path.dirname(os.path.dirname(HERE))   # repo root: kits/, settlements/
SRC = os.path.join(HERE, 'src')
LOD_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'lod')   # shared level of detail (core/lod/README.md)
# the material records (core/materials/record: KMAT, TEX and the browser loader; GODOT-PLAN.md Phase 3)
RECORD_DIR = os.path.join(ROOT, 'core', 'materials', 'record')
ATMOS_DIR = os.path.join(ROOT, 'core', 'atmos')   # shared atmosphere: the sky's light on the library materials (core/atmos/README.md)
FURNISH_DIR = os.path.join(ROOT, 'core', 'furnish')   # the furniture placement pass and its draw helpers (core/furnish/README.md)
RAND_DIR = os.path.join(ROOT, 'core', 'rand')   # KRAND: the tags' uid is its hash
TAGS_DIR = os.path.join(ROOT, 'core', 'tags')   # the tag registry the furniture is registered in (core/tags/README.md)
TEX_DIR = os.path.join(HERE, 'tex')        # the library pack: tools/textures/pack.py writes it from materials.json
OUT = os.path.join(HERE, 'girder.html')
MANIFEST = os.path.join(HERE, 'build-manifest.json')

# fragments that legitimately contain no top-level generation
DETERMINISTIC = {'00-head.html', '05-palette.js', '09-lod.js', '97-lod-auto.js', '10-core.js', '80-camera.js', '81-glow.js',
                 '85-probe.js', '86-inspect.js', '87-pathviz.js', '98-start.js', '99-tail.html',
                 '53-furnish.js',      # FURNISH: catalog furniture placed as data (no rnd())
                 '56-interiors.js',    # the interiors: rooms planned and furnished per building (own RNG)
                 '83-walk.js',         # the first-person walk mode
                 '48-detail.js',       # library detail maps on meshes without UVs (no rnd())
                 '64-cards.js',        # the library's extra plant and net cards (its own generator)
                 '23-mat-record.js', '24-tex-def.js', '25-matlib-host.js',   # core/materials/record (no rnd())
                 '50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js',   # core/furnish (no rnd())
                 '08-core-rand.js', '50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js',   # core/rand, core/tags (no rnd())
                 '90-atmos-host.js'}   # binds core/atmos
DETERMINISTIC |= {f for f in os.listdir(ATMOS_DIR) if f.startswith('89-atmos-')}   # core/atmos: IIFE-scoped, its own PRNG
# GENERATED fragment, never written to src/: the catalog's furniture (kits/catalog/furniture_bundle.py: one
# closure exposing KratorFurniture) and the interiors core with the Beast Rider interior set
# (kits/interiors/kit_bundle.py: KratorInteriors, ROOM, furnishRoom). It sits between the textures (47) and
# the glue (53-furnish.js); both bundles are closures, so the build rules (reseed, palette, shared names)
# do not apply to them. The furniture cultures: beast-rider and its fallback chain (IX.CULTURE_FAMILY).
FURN_CULTURES = ['beast-rider', 'lizardmen', 'generic', 'generic-goods', 'generic-fruit']   # generic-fruit: the fruit-seller stalls (55-arch.js); generic-goods holds the fruit colours (FPAL generic)
INTERIOR_SETS = ['beast-rider']
VIRTUAL = {'51-furniture-bundle.js', '46-matlib-pack.js'}


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    return {'51-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES) + kit_bundle.bundle(INTERIOR_SETS),
            '46-matlib-pack.js': matlib_pack()}


def matlib_pack():
    """GENERATED fragment: the library textures materials.json names, as data URLs (KMAT.pack). It reads the
    committed tex/ files only, never the library or an image encoder, so the build stays deterministic."""
    import base64
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return '/* no tex/pack.json: Girder runs on its procedural textures */\nKMAT.pack(\'girder\', {});\n'
    pack = json.load(open(pj))
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX_DIR, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    return ('/* ============================== 11a. LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json): per family the library set\n'
            '   and its processed maps. Do not edit; edit materials.json and repack. */\n'
            "KMAT.pack('girder', {\n" + ',\n'.join(out) + '\n});\n')


PALETTE_FILE = '05-palette.js'

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


def check(order, bodies):
    errs, seeds = [], {}
    for f in order:
        if not f.endswith('.js') or f in VIRTUAL:
            continue
        body = bodies[f]

        if f not in DETERMINISTIC and not RE_HEAD_SEED.match(strip_head_comments(body)):
            errs.append('%s: generative fragment does not open with reseed(N). Add one, '
                        'or list the file in DETERMINISTIC in build.py.' % f)

        for m in RE_ANY_SEED.finditer(body):
            seeds.setdefault(m.group(1), set()).add(f)

        if f != PALETTE_FILE:
            for m in RE_COLOUR_ARRAY.finditer(body):
                errs.append('%s:%d: colour array outside the palette. Move it to '
                            '05-palette.js and read it from PAL.'
                            % (f, body[:m.start()].count('\n') + 1))

    # SHARED-SCOPE COLLISIONS: every fragment lives in one function scope, so a
    # column-0 `var x` / `function x` declared in two fragments silently clobbers.
    decl = {}
    for f in order:
        if not f.endswith('.js') or f in VIRTUAL:
            continue
        head = RE_HEAD_SEED.sub('', strip_head_comments(bodies[f]), 1)
        if strip_head_comments(head).startswith('(function'):
            continue      # whole fragment is one IIFE: nothing leaks
        for m in re.finditer(r'^(?:var|function)\s+([A-Za-z_$][\w$]*)', bodies[f], re.M):
            decl.setdefault(m.group(1), set()).add(f)
        for m in re.finditer(r'^var\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', bodies[f], re.M):
            decl.setdefault(m.group(1), set()).add(f)
    for name, files in sorted(decl.items()):
        if len(files) > 1:
            errs.append('top-level name `%s` declared in more than one fragment: %s' % (name, ', '.join(sorted(files))))
        elif files != {'10-core.js'} and (len(name) <= 2 or name in ('seed','base','dir','pos','tmp','i','j','k','n','p','t','x','y','z')):
            errs.append('top-level name `%s` in %s is too generic for a shared scope; prefix it' % (name, ', '.join(files)))

    for key, files in sorted(seeds.items()):
        if len(files) > 1:
            errs.append('seed %s used in more than one fragment: %s'
                        % (key, ', '.join(sorted(files))))
    return errs


def main():
    do_checks = '--no-checks' not in sys.argv
    vb = virtual_bodies()
    paths = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()}
    for d in (LOD_DIR, RECORD_DIR, ATMOS_DIR, FURNISH_DIR, RAND_DIR, TAGS_DIR):   # a src/ copy with the same name overrides
        for f in os.listdir(d):
            if f[0].isdigit() and f.endswith('.js') and f not in paths:
                paths[f] = os.path.join(d, f)
    order = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    for f in order:
        if f in vb:
            continue
        with open(paths[f], encoding='utf-8') as fh:
            bodies[f] = fh.read()

    if do_checks:
        errs = check(order, bodies)
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)

    html = ''.join(bodies[f] for f in order)
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(html)
    with open(MANIFEST, 'w') as fh:
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


if __name__ == '__main__':
    main()

# --- remind whoever is building of the open issues (see KNOWN_ISSUES.md) ---
import os as _os
_ki = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'KNOWN_ISSUES.md')
if _os.path.exists(_ki):
    _open = [l.rstrip() for l in open(_ki) if l.startswith('- [ ]')]
    if _open:
        print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md - tell the user before making changes:' % len(_open))
        for l in _open: print('  ' + l[6:])
