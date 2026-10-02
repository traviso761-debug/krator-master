#!/usr/bin/env python3
"""Check and screenshot dist/interiors-walk.html: python3 tools/walkshots.py OUTDIR [--walk N]
Loads the page headless, prints the error panel, then: the overview, each building cut away at storey 0,
and a walk: from the road in front of building N, straight in through its front door (W held), with a
shot every second, printing where the walker stands (room or outside) and its floor height."""
import asyncio, os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.dirname(HERE)
async def main(out, walk):
    from playwright.async_api import async_playwright
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 800}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + os.path.join(KIT, 'dist', 'interiors-walk.html'), timeout=600000)
        await pg.wait_for_function("window._ready===true || document.getElementById('errs').textContent.length>0", timeout=600000)
        await pg.wait_for_timeout(1500)
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', repr(panel[:1500]) if panel else 'clean', ' page errors:', errs[:3])
        info = await pg.evaluate("()=>{const I=window._interiors;return I.items.map((E,i)=>i+' '+E.item.key+' real:'+E.real+' rooms:'+E.inst.rooms.length+' pieces:'+E.inst.rooms.reduce((a,R)=>a+I.plansById[R.id].placements.length,0))}")
        print('\n'.join(info))
        async def shot(n): await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(out, n + '.png')); print('shot', n)
        await shot('00_overview')
        n = await pg.evaluate("window._interiors.items.length")
        for i in ([] if '--no-items' in sys.argv else range(n)):
            await pg.evaluate("(i)=>window._interiors.gotoItem(i)", i); await shot('item_%02d' % i)
        if walk is not None:
            await pg.evaluate("(i)=>{window._setWalk(true);window._interiors.walkToDoor(i);}", walk)
            await shot('walk_%02d_0' % walk)
            for k in range(1, 7):
                await pg.keyboard.down('w'); await pg.wait_for_timeout(1500); await pg.keyboard.up('w')
                pose = await pg.evaluate("window._interiors.pose()"); print('walk', k, json.dumps(pose))
                await shot('walk_%02d_%d' % (walk, k))
        await b.close()
w = int(sys.argv[sys.argv.index('--walk') + 1]) if '--walk' in sys.argv else None
asyncio.run(main(sys.argv[1], w))
