#!/usr/bin/env python3
"""Bake the isle world's regional highway network (src/48r-world-roads.js ISLE_ROADS.bake over core/world/42-world-roads.js),
in a headless page (tools/harness.py: the shared Chromium launcher), to data/roads.json; the page then reads it as
WORLD_DATA.roads (41-world-fields.js shapes the ground to the roads, the terrain draws them).

    python3 bake.py roads      drop the old roads, build the page, route every hamlet to its town's network, write
                               data/roads.json, build the page again; then route once more on that page (the villages'
                               lanes as they lie with the roads) and write and build again

Rerun it whenever a village moves (the survey in src/48-world-hamlets.js, a town's plan): verify.py fails when a village's
lane end is no longer a road's end. The routing reads the land without roads (WORLD.Hland), so a rebake over the old
roads gives the same network.
"""
import asyncio, json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

DATA = os.path.join(HERE, 'data')
PAGE = os.path.join(HERE, 'dist', 'isle-demo.html')
WAIT = "(typeof CAM==='object'&&CAM&&window._api&&typeof ISLE_HAMLETS!=='undefined'&&ISLE_HAMLETS.made&&typeof ISLE_ROADS!=='undefined')||(document.getElementById('errs')&&document.getElementById('errs').textContent.length>0)"


async def bake_roads(fresh=True):
    from playwright.async_api import async_playwright
    out = os.path.join(DATA, 'roads.json')
    if fresh and os.path.isfile(out):
        os.remove(out)      # route over the land without the old roads
    subprocess.check_call([sys.executable, os.path.join(HERE, 'build.py')])
    folder, name = os.path.split(PAGE)
    with harness.serve(folder) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            pg = await b.new_page(viewport={'width': 1280, 'height': 800})
            pg.set_default_timeout(900000)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await harness.route_three(pg, folder)
            await pg.goto('http://127.0.0.1:%d/%s' % (port, name))
            await pg.wait_for_function(WAIT, timeout=600000)
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            if panel:
                print('ERROR PANEL:', panel[:1500]); await b.close(); return 1
            t0 = time.time()
            r = json.loads(await pg.evaluate('JSON.stringify(ISLE_ROADS.bake())'))
            if errs:
                print('page errors: %s' % errs[:3])
            await b.close()
    print('routed %d roads in %.0f s; errors: %s' % (len(r['roads']), time.time() - t0, r['errors']))
    for x in r['roads']:
        print('  %-18s - %-28s %6.1f km (%5.1f km to %s), climb %5d m, max grade %.1f %%, cut %3d m, fill %3d m, %d points, %d ms' % (
            x['from'], x['to'], x['length_m'] / 1000, x['townKm'], x['town'], x['climb_m'], x['maxGrade'] * 100, x['cutMax_m'], x['fillMax_m'], len(x['pts']), x.get('ms', 0)))
        x.pop('ms', None)      # the routing's wall time: not part of the network (a rebake writes the same bytes)
    json.dump(r, open(out, 'w', encoding='utf-8', newline='\n'), separators=(',', ':'))
    subprocess.check_call([sys.executable, os.path.join(HERE, 'build.py')])
    return 1 if r['errors'] else 0


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'roads'
    if what != 'roads':
        raise SystemExit(__doc__)
    # two passes (2026-11-09): the fresh one, then one routed from the villages' lanes as they lie with the roads in place.
    # The routes read the land without roads (WORLD.Hland), but a shore village's lanes follow the world's fields, which the
    # roads reshape: Nephtos's fishing village's lane ended 11 m short of the road baked from the road-free page
    rc = asyncio.run(bake_roads(True))
    sys.exit(rc or asyncio.run(bake_roads(False)))
