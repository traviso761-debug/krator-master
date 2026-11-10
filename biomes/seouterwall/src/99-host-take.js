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
 const PLT=item&&(NWOW.plantOfItem(item)||(SEOW.plantOfItem&&SEOW.plantOfItem(item))),SB=best&&NWOW.SPECIES.find(s=>best.key===s.key),F=PLT||SB,hv=F&&F.tags?F.tags.harvest:null;
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
 type:{'nwouterwall/trees':'pass','nwouterwall/floor':'pass','nwouterwall/fields':'pass','seouterwall/floor':'pass','host':'host'},
};
const HCHK={
 // the station on the scale model (PLAN.md sections 5, 7.2 and 7.4): the page's pixel within 8 px (16 km) of the plan's and its height within
 // 150 m of the plan's (test_smodel.py's tolerance), its air by the model's rule; the drawn ground at the origin on the model's height
 model(S,h0,P){P=P||SITE.plan;const ok=Math.hypot(S.px-P.px,S.py-P.py)<=8&&Math.abs(S.base-P.base)<=150&&Math.abs(S.atm-SEOW.atm(S.base))<.01&&Math.abs(h0)<6;
  return{ok,detail:'px '+S.px+','+S.py+': '+S.base.toFixed(0)+' m, '+S.atm.toFixed(2)+' atm, '+S.cls+', mean '+S.mean.toFixed(1)+' °C; the drawn ground at the origin '+h0.toFixed(1)+' m'};},
 // the cordillera's tiers (PLAN.md section 1.3 and 7.2) and the air by the model's rule
 tiers(T){const want=[[3620,'pass'],[4000,'subalpine'],[5000,'bench'],[6000,'nival'],[7500,'hypobaric'],[9500,'airless']],bad=want.filter(w=>T(w[0])!==w[1]);
  return{ok:!bad.length,detail:want.map(w=>w[0]+' m '+T(w[0])).join(', ')+(bad.length?'; wrong: '+bad.map(w=>w[0]).join(', '):'')};},
 // the station's landforms, each where the zones say, on the near ground's zone raster; the moraines and the heaps registered
 zones(need,ZC,reg){const lack=need.filter(z=>!(ZC[z]>0)),mor=reg.filter(r=>r.key==='landform.moraine').length,hp=reg.filter(r=>r.key==='landform.rockfall').length;
  return{ok:!lack.length&&mor>=SITE.moraines.length&&hp>=Math.min(3,HEAPS.length)&&(SITE.heaps?hp>=3:true),detail:need.map(z=>z+' '+(ZC[z]||0)).join(', ')+'; '+mor+' moraines, '+hp+' rockfall heaps'+(lack.length?'; missing '+lack.join(', '):'')};},
 // the meltwater: the brook runs down the gully and ends on its fan, where it sinks into the gravel (282 mm: no tarn on the col)
 sinks(S,fan){if(!S||!fan)return{ok:false,detail:'no brook or no fan'};const e=S.pts[S.pts.length-1],d=Math.hypot(e[0]-fan.x,e[1]-fan.z),drop=S.level[0]-S.level[S.level.length-1];
  return{ok:d<fan.r*.5&&drop>20,detail:'the brook falls '+drop.toFixed(0)+' m and ends '+d.toFixed(0)+' m from the fan\'s apex (its radius '+fan.r.toFixed(0)+' m)'};},
 // the tarn and its fall (station 2): the brook reaches the tarn's level at its end and falls over the headwall on the way
 tarn(S,lake,falls){if(!S||!lake)return{ok:false,detail:'no brook or no tarn'};const end=S.level[S.level.length-1],F=(falls||[]).map(f=>f.F),big=F.filter(f=>f.drop>=80);
  return{ok:Math.abs(end-lake.level)<4&&(SITE.fallName?big.length>=1:true),detail:'the brook ends '+(end-lake.level).toFixed(1)+' m over the tarn ('+(BASE+lake.level).toFixed(0)+' m); falls: '+(F.map(f=>Math.round(f.drop)+' m').join(', ')||'none')};},
 // the God-Bore decides the trees' form: the larch stands only in a lee, the open shaded slopes are the creeping pine's (PLAN.md 2.1)
 lee(TREES,F){const L=TREES.filter(T=>T.sp===0),open=L.filter(T=>F(T.x,T.z).wind>=SEOW.EXPOSED+.08).length,K=TREES.filter(T=>T.sp===2).length;
  return{ok:(L.length>0||!(_zoneCounts().larch>0))&&open<=Math.max(2,L.length*.08),detail:L.length+' larches, '+open+' of them in the open; '+K+' creeping pines (krummholz)'};},
 // nothing roots in water, on a crag's face or on a rockfall heap (trees off cliff faces)
 roots(TREES){let wet=0,crag=0,heap=0;TREES.forEach(T=>{const F=SEOW.FIELDS(T.x,T.z);if(F.water)wet++;if(F.g>.9)crag++;if(heapAt(T.x,T.z)>.5)heap++;});
  return{ok:wet+crag+heap===0&&TREES.length>(SITE.minTrees==null?100:SITE.minTrees),detail:TREES.length+' trees; '+wet+' in water, '+crag+' on a crag\'s face, '+heap+' on a heap'};},
 // the rock: the cordillera's megabreccia east of the Godsgate's corridor, the Godthrone's tibasalt west of it (KSTRATA's lateral stack),
 // read 3 km either side of the contact (ROCK_CONTACT: this page's metres)
 rock(S){if(!S)return{ok:false,detail:'no KSTRATA column'};const c=ROCK_CONTACT,e=S.at(c[0]+3000,1500,c[1]),w=S.at(c[0]-3000,1500,c[1]),o=S.at(0,100,0);
  return{ok:e.recipe==='megabreccia'&&w.recipe==='tibasalt'&&e.side===0&&w.side===1,detail:'east of the corridor: '+e.recipe+' ('+e.kind+'), west: '+w.recipe+' ('+w.kind+'); at the station: '+o.recipe};},
 // the hazards: the God-Bore on the night's cycle (on at 02:00, off at 14:00), the rockfall under the crags
 // the hazards: the God-Bore on the night's cycle (on at 02:00, off at 14:00), the rockfall under the crags at its worst at noon
 hazards(H){if(typeof KHAZ==='undefined')return{ok:false,detail:'no core/hazard'};const gb=H.find(r=>r&&r.tags&&r.tags.hazard.kind==='cold'),R=H.filter(r=>r&&r.tags&&r.tags.hazard.kind==='crush');
  if(!gb||(HEAPS.length&&!R.length))return{ok:false,detail:'no God-Bore or no rockfall record'};const n=KHAZ.state(gb,2*3600),d=KHAZ.state(gb,14*3600),rn=R.length?KHAZ.state(R[0],12.5*3600):{k:0},rd=R.length?KHAZ.state(R[0],3*3600):{k:0};
  return{ok:n.k>.99&&d.k<.01&&(HEAPS.length?R.length>=3&&rn.k>.99&&rd.k<.5:true),detail:'the God-Bore at 02:00 '+n.state+' k '+n.k.toFixed(2)+', at 14:00 '+d.state+' k '+d.k.toFixed(2)+'; '+R.length+' rockfall chutes, k '+rn.k.toFixed(2)+' at 12:30, '+rd.k.toFixed(2)+' at 03:00'};},
 // the Ancients' highway (station 1): its profile held to the ruling grade, the graded ground under its pavement's middle and edges within
 // half a metre of its line (the flatten strokes did their work), the road's zone on the near ground
 road(Rd,h,ZC){if(!Rd)return{ok:false,detail:'no road'};const P=Rd.rec.pts,W=Rd.rec.w;let worst=0;
  for(let i=1;i<P.length-1;i+=5){const a=P[i-1],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;for(const q of [-W*.45,0,W*.45]){const x=P[i][0]-dz/L*q,z=P[i][1]+dx/L*q;worst=Math.max(worst,Math.abs(h(x,z)-P[i][2]));}}
  const ok=Rd.maxGrade<=Rd.rec.grade+.002&&worst<.5&&ZC.road>0;
  return{ok,detail:P.length+' points, '+(P.length*10/1000).toFixed(1)+' km; steepest '+(Rd.maxGrade*100).toFixed(1)+' % (ruling '+(Rd.rec.grade*100).toFixed(0)+' %); the ground under its pavement within '+worst.toFixed(2)+' m; '+(ZC.road||0)+' road points on the zone raster'};},
 // the kit's own plants (50, 60): each placed (the poppies by the season), the puya on the sunny slopes and the scree, the guyed stalks by
 // water (a brook, a fan's channel, a tarn's strand), none on the road, a heap, a crag or in water
 plants(fl,inst){if(!fl)return{ok:false,detail:'no floor'};const K=fl.byKind||{},bad=inst.filter(p=>{const Z=SEOW.zoneAt(p[0],p[2]);return Z==='road'||Z==='heap'||Z==='crag'||Z==='water';}).length;
  const want=(SITE.plantsNeed||['puya','guyedstalk','goldroot']).concat(SEOW.BLOOM>0?['skypoppy','goldpoppy']:[]),lack=want.filter(k=>!(K[k]>0));
  return{ok:!lack.length&&bad===0,detail:Object.keys(K).map(k=>k+' '+K[k]).join(', ')+'; '+bad+' of '+inst.length+' sampled on a road, heap, crag or water'+(lack.length?'; none of '+lack.join(', '):'')};},
 // the heat (station 3): the vents' ground hot (KTHERM), the country's soil at its own temperature 600 m off the fault, every hearth tree on
 // 25-60 °C (the Hearths' rule), the springs drawn at their levels, the terraces' treads descending to the tarn and ending at its level
 heat(Ht,field,W){if(!Ht)return{ok:false,detail:'no heat'};const Tv=Ht.at(300,-350),Ts=Ht.at(-700,900),tr=(field&&field.trees)||[],off=tr.filter(T=>{const t=Ht.at(T.x,T.z);return t<24||t>61;}).length;
  const sp=W&&W.springs?W.springs.length:0,Tt=W&&W.terraces?W.terraces.T.treads:[],desc=Tt.every((t,i)=>!i||t.y<Tt[i-1].y),endY=Tt.length?Tt[Tt.length-1].y:null;
  return{ok:Tv>=80&&Math.abs(Ts-SITE.heat.soil)<1.6&&tr.length>=10&&off===0&&sp===SITE.springs.length&&Tt.length>=6&&desc&&endY!=null&&MODEL_LAKE&&endY-MODEL_LAKE.level<1,
   detail:'the amber spring\'s ground '+Tv.toFixed(0)+' °C, the soil 600 m off '+Ts.toFixed(1)+' °C; '+tr.length+' hearth trees, '+off+' off 25-60 °C; '+sp+' springs drawn; '+Tt.length+' treads '+(desc?'descending':'NOT descending')+' to '+(endY==null?'?':endY.toFixed(2))+' m (the tarn at '+(MODEL_LAKE?MODEL_LAKE.level.toFixed(2):'?')+')'};},
 // the God-Bore as the wind (core/atmos's katabatic, opt-in): full at 02:00 from SEOW.FROM, none at 14:00, on the same hours as its hazard
 godbore(at,haz){if(!at||!haz)return{ok:false,detail:'no katabatic wind or no God-Bore record'};const n=at(2),d=at(14),u=SEOW.FROM,m=Math.hypot(n.wind[0],n.wind[1])||1,dot=-(n.wind[0]*u[0]+n.wind[1]*u[1])/m;
  const hn=KHAZ.state(haz,2*3600).k,hd=KHAZ.state(haz,14*3600).k;
  return{ok:n.k>.99&&d.k<.01&&dot>.99&&Math.abs(n.k-hn)<.01&&Math.abs(d.k-hd)<.01,detail:'02:00 k '+n.k.toFixed(2)+' (the hazard '+hn.toFixed(2)+'), down from the north-north-west ('+dot.toFixed(3)+'), '+m.toFixed(1)+' m/s base; 14:00 k '+d.k.toFixed(2)+' (the hazard '+hd.toFixed(2)+')'};},
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
const ZONES_NEED=SITE.need||['col','moraine','floor','fan','crag','scree','krummholz','puna'];
const _zoneCounts=()=>{const n={};for(let k=0;k<ZR.length;k++){const z=ZONE_IDS[ZR[k]];n[z]=(n[z]||0)+1;}return n;};
const TREES_ALL=()=>NWOW.TREES||[];
/* a point in water on the near ground (the negatives' bad spot when a station has no heap or road): the first grid point whose zone is water */
const WET_PT=()=>{const W=ZONE_IDS.indexOf('water');for(let k=0;k<ZR.length;k++)if(ZR[k]===W)return [FIELD.x0+(k%FIELD.nx)*FIELD.step,FIELD.z0+Math.floor(k/FIELD.nx)*FIELD.step];return [0,0];};
/* the kit's own instances (every item of its registry: up to 400 of each), [x, y, z] */
const SEOW_INST=()=>{const out=[],R=BIO.kits.seouterwall,m=new THREE.Matrix4(),p=new THREE.Vector3();if(!R)return out;scene.traverse(o=>{if(!o.isInstancedMesh||!o.userData.biome||o.userData.kit!=='seouterwall')return;const n=Math.min(o.count,400);for(let i=0;i<n;i++){o.getMatrixAt(i,m);p.setFromMatrixPosition(m);out.push([p.x,p.y,p.z]);}});return out;};
/* the hazard records as the page's registry holds them (BIO.record queued them before it was up: 47) */
const HAZ_RECS=()=>typeof KHAZ==='undefined'?[]:KHAZ.list().filter(r=>r&&r.tags&&r.tags.hazard&&(r.tags.hazard.kind==='cold'||r.tags.hazard.kind==='crush'));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),ZC=_zoneCounts();
 add('the station on the scale model',HCHK.model(SEOW_REGION.site,terrainH(0,0)));
 add('the cordillera\'s tiers and its air',HCHK.tiers(SEOW.tierOf));
 add('the brook on core/water, never climbing',HCHK.water(WATER_RECS,WATER_DRAW));
 add('the station\'s landforms on the ground (zones, moraines, heaps)',HCHK.zones(ZONES_NEED,ZC,REG));
 if(SITE_RECS.melt&&SITE_RECS.melt.fan)add('the meltwater sinks into its fan',HCHK.sinks(STREAM,SITE_RECS.melt.fan));
 if(MODEL_LAKE&&STREAM)add('the brook falls over the headwall into the tarn',HCHK.tarn(STREAM,MODEL_LAKE,WATER_DRAW&&WATER_DRAW.falls));
 add('the larch in a lee, the krummholz in the open',HCHK.lee(TREES_ALL(),SEOW.FIELDS));
 add('no tree in water, on a crag or a heap',HCHK.roots(TREES_ALL()));
 add('the cordillera\'s own plants (puya, guyed stalks, poppies, goldroot)',HCHK.plants(window._biome&&window._biome.floor,SEOW_INST()));
 if(ROAD)add('the Ancients\' highway graded at its ruling grade',HCHK.road(ROAD,terrainH,ZC));
 if(HEAT)add('the fault\'s heat, its springs, terraces and hearth trees',HCHK.heat(HEAT,window._field,WATER_DRAW));
 add('megabreccia east, tibasalt west (KSTRATA)',HCHK.rock(ROCK_SH));
 add('the God-Bore and the rockfall (core/hazard)',HCHK.hazards(HAZ_RECS()));
 add('the God-Bore blows by night (core/atmos katabatic) on its hazard\'s hours',HCHK.godbore(AIR.katabatic?h=>AIR.katabatic.at(h):null,HAZ_RECS().find(r=>r.tags.hazard.kind==='cold')));
 add('the shared sky at the station, its far land from the model',HCHK.sky(SKY));
 add('the season\'s larch and snow',HCHK.season());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),ZC=_zoneCounts();
 add('the station at another pixel',HCHK.model(Object.assign({},SEOW_REGION.site,{px:SITE.plan.px+20}),terrainH(0,0)));
 add('the station floating over the model',HCHK.model(SEOW_REGION.site,terrainH(0,0)+40));
 add('the col in the nival tier',HCHK.tiers(h=>h<5400?'nival':SEOW.tierOf(h)));
 add('the brook climbing',WATER_RECS&&WATER_RECS.stream?HCHK.water(Object.assign({},WATER_RECS,{stream:Object.assign({},WATER_RECS.stream,{pts:WATER_RECS.stream.pts.map((p,i)=>i===5?Object.assign({},p,{y:p.y+60}):p)})}),WATER_DRAW):{ok:false,detail:'no brook'});
 if(ZONES_NEED.indexOf('moraine')>=0)add('no moraine drawn',HCHK.zones(ZONES_NEED,Object.assign({},ZC,{moraine:0}),REG));
 if(HEAPS.length)add('no rockfall heap',HCHK.zones(ZONES_NEED,ZC,REG.filter(r=>r.key!=='landform.rockfall')));
 if(SITE_RECS.melt&&SITE_RECS.melt.fan)add('the brook running past its fan',HCHK.sinks(STREAM,Object.assign({},SITE_RECS.melt.fan,{x:SITE_RECS.melt.fan.x+2000})));
 if(MODEL_LAKE&&STREAM){add('the brook ending over the tarn',HCHK.tarn(STREAM,Object.assign({},MODEL_LAKE,{level:MODEL_LAKE.level-30}),WATER_DRAW&&WATER_DRAW.falls));
  if(SITE.fallName)add('no fall over the headwall',HCHK.tarn(STREAM,MODEL_LAKE,[]));}
 if(_zoneCounts().larch>0)add('the larch in the open',HCHK.lee(TREES_ALL(),(x,z)=>Object.assign({},SEOW.FIELDS(x,z),{wind:1})));
 add('a tree on a rockfall heap, or in water',HCHK.roots(TREES_ALL().concat(SITE_HEAPS&&SITE_HEAPS[0]?[{x:SITE_HEAPS[0].x,z:SITE_HEAPS[0].z}]:[{x:WET_PT()[0],z:WET_PT()[1]}])));
 if(ROAD){add('the highway at 9 %',HCHK.road(Object.assign({},ROAD,{maxGrade:.09}),terrainH,ZC));
  add('the highway floating 2 m over the ground',HCHK.road(ROAD,(x,z)=>terrainH(x,z)-2,ZC));}
 if(HEAT){add('a hearth tree on the cold soil',HCHK.heat(HEAT,{trees:((window._field&&window._field.trees)||[]).concat([{x:-700,z:900}])},WATER_DRAW));
  add('the terraces climbing',HCHK.heat(HEAT,window._field,WATER_DRAW&&WATER_DRAW.terraces?Object.assign({},WATER_DRAW,{terraces:{T:{treads:WATER_DRAW.terraces.T.treads.slice().reverse()}}}):WATER_DRAW));}
 add('tibasalt on both walls',HCHK.rock(ROCK_SH?{at:(x,y,z)=>ROCK_SH.at(ROCK_CONTACT[0]-3000,y,z)}:null));
 if(HEAPS.length)add('the rockfall as bad at night as at noon',HCHK.hazards(HAZ_RECS().map(r=>r&&r.tags&&r.tags.hazard.kind==='crush'?Object.assign({},r,{id:r.id+'-neg',tags:{hazard:Object.assign({},r.tags.hazard,{cycle:null})}}):r)));
 add('the God-Bore blowing by day',HCHK.hazards(HAZ_RECS().map(r=>r&&r.tags&&r.tags.hazard.kind==='cold'?Object.assign({},r,{id:r.id+'-neg',tags:{hazard:Object.assign({},r.tags.hazard,{cycle:null})}}):r)));
 add('a guyed stalk on the road (or a heap, or in water)',HCHK.plants(window._biome&&window._biome.floor,SEOW_INST().concat(ROAD?[[ROAD.rec.pts[50][0],0,ROAD.rec.pts[50][1]]]:[(()=>{const H=SITE_HEAPS&&SITE_HEAPS[0],w=WET_PT();return H?[H.x,0,H.z]:[w[0],0,w[1]];})()])));
 add('the God-Bore blowing by day',HCHK.godbore(h=>ATMOS.katabaticAt(h,{from:SEOW.FROM,speed:3.2,on:9,off:17,ramp:1}),HAZ_RECS().find(r=>r.tags.hazard.kind==='cold')));
 add('the sky at another pixel',HCHK.sky({preset:Object.assign({},SKY.preset,{site:{px:0,py:0}})}));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
const H=KHOST.take({build:'seouterwall',title:'Krator biome — the SE outer wall: '+SITE.title,
 hint:'The SE outer wall ('+SEOW_REGION.site.base.toFixed(0)+' m, '+SEOW_REGION.site.atm.toFixed(2)+' atm, '+SEOW_REGION.site.cls+'): '+SITE.title+', '+SEASON+'. The Season select reloads the page',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:10},draw:()=>SKY.render(),   /* the shared sky's pass, then the world (89s-host-sky.js) */
 controls:[{select:SEASONS.map(s=>[s,'Season: '+s]),id:'seasonsel',on:v=>{const u=new URL(location.href);u.searchParams.set('season',v);location.href=u.toString();}}],
 inspect:describe,stats:()=>'inst '+window._instances+'\nseason '+SEASON+' · day '+SKY_DAY0+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'heaps':{match:o=>!!(o.userData&&o.userData.rock)},
  'water':{match:o=>!!(o.name&&/^water:/.test(o.name))},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export(),landforms:()=>({format:'seouterwall-landforms',version:1,station:SITE.name,season:SEASON,
  moraines:SITE.moraines,melt:SITE_RECS.melt,terraces:SITE_RECS.terraces||null,springs:SITE_RECS.springs||null,heat:HEAT?HEAT.rec:null,dry:SITE_RECS.dry||null,wall:SITE_RECS.wall||null,heaps:HEAPS.map(H=>({id:H.id,x:H.x,z:H.z,y0:H.y0,rx:H.rx,rz:H.rz,ry:H.ry,h:H.h,seed:H.seed})),
  crag:SITE.crag,road:ROAD?ROAD.rec:null,rock:ROCK_SH?ROCK_SH.strata.export?ROCK_SH.strata.export():null:null})},
 minimap:{title:'The SE outer wall: '+SITE.title},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,season:()=>SEASON,zoneAt:(x,z)=>SEOW.zoneAt(x,z),
  /* the export profile's box (verify.py): 300 m round the standing tree (larch or stone pine, near-drawn) nearest the origin, so the tile holds
     the bark's buckets; the origin itself where none stands (a station's origin is its pixel: on a tarn's open shore it holds no tree) */
  get exportBox(){let b=null,bd=1e18;for(const T of NWOW.TREES||[]){if(T.sp>1||T.lv<2)continue;const d=T.x*T.x+T.z*T.z;if(d<bd){bd=d;b=T;}}
   const c=b?[Math.round(b.x),Math.round(b.z)]:[0,0];return [c[0]-150,c[1]-150,c[0]+150,c[1]+150];}}});
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
{const s=document.getElementById('seasonsel');if(s)s.value=SEASON;}
