#!/usr/bin/env python3
"""Xanadu's works: the two mines' camps on a sheet (settlements/xanadu/WORKS-PLAN.md, step W3; BUILD-PLAN.md step A7).

Kōlḍ-Lōḍ, the Cold Lode (smgxtultfq: the adit camp of 500 and the mill camp of 450) and Opal Valley Mines (sjuarjbku0: the
diggings of 500, a fifth of their houses the Glaziers', and the factor's landing of 350), each a camp on core/hamlet's Xanadu
row in its camp form (KHAMLET.xanaduRow({camp: true, mineHead: true, shrine: true}), core/hamlet/camp's census: one tune
record shared by two camps), their records read from XAN_TUNE (core/region/data/xan-tune.js, read in place at every build).
The six province regions wait for the vertical stack (the owner, 2026-11-22), so the camps stand on a flat sheet now and go
on their ground with W4.

The sheet is a target on Xanadu's page, as Kirstabal's town is (settlements/kirstabal): settlements/xanadu/build.py --kit
takes this folder's kit.json and targets/. Sealed in one closure (gen/69w-works-core.js, generated here at every build, never
edited by hand): core/space, core/city's strategies (KCITY.prim), core/hamlet with the Xanadu row and the camp census, and the
Sultanate's tune, because Xanadu's page keeps core/space out of its global scope; it exports KHAMLET and XAN_TUNE. The
Glaziers' houses come from the Tungang kit sealed as TG (gen/69w2-tungang-bundle.js: kits/tungang/tungang_bundle.py, the
Glaziers' maps beside the page). The Xanadu kit's opt-in works (kits/xanadu/extra 88d, 88g, 88h) come through kit.json.

    python3 build.py                     # dist/xanadu-works.html (through tools/build.py: build-inputs.json is written)
    KRATOR_GL=gpu python3 verify.py dist/xanadu-works.html --assert --views "Overview,The adit camp"
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/hamlet', 'core/region', 'core/terrain',
              'core/drawn')   # through Xanadu's build, kit.json and gen/

SPACE = 'core/space/20-core-space.js'
CITY_JS = ['33-city-strategies.js']   # KCITY.prim (frontageRun, huntNear): what core/hamlet reads, as its node tests load it
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', '30-hamlet-village.js', 'xanadu/23-hamlet-xanadu-row.js', 'camp/26-hamlet-camp.js']
TUNE = 'core/region/data/xan-tune.js'
GEN = os.path.join(HERE, 'gen')
DIST = os.path.join(HERE, 'dist')
SIDE = {}   # the Tungang kit's library pack, written beside the page after Xanadu's build (xanadu-works.tex.tungang.js)


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def works_core():
    """core/space, core/city's strategies, core/hamlet (with the Xanadu row and the camp census) and the tune in one closure:
    the closure hands them a window of their own (Object.create(window)), so KSPACE and KCITY stay inside"""
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    body += 'var KCITY = window.KCITY = {};\n'
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    body += '\n/* ---- %s ---- */\n%s\n' % (TUNE, rd(TUNE))
    return ('/* KHAMLET, XAN_TUNE: core/space, core/city\'s strategies, core/hamlet and the Sultanate\'s tune in one closure '
            '(settlements/xanadu-works/build.py). GENERATED: edit core/space, core/city, core/hamlet, core/region. */\n'
            'var XW_CORE = (function(window){\n' + body +
            '\nreturn { KHAMLET: KHAMLET, XAN_TUNE: XAN_TUNE };\n})(Object.create(window));\n'
            'var KHAMLET = XW_CORE.KHAMLET, XAN_TUNE = XW_CORE.XAN_TUNE;\n')


def tungang_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang'))
    import tungang_bundle as tb
    js, files = tb.bundle(tex='glazier', with_files=True, side=SIDE)   # the maps beside the page (the 16 MB cap)
    BSRC.note(*files)
    return js


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69w-works-core.js', works_core), ('69w2-tungang-bundle.js', tungang_bundle)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS] + [TUNE] +
            ['kits/tungang/tungang_bundle.py']))
if not BSRC.LISTING:
    write_gen()
else:
    tungang_bundle()   # its files, for --list-sources

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
    # the Tungang kit's maps beside the page (tools/textures/matlib_pack.py): the closure registers KMAT_SIDE.tungang
    if SIDE and not BSRC.LISTING:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures')); import matlib_pack
        _page = os.path.join(DIST, 'xanadu-works.html')
        with io.open(_page, encoding='utf-8') as fh:
            _html = fh.read()
        if 'xanadu-works.tex.tungang.js' not in _html:
            _html = matlib_pack.write_sidecar(SIDE, _html, DIST, 'xanadu-works.tex.js', prune=True)
            with io.open(_page, 'w', encoding='utf-8', newline='') as fh:
                fh.write(_html)
sys.exit(_rc)
