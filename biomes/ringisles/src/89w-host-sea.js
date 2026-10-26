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
// THE SHORE (core/water Phase 2/3, 2026-10-20): the bed is a shore grid, baked from the same SEA_BED over the terrain box (cell 6 m) and flooded from the open
// sea (the box's corners that lie deep), so the water stops where the flood does (the salt pan, the tide-pool bench and the mangal's hollows keep their own water
// or none), the swell shoals toward the beaches and the reef, a breaker train runs in along the coast, the beach is wet where the swash reaches (below).
// No maskLand: the beaches and the reef are terrainH's own heights (the ground paints them from the same coastD / reefD), so the height decides what is dry.
const SEA_SEEDS=[[TERR.X0+20,TERR.Z0+20],[TERR.X1-20,TERR.Z1-20],[TERR.X0+20,TERR.Z1-20],[TERR.X1-20,TERR.Z0+20]].filter(p=>terrainH(p[0],p[1])<-10);
const SEA_WATER=WATER.open({name:'The Ring Sea',level:SEA,swell:'ringsea',field:.5,bounds:[-9000,-9000,9000,9000],bed:SEA_BED,bedBox:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],
 shore:{cell:6,band:100,seeds:SEA_SEEDS}});
WATER.wetGround(MAT_GROUND,{surface:SEA_WATER});   // the sand drinks the swash: dark where it reaches, the film glistening
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.1,envMapIntensity:.35,
 shallow:new THREE.Color(.2,.5,.46).convertSRGBToLinear(),deep:new THREE.Color(.04,.16,.22).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
// the tide and brine pools (POOL_STILLS, 84): WATER.still discs at their own levels, the old colours and opacities (the tide pools' .55 teal, the brine's .7 pink), the sky in them
const POOL_DRAWS=POOL_STILLS.map((S,i)=>{const br=i>=POOLS.length,d=WATER.drawStill(S,{color:br?0xc8a8a0:0x4a7a78,opacity:br?.7:.55,roughness:.2,metalness:.05,envMapIntensity:.18,renderOrder:2});
 d.mesh.userData.inspectLabel=br?'A brine pool (pink with its algae: the salt works\' first pans)':'A tide pool';return d;});
// core/water's meshes take no ray and no probe sample: each pool keeps an invisible flat disc for the inspector's click
{const PK=new THREE.MeshBasicMaterial({visible:false});POOLS.concat(BRINE).forEach((P,i)=>{const g=new THREE.CircleGeometry(P.r*1.02,12).rotateX(-Math.PI/2);g.translate(P.x,P.level,P.z);
  const m=new THREE.Mesh(g,PK);m.userData.probeSkip=true;m.userData.inspectLabel=i<POOLS.length?'A tide pool':'A brine pool';scene.add(m);});}
_onLight.push(m=>{POOL_DRAWS.forEach((d,i)=>{const br=i>=POOLS.length;d.material.color.setHex(m==='night'?(br?0x2a2222:0x0c1a1a):(br?0xc8a8a0:0x4a7a78));});});
_mark('sea');
