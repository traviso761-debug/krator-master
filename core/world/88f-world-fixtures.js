// ================================================================= OPEN WORLD — fixtures drawn: setpieces streamed & seated on the drawn mesh
// [web] openworld/catch-bowl/PLAN-SETPIECES.md section 1 & 5 (2026-11-25). Reads planned fixtures from WORLD_DATA.sites
// (or plans SITE_SPEC.fixtures at load when the bake predates version 3), registers every fixture and slot in core/tags
// (build '<region>:fixtures') BEFORE drawing, clears surface flora/floor around ground fixtures (with `off` bypass during
// re-checks, and skipping surface clearing for underground `on: 'tube'` fixtures), seats each slot on the drawn mesh
// (`TERRAIN.heightDrawn` / raycast against `TERRAIN.meshes()`, recording `seatDelta` against analytic `WORLD.H`), hands
// ruined fixtures (`ruin: true`) to `KRUINS.watch`, adds named setpieces to `window.MAP_MARKS` ("Go to" + minimap diamonds),
// and streams near/far LOD groups with the camera.
var FIXTURES_DRAW;LATE.push(()=>{FIXTURES_DRAW=(function(){'use strict';
if(typeof WFIX==='undefined'||typeof KTAGS==='undefined')return null;
const scene=HOST.scene,camera=HOST.camera,t0=performance.now();
const PLAN=WORLD_DATA.sites||{sites:[],errors:[]};
const region=((WORLD_DATA.meta&&WORLD_DATA.meta.cut&&WORLD_DATA.meta.cut.region)||PLAN.region||'region');
const TAGS=KTAGS.create({build:region+':fixtures'});
const S={fixtures:0,slots:0,drawn:0,ruins:0,uncut:[],errors:[],from:'none',ms:0};

/* 1. Resolve fixture plan from baked sites.json (version >= 3) or plan at load from SITE_SPEC */
let FPLAN={fixtures:[],uncut:[],errors:[]};
const tubePlan=(typeof TUBES_DRAW!=='undefined'&&TUBES_DRAW&&window._tubes&&window._tubes.plan)||PLAN.tubes||null;
if(PLAN.version>=3&&PLAN.fixtures){const O=WFIX.of(PLAN);FPLAN={fixtures:O.fixtures,uncut:O.uncut,errors:[]};S.from='the baked plan';}
else if(typeof SITE_SPEC!=='undefined'&&SITE_SPEC&&SITE_SPEC.fixtures){
 FPLAN=WFIX.plan(SITE_SPEC,{sites:PLAN.sites,plan:PLAN,tubes:tubePlan});S.from='planned at load';}
S.fixtures=FPLAN.fixtures.length;S.uncut=FPLAN.uncut.map(u=>u.id+': '+u.why);S.errors=FPLAN.errors.slice();

/* 2. Register every fixture and slot in core/tags BEFORE drawing; add surface setpieces to MAP_MARKS */
const CULT=c=>KTAGS.VOCAB.cultures.indexOf(c)>=0?c:'generic';
const TYPE_FOR=kind=>kind==='monument'||kind==='sign'?['monument']:kind==='pen'?['farm']:kind==='light'||kind==='infrastructure'?['infrastructure']:['civic'];
const ITEMS=[],CLEARS=[];
for(const fx of FPLAN.fixtures){
 const cult=CULT(fx.culture);
 const base=TAGS.add({class:'landmark',kind:'fixture',key:fx.id,name:fx.name||fx.id,
  at:[fx.anchor.x,fx.anchor.y,fx.anchor.z],ry:fx.ry,r:(fx.R==null?20:fx.R)+8,h:10,
  tags:{culture:cult,types:['civic'],role:fx.kind},
  note:'setpiece ('+fx.kind+' on '+fx.on+'): '+fx.slots.length+' slots'});
 for(const sl of fx.slots){S.slots++;
  TAGS.child(base.id,{class:sl.kind==='monument'||sl.kind==='sign'?'prop':'building',key:sl.key,
   at:[sl.x,sl.y,sl.z],ry:sl.ry,size:[sl.w,sl.d,sl.h],
   tags:{culture:cult,types:TYPE_FOR(sl.kind),role:sl.role||sl.kind},
   note:sl.pending?'stand-in geometry until kit piece lands':undefined});}
 if(fx.on==='ground')CLEARS.push([fx.anchor.x,fx.anchor.z,(fx.R==null?20:fx.R)+4]);
 if(fx.mark!==false&&fx.on!=='tube'){
  window.MAP_MARKS=(window.MAP_MARKS||[]).concat([{x:fx.anchor.x,z:fx.anchor.z,label:'Setpiece: '+(fx.name||fx.id),
   color:'#f0b848',legend:'named setpieces & waystations',view:[fx.anchor.x-140,fx.anchor.z+220,65,0,-0.22]}]);}
 ITEMS.push({fx,base,group:null,massG:null,seated:false,seatDeltas:[]});}

/* 3. Chain WORLD.clearHook (with `off` bypass during checks() so KSITES.groundOk sees original ground) */
const prevClear=WORLD.clearHook;
let off=false;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(off)return false;
 for(const c of CLEARS)if(Math.abs(x-c[0])<c[2]&&Math.abs(z-c[1])<c[2]&&Math.hypot(x-c[0],z-c[1])<c[2])return true;
 return false;};

/* 4. Drawn-mesh seating & kit/stand-in builders */
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),rayOrg=new THREE.Vector3();
function drawnSurfaceAt(x,z,fallbackY){
 if(typeof TERRAIN!=='undefined'&&TERRAIN){
  if(typeof TERRAIN.meshes==='function'){const ms=TERRAIN.meshes();
   if(ms&&ms.length){rayOrg.set(x,fallbackY+400,z);ray.set(rayOrg,down);ray.far=800;
    const hit=ray.intersectObjects(ms,false)[0];if(hit)return hit.point.y;}}
  if(typeof TERRAIN.heightDrawn==='function')return TERRAIN.heightDrawn(x,z);}
 return typeof WORLD!=='undefined'&&WORLD.H?WORLD.H(x,z):fallbackY;}

const lam=c=>new THREE.MeshLambertMaterial({color:new THREE.Color(c).convertSRGBToLinear()});
const MATS={stone:lam(0x8e8576),wood:lam(0x785c3e),shrine:lam(0x3b3836),torch:new THREE.MeshBasicMaterial({color:0xffa842}),ruin:lam(0x6e6559),foot:lam(0x766e60)};
const boxG=new THREE.BoxGeometry(1,1,1).translate(0,0.5,0);
const CACHE={protos:{},failed:{},built:0};

function buildSlotMesh(sl,drop){
 /* try Xanadu kit (`XAK`), Iziz Vernacular (`IZV`), or Catalog (`CAT`) before procedural masonry/wood massing */
 if(!sl.pending){
  if(typeof XAK!=='undefined'&&XAK&&typeof XAK.proto==='function'){
   try{const g=XAK.proto(sl.key,sl.v||0,{drop:Math.max(0.5,drop),footC:0x766e60});if(g)return g.clone();}catch(_e){}}
  if(typeof isleProto==='function'){
   for(const k of ['izv','cat']){const P=isleProto(k,sl.key,sl.v||0,CACHE);
    if(P&&P.parts&&P.parts.length){const grp=new THREE.Group();
     for(const pt of P.parts)grp.add(new THREE.Mesh(pt.geo,pt.mat));
     if(drop>0.1){const f=new THREE.Mesh(new THREE.BoxGeometry(sl.w,drop,sl.d).translate(0,-drop/2+0.05,0),MATS.foot);grp.add(f);}
     return grp;}}}}
 /* clean architectural stone/timber block with footing skirt so nothing floats on sloped terrain */
 const grp=new THREE.Group();
 const mat=sl.kind==='light'?MATS.torch:sl.role==='shrine'||sl.role==='cairn'?MATS.shrine:sl.ruin?MATS.ruin:sl.kind==='pen'||sl.kind==='sign'?MATS.wood:MATS.stone;
 const body=new THREE.Mesh(boxG,mat);
 const sink=sl.ruin?0.15:0;
 body.scale.set(sl.w,sl.h,sl.d);body.position.y=-sink;body.name=sl.id;grp.add(body);
 if(!sl.ruin&&!sl.wall&&!sl.ceiling&&drop>0.08){
  const foot=new THREE.Mesh(boxG,MATS.foot);foot.scale.set(sl.w*1.02,drop+0.1,sl.d*1.02);foot.position.y=-(drop+0.05);foot.name=sl.id+'/foot';grp.add(foot);}
 return grp;}

function buildFull(it){const fx=it.fx,G=new THREE.Group();G.name='fixture '+fx.id;
 it.seatDeltas=[];
 for(const sl of fx.slots){
  let wy=sl.y,drop=0.4;
  if(fx.on==='ground'){
   /* sample drawn mesh at corners + centre so structure sits on high corner and footing bridges low corner */
   const cs=WFIX.boxCorners(sl,0).concat([[sl.x,sl.z]]),hs=cs.map(q=>drawnSurfaceAt(q[0],q[1],sl.y));
   const top=Math.max.apply(null,hs),low=Math.min.apply(null,hs),ana=WORLD.H(sl.x,sl.z);
   wy=sl.ruin?low:top;
   drop=Math.max(0.2,top-low+0.3);
   it.seatDeltas.push({id:sl.id,drawnY:Math.round(wy*100)/100,analyticY:Math.round(ana*100)/100,delta:Math.round((wy-ana)*100)/100});}
  else{it.seatDeltas.push({id:sl.id,drawnY:sl.y,analyticY:sl.y,delta:0});}
  const m=buildSlotMesh(sl,drop);
  m.position.set(sl.x-fx.anchor.x,wy,sl.z-fx.anchor.z);
  m.rotation.y=sl.ry;
  m.userData.inspectLabel=(fx.name||fx.id)+' · '+(sl.role||sl.key);
  G.add(m);}
 G.position.set(fx.anchor.x,0,fx.anchor.z);
 G.updateMatrixWorld(true);
 if(HOST.shadow)HOST.shadow.cast(G);
 scene.add(G);
 it.seated=true;S.drawn++;
 /* hand ruined structures to KRUINS.watch so verify asserts zero floaters and properly seated wrecks */
 if(fx.ruin&&typeof KRUINS!=='undefined'&&KRUINS&&typeof KRUINS.watch==='function'){
  KRUINS.watch(G,{name:'fixture '+fx.id,ground:(x,z)=>drawnSurfaceAt(x,z,fx.anchor.y)});S.ruins++;}
 return G;}

function buildMass(it){const fx=it.fx,im=new THREE.InstancedMesh(boxG,MATS.stone,fx.slots.length);
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),eu=new THREE.Euler(),v3=new THREE.Vector3(),sc=new THREE.Vector3();
 fx.slots.forEach((sl,i)=>{q.setFromEuler(eu.set(0,sl.ry,0));
  im.setMatrixAt(i,m4.compose(v3.set(sl.x-fx.anchor.x,sl.y,sl.z-fx.anchor.z),q,sc.set(sl.w,sl.h,sl.d)));});
 im.instanceMatrix.needsUpdate=true;im.name='fixture massing '+fx.id;
 const G=new THREE.Group();G.position.set(fx.anchor.x,0,fx.anchor.z);G.add(im);scene.add(G);return G;}

/* 5. Streaming loop: FULL within 1,100 m, massing out to 18,000 m */
const FULL=1100,FAR=18000;
const clockObj=(typeof HOST!=='undefined'&&HOST.clock)||(typeof ATMOS!=='undefined'&&ATMOS.clock)||null;
const nowYD=()=>{const d=clockObj&&clockObj.day!=null?clockObj.day:0;return typeof WHAZ!=='undefined'?WHAZ.yearDay(d):259;};
function update(){const P=camera.position,yd=nowYD();
 for(const it of ITEMS){const fx=it.fx;
  if(fx.season&&!WFIX.inSeason(fx,yd)){if(it.group)it.group.visible=false;if(it.massG)it.massG.visible=false;continue;}
  const dist=Math.hypot(P.x-fx.anchor.x,P.z-fx.anchor.z,(P.y-fx.anchor.y)*0.5);
  if(dist<FULL){if(!it.group)it.group=buildFull(it);it.group.visible=true;if(it.massG)it.massG.visible=false;}
  else if(dist<FAR&&fx.on!=='tube'){if(it.group)it.group.visible=false;if(!it.massG)it.massG=buildMass(it);it.massG.visible=true;}
  else{if(it.group)it.group.visible=false;if(it.massG)it.massG.visible=false;}}}
if(HOST.loop)HOST.loop.push(update);
update();

S.ms=Math.round(performance.now()-t0);
function checks(){off=true;
 let C;try{C=WFIX.check({sites:PLAN.sites,links:PLAN.links,ways:PLAN.ways,fixtures:FPLAN.fixtures});}finally{off=false;}
 const audit=TAGS.audit();
 const ruins=(typeof KRUINS!=='undefined'&&KRUINS&&KRUINS.report)?KRUINS.report():[];
 const badRuins=ruins.filter(r=>!r.ok);
 return{ok:C.ok&&!S.errors.length&&audit.ok&&!badRuins.length,plan:C,tags:audit,ruins,errors:S.errors.slice()};}
const api={plan:FPLAN,items:ITEMS,stats:()=>Object.assign({},S),checks,tags:()=>TAGS.audit(),
 buildAll:()=>{ITEMS.forEach(it=>{if(!it.group)it.group=buildFull(it);});return ITEMS.length;}};
window._fixtures=api;return api;})();});
