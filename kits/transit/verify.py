#!/usr/bin/env python3
"""Headless WebGL verification of kits/transit (dist/transit.html) on tools/harness.py."""
import argparse
import asyncio
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness  # noqa: E402


async def main(a):
    os.makedirs(a.out, exist_ok=True)
    async with harness.verify_page(a.html, here=HERE, checks=harness.SURVEY) as V:
        fails = V.fails
        try:
            await V.page.wait_for_function(
                "(window._ready===true && (window._texPending||0)===0) || !!(document.getElementById('errs') && document.getElementById('errs').textContent)",
                timeout=60000)
        except Exception:
            print('  note: wait_for_function timed out')
        await V.page.wait_for_timeout(300)
        res = await V.page.evaluate("""() => {
            if (!window._api || !_api.hostChecks) return null;
            const checks = _api.hostChecks();
            const negs = _api.hostNegatives();
            _api.setLockPhase(24);
            const p24 = { lock: _api.lockState(24), barge: _api.bargePose(24) };
            _api.setLockPhase(120);
            const p120 = { lock: _api.lockState(120), barge: _api.bargePose(120) };
            _api.setLockPhase(200);
            const p200 = { lock: _api.lockState(200), barge: _api.bargePose(200) };
            _api.setLockPhase(300);
            const p300 = { lock: _api.lockState(300), barge: _api.bargePose(300) };
            _api.setLockPhase(24);
            return {
                checks,
                negs,
                tags: _api.tags(),
                phases: { p24, p120, p200, p300 },
                expOk: typeof EXPORT !== 'undefined' && typeof EXPORT.world === 'function',
                render: _api.renderer ? { calls: _api.renderer.info.render.calls, triangles: _api.renderer.info.render.triangles } : null
            };
        }""")
        if not res:
            err_panel = await V.page.evaluate("() => { const el = document.getElementById('errs'); return el ? el.textContent : ''; }")
            print('  ERROR PANEL:', err_panel.strip() or '(empty)')
            for e in V.errs:
                print('  PAGE ERROR:', e)
            fails.append('missing window._api.hostChecks')
        else:
            ri = res.get('render') or {}
            ph = res['phases']
            print('  transit-kit  records=%d  calls=%s  tris=%s' % (
                res['tags']['records'], ri.get('calls', '?'), ri.get('triangles', '?')))
            print('  lock-transit t=24 (%s y=%.2f) -> t=120 (%s y=%.2f) -> t=200 (%s s=%.1f) -> t=300 (%s s=%.1f)' % (
                ph['p24']['barge']['stage'], ph['p24']['barge']['y'],
                ph['p120']['barge']['stage'], ph['p120']['barge']['y'],
                ph['p200']['barge']['stage'], ph['p200']['barge']['s'],
                ph['p300']['barge']['stage'], ph['p300']['barge']['s']))
            if a.assert_:
                for c in res['checks']:
                    print('  %s  %s  %s' % ('ok  ' if c['ok'] else 'FAIL', c['name'], c['detail']))
                    if not c['ok']:
                        fails.append(c['name'])
                for ng in res['negs']:
                    if not ng['failed']:
                        fails.append('negative check did not fail: ' + ng['name'])
                if not (ph['p120']['barge']['y'] > ph['p24']['barge']['y'] + 1.2 and ph['p120']['lock']['lowerGateDeg'] == 0):
                    fails.append('barge did not rise inside closed miter-lock chamber')
                if not (ph['p300']['barge']['s'] > 64.0 and ph['p300']['barge']['y'] >= 15.19):
                    fails.append('barge did not exit upper lock onto aqueduct pound')
                if not res['expOk']:
                    fails.append('EXPORT.world missing')

            views = harness.parse_views(a.views)
            if not views:
                views = await V.page.evaluate("() => Object.keys(TR_STAGE.views)")
            for v in views:
                await V.page.evaluate('(v) => window._api && window._api.view(v)', v)
                await V.page.wait_for_timeout(250)
                await V.shot(os.path.join(a.out, 'view_%s.png' % v.replace(' ', '_')), view=v)
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--views', default='')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    sys.exit(asyncio.run(main(ap.parse_args())))
