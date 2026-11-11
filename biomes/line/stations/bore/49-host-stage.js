// ================================================================= HOST — stage: the bore (renderer, light, the floor the eye stands on, BIO.init)
// The Line's light (biomes/line/PLAN.md section 6): no daylight; the Tungangs' lamp code on the ways (green lamps every 50 m on the walkway,
// the central strip and the road: the Line's colour), the Ancients' crown fittings dead, an amber work lamp at the vein; a faint warm-grey ambient
// so nothing is black, and the visitor's own lamp (a spot on the camera; ?lamp=0 off). The air: still, warm, dusty: a dark fog that takes the
// lamps down the bore to a point. ?exposure= sets the exposure.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y==null?0:r.y)-2&&y<=(r.y==null?0:r.y)+r.h+5;}
const Q=new URLSearchParams(location.search);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=Q.has('exposure')?+Q.get('exposure'):1.35;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0x0e1010);scene.background=HAZE.clone();scene.fog=new THREE.FogExp2(HAZE.getHex(),.0028);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.15,1800);scene.add(camera);
/* the ambient: a neutral warm grey, so the lining, the white panel and the rust read true (Dhelv's lesson: coloured light as the main light
   turns every surface to mud; the code's green marks the ways, it does not light them) */
const HEMI=new THREE.HemisphereLight(0x7a766c,0x2a2824,.5);scene.add(HEMI);
/* the visitor's lamp: a warm white spot riding the camera (?lamp=0 off) */
const LAMP=Q.get('lamp')==='0'?null:(function(){const s=new THREE.SpotLight(0xfff2e2,2.4,90,.5,.6,1.3);s.position.set(0,.25,0);camera.add(s);s.target.position.set(0,-.1,-1);camera.add(s.target);return s;})();
/* the lamp code's pool: the 12 green lamps nearest the eye are real lights (Dhelv's pool), the rest glow only; one amber at the vein */
const LAMP_POOL=(function(){const P=[];for(let i=0;i<12;i++){const l=new THREE.PointLight(0x9cf0b4,.55,22,1.8);l.position.set(0,-50,0);scene.add(l);P.push(l);}return P;})();
tick(function lampPool(){const c=camera.position,L=LINE.lamps.slice().sort((a,b)=>(Math.abs(a.z-c.z)+Math.abs(a.x-c.x)*.3)-(Math.abs(b.z-c.z)+Math.abs(b.x-c.x)*.3));
 LAMP_POOL.forEach((l,i)=>{const r=L[i];if(r)l.position.set(r.x,r.y-.1,r.z);});});
const WORK_LAMP=(function(){const V=LINE.vein,l=new THREE.PointLight(0xffb060,2.2,26,1.6);l.position.set(V.pts[0][0]+1,V.pts[0][1]+2,V.pts[0][2]);scene.add(l);return l;})();

// ---------------------------------------------------------------- the floor the eye stands on (and BIO's ground)
// The section's floors (PLAN.md section 3), across x: the road and its footway, the barrier, the invert, the guideways' tops, the central
// strip, the walkway; past the walls the rock (the niches and the vein's gallery stand on their own floors: KWALK has them)
const SEC=LINE.SEC;
function sectionFloor(x){const G=SEC.guide;
 if(x<SEC.road.foot[1])return SEC.road.footY;
 if(x<SEC.road.barrier[0])return SEC.road.y;
 if(x<SEC.road.barrier[1])return SEC.road.y+SEC.road.barrierH;
 for(const T of SEC.tracks)if(Math.abs(x-T.x)<=G.w/2)return G.h;
 if(x>=SEC.strip.x0&&x<=SEC.strip.x1)return SEC.strip.y;
 if(x>=SEC.walk.x0)return SEC.walk.y;
 return 0;}
const WALKREG=LINE.walk(KWALK.create());
function terrainH(x,z){if(x<SEC.x0||x>SEC.x1){const f=WALKREG.floorBelow(x,z,4,6);return f?f[0]:SITE.cover;}return sectionFloor(x);}
const waterH=()=>-1e9;
const groundEye=terrainH;

BIO.init({tags:'line',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>0,obstacles:[],ticks:tick,seed:2081,
 origin:[[0,0],[0,600],[0,1200]],center:[0,600],fields:{},register:REGISTER,err:reportErr,
 lod:{hero:60,mid:160,far:420,floor:[40,110]},windows:{}});
