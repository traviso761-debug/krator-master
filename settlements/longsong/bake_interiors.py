#!/usr/bin/env python3
"""Bake Longsong's interiors: every room's pieces, from the built page, into interiors-bake.json.

The page furnishes its rooms itself (src/57a-ls-interiors.js on kits/interiors), a storey at a time when the cutaway or
the eye first wants it; furnishing all 320 rooms takes a while. The bake is the same records computed once, headless,
and committed: build.py inlines it (generated fragment 57b-ls-interiors-bake.js), and the page then draws any storey
from the records at once. README: "Furniture that is not always drawn is data first".

Run it after anything that changes a plan: the rooms (src/40c-ls-rooms.js), the programmes and layouts
(src/57a-ls-interiors.js), or the catalog / interiors kit (build.py says the bake is stale when the kit hash moved; each
room's own fingerprint is checked in the page). Then rebuild.

Usage:  python3 build.py && python3 bake_interiors.py && python3 build.py
"""
import asyncio, json, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import launch_chromium, serve, open_page      # the shared harness (tools/harness.py)

PAGE = os.path.join(HERE, 'dist', 'longsong.html')
OUT = os.path.join(HERE, 'interiors-bake.json')


async def bake():
    from playwright.async_api import async_playwright
    t0 = time.time()
    with serve(os.path.dirname(PAGE)) as port:
        async with async_playwright() as p:
            b = await launch_chromium(p)
            pg, errs, ready = await open_page(b, PAGE, port, query='?noflora=1')
            if errs:
                print('the page reports errors; not baking:\n' + '\n'.join(errs)[:2000])
                await b.close()
                return 1
            pg.set_default_timeout(1800000)
            data = await pg.evaluate("()=>window.LSIX&&window.LSIX.on?window.LSIX.bakeAll():null")
            fails = await pg.evaluate("()=>window.LSIX?window.LSIX.fails.slice(0,40):[]")
            await b.close()
    if not data or not data.get('kit'):
        print('no bake returned (interiors off?)')
        return 1
    rooms = data['rooms']
    keys = sorted(rooms)
    lines = ['{', '"kit":%s,' % json.dumps(data['kit']), '"rooms":{']
    for i, k in enumerate(keys):
        lines.append('%s:%s%s' % (json.dumps(k), json.dumps(rooms[k], separators=(',', ':')), ',' if i < len(keys) - 1 else ''))
    lines += ['}', '}']
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines) + '\n')
    pieces = sum(len(r['p']) for r in rooms.values())
    short = [k for k in keys if rooms[k].get('r') and rooms[k]['r'].get('missing')]
    print('wrote %s: %d rooms, %d pieces, kit %s, %.0f KB (%.0f s)'
          % (os.path.basename(OUT), len(rooms), pieces, data['kit'], os.path.getsize(OUT) / 1024, time.time() - t0))
    if short:
        print('%d rooms short of a required piece: %s' % (len(short), ', '.join('%s (%s)' % (k, ', '.join(rooms[k]['r']['missing'])) for k in short[:12])))
    if fails:
        print('fails: ' + '; '.join(fails))
    print('now rebuild: python3 build.py')
    return 0


if __name__ == '__main__':
    sys.exit(asyncio.run(bake()))
