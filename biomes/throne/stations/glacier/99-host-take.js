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
// a point across the glacier: u down it, a from its centre line (metres)
const gp=(u,a)=>upAt(u,GL.pg(u)+a);
const VIEWS={
 'The glacier':(function(){const a=gp(560,-(GL.W(560)+40)),b=gp(1450,0);return[a[0],gh(a[0],a[1],5),a[1],b[0],gh(b[0],b[1],10),b[1]];})(),
 'The icefall':(function(){const a=gp(1180,-(GL.W(1180)+36)),b=gp(1560,40);return[a[0],gh(a[0],a[1],6),a[1],b[0],gh(b[0],b[1],10),b[1]];})(),
 'Crevasses and dirt bands':(function(){const a=gp(980,GL.W(980)*.55),b=gp(560,GL.W(560)*.1);return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],0),b[1]];})(),
 'The snout and the lake':(function(){const a=upAt(termU(TERM.p0-90)+4,TERM.p0-90),b=upAt(GL.SNOUT+30,TERM.p0);return[a[0],gh(a[0],a[1],4),a[1],b[0],LAKE.level+14,b[1]];})(),
 'Icebergs':(function(){const a=upAt(GL.SNOUT-170,TERM.p0+TERM.W0*.95),b=upAt(GL.SNOUT-40,TERM.p0+40);return[a[0],Math.max(gh(a[0],a[1],2.2),LAKE.level+2.2),a[1],b[0],LAKE.level+3,b[1]];})(),
 'The outwash':(function(){const u=-1250,a=upAt(u,riverC(u)+40),b=upAt(-1850,riverC(-1850));return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],0),b[1]];})(),
 'Gill-corals by the river':(function(){const u=-1500,c=upAt(u,riverC(u)+22),t=upAt(u-140,riverC(u-140));return[c[0],gh(c[0],c[1],1.8),c[1],t[0],gh(t[0],t[1],3),t[1]];})(),
 'Glass willows at the treeline':(function(){const c=upAt(-950,riverC(-950)-300),T=nearTree('glasswillow',c[0],c[1],6);return atTree(T,T.crownR*2.6+6,Math.atan2(UP[1],UP[0])+.4,1.8,.5);})(),
 'The cold belt':(function(){const u=-1950,a=upAt(u,riverC(u)-240),b=upAt(-2150,riverC(-2150)-420);return[a[0],gh(a[0],a[1],1.8),a[1],b[0],gh(b[0],b[1],6),b[1]];})(),
 'Gill-coral trees in the snow':(function(){const c=upAt(-2000,riverC(-2000)-320),T=nearTree('gillcoral',c[0],c[1],10);return atTree(T,T.crownR*3+10,Math.atan2(UP[1],UP[0])+.6,1.8,.6);})(),
 'The geothermal shelf':(function(){const a=upAt(SHELF.u-SHELF.r*.55,SHELF.p-SHELF.r*.55);return[a[0],gh(a[0],a[1],22),a[1],SHELF.x,gh(SHELF.x,SHELF.z,2),SHELF.z];})(),
 'Ice towers':(function(){const T=TOWERS.reduce((b,t)=>t.h>b.h?t:b,TOWERS[0]),a=rr(0,TAU),cx=T.x+Math.cos(a)*(T.h*1.6+8),cz=T.z+Math.sin(a)*(T.h*1.6+8);return[cx,gh(cx,cz,1.8),cz,T.x,gh(T.x,T.z,T.h*.55),T.z];})(),
 'An ice cave':(function(){const C=CAVES[2],cx=C.x+Math.cos(C.face)*C.R*2.3,cz=C.z+Math.sin(C.face)*C.R*2.3;return[cx,gh(cx,cz,1.8),cz,C.x,C.floor+C.H*.3,C.z];})(),
 'Inside an ice cave':(function(){const C=CAVES[2],cx=C.x+Math.cos(C.face)*C.R*.7,cz=C.z+Math.sin(C.face)*C.R*.7,tx=C.x-Math.cos(C.face)*C.R*.6,tz=C.z-Math.sin(C.face)*C.R*.6;return[cx,C.floor+1.7,cz,tx,C.floor+1.2,tz];})(),
 'An ice cave at night':(function(){const C=CAVES[0],cx=C.x+Math.cos(C.face)*C.R*1.6,cz=C.z+Math.sin(C.face)*C.R*1.6;return[cx,gh(cx,cz,1.8),cz,C.x,C.floor+C.H*.25,C.z];})(),
 'The ice arch':(function(){const a=ARCH.a+Math.PI/2,cx=ARCH.x+Math.cos(a)*ARCH.span*1.6,cz=ARCH.z+Math.sin(a)*ARCH.span*1.6;return[cx,gh(cx,cz,2),cz,ARCH.x,gh(ARCH.x,ARCH.z,ARCH.rise*.5),ARCH.z];})(),
 'Snowfall':(function(){const a=gp(560,-(GL.W(560)+40)),b=gp(1450,0);return[a[0],gh(a[0],a[1],5),a[1],b[0],gh(b[0],b[1],10),b[1]];})(),
 'The blizzard':(function(){const a=gp(300,-(GL.W(300)+40)),b=gp(700,0);return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],4),b[1]];})(),
 'From above':(function(){const c=upAt(-1300,-1700),t=upAt(500,GL.pg(500));return[c[0],PROF(500)+1500,c[1],t[0],PROF(500)-60,t[1]];})(),
};
VMODE['An ice cave at night']='night';
VWEATHER['Snowfall']='snowfall';VWEATHER['The blizzard']='blizzard';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.cave!=null?'an ice cave: warm inside (the steam), Krator\'s own life on its floor':best2&&best2.arch?'ice (frozen steam)':best2&&best2.icefall?'the icefall: seracs and crevasses':best2&&best2.glacier?'glacier ice':best2&&best2.lake?'the lake: meltwater, milky with rock flour':best2&&best2.river?'the meltwater river':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(iceAt(p.x,p.z)>.5?'the glacier ('+Math.round(iceAt(p.x,p.z))+' m of ice)':FIELD.lake(p.x,p.z)>.5?'the lake':FIELD.river(p.x,p.z)>.5?'the river':FIELD.warm(p.x,p.z)>.4?'warm ground (the fumaroles)':FIELD.moraine(p.x,p.z)>.5?'a moraine':FIELD.cbelt(p.x,p.z)>.4?'the cold belt':'the flank')+' · snow '+Math.round(FIELD.snow(p.x,p.z)*100)+'%'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 // the cold belt: its conifers and its gill-coral trees placed; of the kit's others none (the shoulder and plume woods stand down)
 placed(C){const here=['ashpine','gillcoral','glasswillow'].map(k=>THRONE.byKey[k]),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key),other=THRONE.SPECIES.filter(S=>here.indexOf(S)<0&&C[S.i]>0).map(S=>S.key);
  return{ok:!zero.length&&!other.length,detail:(zero.length?'never placed: '+zero.join(', ')+'; ':'')+(other.length?'out of place: '+other.join(', ')+'; ':'')+here.map(S=>S.key+' '+C[S.i]).join(', ')};},
 // nothing roots on the ice (the host's seracs, towers and bergs are ice themselves)
 ice(T,P){const own=['biome:serac','biome:icetower'],bt=T.filter(t=>iceAt(t.x,t.z)>1).length,bp=P.filter(p=>iceAt(p[0],p[2])>1&&own.indexOf(p[3])<0).length;
  return{ok:!bt&&!bp,detail:bt+bp?(bt+' trees and '+bp+' plants on the ice'):'nothing grows on the glacier'};},
 // every ice cave warm and alive inside
 caves(L){const poor=L.filter(c=>c.life<20);return{ok:L.length>=3&&!poor.length,detail:L.length+' caves, life '+L.map(c=>c.life).join(', ')};},
 // the river runs DOWN the flank from the breach (its water surface never climbs more than a metre along its course)
 river(H){let up=0;for(let i=1;i<H.length;i++)if(H[i]>H[i-1]+1)up++;return{ok:H.length>20&&!up,detail:up?up+' stretches running uphill':'falls '+Math.round(H[0]-H[H.length-1])+' m over its course'};},
 caps(L){let bad=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(Math.abs(a.x-b.x)>a.s+b.s||Math.abs(a.z-b.z)>a.s+b.s)continue;
   if(Math.hypot(a.x-b.x,a.z-b.z)<(a.s+b.s)*.9&&a.y0<b.y1&&b.y0<a.y1)bad++;}   // their footprints and their heights overlap
  return{ok:L.length>50&&!bad,detail:bad?bad+' pairs of gill-coral caps clipping':L.length+' caps, none clipping'};},
 weather(W,U){const ok=!!W&&W.MODES.indexOf('snowfall')>=0&&W.MODES.indexOf('blizzard')>=0&&typeof W.snow==='number'&&!!U&&!!U.snow;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no snow weather'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},THRONE.SPECIES.map(()=>0));
const capList=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();scene.traverse(M=>{if(!M.isInstancedMesh||M.name!=='biome:gcoral')return;
 for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,s);if(p.y>terrainH(p.x,p.z)+2)o.push({x:p.x,y:p.y,z:p.z,s:s.x,y0:p.y+.44*s.y,y1:p.y+1.05*s.y});}});return o;};   // y0..y1 the cap's own height (its lathe runs .44..1 of its scale)
const riverProfile=()=>{const H=[];for(let u=BREACH_U;u>-TERR.R;u-=25){const c=upAt(u,riverC(u)),w=waterH(c[0],c[1]);if(w>-1e8)H.push(w);}return H;};   // the water's own surface, as the page reads it
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the cold belt\'s trees placed, and only they',HCHK.placed(counts(THRONE.TREES)));
 add('nothing grows on the ice',HCHK.ice(THRONE.TREES,P));
 add('every ice cave warm and alive inside',HCHK.caves(GLACIER.caves));
 add('the river runs down the flank',HCHK.river(riverProfile()));
 add('no gill-coral cap clips another',HCHK.caps(capList()));
 add('the snow weather (core/atmos, opt-in) is here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),c=upAt(900,GL.pg(900));
 {const C=counts(THRONE.TREES);C[SPK('gillcoral')]=0;add('no gill-coral trees',HCHK.placed(C));}
 {const C=counts(THRONE.TREES);C[SPK('pagoda')]=3;add('a pagoda cap in the snow',HCHK.placed(C));}
 add('a plant on the ice',HCHK.ice(THRONE.TREES,[[c[0],terrainH(c[0],c[1]),c[1],'biome:fern']]));
 add('a dead cave',HCHK.caves(GLACIER.caves.map((x,i)=>i?x:Object.assign({},x,{life:0}))));
 add('a river running uphill',HCHK.river(riverProfile().reverse()));
 {const L=capList();add('two caps in one place',HCHK.caps(L.concat([Object.assign({},L[0],{x:L[0].x+.5,y0:L[0].y0+.2,y1:L[0].y1+.2})])));}
 add('a weather without the snow',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES}),ATMOS.U));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-glacier',title:'Krator biome — the Throne: the glacier',
 hint:"The Throne, station 9: the glacier and its ice caves, the north-west flank ~5.6-6.5 km up, ~60 km from the vent (the summit plateau's snowfield in the south-east). A valley glacier: snow on its upper basin, the icefall's seracs and crevasses, bare ice with dirt bands and a medial moraine, an ice cliff calving into a milky proglacial lake; lateral and terminal moraines; the meltwater river braiding down the flank; low down the cold belt: conifers and gill-coral trees in the snow. Beside the ice a geothermal shelf: ice towers of frozen steam round the fumaroles, ice caves the steam has hollowed (warm inside: Krator's own life), an ice arch (ideal type) · weather: snowfall, the blizzard (and the rest) · N night",
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
 biome:()=>window._biome,glacier:()=>GLACIER,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
