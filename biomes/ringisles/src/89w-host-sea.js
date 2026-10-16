// ================================================================= HOST — the sea (core/water)
// The Ring Sea round the island, its lagoon and its reef, is core/water's open water (core/water/README.md): the roadstead's swell (the Ring Sea
// kit's four Gerstner waves, WATER.PRESETS.swells.ringsea) and half the shared wave field (core/atmos) on the one clock
// (atmWaveT, whole cycles), drawn on the CDLOD water mesh (fine under the camera, coarser with distance, out to the
// horizon), all round the island. The sea bed is baked from terrainH over the shore
// (WATER.open's bed): the lagoon's turquoise over the white sand and the deep colour beyond, the surf lapping where it is
// under 1.4 m, the swell calmed to nothing at the waterline (so no sawtooth on the beach), and the water fading out over
// the sand. The sky in the water is core/atmos's skylight, a capture of this page's dome and giant, given to the water only
// (SEA_ENV), recaptured at night. Its CPU twin is WATER.heightAt (anything that floats here rides it).
// It loads after 89-atmos-*: ATMOS must exist before WATER.open reads its wave period. (The geyser kit's 89w-host-sea.js, adapted.)
ATMOS.init({THREE,scene,camera,hour:()=>LIGHT_MODE==='night'?0:13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:5303,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const SKY_ENV=new THREE.Scene(),SEA_ENV={environment:null};
{SKY_ENV.add(new THREE.Mesh(sky.geometry,sky.material));for(const m of[giant,giantRing]){const c=m.clone();c.position.copy(giantDir).multiplyScalar(GIANT_DIST);SKY_ENV.add(c);}}
ATMOS.skylight({renderer,sky:SKY_ENV,scene:SEA_ENV,ground:()=>new THREE.Color(0x0d2c30),key:()=>LIGHT_MODE});
// THE BED the water reads: the lagoon and the reef flat as 1.6 m deep at least (core/water laps a white surf wherever it
// is under 1.4 m: over a whole lagoon that was a white sheet); the beaches' and the mud's own depth near the shore
const SEA_BED=(x,z)=>{const h=terrainH(x,z),sd=coastD(x,z);return sd<-14&&reefD(x,z)>-80?Math.min(h,-1.6):h;};
const SEA_WATER=WATER.open({name:'The Ring Sea',level:SEA,swell:'ringsea',field:.5,bounds:[-9000,-9000,9000,9000],bed:SEA_BED,bedBox:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],bedCell:6});
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.1,envMapIntensity:.35,
 shallow:new THREE.Color(.2,.5,.46).convertSRGBToLinear(),deep:new THREE.Color(.04,.16,.22).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
_mark('sea');
