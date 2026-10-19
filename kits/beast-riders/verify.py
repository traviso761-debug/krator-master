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
  - the tent set (src/70-79): every trade the Scyvoi camp has (kits/scyvoi/src: each trade tent's job or role, and the
    herding and tethering roles of its pens, read from the Scyvoi source) has a Beast Rider tent or pen carrying that
    job or role (negative: the smithy taken away must fail); every tribe of the twelve has its camp in BR_CAMP and every
    key and variant a ground names exists, the flyers' bands camp only on the top with perch frames and feeding shelters
    and no pasture or hedge, the Dragonfly, Spider and Mammoth only on the floor, every floor ground inside a thorn hedge
    (negative: a key that does not exist must fail); BR_RUN cuts a closed boundary into pieces whose lengths add up to
    it, none longer than its span, its gates where asked
  - the rock-cut pieces (src/55-56): each one's back within its declared depth, nothing deeper under the wall's face
    than its embed, flat and wrapped round a stack (BR_ROCK.backOf); every kind present; their two surfaces attached;
    negative control: the same check with each embed 0.3 m less must fail
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
 if(neg==='back'){built.forEach(b=>{if(b.rock)b.rock=Object.assign({},b.rock,{e:b.rock.e-0.3});});}
 R.push({name:'every building builds (the kit\'s own and the ports, every variant)',ok:K.errors.length===0&&new Set(built.map(b=>b.key)).size===K.keys.length,
   detail:K.keys.length+' buildings, '+built.length+' built'+(K.errors.length?'; '+K.errors.slice(0,3).join('; '):'')});
 const over=built.filter(b=>b.w>b.decl.w+tol||b.d>b.decl.d+tol||b.h>b.decl.h+tol);
 R.push({name:'each fits its declared box (+'+tol+' m)',ok:over.length===0,detail:over.length?over.slice(0,4).map(b=>b.key+' '+b.w+'x'+b.d+'x'+b.h+' > '+b.decl.w+'x'+b.decl.d+'x'+b.decl.h).join('; '):'all '+built.length});
 const miss=[...new Set(built.flatMap(b=>b.missing||[]))];
 R.push({name:'every catalog piece placed is in the catalog',ok:miss.length===0,detail:miss.length?miss.join(', '):'none missing'});
 const fams=KF_API.textureInfo(),need=['straw','guano','yard'].filter(f=>fams.families.indexOf(f)<0);
 ['tenthide','pelt','canvas','lash'].forEach(f=>{if(fams.families.indexOf(f)<0)need.push(f);});
 R.push({name:'the kit\'s surfaces attached (straw, guano, yard; the tents\' tenthide, pelt, canvas, lash) and every map loaded',ok:need.length===0&&fams.pending===0,detail:fams.families.length+' families, '+fams.pending+' pending'+(need.length?'; missing '+need.join(', '):'')});
 const tools=['insp','hoverBtn','polyBtn'].filter(id=>!document.getElementById(id));
 R.push({name:'the dev tools are on the page (inspector, hover T, polygon P)',ok:tools.length===0,detail:tools.length?'missing '+tools.join(', '):'all three'});
 /* the rock-cut pieces (src/55-56): every back within the declared depth, nothing deeper under the wall's face than the
    piece's embed (flat and wrapped round a stack), every kind there (seven facades, twelve tribes, five shrines), their maps */
 const rk=built.filter(b=>b.rock),badB=rk.filter(b=>!(b.rock.minZ>=-b.decl.d/2-0.03&&b.rock.minN>=-b.rock.e-0.03));
 R.push({name:'each rock-cut piece\'s back stays within its declared depth and behind the wall\'s face by no more than its embed',ok:rk.length>0&&badB.length===0,
   detail:badB.length?badB.slice(0,4).map(b=>b.key+' v'+b.v+(b.wrapped?' (wrapped '+b.wrapped+')':'')+' minZ '+b.rock.minZ+' (d/2 '+(b.decl.d/2).toFixed(2)+') minN '+b.rock.minN+' (embed '+b.rock.e+')').join('; '):rk.length+' rock-cut builds, '+rk.filter(b=>b.wrapped).length+' wrapped round a stack'});
 const vs=k=>new Set(rk.filter(b=>b.key===k&&!b.wrapped).map(b=>b.v)).size,cov={facade:vs('br_bldg_rock_facade'),tribes:vs('br_bldg_rock_tribe_niche'),shrines:vs('br_bldg_rock_lamp_niche')};
 R.push({name:'the rock-cut kinds: seven gate-tree facades, twelve tribes\' niches, five shrines\' lamp niches, the cavern door and altar',ok:cov.facade===7&&cov.tribes===12&&cov.shrines===5&&vs('br_bldg_rock_cavern_door')===1&&vs('br_bldg_rock_altar')===1,detail:JSON.stringify(cov)});
 const rf=['sandstone','navajo'].filter(f=>fams.families.indexOf(f)<0);
 R.push({name:'the rock-cut surfaces attached (sandstone, navajo)',ok:rf.length===0,detail:rf.length?'missing '+rf.join(', '):'both'});
 const ports=built.filter(b=>b.port), off=(a,b)=>Math.max(...[0,1,2].map(i=>Math.max(Math.abs(a.min[i]-b.min[i]),Math.abs(a.max[i]-b.max[i]))));
 const bad=ports.filter(b=>!(off(b.fabric,b.tracker)<=0.05));
 R.push({name:'each port\'s fabric, measured, is what its marks drew (core/ports T.box)',ok:ports.length>0&&bad.length===0,
   detail:bad.length?bad.slice(0,4).map(b=>b.key+' v'+b.v+' off '+off(b.fabric,b.tracker).toFixed(3)).join('; '):ports.length+' port variants'});
 return R;}"""

TENT_TRADES_JS = r"""(a)=>{const A=ASSETS.filter(x=>/^br_(tent|hedge|fence)_/.test(x.key)&&x.key!==a.drop);
 const by=t=>A.filter(x=>x.tags&&(x.tags.job===t||x.tags.role===t)).map(x=>x.key);
 const miss=a.trades.filter(t=>!by(t).length);
 return {ok:a.trades.length>0&&miss.length===0,detail:miss.length?'no Beast Rider tent for: '+miss.join(', '):a.trades.map(t=>t+' -> '+by(t).join('/')).join('; ')};}"""

CAMP_JS = r"""(neg)=>{const C=JSON.parse(JSON.stringify(BR_CAMP)),bad=[];
 if(neg)C.raptor.grounds.lower.pens.push({key:'br_tent_no_such_pen',n:1,v:0});
 if(BR_CAMP_TRIBES.length!==12)bad.push(BR_CAMP_TRIBES.length+' tribes');
 const counts=[];
 BR_CAMP_TRIBES.forEach(t=>{const T=C[t];if(!T){bad.push(t+': no camp');return;}
  const gs=Object.keys(T.grounds);
  gs.forEach(g=>{const G=T.grounds[g],ks=[];G.tents.concat(G.pens).forEach(e=>ks.push([e.key,e.v]));
   if(G.hedge){ks.push([G.hedge.key,G.hedge.v]);ks.push([G.hedge.gate.key,G.hedge.gate.v]);}
   if(G.pasture){ks.push([G.pasture.fence.key,G.pasture.fence.v]);ks.push([G.pasture.fence.gate.key,G.pasture.fence.gate.v]);}
   ks.forEach(k=>{const A=ASSET_BY_KEY[k[0]];if(!A)bad.push(t+'/'+g+': no '+k[0]);else if(!(k[1]>=0&&k[1]<A.variants))bad.push(t+'/'+g+': '+k[0]+' has no variant '+k[1]);});
   if(g==='lower'&&!(G.hedge&&G.hedge.key==='br_hedge_thorn'))bad.push(t+'/lower: no thorn hedge');
   counts.push(t+'/'+g+' '+G.tents.reduce((s,e)=>s+e.n,0)+'t '+G.pens.reduce((s,e)=>s+e.n,0)+'p');});
  const pens=g=>(T.grounds[g]?T.grounds[g].pens.map(e=>e.key):[]);
  if(BR_CAMP_FLYERS.indexOf(t)>=0){if(gs.join()!=='upper')bad.push(t+': a flyers band camps only on the top');
   const U=T.grounds.upper;if(U&&(U.hedge||U.pasture))bad.push(t+': a flyers camp needs no pasture or hedge');
   if(pens('upper').indexOf('br_tent_perch_frame')<0||pens('upper').indexOf('br_tent_feed_shelter')<0)bad.push(t+': perch frames and a feeding shelter');}
  else if(['dragonfly','spider','mammoth'].indexOf(t)>=0){if(gs.join()!=='lower')bad.push(t+': camps only on the floor');}
  else if(gs.slice().sort().join()!=='lower,upper')bad.push(t+': a ground on the top and one on the floor');});
 const own={dragonfly:['br_tent_pond_nets','br_tent_net_house'],spider:['br_tent_spider_grove','br_tent_silk_house','br_tent_spinning_shed'],mammoth:['br_tent_mammoth_paddock']};
 for(const t in own)own[t].forEach(k=>{const G=C[t].grounds.lower;if(!G.tents.concat(G.pens).some(e=>e.key===k))bad.push(t+': no '+k);});
 return {ok:bad.length===0,detail:bad.length?bad.slice(0,5).join('; '):counts.join(', ')};}"""

RUN_JS = r"""()=>{const sq=[[0,0],[40,0],[40,30],[0,30]],R=BR_RUN(sq,{key:'br_hedge_thorn',closed:true,gates:[20,95],seed:3}),
 tot=R.reduce((s,p)=>s+p.span,0),gates=R.filter(p=>p.v===1).length,long=R.filter(p=>p.span>8.0001&&p.v===0).length,F=BR_RUN(sq,{key:'br_fence_rail',closed:true});
 const ok=Math.abs(tot-140)<0.01&&gates===2&&long===0&&R.every(p=>p.key==='br_hedge_thorn')&&Math.abs(F.reduce((s,p)=>s+p.span,0)-140)<0.01;
 return {ok:ok,detail:R.length+' hedge pieces, '+tot.toFixed(2)+' m of 140, '+gates+' gates; '+F.length+' fence pieces'};}"""


def scyvoi_trades():
    """the Scyvoi camp's trades, read from its source: the job or role of every trade tent (types industry, shop, market,
    religious) and the herding and tethering roles of its pens"""
    import glob, re
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'kits', 'scyvoi', 'src', '*.js'))):
        src = open(f, encoding='utf-8').read()
        for m in re.finditer(r"defBuilding\(\{key:'([^']+)'.*?tags:\{([^}]*)\}", src, re.S):
            tags = m.group(2)
            job, role = re.search(r"job:'([^']+)'", tags), re.search(r"role:'([^']+)'", tags)
            trade = re.search(r"types:\[[^\]]*'(industry|shop|market|religious)'", tags)
            if trade and (job or role):
                out.append((job or role).group(1))
            elif role and role.group(1) in ('herding', 'tethering'):
                out.append(role.group(1))
    return sorted(set(out))


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
                tr = scyvoi_trades()
                for name, js, arg, neg in (("every Scyvoi trade has a Beast Rider tent (%s)" % ', '.join(tr), TENT_TRADES_JS, {'trades': tr, 'drop': ''}, {'trades': tr, 'drop': 'br_tent_smithy'}),
                                           ("every tribe's camp (BR_CAMP) names existing keys and keeps the plan's grounds", CAMP_JS, False, True),
                                           ("BR_RUN lays a closed boundary into pieces and gates", RUN_JS, None, None)):
                    r = await pg.evaluate(js, arg) if arg is not None else await pg.evaluate(js)
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + name + ' : ' + r['detail'])
                    if not r['ok']:
                        fails.append(name)
                    if neg is not None:
                        r = await pg.evaluate(js, neg)
                        print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + ('the smithy taken away' if isinstance(neg, dict) else 'a key that does not exist') + ') : ' + r['detail'])
                        if r['ok']:
                            fails.append('negative: ' + name)
                r = [x for x in await pg.evaluate(CHECKS, 'back') if x['name'].startswith('each rock-cut')][0]
                print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (a rock-cut back 0.3 m deeper than its embed) : ' + r['detail'][:200])
                if r['ok']:
                    fails.append('negative back')
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
