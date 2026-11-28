// ================================================================= OPEN WORLD — host: the renderer, the light, and the biome core's binding
// [web] One renderer for a world 1,400 km across: a logarithmic depth buffer (a ground 1 m away and a ridge 300 km
// away in one frame), no shadows (the sun is the kits' own, WNW at 45 degrees), fog as the dust haze.
//
// The biome core is bound once (BIO.init) to the WORLD, before any kit loads: a kit's fragments only need THREE at
// load; they read the land (terrainH, waterH, the fields) when they grow something. The fields come from one of
// three sources, set by the streaming code (HOST.fieldSource):
//   'world'    WORLD.at(x,z), the full sample (the last point is cached: a kit's zones() asks for ten fields at once)
//   a grid     a flora tile's field grid (85-world-flora.js): bilinear, so placing a tile costs grid reads
//   'nursery'  a fixed profile on flat ground at y=0 with no water: where 84-world-nursery.js grows one tree or one
//              floor patch alone, at the origin, to instance it everywhere
// A field each kit reads its own way is remapped here, by the kit that asks (BIO.kitName is the kit whose code runs):
// the abyss kit's 'upland' is the height above the abyss floor, not the plateau's mountains.
// LATE: the modules that read the region's data (terrain, water, flora, floor, places, camera) are defined when the data
// is decoded (98-world-start.js runs them in order); the kits and the nursery need none of it and load at once.
var LATE=[];
var HOST=(function(){
const renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const HAZE=new THREE.Color(0xd2bfa4);scene.fog=new THREE.FogExp2(HAZE.getHex(),1/90000);scene.background=HAZE.clone();
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.4,2.5e6);
const hemi=new THREE.HemisphereLight(0xc8d4e4,0x6a4030,.62);scene.add(hemi);
const SUN_DIR=new THREE.Vector3(-1000,1150,-560).normalize();
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.copy(SUN_DIR);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8b8a0,.22);fill.position.set(900,300,900).normalize();scene.add(fill);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const TICKS=[];
// the world clock (core/clock: one world day is 72 real minutes, as every settlement runs), when the build lists
// core/clock/20-core-clock.js: ?hour=H sets the hour, ?day=N the day, ?time=run starts it (held by default, as the
// preview pages hold it). Stepped every frame with the real seconds; what counts days (the hamlets' felling) reads it.
// The world opens at 15:30 (the owner, 2026-11-17: "sun following the clock"; an afternoon's raking light shows the land's
// relief, as the World Menagerie's pages are lit, where a noon sun flattens it: core/world/PLAN-MICRO.md).
const HOUR0=15.5;
const CLOCK=(()=>{if(typeof KCLOCK==='undefined')return null;const q=new URLSearchParams(location.search),n=(k,d)=>q.has(k)&&isFinite(+q.get(k))?+q.get(k):d;
 const C=KCLOCK.make({hour:n('hour',HOUR0),day:n('day',0),running:q.get('time')==='run'});TICKS.push(dt=>C.step(dt));return C;})();
// THE SUN FOLLOWS THE CLOCK: up in the east (+x) at 6, highest at noon (SUN_MAX, toward the north, -z, where the pinned sun
// stood), down in the west at 18, under the horizon at night. HOST.SUN_DIR is one vector, moved in place, so everything that
// holds it (the sky's disc and the giant's lit side, 80) follows; the light, the sky's fill and the flora's sun (BIO.SUN)
// are set here. A simple arc: core/atmos's sky model (89-atmos-e-skymodel.js) has the astronomical one, for when the open
// world takes it
const SUN_MAX=62*Math.PI/180,SUN_WARM=new THREE.Color(0xffb27a),SUN_NOON=new THREE.Color(0xfff2dc);
const HZ_NOON=new THREE.Color(0xd2bfa4),HZ_DUSK=new THREE.Color(0xc98c68),HZ_TWIL=new THREE.Color(0x3a4663),HZ_NIGHT=new THREE.Color(0x0d1526);
const HM_DAY=new THREE.Color(0xc8d4e4),HM_DUSK=new THREE.Color(0x8890b0),HM_NIGHT=new THREE.Color(0x22324f);
const HG_DAY=new THREE.Color(0x6a4030),HG_NIGHT=new THREE.Color(0x11131c);
if(typeof ATMOS!=='undefined')ATMOS.skyUniforms=Object.assign(ATMOS.skyUniforms||{},{uSunDir:{value:SUN_DIR}});
let sunHour=NaN;
function sunAt(h){const t=(h-6)/12,alt=SUN_MAX*Math.sin(Math.PI*t),az=Math.PI/2*(1-2*t),ca=Math.cos(alt);
 SUN_DIR.set(Math.sin(az)*ca,Math.sin(alt),-Math.cos(az)*ca).normalize();sun.position.copy(sun.target.position).add(SUN_DIR);
 const up=SUN_DIR.y,day=Math.max(0,Math.min(1,(up+.04)/.2)),gold=Math.max(0,Math.min(1,(up+.02)/.32)),twi=Math.max(0,Math.min(1,(up+.18)/.22));
 sun.intensity=1.55*day*day*(3-2*day);sun.color.copy(SUN_WARM).lerp(SUN_NOON,Math.max(0,Math.min(1,up/.45)));
 const sky=.18+.82*Math.max(0,Math.min(1,(up+.12)/.36));hemi.intensity=.62*sky;fill.intensity=.22*sky;
 hemi.color.copy(HM_NIGHT).lerp(HM_DUSK,twi).lerp(HM_DAY,gold);
 hemi.groundColor.copy(HG_NIGHT).lerp(HG_DAY,twi);
 HAZE.copy(HZ_NIGHT).lerp(HZ_TWIL,twi).lerp(HZ_DUSK,day*(1-gold*.65)).lerp(HZ_NOON,gold);
 scene.fog.color.copy(HAZE);scene.background.copy(HAZE);
 if(typeof BIO!=='undefined'&&BIO.host&&BIO.setSun)BIO.setSun([SUN_DIR.x,Math.max(.02,SUN_DIR.y),SUN_DIR.z]);}
const hourNow=()=>CLOCK?CLOCK.hour:HOUR0;
sunAt(hourNow());sunHour=hourNow();
TICKS.push(()=>{if(typeof SKY!=='undefined'&&SKY&&SKY.S)return;const h=hourNow();if(Math.abs(h-sunHour)>1/120){sunAt(h);sunHour=h;}});   /* every half a world minute; on the shared sky (80's SKY_SHARED, W8) the sky sets the sun, the light and the haze */

// ---------------------------------------------------------------- the field sources
const SRC={mode:'world',profile:null,grid:null};
let lx=NaN,lz=NaN,la=null;
function sample(x,z){if(SRC.mode==='nursery')return SRC.profile;
 if(SRC.grid){const g=SRC.grid(x,z);if(g)return g;}
 if(x===lx&&z===lz)return la;lx=x;lz=z;la=WORLD.at(x,z);return la;}
const fields={};
WORLD.FIELDS.forEach(n=>fields[n]=(x,z)=>sample(x,z)[n]);
// a kit that reads a field its own way (WORLD_KITS[].fields: the abyss kit's 'upland' is WORLD.at's abyssUp)
let REMAP=null;const remap=()=>REMAP||(REMAP=Object.fromEntries(WORLD_KITS.map(k=>[k.name,k.fields||{}])));
WORLD.FIELDS.forEach(n=>fields[n]=(x,z)=>{const s=sample(x,z),m=BIO.kitName&&remap()[BIO.kitName]&&remap()[BIO.kitName][n];return m&&s[m]!=null?s[m]:s[n];});
const terrainH=(x,z)=>SRC.mode==='nursery'?0:(SRC.grid&&SRC.groundAt?SRC.groundAt(x,z):WORLD.H(x,z));
const waterH=(x,z)=>SRC.mode==='nursery'?-1e9:WORLD.water(x,z);
BIO.init({THREE,scene,terrainH,waterH,
 mask:(x,z)=>{if(SRC.mode==='nursery')return 1;const d=terrainH(x,z)-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;},
 obstacles:[],ticks:fn=>TICKS.push(fn),seed:1,origin:[[0,0]],center:[0,0],fields,register:o=>{},
 err:m=>reportErr('biome: '+m)});
BIO.setSun([SUN_DIR.x,Math.max(.02,SUN_DIR.y),SUN_DIR.z]);
/* Stage 3 (S2): KSHADOW's one box on by default in the open world (?shadow=0 opts out) */
const shadow=(typeof KSHADOW!=='undefined'&&KSHADOW&&KSHADOW.attach)?KSHADOW.attach({
 renderer,scene,camera,sun,on:!(typeof location!=='undefined'&&/[?&]shadow=0(&|$)/.test(location.search)),
 size:2048,min:90,max:450,reach:900,button:false,
 ground:(x,z)=>(typeof TERRAIN!=='undefined'&&TERRAIN?TERRAIN.heightDrawn(x,z):WORLD.H(x,z))}):null;

// ---------------------------------------------------------------- the weather (Stage 8 V9: STAGE-8/G-weather.md W2, D33)
// core/atmos's weather bound to the open world ONCE: HOST.weather(), which 98-world-start.js calls when the LATE modules are laid
// out (ATMOS.init is 83-world-water.js's; the terrain's material is made). Only where the build lists it (core/atmos 89-atmos-4-weather.js
// and host/89-atmos-e-weatherhost.js; 89-atmos-9-host.js puts the selector in the bar, fx/89-atmos-fx-raincover.js the rain cover round
// the camera): a page without them is unchanged, and HOST.weather() is null there.
// THE CLIMATE is the region's kits' (WX_KIT_CLIMATE: what each kit's own page binds; a kit's WORLD_KITS entry .climate, or the region's
// WORLD_CONFIG.climate, says otherwise): cold or ash if any kit is, dry only if every kit is. It STARTS CLEAR, or live on the shared sky with the cells (below) (the views and the verify
// asserts stay what they were); ?weather=<mode> opens in another mode the region offers (an unknown one: clear). The binding eases the
// fog, the sun and the sky light (it follows what sunAt and 98's haze write each frame) and wets the terrain (WATER.wetGround).
// HOST.shade(material, {porosity}) asks for the sky's cloud shadows and rain darkening (ATMOS.cloudShade) on a ground or plant
// material: given when the weather binds, or at once after. Only with the shared sky's clouds on the page (ATMOS.skyUniforms.uCloud,
// core/atmos/sky): this world's own sky (80) has none, so until a region takes the shared sky it shades nothing.
const WX_KIT_CLIMATE={ringisles:{wet:true},'abyssal-savannah':{wet:true},eastabyss:{wet:true},hyperjungle:{wet:true},oidong:{cold:true},highrift:{cold:true},
 xanadu:{wet:true},throne:{wet:true,ash:true},swbay:{wet:true},sedesert:{dry:true},geyser:{wet:true}};
const WX={W:null,off:false,climate:null,mode:null,cover:null,queue:[],shaded:0};
function wxClimate(){const own=typeof WORLD_CONFIG!=='undefined'&&WORLD_CONFIG&&WORLD_CONFIG.climate;if(own)return Object.assign({},own);
 const L=(typeof WORLD_KITS!=='undefined'&&WORLD_KITS?WORLD_KITS:[]).map(k=>k.climate||WX_KIT_CLIMATE[k.name]||{}),dry=L.length>0&&L.every(c=>!!c.dry);
 const C={wet:!dry&&(L.length===0||L.some(c=>c.wet!==false&&!c.dry)),cold:L.some(c=>!!c.cold),ash:L.some(c=>!!c.ash),frozen:L.length>0&&L.every(c=>!!c.frozen),dry};
 const dust=L.find(c=>c.dust);if(dry&&dust)C.dust=dust.dust;return C;}
const wxReady=()=>typeof ATMOS!=='undefined'&&typeof ATMOS.bindWeather==='function'&&typeof ATMOS.weather==='function'&&!!ATMOS.h;
const wxClouds=()=>typeof ATMOS!=='undefined'&&typeof ATMOS.cloudShade==='function'&&typeof ATMOS.cloudShadeGLSL==='function'&&!!(ATMOS.skyUniforms&&ATMOS.skyUniforms.uCloud);
/* a material that has the shade already (a kit's own, or the biome core's maker, carried by worldMat's clone) is not shaded twice */
const hasShade=m=>{const S=m.onBeforeCompile&&m.onBeforeCompile.__khst,N=[].concat(typeof KHOOK!=='undefined'&&KHOOK&&KHOOK.names?KHOOK.names(m):[],
 m.userData&&m.userData.atmHooks||[],S&&S.names||[]);return N.some(n=>/^atmos-cloudshade-/.test(n));};   /* its own layers, a clone's copied names, a composed hook it was handed */
function shadeNow(m,o){if(!wxClouds()||hasShade(m))return;try{ATMOS.cloudShade(m,o);WX.shaded++;}catch(e){reportErr('weather: cloudShade: '+(e.stack||e));}}
function shade(m,o){if(!m||WX.off)return m;if(!(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial))return m;
 o=o||{};if(WX.W)shadeNow(m,o);else WX.queue.push([m,o]);return m;}
function weather(){if(WX.W||WX.off)return WX.W;
 if(!wxReady()){WX.off=true;WX.queue.length=0;return null;}
 const A=ATMOS,C=WX.climate=wxClimate(),q=typeof location!=='undefined'&&location.search?new URLSearchParams(location.search).get('weather'):null;
 const modes=A.MODES.concat(C.ash&&A.ASH_MODES?A.ASH_MODES:[],C.cold&&A.SNOW_MODES?A.SNOW_MODES:[]),mode=WX.mode=q&&modes.indexOf(q)>=0?q:'clear';
 if(typeof A.rainCover==='function'&&!A.raincover){try{WX.cover=A.rainCover({renderer});}catch(e){reportErr('weather: rain cover: '+(e.stack||e));}}
 const bar=typeof document!=='undefined'&&document.querySelector?document.querySelector('#ui .bar'):null;
 const grounds=typeof TERRAIN!=='undefined'&&TERRAIN&&TERRAIN.MAT?[TERRAIN.MAT]:[];
 /* THE MOVING WEATHER (W8, the owner 2026-11-24: "moving volumetric weather on all deployed open-world files"): where the build
    lists core/atmos/wx (W5's cells) and the shared sky (80's SKY_SHARED), the cells drift over the region on its climate and the
    page opens in 'live' (?weather=<mode> still opens in another; WORLD_CONFIG.cells: the cells' options, false for none) */
 const cfgCells=typeof WORLD_CONFIG!=='undefined'&&WORLD_CONFIG?WORLD_CONFIG.cells:null;
 const cells=cfgCells!==false&&typeof A.weatherCells==='function'&&typeof KRAND!=='undefined'&&typeof SKY!=='undefined'&&SKY&&SKY.S?Object.assign({mode:'live'},cfgCells||{}):null;
 WX.W=A.bindWeather(Object.assign({climate:C,sun,hemi,fog:scene.fog,grounds,mode},bar?{ui:bar}:{},cells?{cells}:{}));
 if(cells)WX.mode=WX.W.mode;
 for(const [m,o] of WX.queue)shadeNow(m,o);WX.queue.length=0;
 return WX.W;}

return{renderer,scene,camera,sun,hemi,fill,HAZE,SUN_DIR,TICKS,SRC,clock:CLOCK,hour:hourNow,sunAt,shadow,weather,shade,wx:WX,
 // the nursery: flat ground at the origin with a fixed profile; origin is the LOD spine the builders measure from
 nursery(profile,origin){SRC.mode='nursery';SRC.profile=profile;BIO.host.origin=[origin||[0,0]];BIO.host.center=origin||[0,0];lx=NaN;},
 world(){SRC.mode='world';SRC.profile=null;BIO.host.origin=[[0,0]];BIO.host.center=[0,0];lx=NaN;},
 fieldSource(grid,groundAt){SRC.grid=grid;SRC.groundAt=groundAt||null;lx=NaN;}};
})();
