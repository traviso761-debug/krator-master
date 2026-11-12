#!/usr/bin/env python3
"""Headless check for the isle demo's open world (settlements/isle-demo/PLAN.md, P3).

  python3 verify.py dist/isle-demo.html [--list] [--assert] [--views 0,1,14] [--out ./shots] [--size 1280x800]

The world's fragments are in core/world/ (moved from the deprecated little-demo), so its probe's checks (_api.hostChecks) run here too; a check
is NOT APPLICABLE while this region has none of what it checks (no biome kit yet: the flora checks; no named river, no
highway, no town tile). The isle's own checks:
  - the isle fields: every field 43-world-isles.js adds is a number at both towns, and the class weights sum to 1 on land
    (the towns are on land), 0 at sea (a point well out in the Ring Sea);
  - the towns stand on land, the climate the assay found (Kautoa Af, Valapo XA);
  - every geyser vent has its thermal ground (the 'floor' field 1 at the vent).
  - the coast (43-world-isles.js landHook): rays out from both towns cross a lagoon and then a reef crest;
  - the hamlets (core/hamlet H4): the resource villages (six since 2026-11-04: Valapo's quarry and lumber village) made with no error, on dry ground, at most 500 people each,
    every record's tags known (the negative drops the salt village).
  - the countryside (settlements/isle-demo PLAN.md section 11, 2026-11-09): six farming hamlets and two plantations laid out
    in the towns' hinterlands, their land in crop within a fifth of the estimate on the towns' census, every parcel dry,
    a farmhouse on every holding and a track to each (the negative drops two of Kautoa's hamlets' land).
  - the coast (2026-11-09): every village with the sea within reach (ISLE_HAMLETS.shoreOf) has a landing (its quay at the
    water's edge, a lane to it) and a sea leg to its town (the negative takes the lumber village's away).
  - the highway network (48r, bake.py): baked (WORLD_DATA.roads), every village's main lane end the end of a baked road,
    every road's far end on its town's head or on another road, no village building on a carriageway (the negative
    moves a village's lane end 500 m).
  - the founding (settlements/isle-demo 47f, 48f): the sim's hooks installed, a farm site for a camp of each town on good
    ground apart from every village (the negative puts the site beside a village). A founding itself takes days of the
    sim: tests/test-isle-found.js runs it. The camp shelters: a stand-in camp pitched from the kit, every piece a proto.
  - Valapo's clove plantation overseas (48 islandSite, 47h `overseas`): on the forest island west with a landing and no road,
    cloves and its own staples, both its routes sea legs in the sim (the negative moves it 20 km off its island)
  - Nephtos (48p, 88p; settlements/isle-demo 47k, PLAN.md section 15): the Hykkousoi colony on the forest island west's coast,
    half Valapo's people, every lot dry and off the towns and villages, tagged, drawn with its quay's Hykkousoi ships, its
    villages its own (the negative puts a lot out to sea); in the sim after the hamlets' two days: declared, housed,
    staffed and fed, its villages at work, Tethys's merchantmen calling (negatives: meals without food, no Tethyan call)
  - the clay villages (48): one a town, its pit on dry flat ground beside the mangrove flats, its clay pits the kit's (the
    negative moves a pit 20 km inland)
  - the herding bands (47n, 48n): one a town, its camp on dry pasture, named, drawn (the negative moves a camp off its
    pasture); in the sim's two days each band fed and its herd at work (the negative starves one).
  - the hamlets in the sim (settlements/isle-demo 47h, core/hamlet H5): the four villages declared with their towns, run two
    days: staffed, making their goods, every load landed in its town or on the road, each fed by its town (negatives: no
    ore made, timber lost on the road, meals without food);
  - the camps (core/camp, 48k/88k-world-camps.js): the Raptor band in the east jungle pitched whole, 40 to 70 people, no
    two boxes within 2 m, every box on good ground and inside the hedge, the flora kept off it, every tag known (the
    negatives: two tents moved together; the keep-clear hook without the camp's).
  - the towns (M7, 48t/88t-world-towns.js): Kautoa and Valapo planned here as the city page plans them (no error, their
    census, every one of the city page's own plan checks, the sim declared); the world's land is each town's ground
    inside its square (24 samples a town, to 5 cm); the flora and floor keep off every lot (WORLD.townW at each lot);
  - the towns lived in (M7, 88c-world-life.js): the sim caught up to the world's clock and following it (the clock moved
    15 minutes, the towns with it), the canoe line's sea route on water all the way (no longer than 1.8 times the
    straight line), each carrier's vessel at its berth or on its route where its passage puts it, the citizens near the
    camera where the sim poses them;
  - the towns' HLOD (88t): every lot drawn exactly once round the camera, in full, baked or as massing (the negative
    draws one twice);
  - the export profile (moved here from the city page, M7): Kautoa's ceremonial centre (EXPORT_BOX, the town's frame) under
    EXPORT_PROFILE, as godot/data/world-isle-kautoa is cut (the same records, ids and sim as the city page's case).
Each check has a negative: the weights summed with a class removed, a town moved out to sea, a vent moved 5 km, the
coast hook switched off, a town's plan dropped, a town's ground read 50 m off, the keep-clear hook switched off, the
straight line taken as the route, a vessel moved 500 m, a citizen moved 50 m, the clock read an hour off.
Uses tools/harness.py (the Chromium launcher, the pinned three.js). On a machine whose headless SwiftShader cannot compile
the sky's capture (ATMOS.skylight: "null ... reading 'trim'"), the page stops at start: little-demo's old page did the
same there (KNOWN_ISSUES.md); run it in the browser pane, or where this verify passes.
"""
import argparse, asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness
from harness import verify_page, Abort
sys.path.insert(0, os.path.join(HERE, '..', '..', 'core', 'world'))
import verify_world as VW  # noqa: E402  (the resources' and proposals' checks every region shares)
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# the world probe's checks (core/world/91-world-probe.js) and what this region must have for each to apply
APPLIES = {'flora placement is seeded by cell (order-free)': 'kits', 'nothing roots in the water or outside the region': 'kits',
           'trees keep their spacing, across tile edges': 'kits', 'the named rivers carry water to their mouths': 'rivers',
           'the highways lie on the land and keep their grade': 'roads', 'nothing grows on a highway or in a town': 'kits'}
HAS = "({kits:WORLD_KITS.length>0,rivers:(WORLD_DATA.meta.rivers||[]).length>0,roads:!!WORLD_DATA.roads,towns:!!WORLD_DATA.towns})"
ISLE = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,F=WORLD.ISLE_FIELDS,KF=F.filter(f=>f.startsWith('koppen:'));
 const town=n=>{const s=M.settlements.find(q=>q.name===n);return neg==='town'&&n==='Valapo'?{x:s.x-60000,z:s.z}:{x:s.x,z:s.z};};
 const sum=A=>KF.reduce((a,f)=>a+(neg==='class'&&f==='koppen:XA'?0:A[f]),0);
 {const bad=[];for(const n of ['Kautoa','Valapo']){const p=town(n),A=WORLD.at(p.x,p.z);for(const f of F)if(typeof A[f]!=='number'||!isFinite(A[f]))bad.push(n+' '+f);
   if(Math.abs(sum(A)-1)>1e-6)bad.push(n+' weights sum '+sum(A).toFixed(3));}
  const S=WORLD.at(-60000,0);if(S.depth>0&&sum(S)!==0)bad.push('sea weights sum '+sum(S));if(!(S.depth>0))bad.push('the sea point is not at sea');
  R.push({name:'the isle fields',ok:!bad.length,detail:bad.length?bad.join('; '):F.length+' fields at both towns; the classes sum to 1 on land, 0 at sea'});}
 {const bad=[],want={Kautoa:'Af',Valapo:'XA'};for(const n in want){const p=town(n),A=WORLD.at(p.x,p.z);if(!(A.depth<0))bad.push(n+' in the water');else if(A.clim!==want[n])bad.push(n+' '+A.clim);}
  R.push({name:'the towns on land, in their climate',ok:!bad.length,detail:bad.length?bad.join('; '):'Kautoa on Af ground, Valapo on XA, both above the sea'});}
 {const bad=[];WORLD.VENTS.forEach(([x,z],i)=>{const A=WORLD.at(neg==='vent'?x+5000:x,z);if(A.floor<.99)bad.push('vent '+(i+1)+' floor '+A.floor.toFixed(2));});
  R.push({name:'every vent has its thermal ground',ok:!bad.length&&WORLD.VENTS.length>0,detail:bad.length?bad.join('; '):WORLD.VENTS.length+' vents, the floor field 1 at each'});}
 {const keep=WORLD.landHook;if(neg==='coast')WORLD.landHook=null;let rays=0,reefs=0;
  try{for(const n of ['Kautoa','Valapo'])for(let a=0;a<24;a++){const s=town(n),dx=Math.cos(a/24*Math.PI*2),dz=Math.sin(a/24*Math.PI*2);let sea=false,lag=false,crest=false;
    for(let r=0;r<16000&&!crest;r+=100){const d=WORLD.lakeWater(s.x+dx*r,s.z+dz*r)-WORLD.H(s.x+dx*r,s.z+dz*r);
     if(!sea){if(d>0)sea=true;else continue;}if(d>1.5&&d<3.2)lag=true;else if(lag&&d>0&&d<.8)crest=true;else if(d>40)break;}
    rays++;if(crest)reefs++;}}finally{WORLD.landHook=keep;}
  R.push({name:'the coast: a lagoon behind a reef crest',ok:reefs>=4,detail:reefs+' of '+rays+' rays from the towns cross a lagoon (1.5-3.2 m) then a crest (under 0.8 m)'});}
 {const HM=window._hamlets,bad=[];if(!HM)bad.push('no hamlets on the page');else{
   const V=HM.villages.filter(v=>!(neg==='hamlet'&&v.focus==='salt')),want=['salt','mine','lumber','ranch'];
   for(const f of want){const v=V.find(q=>q.focus===f);if(!v){bad.push('no '+f+' village');continue;}
    if(v.error)bad.push(v.id+': '+v.error);if(!v.site)bad.push(v.id+': no site');
    if(!(v.census&&v.census.pop>0&&v.census.pop<=500))bad.push(v.id+': population '+(v.census&&v.census.pop));
    if(v.site&&WORLD.water(v.site.x,v.site.z)>WORLD.H(v.site.x,v.site.z)-.5)bad.push(v.id+': its green is in the water');}
   HM.stats.errors.forEach(e=>bad.push(e));const A=HM.tags();if(A.unknown)bad.push(A.unknown+' unknown tag values');}
  R.push({name:'the hamlets: the resource villages, each on dry ground, at most 500 people, tagged',ok:!bad.length,
   detail:bad.length?bad.join('; '):HM.villages.map(v=>(v.name||v.id)+' ('+v.focus+') '+v.census.pop+' people, '+v.buildings+' buildings').join('; ')});}
 {const HM=window._hamlets,bad=[];let F=[],have=0,need=0,wet=0,n=0;if(!HM)bad.push('no hamlets on the page');else{
   F=HM.villages.filter(v=>v.focus==='farming'&&!v.error);const farms=F.filter(v=>v.farm&&!v.plantation&&!(neg==='farm'&&/k[12]$/.test(v.id))),pl=F.filter(v=>v.plantation);
   if(farms.length<8)bad.push(farms.length+' farming hamlets');if(pl.length!==4)bad.push(pl.length+' plantations');
   F.forEach(v=>{if(!v.farm||!(v.farm.parcels>0))bad.push(v.id+': no farmland');else if(v.farm.capped)bad.push(v.id+': short of land');if(v.census&&!(v.census.pop<=500))bad.push(v.id+': '+v.census.pop+' people');});
   const T=window._isleTowns,CO=ISLE_TOWNS_W.stats.colony;need=KHAMLET.farmNeed((T?T.towns:[]).reduce((q,t)=>q+(t.census?t.census.citizens:0),0)+(CO&&!CO.error?CO.census.citizens:0)).inCrop;   /* Nephtos's people too (48p) */have=farms.reduce((q,v)=>q+v.farm.inCropHa,0);
   if(!(need>0&&have>=.8*need&&have<=1.2*need))bad.push(Math.round(have)+' ha in crop against the estimate\'s '+Math.round(need));
   HM.resources.filter(r=>r.parcels).forEach(r=>r.parcels.forEach((p,i)=>{if(i%5)return;n++;if(WORLD.water(p.x,p.z)>WORLD.H(p.x,p.z)-.5)wet++;}));if(wet)bad.push(wet+' of '+n+' parcels in the water');
   /* a farmhouse on every holding, a track to each (the owner, 2026-11-09) */
   HM.resources.filter(r=>r.holdings).forEach(r=>{const V=HM.villages.find(v=>v.resource===r);if(!(r.holdings.length>=5&&r.records.length===r.holdings.length&&r.tracks.length===r.holdings.length))bad.push(r.id+': '+r.holdings.length+' holdings, '+r.records.length+' farmhouses, '+r.tracks.length+' tracks');
    if(r.holdings.some(h=>h.parcels<3))bad.push(r.id+': a holding of under three parcels');});}
  R.push({name:"the countryside: eight farming hamlets and four plantations (one overseas, one Nephtos's), their land in crop within a fifth of the estimate, every parcel dry, a farmhouse and a track on every holding",ok:!bad.length,
   detail:bad.length?bad.join('; '):Math.round(have)+' ha in crop against '+Math.round(need)+' estimated; '+F.map(v=>v.id+' '+v.census.pop+' people, '+v.farm.inCropHa+' ha in crop of '+v.farm.farmedHa+' ('+v.farm.parcels+' parcels, fit '+(v.farm.fit==null?'-':v.farm.fit.toFixed(2))+')').join('; ')+'; '+n+' parcels sampled dry'});}
 {const HM=window._hamlets,bad=[],lines=[];if(!HM)bad.push('no hamlets on the page');else for(const v of HM.villages){if(v.error||!v.site)continue;
   const L=neg==='landing'&&v.id==='hamlet-lumber'?null:v.landing,sh=ISLE_HAMLETS.shoreOf(v.site,ISLE_HAMLETS.made.berths[v.parent]||null);   /* a shore with a sea route to the town's landing */
   if(sh&&!L){bad.push(v.id+': the sea '+Math.round(sh.d)+' m off, a route to its town, and no landing');continue;}if(!L)continue;
   const q=L.seaward,wx=L.x+q[0]*16,wz=L.z+q[1]*16,bx=L.x-q[0]*16,bz=L.z-q[1]*16;
   if(!(WORLD.water(wx,wz)>WORLD.H(wx,wz)-.5))bad.push(v.id+': its quay\'s sea end is dry');if(WORLD.water(bx,bz)>WORLD.H(bx,bz))bad.push(v.id+': its quay\'s landward end is in the water');
   const M=ISLE_HAMLETS.made.villages.find(E=>E.spec.id===v.id);if(!(M.village.lanes||[]).some(l=>l.landing))bad.push(v.id+': no lane to its quay');
   if(!v.sea||!(v.sea.km>0))bad.push(v.id+': no sea leg');else{const X=ISLE.SIM.hamlets.villages.find(Y=>Y.id===v.id);if(!X||!X.sea)bad.push(v.id+': no sea line in the sim');lines.push((v.name||v.id)+' '+v.sea.km+' km by sea');}}
  R.push({name:'the coast: every village within reach of the sea has a landing (its quay at the water\'s edge, a lane to it) and a sea leg to its town',ok:!bad.length&&lines.length>0,detail:bad.length?bad.join('; '):lines.join('; ')});}
 {const HM=window._hamlets,RD=(WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[],bad=[],lines=[];if(!RD.length)bad.push('no baked roads (python3 bake.py roads)');
  const near=(p,q,r)=>Math.hypot(p[0]-q[0],p[1]-q[1])<=r,HD=WORLD_DATA.roads&&WORLD_DATA.roads.heads||{},heads=[].concat(...Object.keys(HD).map(t=>HD[t].map(h=>[h.x,h.z])));
  const onRoad=(p,r)=>RD.some(q=>q.pts.some((a,i)=>{if(!i)return false;const b=q.pts[i-1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l2));return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1])<=r;}));
  if(HM)for(const v of HM.villages){if(v.error||!v.site||v.overseas)continue;const M=ISLE_HAMLETS.made.villages.find(E=>E.spec.id===v.id),ends=(M.village.lanes||[]).filter(l=>!l.track).map(l=>l.pts[1].slice());if(!ends.length){bad.push(v.id+': no lane');continue;}
   if(neg==='road'&&v.id==='hamlet-farm-k1')ends.forEach(e=>{e[0]+=500;});const r=RD.find(q=>q.from===v.id);
   if(!r)bad.push(v.id+': no road');else{const a=r.pts[0],b=r.pts[r.pts.length-1],atA=ends.some(e=>near(a,e,5)),atB=ends.some(e=>near(b,e,5));if(!atA&&!atB)bad.push(v.id+': no lane end is its road\'s end');
    const far=atA?b:a;if(!heads.some(h=>near(far,h,5))&&!onRoad(far,12))bad.push(v.id+': its road ends in the open');lines.push(v.id+' '+Math.round(r.length_m/1000)+' km, '+r.townKm+' km to '+r.town);}
   const hit=M.village.records.filter(b=>onRoad([b.x,b.z],Math.hypot(b.w,b.d)/2*.6+WORLD_DATA.roads.roads[0].hw)).length;if(hit)bad.push(v.id+': '+hit+' buildings on a carriageway');}
  R.push({name:'the highway network: every village joined by a baked road to its town or another road, no building on a carriageway',ok:!bad.length,detail:bad.length?bad.join('; '):RD.length+' roads; '+lines.join('; ')});}
 /* the founding (settlements/isle-demo 47f, 48f): the sim's hooks installed; the survey finds a farm site for a camp of each town
    on dry ground that takes its staples, FARM.apart from every village (a founding itself takes days of the sim: tests/test-isle-found.js) */
 {const bad=[],lines=[],F=typeof ISLE_FOUND!=='undefined'?ISLE_FOUND:null;if(!F)bad.push('no founding hooks (48f)');else{const hk=(typeof ISLE!=='undefined'&&ISLE.hooks)||{};
   for(const k of ['farmSite','layVillage','routeRoad','roadBuilt','founded'])if(typeof hk[k]!=='function')bad.push('hook '+k+' not installed');
   for(const t of ISLE.TOWNS){const s=F.farmSite(t,1);if(!s){bad.push(t+': no farm site for a camp');continue;}if(neg==='found'){const E=ISLE_HAMLETS.made.villages.find(E=>E.village&&E.village.site);s.x=E.village.site.x+100;s.z=E.village.site.z;}
    const d=Math.min(...ISLE_HAMLETS.made.villages.filter(E=>E.village&&E.village.site).map(E=>Math.hypot(E.village.site.x-s.x,E.village.site.z-s.z)));
    if(d<ISLE_HAMLETS.FARM.apart)bad.push(t+': the camp\'s site '+Math.round(d)+' m from a village');if(!ISLE_HAMLETS.groundOk(s.x,s.z))bad.push(t+': the camp\'s site on bad ground');
    lines.push(t+': a camp at '+Math.round(s.x)+','+Math.round(s.z)+', fit '+(s.fit==null?'-':s.fit.toFixed(2))+', '+(d/1000).toFixed(1)+' km from the nearest village');}}
  R.push({name:'the founding: the sim\'s hooks installed, a farm site for a camp of each town on good ground apart from every village',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});}
 /* the camp's shelters (kits/islanders 70-ie-camp.js, pitched by 88h): a stand-in camp of six households pitched far off the map's
    villages, every piece a kit proto (no stand-in box), the kitchen at its centre, the shelters round it */
 {const bad=[],HM=window._hamlets;if(!HM||!HM.pitchTest)bad.push('no camp pitch (88h)');else{const F=ISLE_FOUND.farmSite(ISLE.TOWNS[0],7)||{x:0,z:0},recs=HM.pitchTest(F.x+1500,F.z+1500,6);
   if(neg==='camp')recs[1].proto=false;const miss=recs.filter(r=>!r.proto);if(miss.length)bad.push(miss.length+' of '+recs.length+' pieces have no kit proto: '+miss.map(r=>r.key).join(', '));
   if(recs.length<4||!recs.some(r=>/shelter/.test(r.key)))bad.push('only '+recs.length+' pieces for six households, or no shelter');   /* a long shelter and an A-frame hold six households */if(!recs.some(r=>r.key==='ie-camp-kitchen')||!recs.some(r=>r.key==='ie-camp-store'))bad.push('no kitchen or store');
   R.push({name:'the camp shelters: a farming camp pitched from the Islanders kit (kitchen, store, a shelter a household or two), every piece a kit proto',ok:!bad.length,detail:bad.length?bad.join('; '):recs.length+' pieces: '+recs.map(r=>r.key.replace('ie-','')).join(', ')});}}
 /* the expeditions' shores (48x; PLAN.md 12): each town finds a forest island shore with a sea route from its landing, the camp
    inland of it on dry ground with forest enough round it, apart from every village */
 {const bad=[],lines=[],EX=typeof ISLE_EXPEDITIONS!=='undefined'?ISLE_EXPEDITIONS:null;if(!EX)bad.push('no expeditions (48x)');else for(const t of ISLE.TOWNS){const L=EX.shores[t+'|forest']||[],S0=L.find(x=>!x.none)||EX.shoreFor(t,1,'forest');
   if(!S0){bad.push(t+': no shore ('+JSON.stringify((L[0]||{}).tried||[]).slice(0,200)+')');continue;}const f=neg==='shore'?0.1:EX.forestAround(S0.x,S0.z);
   const near=ISLE_HAMLETS.made.villages.filter(E=>E.village&&E.village.site).map(E=>Math.hypot(E.village.site.x-S0.x,E.village.site.z-S0.z)).sort((a,b)=>a-b)[0];
   if(!(S0.seaKm>0))bad.push(t+': no sea route');if(f<EX.FOREST_MIN)bad.push(t+': forest '+f.toFixed(2)+' round the camp');if(near<EX.APART)bad.push(t+': '+Math.round(near)+' m from a village');if(WORLD.water(S0.x,S0.z)>WORLD.H(S0.x,S0.z)-1)bad.push(t+': the camp in the water');
   lines.push(t+' -> '+S0.name+' at '+Math.round(S0.x)+','+Math.round(S0.z)+', '+S0.seaKm+' km by sea, forest '+f.toFixed(2)+', nearest village '+(near/1000).toFixed(1)+' km');}
  R.push({name:'the expeditions: each town has a forest island shore with a sea route from its landing, the camp on dry forested ground apart from every village',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});}
 /* the vents' and the reef's camps (48x, the owner 2026-11-09): some town has a vent off its own island with a routed shore
    within a walk of it, and a reef the isles kit fishes within 1.5 km of a routed shore; every camp on dry ground apart */
 {const bad=[],lines=[],EX=typeof ISLE_EXPEDITIONS!=='undefined'?ISLE_EXPEDITIONS:null;if(!EX)bad.push('no expeditions (48x)');else for(const kind of ['vents','reef']){let n=0;
   for(const t of ISLE.TOWNS){const S0=EX.shoreFor(t,1,kind);if(!S0){lines.push(t+' '+kind+': none');continue;}n++;const node=neg==='node'&&kind==='reef'?{x:S0.x,z:S0.z}:S0.node;
    const fish=kind==='reef'?(RINGISLES.gather(node.x,node.z).fish||0):null,walk=Math.hypot(node.x-S0.x,node.z-S0.z);
    if(WORLD.water(S0.x,S0.z)>WORLD.H(S0.x,S0.z)-1)bad.push(t+' '+kind+': the camp in the water');if(kind==='reef'&&fish<EX.REEF_MIN)bad.push(t+' reef: its bed fishes '+fish.toFixed(2));if(kind==='vents'&&walk>5000)bad.push(t+' vents: '+Math.round(walk)+' m from the camp');
    lines.push(t+' '+kind+' -> '+S0.name+', '+S0.seaKm+' km by sea, the node '+Math.round(walk)+' m from the camp'+(fish!=null?', reef '+fish.toFixed(2):''));}
   if(!n)bad.push('no town has a '+kind+' camp\'s shore');}
  R.push({name:'the expeditions: a vents camp and a reef camp within reach by sea (some town each), the node a walk from the camp, the reef a fishing reef',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});}
 /* Valapo's clove plantation overseas (48 islandSite, 47h `overseas`; the owner, 2026-11-09): on the forest island west, on
    its coast with a landing, no road; its crops cloves and its own staples; both its routes sea legs in the sim, and it
    eats food it grew (the negative puts it 20 km off its island) */
 {const HM=window._hamlets,bad=[];const v=HM?HM.villages.find(q=>q.overseas):null,lines=[];
  if(!v)bad.push('no overseas village');else if(v.error)bad.push(v.id+': '+v.error);else{
   const M=ISLE_HAMLETS.made.villages.find(E=>E.spec.id===v.id),sp=M.spec,site=neg==='overseas'?{x:v.site.x+20000,z:v.site.z}:v.site,d=Math.hypot(site.x-sp.island[0],site.z-sp.island[1]);
   if(d>sp.look)bad.push(v.id+': '+Math.round(d)+' m from its island\'s point');if(!v.landing)bad.push(v.id+': no landing');
   if((WORLD_DATA.roads&&WORLD_DATA.roads.roads||[]).some(r=>r.from===v.id))bad.push(v.id+': a highway baked to it');
   const crops=new Set((v.farm&&M.resource&&M.resource.parcels||[]).map(p=>p.crop));if(!crops.has('cloves'))bad.push(v.id+': no cloves among its crops ('+[...crops].join(',')+')');
   const X=ISLE.SIM&&ISLE.SIM.hamlets&&ISLE.SIM.hamlets.villages.find(Y=>Y.id===v.id);if(!X||!X.sea||!X.sea.overseas)bad.push(v.id+': its routes not sea legs in the sim');
   else{const R1=SIM.TRADE.routes[X.sea.route],R2=SIM.TRADE.routes[X.sea.routeIn];if(!R1||!R2)bad.push(v.id+': a sea route missing');
    /* its farmsteads' recipes (the check runs before the first harvest): cloves and its own staples, which its IN route does not bring */
    const E=SIM.econ(v.id),by={};Object.keys(E.recipes).forEach(k=>(E.recipes[k].out||[]).forEach(g=>{by[g]=(by[g]||0)+1;}));const own=['sweet-potato','taro','banana'].filter(g=>by[g]>0);
    if(!by.clove)bad.push(v.id+': no farmstead on cloves');if(own.length<2)bad.push(v.id+': grows '+own.length+' of its own staples');
    const inG=(R2&&R2.goods&&R2.goods.valapo)||[];if(own.some(g=>inG.indexOf(g)>=0))bad.push(v.id+': its town ships it a staple it grows');
    lines.push((v.name||v.id)+' ('+v.label+'): '+v.census.pop+' people '+Math.round(d)+' m from the island\'s point, '+X.sea.km+' km by sea ('+Math.round(X.sea.minutes/60)+' h), crops '+[...crops].join(', ')+'; farmsteads '+Object.keys(by).map(g=>g+' '+by[g]).join(', '));}}
  R.push({name:'Valapo\'s clove plantation overseas: on the forest island west with a landing and no road, cloves and its own staples, both routes by sea',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});}
 /* Nephtos (48p, 88p; settlements/isle-demo 47k): on the forest island west's coast (north-west of Valapo), about half Valapo's people, every lot
    on dry ground and none on a town or a village, its records clean in core/tags, drawn with the Hykkousoi vessels at its
    quay; its villages its own (the negative puts a lot 300 m out to sea) */
 {const CO=ISLE_TOWNS_W.stats.colony,DC=window._colony,bad=[];let line='';
  if(!CO||CO.error)bad.push('no colony: '+(CO?CO.error:'not made'));else{
   const F=CO.frame,c=CO.centre,V=(window._isleTowns&&window._isleTowns.towns||[]).find(t=>t.town==='Valapo'),vp=V&&V.census?V.census.citizens:2095,pp=CO.census.citizens;
   if(!(c[0]>-59500&&c[0]<-16000&&c[1]>-1500&&c[1]<39500))bad.push('the colony at '+c.map(Math.round).join(',')+', off the forest island west');   /* its box: 2026-11-09's survey */
   if(!(pp>=.4*vp&&pp<=.6*vp))bad.push(pp+' people against Valapo\'s '+vp);
   const lots=CO.R.lots.map(l=>({x:F.x+l.x+(neg==='colony'&&l===CO.R.lots[0]?-CO.site.sea[0]*-300:0),z:F.z+l.z,key:l.key})),HL=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z);
   const wetL=lots.filter(l=>WORLD.water(l.x,l.z)>HL(l.x,l.z)-.5);if(wetL.length)bad.push(wetL.length+' lots in the water');
   const inT=lots.filter(l=>ISLE_TOWNS_W.at(l.x,l.z));if(inT.length)bad.push(inT.length+' lots in a town');
   const HM=window._hamlets,nearV=HM?HM.villages.filter(v=>v.site&&Math.hypot(v.site.x-c[0],v.site.z-c[1])<CO.reach+200):[];if(nearV.length)bad.push(nearV.map(v=>v.id).join(',')+' on its ground');
   if(!DC||DC.error)bad.push('not drawn: '+(DC?DC.error:'no 88p'));else{if(DC.lots!==CO.R.lots.length)bad.push(DC.lots+' of '+CO.R.lots.length+' lots drawn');const A=DC.tags();if(A.problems&&A.problems.length)bad.push('tags: '+A.problems.slice(0,2).join('; '));
    if(DC.ships.indexOf('hykCorbita')<0||DC.ships.indexOf('hykPearl')<0)bad.push('its berths hold '+DC.ships.join(','));}
   /* the Hykkousoi pieces' declared boxes (settlements/isle-demo build.py, ISLE_DIMS kit hyk) are the bundle's own (HYKB) */
   if(typeof HYKB==='undefined')bad.push('no Hykkousoi bundle (HYKB)');else{const HD=HYKB.dims(),hk=Object.keys(ISLE_DIMS).filter(k=>ISLE_DIMS[k].kit==='hyk'),off=hk.filter(k=>!HD[k]||Math.abs(HD[k].w-ISLE_DIMS[k].w)>1e-6||Math.abs(HD[k].d-ISLE_DIMS[k].d)>1e-6||Math.abs(HD[k].h-ISLE_DIMS[k].h)>1e-6);
    if(off.length||hk.length!==Object.keys(HD).length||HYKB.errors.length)bad.push('Hykkousoi boxes: '+hk.length+' declared, '+Object.keys(HD).length+' in HYKB'+(off.length?', differ: '+off.slice(0,4).join(','):'')+(HYKB.errors.length?', errors: '+HYKB.errors[0].slice(0,120):''));}
   const own=HM?HM.villages.filter(v=>v.parent==='Nephtos').map(v=>v.focus):[];['farming','fishing','lumber','mine'].forEach(f=>{if(own.indexOf(f)<0)bad.push('no '+f+' village of its own');});
   line=CO.town+' at '+c.map(Math.round).join(',')+' (its beach facing '+CO.site.sea.map(v=>v.toFixed(2)).join(',')+', '+Math.round(CO.site.share*100)+' % of its ground dry): '+pp+' people (Valapo '+vp+'), '+CO.R.lots.length+' lots, '+(DC?DC.domes+' domes, '+DC.streets+' streets, at its quay '+DC.ships.join(' and '):'')+'; its villages '+own.join(', ');}
  R.push({name:'Nephtos: the Hykkousoi colony on the forest island west\'s coast, half Valapo\'s size, every lot dry and off the towns and villages, tagged, drawn with its quay\'s ships, its villages its own',ok:!bad.length,detail:bad.length?bad.join('; '):line});}
 /* the clay villages (48: the potters' clay, 2026-11-09): one a town, its pit on dry flat ground beside the mangrove flats,
    its clay pits the Islanders kit's (the negative moves a pit inland) */
 {const HM=window._hamlets,bad=[],lines=[];const L=HM?HM.villages.filter(v=>v.focus==='clay'):[];
  for(const t of ISLE.TOWNS){const v=L.find(q=>q.parent===t);if(!v){bad.push(t+': no clay village');continue;}if(v.error){bad.push(v.id+': '+v.error);continue;}
   const r=v.resource||{},x=neg==='clay'?r.x+20000:r.x,z=r.z,H=(a,b)=>WORLD.Hland?WORLD.Hland(a,b):WORLD.H(a,b);let mud=false;
   for(let a=0;a<8&&!mud;a++)for(let d=75;d<=300;d+=75)if(RINGISLES.zones(x+Math.cos(a*Math.PI/4)*d,z+Math.sin(a*Math.PI/4)*d).mangal>.4){mud=true;break;}
   if(!mud)bad.push(v.id+': its pit not by the mangrove flats');if(WORLD.water(x,z)>H(x,z)-1.2)bad.push(v.id+': its pit in the water');
   if(!(v.works||[]).includes('ie-claypit'))bad.push(v.id+': no clay pit among its works ('+(v.works||[]).join(',')+')');
   if(typeof ISK==='undefined'||!ISK.DEFS||!ISK.DEFS['ie-claypit'])bad.push('the clay pit is not a kit proto');
   lines.push((v.name||v.id)+' ('+t+'): '+v.census.pop+' people, the pit at '+Math.round(r.x)+','+Math.round(r.z)+(v.road?', '+v.road.townKm+' km by road':''));}
  R.push({name:'the clay villages: one a town, its pit on dry ground beside the mangrove flats, its clay pits the kit\'s',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});}
 /* the herding bands (47n, 48n): one a town, its camp on dry pasture, named, drawn with its shelters and its herd */
 {const bad=[],HM=window._hamlets,L=HM&&HM.herders?HM.herders():[];if(L.length<ISLE.TOWNS.length)bad.push(L.length+' bands');
  for(const x of L){const c=neg==='herd'?[x.camp[0],x.camp[1]-60000]:x.camp;if(!c){bad.push(x.id+': no camp');continue;}if(!ISLE_HERDERS.pasture(c[0],c[1]))bad.push(x.id+': its camp on no pasture');if(!x.name)bad.push(x.id+': no name');if(!x.drawn)bad.push(x.id+': not drawn');}
  R.push({name:'the herding bands: one a town, its camp on dry pasture, named, drawn with its shelters and its herd',ok:!bad.length,detail:bad.length?bad.join('; '):L.map(x=>x.name+' ('+x.town+'): '+x.people+' people at '+x.camp.join(',')+(x.buffalo?', the kit\'s buffalo':', a herd of stand-ins')).join('; ')});}
 return R;}"""


# M7: the towns planned and drawn here (48t-world-towns.js, 88t-world-towns.js)
TOWNS_JS = r"""(neg)=>{const R=[],T=window._isleTowns,W=ISLE_TOWNS_W;
 {const bad=[];if(!T)bad.push('no towns on the page');else{T.errors.forEach(e=>bad.push(String(e).slice(0,200)));if(W.stats.simError)bad.push('sim: '+W.stats.simError.slice(0,200));
   const L=T.towns.filter(t=>!(neg==='plan'&&t.town==='Valapo'));for(const n of ['Kautoa','Valapo']){const t=L.find(q=>q.town===n);if(!t){bad.push('no '+n);continue;}
    if(!(t.lots>0&&t.census&&t.census.buildings>0))bad.push(n+': '+t.lots+' lots');(t.checks||[]).forEach(c=>{if(!c.ok)bad.push(n+': '+c.name);});}}
  R.push({name:'the towns planned here, as the city page plans them',ok:!bad.length,detail:bad.length?bad.join('; '):T.towns.map(t=>t.town+' '+t.lots+' lots, '+t.census.buildings+' buildings, '+(t.checks||[]).length+' plan checks').join('; ')+'; the sim declared'});}
 {let worst=0,at=null,n=0;for(const P of W.plans){const G=P.G,F=G.frame,e=G.half-W.BAND-10,dx=neg==='ground'?50:0;
   for(let i=0;i<24;i++){const a=i*2.399963,r=e*Math.sqrt((i+.5)/24),lx=Math.cos(a)*r,lz=Math.sin(a)*r,d=Math.abs(WORLD.H(F.x+lx,F.z+lz)-(G.h(lx+dx,lz)+F.sea));n++;if(d>worst){worst=d;at=P.town+' '+Math.round(lx)+','+Math.round(lz);}}}
  R.push({name:"the world's land is each town's ground",ok:n>=48&&worst<0.05,detail:n+' samples, worst '+worst.toFixed(3)+' m at '+at});}
 {const keep=WORLD.clearHook;if(neg==='clear')WORLD.clearHook=null;let n=0,off=0;
  try{for(const P of W.plans){const F=P.G.frame;P.R.lots.forEach((L,i)=>{if(i%5)return;n++;if(!(WORLD.townW(F.x+L.x,F.z+L.z)>0))off++;});}}finally{WORLD.clearHook=keep;}
  R.push({name:"the flora and floor keep off the towns' lots",ok:n>100&&!off,detail:off+' of '+n+' lots (every fifth) open to the flora'});}
 return R;}"""
# the export profile, moved here from the city page (M7; core/export/README.md, "Profiles"): Kautoa's ceremonial centre,
# in the town's frame, as godot/data/world-isle-kautoa is cut (settlements/isle-demo/verify.py keeps it as a report)
EXPORT_BOX = [320, 780, 820, 1220]
EXPORT_PROFILE = ['registry', 'materials', 'terrain', 'city', 'sim', 'items', 'buckets', 'textures', 'fixtures', 'stage', 'interiors?', 'furniture?']


# the hamlets in the sim (47h): the villages this map lays out, declared with their towns (48t), run two days; the checks
# of settlements/isle-demo 47h (ISLE.hamletChecks) and their negatives
# the thieves' guilds on the open world (88t): each town's under its tavern in that town's registry, its sign and pin drawn
# in the town's group over it, a diamond on the region map (MAP_MARKS) at the guild; the negative moves one mark 2 km
GUILD_JS = r"""(neg)=>{const S=_isleTowns.stats,gm=(S.guilds||[]).filter(g=>ISLE.TOWNS.indexOf(g.town)>=0),MM=window.MAP_MARKS||[];   /* the drawn towns' (Nephtos's guild runs in the sim; its tavern is a stand-in: KNOWN_ISSUES) */if(neg==='moved'&&MM[0])MM[0].x+=2000;
 const ok=gm.length===2&&gm.every(g=>{const P=SIM.R.place[g.place],tw=ISLE_TOWNS_W.plans.find(p=>p.town===g.town),R=tw&&tw.tags.get(g.record),m=MM.find(k=>k.label.endsWith(g.town));
   return P&&P.guild&&P.kind==='tavern'&&R&&R.name==="Thieves' guild"&&m&&Math.hypot(m.x-P.x,m.z-P.z)<1;});
 let signs=0;HOST.scene.traverse(o=>{if(o.name==="thieves' guild sign")signs++;});
 if(neg==='moved'&&MM[0])MM[0].x-=2000;
 return{name:"the thieves' guilds on the map: one a town, a landmark under its tavern, its sign drawn, a mark on the region map",ok:ok&&signs===2,
  detail:gm.map(g=>g.town+' '+g.place+' record '+g.record).join('; ')+'; '+signs+' signs, '+MM.length+' map marks'};}"""
# Nephtos on the sim (47k), after HAMLETS_SIM_JS's two days: declared the Hykkousoi of Tethys in drachmae, fed, its villages
# at work for it, the poleis' ships calling; `neg` breaks one ('unfed': five meals without food; 'unvisited': no Tethyan call)
COLONY_SIM_JS = r"""(neg)=>{const R=[],S=ISLE.SIM,X=S&&S.towns.nephtos,St=SIM.R.settlement.nephtos,ok=(name,pass,detail,n)=>R.push({name,ok:!!pass,detail,neg:n||null});
 if(!X||!St){R.push({name:'Nephtos in the sim',ok:false,detail:'not declared: '+(ISLE_TOWNS_W.stats.simError||'')});return R;}
 const B=ISLE.simBooks('nephtos'),meals=Object.assign({},B.meals);if(neg==='unfed')meals.none+=5;
 /* housed: its residents (the town's roles) and its crews at sea (its pearl ships' divers, 47x) are its census; staffed: 45's check */
 const CR=ISLE_TOWNS_W.stats.colony,cen=CR.census.citizens,res=SIM.all('actor').filter(a=>{const Rr=SIM.R.role[a.role];return !a.driven&&Rr&&Rr.settlement==='nephtos';}),
  crews=S.exp.camps.filter(c=>c.town==='nephtos'&&!c.struck).reduce((n,c)=>n+c.people.length,0),homeless=res.filter(a=>{const P=SIM.R.place[a.home];return !P||P.settlement!=='nephtos'||!(P.activities.SLEEP>0);});
 const SC=[{name:'every resident has a home in the town, its crews at sea counted',ok:homeless.length===0&&res.length+crews===cen,detail:res.length+' residents and '+crews+' at sea for a census of '+cen+(homeless.length?', '+homeless.length+' homeless':'')}]
  .concat(ISLE.simChecks(CR.R).filter(c=>/has a job/.test(c.name))),bad=SC.filter(c=>!c.ok);
 ok('Nephtos declared: the Hykkousoi of Tethys in drachmae, every resident housed, every post filled; fed ('+meals.meal+' meals at home, '+meals.none+' without)',St.faction==='hykkousoi'&&ISLE.currencyOf('nephtos')==='drachma'&&SC.length===2&&!bad.length&&meals.meal>0&&meals.none===0,
  (bad.length?bad.map(c=>c.name+': '+c.detail).join('; ')+'; ':'')+SC.length+' checks; '+JSON.stringify(meals),neg==='unfed'?'unfed':null);
 const V=S.hamlets.villages.filter(v=>v.parent==='nephtos'),made={};V.forEach(v=>{const E=SIM.econ(v.id);Object.keys(E.made).forEach(g=>{if(E.made[g]>0)made[g]=(made[g]||0)+Math.round(E.made[g]);});});
 ok('its villages at work for it: its staples, its plantations\' clove, cacao, indigo, annatto and tobacco, fish, timber and copper ('+Object.keys(made).map(g=>g+' '+made[g]).join(', ')+')',V.length===6&&['taro','indigo','annatto','tobacco','fish','copper'].every(g=>made[g]>0),V.map(v=>v.id).join(','));
 const at=Object.assign({},S.shipsAt||{});if(neg==='unvisited')delete at['tethys|nephtos'];
 ok('the poleis\' fleets: Tethys\'s merchantmen call at its colony (Tethys '+(at['tethys|nephtos']||0)+', Ys '+(at['hykkousoi|nephtos']||0)+', Pontus '+(at['pontus|nephtos']||0)+' calls at Nephtos so far)',(at['tethys|nephtos']||0)>0,JSON.stringify((S.ships||{}).tethys||{}),neg==='unvisited'?'unvisited':null);
 return R;}"""
HAMLETS_SIM_JS = r"""(()=>{const err=ISLE_TOWNS_W.stats.hamletError;if(err||!ISLE.SIM.hamlets)return{checks:[{name:'the hamlets: in the sim',ok:false,detail:err||'not declared'}],negs:[]};
 const a=ISLE.simHamletBooks();ISLE.simRun(2*1440);const b=ISLE.simHamletBooks(),cp=x=>JSON.parse(JSON.stringify(x)),pick=(rs,re)=>rs.filter(c=>re.test(c.name))[0];
 const negs=[];let B=cp(b);B.villages['hamlet-mine'].goods.ore.made=a.villages['hamlet-mine'].goods.ore.made;negs.push(Object.assign({neg:'unmade'},pick(ISLE.hamletChecks(a,B),/makes its goods/)));
 B=cp(b);B.villages['hamlet-lumber'].landed.timber=(B.villages['hamlet-lumber'].landed.timber||0)-15;negs.push(Object.assign({neg:'lost'},pick(ISLE.hamletChecks(a,B),/landed in its town/)));
 B=cp(b);B.villages['hamlet-mine'].site.id='elsewhere';negs.push(Object.assign({neg:'record'},pick(ISLE.hamletChecks(a,B),/its record from the map/)));
 B=cp(b);B.villages['hamlet-salt'].meals.none+=3;negs.push(Object.assign({neg:'unfed'},pick(ISLE.hamletChecks(a,B),/fed by its town/)));
 B=cp(b);{const K=B.ledger.towns.kautoa;(K.irontools||(K.irontools={total:0})).total+=500;}negs.push(Object.assign({neg:'iron pile'},pick(ISLE.hamletChecks(a,B),/ceiling/)));
 B=cp(b);{const X=B.villages['hamlet-farm-v1'];X.landed['sweet-potato']=a.villages['hamlet-farm-v1'].landed['sweet-potato']||0;X.goods['sweet-potato'].stock=0;X.atSea['sweet-potato']=0;}negs.push(Object.assign({neg:'crops lost'},pick(ISLE.hamletChecks(a,B),/crop the countryside grows landed/)));
 B=cp(b);B.villages['hamlet-farm-k1'].farm.inCropHa=1;B.villages['hamlet-farm-k2'].farm.inCropHa=1;negs.push(Object.assign({neg:'land'},pick(ISLE.hamletChecks(a,B),/land in crop/)));
 B=cp(b);{const C=Object.keys(B.villages).filter(k=>B.villages[k].sea);if(C.length){B.villages[C[0]].sea.landed={};B.villages[C[0]].sea.atSea={};negs.push(Object.assign({neg:'sea lost'},pick(ISLE.hamletChecks(a,B),/sea leg/)));}}
 /* the expeditions (47x): two days in, each town's crew has sailed and landed (firstDay 1): the first check, with a negative */
 let checks=ISLE.hamletChecks(a,b);if(ISLE.herdBooks&&ISLE.SIM.herders){const hb=ISLE.herdBooks();checks=checks.concat(ISLE.herdChecks(hb,hb));const HB=cp(hb);HB.bands.forEach(x=>{x.meals.none+=4;});negs.push(Object.assign({neg:'herders unfed'},pick(ISLE.herdChecks(hb,HB),/every band fed/)));}
 if(ISLE.expBooks){const eb=ISLE.expBooks();checks=checks.concat(ISLE.expChecks(eb,eb));const EB=cp(eb);EB.camps.forEach(C=>{C.here=0;});negs.push(Object.assign({neg:'no crew'},pick(ISLE.expChecks(eb,EB),/sent a crew/)));}
 return{checks,negs};})()"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=0,
                           ready_js="typeof CAM==='object'&&CAM&&window._api") as V:
        pg, errs, fails = V.page, V.errs, V.fails
        pg.set_default_timeout(900000)
        if not V.ready:
            print('timed out waiting for the page to build'); fails.append('build timeout')
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel:
            print('ERROR PANEL:', panel[:1500]); fails.append('error panel'); raise Abort(1)
        if a.list:
            print('\n'.join(await pg.evaluate('_api.views()'))); raise Abort(0)
        print('settle:', json.dumps(await pg.evaluate('_api.settle(240000)')))
        if a.assert_:
            has = await pg.evaluate(HAS)
            # the world's checks read the flora round the camera: the start view (little-demo's, west of a Shade this region
            # does not have) falls back to (-6000, 2500), deep sea, where no tile holds a record; so over Kautoa first, settled
            await pg.evaluate("(()=>{const K=WORLD_DATA.meta.settlements.find(s=>s.name==='Kautoa');CAM.setView(K.x+2500,K.z-2500,300,0,-.2);})()")
            await pg.evaluate('_api.settle(240000)')
            print('--- the world\'s checks (core/world/91-world-probe.js, over Kautoa) ---')
            for r in await pg.evaluate('_api.hostChecks()'):
                need = APPLIES.get(r['name'])
                if need and not has[need]:
                    print('  n/a   ' + r['name'] + ' : this region has no ' + need + ' yet'); continue
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                if not r['ok']: fails.append(r['name'])
            print('--- the isle\'s checks ---')
            for r in await pg.evaluate(ISLE, None):
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                if not r['ok']: fails.append(r['name'])
            print('--- negative controls (each must fail) ---')
            for neg, nm in (('class', 'the isle fields'), ('town', 'the towns on land, in their climate'), ('vent', 'every vent has its thermal ground'), ('coast', 'the coast: a lagoon behind a reef crest'),
                            ('hamlet', 'the hamlets: the resource villages, each on dry ground, at most 500 people, tagged'),
                            ('farm', "the countryside: eight farming hamlets and four plantations (one overseas, one Nephtos's), their land in crop within a fifth of the estimate, every parcel dry, a farmhouse and a track on every holding"),
                            ('road', 'the highway network: every village joined by a baked road to its town or another road, no building on a carriageway'),
                            ('landing', "the coast: every village within reach of the sea has a landing (its quay at the water's edge, a lane to it) and a sea leg to its town"),
                            ('found', "the founding: the sim's hooks installed, a farm site for a camp of each town on good ground apart from every village"),
                            ('camp', "the camp shelters: a farming camp pitched from the Islanders kit (kitchen, store, a shelter a household or two), every piece a kit proto"),
                            ('shore', "the expeditions: each town has a forest island shore with a sea route from its landing, the camp on dry forested ground apart from every village"),
                            ('node', "the expeditions: a vents camp and a reef camp within reach by sea (some town each), the node a walk from the camp, the reef a fishing reef"),
                            ('herd', "the herding bands: one a town, its camp on dry pasture, named, drawn with its shelters and its herd"),
                            ('clay', "the clay villages: one a town, its pit on dry ground beside the mangrove flats, its clay pits the kit's"),
                            ('overseas', "Valapo's clove plantation overseas: on the forest island west with a landing and no road, cloves and its own staples, both routes by sea"),
                            ('colony', "Nephtos: the Hykkousoi colony on the forest island west's coast, half Valapo's size, every lot dry and off the towns and villages, tagged, drawn with its quay's ships, its villages its own")):
                r = [x for x in await pg.evaluate(ISLE, neg) if x['name'] == nm][0]
                print(('  PASS  ' if not r['ok'] else '  MISSED') + nm + ' (' + neg + ') : ' + r['detail'])
                if r['ok']: fails.append('negative ' + neg)
            print("--- the thieves' guilds (settlements/isle-demo 47c) ---")
            for neg in (None, 'moved'):
                r = await pg.evaluate(GUILD_JS, neg)
                if neg is None:
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']: fails.append(r['name'])
                else:
                    print(('  PASS  ' if not r['ok'] else '  MISSED') + " negative (a guild's map mark 2 km off) : " + r['detail'])
                    if r['ok']: fails.append('negative guild')
            print('--- the camps (core/camp) ---')
            nm = 'the camps: pitched whole, a band of 40 to 70, no overlap, on good ground, inside the hedge, cleared, tagged'
            r = (await pg.evaluate('_camps.checks()'))[0]
            print(('  PASS  ' if r['ok'] else '  FAIL  ') + nm + ' : ' + r['detail'])
            if not r['ok']: fails.append(nm)
            for neg in ('overlap', 'clear'):
                r = (await pg.evaluate('_camps.checks(%r)' % neg))[0]
                print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (%s) : ' % neg + r['detail'])
                if r['ok']: fails.append('negative camps ' + neg)
            print('--- the towns (M7) ---')
            for r in await pg.evaluate(TOWNS_JS, None):
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                if not r['ok']: fails.append(r['name'])
            for neg, nm in (('plan', 'the towns planned here, as the city page plans them'), ('ground', "the world's land is each town's ground"),
                            ('clear', "the flora and floor keep off the towns' lots")):
                r = [x for x in await pg.evaluate(TOWNS_JS, neg) if x['name'] == nm][0]
                print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') : ' + r['detail'])
                if r['ok']: fails.append('negative ' + neg)
            # the export: the camera over the box first, so the stage reads the terrain there
            await pg.evaluate("(()=>{const F=ISLE.cur.G.frame;CAM.setView(F.x+570-450,F.z+1000-550,260,0,-.3);CAM.lookAt(F.x+570,WORLD.H(F.x+570,F.z+1000),F.z+1000);})()")
            await pg.evaluate('_api.settle(240000)')
            pok, lines = await harness.check_profile(pg, EXPORT_BOX, EXPORT_PROFILE)
            print(('  PASS  ' if pok else '  FAIL  ') + 'export-profile : %s, box %s, %s' % (await pg.evaluate('ISLE.cur.town'), EXPORT_BOX, ', '.join(EXPORT_PROFILE)))
            for ln in lines: print('        ' + ln)
            if not pok: fails.append('export-profile')
            # the towns' HLOD (88t): the camera's rings rebuilt and every piece baked first
            await pg.evaluate("(()=>{let last=-1,same=0,n=0;while(same<4&&n<4000){for(const f of HOST.TICKS)f(.016,performance.now()/1000);n++;const b=_isleTowns.hlod.bakes;if(b===last)same++;else same=0;last=b;}})()")
            r = await pg.evaluate('_isleTowns.hlodCheck()')
            print(('  PASS  ' if r['ok'] else '  FAIL  ') + 'the towns drawn once each, full, baked or massing : ' + r['detail'])
            if not r['ok']: fails.append('hlod')
            rn = await pg.evaluate('_isleTowns.hlodCheck({twice:true})')
            print(('  PASS  ' if not rn['ok'] else '  MISSED') + ' negative (hlod) : ' + rn['detail'])
            if rn['ok']: fails.append('negative hlod')
            # the towns lived in (88c): the sim caught up first, the citizens chosen round the camera set above
            print('--- the towns lived in (M7) ---')
            await pg.evaluate('_isleLife.follow(Infinity)')
            for key, nm, neg in (('route', "the canoe line's sea route is on water", '{straight:true}'),
                                 ('canoes', 'each carrier drawn at its berth or on its route', '{shift:true}'),
                                 ('citizens', 'the citizens drawn where the sim poses them', '{shift:true}'),
                                 ('clock', "the towns follow the world's clock", '{off:true}')):
                r = await pg.evaluate('_isleLife.checks.%s()' % key)
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + nm + ' : ' + r['detail'])
                if not r['ok']: fails.append(nm)
                rn = await pg.evaluate('_isleLife.checks.%s(%s)' % (key, neg))
                print(('  PASS  ' if not rn['ok'] else '  MISSED') + ' negative (%s) : ' % key + rn['detail'])
                if rn['ok']: fails.append('negative ' + key)
            # the hamlets in the sim (settlements/isle-demo 47h, core/hamlet H5): the villages laid out on this map run
            # two days with their towns (last: the sim leaves the world's clock behind)
            print('--- the hamlets in the sim (H5) ---')
            hs = await pg.evaluate(HAMLETS_SIM_JS)
            for r in hs['checks']:
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                if not r['ok']: fails.append(r['name'])
            for r in hs['negs']:
                print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + r['neg'] + ') : ' + r['detail'])
                if r['ok']: fails.append('negative hamlets ' + r['neg'])
            # Nephtos on the sim (settlements/isle-demo 47k), after the same two days
            print('--- Nephtos in the sim (47k) ---')
            for neg in (None, 'unfed', 'unvisited'):
                for r in await pg.evaluate(COLONY_SIM_JS, neg):
                    if neg is None:
                        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                        if not r['ok']: fails.append(r['name'])
                    elif r.get('neg') == neg:
                        print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') : ' + r['detail'])
                        if r['ok']: fails.append('negative colony ' + neg)
        if a.assert_:
            await VW.resources(pg, V, a.out, fails)
        for v in [int(t) for t in a.views.split(',') if t.strip()]:
            await pg.evaluate('_api.go(%d)' % v)
            s = await pg.evaluate('_api.settle(240000)')
            out = os.path.join(a.out, 'view%02d.png' % v)
            await V.shot(out, view='view%02d' % v)
            print('view %d: %s  settle %s' % (v, out, s.get('ms') if isinstance(s, dict) else s))
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel: print('ERROR PANEL (after):', panel[:1500]); fails.append('error panel')
        if errs: print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
    return V.exit()

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default='./shots')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
