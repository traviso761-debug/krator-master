#!/usr/bin/env python3
"""Concatenate kits/post-apoc engine + kits/sw-arcology/src/* into dist/sw-arcology.html.

Usage: python3 build.py [--no-checks]
"""
import os, sys                                   # item 25 (the survey): a plain run goes through tools/build.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)           # build-inputs.json is always written (KRATOR_ALLOW_PLAIN_BUILD=1 skips it)
import hashlib, json, os, re, subprocess, sys

_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
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


try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))
PA_DIR = os.path.join(ROOT, 'kits', 'post-apoc')
PA_SRC = os.path.join(PA_DIR, 'src')
CORE_SOCK = os.path.join(ROOT, 'core', 'sockets')
CORE_FURNISH = os.path.join(ROOT, 'core', 'furnish')
CORE_TAGS = [os.path.join(ROOT, 'core', d) for d in ('rand', 'tags', 'walk', os.path.join('walk', 'box'), 'door')]
OUT = os.path.join(DIST, 'sw-arcology.html')

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import build_sources as BSRC
sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost

CORE_HOST = khost.SHELL + khost.KEYS + ['94-host-polytool.js', '99-host-cutaway.js']
ENGINE_READ = {'91i-interiors.js': os.path.join(ROOT, 'core', 'engine', '91i-interiors.js')}
PA_ENGINE_FILES = [
    '00-head.html', '10-core.js', '20-tex.js', '22-mat.js', '29y-pa-matlib.js',
    '30-geo.js', '32-cores.js', '34-adds.js', '35-pa-open.js', '36-def.js',
    '40-dw-small.js',
    '90-scene.js', '91-pa-api.js', '91f-furnish.js', '91n-night.js', '93-anim.js',
    '99-host-take.js', '99-tail.html',
]
FURN_CULTURES = ['scrap', 'post-apoc', 'generic']
INTERIOR_SETS = ['post-apoc']
RECORD_FILES = ['23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js']
VIRTUAL = {'38-furniture-bundle.js'}

RE_DECL = re.compile(r'^(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    vb = {
        '38-furniture-bundle.js': furniture_bundle.bundle(FURN_CULTURES) + kit_bundle.bundle(INTERIOR_SETS),
        '29x-matlib-pack.js': matlib_pack.fragment(PA_DIR, 'postapoc'),
    }
    for f in RECORD_FILES:
        vb[f] = open(os.path.join(ROOT, 'core', 'materials', 'record', f), encoding='utf-8', newline='').read()
    return vb


def main():
    paths = {f: os.path.join(CORE_SOCK, f) for f in os.listdir(CORE_SOCK) if f[0].isdigit()}
    paths.update({f: os.path.join(CORE_FURNISH, f) for f in os.listdir(CORE_FURNISH) if f[0].isdigit() and f.endswith('.js')})
    for d in CORE_TAGS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    paths.update({f: khost.path(f) for f in CORE_HOST + khost.SHADER})
    paths.update(ENGINE_READ)
    for f in PA_ENGINE_FILES:
        paths[f] = os.path.join(PA_SRC, f)
    paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    vb = virtual_bodies()
    files = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    for f in files:
        if f not in vb:
            txt = open(paths[f], encoding='utf-8', newline='').read()
            if f == '00-head.html':
                txt = txt.replace('<title>Post-Apoc Set</title>', '<title>SW Arcology Vassal Set</title>')
            bodies[f] = txt

    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in VIRTUAL or f in CORE_HOST:
                continue
            for m in RE_DECL.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
        for n, fs in sorted(decl.items()):
            if len(fs) > 1:
                errs.append('top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))))
        seeds = {}
        for f in files:
            if f in VIRTUAL:
                continue
            for m in RE_SEED.finditer(bodies[f]):
                seeds.setdefault(int(m.group(1)), []).append(f)
            keys = RE_KEY.findall(bodies[f])
            nseed = len(RE_SEED.findall(bodies[f]))
            if len(keys) != nseed:
                errs.append('%s: %d defBuilding keys but %d seeds' % (f, len(keys), nseed))
        for s, fs in seeds.items():
            if len(fs) > 1:
                errs.append('seed %d claimed twice: %s' % (s, ', '.join(fs)))
    if errs:
        print('BUILD RULES FAILED:')
        for e in errs:
            print('  -', e)
        sys.exit(1)

    html = ''.join(bodies[f] for f in files)
    BSRC.report()
    os.makedirs(DIST, exist_ok=True)
    open(OUT, 'w', encoding='utf-8', newline='').write(html)
    json.dump(
        {f: hashlib.sha1(bodies[f].encode()).hexdigest()[:12] for f in files},
        open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n'),
        indent=1, sort_keys=True,
    )
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js')
        open(chk, 'w', encoding='utf-8', newline='\n').write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True)
        os.remove(chk)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node)'
    print('built dist/sw-arcology.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))


if __name__ == '__main__':
    main()
