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
const H0=HILLS[0],Y0=YARDANGS[0]||{x:-900,z:-900,h:8,len:150},TT=k=>nearTree(k,0,0,3);
const VIEWS={
 'The ash desert':(function(){const x=-200,z=200;return[x,gh(x,z,1.7),z,x+500,gh(x+500,z+500,8),z+500];})(),
 'Pagoda caps in the ash':(function(){const T=TT('pagoda');return atTree(T,T.crownR*3+12,rr(0,TAU),1.8,.6);})(),
 'The ash dunes':(function(){const x=800,z=800;return[x-60,gh(x-60,z-60,6),z-60,x+300,gh(x+300,z+300,0),z+300];})(),
 'A yardang':toward(Y0.x-UP[0]*Y0.len*1.6,Y0.z-UP[1]*Y0.len*1.6,Y0.x,Y0.z,Y0.len*1.4,2,Y0.h*.4),
 'Striped rhyolite hills':toward(H0.x+H0.r*1.6,H0.z+H0.r*.4,H0.x,H0.z,H0.r*2,4,H0.h*.5),
 'Soot cups and stalk daisies':(function(){const x=H0.x+H0.r*.55,z=H0.z+H0.r*.1;return toward(x+14,z+6,x,z,12,1.6,.4);})(),
 'A drizzle trumpet':(function(){const T=TT('drizzle');return atTree(T,T.crownR*2.2+5,rr(0,TAU),1.8,.6);})(),
 'The CO2 hollow':toward(HOLLOW.x+HOLLOW.r*2.2,HOLLOW.z+HOLLOW.r*.8,HOLLOW.x,HOLLOW.z,HOLLOW.r*2.3,4,-HOLLOW.depth*.6),
 'Lamp caps at night':(function(){const T=TT('lampcap');return atTree(T,6,rr(0,TAU),1.4,.5);})(),
 'The ash storm':(function(){const x=-200,z=200;return[x,gh(x,z,1.7),z,x+500,gh(x+500,z+500,8),z+500];})(),
 'Lightning in the plume':(function(){const x=-200,z=200;return[x,gh(x,z,3),z,x+300,gh(x,z,3)+260,z+500];})(),
 'The plume overhead':(function(){const x=0,z=0;return[x,gh(x,z,2),z,x+120,gh(x,z,2)+260,z+120];})(),
 'From above':[-2600,3600,2600,200,2150,-200],
};
VMODE['Lamp caps at night']='night';VMODE['Lightning in the plume']='night';
VWEATHER['The ash storm']='ash';VWEATHER['Lightning in the plume']='ash';VWEATHER['From above']='clear';VWEATHER['The plume overhead']='ashfall';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'ashfall';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.hollow?'a CO2 hollow: do not go down into it':best2&&best2.bones?'bones (the hollow\'s dead)':best2&&best2.hill!=null?'rhyolite':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+(FIELD.hollow(p.x,p.z)>.5?' · the hollow (CO2)':FIELD.dune(p.x,p.z)>.5?' · ash dunes':FIELD.hill(p.x,p.z)>.5?' · rhyolite':FIELD.yard(p.x,p.z)>.5?' · a yardang':' · ash, '+Math.round(FIELD.ash(p.x,p.z)*100)+'% deep')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 // Krator's own life holds the plume's ground: its trees native, of Earth's none (only the hardiest grasses, lichen, rats, birds)
 native(T){const earth=T.filter(t=>THRONE.SPECIES[t.sp].tags.origin==='earth'),pag=T.filter(t=>KEYOF(t)==='pagoda').length;
  return{ok:pag>=30&&!earth.length,detail:(earth.length?earth.length+' Earth trees under the plume ('+[...new Set(earth.map(KEYOF))].join(', ')+'); ':'')+pag+' pagoda caps, '+T.length+' trees'};},
 // nothing lives in the CO2 hollow: no tree, no plant on its floor
 hollow(T,P){const r=HOLLOW.r*.85,bt=T.filter(t=>Math.hypot(t.x-HOLLOW.x,t.z-HOLLOW.z)<r),bp=P.filter(p=>Math.hypot(p[0]-HOLLOW.x,p[2]-HOLLOW.z)<r);
  return{ok:!bt.length&&!bp.length,detail:bt.length+bp.length?(bt.length+' trees and '+bp.length+' plants in the hollow'):'the hollow is dead: nothing grows on its floor'};},
 // the ash weather is the shared module's, opt-in: its two modes are offered here, its state and uniform answer
 ashWeather(W,U){const ok=!!W&&W.MODES.indexOf('ash')>=0&&W.MODES.indexOf('ashfall')>=0&&typeof W.ash==='number'&&!!U&&!!U.ash;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+'; ash now '+W.ash.toFixed(2)+' ('+W.mode+')':'no ash weather'};},
 placed(C){const here=THRONE.SPECIES.filter(S=>['pagoda','drizzle','ropepuff','lampcap'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('Krator\'s own life holds the plume\'s ground',HCHK.native(THRONE.TREES));
 add('nothing lives in the CO2 hollow',HCHK.hollow(THRONE.TREES,P));
 add('the ash weather (core/atmos, opt-in) is here',HCHK.ashWeather(ATMOS.W,ATMOS.U));
 add('every species of the ash desert placed',HCHK.placed(counts(THRONE.TREES)));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a lehua under the plume',HCHK.native(THRONE.TREES.concat([{sp:SPK('lehua'),x:0,z:0}])));
 add('a plant in the hollow',HCHK.hollow(THRONE.TREES,[[HOLLOW.x,terrainH(HOLLOW.x,HOLLOW.z),HOLLOW.z,'biome:fern']]));
 add('a weather without the ash',HCHK.ashWeather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES}),ATMOS.U));
 {const C=counts(THRONE.TREES);C[SPK('pagoda')]=0;add('a species never placed',HCHK.placed(C));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-ashdesert',title:'Krator biome — the Throne: the ash desert',
 hint:"The Throne, station 7: deep under the plume, the ash desert, ~2.2 km up the south-east flank (the plume's ceiling overhead, ash falling most days). Krator's own life: pagoda caps standing in the ash, ash creepers, drizzle trumpets, rope-trees, lamp caps glowing at night, soot cups and stalk daisies on the striped rhyolite hills; of Earth's only the hardiest. Ash dunes, wind-carved yardangs, old lava scoured bare, a CO2 hollow with the mat on its floor and bones on its rim (ideal type) · the weather picker: ashfall, the ash storm (and the rest) · N night",
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
 biome:()=>window._biome,ash:()=>ASH,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
