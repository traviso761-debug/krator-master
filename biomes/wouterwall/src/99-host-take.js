// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this page
// has. The views are the station's (SITE.views, 44s); the checks are the kit's and the station's. Forked from biomes/nwouterwall's.
// a view from a point to a point, each [x, z, metres over the ground]
const VW=(c,t)=>[c[0],terrainH(c[0],c[1])+c[2],c[1],t[0],terrainH(t[0],t[1])+t[2],t[1]];
const VIEWS=SITE.views?SITE.views(VW):{'Over the station':VW([0,-900,260],[0,0,0])};

// ---------------------------------------------------------------- the inspector's words: a plant names its species and its harvest
// (the NW outer wall's, read in place); a point its zone, its climate, the loess under it and the spring line
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,'').replace(/^[^|]*\|/,''):null;
 const PLT=item&&(WOW.plantOfItem&&WOW.plantOfItem(item)||NWOW.plantOfItem(item)),SB=best&&(NWOW.SPECIES.find(s=>best.key===s.key)||(WOW.SPECIES||[]).find(s=>best.key==='plant.'+s.key)),F=PLT||SB,hv=F&&F.tags?F.tags.harvest:null;
 const A=inNear(p.x,p.z)?WOW.at(p.x,p.z):null;
 return(F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+
  (A?'\nzone '+WOW.ZONES[A.zone].name+' · mean '+A.clim.mean.toFixed(1)+' °C (warmest '+A.clim.warm.toFixed(0)+', coldest '+A.clim.cold.toFixed(0)+')'+
   ' · loess '+A.F.loess.toFixed(0)+' m'+(A.F.cut>1?' · '+A.F.cut.toFixed(0)+' m under the yuan':'')+(A.F.spring>.3?' · the spring line':''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+' ('+(BASE+p.y).toFixed(0)+' m on the model)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:260},
 cls:{pass:7000000,host:3000000},
 type:{'nwouterwall/trees':'pass','nwouterwall/floor':'pass','nwouterwall/fields':'pass','wouterwall/natives':'pass','wouterwall/lowlands':'pass','wouterwall/crops':'pass','host':'host'},
};
const HCHK={
 // the bench's bands (PLAN.md section 4): the loess deep on the lower bench and gone above the slumps; the slumps over the loess, the
 // runouts over the slumps, the crest last
 bench(B){const a=B(3300),b=B(4300),c=B(4200),d=B(5300),e=B(7600);
  const ok=a.loess>=150&&b.loess<1&&c.slump>.9&&a.slump<.01&&d.runout>.9&&c.runout<.01&&e.crest>.9&&d.crest<.01;
  return{ok,detail:'loess '+a.loess.toFixed(0)+' m at 3.3 km, '+b.loess.toFixed(0)+' at 4.3; slump '+c.slump.toFixed(2)+' at 4.2 km; runout '+d.runout.toFixed(2)+' at 5.3 km; crest '+e.crest.toFixed(2)+' at 7.6 km'};},
 // the station's landforms, each where the zones say: the yuan, the gully's walls and floor, the terraces, the larch and the steppe,
 // drawn on the near ground's zone raster; the pillars registered
 zones(need,ZC,reg){const lack=need.zones.filter(z=>!(ZC[z]>0)),K=need.keys||{},cnt=k=>reg.filter(r=>r.key===k).length,few=Object.keys(K).filter(k=>cnt(k)<K[k]);
  return{ok:!lack.length&&!few.length,detail:need.zones.map(z=>z+' '+(ZC[z]||0)).join(', ')+'; '+Object.keys(K).map(k=>cnt(k)+' '+k+' (want '+K[k]+')').join(', ')+(lack.length?'; missing '+lack.join(', '):'')};},
 // the spring line (WOW.springAt): the brook rises where the gully's cut reaches the foot of the loess, and nowhere is there water above it
 spring(S,F){if(!S)return{ok:false,detail:'no brook'};const p=S.pts[0],A=F(p[0],p[1]);const ok=A.spring>.5&&A.cut>SITE.loess-40;
  return{ok,detail:'the spring at '+p[0].toFixed(0)+', '+p[1].toFixed(0)+': '+A.cut.toFixed(0)+' m under the yuan, the loess '+A.loess.toFixed(0)+' m deep; spring line '+A.spring.toFixed(2)};},
 // the larch on the shaded slopes, the steppe on the sunny ones (PLAN.md section 3)
 aspect(TREES,F){const L=TREES.filter(T=>T.sp===0),sh=L.filter(T=>F(T.x,T.z).sunny<-.1).length,su=L.filter(T=>F(T.x,T.z).sunny>.1).length,n=SITE.need.larch==null?150:SITE.need.larch;
  return{ok:L.length>n&&sh>su*3,detail:L.length+' fur larches: '+sh+' on shaded (south-facing) slopes, '+su+' on sunny ones'};},
 // nothing roots in water, on a wall, in a terrace field or inside a pillar
 roots(TREES){let wet=0,wall=0,field=0,rock=0;TREES.forEach(T=>{const F=WOW.FIELDS(T.x,T.z),z=WOW.zoneOf(F);if(F.water)wet++;if(z==='wall'||z==='scarp')wall++;if(F.field)field++;if(pillarAt(T.x,T.z)>.5)rock++;});
  const n=SITE.need.trees==null?100:SITE.need.trees;
  return{ok:wet+wall+field+rock===0&&TREES.length>n,detail:TREES.length+' trees; '+wet+' in water, '+wall+' on a wall or a scarp, '+field+' in a terrace field, '+rock+' in a stack'};},
 // the sky: the shared sky at the station's pixel, its far land cast from the model (three layers of 1024)
 sky(S){const R=S.preset.ridges||[],ok=R.length===3&&R.every(r=>r.profile&&r.profile.length===1024)&&S.preset.site.px===WOW_REGION.site.px;
  return{ok,detail:'site px '+S.preset.site.px+','+S.preset.site.py+'; ridges '+R.map(r=>(r.dist/1000).toFixed(0)+' km').join(', ')};},
 // the season: the larch's needles and the snow
 season(){const lab=BIO.kits.nwouterwall.defs.larchspray.label,want=SEASON==='winter'?/bare/:SEASON==='autumn'?/gold/:/green/;const ok=want.test(lab)&&!!ATMOS.snow;
  return{ok,detail:SEASON+': '+lab+'; snow base '+(ATMOS.U.snowBase?ATMOS.U.snowBase.value:'?')};}};
// the water: core/water's records (the brook a flow line never climbing downstream) and drawn
HCHK.water=(W,D)=>{if(!W)return{ok:false,detail:'no core/water records'};const c=W.stream;if(!c)return{ok:!SITE_STREAM,detail:'no brook at this station'};let climb=0;
 for(let i=1;i<c.pts.length;i++)if(c.pts[i].y>c.pts[i-1].y+1e-6)climb++;
 const ok=c.kind==='flow'&&climb===0&&!!D&&!!D.stream;
 return{ok,detail:'the brook: '+c.pts.length+' points, '+climb+' climbing; drawn: '+(D?Object.keys(D).join(', '):'none')};};
const ZONES_NEED=SITE.need;
const _zoneCounts=()=>{const n={};for(let k=0;k<ZR.length;k++){const z=ZONE_IDS[ZR[k]];n[z]=(n[z]||0)+1;}return n;};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),ZC=_zoneCounts();
 add('the brook on core/water, never climbing',HCHK.water(WATER_RECS,WATER_DRAW));
 add('the bench\'s bands (loess, slumps, runouts, crest)',HCHK.bench(WOW.bench));
 add('the station\'s landforms on the ground (zones, pillars)',HCHK.zones(ZONES_NEED,ZC,REG));
 if(SITE.need.spring!==false&&(SITE_SPRING||SITE.need.spring))add('the brook rises at the spring line',HCHK.spring(STREAM,WOW.FIELDS));
 if(SITE.checks)SITE.checks().forEach(c=>add(c.name,c.run()));
 if(SITE.need.larch!==0)add('larch on the shaded slopes, steppe on the sunny',HCHK.aspect(NWOW.TREES,WOW.FIELDS));
 add('no tree in water, on a wall, in a field or a pillar',HCHK.roots(NWOW.TREES));
 add('the shared sky at the station, its far land from the model',HCHK.sky(SKY));
 add('the season\'s larch and snow',HCHK.season());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),ZC=_zoneCounts();
 add('the brook climbing',WATER_RECS&&WATER_RECS.stream?HCHK.water(Object.assign({},WATER_RECS,{stream:Object.assign({},WATER_RECS.stream,{pts:WATER_RECS.stream.pts.map((p,i)=>i===5?Object.assign({},p,{y:p.y+60}):p)})}),WATER_DRAW):{ok:false,detail:'no brook'});
 add('the loess lying on the crest',HCHK.bench(h=>Object.assign({},WOW.bench(h),{loess:WOW.LOESS.deep})));
 {const z0=ZONES_NEED.zones[1],k0=Object.keys(ZONES_NEED.keys||{})[0];add('no '+z0+' drawn',HCHK.zones(ZONES_NEED,Object.assign({},ZC,{[z0]:0}),REG));
  if(k0)add('no '+k0+' made',HCHK.zones(ZONES_NEED,ZC,REG.filter(r=>r.key!==k0)));}
 if(SITE.need.spring!==false&&(SITE_SPRING||SITE.need.spring))add('the spring above the loess\'s foot',HCHK.spring(STREAM,(x,z)=>Object.assign({},WOW.FIELDS(x,z),{cut:10,spring:0})));
 if(SITE.negatives)SITE.negatives().forEach(c=>add(c.name,c.run()));
 if(SITE.need.larch!==0)add('the larch on the sunny slopes',HCHK.aspect(NWOW.TREES,(x,z)=>{const F=WOW.FIELDS(x,z);return {sunny:-F.sunny};}));
 {const W0=STREAM?STREAM.pts[Math.min(20,STREAM.pts.length-1)]:MODEL_LAKE&&SITE.lake.probe?SITE.lake.probe:POOLS.length?[POOLS[0].x,POOLS[0].z]:null;add('a tree in the water',HCHK.roots(NWOW.TREES.concat(W0?[{x:W0[0],z:W0[1]}]:[])));}
 add('the sky at another pixel',HCHK.sky({preset:Object.assign({},SKY.preset,{site:{px:0,py:0}})}));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
document.title='Krator biome — the W outer wall: '+SITE.title;   /* the station's own (00-head's is the kit's) */
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
const H=KHOST.take({build:'wouterwall',title:'Krator biome — the W outer wall: '+SITE.title,
 hint:'The W outer wall ('+WOW_REGION.site.base.toFixed(0)+' m, '+WOW_REGION.site.atm.toFixed(2)+' atm, '+WOW_REGION.site.cls+'): '+SITE.title+', '+SEASON+'. The Season select reloads the page',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:10},draw:()=>SKY.render(),   /* the shared sky's pass, then the world (89s-host-sky.js) */
 controls:[{select:SEASONS.map(s=>[s,'Season: '+s]),id:'seasonsel',on:v=>{const u=new URL(location.href);u.searchParams.set('season',v);location.href=u.toString();}}],
 inspect:describe,stats:()=>'inst '+window._instances+'\nseason '+SEASON+' · day '+SKY_DAY0+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'pillars':{match:o=>!!(o.userData&&o.userData.rock)},
  'water':{match:o=>!!(o.name&&/^water:/.test(o.name))},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export(),landforms:()=>({format:'wouterwall-landforms',version:1,station:SITE.name,season:SEASON,
  relief:SITE_RECS,stacks:PILLARS.map(B=>({id:B.id,kind:B.kind,key:B.key,x:B.x,z:B.z,y0:B.y0,top:B.top})),
  spring:STREAM?STREAM.pts[0]:null,loess:SITE.loess})},
 minimap:{title:'The W outer wall: '+SITE.title},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,season:()=>SEASON,zoneAt:(x,z)=>WOW.zoneAt(x,z)}});
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
{const s=document.getElementById('seasonsel');if(s)s.value=SEASON;}
