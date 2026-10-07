// ================================================================= HOST — stage (station 10: the rim over the caldera)
// The ideal-type host for THE THRONE's summit (NOTES.md: the summit 10.9 km, the plateau above 9 km, the caldera floor ~10.3
// km; the death zone at ~0.4 atm, "climbable, not liveable"; the summit glow): renderer, the thin air's light, the rim and
// the caldera as DATA; 47 cuts the rest.
//
// THE MAP (x east, z south; R 2600). The caldera's west rim, ~10.75 km up, its peaks to ~10.85. The caldera opens to the
// east: its wall drops in terraces ~450 m to a floor of old lava at ~10.3 km, and in the floor THE LAVA LAKE, crusted and
// churning, the plume roaring up out of it (the column straight up overhead here, leaning away south-east kilometres up).
//   THE RIM        a jagged ring of rim peaks, the outer side armoured in ice and snow, the inner side bare hot rock and
//                  sulphur; frozen fumaroles (ice towers) along its crest, steaming
//   THE WALL       the caldera's inner wall, terraced by its old collapses, banded by its flows, fumaroles steaming from it
//   THE FLOOR      old lava sheets and small spatter cones round the lake's pit
//   THE LAKE       the lava lake: a crust of plates cracking and sliding over glowing lava, fountaining here and there
//   THE PLATEAU    behind the rim to the west: the summit plateau's snowfield, sculpted by the sun into PENITENTES
// Nothing lives here but lichen on the rim's rocks and a little of Krator's own on the warm ground by the fumaroles.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
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

// ---------------------------------------------------------------- the rim and the caldera
const TERR={R:2600};
// the caldera: its centre off the map to the east; the rim's crest a ragged circle round it; the wall's foot; the floor
const CAL={x:2000,z:-150,crest:2150,foot:1550,rim:10750,floor:10300,name:'The caldera'};
const calR=(x,z)=>Math.hypot(x-CAL.x,z-CAL.z),calA=(x,z)=>Math.atan2(z-CAL.z,x-CAL.x);
// the crest's radius and its peaks by angle round the caldera (ragged: the rim peaks stand up between the notches)
const crestR=a=>CAL.crest+110*(fbm(Math.cos(a)*1.6+3,Math.sin(a)*1.6,111,3)-.5)*2;
const peakH=a=>{const r=1-Math.abs(fbm(Math.cos(a)*3.1,Math.sin(a)*3.1-2,112,3)*2-1);return 15+85*Math.pow(r,2.2);};
// THE LAKE: in a pit in the floor, toward this side of the caldera
const LAKE={x:1450,z:-80,r:560,pit:28,name:'The lava lake (the plume rises out of it)'};LAKE.level=CAL.floor-LAKE.pit+6;
// its outline is not a circle (the owner's): lobed and ragged, its radius by angle; de(x,z) the distance from its middle scaled
// so the outline sits at LAKE.r everywhere (the pit, the fields, the glowing ring and the surface all read it)
LAKE.rAt=a=>LAKE.r*(1+.17*(fbm(Math.cos(a)*1.4+5,Math.sin(a)*1.4-2,131,3)-.5)*2+.08*Math.sin(3*a+1.1)+.05*Math.sin(5*a+2.3));
LAKE.de=(x,z)=>Math.hypot(x-LAKE.x,z-LAKE.z)*LAKE.r/LAKE.rAt(Math.atan2(z-LAKE.z,x-LAKE.x));
// THE CONES on the floor round the lake
const CONES=(function(){reseed(5001);const o=[];for(let k=0;k<60&&o.length<6;k++){const a=rr(0,TAU),d=rr(LAKE.r*1.25,LAKE.r*2.1),x=LAKE.x+Math.cos(a)*d,z=LAKE.z+Math.sin(a)*d;
  if(calR(x,z)>CAL.foot-120||o.some(C=>Math.hypot(C.x-x,C.z-z)<C.r+90))continue;o.push({x,z,r:rr(40,90),h:rr(14,34)});}return o;})();
// THE FUMAROLES: on the rim's crest (they freeze into towers on the outer side), down the wall, by the lake
const FUMS=(function(){reseed(5002);const o=[];
 for(let k=0;k<14;k++){const a=Math.PI+rr(-1.0,1.0),r=crestR(a)+rr(-40,60);o.push({x:CAL.x+Math.cos(a)*r,z:CAL.z+Math.sin(a)*r,s:rr(.5,1),rim:true});}
 for(let k=0;k<12;k++){const a=Math.PI+rr(-1.1,1.1),r=rr(CAL.foot+40,crestR(a)-80);o.push({x:CAL.x+Math.cos(a)*r,z:CAL.z+Math.sin(a)*r,s:rr(.6,1),rim:false});}
 return o;})();
// the plume's column: out of the lake, straight up, then leaning away south-east on the high wind
const PLUME={x:LAKE.x,z:LAKE.z,base:LAKE.level,lean:[.55,.35],name:'The plume'};
function plumeAt(x,z){return 0;}
