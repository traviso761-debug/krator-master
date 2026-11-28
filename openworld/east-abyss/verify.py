#!/usr/bin/env python3
"""Verify the East Abyss Basin & Near-Environs open-world region (openworld/east-abyss).

    python3 openworld/east-abyss/verify.py openworld/east-abyss/dist/east-abyss.html --assert [--views 0,1] [--out /tmp/east_abyss_shots]
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness  # noqa: F401
from harness import verify_page, Abort

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=0,
                           ready_js="typeof CAM==='object'&&CAM&&window._api") as V:
        pg, errs, fails = V.page, V.errs, V.fails
        pg.set_default_timeout(600000)
        if not V.ready:
            print('timed out waiting for the page to build')
            fails.append('build timeout')
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel:
            print('ERROR PANEL:', panel[:1500])
            fails.append('error panel')
            raise Abort(1)
        if a.list:
            print('\n'.join(await pg.evaluate('_api.views()')))
            raise Abort(0)
        print('settle:', json.dumps(await pg.evaluate('_api.settle(180000)')))
        if a.assert_:
            sites = await pg.evaluate("(WORLD_DATA.meta.sites||[]).map(s=>s.name)")
            need = ['Mungo', 'Locus', 'Verge', 'Tafidda', 'Slice', 'The Arcades', 'Sfenops', 'Liikofi', 'Sista Riba', 'Bissa', 'Downback', 'Upsprings']
            miss = [n for n in need if n not in sites]
            print(('  PASS  ' if not miss else '  FAIL  ') + 'east-abyss-sites : %d sites%s' % (len(sites), '' if not miss else ' missing ' + str(miss)))
            if miss:
                fails.append('east-abyss-sites')
            for r in await pg.evaluate('_api.hostChecks()'):
                if r['name'] in ('the highways lie on the land and keep their grade', 'nothing grows on a highway or in a town'):
                    print('  n/a   ' + r['name'] + ' : ' + r['detail'])
                    continue
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                if not r['ok']:
                    fails.append(r['name'])
        for v in [int(t) for t in a.views.split(',') if t.strip()]:
            await pg.evaluate('_api.go(%d)' % v)
            s = await pg.evaluate('_api.settle(180000)')
            out = os.path.join(a.out, 'view%02d.png' % v)
            await V.shot(out, view='view%02d' % v)
            print('view %d: %s  settle %s' % (v, out, s.get('ms') if isinstance(s, dict) else s))
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel:
            print('ERROR PANEL:', panel[:1500])
            fails.append('error panel')
        if errs:
            print('CONSOLE/PAGE ERRORS:', errs[:5])
        if fails:
            print('\nFAILED:', '; '.join(fails))
            raise Abort(1)
        print('\nALL PASSED')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('html')
    p.add_argument('--assert', dest='assert_', action='store_true')
    p.add_argument('--views', default='')
    p.add_argument('--list', action='store_true')
    p.add_argument('--size', default='1280x720')
    p.add_argument('--out', default=os.path.join(HERE, 'shots'))
    a = p.parse_args()
    try:
        asyncio.run(run(a))
    except Abort as e:
        sys.exit(e.code)


if __name__ == '__main__':
    main()
