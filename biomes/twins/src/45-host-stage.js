// ================================================================= HOST — stage (every station's frame and renderer)
// The ideal-type host for THE TWINS (PLAN.md): the range between Xanadu and the Catch, two small active volcanoes on it and the two
// caravan crossings. Each station (stations/<name>/44a-host-station.js: STN) is a 9.6 km square of scale model 5.1 round its site, its
// ground a model of its own (stations/<name>/45b-host-model.js: baseH, STRATA, MODEL) eased into the map's relief (REGION) toward the
// square's edge, and the far country past it the map's own (82-host-far.js). The biome fragments read nothing from here except
// through BIO.host. Started from the Godthrone's stage (biomes/godthrone/src/45-host-stage.js: the same rock, the same frame).
//
// HEIGHTS ARE TRUE: y is metres above Krator's datum (scale model 5.1: the pyroduct's skylight at ~4,300 m), so the shared sky's thin
// air (89-host-sky.js), the strata's alteration line and the hazards' pressure read the page's y as they are.
// THE FRAME: x east, z south, metres, its origin on the station's site (STN.site: the 5.1 pixel), 2,000 m a pixel; a place on the map
// is pxXZ(px, py) in it (the Twins' cones, the next station's oasis).
const {TAU,clamp,lerp,mix,smooth,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
const WORLD=0x7A15;   // the kit's world seed: every draw is KRAND.hash(WORLD, cell, index, salt)
const KR=KRAND,vn=(x,z,sd)=>KR.vnoise(x,0,z,sd),fb=(x,z,o,sd)=>KR.fbm(x,0,z,o,sd);
const pxXZ=(px,py)=>[(px-STN.site.px)*2000,(py-STN.site.py)*2000];

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// the air at 3.7-5.9 km is 0.75-1.0 atm (the model's law, 89-host-sky.js): the shared sky sets the fog; this is only its starting value.
// The far plane reaches the Catch's floor and the Twins' cones (the NW Twin 24 km from station 1) and the range beyond
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x9aa4b0,.00002);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,160000);
const hemi=new THREE.HemisphereLight(0x9aa4b8,0x3a3430,.4);scene.add(hemi);
const SUN_POS=[1100,1500,700];   // a starting sun; the shared sky moves it to the hour's
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);

// ---------------------------------------------------------------- the frame
const TERR=(function(){const R=STN.R,c=STN.centre;return{R,cx:c[0],cz:c[1],X0:c[0]-R,X1:c[0]+R,Z0:c[1]-R,Z1:c[1]+R};})();   // the station's square (STN)
