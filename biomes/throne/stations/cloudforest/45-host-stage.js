// ================================================================= HOST — stage (station 5: the cloud forest)
// The ideal-type host for THE THRONE's windward cloud belt (NOTES.md: 2.5-3.5 km up on the windward flank, Cfb, the cloud
// most days): renderer, an overcast light, the haze, the flank and its layout as DATA; 47 cuts the land and binds the kit.
//
// THE MAP (x east, z south; R 2600). 5.2 km of the Throne's west flank ~3 km up, ~90 km from the summit (due east, ~5 degrees
// up when the cloud lifts). The flank rises east at ~10 %, so the map spans ~2.75 km to ~3.3 km: the cloud belt's core.
//   THE ELFIN WOODS  gnarled, dwarfed, moss-draped trees in the cloud (the owner: "elfin forest in the mist")
//   THE RAVINES      three running down the flank (west): the north and the middle ravines with streams; THE RAVINE OF
//                    THE FALLS between them, its bed stepping down in four falls, a plunge pool under each
//   THE RIDGE        an old rift ridge along the south edge, crags on its crest, a saddle where the natives' trail crosses;
//                    the cloud pours over its crest and dies on the drier heath beyond (the lee strip)
//   THE TRAIL        the natives' route up the flank to the saddle and over, its cairns
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
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: inside the cloud (~0.7 atm): a soft white overcast, the sun a pale disc when it shows; the fog's density is the
// weather's (89: fog most of the day, drizzle, a clear spell)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4d8d8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.0055);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
const hemi=new THREE.HemisphereLight(0xd0d8dc,0x4a5a40,1.15);scene.add(hemi);
const SUN_POS=[-700,1000,300];
const sun=new THREE.DirectionalLight(0xfff0dc,.6);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8d4d8,.3);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the flank
const TERR={R:2600};
const SEA=-1530;
// up the flank is +x (the summit due east); the flank at x=0 stands 3000 m up
function flankH(x,z){return 3000+.1*x+.000004*x*x+18*(fbm(x*.0012+3,z*.0012-1,17,3)-.5)+5*(fbm(x*.006-5,z*.006+2,19,2)-.5);}
// THE RAVINES: down the flank (along x); c(x) their centre line in z; w the floor's half-width, d the cut. The middle one,
// THE RAVINE OF THE FALLS, steps down in falls (STEPS: where its bed drops d metres, and the gorge below that shallows
// again over L metres downstream)
const RAVINES=[
 {key:'north',name:'The north ravine',z:-1450,amp:45,f:.0021,ph:.3,w:7,d:16},
 {key:'falls',name:'The ravine of the falls',z:-380,amp:38,f:.0017,ph:1.9,w:9,d:20,
  steps:[{x:1350,d:24,L:420},{x:620,d:36,L:520},{x:-180,d:19,L:380},{x:-950,d:30,L:480}]},
 {key:'middle',name:'The middle ravine',z:650,amp:50,f:.0024,ph:4.1,w:7,d:14}];
const ravC=(V,x)=>V.z+V.amp*Math.sin(x*V.f+V.ph);
// the gorge's depth below the flank at x: its base cut, and below each step the extra depth the fall has cut, shallowing
// downstream (the flank catches the bed up again)
function ravDepth(V,x){let d=V.d*smooth(2500,2100,x);if(V.steps)for(const S of V.steps)d+=S.d*smooth(S.x+1.2,S.x-1.2,x)*Math.exp(-Math.max(0,S.x-x)/S.L);return d;}
// THE RIDGE: along the south edge, its crest at zc(x); a saddle where the trail crosses
const RIDGE={zc:x=>1880+110*Math.sin(x*.0011+.4)+40*Math.sin(x*.003+2),h:x=>95+35*fbm(x*.004,7,23,2),wN:340,wS:160,saddle:{x:-420,w:260,d:58}};
const ridgeCrest=x=>flankH(x,RIDGE.zc(x))+RIDGE.h(x)-RIDGE.saddle.d*smooth(RIDGE.saddle.w,0,Math.abs(x-RIDGE.saddle.x));
function plumeAt(x,z){return 0;}
