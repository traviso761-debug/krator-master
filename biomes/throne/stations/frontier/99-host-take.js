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
// the frame of the shore (45): u up the flank, p along it; a point and an aim in it
const UAZ=Math.atan2(UP[1],UP[0]),DAZ=Math.atan2(DN[1],DN[0]),PAZ=Math.atan2(PERP[1],PERP[0]);
const at2=(u,p)=>xzOf(u,p);
const F0=FIELDS[1],FC0=FIELDS[5],T0=TRAILS[1],TP=FRONTIER.traps.find(t=>t.kind==='punji')||{x:0,z:0},TS=FRONTIER.traps.find(t=>t.kind==='snare')||{x:0,z:0};
const ST=FRONTIER.stumps.slice().sort((a,b)=>b.r-a.r)[0]||{x:0,z:0,r:4,h:2};
const VMODE={};
const VIEWS={
 'The frontier from the forest':(function(){const c=at2(F0.u[1]+120,F0.cp);return[c[0],gh(c[0],c[1],35),c[1],F0.x,gh(F0.x,F0.z,0),F0.z];})(),
 'Spice terraces':(function(){const c=at2(F0.cu,F0.p[0]-25);const t=at2(F0.cu-20,F0.cp);return[c[0],gh(c[0],c[1],5),c[1],t[0],gh(t[0],t[1],2),t[1]];})(),
 'A planted Ranj tree (no resin)':(function(){const r=FRONTIER.rows.filter(r=>BIO.lodD(r.x,r.z)<200&&r.H>6)[0]||FRONTIER.rows[0];return[r.x+5,gh(r.x,r.z,3.5),r.z+4,r.x,gh(r.x,r.z,3),r.z];})(),
 'A fresh clearing':(function(){const c=at2(FC0.u[0]-10,FC0.cp);const t=at2(FC0.cu,FC0.cp);return[c[0],gh(c[0],c[1],6),c[1],t[0],gh(t[0],t[1],3),t[1]];})(),
 'A felled hypertree':[ST.x+ST.r*2.6,gh(ST.x,ST.z,ST.h+4),ST.z+ST.r*1.8,ST.x,gh(ST.x,ST.z,ST.h*.5),ST.z],
 'A native trail out of the forest':(function(){const P=T0.pts,a=P[Math.floor(P.length*.62)],b=P[Math.floor(P.length*.75)];return[a[0],gh(a[0],a[1],1.7),a[1],b[0],gh(b[0],b[1],1),b[1]];})(),
 'A punji pit':[TP.x+2.4,gh(TP.x,TP.z,2.2),TP.z+1.6,TP.x,gh(TP.x,TP.z,0),TP.z],
 'A snare':[TS.x+2.6,gh(TS.x,TS.z,1.5),TS.z+2,TS.x,gh(TS.x,TS.z,.8),TS.z],
 'The poison garden at the forest\'s edge':(function(){const c=at2(F0.u[1]+28,F0.cp+80);return across(c[0],c[1],PAZ,40,1.6,1);})(),
 'Zey\'danin\'s footprint and the bay':(function(){const c=at2(CITY.u+520,CITY.p-180);return[c[0],gh(c[0],c[1],60),c[1],CITY.x,gh(CITY.x,CITY.z,0),CITY.z];})(),
 'The shore and the headland':(function(){const c=at2(shoreU(900)+30,700);const t=at2(shoreU(1480)-40,1480);return[c[0],Math.max(gh(c[0],c[1],4),SEA+4),c[1],t[0],SEA+8,t[1]];})(),
 'A lahar valley':(function(){const V=VALLEYS[0],u=-200,c=at2(u,V.p+V.amp*Math.sin(u*V.f+V.ph));return across(c[0],c[1],DAZ,300,6,1);})(),
 'The road up the spur':(function(){const a=ROAD.pts[6],b=ROAD.pts[14];return[a[0],gh(a[0],a[1],2.5),a[1],b[0],gh(b[0],b[1],1.5),b[1]];})(),
 'From the sea':(function(){const c=at2(shoreU(-260)-900,-260);return[c[0],SEA+60,c[1],CITY.x,gh(CITY.x,CITY.z,40),CITY.z];})(),
 'Night: the frontier':(function(){const c=at2(F0.u[1]+120,F0.cp);return[c[0],gh(c[0],c[1],35),c[1],F0.x,gh(F0.x,F0.z,0),F0.z];})(),
};
VMODE['Night: the frontier']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.trap?'a trap · the Throne\'s natives (culture throne-natives)':best2&&(best2.field!=null||best2.city)?'the colonists\' frontier (Voth)':kit==='hyperjungle'?'flora · the hyperjungle (the forest)':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nground: '+gr+(FIELD.owned(p.x,p.z)>.5?' · forest':FIELD.field(p.x,p.z)>.5?' · plantation':FIELD.clear(p.x,p.z)>.5?' · clearing':FIELD.edge(p.x,p.z)>.5?' · forest edge':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:24000000,calls:260},   // two kits on one page: a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:16000000,host:900000},
 type:{'throne/trees':'pass','throne/floor':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native'],LIVES=['shoulder','seam','plume','vent','windward'];
const KEY=t=>THRONE.SPECIES[t.sp].key;
const fieldOf=(x,z)=>{const u=uOf(x,z),p=pOf(x,z);for(const F of FIELDS)if(fieldIn(u,p,F)>.5)return F;return null;};
const HCHK={
 // the plantations are planted: every planted (non-clear) field has rows, every row tree stands in its field
 rows(R){const planted=FIELDS.filter(F=>F.kind!=='clear'),empty=planted.filter(F=>!R.some(r=>r.field===F.i)),out=R.filter(r=>{const F=fieldOf(r.x,r.z);return !F||F.i!==r.field;});
  return{ok:R.length>200&&!empty.length&&!out.length,detail:(empty.length?empty.length+' planted fields with no rows; ':'')+(out.length?out.length+' row trees outside their field; ':'')+R.length+' planted Ranj trees in '+planted.length+' fields'};},
 // and they bear no resin (the tree's fungus has not taken in them): no resin drop within a planted row tree's crown
 noResin(R,resin){const bad=resin.filter(p=>R.some(r=>Math.hypot(p[0]-r.x,p[2]-r.z)<2.5));
  return{ok:!bad.length,detail:bad.length?bad.length+' resin drops on planted trees':'no resin on any planted tree ('+resin.length+' drops elsewhere)'};},
 // the clearings are cleared: stumps in each, no living tree of either kit standing in one
 clearings(S,T,J){const clear=FIELDS.filter(F=>F.kind==='clear'),noStump=clear.filter(F=>!S.some(s=>fieldOf(s.x,s.z)===F)),bad=T.concat(J).filter(t=>{const F=fieldOf(t.x,t.z);return F&&F.kind==='clear';});
  return{ok:!noStump.length&&!bad.length,detail:(noStump.length?noStump.length+' clearings with no stumps; ':'')+(bad.length?bad.length+' trees standing in a clearing; ':'')+S.length+' stumps'};},
 // the traps are on the natives' trails, near their ends, each tagged
 traps(X){const bad=X.filter(t=>PATHGRID.at(t.x,t.z).d>3.5||t.culture!=='throne-natives'||!t.kind),kinds=new Set(X.map(t=>t.kind));
  return{ok:X.length>=10&&!bad.length&&kinds.has('punji')&&kinds.has('snare'),detail:(bad.length?bad.length+' traps off a trail or untagged; ':'')+X.length+' traps ('+[...kinds].join(', ')+')'};},
 // Zey'danin's footprint is empty: no tree of either kit stands in it
 city(T,J){const bad=T.concat(J).filter(t=>Math.hypot(t.x-CITY.x,t.z-CITY.z)<CITY.r*.9);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees in the city\'s footprint':'the footprint is empty ('+CITY.r+' m)'};},
 // nothing grows on the road or the trails
 paths(T,J){const bad=T.concat(J).filter(t=>PATHGRID.at(t.x,t.z).d<-.2);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on a path':'no tree on the road or the trails'};},
 // the hyperjungle stands only in the forest
 jungle(J,own){const bad=J.filter(t=>own(t.x,t.z)<.3);
  return{ok:J.length>20&&!bad.length,detail:bad.length?bad.length+' hyperjungle trees off the forest':J.length+' hyperjungle trees, all in the forest'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),waterH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the ground or the water: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const JT=()=>(typeof HYPERJUNGLE!=='undefined'&&HYPERJUNGLE.TREES)||[];
const resinPts=()=>instPoints().filter(p=>p[3]==='biome:resin');
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the plantations are planted in rows',HCHK.rows(FRONTIER.rows));
 add('the planted Ranj trees bear no resin',HCHK.noResin(FRONTIER.rows,resinPts()));
 add('the clearings are cleared (stumps, no standing trees)',HCHK.clearings(FRONTIER.stumps,THRONE.TREES,JT()));
 add('the traps are on the natives\' trails',HCHK.traps(FRONTIER.traps));
 add('Zey\'danin\'s footprint is empty',HCHK.city(THRONE.TREES,JT()));
 add('nothing grows on the road or the trails',HCHK.paths(THRONE.TREES,JT()));
 add('the hyperjungle stands in the forest',HCHK.jungle(JT(),FIELD.owned));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('nothing rooted under the water',HCHK.dry(P));
 add('preset cameras clear of ground and sea',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const F0=FIELDS.find(F=>F.kind!=='clear'),FC=FIELDS.find(F=>F.kind==='clear');
 add('a planted field with no rows',HCHK.rows(FRONTIER.rows.filter(r=>r.field!==F0.i)));
 add('resin on a planted tree',HCHK.noResin(FRONTIER.rows,[[FRONTIER.rows[0].x,0,FRONTIER.rows[0].z,'test']]));
 add('a tree in a clearing',HCHK.clearings(FRONTIER.stumps,THRONE.TREES.concat([{sp:0,x:FC.x,z:FC.z}]),JT()));
 add('a trap in the open forest',HCHK.traps(FRONTIER.traps.concat([{kind:'snare',culture:'throne-natives',x:F0.x+2000,z:F0.z}])));
 add('a tree in the city',HCHK.city(THRONE.TREES.concat([{sp:0,x:CITY.x,z:CITY.z}]),JT()));
 {const p=ROAD.pts[10];add('a tree on the road',HCHK.paths([{x:p[0],z:p[1]}],[]));}
 add('a hypertree in a field',HCHK.jungle(JT().concat([{x:F0.x,z:F0.z}]),FIELD.owned));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 {const b=xzOf(BAY.u,BAY.p);add('a plant on the bay\'s floor',HCHK.dry([[b[0],SEA-6,b[1],'test']]));}
 add('a camera under the sea',HCHK.camerasOut([{view:'under',x:xzOf(BAY.u,BAY.p)[0],y:SEA-5,z:xzOf(BAY.u,BAY.p)[1]}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-frontier',title:'Krator biome — the Throne: the spice frontier',
 hint:"The Throne, station 3: the spice frontier at Zey'danin, on the wet south-west shore (Af, ~4 m of rain). The colonists' terraced spice plantations cut from the hyperjungle, sickly rows that bear no resin (the tree's fungus has not taken), fresh clearings of burnt slash and sawn hypertree stumps, the road up the spur; the natives' foot trails out of the forest, their snares and punji pits at the fields' edges, angel trumpets in their poison gardens; Zey'danin's footprint over the harbour bay, black and olivine sand, the basalt headland (ideal type) · N night",
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
 biome:()=>window._biome,jungle:()=>window._jungle,frontier:()=>({rows:FRONTIER.rows.length,stumps:FRONTIER.stumps.length,traps:FRONTIER.traps,paths:FRONTIER.paths,walls:FRONTIER.walls,slash:FRONTIER.slash}),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),u:uOf(x,z),p:pOf(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
