#!/usr/bin/env python3
"""Find card sheets a page may draw whole (TODO.md, "Card sheets shown whole").

Most library cards (core/materials/library/card.*) are sheets: three by three plants, or an atlas of pieces. A page
shows ONE of them in either of two ways: the slot in materials.json names a `cell` (the pack carries it and the page
windows the texture to it: BIO.libSwap, nsemiarid's libCard), or the page cuts it by hand (libCell(..., CELL(i, j)),
or the geometry's UVs: Korona's cellUV). Miss both and every instance shows the whole sheet (nsemiarid's steppe grass,
2026-10-23: "a sheet of 9"). Two more ways to lose it: an inline pack writer in a build.py that drops `cell` (the
shared tools/textures/matlib_pack.py keeps it), and page code that never reads it.

The library does not mark a card as a sheet, so this script takes one as a sheet when some build cuts it with a cell,
or its meta.json's source says nine / sheet / atlas / grid. It prints, per build, the sheet slots with no `cell` (each a
CANDIDATE: open the page's code to see whether it cuts that slot by hand) and the build's pack writer.

  python3 tools/textures/cell_audit.py            # per-build counts and writers
  python3 tools/textures/cell_audit.py --list     # every candidate slot
  python3 tools/textures/cell_audit.py biomes/korona --list
"""
import collections, glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'core', 'materials', 'library')
SHEET_WORDS = re.compile(r'atlas|sheet|3 ?x ?3|3×3|nine|grid', re.I)
SKIP = ('archive/', 'host/')


def slots(o, path=''):
    """Every {lib: ...} entry in a materials.json, with its path."""
    if isinstance(o, dict):
        if isinstance(o.get('lib'), str):
            yield path, o
        for k, v in o.items():
            if k != 'lib':
                yield from slots(v, path + '/' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from slots(v, path + '/' + str(i))


def writer(build):
    """How the build embeds its pack: the shared writer keeps `cell`; an inline one may not."""
    p = os.path.join(ROOT, build, 'build.py')
    if not os.path.exists(p):
        return '?'
    s = open(p, encoding='utf-8').read()
    if 'def matlib_pack' in s:
        return 'inline, keeps cell' if "'cell'" in s else 'inline, DROPS cell'
    return 'shared' if 'matlib_pack' in s else 'none'


def main(argv):
    only = [a.rstrip('/') for a in argv if not a.startswith('-')]
    uses = collections.defaultdict(list)   # lib -> [(build, slot, has cell)]
    for mj in sorted(glob.glob(os.path.join(ROOT, '**', 'materials.json'), recursive=True)):
        rel = os.path.relpath(mj, ROOT).replace(os.sep, '/')
        if '/dist/' in rel or rel.startswith(SKIP):
            continue
        build = os.path.dirname(rel)
        for p, e in slots(json.load(open(mj, encoding='utf-8'))):
            if e['lib'].startswith('card.'):
                uses[e['lib']].append((build, p, bool(e.get('cell'))))
    sheets = set()
    for lib, us in uses.items():
        mp = os.path.join(LIB, lib, 'meta.json')
        src = json.dumps(json.load(open(mp, encoding='utf-8')).get('source', {})) if os.path.exists(mp) else ''
        if any(c for _, _, c in us) or SHEET_WORDS.search(src):
            sheets.add(lib)
    per = collections.defaultdict(list)
    celled = set()
    for lib in sheets:
        for b, p, c in uses[lib]:
            if c:
                celled.add(b)
            else:
                per[b].append((p, lib))
    builds = sorted(set(per) | celled)
    if only:
        builds = [b for b in builds if b in only]
    print(f'{len(sheets)} sheet cards in the library; {sum(len(v) for v in per.values())} sheet slots with no cell')
    for b in builds:
        print(f'  {b:32s} {len(per[b]):3d} uncut   pack writer: {writer(b)}')
        if '--list' in argv:
            for p, lib in sorted(per[b]):
                print(f'      {p:34s} {lib}')


if __name__ == '__main__':
    main(sys.argv[1:])
