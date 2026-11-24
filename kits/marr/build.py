#!/usr/bin/env python3
"""The Marr kit and city settlement: Iziz's foremost Ring Sea port and canal-quartered sister city (PLAN.md;
settlements/iziz/VASSAL-KITS.md).

    python3 build.py                 # dist/marr-kit.html (kit showcase) and dist/marr.html (full 3D city settlement)
    python3 build.py --no-checks     # skip the lint and the build rules
    python3 verify.py dist/marr.html --assert --views "Opening — Harbour & Delta Overview,Overview"
"""
import json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)

# core/rand (KRAND) and core/tags (KTAGS) come onto both pages with the Vernacular's (settlements/iziz/build.py, TAGS_FILES),
# and its 91t-iziz-tags.js registers every REG entry, so every building VERN.place puts down (90b-city-build.js), into
# core/tags before the first frame. A page whose manifest lacks one of them stops the build.
CORE_TAKEN = ('rand', 'tags')
TAGS_REGISTER = '91t-iziz-tags.js'


def check_core_taken():
    need = [TAGS_REGISTER]
    for mod in CORE_TAKEN:
        mdir = os.path.join(ROOT, 'core', mod)
        need += sorted(f for f in os.listdir(mdir) if f[0].isdigit() and f.endswith('.js'))
    with open(os.path.join(HERE, 'kit.json'), encoding='utf-8') as fh:
        targets = json.load(fh)['targets']
    for t in sorted(targets):
        mp = os.path.join(HERE, 'build-manifest-%s.json' % t)
        if not os.path.isfile(mp):
            continue
        with open(mp, encoding='utf-8') as fh:
            listed = json.load(fh)
        missing = [f for f in need if f not in listed]
        if missing:
            sys.exit('build.py: %s does not take %s (core/rand, core/tags and the REG registration are required)'
                     % (targets[t], ', '.join(missing)))

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

args = [a for a in sys.argv[1:]]
_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'iziz', 'build.py'), '--kit', HERE] + args,
                         cwd=os.path.join(ROOT, 'settlements', 'iziz'))
RINGSEA_VESSELS = [
    '61-rs-iziz-turtle.js', '65-rs-hyk-galley.js', '66-rs-salvage-tug.js',
    '68-rs-iziz-dhoni.js', '69-rs-islander-oruwa.js', '73-rs-hyk-pearl.js',
    '74-rs-iziz-wheel.js', '76-rs-islander-lakatoi.js', '77-rs-voth-hulk.js',
    '78-rs-hyk-corbita.js', '79-rs-xanadu-carrack.js', '80-rs-iziz-lighter.js',
    '81-rs-voth-junk.js', '82-rs-hyk-galleon.js', '83-rs-voth-ferry.js',
    '85-rs-voth-barge.js', '87-rs-voth-dhow.js'
]

def _marr_sim_and_ringsea_bundle():
    parts = ['/* ==== GENERATED BUNDLE: core/space + core/city/33-city-strategies + core/simulation + core/hamlet + kits/ringsea (via settlements/voth/ringsea.py) ==== */\n(function(){\n']
    strat_fp = os.path.join(ROOT, 'core', 'city', '33-city-strategies.js')
    if os.path.isfile(strat_fp):
        with open(strat_fp, 'r', encoding='utf-8') as f:
            parts.append('/* ---- core/city/33-city-strategies.js ---- */\n' + f.read() + '\n')
    for mod in ('space', 'simulation', 'hamlet'):
        mdir = os.path.join(ROOT, 'core', mod)
        for fn in sorted(f for f in os.listdir(mdir) if f[0].isdigit() and f.endswith('.js')):
            fp = os.path.join(mdir, fn)
            with open(fp, 'r', encoding='utf-8') as f:
                parts.append('/* ---- core/%s/%s ---- */\n' % (mod, fn) + f.read() + '\n')
    parts.append('})();\n')
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'voth'))
    import ringsea
    ringsea.VESSELS = list(RINGSEA_VESSELS)
    rs_js = ringsea.ringsea_fragment().replace('</script', '<\\/script').replace('<script', '<\\x73cript')
    parts.append(rs_js + '\n')
    return ''.join(parts)

if not _rc:
    if not BSRC.LISTING:
        check_core_taken()
    for _fname in ('marr-kit.html', 'marr.html'):
        _dist_html = os.path.join(HERE, 'dist', _fname)
        if os.path.isfile(_dist_html):
            with open(_dist_html, 'r', encoding='utf-8') as _f:
                _h = _f.read()
            if _fname == 'marr.html':
                _sim_marker = '/* ==================== kits/marr/sim/80-marr-sim.js:'
                _bundle_js = _marr_sim_and_ringsea_bundle()
                if _sim_marker in _h:
                    _h = _h.replace(_sim_marker, _bundle_js + _sim_marker, 1)
            _h = _h.replace(
                "      m.onBeforeCompile = new Function('sh', 'r', 'var b = KMAT.bound[' + JSON.stringify(id) + '];\\n' +\n        'if(b.prev) b.prev.call(this, sh, r); KMAT.libHooks(sh, b.lib);');",
                "      var _kmFn = function(sh, r){ var b = KMAT.bound[id]; if(b.prev) b.prev.call(this, sh, r); KMAT.libHooks(sh, b.lib); };\n      _kmFn.toString = function(){ return \"function(sh,r){/*km|\" + id + \"*/}\"; };\n      m.onBeforeCompile = _kmFn;"
            ).replace(
                " mat.onBeforeCompile=new Function('sh','sh.vertexShader=sh.vertexShader.replace(\"#include <uv_vertex>\",'+JSON.stringify(glsl)+');');",
                " const _wuvFn=function(sh){sh.vertexShader=sh.vertexShader.replace(\"#include <uv_vertex>\",glsl);};_wuvFn.toString=()=>\"function(sh){/*wuv|\"+k+\"*/}\";mat.onBeforeCompile=_wuvFn;"
            )
            with open(_dist_html, 'w', encoding='utf-8') as _f:
                _f.write(_h)
            if '--no-checks' not in sys.argv and '--list-sources' not in sys.argv:
                _node = shutil.which('node') or '/usr/local/bin/node'
                if os.path.isfile(_node):
                    if subprocess.call([_node, os.path.join(ROOT, 'tools', 'check_openings.js'), _dist_html]) != 0:
                        sys.exit('build.py: check_openings.js failed on %s (residual dark voids or uncut walls)' % _fname)
    # Mirror city build & sidecar textures into settlements/marr/dist/ if settlements/marr exists
    _settle_dist = os.path.join(ROOT, 'settlements', 'marr', 'dist')
    if os.path.isdir(os.path.join(ROOT, 'settlements', 'marr')) and not BSRC.LISTING:
        os.makedirs(_settle_dist, exist_ok=True)
        for _fn in os.listdir(os.path.join(HERE, 'dist')):
            _src_f = os.path.join(HERE, 'dist', _fn)
            _dst_f = os.path.join(_settle_dist, _fn)
            if os.path.isfile(_src_f):
                shutil.copy2(_src_f, _dst_f)
            elif os.path.isdir(_src_f):
                shutil.copytree(_src_f, _dst_f, dirs_exist_ok=True)
    BSRC.report()
sys.exit(_rc)
