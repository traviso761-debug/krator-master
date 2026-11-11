// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this page
// has. The views are the station's (SITE.views, 44s); the checks are the kit's and the station's. Forked from biomes/wouterwall's.
// a view from a point to a point, each [x, z, metres over the ground, or over the water where the point is on the tarn]
const _vwY=(x,z)=>Math.max(terrainH(x,z),waterH(x,z));
const VW=(c,t)=>[c[0],_vwY(c[0],c[1])+c[2],c[1],t[0],_vwY(t[0],t[1])+t[2],t[1]];
const VIEWS=SITE.views?SITE.views(VW):{'Over the station':VW([0,-900,260],[0,0,0])};

// ---------------------------------------------------------------- the inspector's words: a plant names its species and its harvest
// (the NW outer wall's, read in place, or this kit's own); a point its zone, its climate and the ground's heat
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,'').replace(/^[^|]*\|/,''):null;
 const PLT=item&&(NEOW.plantOfItem(item)||NWOW.plantOfItem(item)),SB=best&&(NEOW.SPECIES.find(s=>best.key===s.key)||NWOW.SPECIES.find(s=>best.key===s.key)),F=PLT||SB,hv=F&&F.tags?F.tags.harvest:null;
 const A=inNear(p.x,p.z)?NEOW.at(p.x,p.z):null;
 return(F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+
  (A?'\nzone '+NEOW.ZONES[A.zone].name+' · mean '+A.clim.mean.toFixed(1)+' °C (warmest '+A.clim.warm.toFixed(0)+', coldest '+A.clim.cold.toFixed(0)+')'+
   ' · the ground '+A.F.heat.toFixed(0)+' °C'+(A.F.heat>=NEOW.HEAT.scald?' (scalding)':''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+' ('+(BASE+p.y).toFixed(0)+' m on the model)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:260},
 cls:{pass:7000000,host:3000000},
 type:{'nwouterwall/trees':'pass','nwouterwall/floor':'pass','neouterwall/trees':'pass','neouterwall/floor':'pass','host':'host'},
};
const HCHK={
 // the cauldron's heat bands (46: NEOW.heatK): the mats come before the bare sinter, the sinter before a scald, none on the soil's mean
 heat(K){const a=K(NEOW_REGION.site.mean),b=K(30),c=K(48),d=K(75);
  const ok=a.mat<.01&&a.sinter<.01&&b.mat>.9&&b.sinter<.01&&c.sinter>.9&&c.scald<.01&&d.scald>.9;
  return{ok,detail:'mats '+a.mat.toFixed(2)+' at the soil\'s '+NEOW_REGION.site.mean.toFixed(0)+' °C, '+b.mat.toFixed(2)+' at 30; sinter '+c.sinter.toFixed(2)+' at 48; scald '+d.scald.toFixed(2)+' at 75'};},
 // the station's landforms, each where the zones say: the tarn, the apron's grove, the wall, the dikes, the springs, the stair, the mats and
 // the sinter, drawn on the near ground's zone raster; the dikes and the springs registered
 zones(need,ZC,reg){const lack=need.filter(z=>!(ZC[z]>0)),dk=reg.filter(r=>r.key==='landform.dike').length,sp=reg.filter(r=>r.key==='landform.spring').length;
  return{ok:!lack.length&&dk>=(SITE.need?SITE.need[0]:12)&&sp===SITE.springs.length,detail:need.map(z=>z+' '+(ZC[z]||0)).join(', ')+'; '+dk+' dike fins, '+sp+' springs'+(lack.length?'; missing '+lack.join(', '):'')};},
 // the springs: each on the apron at the wall's foot, its water over its ground, the main spring the hottest and its ground over 60 °C
 springs(S,H){if(!S||!S.length)return{ok:false,detail:'no springs'};let bad=0;S.forEach(q=>{const y=terrainH(q.x,q.z);if(!(q.level>y-.05)||sitePoint(q.x,q.z).part==='model'&&q.d<0)bad++;});
  const hot=H(S[0].x,S[0].z),main=S[0].temp>=Math.max(...S.map(q=>q.temp));
  return{ok:!bad&&hot>NEOW.HEAT.scald&&main,detail:S.length+' springs, '+bad+' dry or off the apron; the main spring\'s ground '+hot.toFixed(0)+' °C'};},
 // the stair: its treads stepping down (never climbing) from the main spring to just over the tarn, every tread a still on its own level
 stair(T,W){if(!T||!W)return{ok:false,detail:'no stair'};let climb=0;for(let k=1;k<T.levels.length;k++)if(T.levels[k]>=T.levels[k-1])climb++;
  const last=T.levels[T.levels.length-1],ok=!climb&&W.pools&&W.pools.length===T.levels.length&&last>LAKE_LV&&last<LAKE_LV+2;
  return{ok,detail:T.levels.length+' treads from '+T.levels[0].toFixed(1)+' to '+last.toFixed(1)+' m, '+climb+' climbing; '+(W.pools?W.pools.length:0)+' stills, '+(W.falls?W.falls.length:0)+' falls'};},
 // the tree ferns warm: on the apron's grove most, where the springs warm the ground; none on the mats, the sinter or in water
 ferns(TREES,F){const n=TREES.length,grove=TREES.filter(T=>T.zone==='grove').length,warm=TREES.filter(T=>NEOW.THERM&&NEOW.THERM.excess(T.x,T.z)>.5).length;
  let bad=0;TREES.forEach(T=>{const A=F(T.x,T.z),z=NEOW.zoneOf(A);if(A.water||z==='mat'||z==='sinter'||z==='spring'||z==='stair')bad++;});
  return{ok:n>=40&&grove>n*.5&&bad===0&&warm>0,detail:n+' steam tree ferns: '+grove+' in the grove, '+warm+' on ground the springs warm; '+bad+' in water, on the mats or the sinter'};},
 // nothing roots in water, on a wall, on a dike or in a spring
 roots(TREES){let wet=0,wall=0,dike=0,hot=0;TREES.forEach(T=>{const F=NEOW.FIELDS(T.x,T.z),z=NEOW.zoneOf(F);if(F.water)wet++;if(z==='wall')wall++;if(F.dike)dike++;if(F.spring||F.stair)hot++;});
  return{ok:wet+wall+dike+hot===0&&(KIND==='portal'||TREES.length>100),detail:TREES.length+' trees; '+wet+' in water, '+wall+' on a wall, '+dike+' on a dike, '+hot+' in a spring or the stair'};},
 // the sky: the shared sky at the station's pixel, its far land cast from the model (three layers of 1024)
 sky(S){const R=S.preset.ridges||[],ok=R.length===3&&R.every(r=>r.profile&&r.profile.length===1024)&&S.preset.site.px===NEOW_REGION.site.px;
  return{ok,detail:'site px '+S.preset.site.px+','+S.preset.site.py+'; ridges '+R.map(r=>(r.dist/1000).toFixed(0)+' km').join(', ')};},
 // the season: the NW outer wall's larch (read in place) and the snow; the springs' ground bare of it
 season(){const lab=BIO.kits.nwouterwall.defs.larchspray.label,want=SEASON==='winter'?/bare/:SEASON==='autumn'?/gold/:/green/;const ok=want.test(lab)&&!!ATMOS.snow&&(!SITE_SPRINGS.length||!!SNOW_BARE);
  return{ok,detail:SEASON+': '+lab+'; snow base '+(ATMOS.U.snowBase?ATMOS.U.snowBase.value:'?')+'; the springs\' ground bare: '+(SNOW_BARE?SNOW_BARE.n+' cells':'no mask')};}};
// the water: core/water's records (the tarn an open surface at the model's level, the springs, the stair) and drawn
HCHK.water=(W,D)=>{if(!W)return{ok:false,detail:'no core/water records'};const L=W.lake,ok=!!L&&L.kind==='open'&&Math.abs(LAKE_LV)<1&&W.springs.length===SITE_SPRINGS.length&&!!D&&!!D.lake&&D.springs.length===W.springs.length&&!!D.stair;
 return{ok,detail:'the tarn '+(L?L.kind+' at '+LAKE_LV.toFixed(2)+' m':'missing')+'; '+W.springs.length+' springs; drawn: '+(D?Object.keys(D).join(', '):'none')};};
// THE BADLANDS (station 3): the gullies' floors never climb downstream; the ribs and the ore outcrops registered where the zones say
HCHK.gullies=(R)=>{if(!R||!R.lines)return{ok:false,detail:'no gully record'};let climb=0,n=0;R.lines.forEach(L=>{for(let i=1;i<L.pts.length;i++){n++;if(L.pts[i][2]>L.pts[i-1][2]+1e-6)climb++;}});
 return{ok:R.lines.length>=3&&climb===0,detail:R.lines.length+' gully lines, '+n+' floor steps, '+climb+' climbing'};};
HCHK.ribs=(reg,need)=>{const dk=reg.filter(r=>r.key==='landform.dike').length,ore=reg.filter(r=>r.key==='landform.ore').length;
 return{ok:dk>=need[0]&&ore>=need[1],detail:dk+' dike ribs, '+ore+' ore outcrops (want '+need[0]+' and '+need[1]+')'};};
const CAULDRON=SITE.kind==='cauldron'||SITE.kind==null,KIND=SITE.kind||'cauldron';
const ZONES_NEED={cauldron:['water','grove','wall','dike','spring','stair','mat','shore'],badlands:['gully','wall','dike','tundra'],
 scarp:['scarp','dike','meadow'],portal:['mouth','ice','wall']}[KIND];   /* the cairns are under a raster cell: the registry counts them */
// THE MIRROR SCARP (station 4): slump blocks under their head scarps, the mirrors bared on them, pinnacles on the fronts
HCHK.slumps=(R,ZC,reg,need)=>{const S=R&&R.slumps||[],pin=reg.filter(r=>r.key==='landform.pinnacle').length,blocks=S.reduce((a,q)=>a+q.n,0);
 return{ok:S.length>=1&&blocks>=3&&(ZC.scarp||0)>20&&pin>=need,detail:S.length+' slumps, '+blocks+' blocks; '+(ZC.scarp||0)+' mirror-scarp cells; '+pin+' landslip pinnacles (want '+need+')'};};
// THE PORTAL (station 5a): the cave's mouth cut and registered at the valley's head, the floor under 5.9 km (PLAN.md section 2a: no point
// of the walk stands over it), the cairns down the floor
HCHK.portal=(reg,floor,need)=>{const m=reg.filter(r=>r.key==='landform.mouth').length,c=reg.filter(r=>r.key==='landform.cairn').length,hi=Math.max(...floor.map(p=>BASE+p[2]));
 return{ok:m===1&&c>=need&&hi<=5900+15,detail:m+' portal, '+c+' cairns; the valley floor\'s highest point on the page '+hi.toFixed(0)+' m'};};
// a cauldron's cave mouth (station 5): cut, registered, its floor over the water
HCHK.mouths=(reg,M)=>{const m=reg.filter(r=>r.key==='landform.mouth').length;const ok=m===M.length&&M.every(q=>q.floorY>LAKE_LV+5);
 return{ok,detail:m+' mouths registered of '+M.length+(M.length?'; floors '+M.map(q=>q.floorY.toFixed(0)+' m over the tarn').join(', '):'')};};
const _zoneCounts=()=>{const n={};for(let k=0;k<ZR.length;k++){const z=ZONE_IDS[ZR[k]];n[z]=(n[z]||0)+1;}return n;};
const _allTrees=()=>(NWOW.TREES||[]).concat(NEOW.TREES||[]);
// verify.py's export profile (core/export): its box round the station's start (SPINE[0]) where a merged bucket (a trunk, a stem: the baked
// 'biome:' meshes) reaches into it, else round the bucket vertex nearest the start (stations 4 and 5a start on bare meadow and ice: a box there
// held no bucket); a page with no bucket asks for none
const EXPORT_AT=(function(){const s=SPINE[0];let b=null,d=1e18,nb=0;
 scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!/^biome:/.test(o.name||''))return;const P=o.geometry.attributes.position;nb++;
  for(let i=0;i<P.count;i+=8){const x=P.getX(i),z=P.getZ(i),e=(x-s[0])*(x-s[0])+(z-s[1])*(z-s[1]);if(e<d){d=e;b=[x,z];}}});
 const c=!b||Math.max(Math.abs(b[0]-s[0]),Math.abs(b[1]-s[1]))<120?s:b,x=Math.round(c[0]),z=Math.round(c[1]);
 return{box:[x-150,z-150,x+150,z+150],profile:nb?null:['registry','items','materials','textures','terrain','stage','atmos']};})();
window._exportBox=EXPORT_AT.box;
HCHK.zonesOnly=(need,ZC)=>{const lack=need.filter(z=>!(ZC[z]>0));return{ok:!lack.length,detail:need.map(z=>z+' '+(ZC[z]||0)).join(', ')+(lack.length?'; missing '+lack.join(', '):'')};};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),ZC=_zoneCounts();
 if(CAULDRON){
  add('the tarn, the springs and the stair on core/water',HCHK.water(WATER_RECS,WATER_DRAW));
  add('the springs\' heat bands (mats, sinter, scald)',HCHK.heat(NEOW.heatK));
  add('the station\'s landforms on the ground (zones, dikes, springs)',HCHK.zones(ZONES_NEED,ZC,REG));
  add('the springs at the wall\'s foot, the main one hottest',HCHK.springs(SITE_SPRINGS,heatAt));
  add('the sinter stair steps down to the tarn',HCHK.stair(SITE_STAIR,WATER_RECS&&WATER_RECS.stair));
  add('tree ferns on the warm grove',HCHK.ferns(NEOW.TREES,NEOW.FIELDS));}
 if(CAULDRON&&SITE_MOUTHS.length)add('the cave\'s mouth cut over the water',HCHK.mouths(REG,SITE_MOUTHS));
 if(KIND==='scarp'){add('the mirror scarp\'s landforms on the ground',HCHK.zonesOnly(ZONES_NEED,ZC));add('the slumps, their mirrors and pinnacles',HCHK.slumps(SITE_RECS,ZC,REG,SITE.need[0]));}
 if(KIND==='portal'){add('the portal\'s landforms on the ground',HCHK.zonesOnly(ZONES_NEED,ZC));add('the portal cut at the valley\'s head, the floor under 5.9 km',HCHK.portal(REG,SITE_RECS.floor,SITE.need[0]));}
 if(KIND==='badlands'){
  add('the badlands\' landforms on the ground (gullies, walls, ribs, tundra)',HCHK.zonesOnly(ZONES_NEED,ZC));
  add('the gullies\' floors never climb downstream',HCHK.gullies(SITE_RECS&&SITE_RECS.gully));
  add('the dike ribs and the ore outcrops registered',HCHK.ribs(REG,SITE.need||[20,6]));}
 add('no tree in water, on a wall, a dike or a spring',HCHK.roots(_allTrees()));
 add('the shared sky at the station, its far land from the model',HCHK.sky(SKY));
 add('the season\'s larch and snow'+(CAULDRON?', the springs bare':''),HCHK.season());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),ZC=_zoneCounts();
 if(CAULDRON){
  add('the tarn missing',HCHK.water(Object.assign({},WATER_RECS,{lake:null}),WATER_DRAW));
  add('the mats on cold ground',HCHK.heat(t=>Object.assign({},NEOW.heatK(t),{mat:1})));
  add('no dike drawn',HCHK.zones(ZONES_NEED,ZC,REG.filter(r=>r.key!=='landform.dike')));
  add('no spring on the ground',HCHK.zones(ZONES_NEED,Object.assign({},ZC,{spring:0}),REG));
  add('the main spring cold',HCHK.springs(SITE_SPRINGS,()=>NEOW_REGION.site.mean));
  add('the stair climbing',HCHK.stair(Object.assign({},SITE_STAIR,{levels:SITE_STAIR.levels.map((y,k)=>k===2?y+5:y)}),WATER_RECS&&WATER_RECS.stair));
  add('a tree fern on the sinter',HCHK.ferns(NEOW.TREES.concat([{x:SITE_SPRINGS[0].x,z:SITE_SPRINGS[0].z,zone:'grove'}]),NEOW.FIELDS));
  const W0=MODEL_WATER.filter(w=>Math.hypot(w.x,w.z)<6000).reduce((a,w)=>terrainH(w.x,w.z)<terrainH(a.x,a.z)?w:a,MODEL_WATER[0]);   /* the tarn's deepest cell near the page */
  add('a tree in the tarn',HCHK.roots(_allTrees().concat([{x:W0.x,z:W0.z}])));}
 if(CAULDRON&&SITE_MOUTHS.length)add('the mouth not cut',HCHK.mouths(REG.filter(r=>r.key!=='landform.mouth'),SITE_MOUTHS));
 if(KIND==='scarp'){add('no mirror scarp',HCHK.slumps(SITE_RECS,Object.assign({},ZC,{scarp:0}),REG,SITE.need[0]));add('no pinnacle',HCHK.slumps(SITE_RECS,ZC,REG.filter(r=>r.key!=='landform.pinnacle'),SITE.need[0]));}
 if(KIND==='portal'){add('the floor over 5.9 km',HCHK.portal(REG,SITE_RECS.floor.map(p=>[p[0],p[1],p[2]+400]),SITE.need[0]));add('no portal cut',HCHK.portal(REG.filter(r=>r.key!=='landform.mouth'),SITE_RECS.floor,SITE.need[0]));}
 if(KIND==='badlands'){
  add('no gully cut',HCHK.zonesOnly(ZONES_NEED,Object.assign({},ZC,{gully:0})));
  add('a gully climbing',HCHK.gullies(Object.assign({},SITE_RECS.gully,{lines:SITE_RECS.gully.lines.map((L,i)=>i?L:Object.assign({},L,{pts:L.pts.map((p,k)=>k===3?[p[0],p[1],p[2]+40]:p)}))})));
  add('no ore outcrop',HCHK.ribs(REG.filter(r=>r.key!=='landform.ore'),SITE.need||[20,6]));
  const D0=DIKES[0];add('a tree on a dike',HCHK.roots(_allTrees().concat([{x:D0.x,z:D0.z}])));}
 add('the sky at another pixel',HCHK.sky({preset:Object.assign({},SKY.preset,{site:{px:0,py:0}})}));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
const H=KHOST.take({build:'neouterwall',title:'Krator biome — the NE outer wall: '+SITE.title,
 hint:'The Glass-Skarn Bastion ('+NEOW_REGION.site.base.toFixed(0)+' m at the tarn, '+NEOW_REGION.site.atm.toFixed(2)+' atm, '+NEOW_REGION.site.cls+'): '+SITE.title+', '+SEASON+'. The Season select reloads the page',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:SITE.hour==null?10:SITE.hour},draw:()=>SKY.render(),   /* the shared sky's pass, then the world (89s-host-sky.js) */
 controls:[{select:SEASONS.map(s=>[s,'Season: '+s]),id:'seasonsel',on:v=>{const u=new URL(location.href);u.searchParams.set('season',v);location.href=u.toString();}}],
 inspect:describe,stats:()=>'inst '+window._instances+'\nseason '+SEASON+' · day '+SKY_DAY0+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'dikes':{match:o=>!!(o.userData&&o.userData.rock)},
  'water':{match:o=>!!(o.name&&/^water:/.test(o.name))},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export(),landforms:()=>({format:'neouterwall-landforms',version:1,station:SITE.name,season:SEASON,
  site:SITE_RECS,therm:THERM?THERM.export({box:[-SITE.R,-SITE.R,SITE.R,SITE.R],cell:16}):null})},
 minimap:{title:'The NE outer wall: '+SITE.title},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,exportProfile:EXPORT_AT.profile,exportBox:EXPORT_AT.box,
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,season:()=>SEASON,zoneAt:(x,z)=>NEOW.zoneAt(x,z),heatAt:(x,z)=>heatAt(x,z)}});
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
{const s=document.getElementById('seasonsel');if(s)s.value=SEASON;}
