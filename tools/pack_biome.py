#!/usr/bin/env python3
"""Pack a biome kit as biomes/krator-biome-<kit>.zip, ready to build on its own.

  python3 tools/pack_biome.py rift [nhighlands ...]

The zip holds biomes/<kit>/ (sources, docs, dist) as <kit>/, minus run litter, and every
shared fragment the kit's build.py reads from core/ (CORE_BIOME from core/biome,
CORE_TERRAIN from core/terrain) copied into <kit>/src/. A local src/ copy wins over core/
in every kit's build.py, so the unpacked kit builds without the rest of the repo.
"""
import ast, os, re, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'shots', 'refs', '__pycache__'}
SKIP_FILES = re.compile(r'^(three\.min\.js|\.syntax.*\.js|pack\.sh|run.*|.*\.txt|.*\.done|.*\.err)$')
CORE = {'CORE_BIOME': ('core', 'biome'), 'CORE_TERRAIN': ('core', 'terrain')}


def core_lists(build_py):
    """The CORE_* lists a kit's build.py declares (read, not executed)."""
    out = {}
    for line in open(build_py, encoding='utf8'):
        m = re.match(r'(CORE_BIOME|CORE_TERRAIN)\s*=\s*(\[.*\])', line)
        if m: out[m.group(1)] = ast.literal_eval(m.group(2))
    return out


def pack(kit):
    home = os.path.join(ROOT, 'biomes', kit)
    if not os.path.isfile(os.path.join(home, 'build.py')):
        sys.exit('no biome kit at biomes/%s' % kit)
    dst = os.path.join(ROOT, 'biomes', 'krator-biome-%s.zip' % kit)
    src_names = set(os.listdir(os.path.join(home, 'src')))
    added = []
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for dp, dns, fns in os.walk(home):
            dns[:] = sorted(d for d in dns if d not in SKIP_DIRS and not d.startswith('.'))
            for f in sorted(fns):
                if SKIP_FILES.match(f): continue
                p = os.path.join(dp, f)
                z.write(p, os.path.join(kit, os.path.relpath(p, home)))
        for name, lst in core_lists(os.path.join(home, 'build.py')).items():
            for f in lst:
                if f in src_names: continue   # the kit's own copy wins and is already in
                z.write(os.path.join(ROOT, *CORE[name], f), os.path.join(kit, 'src', f))
                added.append('/'.join(CORE[name]) + '/' + f)
    print('%s  %d KB%s' % (os.path.relpath(dst, ROOT), os.path.getsize(dst) // 1024,
                           ('  + ' + ', '.join(added)) if added else ''))


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    for k in sys.argv[1:]: pack(k)
