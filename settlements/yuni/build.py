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

  Files sharing a numeric prefix (78a-, 78b-, ...) are one fragment split
  into readable parts; the rules apply to the joined unit.

Usage:  python3 build.py [--no-checks]
"""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
OUT = os.path.join(HERE, 'yuni.html')
OUT_SHEET = os.path.join(HERE, 'yuni-assets.html')
OUT_FLORA = os.path.join(HERE, 'yuni-plants.html')
MANIFEST = os.path.join(HERE, 'build-manifest.json')

# fragments that legitimately contain no top-level generation
DETERMINISTIC = {'00-head.html', '05-palette.js', '10-core.js', '80-camera.js', '81-glow.js',
                 '85-probe.js', '86-inspect.js', '87-pathviz.js', '88-underview.js', '89-sheetui.js', '51-fixtures.js', '53-assets.js', '71-catalog.js', '98-start.js', '99-tail.html'}
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
        groups.setdefault(re.match(r'\d+', f).group(0), []).append(f)
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

    # SHARED-SCOPE COLLISIONS: every fragment lives in one function scope, so a
    # column-0 `var x` / `function x` declared in two fragments silently clobbers.
    decl = {}
    for f in order:
        if not f.endswith('.js'):
            continue
        head = RE_HEAD_SEED.sub('', strip_head_comments(bodies[f]), 1)
        if strip_head_comments(head).startswith('(function'):
            continue      # whole fragment is one IIFE: nothing leaks
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
    order = sorted(f for f in os.listdir(SRC) if f[0].isdigit())
    bodies = {}
    for f in order:
        with open(os.path.join(SRC, f)) as fh:
            bodies[f] = fh.read()

    if do_checks:
        errs = check(*units(order, bodies))
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)

    html = ''.join(bodies[f] for f in order)
    with open(OUT, 'w') as fh:
        fh.write(html)
    def flavour(target, title, h1, loading):
        t = html.replace('<title>Yuni</title>', '<title>%s</title>' % title, 1)
        t = t.replace('<script>', "<script>window.YUNI_TARGET='%s';</script>\n<script>" % target, 1)
        return t.replace('<h1 id="ttl">Yuni</h1>', '<h1 id="ttl">%s</h1>' % h1, 1).replace('Raising Yuni…', loading, 1)

    sheet = flavour('sheet', 'Yuni Building Kit', 'Yuni — building kit', 'Laying out the kit…')
    flora = flavour('flora', 'Yuni Plants',       'Yuni — plants',       'Laying out the plants…')
    with open(OUT_SHEET, 'w') as fh:
        fh.write(sheet)
    with open(OUT_FLORA, 'w') as fh:
        fh.write(flora)
    # artifact flavour: the publish skeleton supplies doctype/html/head/body, so strip ours
    import re as _re
    os.makedirs(os.path.join(HERE,'publish'), exist_ok=True)
    for src_html, name in ((html,'yuni.html'),(sheet,'yuni-building-kit.html'),(flora,'yuni-plants.html')):
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
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    except FileNotFoundError:
        print('NOTE: node not found, skipping the syntax check. Install Node to catch '
              'syntax errors here instead of in the browser.')
        r = None
    if r is not None and r.returncode:
        print(r.stdout + r.stderr)
        sys.exit(1)
    print('built %s  (%d files, %.0f KB)  syntax OK%s'
          % (os.path.basename(OUT), len(order), os.path.getsize(OUT) / 1024,
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
