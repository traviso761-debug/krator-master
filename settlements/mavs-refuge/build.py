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

  4. FURNITURE. Inserts one GENERATED fragment, 52-furniture-bundle.js (never in src/): the master catalog's
     furniture (KratorFurniture) and the interiors core with the beast-rider set (KratorInteriors), placed by
     the glue 53-furnish.js. The fragment rules above do not apply to it (API.md, Furniture).

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
OUT = os.path.join(HERE, 'mavs-refuge.html')
MANIFEST = os.path.join(HERE, 'build-manifest.json')

# fragments that legitimately contain no top-level generation
DETERMINISTIC = {'00-head.html', '05-palette.js', '09-lod.js', '97-lod-auto.js', '10-core.js', '80-camera.js', '81-glow.js',
                 '85-probe.js', '86-inspect.js', '87-pathviz.js', '98-start.js', '99-tail.html'}
PALETTE_FILE = '05-palette.js'
DETERMINISTIC.add('53-furnish.js')     # the furniture glue (FURNISH, the interiors hook): no generation of its own

# GENERATED fragment: the catalog's furniture (kits/catalog/furniture_bundle.py: one closure exposing
# KratorFurniture, harvested registry included for the older br_* pieces) and the interiors core with the
# beast-rider interior set (kits/interiors/kit_bundle.py: KratorInteriors, ROOM, furnishRoom). Inserted at
# build time after 50-structure.js and before the glue 53-furnish.js; never written to src/ and exempt from
# the fragment rules (its names live in its own closures). The cultures are beast-rider and its fallback
# chain (kits/interiors IX.CULTURE_FAMILY['beast-rider'] = lizardmen, generic).
FURN_CULTURES = ['beast-rider', 'lizardmen', 'generic']
INTERIOR_SETS = ['beast-rider']
VIRTUAL = {'52-furniture-bundle.js'}


def virtual_bodies():
    root = os.path.dirname(os.path.dirname(HERE))
    sys.path.insert(0, os.path.join(root, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(root, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    return {'52-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES, harvested=True) + kit_bundle.bundle(INTERIOR_SETS)}

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
    for f in os.listdir(LOD_DIR):          # a src/ copy with the same name overrides
        if f[0].isdigit() and f not in paths:
            paths[f] = os.path.join(LOD_DIR, f)
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
