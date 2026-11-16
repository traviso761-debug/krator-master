#!/usr/bin/env python3
"""Headless check for the cave-light demo (core/cavelight/demo).

  python3 verify.py dist/cavelight-demo.html --assert [--out shots]

Runs the module's node tests (core/cavelight/test-cavelight.js, core/hazard/test-hazard-tunnel.js,
core/terrain/test-speleo-cleft.js), then loads the page through the shared harness (tools/harness.py) and walks its eight
views: the light's state at each (under or not, the exposure ramp, the ambient floor, the sun, the pool, the openings), the
mean brightness of the frame (never pure black underground, darker deep in than at the mouth), the hooded stop lamp on a spot,
the strips in the pool, the tunnels' hazards (the audit, a burst in its cell and not 200 m off), and the export. KRATOR_GL=gpu runs
it on the real GPU (the harness checks the renderer).
"""
import argparse, asyncio, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as _h
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

VIEWS = ['outside the portal', 'the mouth (10 m in)', 'half the ramp (150 m)', 'the bore, deep (380 m)', "the shaft's foot",
         'the refuge and its shrine', 'the hot stretch, strips lit', 'the far door (stop)']

VIEW_JS = """(n)=>{const A=window._api;A.at(5);A.setView(n);A.at(5);const s=A.state();s.luma=A.luma();
 const p=camera.position;s.near=KCAVELIGHT.near(p.x,p.y,p.z,18).map(r=>r.kind);return s;}"""

CHECK_JS = """()=>{const A=window._api,R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail:String(detail)});
 const H=KHAZ,reg=A.reg,recs=H.list(reg),burst=recs.find(r=>r.tags.hazard.kind==='rockburst');
 add('the tunnels\\' hazards pass their audit',H.tunnelAudit(reg).length===0,JSON.stringify(H.tunnelAudit(reg)));
 const B=H.burstAt(burst,9),inC=H.state(burst,9,null,B.x,0).k,far=H.state(burst,9,null,B.x+(B.cell<3?200:-200),0).k;
 add('a rockburst hits its cell and not 200 m down the stretch',inC===1&&far===0,'cell '+B.cell+': k '+inC+' there, '+far+' 200 m off');
 const X=KCAVELIGHT.export();add('the export carries every light record',X.format==='krator-cavelight'&&X.lights.length===KCAVELIGHT.all().length&&X.openings.length===2,X.lights.length+' lights, '+X.openings.length+' openings');
 add('the build is deterministic in what it places (74 lights, 30 crystals)',A.lights()===74&&A.crystals===30,A.lights()+' lights, '+A.crystals+' crystals');
 add('the error panel is empty',document.getElementById('errs').textContent.length===0,document.getElementById('errs').textContent.slice(0,200));
 return R;}"""


async def run(page, out):
    async with _h.verify_page(page, here=HERE) as V:
        pg, fails = V.page, V.fails
        S = {}
        for i, v in enumerate(VIEWS):
            S[v] = await pg.evaluate(VIEW_JS, v)
            if out:
                await V.shot(os.path.join(out, 'view-%d.png' % (i + 1)), view=v)
            s = S[v]
            print('  %-30s under %-5s exposure %.2f ambient %.2f sun %.2f pool %2d+%d openings %d  luma %5.1f  (%s)' % (
                v, s['under'], s['exposure'], s['ambient'], s['sun'], s['pool'], s['spots'], s['openings'], s['luma'],
                ('%.0f m from %s' % (s['d'], s['opening'])) if s.get('opening') else 'no opening'))
        o, m, h, dp, sh, rf, hot, door = (S[v] for v in VIEWS)
        checks = [
            ('outside: above ground, the surface exposure, the sun on, no pool', not o['under'] and abs(o['exposure'] - 1) < 1e-6 and o['sun'] > .99 and o['pool'] == 0, ''),
            ('the mouth: under, the sky still full, the sun going out', m['under'] and m['ambient'] > .9 and m['sun'] < .5, ''),
            ('the ramp rises going in and is clamped (mouth < 150 m < deep <= 1.8)', m['exposure'] < h['exposure'] < dp['exposure'] <= 1.8, '%.2f < %.2f < %.2f' % (m['exposure'], h['exposure'], dp['exposure'])),
            ('deep in: dark-adapted, the ambient at its floor, no sun, the pool full', dp['exposure'] >= 1.5 and abs(dp['ambient'] - .14) < 1e-6 and dp['sun'] == 0 and dp['pool'] == 14, ''),
            ('no dip going in: 150 m in is no darker than deep in (the ambient falls no faster than the eye adapts)', h['luma'] >= dp['luma'] * .9, 'luma %.1f at 150 m, %.1f deep' % (h['luma'], dp['luma'])),
            ('deep in is darker than the mouth but never pure black', 6 < dp['luma'] < m['luma'], 'luma %.1f deep, %.1f at the mouth' % (dp['luma'], m['luma'])),
            ("the shaft's foot: its daylight lit, the eye still dark-adapted (no flood round a narrow shaft)", sh['openings'] >= 1 and sh['opening'] == 'shaft' and sh['exposure'] > 1.4 and sh['ambient'] < .25, ''),
            ('the refuge: the wax key in the pool', 'wax' in rf['near'][:4], ','.join(rf['near'][:6])),
            ('the hot stretch: the strips in the pool', 'strip' in hot['near'][:6] and hot['pool'] > 0, ','.join(hot['near'][:6])),
            ('the far door: the hooded stop lamp on a spot', door['spots'] >= 1 and 'lamp-white' in door['near'], ''),
            ('the fog follows the exposure: the sky colour outside, the cave colour deep in, between at 150 m', o.get('fog') == '#9fc2e6' and dp.get('fog') == '#1c1712' and h.get('fog') not in ('#9fc2e6', '#1c1712'), '%s / %s / %s' % (o.get('fog'), h.get('fog'), dp.get('fog'))),
            ('every view underground has halos drawn', all(S[v]['halos'] > 70 for v in VIEWS), str(dp['halos'])),
        ]
        for name, ok, detail in checks:
            print(('PASS  ' if ok else 'FAIL  ') + name + ('  (' + detail + ')' if detail else ''))
            if not ok:
                fails.append(name)
        for r in await pg.evaluate(CHECK_JS):
            print(('PASS  ' if r['ok'] else 'FAIL  ') + r['name'] + ('  (' + r['detail'] + ')' if r['detail'] else ''))
            if not r['ok']:
                fails.append(r['name'])
        if V.errs:
            print('PAGE ERRORS:', *V.errs, sep='\n  '); fails.append('page errors')
    return V.exit()


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('page'); ap.add_argument('--assert', dest='do_assert', action='store_true'); ap.add_argument('--out', default=None)
    a = ap.parse_args()
    if a.out:
        os.makedirs(a.out, exist_ok=True)
    node = 'node'
    for t in ('core/cavelight/test-cavelight.js', 'core/hazard/test-hazard-tunnel.js', 'core/terrain/test-speleo-cleft.js'):
        r = subprocess.run([node, os.path.join(ROOT, t)], capture_output=True, text=True)
        print(('PASS  ' if r.returncode == 0 else 'FAIL  ') + 'node ' + t + '  (' + (r.stdout.strip().splitlines() or ['?'])[-1] + ')')
        if r.returncode:
            print(r.stdout)
            sys.exit(1)
    sys.exit(asyncio.run(run(a.page, a.out)))


if __name__ == '__main__':
    main()
