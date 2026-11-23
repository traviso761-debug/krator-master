#!/usr/bin/env python3
"""Headless verification for Drum (settlements/drum).

Usage:
  python3 verify.py dist/drum.html [--assert] [--views "1,2"] [--all-views] [--out shots] [--query "..."]
"""
import argparse, asyncio, os, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import verify_page, parse_views, Abort


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    q = ('?' + a.query) if a.query else ''
    async with verify_page(a.html, here=HERE, size=a.size, query=q, settle_ms=0) as V:
        pg, errs, fails = V.page, V.errs, V.fails
        pg.set_default_timeout(900000)
        cerrs = ['console: ' + t[:300] for k, t in pg.krator_console if k == 'error']
        pg.on('console', lambda m: m.type == 'error' and cerrs.append('console: ' + m.text[:300]))
        if not V.ready:
            print('FAIL timed out waiting for window._ready')
            fails.append('build timeout')
        await pg.wait_for_timeout(1200)
        ep = await pg.evaluate("() => (document.getElementById('errs') && document.getElementById('errs').textContent) || ''")
        if ep.strip():
            print('FAIL error panel:', ep.strip()[:1500])
            fails.append('error panel')
        if errs or cerrs:
            print('FAIL page errors:', (errs + cerrs)[:8])
            fails.append('page errors')
        if a.assert_:
            checks = await pg.evaluate("() => window._api && window._api.hostChecks ? window._api.hostChecks() : []")
            for c in checks:
                ok = bool(c.get('ok'))
                print(('ok   ' if ok else 'FAIL ') + c.get('name', '?') + ' ' + str(c.get('detail', ''))[:300])
                if not ok:
                    fails.append('check: ' + c.get('name', '?'))
            negs = await pg.evaluate("() => window._api && window._api.hostNegatives ? window._api.hostNegatives() : []")
            for n in negs:
                ok = bool(n.get('ok') if 'ok' in n else n.get('failed'))
                print(('ok   ' if ok else 'FAIL ') + 'negative: ' + n.get('name', '?') + (' ' + str(n.get('detail', ''))[:200] if n.get('detail') else ''))
                if not ok:
                    fails.append('negative: ' + n.get('name', '?'))
        names = await pg.evaluate("() => typeof VIEWS !== 'undefined' ? Object.keys(VIEWS) : []")
        views = names if a.all_views else (parse_views(a.views, names) if a.views else [])
        for vn in views:
            ok = await pg.evaluate("v => { if (!VIEWS[v]) return false; KHOST.setView(...VIEWS[v]); return true; }", vn)
            if not ok:
                print('no such view:', vn)
                fails.append('view ' + vn)
                continue
            await pg.wait_for_timeout(int(a.settle * 1000))
            st = await pg.evaluate("() => ({calls: renderer.info.render.calls, tris: renderer.info.render.triangles})")
            fn = os.path.join(a.out, ''.join(ch if ch.isalnum() or ch in '-_.' else '_' for ch in vn)[:60] + '.png')
            await V.shot(fn, view=vn)
            print('view %-40s %4d calls %9d tris  shot' % (vn[:40], st['calls'], st['tris']))
        if not fails:
            print('verify clean (%d views)' % len(views))
        else:
            print('verify FAILED:', ', '.join(fails))
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--query', default='')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--settle', type=float, default=1.0)
    sys.exit(asyncio.run(run(ap.parse_args())))
