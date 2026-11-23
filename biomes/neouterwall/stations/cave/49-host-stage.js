// ================================================================= HOST — stage: the Marble Hall (renderer, light, the floor the eye stands on, BIO.init)
// Forked from biomes/hearths' Cave of Crystals. The cave is CAVE's (48): this fragment makes the page round it. THE LIGHT: no daylight (6.2 km
// of rock overhead: no vent), the lower storey's hot water's dull glow up each feeder well, and the visitor's own lamp (a spot on the camera;
// ?lamp=0 off). The air is cool and still in the dry storey: a thin grey haze (the fog). ?exposure= sets the exposure.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y==null?0:r.y)-2&&y<=(r.y==null?0:r.y)+r.h+5;}
const Q=new URLSearchParams(location.search);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=Q.has('exposure')?+Q.get('exposure'):1.0;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0x24272a);scene.background=HAZE.clone();scene.fog=new THREE.FogExp2(HAZE.getHex(),.008);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.2,1400);scene.add(camera);
const HEMI=new THREE.HemisphereLight(0x8a8c90,0x2c2a28,.32);scene.add(HEMI);
/* the vents' daylight: none here (no vent reaches the surface 6.2 km up); kept for a cave page with vents */
const VENT_SUN=(function(){const T=CAVE.throats;if(!T.length)return null;const x=T.reduce((a,t)=>a+t.c[0],0)/T.length,z=T.reduce((a,t)=>a+t.c[1],0)/T.length,g=Math.max(...T.map(t=>t.ground));
 const s=new THREE.SpotLight(0xfff0d8,3.2,90,.62,.75,1.1);s.position.set(x,g+2,z);s.target.position.set(x+3,CAVE.focus.c[1],z+2);scene.add(s);scene.add(s.target);return s;})();
/* the hot water's glow up each feeder well: dull orange, from the well's mouth */
const WELL_GLOW=CAVE.wells.map(W=>{const p=new THREE.PointLight(0xff9a50,1.6,34,1.6);p.position.set(W.c[0],W.mouth+1.2,W.c[1]);scene.add(p);return p;});
/* the visitor's lamp: a warm white spot riding the camera (?lamp=0 off) */
const LAMP=Q.get('lamp')==='0'?null:(function(){const s=new THREE.SpotLight(0xfff2e2,3.2,110,.5,.55,1.2);s.position.set(0,.25,0);camera.add(s);s.target.position.set(0,-.1,-1);camera.add(s.target);return s;})();

/* the scalding pools' steam lit faintly from below (at most two: the hottest), the station's own light on the active storey */
const POOL_GLOW=(CAVE.water?CAVE.water.pools:[]).filter(p=>p.temp>=SITE.therm.scald).sort((a,b)=>b.temp-a.temp).slice(0,2).map(p=>{
 const l=new THREE.PointLight(0xffb070,1.1,40,1.6);l.position.set(p.c[0],p.level+2,p.c[1]);scene.add(l);return l;});

// ---------------------------------------------------------------- the floor the eye stands on (and BIO's ground)
// core/terrain's KCAVERN.floorFn: the lowest open point of the column from the station's own storey up (STATION.eye), read off the cavern's sdf on a
// 1 m lattice (cached); a column of rock answers that storey's floor. The water's bed reads from under the table, rock high: the water stands
// wherever the bed is under the table (waterH), which the eye stands on
const STOREY_Y=STATION.storey===0?SITE.net.level:SITE.net.levels[STATION.storey-1].y;
const terrainH=KCAVERN.floorFn(CAVE.C,{from:STATION.eye.from,to:STATION.eye.to,fallback:STOREY_Y});
const WATER_BED=CAVE.water?KCAVERN.floorFn(CAVE.C,{from:CAVE.water.level-3,to:CAVE.water.level+.5,fallback:1e3}):null;
function waterH(x,z){if(!WATER_BED||!CAVE.inB(x,z))return -1e9;return WATER_BED(x,z)<CAVE.water.level-.02?CAVE.water.level:-1e9;}
const groundEye=(x,z)=>Math.max(terrainH(x,z),STATION.storey===0||terrainH(x,z)<CAVE.N.table+1?waterH(x,z):-1e9);

BIO.init({tags:'neouterwall-cave',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>0,obstacles:[],ticks:tick,seed:52,
 origin:[CAVE.centre].concat(CAVE.chambers.map(c=>[c.c[0],c.c[2]])),center:CAVE.centre,fields:{},register:REGISTER,err:reportErr,
 lod:{hero:60,mid:160,far:420,floor:[40,110]},windows:{}});
