#!/usr/bin/env python3
"""Shots of the vernacular sheet's buildings, outside and cut away (the interiors: 69e-vern-hollow.js, 95i-iziz-interiors.js).
verify.py has no cutaway; this opens the page with tools/harness.py, and for each key:
  - an eye-level shot of its front (from the def's front, +z), and
  - one cutaway shot per storey, from above at 45 degrees (KHOST.cut.to(unit, storey)).
It prints window._interiors and each unit's rooms, pieces and residence counts, and the error panel.

  python3 ixshot.py dist/iziz-vernacular.html --keys vern_house_mid_a,vern_tavern --out shots/ix
  python3 ixshot.py dist/iziz-vernacular.html --all --out shots/ix          # every furnished building
  python3 ixshot.py dist/iziz-vernacular.html --keys vern_bakery --no-cut   # outside only
"""
import argparse, asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(HERE)), 'tools'))
import harness

UNITS_JS = """()=>({ix:window._interiors,errs:(document.getElementById('errs')||{}).textContent||'',
 units:(typeof IZIX!=='undefined'?IZIX.units:[]).map((u,i)=>({i,id:u.id,name:u.name,x:u.x,z:u.z,w:u.w,d:u.d,levels:u.levels.length,rooms:u.rooms,pieces:u.pieces,residence:u.residence})),
 sites:SITES.map(s=>({key:s.key,x:s.x,z:s.z,v:(s.o&&s.o.v)|0}))})"""


async def main(a):
    from playwright.async_api import async_playwright
    os.makedirs(a.out, exist_ok=True)
    with harness.serve(os.path.dirname(os.path.abspath(a.html))) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            pg, errs, ready = await harness.open_page(b, a.html, port, size=a.size, here=HERE)
            await pg.wait_for_timeout(1500)
            info = await pg.evaluate(UNITS_JS)
            print('interiors:', json.dumps(info['ix']))
            if info['errs'].strip():
                print('ERROR PANEL:', info['errs'][:3000])
            for e in errs:
                print('PAGE ERROR:', e[:400])
            keys = None if a.all else set(k for k in a.keys.split(',') if k)
            for s in info['sites']:
                if keys is not None and s['key'] not in keys:
                    continue
                u = next((u for u in info['units'] if u['id'].startswith('iziz.' + s['key'] + '.') and abs(u['x'] - s['x']) < .1 and abs(u['z'] - s['z']) < .1), None)
                tag = s['key'] + ('_v%d' % s['v'] if s['v'] else '')
                if u:
                    print('%-34s rooms %2d  pieces %3d  storeys %d  residence %s' % (tag, u['rooms'], u['pieces'], u['levels'], json.dumps(u['residence'])))
                else:
                    print('%-34s (no interior unit)' % tag)
                D = await pg.evaluate("k=>{const D=VERN.defs[k];return {w:D.w,d:D.d,h:D.h};}", s['key'])
                dist = max(D['w'], D['d'], 8) * .95 + 4
                cam = [s['x'] + dist * .35, 1.7, s['z'] + dist, s['x'], min(D['h'] * .35, 4), s['z']]
                await pg.evaluate("c=>{KHOST.cut&&KHOST.cut.off&&KHOST.cut.off();setView(...c);}", cam)
                await pg.wait_for_timeout(700)
                await pg.screenshot(path=os.path.join(a.out, tag + '_front.png'))
                if a.back:
                    cam = [s['x'] - dist * .35, 1.7, s['z'] - dist, s['x'], min(D['h'] * .35, 4), s['z']]
                    await pg.evaluate("c=>setView(...c)", cam)
                    await pg.wait_for_timeout(500)
                    await pg.screenshot(path=os.path.join(a.out, tag + '_back.png'))
                if not u or a.no_cut:
                    continue
                for st in range(u['levels']):
                    r = max(D['w'], D['d']) * .8 + 3
                    cam = [s['x'] + r * .55, 1.0 + r * .95 + st * 3, s['z'] + r * .8, s['x'], st * 3, s['z'] - .5]
                    await pg.evaluate("([id,st,c])=>{KHOST.cut.to(id,st);setView(...c);}", [u['id'], st, cam])
                    await pg.wait_for_timeout(900)
                    await pg.screenshot(path=os.path.join(a.out, '%s_cut%d.png' % (tag, st)))
                await pg.evaluate("()=>KHOST.cut.off()")
            await b.close()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--keys', default='')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--no-cut', dest='no_cut', action='store_true')
    ap.add_argument('--back', action='store_true')
    ap.add_argument('--out', default='shots/ix')
    ap.add_argument('--size', default='1100x760')
    asyncio.run(main(ap.parse_args()))
