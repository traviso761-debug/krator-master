#!/usr/bin/env python3
"""A town's own ground in the world, on a scratch region round its pin (openworld/PLAN-VOTH.md, step V2's proof).

    python3 core/world/town_view.py voth [--out DIR] [--reach-km 15]   # cut, the checks in node, the page
    python3 core/world/town_view.py voth --shots [--out DIR]           # and the same views on the town's page and in the world (GPU)

1. cut: a square of reach_km round the town's pin (bake_towns.py TOWNS, the 5.1 canvas) off the scale model, as
   cut_site.py cuts a region (extract_region.py with the model's own regions and settlements), into DIR/data. No
   openworld/SITES.json entry: the real region is step V3's (openworld/voth).
2. check: the region's land (core/world 41), the town's ground (WORLD_DATA.towns: bake_towns.record), its water, river
   and body (41t) and the landform stamps (41l) in node; WTOWN.check() and WLAND.check(), printed and written to
   DIR/check.json. Exit 1 when a check fails.
3. page: DIR/<town>-world.html, core/world with no kits (the land, the water, the sky; the town's views in "Go to").
4. --shots: under the GPU lock (tools/harness.py), each view on the town's own page (its dist page, from LFS) and in the
   world, side by side in DIR/side-<n>.png.

DIR defaults to <tmp>/krator-town-view-<town>. Nothing in the repo is written."""
import argparse, asyncio, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import world_data as WD   # noqa: E402
import bake_towns as BT   # noqa: E402

# the views (the town's frame: x east, z south, metres; y over the town's 0), as [label, eye, look]
VIEWS = {'voth': [
    ['the bay, the narrows and the lake from 9 km up, north at the top', [300, 9000, 2600], [300, 0, -1200]],
    ['the narrows and the bay from the east shore, 700 m up', [2600, 700, 1300], [-100, 0, 300]],
    ['the river\'s mouth and the bay\'s south-east corner, 350 m up', [1900, 350, 2300], [880, 0, 1160]],
    ['the strait leaving the lake to the north, 1.2 km up', [1800, 1200, -2400], [800, 0, -4800]]]}
PAGES = {'voth': 'settlements/voth/dist/voth-city.html'}
# the panels hidden for the shots (both pages float theirs over the canvas)
HIDE = ("document.querySelectorAll('body *').forEach(e=>{if(e.tagName==='CANVAS'||e.querySelector('canvas'))return;"
        "const p=getComputedStyle(e).position;if(p==='fixed'||p==='absolute')e.style.display='none';})")


def node():
    return BT.node()


def cut(key, out, reach_km):
    import extract_region as XR
    T = BT.TOWNS[key]
    px, py = T['pin_px']
    r = reach_km * 1000.0 / 2000.0
    src, data = os.path.join(out, 'source'), os.path.join(out, 'data')
    os.makedirs(src, exist_ok=True)
    name = '%s town view' % key
    regs = XR.load_model_defaults('regions') + [{'id': 'cut-town-view-' + key, 'name': name, 'kind': 'tool',
                                                  'points': [[px - r, py - r], [px + r, py - r], [px + r, py + r], [px - r, py + r]],
                                                  'notes': 'core/world/town_view.py: a scratch region round %s' % T['name']}]
    with open(os.path.join(src, 'regions.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(regs, f, ensure_ascii=False)
    cmd = [sys.executable, os.path.join(ROOT, 'tools', 'scale-model', 'extract_region.py'), os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data'),
           os.path.join(src, 'regions.json'), 'model', name, data, '--upsample', 'auto']
    r_ = subprocess.call(cmd)
    if r_:
        sys.exit('town_view: extract_region.py failed (%d)' % r_)
    rj = os.path.join(data, 'region.json')
    M = json.load(open(rj, encoding='utf-8'))
    cx, cy = M['frame']['origin_px']
    sett = {s['id']: s for s in XR.load_model_defaults('settlements')}
    s = sett.get(T['site'], {'name': T['name'], 'px': px, 'py': py, 'type': 'city'})
    M['sites'] = [{'id': T['site'], 'name': s['name'], 'type': s.get('type'), 'px': s['px'], 'py': s['py'],
                   'x': (s['px'] - cx) * 2000.0, 'z': (s['py'] - cy) * 2000.0, 'reach_km': reach_km, 'page': T['page']}]
    with open(rj, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(M, f, ensure_ascii=False, indent=1)
    print('cut %s: origin px %s, box px %s, the pin at px %s,%s' % (name, M['frame']['origin_px'], M['frame']['box_px'], s['px'], s['py']))
    return data


def towns_extra(key, data):
    M = WD.meta(data)
    return {'towns': {'format': 'krator-openworld-towns', 'version': 1, 'towns': [BT.record(key, M)]}}


def check(key, data, out):
    parts = ['var window=globalThis;\n']
    for rel in ('core/rand/08-core-rand.js', 'core/terrain/38-core-relief.js'):
        parts.append(open(os.path.join(ROOT, rel), encoding='utf-8').read())
    parts.append(WD.fragment(data, 'var WORLD_KITS=[];\n', 'town_view', 'core/world/town_view.py', extra=towns_extra(key, data)))
    for f in ('41-world-fields.js', '41t-world-town-water.js', '41l-world-landforms.js'):
        parts.append(open(os.path.join(HERE, f), encoding='utf-8').read())
    parts.append(r'''
WORLD.init(WORLD_R);
const B=WORLD.waterBodies(),T=WORLD.towns[0];
process.stdout.write(JSON.stringify({town:{name:T.name,x:T.x,z:T.z,y0:T.y0,R:T.R,band:T.band,own:T.own},
 check:WTOWN.check({step:40}),land:WLAND.check(),skipped:WLAND.skipped,rivers:WTOWN.rivers().map(r=>({name:r.name,joined:r.joined,link:r.link,points:r.pts.length})),
 bodies:B.map(b=>({id:b.id,level:b.level,cells:b.cells,towns:b.towns||null,mask:[b.mask.nx,b.mask.nz,b.mask.cell]})),
 modelRivers:(WORLD_DATA.meta.rivers||[]).map(r=>({name:r.name,points:r.line.length,cutBy:r._cutBy||null}))}));
''')
    path = os.path.join(out, 'check.js')
    open(path, 'w', encoding='utf-8', newline='\n').write(''.join(parts))
    r = subprocess.run([node(), '--stack-size=8000', '--max-old-space-size=8000', path], capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sys.exit('town_view: node failed:\n' + r.stderr[-4000:])
    R = json.loads(r.stdout)
    json.dump(R, open(os.path.join(out, 'check.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    t = R['town']
    print('town %s at %.0f,%.0f, its 0 at %.1f m (the world\'s water), R %d, band %d, own ground mesh %s' % (t['name'], t['x'], t['z'], t['y0'], t['R'], t['band'], t['own']))
    bad = 0
    for c in R['check']:
        sh, rv, bd = c['shore'], c['river'], c['body']
        print('  %s shore: %d trace points, worst %.2f m, mean %.2f m, %d with no shore within 60 m; worst at %s' % (
            'PASS' if sh['missing'] == 0 and sh['max'] <= 8 else 'FAIL', sh['n'], sh['max'], sh['mean'], sh['missing'], sh['worst']))
        print('  %s river: %d stations in the town, %d dry%s; joined %s%s' % ('PASS' if rv['ok'] else 'FAIL', rv['inTown']['stations'], rv['inTown']['dry'],
              ' (first %s)' % rv['inTown']['firstDry'] if rv['inTown']['firstDry'] else '', rv['joined'] or 'to nothing (no model river to join reaches the band)',
              ': ' + json.dumps(rv['line']) if rv.get('line') else ''))
        print('  %s body: %d water cells sampled answer bodies %s (the town\'s body %d, level %.1f, joined to the model\'s: %s)' % (
            'PASS' if bd['one'] else 'FAIL', bd['cells'], bd['bodies'], bd['body'], bd['level'], bd['joinedModel']))
        print('  cut model rivers: %s' % (c['cut'] or 'none'))
        bad += 0 if c['ok'] else 1
    for L in R['land']:
        print('  %s landform %s (%s): top %.1f for crest %.1f, waterline %s' % ('PASS' if L['ok'] else 'FAIL', L['id'], L['kind'], L['top'], L['crest'], L['waterline']))
        bad += 0 if L['ok'] else 1
    print('  %d landform records in the region%s; %d water bodies' % (len(R['land']), ' (skipped: %s)' % R['skipped'] if R['skipped'] else '', len(R['bodies'])))
    return bad


# ---------------------------------------------------------------- the page: core/world with no kits
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31b-core-leafset.js', '31j-core-joint.js',
              '32-core-variants.js', '33-core-fungoid.js', '34-core-impostor.js', '35-core-anim.js', '36-core-walker.js', '38-core-fire.js', '39-core-lean.js']


def page(key, data, out):
    T = BT.TOWNS[key]
    extra = towns_extra(key, data)
    t = extra['towns']['towns'][0]
    views = [{'label': v[0], 'town': [v[1], v[2]]} for v in VIEWS.get(key, [])]
    cfg = ('var WORLD_CONFIG=(function(){const T=WORLD_DATA.towns.towns[0],V=%s;\n'
           '/* the town\'s frame to the world\'s: its 0 is lifted onto the world\'s water (41 onWater: WORLD.towns[0].y0) when the view is taken */\n'
           'const at=(p)=>{const t=WORLD.towns&&WORLD.towns[0],y=t?t.y0:0;return[T.x+p[0],y+p[1],T.z+p[2]];};\n'
           'const views=[{label:\'Overview: the scratch region from 40 km up\',pos:[T.x,40000,T.z+30000],look:[T.x,0,T.z]}];\n'
           'V.forEach(v=>views.push({label:v.label,get pos(){return at(v.town[0]);},get look(){return at(v.town[1]);}}));\n'
           'return{built:{[T.name]:\'its own ground (core/world/bake_towns.py, 41t)\'},goOrder:[T.name],goViews:views,\n'
           ' start:{view:[T.x+2600,T.z+1300,700,.9,-.3],look:[T.x,T.z,0]}};})();\n') % json.dumps(views)
    order = ([('ld', '00-head.html'), ('gen', None), ('core/shader', '06-core-khook.js'), ('core/shader', '06b-core-kcolor.js'),
              ('core/rand', '08-core-rand.js'), ('core/clock', '20-core-clock.js'), ('core/terrain', '38-core-relief.js')]
             + [('core/biome', f) for f in CORE_BIOME]
             + [('core/space', '20-core-space.js'), ('core/biome', '40-core-place.js'), ('core/biome', '41-core-env.js'),
                ('core/tags', '50-core-tags.js'), ('core/tags', '52-core-tags-vocab.js'),
                ('core/atmos', '89-atmos-0-core.js'), ('core/atmos', '89-atmos-0p-presets.js'), ('core/atmos', '89-atmos-a-waves.js'),
                ('core/atmos', '89-atmos-b-skylight.js'), ('core/atmos', '89-atmos-8-export.js'),
                ('core/water', '20-core-water.js'), ('core/water', '21-core-water-shore.js'), ('core/water', '22-core-water-flow.js'),
                ('core/water', '50-core-water-draw.js'), ('core/water', '51-core-water-kinds.js'),
                ('core/materials/record', '23-mat-record.js'), ('core/materials/record', '24-tex-def.js'), ('core/materials/record', '25-matlib-host.js'),
                ('core/materials/record', '26-matlib-bind.js'), ('biomes/sedesert/src', '35-core-strata.js'),
                ('ld', '41-world-fields.js'), ('ld', '41t-world-town-water.js'), ('ld', '41l-world-landforms.js'), ('ld', '42-world-roads.js'),
                ('ld', '45-world-host.js'), ('cfg', None)]
             + [('ld', f) for f in ('80-world-sky.js', '81-world-terrain.js', '83-world-water.js', '83w-world-seas.js', '84-world-nursery.js',
                                    '85-world-flora.js', '86-world-floor.js', '87-world-places.js', '88-world-towns.js', '90-world-camera.js',
                                    '91-world-probe.js', '98-world-start.js', '99-tail.html')])
    parts = []
    for where, f in order:
        if where == 'gen':
            parts.append(WD.fragment(data, '', '05-world-data.js (core/world/town_view.py)', 'a scratch region round %s, its own ground' % T['name'], extra=extra))
            continue
        if where == 'cfg':
            parts.append('\n// ==================== the town view\'s config (core/world/town_view.py)\n' + cfg + 'var WORLD_KITS=[];\n')
            continue
        p = os.path.join(HERE, f) if where == 'ld' else os.path.join(ROOT, where, f)
        s = open(p, encoding='utf-8').read()
        if where == 'ld' and f == '00-head.html':
            s = s.replace('<title>Krator Little Demo</title>', '<title>Krator: %s on its own ground</title>' % T['name'])
        # 98 and 88 know only towns drawn from a baked tile: 98 drops every town when the first one's tile cannot be
        # fetched, 88 loads each one's tile. A town whose ground the world draws itself (drawn: false) has none, so this
        # scratch page checks and loads only the towns with a tile. The same change to 98 and 88 is owed before V4
        # (TODO.md); it is made here, not in core/world, so the open-world pages they reach are not moved now
        for old, new in (('if(T&&T.length){msg(\'looking for the towns\');const u=T[0].tile;', 'if(T&&T.some(t=>t.tile)){msg(\'looking for the towns\');const u=T.find(t=>t.tile).tile;'),
                         ('const RECS=(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[];', 'const RECS=((WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[]).filter(r=>r.tile);')):
            if where == 'ld' and old in s:
                s = s.replace(old, new)
            elif where == 'ld' and f in ('98-world-start.js', '88-world-towns.js') and old.split('=')[0] in s and new not in s:
                sys.exit('town_view: %s changed: the drawn-false patch no longer applies' % f)
        parts.append(('\n// ==================== %s/%s\n' % (where, f)) if f.endswith('.js') else '')
        parts.append(s)
    dst = os.path.join(out, '%s-world.html' % key)
    open(dst, 'w', encoding='utf-8', newline='\n').write(''.join(parts))
    print('page %s (%d KB); its town at %.0f,%.0f' % (dst, os.path.getsize(dst) // 1024, t['x'], t['z']))
    return dst


# ---------------------------------------------------------------- the shots: the same views on the town's page and in the world
async def shots(key, html, out):
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    from harness import verify_page
    from PIL import Image
    V0 = VIEWS.get(key, [])
    town_page = os.path.join(ROOT, PAGES[key])
    if os.path.getsize(town_page) < 1000:
        sys.exit('town_view: %s is an LFS pointer: git lfs pull --include="%s"' % (PAGES[key], PAGES[key]))
    size = '960x640'
    w_shots, p_shots = [], []
    async with verify_page(html, here=out, size=size, settle_ms=0, ready_js="typeof CAM==='object'&&CAM&&window._api") as V:
        pg = V.page
        pg.set_default_timeout(900000)
        await pg.evaluate('_api.settle(240000)')
        for i, (label, eye, look) in enumerate(V0):
            # the view through the page's own "Go to" (CAM.GO: the config's views, the town's frame lifted onto the world)
            got = await pg.evaluate('(L)=>{const g=CAM.GO.find(g=>g.label===L);if(g)g.fn();return !!g;}', label)
            if not got:
                sys.exit('town_view: the world page has no view %r' % label)
            await pg.evaluate('_api.settle(240000)')
            await pg.evaluate(HIDE)
            await pg.wait_for_timeout(5000)   # frames after the move (a busy GPU runs the page at a few fps)
            print('world view %d: camera at %s' % (i, await pg.evaluate('HOST.camera.position.toArray().map(Math.round)')))
            p = os.path.join(out, 'world-%d.png' % i)
            await V.shot(p, view='world-%d' % i)
            w_shots.append(p)
        errs = list(V.errs)
    async with verify_page(town_page, here=out, size=size, settle_ms=0, ready_js="window._vc&&window._vc.ready") as V:
        pg = V.page
        pg.set_default_timeout(900000)
        for i, (label, eye, look) in enumerate(V0):
            # the page's camera is core/host's (KHOST.cam.setView: eye, then target)
            await pg.evaluate('([e,l])=>{KHOST.cam.setView(e[0],e[1],e[2],l[0],l[1],l[2]);}', [eye, look])
            await pg.evaluate(HIDE)
            await pg.wait_for_timeout(6000)
            p = os.path.join(out, 'page-%d.png' % i)
            await V.shot(p, view='page-%d' % i)
            p_shots.append(p)
    for i, (a, b) in enumerate(zip(p_shots, w_shots)):
        A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
        S = Image.new('RGB', (A.width + B.width + 8, max(A.height, B.height)), (20, 20, 20))
        S.paste(A, (0, 0))
        S.paste(B, (A.width + 8, 0))
        S.save(os.path.join(out, 'side-%d.png' % i))
        print('side by side %d (left: the page, right: the world): %s  %s' % (i, os.path.join(out, 'side-%d.png' % i), V0[i][0]))
    if errs:
        print('WORLD PAGE ERRORS:', errs[:5])
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('town')
    ap.add_argument('--out', default=None)
    ap.add_argument('--reach-km', type=float, default=15)
    ap.add_argument('--no-cut', action='store_true', help='reuse DIR/data')
    ap.add_argument('--shots', action='store_true')
    a = ap.parse_args()
    if a.town not in BT.TOWNS:
        sys.exit('town_view: no town %r (%s)' % (a.town, ', '.join(BT.TOWNS)))
    out = a.out or os.path.join(tempfile.gettempdir(), 'krator-town-view-' + a.town)
    os.makedirs(out, exist_ok=True)
    data = os.path.join(out, 'data') if a.no_cut else cut(a.town, out, a.reach_km)
    bad = check(a.town, data, out)
    html = page(a.town, data, out)
    if a.shots:
        asyncio.run(shots(a.town, html, out))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    main()
