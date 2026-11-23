// ================================================================= HOST — stage: renderer, the Line's light, the floor the eye stands on, BIO.init
// The Line's light (biomes/line/PLAN.md section 6): no daylight; the Tungangs' lamp code on the ways (green: the Line; the 12 nearest are real lights,
// Dhelv's pool), the window's own lights (LINE.lights: an amber work lamp, a station's warm lamps), a neutral warm-grey ambient so the lining, the
// white panel and the rust read true (Dhelv's lesson: coloured light as the main light turns every surface to mud), and the visitor's own lamp
// (a spot on the camera; ?lamp=0 off). A window may set LINE.ambient {sky, ground, k, exposure, fog}. ?exposure= sets the exposure.
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
const AMB=Object.assign({sky:0x7a766c,ground:0x2a2824,k:.5,exposure:1.35,fog:.0028,haze:0x0e1010},LINE.ambient||{});

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=Q.has('exposure')?+Q.get('exposure'):AMB.exposure;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(AMB.haze);scene.background=HAZE.clone();scene.fog=new THREE.FogExp2(HAZE.getHex(),AMB.fog);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.15,1800);scene.add(camera);
const HEMI=new THREE.HemisphereLight(AMB.sky,AMB.ground,AMB.k);scene.add(HEMI);
const LAMP=Q.get('lamp')==='0'?null:(function(){const s=new THREE.SpotLight(0xfff2e2,2.4,90,.5,.6,1.3);s.position.set(0,.25,0);camera.add(s);s.target.position.set(0,-.1,-1);camera.add(s.target);return s;})();
/* the lamp code's pool: the 12 green lamps nearest the eye are real lights; the rest glow only */
const GREENS=LINE.lamps.filter(l=>l.kind==='green'&&l.on!==false);
const LAMP_POOL=(function(){const P=[];for(let i=0;i<12;i++){const l=new THREE.PointLight(0x9cf0b4,.55,22,1.8);l.position.set(0,-500,0);scene.add(l);P.push(l);}return P;})();
tick(function lampPool(){const c=camera.position,L=GREENS.slice().sort((a,b)=>(Math.abs(a.z-c.z)+Math.abs(a.x-c.x)*.3+Math.abs(a.y-c.y)*.3)-(Math.abs(b.z-c.z)+Math.abs(b.x-c.x)*.3+Math.abs(b.y-c.y)*.3));
 LAMP_POOL.forEach((l,i)=>{const r=L[i];if(r)l.position.set(r.x,r.y-.1,r.z);else l.position.set(0,-500,0);});});
const WIN_LIGHTS=(LINE.lights||[]).map(o=>{const l=new THREE.PointLight(o.color,o.intensity,o.range,o.decay==null?1.6:o.decay);l.position.set(o.x,o.y,o.z);scene.add(l);return l;});

// ---------------------------------------------------------------- the floor the eye stands on (and BIO's ground)
// The highest walk floor over (x, z) that is not a bridge (a footbridge does not hide the floor under it), else the window's own floor function
const SEC=LINE.SEC;
const WALKREG=LINE.walk(KWALK.create());
function terrainH(x,z){const F=WALKREG.floorsAt(x,z);for(const f of F){const t=f[1]&&f[1].tag||'';if(!/bridge/.test(t))return f[0];}return LINE.floorAt(x,z);}
const waterH=LINE.waterH||(()=>-1e9);
const groundEye=(x,z)=>Math.max(terrainH(x,z),waterH(x,z));

BIO.init({tags:'line',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>0,obstacles:[],ticks:tick,seed:2081,
 origin:[[0,LINE.WIN.walk0],[0,(LINE.WIN.walk0+LINE.WIN.walk1)/2],[0,LINE.WIN.walk1]],center:[0,(LINE.WIN.walk0+LINE.WIN.walk1)/2],fields:{},register:REGISTER,err:reportErr,
 lod:{hero:60,mid:160,far:420,floor:[40,110]},windows:{}});
