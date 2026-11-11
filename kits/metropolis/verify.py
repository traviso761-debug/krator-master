#!/usr/bin/env python3
"""Headless verification of the metropolis test bed on the shared harness (tools/harness.py).

    python3 verify.py dist/metropolis.html --assert [--views "A|B"] [--out shots]

--assert runs the page's own checks (the audits, the budgets, the bakes; each with a negative) and the room audits of a sample of storeys. Screenshots: one per view.
KRATOR_GL=gpu runs on the real GPU, under the lock.
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
from harness import verify_page, Abort

HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLE = [('spindle', 0), ('spindle', 2), ('spindle', 3), ('spindle', 8), ('spindle', 17), ('spindle', 22), ('spindle', 31), ('spindle', 40), ('spindle', 48), ('ledger', 0), ('ledger', 2), ('ledger', 3), ('ledger', 6), ('ledger', 8), ('ledger', 10), ('ledger', 11)]


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--assert', dest='asserts', action='store_true'); ap.add_argument('--views', default=None); ap.add_argument('--out', default=None); ap.add_argument('--size', default='1280x800'); ap.add_argument('--query', default=''); a = ap.parse_args()
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=1500, query=a.query, init=[os.environ['MP_HOOK']] if os.environ.get('MP_HOOK') else ()) as V:
        pg = V.page
        pg.on('console', lambda m: print('CONSOLE', m.text[:1400]) if ('ERROR' in m.text or 'rror:' in m.text) else None)
        await pg.wait_for_function('window._api && window._api.stage && window._api.stage().ready && MPS.impN===MPS.impKeys.length && (typeof MPF==="undefined" || (MPF.ready && MPF.impN===MPF.keys.length))', timeout=600000)   # the farm belt's impostors too (70f); every impostor (one a frame; about 25 s on software GL) before the checks: the keys with impostors (four wild looks take none)
        s = await pg.evaluate('window._api.stage()')
        await pg.wait_for_timeout(2500)
        print(json.dumps(await pg.evaluate('window._api.stage()'))[:900]); print('errs:', await pg.evaluate('document.getElementById("errs").textContent.slice(0,600)'))
        if os.environ.get('MP_HOOK'):
            print('GLSL', await pg.evaluate('JSON.stringify([window._glslErr,renderer.getContext().isContextLost(),renderer.getContext().getError(),window._api.stage().bakeMs,window._api.stage().impMs])'))
        if a.asserts:
            for c in await pg.evaluate('window._api.hostChecks()'):
                print('ok  ' if c['ok'] else 'FAIL', c['name'], c.get('detail', ''))
                if not c['ok']:
                    V.fails.append(c['name'])
            for e in await pg.evaluate('window._api.hostNegatives()'):
                if not e['failed']:
                    print('FAIL negative', e['name']); V.fails.append('negative: ' + e['name'])
            for key, k in SAMPLE:
                r = await pg.evaluate('([a,b])=>window._api.mpRoomAudit(a,b)', [key, k])
                print(key, k, r['rooms'], 'rooms', r['pieces'], 'pieces', len(r['fails']), 'fails', [str(x)[:220] for x in r['fails'][:2]])
                V.fails.extend('%s L%d %s' % (key, k, t) for t in r['fails'][:3])
        if a.out:
            os.makedirs(a.out, exist_ok=True)
            names = await pg.evaluate('window._api.views()')
            want = a.views.split('|') if a.views else names
            for nm in want:
                await pg.evaluate('(n)=>window._api.go(n)', nm)
                await pg.wait_for_timeout(900)
                if 'Inside' in nm or 'Tiers' in nm:
                    await pg.wait_for_timeout(1500)
                await pg.screenshot(path=os.path.join(a.out, nm.replace(':', '').replace(',', '').replace(' ', '-').replace('(', '').replace(')', '') + '.png'))
                print('shot', nm)
            print('furniture maps', await pg.evaluate('JSON.stringify(KratorFurniture.textureInfo?KratorFurniture.textureInfo():null)'))


try:
    asyncio.run(main())
except Abort as e:
    sys.exit(e.code if hasattr(e, 'code') else 1)
