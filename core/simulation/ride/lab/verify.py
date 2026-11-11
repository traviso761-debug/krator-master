#!/usr/bin/env python3
"""The ride lab's checks (core/simulation/PLAN-RIDING.md section 8), each with a negative control.

  python3 verify.py dist/ride-lab.html --assert [--out shots]

Runs the node tests first (core/walk/frame, core/simulation/ride, the cargo), then on the page through the shared harness
(tools/harness.py verify_page, its universal asserts):
  - the walker, driven by real keys: with the doors shut it cannot step aboard (the negative); in the door window it walks
    in, and the moving car carries it down the Line, still on the car's floor; E sits it, E stands it
  - the travellers: every rider in a frame leg stands on its own car's floor (a rider lifted 0.5 m fails), every door
    crossing inside its window and no car over its room (SIM.rideAudit)
  - the goods: grain from Ledge reaches Twenny across the gap; the books balance (SIM.ledger; grain slipped into a store
    unbooked fails); the porters walk exactly while their carrier is on its way (the flipped state fails)
  - the views: Ledge station, the gap, the Line, aboard
"""
import argparse, asyncio, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(HERE))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as _h
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

NODE_TESTS = ['core/walk/frame/test-walk-frame.js', 'core/simulation/ride/test-ride.js', 'core/simulation/ride/test-ride-cargo.js']


def report(fails, name, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + name + ('  (' + detail + ')' if detail else ''))
    if not ok:
        fails.append(name)


async def run(page_path, out):
    async with _h.verify_page(page_path, here=HERE) as V:
        pg, fails = V.page, V.fails
        ev = pg.evaluate
        if not V.ready:
            fails.append('never ready')
            return V.exit()
        # ---- the walker: a dwell at Ledge ahead, the walker on the platform facing car 1's rear door
        d = await ev("()=>{const L=_api.lab;L.scale(0);const d=L.nextDwell('line.n','ledge',L.clock().t+30);L.setT(d.o0-2);"
                     "const w=L.doorWorld('line.n',1,'d+r',d.t0+1);L.standAt(w[0],1.1,-3.6,Math.PI);return {d,w};}")
        await pg.wait_for_timeout(400)
        await pg.keyboard.down('w'); await pg.wait_for_timeout(500); await pg.keyboard.up('w'); await pg.wait_for_timeout(300)
        shut = await ev("()=>({ride:_api.lab.ride(),feet:_api.lab.feet()})")
        report(fails, 'doors shut: the walker cannot step aboard (it stays on the platform)', shut['ride']['aboard'] is None and shut['feet'][2] < -1.6,
               'z %.2f, aboard %s' % (shut['feet'][2], shut['ride']['aboard']))
        await ev("(d)=>{const L=_api.lab;L.setT(d.d.o0+1);const w=d.w;L.standAt(w[0],1.1,-3.6,Math.PI);L.scale(1);}", d)
        await pg.wait_for_timeout(400)
        await pg.keyboard.down('w'); await pg.wait_for_timeout(450); await pg.keyboard.up('w'); await pg.wait_for_timeout(300)
        inn = await ev("()=>({ride:_api.lab.ride(),feet:_api.lab.feet(),t:_api.lab.clock().t})")
        report(fails, 'doors open: the walker walks through the door into the car', inn['ride']['aboard'] == 'line.n.car1',
               'aboard %s at z %.2f' % (inn['ride']['aboard'], inn['feet'][2]))
        x0 = inn['feet'][0]
        await ev("()=>_api.lab.scale(16)")
        await pg.wait_for_function("(o1)=>_api.lab.clock().t>o1+40", arg=d['d']['o1'], timeout=60000)
        await ev("()=>_api.lab.scale(0)")
        await pg.wait_for_timeout(200)
        ride = await ev("()=>{const R=_api.lab.ride(),f=_api.lab.feet(),P=SIM.rideCarPose('line.n',1,_api.lab.clock().t);return {R,f,cy:P.y,cx:P.x};}")
        loc = ride['R']['local'] or [9, 9, 9]
        report(fails, 'the moving car carries the walker down the Line, on its floor', ride['R']['aboard'] == 'line.n.car1' and ride['f'][0] - x0 > 50
               and abs(loc[0]) < 1.31 and abs(loc[2]) < 6.5 and abs(ride['f'][1] - (ride['cy'] + 1.1)) < 0.05,
               'carried %.0f m, local %s' % (ride['f'][0] - x0, [round(v, 2) for v in loc]))
        await pg.keyboard.press('e'); await pg.wait_for_timeout(200)
        sat = await ev("()=>_api.lab.ride()")
        await ev("()=>_api.lab.scale(4)"); await pg.wait_for_timeout(1000); await ev("()=>_api.lab.scale(0)")
        held = await ev("()=>_api.lab.ride()")
        await pg.keyboard.press('e'); await pg.wait_for_timeout(200)
        up = await ev("()=>_api.lab.ride()")
        report(fails, 'E sits the walker on a seat and holds it there as the car moves; E stands it', sat['sitting'] is not None and held['sitting'] == sat['sitting']
               and held['local'] and abs(held['local'][0] - sat['local'][0]) < 0.01 and abs(held['local'][2] - sat['local'][2]) < 0.01 and up['sitting'] is None,
               'seat %s' % sat['sitting'])
        if out:
            os.makedirs(out, exist_ok=True)
            await V.shot(os.path.join(out, 'aboard.png'), view='aboard')
        await ev("()=>{LABH.cam.walk(false,true);}")
        # ---- the travellers: run the world, then look while riders are aboard
        trav = await ev("""()=>{const L=_api.lab;L.run(300);let seen=0,miss=0,worst=0,neg=true,tries=0;
          while(seen<30&&tries<400){L.run(2);tries++;const f=L.onFloors(0);if(f.n){seen+=f.n;miss+=f.miss;worst=Math.max(worst,f.worst);
            const g=L.onFloors(0.5);if(g.miss===0&&g.worst<0.02)neg=false;}}
          return {seen,miss,worst,neg,audit:L.audit()};}""")
        report(fails, 'every rider aboard stands on its own car\'s floor (%d looks)' % trav['seen'], trav['seen'] >= 30 and trav['miss'] == 0 and trav['worst'] < 0.02 and trav['neg'],
               'worst %.3f m; lifted 0.5 m fails: %s' % (trav['worst'], trav['neg']))
        A = trav['audit']
        report(fails, 'every door crossing inside its window, no car over its room (%d boards, %d journeys)' % (A['boards'], A['journeys']),
               A['ok'] and A['journeys'] >= 40 and A['boards'] >= A['alights'] > 30, str(A))
        # ---- the goods: run until grain from Ledge has reached Twenny; the books; the porters
        cg = await ev("""()=>{const L=_api.lab;let c=L.cargo(),n=0;while(!(c.twennyGrain>0&&c.porters>0)&&n<60){L.run(60);c=L.cargo();n++;}
          let mism=0,flip=0;for(let i=0;i<400;i++){L.run(1);const p=L.porters();if((p.phase==='sail')!==p.moving)mism++;if((p.phase!=='sail')!==p.moving)flip++;}
          const st=SIM.R.place['gap.n.stop'].stock;st.grain=(st.grain||0)+50;const bad=L.cargo().ledger;st.grain-=50;
          return {c:L.cargo(),mism,flip,bad};}""")
        c = cg['c']
        report(fails, 'grain from Ledge reaches Twenny: north train, porters across the gap, south train', c['north'] > 0 and c['porters'] > 0 and c['south'] > 0 and c['twennyGrain'] > 0,
               'north %d, porters %d, south %d' % (c['north'], c['porters'], c['south']))
        report(fails, 'the books balance on every leg (SIM.ledger)', c['ledger'] and not cg['bad'], 'unbooked grain caught: %s' % (not cg['bad']))
        report(fails, 'the porters walk exactly while their carrier is on its way', cg['mism'] == 0 and cg['flip'] > 0, '%d trips' % c['trips'])
        if out:
            for v in ('Ledge station', 'The gap', 'The Line'):
                await ev("(v)=>KHOST.go(v)", v); await ev("()=>_api.lab.scale(1)"); await pg.wait_for_timeout(600)
                await V.shot(os.path.join(out, v.lower().replace(' ', '-') + '.png'), view=v)
        if V.errs:
            print('PAGE ERRORS:', *V.errs, sep='\n  '); fails.append('page errors')
    return V.exit()


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('page'); ap.add_argument('--assert', dest='do_assert', action='store_true'); ap.add_argument('--out')
    a = ap.parse_args()
    fails = 0
    for t in NODE_TESTS:
        r = subprocess.run(['node', os.path.join(ROOT, t)], capture_output=True, text=True)
        last = (r.stdout.strip().splitlines() or ['?'])[-1]
        print(('PASS  ' if r.returncode == 0 else 'FAIL  ') + t + '  (' + last + ')')
        fails += 1 if r.returncode else 0
    fails += 1 if asyncio.run(run(a.page, a.out)) else 0
    print('\n%s' % ('FAILED' if fails else 'all passed'))
    sys.exit(1 if fails and a.do_assert else 0)


if __name__ == '__main__':
    main()
