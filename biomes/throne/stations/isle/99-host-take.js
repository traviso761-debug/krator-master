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
// the isle's places (45, 47, 86): a point and an aim
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const GG=GEYSERS[0],GF=GEYSERS[1],PR=POOLS[0];
const VMODE={},VERUPT={};
// the kelp off the landing (the shallows pass plants kelp only near the cameras' spine): out from the landing to 4-9 m
const kelpAt=(function(){const a=LANDING.a;for(let d=isleR(a);d<isleR(a)*1.5;d+=4){const x=DOME.cx+Math.cos(a)*d,z=DOME.cz+Math.sin(a)*d,dep=SEA-terrainH(x,z);if(dep>5)return{x,z,a};}return{x:LANDING.x,z:LANDING.z,a};})();
const VIEWS={
 'The geyser basin':(function(){const p=bxz(-BASIN.ra*1.25,-BASIN.rb*.9);return[p[0],gh(p[0],p[1],28),p[1],BASIN.x,gh(BASIN.x,BASIN.z,0),BASIN.z];})(),
 'The Great Geyser (erupting)':toward(GG.x+60,GG.z+40,GG.x,GG.z,85,6,14),
 'The Prismatic Spring':(function(){const p=bxz(PR.au-PR.r*1.9,PR.bv-PR.r*.8);return[p[0],gh(p[0],p[1],11),p[1],PR.x,POOLL[0],PR.z];})(),
 'The Fountain (erupting)':toward(GF.x-30,GF.z+20,GF.x,GF.z,30,4,3),
 'The mud pots':(function(){const p=MUD.pots[0];return toward(MUD.x+12,MUD.z-8,p.x,p.z,7,2.2,0);})(),
 'The drowned trees':(function(){const S=ISLE.snags[0]||{x:BASIN.x,z:BASIN.z};return toward(BASIN.x,BASIN.z,S.x,S.z,40,2.5,4);})(),
 'Wild Ranj on the warm ground':(function(){const T=nearTree('spice',CAMP.x,CAMP.z,4);return atTree(T,T.crownR*2.4,rr(0,TAU),2.2,.45);})(),
 'The resin-tappers\' camp':toward(CAMP.x+14,CAMP.z+10,CAMP.x,CAMP.z,18,3.5,.5),
 'The landing':toward(DOME.cx,DOME.cz,LANDING.x,LANDING.z,-40,4,.5),
 'Coconut palms on the beach':(function(){const T=nearTree('coconut',LANDING.x,LANDING.z,8);const a=Math.atan2(T.z-DOME.cz,T.x-DOME.cx);return atTree(T,22,a,1.8,.65);})(),
 'A palm frill tree':(function(){const T=nearTree('palmfrill',CAMP.x,CAMP.z,12);return atTree(T,T.H*1.15,rr(0,TAU),2,.8);})(),
 'Hyper-mangroves in the lagoon':(function(){const T=nearTree('mangrove',LAGOON.x,LAGOON.z,10);const a=Math.atan2(T.z-LAGOON.z,T.x-LAGOON.x)+Math.PI;return[T.x+Math.cos(a)*T.crownR*2.4,SEA+2.2,T.z+Math.sin(a)*T.crownR*2.4,T.x,T.y0+T.H*.35,T.z];})(),
 'Kelp in the shallows':[kelpAt.x-Math.cos(kelpAt.a)*6,SEA+2.5,kelpAt.z-Math.sin(kelpAt.a)*6,kelpAt.x+Math.cos(kelpAt.a)*12,SEA-4,kelpAt.z+Math.sin(kelpAt.a)*12],
 'The sea cliffs and the fall':FALL?(function(){const px=-FALL.dz,pz=FALL.dx,cx=FALL.x+FALL.dx*70+px*28,cz=FALL.z+FALL.dz*70+pz*28;return[cx,SEA+9,cz,FALL.x+FALL.dx*FALL.reach*.6,SEA+FALL.drop*.45,FALL.z+FALL.dz*FALL.reach*.6];})():(function(){const a=CLIFF.a+.18,d=isleR(a)*1.18;return[DOME.cx+Math.cos(a)*d,SEA+18,DOME.cz+Math.sin(a)*d,DOME.cx+Math.cos(CLIFF.a)*isleR(CLIFF.a)*.95,SEA+14,DOME.cz+Math.sin(CLIFF.a)*isleR(CLIFF.a)*.95];})(),
 'The isle from the sea':(function(){const a=2.3,d=isleR(a)*1.9;return[DOME.cx+Math.cos(a)*d,SEA+40,DOME.cz+Math.sin(a)*d,DOME.cx,SEA+120,DOME.cz];})(),
 'The isle from above':[DOME.cx+1400,SEA+1500,DOME.cz+2300,DOME.cx,SEA+80,DOME.cz],
 'Night: the basin':(function(){const p=bxz(-BASIN.ra*1.25,-BASIN.rb*.9);return[p[0],gh(p[0],p[1],28),p[1],BASIN.x,gh(BASIN.x,BASIN.z,0),BASIN.z];})(),
};
VMODE['Night: the basin']='night';VERUPT['The Great Geyser (erupting)']='great';VERUPT['The Fountain (erupting)']='fountain';VERUPT['The geyser basin']='great';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(VERUPT[k])erupt(VERUPT[k]);};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&(best2.camp||best2.landing)?'the natives\' resin camp · the Throne\'s natives (culture throne-natives)':best2&&best2.geyser?'a geyser · '+(GEYSER_STATE(best2.geyser).playing?'playing now':'next in '+Math.round(GEYSER_STATE(best2.geyser).next)+' s'):best2&&best2.spring?'a hot spring':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const gr='old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+(FIELD.sinter(p.x,p.z)>.5?' · sinter':FIELD.grove(p.x,p.z)>.5?' · the warm ground':FIELD.beach(p.x,p.z)>.5?' · beach':FIELD.sand(p.x,p.z)>.5?' · sand':FIELD.iwood(p.x,p.z)>.5?' · the woods':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
// items meant to stand in the water: the kelp, a geyser's throat
const WET_ITEMS=/^biome:(kelp\d|seaweed\d|vent)$/;
const HCHK={
 // the geysers: each on its schedule (a period longer than its eruption), on the sinter; erupt() starts one now
 geysers(L){const bad=L.filter(G=>!(G.H>0&&G.dur>0&&G.period>G.dur)||FIELD.sinter(G.x,G.z)<.5);
  return{ok:L.length>=2&&!bad.length,detail:bad.length?bad.length+' geysers off the sinter or off their schedules':L.map(G=>G.key+' every '+G.period+' s for '+G.dur+' s, '+G.H+' m').join('; ')};},
 // nothing grows in a spring, or on a geyser's cone
 springs(P){const bad=P.filter(p=>!WET_ITEMS.test(p[3])&&(POOLS.some(S=>Math.hypot(p[0]-S.x,p[2]-S.z)<S.r*.95)||Math.hypot(p[0]-GEYSERS[0].x,p[2]-GEYSERS[0].z)<GEYSERS[0].cone*1.2));
  return{ok:!bad.length,detail:bad.length?bad.length+' instances in a spring or on the cone (first '+bad[0][3]+')':'the springs and the cone are bare'};},
 // the wild Ranj bears on the warm ground: most of the near Ranj trees there have resin drops in their crowns
 spice(T,resin){const sp=SPK('spice'),W=T.filter(t=>t.sp===sp&&t.lv===2&&!t.planted&&FIELD.grove(t.x,t.z)>.4),bearing=W.filter(t=>resin.some(p=>Math.hypot(p[0]-t.x,p[2]-t.z)<t.crownR+1.5));
  return{ok:W.length>=8&&bearing.length>=W.length*.6,detail:bearing.length+' of '+W.length+' near wild Ranj trees on the warm ground bear resin'};},
 // the coconut palm names its catalog fruit, and its nuts are drawn
 coconut(SP,P){const S=SP.find(s=>s.key==='coconut'),n=P.filter(p=>p[3]==='biome:coconut').length;const ok=!!S&&S.tags.harvest&&S.tags.harvest.fruit==='generic_fruit_coconut'&&n>=40;
  return{ok,detail:(S&&S.tags.harvest&&S.tags.harvest.fruit?'catalog '+S.tags.harvest.fruit:'no catalog fruit')+'; '+n+' coconuts drawn'};},
 // the camp is the natives', and what it taps is Ranj trees
 camp(C,tapped,T){const sp=SPK('spice'),bad=tapped.filter(r=>!T.some(t=>t.sp===sp&&Math.hypot(t.x-r.x,t.z-r.z)<.5));
  return{ok:C.culture==='throne-natives'&&C.shelters.length>=3&&tapped.length>=4&&!bad.length,detail:(bad.length?bad.length+' tapped trees that are not Ranj trees; ':'')+C.shelters.length+' shelters, '+tapped.length+' Ranj trees tapped, '+C.pots+' pots'};},
 // kelp only under the water, 3-15 m down at its foot
 kelp(P){const K=P.filter(p=>/^biome:kelp\d$/.test(p[3])),bad=K.filter(p=>{const w=waterH(p[0],p[2]);return w<-1e8||w-p[1]<2.5||w-p[1]>16;});
  return{ok:K.length>=200&&!bad.length,detail:bad.length?bad.length+' kelp out of its depth':K.length+' kelp cards, all 3-15 m down'};},
 // the hyper-mangroves stand in the lagoon
 mangroves(T){const sp=SPK('mangrove'),M=T.filter(t=>t.sp===sp),bad=M.filter(t=>Math.hypot(t.x-LAGOON.x,t.z-LAGOON.z)>LAGOON.r*1.45);
  return{ok:M.length>=10&&!bad.length,detail:bad.length?bad.length+' mangroves out of the lagoon':M.length+' hyper-mangroves, all in the lagoon'};},
 // the isle's species are all placed: its own (isle:true) and the woods' and the warm ground's
 placed(C){const here=THRONE.SPECIES.filter(S=>S.isle||['spice','lehua','treefern','archpalm'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species of the isle, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 // nothing grows on the trail
 paths(T){const bad=T.filter(t=>PATHGRID.at(t.x,t.z)<-.2);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on the trail':'no tree on the trail'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 dry(P){const bad=P.filter(p=>{if(WET_ITEMS.test(p[3]))return false;const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned (kelp and the throats are meant to be)'};},
 camerasOut(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),waterH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the ground or the water: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const resinPts=P=>P.filter(p=>p[3]==='biome:resin');
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the geysers keep their schedules, on the sinter',HCHK.geysers(GEYSERS));
 add('nothing grows in a spring or on the cone',HCHK.springs(P));
 add('the wild Ranj bears resin on the warm ground',HCHK.spice(THRONE.TREES,resinPts(P)));
 add('the coconut palm bears its catalog fruit',HCHK.coconut(THRONE.SPECIES,P));
 add('the camp is the natives\', and it taps Ranj trees',HCHK.camp(ISLE.camp,ISLE.tapped,THRONE.TREES));
 add('the kelp stands 3-15 m down',HCHK.kelp(P));
 add('the hyper-mangroves stand in the lagoon',HCHK.mangroves(THRONE.TREES));
 add('nothing grows on the trail',HCHK.paths(THRONE.TREES));
 add('every species of the isle placed',HCHK.placed(THRONE.TREES.reduce((C,t)=>{C[t.sp]=(C[t.sp]||0)+1;return C;},THRONE.SPECIES.map(()=>0))));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('nothing rooted under the water',HCHK.dry(P));
 add('preset cameras clear of ground and sea',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});const P=instPoints(),sp=SPK('spice');
 add('a geyser in the forest',HCHK.geysers(GEYSERS.concat([Object.assign({},GEYSERS[0],{x:DOME.cx+isleR(0)*.7,z:DOME.cz})])));
 add('a plant in the Prismatic Spring',HCHK.springs([[POOLS[0].x,POOLL[0],POOLS[0].z,'biome:fern']]));
 add('wild Ranj with no resin',HCHK.spice(THRONE.TREES,[]));
 add('a coconut palm with no catalog fruit',HCHK.coconut(THRONE.SPECIES.map(S=>S.key==='coconut'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),P));
 {const c=THRONE.TREES.find(t=>t.sp!==sp)||{x:0,z:0};add('a tapped tree that is not a Ranj tree',HCHK.camp(ISLE.camp,ISLE.tapped.concat([{x:c.x,z:c.z}]),THRONE.TREES));}
 add('kelp on the beach',HCHK.kelp(P.concat([[LANDING.x,terrainH(LANDING.x,LANDING.z),LANDING.z,'biome:kelp0']])));
 add('a mangrove on the crown',HCHK.mangroves(THRONE.TREES.concat([{sp:SPK('mangrove'),x:BASIN.x,z:BASIN.z}])));
 {const C=THRONE.SPECIES.map(()=>1);C[SPK('coconut')]=0;add('a species of the isle never placed',HCHK.placed(C));}
 {const p=TRAILS[0].pts[Math.floor(TRAILS[0].pts.length/2)];add('a tree on the trail',HCHK.paths([{x:p[0],z:p[1]}]));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 {const a=1.0,d=isleR(a)*1.2;add('a plant on the sea floor',HCHK.dry([[DOME.cx+Math.cos(a)*d,SEA-8,DOME.cz+Math.sin(a)*d,'biome:fern']]));}
 add('a camera under the sea',HCHK.camerasOut([{view:'under',x:LAGOON.x,y:SEA-1.5,z:LAGOON.z}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-isle',title:'Krator biome — the Throne: the geyser isle',
 hint:"The Throne, station 4: a geyser isle of the inner isles, ~170 km west of the summit (Af). The crown's geyser basin (two geysers, banded hot springs, mud pots, fumaroles along the rift, white sinter and the drowned trees at its edge), the warm ground round it where the wild Ranj bears, the natives' resin camp; an island's smaller forest (lehua, tree ferns, palm frill trees), coconut palms over black-sand beaches, hyper-mangroves in the warm lagoon, kelp in the shallows, wrack on the sand, sea cliffs on the windward side (ideal type) · N night",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:LCTL,keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,erupt,geyser:GEYSER_STATE,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,isle:()=>ISLE,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),e:basinE(x,z),dn:dnOf(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
