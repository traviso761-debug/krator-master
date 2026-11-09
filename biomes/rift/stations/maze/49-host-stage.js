// ================================================================= HOST — stage: the gypsum maze (renderer, light, the floor the eye stands on, BIO.init)
// The cave is CAVE's (48); this fragment makes the page round it. THE LIGHT: a humid Cfa afternoon over the table (the sun low in the south-
// west, on the scarp's face; a pale sky's hemisphere), which reaches into the maze only by its openings (each vertex's aSky, 84: the
// rock's and the dress's materials scale the sun and the sky by it), and the visitor's own lamp (a spot on the camera; ?lamp=0 off). THE AIR:
// a pale haze over the table, a dark close one under it, chosen by where the eye is (the scene's fog: no sky dome and no height fog under
// ground). ?exposure= sets the exposure.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   /* BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js) */
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y==null?0:r.y)-2&&y<=(r.y==null?0:r.y)+r.h+5;}
const Q=new URLSearchParams(location.search);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=Q.has('exposure')?+Q.get('exposure'):1.0;
document.body.appendChild(renderer.domElement);
/* the two airs: OUT over the table and the bench (a humid afternoon's haze), IN under the ground (dry, dark, close) */
const AIR_OUT={bg:new THREE.Color(0xb7c6cc),fog:new THREE.Color(0xbfcacb),d:.0032},AIR_IN={bg:new THREE.Color(0x0a0807),fog:new THREE.Color(0x14110e),d:.03};
const scene=new THREE.Scene();scene.background=AIR_OUT.bg.clone();scene.fog=new THREE.FogExp2(AIR_OUT.fog.getHex(),AIR_OUT.d);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.15,2400);scene.add(camera);
const HEMI=new THREE.HemisphereLight(0xc8d6e2,0x6e5a46,.6);scene.add(HEMI);
/* the sun: 15:30 in the south-west, 32 degrees up, on the scarp's face */
const SUN=(function(){const s=new THREE.DirectionalLight(0xfff0d8,1.7),az=TAU*.62,el=.56;s.position.set(Math.cos(az)*Math.cos(el)*400,Math.sin(el)*400,Math.sin(az)*Math.cos(el)*-400);
 s.target.position.set(0,0,0);scene.add(s);scene.add(s.target);return s;})();
/* the visitor's lamp: a warm white spot riding the camera (?lamp=0 off) */
const LAMP=Q.get('lamp')==='0'?null:(function(){const s=new THREE.SpotLight(0xfff0dc,2.2,70,.78,.85,1.25);s.position.set(0,.2,0);camera.add(s);s.target.position.set(0,-.12,-1);camera.add(s.target);
 const f=new THREE.PointLight(0xffe6c8,.35,22,1.6);f.position.set(0,.3,.4);camera.add(f);return s;})();   /* and a faint fill round the eye, so the wall beside you is not black */

// ---------------------------------------------------------------- the floor the eye stands on (and BIO's ground)
// core/terrain's KCAVERN.floorFn on CAVE.fast (48: the tile's own cavern, the same sdf): the lowest open point of the column from under the
// bench up, a 1 m lattice cached; under the table that is the lowest storey's floor where a passage runs, the table's surface where none does.
// The perched water's bed reads from under the lowest storey to just over the table, and only under the table's cover (the bench outside
// the face is lower than the table, and dry)
const terrainH=KCAVERN.floorFn(CAVE.fast,{from:-48,to:8,fallback:SITE.net.level});
const WT=CAVE.water.level,WATER_BED=CAVE.water.box?KCAVERN.floorFn(CAVE.fast,{from:SITE.net.level-3,to:WT+.5,fallback:1e3}):null;
const bedH=(x,z)=>!WATER_BED||!CAVE.inB(x,z)||CAVE.ground(x,z)<WT+.4?1e3:WATER_BED(x,z);
function waterH(x,z){return bedH(x,z)<WT-.02?WT:-1e9;}
const groundEye=(x,z)=>Math.max(terrainH(x,z),waterH(x,z));
/* under the ground: the eye's air and the haze it sees. The background stays the sky: from under the ground it shows only through an
   opening (a doline, a mouth), where it is the sky */
const underAt=p=>p.y<CAVE.ground(p.x,p.z)-1;
const AIR_PLAN={bg:AIR_OUT.bg,fog:AIR_OUT.fog,d:.0005},VIEW={plan:false};   /* VIEW.plan: the plan view (98v) thins the haze */
tick(function air(){const u=underAt(camera.position),A=VIEW.plan?AIR_PLAN:u?AIR_IN:AIR_OUT;scene.fog.color.copy(A.fog);scene.fog.density=A.d;});

BIO.init({tags:'rift',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>0,obstacles:[],ticks:tick,seed:72,
 origin:[CAVE.centre].concat(CAVE.chambers.map(c=>[c.c[0],c.c[2]])),center:CAVE.centre,fields:{},register:REGISTER,err:reportErr,
 lod:{hero:60,mid:160,far:420,floor:[40,110]},windows:{}});
