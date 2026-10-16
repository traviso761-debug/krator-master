#!/usr/bin/env python3
"""Build kits/ancients-interiors: the Ancients' ship interiors (backported from Noah's Regret) and its demo sheet.

Outputs (deterministic; build-manifest.json holds a sha1 per input):

  dist/ancients-interiors-core.js   src/10-49: KratorAncientsInteriors (the ship programmes, rooms, cabins, dress,
                                    hall recipes, audit). Engine-neutral: no THREE, no DOM, no catalog. It needs
                                    kits/interiors' core (KratorInteriors) loaded first. kit_bundle.py gives the same
                                    text to another build.
  dist/ancients-interiors.html      the demo sheet: every hall recipe in both dresses, the ship's rooms and cabins.

The page loads three.js, the catalog engine and the furniture registry BY PATH from ../../catalog (like
kits/interiors' demo), then ONE inline script:

  kits/interiors/src/10-49*.js          the interiors core (read from that kit, not copied)
  kits/interiors/sets/noahs-regret.js     the arcology's set: the crew, bunkroom and mess programmes
  kits/interiors/adapters/catalog-adapter.js
  kits/interiors/src/50-shell.js, 55-cutaway.js   the room shells and the cut-away
  src/10-49*.js                          this kit's core
  src/50-98*.js                          the demo sheet

build.py refuses a top-level name declared twice or already declared by the catalog files, runs the port lint
(tools/check_port.py, PORT.md), `node --check` on the script and the core, then loads the core in node on top of
the interiors core.

Usage:  python3 build.py [--no-checks]
"""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
CATALOG = os.path.join(ROOT, 'kits', 'catalog')
IXK = os.path.join(ROOT, 'kits', 'interiors')

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and os.path.isfile(os.path.join(HERE, 'PORT.md')) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

IX_VIEWS = ['50-shell.js', '55-cutaway.js']
# the arcology's own interior set: its crew, bunkroom and mess programmes (the cabins and the wardroom use them)
IX_SETS = ['noahs-regret']
CATALOG_LOADED = ['three.min.js', 'krator-furniture-core.js', 'krator-asset-engine.js', 'krator-symbols.js', 'krator-furniture-kit.js',
                  'krator-master-furniture.js'] + sorted(
    f for f in os.listdir(CATALOG) if f.startswith('krator-master-furniture-') and f.endswith('.js')) + ['inspector.js']

RE_DECL = re.compile(r'^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)', re.M)
RE_DECL_MULTI = re.compile(r'^(?:const|let|var)\s+[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=', re.M)


def read(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


def decls(body):
    out = set()
    for rx in (RE_DECL, RE_DECL_MULTI):
        out.update(m.group(1) for m in rx.finditer(body))
    return out


def check(parts):
    errs, seen = [], {}
    for name, body in parts:
        for d in decls(body):
            seen.setdefault(d, []).append(name)
    for d, fs in sorted(seen.items()):
        if len(fs) > 1:
            errs.append('top-level name `%s` declared in more than one file: %s' % (d, ', '.join(fs)))
    for f in CATALOG_LOADED[1:]:
        p = os.path.join(CATALOG, f)
        if not os.path.exists(p):
            errs.append('catalog file missing: kits/catalog/%s' % f)
            continue
        for d in sorted(decls(read(p)) & set(seen)):
            errs.append('top-level name `%s` (%s) clashes with kits/catalog/%s' % (d, ', '.join(seen[d]), f))
    return errs


def node_check(name, text):
    chk = os.path.join(HERE, '.syntax-%s.js' % name)
    with open(chk, 'w', encoding='utf-8', newline='') as fh:
        fh.write(text)
    try:
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    except FileNotFoundError:
        return 'syntax NOT CHECKED (no node)'
    if r.returncode:
        print(r.stdout + r.stderr)
        sys.exit(1)
    return 'syntax OK'


def core_files():
    return ['src/' + f for f in sorted(os.listdir(SRC)) if f[0].isdigit() and f.endswith('.js') and f < '50']


def main():
    frags = sorted(f for f in os.listdir(SRC) if f[0].isdigit())
    ix_core = [('kits/interiors/src/' + f, read(os.path.join(IXK, 'src', f))) for f in sorted(os.listdir(os.path.join(IXK, 'src')))
               if f[0].isdigit() and f.endswith('.js') and f < '50']
    ix_rest = [('kits/interiors/sets/%s.js' % n, read(os.path.join(IXK, 'sets', n + '.js'))) for n in IX_SETS] + \
              [('kits/interiors/adapters/catalog-adapter.js', read(os.path.join(IXK, 'adapters', 'catalog-adapter.js')))] + \
              [('kits/interiors/src/' + f, read(os.path.join(IXK, 'src', f))) for f in IX_VIEWS]
    core = [(f, read(os.path.join(HERE, f))) for f in core_files()]
    demo = [('src/' + f, read(os.path.join(SRC, f))) for f in frags if f.endswith('.js') and f >= '50']
    parts = ix_core + ix_rest + core + demo
    if '--no-checks' not in sys.argv:
        errs = check(parts)
        if errs:
            print('BUILD RULES FAILED:')
            for e in errs:
                print('  -', e)
            sys.exit(1)

    def join(ps):
        return ''.join('/* ---------- %s ---------- */\n%s%s' % (n, b, '' if b.endswith('\n') else '\n') for n, b in ps)
    script = join(parts)
    core_js = ('/* kits/ancients-interiors/dist/ancients-interiors-core.js: GENERATED by build.py from src/10-49. Do not edit;\n'
               '   edit src/ and rebuild. Engine-neutral: no THREE, no DOM. Load kits/interiors\' core first. See API.md. */\n' + join(core))
    tags = ''.join('<script src="../../catalog/%s"></script>\n' % f for f in CATALOG_LOADED)
    html = read(os.path.join(SRC, '00-head.html')).replace('<!--CATALOG-->', tags) + '<script>\n' + script + read(os.path.join(SRC, '99-tail.html'))
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, 'ancients-interiors.html')
    with open(out, 'w', encoding='utf-8', newline='') as fh:
        fh.write(html)
    with open(os.path.join(DIST, 'ancients-interiors-core.js'), 'w', encoding='utf-8', newline='') as fh:
        fh.write(core_js)
    manifest = {n: hashlib.sha1(b.encode()).hexdigest()[:12] for n, b in parts}
    for f in ('00-head.html', '99-tail.html'):
        manifest['src/' + f] = hashlib.sha1(read(os.path.join(SRC, f)).encode()).hexdigest()[:12]
    manifest['dist/ancients-interiors.html'] = hashlib.sha1(html.encode()).hexdigest()[:12]
    manifest['dist/ancients-interiors-core.js'] = hashlib.sha1(core_js.encode()).hexdigest()[:12]
    with open(os.path.join(HERE, 'build-manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=1, sort_keys=True)
        fh.write('\n')
    syn = node_check('page', script)
    node_check('core', core_js)
    load = ''
    try:
        ixc = os.path.join(IXK, 'dist', 'interiors-core.js')
        r = subprocess.run(['node', '-e', 'global.KratorInteriors=require(process.argv[1]);const AI=require(process.argv[2]);'
                            'AI.install(KratorInteriors);if(!KratorInteriors.PROGRAMS.sickbay||typeof AI.recipe!=="function"||!AI.DRESS.ancient)process.exit(2);',
                            ixc, os.path.join(DIST, 'ancients-interiors-core.js')], capture_output=True, text=True)
        if r.returncode:
            print('core does not load in node:\n' + r.stdout + r.stderr)
            sys.exit(1)
        load = ', core loads in node'
    except FileNotFoundError:
        pass
    print('built %s (%d fragments, %.0f KB) and dist/ancients-interiors-core.js (%.0f KB)  %s%s' % (
        os.path.relpath(out, HERE), len(parts), os.path.getsize(out) / 1024, len(core_js.encode()) / 1024, syn, load))
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        opened = [l.rstrip() for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if opened:
            print('\nOPEN ISSUES (%d) - KNOWN_ISSUES.md:' % len(opened))
            for l in opened:
                print('  ' + l[6:])


if __name__ == '__main__':
    main()
