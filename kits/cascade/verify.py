#!/usr/bin/env python3
"""Headless verification of kits/cascade on the shared harness (tools/harness.py).

    python3 kits/cascade/verify.py kits/cascade/dist/cascade.html --assert [--views a,b] [--out shots]
"""
import argparse, asyncio, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness                                      # noqa: E402  (imported at top: watchdog & verify cache)


async def main(a):
    checks = harness.SURVEY if a.assert_ else ()
    async with harness.verify_page(a.html, here=HERE, size=a.size, settle_ms=1200, query=a.query, checks=checks) as V:
        pg = V.page
        pg.on('console', lambda m: print('CONSOLE', m.text[:1200]) if ('ERROR' in m.text or 'rror:' in m.text) else None)
        errs = await pg.evaluate('document.getElementById("errs") ? document.getElementById("errs").textContent.slice(0, 600) : ""')
        if errs.strip():
            print('errs:', errs)
            if a.assert_:
                V.fails.append('page errs: ' + errs.splitlines()[0][:200])
            return V.exit()
        await pg.wait_for_function('window._api && window._api.stage && window._api.stage().ready', timeout=180000)
        await pg.wait_for_timeout(1200)

        if a.assert_:
            checks = await pg.evaluate('window._api.hostChecks()')
            if not checks:
                V.fails.append('no _api.hostChecks')
            for c in (checks or []):
                print('ok  ' if c['ok'] else 'FAIL', c['name'], c.get('detail', ''))
                if not c['ok']:
                    V.fails.append(c['name'] + (': ' + c['detail'] if c.get('detail') else ''))

            negs = await pg.evaluate('window._api.hostNegatives()')
            for e in (negs or []):
                print('neg ' if e['failed'] else 'FAIL negative', e['name'])
                if not e['failed']:
                    V.fails.append('negative did not fail: ' + e['name'])

        views = harness.parse_views(a.views)
        if not views and a.all_views:
            views = await pg.evaluate('window._api.views()')
        if views:
            os.makedirs(a.out, exist_ok=True)
            for v in views:
                await pg.evaluate('(n) => window._api.go(n)', v)
                await pg.wait_for_timeout(900)
                if 'Deck ' in v or 'Cross-section' in v:
                    await pg.wait_for_timeout(700)
                await V.shot(os.path.join(a.out, 'view_%s.png' % v.replace(' ', '_')), view=v if a.assert_ else None)
                print('shot', v)
            await pg.evaluate("() => window._api.go('Vista from south-east')")
            await pg.wait_for_timeout(300)
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--out', default='shots')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--query', default='')
    sys.exit(asyncio.run(main(ap.parse_args())))
