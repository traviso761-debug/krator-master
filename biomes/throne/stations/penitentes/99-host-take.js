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
// a point on a tread: walk upslope from (x, z) to the first place the field 'pen' is high
const onPen=(x,z)=>{for(let k=0;k<60;k++){if(FIELD.pen(x-k*10,z)>.5)return[x-k*10,z];}return[PEN.x,PEN.z];};
const VIEWS={
 'Penitentes on a tread':(function(){const b=PEN;return[b.x+40,gh(b.x+40,b.z,7),b.z+25,b.x-60,gh(b.x-60,b.z,1),b.z-10];})(),   /* over the blades' tops, across the field */
 /* among the blades: a spot near the patch with no blade within 1.8 m (the eye check) */
 'Among the blades':(function(){const P=[];{const m=new THREE.Matrix4(),v=new THREE.Vector3();scene.traverse(M=>{if(M.isInstancedMesh&&M.name==='biome:penitente')for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);v.setFromMatrixPosition(m);P.push([v.x,v.z]);}});}
  for(let k=0;k<400;k++){const x=PEN.x+((k*37)%41-20)*1.1,z=PEN.z+((k*53)%39-19)*1.1;if(!P.some(q=>Math.hypot(q[0]-x,q[1]-z)<1.8))return[x,gh(x,z,1.6),z,x-12,gh(x-12,z,1.2),z-2];}
  const b=PEN;return[b.x+14,gh(b.x+14,b.z,4),b.z+5,b.x-25,gh(b.x-25,b.z,1),b.z-4];})(),
 'Up the benches to the summit':across(1700,300,Math.PI,1600,4,40),
 'Down the flank to the tundra':across(-1200,-200,0,2400,8,-20),
 'A rock step':(function(){let x=-200,z=600;for(let k=0;k<80;k++){if(benchAt(x-k*6,z).riser>.6){x-=k*6;break;}}return[x+90,gh(x+90,z,3),z+30,x,gh(x,z,25),z];})(),
 'The snowline':across(1500,-900,.3,900,6,2),
 'Blowing snow':(function(){const b=onPen(400,-600);return[b[0]+30,gh(b[0]+30,b[1],2),b[1],b[0]-300,gh(b[0]-300,b[1],10),b[1]];})(),
 'Night: the penitentes under the ring':(function(){const b=PEN;return[b.x+20,gh(b.x+20,b.z,2),b.z+8,b.x-60,gh(b.x-60,b.z,6),b.z];})(),
 'From above':[2400,terrainH(2400,1800)+900,1800,-200,terrainH(-200,0),0],
};
VMODE['Night: the penitentes under the ring']='night';
VWEATHER['Blowing snow']='blizzard';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};   // the host's onView: the preset's light and weather// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.rim?'a rock step (an old flow\'s front)':best2&&best2.tundra?'the tundra under the snowline':best2&&best2.plateau?'the benches of the east flank (~0.8 atm)':S||isItem?'the Throne · '+(tg&&tg.origin==='native'?'Krator\'s own (native)':tg&&tg.origin==='krator'?'a crater standby':tg&&tg.origin==='earth'?'Earth\'s descendant':'ice and snow'):'terrain';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(FIELD.pen(p.x,p.z)>.4?'penitentes on a tread':FIELD.rim(p.x,p.z)>.4?'a rock step':FIELD.snow(p.x,p.z)<.2?'the tundra':'snow on a tread')+' · snow '+Math.round(FIELD.snow(p.x,p.z)*100)+'% · '+Math.round(terrainH(p.x,p.z))+' m'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
const LIFE=['lichen','mossclump','mat','cushion'];
const HCHK={
 // nothing lives here but lichen and the warm ground's life: no trees, and every plant one of the hardy few (or a glow mushroom)
 lifeless(T,P){const bad=P.filter(p=>/^biome:/.test(p[3])&&LIFE.indexOf(p[3].slice(6))<0&&!/^biome:(glowshroom|penitente|icetower|boulder|stone|ventcone)/.test(p[3]));
  return{ok:!T.length&&!bad.length,detail:T.length+bad.length?(T.length+' trees, '+bad.length+' other plants ('+[...new Set(bad.map(p=>p[3]))].slice(0,4).join(', ')+')'):'no trees; only lichen, moss, the mat and glow mushrooms'};},
 // the penitentes stand on the treads' snow, in their rows, none on a rock step or below the snowline
 pens(P){const pen=P.filter(p=>p[3]==='biome:penitente'),bad=pen.filter(p=>FIELD.pen(p[0],p[2])<.15||benchAt(p[0],p[2]).riser>.5);
  return{ok:pen.length>2000&&!bad.length,detail:pen.length+' penitentes'+(bad.length?', '+bad.length+' off the treads (first at '+[bad[0][0]|0,bad[0][2]|0]+')':', all on the treads\' snow')};}, weather(W,U){const ok=!!W&&['snowfall','blizzard'].every(m=>W.MODES.indexOf(m)>=0)&&!!U&&!!U.snow;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no snow or no ash'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('nothing lives here but the hardiest few',HCHK.lifeless(THRONE.TREES,P));
 add('the penitentes on the treads\' snow',HCHK.pens(P));
 add('the snow (core/atmos, opt-in) is here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a tree on the benches',HCHK.lifeless([{sp:SPK('ashpine'),x:0,z:0}],[]));
 add('a fern up here',HCHK.lifeless([],[[0,0,0,'biome:fern']]));
 {let x=0,z=0;for(let k=0;k<400;k++){if(benchAt(k*6-1200,0).riser>.8){x=k*6-1200;break;}}add('a penitente on a rock step',HCHK.pens(instPoints().filter(p=>p[3]==='biome:penitente').concat([[x,terrainH(x,z),z,'biome:penitente']])));}
 add('a weather without the snow',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES.filter(m=>m!=='blizzard'&&m!=='snowfall')}),ATMOS.U));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'throne-penitentes',title:'Krator biome — the Throne: the lee\'s penitentes',
 hint:"The Throne, station 14: the lee's penitentes on the east flank under the summit, ~5.4 km up (~0.8 atm, dry). Benches of old flows step down the flank: on each tread the snow sublimates under a hard sun into penitentes, blades 1-4 m tall in rows east-west; between them the flows' fronts stand as rock steps; at the map's foot the snow gives out on the tundra (ideal type) · weather: snow · N night",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:LCTL,keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,pens:()=>PENS,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
