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
  return{ok:!lack.length&&dk>=12&&sp>=Math.min(3,SITE.springs.length)&&sp===SITE.springs.length,detail:need.map(z=>z+' '+(ZC[z]||0)).join(', ')+'; '+dk+' dike fins, '+sp+' springs'+(lack.length?'; missing '+lack.join(', '):'')};},
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
  return{ok:wet+wall+dike+hot===0&&TREES.length>100,detail:TREES.length+' trees; '+wet+' in water, '+wall+' on a wall, '+dike+' on a dike, '+hot+' in a spring or the stair'};},
 // the sky: the shared sky at the station's pixel, its far land cast from the model (three layers of 1024)
 sky(S){const R=S.preset.ridges||[],ok=R.length===3&&R.every(r=>r.profile&&r.profile.length===1024)&&S.preset.site.px===NEOW_REGION.site.px;
  return{ok,detail:'site px '+S.preset.site.px+','+S.preset.site.py+'; ridges '+R.map(r=>(r.dist/1000).toFixed(0)+' km').join(', ')};},
 // the season: the NW outer wall's larch (read in place) and the snow; the springs' ground bare of it
 season(){const lab=BIO.kits.nwouterwall.defs.larchspray.label,want=SEASON==='winter'?/bare/:SEASON==='autumn'?/gold/:/green/;const ok=want.test(lab)&&!!ATMOS.snow&&!!SNOW_BARE;
  return{ok,detail:SEASON+': '+lab+'; snow base '+(ATMOS.U.snowBase?ATMOS.U.snowBase.value:'?')+'; the springs\' ground bare: '+(SNOW_BARE?SNOW_BARE.n+' cells':'no mask')};}};
// the water: core/water's records (the tarn an open surface at the model's level, the springs, the stair) and drawn
HCHK.water=(W,D)=>{if(!W)return{ok:false,detail:'no core/water records'};const L=W.lake,ok=!!L&&L.kind==='open'&&Math.abs(LAKE_LV)<1&&W.springs.length===SITE_SPRINGS.length&&!!D&&!!D.lake&&D.springs.length===W.springs.length&&!!D.stair;
 return{ok,detail:'the tarn '+(L?L.kind+' at '+LAKE_LV.toFixed(2)+' m':'missing')+'; '+W.springs.length+' springs; drawn: '+(D?Object.keys(D).join(', '):'none')};};
const ZONES_NEED=['water','grove','wall','dike','spring','stair','mat','shore'];
const _zoneCounts=()=>{const n={};for(let k=0;k<ZR.length;k++){const z=ZONE_IDS[ZR[k]];n[z]=(n[z]||0)+1;}return n;};
const _allTrees=()=>(NWOW.TREES||[]).concat(NEOW.TREES||[]);
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),ZC=_zoneCounts();
 add('the tarn, the springs and the stair on core/water',HCHK.water(WATER_RECS,WATER_DRAW));
 add('the springs\' heat bands (mats, sinter, scald)',HCHK.heat(NEOW.heatK));
 add('the station\'s landforms on the ground (zones, dikes, springs)',HCHK.zones(ZONES_NEED,ZC,REG));
 add('the springs at the wall\'s foot, the main one hottest',HCHK.springs(SITE_SPRINGS,heatAt));
 add('the sinter stair steps down to the tarn',HCHK.stair(SITE_STAIR,WATER_RECS&&WATER_RECS.stair));
 add('tree ferns on the warm grove',HCHK.ferns(NEOW.TREES,NEOW.FIELDS));
 add('no tree in water, on a wall, a dike or a spring',HCHK.roots(_allTrees()));
 add('the shared sky at the station, its far land from the model',HCHK.sky(SKY));
 add('the season\'s larch and snow, the springs bare',HCHK.season());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),ZC=_zoneCounts();
 add('the tarn missing',HCHK.water(Object.assign({},WATER_RECS,{lake:null}),WATER_DRAW));
 add('the mats on cold ground',HCHK.heat(t=>Object.assign({},NEOW.heatK(t),{mat:1})));
 add('no dike drawn',HCHK.zones(ZONES_NEED,ZC,REG.filter(r=>r.key!=='landform.dike')));
 add('no spring on the ground',HCHK.zones(ZONES_NEED,Object.assign({},ZC,{spring:0}),REG));
 add('the main spring cold',HCHK.springs(SITE_SPRINGS,()=>NEOW_REGION.site.mean));
 add('the stair climbing',HCHK.stair(Object.assign({},SITE_STAIR,{levels:SITE_STAIR.levels.map((y,k)=>k===2?y+5:y)}),WATER_RECS&&WATER_RECS.stair));
 add('a tree fern on the sinter',HCHK.ferns(NEOW.TREES.concat([{x:SITE_SPRINGS[0].x,z:SITE_SPRINGS[0].z,zone:'grove'}]),NEOW.FIELDS));
 add('a tree in the tarn',HCHK.roots(_allTrees().concat([{x:-1200,z:-1500}])));
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
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,season:()=>SEASON,zoneAt:(x,z)=>NEOW.zoneAt(x,z),heatAt:(x,z)=>heatAt(x,z)}});
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
{const s=document.getElementById('seasonsel');if(s)s.value=SEASON;}
