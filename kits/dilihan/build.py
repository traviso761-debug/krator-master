#!/usr/bin/env python3
"""The Dilihan vassal-city kit's own sheet: dist/dilihan.html (README.md; settlements/iziz/VASSAL-KITS.md).

    python3 tools/build.py kits/dilihan   # build dist/dilihan.html, dist/dilihan.tex.dilihan.js & build-inputs.json
    python3 build.py --list-sources       # the repo files the page is made of (tools/dep_graph.py)

The page is the kit sheet on the Iziz Vernacular contract (kits/iziz-vernacular/sheet.py: its shell, the Ancients core read in
place from kits/ancients/src, core/rand, core/tags, core/walk, core/door, core/host, core/atmos/placeholder, core/materials)
with kits/iziz-vernacular read in place (so Row 4 showcases the Mixed Street alternating dil_* and vern_* across poor, middle,
trade, rich and civic), this kit's fragments (dilihan.py FILES: 69r..73d), and targets/sheet/ (88y-dlsheet-matlib.js,
89z-rows.js, 91t-dlsheet-tags.js). Packed PBR brick, terracotta, mortar, wood, stone, canvas and verdigris sets named in
materials.json are read in place from settlements/jimjam/tex/ and kits/iziz-vernacular/tex/ with zero duplicate binary files.
Core modules taken: core/rand, core/tags, core/walk, core/door, core/host, core/atmos (placeholder), core/materials."""
import base64, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                    # noqa: E402
buildlib.through_tools_build(__file__)             # item 25: build-inputs.json is always written
import build_sources as BSRC                       # noqa: E402  (--list-sources: tools/dep_graph.py)
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

sys.path.insert(0, HERE)
import dilihan as kdil                             # noqa: E402
sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
import sheet as ksheet                             # noqa: E402
import vernacular as kvern                         # noqa: E402
CORE_RAND, CORE_TAGS, CORE_WALK = ksheet.CORE_RAND, ksheet.CORE_TAGS, ksheet.CORE_WALK   # tools/check_core_use.py reads these names


def pack_fragment(side):
    """Build 88x-matlib-pack.js for 'dilihan' from materials.json reading committed .webp packs in settlements/jimjam/tex/ and kits/iziz-vernacular/tex/."""
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    with open(os.path.join(HERE, 'materials.json'), encoding='utf-8') as fh:
        spec = json.load(fh).get('families', {})
    src_packs = {}
    out = []
    for fam in sorted(spec):
        src_ref = spec[fam].get('srcTex', '')
        rel_tex, src_fam = src_ref.split(':', 1)
        tex_dir = os.path.join(ROOT, *rel_tex.split('/'))
        if tex_dir not in src_packs:
            with open(os.path.join(tex_dir, 'pack.json'), encoding='utf-8') as pfh:
                src_packs[tex_dir] = json.load(pfh).get('families', {})
        e = src_packs[tex_dir][src_fam]
        rec = {
            'lib': e['lib'],
            'scale': e['scale'],
            'metal': e['metal'],
            'normalScale': e['normalScale'],
            'specular': e.get('specular', 0.5),
            'breakup': e.get('breakup'),
            'tint': e['tint']['keep'],
            'mean': e['tint']['mean'],
        }
        for k, fn in sorted(e['files'].items()):
            with open(os.path.join(tex_dir, fn), 'rb') as wfh:
                raw = wfh.read()
            rec[k] = '' if BSRC.LISTING else ('data:image/webp;base64,' + base64.b64encode(raw).decode())
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(rec, sort_keys=True)))
    side['dilihan'] = '{\n' + ',\n'.join(out) + '\n}'
    return matlib_pack.loader('dilihan')


ksheet.port_lint(HERE)
paths = kdil.full_paths(include_vern_buildings=True)
generative = kvern.BUILDINGS + kdil.BUILDINGS
side = {}
virtual = {ksheet.MATLIB_PACK: pack_fragment(side)}
S = ksheet.compose(HERE, paths, generative=generative, pack=None, virtual=virtual)
S['side'] = side
S['pack'] = 'dilihan'
BSRC.report()   # --list-sources: every file read above, then exit
ksheet.write(S, 'dilihan.html', do_checks='--no-checks' not in sys.argv)
