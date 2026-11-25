#!/usr/bin/env python3
"""The Order of the Flashing Eye's head house on the east volcano (PLAN.md; the owner, 2026-11-16: "spin off session to build
flashing eye monastery"). python3 tools/build.py settlements/flashing-eye (a plain python3 build.py comes through it by itself).

The page is built on Xanadu's page, as the Azure Dream's (settlements/azure-dream/build.py) and Qiblai's city are:
settlements/xanadu/build.py --kit takes this folder's kit.json, src/ (the layout, its rules and the watch as [G data]; the
Order's own buildings, qb_fe_*, on the Qiblai kit's helpers: seeds 34400-34599, proposed) and targets/, with the Qiblai kit's
fragments read in place (kit.json "externalDirs"). Its pack is this folder's materials.json (the Qiblai kit's families and the
cone's: columnar basalt, ash, scoria, cinder), packed by tools/textures/pack.py into tex/ and bound as 'qiblai'.

The ground is the scale model's, at 1:1: region/data is the cut round the cone (tools/scale-model/extract_region.py; region/
source holds its inputs), decoded here into gen/39fe-world-data.js by Pinnacle Rock's tools/world_data.py (read in place) and
drawn by the open world's fields (core/world/41-world-fields.js, read in place) on core/terrain's KRELIEF.
The bench, the band and the crater are FLASHING_EYE.ground (src/31-fe-rules.js) over it; the talus is core/terrain's KRUBBLE.
core/atmos draws the sky and the plume (fx/ashplume), core/sched and core/rand run the vent and the watch, core/drawn records
the drawn ground for the audits (kit.json "files").

    python3 tools/build.py settlements/flashing-eye          # dist/flashing-eye.html
    KRATOR_GL=gpu python3 verify.py dist/flashing-eye.html --assert --views "Overview,The band from the apron"
    node test-flashing-eye.js; node test-watch.js            # the layout, the ground and the watch, without a browser
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
# through Xanadu's build (rand, tags, host, door, walk, lod), kit.json "files" (atmos, sched, drawn) and "external" (terrain, charactermodels)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/terrain', 'core/walk', 'core/sched', 'core/drawn', 'core/biome', 'core/charactermodels')
GEN = os.path.join(HERE, 'gen')
REGION = os.path.join(HERE, 'region')
# the kits the world's fields know here: the Vale of Xanadu (the page's own vendored biome, XANADU)
WORLD_KITS = "var WORLD_KITS=[{name:'xanadu',global:'XANADU',overlay:'xanadu'}];\n"


# the people (targets/cone/90fm-fe-people.js): core/charactermodels read in place (kit.json "external": KCHAR, KCharFigure,
# KCharCrowd), its GLTF loader under a numbered name here (gen/47j), its data cut to the two peoples the house draws (the Order's
# robes from the Historians', dyed crimson; Xanadu's dress for the lay brothers and the pilgrims: gen/47n, FE_KCHAR) and the pieces
# as sidecars beside the page (dist/kchar, from core/charactermodels' own pieces when built here, else Longsong's: the same files)
CM = os.path.join(ROOT, 'core', 'charactermodels')
sys.path.insert(0, os.path.join(CM, 'tools'))
import kchar_page                                 # noqa: E402
KCHAR_PEOPLES = ('historians', 'xanadu')
KCHAR_ITEMS = [p % s for s in ('m', 'f') for p in ('order_%s_monk_robe', 'order_%s_sandals',   # the novices wear the robe (ochre): the novice's skirt flares when they sit
               'order_%s_elder_robe', 'order_%s_elder_hat', 'xan_%s_town_tunic', 'xan_%s_town_trousers', 'xan_%s_town_boots', 'xan_%s_town_cap',
               'xan_%s_rich_jama', 'xan_%s_rich_trousers', 'xan_%s_rich_slippers', 'xan_%s_rich_turban')]
KCHAR_ITEMS.remove('xan_f_town_cap')   # no piece of it built yet (Longsong's sidecars have none): the women go bareheaded
KCHAR_BEARDS = {'mpfb_male': ['grinsegold_full_beard', 'wdg_scruffy_beard', 'grinsegold_moustache', 'Goatee'], 'mpfb_female': []}
KCHAR_ALSO = [os.path.join(ROOT, 'settlements', 'longsong', 'dist', 'kchar')]


def write(out, new):
    old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
    if old != new:
        with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(new)


def write_gen():
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools'))
    import world_data
    os.makedirs(GEN, exist_ok=True)
    write(os.path.join(GEN, '39fe-world-data.js'), world_data.fragment(REGION, kits=WORLD_KITS, name='39fe-world-data.js'))
    with io.open(os.path.join(CM, 'tools', 'vendor', 'GLTFLoader.r128.js'), encoding='utf-8') as fh:
        write(os.path.join(GEN, '47j-fe-kchar-gltf.js'), '/* GENERATED by build.py: core/charactermodels/tools/vendor/GLTFLoader.r128.js, as read. Do not edit. */\n' + fh.read())
    write(os.path.join(GEN, '47n-fe-kchar-data.js'), '/* GENERATED by build.py (core/charactermodels/tools/kchar_page.py): the peoples, the bodies\' kits cut to the house\'s dress. Do not edit. */\n' +
          kchar_page.fragment('FE_KCHAR', KCHAR_PEOPLES, items=KCHAR_ITEMS, beards=KCHAR_BEARDS, out=os.path.join(HERE, 'dist', 'kchar'), also=KCHAR_ALSO))


BSRC.note(*[os.path.join(REGION, 'data', f) for f in sorted(os.listdir(os.path.join(REGION, 'data')))])
BSRC.note(os.path.join(ROOT, 'settlements', 'pinnacle-rock', 'tools', 'world_data.py'))
BSRC.note(os.path.join(CM, 'tools', 'vendor', 'GLTFLoader.r128.js'), os.path.join(CM, 'tools', 'kchar_page.py'),
          *kchar_page.sources(KCHAR_PEOPLES, items=KCHAR_ITEMS, beards=KCHAR_BEARDS, also=KCHAR_ALSO))
if not BSRC.LISTING:
    write_gen()

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
sys.exit(_rc)
