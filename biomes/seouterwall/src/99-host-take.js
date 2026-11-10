// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this page
// has. The views are the station's (SITE.views, 44s); the checks are the kit's and the station's. Forked from biomes/wouterwall's.
// a view from a point to a point, each [x, z, metres over the ground]
const VW=(c,t)=>[c[0],terrainH(c[0],c[1])+c[2],c[1],t[0],terrainH(t[0],t[1])+t[2],t[1]];
const VIEWS=SITE.views?SITE.views(VW):{'Over the station':VW([0,-900,260],[0,0,0])};

// ---------------------------------------------------------------- the inspector's words: a plant names its species and its harvest
// (the NW outer wall's, read in place); a point its zone, its climate, the cordillera's tier, the wind and the hazards holding it
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,'').replace(/^[^|]*\|/,''):null;
 const PLT=item&&NWOW.plantOfItem(item),SB=best&&NWOW.SPECIES.find(s=>best.key===s.key),F=PLT||SB,hv=F&&F.tags?F.tags.harvest:null;
 const A=inNear(p.x,p.z)?SEOW.at(p.x,p.z):null,hz=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';
 return(F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+
  (A?'\nzone '+SEOW.ZONES[A.zone].name+' · mean '+A.clim.mean.toFixed(1)+' °C (warmest '+A.clim.warm.toFixed(0)+', coldest '+A.clim.cold.toFixed(0)+')'+
   ' · the God-Bore '+(A.F.wind<SEOW.EXPOSED?'in a lee':'in the open')+' ('+A.F.wind.toFixed(2)+')'+(A.F.moraine>2?' · '+A.F.moraine.toFixed(0)+' m of moraine':''):'')+
  (hz?'\n'+hz:'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+' ('+(BASE+p.y).toFixed(0)+' m on the model, '+SEOW.tierOf(BASE+p.y)+', '+SEOW.atm(BASE+p.y).toFixed(2)+' atm)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:260},
 cls:{pass:7000000,host:3000000},
 type:{'nwouterwall/trees':'pass','nwouterwall/floor':'pass','nwouterwall/fields':'pass','host':'host'},
};
const HCHK={
 // the station on the scale model (PLAN.md section 7.2): the pixel, its height (the model's pin, +-150 m of the plan's 3,620), its air;
 // the drawn ground at the origin on the model's height
 model(S,h0){const ok=S.px===1031&&S.py===1252&&Math.abs(S.base-3620)<=150&&Math.abs(S.atm-SEOW.atm(S.base))<.01&&Math.abs(h0)<6;
  return{ok,detail:'px '+S.px+','+S.py+': '+S.base.toFixed(0)+' m, '+S.atm.toFixed(2)+' atm, '+S.cls+', mean '+S.mean.toFixed(1)+' °C; the drawn ground at the origin '+h0.toFixed(1)+' m'};},
 // the cordillera's tiers (PLAN.md section 1.3 and 7.2) and the air by the model's rule
 tiers(T){const want=[[3620,'pass'],[4000,'subalpine'],[5000,'bench'],[6000,'nival'],[7500,'hypobaric'],[9500,'airless']],bad=want.filter(w=>T(w[0])!==w[1]);
  return{ok:!bad.length,detail:want.map(w=>w[0]+' m '+T(w[0])).join(', ')+(bad.length?'; wrong: '+bad.map(w=>w[0]).join(', '):'')};},
 // the station's landforms, each where the zones say, on the near ground's zone raster; the moraines and the heaps registered
 zones(need,ZC,reg){const lack=need.filter(z=>!(ZC[z]>0)),mor=reg.filter(r=>r.key==='landform.moraine').length,hp=reg.filter(r=>r.key==='landform.rockfall').length;
  return{ok:!lack.length&&mor>=4&&hp>=3,detail:need.map(z=>z+' '+(ZC[z]||0)).join(', ')+'; '+mor+' moraines, '+hp+' rockfall heaps'+(lack.length?'; missing '+lack.join(', '):'')};},
 // the meltwater: the brook runs down the gully and ends on its fan, where it sinks into the gravel (282 mm: no tarn on the col)
 sinks(S,fan){if(!S||!fan)return{ok:false,detail:'no brook or no fan'};const e=S.pts[S.pts.length-1],d=Math.hypot(e[0]-fan.x,e[1]-fan.z),drop=S.level[0]-S.level[S.level.length-1];
  return{ok:d<fan.r*.5&&drop>20,detail:'the brook falls '+drop.toFixed(0)+' m and ends '+d.toFixed(0)+' m from the fan\'s apex (its radius '+fan.r.toFixed(0)+' m)'};},
 // the God-Bore decides the trees' form: the larch stands only in a lee, the open shaded slopes are the creeping pine's (PLAN.md 2.1)
 lee(TREES,F){const L=TREES.filter(T=>T.sp===0),open=L.filter(T=>F(T.x,T.z).wind>=SEOW.EXPOSED+.08).length,K=TREES.filter(T=>T.sp===2).length;
  return{ok:L.length>0&&open<=Math.max(2,L.length*.08)&&K>L.length,detail:L.length+' larches, '+open+' of them in the open; '+K+' creeping pines (krummholz)'};},
 // nothing roots in water, on a crag's face or on a rockfall heap (trees off cliff faces)
 roots(TREES){let wet=0,crag=0,heap=0;TREES.forEach(T=>{const F=SEOW.FIELDS(T.x,T.z);if(F.water)wet++;if(F.g>.9)crag++;if(heapAt(T.x,T.z)>.5)heap++;});
  return{ok:wet+crag+heap===0&&TREES.length>100,detail:TREES.length+' trees; '+wet+' in water, '+crag+' on a crag\'s face, '+heap+' on a heap'};},
 // the rock: the cordillera's megabreccia east of the Godsgate's corridor, the Godthrone's tibasalt west of it (KSTRATA's lateral stack)
 rock(S){if(!S)return{ok:false,detail:'no KSTRATA column'};const e=S.at(3000,1500,0),w=S.at(-11000,1500,0);
  return{ok:e.recipe==='megabreccia'&&w.recipe==='tibasalt'&&e.side===0&&w.side===1,detail:'east (3 km): '+e.recipe+' ('+e.kind+'), west (11 km): '+w.recipe+' ('+w.kind+')'};},
 // the hazards: the God-Bore on the night's cycle (on at 02:00, off at 14:00), the rockfall under the crags
 hazards(H){if(typeof KHAZ==='undefined')return{ok:false,detail:'no core/hazard'};const gb=H.find(r=>r&&r.tags&&r.tags.hazard.kind==='cold'),rf=H.filter(r=>r&&r.tags&&r.tags.hazard.kind==='crush').length;
  if(!gb)return{ok:false,detail:'no God-Bore record'};const n=KHAZ.state(gb,2*3600),d=KHAZ.state(gb,14*3600);
  return{ok:n.k>.99&&d.k<.01&&rf>=3,detail:'the God-Bore at 02:00 '+n.state+' k '+n.k.toFixed(2)+', at 14:00 '+d.state+' k '+d.k.toFixed(2)+'; '+rf+' rockfall chutes'};},
 // the sky: the shared sky at the station's pixel, its far land cast from the model (three layers of 1024)
 sky(S){const R=S.preset.ridges||[],ok=R.length===3&&R.every(r=>r.profile&&r.profile.length===1024)&&S.preset.site.px===SEOW_REGION.site.px;
  return{ok,detail:'site px '+S.preset.site.px+','+S.preset.site.py+'; ridges '+R.map(r=>(r.dist/1000).toFixed(0)+' km').join(', ')};},
 // the season: the larch's needles and the snow
 season(){const lab=BIO.kits.nwouterwall.defs.larchspray.label,want=SEASON==='winter'?/bare/:SEASON==='autumn'?/gold/:/green/;const ok=want.test(lab)&&!!ATMOS.snow;
  return{ok,detail:SEASON+': '+lab+'; snow base '+(ATMOS.U.snowBase?ATMOS.U.snowBase.value:'?')};}};
// the water: core/water's records (the brook a flow line never climbing downstream) and drawn
HCHK.water=(W,D)=>{if(!W)return{ok:false,detail:'no core/water records'};const c=W.stream;if(!c)return{ok:!SITE_STREAM,detail:'no brook at this station'};let climb=0;
 for(let i=1;i<c.pts.length;i++)if(c.pts[i].y>c.pts[i-1].y+1e-6)climb++;
 const ok=c.kind==='flow'&&climb===0&&!!D&&!!D.stream;
 return{ok,detail:'the brook: '+c.pts.length+' points, '+climb+' climbing; drawn: '+(D?Object.keys(D).join(', '):'none')};};
const ZONES_NEED=['col','moraine','floor','fan','crag','scree','krummholz','puna'];
const _zoneCounts=()=>{const n={};for(let k=0;k<ZR.length;k++){const z=ZONE_IDS[ZR[k]];n[z]=(n[z]||0)+1;}return n;};
const TREES_ALL=()=>NWOW.TREES||[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),ZC=_zoneCounts();
 add('the station on the scale model',HCHK.model(SEOW_REGION.site,terrainH(0,0)));
 add('the cordillera\'s tiers and its air',HCHK.tiers(SEOW.tierOf));
 add('the brook on core/water, never climbing',HCHK.water(WATER_RECS,WATER_DRAW));
 add('the station\'s landforms on the ground (zones, moraines, heaps)',HCHK.zones(ZONES_NEED,ZC,REG));
 add('the meltwater sinks into its fan',HCHK.sinks(STREAM,SITE_RECS.melt.fan));
 add('the larch in a lee, the krummholz in the open',HCHK.lee(TREES_ALL(),SEOW.FIELDS));
 add('no tree in water, on a crag or a heap',HCHK.roots(TREES_ALL()));
 add('megabreccia east, tibasalt west (KSTRATA)',HCHK.rock(ROCK_SH));
 add('the God-Bore and the rockfall (core/hazard)',HCHK.hazards(HAZARDS));
 add('the shared sky at the station, its far land from the model',HCHK.sky(SKY));
 add('the season\'s larch and snow',HCHK.season());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),ZC=_zoneCounts();
 add('the station at another pixel',HCHK.model(Object.assign({},SEOW_REGION.site,{px:1016}),terrainH(0,0)));
 add('the station floating over the model',HCHK.model(SEOW_REGION.site,terrainH(0,0)+40));
 add('the col in the nival tier',HCHK.tiers(h=>h<5400?'nival':SEOW.tierOf(h)));
 add('the brook climbing',WATER_RECS&&WATER_RECS.stream?HCHK.water(Object.assign({},WATER_RECS,{stream:Object.assign({},WATER_RECS.stream,{pts:WATER_RECS.stream.pts.map((p,i)=>i===5?Object.assign({},p,{y:p.y+60}):p)})}),WATER_DRAW):{ok:false,detail:'no brook'});
 add('no moraine drawn',HCHK.zones(ZONES_NEED,Object.assign({},ZC,{moraine:0}),REG));
 add('no rockfall heap',HCHK.zones(ZONES_NEED,ZC,REG.filter(r=>r.key!=='landform.rockfall')));
 add('the brook running past its fan',HCHK.sinks(STREAM,Object.assign({},SITE_RECS.melt.fan,{x:SITE_RECS.melt.fan.x+2000})));
 add('the larch in the open',HCHK.lee(TREES_ALL(),(x,z)=>Object.assign({},SEOW.FIELDS(x,z),{wind:1})));
 add('a tree on a rockfall heap',HCHK.roots(TREES_ALL().concat(SITE_HEAPS&&SITE_HEAPS[0]?[{x:SITE_HEAPS[0].x,z:SITE_HEAPS[0].z}]:[{x:1e6,z:1e6}])));
 add('tibasalt on both walls',HCHK.rock(ROCK_SH?{at:(x,y,z)=>ROCK_SH.at(-11000,y,z)}:null));
 add('the God-Bore blowing by day',HCHK.hazards(HAZARDS.map(r=>r&&r.tags&&r.tags.hazard.kind==='cold'?Object.assign({},r,{id:r.id+'-neg',tags:{hazard:Object.assign({},r.tags.hazard,{cycle:null})}}):r)));
 add('the sky at another pixel',HCHK.sky({preset:Object.assign({},SKY.preset,{site:{px:0,py:0}})}));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
const H=KHOST.take({build:'seouterwall',title:'Krator biome — the SE outer wall: '+SITE.title,
 hint:'The Godsgate ('+SEOW_REGION.site.base.toFixed(0)+' m, '+SEOW_REGION.site.atm.toFixed(2)+' atm, '+SEOW_REGION.site.cls+'): '+SITE.title+', '+SEASON+'. The Season select reloads the page',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:10},draw:()=>SKY.render(),   /* the shared sky's pass, then the world (89s-host-sky.js) */
 controls:[{select:SEASONS.map(s=>[s,'Season: '+s]),id:'seasonsel',on:v=>{const u=new URL(location.href);u.searchParams.set('season',v);location.href=u.toString();}}],
 inspect:describe,stats:()=>'inst '+window._instances+'\nseason '+SEASON+' · day '+SKY_DAY0+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'heaps':{match:o=>!!(o.userData&&o.userData.rock)},
  'water':{match:o=>!!(o.name&&/^water:/.test(o.name))},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export(),landforms:()=>({format:'seouterwall-landforms',version:1,station:SITE.name,season:SEASON,
  moraines:SITE.moraines,melt:SITE_RECS.melt,heaps:HEAPS.map(H=>({id:H.id,x:H.x,z:H.z,y0:H.y0,rx:H.rx,rz:H.rz,ry:H.ry,h:H.h,seed:H.seed})),
  crag:SITE.crag,rock:ROCK_SH?ROCK_SH.strata.export?ROCK_SH.strata.export():null:null})},
 minimap:{title:'The SE outer wall: '+SITE.title},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,season:()=>SEASON,zoneAt:(x,z)=>SEOW.zoneAt(x,z)}});
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
{const s=document.getElementById('seasonsel');if(s)s.value=SEASON;}
