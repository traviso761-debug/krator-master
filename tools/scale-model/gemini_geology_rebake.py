#!/usr/bin/env python3
"""Rebake Krator 5.1's geology (`krator-geology` v1) on branch `gemini-trade` without touching base files.

    python tools/scale-model/gemini_geology_rebake.py \
        <model_data_dir> <51-region-store.js> <60-settlements.js> \
        kits/resources/data/geology-gemini.json \
        [--old-geology kits/resources/data/geology.json] \
        [--map-out openworld/geology-provinces-gemini.jpg] \
        [--report-out <path.json>]

Upgrades `geology.py` across all four Krator planetary-physics pillars while preserving exact
`krator-geology` v1 binary/RLE/node-lattice compatibility (`WORLD = 20261026`, `ANCHOR = [544000, 660000]`):
  1. Prehistoric ~3,000 km Multi-Ring Impact Basin:
     - Fixes the `~airless` exclusion bug that left 1,762,544 km^2 of >8 km crater walls as 100% gneiss / 0% impact.
     - Completes 360-degree Peak Ring (Inner Wall: `e highlands`, `sw highlands` scarp/crest, `the cut`) and Main Rim
       (Outer Wall: `SE outer wall`, `stalker range`, upper `e badlands`, `N/S Outlands`, `tharn uplands`, plus unmarked
       >5.2-8+ km wall crests/cols).
     - Widens the Inner Crater's Sudbury-style differentiated melt-sheet footwall collar (`MELT_KM = 24 km`) and adds a
       radial exterior ballistic ejecta apron (`impactite` decay halo outside the Outer Wall, eroded open in deep karst
       and river windows such as `spider lake`, `neo-ozarks`, and `ria valley`).
  2. Stagnant-Lid / Heat-Pipe Crust (Zero Plate Tectonics):
     - Purges arc/subduction and seafloor-spreading rules; blocks spurious relief-triggered S-type tin-granite hash
       blocks (`tin = 200`) inside the Inner Crater melt floor (`crater drylands`, `savannah rims`, `SW Bay`), Ring Sea
       volcanic islands (`isle demo`, `East/West Ring Isles`), and steep sedimentary/rift escarpments (`sedesert`,
       `the bowl`, `ne rim`, `e abysss`/`e abyss`, `great chasm`).
     - Splits `the arch` into serpentinite detachment core-complexes (`ultramafic`, with lateritic `iron`, VMS `copper`,
       and placer `gold`) + volcanic horst/axial segments (`basalt`/`rift`), while preserving `steaming seamounts` as
       active `volcanic` edifices (`oil = 0` on `volcanic` & `ultramafic`).
  3. Laplace-Resonance Tidal Volcanism, Coronae, Paterae, Flood Basalts & Rifts:
     - Bakes new/reshaped 5.1 regions: `Firebliss Range` & `Firebliss Patera` (`volcanic` stratocones + `basalt` lava
       lake + 5 obsidian pancake domes), `Korona / NE` (5 obsidian pancake domes + deep ring-fault `volcanic` trenches +
       contact `marble`/`skarn` + ghost `sulfur=60` bug fix + `painted highlands` moat clip), `Labyrinth` (plume-lifted
       `basalt` cap + `impact`/`crystalline` chaos walls + `sedimentary`/`rift` graben floors), `The Slabfields`
       (tilted flood-basalt blocks + fault-foot paterae), `Greenstep` & `godstep valley` (ponded Ti-basalt mare steps +
       Step-4 playa `evaporite`), `The Twins` & `White Gills` (`volcanic`/`basalt` cones + fault-exhumed `ultramafic`
       serpentinization window), `opal valley` (`rift` + bimodal `volcanic`/`basalt` contacts + `tuff`), `High Rift` &
       `great chasm` (`rift` troughs + `basalt` walls), `Rift Rim N/S` (restored from 100% volcanic to basement/fault
       shoulders with vent-only haloes), `ne outer wall` & `Oidong Valley` (contact `marble` & `skarn`), `e abysss` &
       `e abyss` (`rift` + 19-lake arid-sill `evaporite` + perched freshwater-mire `coal`), and `zinc` (`sphalerite`).
  4. Lower Gravity (0.75 g) & Extreme Pressure Gradient (-2,600 m / 2.21 atm to >8,000 m Class O):
     - Properly models distal ash aprons (`tuff`), upland blanket-bog peat/bog-iron, closed-sump hyperbaric brines,
       and hypobaric/stratospheric Class O wall crests.
"""
import base64
import glob
import hashlib
import io
import json
import math
import os
import re
import sys
from collections import Counter

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from scipy.spatial import cKDTree

VERSION = 1
LEGACY_SHIFT = (272, 330)
WORLD = 20261026

# 17 node families (exact match to kits/resources + zinc from 79d3a4500)
FIELD = {
    'iron': 3000, 'copper': 4000, 'gold': 5000, 'tin': 4000, 'silver': 5000,
    'rare-earth': 6000, 'coal': 3000, 'sulfur': 2000, 'saltpeter': 4000, 'oil': 5000,
    'gypsum': 2500, 'halite': 2500, 'potash': 2500, 'alkali': 2500,
    'nickel': 5000, 'marble': 3000, 'zinc': 4000,
}
INSET = 0.15
NODE_FAMILIES = list(FIELD)
LEDGER_FAMILIES = ['stone', 'clay', 'wood', 'water']
ROCK_FAMILIES = ['limestone', 'impactite', 'ultramafic', 'tuff', 'skarn', 'glass']
FAMILIES = NODE_FAMILIES + LEDGER_FAMILIES + ROCK_FAMILIES

# Province byte (0..11; bit 7 = RUIN_BIT = 128):
#   3 = volcanic edifice, patera or vent field (de-subducted)
#  11 = ultramafic (serpentinite detachment core-complex or exhumed picritic cumulate)
PROVINCES = [
    'water', 'sedimentary', 'crystalline', 'volcanic', 'evaporite', 'rift',
    'carbonate', 'impact', 'basalt', 'granite', 'quartzite', 'ultramafic',
]
RUIN_BIT = 128

CLIFF = 0.35
AIRLESS_M = 8000.0
SEA_CELLS = 5000
UPLAND_M = 5000.0
UPLAND_RELIEF = 1000.0

STRAND_M = 120.0
BURIED_SALT = 40.0
BASIN_I = {'salt lake': 1.0, 'unbalanced': 0.6}
PALAEO_I = 0.5
SODA_REGIONS = ('the catch',)

PICK_KM = 6.0
DECAY_KM = 60.0
FLAT = 0.4
MIN_UP = 1.5
PLACER_GAP_KM = 10.0
PLACER_MIN = 0.35
PLACER_FAMILIES = ('gold', 'tin')

# Ruin overlays (Ruins of Nazar; Ancient's Valley floor & blast basins handled below)
RUIN_REGIONS = ('ruins of nazar',)
RUIN_TYPES = ('ruin', 'ruined arcology')
RUIN_KM = 12.0

# Volcanic edifices: removed rift rim N/S and godstep valley; split shield flanks to high-Ti basalt
VOLCANIC_EDIFICE_REGIONS = ('throne/volcano', 'godshearth', 'korona / ne', 'steaming seamounts')
SHIELD_VOLCANO_REGIONS = ('godthrone', 'firebliss range', 'twins')

# Propagating tidal rifts & volcano-tectonic grabens (biome polygons only so geographic 'The Rift' does not flood Rift Rim N/S!)
RIFT_FULL_REGIONS = ('rift', 'w rift highland')
RIFT_TROUGH_REGIONS = {
    'high rift': 5800.0,
    'opal valley': 5200.0,
    'great chasm': -150.0,
    'e abyss': 200.0,
    'e abysss': -250.0,
}

# Prehistoric multi-ring impact walls (Inner Peak Ring + Outer Main Rim)
IMPACT_FULL_REGIONS = (
    'n highlands', 's highlands', 'e inner wall', 'e highlands', 'the cut',
    'w outer wall', 'nw outer wall', 'ne outer wall', 'se outer wall', 'stalker range',
)
IMPACT_RIM_ELEV_REGIONS = {
    'sw highlands': 3150.0,
    'e badlands': 4300.0,
    'n outlands': 4600.0,
    's outlands': 4600.0,
    'copper glacier': 6600.0,
    'high rift': 6400.0,
    'loom chasms': 6600.0,
    'region 99': 6600.0,
    'stalker gate': 6000.0,
    'the catch': 6200.0,
    'labyrinth': 6800.0,
}

CRATER_FLOOR = ('inner crater',)
MELT_KM = 24.0  # widened from 12 km to 24 km for a ~3,000 km multi-ring melt sheet

# Flood-basalt & mare-step provinces
BASALT_FULL_REGIONS = (
    'n semiarid', 'loom chasms', 'region 99', 'godstep valley', 'greenstep',
    'isle demo', 'east ring isles', 'west ring isles',
)

CARBONATE_REGIONS = {
    'k-guilin': 1.0, 'nw bay': 0.92, 'neo-ozarks': 1.0, 'spider lake': 0.72,
}
CARB_PROVINCE = 128
LAKE_FRINGE = 0.6
TUFA = 0.5
RIFT_LIME = 75
CALCRETE = 50

QUARTZITE_REGIONS = ('korona / ne',)
SANDSTONE_REGIONS = ('painted highlands',)
ULTRAMAFIC_REGIONS = ('the arch',)
VENT_CORE_KM = 10.0
GRANITE_KM = 24.0
GRANITE_P = 0.45

# White Gills fault-exhumed olivine/picrite cumulate window on the Twins (biomes/gills/PLAN.md)
WHITE_GILLS_WINDOWS = [
    ((1035.0, 1535.0), 18.0),
    ((1015.0, 1438.0), 22.0),
    ((988.0, 1458.0), 16.0),
]

TUFF_REACH = 2.8
WIND = (0.7071, 0.7071)  # prevailing NW -> SE

# Fallback pancake domes (edit_512.py) if D['domes'] is absent
FALLBACK_DOMES = [
    ('dome_fb_north', (175.0, 1302.0), 12.0),
    ('dome_fb_west', (157.0, 1324.0), 10.0),
    ('dome_fb_south', (175.0, 1335.0), 14.0),
    ('dome_fb_southeast', (201.0, 1331.0), 8.0),
    ('dome_fb_east', (211.0, 1305.0), 10.0),
    ('dome_ko_nw_trench', (1007.0, 490.0), 14.0),
    ('dome_ko_ne_trench', (1131.0, 494.0), 12.0),
    ('dome_ko_s_trench', (1038.0, 581.0), 16.0),
    ('dome_ko_se_moat', (1179.0, 578.0), 16.0),
    ('dome_ko_n_trench', (1071.0, 430.0), 14.0),
]

VITRIFIED = [
    (476.0, 915.0, 6.0), (398.0, 966.0, 5.5), (450.0, 896.0, 5.0),
    (406.0, 908.0, 6.5), (428.0, 948.0, 7.5), (460.0, 962.0, 7.0),
    (420.0, 984.0, 6.5),
]

# Authored lodes: upgrades Xanadu's Vale-wide epithermal & placer gold belt and stamps 5.1 biome-specific deposits
AUTHORED_LODES = [
    {
        'id': 'lode:xanadu-gold', 'family': 'gold', 'px': 911, 'py': 1665, 'r_km': 28, 'peak': 252,
        'why': "Xanadu's South Rift-scarp bonanza epithermal gold field above Strongwall & Qiblai (LORE.md 6.13; kits/resources/data/lodes.json).",
    },
    {
        'id': 'lode:xanadu-qiblai-au', 'family': 'gold', 'px': 920, 'py': 1608, 'r_km': 28, 'peak': 248,
        'why': 'Qiblai–Strongwall Rift-floor hydrothermal bonanza veins & Lake Xanadu south-shore placer fans making gold plentiful across the Vale.',
    },
    {
        'id': 'lode:xanadu-erehwon-au', 'family': 'gold', 'px': 808, 'py': 1516, 'r_km': 26, 'peak': 244,
        'why': 'Erehwon West Vale bounding-fault epithermal gold-quartz terraces & Pleasure-Dome stream placers.',
    },
    {
        'id': 'lode:xanadu-theodiga-au', 'family': 'gold', 'px': 908, 'py': 1535, 'r_km': 24, 'peak': 240,
        'why': 'Theodiga / Godthrone south-toe boiling-zone hot-spring sinters & gold-electrum veins.',
    },
    {
        'id': 'lode:xanadu-strongbow-au', 'family': 'gold', 'px': 994, 'py': 1598, 'r_km': 22, 'peak': 234,
        'why': 'Kirstabal–Strongbow East Vale Rift-margin epithermal gold veins & alluvial terraces.',
    },
    {
        'id': 'lode:galvanic-vms-zn', 'family': 'zinc', 'px': 801, 'py': 1573, 'r_km': 16, 'peak': 248,
        'why': 'Galvanic (The Rift Battery) Atlantis-II-Deep / Rio Tinto sphalerite-pyrite VMS lens (biomes/galvanic/PLAN.md s9).',
    },
    {
        'id': 'lode:galvanic-vms-cu', 'family': 'copper', 'px': 801, 'py': 1573, 'r_km': 16, 'peak': 232,
        'why': 'Galvanic chalcopyrite-pyrite cathode lens on E Rift terminal sea (biomes/galvanic/PLAN.md).',
    },
    {
        'id': 'lode:galvanic-vms-s', 'family': 'sulfur', 'px': 801, 'py': 1573, 'r_km': 16, 'peak': 235,
        'why': 'Galvanic native sulfur & acid-sulfate terraces (biomes/galvanic/PLAN.md).',
    },
    {
        'id': 'lode:firebliss-copper', 'family': 'copper', 'px': 298, 'py': 1286, 'r_km': 18, 'peak': 232,
        'why': 'Firebliss Copper-Fissure Vent magmatic-hydrothermal Cu-S vein complex (biomes/firebliss/PLAN.md).',
    },
    {
        'id': 'lode:copperglacier-tarn', 'family': 'copper', 'px': 190, 'py': 1165, 'r_km': 22, 'peak': 235,
        'why': 'Copper Glacier IOCG/skarn headwall ground into Copper Tarn (biomes/copperglacier/PLAN.md).',
    },
    {
        'id': 'lode:copperglacier-pass', 'family': 'copper', 'px': 318, 'py': 1246, 'r_km': 18, 'peak': 238,
        'why': 'Copper Pass contact Cu-skarn & gossan (biomes/copperglacier/PLAN.md Station 2).',
    },
    {
        'id': 'lode:sewall-copper-tarn', 'family': 'copper', 'px': 1288, 'py': 1184, 'r_km': 16, 'peak': 235,
        'why': 'SE Outer Wall Copper-Vein Tarn hydrothermal skarn (biomes/seouterwall/PLAN.md Station 6).',
    },
    {
        'id': 'lode:white-gills-ree', 'family': 'rare-earth', 'px': 1035, 'py': 1535, 'r_km': 18, 'peak': 230,
        'why': 'White Gills Co-Ni-Mn-REE breath-pipe crusts on Twins serpentinite window (biomes/gills/PLAN.md s9).',
    },
    {
        'id': 'lode:red-gills-ree', 'family': 'rare-earth', 'px': 878, 'py': 1442, 'r_km': 18, 'peak': 230,
        'why': 'Red Gills Fe-Mn-REE breath-pipe crusts on Godthrone Bloodfalls flank (biomes/gills/PLAN.md s9).',
    },
    {
        'id': 'lode:opal-valley-tuff', 'family': 'tuff', 'px': 1038, 'py': 1662, 'r_km': 22, 'peak': 240,
        'why': 'Opal Valley Terrace II welded rhyolitic ignimbrite / basalt dike black-opal contact (biomes/opalvalley/PLAN.md).',
    },
    {
        'id': 'lode:highrift-gjar-au', 'family': 'gold', 'px': 1572, 'py': 1643, 'r_km': 16, 'peak': 195,
        'why': 'High Rift Singing Gjar boiling-zone bladed-quartz epithermal Au-Ag-SiO2 veins (biomes/highrift/PLAN.md).',
    },
    {
        'id': 'lode:highrift-gjar-ag', 'family': 'silver', 'px': 1572, 'py': 1643, 'r_km': 16, 'peak': 210,
        'why': 'High Rift Singing Gjar epithermal Ag-quartz fissure veins (biomes/highrift/PLAN.md).',
    },
    {
        'id': 'lode:outlands-peak-cu', 'family': 'copper', 'px': 1654, 'py': 701, 'r_km': 20, 'peak': 220,
        'why': 'Outlands Peak Coyote turquoise/copper mesa mineralization (biomes/outlands/PLAN.md).',
    },
    {
        'id': 'lode:ebadlands-danakil-s', 'family': 'sulfur', 'px': 1352, 'py': 844, 'r_km': 16, 'peak': 230,
        'why': 'Eastern Badlands Station 1 Danakil-style hydrothermal sulfur & acid pools (biomes/ebadlands/NOTES.md).',
    },
    {
        'id': 'lode:spiderlake-mvt-zn', 'family': 'zinc', 'px': 1295, 'py': 215, 'r_km': 24, 'peak': 210,
        'why': 'Spider Lake secondary-crater / Neo-Ozarks MVT hydrothermal sphalerite-galena-celestine veins (biomes/spiderlake/PLAN.md).',
    },
    {
        'id': 'lode:spiderlake-mvt-ag', 'family': 'silver', 'px': 1295, 'py': 215, 'r_km': 24, 'peak': 185,
        'why': 'Spider Lake / Neo-Ozarks argentiferous galena & porphyry-dike veins (biomes/CRYSTAL-CAVES-5.1.md #2).',
    },
]

M32 = 0xFFFFFFFF
INV = 1.0 / 4294967296.0


# ---- Deterministic KRAND in numpy (identical to core/rand/08-core-rand.js & geology.py)
def _imul(a, b):
    return (np.asarray(a, np.uint64) * np.asarray(b, np.uint64)) & np.uint64(M32)


def _mix32(h):
    h = np.asarray(h, np.uint64) & np.uint64(M32)
    h ^= h >> np.uint64(16); h = _imul(h, 0x85EBCA6B)
    h ^= h >> np.uint64(13); h = _imul(h, 0xC2B2AE35)
    h ^= h >> np.uint64(16)
    return h


def _step(h, v):
    v = np.asarray(np.floor(v), np.int64) & M32
    h = _imul(np.asarray(h, np.uint64) ^ v.astype(np.uint64), 0x9E3779B1)
    return ((h << np.uint64(13)) | (h >> np.uint64(19))) & np.uint64(M32)


def k_hash(seed, *vals):
    h = (np.asarray(seed, np.uint64) & np.uint64(M32)) ^ np.uint64(0x2545F491)
    for v in vals:
        h = _step(h, v)
    return _mix32(h ^ np.uint64(len(vals)))


def k_cell(seed, ix, iz):
    return k_hash(seed, ix, iz, 0x51ED)


def k_child(seed, name):
    h = 0x811C9DC5
    b = name.encode('utf-16-le')
    for k in range(0, len(b), 2):
        h = int(_imul(h ^ (b[k] | b[k + 1] << 8), 0x01000193))
    return int(k_hash(seed, h))


def k_unit(u):
    return np.asarray(u, np.float64) * INV


def load_page_any(path):
    if os.path.isdir(path):
        parent = os.path.dirname(os.path.abspath(path))
        grand = os.path.dirname(parent)
        for cand in (grand, os.path.dirname(os.path.abspath(__file__))):
            if os.path.isdir(os.path.join(cand, 'smodel')):
                sys.path.insert(0, cand)
                break
        from smodel import page as SP
        D = SP.load(path)
        panel = os.path.join(parent, 'src', '10-panel.html')
        ver = re.search(r'(?i)scale model (\d+\.\d+)', open(panel, encoding='utf8').read()) if os.path.exists(panel) else None
        D['_version'] = ver.group(1) if ver else '5.1'
        return D
    html = open(path, encoding='utf8').read()
    ver = re.search(r'(?i)scale model (\d+\.\d+) ', html)
    for line in html.split('\n'):
        if line.startswith('const DATA = {'):
            D = json.loads(line[line.index('{'):line.rindex('}') + 1])
            D['_version'] = ver.group(1) if ver else '5.1'
            return D
    sys.exit('no DATA object in ' + path)


def raster_rgb(D, key):
    return np.array(Image.open(io.BytesIO(base64.b64decode(D[key]))).convert('RGB'))


def cells(km, cell_km):
    return max(1, int(round(km / cell_km)))


def docs(folder):
    if folder.endswith('.js'):
        src = open(folder, encoding='utf8').read()
        m = re.search(r'const (?:defRegs|defSetts) = (\[.*?\]);\r?\n', src, re.S)
        out = json.loads(m.group(1))
        seen = {d['id'] for d in out}
        for v in re.findall(r"'[\d.]+[a-z0-9]*':(\[.*?\])", src):
            try:
                arr = json.loads(v)
            except Exception:
                continue
            for d in arr:
                if d['id'] not in seen:
                    seen.add(d['id'])
                    out.append(d)
        return out
    if os.path.isfile(folder):
        return json.load(open(folder, encoding='utf8'))
    out = []
    for f in sorted(glob.glob(os.path.join(folder, '*.json'))):
        d = json.load(open(f, encoding='utf8'))
        d['id'] = os.path.splitext(os.path.basename(f))[0]
        out.append(d)
    return out


def rle(a):
    v = np.asarray(a, np.uint8).ravel()
    out = bytearray()
    n = len(v)
    change = np.flatnonzero(np.diff(v)) + 1
    starts = np.concatenate([[0], change])
    ends = np.concatenate([change, [n]])
    for s, e in zip(starts, ends):
        val = int(v[s])
        run = int(e - s)
        while run > 0:
            r = min(run, 256)
            out += bytes((r - 1, val))
            run -= r
    return base64.b64encode(bytes(out)).decode('ascii')


def unrle(s, n):
    b = base64.b64decode(s)
    out = np.empty(n, np.uint8)
    k = 0
    for i in range(0, len(b), 2):
        r = b[i] + 1
        out[k:k + r] = b[i + 1]
        k += r
    assert k == n
    return out


def poly_mask(pts, VW, VH, su, sv):
    im = Image.new('L', (VW, VH), 0)
    ImageDraw.Draw(im).polygon([(x * su, y * sv) for x, y in pts], fill=1)
    return np.array(im).astype(bool)


def zinc_byte(prov, copper, skarn):
    """Exact zinc (sphalerite) formula from 79d3a4500 (biomes/galvanic/PLAN.md s9)."""
    PI = PROVINCES.index
    p = prov & 127
    base = (
        150.0 * (p == PI('volcanic'))
        + 120.0 * (p == PI('rift'))
        + 90.0 * (p == PI('carbonate'))
        + 0.5 * skarn.astype(float)
    )
    cu = copper.astype(float)
    z = np.maximum(base, 0.8 * cu * (cu > 100))
    return np.clip(np.round(z * (p != PI('evaporite'))), 0, 255).astype(np.uint8)


def stamp_lodes(layers, land, lodes, su, sv, cell_km):
    touched = set()
    for L in lodes:
        fam = L['family']
        if fam not in layers:
            continue
        a = layers[fam]
        VH, VW = a.shape
        touched.add(fam)
        ci, cj, r = L['px'] * su, L['py'] * sv, L['r_km'] / cell_km
        for j in range(max(0, int(cj - r) - 1), min(VH, int(cj + r) + 2)):
            for i in range(max(0, int(ci - r) - 1), min(VW, int(ci + r) + 2)):
                d = ((i - ci) ** 2 + (j - cj) ** 2) ** 0.5
                if d > r or not land[j, i]:
                    continue
                v = int(round(L['peak'] * max(0.0, 1.0 - (d / r) ** 2) ** 0.5))
                if v > a[j, i]:
                    a[j, i] = v
    return touched


def lode_nodes(a, mask, fam, anchor, OW, OH, su, sv):
    VH, VW = a.shape
    Cm = FIELD[fam]
    A0, A1 = anchor
    i0, j0 = int(math.floor(-A0 / Cm)), int(math.floor(-A1 / Cm))
    i1, j1 = int(math.ceil((OW * 2000 - A0) / Cm)), int(math.ceil((OH * 2000 - A1) / Cm))
    iz, ix = np.mgrid[j0:j1, i0:i1]
    base = k_child(WORLD, 'res:' + fam)
    s = k_cell(base, ix, iz)
    fx, fz = k_unit(k_hash(s, 2)), k_unit(k_hash(s, 3))
    x = A0 + (ix + INSET + (1 - 2 * INSET) * fx) * Cm
    z = A1 + (iz + INSET + (1 - 2 * INSET) * fz) * Cm
    ci = np.floor(x / 2000.0 * su + 0.5).astype(int)
    cj = np.floor(z / 2000.0 * sv + 0.5).astype(int)
    ok = (ci >= 0) & (ci < VW) & (cj >= 0) & (cj < VH)
    ci, cj = np.clip(ci, 0, VW - 1), np.clip(cj, 0, VH - 1)
    p = a[cj, ci].astype(int)
    keep = ok & (np.floor(k_unit(k_hash(s, 1)) * 255) < p) & ((mask[cj, ci] & 3) == 0)
    g = k_unit(k_hash(s, 4))
    q = g * (1.15 - 0.5 * p / 255.0)
    yld = np.where(q < 0.15, 2.0, np.where(q < 0.55, 1.0, 0.5))
    return x[keep], z[keep], yld[keep], ix[keep], iz[keep]


def lode_digest(nodes):
    x, z, y, ix, iz = nodes
    order = np.lexsort((ix, iz))
    txt = ';'.join('%d,%d,%g' % (ix[k], iz[k], y[k]) for k in order)
    return {'count': int(len(x)), 'sha1': hashlib.sha1(txt.encode()).hexdigest()[:16]}


def render_comparison_map(old_geo_path, prov_new, prov_b_new, E, water, regions, su, sv, out_jpg):
    """Render high-resolution side-by-side Before (committed 2026-11-03) vs After (`geology-gemini.json`) map
    with biome boundaries, airless (>8 km) hatching/contours, and province legend."""
    VH, VW = prov_new.shape
    pal = np.array([
        [36, 72, 128],    # 0 water
        [208, 188, 126],  # 1 sedimentary
        [146, 148, 160],  # 2 crystalline (gneiss basement)
        [218, 72, 42],    # 3 volcanic (edifice / patera / vent)
        [244, 244, 232],  # 4 evaporite
        [58, 162, 118],   # 5 rift
        [108, 206, 218],  # 6 carbonate
        [136, 78, 132],   # 7 impact (megabreccia / melt collar)
        [68, 70, 84],     # 8 basalt (flood / mare / shield)
        [226, 158, 162],  # 9 granite (anatectic / pre-impact pluton)
        [234, 216, 172],  # 10 quartzite (tepui / slickrock)
        [62, 128, 62],    # 11 ultramafic (serpentinite / cumulate)
    ], dtype=np.float32)

    gy, gx = np.gradient(E)
    shade = np.clip(0.84 - 0.00045 * (gx + gy), 0.52, 1.16)[..., None]

    def paint_panel(p_arr, ruin_mask):
        rgb = pal[p_arr] * np.where(water[..., None], 1.0, shade)
        if ruin_mask.any():
            rgb[ruin_mask] = rgb[ruin_mask] * 0.58 + np.array([255.0, 40.0, 220.0]) * 0.42
        # Subtle cyan-white stipple on airless (>8 km) crest cells
        air = (E > AIRLESS_M) & (~water)
        jj, ii = np.mgrid[0:VH, 0:VW]
        stip = air & (((ii + jj) % 4) == 0)
        rgb[stip] = rgb[stip] * 0.68 + np.array([220.0, 245.0, 255.0]) * 0.32
        im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')
        dr = ImageDraw.Draw(im)
        for r in regions:
            if r.get('kind') == 'biome' and len(r.get('points', [])) >= 3:
                pts = [(x * su, y * sv) for x, y in r['points']]
                dr.line(pts + [pts[0]], fill=(24, 26, 30), width=1)
        return im

    if old_geo_path and os.path.isfile(old_geo_path):
        old_d = json.load(open(old_geo_path, encoding='utf-8'))
        old_pb = unrle(old_d['layers']['province'], VW * VH).reshape(VH, VW)
        im_old = paint_panel(old_pb & 127, (old_pb & RUIN_BIT) > 0)
    else:
        im_old = paint_panel(prov_new, (prov_b_new & RUIN_BIT) > 0)

    im_new = paint_panel(prov_new, (prov_b_new & RUIN_BIT) > 0)

    header_h = 62
    footer_h = 112
    gap = 14
    W_tot = VW * 2 + gap + 24
    H_tot = header_h + VH + footer_h
    canvas = Image.new('RGB', (W_tot, H_tot), (18, 22, 28))
    canvas.paste(im_old, (12, header_h))
    canvas.paste(im_new, (12 + VW + gap, header_h))

    dr = ImageDraw.Draw(canvas)
    try:
        font_t = ImageFont.truetype('arialbd.ttf', 22)
        font_b = ImageFont.truetype('arialbd.ttf', 16)
        font_s = ImageFont.truetype('arial.ttf', 14)
    except Exception:
        font_t = font_b = font_s = ImageFont.load_default()

    dr.text((18, 10), 'BEFORE: Committed geology.json (2026-11-03 bake — 118 regions, missing 5.1 edits)',
            fill=(255, 196, 150), font=font_t)
    dr.text((18, 36), 'Bugs: Firebliss/Labyrinth 98-100% gneiss; Slabfields/Greenstep 0% basalt; Rift Rim N/S 100% volcanic; >8 km rim 0% impact',
            fill=(205, 212, 222), font=font_s)

    rx = 12 + VW + gap + 6
    dr.text((rx, 10), 'AFTER: Rebaked geology-gemini.json (Merged 5.1 + Pillars 1-4 + Tharn Continents)',
            fill=(165, 245, 195), font=font_t)
    dr.text((rx, 36), '360° Impact Walls + Secondary Ejecta Craters (Spider Lake, SE); Map-Edge Tharn Felsic Continents; Leaky-Rift Arch; Patera Domes',
            fill=(205, 212, 222), font=font_s)

    # Label key fixed regions on the AFTER panel
    ox, oy = 12 + VW + gap, header_h
    callouts = [
        (181, 1318, 'Firebliss Patera + Domes'),
        (245, 1500, 'Labyrinth'),
        (635, 1270, 'Greenstep'),
        (930, 1095, 'Godstep'),
        (850, 1410, 'Godshearth'),
        (1020, 1495, 'Twins + White Gills'),
        (1050, 1660, 'Opal Valley'),
        (1450, 1650, 'High Rift'),
        (1650, 1380, 'Slabfields'),
        (1640, 1140, 'Loom Chasms'),
        (1660, 880, 'Great Chasm'),
        (1175, 1235, 'SE Outer Wall'),
        (1255, 1525, 'SE Tharn Continent + Ejecta Crater'),
        (1295, 212, 'Spider Ejecta Crater'),
        (1470, 135, 'Tharn Uplands (Felsic)'),
        (32, 860, 'W Tharn Cordillera'),
        (1080, 500, 'Korona + 5 Domes'),
        (1240, 310, 'NE Wall Skarn'),
        (220, 180, 'The Arch (Ring-Rift)'),
        (510, 995, 'SW Highlands'),
        (1310, 860, 'E Abyss'),
    ]
    for px, py, txt in callouts:
        cx, cy = int(ox + px * su), int(oy + py * sv)
        dr.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=(255, 245, 120), outline=(15, 15, 15))
        dr.text((cx + 5, cy - 7), txt, fill=(10, 12, 16), font=font_s)
        dr.text((cx + 4, cy - 8), txt, fill=(255, 250, 210), font=font_s)

    # Legend bar along bottom
    ly = header_h + VH + 14
    labels = [
        (0, '0 Water'), (1, '1 Sedimentary'), (2, '2 Crystalline (Gneiss)'),
        (3, '3 Volcanic (Edifice/Vent)'), (4, '4 Evaporite'), (5, '5 Rift'),
        (6, '6 Carbonate (Karst)'), (7, '7 Impact (Megabreccia)'), (8, '8 Basalt (Flood/Mare)'),
        (9, '9 Granite (Anatectic)'), (10, '10 Quartzite (Tepui)'), (11, '11 Ultramafic'),
    ]
    col_w = (W_tot - 36) // 6
    for idx_p, (pi, name_p) in enumerate(labels):
        r_row, r_col = divmod(idx_p, 6)
        bx = 18 + r_col * col_w
        by = ly + r_row * 32
        c_tup = tuple(int(v) for v in pal[pi])
        dr.rectangle((bx, by, bx + 24, by + 18), fill=c_tup, outline=(230, 230, 230))
        dr.text((bx + 32, by + 1), name_p, fill=(235, 238, 244), font=font_b)

    dr.text((18, ly + 68),
            'Magenta tint = RUIN_BIT (Ancient ruins & Blast Valley)   |   Pale stipple = Class O (>8,000 m hypobaric/stratospheric wall crest)   |   Thin dark lines = 5.1 biome polygons',
            fill=(195, 208, 225), font=font_s)

    os.makedirs(os.path.dirname(os.path.abspath(out_jpg)), exist_ok=True)
    canvas.save(out_jpg, quality=91)
    print('wrote comparison map:', out_jpg)


def main(argv):
    if len(argv) < 5:
        sys.exit(__doc__)
    page_src, regs_src, setts_src, out_path = argv[1:5]
    old_geo = argv[argv.index('--old-geology') + 1] if '--old-geology' in argv else None
    map_out = argv[argv.index('--map-out') + 1] if '--map-out' in argv else None
    rep_out = argv[argv.index('--report-out') + 1] if '--report-out' in argv else None
    want_km = float(argv[argv.index('--cell') + 1]) if '--cell' in argv else 4.0

    D = load_page_any(page_src)
    lo, hi, OW, OH, VW, VH = D['lo'], D['hi'], D['fullW'], D['fullH'], D['w'], D['hh']
    h_rgb = raster_rgb(D, 'h')
    E_full = lo + ((h_rgb[..., 0].astype(np.int32) << 8) | h_rgb[..., 1]) / 65535.0 * (hi - lo)
    wl_rgb = raster_rgb(D, 'wl')
    water_full = wl_rgb[..., 2] > 127

    k = max(1, int(round(want_km / (2.0 * (OW - 1) / (VW - 1)))))
    E = E_full[::k, ::k] if k > 1 else E_full
    water = water_full[::k, ::k] if k > 1 else water_full
    VH, VW = E.shape
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    CELL_KM = 2.0 / su
    ANCHOR = [LEGACY_SHIFT[0] * 2000, LEGACY_SHIFT[1] * 2000] if OW != 1549 else [0, 0]

    jj, ii = np.mgrid[0:VH, 0:VW]
    pj = np.clip(np.round(jj / sv).astype(int), 0, OH - 1)
    pi = np.clip(np.round(ii / su).astype(int), 0, OW - 1)
    rain = np.array(Image.open(io.BytesIO(base64.b64decode(D['p']))).convert('L')).astype(float)[pj, pi] / 255.0 * 4000.0
    temp = np.array(Image.open(io.BytesIO(base64.b64decode(D['tm']))).convert('L')).astype(float)[pj, pi] - 90.0

    regions = docs(regs_src)
    setts = docs(setts_src)
    PI = PROVINCES.index

    def named(names, kinds=None):
        names_l = {n.lower() for n in names}
        m = np.zeros((VH, VW), bool)
        for r in regions:
            if r['name'].strip().lower() in names_l and (kinds is None or r.get('kind') in kinds) and len(r.get('points', [])) >= 3:
                m |= poly_mask(r['points'], VW, VH, su, sv)
        return m

    land = ~water
    airless = E > AIRLESS_M
    gy, gx = np.gradient(E)
    slope = np.hypot(gx, gy) / (CELL_KM * 1000.0)
    cliff = slope > CLIFF
    relief = ndimage.maximum_filter(E, cells(20, CELL_KM)) - ndimage.minimum_filter(E, cells(20, CELL_KM))

    # ---- 1. Active Vents, Paterae, Missing Plan Vents & Silicic Pancake Domes
    vents_list = [(float(v['px'][0]), float(v['px'][1]), float(v.get('radius', 3)), v.get('kind', 'vent')) for v in D['vents']]
    # Add Greenstep Fissure Shield (668,1344), Godshearth central hydrothermal vents (844,1411),
    # Slabfields fault-foot paterae (1601.5,1388.6 & 1722,1374), Korona deep trench vents, and Danakil fumaroles (1352,844)
    extra_vents = [
        (668.0, 1344.0, 3.5, 'fissure'),
        (844.0, 1411.0, 4.5, 'caldera'),
        (1601.5, 1388.6, 2.2, 'patera'),
        (1722.0, 1374.0, 2.2, 'patera'),
        (986.0, 468.0, 3.0, 'trench'),
        (1096.0, 456.0, 3.0, 'trench'),
        (1148.0, 535.0, 3.0, 'trench'),
        (1062.0, 612.0, 3.0, 'trench'),
        (1352.0, 844.0, 2.5, 'fumarole'),
    ]
    if not any(v[3] == 'patera' and abs(v[0] - 181.0) < 5 for v in vents_list):
        extra_vents.append((181.0, 1317.5, 16.0, 'patera'))
    all_vents = vents_list + extra_vents

    domes_raw = D.get('domes') or [{'id': did, 'px': [cx, cy], 'd_km': dkm} for did, (cx, cy), dkm in FALLBACK_DOMES]

    ventd = np.full((VH, VW), 1e9)
    volcanic = named(VOLCANIC_EDIFICE_REGIONS, ('biome',))
    tuff = np.zeros((VH, VW))
    for vx, vy, vr, vkind in all_vents:
        dx, dy = (ii - vx * su) * CELL_KM, (jj - vy * sv) * CELL_KM
        d = np.hypot(dx, dy)
        ventd = np.minimum(ventd, d)
        reach = 10.0 + 4.0 * vr
        volcanic |= d <= reach
        lee = 0.55 + 0.45 * np.where(d > 0, (dx * WIND[0] + dy * WIND[1]) / np.maximum(d, 1e-9), 1.0)
        tuff = np.maximum(tuff, 205.0 * np.clip(1.0 - d / (TUFF_REACH * reach * lee), 0.0, 1.0))

    # Distal Plinian / umbrella-plume ash fallout aprons from Throne, Lesser Throne, Korona & Firebliss Patera
    distal_ash_sources = [
        (820.0, 875.0, 320.0, 95.0),   # Throne shield / flank trachyte plumes -> hyperjungle S & savage hyperjungle
        (980.0, 845.0, 220.0, 85.0),   # Lesser Throne caldera -> hyperjungle & e badlands
        (1080.0, 510.0, 280.0, 80.0),  # Korona ring-fault vents -> painted highlands & e badlands
        (181.0, 1317.5, 220.0, 95.0),  # Firebliss Patera SE plume -> Labyrinth northern valleys
    ]
    for ax, ay, r_ash, pk in distal_ash_sources:
        dx, dy = (ii - ax * su) * CELL_KM, (jj - ay * sv) * CELL_KM
        d = np.hypot(dx, dy)
        lee = 0.65 + 0.35 * np.where(d > 0, (dx * WIND[0] + dy * WIND[1]) / np.maximum(d, 1e-9), 1.0)
        tuff = np.maximum(tuff, pk * np.clip(1.0 - d / (r_ash * lee), 0.0, 1.0))

    # Shield & stratovolcano complexes: summit/cones/vents = volcanic, outer shield aprons = basalt
    m_godthrone = named(('godthrone',), ('biome',))
    m_firebliss = named(('firebliss range',), ('biome',))
    m_twins = named(('twins',), ('biome',))
    volcanic |= m_godthrone & ((E > 8500.0) | (ventd <= 34.0))
    volcanic |= m_firebliss & ((E > 3800.0) | (ventd <= 28.0))
    volcanic |= m_twins & ((E > 4600.0) | (ventd <= 26.0))
    # Steampits geothermal basin
    m_steampits = named(('steampits',), ('geographic',))
    volcanic |= m_steampits & (E < -1350.0)

    # Firebliss Patera lava lake oval -> basalt crust, Holm & rim -> volcanic
    t_rot = math.radians(-6.0)
    dx_fb = (ii / su) - 181.0
    dy_fb = (jj / sv) - 1317.5
    rho_patera = np.hypot(
        (dx_fb * math.cos(t_rot) + dy_fb * math.sin(t_rot)) / 12.0,
        (-dx_fb * math.sin(t_rot) + dy_fb * math.cos(t_rot)) / 8.0,
    )
    dx_hm = (ii / su) - 175.5
    dy_hm = (jj / sv) - 1315.0
    rho_holm = np.hypot(
        (dx_hm * math.cos(t_rot) + dy_hm * math.sin(t_rot)) / 3.0,
        (-dx_hm * math.sin(t_rot) + dy_hm * math.cos(t_rot)) / 2.2,
    )
    patera_crust = (rho_patera < 1.0) & (rho_holm >= 1.0)

    # Pancake domes (Firebliss + Korona): volcanic + obsidian glass + pumice tuff
    dome_mask = np.zeros((VH, VW), bool)
    dome_glass = np.zeros((VH, VW))
    for dm in domes_raw:
        cx, cy = float(dm['px'][0]), float(dm['px'][1])
        rk = max(5.0, float(dm['d_km']) * 0.5 + 2.0)
        d = np.hypot((ii - cx * su) * CELL_KM, (jj - cy * sv) * CELL_KM)
        dome_mask |= d <= rk
        dome_glass = np.maximum(dome_glass, np.where(d <= rk, 235.0, np.where(d <= rk + 4.0, 160.0, 0.0)))
        tuff = np.maximum(tuff, np.where(d <= rk + 6.0, 155.0 * np.clip(1.0 - d / (rk + 8.0), 0, 1), 0.0))
        ventd = np.minimum(ventd, d)

    volcanic |= dome_mask

    # ---- 2. Rift Troughs (excluding uplifted Rift Rim N/S horst shoulders >2,200 m!)
    rift = named(RIFT_FULL_REGIONS, ('biome',))
    rift &= ~(named(('rift rim n', 'rift rim s'), ('biome',)) & (E > 2200.0))
    for rname, max_e in RIFT_TROUGH_REGIONS.items():
        rift |= named((rname,)) & (E < max_e)
    # Labyrinth deep extensional graben axes (<2,150 m)
    m_labyrinth = named(('labyrinth',), ('biome',))
    rift |= m_labyrinth & (E < 2150.0)

    # ---- 3. Ruin Overlay (Ruins of Nazar + ruin pins + Ancient's Valley low floor & 7 blast basins)
    ruin = named(RUIN_REGIONS)
    m_anc_val = named(("ancient's valley", 'ancients valley'))
    ruin |= m_anc_val & (E < 260.0)
    for bx, by, rk in VITRIFIED:
        ruin |= np.hypot((ii - bx * su) * CELL_KM, (jj - by * sv) * CELL_KM) <= (1.5 * rk + 4.0)
    for s in setts:
        if (s.get('type') or '').lower() in RUIN_TYPES:
            ruin |= np.hypot(ii - s['px'] * su, jj - s['py'] * sv) * CELL_KM <= RUIN_KM

    # ---- 4. Evaporite Basins (clamped for 5.1 NW palaeolakes + missing closed sumps)
    soda_reg = named(SODA_REGIONS)
    ev = {k_ev: np.zeros((VH, VW)) for k_ev in ('gypsum', 'halite', 'potash', 'alkali')}
    volc_share = ndimage.uniform_filter(volcanic.astype(float), cells(204, CELL_KM))
    arid = np.clip((600.0 - rain) / 500.0, 0.0, 1.0)
    basins_out = []
    tri = lambda z, c, w: np.clip(1.0 - np.abs(z - c) / w, 0.0, 1.0)

    px_f0, py_f0 = ii / su, jj / sv
    east_dam_bowl = (px_f0 >= 780.0) & (px_f0 <= 972.0) & (py_f0 >= 388.0) & (py_f0 <= 505.0) & (E <= 850.0)
    nw_palaeo_clamp = named(('dam', 'dam 2', 'floodzone', 'n semiarid', 'nw lowlands')) | east_dam_bowl
    jobs = []
    for idx_b, b in enumerate(D['basins']):
        if b.get('kind') in BASIN_I:
            jobs.append(('basin:%d' % idx_b, b['at_px'], b['level_m'], b['level_m'] + STRAND_M, BASIN_I[b['kind']], True, b, False))
    foot = {d['basin']: d['foot_m'] for d in D.get('dams') or []}
    for idx_p, p in enumerate(D.get('palaeolakes') or []):
        jobs.append(('palaeo:%d' % idx_p, p['seed_px'], None, foot.get(p['basin'], p['level_m']), PALAEO_I, False, p, True))

    # Explicit closed-sump evaporite pans missed by basins.json (Loom Chasms Lake Nim, Godstep Step 4,
    # The Bowl, Crater Drylands N XS pans, NE Rim Station 3 trough, Great Chasm -1187 m sump, Cube's Plateau gypsum)
    synthetic_pans = [
        ('pan:lake_nim', [1668.0, 1153.0], 218.0, 345.0, 0.92, False, {'kind': 'playa', 'km2': 2400}),
        ('pan:godstep_step4', [968.0, 1086.0], 875.0, 965.0, 0.88, False, {'kind': 'playa', 'km2': 1800}),
        ('pan:the_bowl', [1169.0, 1150.0], -1080.0, -880.0, 0.95, True, {'kind': 'salt lake', 'km2': 4200}),
        ('pan:crater_dry_n', [756.0, 628.0], -1290.0, -1180.0, 0.80, False, {'kind': 'playa', 'km2': 2400}),
        ('pan:necanyons_n', [1015.0, 682.0], -1155.0, -1010.0, 0.78, False, {'kind': 'playa', 'km2': 1100}),
        ('pan:great_chasm_deep', [1695.0, 885.0], -1187.0, -920.0, 0.88, False, {'kind': 'playa', 'km2': 1600}),
    ]
    for bid, at, lvl, top, inten, wet, bdict in synthetic_pans:
        jobs.append((bid, at, lvl, top, inten, wet, bdict, False))

    for bid, at, level, top, I, wet, b, is_palaeo in jobs:
        sj, si = int(round(at[1] * sv)), int(round(at[0] * su))
        cond = (E <= top) & (nw_palaeo_clamp if is_palaeo else np.ones((VH, VW), bool))
        lab, _ = ndimage.label(cond)
        if not (0 <= sj < VH and 0 <= si < VW) or lab[sj, si] == 0:
            continue
        dom = lab == lab[sj, si]
        km2 = b.get('km2', 0)
        rmax = max(4.0, 2.5 * math.sqrt(max(km2, 1)) / math.sqrt(math.pi) / CELL_KM + cells(8, CELL_KM))
        dom &= np.hypot(ii - si, jj - sj) <= rmax
        dry = dom & land
        if not dry.any():
            continue
        base = level if (wet and level is not None) else float(E[dry].min())
        z = np.clip((E - base) / max(top - base, 1.0), 0.0, 1.0)
        soda = np.where(soda_reg, 1.0, np.clip(volc_share * 2.0 + arid * 0.5, 0.0, 1.0))
        sd = float(soda[dry].mean())
        ev['gypsum'] = np.maximum(ev['gypsum'], np.where(dry, I * 255.0 * tri(z, 0.82, 0.30), 0.0))
        ev['halite'] = np.maximum(ev['halite'], np.where(dry, I * 255.0 * tri(z, 0.50, 0.30), 0.0))
        ev['potash'] = np.maximum(ev['potash'], np.where(dry, I * 255.0 * (1.0 - 0.3 * soda) * tri(z, 0.12, 0.25), 0.0))
        ev['alkali'] = np.maximum(ev['alkali'], np.where(dry, I * 255.0 * soda * tri(z, 0.18, 0.30), 0.0))
        basins_out.append({
            'id': bid, 'at_px': [round(at[0], 1), round(at[1], 1)], 'kind': b.get('kind', 'palaeolake'),
            'level_m': round(level, 1) if level is not None else round(top, 1), 'top_m': round(top, 1),
            'cells': int(dry.sum()), 'soda': round(sd, 3), 'intensity': I,
        })

    # East Abyss (`e abysss` + `e abyss`) 19 snaky graben salt lakes: evaporite on arid shore sills (rain < 560 mm)
    m_eabyss = named(('e abyss', 'e abysss'))
    eabyss_shore = m_eabyss & land & ndimage.binary_dilation(water & m_eabyss, iterations=cells(10, CELL_KM)) & (rain < 580.0) & (E < -1100.0)
    ev['halite'] = np.maximum(ev['halite'], 215.0 * eabyss_shore)
    ev['gypsum'] = np.maximum(ev['gypsum'], 195.0 * eabyss_shore)
    ev['potash'] = np.maximum(ev['potash'], 125.0 * eabyss_shore)

    # Ancient Dam relic lakes in `n semiarid` / `dam 2` (omitted from D['basins']):
    #   - Eastmost dam-relic lake (`dam 2`, 51px 818..946 x 414..486, -277 m): full 360-deg slow-recession evaporite surround!
    #   - West-end dam-relic lake (`dam`, 51px 582..614 x 436..466, -152 m): slow-recession evaporite strandline ring!
    east_dam_lake_w = water & (px_f0 >= 812.0) & (px_f0 <= 952.0) & (py_f0 >= 408.0) & (py_f0 <= 492.0)
    d_edl_km = ndimage.distance_transform_edt(~east_dam_lake_w) * CELL_KM
    edl_ring = land & (d_edl_km <= 28.0) & (E <= 480.0) & (px_f0 >= 795.0) & (px_f0 <= 972.0) & (py_f0 >= 392.0) & (py_f0 <= 504.0)
    edl_w = np.clip(1.0 - d_edl_km / 30.0, 0.25, 1.0) * edl_ring
    ev['gypsum'] = np.maximum(ev['gypsum'], 215.0 * edl_w)
    ev['halite'] = np.maximum(ev['halite'], 190.0 * edl_w)
    ev['potash'] = np.maximum(ev['potash'], 125.0 * edl_w)
    ev['alkali'] = np.maximum(ev['alkali'], 95.0 * edl_w)

    west_dam_lake_w = water & (px_f0 >= 576.0) & (px_f0 <= 620.0) & (py_f0 >= 430.0) & (py_f0 <= 472.0)
    d_wdl_km = ndimage.distance_transform_edt(~west_dam_lake_w) * CELL_KM
    wdl_ring = land & (d_wdl_km <= 16.0) & (E <= 260.0) & named(('n semiarid', 'dam'))
    wdl_w = np.clip(1.0 - d_wdl_km / 18.0, 0.30, 1.0) * wdl_ring
    ev['gypsum'] = np.maximum(ev['gypsum'], 195.0 * wdl_w)
    ev['halite'] = np.maximum(ev['halite'], 165.0 * wdl_w)
    ev['potash'] = np.maximum(ev['potash'], 105.0 * wdl_w)

    # KARST-SITES-5.1 gypsum karst sites: Cube's Plateau (718,1564) & Ledge cliff-spring (437,1330) + Cut sumps + Painted playas
    gypsum_sites = [
        (718.0, 1564.0, 26.0, 215.0, 90.0),   # Cube's Plateau gypsum karst maze (Site #3)
        (437.0, 1330.0, 16.0, 195.0, 60.0),   # Ledge gypsum branchwork karst (Site #6)
        (838.0, 565.0, 18.0, 185.0, 175.0),   # The Cut hypersaline sump N
        (856.0, 598.0, 18.0, 185.0, 175.0),   # The Cut hypersaline sump S
        (1002.0, 556.0, 12.0, 95.0, 40.0),    # Painted Highlands synclinal playa 1
        (1018.0, 610.0, 12.0, 95.0, 40.0),    # Painted Highlands synclinal playa 2
        (1038.0, 572.0, 12.0, 95.0, 40.0),    # Painted Highlands synclinal playa 3
    ]
    for gx_, gy_, gr_, gyp_v, hal_v in gypsum_sites:
        d = np.hypot((ii - gx_ * su) * CELL_KM, (jj - gy_ * sv) * CELL_KM)
        w_g = np.clip(1.0 - (d / gr_) ** 2, 0.0, 1.0) * land
        ev['gypsum'] = np.maximum(ev['gypsum'], gyp_v * w_g)
        ev['halite'] = np.maximum(ev['halite'], hal_v * w_g)

    evap = np.maximum.reduce([ev[k_ev] for k_ev in ev]) > 45.0

    # ---- 5. Initial Province Assignment (suppressing fake scarp-relief crystalline in sedimentary/rift basins)
    suppress_scarp_crystal = (
        named(('sedesert', 'the bowl', 'ne rim', 'e abyss', 'e abysss', 'sw lowlands', 'nw lowlands',
               'hyperjungle n', 'hyperjungle s', 'savage hyperjungle', 'crater drylands n'))
        | (named(('e badlands',)) & (E < 4200.0))
        | (m_labyrinth & (E < 2850.0))
    )
    upland = ((E > UPLAND_M) | ((relief > UPLAND_RELIEF) & (~suppress_scarp_crystal)) | airless)

    prov = np.ones((VH, VW), np.uint8)  # 1 = sedimentary
    prov[upland] = PI('crystalline')
    prov[rift] = PI('rift')
    prov[volcanic] = PI('volcanic')
    prov[evap] = PI('evaporite')
    prov[water] = PI('water')

    # Baseline saltpeter / water / wood / clay / stone layers needed by carbonate() and rocks()
    riv = np.zeros((VH, VW), bool)
    for r in D['rivers']:
        for x, y in r['px']:
            rj, ri = int(round(y * sv)), int(round(x * su))
            if 0 <= rj < VH and 0 <= ri < VW:
                riv[rj, ri] = True
    shore = land & ndimage.binary_dilation(water, iterations=cells(4, CELL_KM))
    flood = riv & (slope < 0.02)

    P = {}
    P['saltpeter'] = np.clip(np.round((200.0 * arid + 40.0 * evap) * land), 0, 255).astype(np.uint8)
    # Leucoxene UVA nitrate boost on high-Ti cold-arid volcanic shields (Godthrone & leeward Throne 3.5-6.5 km)
    leuco = (m_godthrone | named(('throne/volcano',))) & (E >= 3500.0) & (E <= 6800.0) & (rain < 450.0) & land
    P['saltpeter'] = np.maximum(P['saltpeter'], (165 * leuco).astype(np.uint8))

    for k_ev in ev:
        P[k_ev] = np.clip(np.round(ev[k_ev] * land), 0, 255).astype(np.uint8)

    stone0 = 60.0 + 195.0 * np.clip(relief / 900.0, 0.0, 1.0) * (
        (prov == PI('crystalline')) | (prov == PI('volcanic')) | (prov == PI('rift')) | ((prov == PI('sedimentary')) & (relief > 200.0))
    )
    P['stone'] = np.clip(np.round(stone0 * land), 0, 255).astype(np.uint8)

    wlab, _ = ndimage.label(water)
    sizes = np.bincount(wlab.ravel())
    sea = water & (sizes[wlab] >= SEA_CELLS)
    mask = (water.astype(np.uint8)) | (cliff.astype(np.uint8) << 1) | (airless.astype(np.uint8) << 2) | (sea.astype(np.uint8) << 3)

    # ---- 6. Carbonate Platforms, Karst Windows & Contact-Marble Host Lenses
    platform = np.zeros((VH, VW))
    for r in regions:
        rk = r['name'].strip().lower()
        if rk in CARBONATE_REGIONS and r.get('kind') == 'biome' and len(r.get('points', [])) >= 3:
            pm = poly_mask(r['points'], VW, VH, su, sv).astype(float)
            # Feather spider lake & neo-ozarks edges slightly and mask out >3,600 m ejecta-capped rim peaks
            if rk in ('spider lake', 'neo-ozarks'):
                pm = ndimage.gaussian_filter(pm, sigma=1.4) * (E < 3600.0)
            platform = np.maximum(platform, CARBONATE_REGIONS[rk] * pm)

    # sw highlands western ringfold ramp (<3,250 m)
    m_swh = named(('sw highlands',), ('biome',))
    platform = np.maximum(platform, 0.56 * (m_swh & (E < 3250.0)))
    # SW lowlands lower Great River (klir Rivrh) karstic gorge carbonate embayment
    m_swl = named(('sw lowlands',), ('biome',))
    d_klir = np.hypot((ii - 585.0 * su) * CELL_KM, (jj - 1095.0 * sv) * CELL_KM)
    platform = np.maximum(platform, 0.75 * (m_swl & (d_klir < 68.0) & (E < 950.0)))

    # Additional Circum-Ring-Sea Warm Carbonate Shelves & Terraces (non-tower karst: coralgal/stromatolite/ooid/marl
    # platforms in clastic- & ash-sheltered sectors, leaving NW Bay + k-guilin as the sole dramatic tower/tsingy karst!):
    #   (a) SW Bay coastal limestone/marl bench & Voth contact-marble belt (KARST-SITES-5.1 #9; Agropolis-Drum-Voth ramp)
    m_swbay = named(('sw bay',), ('biome',))
    swbay_carb = m_swbay & (E < -940.0) & (slope < 0.085) & (px_f0 <= 776.0) & (py_f0 >= 895.0)
    platform = np.maximum(platform, 0.72 * swbay_carb)
    #   (b) Northern / NE Ring Sea upwind stromatolite-ooid barrier shelf (Port Goto - Crescent - N Kautoa, sheltered from SE ash)
    n_ring_carb = (
        land & (px_f0 >= 884.0) & (px_f0 <= 1008.0) & (py_f0 >= 684.0) & (py_f0 <= 736.0)
        & (E < -1210.0) & (slope < 0.068) & (tuff < 55.0) & (~named(('steampits',)))
    )
    platform = np.maximum(platform, 0.68 * n_ring_carb)
    #   (c) Eastern Ring Sea clear-water carbonate promontory (Talon - N Fort Ordo dry shelf, north of muddy Hyperjungle mouth)
    e_ring_carb = (
        land & (px_f0 >= 1002.0) & (px_f0 <= 1058.0) & (py_f0 >= 742.0) & (py_f0 <= 804.0)
        & (E < -1050.0) & (rain < 920.0) & (slope < 0.075)
    )
    platform = np.maximum(platform, 0.66 * e_ring_carb)
    #   (d) Ring Isles fringing coralgal/rudist reef flats & Hook reef-spit (away from active volcanic vents)
    m_ringisles = named(('isle demo', 'east ring isles', 'west ring isles'))
    hook_spit = land & (px_f0 >= 794.0) & (px_f0 <= 824.0) & (py_f0 >= 912.0) & (py_f0 <= 942.0) & (E < -1320.0)
    platform = np.maximum(platform, 0.70 * ((m_ringisles & (E < -1340.0) & (slope < 0.078) & (ventd > 16.0)) | hook_spit))

    gyp_f, alk_f = P['gypsum'].astype(float), P['alkali'].astype(float)
    arid_s = np.clip((P['saltpeter'].astype(float) - 40.0 * (prov == PI('evaporite'))) / 200.0, 0.0, 1.0)
    plat_b = 255.0 * platform * np.isin(prov, [PI('sedimentary'), PI('crystalline'), PI('evaporite'), PI('rift')])
    fringe_b = LAKE_FRINGE * ndimage.maximum_filter(gyp_f, cells(20, CELL_KM)) * (gyp_f < 80.0)
    tufa_b = TUFA * ndimage.maximum_filter(alk_f, cells(12, CELL_KM))
    rift_b = RIFT_LIME * (prov == PI('rift'))
    calcrete_b = CALCRETE * np.clip(1.0 - np.abs(arid_s - 0.4) / 0.4, 0.0, 1.0) * (prov == PI('sedimentary'))

    # Seed pre-impact carbonate megablocks & roof-pendants for canonical marble/skarn & hypogene karst sites!
    m_newall = named(('ne outer wall',), ('biome',))
    m_korona = named(('korona / ne',), ('biome',))
    m_oidong = named(('oidong valley',), ('biome',))
    m_xanadu = named(('xanadu', 'vale of xanadu'))
    special_lime = np.zeros((VH, VW))
    # NE Outer Wall ("Glass-Skarn Bastion") carbonate megablocks along Korona/Arachnoid/Outland-Gate flanks (<7,000 m)
    special_lime = np.maximum(special_lime, 165.0 * (m_newall & (E < 7000.0) & ((ii / su) < 1385.0)))
    # Korona trench-wall carbonate lenses (-950 m < E < +300 m)
    special_lime = np.maximum(special_lime, 155.0 * (m_korona & (E > -950.0) & (E < 300.0)))
    # Oidong Valley roof-pendant marble belts
    special_lime = np.maximum(special_lime, 155.0 * (m_oidong & (E > 1800.0) & (E < 4600.0)))
    # Vale of Xanadu spring travertine & rift-lake limestone
    special_lime = np.maximum(special_lime, 145.0 * (m_xanadu & (E < 1850.0)))
    # SE Outer Wall Jade-Karst Polje (1208,1254) & Hearth-Hold / Cave of Crystals (525,1400)
    for lx_, ly_, lr_, lv_ in ((1208.0, 1254.0, 20.0, 225.0), (525.0, 1400.0, 18.0, 195.0)):
        dl = np.hypot((ii - lx_ * su) * CELL_KM, (jj - ly_ * sv) * CELL_KM)
        special_lime = np.maximum(special_lime, lv_ * np.clip(1.0 - (dl / lr_) ** 2, 0.0, 1.0))

    lime = np.clip(np.round(np.maximum.reduce([plat_b, fringe_b, tufa_b, rift_b, calcrete_b, special_lime]) * land), 0, 255).astype(np.uint8)
    P['limestone'] = lime
    prov[(plat_b >= CARB_PROVINCE) & np.isin(prov, [PI('sedimentary'), PI('crystalline')]) & land] = PI('carbonate')
    # Jade-Karst Polje core & Hearth-Hold core
    prov[(np.hypot((ii - 1208.0 * su) * CELL_KM, (jj - 1254.0 * sv) * CELL_KM) <= 10.0) & land] = PI('carbonate')

    # ---- 7. Rocks: Impact Walls/Ejecta, Flood Basalts, Korona/Tepui, Stagnant-Lid Granites, Ultramafics, Skarns & Glass
    out = prov.copy()

    # 7a. Prehistoric Multi-Ring Impact Walls vs Map-Edge Tharn-Type Buoyant Felsic Continents!
    px_f, py_f = ii / su, jj / sv
    r_basin_km = np.hypot(px_f - 865.0, py_f - 935.0) * 2.0

    # Map-edge high airless/ice regions outside the Outer Wall are Tharn-type lighter 'continental' rock
    # (worlddreambank.org/T/THARN.HTM: buoyant felsic gneiss/granulite/anorthosite + granite batholiths),
    # while The Arch's SW & NE landward structural extensions (<4,400 m) carry The Arch's mafic basalt/rift geology ashore!
    arch_sw_land = (
        land & (px_f <= 156.0) & (py_f >= 470.0) & (py_f <= 712.0)
        & (r_basin_km >= 1655.0) & (r_basin_km <= 1905.0) & (E < 4400.0)
    )
    arch_ne_land = (
        land & (px_f >= 470.0) & (px_f <= 775.0) & (py_f <= 176.0)
        & (r_basin_km >= 1705.0) & (r_basin_km <= 2035.0) & (E < 4400.0)
        & (~(named(('double delta',), ('biome',)) & (E < 85.0) & (slope < 0.015)))
    )
    arch_land_ext = arch_sw_land | arch_ne_land

    m_tharn_uplands = named(('tharn uplands',), ('biome',))
    tharn_continent = (
        (
            m_tharn_uplands
            | ((py_f < 185.0) & ((px_f > 775.0) | (E >= 4400.0)))               # Far-North Shield (above Arch NE landfall)
            | ((px_f < 175.0) & (py_f >= 470.0) & ((py_f > 712.0) | (E >= 4400.0)) & (~named(('copper glacier',), ('biome',))))
            | ((px_f < 420.0) & (py_f > 1515.0) & (~m_labyrinth))               # Far-SW Continental Rim
            | ((px_f > 1605.0) & (py_f < 1210.0) & (~named(('great chasm', 'loom chasms', 'region 99'), ('biome',))))  # Far-E Shield
            | (                                                                 # Unmarked SE Airless/Ice Continental Massif SE of SE Outer Wall!
                (px_f > 1075.0) & (py_f > 1345.0)
                & (~named(('se outer wall', 'stalker range', 'stalker gate', 'twins', 'opal valley', 'the catch'), ('biome',)))
                & (E >= 4800.0)
            )
            | ((r_basin_km > 1510.0) & (E >= 5200.0) & (~named(IMPACT_FULL_REGIONS)))
        )
        & (~arch_land_ext)
    )

    wall = named(IMPACT_FULL_REGIONS)
    for rname, min_e in IMPACT_RIM_ELEV_REGIONS.items():
        wall |= named((rname,)) & (E >= min_e) & (~tharn_continent)

    # Unmarked Outer-Wall crests & cols strictly along the true Crater Rim (Comp #26 W Rim & Comp #12 E Rim, NOT Tharn edges!)
    shield_excl = m_godthrone | named(('throne/volcano', 'twins', 'firebliss range'))
    d_named_wall = ndimage.distance_transform_edt(~wall) * CELL_KM
    unmarked_wall = (
        land & (~shield_excl) & (~tharn_continent)
        & (r_basin_km <= 1485.0)
        & (((E > 7000.0) & (d_named_wall <= 240.0)) | ((E > 5200.0) & (d_named_wall <= 130.0)))
    )
    wall |= unmarked_wall
    # Farside proximal megabreccia/suevite coastal bluffs within 90 km of NW Outer Wall
    d_nwwall = ndimage.distance_transform_edt(~named(('nw outer wall', 'w outer wall'))) * CELL_KM
    wall |= named(('farside',)) & (d_nwwall <= 90.0) & (relief > 700.0)

    # Radial Secondary Ejecta Craters punched into the exterior / Tharn continental margins:
    #   1) Spider Lake Secondary Ejecta Crater (center 1295,212; 176x124 km radial ellipse):
    #      - Asymmetric downrange NW/N/NNE boulder-ejecta rampart seals off the Ria headwaters (`9101`/`9109`),
    #      - Lower uprange SW rim is breached by the single spillway gorge (`1258..1282 x 188..218`) draining SW into
    #        `9102` (`Hām-Tsēk / Arachnoid River`), while the crater floor exposes the Neo-Ozarks `carbonate` window!
    ang_sl = math.radians(-28.0)
    dx_sl = (px_f - 1295.0) * 2.0
    dy_sl = (py_f - 212.0) * 2.0
    rho_sl = np.hypot(
        (dx_sl * math.cos(ang_sl) + dy_sl * math.sin(ang_sl)) / 88.0,
        (-dx_sl * math.sin(ang_sl) + dy_sl * math.cos(ang_sl)) / 62.0,
    )
    sw_arachnoid_breach = (px_f >= 1254.0) & (px_f <= 1284.0) & (py_f >= 186.0) & (py_f <= 222.0)
    nw_downrange_collar = (py_f <= 198.0) & (px_f <= 1375.0)
    spider_rim = (
        land & (rho_sl >= 0.80) & (rho_sl <= 1.26)
        & ((E >= 1580.0) | nw_downrange_collar)
        & (~sw_arachnoid_breach)
    )
    #   2) Unmarked SE Tharn-Continent Ice-Filled Secondary Ejecta Crater (center 1375,1525; D ~ 108 km)
    d_se_ej = np.hypot(px_f - 1375.0, py_f - 1525.0) * 2.0
    se_ejecta_crater = land & (d_se_ej <= 54.0)
    #   3) Copper Tarn (147,1143) & Crookshore Bay Doublet (89,605 & 82,678) radial secondary ejecta collars
    d_ct_ej = np.hypot(px_f - 147.0, py_f - 1143.0) * 2.0
    d_cs1_ej = np.hypot(px_f - 89.0, py_f - 605.0) * 2.0
    d_cs2_ej = np.hypot(px_f - 82.0, py_f - 678.0) * 2.0
    west_sec_rims = land & (
        ((d_ct_ej >= 14.0) & (d_ct_ej <= 34.0))
        | ((d_cs1_ej >= 16.0) & (d_cs1_ej <= 34.0) & (E < 2400.0))
        | ((d_cs2_ej >= 18.0) & (d_cs2_ej <= 36.0) & (E < 2400.0))
    )
    secondary_craters = spider_rim | se_ejecta_crater | west_sec_rims

    out[(wall | secondary_craters) & np.isin(out, [PI('crystalline'), PI('granite'), PI('sedimentary')])] = PI('impact')
    # Ensure the cut & sw highlands E scarp are impact megabreccia
    out[named(('the cut',)) & land & (out != PI('evaporite'))] = PI('impact')
    out[m_swh & ((E >= 3250.0) | (slope > 0.22)) & land] = PI('impact')

    # Sudbury melt-sheet collar along Inner Wall foot inside Inner Crater
    inner_wall = named(('n highlands', 's highlands', 'e inner wall', 'e highlands', 'sw highlands', 'the cut')) & (out == PI('impact'))
    floor_ic = named(CRATER_FLOOR, ('geographic',)) & (~inner_wall)
    d_inner = ndimage.distance_transform_edt(~inner_wall)
    mc = cells(MELT_KM, CELL_KM)
    margin_sudbury = floor_ic & (d_inner <= mc) & land

    # Exterior radial ballistic ejecta decay apron outside the Outer Wall + around secondary craters
    outer_wall_seed = named(('nw outer wall', 'w outer wall', 'ne outer wall', 'se outer wall', 'stalker range')) | (unmarked_wall & (E > 6500.0))
    d_outer_km = ndimage.distance_transform_edt(~outer_wall_seed) * CELL_KM
    exterior_zone = (~floor_ic) & (~named(('n semiarid', 'nw lowlands', 'sw lowlands', 'sedesert', 'the bowl', 'e badlands', 'e abysss', 'e abyss', 'korona / ne', 'painted highlands')))
    erosional_window = (named(('spider lake', 'neo-ozarks')) & (E < 2100.0)) | (named(('ria valley', 'double delta')) & (E < 1400.0))
    ejecta_halo = np.where(
        exterior_zone & (~wall) & (d_outer_km <= 320.0),
        180.0 * np.clip(1.0 - d_outer_km / 320.0, 0.0, 1.0) * np.where(erosional_window, 0.12, 1.0),
        0.0,
    )
    sec_halo = np.maximum(
        185.0 * np.clip(1.0 - np.maximum(0.0, rho_sl - 1.0) / 0.55, 0.0, 1.0) * (rho_sl >= 0.75),
        215.0 * np.clip(1.0 - d_se_ej / 82.0, 0.0, 1.0),
    )

    impactite = np.maximum.reduce([
        255.0 * (out == PI('impact')),
        155.0 * (wall & (out == PI('sedimentary'))),
        145.0 * margin_sudbury,
        ejecta_halo,
        sec_halo,
    ])
    nickel = np.maximum(
        225.0 * margin_sudbury * np.clip(1.0 - (d_inner - 1.0) / max(mc, 1), 0.0, 1.0),
        65.0 * (out == PI('impact')),
    )

    # 7b. Flood Basalts, Mare Steps, Tilted Slabfields, Labyrinth Dome Cap & Shield Flanks
    basalt_mask = named(BASALT_FULL_REGIONS)
    # Siphon Pits: SE high plateau (>2,620 m) is flood basalt; NW Lake Ostrukh graben (<2,620 m) stays fertile loess sedimentary!
    m_siphon = named(('siphon pits',), ('biome',))
    basalt_mask |= m_siphon & (E >= 2620.0)
    out[m_siphon & (E < 2620.0) & (out == PI('crystalline'))] = PI('sedimentary')
    # The Slabfields (was Mid Basin): central & eastern flood-basalt slabs/benches (x > 1535, E < 6200 m)
    m_slabs = named(('the slabfields', 'mid basin'), ('biome',))
    basalt_mask |= m_slabs & ((ii / su) > 1535.0) & (E < 6200.0)
    # Great Chasm flood-basalt walls & rotated benches (-150 m <= E < 6800 m)
    basalt_mask |= named(('great chasm',), ('biome',)) & (E >= -150.0) & (E < 6800.0)
    # Shield volcano flanks outside vent/summit cores (Godthrone, Firebliss patera crust & lower benches, Twins apron)
    basalt_mask |= (m_godthrone | m_twins) & (~volcanic) & (E < 8500.0)
    basalt_mask |= patera_crust
    # Crater Drylands S & SE Savannah Rim: Godstep Ti-basalt lava lobes
    basalt_mask |= named(('crater drylands s',), ('biome',)) & (E > -50.0)
    # Labyrinth: SW plume-lifted dome cap (3,500 <= E < 6,800 m and slope < 0.22) is basalt; steep chaos walls = impact
    basalt_mask |= m_labyrinth & (E >= 3500.0) & (E < 6800.0) & (slope < 0.22)
    out[m_labyrinth & (E >= 2850.0) & (slope >= 0.22) & (out == PI('crystalline'))] = PI('impact')
    # Outlands interior basalt-capped mesas (3,100 <= E < 4,500 m, flat-topped)
    basalt_mask |= named(('n outlands', 's outlands'), ('biome',)) & (E >= 3100.0) & (E < 4500.0) & (slope < 0.08)
    # Opal Valley bimodal Ti-basalt dike/bench strips
    basalt_mask |= named(('opal valley',), ('biome',)) & (E >= 2200.0) & (E < 4400.0) & (~volcanic)

    out[basalt_mask & np.isin(out, [PI('sedimentary'), PI('crystalline')]) & (~dome_mask)] = PI('basalt')
    out[patera_crust & land] = PI('basalt')

    # 7c. Korona / NE & Painted Highlands (clipping Painted Highlands to E > 1,500 m so W moat is preserved!)
    far_vent = ventd > VENT_CORE_KM
    # Korona deep annular trench floors (E < -900 m) stay volcanic/basalt; elevated horst tables >= -900 m become quartzite!
    kor_table = m_korona & (E >= -900.0) & far_vent & (~dome_mask)
    kor_trench = m_korona & (E < -900.0) & far_vent & (~dome_mask) & (out == PI('volcanic'))
    out[kor_table & (out == PI('volcanic'))] = PI('quartzite')
    out[kor_trench] = PI('basalt')

    m_painted = named(SANDSTONE_REGIONS, ('biome',)) & (E > 1500.0)
    out[m_painted & np.isin(out, [PI('volcanic'), PI('quartzite')]) & far_vent & (~dome_mask)] = PI('sedimentary')

    # NE Rim (necanyons) & Tiers slickrock/mesa quartzite tables
    out[named(('ne rim',), ('biome',)) & (out == PI('crystalline')) & land] = PI('quartzite')

    # 7d. Remaining Crystalline: Quartzite shelves vs Anatectic/Pre-Impact Granite Plutons (blocked on mafic/impact/scarp zones!)
    no_fake_granite = (
        floor_ic | wall | basalt_mask | m_ringisles | suppress_scarp_crystal
        | named(('labyrinth', 'firebliss range', 'twins', 'godthrone', 'godstep valley', 'greenstep',
                 'great chasm', 'loom chasms', 'region 99', 'the slabfields', 'mid basin', 'siphon pits',
                 'sw highlands', 'the cut', 'farside'))
    )
    # Rugged interior crater tors (e.g., Crater Drylands kopjes) are differentiated impact-melt granophyre -> impact!
    out[floor_ic & (out == PI('crystalline')) & land] = PI('impact')

    rest = out == PI('crystalline')
    stone_f = P['stone'].astype(float)
    gb = cells(GRANITE_KM, CELL_KM)
    bj, bi = jj // gb, ii // gb
    pluton = k_unit(k_hash(k_child(WORLD, 'rock:granite'), bi, bj)) < GRANITE_P
    out[rest & (~airless) & (~tharn_continent) & (stone_f < 100.0)] = PI('quartzite')
    # Allow buoyant felsic granite batholiths across Tharn-type continental shields (including >8 km Class O plateaus!)
    can_granite = ((~airless) & (~no_fake_granite) & (stone_f >= 145.0)) | (tharn_continent & (~secondary_craters))
    out[rest & can_granite & pluton] = PI('granite')

    # 7e. The Arch + Its SW & NE Landward Structural Extensions:
    #     Capsica-inspired Valhalla exterior concentric ring-graben & tidally flexed leaky basaltic fissure arch
    #     continuing ashore onto Crookshore (SW) and Double Delta / N Ria horsts (NE)!
    m_arch_core = named(ULTRAMAFIC_REGIONS, ('biome',)) & (~named(('steaming seamounts',), ('biome',))) & (ventd > 16.0)
    m_arch_all = (m_arch_core | (arch_land_ext & (~secondary_craters))) & (ventd > 16.0)
    arch_blk = k_unit(k_hash(k_child(WORLD, 'rock:arch-seg'), ii // 4, jj // 4))
    arch_um = m_arch_all & (arch_blk < np.where(m_arch_core, 0.08, 0.05)) & (E >= 45.0) & (E < 2200.0)
    arch_bas = m_arch_all & (~arch_um)
    out[arch_um & land] = PI('ultramafic')
    out[arch_bas & (E < 65.0) & land] = PI('rift')
    out[arch_bas & (E >= 65.0) & land] = PI('basalt')

    ultra = 255.0 * (out == PI('ultramafic'))
    for (sx, sy), rk in WHITE_GILLS_WINDOWS:
        d_wg = np.hypot((ii - sx * su) * CELL_KM, (jj - sy * sv) * CELL_KM)
        ultra = np.maximum(ultra, 235.0 * np.clip(1.0 - d_wg / rk, 0.0, 1.0))
        # Promote core of White Gills fault footwall on Twins to ultramafic province!
        out[(d_wg <= rk * 0.58) & land & (~dome_mask)] = PI('ultramafic')

    # 7f. Contact Aureoles: Marble & Skarn where Granite, Volcanic, or Arachnoid/Korona/NE-Wall Dikes heat Limestone
    ne_dike_swarm = m_newall & (E < 6800.0) & (((ii + jj) % 5) <= 1)
    hot = (
        (out == PI('granite'))
        | (out == PI('volcanic'))
        | (named(('korona / ne', 'arachnoid canyons')) & (out == PI('basalt')))
        | ne_dike_swarm
    )
    lime_f = P['limestone'].astype(float)
    marble = 0.92 * lime_f * (ndimage.binary_dilation(hot, iterations=cells(10, CELL_KM)) & (lime_f >= 35.0))
    skarn = 210.0 * (ndimage.binary_dilation(hot, iterations=cells(5, CELL_KM)) & (~hot) & (lime_f >= 30.0))

    # 7g. Glass: Ancient's Valley 7 Blast Basins + 10 Obsidian Pancake Domes + Twins/Opal/Cut Silicic Glass
    glass = dome_glass.copy()
    for bx, by, rk in VITRIFIED:
        d_v = np.hypot((ii - bx * su) * CELL_KM, (jj - by * sv) * CELL_KM)
        glass = np.maximum(glass, np.where(d_v < rk, 180.0, np.where(d_v < 1.5 * rk + CELL_KM * 0.5, 255.0, 0.0)))
    # Firebliss Patera quenched basaltic-glass shore rind & Twins obsidian coulee (1007,1472) & Cut vitrified lip
    glass = np.maximum(glass, 150.0 * patera_crust)
    d_tw_obs = np.hypot((ii - 1007.0 * su) * CELL_KM, (jj - 1472.0 * sv) * CELL_KM)
    glass = np.maximum(glass, 215.0 * np.clip(1.0 - d_tw_obs / 14.0, 0.0, 1.0))

    for k_rl, arr_rl in (
        ('impactite', impactite), ('nickel', nickel), ('ultramafic', ultra),
        ('tuff', tuff), ('marble', marble), ('skarn', skarn), ('glass', glass),
    ):
        P[k_rl] = np.clip(np.round(arr_rl * land), 0, 255).astype(np.uint8)

    prov = out

    # ---- 8. Final Prospectivity Bytes Recomputed Cleanly from Final Provinces & Rock Layers
    V = prov == PI('volcanic')
    Rf = prov == PI('rift')
    S = prov == PI('sedimentary')
    Cb = prov == PI('carbonate')
    Gn = prov == PI('crystalline')
    Gr = prov == PI('granite')
    Im = prov == PI('impact')
    Qz = prov == PI('quartzite')
    Ba = prov == PI('basalt')
    Um = prov == PI('ultramafic')
    Cl = Gn | Gr | Im

    margin = S & ndimage.binary_dilation(Cl | V | Ba, iterations=cells(12, CELL_KM))
    low = np.clip((1500.0 - E) / 1500.0, 0.0, 1.0)
    wet = np.clip((rain - 600.0) / 1200.0, 0.0, 1.0)
    flatness = 1.0 - np.clip(relief / 1500.0, 0.0, 1.0)
    sk = P['skarn'].astype(float)
    hard = ~(prov == PI('evaporite'))

    # Differentiate high-Ti shield summit (`m_godthrone & V`) so 191,500 km^2 of Ti-basalt isn't uniform Au=140/Ag=150!
    v_epithermal = V & (~m_godthrone | named(('godshearth',)) | (ventd <= 16.0))
    v_tishield = V & m_godthrone & (~v_epithermal)

    g = {}
    # Copper: hydrothermal vents, Keweenaw flood-basalt native Cu, rift brines, skarn, and Cyprus-type ultramafic VMS
    um_contact = Um & ndimage.binary_dilation(Ba | V | Rf, iterations=2)
    g['copper'] = (
        210.0 * v_epithermal + 95.0 * v_tishield + 125.0 * Rf + 50.0 * Cl
        + 12.0 * (S | Qz) + 115.0 * Ba + 55.0 * Um + 85.0 * um_contact + 0.65 * sk
        + 40.0 * m_painted
    )
    g['silver'] = 150.0 * v_epithermal + 45.0 * v_tishield + 110.0 * (Gn | Gr) + 80.0 * (Rf | Im) + 0.35 * sk
    g['gold'] = 140.0 * v_epithermal + 35.0 * v_tishield + 110.0 * (Gn | Gr) + 90.0 * (Rf | Im) + 38.0 * Um + 0.30 * sk
    # Sulfur recomputed AFTER rocks() -> fixes ghost sulfur=60 bug on Korona quartzite & Painted Highlands sandstone!
    g['sulfur'] = np.where(ventd < 44.0, 255.0 * np.exp(-ventd / 11.0), 0.0) + 60.0 * V + 160.0 * dome_mask
    g['tin'] = 200.0 * Gr + 55.0 * Gn + 25.0 * Im + 50.0 * Rf + 20.0 * v_epithermal
    g['rare-earth'] = 160.0 * Gr + 100.0 * Gn + 60.0 * Im + 190.0 * Rf + 35.0 * V
    # Iron: gneiss BIF, impact/granite, basin margin, Ti-basalt ilmenite, ultramafic laterite, savanna ferralsol, terra-rossa karst
    savanna_lat = (rain > 750.0) & (rain < 2200.0) & (temp > 20.0) & (flatness > 0.6) & (S | Ba)
    g['iron'] = (
        160.0 * Gn + 120.0 * (Gr | Im) + 140.0 * margin + 75.0 * V + 85.0 * Ba
        + 75.0 * (m_godthrone & (V | Ba)) + 135.0 * Um + 42.0 * Cb
        + 40.0 * (S | Qz) + 70.0 * Rf + 45.0 * savanna_lat + 0.75 * sk
    )

    # Coal: lowland wet sedimentary basins + East Abyss perched freshwater delta/mire benches + upland blanket peat bogs
    eabyss_mire = m_eabyss & (rain > 820.0) & (~eabyss_shore) & land
    upland_peat = (E >= 1800.0) & (E <= 4200.0) & (rain > 950.0) & (slope < 0.025) & (temp > -2.0) & (S | Im | Ba)
    coal = (
        230.0 * S * low * (0.25 + 0.75 * wet) * flatness
        + 210.0 * eabyss_mire * flatness
        + 58.0 * upland_peat
        + 48.0 * m_painted * flatness
    )
    g['coal'] = coal * (~m_steampits) * (~m_ringisles)

    # Oil: matured basin kerogen + deep low rift troughs; strictly zero on volcanic & ultramafic!
    oil_raw = (
        0.9 * ndimage.uniform_filter(g['coal'], cells(44, CELL_KM))
        * (0.5 + 0.5 * (margin | (S & (relief > 200.0) & (relief < 1200.0))))
        + 110.0 * Rf * low
    )
    g['oil'] = oil_raw * (~V) * (~Um) * (~m_ringisles) * (~m_steampits)

    g['nickel'] = np.maximum(P['nickel'].astype(float), 185.0 * Um)
    g['marble'] = P['marble'].astype(float)
    g['halite'] = np.maximum(P['halite'].astype(float), BURIED_SALT * S * flatness * (0.3 + 0.7 * arid))

    # Spider Lake / Outland Gate fault MVT Ag-Cu-Zn boost
    d_sp_fault = np.hypot((ii - 1345.0 * su) * CELL_KM, (jj - 245.0 * sv) * CELL_KM)
    mvt_zone = named(('spider lake', 'outland gate')) & (d_sp_fault < 55.0)
    g['copper'] = np.maximum(g['copper'], 135.0 * mvt_zone)
    g['silver'] = np.maximum(g['silver'], 155.0 * mvt_zone)
    g['sulfur'] = np.maximum(g['sulfur'], 125.0 * mvt_zone)

    # Clay: floodplains, lowland shores, wet basins, W Outer Wall loess bench, E Badlands bentonite, Dam slackwater
    w_loess = named(('w outer wall',), ('biome',)) & (E >= 2800.0) & (E <= 5100.0) & (slope < 0.09)
    eb_bent = named(('e badlands',), ('biome',)) & (E < 3000.0)
    dam_silt = named(('dam', 'dam 2', 'floodzone')) & (slope < 0.03)
    P['clay'] = np.clip(np.round((
        230.0 * (flood | (shore & (E < 2000.0)))
        + 65.0 * S * wet
        + 135.0 * w_loess
        + 130.0 * eb_bent
        + 145.0 * dam_silt
    ) * land), 0, 255).astype(np.uint8)

    P['wood'] = np.clip(np.round(
        255.0 * np.clip((rain - 350.0) / 700.0, 0.0, 1.0) * ((temp > -5.0) & (temp < 34.0) & (E < 4500.0)) * land
    ), 0, 255).astype(np.uint8)
    P['water'] = np.clip(np.round(
        np.maximum(255.0 * (riv | shore), 255.0 * np.clip((rain - 200.0) / 600.0, 0.0, 1.0))
    ), 0, 255).astype(np.uint8)

    hardp = Cl | V | Rf | Ba | Qz | Um
    g['stone'] = np.maximum.reduce([
        60.0 + 195.0 * np.clip(relief / 900.0, 0.0, 1.0) * (hardp | (S & (relief > 200.0))),
        150.0 * (Ba | Gr),
        125.0 * Cb,
    ])

    for k_g, arr_g in g.items():
        if k_g not in ('stone', 'marble', 'halite'):
            arr_g = arr_g * hard
        P[k_g] = np.clip(np.round(arr_g * land), 0, 255).astype(np.uint8)

    # Zinc (sphalerite) computed after copper & skarn (exact 79d3a4500 rule + MVT zone)
    P['zinc'] = zinc_byte(prov, P['copper'], P['skarn'])
    P['zinc'] = np.maximum(P['zinc'], np.clip(np.round(175.0 * mvt_zone * land), 0, 255).astype(np.uint8))
    P['zinc'][water] = 0

    prov_b = prov | np.where(ruin & land, RUIN_BIT, 0).astype(np.uint8)

    # ---- 9. Stamp Authored Lodes BEFORE Placer Routing so Downstream Rivers Carry Them!
    stamp_lodes(P, land, AUTHORED_LODES, su, sv, CELL_KM)

    # ---- 10. Lode Nodes & Downstream River Placers
    lodes = {fam: lode_nodes(P[fam], mask, fam, ANCHOR, OW, OH, su, sv) for fam in PLACER_FAMILIES}
    digest = {fam: lode_digest(lodes[fam]) for fam in PLACER_FAMILIES}

    rivers = D['rivers']
    by_id = {r['id']: r for r in rivers}
    inflow = {r['id']: {fam: [] for fam in PLACER_FAMILIES} for r in rivers}
    down = {}
    for r in rivers:
        n, cur, guard = 0, r, 0
        while (cur.get('to') or {}).get('river') in by_id and guard < 200:
            cur = by_id[cur['to']['river']]
            n += 1
            guard += 1
        down[r['id']] = n
    order = sorted(rivers, key=lambda r: (-down[r['id']], str(r['id'])))
    placers = []
    lode_xy = {fam: np.stack([lodes[fam][0], lodes[fam][1]], -1) for fam in PLACER_FAMILIES}
    trees = {fam: cKDTree(lode_xy[fam]) if len(lode_xy[fam]) else None for fam in PLACER_FAMILIES}

    for r in order:
        pts = r['px']
        bed = r.get('bed_m') or [0] * len(pts)
        if len(pts) < 2:
            continue
        X = np.array([p[0] * 2000.0 for p in pts])
        Z = np.array([p[1] * 2000.0 for p in pts])
        seg = np.hypot(np.diff(X), np.diff(Z)) / 1000.0
        sl = np.maximum(0.0, -np.diff(np.array(bed, float))) / np.maximum(seg, 1e-3)
        half = (r.get('width_m') or 60) / 2.0 + 15.0
        for fam in PLACER_FAMILIES:
            load, last = 0.0, -1e9
            tin_in = {kv[0]: kv[1] for kv in inflow[r['id']][fam]}
            run = 0.0
            for idx_v in range(len(pts)):
                if idx_v:
                    load *= math.exp(-seg[idx_v - 1] / DECAY_KM)
                    run += seg[idx_v - 1]
                load += tin_in.get(idx_v, 0.0)
                if trees[fam] is not None:
                    for q in trees[fam].query_ball_point([X[idx_v], Z[idx_v]], PICK_KM * 1000.0):
                        load += float(lodes[fam][2][q]) * 0.5
                why = None
                if idx_v >= 2:
                    up = float(np.mean(sl[max(0, idx_v - 4):idx_v - 1])) if idx_v - 1 > max(0, idx_v - 4) else float(sl[idx_v - 2])
                    if up >= MIN_UP and sl[idx_v - 1] < FLAT * up:
                        why = 'flatten'
                if idx_v == len(pts) - 1:
                    why = 'confluence' if (r.get('to') or {}).get('river') in by_id else 'mouth'
                if why and load >= PLACER_MIN and run - last >= PLACER_GAP_KM:
                    drop = load * 0.5
                    load -= drop
                    last = run
                    a_i = max(0, idx_v - 1)
                    b_i = min(len(pts) - 1, idx_v + 1)
                    tx, tz = X[b_i] - X[a_i], Z[b_i] - Z[a_i]
                    L_seg = math.hypot(tx, tz) or 1.0
                    nx_, nz_ = -tz / L_seg, tx / L_seg
                    cross = 0.0
                    if 0 < idx_v < len(pts) - 1:
                        cross = (X[idx_v] - X[a_i]) * (Z[b_i] - Z[idx_v]) - (Z[idx_v] - Z[a_i]) * (X[b_i] - X[idx_v])
                    side = -1.0 if cross > 0 else 1.0
                    px_, pz_ = X[idx_v] + nx_ * half * side, Z[idx_v] + nz_ * half * side
                    grade = 'high' if drop >= 2.0 else 'medium' if drop >= 0.9 else 'low'
                    placers.append({
                        'id': 'res:placer-%s:%s:%d' % (fam, r['id'], idx_v), 'kind': fam, 'grade': grade,
                        'x': round(px_, 1), 'z': round(pz_, 1), 'placer': True, 'river': r['id'],
                        'why': why, 'load': round(drop, 3),
                    })
            if (r.get('to') or {}).get('river') in by_id and load > 0.05:
                R2 = by_id[r['to']['river']]
                at = r['to']['at_px']
                d2 = [(p[0] - at[0]) ** 2 + (p[1] - at[1]) ** 2 for p in R2['px']]
                inflow[R2['id']][fam].append((int(np.argmin(d2)), load))
    placers.sort(key=lambda p: p['id'])

    polities = [
        {'name': r['name'], 'points': r['points']}
        for r in sorted(regions, key=lambda r: r['name'])
        if r.get('kind') == 'political' and len(r.get('points', [])) >= 3
    ]
    settl = [
        {'name': s['name'], 'px': s['px'], 'py': s['py'], 'type': s.get('type')}
        for s in sorted(setts, key=lambda s: (s['name'], s['px'], s['py']))
    ]

    stats = {
        'province_cells': {PROVINCES[idx_p]: int((prov == idx_p).sum()) for idx_p in range(len(PROVINCES))},
        'ruin_cells': int(((prov_b & RUIN_BIT) > 0).sum()),
        'mean': {k_f: round(float(P[k_f][land].mean()), 2) for k_f in FAMILIES},
        'lodes': digest,
        'placers': {fam: sum(1 for p in placers if p['kind'] == fam) for fam in PLACER_FAMILIES},
        'evaporite_basins': len(basins_out),
    }

    data = {
        'format': 'krator-geology',
        'version': VERSION,
        'source': 'Krator Scale Model ' + str(D['_version']) + ' (gemini-trade rebake)',
        'grid': {'w': VW, 'h': VH, 'fullW': OW, 'fullH': OH, 'px_m': 2000, 'cell_km': round(CELL_KM, 6)},
        'provinces': PROVINCES,
        'ruinBit': RUIN_BIT,
        'mask': {'water': 1, 'cliff': 2, 'airless': 4, 'sea': 8},
        'field': {
            'world': WORLD, 'inset': INSET, 'cells': FIELD, 'families': NODE_FAMILIES, 'anchor': ANCHOR,
            'grade': {'tilt': 0.5, 'high': 0.15, 'medium': 0.55},
        },
        'families': FAMILIES,
        'ledgerFamilies': LEDGER_FAMILIES,
        'rockFamilies': ROCK_FAMILIES,
        'layers': {'province': rle(prov_b), 'mask': rle(mask), **{k_f: rle(P[k_f]) for k_f in FAMILIES}},
        'lodes': AUTHORED_LODES,
        'placers': placers,
        'basins': basins_out,
        'polities': polities,
        'settlements': settl,
        'stats': stats,
    }

    n_tot = VW * VH
    assert (unrle(data['layers']['iron'], n_tot) == P['iron'].ravel()).all()
    assert (unrle(data['layers']['zinc'], n_tot) == P['zinc'].ravel()).all()

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, separators=(',', ':'), sort_keys=True)
    print('wrote %s (%.0f KB): %s' % (out_path, os.path.getsize(out_path) / 1024, json.dumps(stats['province_cells'])))
    print('placers', stats['placers'], 'lodes', digest, 'basins', len(basins_out), 'polities', len(polities), 'settlements', len(settl))

    if map_out:
        render_comparison_map(old_geo, prov, prov_b, E, water, regions, su, sv, map_out)

    if rep_out:
        # Compute per-biome before/after summary & unmarked airless/col stats for sanity-check tables
        old_pb = None
        if old_geo and os.path.isfile(old_geo):
            old_d = json.load(open(old_geo, encoding='utf-8'))
            old_pb = unrle(old_d['layers']['province'], n_tot).reshape(VH, VW) & 127

        biome_union = np.zeros((VH, VW), bool)
        biome_rows = []
        for r in sorted([x for x in regions if x.get('kind') == 'biome' and len(x.get('points', [])) >= 3], key=lambda x: x['name'].lower()):
            bm = poly_mask(r['points'], VW, VH, su, sv) & land
            biome_union |= bm
            cnt = int(bm.sum())
            if cnt == 0:
                continue
            new_cnts = Counter(prov[bm].tolist())
            new_top = [[PROVINCES[k_i], round(100.0 * v_i / cnt, 1)] for k_i, v_i in new_cnts.most_common(4)]
            old_top = []
            if old_pb is not None:
                oc = Counter(old_pb[bm].tolist())
                old_top = [[PROVINCES[k_i], round(100.0 * v_i / cnt, 1)] for k_i, v_i in oc.most_common(4)]
            biome_rows.append({
                'name': r['name'], 'id': r['id'], 'land_cells': cnt, 'km2': cnt * 16,
                'old_provs': old_top, 'new_provs': new_top,
                'mean_new': {fn: round(float(P[fn][bm].mean()), 1) for fn in ('copper', 'iron', 'gold', 'tin', 'zinc', 'sulfur', 'halite', 'marble', 'skarn', 'tuff', 'impactite', 'glass')},
            })

        unmarked = land & (~biome_union)
        um_air = unmarked & (E > 8000.0)
        um_col = unmarked & (E >= 5000.0) & (E <= 8000.0)
        um_low = unmarked & (E < 5000.0)
        rep = {
            'stats_new': stats,
            'unmarked_summary': {
                'airless_gt_8km': {
                    'cells': int(um_air.sum()), 'km2': int(um_air.sum()) * 16,
                    'provs_new': {PROVINCES[k_i]: round(100.0 * v_i / max(1, int(um_air.sum())), 1) for k_i, v_i in Counter(prov[um_air].tolist()).most_common()},
                },
                'high_col_5_8km': {
                    'cells': int(um_col.sum()), 'km2': int(um_col.sum()) * 16,
                    'provs_new': {PROVINCES[k_i]: round(100.0 * v_i / max(1, int(um_col.sum())), 1) for k_i, v_i in Counter(prov[um_col].tolist()).most_common()},
                },
                'low_mid_lt_5km': {
                    'cells': int(um_low.sum()), 'km2': int(um_low.sum()) * 16,
                    'provs_new': {PROVINCES[k_i]: round(100.0 * v_i / max(1, int(um_low.sum())), 1) for k_i, v_i in Counter(prov[um_low].tolist()).most_common()},
                },
            },
            'biomes': biome_rows,
        }
        with open(rep_out, 'w', encoding='utf-8') as fh:
            json.dump(rep, fh, indent=2)
        print('wrote rebake report:', rep_out)


if __name__ == '__main__':
    main(sys.argv)
