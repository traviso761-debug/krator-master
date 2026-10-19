#!/usr/bin/env python3
"""Verify the Beast Riders kit's sheet (dist/beast-riders.html).

    python3 verify.py dist/beast-riders.html --assert [--shots DIR]

The page is loaded headless (tools/harness.py) and checked:
  - it loads clean: no page error, an empty error panel, the probe (window._kit) ready
  - every building of the kit builds without error, every variant (the kit's own and the ports)
  - each fits the box it declares: the measured w, d, h no more than 1.6 m over (the catalog's rule)
  - every catalog piece a building places is in the catalog (no missing furniture)
  - the detail maps: the kit's three surfaces (straw, guano, yard) are attached, and every map loaded
  - the dev tools are on the page: the click inspector, the hover inspector (T) and the polygon tool (P)
  - negative control: a building's declared box shrunk by 3 m must fail the box check
  - the sedentary trades and the larger houses (src/51-54, BRT_ROWS): each carries a `job` from the catalog's FURN_JOBS or
    a `role`; each variant places 4+ catalog pieces; a building declared `against: 'back'` (the rock-backed longhouse)
    draws nothing behind its back plane (local z = -d/2) and reaches it
  - the census: every trade of the Voth city's census (IS_TRADES, read from kits/islanders/src/68-is-trades.js) has a
    row in BR_TRADES, carried by Beast Rider buildings of this page (culture beast-rider) or `na` with a reason; and
    the negatives: a row stripped of its buildings, and a row dropped, must both fail
  - the ports are their towns' buildings: each port's fabric (the town's kit meshes, no furniture), measured here in its
    local frame, matches the box the kit's own record of its marks gives (core/ports T.box); and (unless --no-towns) the
    box the TOWN'S PAGE gives for the same mark (settlements/girder/girder.html, settlements/mavs-refuge/mavs-refuge.html:
    window._ports.box, measured there from what the town drew), within 0.05 m on every face, and its furniture is the
    town's, piece for piece (key, variant, local place)
"""
import argparse, asyncio, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TOWN_PAGES = {'girder': 'settlements/girder/girder.html', 'mavs-refuge': 'settlements/mavs-refuge/mavs-refuge.html'}
TOL = 0.05
IS_TRADES_JS = os.path.join(ROOT, 'kits', 'islanders', 'src', '68-is-trades.js')
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

CHECKS = r"""(neg)=>{const K=window._kit,R=[],tol=1.6;
 const built=K.built.map(b=>Object.assign({},b,{decl:Object.assign({},b.decl)}));
 if(neg==='box'){built[0].decl.w-=3;}
 R.push({name:'every building builds (the kit\'s own and the ports, every variant)',ok:K.errors.length===0&&new Set(built.map(b=>b.key)).size===K.keys.length,
   detail:K.keys.length+' buildings, '+built.length+' built'+(K.errors.length?'; '+K.errors.slice(0,3).join('; '):'')});
 const over=built.filter(b=>b.w>b.decl.w+tol||b.d>b.decl.d+tol||b.h>b.decl.h+tol);
 R.push({name:'each fits its declared box (+'+tol+' m)',ok:over.length===0,detail:over.length?over.slice(0,4).map(b=>b.key+' '+b.w+'x'+b.d+'x'+b.h+' > '+b.decl.w+'x'+b.decl.d+'x'+b.decl.h).join('; '):'all '+built.length});
 const miss=[...new Set(built.flatMap(b=>b.missing||[]))];
 R.push({name:'every catalog piece placed is in the catalog',ok:miss.length===0,detail:miss.length?miss.join(', '):'none missing'});
 const fams=KF_API.textureInfo(),need=['straw','guano','yard'].filter(f=>fams.families.indexOf(f)<0);
 R.push({name:'the kit\'s surfaces attached (straw, guano, yard) and every map loaded',ok:need.length===0&&fams.pending===0,detail:fams.families.length+' families, '+fams.pending+' pending'+(need.length?'; missing '+need.join(', '):'')});
 const tools=['insp','hoverBtn','polyBtn'].filter(id=>!document.getElementById(id));
 R.push({name:'the dev tools are on the page (inspector, hover T, polygon P)',ok:tools.length===0,detail:tools.length?'missing '+tools.join(', '):'all three'});
 const ports=built.filter(b=>b.port), off=(a,b)=>Math.max(...[0,1,2].map(i=>Math.max(Math.abs(a.min[i]-b.min[i]),Math.abs(a.max[i]-b.max[i]))));
 const bad=ports.filter(b=>!(off(b.fabric,b.tracker)<=0.05));
 R.push({name:'each port\'s fabric, measured, is what its marks drew (core/ports T.box)',ok:ports.length>0&&bad.length===0,
   detail:bad.length?bad.slice(0,4).map(b=>b.key+' v'+b.v+' off '+off(b.fabric,b.tracker).toFixed(3)).join('; '):ports.length+' port variants'});
 return R;}"""

# the sedentary trades and the houses (src/51-54): tags, furniture, the flat back
BRT_JS = r"""()=>{const R=[],keys=new Set((typeof BRT_ROWS!=='undefined'?BRT_ROWS:[]).flatMap(r=>r.keys)),b=_kit.built.filter(e=>keys.has(e.key));
 const badTag=[...new Set(b.filter(e=>!(e.tags&&(FURN_JOBS.indexOf(e.tags.job)>=0||(!e.tags.job&&e.tags.role)))).map(e=>e.key))];
 R.push({name:'the trades and houses carry a catalog job or a role',ok:b.length>0&&badTag.length===0,detail:badTag.length?badTag.join(', '):keys.size+' buildings, '+b.length+' variants'});
 const few=b.filter(e=>e.nf<4);
 R.push({name:'each trade and house variant places 4+ catalog pieces',ok:b.length>0&&few.length===0,detail:few.length?few.map(e=>e.key+' v'+e.v+' '+e.nf).join('; '):'min '+Math.min(...b.map(e=>e.nf))+' pieces'});
 const back=b.filter(e=>e.tags.against==='back'),off=back.filter(e=>!(e.min[2]>=-e.decl.d/2-0.05&&e.min[2]<=-e.decl.d/2+0.3));
 R.push({name:'a rock-backed building draws nothing behind its back plane (z = -d/2) and reaches it',ok:back.length>0&&off.length===0,detail:off.length?off.map(e=>e.key+' v'+e.v+' back '+e.min[2]+' vs '+(-e.decl.d/2)).join('; '):back.length+' variants flat'});
 return R;}"""
# the census table: every IS_TRADES trade carried (keys of this page, culture beast-rider) or na with a reason
TRADES_JS = r"""([census,neg])=>{let T=(typeof BR_TRADES!=='undefined'?BR_TRADES:[]).map(r=>Object.assign({},r));
 if(neg==='strip'){const i=T.findIndex(r=>!r.na);T[i]=Object.assign({},T[i],{keys:[]});}
 if(neg==='drop'){T=T.slice(1);}
 const by={};T.forEach(r=>{by[r.trade]=r;});
 const bad=[];
 census.forEach(t=>{const r=by[t];
   if(!r){bad.push(t+': no row');return;}
   if(r.na){if(typeof r.na!=='string'||r.na.length<10||(r.keys&&r.keys.length))bad.push(t+': na without a reason');return;}
   if(!r.keys||!r.keys.length){bad.push(t+': no building');return;}
   r.keys.forEach(k=>{const A=ASSET_BY_KEY[k];if(!A||A.culture!=='beast-rider')bad.push(t+': '+k+' is not a beast-rider building here');});});
 T.forEach(r=>{if(census.indexOf(r.trade)<0)bad.push(r.trade+': not a census trade');});
 const na=T.filter(r=>r.na).length;
 return {ok:bad.length===0,detail:bad.length?bad.slice(0,4).join('; '):census.length+' census trades: '+(census.length-na)+' carried, '+na+' na'};}"""
PORTS_JS = "()=>_kit.built.filter(b=>b.port).map(b=>({key:b.key,v:b.v,town:b.town,name:b.name,def:b.def,fabric:b.fabric,furn:b.furn}))"
TOWN_JS = """(defs)=>defs.map(d=>{ const P=window._ports; if(!P) return {err:'no window._ports'};
  const ms=P.find(d); if(!ms.length) return {err:'no mark '+d.kind+' '+d.id};
  const b=P.box(d); return {box:{min:b.min,max:b.max},inst:b.inst,tris:b.tris,furn:P.furn(d)}; })"""


def furn_key(r):
    return (r['key'], r['variant'], round(r['lx'], 2), round(r['ly'], 2), round(r['lz'], 2))


async def town_check(b, ports):
    """each port against its town's page: the same mark measured there"""
    import harness
    fails, lines = [], []
    for town, page in TOWN_PAGES.items():
        mine = [p for p in ports if p['town'] == town]
        if not mine:
            continue
        with harness.serve(ROOT) as port:
            pg, errs, ready = await harness.open_page(b, os.path.join(ROOT, page), port, root=ROOT, query='?interiors=0')
            if not ready:
                fails.append(town + ': the town page never got ready')
                await pg.close()
                continue
            res = await pg.evaluate(TOWN_JS, [p['def'] for p in mine])
            await pg.close()
        for p, r in zip(mine, res):
            tag = '%s v%d (%s)' % (p['key'], p['v'], p['name'])
            if r.get('err'):
                fails.append(tag + ': ' + r['err'])
                continue
            off = max(max(abs(p['fabric']['min'][i] - r['box']['min'][i]), abs(p['fabric']['max'][i] - r['box']['max'][i])) for i in range(3))
            fa, fb = sorted(map(furn_key, p['furn'])), sorted(map(furn_key, r['furn']))
            ok = off <= TOL and fa == fb
            lines.append('%s %s: box off %.3f m, %d furniture pieces%s' % ('ok  ' if ok else 'FAIL', tag, off, len(fb),
                         '' if fa == fb else ' (the kit has %d, the town %d)' % (len(fa), len(fb))))
            if not ok:
                fails.append(tag)
    return fails, lines


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
            await pg.wait_for_function('window._kit && _kit.ready && KF_API.textureInfo().pending===0 && !(window._texPending>0)', timeout=300000, polling=500)
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
                for r in await pg.evaluate(BRT_JS):
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']:
                        fails.append(r['name'])
                with open(IS_TRADES_JS, encoding='utf-8') as fh:
                    census = re.findall(r"\{trade:'([^']+)'", fh.read())
                name = 'every census trade (IS_TRADES) is carried by a Beast Rider building, or na with a reason (BR_TRADES)'
                r = await pg.evaluate(TRADES_JS, [census, None])
                print(('  PASS  ' if r['ok'] and len(census) >= 40 else '  FAIL  ') + name + ' : ' + r['detail'])
                if not (r['ok'] and len(census) >= 40):
                    fails.append(name)
                for neg in ('strip', 'drop'):
                    r = await pg.evaluate(TRADES_JS, [census, neg])
                    print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (a census row %s) : ' % ('stripped of its buildings' if neg == 'strip' else 'dropped') + r['detail'])
                    if r['ok']:
                        fails.append('negative census ' + neg)
                ports = await pg.evaluate(PORTS_JS)
            if a.shots:
                os.makedirs(a.shots, exist_ok=True)
                titles = await pg.evaluate('_kit.rows.map(R=>R.title)')
                for i, name in enumerate(re.sub(r'[^a-z]+', '-', t.lower().split('(')[0]).strip('-')[:40] for t in titles):
                    await pg.evaluate("(i)=>{const R=_kit.rows[i];ctl.target.set((R.x0+R.x1)/2,4,R.z+10);ctl.dist=Math.max(70,(R.x1-R.x0)*0.55);ctl.az=0.5;ctl.el=0.45;updateCamera();if(typeof render==='function')render();}", i)
                    await pg.wait_for_timeout(1200)
                    await pg.screenshot(path=os.path.join(a.shots, 'beast-riders-%s.png' % name), timeout=120000)
            if a.assert_ and not a.no_towns:
                tf, tl = await town_check(b, ports)
                for ln in tl:
                    print('        ' + ln)
                name = "each port is its town's building (box within %.2f m in the town's page, the same furniture)" % TOL
                print(('  PASS  ' if not tf else '  FAIL  ') + name + ' : ' + ('%d port variants' % len(tl) if not tf else '; '.join(tf[:4])))
                if tf:
                    fails.append(name)
            await b.close()
    print('\nOK' if not fails else '\nFAILED: ' + ', '.join(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--shots', default='')
    ap.add_argument('--no-towns', dest='no_towns', action='store_true', help="skip the in-town check (it loads both towns' pages)")
    sys.exit(asyncio.run(run(ap.parse_args())))
