// ================================================================= HOST — the sea (core/water)
// The Ring Sea off the basin's beach is core/water's open water (core/water/README.md): the roadstead's swell (the Ring Sea
// kit's four Gerstner waves, WATER.PRESETS.swells.ringsea) and half the shared wave field (core/atmos) on the one clock
// (atmWaveT, whole cycles), drawn on the CDLOD water mesh (fine under the camera, coarser with distance, out to the
// horizon), south of z=560 as the old grid and its far ring were. The sea bed is baked from terrainH over the shore
// (WATER.open's bed): the shallows' teal-green over the black sand and the deep colour beyond, the surf lapping where it is
// under 1.4 m, the swell calmed to nothing at the waterline (so no sawtooth on the beach), and the water fading out over
// the sand. The sky in the water is core/atmos's skylight, a capture of this page's dome and giant, given to the water only
// (SEA_ENV), recaptured at night. Its CPU twin is WATER.heightAt (anything that floats here rides it).
// It loads after 89-atmos-*: ATMOS must exist before WATER.open reads its wave period. Before 2026-10-12 the sea was a
// grid with a per-vertex depth and a three-sine ripple on an unwrapped clock in 86-host-water.js.
ATMOS.init({THREE,scene,camera,hour:()=>LIGHT_MODE==='night'?0:13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:5303,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const SKY_ENV=new THREE.Scene(),SEA_ENV={environment:null};
{SKY_ENV.add(new THREE.Mesh(sky.geometry,sky.material));for(const m of[giant,giantRing]){const c=m.clone();c.position.copy(giantDir).multiplyScalar(GIANT_DIST);SKY_ENV.add(c);}}
ATMOS.skylight({renderer,sky:SKY_ENV,scene:SEA_ENV,ground:()=>new THREE.Color(0x0d2c30),key:()=>LIGHT_MODE});
/* THE PLUME (core/water ext/61, tintFlow; BACKPORT.md section 5, "A river's plume"; the final rebuild, pair 7): the basin's two outflows carried out into the
   sea on a current, never an edge: the creek's tea-brown jungle water at its mouth west of the Stair, and the Stair's own run-off, milky with the silica it
   has not yet laid down, off the apron's foot. Each fades over ~300 m, drawn out east by the longshore drift (the SW breeze), with eddies and filaments.
   ?plume=0 for the clear sea */
const SEA_PLUME=(function(){if(new URLSearchParams(location.search).get('plume')==='0'||!WATER.tintFlowAt)return null;
 const ce=CREEK.P[CREEK.P.length-1],sz0=shoreZ(STAIR.x0),M=[{x:ce[0],z:shoreZ(ce[0]),k:.8,c:[.32,.27,.18]},{x:stairX(sz0),z:shoreZ(stairX(sz0)),k:.62,c:[.62,.7,.68]}];
 const hx=c=>(Math.round(c[0]*255)<<16)|(Math.round(c[1]*255)<<8)|Math.round(c[2]*255);
 const share=(m,x,z)=>{const out=Math.max(0,z-m.z),dx=x-m.x-.35*out;return m.k*smooth(330,25,Math.hypot(dx,out*.85));};
 return{tint:{box:[-760,560,820,1500],cell:10,at:(x,z)=>{if(z<shoreZ(x)-4)return null;let a=0,c=[0,0,0];
   for(const m of M){const w=share(m,x,z);if(w<=0)continue;a=Math.max(a,w);for(let i=0;i<3;i++)c[i]+=m.c[i]*w;}
   if(a<.004)return null;const t=c.reduce((q,v)=>q+v,0)?1/M.reduce((q,m)=>q+share(m,x,z),0):0;return{c:hx(c.map(v=>clamp(v*t,0,1))),a:Math.min(.7,a)};}},
  flow:{cell:20,period:60,swirl:.12,scale:120,evolve:.8,fil:.45,filScale:26,
   v:(x,z)=>{if(z<shoreZ(x)-6||z>1600)return null;let vx=.05,vz=.0;for(const m of M){const dx=x-m.x,dz=Math.max(1,z-m.z),d=Math.hypot(dx,dz),k=.28*smooth(520,10,d);vx+=dx/d*k;vz+=dz/d*k;}return[vx,vz];}}};})();
const SEA_WATER=WATER.open(Object.assign({name:'The Ring Sea',level:SEA,swell:'ringsea',field:.5,bounds:[-9000,560,9000,9000],bed:terrainH,bedBox:[-1700,560,1700,1700],bedCell:5},
 SEA_PLUME?{tint:SEA_PLUME.tint,tintFlow:SEA_PLUME.flow}:{}));
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.1,envMapIntensity:.35,
 shallow:new THREE.Color(.14,.32,.3).convertSRGBToLinear(),deep:new THREE.Color(.05,.17,.19).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
_mark('sea');
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26; here, after ATMOS.init): wet: the geyser basin's sea coast, rain, storms and
// the sea fog. // It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:[MAT_GROUND]});
