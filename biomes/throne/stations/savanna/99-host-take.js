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
// the savanna's places (45, 47, 86): a point and an aim
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const VMODE={};
const BB=SAV.boulders.slice().sort((a,b)=>b.s-a.s)[0]||{x:FAN.cx(0),z:0,s:2},PL=POOLS[2]||POOLS[0],KJ=KOPJES[0];
const VIEWS={
 'The savanna':(function(){const x=-900,z=500;return[x,gh(x,z,1.7),z,x+60,gh(x+60,z-600,30),z-600];})(),
 'Star aloes in the grass':(function(){const T=nearTree('staraloe',-900,-300,4);return atTree(T,T.crownR*2.5+5,rr(0,TAU),1.6,.5);})(),
 'The gill-parasol woods':(function(){const T=nearTree('gillparasol',-900,-300,10);return atTree(T,T.crownR*1.6+8,rr(0,TAU),1.8,.7);})(),
 'Stilt parasols along the channels':(function(){const T=nearTree('stilt',FAN.cx(0),0,10);return atTree(T,T.crownR*3+22,rr(0,TAU),3,.55);})(),
 'The braided channels':(function(){const z=-300,x=FAN.cx(z)-FAN.W(z)*1.3;return[x,gh(x,z,70),z+250,FAN.cx(z),gh(FAN.cx(z),z,0),z];})(),
 'A dry-season pool':toward(PL.x+20,PL.z-12,PL.x,PL.z,22,2.5,0),
 'A lahar boulder':toward(BB.x+12,BB.z+8,BB.x,BB.z,BB.s*4+4,1.8,BB.s*.4),
 'A kopje':toward(KJ.x+KJ.r*2,KJ.z+KJ.r,KJ.x,KJ.z,KJ.r*2.4,3,KJ.h*.5),
 'The fresh burn':(function(){const x=BURN.x-BURN.rx*.4,z=BURN.z+BURN.rz*.5;return toward(x-40,z+30,BURN.x,BURN.z,160,3,2);})(),
 'Frill-trees and a trumpet tree':(function(){const T=nearTree('trumpet',-900,500,8);return atTree(T,T.crownR*3+10,rr(0,TAU),1.8,.55);})(),
 'The mountain from the savanna':(function(){const x=200,z=2300;return[x,gh(x,z,8),z,x,gh(x,z,8)+900,z-8000];})(),
 'Night: the savanna':(function(){const x=-900,z=500;return[x,gh(x,z,1.7),z,x+60,gh(x+60,z-600,30),z-600];})(),
 'From above':[-2400,1900,2600,0,900,-200],
};
VMODE['Night: the savanna']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.kopje!=null?'a kopje':best2&&best2.pool?'a dry-season pool':best2&&best2.boulders?'the lahar\'s boulders':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const gr='old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+(FIELD.burn(p.x,p.z)>.5?' · a fresh burn':FIELD.fan(p.x,p.z)>.5?' · the lahar fan':FIELD.capwood(p.x,p.z)>.5?' · the gill-parasol woods':FIELD.savanna(p.x,p.z)>.5?' · the tall grass':FIELD.rock(p.x,p.z)>.5?' · rock':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 // the stilt parasols stand along the fan's channels
 stilts(T){const S=T.filter(t=>KEYOF(t)==='stilt'),off=S.filter(t=>FIELD.braid(t.x,t.z)<.3);return{ok:S.length>=30&&off.length<=S.length*.1,detail:S.length+' stilt parasols, '+off.length+' off the fan'};},
 // the gill-parasols make the woods; the star aloes stand in the grass
 woods(T){const G=T.filter(t=>KEYOF(t)==='gillparasol'),gin=G.filter(t=>FIELD.capwood(t.x,t.z)>.3),A=T.filter(t=>KEYOF(t)==='staraloe'),ain=A.filter(t=>FIELD.savanna(t.x,t.z)>.3);
  return{ok:G.length>=40&&gin.length>=G.length*.85&&A.length>=100&&ain.length>=A.length*.85,detail:gin.length+' of '+G.length+' gill-parasols in the woods; '+ain.length+' of '+A.length+' star aloes in the grass'};},
 // the burn has fewer trees for its size than the grass round it
 burn(T){const inB=T.filter(t=>FIELD.burn(t.x,t.z)>.6).length,area=Math.PI*BURN.rx*BURN.rz*.8,ring=T.filter(t=>{const d=Math.hypot((t.x-BURN.x)/BURN.rx,(t.z-BURN.z)/BURN.rz);return d>1.2&&d<1.9&&FIELD.fan(t.x,t.z)<.3;}).length,ringA=Math.PI*BURN.rx*BURN.rz*(1.9*1.9-1.2*1.2)*.7;
  const a=inB/area,b=ring/ringA;return{ok:b>0&&a<b*.75,detail:(a*1e4).toFixed(2)+' trees a hectare on the burn, '+(b*1e4).toFixed(2)+' round it'};},
 // the lahar's boulders lie on the fan
 boulders(B){const bad=B.filter(b=>fanIn(b.x,b.z)<.6);return{ok:B.length>=60&&!bad.length,detail:(bad.length?bad.length+' off the fan; ':'')+B.length+' lahar boulders'};},
 placed(C){const here=THRONE.SPECIES.filter(S=>['stilt','gillparasol','staraloe','trumpet','ruff'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),waterH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the ground or the water: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the stilt parasols stand along the channels',HCHK.stilts(THRONE.TREES));
 add('gill-parasols in the woods, star aloes in the grass',HCHK.woods(THRONE.TREES));
 add('the burn is barer than the grass round it',HCHK.burn(THRONE.TREES));
 add('the lahar\'s boulders lie on the fan',HCHK.boulders(SAV.boulders));
 add('every species of the savanna placed',HCHK.placed(counts(THRONE.TREES)));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('nothing rooted under the water',HCHK.dry(P));
 add('preset cameras clear of ground and water',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('stilt parasols out in the grass',HCHK.stilts(THRONE.TREES.concat(Array.from({length:600},(_,i)=>({sp:SPK("stilt"),x:-1800,z:-2400+i*4})))));
 add('gill-parasols out in the grass',HCHK.woods(THRONE.TREES.map(t=>KEYOF(t)==='gillparasol'?Object.assign({},t,{x:FAN.cx(t.z)}):t)));
 add('a burn as thick as the grass',HCHK.burn(THRONE.TREES.concat(Array.from({length:3000},(_,i)=>({sp:0,x:BURN.x+(i%60-30)*12,z:BURN.z+(Math.floor(i/60)-25)*12})))));
 add('a boulder off the fan',HCHK.boulders(SAV.boulders.concat([{x:-2000,z:-2000,s:2}])));
 {const C=counts(THRONE.TREES);C[SPK('stilt')]=0;add('a species never placed',HCHK.placed(C));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 {const Pl=POOLS[0];add('a plant on a pool\'s floor',HCHK.dry([[Pl.x,Pl.level-2,Pl.z,'biome:fern']]));}
 {const Pl=POOLS[0];add('a camera under a pool',HCHK.camerasOut([{view:'under',x:Pl.x,y:Pl.level-1.5,z:Pl.z}]));}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-savanna',title:'Krator biome — the Throne: the savanna',
 hint:"The Throne, station 6: the south-flank savanna, ~1 km up (Aw/BSh, the dry season). Tall yellow grass with star aloes, frill-trees and trumpet trees (Krator's familiar crossers); gill-parasol woods on the older ground; a lahar fan down the middle, its braided channels dry but for their pools, stilt parasols along them, lahar boulders the size of huts; a fresh burn with the first green and the fire flowers; kopjes of old basalt; dongas (ideal type) · N night",
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
 biome:()=>window._biome,savanna:()=>SAV,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
