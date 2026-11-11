#!/usr/bin/env python3
"""Headless check for the effects demo (core/atmos/fxdemo).

  python3 verify.py dist/fx-demo.html --assert [--out shots/] [--scenes stilled,press,yards,terraces]

Runs the node tests of the pieces it shows, then loads the page through the shared harness (tools/harness.py) once a
scene, shoots every view, and checks what the scene is for:
  stilled  the zone is registered in core/tags before anything is drawn and core/hazard finds its stasis at the core; the
           core's particles (rate 1e-4) move under 5 cm in ten seconds (a fall's foot at 25 m/s, slowed ten thousand times) on the CPU twin; ON THE GPU two shots
           a second apart of the stopped fall barely differ, while the same two shots of the running fall outside do
  press    walking in, the walk slows and the eye drops by KANOM.walk; walking out, both come back exactly; the tower in
           the zone keeps fewer storeys than the one outside; core/hazard finds the crushing at the core and nothing outside
  yards    every effect recorded; the pools' acid and the arc's shock on core/hazard; ON THE GPU the slag heap glows at night
           (warm pixels with its heat on, far fewer with it off) and the plumes move
  terraces ON THE GPU the crop rows move with the gust (and hold still with the gust off); the spills land on the ground with a
           wet stain under them; the arcs' shock on core/hazard
"""
import argparse, asyncio, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as _h
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

NODE_TESTS = ['core/anomaly/test-anomaly.js', 'core/atmos/fx/test-localtime.js', 'core/atmos/fx/test-industry.js', 'core/atmos/fx/test-fx.js']
SCENES = ['stilled', 'press', 'yards', 'terraces']


def moved(a, b):
    """The share of pixels that changed by more than 12 levels in any channel between two shots."""
    from PIL import Image, ImageChops
    A, B = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    d = ImageChops.difference(A, B).convert('L').point(lambda v: 255 if v > 12 else 0)
    h = d.histogram()
    return h[255] / float(A.size[0] * A.size[1])


def warm(a):
    """The share of pixels that read as glowing slag: red and orange, well above their blue."""
    from PIL import Image
    A = Image.open(a).convert('RGB')
    px = A.getdata()
    n = sum(1 for r, g, b in px if r > 140 and r > 1.8 * b + 20 and r > 1.2 * g)
    return n / float(A.size[0] * A.size[1])


async def ready(pg):
    for _ in range(240):
        if await pg.evaluate('()=>!!window._ready||document.getElementById("errs").textContent.length>0'):
            return True
        await pg.wait_for_timeout(250)
    return False


async def run(page_path, out, scenes):
    os.makedirs(out, exist_ok=True)
    async with _h.verify_page(page_path, here=HERE, query='?scene=' + scenes[0]) as V:
        pg, fails = V.page, V.fails
        R = []
        for i, sc in enumerate(scenes):
            if i:
                await pg.goto('http://127.0.0.1:%d/%s?scene=%s' % (V.port, os.path.basename(page_path), sc))
            if not await ready(pg):
                R.append(('%s: the scene builds' % sc, False, 'timed out')); continue
            await pg.wait_for_timeout(1500)
            err = await pg.evaluate('()=>document.getElementById("errs").textContent')
            R.append(('%s: the error panel is empty' % sc, not err, err[:300]))
            views = await pg.evaluate('()=>_api.views')
            for j, name in enumerate(views):
                await pg.evaluate('(j)=>_api.setView(j)', j)
                await pg.wait_for_timeout(700)
                await V.shot(os.path.join(out, '%s-%d.png' % (sc, j)), view='%s: %s' % (sc, name))
            if sc == 'stilled':
                o = await pg.evaluate('()=>_api.order()')
                R.append(('stilled: the zone is in core/tags before it is drawn', o['zonesRegistered'] == o['zones'] == 1 and o['fxRecords'] == 1, str(o)))
                hz = await pg.evaluate('()=>KHAZ.at(0,0,0,0,_api.tags).map(h=>h.kind).join()+"|"+KHAZ.at(400,0,0,0,_api.tags).length')
                R.append(('stilled: core/hazard finds the stasis at the core and nothing outside', hz == 'time|0', hz))
                f = await pg.evaluate('()=>_api.frozenMove()')
                R.append(("stilled: the core's particles (rate 1e-4) move under 5 cm in 10 s", f['n'] > 2000 and f['m'] < .05 and f['jumps'] <= f['n'] * .002, '%d frozen, at most %.5f m, %d loop wraps' % (f['n'], f['m'], f['jumps'])))
                shots = {}
                for name in ('The stopped fall', 'Outside: the same, running'):
                    j = views.index(name)
                    await pg.evaluate('(j)=>_api.setView(j)', j)
                    await pg.wait_for_timeout(600)
                    a, b = os.path.join(out, 'still-%d-a.png' % j), os.path.join(out, 'still-%d-b.png' % j)
                    await pg.screenshot(path=a); await pg.wait_for_timeout(1000); await pg.screenshot(path=b)
                    shots[name] = moved(a, b)
                core, outside = shots['The stopped fall'], shots['Outside: the same, running']
                R.append(('stilled: on the GPU the stopped fall holds still while the outside one falls', core < .002 and outside > .01 and outside > 10 * core,
                          'changed pixels in 1 s: stopped %.4f, running %.4f' % (core, outside)))
            if sc == 'press':
                w_in = await pg.evaluate('()=>_api.walkAt(0,0)')
                w_out = await pg.evaluate('()=>_api.walkAt(300,0)')
                R.append(('press: walking in, the walk slows and the eye drops', w_in['inside'] and w_in['speed'] < .5 and w_in['eye'] < 1.7 * .9 and abs(w_in['g'] - 3) < 1e-6,
                          'speed x%.3f, eye %.2f m, %.2f g' % (w_in['speed'], w_in['eye'], w_in['g'])))
                R.append(('press: walking out, the speed and the eye come back', (not w_out['inside']) and abs(w_out['ctlSpeed'] - 1) < 1e-9 and abs(w_out['eye'] - 1.7) < 1e-9,
                          'speed %.3f, eye %.2f m' % (w_out['ctlSpeed'], w_out['eye'])))
                kept = await pg.evaluate('()=>_api.built.kept')
                R.append(('press: the tower in the zone keeps fewer storeys', kept[0] < kept[1], 'kept %d in the zone, %d outside' % tuple(kept)))
                hz = await pg.evaluate('()=>KHAZ.at(0,0,0,0,_api.tags).map(h=>h.kind).join()+"|"+KHAZ.at(400,0,0,0,_api.tags).length')
                R.append(('press: core/hazard finds the crushing at the core and nothing outside', hz == 'crushing|0', hz))
            if sc == 'yards':
                recs = await pg.evaluate('()=>_api.records()')
                need = ['plumes', 'sludge', 'spills', 'slag', 'sparks', 'arcs', 'localfx']
                R.append(('yards: every effect is recorded for the export', all(k in recs for k in need), ', '.join(sorted(set(recs)))))
                hz = await pg.evaluate('()=>[KHAZ.at(0,40,0,0,_api.tags).map(h=>h.kind).join(),KHAZ.at(100,48,0,0,_api.tags).map(h=>h.kind).join(),KHAZ.at(200,200,0,0,_api.tags).length].join("|")')
                R.append(('yards: core/hazard finds a pool\'s acid and the arc\'s shock where they are, nothing elsewhere', hz == 'acid|trap|0', hz))
                st = await pg.evaluate('()=>[ATMOS.spillAt(_api.built.spills,-30,20),ATMOS.spillAt(_api.built.spills,-30,60)]')
                R.append(('yards: a spill is full at its centre and absent outside it', st[0] == 1 and st[1] == 0, str(st)))
                j = views.index('The slag heap at night')
                await pg.evaluate('(j)=>_api.setView(j)', j); await pg.wait_for_timeout(600)
                hot = os.path.join(out, 'slag-hot.png'); cold = os.path.join(out, 'slag-cold.png')
                await pg.screenshot(path=hot)
                await pg.evaluate('()=>{const q=_api.built.slagU.q.value;_api._q=q.toArray();q.x=0;q.y=0;}'); await pg.wait_for_timeout(400)
                await pg.screenshot(path=cold)
                await pg.evaluate('()=>_api.built.slagU.q.value.fromArray(_api._q)')
                wh, wc = warm(hot), warm(cold)
                R.append(('yards: on the GPU the slag heap glows at night, and not with its heat off', wh > .003 and wh > 3 * wc, 'warm pixels: heat on %.4f, off %.4f' % (wh, wc)))
                j = views.index('Overview')
                await pg.evaluate('(j)=>_api.setView(j)', j); await pg.wait_for_timeout(600)
                a, b = os.path.join(out, 'yards-move-a.png'), os.path.join(out, 'yards-move-b.png')
                await pg.screenshot(path=a); await pg.wait_for_timeout(2000); await pg.screenshot(path=b)
                mv = moved(a, b)
                R.append(('yards: on the GPU the plumes move', mv > .003, 'changed pixels in 2 s: %.4f' % mv))
            if sc == 'terraces':
                n = await pg.evaluate('()=>_api.built.crops')
                j = views.index('The crop rows in the wind')
                await pg.evaluate('(j)=>_api.setView(j)', j); await pg.wait_for_timeout(600)
                a, b = os.path.join(out, 'crops-a.png'), os.path.join(out, 'crops-b.png')
                await pg.screenshot(path=a); await pg.wait_for_timeout(1000); await pg.screenshot(path=b)
                windy = moved(a, b)
                await pg.evaluate('()=>{_api._g=ATMOS.U.gustAmp.value;ATMOS.U.gustAmp.value=0;}'); await pg.wait_for_timeout(500)
                c, d = os.path.join(out, 'crops-c.png'), os.path.join(out, 'crops-d.png')
                await pg.screenshot(path=c); await pg.wait_for_timeout(1000); await pg.screenshot(path=d)
                calm = moved(c, d)
                await pg.evaluate('()=>{ATMOS.U.gustAmp.value=_api._g;}')
                R.append(('terraces: on the GPU the crop rows move with the gust and hold with it off', n > 20000 and windy > .003 and windy > 5 * calm,
                          '%d stems; changed pixels in 1 s: gusting %.4f, calm %.4f' % (n, windy, calm)))
                sp = await pg.evaluate('()=>_api.built.spills.map(s=>[s.foot[1],ATMOS.spillAt([ATMOS.spillRec(s.wet,1,1)],s.foot[0],s.foot[2]),s.drop])')
                R.append(('terraces: both spills land on the ground with a wet stain under them', all(abs(s[0]) < .05 and s[1] > .9 and s[2] > 15 for s in sp), str(sp)))
                hz = await pg.evaluate('()=>_api.built.arcs.map(r=>KHAZ.at(r.b[0],r.b[2],0,r.b[1],_api.tags).map(h=>h.kind).join()).join("|")')
                R.append(('terraces: each arc\'s shock is on core/hazard at its strike', hz == 'trap|trap', hz))
        for name, ok, detail in R:
            print(('PASS  ' if ok else 'FAIL  ') + name + ('  (' + detail + ')' if detail else ''))
            if not ok:
                fails.append(name)
        if V.errs:
            print('PAGE ERRORS:', *V.errs, sep='\n  '); fails.append('page errors')
    return V.exit()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('page'); ap.add_argument('--assert', dest='do_assert', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots')); ap.add_argument('--scenes', default=','.join(SCENES))
    a = ap.parse_args()
    fails = 0
    for t in NODE_TESTS:
        fails += 1 if subprocess.run(['node', os.path.join(ROOT, t)], stdout=subprocess.DEVNULL).returncode else 0
    print('node tests: %s' % ('all passed' if not fails else '%d failed' % fails))
    fails += 1 if asyncio.run(run(a.page, a.out, a.scenes.split(','))) else 0
    print('\n%s' % ('FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
