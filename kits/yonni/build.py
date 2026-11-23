#!/usr/bin/env python3
"""Concatenate src/* and shared core/kit fragments into dist/yonni.html
(the Twin-Born Spear-Queens of Yonni & the Scoured Hills, kits/yonni/PLAN.md).
The engine is core/engine, read in place (core/engine/README.md); --vendor-check reports any src/ shadow.

Usage: python3 tools/build.py kits/yonni   (a plain python3 build.py routes through tools/build.py automatically)
       python3 build.py --vendor-check     (verify zero shadowed core/vendored files)
"""
import base64, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
if '--vendor-check' not in sys.argv and '--list-sources' not in sys.argv:
    buildlib.through_tools_build(__file__)
import build_sources as BSRC                      # noqa: E402

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and '--vendor-check' not in sys.argv and '--list-sources' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then common install paths."""
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


try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

KIT_ID = 'yonni'
OUT = os.path.join(DIST, KIT_ID + '.html')
TEX_DIR = os.path.join(HERE, 'tex')
OWN_FURN = os.path.join(HERE, 'yonni_furniture.js')
CORE_DIRS = [os.path.join(ROOT, 'core', *d.split('/')) for d in (
    'shader', 'rand', 'drawn', 'materials/record', 'tags', 'furnish', 'atmos', 'door', 'walk', 'walk/box')]
RESOURCES = {f: os.path.join(ROOT, 'kits', 'resources', 'src', f) for f in ('42r-res-ore.js', '44r-res-nodes.js')}

sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
import host as khost                              # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'atmos', 'placeholder'))
import placeholder as psky                        # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
import engine as kengine                          # noqa: E402

CORE_HOST = khost.SHELL + kengine.HOST
VENDORED = {}
FURN_CULTURES = ['generic', 'generic-goods', 'jobs', 'arms', 'scrap']
FAUNA_GROUPS = ['farm', 'livestock']
VIRTUAL = {'26-matlib-pack.js', '38-furniture-bundle.js', '39-fauna-bundle.js'}
BUNDLE_GLOBALS = ('KratorFurniture', 'KratorFauna')
SIDE = None if '--inline-packs' in sys.argv else {}


def matlib_pack():
    """The library textures materials.json names, as data URLs (KMAT.pack) from committed tex/ files, plus M2 mipVariance & M3 pom."""
    pj = os.path.join(TEX_DIR, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: run tools/textures/pack.py kits/yonni */\nKMAT.pack('yonni', {});\n"
    with open(pj, encoding='utf-8') as fh:
        pack = json.load(fh)
    mv_file = os.path.join(HERE, 'mip-variance.json')
    mv_fams = json.load(open(mv_file, encoding='utf-8')).get('families', {}) if os.path.isfile(mv_file) else {}
    cfg_file = os.path.join(HERE, 'materials.json')
    cfg_fams = json.load(open(cfg_file, encoding='utf-8')).get('families', {}) if os.path.isfile(cfg_file) else {}
    if os.path.isfile(mv_file):
        BSRC.note(mv_file)
    if os.path.isfile(cfg_file):
        BSRC.note(cfg_file)
    out = []
    for fam in sorted(pack['families']):
        e = pack['families'][fam]
        fc = cfg_fams.get(fam) or {}
        sz = e.get('size', 512)
        f = {'lib': e['lib'], 'scale': e['scale'], 'size': sz[0] if isinstance(sz, list) else int(sz),
             'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        if e.get('height'):
            f['height'] = True
        if fc.get('height'):
            f['pom'] = True
        if fam in mv_fams:
            f['mipVariance'] = mv_fams[fam]
        for k, name in sorted(e['files'].items()):
            with open(os.path.join(TEX_DIR, name), 'rb') as bfh:
                f[k] = 'data:image/webp;base64,' + base64.b64encode(bfh.read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    body = '{\n' + ',\n'.join(out) + '\n}'
    if SIDE is not None:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack as _mp
        SIDE[KIT_ID] = body
        return _mp.loader(KIT_ID)
    return ('/* ============================== LIBRARY PACK (generated) ============================== */\n'
            "KMAT.pack('" + KIT_ID + "', " + body + ');\n')


def furn_bundle():
    """Bundle generic/jobs/arms/scrap from kits/catalog via catalog.py PLUS kits/yonni/yonni_furniture.js inside one closure."""
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'core', 'catalog'))
    import furniture_bundle, catalog as kcat
    fs = furniture_bundle.files(FURN_CULTURES, harvested=False)
    parts = []
    for f in fs[:-1]:
        parts.append('/* ---- %s ---- */\n%s\n' % (kcat.rel(f), furniture_bundle.read(f)))
    if os.path.isfile(OWN_FURN):
        with open(OWN_FURN, encoding='utf-8') as fh:
            parts.append('/* ---- kits/yonni/yonni_furniture.js ---- */\n%s\n' % fh.read())
    parts.append('/* ---- %s ---- */\n%s\n' % (kcat.rel(fs[-1]), furniture_bundle.read(fs[-1])))
    return furniture_bundle.safe(
        '/* kits/yonni furniture bundle: catalog + yonni_furniture.js */\n'
        'var KratorFurniture = (function () {\n%s\nreturn KF_API;\n})();\n' % ''.join(parts))


def virtual_bodies():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'fauna'))
    import fauna_bundle
    return {
        '26-matlib-pack.js': matlib_pack(),
        '38-furniture-bundle.js': furn_bundle(),
        '39-fauna-bundle.js': fauna_bundle.bundle(FAUNA_GROUPS),
    }


RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_SEED = re.compile(r'defBuilding\(\{[^}]*?\bseed\s*:\s*(\d+)', re.S)
RE_KEY = re.compile(r'defBuilding\(\{\s*key\s*:\s*[\'"]([^\'"]+)[\'"]')
GENERIC = {'seed', 'base', 'dir', 'pos', 'tmp', 'i', 'j', 'k', 'n', 'p', 't', 'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
           'h', 'm', 'q', 'r', 's', 'u', 'v', 'w'}


def sources():
    paths = {}
    for d in CORE_DIRS:
        paths.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    paths.update({f: khost.path(f) for f in CORE_HOST})
    paths.update(psky.paths(psky.SKY))
    paths.update(kengine.paths())
    core = dict(paths)
    paths.update(RESOURCES)
    if os.path.isdir(SRC):
        paths.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit()})
    return paths, core


def main():
    paths, core = sources()
    report_paths = dict(paths)
    if os.path.isfile(OWN_FURN):
        report_paths['yonni_furniture.js'] = OWN_FURN
    BSRC.report(report_paths, vendored=VENDORED.values())
    vb = virtual_bodies()
    files = sorted(list(paths) + list(vb))
    bodies = dict(vb)
    for f in files:
        if f not in vb:
            with open(paths[f], encoding='utf-8', newline='') as fh:
                bodies[f] = fh.read()
    is_core = lambda f: f in core and paths[f] == core[f]
    errs = []
    if '--no-checks' not in sys.argv:
        decl = {}
        for f in files:
            if not f.endswith('.js') or f in VIRTUAL or f in CORE_HOST:
                continue
            for m in RE_DECL.finditer(bodies[f]):
                decl.setdefault(m.group(1), set()).add(f)
        for n in BUNDLE_GLOBALS:
            if n in decl:
                errs.append('top-level name `%s` in %s clashes with generated bundle' % (n, ', '.join(sorted(decl[n]))))
        for n, fs in sorted(decl.items()):
            if len(fs) > 1:
                errs.append('top-level name `%s` declared in more than one fragment: %s' % (n, ', '.join(sorted(fs))))
            if n in GENERIC and not all(is_core(f) for f in fs):
                errs.append('top-level name `%s` (%s) is too generic for a shared scope' % (n, ', '.join(sorted(fs))))
        seeds = {}
        for f in files:
            if f in VIRTUAL or is_core(f):
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
        for f in files:
            if not (re.match(r'[4-7]\d[a-z]?-', f) and f.endswith('.js')) or is_core(f) or f in VIRTUAL:
                continue
            m = re.match(r'// prefix: (\w+)', bodies[f])
            if not m:
                errs.append('%s: building fragments start with `// prefix: xx`' % f)
                continue
            for n in RE_DECL.findall(bodies[f]):
                if not n.lower().startswith(m.group(1).lower()):
                    errs.append('%s: top-level name `%s` does not start with prefix `%s`' % (f, n, m.group(1)))
    if errs:
        print('BUILD RULES FAILED:')
        for e in errs:
            print('  -', e)
        sys.exit(1)
    html = ''.join(bodies[f] for f in files)
    os.makedirs(DIST, exist_ok=True)
    if SIDE:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack as _mp
        html = _mp.write_sidecar(SIDE, html, os.path.dirname(OUT), KIT_ID + '.tex.js', prune=False)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump({f: hashlib.sha1(bodies[f].encode('utf-8')).hexdigest()[:12] for f in files}, fh, indent=1, sort_keys=True)
        fh.write('\n')
    body = html.rsplit('<script>', 1)[1].rsplit('</script>', 1)[0]
    node = find_node()
    if node:
        chk = os.path.join(HERE, '.syntax.js')
        with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(body)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True, encoding='utf-8')
        os.remove(chk)
        if r.returncode:
            print(r.stdout + r.stderr)
            sys.exit(1)
        syn = '  syntax OK'
    else:
        syn = '  syntax NOT CHECKED (no node: verify.py is the check)'
    print('built dist/' + KIT_ID + '.html (%d fragments, %.0f KB)%s' % (len(files), os.path.getsize(OUT) / 1024, syn))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        with open(ki, encoding='utf-8') as fh:
            op = [l.rstrip() for l in fh if l.startswith('- [ ]')]
        if op:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(op))
            for l in op:
                print('  ' + l[6:])


def vendor_check():
    bad = 0
    for f, up in sorted(VENDORED.items()):
        with open(up, 'rb') as fa, open(os.path.join(SRC, f), 'rb') as fb:
            same = fa.read() == fb.read()
        bad += not same
        print('  %s  src/%-12s %s (%s)' % ('=' if same else '!', f, 'identical' if same else 'DRIFTS', os.path.relpath(up, ROOT).replace(os.sep, '/')))
    paths, core = sources()
    for f in sorted(core):
        if paths[f] != core[f]:
            print('  !  src/%-12s shadows %s' % (f, os.path.relpath(core[f], ROOT).replace(os.sep, '/')))
            bad += 1
    print('vendor-check: ' + ('OK' if not bad else 'DRIFT'))
    return not bad


if __name__ == '__main__':
    if '--vendor-check' in sys.argv:
        sys.exit(0 if vendor_check() else 1)
    main()
