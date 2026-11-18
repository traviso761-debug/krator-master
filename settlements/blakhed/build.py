#!/usr/bin/env python3
"""Blakhed, the Fellgangs' market and meeting town at the head of the Blak Riba (PLAN.md; steps B1-B4's first pass).

The town is a target on Xanadu's page, as Thalaba, Kirstabal and Laitwal are (PLAN.md section 0, question 14): Xanadu's page is
the host (core/host's camera, panel, inspector and probe; core/rand, core/tags, core/door, core/lod; the verify harness), and no
Xanadu kit building is drawn. settlements/xanadu/build.py --kit takes this folder's kit.json, src/ and targets/. Generated here at
every build, never edited by hand:
  gen/69bk-kcity-bundle.js    core/space, core/city, core/hamlet and core/hamlet's opt-in Fellgang row in one closure (Kirstabal's
                              kcity_bundle with the row): KCITY (with KCITY.lib), KHAMLET
  gen/69bk2-tg-bundle.js      the Tungang kit sealed as TG (kits/tungang/tungang_bundle.py): the Fellgang set, every building and
                              road piece; its library maps beside the page (dist/blakhed.tex.tungang.js)
  gen/69bk3-bk-model.js       the scale model 5.1's ground round the pin (px 441,1400), bicubic on h.png, as core/world reads the
                              same cells: the town (6 km at 40 m), the Stairhead at the falls' lip (6 x 8 km at 40 m), the river's
                              country between them (30 x 28 km at 100 m), the far field (120 km at 500 m); and the Blak Riba's line
  gen/69bk4-bk-flora-bundle.js  core/biome and biomes/riftrim (the veiled rim) in one closure, as Kirstabal seals the Rift kit
  gen/69bk5-dalab-pack.js     Dalab's pack trimmed to the toll post's families (Thalaba's dalab_pack), its maps beside the page too
The Dalab set's fragments for the toll post are read in place (kit.json "external"). The page takes core/rand, core/tags,
core/host, core/door and core/lod through Xanadu's build; core/city, core/space, core/hamlet and the Tungang kit through gen/;
core/atmos, core/water and core/drawn through kit.json "files"; core/biome through gen/.

    python3 ../../tools/build.py settlements/blakhed       # dist/blakhed.html (a plain python3 build.py comes through it)
    KRATOR_GL=gpu python3 verify.py dist/blakhed.html --assert --views "Overview,The Market"
    node test-bk-town.js                                    # the town, the ring and the hamlets without a browser
"""
import base64, io, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/hamlet', 'core/camp', 'core/clock', 'core/simulation',
              'core/atmos', 'core/water', 'core/drawn', 'core/biome', 'core/materials', 'core/door', 'core/furnish', 'core/walk', 'core/lod')   # through Xanadu's build, kit.json and gen/

CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js']
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', 'fellgang/22-hamlet-fellgang.js', '30-hamlet-village.js']
CAMP_JS = ['10-camp-cultures.js', '20-camp-census.js', '30-camp-pitch.js', 'fellgang/52-camp-fellgang.js']
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
DIST = os.path.join(HERE, 'dist')
H_PNG = 'tools/scale-model/model/data/h.png'
RIVERS = 'tools/scale-model/model/data/rivers.json'
PIN = (441.0, 1400.0)                   # Blakhed's pin on the 5.1 canvas (the owner, 2026-11-11: the Blak Riba head)
M_PER_PX = 2000.0
GRIDS = {   # x0, x1, z0, z1, step (m), unit, base: x east, z south, metres from the pin
    'town': (-3000.0, 3000.0, -3000.0, 3000.0, 40.0, 0.1, 3000.0),
    'stair': (14000.0, 20000.0, -20000.0, -12000.0, 40.0, 0.1, 2400.0),
    'country': (-14000.0, 22000.0, -22000.0, 6000.0, 100.0, 0.1, 2400.0),
    'far': (-60000.0, 60000.0, -60000.0, 60000.0, 500.0, 1.0, 0.0)}
SIDE = {}   # the Tungang kit's maps, written beside the page after Xanadu's build (blakhed.tex.tungang.js)


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    """core/space, core/city, core/hamlet (with the Fellgang row) and core/camp in one closure (settlements/kirstabal/build.py's):
    the closure hands them a window of their own, so KSPACE stays inside; KCITY.lib names what the town's site steps use."""
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    for f in CAMP_JS:
        body += '\n/* ---- core/camp/%s ---- */\n%s\n' % (f, rd('core/camp/' + f))
    return ('/* KCITY, KHAMLET, KCAMP: core/space, core/city, core/hamlet and core/camp in one closure (settlements/blakhed/build.py). '
            'GENERATED: edit core/city, core/hamlet, core/camp. */\n'
            'var BK_CORE = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC };\n'
            'return { KCITY: KCITY, KHAMLET: KHAMLET, KCAMP: KCAMP };\n})(Object.create(window));\n'
            'var KCITY = BK_CORE.KCITY, KHAMLET = BK_CORE.KHAMLET, KCAMP = BK_CORE.KCAMP;\n')


def tg_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang'))
    import tungang_bundle as tb
    js, files = tb.bundle(tex=True, furniture=True, with_files=True, side=SIDE)   # the maps beside the page (the 16 MB cap); catalog sealed in
    BSRC.note(*files)
    return js


def model_fragment():
    """The scale model's ground round the pin, bicubic on h.png ((R*256+G)/65535*29600-2600 m), as Thalaba's ground_fragment;
    and the Blak Riba's vertices (rivers.json r116) in the page's frame with the model's bed heights."""
    import numpy as np
    from PIL import Image
    from scipy import ndimage as nd
    im = np.array(Image.open(os.path.join(ROOT, *H_PNG.split('/'))).convert('RGB')).astype(np.float64)
    H = (im[..., 0] * 256 + im[..., 1]) / 65535 * 29600 - 2600

    def grid(box):
        x0, x1, z0, z1, step, unit, base = box
        nx, nz = int(round((x1 - x0) / step)) + 1, int(round((z1 - z0) / step)) + 1
        zz, xx = np.meshgrid(z0 + step * np.arange(nz), x0 + step * np.arange(nx), indexing='ij')
        rows, cols = PIN[1] + zz / M_PER_PX, PIN[0] + xx / M_PER_PX
        h = nd.map_coordinates(H, [rows.ravel(), cols.ravel()], order=3, mode='nearest').reshape(nz, nx)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        return ('{x0:%g,z0:%g,x1:%g,z1:%g,step:%g,nx:%d,nz:%d,unit:%g,base:%g,min:%.1f,max:%.1f,b64:"%s"}'
                % (x0, z0, x1, z1, step, nx, nz, unit, base, float(h.min()), float(h.max()), base64.b64encode(q.tobytes()).decode('ascii')))

    with io.open(os.path.join(ROOT, *RIVERS.split('/')), encoding='utf-8') as fh:
        rivers = {r['id']: r for r in json.load(fh)}
    r = rivers['r116']
    pts = ','.join('[%.2f,%.2f,%d,%d,%.1f]' % (x, y, round((x - PIN[0]) * M_PER_PX), round((y - PIN[1]) * M_PER_PX), b)
                   for (x, y), b in zip(r['px'], r['bed_m']))
    q = ','.join('%.1f' % v for v in r['q_m3s'])
    pin_cell = float(H[int(PIN[1]), int(PIN[0])])
    return ('/* BK_MODEL: Blakhed\'s ground from the scale model 5.1 (%s), bicubic round the pin px %g,%g (settlements/blakhed/build.py).\n'
            '   GENERATED: edit the model. x east, z south, metres from the pin; a grid row is one z. The Blak Riba (%s r116): each\n'
            '   vertex [px, py, x, z, bed m]. [G data] */\n'
            'var BK_MODEL={pin:[%g,%g],cell:%.1f,\n%s,\n river:{id:"r116",name:"Blak Riba",w:%d,depth:%g,q:[%s],pts:[%s]}};\n'
            % (H_PNG, PIN[0], PIN[1], RIVERS, PIN[0], PIN[1], pin_cell,
               ',\n'.join(' %s:%s' % (k, grid(v)) for k, v in GRIDS.items()), r.get('width_m') or 29, r.get('depth_m') or 1.5, q, pts))


# the flora: today's core/biome and the Rift Rim kit (biomes/riftrim, read in place; its veiled rim, the W rift highland) in one
# closure, as Kirstabal seals the Rift kit: Xanadu's page runs its own older vendored biome core. targets/town/90d-bk-flora.js
# binds the host (the ground, the mask from the plan's records, the fields) and builds
FLORA_CORE = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31-core-dither.js',
              '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js', '33b-core-bamboo.js',
              '34-core-impostor.js', '35-core-anim.js', '35b-core-anim-turn.js', '40-core-place.js']
RRIM_JS = ['50-biome-riftrim-species.js', '55-biome-riftrim-trees.js', '60-biome-riftrim-floor.js', '70-biome-riftrim.js']


def flora_bundle():
    part = lambda rel: '/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = ('/* the bootstrap: THREE before the kit loads; the town binds its scene, ground and fields later (90d-bk-flora.js) */\n'
            'BIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
            '  ticks: function (fn) { var last = null; (window._frameHooks = window._frameHooks || []).push(function (now) { var t = now / 1000, '
            'dt = last == null ? 0.016 : Math.min(0.1, t - last); last = t; fn(dt, t); }); },\n'
            '  seed: 44140, origin: [[0, 0]], center: [0, 0], fields: {} });\n')
    return ('/* BK_FLORA: core/biome and the Rift Rim kit in one closure (settlements/blakhed/build.py). GENERATED: edit core/biome and biomes/riftrim. */\n'
            'var BK_FLORA = (function (window) {\n' +
            "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });   /* the closure's own BIO, on its own window */\n" +
            part(SPACE) + 'var KSPACE = window.KSPACE;   /* the Rift Rim kit trees space themselves on core/space */\n' +
            ''.join(part('core/biome/' + f) for f in FLORA_CORE) + boot +
            'var RRIM = (function () {\n' + ''.join(part('biomes/riftrim/src/' + f) for f in RRIM_JS) + '\nreturn RRIM;\n})();\n' +
            'return { BIO: BIO, reseed: reseed, RRIM: RRIM };\n})(Object.create(window));\n')


# Dalab's mission near the Market and its toll post at the Stairhead (the Dalab set's fragments, read in place: kit.json "external")
# draw in Xanadu's shared keys and in Dalab's own: pack the mission's and toll post's Dalab families
DALAB_FAMILIES = ('dRammed', 'dBancoE', 'dBlock', 'dRelief', 'dReliefCh', 'dReliefRd', 'dReliefTq', 'dRender', 'dRenderR',
                  'dChecker', 'dDecoPanel', 'dDecoPanelB', 'dBanner', 'dMural', 'dMural1', 'dMural2', 'dMural3',
                  'dMural4', 'dMural5', 'dMural6', 'dMural7')


def dalab_pack():
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    d = os.path.join(ROOT, 'settlements', 'dalab')
    with io.open(os.path.join(d, 'tex', 'pack.json'), encoding='utf-8') as fh:
        fams = json.load(fh)['families']
    return ('/* the Dalab pack, trimmed to the toll post\'s own families (settlements/blakhed/build.py DALAB_FAMILIES). GENERATED. */\n'
            + matlib_pack.fragment(d, 'dalab', exclude=tuple(k for k in fams if k not in DALAB_FAMILIES), side=SIDE))   # beside the page, with the kit's


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69bk-kcity-bundle.js', kcity_bundle), ('69bk2-tg-bundle.js', tg_bundle), ('69bk3-bk-model.js', model_fragment),
                       ('69bk4-bk-flora-bundle.js', flora_bundle), ('69bk5-dalab-pack.js', dalab_pack)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE, H_PNG, RIVERS, 'kits/tungang/tungang_bundle.py', 'settlements/dalab/tex/pack.json'] +
            ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS] + ['core/camp/' + f for f in CAMP_JS] +
            ['core/biome/' + f for f in FLORA_CORE] + ['biomes/riftrim/src/' + f for f in RRIM_JS]))
if not BSRC.LISTING:
    write_gen()

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
    # the Tungang kit's maps beside the page (tools/textures/matlib_pack.py): the closure registers KMAT_SIDE.tungang (Laitwal's)
    if SIDE and not BSRC.LISTING:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack
        _page = os.path.join(DIST, 'blakhed.html')
        with io.open(_page, encoding='utf-8') as fh:
            _html = fh.read()
        if 'blakhed.tex.tungang.js' not in _html:
            _html = matlib_pack.write_sidecar(SIDE, _html, DIST, 'blakhed.tex.js', prune=True)
            with io.open(_page, 'w', encoding='utf-8', newline='') as fh:
                fh.write(_html)
sys.exit(_rc)
