#!/usr/bin/env python3
"""Verify settlements/eternian-canal (Shuang-Zha / Chi-Ma, Twin-Locks at px 451, 782):
runs live WebGL hydraulic, miter-gate, zero-street-intrusion, 6-ward population, vessel-tag,
end-to-end barge lock+aqueduct transit & walkability asserts, then tools/harness.py SURVEY checks and shots."""
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
                timeout=120000)
        except Exception:
            print('  note: textures still decoding after 120s')
        await V.page.wait_for_timeout(400)
        res = await V.page.evaluate("""() => {
            if (!window._api || !_api.hostChecks) return null;
            const hc = _api.hostChecks();
            const l0 = _api.lockState(28);
            const b28 = _api.bargePoses(28)[0];
            _api.setLockPhase(120);
            const l120 = _api.lockState(120);
            const b120 = _api.bargePoses(120)[0];
            _api.setLockPhase(205);
            const b205 = _api.bargePoses(205)[0];
            _api.setLockPhase(28);
            _api.setLockPhase(null);
            const expOk = typeof EXPORT !== 'undefined' && typeof EXPORT.world === 'function';
            return {
                hc,
                l0: l0[0],
                l120: l120[0],
                b28,
                b120,
                b205,
                expOk,
                nan: _api.nanSweep(),
                furn: _api.furniture(),
                render: typeof renderer !== 'undefined' ? { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles } : null
            };
        }""")
        if not res:
            err_panel = await V.page.evaluate("() => { const el = document.getElementById('errs'); return el ? el.textContent : ''; }")
            print('  ERROR PANEL:', err_panel.strip() or '(empty)')
            for e in V.errs:
                print('  PAGE ERROR:', e)
            fails.append('missing window._api.hostChecks')
        else:
            hc = res['hc']
            c = hc['canal']
            ri = res.get('render') or {}
            print('  shuang-zha  sites=%d  records=%d  lots=%d  frontage=%.1f%%  furn=%d  vessels=%d (%d+%d)  calls=%s  tris=%s' % (
                hc['sites'], hc['records'], c['census']['lots'], c['frontageFill'] * 100.0, res['furn']['placed'],
                c['vesselTagCount'], c['mooredVessels'], c['movingVessels'],
                ri.get('calls', '?'), ri.get('triangles', '?')))
            print('  streets     wayIntrusions=%d  kmaskCanalHits=%d  emptyWays=%d  quadrants=%s' % (
                c['streetIntrusions'], c['kmaskCanalHits'], c['emptyWays'], c['quadrantLots']))
            print('  hydraulics  drop=%.2fm  maxHead=%.2fm  gateViolations=%d  transitFaults=%d  flooded=%d  overlaps=%d' % (
                c['totalDropM'], c['maxRiserHeadM'], c['miterGateViolations'], c['transitCourseFaults'],
                c['floodedLots'], c['obbOverlaps']))
            print('  barge-L1    t=28: %s y=%.2fm s=%.1f -> t=120: %s y=%.2fm -> t=205: %s y=%.2fm s=%.1f' % (
                res['b28']['stage'], res['b28']['y'], res['b28']['s'],
                res['b120']['stage'], res['b120']['y'],
                res['b205']['stage'], res['b205']['y'], res['b205']['s']))
            if a.assert_:
                if not c['poundMonotonic']:
                    fails.append('pound-ordering failed')
                if c['maxRiserHeadM'] > 3.50:
                    fails.append('lock-head-bounds exceeded: %.2f' % c['maxRiserHeadM'])
                if c['miterGateViolations'] != 0:
                    fails.append('miter-gate-law violations: %d' % c['miterGateViolations'])
                if c['streetIntrusions'] != 0:
                    fails.append('street-over-canal way intrusions: %d' % c['streetIntrusions'])
                if c['kmaskCanalHits'] != 0:
                    fails.append('KMASK road pixels inside canals: %d' % c['kmaskCanalHits'])
                if not c['wardsPopulated']:
                    fails.append('6-ward population / frontage check failed: fill=%.2f emptyWays=%d quads=%s' % (
                        c['frontageFill'], c['emptyWays'], c['quadrantLots']))
                if not c['vesselDimsOk']:
                    fails.append('canal vessel built bounding box mismatch')
                if not c['vesselTagsOk']:
                    fails.append('KTAGS vessel registration or vocab check failed')
                if c['transitCourseFaults'] != 0:
                    fails.append('end-to-end barge transit course faults: %d' % c['transitCourseFaults'])
                if c['floodedLots'] != 0:
                    fails.append('zero-flooded-lots failed: %d' % c['floodedLots'])
                if c['obbOverlaps'] != 0:
                    fails.append('zero-obb-overlaps failed: %d' % c['obbOverlaps'])
                if c['bridgeClearanceFailures'] != 0:
                    fails.append('barge-bridge-clearance failed: %d' % c['bridgeClearanceFailures'])
                if not c['aqueductOk']:
                    fails.append('aqueduct-underpass-clearance failed')
                if not c['towpathConnected']:
                    fails.append('towpath-connectivity failed')
                if res['nan'] != 0:
                    fails.append('nanSweep found %d bad geometries' % res['nan'])
                if hc['tags'].get('unknown', 0) != 0:
                    fails.append('KTAGS unknown vocabulary count: %d' % hc['tags']['unknown'])
                if not (res['b120']['y'] > res['b28']['y'] + 1.5 and res['l120']['lowerGateDeg'] == 0):
                    fails.append('live barge did not lift with chamber water behind closed lower miter gate')
                if not res['expOk']:
                    fails.append('core/export EXPORT.world missing')

            views = harness.parse_views(a.views)
            if not views:
                views = await V.page.evaluate("() => Object.keys(EC_VIEWS)")
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
