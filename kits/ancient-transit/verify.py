#!/usr/bin/env python3
"""Headless verification of the Ancient Transit kit's demo page on the shared harness (tools/harness.py).

    python3 verify.py dist/ancient-transit.html --assert [--views "A|B"] [--out shots]

--assert runs the page's own checks (hostChecks: the block built whole, the streets dressed off the pads, the highway's spans and states,
the ramps at grade, the interchange's clearance, the crossings, the trains, each group's triangles; each with a negative, hostNegatives)
under the harness's universal asserts (the error panel, the shaders, the textures, NaN geometry, the registered volumes, the eye of every
view). --out writes a screenshot a view, with its draw calls and triangles. KRATOR_GL=gpu runs on the real GPU, under the lanes' lock.
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
from harness import verify_page, Abort

HERE = os.path.dirname(os.path.abspath(__file__))


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--assert', dest='asserts', action='store_true'); ap.add_argument('--views', default=None); ap.add_argument('--out', default=None); ap.add_argument('--size', default='1280x800'); ap.add_argument('--query', default=''); a = ap.parse_args()
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=1500, query=a.query) as V:
        pg = V.page
        pg.on('console', lambda m: print('CONSOLE', m.text[:1400]) if ('ERROR' in m.text or 'rror:' in m.text) else None)
        await pg.wait_for_function('window._api && window._api.stage && window._api.stage().ready && window._texPending===0', timeout=600000)
        await pg.wait_for_timeout(1500)
        s = await pg.evaluate('window._api.stage()')
        print('stage:', json.dumps({k: s[k] for k in ('ready', 'ms', 'culled', 'highway')}))
        for g in s['groups']:
            print('  %-48s %9d tris %3d meshes' % (g['name'], g['tris'], g['meshes']))
        print('errs:', await pg.evaluate('document.getElementById("errs").textContent.slice(0,600)'))
        if a.asserts:
            for c in await pg.evaluate('window._api.hostChecks()'):
                print('ok  ' if c['ok'] else 'FAIL', c['name'], c.get('detail', ''))
                if not c['ok']:
                    V.fails.append(c['name'])
            for e in await pg.evaluate('window._api.hostNegatives()'):
                if not e['failed']:
                    print('FAIL negative', e['name']); V.fails.append('negative: ' + e['name'])
        names = await pg.evaluate('window._api.views()')
        want = a.views.split('|') if a.views else names
        if a.out:
            os.makedirs(a.out, exist_ok=True)
        for nm in want:
            await pg.evaluate('(n)=>window._api.go(n)', nm)
            await pg.wait_for_timeout(700)
            fn = os.path.join(a.out, nm.replace(':', '').replace(',', '').replace(' ', '-').replace("'", '') + '.png') if a.out else None
            r = await V.shot(fn, view=nm) if fn else None
            st = await pg.evaluate('({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})')
            print('view %-22s %4d calls %9d tris%s' % (nm, st['calls'], st['tris'], '  shot' if fn else ''))
            if r is None and not fn:
                pass
    return V.exit()


try:
    sys.exit(asyncio.run(main()))
except Abort as e:
    sys.exit(e.code if hasattr(e, 'code') else 1)
