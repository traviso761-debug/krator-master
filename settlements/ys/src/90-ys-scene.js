// ================================================================= YS CITY — the scene
// Renderer and lights (the port's, named so the clock can swing them), the Krator sky (iziz 81-sky.js: the gas giant
// fixed at altitude 25° azimuth 66°, a 24 h day, the sun from the hour), the port kit's stamp-driven terrain and sea
// with the underwater fade, the builder loop and the bake. Build order, and why (the port's rule):
//  1. every placed segment's stamps are collected;  2. terrain and sea are built, after which terrainH() answers
//  with the final ground;  3. the builders run;  4. kbake() once.
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc9d6d8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00014);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
const hemi=new THREE.HemisphereLight(0xdfeef4,0x3a4a44,.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);sun.position.set(-1200,900,900);scene.add(sun);scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xc0d8ff,.3);fill.position.set(800,400,-900);scene.add(fill);
const FRAME_HOOKS=[];
let groundM=null,LABELS=null;const SITE_GROUPS=[];
// ---------------------------------------------------------------- the sky and the clock
const YSCLOCK={hour:15.5,hour0:15.5,day:200,dens:1.4};
const ysSkyGroup=KratorSky.attach(scene,6000);ysSkyGroup.traverse(o=>{o.userData.probeSkip=true;});
let YS_NIGHT=null;
function ysNightApply(on){on=!!on;if(YS_NIGHT===on)return;YS_NIGHT=on;
 for(const n of FIREKIT)if(KIT.meshes[n])KIT.meshes[n].visible=on;
 for(const f of PORT_NIGHT)try{f(on);}catch(e){reportErr('night hook '+e.stack);}}
function ysSkyTick(){KratorSky.update(camera.position,YSCLOCK.hour,YSCLOCK.day,YSCLOCK.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();
 sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);fill.intensity=.22*L.dayF+.05;hemi.intensity=L.ambient;
 scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);renderer.toneMappingExposure=L.isNight?1.3:1.05;
 ysNightApply(L.isNight);}
function setHour(h){YSCLOCK.hour=((h%24)+24)%24;ysSkyTick();}
FRAME_HOOKS.push(ysSkyTick);
// builders animate (a beacon's beam, a windmill's sails) by pushing fn(dt,t) onto window.YS_TICKS; the same loop runs them
window.YS_TICKS=window.YS_TICKS||[];FRAME_HOOKS.push((dt,t)=>{for(const f of window.YS_TICKS)f(dt,t);});
// ---------------------------------------------------------------- the port: stamps, terrain, sea, builders, bake
portUnderwaterPatch();
const PORT_LAYOUT=(typeof PORT_LAYOUT_DEF!=='undefined'&&PORT_LAYOUT_DEF)||{items:[],stamps:[],runs:[]};
function portOptFor(it){const R=portRegOf(it.key)||{};
 const nb=Object.assign({W:{kind:'land',dz:0},E:{kind:'land',dz:0},N:{kind:'land',dz:0},S:{kind:'sea',dz:0}},it.nb||{});
 return {key:it.key,d:it.d,gx:it.gx,gz:it.gz,nb,slot:it.slot||0,run:it.run||0,ctx:!!it.ctx,W:R.W,LAND:R.LAND,SEA:R.SEA,
  place:portPlaceOf(it.key),vessels:PORT_LAYOUT.vessels||[],heading:it.heading||0,
  vessel:(typeof it.vessel==='string')?it.vessel:null,fleet:it.fleet||null,...(it.opt||{})};}
try{portLinkNb(PORT_LAYOUT.items);}catch(e){reportErr('layout nb '+e.stack);}
for(const it of PORT_LAYOUT.items){const R=portRegOf(it.key);if(!R){reportErr('layout names unregistered key '+it.key);continue;}
 let st=[];try{st=R.stamps(portOptFor(it))||[];}catch(e){reportErr(it.key+' stamps d='+it.d+' '+e.stack);}
 for(const s of st)portStampAdd(s,it.gx,it.gz,it.key+'/'+it.d+'@'+PORT_LAYOUT.items.indexOf(it));}
for(const s of (PORT_LAYOUT.stamps||[]))portStampAdd(s,0,0,'layout');
TSTAT.cur='env/0';
let PORT_TERRAIN=null;
try{PORT_TERRAIN=portBuildTerrain(scene,PORT_LAYOUT);}catch(e){reportErr('terrain '+e.stack);}
if(PORT_TERRAIN){for(const m of PORT_TERRAIN.chunks)m.userData.isGround=true;groundM=PORT_TERRAIN.chunks[0]||null;if(PORT_TERRAIN.sea)PORT_TERRAIN.sea.userData.isGround=true;}
TSTAT.cur=null;
for(const it of PORT_LAYOUT.items){const R=portRegOf(it.key);if(!R)continue;const d=it.d;
 const key=portStatKey(it.key,d);it.stat=key;TSTAT.cur=key;const _r0=REG.length;
 PORT_OWN[key]={key:it.key,d,name:R.name,place:it.vessel===true?'vessel':portPlaceOf(it.key)};
 if(it.vessel===true)PORT_VPLACED.push({key:it.key,d,x:it.gx,z:it.gz,heading:it.heading||0,host:null,stat:key});
 HOLES=(d>=3)?.55:1;KOFF=[0,0,0];KXF=null;
 const opt=portOptFor(it);let _G=null;PORT_CUR=opt;
 try{_G=R.build(scene,it.gx,it.gz,d,opt);}catch(e){reportErr(it.key+' d='+d+' '+e.stack);}
 PORT_CUR=null;PORT_PART=null;
 try{pbFlush();}catch(e){reportErr(it.key+' flush '+e.stack);}
 HOLES=1;
 if(d>=3&&_G&&!R.norepair){KOFF=[it.gx,0,it.gz];try{portRepair(_G,d);}catch(e){reportErr(it.key+' repair '+e.stack);}}
 KOFF=[0,0,0];KXF=null;
 if(_G&&_G.isObject3D){if(!_G.userData.own)_G.userData.own=key;_G.traverse(o=>{if((o.isMesh||o.isInstancedMesh)&&!o.userData.own)o.userData.own=key;});}
 for(let i=_r0;i<REG.length;i++){if(!REG[i].type)REG[i].type=it.key;if(!REG[i].own)REG[i].own=key;}
 TSTAT.cur=null;}
// 3b. the target's own builders (the mock, the kit sheet, the city's layout pass) run here: static fabric before the bake
for(const f of (typeof YS_BUILD!=='undefined'?YS_BUILD:[])){try{f(scene);}catch(e){reportErr('build hook '+e.stack);}}
try{hykFlush(scene);}catch(e){reportErr('hykFlush '+e.stack);}
window._registered=REG.length;
kbake(scene);window._baked=true;
for(const n in KIT.meshes){const m=KIT.meshes[n];m.userData.kname=n;m.userData.owns=KIT.items[n];}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
ysSkyTick();
