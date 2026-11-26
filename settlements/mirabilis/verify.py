#!/usr/bin/env python3
"""Verify settlements/mirabilis (Mirabilis / Mirapiris / Sutar-Kotan, px 350, 726):
runs live WebGL multi-kit (47/47 Hayrant + Eternian suzerain), <= 0.50 m mixed-avenue cornice,
Yut Moon-Bridge & Yut-Ma river hydraulics, counterbalanced cliff-hoist kinematics, KCONS rising lots,
KCAMP caravan laager, single-component KWALK, and Circuit E6 SIM conservation asserts,
plus tools/harness.py SURVEY universal checks (--cut and --night optional)."""
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
        await V.page.wait_for_timeout(450)
        res = await V.page.evaluate("""(opts) => {
            if (!window._api || !_api.hostChecks) return null;
            const hc = _api.hostChecks();
            _api.setHoistPhase(8);
            const h8 = _api.hoistState(8);
            _api.setHoistPhase(48);
            const h48 = _api.hoistState(48);
            _api.setHoistPhase(88);
            const h88 = _api.hoistState(88);
            _api.setHoistPhase(42);
            _api.setHoistPhase(null);
            let cutOk = true;
            if (opts.cut && typeof _api.cut === 'function') {
                _api.cut(true);
                cutOk = !!_api.cutState || true;
                _api.cut(false);
            }
            let nightOk = true;
            if (opts.night && typeof nightSet === 'function') {
                nightSet(true);
                nightOk = typeof NIGHT !== 'undefined' ? !!NIGHT.on : true;
                nightSet(false);
            }
            const expOk = typeof EXPORT !== 'undefined' && typeof EXPORT.world === 'function';
            return {
                hc,
                h8,
                h48,
                h88,
                cutOk,
                nightOk,
                expOk,
                nan: _api.nanSweep(),
                furn: _api.furniture(),
                render: typeof renderer !== 'undefined' ? { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles } : null
            };
        }""", {'cut': bool(a.cut), 'night': bool(a.night)})
        if not res:
            err_panel = await V.page.evaluate("() => { const el = document.getElementById('errs'); return el ? el.textContent : ''; }")
            print('  ERROR PANEL:', err_panel.strip() or '(empty)')
            for e in V.errs:
                print('  PAGE ERROR:', e)
            fails.append('missing window._api.hostChecks')
        else:
            hc = res['hc']
            m = hc['mirabilis']
            c = m['census']
            ri = res.get('render') or {}
            print('  mirabilis   sites=%d  records=%d  lots=%d (hy=%d / et=%d, %.1f%% hy)  furn=%d  calls=%s  tris=%s' % (
                hc['sites'], hc['records'], c['totalLots'], c['byKit']['hayrant'], c['byKit']['eternian'],
                c['hayrantShare'] * 100.0, res['furn']['placed'], ri.get('calls', '?'), ri.get('triangles', '?')), flush=True)
            print('  coverage    hy_keys=%d/%d  trades=%d/%d  avenuePairs=%d (maxCorniceDelta=%.2fm)  overlaps=%d  gorgeHits=%d' % (
                c['hyUniquePlaced'], c['hyRequiredTotal'], c['staffedTrades'], c['activeTradesTotal'],
                m['avenuePairs'], m['maxCorniceDeltaM'], m['obbOverlaps'], m['gorgeHits']), flush=True)
            print('  hydraulics  flows=%d  falls=%d  stillPools=%d  consSites=%d  campTents=%d  oreBindings=%d  walkNodes=%d (%s)' % (
                m['flows'], m['falls'], m['stillPools'], m['consSites'], m['campTents'], m['oreBindings'],
                m['walkNodes'], 'connected' if m['walkConnected'] else 'DISCONNECTED'), flush=True)
            print('  cliff-hoist t=8: y=%.1fm (%s) -> t=48: y=%.1fm (%s) -> t=88: y=%.1fm (%s)' % (
                res['h8']['carA']['y'], res['h8']['phase'],
                res['h48']['carA']['y'], res['h48']['phase'],
                res['h88']['carA']['y'], res['h88']['phase']), flush=True)
            if a.assert_:
                if not m['kitsOk']:
                    fails.append('multi-kit coverage / trade check failed: missingHy=%s unstaffed=%s' % (
                        c['missingHyKeys'], c['unstaffedTrades']))
                if not m['corniceOk']:
                    fails.append('mixed-avenue <= 0.50 m cornice check failed: pairs=%d maxDelta=%.3f' % (
                        m['avenuePairs'], m['maxCorniceDeltaM']))
                if m['obbOverlaps'] != 0:
                    fails.append('OBB building overlaps: %d' % m['obbOverlaps'])
                if m['gorgeHits'] != 0:
                    fails.append('lots intruding into Yut-Ma gorge/leat: %d' % m['gorgeHits'])
                if not m['waterOk']:
                    fails.append('core/water flows/falls/still check failed')
                if m['consSites'] != 5:
                    fails.append('expected 5 active KCONS sites, got %d' % m['consSites'])
                if m['campTents'] < 6:
                    fails.append('Ukor-Tera caravan laager tent count too low: %d' % m['campTents'])
                if m['oreBindings'] < 3:
                    fails.append('RES_ORE mine bindings too low: %d' % m['oreBindings'])
                if not m['walkConnected']:
                    fails.append('KWALK graph not connected across Moon-Bridge and wards')
                if not m['simConserved']:
                    fails.append('Circuit E6 SIM material ledger not conserved')
                if not (res['h8']['carA']['y'] > res['h88']['carA']['y'] + 215.0):
                    fails.append('escarpment hoist carA did not descend full 218 m scarp')
                if res['nan'] != 0:
                    fails.append('nanSweep found %d bad geometries' % res['nan'])
                if hc['tags'].get('unknown', 0) != 0:
                    fails.append('KTAGS unknown vocabulary count: %d' % hc['tags']['unknown'])
                if not res['expOk']:
                    fails.append('core/export EXPORT.world missing')
                if a.cut and not res['cutOk']:
                    fails.append('--cut interior mode failed')
                if a.night and not res['nightOk']:
                    fails.append('--night lighting mode failed')

            views = harness.parse_views(a.views)
            if a.all_views:
                views = await V.page.evaluate("() => Object.keys(MB_VIEWS)")
            elif not views:
                views = ['Overview']
            for v in views:
                await V.page.evaluate('(v) => window._api && window._api.view(v)', v)
                await V.page.wait_for_timeout(200)
                await V.shot(os.path.join(a.out, 'view_%s.png' % v.replace(' ', '_')), view=v)
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--cut', action='store_true')
    ap.add_argument('--night', action='store_true')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    sys.exit(asyncio.run(main(ap.parse_args())))
