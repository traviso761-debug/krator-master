// ================================================================= HOST — stage (station 6: the south-flank savanna)
// The ideal-type host for THE THRONE's south shoulder (NOTES.md, "The shoulders": the flank between the windward and the
// lee, turning dry; star aloes over yellow grass, cap-tree woodland, stilt parasols along the braided lahar channels,
// Krator's familiar species crossing in): renderer, a hot dry-season light, the flank and its layout as DATA; 47 cuts the
// land and binds the kit.
//
// THE MAP (x east, z south; R 2600). 5.2 km of the south flank ~1 km up, ~100 km from the summit (due north, ~5.7 degrees
// up). The flank falls south at ~6 %, ~1.15 km at the north edge to ~0.85 km at the south. Aw/BSh: a wet season, a long dry.
//   THE FAN       a lahar fan down the middle, widening south: grey gravel bars between braided channels, dry now but
//                 for the pools in them; lahar boulders the size of huts strewn on it; stilt parasols along its channels
//   THE SAVANNA   tall yellow grass either side, star aloes, frill-trees and trumpet trees scattered
//   THE WOODS     patches of gill-parasol woodland on the older ground
//   THE BURN      a fresh fire scar east of the fan, black stubble, the first green, the fire flowers
//   THE KOPJES    knolls of old basalt boulders, lichened
//   THE DONGAS    dry gullies cut into the flanks
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
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: the dry season's: a hard high sun, a warm dusty haze (~1.5 atm)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4ccb8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00019);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xc4ccd4,0x6a5a3a,.85);scene.add(hemi);
const SUN_POS=[-500,1100,700];
const sun=new THREE.DirectionalLight(0xfff0d0,1.35);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8d0d8,.22);fill.position.set(900,400,-900);scene.add(fill);

// ---------------------------------------------------------------- the flank and its layout
const TERR={R:2600};
const SEA=-1530;
// down the flank is +z (the summit due north)
function flankH(x,z){return 1000-.06*z+12*(fbm(x*.0011+3,z*.0011-1,17,3)-.5)+4*(fbm(x*.005-5,z*.005+2,19,2)-.5);}
// THE FAN: its centre line and half-width, widening downslope
const FAN={cx:z=>150*Math.sin(z*.0007+.5)+60*Math.sin(z*.002+1.1),W:z=>260+180*clamp((z+2600)/5200,0,1)};
const fanIn=(x,z)=>{const d=Math.abs(x-FAN.cx(z))/FAN.W(z);return smooth(1.08,.9,d+.06*(fbm(x*.01,z*.01,31,2)-.5));};
// THE CHANNELS: eight wandering across the fan, crossing and parting (braided); each a shallow bed
const CHANNELS=(function(){reseed(4531);const o=[];for(let i=0;i<8;i++){const f=rr(.0011,.0032),ph=rr(0,TAU),a=rr(.35,.92),f2=rr(.004,.009),ph2=rr(0,TAU);
  o.push({i,w:rr(4,10),d:rr(.8,1.6),x:z=>FAN.cx(z)+FAN.W(z)*(a*Math.sin(z*f+ph)+.08*Math.sin(z*f2+ph2))});}return o;})();
// THE KOPJES: knolls of old basalt boulders
const KOPJES=[{x:-1300,z:-900,r:52,h:17},{x:1450,z:900,r:40,h:12},{x:-1650,z:1250,r:46,h:15},{x:900,z:-1700,r:34,h:10}].map((k,i)=>Object.assign(k,{name:'A kopje (old basalt boulders)',i}));
// THE DONGAS: dry gullies cut into the flanks, running down (south)
const DONGAS=[{x:-1100,amp:60,f:.002,ph:.4,w:5,d:4},{x:1200,amp:70,f:.0017,ph:2.3,w:6,d:5}].map((D,i)=>Object.assign(D,{name:'A donga (a dry gully)',cx:z=>D.x+D.amp*Math.sin(z*D.f+D.ph)}));
// THE BURN: a fresh fire scar east of the fan (a ragged blob)
const BURN={x:1050,z:-150,rx:620,rz:480};
const burnAt=(x,z)=>{const d=Math.hypot((x-BURN.x)/BURN.rx,(z-BURN.z)/BURN.rz)+.35*(fbm(x*.004,z*.004,41,3)-.5);return smooth(1.0,.9,d);};
function plumeAt(x,z){return 0;}
