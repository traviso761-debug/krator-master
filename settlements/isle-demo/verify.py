#!/usr/bin/env python3
"""Verify the isle demo's site planner (dist/isle-site.html).

    python3 verify.py dist/isle-site.html --assert [--shots DIR]

For each town (Kautoa, Valapo) the page is loaded headless and checked:
  - it loads clean: no page error, the probe (window._site) ready without an error
  - the frame: the town's origin is its settlement point in the open world (moved by ISLE.SHIFT where the owner had it
    moved), its centre stands on land, the settlement point and a shore lie in the planning square
  - the ground is the open world's: the planner's height + the frame's sea level equals WORLD.H at the same world point
    (24 samples over the planning square), and the frame's sea is the water's level the world draws there
  - the editor works on it: a district, a marker and an avenue added, undone, redone; the town's save payload
    carries the frame and the drawing
  - negative controls: a shore pushed 4 km off must fail the frame check; a frame moved by 50 m must fail the ground check; a payload without its frame must fail
Then, without a browser:
  - serve.py's merge puts one town's site into a copy of the file and leaves the other town's entry as it was; it
    refuses a site without a frame and a town that is not on the map
  - the Voth files build.py reads in place still hash as voth-sources.json records them (else re-check, --accept)
"""
import argparse, asyncio, hashlib, json, os, shutil, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

CHECKS = r"""(neg)=>{const R=[],F=ISLE.F,S=WORLD_DATA.meta.settlements.find(s=>s.name===F.town);
 {const d=ISLE.SHIFT[F.town]||[0,0],ex=S.x+d[0],ez=S.z+d[1],ok=Math.abs(F.x-ex)<1e-6&&Math.abs(F.z-ez)<1e-6,h=VOTH.terrainH(0,0),sh=VOTH.landDist(0,0)+(neg==='shore'?4000:0);
  const pin=Math.abs(S.x-F.x)<3900&&Math.abs(S.z-F.z)<3900;
  R.push({name:'the frame: on land, the settlement point and a shore in the square',ok:ok&&h>0&&pin&&sh>0&&sh<3900,
   detail:'origin '+F.x+', '+F.z+' (settlement '+S.x+', '+S.z+(d[0]||d[1]?', moved '+d:'')+'), centre '+h.toFixed(1)+' m above the sea, the shore '+Math.round(sh)+' m away'+(pin?'':'; the settlement point is OUTSIDE the square')});}
 {const dx=neg==='frame'?50:0;let worst=0,at=null;
  for(let i=0;i<24;i++){const a=i*2.399963,r=3800*Math.sqrt((i+.5)/24),lx=Math.cos(a)*r,lz=Math.sin(a)*r;
   const d=Math.abs(TERR.h(lx,lz)+F.sea-WORLD.H(F.x+lx+dx,F.z+lz));if(d>worst){worst=d;at=[Math.round(lx),Math.round(lz)];}}
  let sea=null;for(let r=0;r<=12000&&sea==null;r+=250)for(let k=0;k<64;k++){const w=WORLD.lakeWater(F.x+Math.cos(k/64*6.2832)*r,F.z+Math.sin(k/64*6.2832)*r);if(w>-1e8){sea=w;break;}}
  const ok=worst<0.01&&sea!=null&&Math.abs(sea-F.sea)<0.01;
  R.push({name:"the ground is the open world's",ok,detail:'24 samples, worst '+worst.toFixed(3)+' m at '+at+'; the frame sea '+F.sea+', the world water '+(sea==null?'none':sea.toFixed(2))});}
 {const c0=[SITE.data.districts.length,SITE.data.markers.length,SITE.data.avenues.length];
  const u0=SITE.undo.length,d=SITE.addDistrict('plaza',[[-60,-60],[60,-60],[60,60],[-60,60]]),m=SITE.addMarker(100,100),a=SITE.addLine('avenue',[[-200,0],[200,0]]);
  const n1=[SITE.data.districts.length,SITE.data.markers.length,SITE.data.avenues.length];
  SITE.doUndo();SITE.doUndo();SITE.doUndo();const n0=[SITE.data.districts.length,SITE.data.markers.length,SITE.data.avenues.length];
  SITE.doRedo();const area=SITE.area(SITE.district(d.id).poly);
  const P=JSON.parse(ISLE.townJSON());if(neg==='payload')delete P.frame;
  const pay=P.frame&&P.frame.town===F.town&&isFinite(P.frame.sea)&&Array.isArray(P.districts)&&P.districts.some(q=>q.id===d.id);
  SITE.doUndo();while(SITE.undo.length>u0)SITE.doUndo();SITE.dirty=false;TOOL.status();
  const ok=n1.join()===c0.map(c=>c+1).join()&&n0.join()===c0.join()&&Math.abs(area-14400)<1&&!!pay;
  R.push({name:'the editor draws on it and saves the town with its frame',ok,detail:'drawn '+c0+', added '+n1+', undone '+n0+', redone plaza '+area.toFixed(0)+' m2; payload '+(pay?'carries the frame and the drawing':'MISSING its frame or drawing')});}
 return R;}"""


"""The city page (dist/isle-city.html, P6): python3 verify.py dist/isle-city.html --assert [--shots DIR]. Each town is
opened (?town=) and, once both towns are planned (window._city.both):
  - it loads clean: no page error, no kit error (ISK.errors, IZV.errors), every piece drawn near the camera built
  - each town's checks (src/34-isle-census.js ISLE.checks): exact footprint overlap, nothing on a street, in the sea or
    on the wall, the vessels afloat, the programme (PLAN.md section 8: the landmarks, Izanitown, the works quarter,
    Ridertown, both harbours' vessels and origins, the wall's named gates, the landing), the size, the hug, the farmland
  - the declared boxes the plan placed by (ISLE_DIMS, ISLE_VDIMS, read from the kits' sources) are the bundles' own
  - negative controls: a building pushed onto its neighbour, one pushed into the sea, the palace (or Valapo's hall) taken
    away: each must fail its check
  - on the Valapo page, both towns on core/simulation (SIM_JS below), the citizens drawn near the camera (CIT_JS), the
    canoe line (CANOE_JS, TRADE_JS), the week test at the two levels (WEEK_JS), the sim export section (SIMX_JS)"""
CITY_JS = r"""(neg)=>{const C=window._city,out=[],town=C.town,R=C.cur.R,G=C.cur.G;
 if(!neg){
  for(const t in C.checks)C.checks[t].forEach(c=>out.push(c));
  const bad=[],ik=ISK.dims(),iz=IZV.dims();
  for(const k in ISLE_DIMS){const D=ISLE_DIMS[k],B=D.kit==='isk'?ik[k]:D.kit==='izv'?iz[k]:D.kit==='cat'?CAT.ASSET_BY_KEY[k]:null;
   if(!B||Math.abs(B.w-D.w)>1e-6||Math.abs(B.d-D.d)>1e-6||Math.abs((B.h||8)-D.h)>1e-6)bad.push(k);}
  for(const k in ISLE_VDIMS){const B=RINGSEA.dims[k];if(B&&(B.L!==ISLE_VDIMS[k].L||B.B!==ISLE_VDIMS[k].B))bad.push(k);}
  const used=new Set(R.vessels.map(v=>v.key));const lack=[...used].filter(k=>!RINGSEA.dims[k]);
  out.push({name:'the declared boxes the plan placed by are the bundles\' own',ok:!bad.length&&!lack.length,detail:Object.keys(ISLE_DIMS).length+' pieces, '+Object.keys(ISLE_VDIMS).length+' vessels'+(bad.length?'; differ: '+bad.slice(0,6).join(', '):'')+(lack.length?'; not bundled: '+lack.join(', '):'')});
  const ke=ISK.errors.concat(IZV.errors),pf=Object.keys(C.failed);
  out.push({name:town+': the kits build every piece drawn (no kit error)',ok:!ke.length&&!pf.length,detail:C.draw.protos+' pieces built, '+C.draw.near+' drawn in full, '+C.draw.vessels+' vessels'+(ke.length?'; '+ke[0].slice(0,200):'')+(pf.length?'; failed '+pf.join(', '):'')});
  return out;}
 const L=R.lots.map(l=>Object.assign({},l));
 if(neg==='overlap'){const a=L.find(l=>l.cls!=='landmark'),b=L.find(l=>l!==a&&l.cls!=='landmark');b.bo=Object.assign({},b.bo,{c:a.bo.c.slice()});b.x=a.x;b.z=a.z;
  return ISLE.checks(R,G,{lots:L}).filter(c=>/overlap/.test(c.name));}
 if(neg==='sea'){const a=L.find(l=>l.cls!=='landmark'&&!l.shore),v=R.vessels[0];a.bo=Object.assign({},a.bo,{c:[v.x,v.z]});a.x=v.x;a.z=v.z;
  return ISLE.checks(R,G,{lots:L}).filter(c=>/in the sea/.test(c.name));}
 if(neg==='landmark'){const R2=Object.assign({},R,{lots:R.lots.filter(l=>l.role!=='palace'&&l.role!=='village hall')});
  return ISLE.checks(R2,G).filter(c=>/landmarks the brief/.test(c.name));}
 return [];}"""


"""P7b: both towns on core/simulation (src/40-46), checked on the Valapo page under --assert (the page declares both,
in one order, whichever town it draws). SIM_JS runs a world day minute by minute (ISLE.simDay, once) and returns for a
town ({town, neg}) src/45-isle-sim-checks.js's checks: every lot of a census trade (kits/islanders IS_TRADES) a place,
every resident a home and every worker a job in the town (its census's people, every post filled), the stocks map
finding every place from its lot, the food made, hauled and eaten with nothing short for the day and the food made
covering what was eaten. Each check has a negative (neg): a trade's lot taken from the places, a resident housed in the
other town, a worker without a job, a place the stocks map cannot find, a food never hauled, a purchase out of stock,
half the food made."""
# the citizens drawn near the camera (src/59-isle-citizens.js), after the day: the world run on to mid-morning, the camera
# at a busy place of the drawn town; the negative moves one drawn figure 50 m from its actor's pose
CIT_JS = r"""(neg)=>{const S=ISLE.SIM,end=ISLE.TUNE.sim.clock.start+1440+600;if(S.clock.m<end)ISLE.simRun(end-S.clock.m);
 ISLE.view(ISLE.cur.town==='Valapo'?'village hall':'palace');ISLE.citizens.update();return ISLE.citizens.check({shift:!!neg});}"""
# P7c, the canoe line (src/47-isle-trade.js, 61-isle-canoes.js): an hour into the next day (a lakatoi docked at each stop),
# the drawn town's vessels shown exactly while docked (the negative flips one); then, after the citizens (mid-morning),
# the line's checks on a snapshot of the books (ISLE.tradeChecks) and each with its negative on a changed copy
CANOE_JS = r"""(neg)=>{const S=ISLE.SIM,end=ISLE.TUNE.sim.clock.start+1440+60;if(S.clock.m<end)ISLE.simRun(end-S.clock.m);return ISLE.canoes.check({flip:!!neg});}"""
TRADE_JS = r"""(neg)=>{const P={};Object.keys(_city.simPlans).forEach(t=>{P[t]={R:_city.simPlans[t],G:t===_city.town?_city.cur.G:_city.otherG};});
 const B=ISLE.tradeBooks(),C=()=>JSON.parse(JSON.stringify(B)),pick=(rs,re)=>rs.filter(c=>re.test(c.name));
 if(!neg)return ISLE.tradeChecks(B,P);
 if(neg==='berth'){const b=C(),L=P.Valapo.R.lots[0];b.berths.valapo[0].x=L.x;b.berths.valapo[0].z=L.z;return pick(ISLE.tradeChecks(b,P),/berth/);}
 if(neg==='ways'){const b=C();b.routes.lakatoi.shipped['kautoa>valapo']={};return pick(ISLE.tradeChecks(b,P),/both ways/);}
 if(neg==='trace'){const b=C();b.routes.lakatoi.landed['valapo>kautoa']={};return pick(ISLE.tradeChecks(b,P),/traced/);}
 if(neg==='imported'){const b=C();Object.keys(b.towns.kautoa.rows).forEach(g=>{b.towns.kautoa.rows[g].imported=0;});return pick(ISLE.tradeChecks(b,P),/goods imported/);}
 if(neg==='sea'){const b=C(),g=B.goods.find(g=>b.towns.valapo.rows[g]);b.towns.valapo.rows[g].inbound+=5;return pick(ISLE.tradeChecks(b,P),/in transit/);}
 if(neg==='balance'){const b=C(),g=B.goods.find(g=>b.towns.kautoa.rows[g]&&b.towns.kautoa.rows[g].today);b.towns.kautoa.rows[g].today.change+=10;return pick(ISLE.tradeChecks(b,P),/balance/);}
 return [];}"""
TRADE_NEGS = ('berth', 'ways', 'trace', 'imported', 'sea', 'balance')
# P7d, the week test (src/48-isle-week.js; PLAN.md section 7): after the canoe line's checks, a week with Valapo watched
# (Kautoa abstract), then a week with Kautoa watched (Valapo abstract), and ISLE.weekChecks on the two; each with its
# negative on a changed copy. The page keeps the two weeks (window._week) and the wall time of each
WEEK_JS = r"""(neg)=>{if(!window._week){const w1=ISLE.simWeek('Valapo',7*1440),w2=ISLE.simWeek('Kautoa',7*1440);ISLE.simWatch(_city.town);window._week=[w1,w2];}
 const [w1,w2]=window._week,cp=w=>JSON.parse(JSON.stringify(w)),pick=(rs,re)=>rs.filter(c=>re.test(c.name));
 if(!neg)return {ms:[w1.ms,w2.ms],checks:ISLE.weekChecks(w1,w2)};
 if(neg==='balance'){const a=cp(w1);a.b.towns.valapo.goods.fish.total+=50;return pick(ISLE.weekChecks(a,w2),/balance/);}
 if(neg==='sea'){const a=cp(w1),R=a.b.routes.lakatoi,k=Object.keys(R.landed)[0],g=Object.keys(R.landed[k])[0];R.landed[k][g]-=10;return pick(ISLE.weekChecks(a,w2),/landed or is at sea/);}
 if(neg==='booked'){const a=cp(w1),s=a.abstract,g=Object.keys(a.b.towns[s].goods).find(g=>a.b.towns[s].goods[g].imported>a.a.towns[s].goods[g].imported);a.b.towns[s].goods[g].imported-=5;return pick(ISLE.weekChecks(a,w2),/booked there/);}
 if(neg==='rate'){const a=cp(w1);a.b.towns.kautoa.food=a.a.towns.kautoa.food;return pick(ISLE.weekChecks(a,w2),/a worker a day/);}
 if(neg==='decided'){const a=cp(w1);a.decided=3;return pick(ISLE.weekChecks(a,w2),/decided/);}
 if(neg==='late'){const a=cp(w1);a.days[4].towns.valapo.goods.fish.short+=5;return pick(ISLE.weekChecks(a,w2),/short after the second day/);}
 if(neg==='swing'){const a=cp(w1);a.days.forEach((x,j)=>{if(j%2)x.towns.kautoa.goods.rice.total*=1.6;});return pick(ISLE.weekChecks(a,w2),/stock steady/);}
 if(neg==='drift'){const b=cp(w2);b.days.forEach((x,j)=>{x.towns.valapo.gov.target=1000;x.towns.valapo.gov.pos+=j*3000;});return pick(ISLE.weekChecks(w1,b),/food supply line/);}
 if(neg==='gear'){const b=cp(w2);b.b.towns.kautoa.wear.held=Math.floor(b.b.towns.kautoa.wear.held/2);return pick(ISLE.weekChecks(w1,b),/hold their tools/);}
 if(neg==='needs'){const a=cp(w1);a.b.towns.valapo.needs.mean.eat=95;return pick(ISLE.weekChecks(a,w2),/content enough/);}
 if(neg==='clad'){const a=cp(w1);a.b.towns.valapo.wear.hurtOld=4;return pick(ISLE.weekChecks(a,w2),/keep their clothes/);}
 if(neg==='ships'){const a=cp(w1),b=cp(w2);a.b.towns.kautoa.sold=Object.assign({},a.a.towns.kautoa.sold);b.b.towns.kautoa.sold=Object.assign({},b.a.towns.kautoa.sold);return pick(ISLE.weekChecks(a,b),/ships from beyond/);}
 return [];}"""
WEEK_NEGS = ('balance', 'sea', 'booked', 'rate', 'decided', 'ships', 'late', 'swing', 'drift', 'gear', 'needs', 'clad')
# P7e: the `sim` export section (src/50) after the week: src/50's checks on ISLE.simExport(), each with a negative, and
# EXPORT.check under the profile ['sim'] failing on a stubbed section and passing filled
SIMX_JS = r"""(neg)=>{const doc=JSON.parse(JSON.stringify(ISLE.simExport())),pick=(rs,re)=>rs.filter(c=>re.test(c.name));
 const prof=()=>{const w=EXPORT.world({sections:['sim']}),c=EXPORT.check(w,{profile:['sim']});return {st:w.sections.sim.status,ok:c.ok};};
 if(!neg){const out=ISLE.simExportChecks(doc),f=prof(),off=EXPORT.register('sim',()=>null,{by:'isle-sim'});off();const s=prof();ISLE.simExportRegister();const r=prof();
  out.push({name:'the sim export: EXPORT.check under the profile [sim] fails on a stubbed section and passes filled',ok:f.ok&&f.st==='ok'&&!s.ok&&s.st==='stub'&&r.ok,detail:'filled '+f.st+', stubbed '+s.st+', registered again '+r.st+'; '+(JSON.stringify(doc).length/1024|0)+' KB'});return out;}
 if(neg==='home'){const a=doc.actors.find(a=>a.settlement==='valapo'&&a.home);a.home=doc.actors.find(b=>b.settlement==='kautoa'&&b.home).home;return pick(ISLE.simExportChecks(doc),/own settlement/);}
 if(neg==='stock'){const T=doc.settlements[0];T.goods[Object.keys(T.goods)[0]].warehouses+=7;return pick(ISLE.simExportChecks(doc),/place records hold/);}
 if(neg==='sea'){const R=doc.routes[0],k=Object.keys(R.shipped)[0];R.shipped[k][Object.keys(R.shipped[k])[0]]+=5;return pick(ISLE.simExportChecks(doc),/landed or is at sea/);}
 if(neg==='count'){const T=doc.settlements[1];T.goods[Object.keys(T.goods)[0]].made=-1;return pick(ISLE.simExportChecks(doc),/is a count/);}
 return [];}"""
SIMX_NEGS = ('home', 'stock', 'sea', 'count')
SIM_TOWNS = ('Kautoa', 'Valapo')
SIM_NEGS = ('lot', 'home', 'job', 'age', 'social', 'map', 'haul', 'short', 'made')
SIM_JS = r"""(q)=>{const C=window._city,town=q.town,neg=q.neg,R=C.simPlans[town],s=ISLE.TUNE.sim.towns[town].id,X=ISLE.SIM.towns[s];
 if(!ISLE.SIM.dayMs){const t0=performance.now(),c=ISLE.TUNE.sim.clock.start+630;ISLE.simRun(c-ISLE.SIM.clock.m);ISLE.SIM.soc={};ISLE.SIM.order.forEach(k=>{ISLE.SIM.soc[k]=ISLE.simSocial(k);});ISLE.simDay();ISLE.SIM.dayMs=Math.round(performance.now()-t0);}
 const books=ISLE.simBooks(s),res=()=>SIM.all('actor').filter(a=>!a.driven&&SIM.R.role[a.role].settlement===s).map(a=>Object.assign({},a)),cp=()=>JSON.parse(JSON.stringify(books));
 const own=()=>SIM.all('place').filter(P=>P.settlement===s),f0=Object.keys(books.foods)[0];
 if(!neg)return {info:{places:X.places.places.length,homes:X.places.homes,beds:X.places.beds,posts:X.places.posts,people:X.pop.actors,workers:X.pop.workers,carts:X.econ.carts,
   warehouses:X.econ.warehouses,foods:X.econ.foods,producers:X.econ.producers,nav:X.nav,problems:ISLE.SIM.problems.slice(0,3),routeFail:SIM.routeFail.length,declareMs:ISLE.SIM.ms.declare,dayMs:ISLE.SIM.dayMs},
  people:ISLE.simDemography(s),level:ISLE.SIM.soc[s].level,checks:ISLE.simChecks(R).concat(ISLE.simFoodChecks(R,books),ISLE.SIM.soc[s].level==='presented'?[ISLE.simSocialCheck(R,ISLE.SIM.soc[s])]:[])};
 const pick=(rs,re)=>rs.filter(c=>re.test(c.name));
 if(neg==='lot'){const L=R.lots.find(l=>ISLE.tradeOf(l.key));return pick(ISLE.simChecks(R,{places:own().filter(P=>P.tags.lot!==L.id)}),/census trade/);}
 if(neg==='home'){const A=res();A[0].home=s==='valapo'?'kautoa.0':'valapo.0';return pick(ISLE.simChecks(R,{actors:A}),/resident/);}
 if(neg==='job'){const A=res(),w=A.find(a=>a.status==='employed');w.work=undefined;return pick(ISLE.simChecks(R,{actors:A}),/worker/);}
 if(neg==='age'){const A=res(),c=A.find(a=>a.ageBand==='child');c.age=30;return pick(ISLE.simChecks(R,{actors:A}),/every child/);}
 if(neg==='social'){return [ISLE.simSocialCheck(R,Object.assign({},ISLE.SIM.soc[s],{placed:Math.floor(ISLE.SIM.soc[s].want/2)}))];}
 if(neg==='map'){const P=own().filter(p=>p.tags.lot).map(p=>Object.assign({},p,{tags:Object.assign({},p.tags)}));P[0].tags.lot='nowhere';return pick(ISLE.simChecks(R,{places:P}),/stocks map/);}
 if(neg==='haul'){const B=cp();B.foods[f0].hauled=0;return pick(ISLE.simFoodChecks(R,B),/made and hauled/);}
 if(neg==='short'){const B=cp();B.foods[f0].outOf=12;return pick(ISLE.simFoodChecks(R,B),/nothing short/);}
 if(neg==='made'){const B=cp();Object.keys(B.foods).forEach(f=>{B.foods[f].made=Math.floor(B.foods[f].made/2);});return pick(ISLE.simFoodChecks(R,B),/covers/);}
 return [];}"""


# The export profile (P6b; PLAN.md section 7; core/export/README.md, "Profiles"). The case is Kautoa's ceremonial centre (the
# palace, the square, the envoys' houses, the park and the streets round it: 89 lots), in the town's frame; godot/data/
# world-isle-kautoa is this box (tools/harness.py export ... --query "?town=Kautoa&simAt=362"; godot/tests/export/isle_test.gd). EXPORT_TARGET is M6's
# whole list; EXPORT_PROFILE is what the page must fill now (verify --assert fails without it), the rest of the target
# is reported section by section until each lands. --profile a,b,c checks a list for one run; --profile target checks
# the whole target and fails on every section not yet filled (the proof the check bites).
EXPORT_BOX = [320, 780, 820, 1220]   # the ceremonial centre (P8, 2026-10-20; until then -700..700, which held 108 lots and none of the centre)
EXPORT_TARGET = ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain=field', 'city', 'fixtures', 'interiors',
                 'furniture', 'sim', 'stage', 'atmos']
# met on 2026-10-19 (P6b): the registry (core/tags, the drawn town's), the KMAT materials, the terrain (sampled:
# EXPORT.ground on the plan's ground; terrain=field waits for a KFIELD from the extracted heights, PLAN.md section 10)
EXPORT_PROFILE = ['registry', 'materials', 'terrain', 'city', 'sim', 'items', 'buckets', 'textures', 'fixtures', 'stage', 'interiors?', 'furniture?']   # city: core/city's contributor, 2026-10-19; sim: src/50 (P7e, 2026-10-20)


async def run_city(a):
    import harness
    from playwright.async_api import async_playwright
    folder = os.path.dirname(os.path.dirname(os.path.abspath(a.html)))
    page = os.path.relpath(os.path.abspath(a.html), folder).replace(os.sep, '/')
    fails = []
    views = {'Kautoa': ('overview', 'ceremonial centre', 'palace', 'harbour', 'works quarter', 'izanitown', 'ridertown'),
             'Valapo': ('overview', 'village and harbour', 'south harbour', 'garrison')}
    with harness.serve(folder) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            for town in ('Kautoa', 'Valapo'):
                pg = await b.new_page(viewport={'width': 1280, 'height': 800})
                errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.goto('http://127.0.0.1:%d/%s?town=%s' % (port, page, town), timeout=0)
                await pg.wait_for_function('window._city && (_city.error || _city.both)', timeout=900000, polling=1000)
                st = json.loads(await pg.evaluate('JSON.stringify({err:_city.error||_city.otherError||null,town:_city.town,ms:_city.ms,draw:_city.draw})'))
                print('--- %s (%s) ---' % (town, st.get('ms')))
                if st['err'] or st['town'] != town:
                    print('  FAIL  loads clean : ' + str(st['err'] or 'opened ' + st['town'])); fails.append(town + ' load'); await pg.close(); continue
                if a.assert_:
                    seen = set()
                    for r in await pg.evaluate(CITY_JS, None):
                        if r['name'] in seen: continue
                        seen.add(r['name'])
                        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + str(r['detail']))
                        if not r['ok']: fails.append(r['name'])
                    for neg in ('overlap', 'sea', 'landmark'):
                        rs = await pg.evaluate(CITY_JS, neg)
                        caught = bool(rs) and not any(r['ok'] for r in rs)
                        print(('  PASS  ' if caught else '  MISSED') + ' negative (' + neg + ') : ' + '; '.join(r['detail'] for r in rs))
                        if not caught: fails.append(town + ': negative ' + neg)
                    if town == 'Valapo':
                        se = await pg.evaluate('window._city.simError || (window._city.sim ? null : "not declared")')
                        if se:
                            print('  FAIL  the towns on core/simulation : ' + se[:400]); fails.append('sim')
                        else:
                            for st in SIM_TOWNS:
                                r0 = await pg.evaluate(SIM_JS, {'town': st, 'neg': None})
                                print('  INFO  %s on core/simulation : %s' % (st, json.dumps(r0['info'])))
                                print('  INFO  the people of %s : %s' % (st, json.dumps(r0['people'])))
                                for r in r0['checks']:
                                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + str(r['detail']))
                                    if not r['ok']: fails.append(r['name'])
                                if r0['level'] != 'presented':
                                    print('  INFO  %s is abstract on this page: its free hours are not measured (its people do not decide)' % st)
                                for neg in SIM_NEGS:
                                    if neg == 'social' and r0['level'] != 'presented': continue
                                    rs = await pg.evaluate(SIM_JS, {'town': st, 'neg': neg})
                                    caught = bool(rs) and not any(r['ok'] for r in rs)
                                    print(('  PASS  ' if caught else '  MISSED') + ' negative (%s sim %s) : ' % (st, neg) + '; '.join(r['detail'] for r in rs))
                                    if not caught: fails.append('%s: negative sim %s' % (st, neg))
                            r = await pg.evaluate(CANOE_JS, None)
                            print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                            if not r['ok']: fails.append(r['name'])
                            r = await pg.evaluate(CANOE_JS, 'flip')
                            print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (a vessel shown in the wrong state) : ' + r['detail'])
                            if r['ok']: fails.append('negative canoes')
                            r = await pg.evaluate(CIT_JS, None)
                            print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                            if not r['ok']: fails.append(r['name'])
                            r = await pg.evaluate(CIT_JS, 'shift')
                            print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (a figure 50 m off its pose) : ' + r['detail'])
                            if r['ok']: fails.append('negative citizens')
                            for r in await pg.evaluate(TRADE_JS, None):
                                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + str(r['detail']))
                                if not r['ok']: fails.append(r['name'])
                            for neg in TRADE_NEGS:
                                rs = await pg.evaluate(TRADE_JS, neg)
                                caught = bool(rs) and not any(r['ok'] for r in rs)
                                print(('  PASS  ' if caught else '  MISSED') + ' negative (canoe line %s) : ' % neg + '; '.join(str(r['detail']) for r in rs))
                                if not caught: fails.append('negative canoe line ' + neg)
                            rw = await pg.evaluate(WEEK_JS, None)
                            print('  INFO  the week test : a week with Valapo watched (Kautoa abstract) %d ms, with Kautoa watched (Valapo abstract) %d ms' % tuple(rw['ms']))
                            for r in rw['checks']:
                                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + str(r['detail']))
                                if not r['ok']: fails.append(r['name'])
                            for neg in WEEK_NEGS:
                                rs = await pg.evaluate(WEEK_JS, neg)
                                caught = bool(rs) and not any(r['ok'] for r in rs)
                                print(('  PASS  ' if caught else '  MISSED') + ' negative (week %s) : ' % neg + '; '.join(str(r['detail']) for r in rs))
                                if not caught: fails.append('negative week ' + neg)
                            for r in await pg.evaluate(SIMX_JS, None):
                                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + str(r['detail']))
                                if not r['ok']: fails.append(r['name'])
                            for neg in SIMX_NEGS:
                                rs = await pg.evaluate(SIMX_JS, neg)
                                caught = bool(rs) and not any(r['ok'] for r in rs)
                                print(('  PASS  ' if caught else '  MISSED') + ' negative (sim export %s) : ' % neg + '; '.join(str(r['detail']) for r in rs))
                                if not caught: fails.append('negative sim export ' + neg)
                    if town == 'Kautoa':
                        prof = EXPORT_TARGET if a.profile == 'target' else [s.strip() for s in a.profile.split(',') if s.strip()] if a.profile else EXPORT_PROFILE
                        pok, lines = await harness.check_profile(pg, EXPORT_BOX, prof)
                        print(('  PASS  ' if pok else '  FAIL  ') + 'export-profile : box %s, %s' % (EXPORT_BOX, ', '.join(prof)))
                        for ln in lines: print('        ' + ln)
                        if not pok: fails.append('export-profile')
                        if not a.profile:   # the rest of M6's target, reported (not failed) until each section lands
                            tok, tl = await harness.check_profile(pg, EXPORT_BOX, EXPORT_TARGET)
                            print('  INFO  export target (M6) : ' + next((ln for ln in tl if ln.startswith('profile ')), '').split(': ', 1)[-1].split(';')[0] + ' met')
                            print('        ' + next((ln for ln in tl if ln.startswith('sections: ')), ''))
                if a.shots:
                    os.makedirs(a.shots, exist_ok=True)
                    # software GL: the nearest 600 pieces in full (the rest as massing), and time for each frame
                    await pg.evaluate('DRAW.nearMax=600;DRAW.at=null')
                    for v in views[town]:
                        await pg.evaluate('_city.view(%s)' % json.dumps(v))
                        await pg.wait_for_timeout(1500)
                        await pg.screenshot(path=os.path.join(a.shots, 'city-%s-%s.png' % (town.lower(), v.replace(' ', '-'))), timeout=300000)
                if errs:
                    print('  FAIL  page errors : ' + '; '.join(errs[:3])); fails.append(town + ' page errors')
                await pg.close()
            await b.close()
    print('\nOK' if not fails else '\nFAILED: ' + ', '.join(fails))
    return 1 if fails else 0


def hashes_ok():
    rec = json.load(open(os.path.join(HERE, 'voth-sources.json'), encoding='utf-8'))['files']
    bad = [k for k, h in rec.items() if hashlib.sha1(open(os.path.join(ROOT, k), 'rb').read().replace(b'\r\n', b'\n')).hexdigest() != h]
    return not bad, ('%d files as recorded' % len(rec)) if not bad else 'changed: ' + ', '.join(bad)


def merge_ok():
    sys.path.insert(0, HERE)
    import serve
    tmp = tempfile.mkdtemp()
    keep = serve.FILE
    try:
        serve.FILE = os.path.join(tmp, 'isle-site.json')
        fr = {'x': 1, 'z': 2, 'sea': -3}
        site = lambda n: {'frame': dict(fr), 'districts': [{'id': 'd1', 'n': n}], 'markers': []}
        serve.merge('Kautoa', site('k'))
        serve.merge('Valapo', site('w'))
        serve.merge('Kautoa', site('k2'))
        d = json.load(open(serve.FILE, encoding='utf-8'))
        both = d['towns']['Valapo']['districts'][0]['n'] == 'w' and d['towns']['Kautoa']['districts'][0]['n'] == 'k2'
        refused = 0
        for town, s in (('Kautoa', {'districts': [], 'markers': []}), ('Atlantis', site('x'))):
            try:
                serve.merge(town, s)
            except ValueError:
                refused += 1
        return both and refused == 2, 'one town saved over, the other kept: %s; refused %d of 2 bad saves (no frame, no such town)' % (both, refused)
    finally:
        serve.FILE = keep
        shutil.rmtree(tmp, ignore_errors=True)


async def run(a):
    import harness
    from playwright.async_api import async_playwright
    folder = os.path.dirname(os.path.dirname(os.path.abspath(a.html)))   # the build folder: the page fetches ../site/
    page = os.path.relpath(os.path.abspath(a.html), folder).replace(os.sep, '/')
    fails = []
    with harness.serve(folder) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            for town in ('Kautoa', 'Valapo'):
                pg = await b.new_page(viewport={'width': 1280, 'height': 800})
                errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.goto('http://127.0.0.1:%d/%s?town=%s' % (port, page, town), timeout=0)
                await pg.wait_for_function('window._site && _site.ready', timeout=300000)
                st = await pg.evaluate('JSON.stringify({err:_site.error||null,town:_site.town,from:_site.from,ms:_site.ms})')
                st = json.loads(st)
                print('--- %s (site from %s, ready in %s ms) ---' % (town, st['from'], (st['ms'] or {}).get('site')))
                if st['err'] or st['town'] != town:
                    print('  FAIL  loads clean : ' + str(st['err'] or 'opened ' + st['town']))
                    fails.append(town + ' load'); await pg.close(); continue
                print('  PASS  loads clean : no error, the town is ' + town)
                if a.assert_:
                    for r in await pg.evaluate(CHECKS, None):
                        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                        if not r['ok']: fails.append(town + ': ' + r['name'])
                    for neg, nm in (('shore', 'the frame: on land, the settlement point and a shore in the square'), ('frame', "the ground is the open world's"), ('payload', 'the editor draws on it and saves the town with its frame')):
                        r = [x for x in await pg.evaluate(CHECKS, neg) if x['name'] == nm][0]
                        print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') : ' + r['detail'])
                        if r['ok']: fails.append(town + ': negative ' + neg)
                if a.shots:
                    os.makedirs(a.shots, exist_ok=True)
                    for v in ('v-map', 'v-city'):
                        await pg.evaluate("document.getElementById('%s').onclick()" % v)
                        await pg.wait_for_timeout(800)
                        await pg.screenshot(path=os.path.join(a.shots, '%s-%s.png' % (town.lower(), v[2:])))
                if errs:
                    print('  FAIL  page errors : ' + '; '.join(errs[:3])); fails.append(town + ' page errors')
                await pg.close()
            await b.close()
    if a.assert_:
        print('--- without a browser ---')
        for name, (ok, detail) in (('serve.py merges one town at a time', merge_ok()), ("the Voth files read are the ones recorded", hashes_ok())):
            print(('  PASS  ' if ok else '  FAIL  ') + name + ' : ' + detail)
            if not ok: fails.append(name)
    print('\nOK' if not fails else '\nFAILED: ' + ', '.join(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--shots', default='')
    ap.add_argument('--profile', default='', help='the city page under --assert: an export profile a,b,c for this run, or target (M6)')
    args = ap.parse_args()
    sys.exit(asyncio.run(run_city(args) if os.path.basename(args.html).startswith('isle-city') else run(args)))
