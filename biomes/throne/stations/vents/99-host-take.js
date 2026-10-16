// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map: a kipuka's rim seen from the young lava, the kit's trees nearest their places
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
function nearTree(key,x,z,minH){return THRONE.nearestTree(SPI(key),x,z,minH)||THRONE.nearestTree(SPI(key),x,z)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
// the ash desert's places (45, 47, 86): a point and an aim
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const VMODE={},VWEATHER={};
const TT=k=>nearTree(k,0,0,3);
// a point across the rift: u along it, l from the graben's axis
const gp=(u,l)=>upAt(u,GRABEN.pw(u)+l);
const VIEWS={
 'Vent country':(function(){const a=gp(420,GRABEN.W(420)-60),b=gp(-300,GRABEN.W(-300)-30);return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],14),b[1]];})(),
 'The graben from its rim':(function(){const W=GRABEN.W(-250),a=gp(-250,-W-25),b=gp(-150,W);return[a[0],gh(a[0],a[1],4),a[1],b[0],gh(b[0],b[1],12),b[1]];})(),
 'The fissure and its cones':(function(){const C=CONES[1],a=upAt(C.u+260,fissL(C.u+260)-140);return[a[0],gh(a[0],a[1],4),a[1],C.x,gh(C.x,C.z,C.h*.4),C.z];})(),
 'The fissure at night':(function(){const a=upAt(1290,fissL(1290)+10),b=fissPt(1200);return[a[0],gh(a[0],a[1],2.5),a[1],b[0],gh(b[0],b[1],1),b[1]];})(),
 'The sulphur marsh':(function(){const a=upAt(MARSH.u+MARSH.ru*.35,MARSH.p+MARSH.rp*1.12),b=upAt(MARSH.u-MARSH.ru*.2,MARSH.p);return[a[0],Math.max(gh(a[0],a[1],3),MARSH.level+4),a[1],b[0],MARSH.level,b[1]];})(),
 'Sulphur rosettes':(function(){const a=upAt(MARSH.u+MARSH.ru*.55,MARSH.p+MARSH.rp*.35),b=upAt(MARSH.u+MARSH.ru*.45,MARSH.p+MARSH.rp*.3);return[a[0],Math.max(gh(a[0],a[1],1.7),MARSH.level+1.7),a[1],b[0],MARSH.level+.3,b[1]];})(),
 'Brimstone candelabras':(function(){const T=nearTree('brimstone',MARSH.x,MARSH.z,7);return atTree(T,T.crownR*3+9,Math.atan2(PERP[1],PERP[0])+.4,1.8,.5);})(),
 'The hot pools':(function(){let cx=0,cz=0;POOLS.forEach(P=>{cx+=P.x/POOLS.length;cz+=P.z/POOLS.length;});return toward(cx+DN[0]*60+PERP[0]*170,cz+DN[1]*60+PERP[1]*170,cx,cz,200,6,0);})(),
 'A hot pool':(function(){const P=POOLS[0];return toward(P.x+P.r*2.6,P.z+P.r*.8,P.x,P.z,P.r*2.7,2.4,-1);})(),
 'The mud pots':(function(){const M=MUD[0];return toward(M.x+10,M.z+5,M.x,M.z,M.r+8,3.2,-.5);})(),
 'The steam valley':(function(){const a=upAt(1150,valL(1150)+22),b=upAt(800,valL(800));return[a[0],gh(a[0],a[1],2.5),a[1],b[0],gh(b[0],b[1],8),b[1]];})(),
 'A bone bell in the steam':(function(){const c=upAt(600,valL(600)),T=nearTree('bonebell',c[0],c[1],6);return atTree(T,T.crownR*2.4+8,Math.atan2(PERP[1],PERP[0]),1.8,.55);})(),
 'An open crack':(function(){let best=null;   // the crack and the side with the most room (the bone bells crowd their steam)
  for(const C of CRACKS)for(const sd of [-1,1])for(const f of [-.3,.3]){const cx=C.x+C.dx*C.len*f+C.dz*13*sd,cz=C.z+C.dz*C.len*f-C.dx*13*sd;let m=1e9;
   for(const T of THRONE.TREES){const d=Math.hypot(T.x-cx,T.z-cz)-T.crownR;if(d<m)m=d;}if(!best||m>best.m)best={m,C,cx,cz,f};}
  const C=best.C,tx=C.x-C.dx*C.len*best.f*.2,tz=C.z-C.dz*C.len*best.f*.2;return[best.cx,gh(best.cx,best.cz,5),best.cz,tx,gh(tx,tz,-C.d*.4),tz];})(),
 'A CO2 hollow':(function(){const H=HOLLOWS[1];return toward(H.x+H.r*2.2,H.z+H.r*.8,H.x,H.z,H.r*1.45,3,-H.depth*.7);})(),
 'Lamp caps at night':(function(){const T=TT('lampcap');return atTree(T,6,rr(0,TAU),1.4,.5);})(),
 'Acid fog':(function(){const a=gp(-350,40),b=gp(-900,0);return[a[0],gh(a[0],a[1],2),a[1],b[0],gh(b[0],b[1],3),b[1]];})(),
 'Ash on the rift':(function(){const W=GRABEN.W(700),a=gp(700,W+30),b=gp(-700,0);return[a[0],gh(a[0],a[1],8),a[1],b[0],gh(b[0],b[1],0),b[1]];})(),
 'From above':[-1300,2350,1300,200,1380,-200],
};
VMODE['The fissure at night']='night';VMODE['Lamp caps at night']='night';
VWEATHER['Acid fog']='fog';VWEATHER['Ash on the rift']='ashfall';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.hollow!=null?'a CO2 hollow: do not go down into it':best2&&best2.bones?'bones (the hollow\'s dead)':best2&&best2.pool!=null?'a hot pool: scalding, and acid':best2&&best2.mud!=null?'a mud pot':best2&&best2.marsh?'the sulphur marsh: acid water':best2&&best2.crack?'an open crack: the rift pulling apart':best2&&best2.fissure?'the fissure: still hot':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+(FIELD.hollow(p.x,p.z)>.5?' · the hollow (CO2)':FIELD.marsh(p.x,p.z)>.5?' · the sulphur marsh':FIELD.pools(p.x,p.z)>.5?' · sinter and mats round the pools':FIELD.valley(p.x,p.z)>.5?' · the steam valley (rock rotted to clay)':FIELD.graben(p.x,p.z)>.5?' · the graben floor':' · the rift\'s shoulder')+(FIELD.vent(p.x,p.z)>.15?' · steaming ('+Math.round(FIELD.vent(p.x,p.z)*100)+'%)':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:24000000,calls:260},   // a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:16000000,host:900000},
 type:{'throne/trees':'pass','throne/floor':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native'],LIVES=['shoulder','seam','plume','vent','windward'];
const SPK=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
const KEYOF=t=>THRONE.SPECIES[t.sp].key;
const HCHK={
 // Krator's own life holds vent country: its trees native; of Earth's only the Ranj tree (its fungus takes on the vent ground)
 native(T){const earth=T.filter(t=>THRONE.SPECIES[t.sp].tags.origin==='earth'&&KEYOF(t)!=='spice'),bb=T.filter(t=>KEYOF(t)==='bonebell').length;
  return{ok:bb>=20&&!earth.length,detail:(earth.length?earth.length+' Earth trees on the vents ('+[...new Set(earth.map(KEYOF))].join(', ')+'); ':'')+bb+' bone bells, '+T.length+' trees'};},
 // nothing lives in the CO2 hollows: no tree, no plant on their floors
 hollow(T,P){let bt=0,bp=0;for(const H of HOLLOWS){const r=H.r*.85;bt+=T.filter(t=>Math.hypot(t.x-H.x,t.z-H.z)<r).length;bp+=P.filter(p=>Math.hypot(p[0]-H.x,p[2]-H.z)<r).length;}
  return{ok:!bt&&!bp,detail:bt+bp?(bt+' trees and '+bp+' plants in the hollows'):'the hollows are dead: nothing grows on their floors'};},
 // the marsh holds the sulphur rosettes; the pools' shores the vent coral and the brain caps
 marsh(P){const n=P.filter(p=>p[3]==='biome:srosette'&&marshD(p[0],p[2])<1.3).length;return{ok:n>=40,detail:n+' sulphur rosettes in the marsh'};},
 // the sulphur life (the kit's, on the 'sulph' field): reeds, pads and bladders in the marsh and round the vents
 sulphur(P){const c=n=>P.filter(p=>p[3]==='biome:'+n).length,t=c('tassel')+P.filter(p=>/^biome:reedbrim/.test(p[3])).length,a=c('acidpad'),b=c('bladder'),wet=P.filter(p=>p[3]==='biome:acidpad'&&marshD(p[0],p[2])<1.05).length;
  return{ok:t>=200&&a>=100&&b>=100&&wet>=a*.8,detail:t+' reeds (stems or stands), '+a+' acid pads ('+wet+' on the marsh), '+b+' gas bladders'};},
 // nothing lives on the hot ground (the fissure's ramparts and crack, its cones)
 hot(T,P){const rock=['biome:boulder','biome:stone'],bt=T.filter(t=>hotAt(t.x,t.z)>.6).length,bp=P.filter(p=>hotAt(p[0],p[2])>.6&&rock.indexOf(p[3])<0&&p[1]<terrainH(p[0],p[2])+1.5).length;   // at the ground (a crown may reach over the edge)
  return{ok:!bt&&!bp,detail:bt+bp?(bt+' trees and '+bp+' plants on the hot ground'):'the fissure and its cones are bare'};},
 pools(P){const n=P.filter(p=>(p[3]==='biome:column'||p[3]==='biome:brain')&&POOLS.some(Q=>Math.hypot(p[0]-Q.x,p[2]-Q.z)<Q.r*4)).length;return{ok:n>=10,detail:n+' vent corals and brain caps round the pools'};},
 // the weather: the module's fog (the acid fog) and its opt-in ash both offered
 weather(W,U){const ok=!!W&&W.MODES.indexOf('fog')>=0&&W.MODES.indexOf('ash')>=0&&W.MODES.indexOf('ashfall')>=0&&typeof W.ash==='number'&&!!U&&!!U.ash;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no acid fog or no ash'};},
 placed(C){const here=THRONE.SPECIES.filter(S=>S.vents||['bonebell','lampcap','drizzle','ropepuff','pagoda'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('Krator\'s own life holds vent country',HCHK.native(THRONE.TREES));
 add('nothing lives in the CO2 hollows',HCHK.hollow(THRONE.TREES,P));
 add('nothing lives on the fissure or its cones',HCHK.hot(THRONE.TREES,P));
 add('sulphur rosettes in the marsh',HCHK.marsh(P));
 add('vent coral and brain caps round the hot pools',HCHK.pools(P));
 add('the sulphur life: reeds, acid pads, gas bladders',HCHK.sulphur(P));
 add('the acid fog and the ash (core/atmos) are here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('every species of vent country placed',HCHK.placed(counts(THRONE.TREES)));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),H=HOLLOWS[0];
 add('a lehua on the vents',HCHK.native(THRONE.TREES.concat([{sp:SPK('lehua'),x:0,z:0}])));
 add('a plant in a hollow',HCHK.hollow(THRONE.TREES,[[H.x,terrainH(H.x,H.z),H.z,'biome:fern']]));
 add('a marsh with no rosettes',HCHK.marsh([]));
 {const c=fissPt(1200);add('a plant on the fissure',HCHK.hot(THRONE.TREES,[[c[0],terrainH(c[0],c[1]),c[1],'biome:fern']]));}
 add('pools with nothing round them',HCHK.pools([]));
 add('no sulphur life',HCHK.sulphur([]));
 add('a weather without the ash',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES.filter(m=>m!=='fog')}),ATMOS.U));
 {const C=counts(THRONE.TREES);C[SPK('brimstone')]=0;add('a species never placed',HCHK.placed(C));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-vents',title:'Krator biome — the Throne: vent country',
 hint:'The Throne, station 8: vent country, the east rift under the plume, ~1.4 km up, ~80 km from the vent. A graben, its floor dropped between two fault scarps; an eruptive fissure four years quiet, its crack still glowing at night, spatter cones along it and its young flow; the sulphur marsh with its antler-stalked rosettes; hot pools ringed in colour by their mats, vent coral and brain caps round them; mud pots; a steam valley of bone bells; the mat in two still hollows (ideal type) · weather: acid fog (and the ash, and the rest) · N night',
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:LCTL,keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,vents:()=>VENTS,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
