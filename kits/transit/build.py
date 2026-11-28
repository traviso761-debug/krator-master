#!/usr/bin/env python3
"""Build kits/transit standalone demo page (dist/transit.html).

kits/transit is the living post-Cataclysm transit infrastructure kit (sibling to ruined kits/ancient-transit):
stepped canal pounds, miter-lock flights, zero-head miter-gate kinematics, navigable stone/iron aqueducts,
humpback/draw bridges, turning basins, street-over-canal clipping & KMASK zeroing, and Ring-Sea-compatible
canal vessels (TR_VESSEL / KCANAL).

Usage:
    python3 tools/build.py kits/transit
"""
import hashlib, io, json, os, re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                     # noqa: E402
buildlib.through_tools_build(__file__)
import build_sources as BSRC                        # noqa: E402

CORE_TAKEN = (
    'core/shader', 'core/rand', 'core/mask', 'core/drawn', 'core/sched',
    'core/materials', 'core/tags', 'core/water', 'core/atmos',
    'core/walk', 'core/export', 'core/host', 'core/space',
)

BUILD_ID = 'transit'
OUT = os.path.join(DIST, BUILD_ID + '.html')

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if not BSRC.LISTING and '--no-checks' not in sys.argv and os.path.isfile(_cp):
    if subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost                                # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky                          # noqa: E402

CORE_DIRS = [
    os.path.join(ROOT, 'core', *d.split('/'))
    for d in ('shader', 'rand', 'mask', 'drawn', 'sched', 'space',
              'materials/record', 'tags', 'water', 'atmos', 'walk', 'walk/box')
]
EXPORT_FILES = ['core/export/07-core-export.js', 'core/export/09-core-export-adapters.js']
CORE_HOST = list(dict.fromkeys(khost.FULL + khost.KEYS))

RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)


def find_node():
    import shutil
    return os.environ.get('NODE') or shutil.which('node')


def sources():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    for rel in EXPORT_FILES:
        f = os.path.basename(rel)
        paths[f] = os.path.join(ROOT, *rel.split('/'))
    paths.update({f: khost.path(f) for f in CORE_HOST})
    paths.update(psky.paths(psky.SKY_H3))
    core = dict(paths)
    if os.path.isdir(SRC):
        paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    return paths, core


def main():
    paths, core = sources()
    if BSRC.LISTING:
        BSRC.report(paths)
        return
    files = sorted(paths)
    bodies = {}
    for f in files:
        with io.open(paths[f], encoding='utf-8', newline='') as fh:
            raw = fh.read()
        if f.endswith('.js'):
            rel = os.path.relpath(paths[f], ROOT).replace(os.sep, '/')
            bodies[f] = '/* ---- %s ---- */\n%s' % (rel, raw)
        else:
            bodies[f] = raw
    BSRC.report(paths)

    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in CORE_HOST or f in ('07-core-export.js', '09-core-export-adapters.js'):
                continue
            for m in RE_DECL.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
        for n, fs in sorted(decl.items()):
            if len(fs) > 1:
                errs.append('top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))))
    if errs:
        print('BUILD RULES FAILED:')
        for e in errs:
            print('  -', e)
        sys.exit(1)

    html = ''.join(bodies[f] for f in files)
    os.makedirs(DIST, exist_ok=True)
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)

    manifest = {f: hashlib.sha1(bodies[f].encode('utf-8')).hexdigest()[:12] for f in files}
    with io.open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(manifest, fh, indent=1, sort_keys=True)
        fh.write('\n')

    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js')
        with io.open(chk, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        if os.path.exists(chk):
            os.remove(chk)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node)'
    print('built dist/%s.html (%d fragments, %.0f KB)%s' % (BUILD_ID, len(files), os.path.getsize(OUT) / 1024.0, syn))


if __name__ == '__main__':
    main()
