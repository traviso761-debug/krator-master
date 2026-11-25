#!/usr/bin/env python3
"""Headless check for the weather demo (core/atmos/wxdemo): the weather cells (W5) and the volumetric clouds (W6).

  KRATOR_GL=gpu python3 verify.py dist/wx-demo.html --assert [--out shots/] [--views front,under,village,aerial,above,fly,noon]
                                                    [--tiers volumes,layers] [--frames 120] [--timing] [--climate temperate]

Runs the node tests of the pieces it shows (core/atmos/wx/test-cells.js, core/atmos/test-volclouds.js), then loads the page
through the shared harness (tools/harness.py) with the clock held (?hold=1), and for each view and each cloud tier lets
--frames frames run (the clouds' history converge) and shoots it (<view>-<tier>.png: the before-and-after pairs). Asserts:
  the error panel is empty; the cells drive the weather (it rains at the 'under' view, the sky is clear at 'front' with the
  storm 7 km off); ?weather=clear holds the weather clear (the asserts' mode); the same view twice gives the same weather;
  a storm strikes when the clock runs; the volumes' programs compile under 5 s (SKY-PLAN.md 10: the sky once took 16.8 s).
--timing (run it on the arc lane: python3 tools/harness.py lock --lane arc -- ...): GPU ms of a whole frame at each tier and
of the cloud passes alone at res 2, 3 and 4, by EXT_disjoint_timer_query_webgl2 (minimum and median over 40 frames), with the
budget's step-down held off (?cloudauto=0); writes timing.json beside the shots.
"""
import argparse, asyncio, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as _h
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

NODE_TESTS = ['core/atmos/wx/test-cells.js', 'core/atmos/test-volclouds.js']
VIEWS = ['front', 'under', 'village', 'aerial', 'above', 'fly', 'noon']


async def ready(pg):
    for _ in range(240):
        if await pg.evaluate('()=>!!window._ready||document.getElementById("errs").textContent.length>0'):
            return True
        await pg.wait_for_timeout(250)
    return False


async def run(a):
    R = []
    for t in NODE_TESTS:
        p = subprocess.run(['node', os.path.join(ROOT, t)], capture_output=True, text=True, encoding='utf-8')
        R.append(('node ' + t, p.returncode == 0, (p.stdout + p.stderr)[-400:]))
    os.makedirs(a.out, exist_ok=True)
    q = '?hold=1&climate=%s%s' % (a.climate, '&cloudauto=0' if a.timing else '')
    timing = {}
    async with _h.verify_page(a.page, here=HERE, query=q, size=a.size) as V:
        pg = V.page
        base = 'http://127.0.0.1:%d/%s' % (V.port, os.path.basename(a.page))
        R.append(('the page builds', await ready(pg), ''))
        err = await pg.evaluate('()=>document.getElementById("errs").textContent')
        R.append(('the error panel is empty', not err, err[:300]))
        vol = await pg.evaluate('()=>_api.vol()')
        R.append(('the volumes\' programs compile under 5 s', bool(vol) and vol['compileMs'] is not None and vol['compileMs'] < 5000, str(vol and vol['compileMs']) + ' ms'))
        timing['compileMs'] = vol and vol['compileMs']
        # the weather the cells make at the views (pure: the same view twice is the same weather)
        u = await pg.evaluate('async()=>{_api.setView("under");await _api.frames(3);return _api.W();}')
        R.append(('the cells drive the weather: it rains at the under view', u['mode'] == 'live' and u['rain'] > .5, 'rain %.2f' % u['rain']))
        f1 = await pg.evaluate('async()=>{_api.setView("front");await _api.frames(2);return _api.W();}')
        f2 = await pg.evaluate('async()=>{_api.setView("under");await _api.frames(2);_api.setView("front");await _api.frames(2);return _api.W();}')
        R.append(('the same view twice is the same weather', abs(f1['rain'] - f2['rain']) < 1e-12 and abs(f1['wet'] - f2['wet']) < 1e-12 and abs(f1['fog'] - f2['fog']) < 1e-12, '%s / %s' % (f1['rain'], f2['rain'])))
        R.append(('the front view is dry with the storm 7 km off', f1['rain'] < .05, 'rain %.2f' % f1['rain']))
        # a storm strikes when the clock runs (x20 for a few seconds at the front view)
        s0 = await pg.evaluate('async()=>{_api.setView("front");_api.run();ATMOS.clock.scale=20;await new Promise(r=>setTimeout(r,6000));const s=_api.state();ATMOS.clock.scale=1;_api.hold();return s;}')
        R.append(('a storm strikes while the clock runs', s0['strikes'] > 0, 'strikes %d' % s0['strikes']))
        views = [v for v in a.views.split(',') if v]
        tiers = [t for t in a.tiers.split(',') if t]
        for v in views:
            for t in tiers:
                await pg.evaluate('async([v,t])=>{_api.tier(t);_api.setView(v);_api.hold();}', [v, t])
                await pg.evaluate('(n)=>_api.frames(n)', a.frames)
                await V.shot(os.path.join(a.out, '%s-%s.png' % (v, t)), view='%s, clouds %s' % (v, t))
        if a.timing:
            for v in ['front', 'noon', 'above']:
                await pg.evaluate('(v)=>{_api.setView(v);_api.hold();}', v)
                row = {}
                for t in ['layers', 'volumes']:
                    await pg.evaluate('(t)=>_api.tier(t)', t)
                    await pg.evaluate('(n)=>_api.frames(n)', 20)
                    row['frame-' + t] = await pg.evaluate('()=>_api.gpuMs("frame",40)')
                for res in [2, 3, 4]:
                    await pg.evaluate('(r)=>{_api.tier("volumes");_api.cfg({res:r});}', res)
                    await pg.evaluate('(n)=>_api.frames(n)', 20)
                    row['clouds-res%d' % res] = await pg.evaluate('()=>_api.gpuMs("clouds",40)')
                    if res in (2, 4):
                        for ps in ['mask', 'march', 'resolve', 'composite']:
                            row['%s-res%d' % (ps, res)] = await pg.evaluate('(w)=>_api.gpuMs(w,30)', ps)
                await pg.evaluate('()=>_api.cfg({res:2})')
                timing[v] = row
                print('timing %s: %s' % (v, json.dumps(row)))
            timing['renderer'] = V.renderer
            with open(os.path.join(a.out, 'timing.json'), 'w', encoding='utf-8', newline='\n') as f:
                json.dump(timing, f, indent=1)
        # ?weather=clear holds the weather clear: the asserts' mode
        await pg.goto(base + '?hold=1&weather=clear&view=under')
        await ready(pg)
        c = await pg.evaluate('async()=>{await _api.frames(3);return _api.W();}')
        R.append(('?weather=clear holds the weather clear at the storm', c['mode'] == 'clear' and c['rain'] < .01, '%s rain %.2f' % (c['mode'], c['rain'])))
        for name, ok, detail in R:
            print(('PASS  ' if ok else 'FAIL  ') + name + ('  (%s)' % detail if detail and not ok else ''))
            if not ok:
                V.fails.append(name)
    return V


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('page', nargs='?', default=os.path.join(HERE, 'dist', 'wx-demo.html'))
    ap.add_argument('--assert', dest='asserting', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--views', default=','.join(VIEWS))
    ap.add_argument('--tiers', default='volumes,layers')
    ap.add_argument('--frames', type=int, default=120)
    ap.add_argument('--climate', default='temperate')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--timing', action='store_true')
    a = ap.parse_args()
    V = asyncio.run(run(a))
    sys.exit(V.exit() if a.asserting else 0)


if __name__ == '__main__':
    main()
