// ================================================================= HOST — stage (station 13: the blast zone)
// The ideal-type host for a lateral blast on THE THRONE's north-north-east flank (PLAN.md, "New stations"; map 5.1: 28-32 px north-north-east
// of the summit, 2.2-2.8 km up, Dfb and Dfc forest, 400-900 mm; upwind of the plume). A flank cryptodome swelled under the forest, its north
// face slid away, and the dome blew out sideways (St Helens, 1980): a few years on, the forest lies flattened in a fan down the flank.
//
// THE MAP (x east, z south; R 2600). The flank falls north-north-east at ~7 %. THE SCAR, the collapsed dome's horseshoe, opens north on the
// map's south edge; under it THE PUMICE PLAIN, the pyroclastic flows' fill, near level. Out from the scar THE BLAST's field (BLAST.at: 0..1,
// strongest on its axis, NNE) sets the zones: the direct-blast zone stripped to bare ash; the tree-removal zone, stumps; the BLOWDOWN, every
// log laid along the blast (BLAST.logs: placed records, each with the field's yaw); the SEARED zone, trees standing dead; then the living
// forest (the kit's cold-belt conifers and gill-corals). The first pioneers (lichen, the kit's cushions) on the ash.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;document.body.appendChild(renderer.domElement);
// THE LIGHT: thin air (~0.4 atm): a hard white sun, a deep blue sky darkening overhead, almost no haze; the lava lake's glow
// (a warm light from the caldera, faint by day, strong at night: 86)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb8c8dc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,20000);
const hemi=new THREE.HemisphereLight(0x8aa4cc,0x7a7c84,.7);scene.add(hemi);
const SUN_POS=[-850,900,500];
const sun=new THREE.DirectionalLight(0xfff6ea,1.35);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8b8d8,.18);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the flank, the scar, the blast
const TERR={R:2600};
// upslope is south-south-west (toward the summit), the blast's axis north-north-east: u up the flank, v across it
const UPV=[-.342,.940],AX=[.342,-.940];
const uOf=(x,z)=>x*UPV[0]+z*UPV[1],vOf=(x,z)=>x*UPV[1]-z*UPV[0];
const BLAST={x:-300,z:2050,r:520,dmax:3900,half:1.35,base:2450,slope:.07,name:'The blast zone'};
// the field: 1 at the scar's mouth, falling with distance, reaching farthest along the axis and dying past the fan's half angle
BLAST.at=(x,z)=>{const dx=x-BLAST.x,dz=z-BLAST.z,d=Math.hypot(dx,dz);if(d<1)return 1;const c=(dx*AX[0]+dz*AX[1])/d,a=Math.acos(clamp(c,-1,1));
 const reach=BLAST.dmax*(.35+.65*Math.max(0,Math.cos(a/BLAST.half*Math.PI/2)))*(1+.12*(fbm(Math.atan2(dz,dx)*2.3,3.1,1301,2)-.5)*2);return clamp(1-d/reach,0,1);};
// the blast's direction at a point: radial from the scar (a log lies along it)
BLAST.dir=(x,z)=>{const dx=x-BLAST.x,dz=z-BLAST.z,d=Math.hypot(dx,dz)||1;return[dx/d,dz/d];};
BLAST.logs=[];   /* the downed logs: placed records {x, z, y, yaw, len, r, zone}, laid in 86 */
const PEN={x:0,z:0,v:0};   /* unused here (the penitentes' fork): the camera's patch is the blowdown's (47) */function plumeAt(x,z){return 0;}// THE AIR's height fog (89zz-host-core.js; the final rebuild): a dawn mist in the forest's hollows, thin over the ash
const ATMOS_AIR={falloff:1/900,sun:.35,sky:.35,mist:{density:.001,below:40,depth:30,noise:.7}};
