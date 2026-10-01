#!/usr/bin/env python3
"""Build the Jimjam kit page from sorted source and target fragments."""
import hashlib
import json
import os
import re
import subprocess
import sys


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
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
TARGET = os.path.join(HERE, 'targets', 'kit')
DIST = os.path.join(HERE, 'dist')
CORE = os.path.join(ROOT, 'core', 'materials')
SHARED_MATERIALS = ['20-textures.js', '22-materials.js', '68-mat-v5.js']
SOCKETS = os.path.join(ROOT, 'core', 'sockets')
LOD_DIR = os.path.join(ROOT, 'core', 'lod')        # shared level of detail (core/lod/README.md)
LOD_FILES = sorted(f for f in os.listdir(LOD_DIR) if f[:1].isdigit())
MANIFEST_FILES = [
    '10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js',
    '36-decor.js', '38-helpers2.js', '50-registry.js', '54-mat-concrete.js',
    '81-sky.js', '37-sockets.js', '80-cultures.js', *SHARED_MATERIALS,
]
DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
BUILDER = re.compile(r'^function\s+(buildJj\w*)\s*\([^)]*\)\s*\{(.{0,100})', re.M)
PREFIX_FILES = {'60-jj-mat.js', '61-jj-helpers.js'}
ALLOWED_TARGET_GLOBALS = {'TITLE', 'GROUND_C', 'SITES', 'VIEWS', 'JJ_FURN_SITES', 'JJ_FLORA_SITES', 'JJ_ROW_ORDER', 'JJ_ROWS', 'JJ_ROW_Z', 'JJ_ROW_GAP'}


def source_paths():
    files = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[:1].isdigit()}
    for f in SHARED_MATERIALS:
        if f not in files:
            files[f] = os.path.join(CORE, f)
    for f in LOD_FILES:
        if f not in files:
            files[f] = os.path.join(LOD_DIR, f)
    target_files = {f: os.path.join(TARGET, f) for f in os.listdir(TARGET) if f[:1].isdigit()}
    overlap = set(files) & set(target_files)
    if overlap:
        raise SystemExit('target shadows source fragments: ' + ', '.join(sorted(overlap)))
    files.update(target_files)
    return dict(sorted(files.items()))


def validate(bodies):
    errors = []
    owners = {}
    for filename, body in bodies.items():
        if filename.endswith('.js'):
            for match in BUILDER.finditer(body):
                if 'reseed(' not in match.group(2):
                    errors.append(f'{filename}: {match.group(1)} must open with reseed(seed)')
        for name in DECL.findall(body):
            if filename in PREFIX_FILES and not (name.lower().startswith('j') or name.startswith('buildJj')):
                errors.append(f'{filename}: top-level name {name!r} must use the JJ prefix')
            if filename.startswith('89z-') and name not in ALLOWED_TARGET_GLOBALS and name not in {'jj_helper_gallery'}:
                errors.append(f'{filename}: unexpected target global {name!r}')
            owners.setdefault(name, []).append(filename)
    for name, files in owners.items():
        if len(files) > 1:
            errors.append(f'top-level name {name!r} is declared in: {", ".join(files)}')
    if errors:
        raise SystemExit('BUILD RULES FAILED:\n  - ' + '\n  - '.join(errors))


def write_vendor_manifest():
    hashes = {}
    for f in MANIFEST_FILES:
        path = os.path.join(SRC, f)
        if not os.path.exists(path):
            path = os.path.join(CORE if f in SHARED_MATERIALS else SOCKETS, f)
        with open(path, 'rb') as src:
            hashes[f] = hashlib.sha1(src.read()).hexdigest()[:12]
    three = os.path.join(HERE, 'three.min.js')
    if os.path.exists(three):
        with open(three, 'rb') as src:
            hashes['three.min.js'] = hashlib.sha1(src.read()).hexdigest()[:12]
    with open(os.path.join(HERE, 'VENDOR.json'), 'w', encoding='utf-8') as out:
        json.dump(hashes, out, indent=2, sort_keys=True)
        out.write('\n')


def build():
    paths = source_paths()
    bodies = {}
    for f, path in paths.items():
        with open(path, encoding='utf-8', newline='') as src:
            bodies[f] = src.read()
    validate(bodies)
    html = ''.join(bodies.values())
    title_match = re.search(r"const TITLE\s*=\s*'([^']*)'", bodies.get('89z-rows.js', ''))
    if title_match:
        html = re.sub(r'<title>.*?</title>', '<title>' + title_match.group(1) + '</title>', html, count=1)
    os.makedirs(DIST, exist_ok=True)
    output = os.path.join(DIST, 'jimjam-kit.html')
    with open(output, 'w', encoding='utf-8', newline='') as dst:
        dst.write(html)
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8') as dst:
        json.dump({f: hashlib.sha1(body.encode()).hexdigest()[:12] for f, body in bodies.items()}, dst, indent=2, sort_keys=True)
        dst.write('\n')
    write_vendor_manifest()
    node = find_node() or 'node'
    script = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    scratch = os.path.join(HERE, '.syntax-jimjam.js')
    with open(scratch, 'w', encoding='utf-8') as dst:
        dst.write(script)
    try:
        result = subprocess.run([node, '--check', scratch], capture_output=True, text=True)
        if result.returncode:
            print(result.stdout + result.stderr)
            raise SystemExit(result.returncode)
        syntax = 'syntax OK'
    except FileNotFoundError:
        syntax = 'syntax not checked (Node.js not found)'
    print(f'built dist/jimjam-kit.html ({len(paths)} fragments, {os.path.getsize(output)/1024:.1f} KB; {syntax})')


def vendor_check():
    ancients = os.path.join(ROOT, 'kits', 'ancients', 'src')
    iziz = os.path.join(ROOT, 'settlements', 'iziz', 'src')
    checks = [('iziz', f, os.path.join(iziz, f)) for f in MANIFEST_FILES
              if f not in SHARED_MATERIALS and f not in ('37-sockets.js', '80-cultures.js')]
    checks.extend(('materials', f, os.path.join(CORE, f)) for f in SHARED_MATERIALS)
    checks.extend(('sockets', f, os.path.join(SOCKETS, f)) for f in ('37-sockets.js', '80-cultures.js'))
    drift = []
    for kind, f, upstream in checks:
        local = os.path.join(SRC, f) if kind != 'materials' and kind != 'sockets' else os.path.join(CORE if kind == 'materials' else SOCKETS, f)
        if not os.path.exists(upstream) or not os.path.exists(local) or open(upstream, 'rb').read() != open(local, 'rb').read():
            drift.append(f'{kind}/{f}')
    for f in MANIFEST_FILES:
        if f in SHARED_MATERIALS or f in ('37-sockets.js', '80-cultures.js', '81-sky.js'):
            continue
        upstream = os.path.join(ancients, f)
        local = os.path.join(SRC, f)
        if os.path.exists(ancients) and (not os.path.exists(upstream) or open(upstream, 'rb').read() != open(local, 'rb').read()):
            drift.append(f'ancients/{f}')
    print('vendor-check: ' + ('all available upstream fragments match' if not drift else 'drift: ' + ', '.join(drift)))
    if drift:
        raise SystemExit(1)


if __name__ == '__main__':
    if '--vendor-check' in sys.argv:
        vendor_check()
    else:
        build()
