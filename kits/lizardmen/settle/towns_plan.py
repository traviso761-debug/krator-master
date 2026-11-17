#!/usr/bin/env python3
"""The Lizardmen towns after Gila, as data: writes each town's proposed spec (settlements/<town>/spec.json) and draws its
site sheet (settlements/<town>/sheets/site.png) from the scale model. GUIDE.md says how a builder turns a spec.json into the
town's src/81-<p>-spec.js (LZV_SPEC) and builds the page on this folder's shared builder (82-lzv-site.js and its kin).

    python kits/lizardmen/settle/towns_plan.py            # all four: tuatara, komodo, iguana, tubes
    python kits/lizardmen/settle/towns_plan.py komodo     # one

Frames: a spec is in the PAGE's frame, as LZV_SPEC is: x east, z SOUTH, metres from the town's pin (2 km a model pixel).
The sheets are drawn north up (u = x, v = -z) by settlements/voth/palace/blueprint.py, the generator the blueprints share.
The spiral drawn is the one 82-lzv-site.js lays from the same numbers (its corners, its windings, its mouth, its axis: the
level contour read from the model where the spec gives none). Everything here is *proposed*: each town's PLAN.md.
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'settlements', 'voth', 'palace'))
sys.path.insert(0, os.path.join(ROOT, 'settlements', 'basilisk'))
import blueprint as B                  # the shared sheet generator
import basilisk_layout as BL           # the model reader, marching squares, polygon helpers
import basilisk_blueprint as BB        # water squares, framing, polygon rooms

MODEL = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
SIN75 = math.sin(math.radians(75))
Q = 1.25 ** 0.25
RELIQ_E, RELIQ_W = [790, 1578], [651.9, 1486.7]

def r1(x):
    return round(float(x), 1)

# ------------------------------------------------------------------------------------------------ the castes
# Gila's holds (settlements/gila/PLAN.md section 3): warren 28 Tenders, makers 10, long house 33, lodge 30 (18 warriors and 12
# Bulwarks), tower 7 Interpreters; a craft hall 12 Makers.
def census(people, shares):
    out = {}; tot = 0
    for c, s in shares.items():
        out[c] = int(round(people * s)); tot += out[c]
    out[3] += people - tot              # rounding goes to the Drovers
    return out

# ------------------------------------------------------------------------------------------------ squared spirals
def squared_spiral(n, step, ratio=1.25):
    """n positions on a squared spiral (a small leiwen of pieces: the Great Granary, a row of cisterns)."""
    pts, cur, d, run, k = [], [0.0, 0.0], 0, 1, 0
    dirs = [(1, 0), (0, 1), (-1, 0), (0, -1)]
    while len(pts) < n:
        for _ in range(2):
            for _ in range(run):
                cur = [cur[0] + dirs[d][0] * step, cur[1] + dirs[d][1] * step]
                pts.append(tuple(cur))
                if len(pts) >= n: return pts
            d = (d + 1) % 4
        run += 1
    return pts

def ring(n, r, a0=0.0, skip=None):
    out = []
    for i in range(n):
        a = a0 + 2 * math.pi * i / n
        if skip and abs(((a - skip[0] + math.pi) % (2 * math.pi)) - math.pi) < skip[1]: a += skip[1] * 1.2
        out.append((r * math.cos(a), r * math.sin(a)))
    return out

def bearing_to(pin, px):
    """From a pin to a 5.1 pixel: the unit vector in the page frame (x east, z south), the distance (m), the bearing (deg)."""
    dx, dz = (px[0] - pin[0]) * 2000.0, (px[1] - pin[1]) * 2000.0
    d = math.hypot(dx, dz)
    return (dx / d, dz / d), d, (math.degrees(math.atan2(dx, -dz)) + 360) % 360

# ------------------------------------------------------------------------------------------------ the four specs
def specs():
    S = {}
    # ---- TUATARA: the copper town on the volcanic savanna; the raiders nearest the Sultanate's forts
    S['tuatara'] = dict(
        key='tuatara', name='Tuatara', prefix='tu', pin=[818, 1554], pinId='szv27b2reu', people=3000, seed=8301,
        build=dict(near=[-4500, 4500, -4500, 4500, 20], far=[-30000, 30000, -30000, 30000, 500]),
        shares={1: .22, 2: .20, 3: .28, 4: .17, 5: .03, 6: .10},
        spiral=dict(axis=15, windings=5, depth0=36, court=46, street=7, ratio=1.25, mouthExtra=18),
        why_axis='the mouth (+e2) due north, toward the Sultanate\'s west watch fort (818,1531: 46 km) and the raiders\' road; '
                 'the arms then run 15 degrees off east, 63 degrees off the contour (the ground falls 5.3 % to the north-east)',
        ley=dict(to=RELIQ_E, name='the east reliquary', stone=58),
        court=dict(nest='lz-nest'),
        pools=dict(w0=[['lz-warren', 1]], w1=[['lz-warren', 4], ['lz-tower', 2]], w2=[['lz-makers', 1]], w3=[['lz-longhouse', 1]], w4=[['lz-lodge', 1]]),
        gaps=dict(w0=[2.2, 4.2], w1=[3.2, 6.2], w2=[4.2, 8.2], w3=[12.0, 20.0], w4=[14.0, 24.0]),
        wells=[1, 2, 2, 2, 2],
        specials=[['gl-tank', 0, 0, 0.52, 2.2], ['lz-seer', 0, 1, 0.45, 2.0], ['lz-medicine', 0, 2, 0.38, 1.8], ['lz-obelisk', 0, 3, 0.55, 2.0],
                  ['lz-hall-bronze', 2, 0, 0.35, 2.0], ['lz-hall-reed', 2, 1, 0.62, 2.0], ['lz-hall-bone', 2, 2, 0.38, 2.0], ['lz-warehouse', 2, 3, 0.60, 2.0],
                  ['lz-granary', 3, 0, 0.30, 2.2], ['lz-granary', 3, 1, 0.68, 2.2], ['lz-granary', 3, 2, 0.34, 2.2], ['lz-granary', 3, 3, 0.66, 2.2],
                  ['lz-granary', 3, 0, 0.75, 2.2], ['lz-barracks', 4, 1, 0.35, 2.4], ['lz-barracks', 4, 3, 0.65, 2.4], ['lz-barracks', 4, 0, 0.5, 2.4]],
        mouth=dict(muster=True, tents=['lc-seer', 'lc-sail', 'lc-hide', 'lc-hide', 'lc-shield', 'lc-hide', 'lc-shield']),
        fields=dict(dir=[0.0, 1.0], r0=700, r1=3300, w=130, d=84, half=9, crops=['ashmillet', 'sandpan-fonio', 'bambara-groundnut', 'frillpod'],
                    farms=7, windmills=3, maxSlope=0.12, gaps=22, circle=True),
        cisterns=7,
        resolve=[dict(key='lz-mine', kind='copper', n=5, r=6000, why='the copper diggings 2-6 km out: KRES.near(x, z, "copper", 6000) from kits/resources, nearest first, one mine a node, none inside 900 m')],
        hamlet=dict(id='tuatara.diggings', focus='mine', site='the best copper node KRES gives', workers=120, popMax=210),
        expect=dict(people=3000, wells=12, keys=['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-cistern', 'lz-mine'], lake=False, hamlet=True),
        look=dict(hour=10.2, dens=1.8, fog=0.000040),
        layers=['ground.savanna.litter', 'ground.dirt', 'ground.tilled', 'ground.ash'],
        views=[dict(name='Overview', at=[0, 0], from_=[-700, 420, 900]), dict(name='The nest hall', at=[0, 0], from_=[60, 26, 70]),
               dict(name='The mouth and the war camp', at=[0, -560], from_=[90, 30, 120]), dict(name='The copper diggings', at=[0, 0], from_=[300, 160, 300])],
        sheet=5200)
    # ---- KOMODO: the tin town on the jungle shore at the sea's far end, on a steep bluff
    S['komodo'] = dict(
        key='komodo', name='Komodo', prefix='km', pin=[865, 1617], pinId='spnqhezhiw', people=3000, seed=8401,
        build=dict(near=[-4500, 13500, -5000, 4000, 25], far=[-30000, 30000, -30000, 30000, 500]),
        shares={1: .25, 2: .22, 3: .25, 4: .15, 5: .03, 6: .10},
        spiral=dict(axis=15, windings=5, depth0=32, court=46, street=7, ratio=1.25, mouthExtra=18),
        why_axis='the mouth (+e2) due north, down to the shore and the weirs; the arms along the contour within 6 degrees '
                 '(the bluff falls 11 % to the north: the long arms run level, the cross arms climb, every block on a plinth)',
        ley=dict(to=RELIQ_E, name='the east reliquary', stone=58),
        court=dict(nest='lz-nest'),
        pools=dict(w0=[['lz-warren', 1]], w1=[['lz-warren', 5], ['lz-tower', 3]], w2=[['lz-makers', 1]], w3=[['lz-longhouse', 1]], w4=[['lz-lodge', 1]]),
        gaps=dict(w0=[2.2, 4.2], w1=[3.2, 6.2], w2=[4.2, 8.2], w3=[12.0, 20.0], w4=[18.0, 30.0]),
        wells=[1, 2, 2, 2, 2],
        specials=[['gl-tank', 0, 0, 0.52, 2.2], ['lz-seer', 0, 1, 0.45, 2.0], ['lz-medicine', 0, 2, 0.38, 1.8], ['lz-obelisk', 0, 3, 0.55, 2.0],
                  ['lz-hall-bronze', 2, 0, 0.35, 2.0], ['lz-hall-reed', 2, 1, 0.62, 2.0], ['lz-hall-bone', 2, 2, 0.38, 2.0], ['lz-warehouse', 2, 3, 0.60, 2.0],
                  ['lz-granary', 3, 0, 0.30, 2.2], ['lz-granary', 3, 2, 0.34, 2.2], ['lz-granary', 3, 3, 0.66, 2.2],
                  ['lz-barracks', 4, 1, 0.35, 2.4], ['lz-barracks', 4, 3, 0.65, 2.4]],
        mouth=dict(muster=True, tents=['lc-seer', 'lc-sail', 'lc-hide', 'lc-shield', 'lc-hide']),
        fields=dict(dir=[1.0, 0.0], r0=800, r1=3600, w=110, d=70, half=6, crops=['bamboo-rice', 'taro', 'shade-manioc'],
                    farms=5, windmills=1, maxSlope=0.16, gaps=30, circle=True),
        cisterns=0,
        lake=dict(name='The eastern terminal sea', level=-2600.5, band=16, field=0.08, label='the eastern terminal sea (salt; no tide)'),
        sites=[dict(key='lz-weir', x=-320, z=-1560, ry=0, kind='works', name='fishing weir and drying racks', wet=True),
               dict(key='lz-weir', x=60, z=-1600, ry=0, kind='works', name='fishing weir and drying racks', wet=True),
               dict(key='lz-weir', x=440, z=-1560, ry=0, kind='works', name='fishing weir and drying racks', wet=True)],
        resolve=[dict(key='lz-placer', kind='tin', n=3, r=1500, at=[11640, -2400], why='the placer washing floors on Kruk Warra (r088, 51 m3/s), 11.9 km east: '
                      'the geology\'s placer (870.82,1615.8: gold high, tin medium); KRES.near on the river\'s gravel within 1.5 km of it')],
        hamlet=dict(id='komodo.placers', focus='mine', site=[11400, -2200], workers=90, popMax=180,
                    why='the placer camp on Kruk Warra, the near grid run east 13.5 km along the shore to hold it'),
        expect=dict(people=3000, wells=12, keys=['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-weir', 'lz-placer'], lake=True, hamlet=True),
        look=dict(hour=9.4, dens=2.2, fog=0.000060),
        layers=['ground.redsoil', 'ground.brown_mud_02', 'ground.damp_beach_sand', 'ground.tilled'],
        views=[dict(name='Overview', at=[0, 0], from_=[-600, 380, 860]), dict(name='The nest hall', at=[0, 0], from_=[60, 26, 70]),
               dict(name='The shore and the weirs', at=[60, -1500], from_=[-200, 60, 260]), dict(name='The placers on Kruk Warra', at=[11400, -2300], from_=[-160, 70, 160])],
        sheet=7600, sheet_centre=[4500, -600])
    # ---- IGUANA: the capital's granary on the Pile's plateau; the watch on Loj Nahn
    S['iguana'] = dict(
        key='iguana', name='Iguana', prefix='ig', pin=[713, 1569], pinId=None, people=3000, seed=8501,
        build=dict(near=[-5000, 5000, -5000, 5000, 20], far=[-30000, 30000, -30000, 30000, 500]),
        shares={1: .22, 2: .15, 3: .40, 4: .10, 5: .03, 6: .10},
        spiral=dict(axis=105, windings=5, depth0=44, court=52, street=7, ratio=1.25, mouthExtra=24),
        why_axis='the mouth (+e2) due east, toward the Pile (14.6 km) and the watch on Loj Nahn; the ground is flat (0.3 %), '
                 'so the axis is free',
        ley=dict(to=RELIQ_E, name='the east reliquary', stone=58),
        court=dict(nest='lz-nest'),
        pools=dict(w0=[['lz-warren', 1]], w1=[['lz-warren', 4], ['lz-tower', 2]], w2=[['lz-makers', 1]], w3=[['lz-longhouse', 1]], w4=[['lz-longhouse', 2], ['lz-lodge', 1]]),
        gaps=dict(w0=[2.4, 4.6], w1=[3.6, 7.0], w2=[5.0, 9.0], w3=[14.0, 24.0], w4=[16.0, 28.0]),
        wells=[1, 2, 2, 3, 3],
        specials=[['gl-tank', 0, 0, 0.52, 2.2], ['lz-seer', 0, 1, 0.45, 2.0], ['lz-medicine', 0, 2, 0.38, 1.8], ['lz-obelisk', 0, 3, 0.55, 2.0],
                  ['lz-hall-bronze', 2, 0, 0.35, 2.0], ['lz-hall-reed', 2, 1, 0.62, 2.0], ['lz-hall-bone', 2, 2, 0.38, 2.0], ['lz-warehouse', 2, 3, 0.60, 2.0],
                  ['lz-barracks', 4, 1, 0.35, 2.4]],
        mouth=dict(muster=True, tents=['lc-seer', 'lc-sail']),
        fields=dict(dir=[-1.0, 0.0], r0=1500, r1=4600, w=140, d=90, half=14, crops=['rice', 'helix-bean', 'sweet-potato', 'ashroot'],
                    farms=11, windmills=7, maxSlope=0.10, gaps=12, circle=True),
        cisterns=0,
        granary=dict(n=27, at=[-1250, 0], step=26, why='the Great Granary (after Mohenjo-daro\'s): 27 granary halls, a squared spiral of them, '
                                                          'between the town and its fields; ~100 t a hall, the capital\'s 2,600 t'),
        lookouts=[[2600, -400], [3700, 300], [4700, -200]],
        sites=[],
        hamlet=dict(id='iguana.farm', focus='farming', site=[-3000, 1400], workers=110, popMax=210),
        expect=dict(people=3000, wells=14, keys=['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-granary', 'lz-lookout', 'lz-windmill'], lake=False, hamlet=True),
        look=dict(hour=9.0, dens=1.7, fog=0.000030),
        layers=['ground.grass.lush', 'ground.dirt', 'ground.tilled', 'ground.terrace.field'],
        views=[dict(name='Overview', at=[0, 0], from_=[-800, 460, 900]), dict(name='The nest hall', at=[0, 0], from_=[60, 26, 70]),
               dict(name='The Great Granary', at=[-1250, 0], from_=[-160, 70, 160]), dict(name='The watch on the Pile', at=[2600, -400], from_=[-60, 30, 60])],
        sheet=6000, sheet_centre=[600, 0])
    # ---- THE TUBES: a cavern town in the Rift line's ruined station (core/city/cavern, not the surface builder)
    S['tubes'] = dict(
        key='tubes', name='the Tubes', prefix='tw', pin=[608, 1547], pinId='sa8xk6pimb', people=1000, seed=8601,
        build=dict(near=[-4000, 4000, -4000, 4000, 20], far=[-30000, 30000, -30000, 30000, 500]),
        shares={1: .30, 2: .25, 3: .20, 4: .12, 5: .05, 6: .08},
        cavern=True,
        ley=dict(to=RELIQ_W, name='the west reliquary', stone=40),
        sheet=4200)
    return S

# ------------------------------------------------------------------------------------------------ a spec's geometry
def frame(spec):
    cell, bil = BL.model_reader()
    pin = spec['pin']
    def H(x, z):        # page frame: x east, z south
        return bil(pin[0] + x / 2000.0, pin[1] + z / 2000.0, 0)
    def W(x, z):
        return bil(pin[0] + x / 2000.0, pin[1] + z / 2000.0, 1)
    return H, W, cell

def spiral(spec, H):
    sp = spec['spiral']
    if sp.get('axis') is not None:
        th1 = math.radians(sp['axis'])
    else:
        gx0 = (H(120, 0) - H(-120, 0)) / 240; gz0 = (H(0, 120) - H(0, -120)) / 240
        th1 = 0.0 if abs(gx0) + abs(gz0) < 1e-4 else math.atan2(-gx0, gz0)
    e1 = (math.cos(th1), math.sin(th1)); th2 = th1 - math.radians(105); e2 = (math.cos(th2), math.sin(th2))
    def sk(a, b): return (a * e1[0] + b * e2[0], a * e1[1] + b * e2[1])
    Wn, R = sp['windings'], sp['court']; P0 = sp['depth0'] / SIN75; C = P0 / (Q ** 4 - 1)
    NSEG, LAST = 4 * Wn + 6, 4 * Wn + 3
    def rAt(m): return R if m < 0 else R + C * (Q ** (m + 1) - 1)
    cur = [-R, -R]; pts = [tuple(cur)]
    for m in range(NSEG):
        s = m % 4; rm = rAt(m) if m <= LAST else rAt(LAST) + sp.get('mouthExtra', 18)
        if s == 0: cur = [rm, cur[1]]
        elif s == 1: cur = [cur[0], rm]
        elif s == 2: cur = [-rm, cur[1]]
        else: cur = [cur[0], -rm]
        pts.append(tuple(cur))
    street = [sk(a, b) for a, b in pts]
    depths = [r1((rAt(4 * w + 3) - rAt(4 * w - 1)) * SIN75) for w in range(Wn)]
    # the blocks between the arms, as 82-lzv-site.js cuts them (kerbs off both streets)
    KS = (sp.get('street', 7) / 2 + 1.2) / SIN75; blocks = []
    for w in range(Wn):
        for s in range(4):
            m = 4 * w + s; rIn, rOut = rAt(m - 1) + KS, rAt(m + 3) - KS
            tLo, tHi = -(rAt(m - 2) if m >= 2 else R) + KS, rAt(m) - KS
            if s == 0: q = [(tLo, -rIn), (tHi, -rIn), (tHi, -rOut), (tLo, -rOut)]
            elif s == 1: q = [(rIn, tLo), (rIn, tHi), (rOut, tHi), (rOut, tLo)]
            elif s == 2: q = [(-tLo, rIn), (-tHi, rIn), (-tHi, rOut), (-tLo, rOut)]
            else: q = [(-rIn, -tLo), (-rIn, -tHi), (-rOut, -tHi), (-rOut, -tLo)]
            blocks.append(dict(w=w, s=s, poly=[sk(a, b) for a, b in q]))
    outerR = rAt(LAST) + 30
    mouth = street[-1]
    return dict(e1=e1, e2=e2, street=street, depths=depths, outerR=outerR, mouth=mouth, blocks=blocks,
                axis_deg=r1(math.degrees(th1)), court=[sk(-R, -R), sk(R, -R), sk(R, R), sk(-R, R)],
                hull=[sk(-rAt(LAST - 1), -rAt(LAST - 3)), sk(rAt(LAST - 2), -rAt(LAST - 3)), sk(rAt(LAST - 2), rAt(LAST - 1)), sk(-rAt(LAST - 1), rAt(LAST - 1))])

def lay(spec):
    """The spec's derived sites: the cisterns, the Great Granary, the lookouts, the ley stone, the muster; the spiral."""
    H, W, cell = frame(spec)
    out = dict(sites=list(spec.get('sites', [])))
    if spec.get('cavern'):
        return out, H, W, None
    G = spiral(spec, H)
    u, dist, brg = bearing_to(spec['pin'], spec['ley']['to'])
    out['ley'] = dict(unit=[round(u[0], 4), round(u[1], 4)], distM=round(dist), bearing_deg=r1(brg), stone=[r1(u[0] * spec['ley']['stone']), r1(u[1] * spec['ley']['stone'])])
    e2 = G['e2']; mp = G['mouth']
    out['muster'] = [r1(mp[0] + e2[0] * 38), r1(mp[1] + e2[1] * 38)]
    if spec.get('cisterns'):
        mouth_ang = math.atan2(e2[1], e2[0])
        for (x, z) in ring(spec['cisterns'], G['outerR'] + 70, mouth_ang + math.pi / spec['cisterns'], skip=(mouth_ang, 0.35)):
            out['sites'].append(dict(key='lz-cistern', x=r1(x), z=r1(z), ry=0, kind='works', name='a sunken brick cistern (the dry season)'))
    if spec.get('granary'):
        g = spec['granary']
        for (x, z) in squared_spiral(g['n'], g['step']):
            out['sites'].append(dict(key='lz-granary', x=r1(g['at'][0] + x), z=r1(g['at'][1] + z), ry=0, kind='granary', name='a hall of the Great Granary'))
    for (x, z) in spec.get('lookouts', []):
        out['sites'].append(dict(key='lz-lookout', x=x, z=z, ry=r1(math.atan2(1, 0)), kind='lookout', name='a lookout on the Pile (the watch on Loj Nahn)'))
    return out, H, W, G

# ------------------------------------------------------------------------------------------------ the spec file
def spec_json(spec, L, G, H):
    pin = spec['pin']; ppl = census(spec['people'], spec['shares'])
    j = {'_': 'Proposed for %s (kits/lizardmen/settle/towns_plan.py; settlements/%s/PLAN.md). Page frame: x east, z SOUTH, metres from the pin. '
              'GUIDE.md section 4 turns this into src/81-%s-spec.js (var LZV_SPEC). Keys starting with _ are the plan\'s notes, not the spec\'s.' % (spec['name'], spec['key'], spec['prefix']),
         '_pin': dict(px=pin, id=spec.get('pinId'), model_m=r1(H(0, 0)), build=spec['build']),
         '_census': {B_CASTE[c]: n for c, n in ppl.items()}}
    if spec.get('cavern'):
        j.update(key=spec['key'], name=spec['name'], seed=spec['seed'], ley=dict(to=spec['ley']['to'], name=spec['ley']['name'], stone=spec['ley']['stone']),
                 expect=dict(people=spec['people']))
        j['_cavern'] = CAVERN
        return j
    keep = ('key', 'name', 'seed', 'spiral', 'ley', 'court', 'pools', 'gaps', 'wells', 'specials', 'mouth', 'fields', 'lake', 'hamlet', 'expect', 'look', 'layers')
    for k in keep:
        if k in spec: j[k] = spec[k]
    j['spiral'] = {k: v for k, v in spec['spiral'].items()}
    j['_spiral'] = dict(axis_deg=G['axis_deg'], why=spec.get('why_axis'), winding_depths_m=G['depths'], outer_radius_m=r1(G['outerR']), mouth=[r1(G['mouth'][0]), r1(G['mouth'][1])])
    j['_ley'] = L['ley']
    j['_muster'] = L['muster']
    j['sites'] = L['sites']
    if spec.get('resolve'): j['_resolve'] = spec['resolve']
    j['views'] = [dict(name=v['name'], at=v['at'], **{'from': v['from_']}) for v in spec['views']]
    if spec.get('hamlet') and isinstance(spec['hamlet'].get('site'), str):
        j['hamlet'] = dict(spec['hamlet']); j['_hamlet_note'] = 'site, link and resource come from the copper node KRES gives (GUIDE.md 4.3)'
    return j

B_CASTE = {1: 'Tenders', 2: 'Makers', 3: 'Drovers', 4: 'Line warriors', 5: 'Interpreters', 6: 'Bulwarks'}

# the Tubes' cavern, from the scale model's tubes.json (tube_rift_08, cav_the_tubes) in the page frame
def cavern_geom(spec):
    with open(os.path.join(MODEL, 'tubes.json'), encoding='utf-8') as fh:
        T = json.load(fh)
    t = [x for x in T if x.get('id') == 'tube_rift_08'][0]
    cav = [c for c in t['caverns'] if c['id'] == 'cav_the_tubes'][0]
    pin = spec['pin']
    pts = [[r1((x - pin[0]) * 2000), r1((y - pin[1]) * 2000)] for x, y in t['px']]
    return dict(tube=dict(id=t['id'], name=t['name'], width_m=t['width_m'], height_m=t['height_m'], depth_m=t['depth_m'], rock=t['rock'], pts=pts),
                hall=dict(id=cav['id'], kind=cav['kind'], span_m=cav['span_m'], height_m=cav['height_m'], skylight_m=cav['skylight_m'], at=[0, 0]))
CAVERN = None

# ------------------------------------------------------------------------------------------------ the site sheet
C_SITE = {'works': (150, 120, 80), 'granary': (176, 140, 70), 'lookout': (150, 42, 42), 'well': (60, 120, 220)}

def sheet(spec, L, G, H, W):
    ext = spec['sheet']; cu, cvz = spec.get('sheet_centre', [0, 0])
    R = (cu - ext, cu + ext, -cvz - ext, -cvz + ext)            # u, v (north up)
    fw = lambda u, v: W(u, -v)
    fh = lambda u, v: H(u, -v)
    fills = BB.water_cells(fw, *BB.square(R), max(20.0, ext / 80.0))
    lines = []
    base = round(H(0, 0) / 25) * 25
    for k in range(-12, 13):
        lv = base + 25 * k
        segs = BL.contours(fh, R[0], R[1], R[2], R[3], max(40.0, ext / 60.0), lv)
        for l in BL.chain(segs, 2):
            lines.append((l, (150, 130, 110) if k % 4 else (110, 90, 70), 1 if k % 4 else 2))
    with open(os.path.join(MODEL, 'rivers.json'), encoding='utf-8') as fh_:
        RV = json.load(fh_)
    pin = spec['pin']; texts = []
    for r in RV:
        pts = [((x - pin[0]) * 2000, -(y - pin[1]) * 2000) for x, y in r.get('px') or []]
        mouth = (r.get('to') or {}).get('at_px')
        if mouth: pts.append(((mouth[0] - pin[0]) * 2000, -(mouth[1] - pin[1]) * 2000))
        if any(R[0] - 2000 < x < R[1] + 2000 and R[2] - 2000 < y < R[3] + 2000 for x, y in pts):
            lines.append((pts, (40, 110, 210), 3 if r.get('perennial') else 2))
            mid = min(pts, key=lambda q: abs(q[0] - cu) + abs(q[1] + cvz))
            texts.append((mid[0] + 80, mid[1], '%s (%s, %s m3/s)' % (r.get('name'), 'perennial' if r.get('perennial') else 'a wadi', r.get('q_mouth_m3s')), (40, 110, 210), 20))
    rooms = []; n = 1
    def PR(name, kind, pts, note, fill):
        nonlocal n
        rooms.append(BB.PR(n, name, kind, [(x, -z) for x, z in pts], 2, note, fill=fill)); n += 1
    def box(x, z, w, d):
        return [(x - w / 2, z - d / 2), (x + w / 2, z - d / 2), (x + w / 2, z + d / 2), (x - w / 2, z + d / 2)]
    over = []
    if spec.get('cavern'):
        cg = CAVERN
        tp = cg['tube']['pts']
        lines.append(([(x, -z) for x, z in tp], (60, 60, 60), 6))
        hw, hd = cg['hall']['span_m']
        PR('The bottle hall (cav_the_tubes)', 'hall', box(0, 0, hw, hd), '%d x %d m, %d m high, a %d m skylight: the town\'s heart (PLAN.md 4)' % (hw, hd, cg['hall']['height_m'], cg['hall']['skylight_m']), (230, 214, 176))
        texts.append((tp[0][0] + 60, -tp[0][1], 'the tube north-east (24 m wide, 16 m high, 40 m down)', (60, 60, 60), 20))
        texts.append((tp[-1][0] + 60, -tp[-1][1], 'the tube south-west', (60, 60, 60), 20))
    else:
        lines.append(([(x, -z) for x, z in G['street']], (190, 60, 50), 3))
        PR('The village (the spiral\'s hull)', 'city', G['hull'], '%d windings, %s m deep, each 1.25 times the last; axis %.0f deg (x,z); the mouth +e2' % (spec['spiral']['windings'], ' -> '.join('%.0f' % d for d in G['depths']), G['axis_deg']), (240, 232, 214))
        PR('The nest court', 'court', G['court'], 'the nest hall, the bells, the paired and the turned stelae', (244, 224, 214))
        mx, mz = L['muster']
        PR('The mustering ground (the mouth)', 'military', box(mx, mz, 38, 38), 'lz-muster and the camp\'s tents (%s)' % ', '.join(spec['mouth']['tents']), (150, 42, 42))
        lu = L['ley']['unit']
        lines.append(([(0, 0), (lu[0] * ext * 2, -lu[1] * ext * 2)], (0, 140, 70), 2))
        texts.append((lu[0] * ext * 0.55 + 40, -lu[1] * ext * 0.55, 'the ley line: %s, %.0f km at %.0f deg' % (spec['ley']['name'], L['ley']['distM'] / 1000, L['ley']['bearing_deg']), (0, 140, 70), 20))
        FD = spec.get('fields')
        if FD:
            fu = FD['dir']; fv = [-fu[1], fu[0]]; hw = FD['w'] * (FD['half'] + 0.5)
            a, b = FD['r0'], FD['r1']
            pts = [(fu[0] * a + fv[0] * hw, fu[1] * a + fv[1] * hw), (fu[0] * b + fv[0] * hw, fu[1] * b + fv[1] * hw), (fu[0] * b - fv[0] * hw, fu[1] * b - fv[1] * hw), (fu[0] * a - fv[0] * hw, fu[1] * a - fv[1] * hw)]
            PR('The fields (where flat enough)', 'garden', pts, '%s; %d farms, %d windmills; slope under %.0f %%' % (', '.join(FD['crops']), FD['farms'], FD['windmills'], FD['maxSlope'] * 100), (214, 234, 196))
        groups = {}
        for s in L['sites']:
            groups.setdefault(s['key'], []).append(s)
        for key, ss in groups.items():
            fp = BL.KIT.get(key, dict(w=14, d=14))
            first = ss[0]
            PR('%s (x%d)' % (first.get('name', key), len(ss)) if len(ss) > 1 else first.get('name', key), 'works', box(first['x'], first['z'], max(fp['w'], 30), max(fp['d'], 30)), '`%s`' % key, C_SITE.get(first.get('kind'), (120, 110, 100)))
            for s in ss[1:]:
                over.append(([(x, -z) for x, z in box(s['x'], s['z'], max(fp['w'], 30), max(fp['d'], 30))], C_SITE.get(s.get('kind'), (120, 110, 100)), (40, 40, 40)))
        hm = spec.get('hamlet')
        if hm and not isinstance(hm.get('site'), str):
            PR('The outwork (%s, core/hamlet)' % hm['focus'], 'works', box(hm['site'][0], hm['site'][1], 260, 200), hm.get('why', 'the Lizardmen row, focus %s' % hm['focus']), (226, 214, 196))
        for rs in spec.get('resolve', []):
            if rs.get('at'):
                PR('%s (x%d), resolved on the page' % (rs['key'], rs['n']), 'works', box(rs['at'][0], rs['at'][1], 300, 300), rs['why'], (200, 180, 140))
    title = 'Country sheet: %s (5.1 px %g,%g; %s m)' % (spec['name'], spec['pin'][0], spec['pin'][1], format(round(H(0, 0)), ','))
    sub = SUBS[spec['key']]
    F = dict(id='site', R=ext, rect=R, title=title, sub=sub, rooms=rooms, fills=fills, overfills=over, lines=lines, texts=texts, bar=500 if ext > 3000 else 200,
             axisnote='north up; x east, v north (the page\'s z is south: z = -v), metres from the pin',
             key=[(BB.C_SEA, 'water (the model\'s mask)'), ((150, 130, 110), 'contours every 25 m (bold every 100 m)'), ((40, 110, 210), 'rivers'), ((190, 60, 50), 'the spiral street'), ((0, 140, 70), 'the ley line')])
    return F

C_WIND = [(198, 222, 182), (214, 204, 232), (238, 214, 172), (222, 202, 178), (236, 188, 184), (220, 220, 220)]
WIND_NOTE = {'tuatara': ['Tenders (warrens), the tank, the seer, the medicine hut', 'Tenders and Interpreters (towers)', 'Makers; the bronze, reed and bone halls, the warehouse',
                         'Drovers (long houses); five granaries', 'Line warriors and Bulwarks (lodges); three barracks: the raiders'],
             'komodo': ['Tenders (warrens), the tank, the seer, the medicine hut', 'Tenders and Interpreters (towers)', 'Makers; the halls, the warehouse',
                        'Drovers (long houses: the fishers and the rice); three granaries', 'Line warriors and Bulwarks (lodges); two barracks'],
             'iguana': ['Tenders (warrens), the tank, the seer, the medicine hut', 'Tenders and Interpreters (towers)', 'Makers; the halls, the relic warehouse',
                        'Drovers (long houses)', 'Drovers and the lodges; one barracks']}

def tube_frame(cg):
    """The tube's direction through the pin (from its points either side), and its normal, in the page frame."""
    p = cg['tube']['pts']; i = min(range(len(p)), key=lambda k: abs(p[k][0]) + abs(p[k][1]))
    a, b = p[max(0, i - 1)], p[min(len(p) - 1, i + 1)]
    dx, dz = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dz)
    t = (dx / L, dz / L); return t, (-t[1], t[0])

def tubes_layout(cg):
    """The Tubes' plan in the page frame (PLAN.md section 4): the hall, the two arms of the tube, the side tubes, the
    station's ruin, the portals. Boxes along the tube: (name, from, to (m along the tube, + south-west), half width, side
    offset, note, fill)."""
    t, n = tube_frame(cg); hw = cg['tube']['width_m'] / 2
    def strip(s0, s1, h, off=0.0):
        return [(t[0] * s0 + n[0] * (off - h), t[1] * s0 + n[1] * (off - h)), (t[0] * s1 + n[0] * (off - h), t[1] * s1 + n[1] * (off - h)),
                (t[0] * s1 + n[0] * (off + h), t[1] * s1 + n[1] * (off + h)), (t[0] * s0 + n[0] * (off + h), t[1] * s0 + n[1] * (off + h))]
    Lh, Wh = cg['hall']['span_m']
    Z = [('The bottle hall: the nest hall at its centre, under the skylight; a squared spiral of two windings round it on the floor (Tenders\' warrens, Interpreters\' towers, the seer\'s hall, the bells)', strip(-Lh / 2, Lh / 2, Wh / 2), (232, 216, 180)),
         ('The north-east arm: the Makers\' and Drovers\' cells cut into both walls of the tube, 600 m, every door facing back up the tube to the hall', strip(-Lh / 2 - 600, -Lh / 2, hw), (238, 214, 172)),
         ('The side tubes: seven fungus beds (lz-fungus) in the dark, off the north-east arm', None, (190, 200, 170)),
         ('The south-west arm: the station\'s ruin (station 8 of the Rift line): its platforms and a wrecked train, the relic store', strip(Lh / 2, Lh / 2 + 220, hw), (200, 196, 190)),
         ('The south-west arm beyond: the lodges of the warriors and Bulwarks, the barracks', strip(Lh / 2 + 220, Lh / 2 + 520, hw), (236, 188, 184)),
         ('The portals: where a collapsed roof opens the tube to the ridge, a ramp up; a lookout and the mustering ground at the north-east one', None, (150, 42, 42))]
    sides = []
    for k in range(7):
        s = -Lh / 2 - 60 - k * 80; sg = 1 if k % 2 else -1
        sides.append([(t[0] * s + n[0] * sg * hw, t[1] * s + n[1] * sg * hw), (t[0] * (s - 14) + n[0] * sg * hw, t[1] * (s - 14) + n[1] * sg * hw),
                      (t[0] * (s - 14) + n[0] * sg * (hw + 70), t[1] * (s - 14) + n[1] * sg * (hw + 70)), (t[0] * s + n[0] * sg * (hw + 70), t[1] * s + n[1] * sg * (hw + 70))])
    portals = [strip(-Lh / 2 - 640, -Lh / 2 - 600, hw + 8), strip(Lh / 2 + 520, Lh / 2 + 560, hw + 8)]
    return Z, sides, portals, t, n

def village(spec, L, G, H, W):
    """The village sheet: the spiral, its blocks by winding, its court, its mouth and the sites near it."""
    fw = lambda u, v: W(u, -v); fh = lambda u, v: H(u, -v)
    rooms = []; over = []; lines = []; texts = []; num = [1]
    def PR(name, kind, pts, note, fill):
        rooms.append(BB.PR(num[0], name, kind, [(x, -z) for x, z in pts], 2, note, fill=fill)); num[0] += 1
    def box(x, z, w, d):
        return [(x - w / 2, z - d / 2), (x + w / 2, z - d / 2), (x + w / 2, z + d / 2), (x - w / 2, z + d / 2)]
    if spec.get('cavern'):
        ext = 900.0; R = (-ext, ext, -ext, ext)
        Z, sides, portals, t, n = tubes_layout(CAVERN)
        tp = CAVERN['tube']['pts']
        lines.append(([(x, -z) for x, z in tp], (90, 90, 90), 2))
        for name, pts, fill in Z:
            if pts: PR(name.split(':')[0], 'cavern', pts, name, fill)
            elif 'side tubes' in name:
                PR('The side tubes (x7)', 'cavern', sides[0], name, fill)
                for q in sides[1:]: over.append(([(x, -z) for x, z in q], fill, (40, 40, 40)))
            else:
                PR('The portals (x2)', 'entrance', portals[0], name, fill)
                over.append(([(x, -z) for x, z in portals[1]], fill, (40, 40, 40)))
        lu = bearing_to(spec['pin'], spec['ley']['to'])[0]
        lines.append(([(0, 0), (lu[0] * ext * 2, -lu[1] * ext * 2)], (0, 140, 70), 2))
        texts.append((lu[0] * 300 + 30, -lu[1] * 300, 'the ley line (up the skylight\'s shaft and out): the west reliquary', (0, 140, 70), 20))
        fills = []
        sub = ('The town in its lava tube, 40 m under the ridge (PLAN.md section 4): the bottle hall at the pin and the tube\'s two arms, drawn along the model\'s tube_rift_08 (24 m wide, 16 m high). '
               'The surface (the ridge, the fields, the skylight\'s rim) is the country sheet\'s. Contours of the ridge above, every 5 m.')
    else:
        ext = G['outerR'] + 420; R = (-ext, ext, -ext, ext)
        fills = BB.water_cells(fw, *BB.square(R), 10.0)
        for b in G['blocks']:
            fills.append(([(x, -z) for x, z in b['poly']], C_WIND[b['w']]))
        fills.append(([(x, -z) for x, z in G['court']], (244, 224, 214)))
        lines.append(([(x, -z) for x, z in G['street']], (190, 60, 50), 3))
        for w in range(spec['spiral']['windings']):
            b = [q for q in G['blocks'] if q['w'] == w][0]
            PR('Winding %d (%.0f m deep)' % (w, G['depths'][w]), 'district', b['poly'], WIND_NOTE[spec['key']][w], C_WIND[w])
        PR('The nest court', 'court', G['court'], 'the nest hall (lz-nest), the bells, the paired and the turned stelae; every door in the spiral faces it', (244, 224, 214))
        mx, mz = L['muster']
        PR('The mustering ground at the mouth', 'military', box(mx, mz, 38, 38), 'lz-muster, the camp (%s), a lookout' % ', '.join(spec['mouth']['tents']), (150, 42, 42))
        sx, sz = L['ley']['stone']
        PR('The ley stone (lz-ley)', 'monument', box(sx, sz, 8, 8), 'the one straight thing: aimed at %s, %.0f km at %.0f deg' % (spec['ley']['name'], L['ley']['distM'] / 1000, L['ley']['bearing_deg']), (0, 140, 70))
        lu = L['ley']['unit']
        lines.append(([(0, 0), (lu[0] * ext * 2, -lu[1] * ext * 2)], (0, 140, 70), 2))
        groups = {}
        for s in L['sites']:
            if abs(s['x']) < ext and abs(s['z']) < ext: groups.setdefault(s['key'], []).append(s)
        for key, ss in groups.items():
            fp = BL.KIT.get(key, dict(w=14, d=14)); first = ss[0]
            PR('%s (x%d)' % (first.get('name', key), len(ss)) if len(ss) > 1 else first.get('name', key), 'works', box(first['x'], first['z'], fp['w'], fp['d']), '`%s`' % key, C_SITE.get(first.get('kind'), (120, 110, 100)))
            for s in ss[1:]:
                over.append(([(x, -z) for x, z in box(s['x'], s['z'], fp['w'], fp['d'])], C_SITE.get(s.get('kind'), (120, 110, 100)), (40, 40, 40)))
        sub = ('The rhombic squared spiral 82-lzv-site.js lays from spec.json: %d windings, %s m deep (each 1.25 times the last), corners 75 and 105 degrees, the axis %.0f deg in the page frame, the mouth on +e2. '
               'Every block fronted on its inner street only, so every door faces the nest hall; the castes by winding (the key). Contours every 5 m.' % (spec['spiral']['windings'], ' -> '.join('%.0f' % d for d in G['depths']), G['axis_deg']))
    base = round(H(0, 0) / 5) * 5
    for k in range(-40, 41):
        lv = base + 5 * k
        for l in BL.chain(BL.contours(fh, R[0], R[1], R[2], R[3], ext / 70.0, lv), 2):
            lines.insert(0, (l, (170, 155, 140) if k % 5 else (120, 100, 80), 1))
    return dict(id='village', R=ext, rect=R, title='Village sheet: %s, the plan at the pin' % spec['name'], sub=sub, rooms=rooms, fills=fills, overfills=over, lines=lines, texts=texts,
                bar=100, axisnote='north up; x east, v north (the page\'s z is south: z = -v), metres from the pin',
                key=[(c, 'winding %d' % i) for i, c in enumerate(C_WIND[:5])] + [((190, 60, 50), 'the spiral street'), ((0, 140, 70), 'the ley line')] if not spec.get('cavern') else
                    [((232, 216, 180), 'the hall'), ((238, 214, 172), 'cells'), ((190, 200, 170), 'fungus beds'), ((200, 196, 190), 'the station'), ((236, 188, 184), 'lodges'), ((0, 140, 70), 'the ley line')])

SUBS = {
  'tuatara': 'The copper town on the volcanic savanna, the raiders nearest the Sultanate: a ground falling 5.3 % to the north-east, no perennial water within 40 km (Neet Gill, a wadi, 10 km), so wells, seven sunken cisterns and a great tank. The spiral\'s mouth faces north, toward the forts, with the mustering ground and the war camp; the fields south; the copper diggings wherever kits/resources puts the nodes within 6 km.',
  'komodo': 'The tin town at the far end of the eastern sea: a bluff falling 11 % to the shore 1-2 km north, 4,000 mm of rain. The spiral\'s long arms along the contour, every block on a plinth, its mouth down to the shore and the weirs; the fields east along the shore bench; the placer camp on Kruk Warra 11.9 km east, inside a near grid run east to hold it.',
  'iguana': 'The capital\'s granary on the Pile\'s plateau: flat (0.3 %), 1,992 mm, prime farmland. The spiral wide and open, its mouth east toward the Pile (14.6 km) with three lookouts on the way: the watch on Loj Nahn. The Great Granary west, between the town and its fields; the fields to the west, the windmills on their edge.',
  'tubes': 'A cavern town in the Rift line\'s ruined station (station 8, the Tubes): the model\'s basalt lava tube (tube_rift_08) runs north-east to south-west through the pin, and its bottle hall (220 x 150 m, 38 m high, a 25 m skylight) is the town\'s heart. Built on core/city/cavern as Loj Twenny is, not on the surface builder. The ridge falls 9.5 % to the north-west.'}

# ------------------------------------------------------------------------------------------------ main
def main(only=None):
    global CAVERN
    for key, spec in specs().items():
        if only and key not in only: continue
        if spec.get('cavern'): CAVERN = cavern_geom(spec)
        L, H, W, G = lay(spec)
        d = os.path.join(ROOT, 'settlements', key)
        os.makedirs(os.path.join(d, 'sheets'), exist_ok=True)
        with open(os.path.join(d, 'spec.json'), 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(spec_json(spec, L, G, H), fh, indent=1, ensure_ascii=False); fh.write('\n')
        img = B.draw_floor(BB.framed(sheet(spec, L, G, H, W)))
        img.save(os.path.join(d, 'sheets', 'country.png'), optimize=True)
        img = B.draw_floor(BB.framed(village(spec, L, G, H, W)))
        img.save(os.path.join(d, 'sheets', 'village.png'), optimize=True)
        print('wrote settlements/%s/spec.json, sheets/country.png and village.png (ground %.0f m; %s)' % (key, H(0, 0), ('depths ' + ' -> '.join('%.0f' % x for x in G['depths'])) if G else 'cavern'))

if __name__ == '__main__':
    main(sys.argv[1:] or None)
