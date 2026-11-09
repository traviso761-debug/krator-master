// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// A station (stations/<name>/45: STATION_TAKE) gives its own views, title, hint, region and checks; the kit's views are station 1's
const ST_TAKE=typeof STATION_TAKE!=='undefined'?STATION_TAKE:null;
const VIEWS=ST_TAKE&&ST_TAKE.views?ST_TAKE.views:{
 'The hyperjungle':[-1400,120,-1300,-200,140,-200],
 'Under the canopy':[-420,14,-520,-180,60,-300],
 'Forest floor':[-230,4,-280,-120,8,-190],
 'A hypertree':[420,40,380,180,150,120],
 'The tower':[520,60,-560,240,120,-260],
 'Under the tower':[300,30,-330,240,150,-260],
 'The brook':[-60,9,-420,60,6,-200],
 'Canopy top':[-900,420,600,0,300,0],
 'From afar':[-2600,260,-2400,0,180,0],
 'Krator rising':[-600,120,600,1900,900,-2100],
};
// views on the newer species and the fauna, found from the built forest: the
// hero of that species nearest the origin, seen from 2.4 crown radii away
if(ST_TAKE&&ST_TAKE.more)ST_TAKE.more(VIEWS);   /* a station's views on what it grew */
if(!ST_TAKE||!ST_TAKE.views)(function(){const TR=HYPERJUNGLE.TREES||[];
 const nearest=sp=>{let b=null;for(const T of TR){if(!T.hero||T.sp!==sp)continue;if(!b||Math.hypot(T.x,T.z)<Math.hypot(b.x,b.z))b=T;}return b;};
 const add=(name,T,k,hK)=>{if(!T)return;const d=T.crownR*k,a=Math.atan2(-T.z,-T.x)+.5;VIEWS[name]=[T.x+Math.cos(a)*d,T.y0+T.H*hK,T.z+Math.sin(a)*d,T.x,T.y0+T.H*.72,T.z];};
 add('A mahogany',nearest(4),2.4,.45);add('A kapok',nearest(5),2.4,.35);
 const M=nearest(4);if(M)VIEWS['Mahogany buttresses']=[M.x+M.rb*5,M.y0+9,M.z+M.rb*3,M.x,M.y0+14,M.z];
 const rg=typeof REG!=='undefined'?REG:[];const herd=rg.find(r=>r.kind==='fauna'&&/herd/.test(r.name)),flock=rg.find(r=>r.kind==='fauna'&&/flock/.test(r.name));
 if(herd)VIEWS['A herd']=[herd.x+70,herd.y+14,herd.z+40,herd.x,herd.y+4,herd.z];
 if(flock)VIEWS['Sky rays']=[flock.x-flock.r*1.2,flock.y+20,flock.z-flock.r*.4,flock.x,flock.y+60,flock.z];})();
// ---------------------------------------------------------------- the inspector's words: a plant or a tree part names its
// species or plant, and its harvest tag (biomes/FRUIT.md)
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null,S=item&&HYPERJUNGLE.speciesOfItem(item),PLT=item&&!S&&HYPERJUNGLE.plantOfItem(item);
 // a plant the register leaves out (a young or far tree, an understorey plant: BIO.nameAt, filled by 55-trees and 60-floor)
 // names the hit when it is smaller than the register's best: the shared items (understorey cards, fronds, small trunks) say only what part they are
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null,
  NF=NM?(NM.sp!=null?HYPERJUNGLE.SPECIES[NM.sp]:NM.plant?HYPERJUNGLE.PLANTS[NM.plant]:null):null;
 const SB=!item&&best&&HYPERJUNGLE.SPECIES.find(s=>best.name===s.name+' hypertree'),F=S||SB||PLT||NF,hv=F?F.tags.harvest:null;
 return(NM?NM.name+'  ·  '+(o.userData.inspectLabel||item||o.name||'mesh'):(S||PLT)?(S||PLT).name+'  ·  '+(o.userData.inspectLabel||item):(best?best.name:(o.userData.inspectLabel||o.name||'mesh')))+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// Budgets per biome pass come from BIO.stats (charged by BIO.cur inside the biome).
// Raised from 5M / 1.4M per pass when the belt grew to six hypertree species,
// a 2 km hero disc, the extra understorey and the fauna (Sep 2026).
const BUDGET={
 showcase:{tris:11000000,calls:380},  // calls 140 -> 380 (2026-10-27): the runtime LOD draws a mesh per chunk and range for a fraction of the triangles (eastabyss 189, nhighlands 164-293)
 cls:{pass:6500000,host:600000},
 type:{'jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','jungle/station':'pass','jungle/kin':'pass','host':'host'},
};
if(ST_TAKE&&ST_TAKE.budget)Object.assign(BUDGET.showcase,ST_TAKE.budget);   /* a station's own page budget (its 45: the savage land's taller old growth and its herds) */
// species and plants that yield something edible the kit does not draw as a catalog fruit: named, not hidden
const FRUIT_NOT_DRAWN=['treefern','ginger','bromeliad'];
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome)n[M.name.replace(/^biome:/,'')]=(n[M.name.replace(/^biome:/,'')]||0)+M.count;});return n;};
const HCHK={
 // fruit: every species and plant carries a harvest tag; every edible one names a catalog piece (or is listed as not
 // drawn); every catalog fruit the kit names is drawn by its item; the screwpines bear pandan-key heads
 fruit(SP,PL,N){const all=SP.map(S=>[S.key,S.tags]).concat(Object.keys(PL).map(k=>[k,PL[k].tags]));
  const untagged=all.filter(e=>!e[1].harvest).map(e=>e[0]);
  const miss=all.filter(e=>e[1].harvest&&e[1].harvest.edible.length&&!e[1].harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(e[0])<0).map(e=>e[0]);
  const keys=[...new Set(all.map(e=>e[1].harvest&&e[1].harvest.fruit).filter(Boolean))];
  const undrawn=keys.filter(k=>!(N[HYPERJUNGLE.FRUIT_ITEMS[k]]>0));
  const ok=!untagged.length&&!miss.length&&!undrawn.length&&keys.length>=4&&(N.pandankeys||0)>=(ST_TAKE&&ST_TAKE.pandanMin!=null?ST_TAKE.pandanMin:20);   /* a station with less jungle has fewer screwpines (its 45: pandanMin) */
  return{ok,detail:(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+
   (undrawn.length?'catalogued but not drawn: '+undrawn.join(', ')+'; ':'')+all.length+' tagged, '+keys.length+' catalog keys ('+keys.join(', ')+'); drawn: '+
   ['pod','capsule','bloom','pandankeys'].map(k=>k+' '+(N[k]||0)).join(', ')};},
 /* views: the far forest is blob impostors from heroR+30 out (55-trees, KNOWN_ISSUES): a preset camera inside that ring sees blobs at
    close range, so every preset stands inside the hero disc (with 30 m to spare) or beyond the ring's outer edge, looking in */
 views(V,rg){if(!rg)return{ok:false,detail:'the build reported no rings'};const c=BIO.center(),bad=[];let n=0;
  for(const k in V){const v=V[k];if(!v)continue;n++;const d=Math.hypot(v[0]-c[0],v[2]-c[1]);if(!(d<rg.hero||d>rg.far[1]))bad.push(k+' at '+Math.round(d)+' m');}
  return{ok:!bad.length,detail:(bad.length?'in the impostor ring: '+bad.join(', ')+'; ':'')+n+' views; hero disc '+rg.hero+' m, far forest '+rg.far[0]+'-'+rg.far[1]+' m'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(HYPERJUNGLE.SPECIES,HYPERJUNGLE.PLANTS,_itemCounts()));
 add('preset views stand inside the hero disc or outside the far forest',HCHK.views(VIEWS,window._biome&&window._biome.rings));
 if(ST_TAKE&&ST_TAKE.checks)ST_TAKE.checks(add);
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts();
 const noFruit=(S,k)=>S.key===k?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S;
 add('a fruiting species with no catalog fruit',HCHK.fruit(HYPERJUNGLE.SPECIES.map(S=>noFruit(S,'mahogany')),HYPERJUNGLE.PLANTS,N));
 add('screwpines with no pandan-key heads drawn',HCHK.fruit(HYPERJUNGLE.SPECIES,HYPERJUNGLE.PLANTS,Object.assign({},N,{pandankeys:0})));
 if(ST_TAKE&&ST_TAKE.negatives)ST_TAKE.negatives(add);
 add('a preset view standing in the impostor ring',HCHK.views(Object.assign({},VIEWS,{test:[ (window._biome&&window._biome.rings?window._biome.rings.hero:1500)+120+BIO.center()[0],60,BIO.center()[1],0,0,0]}),window._biome&&window._biome.rings));
 add('a plant with no harvest tag',HCHK.fruit(HYPERJUNGLE.SPECIES,Object.assign({},HYPERJUNGLE.PLANTS,{test:{name:'test',tags:{},items:[]}}),N));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');   /* the runtime LOD (45, 88): each chunk mesh by its range */
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'hyperjungle',title:ST_TAKE&&ST_TAKE.title||'Krator biome — the central hyperjungle',
 hint:ST_TAKE&&ST_TAKE.hint||'The central hyperjungle (ideal type), with a ruined Girder tower to dress',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the tower':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
// THE SEASON (core/clock, BIO.bindSeason; 2026-10-27, BACKPORT.md's row): the materials that read it (50: SEAS; a station's monsoon
// forest and grass, its lake's level) follow the clock's dry season; the closed jungle's own leaves do not turn (it is XA: no dry
// season to speak of). ?season=0 draws them as before. The monsoon: two seasons, the rains in the southern summer
if(new URLSearchParams(location.search).get('season')!=='0'&&BIO.bindSeason)BIO.bindSeason(null,{sharp:2});
