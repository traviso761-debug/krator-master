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
// a camera in a tube: u along it, l across, h above the floor, looking along it (du) and a little across (dl) or up (dh)
const inTube=(T,u,l,h,du,dl,dh)=>{const p=T.P(u),t=T.tan(u),q=T.P(u+du),tq=T.tan(u+du),f=T.floor(u);return[p[0]-t[1]*l,f+floorRel(T,u,l,p[0]-t[1]*l,p[1]+t[0]*l)+h,p[1]+t[0]*l,q[0]-tq[1]*(dl||0),T.floor(u+du)+(dh||1.5),q[1]+tq[0]*(dl||0)];};
const VIEWS={
 'In the tube':inTube(TUBE,420,-3,1.7,60,1,2.5),
 'A skylight from below':(function(){const S=SKY[1];return inTube(TUBE,S.u-15,2,1.7,15,0,TUBE.H(S.u)+10);})(),
 'Siphon trees in the light':(function(){const S=SKY[1],T=THRONE.nearestTree(THRONE.SPECIES.indexOf(THRONE.byKey.siphon),S.x,S.z);const u=S.u-24;return inTube(TUBE,u,-4,2,24,T?0:0,8);})(),
 'The breakdown pile':(function(){const S=SKY[0];return inTube(TUBE,S.u+30,3,2.2,-30,0,3);})(),
 'Cave life in the dark':inTube(TUBE,820,4,1.4,14,-2,1.2),
 'Lantern brackets':inTube(TUBE,360,-3,1.8,9,7.5,4),
 'The flow ledges':inTube(TUBE,880,-5,4,25,6,4),
 'The side passage':inTube(SIDE,40,0,1.7,40,0,2),
 'The hot reach':inTube(TUBE,HOT.u0+20,4,2,70,-1,1),
 'The lava stream':inTube(TUBE,1300,3.4,1.6,16,-1.5,.2),
 'The cave at night':inTube(TUBE,700,2,1.7,40,-2,2),
 'A skylight from above':(function(){const S=SKY[1],a=Math.atan2(TUBE.d[1],TUBE.d[0])+1.6,x=S.x+Math.cos(a)*S.r*2.2,z=S.z+Math.sin(a)*S.r*2.2;return[x,surfH(x,z)+16,z,S.x,TUBE.floor(S.u)+2,S.z];})(),
 'From above':(function(){const c=TUBE.P(640);return[c[0]-160,SURF0+170,c[1]+260,c[0],SURF0-10,c[1]];})(),
};
VMODE['The cave at night']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.hot?'the hot reach: lava still runs here':best2&&best2.sky!=null?'a skylight: the light comes in':best2&&best2.side?'a side passage':best2&&best2.tube?'a lava tube':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'rock';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(FIELD.hot(p.x,p.z)>.5?'the hot reach':FIELD.skylight(p.x,p.z)>.3?'under a skylight':FIELD.cave(p.x,p.z)>.3?'the tube\'s floor (dark)':FIELD.rimz(p.x,p.z)>.3?'a skylight\'s rim':'the old flow\'s surface')+' · '+Math.round(p.y)+' m'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 // the light's life grows under the skylights: siphon trees and lamp caps there, and only there in the tube
 skylit(T){const sp=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]),inT=t=>!!tubeAt(t.x,t.z),near=t=>SKY.some(S=>Math.hypot(t.x-S.x,t.z-S.z)<S.r*1.3);
  const sip=T.filter(t=>t.sp===sp('siphon')),lamp=T.filter(t=>t.sp===sp('lampcap')),dark=T.filter(t=>inT(t)&&!near(t));
  return{ok:sip.length>=2&&lamp.length>=3&&!dark.length,detail:sip.length+' siphon trees, '+lamp.length+' lamp caps'+(dark.length?'; '+dark.length+' trees in the dark':'; none in the dark')};},
 // the cave life holds the dark floor; nothing lives in the hot reach
 cave(B,P){const hot=P.filter(p=>{const t=tubeAt(p[0],p[2]);return t&&t.T===TUBE&&hotK(t.u)>.5&&p[1]<t.T.floor(t.u)+3&&/^biome:/.test(p[3])&&!/^biome:(lavacicle|block)/.test(p[3]);});
  const n=B&&B.cave?B.cave.mat+B.cave.glow+B.cave.cards:0;return{ok:n>=150&&!hot.length,detail:n+' cave plants on the dark floor'+(hot.length?'; '+hot.length+' in the hot reach':'; none in the hot reach')};},
 // the walls and the roof carry their life; the skylights their light
 walls(C){return{ok:C.brackets>=40&&C.lavacicles>=500&&C.curtains>=60,detail:C.brackets+' lantern brackets, '+C.drips+' drips, '+C.ledgeGlow+' on the ledges, '+C.curtains+' curtains, '+C.lavacicles+' lavacicles, '+C.blocks+' blocks'};},
 light(S){return{ok:S.length===SKY.length&&S.every(s=>s.isSpotLight),detail:S.length+' skylight spots'};},
 // the camera stays in the tube's section
 inside(C){const bad=C.filter(c=>{const t=tubeAt(c.x,c.z);if(!t)return false;const f=t.T.floor(t.u);return c.y<f+.3||c.y>f+t.T.H(t.u)+1;});return{ok:!bad.length,detail:bad.length?'out of the tube: '+bad.map(c=>c.view).join(', '):'cameras in the tube clear of its floor and roof'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const camList=()=>Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the light\'s life under the skylights, none in the dark',HCHK.skylit(THRONE.TREES));
 add('cave life on the dark floor, none in the hot reach',HCHK.cave(window._biome,P));
 add('the walls and the roof alive',HCHK.walls(CAVE));
 add('daylight through every skylight',HCHK.light(SPOTS));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras inside the tube',HCHK.inside(camList()));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),u=800,p=TUBE.P(u);
 add('a lamp cap in the dark',HCHK.skylit(THRONE.TREES.concat([{sp:THRONE.SPECIES.indexOf(THRONE.byKey.lampcap),x:p[0],z:p[1]}])));
 {const q=TUBE.P(1300);add('a mushroom in the lava',HCHK.cave(window._biome,[[q[0],TUBE.floor(1300),q[1],'biome:glowshroom0']]));}
 add('bare walls',HCHK.walls(Object.assign({},CAVE,{brackets:0})));
 add('a skylight without light',HCHK.light(SPOTS.slice(1)));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera in the rock',HCHK.inside([{view:'rock',x:p[0],y:TUBE.floor(u)+TUBE.H(u)+6,z:p[1]}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-tube',title:'Krator biome — the Throne: the lava tube',
 hint:"The Throne, station 11: inside a lava tube under an old flow on the south-east shoulder, ~1.6 km up, under the plume's edge. The tube runs ~1.4 km, its roof arched, flow ledges along its walls and lavacicles on its roof; three skylights where the roof fell in pour daylight onto breakdown piles, and in their light grow siphon trees, lamp caps, ferns and moss; in the dark between them Krator's own cave life glows (the mat, glow mushrooms, lantern brackets, fungi dripping from the roof); a side passage ends in a choke; downstream a young reach is still hot, a lava stream running in its channel (ideal type) · N night",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:LCTL,keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 draw:(sc,cam,dt)=>HEAT.render(sc,cam,dt),   // HEAT (83): the shimmer over the lava, on the frame just drawn
 // in the tube the eye stays between its floor and its roof; outside it, over the ground and the water
 clampCam(cp,tg){const tt=tubeAt(tg.x,tg.z),inT=tt&&tg.y<tt.T.floor(tt.u)+tt.T.H(tt.u)+2&&cp.y<surfH(cp.x,cp.z)-2;   // (a camera above the surface looking down a hole is not in the tube)
  if(inT){const T=tt.T;let c=T.near(cp.x,cp.z);if(c.u<1)c.u=1;if(c.u>T.L-2)c.u=T.L-2;const W=T.W(c.u)-1.2,l=clamp(c.l,-W,W),p=T.P(c.u),t=T.tan(c.u);
   cp.x=p[0]-t[1]*l;cp.z=p[1]+t[0]*l;const f=T.floor(c.u)+floorRel(T,c.u,l,cp.x,cp.z),top=T.floor(c.u)+roofAt(T,c.u,l)-.8;cp.y=clamp(cp.y,f+.8,Math.max(f+1,top));}
  else{const gw=Math.max(terrainH(cp.x,cp.z),waterH(cp.x,cp.z))+1.8;if(cp.y<gw)cp.y=gw;}},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,cave:()=>CAVE,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
