#!/usr/bin/env python3
"""Dilihan (solqo7hz7s, px 744, py 663, -888.6 m ASL): Premiere Izani Veterans' Settlement of the Cut.

Built from Scale Model 5.1 ground and five urban & hinterland zones (settlements/dilihan/PLAN.md):
  Zone 1  The Old Quarter (Colonia, ~0.25 km2 inside gated Jimjam brick-and-marble circuit wall, jimjam: 1.0):
          KCITY frontage-courts, raised contact-marble forum, re-aimed jj_temple_sun (-31.50 deg S summer solstice
          sunset at +4.00 deg above the +3.61 deg SW Cut rim), veterans' courtyard houses, fortress, barracks,
          library, school, and slope-cut amphitheater on the NW scarp.
  Zone 2  The Governor's Precinct (70 x 56 m walled grounds at -878 m join): dl_gov_palace (govpalace programme in
          Jimjam banded brick, contact-marble podium, gold onion dome w/ Cut signal lantern, 7 chhatri pavilions,
          Iziz orange restricted to banners/gate/reveals, KFURN indexed Iziz catalog furnishing) + IZV guard tower,
          barracks, Veterans' Council & Quiet-Copy assay halls.
  Zone 3  The Vernacular Districts (~1.00 km2 = 4.0x the colonia, iziz-vernacular: 0.9, jimjam: 0.1): KCITY alleys +
          main streets, <= 0.5 m wall-street cornice match via o.scale, bronze/tin foundries, Quiet-Copy workshops,
          eastern muster ground, north Jimjam caravanserai & highway gate, and KCONS + KCITY.constructMesh expansion lots.
  Zone 4  The Lower Town (-922 m at pass-road fork): customs & assay post, walled Hykkousoi League envoys' house with
          cistern court, three-arch stone bridge over the West-Wall contact-marble spring stream, inns, and SE Port Visas
          rock-cut highway tunnel portal.
  Zone 5  The Country (Dellu-Handu): 8 orthogonal handu veteran allotment hamlets (KHAMLET.village, ~4,000 rural +
          12,000 urban = 16,000 metropolitan total), CROPS Cut paddy/melon/emmer/olive plots, NW clay brickyards,
          NE tin (200) / magnetite-skarn iron (255) adits (RES_ORE resSource), N -1,608 m Cut Salt Lake D2 potash/halite
          evaporite works, and biomes/cut warped flora (hyperbamboo, rankgrass, measuremelon, circlelichen).

    python3 tools/build.py settlements/dilihan             # writes dist/dilihan.html, dilihan.tex.js & build-inputs.json
    python3 settlements/dilihan/build.py --bake-model      # bake src/28-dl-model.js from Scale Model 5.1
    python3 settlements/dilihan/build.py --bake-palace     # bake palace/floors/*.png & palace/FURNITURE.md
"""
import io, json, math, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = 'dilihan.html'
MODEL = os.path.join(SRC, '28-dl-model.js')
SITE_JSON = os.path.join(HERE, 'site', 'dilihan-site.json')

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
if '--bake-model' not in sys.argv and '--bake-palace' not in sys.argv:
    buildlib.through_tools_build(__file__)        # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places."""
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


def bake_model():
    """Bake deterministic [G data] Scale Model 5.1 height/wet grid, 360-deg horizon profile, geology, and net51 corridors at (744, 663)."""
    from PIL import Image
    data_dir = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    im = Image.open(os.path.join(data_dir, 'h.png')).convert('RGB')
    W, H = im.size
    px_pin, py_pin = 744, 663

    def h_px(x, y):
        x = max(0, min(W - 1, x))
        y = max(0, min(H - 1, y))
        r, g, b = im.getpixel((x, y))
        return (r * 256 + g) / 65535.0 * 29600.0 - 2600.0, (b > 127)

    datum_raw, _ = h_px(px_pin, py_pin)
    datum = round(datum_raw, 1)   # -888.6 m ASL

    # Regional 31 x 31 pixel window (px 729..759, py 648..678 -> 60 x 60 km at 2,000 m/px), decimetres relative to datum + wet mask
    rx0, ry0, rnx, rny = px_pin - 15, py_pin - 15, 31, 31
    reg_dm, wet_bits = [], []
    for y in range(ry0, ry0 + rny):
        for x in range(rx0, rx0 + rnx):
            hv, wv = h_px(x, y)
            reg_dm.append(int(round((hv - datum) * 10.0)))
            wet_bits.append('1' if wv else '0')

    # 360-degree terrain horizon profile from sanctuary observer eye (-888.6 + 13.7 = -874.9 m ASL) out to 160 km (flat bowl raycast, PLAN.md §2.2)
    obs_asl = datum_raw + 13.7
    hz_alt, hz_dist = [], []
    for az in range(360):
        rad = math.radians(az)
        dx, dy = math.sin(rad), -math.cos(rad)
        best_a, best_d = -90.0, 0.0
        for step in range(4, 321):
            dkm = step * 0.5
            dm = dkm * 1000.0
            fx = px_pin + dx * (dkm / 2.0)
            fy = py_pin + dy * (dkm / 2.0)
            ix, iy = int(math.floor(fx)), int(math.floor(fy))
            u, v = fx - ix, fy - iy
            z00, _ = h_px(ix, iy)
            z10, _ = h_px(ix + 1, iy)
            z01, _ = h_px(ix, iy + 1)
            z11, _ = h_px(ix + 1, iy + 1)
            zh = (z00 * (1.0 - u) + z10 * u) * (1.0 - v) + (z01 * (1.0 - u) + z11 * u) * v
            alt = math.degrees(math.atan2(zh - obs_asl, dm))
            if alt > best_a:
                best_a = alt
                best_d = round(dkm, 1)
        hz_alt.append(round(best_a, 3))
        hz_dist.append(best_d)

    # Geology values on pin (744, 663) and peak within 15 km (PLAN.md §1.5)
    geo_path = os.path.join(ROOT, 'kits', 'resources', 'data', 'geology.json')
    geo_pin, geo_near = {}, {}
    keys = ('stone', 'wood', 'water', 'tin', 'iron', 'skarn', 'potash', 'halite', 'gypsum',
            'marble', 'limestone', 'copper', 'zinc', 'gold', 'silver', 'clay', 'coal', 'sulfur')
    if os.path.isfile(geo_path):
        with io.open(geo_path, encoding='utf-8') as fh:
            gdoc = json.load(fh)
        gw, gh = gdoc['grid']['w'], gdoc['grid']['h']
        gx0, gy0 = px_pin // 2, py_pin // 2
        gi0 = gy0 * gw + gx0
        for k in keys:
            lay = gdoc.get('layers', {}).get(k)
            if isinstance(lay, list) and gi0 < len(lay):
                geo_pin[k] = lay[gi0]
                best = lay[gi0]
                for dy in range(-4, 5):
                    for dx in range(-4, 5):
                        if dx * dx + dy * dy > 16:
                            continue
                        nx, ny = max(0, min(gw - 1, gx0 + dx)), max(0, min(gh - 1, gy0 + dy))
                        val = lay[ny * gw + nx]
                        if val > best:
                            best = val
                geo_near[k] = best
    for k, fb_p, fb_n in (('stone', 255, 255), ('wood', 255, 255), ('water', 255, 255), ('tin', 200, 200),
                          ('iron', 120, 255), ('skarn', 0, 200), ('potash', 0, 214), ('halite', 0, 75),
                          ('gypsum', 0, 196), ('marble', 106, 106), ('limestone', 118, 118),
                          ('copper', 50, 170), ('zinc', 0, 136), ('gold', 110, 110), ('silver', 110, 110),
                          ('clay', 0, 230), ('coal', 0, 50), ('sulfur', 0, 0)):
        geo_pin.setdefault(k, fb_p)
        geo_near.setdefault(k, fb_n)

    # Extract net51.json corridor segments near (744, 663)
    net_path = os.path.join(ROOT, 'openworld', 'network-proposal', 'net51.json')
    corridors = {}
    if os.path.isfile(net_path):
        with io.open(net_path, encoding='utf-8') as fh:
            ndoc = json.load(fh)
        for rt in ndoc.get('routes', []):
            cid = rt.get('id', '')
            if cid in ('izani.north.dilihan', 'izani.dilihan-portvisas'):
                pts_local = [[(p[0] - px_pin) * 2000, (p[1] - py_pin) * 2000] for p in rt.get('px', [])[:8]]
                corridors[cid] = {
                    'name': rt.get('name', cid),
                    'km': rt.get('km', 0),
                    'tunnelKm': rt.get('tunnel_km', 0),
                    'pts': pts_local,
                    'form': rt.get('form', [])[:8]
                }

    rows = ',\n '.join(','.join(str(v) for v in reg_dm[j * rnx:(j + 1) * rnx]) for j in range(rny))
    js = (
        '// ================================================================= DILIHAN — Scale Model 5.1 cut at (744, 663) (GENERATED)\n'
        '// [G data] `python3 settlements/dilihan/build.py --bake-model` writes this from tools/scale-model/model/data/h.png,\n'
        '// kits/resources/data/geology.json, and openworld/network-proposal/net51.json. Pin solqo7hz7s (px 744, py 663),\n'
        '// datum %.1f m ASL (legacy 4.21 px 472, 333 -> lat -31.50 deg S, subGiantLon 56.27 deg), 31x31 regional grid\n'
        '// (60 x 60 km at 2,000 m/px) in decimetres relative to datum, standing-water mask (SE Cut Salt Lake at -1,608 m),\n'
        '// and 360-deg horizon profile from the solstice sanctuary eye (-874.9 m ASL).\n'
        'var DL_MODEL={\n'
        ' id:"solqo7hz7s",name:"Dilihan",jamtokku:"Dellu-Handu",polity:"Dilihan Province",\n'
        ' px:%d,py:%d,legacyPx:[472,333],datum:%.1f,lakeAsl:-1608.0,sillAsl:45.9,\n'
        ' latitude:-31.50,subGiantLon:56.27,pressureAtm:1.788,koppen:"Am",\n'
        ' cutPx0:[732,632],cutOffset:[24000,62000],\n'
        ' rx0:%d,ry0:%d,rnx:%d,rny:%d,cell:2000,\n'
        ' regDm:[\n %s],\n'
        ' wet:"%s",\n'
        ' horizonAlt:[%s],\n'
        ' horizonDistKm:[%s],\n'
        ' geologyPin:%s,\n'
        ' geologyNear15km:%s,\n'
        ' corridors:%s\n'
        '};\n'
        % (datum, px_pin, py_pin, datum, rx0, ry0, rnx, rny,
           rows,
           ''.join(wet_bits),
           ','.join(str(v) for v in hz_alt),
           ','.join(str(v) for v in hz_dist),
           json.dumps(geo_pin, separators=(',', ':'), sort_keys=True),
           json.dumps(geo_near, separators=(',', ':'), sort_keys=True),
           json.dumps(corridors, separators=(',', ':'), sort_keys=True))
    )
    os.makedirs(SRC, exist_ok=True)
    with io.open(MODEL, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('wrote', os.path.relpath(MODEL, ROOT).replace(os.sep, '/'))


def bake_palace():
    """Generate settlements/dilihan/palace/floors/*.png and FURNITURE.md using settlements/voth/palace/blueprint.py."""
    iz_pal = os.path.join(ROOT, 'settlements', 'iziz', 'palace')
    sys.path.insert(0, iz_pal)
    import vassal_blueprint as VB                 # noqa: E402
    import iziz_blueprint as IZ                   # noqa: E402
    import blueprint as B                         # noqa: E402

    VB.CITY['dilihan'] = dict(
        name='Dilihan',
        culture='iziz',
        chancery='Chancery and Quiet-Copy Assay Office',
        assay='Assay and Customs Office (tin, potash & Lipp goods)',
        assay_note='where skarn tin, Cut potash bonds, and seized Republican manufactures from Lipp are weighed, graded, and stamped with the colony seal',
        vault='Customs and Bullion Vault',
        vault_note='assayed tin-bronze ingots, potash bills, and customs silver held under two keys (the sid\'kin\'s and the Veterans\' Council\'s)',
        council='Hall of the Veterans\' Council',
        council_note='the elected elders of the ex-legionnaire houses meet the sid\'kin here at the second threshold; its own door from the forecourt, one door to the vestibule',
        mag_ante='Councillors\' Anteroom',
        hidden='The Scarp Postern',
        hidden_note='a rock-cut vaulted passage under the contact-marble podium exiting onto the 24 m NW scarp stair above the lower-town pass road',
        undercroft_note='red-brick barrel vaults on contact-marble piers under the 1.2 m podium',
        signal_note='the heliograph and signal room in the gold onion dome\'s lantern (y 24 to 27 m), sighting north down the Cut highway toward Jimjam and south toward the Hykkousoi pass gate',
        decor_note='red brick with yellow header courses (bandBrick), contact-marble podium and string courses, patterned brick loggia shafts, gold onion dome, ribbed-slate and terracotta chhatri domes, sunray marble inlay on the Audience Hall floor, and Iziz orange restricted to banners, forecourt gate, and window/arch reveals'
    )

    out_here = os.path.join(HERE, 'palace')
    out_floors = os.path.join(out_here, 'floors')
    os.makedirs(out_floors, exist_ok=True)

    B.KEYMAP.clear()
    B.KEYMAP.update(IZ.keymap())
    cs = lambda n: max(1, round(n))
    progs = IZ.iziz_programs()
    progs.update({
        'council': lambda a, w, d, D: [('iziz_court_table', 1), ('iziz_court_throne', 1), ('iziz_common_chair', cs(a / 6)),
                                       ('iziz_court_banner', 4), ('iziz_court_cabinet', 2), ('iziz_court_screen', 2)],
        'weighing': lambda a, w, d, D: [('iziz_common_counter', 1), ('iziz_common_desk', 2), ('iziz_common_chair', 3),
                                        ('generic_trade_bin', cs(a / 12)), ('iziz_court_strongbox', 2), ('iziz_common_board', 1)],
    })
    B.EXTRA_PROGRAMS.clear()
    B.EXTRA_PROGRAMS.update(progs)
    for k in list(B.NEW):
        B.NEW.pop(k)
    B.NEW.update(IZ.IZIZ_NEW)
    B.CITY.clear()

    K = VB.CITY['dilihan']
    intro = (
        'Generated by `python3 settlements/dilihan/build.py --bake-palace` (on `settlements/voth/palace/blueprint.py` and '
        '`settlements/iziz/palace/vassal_blueprint.py`) from the settled `VASSAL-KITS.md` §3 room data. '
        'Per `PLAN.md` §5.4, the Governor\'s Palace and *colonia* civic interiors furnish from `kits/catalog/iziz` '
        '(`iziz_court_*`, `iziz_common_*`, `generic_*`) in an indexed `KFURN` batch. Finishes: %s.\n' % K['decor_note']
    )
    fl = VB.floors('dilihan')
    for f in fl:
        f['axisnote'] = 'gate at the left (+z in building frame); left/right as seen walking in (v > 0 is left)'
    fm = os.path.join(out_here, 'FURNITURE.md')
    B.main(floors=fl, out=out_floors, here=out_here,
           title='# The Governor\'s Palace of Dilihan: Furniture Manifest\n',
           intro=intro, section=VB.draw_section('dilihan'), zone_R=-1)
    with io.open(fm, encoding='utf-8') as fh:
        lines = fh.read().split('\n')
    with io.open(fm, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(l for l in lines if not (l.startswith('- `') and l.endswith('(x0)'))))
    print('wrote', os.path.relpath(fm, ROOT).replace(os.sep, '/'), 'and floors/{B,G,U,L,section}.png')


if '--bake-model' in sys.argv:
    bake_model()
    sys.exit(0)
if '--bake-palace' in sys.argv:
    bake_palace()
    sys.exit(0)

# Port lint first (tools/check_port.py); also enforces recorded build check
if (not BSRC.LISTING and '--no-checks' not in sys.argv
        and subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0):
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

# Core modules explicitly adopted (PLAN.md §0 Core Adoption Table; tools/check_core_use.py)
CORE_TAKEN = (
    'core/shader', 'core/rand', 'core/mask', 'core/drawn', 'core/space', 'core/city', 'core/hamlet',
    'core/tags', 'core/furnish', 'core/door', 'core/walk', 'core/water', 'core/coast', 'core/terrain',
    'core/atmos', 'core/materials', 'core/biome', 'core/lod', 'core/clock', 'core/minimap', 'core/export', 'core/host'
)

core = lambda *p: os.path.join(ROOT, 'core', *p)
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[:1].isdigit()} if os.path.isdir(SRC) else {}

# 1. Core shader, export, rand, lod, mask, coast, space, drawn, terrain, walk, tags, furnish
PATH['06-core-khook.js'] = core('shader', '06-core-khook.js')
PATH['06b-core-kcolor.js'] = core('shader', '06b-core-kcolor.js')
PATH['07-core-export.js'] = core('export', '07-core-export.js')
PATH['08-core-rand.js'] = core('rand', '08-core-rand.js')
PATH['09-core-export-adapters.js'] = core('export', '09-core-export-adapters.js')
PATH['09b-lod.js'] = core('lod', '09-lod.js')
PATH['97-lod-auto.js'] = core('lod', '97-lod-auto.js')
PATH['10-core-drawn.js'] = core('drawn', '10-core-drawn.js')
PATH['20-core-space.js'] = core('space', '20-core-space.js')
PATH['20-core-walk.js'] = core('walk', '20-core-walk.js')
PATH['25-core-mask.js'] = core('mask', '25-core-mask.js')
PATH['26-core-mask-xform.js'] = core('mask', '26-core-mask-xform.js')
PATH['27-core-mask-distance.js'] = core('mask', '27-core-mask-distance.js')
PATH['27d-core-coast.js'] = core('coast', '30-core-coast.js')
PATH['27e-core-strata.js'] = core('terrain', '35-core-strata.js')
PATH['27f-core-carve.js'] = core('terrain', '36-core-carve.js')
PATH['27g-core-relief.js'] = core('terrain', '38-core-relief.js')
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH[f] = core('tags', f)
for f in sorted(os.listdir(core('furnish'))):
    if f[:1].isdigit() and f.endswith('.js'):
        PATH['69d0-' + f] = core('furnish', f)

# 2. Cut [G data] field (biomes/cut/src/41-cut-field.js), Resources (RES_ORE), Crops (CROPS), and Construction (KCONS)
PATH['22-cut-field.js'] = os.path.join(ROOT, 'biomes', 'cut', 'src', '41-cut-field.js')
PATH['23a-res-ore.js'] = os.path.join(ROOT, 'kits', 'resources', 'src', '42r-res-ore.js')
PATH['23b-res-ore-mined.js'] = os.path.join(ROOT, 'kits', 'resources', 'src', '42s-res-ore-mined.js')
CROPS_JS = ['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '40-crop-query.js']
for idx, cf in enumerate(CROPS_JS):
    PATH['23c%d-%s' % (idx, cf)] = os.path.join(ROOT, 'kits', 'crops', 'src', cf)
PATH['54a-cons-site.js'] = os.path.join(ROOT, 'kits', 'construction', 'src', '10-cons-site.js')
PATH['54b-city-host-construct.js'] = core('city', '54-city-host-construct.js')

# 3. Core city & hamlet (including 21-hamlet-iziz.js) sealed in one clean closure on Object.create(window)
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js',
           '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '37-city-grid.js', '40-city-kcity.js',
           '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js']   # the multi-kit host (Stage 8 D8): inert until called
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', '21-hamlet-iziz.js', '30-hamlet-village.js']


def rd_rel(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def safe_js(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def kcity_bundle():
    body = '\nvar KSPACE = window.KSPACE;\n'
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd_rel('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd_rel('core/hamlet/' + f))
    return safe_js(
        '/* KCITY, KHAMLET: core/city and core/hamlet in one closure (settlements/dilihan/build.py). GENERATED. */\n'
        'var DL_CITY_CORE = (function(window){\n' + body +
        '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE,\n'
        '  Raster: Raster, OCC: OCC, V: V, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist,\n'
        '  resample: resample, clamp: clamp, inPoly: inPoly, ryFacing: ryFacing, cg: function () { return CG; } };\n'
        'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n'
        'var KCITY = DL_CITY_CORE.KCITY, KHAMLET = DL_CITY_CORE.KHAMLET;\n'
    )


# 4. Biome core (item 26: extend buildlib.CORE_BIOME_MIN) + biomes/cut + nwlowlands + nhighlands read in place
CORE_BIOME = list(dict.fromkeys(list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/31-core-dither.js', 'core/biome/31b-core-leafset.js', 'core/biome/31j-core-joint.js',
    'core/biome/32-core-variants.js', 'core/biome/33-core-fungoid.js', 'core/biome/33b-core-bamboo.js',
    'core/biome/34-core-impostor.js', 'core/biome/35-core-anim.js', 'core/biome/35b-core-anim-turn.js',
    'core/biome/41-core-env.js',
]))
NWLOW_JS = [
    'biomes/nwlowlands/src/50-biome-nwlowlands-species.js',
    'biomes/nwlowlands/src/55-biome-nwlowlands-trees.js',
    'biomes/nwlowlands/src/60-biome-nwlowlands-floor.js',
    'biomes/nwlowlands/src/70-biome-nwlowlands.js',
]
NHL_JS = [
    'biomes/nhighlands/src/50-biome-nhighlands-species.js',
    'biomes/nhighlands/src/55-biome-nhighlands-trees.js',
    'biomes/nhighlands/src/60-biome-nhighlands-floor.js',
    'biomes/nhighlands/src/65-biome-nhighlands-dress.js',
    'biomes/nhighlands/src/70-biome-nhighlands.js',
]
CUT_DRAW_JS = [
    'biomes/cut/src/46-biome-cut-warp.js',
    'biomes/cut/src/50-biome-cut-species.js',
    'biomes/cut/src/55-biome-cut-natives.js',
    'biomes/cut/src/57-biome-cut-melon-lichen.js',
    'biomes/cut/src/60-biome-cut-camp.js',
    'biomes/cut/src/70-biome-cut.js',
]


def flora_bundle():
    part = lambda rel: '\n/* ---- %s ---- */\n%s\n' % (rel, rd_rel(rel))
    boot = (
        '\nBIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, waterH: function () { return -1e9; },\n'
        '  mask: function () { return 0; }, obstacles: [],\n'
        '  ticks: function (fn) { FRAME_HOOKS_PRE.push(fn); },\n'
        '  seed: 744663, origin: [[0, -200]], center: [0, -200], fields: {} });\n'
    )
    return safe_js(
        '/* DL_FLORA: core/biome (CORE_BIOME_MIN+) and biomes/cut + nwlowlands + nhighlands in one closure. GENERATED. */\n'
        'var DL_FLORA = (function (window) {\n'
        "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });\n" +
        ''.join(part(f) for f in CORE_BIOME) + boot +
        'var NWLOW = (function () {\n' + ''.join(part(f) for f in NWLOW_JS) + '\nreturn NWLOW;\n})();\n' +
        'var NHL = (function () {\n' + ''.join(part(f) for f in NHL_JS) + '\nreturn NHL;\n})();\n' +
        ''.join(part(f) for f in CUT_DRAW_JS) +
        '\nreturn { BIO: BIO, CUT: CUT, NWLOW: NWLOW, NHL: NHL };\n})(Object.create(window));\n'
    )


# 5. Ancients runtime + shared materials + doors + sockets + placeholder sky math (for 74-jj-sacred.js)
ANC = os.path.join(ROOT, 'kits', 'ancients')
ANC_RUNTIME = ['10-core.js', '12-stats.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js', '36-decor.js',
               '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '69-mat-salvage.js']
SHARED_MAT = ['20-textures.js', '22-materials.js', '68-mat-v5.js']
for f in ANC_RUNTIME + SHARED_MAT:
    p = os.path.join(ANC, 'src', f)
    PATH[f] = p if os.path.isfile(p) else core('materials', f)
PATH['69a-world-uv.js'] = core('materials', 'opt', '69a-world-uv.js')
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js'):
    PATH[f] = core('materials', 'record', f)
for f in ('10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js', '90-core-door-host.js'):
    PATH['69a1-' + f if f != '90-core-door-host.js' else f] = core('door', f)
for f in ('37-sockets.js', '80-cultures.js'):
    PATH[f] = core('sockets', f)
PATH['81-sky.js'] = core('atmos', 'placeholder', '81-sky.js')

# 6. Jimjam kit (settlements/jimjam/src: all 39 JJ.defs + JJFURN), read in place, never copied
JIMJAM_DIR = os.path.join(ROOT, 'settlements', 'jimjam')
JJ_FILES = ['60-jj-mat.js', '61-jj-helpers.js', '62-jj-culture.js', '63-jj-zfix.js',
            '70-jj-housing.js', '71-jj-shops.js', '72-jj-hospitality.js', '73-jj-civic.js',
            '74-jj-sacred.js', '75-jj-palace.js', '76-jj-military.js', '77-jj-agri.js',
            '78-jj-trades.js', '84-jj-furniture.js']
for f in JJ_FILES:
    PATH['65j-' + f if f.startswith('7') else f] = os.path.join(JIMJAM_DIR, 'src', f)

# 7. Iziz Vernacular kit (kits/iziz-vernacular/vernacular.py: all VERN.defs + foundation), read in place
sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
import vernacular as kvern                        # noqa: E402
IV_DIR = os.path.join(ROOT, 'kits', 'iziz-vernacular')
for f in kvern.BUNDLE_BASE + [os.path.basename(p) for p in kvern.building_files()]:
    PATH[f] = kvern.path(f)

# 7b. Dilihan vassal-city kit (kits/dilihan/dilihan.py: all 24 dil_* red/orange brick passive-cooling VERN.defs), read in place
sys.path.insert(0, os.path.join(ROOT, 'kits', 'dilihan'))
import dilihan as kdil                            # noqa: E402
for f in kdil.BASE + kdil.BUILDINGS:
    PATH[f] = kdil.path(f)

# 8. Core water (Cut Salt Lake brine margin, West-Wall spring stream & cisterns) + Core atmos (standard Krator skybox)
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js',
              '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER:
    PATH[f] = core('water', f)

CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js',
              '89-atmos-a-waves.js', '89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    PATH[f] = core('atmos', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js'):
    PATH[f] = core('atmos', 'host', f)
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
    PATH[f] = core('atmos', 'sky', f)

# 9. Core host FULL + KEYS
sys.path.insert(0, core('host'))
import host as khost                              # noqa: E402
CORE_HOST = khost.FULL + khost.KEYS
khost.resolve(PATH, CORE_HOST)

# 10. Catalog furniture (Iziz, Hykkousoi, Republican, Generic) + PBR sidecar texture packs (jimjam, iziz-vernacular, cut)
for d in (('kits', 'catalog'), ('kits', 'interiors'), ('tools', 'textures')):
    sys.path.insert(0, os.path.join(ROOT, *d))
import furniture_bundle, kit_bundle, matlib_pack  # noqa: E402

FURN_CULTURES = ['iziz', 'hykkousoi', 'republican', 'generic', 'generic-goods', 'scrap', 'jobs']
CUT_DIR = os.path.join(ROOT, 'biomes', 'cut')
CUT_PACK_JSON = os.path.join(CUT_DIR, 'tex', 'pack.json')
CUT_EXCLUDE = [k for k in (json.load(io.open(CUT_PACK_JSON, encoding='utf-8')).get('families', {}) if os.path.isfile(CUT_PACK_JSON) else {})
               if k.startswith('ground')]

SIDE = {}
BUNDLES = {
    '24-dl-kcity-bundle.js': kcity_bundle,
    '69d1-furniture-bundle.js': lambda: furniture_bundle.bundle(FURN_CULTURES, tex=True) + kit_bundle.bundle(['iziz']),
    '86z-dl-flora-bundle.js': flora_bundle,
}
VIRTUAL = {
    '46a-matlib-pack-jimjam.js': matlib_pack.fragment(JIMJAM_DIR, 'jimjam', side=SIDE),
    '46b-matlib-pack-vern.js': matlib_pack.fragment(IV_DIR, 'iziz-vernacular', side=SIDE),
    '46c-matlib-pack-cut.js': matlib_pack.fragment(CUT_DIR, 'cut', exclude=CUT_EXCLUDE, side=SIDE),
    '69b5-vern-matlib-bind.js': (
        '/* Bind kits/iziz-vernacular PBR library pack onto MAT after 69b-vern-mat.js */\n'
        'if (typeof KMAT !== "undefined" && KMAT.bindMat) KMAT.bindMat("iziz-vernacular", MAT, { tile: KMAT.ANCIENT_TILES });\n'
    ),
    '69r5-dil-matlib-bind.js': (
        '/* Bind kits/dilihan MAT.dl* kiln-brick, terracotta & mortar materials onto the already-loaded jimjam pack */\n'
        'if (typeof KMAT !== "undefined" && KMAT.bindMat) KMAT.bindMat("jimjam", MAT, { alias: %s });\n'
        % json.dumps(kdil.JIMJAM_MAT_ALIAS, sort_keys=True)
    ),
    '74zz-izv-seal.js': (
        '/* Expose IZV handle after VERN (69c) and IZDOOR (69e5) are initialized */\n'
        'var IZV = { VERN: VERN, kbake: kbake, KIT: KIT, REG: REG, MAT: MAT, TEX: TEX, reseed: reseed, rng: rng,\n'
        '  IZDOOR: typeof IZDOOR !== "undefined" ? IZDOOR : null };\n'
    ),
    khost.EDITS_JS: khost.edits_js(HERE, 'dilihan'),
}

BSRC.note(*(
    ['core/city/' + f for f in CITY_JS] +
    ['core/hamlet/' + f for f in HAMLET_JS] +
    CORE_BIOME + NWLOW_JS + NHL_JS + CUT_DRAW_JS +
    ([os.path.relpath(SITE_JSON, ROOT).replace(os.sep, '/')] if os.path.isfile(SITE_JSON) else [])
))
if not BSRC.LISTING:
    VIRTUAL.update({f: fn() for f, fn in BUNDLES.items()})
else:
    VIRTUAL.update({f: '' for f in BUNDLES})
for f in VIRTUAL:
    PATH[f] = None

missing = [f for f in PATH if PATH[f] is not None and not os.path.isfile(PATH[f])]
if missing:
    sys.exit('missing fragments: ' + ', '.join('%s (%s)' % (f, PATH[f]) for f in missing))

frags = sorted(PATH)
bodies = {}
for f in frags:
    if PATH[f] is None:
        bodies[f] = VIRTUAL[f]
    else:
        with io.open(PATH[f], encoding='utf-8') as fh:
            bodies[f] = fh.read()

BSRC.report([PATH[f] for f in frags if PATH[f] is not None])   # --list-sources stops here before any write

# Top-level declaration clash check across non-closure fragments
DECL = re.compile(r'^(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?:=|;))', re.M)
seen, clash = {}, []
for f in frags:
    if not f.endswith('.js') or f in BUNDLES or f in VIRTUAL:
        continue
    s = bodies[f]
    code = re.sub(r'^\s*(//[^\n]*\n|/\*.*?\*/\s*)*', '', s, flags=re.S)
    if re.match(r'[;(]*\s*\(?\s*(function|\(\)\s*=>)', code):
        continue
    for m in DECL.finditer(s):
        n = m.group(1) or m.group(2)
        line_end = s.find('\n', m.start())
        stmt = s[m.start():line_end if line_end > 0 else len(s)]
        if re.match(r'^var\s+' + re.escape(n) + r'\s*=\s*(?:globalThis\.)?' + re.escape(n) + r'\s*\|\|', stmt):
            continue
        if n in seen and seen[n] != f:
            clash.append('%s (%s, %s)' % (n, seen[n], f))
        seen.setdefault(n, f)
if clash:
    sys.exit('top-level names declared twice: ' + '; '.join(clash))

out = []
for f in frags:
    if f.endswith('.js'):
        rel_label = f if PATH[f] is None else os.path.relpath(PATH[f], ROOT).replace(os.sep, '/')
        out.append('\n// ==================== %s\n' % rel_label)
    out.append(bodies[f])

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
html = matlib_pack.write_sidecar(SIDE, html, DIST, 'dilihan.tex.js')
with io.open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with io.open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
try:
    os.remove(chk)
except OSError:
    pass
print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else
    'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
sys.exit(r.returncode if r else 0)
