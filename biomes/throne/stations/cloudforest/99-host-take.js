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
// the cloud forest's places (45, 47, 84, 86): a point and an aim
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const VMODE={},VERUPT={};
const TR=TRAILS[0].pts,trAt=t=>TR[Math.min(TR.length-1,Math.floor(TR.length*t))];
const FV=RAVINES.find(r=>r.steps),F0=FALLS[0]||{x:0,z:0,y:3000,drop:10},F1=FALLS[1]||F0;
const SAD=CLOUD.cairns.find(c=>c.kind==='saddle cairn')||{x:RIDGE.saddle.x,z:RIDGE.zc(RIDGE.saddle.x)};
const fallView=(F,d,h)=>{const x=F.x-F.drop*.3-d,z=ravC(FV,x)+rr(-2,2);return[x,Math.max(gh(x,z,h),waterH(x,z)+h),z,F.x,F.y-F.drop*.45,F.z];};
const VIEWS={
 'The elfin woods':(function(){const p=trAt(.35),q=trAt(.42);return[p[0],gh(p[0],p[1],1.7),p[1],q[0],gh(q[0],q[1],2.5),q[1]];})(),
 'Moss on an elfin tree':(function(){const T=nearTree('elfin',trAt(.3)[0],trAt(.3)[1],5);return atTree(T,T.crownR*1.4+2,rr(0,TAU),1.6,.55);})(),
 'A veil tree':(function(){const T=nearTree('veil',trAt(.5)[0],trAt(.5)[1],10);return atTree(T,T.crownR*2.2+4,rr(0,TAU),2,.6);})(),
 'Veil trees at night':(function(){const T=nearTree('veil',trAt(.5)[0],trAt(.5)[1],10);return atTree(T,T.crownR*2.6+8,rr(0,TAU),2,.55);})(),
 'The ravine of the falls':fallView(F1,70,8),
 'The upper fall':fallView(F0,28,3),
 'The great fall':fallView(F1,30,3),
 'A plunge pool':(function(){const P=POOLS[1]||POOLS[0];return[P.x-16,P.level+3,P.z+3,P.x+4,P.level+4,P.z];})(),
 'Tree ferns in the north ravine':(function(){const V=RAVINES[0],x=-600,z=ravC(V,x);return toward(x-40,z+8,x,z,30,4,2);})(),
 'The trail in the cloud':(function(){const p=trAt(.6),q=trAt(.66);return[p[0],gh(p[0],p[1],1.7),p[1],q[0],gh(q[0],q[1],2),q[1]];})(),
 'The saddle and its cairn':toward(SAD.x-30,SAD.z-25,SAD.x,SAD.z,14,2.5,1.5),
 'The cloud over the ridge':(function(){const x=RIDGE.saddle.x+420,z=RIDGE.zc(x)+300;return[x,gh(x,z,25),z,RIDGE.saddle.x+150,ridgeCrest(RIDGE.saddle.x+150)-10,RIDGE.zc(RIDGE.saddle.x+150)];})(),
 'The heath beyond the ridge':(function(){const x=RIDGE.saddle.x+60,z=RIDGE.zc(x)+260;return toward(x+30,z+60,x,z-120,40,3,4);})(),
 'Above the cloud':[-2600,3800,600,600,3050,-300],
};
VMODE['Veil trees at night']='night';
// the weather a view asks for (the cloud lifts for the ridge's spill and the view over the belt)
const VWEATHER={'The cloud over the ridge':'clear','Above the cloud':'clear','The heath beyond the ridge':'clear'};
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'fog';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.cairn?'a cairn · the Throne\'s natives (culture throne-natives)':best2&&best2.fall?'a waterfall':best2&&best2.pool?'a plunge pool':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const gr='old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+(FIELD.lee(p.x,p.z)>.5?' · the heath (the lee of the ridge)':FIELD.cforest(p.x,p.z)>.5?' · the elfin woods':FIELD.flow(p.x,p.z)>.5?' · a ravine\'s floor':FIELD.rock(p.x,p.z)>.5?' · rock':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
const HCHK={
 // the elfin woods: hundreds of elfin trees near the cameras, all on the windward side of the ridge, nearly all in the woods
 elfin(T){const sp=SPK('elfin'),E=T.filter(t=>t.sp===sp),lee=E.filter(t=>FIELD.lee(t.x,t.z)>.4),out=E.filter(t=>FIELD.cforest(t.x,t.z)<.3);
  return{ok:E.length>=500&&!lee.length&&out.length<=E.length*.05,detail:(lee.length?lee.length+' elfin trees on the lee; ':'')+E.length+' elfin trees, '+out.length+' off the woods'};},
 // the veil trees are placed and their veils glow at night (brighter than by day)
 veils(T,day,night){const n=T.filter(t=>t.sp===SPK('veil')).length;return{ok:n>=10&&night>day*2,detail:n+' veil trees; the veils\' glow '+day.toFixed(2)+' by day, '+night.toFixed(2)+' at night'};},
 // the ravine's falls: four, each a real drop, each lip on its ravine's floor
 falls(F){const V=RAVINES.find(r=>r.steps),bad=F.filter(f=>f.drop<12||Math.abs(f.z-ravC(V,f.x))>V.w);
  return{ok:F.length>=4&&!bad.length,detail:bad.length?bad.length+' falls off the ravine or too low':F.map(f=>Math.round(f.drop)+' m').join(', ')};},
 // beyond the ridge the heath: the dry side's trees there (ash pines), no elfin woods
 heath(T){const L=T.filter(t=>FIELD.lee(t.x,t.z)>.6),dry=L.filter(t=>THRONE.SPECIES[t.sp].key==='ashpine'),wet=L.filter(t=>THRONE.SPECIES[t.sp].cloud);
  return{ok:dry.length>=5&&!wet.length,detail:(wet.length?wet.length+' cloud-forest trees on the heath; ':'')+L.length+' trees on the heath, '+dry.length+' ash pines'};},
 // the cairns are the natives', each beside the trail
 cairns(C){const bad=C.filter(c=>PATHGRID.at(c.x,c.z)>4||c.culture!=='throne-natives');
  return{ok:C.length>=10&&!bad.length&&C.some(c=>c.kind==='saddle cairn'),detail:(bad.length?bad.length+' cairns off the trail or untagged; ':'')+C.length+' cairns'};},
 // the cloud forest's species are all placed
 placed(C){const here=THRONE.SPECIES.filter(S=>S.cloud||['treefern','lehua','ashpine'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 paths(T){const bad=T.filter(t=>PATHGRID.at(t.x,t.z)<-.2);return{ok:!bad.length,detail:bad.length?bad.length+' trees on the trail':'no tree on the trail'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),waterH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the ground or the water: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
function veilGlow(k){THRONE.setNight(k);let e=0;scene.traverse(o=>{if(/^biome:weeper/.test(o.name)&&o.material)e=Math.max(e,o.material.emissiveIntensity||0);});return e;}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),prev=THRONE._night;
 add('the elfin woods stand on the windward side',HCHK.elfin(THRONE.TREES));
 {const d=veilGlow(0),n=veilGlow(1);THRONE.setNight(prev);add('the veil trees glow at night',HCHK.veils(THRONE.TREES,d,n));}
 add('the ravine steps down in four falls',HCHK.falls(FALLS));
 add('the heath beyond the ridge is the dry side\'s',HCHK.heath(THRONE.TREES));
 add('the cairns are the natives\', beside the trail',HCHK.cairns(CLOUD.cairns));
 add('every species of the cloud forest placed',HCHK.placed(counts(THRONE.TREES)));
 add('nothing grows on the trail',HCHK.paths(THRONE.TREES));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('nothing rooted under the water',HCHK.dry(P));
 add('preset cameras clear of ground and water',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});const P=instPoints();
 {const x=RIDGE.saddle.x+300,z=RIDGE.zc(x)+250;add('an elfin tree on the heath',HCHK.elfin(THRONE.TREES.concat([{sp:SPK('elfin'),x,z}])));}
 add('veils that do not glow',HCHK.veils(THRONE.TREES,1,1));
 add('a fall off its ravine',HCHK.falls(FALLS.concat([Object.assign({},FALLS[0],{z:FALLS[0].z+200})])));
 {const x=RIDGE.saddle.x+200,z=RIDGE.zc(x)+250;add('a veil tree on the heath',HCHK.heath(THRONE.TREES.concat([{sp:SPK('veil'),x,z}])));}
 add('a cairn off the trail',HCHK.cairns(CLOUD.cairns.concat([{x:2000,z:-2000,culture:'throne-natives'}])));
 {const C=counts(THRONE.TREES);C[SPK('veil')]=0;add('a species never placed',HCHK.placed(C));}
 {const p=TRAILS[0].pts[Math.floor(TRAILS[0].pts.length/2)];add('a tree on the trail',HCHK.paths([{x:p[0],z:p[1]}]));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 {const Pl=POOLS[0];add('a plant on a pool\'s floor',HCHK.dry([[Pl.x,Pl.level-2,Pl.z,'biome:fern']]));}
 {const Pl=POOLS[0];add('a camera under a pool',HCHK.camerasOut([{view:'under',x:Pl.x,y:Pl.level-1,z:Pl.z}]));}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-cloudforest',title:'Krator biome — the Throne: the cloud forest',
 hint:"The Throne, station 5: the cloud forest, the windward cloud belt ~3 km up the west flank (Cfb, the cloud most days). The elfin woods: gnarled, dwarfed trees cushioned and hung with moss, tree ferns, bromeliads in the forks, a floor of moss and ferns; the veil trees (Krator's own) combing the water from the cloud, their veils glowing at night; the ravine of the falls stepping down in four falls into plunge pools; the old rift ridge with the cloud pouring over its crest onto the drier heath beyond; the natives' trail and its cairns over the saddle (ideal type) · the weather picker: fog, drizzle, a clear spell · N night",
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
 biome:()=>window._biome,cloud:()=>CLOUD,falls:()=>FALLS,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W.mode;},
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
