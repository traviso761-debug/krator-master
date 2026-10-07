// ================================================================= HOST — stage (station 7: deep under the plume, the ash desert)
// The ideal-type host for THE THRONE's lee deep under the plume (NOTES.md, "Under the plume": the ash desert, pagoda caps,
// ash creepers, drizzle trumpets, soot cups and stalk daisies on striped rhyolite hills; the CO2 hollows; Krator's own
// life, and of Earth's only the hardiest: rats, roaches, lichen, hardy grasses, birds): renderer, the plume's light,
// the flank and its layout as DATA; 47 lays the old lava and cuts the rest.
//
// THE MAP (x east, z south; R 2600). 5.2 km of the south-east flank ~2.2 km up, ~65 km from the vent (north-west, ~6.6
// degrees up when the ash lets it show), right under the plume's axis: its ceiling overhead, ash falling most days
// (the shared atmosphere's opt-in ash weather: ashfall, and the ash storm), ~0.2 m of rain, a little of it acid drizzle.
//   THE DUNES      ash dunes in the south-east half, their crests across the wind (from the north-west), slip faces lee
//   THE YARDANGS   wind-carved ridges of cemented ash in the north-west, long along the wind
//   THE HILLS      three hills of striped rhyolite (cream, rose, grey bands): soot cups and stalk daisies
//   THE HOLLOW     a closed hollow where CO2 pools: the mat on its floor, nothing else alive, bleached bones at its rim
//   THE OLD LAVA   two old flows half buried in the ash, dark where the wind has scoured them
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
// THE LIGHT: under the plume's ceiling: a dim brownish overcast, the sun a pale disc low in the south-west under its
// edge, the haze ash-grey; the weather (89) thickens it to an ash storm's brown-out
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xa8a094);scene.fog=new THREE.FogExp2(HAZE.getHex(),.0006);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const hemi=new THREE.HemisphereLight(0xb0aaa0,0x4e463e,.95);scene.add(hemi);
const SUN_POS=[-900,520,700];
const sun=new THREE.DirectionalLight(0xffd8b0,.85);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8b4b0,.3);fill.position.set(900,400,-900);scene.add(fill);

// ---------------------------------------------------------------- the flank and its layout
const TERR={R:2600};
const SEA=-1530;
const UP=[-.707,-.707],DN=[.707,.707],PERP=[.707,-.707];   // toward the vent (north-west), away, across
const uOf=(x,z)=>x*UP[0]+z*UP[1],pOf=(x,z)=>x*PERP[0]+z*PERP[1];
function landH0(x,z){const u=uOf(x,z);return 2200+.065*u+20*(fbm(x*.0006+3,z*.0006-1,17,3)-.5)+6*(fbm(x*.003-5,z*.003+2,19,2)-.5);}
// THE DUNES: transverse ash dunes, crests across the wind (along PERP), wavelength ~150 m, in the south-east half
const DUNES={k:z=>smooth(-300,500,z)};   // how much of the dune field is here (by u: downwind)
// THE YARDANGS: ridges long along the wind, in the north-west
const YARDANGS=(function(){reseed(4701);const o=[];for(let k=0;k<26;k++){const u=rr(600,2300),p=rr(-2000,2000),c=[UP[0]*u+PERP[0]*p,UP[1]*u+PERP[1]*p];if(Math.hypot(c[0],c[1])>2400)continue;o.push({x:c[0],z:c[1],len:rr(90,260),w:rr(14,30),h:rr(5,14)});}return o;})();
// THE HILLS: striped rhyolite
const HILLS=[{x:-1350,z:450,r:360,h:110},{x:900,z:-1350,r:280,h:80},{x:1500,z:1500,r:320,h:95}].map((H,i)=>Object.assign(H,{i,name:'A hill of striped rhyolite'}));
// THE HOLLOW: where the CO2 pools (Lake Nyos, Mammoth Mountain): a closed basin, the mat on its floor
const HOLLOW={x:350,z:650,r:130,depth:16,name:'A CO2 hollow (the mat on its floor; nothing else lives in it)'};
function plumeAt(x,z){return clamp(.88+.12*smooth(-2000,1500,uOf(-x,-z)),0,1);}
