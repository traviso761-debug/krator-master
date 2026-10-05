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
SRC = os.path.join(HERE, 'src')
LOD_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'lod')   # shared level of detail (core/lod/README.md)
FURNISH_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'furnish')   # the furniture placement pass (core/furnish/README.md)
RAND_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'rand')   # KRAND: the tags' uid is its hash
TAGS_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'tags')   # the tag registry the furniture is registered in (core/tags/README.md)
MASK_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'mask')   # KMASK: the placement mask as data (core/mask/README.md)
ATMOS_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'atmos')   # the lake's wave field (core/atmos/README.md)
CLOCK_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'clock')   # KCLOCK: the world clock (core/clock)
MINIMAP_DIR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core', 'minimap')   # KMAP: the plan panel (core/minimap)
# The eastern-abyss biome: core/biome and the canonical kit biomes/eastabyss, read in place under Locus's slot names (the
# names keep their order: after the kit builders, before 69b's host binding and 69z's planting). Mungo reads this map too.
_ROOT = os.path.dirname(os.path.dirname(HERE))
BIO_CANON = {'69a1-bio-core-head.js': ('core', 'biome', '10-core-head.js'),
             '69a2-bio-core-kit.js': ('core', 'biome', '20-core-kit.js'),
             '69a3-bio-core-foliage.js': ('core', 'biome', '30-core-foliage.js'),
             '69a4-bio-core-place.js': ('core', 'biome', '40-core-place.js'),
             '69c1-bio-eastabyss-species.js': ('biomes', 'eastabyss', 'src', '50-biome-eastabyss-species.js'),
             '69c2-bio-eastabyss-trees.js': ('biomes', 'eastabyss', 'src', '55-biome-eastabyss-trees.js'),
             '69c3-bio-eastabyss-floor.js': ('biomes', 'eastabyss', 'src', '60-biome-eastabyss-floor.js'),
             '69c4-bio-eastabyss-dress.js': ('biomes', 'eastabyss', 'src', '65-biome-eastabyss-dress.js'),
             '69c5-bio-eastabyss.js': ('biomes', 'eastabyss', 'src', '70-biome-eastabyss.js')}
BIO_CANON = {k: os.path.join(_ROOT, *v) for k, v in BIO_CANON.items()}
OUT = os.path.join(HERE, 'locus.html')
OUT_SHEET = os.path.join(HERE, 'yuni-assets.html')
OUT_FURN = os.path.join(HERE, 'yuni-furniture.html')
OUT_FLORA = os.path.join(HERE, 'locus-plants.html')
OUT_LOCUS = os.path.join(HERE, 'locus-kit.html')
OUT_ABYSS = os.path.join(HERE, 'abyss-kit.html')
MANIFEST = os.path.join(HERE, 'build-manifest.json')

# fragments that legitimately contain no top-level generation
DETERMINISTIC = {'00-head.html', '05-palette.js', '09-lod.js', '97-lod-auto.js', '10-core.js', '80-camera.js', '81-glow.js',
                 '85-probe.js', '86-inspect.js', '69z-locus-flora.js', '84-life.js', '76-locus-anim.js', '69b-locus-biohost.js', '87-pathviz.js', '88-underview.js', '89-sheetui.js', '53-assets.js', '71-catalog.js', '98-start.js', '99-tail.html', '66-locus-furnish.js'}
DETERMINISTIC |= {'50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js'}   # core/furnish (no rnd())
DETERMINISTIC |= {'25-core-mask.js', '26-core-mask-xform.js'}   # core/mask (no rnd())
DETERMINISTIC |= {f for f in os.listdir(ATMOS_DIR) if f.startswith('89-atmos-')} | {'90-atmos-host.js', '20-core-clock.js', '88-core-minimap.js', '88a-core-minimap-host.js', '88b-locus-minimap.js'}   # core/atmos: IIFE-scoped, its own PRNG; core/clock
DETERMINISTIC |= {'08-core-rand.js', '50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'}   # core/rand, core/tags (no rnd())
PALETTE_FILE = '05-palette.js'

# GENERATED fragments, never written to src/: the catalog's furniture (kits/catalog/furniture_bundle.py: one closure
# exposing KratorFurniture: the eastabyss culture and its fallback chain, plus the harvested registry for the Yuni
# pieces) and the interiors core with the Locus and Abyss interior sets (kits/interiors/kit_bundle.py:
# KratorInteriors, ROOM, furnishRoom). Inserted after the kit builders (65-abyss-*) and before the glue
# 66-locus-furnish.js (FURNISH, the interiors hook). Both generators' own text is exempt from the rules below.
ROOT = os.path.dirname(os.path.dirname(HERE))
FURN_CULTURES = ['eastabyss', 'nomad', 'reedlake', 'generic', 'scrap', 'jobs']   # scrap: pa_drum, the standing oil drum; jobs: the work items (kits/catalog/krator-master-furniture-jobs.js)
INTERIOR_SETS = ['locus', 'abyss']
VIRTUAL = {'65z-furniture-bundle.js'}


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    return {'65z-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES, harvested=True) + kit_bundle.bundle(INTERIOR_SETS)}


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

        if '-bio-' in f:
            # a PORTED BIOME fragment: it has its own PRNG and palettes and must not reach into
            # this world's engine (the eastern-abyss kit's own rule, BIOME-API.md)
            for w in ['kdef(','kput(','BUCKET[','MBK[','FAMMAT[','PLACED','ST.edges','SITES_L','LOCUS_FIELDS']:
                if w in body: errs.append('%s: biome fragment depends on a host global (%s)' % (f, w))
            continue
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
        if '-bio-' in f:
            # a ported biome fragment: one `var` (BIO / EASTABYSS) then one IIFE; everything else is local
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
        elif files != {'10-core.js'} and ((len(name) <= 2 and not name.isupper()) or name in ('seed','base','dir','pos','tmp','i','j','k','n','p','t','x','y','z')):
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
    for d in (LOD_DIR, FURNISH_DIR, RAND_DIR, TAGS_DIR, MASK_DIR, ATMOS_DIR, CLOCK_DIR, MINIMAP_DIR):       # a src/ copy with the same name overrides
        for f in os.listdir(d):
            if f[0].isdigit() and f.endswith('.js') and f not in paths:
                paths[f] = os.path.join(d, f)
    for f, p in BIO_CANON.items():                               # the biome, in place (a src/ copy would override)
        paths.setdefault(f, p)
    order = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    for f in order:
        if f in vb:
            continue
        with open(paths[f]) as fh:
            bodies[f] = fh.read()

    if do_checks:
        errs = check(order, bodies)
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)

    html = ''.join(bodies[f] for f in order)
    with open(OUT, 'w') as fh:
        fh.write(html)
    def flavour(target, title, h1, loading):
        t = html.replace('<title>Locus</title>', '<title>%s</title>' % title, 1)
        t = t.replace('<script>', "<script>window.YUNI_TARGET='%s';</script>\n<script>" % target, 1)
        return t.replace('<h1 id="ttl">Locus</h1>', '<h1 id="ttl">%s</h1>' % h1, 1).replace('Raising Locus…', loading, 1)
    locus = flavour('locus', 'Locus Building Kit', 'Locus — building kit', 'Laying out the Locus kit…')
    abyss = flavour('abyss', 'Abyssal Building Kit', 'Eastern Abyss — building kit', 'Laying out the abyssal kit…')
    flora = flavour('flora', 'Locus Plants', 'Locus — plants', 'Laying out the plants…')
    with open(OUT_LOCUS, 'w') as fh: fh.write(locus)
    with open(OUT_ABYSS, 'w') as fh: fh.write(abyss)
    with open(OUT_FLORA, 'w') as fh: fh.write(flora)
    os.makedirs(os.path.join(HERE,'publish'), exist_ok=True)
    for src_html, name in ((html,'locus.html'),(locus,'locus-building-kit.html'),(abyss,'abyss-building-kit.html'),(flora,'locus-plants.html')):
        a_ = src_html
        for tag in ('<!DOCTYPE html>','<html lang="en">','<head>','</head>','<body>','</body>','</html>','<meta charset="utf-8">','<meta name="viewport" content="width=device-width,initial-scale=1">'):
            a_ = a_.replace(tag,'')
        with open(os.path.join(HERE,'publish',name),'w') as fh: fh.write(a_.lstrip())
    with open(MANIFEST, 'w') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in order},
                  fh, indent=1, sort_keys=True)

    body = html.split("function BUILD(){", 1)[1].rsplit("</script>", 1)[0]
    body = body.rsplit('}', 1)[0]
    chk = os.path.join(HERE, '.syntax.js')
    with open(chk, 'w') as fh:
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
