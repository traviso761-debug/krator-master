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
const SEA_WATER=WATER.open({name:'The Ring Sea',level:SEA,swell:'ringsea',field:.5,bounds:[-9000,560,9000,9000],bed:terrainH,bedBox:[-1700,560,1700,1700],bedCell:5});
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.1,envMapIntensity:.35,
 shallow:new THREE.Color(.14,.32,.3).convertSRGBToLinear(),deep:new THREE.Color(.05,.17,.19).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
_mark('sea');
