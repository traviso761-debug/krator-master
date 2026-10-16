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
// the best point near the spine for a test (scored on a 50 m sweep)
const best=(score)=>{let b=[0,0],bs=-1e9;for(let z=-2300;z<=2300;z+=50)for(let x=-2300;x<=2300;x+=50){const s=score(x,z)-BIO.lodD(x,z)/3000;if(s>bs){bs=s;b=[x,z];}}return b;};
// a point on young lava just outside a kipuka, and the direction into the forest
const RIM=best((x,z)=>FIELD.knear(x,z)*(1-FIELD.owned(x,z))*(FLOWS.ageAt(x,z)<200?1:0));
const RIMA=(function(){let ba=0,bv=-1;for(let k=0;k<16;k++){const a=k/16*TAU,v=FIELD.owned(RIM[0]+Math.cos(a)*120,RIM[1]+Math.sin(a)*120);if(v>bv){bv=v;ba=a;}}return ba;})();
const FN=FLOWS.flows.find(f=>f.key==='new'),FNp=FN.path[Math.floor(FN.path.length*.5)];
const SK=TUBE.sky[Math.floor(TUBE.sky.length/2)]||{x:0,z:0,r:12,d:10};
// a stretch of open water near the spine: on the stream, through the kipuka, with 60 m of water downstream to look along
const ST=STREAMS[0],STs=(function(){let b=0,bs=-1e9;for(let s=-2400;s<=2400;s+=20){let ok=true;for(let k=0;k<=60;k+=10){const p=streamPt(ST,s+k);if(waterH(p[0],p[1])<-1e8){ok=false;break;}}if(!ok)continue;const p=streamPt(ST,s),sc=-BIO.lodD(p[0],p[1])-Math.hypot(p[0],p[1])*.2;if(sc>bs){bs=sc;b=s;}}return b;})(),STp=streamPt(ST,STs),STq=streamPt(ST,STs+60);
const VMODE={};
const VIEWS={
 'A kipuka from the young lava':across(RIM[0]-Math.cos(RIMA)*60,RIM[1]-Math.sin(RIMA)*60,RIMA,320,3,40),
 'The great ruffs':atTree(nearTree('greatruff',RIM[0],RIM[1],100),170,RIMA+Math.PI,20,.75),
 // up in the crown, from the lava side: the tallest near great ruff, 110 m out where the forest is thinnest
 'A great ruff\'s collars':(function(){const T=THRONE.TREES.filter(t=>THRONE.SPECIES[t.sp].key==='greatruff'&&t.lv===2).sort((a,b)=>b.H-a.H)[0]||nearTree('greatruff',RIM[0],RIM[1]);
  let b=null;for(let k=0;k<16;k++){const a=k/16*TAU,x=T.x+Math.cos(a)*110,z=T.z+Math.sin(a)*110,o=FIELD.owned(x,z);if(!b||o<b.o)b={o,x,z};}return[b.x,T.y0+T.H*.95,b.z,T.x,T.y0+T.H*.85,T.z];})(),
 'Frill trees':atTree(nearTree('frilltree',RIM[0],RIM[1],80),90,RIMA+Math.PI*.8,20,.6),
 'A frill tree\'s fins':atTree(nearTree('frilltree',RIM[0],RIM[1],80),26,RIMA+Math.PI*.8,40,.5),
 'Siphon trees breathing':(function(){const cx=SK.x+SK.r*3,cz=SK.z+SK.r*2.2;return[cx,gh(cx,cz,6),cz,SK.x,gh(SK.x,SK.z,16),SK.z];})(),
 'Lava casts at the forest\'s edge':across(RIM[0]+Math.sin(RIMA)*40,RIM[1]-Math.cos(RIMA)*40,RIMA-.4,90,2.5,4),
 'The new flow (three years old)':across(FNp.x-20,FNp.z-30,Math.atan2(FN.path[FN.path.length-1].z-FNp.z,FN.path[FN.path.length-1].x-FNp.x),220,3,2),
 'Lehua on the young lava':atTree(nearTree('lehua',RIM[0],RIM[1],12),22,1.2,3,.55),
 'Tree ferns':atTree(nearTree('treefern',RIM[0],RIM[1],6),9,2.0,2.2,.7),
 'Arch palms':atTree(nearTree('archpalm',0,0,12),20,2.6,3,.6),
 'Ruff-tree seedlings':atTree(nearTree('ruff',RIM[0],RIM[1]),12,.6,2,.6),
 'A stream in the kipuka':[STp[0]-(STq[0]-STp[0])*.6,waterH(STp[0],STp[1])+9,STp[1]-(STq[1]-STp[1])*.6,STq[0],waterH(STq[0],STq[1])+.5,STq[1]],
 'Inside the hyperjungle':(function(){const p=best((x,z)=>FIELD.owned(x,z)*(1-FIELD.kedge(x,z)));return across(p[0],p[1],RIMA,300,4,30);})(),
 'The mosaic from above':look(2200,-2300,900,-400,600,0),
 'Night: the skylights':(function(){const cx=SK.x+SK.r*4,cz=SK.z+SK.r*3;return[cx,gh(cx,cz,8),cz,SK.x,gh(SK.x,SK.z,6),SK.z];})(),
 'From afar':look(-2300,2300,240,600,-800,80),
};
VMODE['Night: the skylights']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=kit==='hyperjungle'?'flora · the hyperjungle (the kipuka)':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nground: '+gr+(FIELD.owned(p.x,p.z)>.5?' · kipuka':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
const HCHK={
 // the species of this station (the windward ones but the geyser isle's and the cloud forest's own, and the ruff trees' seedlings) are all placed
 placed(C){const here=THRONE.SPECIES.filter(S=>(S.tags.plume==='windward'&&!S.isle&&!S.cloud)||S.key==='ruff'),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species of this station, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):L.length+' species and plants tagged'};},
 mosaic(sh){const low=['fresh','young','mature','old'].filter(k=>!(sh[k]>=(k==='fresh'?.01:.02)));
  return{ok:!low.length,detail:(low.length?'stages under their share of the map: '+low.join(', ')+'; ':'')+Object.keys(sh).map(k=>k+' '+(sh[k]*100).toFixed(1)+'%').join(', ')};},
 // THE KIPUKA are the hyperjungle's: no Throne tree stands inside one but the great ruffs on its rim
 kipukaKept(T,own){const bad=T.filter(t=>KEY(t)!=='greatruff'&&KEY(t)!=='frilltree'&&KEY(t)!=='siphon'&&own(t.x,t.z)>.75);
  return{ok:!bad.length,detail:bad.length?bad.length+' Throne trees inside a kipuka (first '+KEY(bad[0])+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' Throne trees, none inside a kipuka but on its rim'};},
 // ... and the hyperjungle stands only on them
 jungleOnKipuka(J,own){const bad=J.filter(t=>own(t.x,t.z)<.3);
  return{ok:J.length>10&&!bad.length,detail:bad.length?bad.length+' hyperjungle trees off the kipuka (first at '+[bad[0].x|0,bad[0].z|0]+')':J.length+' hyperjungle trees, all on the kipuka'};},
 // the great ruffs seed the young lava beside their kipuka: ruff trees stand there
 seeded(T,near){const s=T.filter(t=>KEY(t)==='ruff'&&near(t.x,t.z)>.05);
  return{ok:s.length>=10,detail:s.length+' ruff-tree seedlings on the young lava beside a kipuka'};},
 // the lava casts stand where a flow met the forest
 casts(R,near){const c=R.filter(r=>r.key==='cast'),bad=c.filter(r=>near(r.x,r.z)<.02);
  return{ok:c.length>=5&&!bad.length,detail:bad.length?bad.length+' casts away from any kipuka':c.length+' lava casts, all beside a kipuka'};},
 // the siphon trees stand in the tube's skylights
 siphons(T,sky){const s=T.filter(t=>KEY(t)==='siphon'),bad=s.filter(t=>sky(t.x,t.z)<.3);
  return{ok:s.length>0&&!bad.length,detail:bad.length?bad.length+' siphon trees out of a skylight':s.length+' siphon trees, all in skylights'};},
 onTop(F,key,age){const f=F.flows.find(x=>x.key===key);if(!f||!f.path)return{ok:false,detail:'no flow '+key};const P=f.path.filter((p,i)=>i%3===0&&Math.abs(p.x)<TERR.R&&Math.abs(p.z)<TERR.R),hit=P.filter(p=>F.ageAt(p.x,p.z)===age).length/Math.max(1,P.length);
  return{ok:hit>=.9,detail:(hit*100).toFixed(0)+'% of the '+key+' flow\'s path is '+age+' years old ground'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+KEY(bad[0])+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const JT=()=>(typeof HYPERJUNGLE!=='undefined'&&HYPERJUNGLE.TREES)||[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species of the station placed',HCHK.placed(THRONE.COUNTS||[]));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('every stage of the flow mosaic present',HCHK.mosaic(FLOWS.shares()));
 add('the kipuka are the hyperjungle\'s',HCHK.kipukaKept(THRONE.TREES,FIELD.owned));
 add('the hyperjungle stands on the kipuka',HCHK.jungleOnKipuka(JT(),FIELD.owned));
 add('the young lava beside a kipuka is seeded with ruff trees',HCHK.seeded(THRONE.TREES,FIELD.knear));
 add('the lava casts stand where a flow met the forest',HCHK.casts(REG,FIELD.knear));
 add('the siphon trees stand in the skylights',HCHK.siphons(THRONE.TREES,FIELD.skylight));
 add('the new flow lies on top',HCHK.onTop(FLOWS,'new',3));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a sheer rock face',HCHK.cliffs(THRONE.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const C=(THRONE.COUNTS||[]).slice();C[SPI('siphon')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===14?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a map with no fresh lava',HCHK.mosaic(Object.assign({},FLOWS.shares(),{fresh:0})));
 const inK=(function(){for(let z=-2000;z<=2000;z+=40)for(let x=-2000;x<=2000;x+=40)if(FIELD.owned(x,z)>.95&&FIELD.kedge(x,z)<.05)return[x,z];return[0,0];})();
 add('a lehua inside a kipuka',HCHK.kipukaKept([{sp:SPI('lehua'),x:inK[0],z:inK[1]}],FIELD.owned));
 const FN=FLOWS.flows.find(f=>f.key==='new').path[20];
 add('a hyperjungle tree on the new flow',HCHK.jungleOnKipuka(JT().concat([{x:FN.x,z:FN.z}]),FIELD.owned));
 add('no seedlings',HCHK.seeded([],FIELD.knear));
 add('a cast in the middle of a kipuka',HCHK.casts(REG.filter(r=>r.key==='cast').concat([{key:'cast',x:inK[0],z:inK[1]}]),(x,z)=>x===inK[0]&&z===inK[1]?0:FIELD.knear(x,z)));
 add('a siphon tree on open lava',HCHK.siphons([{sp:SPI('siphon'),x:FN.x,z:FN.z}],FIELD.skylight));
 add('a flow buried by an older one',HCHK.onTop(FLOWS,'new',35));
 // a point on a stream where it has water (a flow may have buried its bed elsewhere)
 {let p=streamPt(STREAMS[0],0);for(let s=-2500;s<=2500;s+=40){const q=streamPt(STREAMS[0],s);if(waterH(q[0],q[1])>-1e8){p=q;break;}}
  add('a plant on a stream\'s bed',HCHK.dry([[p[0],waterH(p[0],p[1])-2.5,p[1],'test']]));}
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-kipuka',title:'Krator biome — the Throne: the kipuka',
 hint:"The Throne, station 2: the kipuka on the windward west flank (~0.3 km below the datum, ~4 m of rain). Islands of old hyperjungle the lava went round, in flows from three years to centuries old; great ruffs on the forest's rim, their seedlings on the young lava, lehua and tree ferns, lava casts of swallowed trees, siphon trees breathing the tube's mist (ideal type) · N night",
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
 biome:()=>window._biome,jungle:()=>window._jungle,
 flows:()=>({flows:FLOWS.flows.map(f=>({key:f.key,age:f.age,cells:f.cells,steps:f.path.length})),shares:FLOWS.shares()}),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),age:FLOWS.ageAt(x,z),thick:FLOWS.thickAt(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
