#!/usr/bin/env python3
"""Verify the Beast Riders kit's sheet (dist/beast-riders.html).

    python3 verify.py dist/beast-riders.html --assert [--shots DIR]

The page is loaded headless (tools/harness.py) and checked:
  - it loads clean: no page error, an empty error panel, the probe (window._kit) ready
  - every building of the culture builds without error, every variant (the kit's own and the catalog's)
  - each fits the box it declares: the measured w, d, h no more than 1.6 m over (the catalog's rule)
  - every catalog piece a building places is in the catalog (no missing furniture)
  - the detail maps: the kit's three surfaces (straw, guano, yard) are attached, and every map loaded
  - the dev tools are on the page: the click inspector, the hover inspector (T) and the polygon tool (P)
  - negative control: a building's declared box shrunk by 3 m must fail the box check
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

CHECKS = r"""(neg)=>{const K=window._kit,R=[],tol=1.6;
 const built=K.built.map(b=>Object.assign({},b,{decl:Object.assign({},b.decl)}));
 if(neg==='box'){built[0].decl.w-=3;}
 R.push({name:'every building builds (the kit\'s own and the catalog\'s, every variant)',ok:K.errors.length===0&&new Set(built.map(b=>b.key)).size===K.keys.length,
   detail:K.keys.length+' buildings, '+built.length+' built'+(K.errors.length?'; '+K.errors.slice(0,3).join('; '):'')});
 const over=built.filter(b=>b.w>b.decl.w+tol||b.d>b.decl.d+tol||b.h>b.decl.h+tol);
 R.push({name:'each fits its declared box (+'+tol+' m)',ok:over.length===0,detail:over.length?over.slice(0,4).map(b=>b.key+' '+b.w+'x'+b.d+'x'+b.h+' > '+b.decl.w+'x'+b.decl.d+'x'+b.decl.h).join('; '):'all '+built.length});
 const miss=[...new Set(built.flatMap(b=>b.missing||[]))];
 R.push({name:'every catalog piece placed is in the catalog',ok:miss.length===0,detail:miss.length?miss.join(', '):'none missing'});
 const fams=KF_API.textureInfo(),need=['straw','guano','yard'].filter(f=>fams.families.indexOf(f)<0);
 R.push({name:'the kit\'s surfaces attached (straw, guano, yard) and every map loaded',ok:need.length===0&&fams.pending===0,detail:fams.families.length+' families, '+fams.pending+' pending'+(need.length?'; missing '+need.join(', '):'')});
 const tools=['insp','hoverBtn','polyBtn'].filter(id=>!document.getElementById(id));
 R.push({name:'the dev tools are on the page (inspector, hover T, polygon P)',ok:tools.length===0,detail:tools.length?'missing '+tools.join(', '):'all three'});
 return R;}"""


async def run(a):
    import harness
    from playwright.async_api import async_playwright
    folder = os.path.dirname(os.path.dirname(os.path.abspath(a.html)))
    page = os.path.relpath(os.path.abspath(a.html), folder).replace(os.sep, '/')
    fails = []
    with harness.serve(folder) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            pg = await b.new_page(viewport={'width': 1280, 'height': 800})
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('http://127.0.0.1:%d/%s' % (port, page), timeout=0)
            await pg.wait_for_function('window._kit && _kit.ready && KF_API.textureInfo().pending===0', timeout=300000, polling=500)
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            ok = not errs and not panel
            print(('  PASS  ' if ok else '  FAIL  ') + 'loads clean : ' + ('no error' if ok else '; '.join(errs[:3]) + panel[:300]))
            if not ok:
                fails.append('load')
            if a.assert_:
                for r in await pg.evaluate(CHECKS, None):
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']:
                        fails.append(r['name'])
                r = [x for x in await pg.evaluate(CHECKS, 'box') if x['name'].startswith('each fits')][0]
                print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (a box shrunk by 3 m) : ' + r['detail'])
                if r['ok']:
                    fails.append('negative box')
            if a.shots:
                os.makedirs(a.shots, exist_ok=True)
                for i, name in enumerate(('mounts', 'catalog')):
                    await pg.evaluate("(i)=>{const R=_kit.rows[i];ctl.target.set((R.x0+R.x1)/2,4,R.z+10);ctl.dist=Math.max(70,(R.x1-R.x0)*0.55);ctl.az=0.5;ctl.el=0.45;updateCamera();}", i)
                    await pg.wait_for_timeout(1200)
                    await pg.screenshot(path=os.path.join(a.shots, 'beast-riders-%s.png' % name), timeout=120000)
            await b.close()
    print('\nOK' if not fails else '\nFAILED: ' + ', '.join(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--shots', default='')
    sys.exit(asyncio.run(run(ap.parse_args())))
