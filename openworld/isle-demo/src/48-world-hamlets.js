// ================================================================= ISLE DEMO — the hamlets: the resource villages, the farming hamlets and the plantations
// [G data] core/hamlet/PLAN.md section 4 (H4): the salt village on the big north-west pan (Kautoa's), the iron mine in
// Valapo's mountains, the lumber village in the wet jungle east of Kautoa, the ranch on the savanna north of it. Each
// spec names its focus, its parent town and the survey's patch; ISLE_HAMLETS.make() finds the resource in that patch on
// the world's own ground (the isles kit's gather tag for salt and pasture, its zones for the forest, the heights for the
// iron), places it, sites the village beside it on dry, gentle ground, and lays the village out with KHAMLET.village. No
// three.js, no DOM: every number is a function of the world's fields and the specs (KRAND inside the generator), so the
// same villages come out in Godot. 88h-world-hamlets.js draws them; it decides nothing.
// THE COUNTRYSIDE (settlements/isle-demo/PLAN.md section 11; the owner, 2026-11-04; built 2026-11-09): the towns' food
// grows in farming hamlets round them, four for Kautoa and two for Valapo, sized from the land estimate on each town's
// census (KHAMLET.farmNeed: 0.075 ha in crop a person, 0.75 ha a hand), and one plantation each for the cash crops (8c:
// Kautoa's cloves and cacao, Valapo's cane, cotton and upland coffee). A farming spec names no patch: its site comes from
// the town's HINTERLAND SURVEY (farmSite): cells of FARM.cell m in the ring FARM.rMin beyond the town's square to FARM.rMax,
// each scored by the share of its 3 x 3 sub-samples that are dry, gentle, off the town and take one of the hamlet's crops
// (their slope and height rows), the best score less half its distance's share taken, at least FARM.apart from every
// village and resource placed before it (so the four spread round the town). The village stands on the cell, its
// farmsteads toward the farmland's centre FARM.off m beyond it (away from the town), and the farmland (core/hamlet 14, by
// settlements/isle-demo 47h ISLE.farmlandOf) is laid round that centre on the same ground rule, parcels in crop and
// fallow, until the hands' land is in crop; the farmland record is the village's resource in the sim.
//   ISLE_HAMLETS.SPECS                  the villages, in order: the six resource villages (Valapo's quarry and lumber
//                                        village since 2026-11-04), then the farming hamlets and the plantations
//   ISLE_HAMLETS.make(dims, opt)        -> {villages: [{spec, village, resource, link}], resources: [records], errors: []}
//                                        dims(key) -> {w, d, h} (the kits' boxes); opt.people {town: its census} sizes the
//                                        farming hamlets (the plan's figures when absent); opt.world the seed
//   ISLE_HAMLETS.groundOk(x, z)         dry land, gentle, no cliff, not the salt crust, not a town's ground
//   ISLE_HAMLETS.farmFit(x, z, crops)   the hinterland survey's score at a point, 0..1
//   ISLE_HAMLETS.shoreOf(site, berth?)  the nearest sea shore within SHORE_R of a point (below), or null
// THE COAST (the owner, 2026-11-09: "a little port and cargo stop at lumber village, this would make sense for any hamlets
// near the coast"): a village whose site has the sea's edge within SHORE_R (a kilometre) gets a LANDING (core/hamlet 30: the quay with
// its cargo shed on the shore point, a lane to it): the shore is found by marching out from the site in 36 directions
// to the first water, kept when that water goes on as sea (a metre deep 200 m further) and a sea route from it to the
// town's trade landing exists (ISLE_TOWNS_W.seaPath, the canoe line's search), the nearest such; the route's length is
// the village's sea leg (`seaKm`, settlements/isle-demo 47h: a lakatoi of its own on SIM.trade). A LUMBER VILLAGE is
// sited on a coastal stand when its patch has one (the forest cell nearest the town among those with the sea within
// SHORE_R: its timber goes by sea, its felling crew ranges inland), the village itself 150 m inland of that stand's
// shore, else on the stand nearest the town as before.
var ISLE_HAMLETS=(function(){
const SPECS=[
 {id:'hamlet-salt',name:'Salt village',focus:'salt',parent:'Kautoa',near:[-14776,-107820],look:7000},
 {id:'hamlet-mine',name:'Iron mine',focus:'mine',parent:'Valapo',near:[-18000,66000],look:6000,metal:'iron',grade:'medium'},
 {id:'hamlet-lumber',name:'Lumber village',focus:'lumber',parent:'Kautoa',near:[74697,-42993],look:15000},   /* the patch reaches the gulf shore 8 km west: a coastal stand (2026-11-09) */
 {id:'hamlet-ranch',name:'Ranch',focus:'ranch',parent:'Kautoa',near:[20093,-117084],look:7000},
 {id:'hamlet-quarry',name:'Quarry',focus:'quarry',parent:'Valapo',near:[-8000,56000],look:6000,grade:'medium',apart:2500},
 {id:'hamlet-lumber-v',name:'Valapo lumber village',focus:'lumber',parent:'Valapo',near:[-9000,53000],look:16000,apart:2500},   /* 2026-11-04: Valapo's own timber and felling crew, on its island; 2026-11-09: the patch widened to the town's whole coast, so the stand with a sea route to its harbour (the peninsula across its inlet) is found: the old patch's forest faced the open east sea, 35 km of land from the harbour */   /* 2026-11-04: Valapo's own stone, on its island (the highest dry ground round the town, apart from the mine) */
 /* the countryside (PLAN.md section 11): `crops` names the town's rows in the tune (settlements/isle-demo 15 hamlets.farming.crops),
    `share` the hamlet's share of its town's farm hands, a plantation its own `hands` */
 {id:'hamlet-farm-k1',name:'Kautoa farming hamlet 1',focus:'farming',parent:'Kautoa',crops:'staples',share:1/4},
 {id:'hamlet-farm-k2',name:'Kautoa farming hamlet 2',focus:'farming',parent:'Kautoa',crops:'staples',share:1/4},
 {id:'hamlet-farm-k3',name:'Kautoa farming hamlet 3',focus:'farming',parent:'Kautoa',crops:'staples',share:1/4},
 {id:'hamlet-farm-k4',name:'Kautoa farming hamlet 4',focus:'farming',parent:'Kautoa',crops:'staples',share:1/4},
 {id:'hamlet-plant-k',name:'Kautoa plantation',focus:'farming',parent:'Kautoa',crops:'cash',plantation:true,hands:60},
 {id:'hamlet-farm-v1',name:'Valapo farming hamlet 1',focus:'farming',parent:'Valapo',crops:'staples',share:1/2},
 {id:'hamlet-farm-v2',name:'Valapo farming hamlet 2',focus:'farming',parent:'Valapo',crops:'staples',share:1/2},
 {id:'hamlet-plant-v',name:'Valapo plantation',focus:'farming',parent:'Valapo',crops:'cash',plantation:true,hands:60}];
const FARM={cell:500,rMin:2000,rMax:14000,apart:3000,subStep:150,minFit:.7,off:350};
const SHORE_R=1000,SHORE_STEP=10,FOREST_MIN=.4,FOREST_R=1500;   /* a lumber village's stand: forest over two fifths of the crew's near range (the tune's range is 3 km) */
const DEFAULT_PEOPLE={Kautoa:6040,Valapo:2095};   /* the plan's census (PLAN.md section 11) when the page hands none in */
const CELL=150,SLOPE=.3,DRY=1.2;
/* the land without the roads (WORLD.Hland): the highways are baked over the villages' lane ends (48r, bake.py), so the
   survey must read the same ground before and after the bake, or a baked road would miss a village that moved */
const H=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z),wet=(x,z)=>WORLD.water(x,z)>H(x,z)-DRY;
const slope=(x,z)=>Math.max(Math.abs(H(x+4,z)-H(x-4,z)),Math.abs(H(x,z+4)-H(x,z-4)))/8;
const G=(x,z)=>RINGISLES.gather(x,z),Z=(x,z)=>RINGISLES.zones(x,z);
function groundOk(x,z){if(wet(x,z)||slope(x,z)>SLOPE)return false;const z0=Z(x,z);if(z0.cliff>.3||z0.pan>.3||z0.mangal>.3)return false;return !WORLD.townW(x,z);}
const parentOf=n=>{const s=WORLD_DATA.meta.settlements.find(q=>q.name===n);return s?[s.x,s.z]:null;};
/* the patch's cells, scanned on a CELL grid round the survey point, in a fixed order */
function cells(sp,fn){const out=[],n=Math.floor(sp.look/CELL);
 for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){const x=sp.near[0]+i*CELL,z=sp.near[1]+j*CELL;if(i*i+j*j>n*n)continue;const v=fn(x,z);if(v)out.push({x,z,v});}
 return out;}
const near=(L,p)=>{let b=null,bd=1e18;for(const c of L){const d=Math.hypot(c.x-p[0],c.z-p[1]);if(d<bd){bd=d;b=c;}}return b;};
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(P.length<3)return P;const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo=[],up=[];for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
 for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
 return lo.slice(0,-1).concat(up.slice(0,-1));}
/* a field from the patch's cells within R of a seed cell: its hull, its capacity (km2 of full weight), its grade */
function field(sp,kind,L,seed,R){const own=L.filter(c=>Math.hypot(c.x-seed.x,c.z-seed.z)<R),a=CELL*CELL/1e6;
 const cap=own.reduce((s,c)=>s+(c.v===true?1:c.v),0)*a,mean=own.length?own.reduce((s,c)=>s+(c.v===true?1:c.v),0)/own.length:0;
 let grade=resFieldGrade(mean);
 if(kind==='salt'){const rain=WORLD.at?WORLD.at(seed.x,seed.z).rain:null;grade=rain==null?'medium':rain<800?'high':rain<1200?'medium':'low';}
 return{id:sp.id+':field',kind,grade,cap:Math.round(cap*100)/100,cells:own.length,poly:hull(own.map(c=>[c.x,c.z]))};}

/* the hinterland survey for a farming hamlet (above): the best cell round the town, or null */
const cropRows=sp=>{const T=typeof ISLE!=='undefined'&&ISLE.TUNE&&ISLE.TUNE.sim,TS=T&&T.towns[sp.parent];return TS&&ISLE.hamletCrops?ISLE.hamletCrops(TS.id,sp):[];};
const takes=(crops,x,z)=>{const s=slope(x,z),h=H(x,z);return crops.some(C=>s<=(C.maxSlope==null?KHAMLET.FARM.slopeMax:C.maxSlope)&&(C.minH==null||h>=C.minH)&&(C.maxH==null||h<=C.maxH));};
function farmFit(x,z,crops){let n=0,k=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const px=x+i*FARM.subStep,pz=z+j*FARM.subStep;n++;if(WORLD.inside(px,pz)&&groundOk(px,pz)&&takes(crops,px,pz))k++;}return k/n;}
function farmSite(sp,P,out,crops){const half=typeof ISLE!=='undefined'&&ISLE.PROG&&ISLE.PROG[sp.parent]?ISLE.PROG[sp.parent].half:4400,r0=half+FARM.rMin,n=Math.ceil(FARM.rMax/FARM.cell);
 const taken=out.villages.filter(V=>V.village&&V.village.site).map(V=>V.village.site).concat(out.resources.filter(r=>r.x!=null).map(r=>({x:r.x,z:r.z})));
 let best=null;
 for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){const x=P[0]+i*FARM.cell,z=P[1]+j*FARM.cell,d=Math.hypot(i*FARM.cell,j*FARM.cell);if(d<r0||d>FARM.rMax||!WORLD.inside(x,z))continue;
  if(taken.some(t=>Math.hypot(t.x-x,t.z-z)<FARM.apart))continue;const fit=farmFit(x,z,crops);if(fit<FARM.minFit)continue;const score=fit-.5*d/FARM.rMax;
  if(!best||score>best.score+1e-9)best={x,z,d,fit,score};}
 return best;}

/* the sea within SHORE_R of a point: a quick look along eight bearings (the siting of a lumber village) */
function nearSea(x,z){for(let a=0;a<8;a++){const ux=Math.cos(a*Math.PI/4),uz=Math.sin(a*Math.PI/4);for(let r=150;r<=SHORE_R;r+=150){const px=x+ux*r,pz=z+uz*r;if(WORLD.water(px,pz)>H(px,pz)-.4&&WORLD.water(px+ux*200,pz+uz*200)>H(px+ux*200,pz+uz*200)+1)return true;}}return false;}
/* the shore nearest a village's site (above): -> {x, z (the beach, the last dry point), ux, uz (seaward), d, path} or null */
function shoreOf(site,berth){const C=[];
 for(let a=0;a<360;a+=10){const ux=Math.cos(a*Math.PI/180),uz=Math.sin(a*Math.PI/180);let last=null;
  for(let r=40;r<=SHORE_R;r+=SHORE_STEP){const x=site.x+ux*r,z=site.z+uz*r;
   if(WORLD.water(x,z)>H(x,z)-.4){/* water: the sea when it goes on a metre deep 200 m further; a tidal flat or a pool is marched across */
    if(last&&WORLD.water(x+ux*200,z+uz*200)>H(x+ux*200,z+uz*200)+1){C.push({x:last[0],z:last[1],ux,uz,d:r});break;}continue;}
   last=[x,z];}}
 C.sort((p,q)=>p.d-q.d||p.ux-q.ux||p.uz-q.uz);
 for(const c of C.slice(0,8)){if(!berth)return c;const P=ISLE_TOWNS_W.seaPath([c.x+c.ux*40,c.z+c.uz*40],[berth.x,berth.z]);if(P&&P.ok){c.path=P;return c;}}
 return null;}

function make(dims,opt){opt=opt||{};const out={villages:[],resources:[],errors:[],berths:opt.berths||{},siting:{}};   /* siting: how each lumber village's stand was chosen (the probe) */   /* the towns' trade landings, kept for the checks */
 for(const sp of SPECS){const P=parentOf(sp.parent);if(!P){out.errors.push(sp.id+': no parent '+sp.parent);continue;}
  let res=null,start=null,workers=null,farmCrops=null,farmFitAt=null,shoreSite=false;
  if(sp.focus==='salt'||sp.focus==='ranch'){
   const kind=sp.focus==='salt'?'salt':'pasture',L=cells(sp,(x,z)=>{if(wet(x,z))return 0;const g=G(x,z);return kind==='salt'?(g.salt||0):(g.pasture>.5?g.pasture:0);});
   if(!L.length){out.errors.push(sp.id+': no '+kind+' in the patch');continue;}
   const seed=kind==='salt'?near(L,P):near(L,sp.near);res=field(sp,kind,L,seed,kind==='salt'?2500:3000);
   workers=resFieldWorkers(res);res.x=seed.x;res.z=seed.z;start=[seed.x,seed.z];}
  else if(sp.focus==='lumber'){
   const far=(x,z)=>!sp.apart||out.resources.every(r=>Math.hypot(r.x-x,r.z-z)>=sp.apart);
   const L=cells(sp,(x,z)=>{if(wet(x,z)||WORLD.townW(x,z)||!far(x,z))return 0;const z0=Z(x,z);return z0.forest>.6?z0.forest:0;});
   if(!L.length){out.errors.push(sp.id+': no forest in the patch');continue;}
   /* a coastal stand first: the nearest to the town whose shore has a sea route to the town's landing (the berth), else the
      nearest coastal stand, else the nearest stand (the sea route is tried on a few: shoreOf runs the sea router) */
   const half0=typeof ISLE!=='undefined'&&ISLE.PROG&&ISLE.PROG[sp.parent]?ISLE.PROG[sp.parent].half:4400,farOut=c=>Math.hypot(c.x-P[0],c.z-P[1])>=half0+FARM.rMin;   /* beyond the town's ground and its first fields, as a farming hamlet */
   const berth0=opt.berths&&opt.berths[sp.parent]||null,Q=berth0?[berth0.x,berth0.z]:P,coastal=L.filter(c=>farOut(c)&&nearSea(c.x,c.z)).sort((a,b)=>Math.hypot(a.x-Q[0],a.z-Q[1])-Math.hypot(b.x-Q[0],b.z-Q[1]));   /* nearest the harbour first: the sea route's end */
   /* and forest enough round it for the crew's range (a lone tree-cell on a shore is no stand: Valapo's inlet peninsula): the
      share of FOREST_R round it that is forest, at least FOREST_MIN */
   const forestAround=c=>{let n=0,k=0;for(let dz=-FOREST_R;dz<=FOREST_R;dz+=150)for(let dx=-FOREST_R;dx<=FOREST_R;dx+=150){if(dx*dx+dz*dz>FOREST_R*FOREST_R)continue;n++;const x=c.x+dx,z=c.z+dz;if(WORLD.inside(x,z)&&!wet(x,z)&&!WORLD.townW(x,z)&&Z(x,z).forest>.6)k++;}return n?k/n:0;};
   let seed=null;const siting=out.siting[sp.id]={coastal:coastal.length,forested:0,routed:null,tried:0};
   if(berth0){const seen=new Set();for(const c of coastal){if(forestAround(c)<FOREST_MIN)continue;siting.forested++;const k=Math.round(c.x/1500)+','+Math.round(c.z/1500);if(seen.has(k))continue;seen.add(k);siting.tried++;if(siting.tried>60)break;
     if(shoreOf({x:c.x,z:c.z},berth0)){seed=c;siting.routed=[c.x,c.z];break;}}}   /* the sea route tried on the forested ones only (one a 1.5 km cell: the forest test first, or a bare cell would stand for a wooded one), nearest the harbour first */
   if(!seed){const Lf=L.filter(farOut);seed=near(coastal.length?coastal:Lf.length?Lf:L,P);}res={id:sp.id+':stand',kind:'stand',x:seed.x,z:seed.z,radius:600,
    forest:(x,z)=>{if(!WORLD.inside(x,z)||wet(x,z)||WORLD.townW(x,z))return 0;const f=Z(x,z).forest;return f>.6?f:0;}};start=[seed.x,seed.z];   /* the felling crew's range (settlements/isle-demo 47h, core/camp 40): the forest's share where it stands */
   if(coastal.length){const sh=shoreOf({x:seed.x,z:seed.z},opt.berths&&opt.berths[sp.parent]||null);if(sh){start=[sh.x-sh.ux*150,sh.z-sh.uz*150];shoreSite=true;}}}
  else if(sp.focus==='mine'||sp.focus==='quarry'){
   const far=(x,z)=>!sp.apart||out.resources.every(r=>Math.hypot(r.x-x,r.z-z)>=sp.apart);   /* a quarry apart from the mine's hill */
   const L=cells(sp,(x,z)=>wet(x,z)||WORLD.townW(x,z)||!far(x,z)?0:H(x,z)+1e4);if(!L.length){out.errors.push(sp.id+': no land in the patch');continue;}
   let top=L[0];for(const c of L)if(c.v>top.v)top=c;
   res=sp.focus==='quarry'?{id:sp.id+':face',kind:'stone',grade:sp.grade,x:top.x,z:top.z,key:null,node:true}:{id:sp.id+':node',kind:sp.metal,grade:sp.grade,x:top.x,z:top.z,key:resNodeKey(sp.metal,sp.grade),node:true};start=[top.x,top.z];}
  else if(sp.focus==='farming'){
   const crops=cropRows(sp);if(!crops.length){out.errors.push(sp.id+': no crop rows for '+sp.parent);continue;}
   const c=farmSite(sp,P,out,crops);if(!c){out.errors.push(sp.id+': no farmland site in the hinterland of '+sp.parent);continue;}
   const people=(opt.people||{})[sp.parent]||DEFAULT_PEOPLE[sp.parent]||2000;
   workers=sp.plantation?(sp.hands==null?60:sp.hands):Math.ceil(KHAMLET.farmNeed(people).hands*(sp.share==null?1:sp.share));
   start=[c.x,c.z];farmCrops=crops;farmFitAt=c.fit;}
  /* the village starts beside its resource, toward its town; siteFor finds dry flat ground from there. A farming hamlet
     stands on its survey cell, its farmland's centre FARM.off m beyond it (away from the town), its farmsteads toward it */
  const dx=P[0]-start[0],dz=P[1]-start[1],L0=Math.hypot(dx,dz)||1,ux=dx/L0,uz=dz/L0,off=farmCrops||shoreSite?0:sp.focus==='mine'||sp.focus==='quarry'?180:sp.focus==='ranch'?0:260;
  const site={x:start[0]+ux*off,z:start[1]+uz*off},rp=res?{x:res.x,z:res.z}:{x:start[0]-ux*FARM.off,z:start[1]-uz*FARM.off};
  const berth=opt.berths&&opt.berths[sp.parent]||null,vspec={id:sp.id,world:opt.world==null?4242:opt.world,culture:'islander_east',focus:sp.focus,site,
   link:{x:site.x+ux*400,z:site.z+uz*400},resource:{x:rp.x,z:rp.z,workers:workers==null?undefined:workers},dims,
   ground:{ok:groundOk},siteReach:sp.focus==='mine'||sp.focus==='quarry'?300:900,worksOut:farmCrops?['ie-farm']:undefined,   /* the farmsteads stand on their holdings (core/hamlet 14) */
   vacant:typeof ISLE!=='undefined'&&ISLE.TUNE&&ISLE.TUNE.sim.hamlets.grow?ISLE.TUNE.sim.hamlets.grow.vacant:0};   /* the empty plots the village grows by (step 5) */
  /* the coast: the shore from the site the village settles on (laid again when siteFor moved it) */
  let ld=shoreOf(site,berth);if(ld)vspec.landing=ld;
  let v=KHAMLET.village(vspec);
  if(v.site&&Math.hypot(v.site.x-site.x,v.site.z-site.z)>50){const ld2=shoreOf(v.site,berth);if((ld2&&!ld)||(!ld2&&ld)||(ld2&&ld&&Math.hypot(ld2.x-ld.x,ld2.z-ld.z)>5)){ld=ld2;if(ld)vspec.landing=ld;else delete vspec.landing;v=KHAMLET.village(vspec);}}
  if(ld&&v.landing){sp.landing={x:ld.x,z:ld.z,ux:ld.ux,uz:ld.uz};if(ld.path)sp.seaKm=Math.round(ld.path.len/100)/10;}
  if(v.error)out.errors.push(sp.id+': '+v.error);
  if(farmCrops&&!v.error){res=ISLE.farmlandOf(sp,v,{world:opt.world==null?4242:opt.world,centre:rp,ground:{ok:groundOk,h:H,slope}});res.fit=farmFitAt;
   if(res.capped)out.errors.push(sp.id+': only '+res.inCropHa+' ha of '+res.target+' in crop within '+KHAMLET.FARM.rMax+' m');}
  /* the baked highway to the village (48r, data/roads.json): its length to the town sets the sim's road time (47h) */
  const rd=typeof WORLD_DATA!=='undefined'&&WORLD_DATA.roads&&WORLD_DATA.roads.roads?WORLD_DATA.roads.roads.find(r=>r.from===sp.id):null;
  if(rd&&rd.townKm!=null)sp.roadKm=rd.townKm;
  out.villages.push({spec:sp,village:v,resource:res,parent:P,road:rd?{to:rd.to,km:rd.length_m/1000,townKm:rd.townKm}:null,sea:ld&&v.landing?{km:sp.seaKm,shore:{x:ld.x,z:ld.z},path:ld.path?ld.path.pts:null}:null});if(res)out.resources.push(res);}
 /* the villages' names (core/hamlet 18: the Sikau list, dealt by a hash of the world and the village's id) */
 if(KHAMLET.dealNames){const D=KHAMLET.dealNames('islander',opt.world==null?4242:opt.world,out.villages.map(E=>E.spec.id));out.villages.forEach(E=>{const d=D[E.spec.id];if(d){E.name=d.name;E.gloss=d.gloss;}});}
 return out;}
return{SPECS,make,groundOk,farmFit,farmSite,cropRows,parentOf,shoreOf,H,slope,CELL,FARM,SHORE_R};})();
