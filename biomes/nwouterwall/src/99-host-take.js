// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this
// page has. The views are the station's (SITE.views, 44s), written from its layout; the checks are the kit's and the station's.
// a view from a point to a point, each [x, z, metres over the ground]
const VW=(c,t)=>[c[0],terrainH(c[0],c[1])+c[2],c[1],t[0],terrainH(t[0],t[1])+t[2],t[1]];
const VIEWS=SITE.views?SITE.views(VW):{'Over the station':VW([0,-900,260],[0,0,0])};

// ---------------------------------------------------------------- the inspector's words: a plant names its species, its harvest
// and its crop (kits/crops); a point its zone, its climate and pycrete's rule there
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&NWOW.plantOfItem(item),SB=best&&NWOW.SPECIES.find(s=>best.key===s.key),F=PLT||SB,hv=F&&F.tags?F.tags.harvest:null;
 const A=inNear(p.x,p.z)?NWOW.at(p.x,p.z):null,cr=hv&&hv.crop&&typeof CROPS!=='undefined'?CROPS.BY_ID[hv.crop]:null;
 return(F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (cr?'\ncrop: '+cr.name+' ('+cr.bucket+'; kits/crops '+cr.id+')'+(cr.note?' — '+cr.note:''):'')+
  (A?'\nzone '+NWOW.ZONES[A.zone].name+' · mean '+A.clim.mean.toFixed(1)+' °C (warmest '+A.clim.warm.toFixed(0)+', coldest '+A.clim.cold.toFixed(0)+') · permafrost '+(A.clim.perma*100).toFixed(0)+'% · pycrete '+A.clim.pyc:'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+' ('+(BASE+p.y).toFixed(0)+' m on the model)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:260},
 cls:{pass:7000000,host:3000000},
 type:{'nwouterwall/trees':'pass','nwouterwall/floor':'pass','nwouterwall/fields':'pass','host':'host'},
};
// edible plants the catalog has no piece for (named, not hidden: biomes/FRUIT.md)
const FRUIT_NOT_DRAWN=['furlarch','silverthorn','ivanchai','cloudberry','crowberry','sweetroot','snowpotato','goldroot','cache','woolwillow'];
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'').replace(/^[^|]*\|/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 // fruit: every species and plant carries a harvest tag; every edible one names a catalog piece (or is listed as not catalogued);
 // every catalog fruit the kit names is drawn by its item
 fruit(SP,PL,N){const all=SP.map(S=>[S.key,S.tags]).concat(Object.keys(PL).map(k=>[k,PL[k].tags]));
  const untagged=all.filter(e=>!e[1].harvest).map(e=>e[0]);
  const miss=all.filter(e=>e[1].harvest&&e[1].harvest.edible.length&&!e[1].harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(e[0])<0).map(e=>e[0]);
  const keys=[...new Set(all.map(e=>e[1].harvest&&e[1].harvest.fruit).filter(Boolean))],undrawn=keys.filter(k=>!(N[NWOW.FRUIT_ITEMS[k]]>0));
  return{ok:!untagged.length&&!miss.length&&!undrawn.length&&keys.length>=1,detail:(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+
   (undrawn.length?'catalogued but not drawn: '+undrawn.join(', ')+'; ':'')+all.length+' tagged; drawn: stone pine cones '+(N.cone||0)+', cloudberries '+(N.berry||0)};},
 // the crops: every crop a plant names is a kits/crops record, and the station's Three Gifts are drawn (the dug rows count in autumn)
 crops(PL,N,st,want){const ids=Object.keys(PL).map(k=>PL[k].tags.harvest.crop||PL[k].tags.crop).filter(Boolean),bad=ids.filter(id=>!CROPS.BY_ID[id]);
  want=want||SITE.gifts||[];const got={sweetroot:(N.sweetroot||0)+(st?st.heaps:0),snowpotato:N.snowpotato||0,goldroot:N.goldroot||0},short=want.filter(k=>!(got[k]>0));
  return{ok:!bad.length&&!short.length&&ids.length>=8,detail:ids.length+' plants name a crop'+(bad.length?' (not in kits/crops: '+bad.join(', ')+')':'')+'; drawn: '+want.map(k=>k+' '+got[k]).join(', ')+(short.length?'; missing: '+short.join(', '):'')};},
 // pycrete's rule (PLAN.md section 5): permanent at or below -2 °C, seasonal where the coldest month is at or below -8 °C, none above
 pyc(clim){const A=NWOW.AMP,mS=-9+A.cold,mN=-7+A.cold,a=clim(-2.5).pyc,b=clim(mS).pyc,c=clim(mN).pyc,ok=a==='permanent'&&b==='seasonal'&&c==='none';
  return{ok,detail:'mean -2.5 °C '+a+', '+mS.toFixed(1)+' °C (coldest month -9) '+b+', '+mN.toFixed(1)+' °C (coldest -7) '+c+'; here (the station\'s middle) '+NWOW.pyc(0,0)};},
 // the larch on the shaded slopes, the steppe on the sunny ones (the forest-steppe's split, PLAN.md section 1)
 aspect(TREES,F){const L=TREES.filter(T=>T.sp===0),sh=L.filter(T=>F(T.x,T.z).sunny<-.1).length,su=L.filter(T=>F(T.x,T.z).sunny>.1).length;
  const ok=SITE.aspectCheck===false?L.length>50:(L.length>200&&sh>su*3);return{ok,detail:L.length+' fur larches: '+sh+' on shaded (south-facing) slopes, '+su+' on sunny ones'};},
 // nothing roots in water, on the aufeis, in a field or a pocket, or inside a tor
 roots(TREES){let wet=0,ice=0,field=0,rock=0;TREES.forEach(T=>{const F=NWOW.FIELDS(T.x,T.z);if(F.water)wet++;if(F.aufeis)ice++;if(F.field||F.pocket)field++;if(NWOW.torAt&&NWOW.torAt(T.x,T.z)>.5)rock++;});
  return{ok:wet+ice+field+rock===0&&TREES.length>100,detail:TREES.length+' trees; '+wet+' in water, '+ice+' on the aufeis, '+field+' in a field or pocket, '+rock+' in a tor'};},
 // the landforms: core/terrain's KFROST records, each registered where it is drawn (the aufeis)
 frost(F,reg,need){const rec=F.records(),kinds=[...new Set(rec.map(r=>r.kind))],au=NWOW.AUFEIS_DRAWN||[],regd=au.filter(r=>reg.some(q=>q.key==='landform.aufeis'&&Math.abs(q.x-r.x)<1&&Math.abs(q.z-r.z)<1)).length;
  need=need||SITE.landforms||[];const lack=need.filter(k=>!kinds.includes(k));
  return{ok:!lack.length&&regd===au.length,detail:rec.length+' landforms ('+kinds.join(', ')+')'+(lack.length?'; missing '+lack.join(', '):'')+'; '+regd+' of '+au.length+' drawn aufeis patches registered'};},
 // the sky: the shared sky at the station's pixel, its far land cast from the model (three layers of 1024)
 sky(S){const R=S.preset.ridges||[],ok=R.length===3&&R.every(r=>r.profile&&r.profile.length===1024)&&S.preset.site.px===NW_REGION.site.px;
  return{ok,detail:'site px '+S.preset.site.px+','+S.preset.site.py+'; ridges '+R.map(r=>(r.dist/1000).toFixed(0)+' km').join(', ')};},
 // the season: the larch's needles and the snow line are the season's
 season(){const lab=BIO.kits.nwouterwall.defs.larchspray.label,want=SEASON==='winter'?/bare/:SEASON==='autumn'?/gold/:/green/;const ok=want.test(lab)&&!!ATMOS.snow;
  return{ok,detail:SEASON+': '+lab+'; snow base '+(ATMOS.U.snowBase?ATMOS.U.snowBase.value:'?')};}};
// the water: core/water's records (the stream a flow line never climbing downstream) and drawn
HCHK.water=(W,D)=>{if(!W)return{ok:false,detail:'no core/water records'};const c=W.stream;if(!c)return{ok:!SITE_STREAM,detail:'no stream at this station'};let climb=0;
 for(let i=1;i<c.pts.length;i++)if(c.pts[i].y>c.pts[i-1].y+1e-6)climb++;
 const ok=c.kind==='flow'&&climb===0&&!!D&&!!D.stream;
 return{ok,detail:'the stream: '+c.pts.length+' points, '+climb+' climbing; drawn: '+(D?Object.keys(D).join(', '):'none')};};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_itemCounts(),st=window._biome&&window._biome.floor;
 add('the stream on core/water, never climbing',HCHK.water(WATER_RECS,WATER_DRAW));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(NWOW.SPECIES,NWOW.PLANTS,N));
 add('the crops are kits/crops records; the Three Gifts drawn',HCHK.crops(NWOW.PLANTS,N,st));
 add('pycrete\'s climate rule',HCHK.pyc(NWOW.climate));
 add('larch on the shaded slopes, steppe on the sunny',HCHK.aspect(NWOW.TREES,NWOW.FIELDS));
 add('no tree in water, on the aufeis, in a field or a tor',HCHK.roots(NWOW.TREES));
 add('the landforms (core/terrain KFROST)',HCHK.frost(NWOW.frost,REG));
 add('the shared sky at the station, its far land from the model',HCHK.sky(SKY));
 add('the season\'s larch and snow',HCHK.season());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts(),PL=NWOW.PLANTS,st=window._biome&&window._biome.floor;
 add('the stream climbing',WATER_RECS&&WATER_RECS.stream?HCHK.water(Object.assign({},WATER_RECS,{stream:Object.assign({},WATER_RECS.stream,{pts:WATER_RECS.stream.pts.map((p,i)=>i===5?Object.assign({},p,{y:p.y+60}):p)})}),WATER_DRAW):{ok:false,detail:'no stream'});
 add('an edible plant with no catalog fruit and not listed',HCHK.fruit(NWOW.SPECIES.map(S=>S.key==='pinemat'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),PL,N));
 add('no cones drawn',HCHK.fruit(NWOW.SPECIES,PL,Object.assign({},N,{cone:0})));
 add('a crop the kit does not have',HCHK.crops(Object.assign({},PL,{x:{tags:{harvest:{crop:'nonesuch'}}}}),N,st));
 add('no snow potato drawn',HCHK.crops(PL,Object.assign({},N,{snowpotato:0}),st,['snowpotato']));
 add('pycrete\'s rule moved a degree',HCHK.pyc(m=>NWOW.climate(m+1.5)));
 add(SITE.aspectCheck===false?'no larch at all':'the larch on the sunny slopes',SITE.aspectCheck===false?HCHK.aspect([],NWOW.FIELDS):HCHK.aspect(NWOW.TREES,(x,z)=>{const F=NWOW.FIELDS(x,z);return {sunny:-F.sunny};}));
 add('a tree on the aufeis or in the water',HCHK.roots(NWOW.TREES.concat([(()=>{const r=NWOW.frost.records().find(q=>q.kind==='aufeis'),a=NWOW.frost.alases.find(q=>q.lake>0);
  return r?{x:r.x,z:r.z}:a?{x:a.x,z:a.z}:STREAM?{x:STREAM.pts[40][0],z:STREAM.pts[40][1]}:{x:MODEL_WATER.length?MODEL_WATER[0].x:0,z:MODEL_WATER.length?MODEL_WATER[0].z:0};})()])));
 const AU=(NWOW.AUFEIS_DRAWN||[]).length>0;
 add(AU?'an aufeis patch not registered':'a landform the station lacks',AU?HCHK.frost(NWOW.frost,REG.filter(q=>q.key!=='landform.aufeis')):HCHK.frost(NWOW.frost,REG,(SITE.landforms||[]).concat(['rockglacier-none'])));
 add('the sky at another pixel',HCHK.sky({preset:Object.assign({},SKY.preset,{site:{px:0,py:0}})}));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
/* THE LAND IN THE STILL WATER (core/water/ext/58, WATER.mirrorSwitch; every rebuild: the switch, OFF at page load, for the tri counts): the panel's
   "reflections" button or ?mirror=probe|live turns it on. The largest open still is the plane (the Yeti Valley's lake when it is not frozen, else the
   largest alas); the other stills share its material and so its plane (one a page): an alas at another level shows the plane's land, as the stream
   would */
const MIRROR_AT=(function(){if(!WATER_DRAW||!WATER_DRAW.still||!WATER_RECS)return null;const iced=WATER_RECS.lake&&SITE.lakeIce&&SITE.lakeIce[SEASON];
 const L=(WATER_RECS.alases||[]).concat(WATER_RECS.lake&&!iced?[WATER_RECS.lake]:[]);if(!L.length)return null;
 const area=P=>{let a=0;for(let k=0;k<P.length;k++){const p=P[k],q=P[(k+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return Math.abs(a)/2;};
 const S=L.reduce((b,S)=>!b||area(S.poly)>area(b.poly)?S:b,null),n=S.poly.length;let cx=0,cz=0;S.poly.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
 const r=Math.max(...S.poly.map(q=>Math.hypot(q[0]-cx,q[1]-cz)));
 return {materials:[WATER_DRAW.still.material],level:S.level,center:[cx,cz],radius:r*2.5};})();
const MIRROR=WATER.mirrorSwitch&&MIRROR_AT?WATER.mirrorSwitch(Object.assign({THREE,renderer,scene,camera,sky:SKY,far:2200,tree:o=>o.name==='biome:impTrees',
 hour:()=>ATMOS.clock?ATMOS.clock.hour:10},MIRROR_AT)):null;window.MIRROR=MIRROR;
const H=KHOST.take({build:'nwouterwall',title:'Krator biome — the NW outer wall: '+SITE.title,
 hint:'The Yeti\'s High Country ('+NW_REGION.site.base.toFixed(0)+' m, '+NW_REGION.site.atm.toFixed(2)+' atm, '+NW_REGION.site.cls+'): '+SITE.title+', '+SEASON+'. The Season select reloads the page',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:10},draw:MIRROR?()=>{MIRROR.update();SKY.render();}:()=>SKY.render(),   /* the reflections' pass when on, the shared sky's pass, then the world (89s-host-sky.js) */
 controls:[{select:SEASONS.map(s=>[s,'Season: '+s]),id:'seasonsel',on:v=>{const u=new URL(location.href);u.searchParams.set('season',v);location.href=u.toString();}}],
 inspect:describe,stats:()=>'inst '+window._instances+'\nseason '+SEASON+' · day '+SKY_DAY0+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock and ice':{match:o=>!!(o.userData&&(o.userData.rock||/^ice:/.test(o.name||'')))},
  'water':{match:o=>!!(o.name&&/^water:/.test(o.name))},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export(),landforms:()=>({format:'nwouterwall-landforms',version:1,station:SITE.name,season:SEASON,records:NWOW.frost.records()})},
 minimap:{title:'The NW outer wall: '+SITE.title},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,season:()=>SEASON,pyc:(x,z)=>NWOW.pyc(x,z)}});
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
{const s=document.getElementById('seasonsel');if(s)s.value=SEASON;}
