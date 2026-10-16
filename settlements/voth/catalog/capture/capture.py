#!/usr/bin/env python3
"""Pull every structure out of a live Voth city build into the catalog.

    python3 capture/capture.py            # from voth/catalog

1. Builds an instrumented copy of the city (src/ fragments, same order as
   build.py) with hook-head.js at the top of BUILD(), a wrap for every
   structure builder listed in BUILDERS below, a __capFrag() marker at the
   head of every fragment, and an export at the end of BUILD(). The real
   voth.html is never touched.
2. Loads it in headless Chromium (three.js served locally), reads back the log
   of every primitive the city pushed and which builder call pushed it.
3. For each builder key, picks up to MAX_INST representative calls, re-expresses
   their primitives in the call's own frame (origin on the footprint, +z front,
   y = 0 at the lowest base), and joins in the decoration passes that run
   later over the same footprint (townFacade, compoundFacade, extra doors and
   windows) so a captured town house has its doors and windows.
4. Writes
     registry/voth-city-captured.data.js   the primitive records (data)
     registry/voth-city-captured.js        one ASSET per key, variants = calls
     CITY_INVENTORY.md                     every key: city count, source line,
                                           size, plus what was NOT captured

Anything the city builds as its own geometry instead of through push() (the
life layer's ships, barges, carts) is captured from the merged geometries at
the end of BUILD() as vertex-coloured triangle soups.
"""
import asyncio, functools, http.server, json, math, os, re, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
CAT = os.path.dirname(HERE)
VOTH = os.path.dirname(CAT)
SRC = os.path.join(VOTH, 'src')
OUT_HTML = os.path.join(HERE, 'voth-capture.html')
MAX_INST = 4

# name -> (frame expr, key expr or None, group, label)
#   frame expr is JS returning [x, z, ry] from args, or None for auto-frame
#   group: which catalog family the entry goes in
X = lambda xi, zi, ri: '__fXYZRY(%d,%d,%d)' % (xi, zi, ri)
CANTON = '__fCanton(0)'
RAY = 'function(a){ return [a[0] + a[2] * a[4] / 2, a[1] + a[3] * a[4] / 2, Math.atan2(a[2], a[3])]; }'
SEG = lambda a, b, c, d: '__fSeg(%d,%d,%d,%d)' % (a, b, c, d)
BUILDERS = {
    # --- cantons: the platforms and everything on them
    'platCanton':        (CANTON, "'canton_'+a[0].n", 'canton', 'Canton platform'),
    'monoCanton':        (CANTON, "'canton_'+a[0].n", 'canton', 'Monumental canton'),
    'ancestryCanton':    (CANTON, "'canton_'+a[0].n", 'canton', 'Ancestry canton'),
    'templeCanton':      (CANTON, None, 'religious', 'Temple canton top'),
    'ordinatorFortress': (CANTON, None, 'military', 'Ordinator fortress (the Lighthouse canton)'),
    'palaceArchitecture':(CANTON, None, 'civic', 'Palace architecture'),
    'portDeckV2':        (CANTON, None, 'civic', 'Port deck'),
    'portDeck':          (CANTON, None, 'civic', 'Port deck (v1)'),
    'arenaDeckSquare':   (CANTON, None, 'civic', 'Arena deck'),
    'arenaDeck':         (CANTON, None, 'civic', 'Arena deck (v1)'),
    'marketDeck':        (CANTON, None, 'civic', 'Market deck'),
    'gardenDeck':        (CANTON, None, 'civic', 'Garden deck'),
    'guildHallsDeck':    (CANTON, None, 'civic', 'Guild halls deck'),
    'cantonPiers':       (CANTON, "'cantonPiers_'+a[0].n", 'canton', 'Canton piers'),
    # --- bridges, causeways, stairs
    'span':              (SEG(0, 1, 3, 4), None, 'bridge', 'Canton span (bridge)'),
    'reclaimedCauseway': (SEG(0, 1, 2, 3), None, 'bridge', 'Reclaimed-land causeway'),
    'linkStair':         (SEG(0, 1, 3, 4), None, 'bridge', 'Link stair'),
    'seaStair':          (X(0, 1, 2), None, 'bridge', 'Sea stair'),
    'landing':           (X(1, 2, 3), None, 'bridge', 'Canton landing'),
    'plinthDoor':        (X(0, 1, -1), None, 'canton', 'Canton plinth door'),
    # --- walls, gates, towers
    'wallSegRender':     (SEG(0, 1, 2, 3), "'wallSeg_s'+a[4]", 'military', 'City wall segment'),
    'watchtower':        (X(0, 2, 3), "'watchtower_h'+a[4]", 'military', 'Wall watchtower'),
    'harborGate':        (X(0, 2, 3), None, 'military', 'Harbor Gate'),
    'spiritGate':        (X(0, 2, 3), None, 'military', 'Spirit Gate'),
    'riverGate':         (X(0, 2, 3), None, 'military', 'River Gate'),
    'wallGateRuinA':     (X(0, 2, 3), None, 'military', 'Ruined wall gate A'),
    'wallGateRuinB':     (X(0, 2, 3), None, 'military', 'Ruined wall gate B'),
    'wallGateRuinC':     (X(0, 2, 3), None, 'military', 'Ruined wall gate C'),
    'wallSegmentBasalt': (X(0, 2, 3), None, 'military', 'Basalt wall segment'),
    'funeraryGate':      (X(0, 2, 3), None, 'funerary', 'Necropolis gate'),
    # --- funerary
    'grave':             (X(0, 2, 3), None, 'funerary', 'Grave'),
    'familyTomb':        (X(0, 2, 3), None, 'funerary', 'Family tomb'),
    'wallNicheTomb':     (X(0, 2, 3), None, 'funerary', 'Wall-niche tomb'),
    'steppedTomb':       (X(0, 2, 3), None, 'funerary', 'Stepped tomb'),
    'funeraryTemple':    (X(0, 2, 3), None, 'funerary', 'Funerary temple'),
    # --- civic, trade, services
    'tavern':            (X(0, 2, 3), None, 'tavern', 'Tavern'),
    'houseOfHealing':    (X(0, 2, 3), None, 'civic', 'House of Healing'),
    'customsHouse':      (X(0, 2, 3), None, 'civic', 'Customs house'),
    'buildGuildRowHall': (X(1, 2, 4), "'guildHall_'+(a[0]&&a[0].name)", 'guild', 'Guild row hall'),
    'stallGoods':        (X(0, 1, 5), "'stall_'+a[6]", 'shop', 'Market stall goods'),
    'siltStriderStation':(X(0, 2, 3), None, 'civic', 'Elephant bug station'),
    'striderStationBuild':('__fObj(0)', None, 'civic', 'Elephant bug station (built)'),
    # --- farm, industry
    'granary':           (X(0, 2, 3), None, 'rural', 'Granary'),
    'windmill':          (X(0, 2, 3), None, 'rural', 'Windmill'),
    'watermill':         (X(0, 2, 3), None, 'rural', 'Watermill'),
    'beetleRanch':       (X(0, 2, 3), None, 'rural', 'Beetle ranch'),
    'shed':              (X(0, 2, 6), None, 'rural', 'Shed'),
    'mineEntrance':      (X(0, 1, -1), None, 'industrial', 'Mine entrance'),
    'quarryPit':         (X(0, 1, -1), None, 'industrial', 'Quarry pit'),
    'mushroomFarm':      (X(0, 1, 2), None, 'rural', 'Mushroom farm'),
    # --- monastery
    'monasteryCompound': (X(0, 1, 2), None, 'religious', 'Monastery compound'),
    'monasteryChapel':   (X(0, 2, 6), None, 'religious', 'Monastery chapel'),
    'monasteryDorm':     (X(0, 2, 6), None, 'religious', 'Monastery dormitory'),
    'monasteryAssemblyHall': (X(0, 1, 6), None, 'religious', 'Monastery assembly hall'),
    'monasteryWell':     (X(0, 2, 4), None, 'religious', 'Monastery well'),
    'monasteryCoop':     (X(0, 2, 5), None, 'rural', 'Monastery coop'),
    'monasteryPen':      (X(0, 2, 5), None, 'rural', 'Monastery pen'),
    # --- housing
    'townBuilding':      (None, None, 'housing', 'Town building'),
    'compound':          (X(0, 1, 4), None, 'housing', 'Walled compound'),
    'structure':         (X(0, 2, 6), "'structure_'+a[7]", 'housing', 'Base massing'),
    # --- monuments and street furniture
    'statue':            (X(0, 2, 3), None, 'monument', 'Statue'),
    'obelisk':           (X(0, 2, 3), None, 'monument', 'Obelisk'),
    'shrineTriptych':    (X(0, 2, 3), None, 'religious', 'Shrine triptych'),
    'lifeStandaloneShrine': (X(0, 1, 2), None, 'religious', 'Standalone shrine'),
    'lanternPost':       (X(0, 2, -1), None, 'street', 'Lantern post'),
    'brazierPlain':      (X(0, 2, 3), None, 'street', 'Brazier'),
    'brazierOrnate':     (X(0, 2, 3), None, 'street', 'Ornate brazier'),
    'benchPlain':        (X(0, 2, 3), None, 'street', 'Bench'),
    'benchOrnate':       (X(0, 2, 3), None, 'street', 'Ornate bench'),
    'lanternBracket':    (X(0, 2, 3), None, 'street', 'Lantern bracket'),
    'chinampaHut':       (X(0, 1, 2), None, 'rural', 'Chinampa hut'),
    'lifeBuildFerryPier':(RAY, None, 'bridge', 'Ferry pier'),
    'buildFishDockPier': (RAY, None, 'bridge', 'Fish-dock pier'),
    # --- inline loops (see EACH below)
    '__farmstead':       ('__fObj(0)', None, 'rural', 'Farmstead'),
    '__causeway':        (None, "'causeway_'+(a[0].c&&a[0].c.n)", 'bridge', 'Canton causeway'),
    '__market':          (None, None, 'shop', 'Market district (stall rows)'),
    # --- boats built as static props
    'canoe':             (X(0, 2, 3), None, 'vessel', 'Canoe'),
    'ferry':             (X(0, 2, 3), None, 'vessel', 'Ferry'),
}
# inline forEach loops worth capturing: (fragment, anchor text, wrapper name)
EACH = [
    ('60-land.js', 'FARMS.forEach(function(f){', '__farmstead'),
    ('50-cantons.js', 'CAUSEWAYS.forEach(function(cw){', '__causeway'),
    ('69-district-content.js', 'DIST_MARKET.forEach(function(d){', '__market'),
]


def match_brace(src, i):
    """index of the } matching the { at src[i], skipping strings and comments"""
    depth, n = 0, len(src)
    while i < n:
        ch = src[i]
        if ch in '\'"`':
            q = ch; i += 1
            while i < n and src[i] != q:
                i += 2 if src[i] == '\\' else 1
        elif src.startswith('//', i):
            i = src.find('\n', i)
        elif src.startswith('/*', i):
            i = src.find('*/', i) + 1
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: return i
        i += 1
    raise ValueError('unbalanced')


def wrap_each(body, anchor, name):
    k = body.find(anchor)
    if k < 0: return body, False
    fpos = body.find('function(', k)
    b0 = body.find('{', fpos)
    b1 = match_brace(body, b0)
    frame, key, _g, _l = BUILDERS[name]
    kf = ('function(a){ return %s; }' % key) if key else 'null'
    head = body[:fpos] + "__capWrap('%s', " % name
    return head + body[fpos:b1 + 1] + ', %s, %s)' % (frame or 'null', kf) + body[b1 + 1:], True


# wrapped only so their pushes are not "loose"; joined onto the building they decorate
DECORATORS = {
    'townFacade': '__fObj(0)', 'compoundFacade': '__fObj(0)', 'addDoor': X(0, 2, 3),
    'addWindows': X(0, 2, 3), 'slumAddition': '__fObj(0)', 'doorAwning': X(0, 1, 2),
    'wallWindow': X(0, 1, 2), 'guildHallWindows3': X(0, 2, 3), 'cantonHallWindows': X(0, 2, 3),
}
JOIN_INTO = {'townBuilding', 'compound', 'structure', 'tavern', 'houseOfHealing', 'granary',
             'customsHouse', 'buildGuildRowHall', 'monasteryDorm', 'monasteryChapel',
             'monasteryAssemblyHall', 'shed', 'beetleRanch', 'windmill', 'watermill'}
# life-layer merged geometries (not push()ed) — vessels and carts
GEOMS = {
    'lifeShipHullGeo': ('ship_junk', 'Junk (trading ship)'),
    'lifeGalleonHullGeo': ('ship_galleon', 'Galleon'),
    'lifeFerryHullGeo': ('ship_ferry', 'Ferry (life layer)'),
    'lifeTaxiHullGeo': ('ship_taxi', 'Water taxi'),
    'lifeRBargeHullGeo': ('ship_river_barge', 'River barge'),
    'lifePBargeHullGeo': ('ship_pleasure_barge', 'Pleasure barge'),
    'lifeDhowHullGeo': ('ship_dhow', 'Fishing dhow'),
    'lifeCaravanGeo': ('caravan_cart', 'Caravan cart'),
}


LINEMAP = []


def where(tok):
    if not tok.startswith('@') or not tok[1:].isdigit(): return tok
    n = int(tok[1:]); f0, l0 = '?', 1
    for l, f in LINEMAP:
        if l <= n: f0, l0 = f, l
    return '%s:%d' % (f0, n - l0 + (0 if f0.endswith('.js') else 1))


def fragments():
    order = sorted(f for f in os.listdir(SRC) if f[0].isdigit())
    return order, {f: open(os.path.join(SRC, f)).read() for f in order}


def defined(bodies):
    """name -> (file, line) for every top-level function declaration"""
    out = {}
    for f, b in bodies.items():
        for m in re.finditer(r'^function ([A-Za-z0-9_$]+)\s*\(', b, re.M):
            out.setdefault(m.group(1), (f, b[:m.start()].count('\n') + 1))
    return out


def build_capture_html():
    order, bodies = fragments()
    defs = defined(bodies)
    wraps = ['push = (function(orig){ return function(s,f,r){ __capPush(s,f,r); return orig(s,f,r); }; })(push);']
    wraps.append('''registerMillCluster = (function(orig){ return function(x,y,z,ry,n,len,w,t,spin,innerR,col){
  /* the sails are an animated InstancedMesh, not push()ed — log them at rest as beams */
  var tx=Math.sin(ry), tz=Math.cos(ry), ir=innerR||0;
  for(var i=0;i<n;i++){ var th=i*Math.PI*2/n, dx=tx*Math.sin(th), dy=Math.cos(th), dz=tz*Math.sin(th);
    __CAP.log.push(['beam','wood', x+dx*ir, y+dy*ir, z+dz*ir, x+dx*(ir+len), y+dy*(ir+len), z+dz*(ir+len), w, t, col||0xffffff]); }
  return orig.apply(this, arguments); }; })(registerMillCluster);''')
    missing = []
    for name, (frame, key, _g, _l) in BUILDERS.items():
        if name.startswith('__'): continue
        if name not in defs:
            missing.append(name); continue
        kf = ('function(a){ return %s; }' % key) if key else 'null'
        wraps.append("%s = __capWrap('%s', %s, %s, %s);" % (name, name, name, frame or 'null', kf))
    for name, frame in DECORATORS.items():
        if name in defs:
            wraps.append("%s = __capWrap('%s', %s, %s, null);" % (name, name, name, frame))
    head = open(os.path.join(HERE, 'hook-head.js')).read() + '\n' + '\n'.join(wraps) + '\n'
    tail = ['/* ==== CAPTURE HOOK (tail) ==== */', '__CAP.geoms = {};']
    for g in GEOMS:
        tail.append('''try { if(typeof %s !== 'undefined' && %s) { var _g = %s.index ? %s.toNonIndexed() : %s;
  __CAP.geoms['%s'] = { p: Array.from(_g.attributes.position.array), c: _g.attributes.color ? Array.from(_g.attributes.color.array) : null }; } } catch(e) {}''' % ((g,) * 6))
    tail.append('window.__CAP_DONE = true;')
    parts = []
    for f in order:
        b = bodies[f]
        if f == '00-head.html':
            b = b.replace("function BUILD(){\n'use strict';\n", "function BUILD(){\n'use strict';\n" + head, 1)
            assert head in b, 'BUILD() head not found'
        elif f.endswith('.js'):
            for ef, anchor, name in EACH:
                if ef == f:
                    k = b.find(anchor)
                    if k >= 0: defs[name] = (f, b[:k].count('\n') + 1)
                    b, ok = wrap_each(b, anchor, name)
                    if not ok: missing.append(name)
            b = "__capFrag('%s');\n" % f + b
        elif f == '99-tail.html':
            b = '\n'.join(tail) + '\n' + b
        parts.append(b)
    html = ''.join(parts)
    open(OUT_HTML, 'w').write(html)
    global LINEMAP
    LINEMAP, ln = [], 1
    for f, p in zip(order, parts):
        LINEMAP.append((ln, f)); ln += p.count('\n')
    return defs, missing


def serve(root):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=root))
    h.daemon_threads = True
    threading.Thread(target=h.serve_forever, daemon=True).start()
    return h.server_address[1]


async def run_page():
    from playwright.async_api import async_playwright
    port = serve(VOTH)
    three = open(os.path.join(VOTH, 'three.min.js'), 'rb').read()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
        page = await b.new_page(viewport={'width': 640, 'height': 400})
        await page.route('**/three.min.js', lambda r: r.fulfill(body=three, content_type='application/javascript'))
        rel = os.path.relpath(OUT_HTML, VOTH).replace(os.sep, '/')
        await page.goto(f'http://127.0.0.1:{port}/{rel}')
        await page.wait_for_function('window.__CAP_DONE === true', timeout=600000)
        errs = await page.evaluate("() => document.getElementById('errs').textContent")
        data = await page.evaluate('''() => { const C = window.__CAP;
          return { log: C.log, calls: C.calls, loose: C.loose, stackHits: C.stackHits, geoms: C.geoms }; }''')
        await b.close()
    return errs, data


# ------------------------------------------------------------------ geometry
def to_local(r, fx, fz, fry, y0):
    c, s = math.cos(fry), math.sin(fry)
    if r[0] == 'beam':
        ax, az, bx, bz = r[2] - fx, r[4] - fz, r[5] - fx, r[7] - fz
        return ['beam', r[1], ax * c - az * s, r[3] - y0, ax * s + az * c,
                bx * c - bz * s, r[6] - y0, bx * s + bz * c, r[8], r[9], r[10]]
    dx, dz = r[2] - fx, r[4] - fz
    return [r[0], r[1], dx * c - dz * s, r[3] - y0, dx * s + dz * c, r[5], r[6], r[7], (r[8] or 0) - fry, r[9]]


def centre(r):
    if r[0] == 'beam':
        return (r[2] + r[5]) / 2, (r[3] + r[6]) / 2, (r[4] + r[7]) / 2
    return r[2], r[3] + r[6] / 2, r[4]


def half_extent(r):
    """plan half-extent of a record, rotation-safe"""
    if r[0] == 'beam':
        return abs(r[2] - r[5]) / 2, abs(r[4] - r[7]) / 2
    if r[0] == 'box' or r[0].startswith('fr'):
        c, s = abs(math.cos(r[8] or 0)), abs(math.sin(r[8] or 0))
        return (r[5] * c + r[7] * s) / 2, (r[5] * s + r[7] * c) / 2
    return r[5], r[7]          # radius-type shapes: sx/sz are radii


def auto_frame(recs):
    """frame for a builder whose args do not give one: dominant rotation by
    footprint area, origin at the centre of the rotated extent"""
    bins = {}
    for r in recs:
        if r[0] == 'beam': continue
        a = (r[8] or 0) % (math.pi / 2)
        k = round(a / (math.pi / 90))
        bins[k] = bins.get(k, 0) + abs(r[5] * r[7])
    ry = (max(bins, key=bins.get) * math.pi / 90) if bins else 0
    c, s = math.cos(ry), math.sin(ry)
    lx = [(r[2] * c - r[4] * s) for r in recs if r[0] != 'beam']
    lz = [(r[2] * s + r[4] * c) for r in recs if r[0] != 'beam']
    mx, mz = (min(lx) + max(lx)) / 2, (min(lz) + max(lz)) / 2
    # back to world: inverse of the local transform
    return [mx * c + mz * s, -mx * s + mz * c, ry]


def rnd(v, k=2):
    return round(v, k) if isinstance(v, float) else v


def main():
    defs, missing = build_capture_html()
    if missing:
        print('builders not found in src (skipped):', ', '.join(missing))
    cache = os.path.join(HERE, '.capture-cache.json')
    if '--reuse' in sys.argv and os.path.exists(cache):
        errs, data = json.load(open(cache))
    else:
        print('running the instrumented city headless (about a minute) ...')
        errs, data = asyncio.run(run_page())
        json.dump([errs, data], open(cache, 'w'))
    if errs.strip():
        print('CITY ERROR PANEL:\n' + errs)
    log, calls = data['log'], data['calls']
    print('log records:', len(log), ' builder calls:', len(calls))

    owner = [None] * len(log)           # innermost builder call per record
    # innermost wins: assign in order of decreasing range size
    for i in sorted(range(len(calls)), key=lambda i: -(calls[i]['e'] - calls[i]['s'])):
        c = calls[i]
        for k in range(c['s'], c['e']):
            owner[k] = i

    by_key = {}
    for i, c in enumerate(calls):
        if c['fn'] in BUILDERS:
            by_key.setdefault(c['key'], []).append(i)

    # decorator records, bucketed on a coarse grid for the footprint join
    GRID = 24.0
    deco = {}
    for k, r in enumerate(log):
        o = owner[k]
        if o is None or calls[o]['fn'] not in DECORATORS: continue
        x, y, z = centre(r)
        deco.setdefault((int(x // GRID), int(z // GRID)), []).append(k)

    entries = []
    for key, idxs in sorted(by_key.items()):
        fn = calls[idxs[0]]['fn']
        # representative calls: the largest, then spread down the size range
        idxs_sorted = sorted(idxs, key=lambda i: -(calls[i]['e'] - calls[i]['s']))
        pick, seen = [], set()
        for q in [0, 0.25, 0.5, 0.75, 1.0]:
            i = idxs_sorted[min(len(idxs_sorted) - 1, int(q * (len(idxs_sorted) - 1)))]
            n = calls[i]['e'] - calls[i]['s']
            if i in pick or n in seen: continue
            pick.append(i); seen.add(n)
            if len(pick) >= MAX_INST: break
        variants = []
        for i in pick:
            c = calls[i]
            own = log[c['s']:c['e']]
            fr = c['frame'] or auto_frame(own)
            fx, fz, fry = fr[0], fr[1], fr[2] or 0
            recs = list(own)
            if fn in JOIN_INTO:
                cs, sn = math.cos(fry), math.sin(fry)
                loc = [to_local(r, fx, fz, fry, 0) for r in own]
                ex = [half_extent(r) for r in loc]
                x0 = min(r[2] - e[0] for r, e in zip(loc, ex)) - 0.8
                x1 = max(r[2] + e[0] for r, e in zip(loc, ex)) + 0.8
                z0 = min(r[4] - e[1] for r, e in zip(loc, ex)) - 0.8
                z1 = max(r[4] + e[1] for r, e in zip(loc, ex)) + 0.8
                wx = [fx + a * cs + b * sn for a in (x0, x1) for b in (z0, z1)]
                wz = [fz - a * sn + b * cs for a in (x0, x1) for b in (z0, z1)]
                for gx in range(int(min(wx) // GRID), int(max(wx) // GRID) + 1):
                    for gz in range(int(min(wz) // GRID), int(max(wz) // GRID) + 1):
                        for k in deco.get((gx, gz), []):
                            if c['s'] <= k < c['e']: continue
                            px, py, pz = centre(log[k])
                            dx, dz = px - fx, pz - fz
                            lx, lz = dx * cs - dz * sn, dx * sn + dz * cs
                            if x0 <= lx <= x1 and z0 <= lz <= z1:
                                recs.append(log[k])
            y0 = min((r[3] if r[0] != 'beam' else min(r[3], r[6])) for r in own)
            loc = [to_local(r, fx, fz, fry, y0) for r in recs]
            loc = [[rnd(v) if j >= 2 and j <= 8 else v for j, v in enumerate(r)] if r[0] != 'beam'
                   else [rnd(v) if 2 <= j <= 9 else v for j, v in enumerate(r)] for r in loc]
            xs = [r[2] for r in loc]; zs = [r[4] for r in loc]
            ext = [half_extent(r) for r in loc]
            w = max(r[2] + e[0] for r, e in zip(loc, ext)) - min(r[2] - e[0] for r, e in zip(loc, ext))
            d = max(r[4] + e[1] for r, e in zip(loc, ext)) - min(r[4] - e[1] for r, e in zip(loc, ext))
            h = max((r[3] + r[6]) if r[0] != 'beam' else max(r[3], r[6]) for r in loc)
            # re-centre the footprint so the frame origin is its middle
            cx = (max(r[2] + e[0] for r, e in zip(loc, ext)) + min(r[2] - e[0] for r, e in zip(loc, ext))) / 2
            cz = (max(r[4] + e[1] for r, e in zip(loc, ext)) + min(r[4] - e[1] for r, e in zip(loc, ext))) / 2
            for r in loc:
                r[2] = rnd(r[2] - cx); r[4] = rnd(r[4] - cz)
                if r[0] == 'beam':
                    r[5] = rnd(r[5] - cx); r[7] = rnd(r[7] - cz)
            variants.append({'recs': loc, 'w': round(w, 1), 'd': round(d, 1), 'h': round(h, 1),
                             'at': [round(fx), round(fz)], 'own': c['e'] - c['s'], 'joined': len(recs) - (c['e'] - c['s'])})
        g = BUILDERS[fn]
        entries.append({'key': key, 'fn': fn, 'count': len(idxs), 'group': g[2], 'label': g[3],
                        'src': defs.get(fn), 'variants': variants})

    # a builder that only ever runs inside another and emits nothing of its
    # own (templeCanton inside monoCanton('Temple'), wallSegmentBasalt as
    # wallSegRender's state 2) captures the same primitives twice — keep the
    # outer entry
    NESTED = ('templeCanton', 'wallSegmentBasalt')
    sig = lambda e: tuple(sorted((v['own'], tuple(sorted((round(v['w']), round(v['d'])))), round(v['h'])) for v in e['variants']))
    outer = {sig(e) for e in entries if e['fn'] not in NESTED}
    dropped = [e['key'] for e in entries if e['fn'] in NESTED and sig(e) in outer]
    entries = [e for e in entries if e['key'] not in dropped]
    if dropped: print('dropped nested duplicates:', ', '.join(dropped))

    # vessels from the life layer
    for gname, (key, label) in GEOMS.items():
        gd = data['geoms'].get(gname)
        if not gd: continue
        p = gd['p']; col = gd['c']
        xs, ys, zs = p[0::3], p[1::3], p[2::3]
        cx, cz, y0 = (min(xs) + max(xs)) / 2, (min(zs) + max(zs)) / 2, min(ys)
        pos = [round(v - o, 2) for i, v in enumerate(p) for o in [(cx, y0, cz)[i % 3]]]
        entries.append({'key': key, 'fn': gname, 'count': 1, 'group': 'vessel', 'label': label,
                        'src': defs.get('lifeMergeGeoms'), 'mesh': True,
                        'variants': [{'pos': pos, 'col': [round(v, 3) for v in col] if col else None,
                                      'w': round(max(xs) - min(xs), 1), 'd': round(max(zs) - min(zs), 1),
                                      'h': round(max(ys) - min(ys), 1), 'at': [0, 0]}]})

    write_outputs(entries, data, log, owner, calls, missing)


def js_key(k):
    return 'voth_city_' + re.sub(r'[^a-z0-9]+', '_', re.sub(r'([a-z])([A-Z])', r'\1_\2', k).lower()).strip('_')


def write_outputs(entries, data, log, owner, calls, missing):
    reg = os.path.join(CAT, 'registry')
    # colour table keeps the data file small
    cols = {}
    def ci(c):
        if isinstance(c, str):
            c = int(c.lstrip('#'), 16) if c.startswith('#') else 0x808080
        elif isinstance(c, dict) and 'r' in c:
            c = (round(c['r'] * 255) << 16) | (round(c['g'] * 255) << 8) | round(c['b'] * 255)
        elif isinstance(c, (int, float)):
            c = int(c)
        else:
            c = 0x808080
        if c not in cols: cols[c] = len(cols)
        return cols[c]
    shapes = ['box', 'fr8', 'fr6', 'fr3', 'dome', 'blob', 'cyl', 'stk', 'cone', 'beam']
    fams = []
    def fi(f):
        if f not in fams: fams.append(f)
        return fams.index(f)
    packed = {}
    for e in entries:
        vs = []
        for v in e['variants']:
            if e.get('mesh'):
                vs.append({'m': 1, 'p': v['pos'], 'c': v['col']})
                continue
            flat = []
            for r in v['recs']:
                if r[0] == 'beam':
                    flat.append([9, fi(r[1])] + r[2:10] + [ci(r[10])])
                else:
                    flat.append([shapes.index(r[0]), fi(r[1])] + r[2:9] + [ci(r[9])])
            vs.append({'r': flat})
        packed[js_key(e['key'])] = vs
    colour_list = [0] * len(cols)
    for c, i in cols.items(): colour_list[i] = c
    with open(os.path.join(reg, 'voth-city-captured.data.js'), 'w') as fh:
        fh.write('/* GENERATED by catalog/capture/capture.py from a live city build — do not edit.\n'
                 '   Records: [shape, family, x, y, z, sx, sy, sz, ry, colour] in the entry\'s own frame;\n'
                 '   beams: [9, family, ax, ay, az, bx, by, bz, w, t, colour]. Mesh variants: {m, p, c}. */\n')
        fh.write('window.VOTH_CITY_CAPTURE = ')
        json.dump({'shapes': shapes, 'fams': fams, 'cols': colour_list, 'entries': packed}, fh, separators=(',', ':'))
        fh.write(';\n')

    meta = []
    for e in entries:
        vd = [{'w': max(v['w'], 0.5), 'd': max(v['d'], 0.5), 'h': max(v['h'], 0.5)} for v in e['variants']]
        meta.append({'key': js_key(e['key']), 'name': e['label'] + ('' if e['key'] == e['fn'] else ' — ' + e['key'].split('_', 1)[-1] if '_' in e['key'] else ''),
                     'family': e['group'], 'fn': e['fn'], 'src': '%s:%d' % e['src'] if e['src'] else '',
                     'count': e['count'], 'variantDims': vd,
                     'w': max(x['w'] for x in vd), 'd': max(x['d'] for x in vd), 'h': max(x['h'] for x in vd)})
    tmpl = open(os.path.join(HERE, 'registry-template.js')).read()
    with open(os.path.join(reg, 'voth-city-captured.js'), 'w') as fh:
        fh.write(tmpl.replace('/*__META__*/[]', json.dumps(meta, indent=0)))

    # ---------------------------------------------------------- inventory
    total = len(log)
    captured = sum(1 for o in owner if o is not None)
    TREES = ('baobab', 'cherryBlossom', 'dragonTree', 'emperorMushroom', 'plant', 'willow', 'chinampaBed')
    veg = data['loose'].get('70-veg.js', 0) + data['loose'].get('55-chinampa.js', 0)
    veg += sum(n for k, n in data['stackHits'].items() if k.startswith('69-') and any(t in k for t in TREES[:4]))
    struct_cov = 100.0 * captured / max(total - veg, 1)
    lines = ['# Voth city — structure inventory', '',
             'Generated by `catalog/capture/capture.py` from a live build of `voth/src/`. '
             'Every row is one structure builder in the city; **In city** is how many times the '
             'city calls it, **Variants** how many representative calls the catalog keeps as '
             'variants of the entry (the largest, then spread down the size range).', '',
             'Coverage: **%d of %d** primitives the city emits (%.1f%%) are inside a captured builder '
             'or a decoration pass joined onto one. Leaving out vegetation (`70-veg.js`, the exotic '
             'trees in `69-district-content.js`) and the chinampa beds and willows (`55-chinampa.js`), '
             'which are landscape rather than structures: **%.1f%%** of built fabric is captured.'
             % (captured, total, 100.0 * captured / max(total, 1), struct_cov), '',
             '| Catalog key | What | Source | In city | Variants | Size of largest (w × d × h m) |',
             '|---|---|---|---:|---:|---|']
    for m, e in sorted(zip(meta, entries), key=lambda t: (t[0]['family'], t[0]['key'])):
        v = e['variants'][0]
        fnl = ('inline loop' if e['fn'].startswith('__') else e['fn'] + '()')
        lines.append('| `%s` | %s | `%s` %s | %d | %d | %.0f × %.0f × %.0f |' % (
            m['key'], m['name'], m['src'], fnl, e['count'], len(e['variants']), v['w'], v['d'], v['h']))
    lines += ['', '## Not captured', '',
              'Primitives pushed outside any wrapped builder, by fragment (terrain dressing, '
              'vegetation, props and scattered detail are expected here):', '',
              '| Fragment | Loose primitives |', '|---|---:|']
    for f, n in sorted(data['loose'].items(), key=lambda t: -t[1]):
        lines.append('| `%s` | %d |' % (f, n))
    lines += ['', 'Where they come from (sampled call stacks, innermost first; ≈ counts):', '',
              '| Fragment :: caller | ≈ primitives |', '|---|---:|']
    hits = {}
    for k, n in data['stackHits'].items():
        f, _, st = k.partition(' :: ')
        k2 = f + ' :: ' + ' < '.join(where(t) for t in st.split(' < '))
        hits[k2] = hits.get(k2, 0) + n
    for k, n in sorted(hits.items(), key=lambda t: -t[1])[:50]:
        lines.append('| `%s` | %d |' % (k, n))
    if missing:
        lines += ['', 'Builders listed in capture.py but not found in src: ' + ', '.join('`%s`' % m for m in missing)]
    open(os.path.join(CAT, 'CITY_INVENTORY.md'), 'w').write('\n'.join(lines) + '\n')
    sz = os.path.getsize(os.path.join(reg, 'voth-city-captured.data.js'))
    print('wrote %d entries, %d variants; data %.1f MB; coverage %.1f%% (structures %.1f%%)' % (
        len(entries), sum(len(e['variants']) for e in entries), sz / 1e6, 100.0 * captured / max(total, 1), struct_cov))


if __name__ == '__main__':
    main()
