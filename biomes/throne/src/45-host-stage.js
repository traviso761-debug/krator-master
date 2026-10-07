// ================================================================= HOST — stage
// The ideal-type host for THE THRONE, station 1: renderer, lights, haze, the land before the lava (the shield's
// flank, its gullies, the rift's cones), the plume, the tick list, the error panel. The kit's flow model (46) then
// lays the lava over this land, and 47 finishes the ground (terrainH, waterH, the fields, BIO.init). A real world
// replaces 45 and 47 with its own; the kit's fragments never read anything from them except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600). A 5.2 km piece of the Throne's
// south-east shoulder, about 95 km from the vent, ~1.9 km up (~1.26 atm, BSk / Csa: biomes/throne/NOTES.md). The
// summit is to the north-north-west, so the ground falls about 9% toward the south-south-east. The plume's
// south-western edge crosses the map: the west is the shoulder's clear air, the east lies under the plume.
//   THE RIFT      a rift zone runs down the middle of the map, radial to the summit (NNW-SSE): five vents on it,
//                 old to new from the top: the Sentinel (an old forested cone), a spatter pair, the fissure, the pit
//                 crater (an acid lake), the new cone (two years old, steaming), the Lower cone
//   THE FLOWS     lava from those vents, every age from two years to thousands (46: the kit's flow model)
//   THE GULLIES   two barrancos cut into the old ground on the west, the shoulder's side
//   THE TUBE      a lava tube under the Sentinel's flow, open to the sky at its skylights (47)
// Where everything is lies in data below (RIFT, CONES, PIT, GULLY, FLOW_SRC in 47), so a camera or a check finds it.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js, and its mesh silently does not draw: the panel
// shows it, so verify.py fails on it (crater drylands' lesson)
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT. ~1.26 atm here, lighter than the crater floor, but the plume's haze hangs over the east: the air is a
// warm grey, the sun a little dimmed and yellowed, the fill strong. 82-host-sky sets the night.
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4bdb0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00021);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xa8b4c4,0x5e5048,.82);scene.add(hemi);
const SUN_POS=[-850,900,500];   // azimuth 240, altitude 42: the west-south-west, so the giant in the north-east is half lit
const sun=new THREE.DirectionalLight(0xffdcae,1.28);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8bcd0,.24);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the land before the lava
const TERR={R:2600};
const UP=[-.5,-.866],DN=[.5,.866],PERP=[.866,-.5];   // toward the summit, away from it (downslope), across
// the shield's flank: ~9% down toward the south-south-east, with long low swells
function slopeH(x,z){const u=x*UP[0]+z*UP[1];
 return 1850+.092*u+34*(fbm(x*.00045+3,z*.00045-1,17,3)-.5)+11*(fbm(x*.0021-5,z*.0021+2,19,2)-.5);}
// THE RIFT: a line radial to the summit through the middle of the map; t metres along it, downslope
const RIFT={x:250,z:-150};
const riftPt=(t,l)=>[RIFT.x+DN[0]*t+PERP[0]*(l||0),RIFT.z+DN[1]*t+PERP[1]*(l||0)];
// THE CONES on the rift, oldest first (age in years since they last erupted; h, r in metres; crater: its radius as
// a share of r; breach: the azimuth its crater wall is broken toward, or null)
const CONES=[
 {key:'sentinel',name:'The Sentinel (an old cinder cone)',t:-1950,l:-120,h:118,r:420,crater:.42,cd:26,age:2600},
 {key:'pair',name:'The spatter pair',t:-980,l:40,h:42,r:170,crater:.4,cd:14,age:18},
 {key:'pair2',name:'The spatter pair',t:-860,l:110,h:30,r:125,crater:.38,cd:10,age:18},
 {key:'newcone',name:'The new cone (two years old)',t:520,l:-30,h:74,r:240,crater:.44,cd:22,age:2},
 {key:'lower',name:'The Lower cone',t:1500,l:60,h:58,r:260,crater:.4,cd:16,age:780},
];
CONES.forEach(C=>{const p=riftPt(C.t,C.l);C.x=p[0];C.z=p[1];});
// THE PIT CRATER: a collapse on the rift, steep-walled, an acid lake in its floor (47 fills it)
const PIT=(function(){const p=riftPt(-210,70);return{x:p[0],z:p[1],r:150,depth:58};})();
// THE FISSURE: between the spatter pair and the pit, a crack with a low spatter rampart on either lip
const FISS={t0:-760,t1:-330,l:80};
function coneH(x,z){let h=0,cin=0,bare=0;
 for(const C of CONES){const dx=x-C.x,dz=z-C.z,D=Math.hypot(dx,dz);if(D>C.r*1.3)continue;
  const a=Math.atan2(dz,dx),d=D/(C.r*(1+.06*Math.sin(3*a+C.t*.01)+.04*Math.sin(7*a)));
  // a cinder cone: straight-sided at the angle of repose, a rounded rim, a bowl crater; the foot spreads in an apron
  let c=C.h*Math.pow(smooth(1.0,C.crater*.95,d),.9)+C.h*.1*smooth(1.25,.9,d)*smooth(.6,1.0,d);
  c-=C.cd*smooth(C.crater*1.02,C.crater*.25,d);
  // loose cinder shows on a young cone; an old one (the Sentinel) has weathered to soil and is wooded
  h=Math.max(h,c);cin=Math.max(cin,smooth(1.12,.85,d)*smooth(2400,250,C.age));
  // a cone a few decades old is still bare cinder: nothing has rooted in it yet
  bare=Math.max(bare,smooth(1.05,.85,d)*smooth(60,15,C.age));}
 return{h,cin,bare};}
function fissH(x,z){const s=(x-RIFT.x)*DN[0]+(z-RIFT.z)*DN[1];if(s<FISS.t0-30||s>FISS.t1+30)return 0;
 const l=(x-RIFT.x)*PERP[0]+(z-RIFT.z)*PERP[1]-FISS.l-14*Math.sin(s*.011),e=smooth(FISS.t0-30,FISS.t0+40,s)*smooth(FISS.t1+30,FISS.t1-40,s);
 // two spatter ramparts, 5 m high, either side of a 3 m crack
 return e*(5*Math.exp(-Math.pow((Math.abs(l)-7)/5,2))-4*smooth(2.4,.6,Math.abs(l)));}
// THE GULLIES (barrancos): cut downslope into the old ground on the west; each a centre line meandering across its
// downslope axis, deepening as it goes (P0 a point on it, d0 its depth there, w its half-width)
const GULLY=[{x:-1700,z:-200,d0:12,k:.004,w:34,amp:90,f:.0021,ph:.4},{x:-900,z:700,d0:9,k:.003,w:26,amp:70,f:.0027,ph:2.1}];
function gullyD(x,z,G){const s=(x-G.x)*DN[0]+(z-G.z)*DN[1],l=(x-G.x)*PERP[0]+(z-G.z)*PERP[1]-G.amp*Math.sin(s*G.f+G.ph)-.3*G.amp*Math.sin(s*G.f*2.7);return{s,d:Math.abs(l)};}
function gullyAt(x,z){let cut=0,fl=0;for(const G of GULLY){const g=gullyD(x,z,G),dep=Math.max(3,G.d0+G.k*g.s),W=G.w*(1+.25*(fbm(g.s*.004,G.x,77,2)-.5));
  if(g.d>W*3.2)continue;cut=Math.max(cut,dep*Math.pow(smooth(W*3,W*.25,g.d),1.4));fl=Math.max(fl,smooth(W*1.1,W*.35,g.d));}
 return{cut,fl};}
// the land before any lava (the flow model routes lava over it): the flank, the gullies, the cones and the fissure
function landH0(x,z){return slopeH(x,z)-gullyAt(x,z).cut+coneH(x,z).h+fissH(x,z);}

// ---------------------------------------------------------------- the plume
// How far under the plume a point lies, 0 (the shoulder's clear air) to 1. The plume leans south-east from the
// summit; its south-western edge runs across the map from north to south, a little ragged. This is the kit's
// 'plume' field (BIOME-API.md): it drives the turn from familiar life to Krator's own.
function plumeAt(x,z){const p=x*.82-z*.24+560*(fbm(x*.0004+7,z*.0004-3,61,2)-.5)+140*(fbm(x*.0016,z*.0016,63,2)-.5);return smooth(-1500,1350,p);}
