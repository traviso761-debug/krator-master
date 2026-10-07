// ================================================================= HOST — stage (station 2: the kipuka)
// The ideal-type host for THE THRONE's windward station: renderer, lights, haze, the land before the lava. The kit's
// flow model (46) lays the lava over it and 47 finishes the ground; the hyperjungle kit (read in place, station.json)
// plants the kipuka. The core's helpers (TAU, rng, fbm...) are globals here: the hyperjungle's 41 declares them.
//
// THE MAP (x east, z south; R 2600). A 5.2 km piece of the Throne's WEST flank, about 110 km from the summit (which is
// to the east, 11 km higher), ~300 m below the crater's datum (~1.66 atm, Af, ~4 m of rain a year: NOTES.md, the W
// transect). The ground rises gently to the east. Flows from vents up the flank, off the map, have run down it over
// the centuries and gone round the old high ground: what they spared is KIPUKA, islands of old forest (the hyperjungle,
// Girder-tall) in a sea of younger lava where Earth's pioneers (lehua, tree ferns, ferns, moss) and the glassfern are
// taking hold. Streams run through the old ground and sink where a flow has buried their beds.
//   HILLS    old cones and ridges the flows went round: the kipuka's cores
//   STREAMS  two perennial streams in the old ground, running west to the sea
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: dense wet air (~1.66 atm, near saturated): a soft blue-green haze, a strong sky fill, the sun warm from the
// sea in the west-south-west
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb8c4c0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xa8bccc,0x4a5a3a,.9);scene.add(hemi);
const SUN_POS=[-850,900,500];
const sun=new THREE.DirectionalLight(0xffe2b8,1.2);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c8d0,.26);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the land before the lava
const TERR={R:2600};
const UP=[.97,-.24],DN=[-.97,.24],PERP=[.24,.97];   // toward the summit (east), down the flank (west), across
function slopeH(x,z){const u=x*UP[0]+z*UP[1];
 return -300+.065*u+26*(fbm(x*.0005+3,z*.0005-1,17,3)-.5)+9*(fbm(x*.0024-5,z*.0024+2,19,2)-.5);}
// the old high ground the flows went round (the kipuka's cores): low rounded cones and ridges, long weathered
const HILLS=[{x:-250,z:-950,r:470,h:34,s:1.3},{x:750,z:350,r:400,h:30,s:2.2},{x:-1250,z:750,r:540,h:38,s:3.1},{x:1550,z:-1400,r:420,h:30,s:4.7},
 {x:-1950,z:-1650,r:330,h:24,s:5.9},{x:150,z:1650,r:380,h:26,s:6.4}];
function hillH(x,z){let h=0;for(const H of HILLS){const dx=x-H.x,dz=z-H.z,D=Math.hypot(dx,dz);if(D>H.r*1.5)continue;
 const a=Math.atan2(dz,dx),d=D/(H.r*(1+.12*Math.sin(3*a+H.s)+.07*Math.sin(5*a+2*H.s)));h=Math.max(h,H.h*Math.pow(smooth(1.25,0,d),1.6));}return h;}
// THE STREAMS: perennial, meandering west across the flank; each a centre line along the fall line (P0 a point on it).
// Their lines are CHOSEN after the lava (47: the lines through the most old ground) and cut after it: a stream valley cut
// before the flows would only have led the lava down it and buried it
// (w at least ~12 m: the ground mesh's vertices are ~10 m apart, and a narrower bed is smoothed over, its water hidden)
const STREAMS=[{x:-600,z:-200,w:14,d:3.5,amp:110,f:.0019,ph:.7},{x:400,z:1100,w:12,d:3,amp:90,f:.0023,ph:2.4}];
function streamD(x,z,S){const s=(x-S.x)*DN[0]+(z-S.z)*DN[1],l=(x-S.x)*PERP[0]+(z-S.z)*PERP[1]-S.amp*Math.sin(s*S.f+S.ph)-.35*S.amp*Math.sin(s*S.f*2.6);return{s,l,d:Math.abs(l)};}
function streamPt(S,s){const o=S.amp*Math.sin(s*S.f+S.ph)+.35*S.amp*Math.sin(s*S.f*2.6);return[S.x+DN[0]*s+PERP[0]*o,S.z+DN[1]*s+PERP[1]*o];}
function streamAt(x,z){let cut=0,bank=0,bed=0;for(const S of STREAMS){const g=streamD(x,z,S);if(g.d>S.w*6)continue;
  cut=Math.max(cut,S.d*Math.pow(smooth(S.w*4,S.w*.6,g.d),1.3));bank=Math.max(bank,smooth(S.w*5,S.w*1.5,g.d));bed=Math.max(bed,smooth(S.w*1.2,S.w*.5,g.d));}
 return{cut,bank,bed};}
// the land before any lava (the flow model routes lava over it)
function landH0(x,z){return slopeH(x,z)+hillH(x,z);}
// no plume here: it leans away to the south-east, far over the shoulder (the kit's plume field is 0)
function plumeAt(x,z){return 0;}
