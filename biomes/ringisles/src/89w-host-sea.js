// ================================================================= HOST — the sea (core/water)
// The Ring Sea round the island, its lagoon and its reef, is core/water's open water (core/water/README.md): the roadstead's swell (the Ring Sea
// kit's four Gerstner waves, WATER.PRESETS.swells.ringsea) and half the shared wave field (core/atmos) on the one clock
// (atmWaveT, whole cycles), drawn on the CDLOD water mesh (fine under the camera, coarser with distance, out to the
// horizon), all round the island. The sea bed is baked from terrainH over the shore
// (WATER.open's bed): the lagoon's turquoise over the white sand and the deep colour beyond, the surf lapping where it is
// under 1.4 m, the swell calmed to nothing at the waterline (so no sawtooth on the beach), and the water fading out over
// the sand. The sky in the water is core/atmos's skylight, a capture of this page's dome and giant, given to the water only
// (SEA_ENV), recaptured at night. Its CPU twin is WATER.heightAt (anything that floats here rides it).
// It loads after 89-atmos-* and 89a: ATMOS must be bound before WATER.open reads its wave period. (The geyser kit's 89w-host-sea.js, adapted.)
/* ATMOS is bound in 89a-host-atmos.js (ATMOS.bindHost, on the host clock; the final rebuild): the sea reads its wave period from there */
const SKY_ENV=new THREE.Scene(),SEA_ENV={environment:null};
{SKY_ENV.add(new THREE.Mesh(sky.geometry,sky.material));for(const m of[giant,giantRing]){const c=m.clone();c.position.copy(giantDir).multiplyScalar(GIANT_DIST);SKY_ENV.add(c);}}
ATMOS.skylight({renderer,sky:SKY_ENV,scene:SEA_ENV,ground:()=>new THREE.Color(0x0d2c30),key:()=>LIGHT_MODE});
// THE BED the water reads (kept on 2026-10-25: the true bed with the lap off or narrowed was tried, and the swell, shoaling over
// the true shallows, rose over the sand bars and the mangal's mud): the lagoon and the reef flat as 1.6 m deep at least (core/water laps a white surf wherever it
// is under 1.4 m: over a whole lagoon that was a white sheet); the beaches' and the mud's own depth near the shore
const SEA_BED=typeof STATION!=='undefined'&&STATION.seaBed?(x,z)=>STATION.seaBed(terrainH(x,z),x,z):(x,z)=>{const h=terrainH(x,z),sd=coastD(x,z);return sd<-14&&reefD(x,z)>-80?Math.min(h,-1.6):h;};   /* a station's own bed (its stage's STATION) */
// THE SHORE (core/water Phase 2/3, 2026-10-20): the bed is a shore grid, baked from the same SEA_BED over the terrain box (cell 6 m) and flooded from the open
// sea (the box's corners that lie deep), so the water stops where the flood does (the salt pan, the tide-pool bench and the mangal's hollows keep their own water
// or none), the swell shoals toward the beaches and the reef, a breaker train runs in along the coast, the beach is wet where the swash reaches (below).
// No maskLand: the beaches and the reef are terrainH's own heights (the ground paints them from the same coastD / reefD), so the height decides what is dry.
const SEA_SEEDS=[[TERR.X0+20,TERR.Z0+20],[TERR.X1-20,TERR.Z1-20],[TERR.X0+20,TERR.Z1-20],[TERR.X1-20,TERR.Z0+20]].filter(p=>terrainH(p[0],p[1])<-10);
const SEA_WATER=WATER.open({name:'The Ring Sea',level:SEA,swell:'ringsea',field:.5,bounds:[-9000,-9000,9000,9000],bed:SEA_BED,bedBox:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],
 shore:{cell:typeof STATION!=='undefined'&&STATION.shoreCell?STATION.shoreCell:6,band:100,seeds:SEA_SEEDS},
 ...(typeof STATION!=='undefined'&&STATION.seaOpts?STATION.seaOpts():{})});   /* a station's tint and its current (the high isle's streams' plumes: core/water ext/61) */
WATER.wetGround(MAT_GROUND,{surface:SEA_WATER});   // the sand drinks the swash: dark where it reaches, the film glistening
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.1,envMapIntensity:.35,
 shallow:new THREE.Color(.2,.5,.46).convertSRGBToLinear(),deep:new THREE.Color(.04,.16,.22).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
// the tide and brine pools (POOL_STILLS, 84): WATER.still discs at their own levels, the old colours and opacities (the tide pools' .55 teal, the brine's .7 pink), the sky in them
const POOL_DRAWS=POOL_STILLS.map((S,i)=>{const br=i>=POOLS.length,d=WATER.drawStill(S,{color:br?0xc8a8a0:0x4a7a78,opacity:br?.7:.55,roughness:.2,metalness:.05,envMapIntensity:.18,renderOrder:2,pick:true});
 d.mesh.userData.inspectLabel=br?'A brine pool (pink with its algae: the salt works\' first pans)':'A tide pool';return d;});
// each pool takes a ray and a probe sample of its own (pick: true; 2026-10-25, in place of an invisible flat disc a pool)
_onLight.push(m=>{POOL_DRAWS.forEach((d,i)=>{const br=i>=POOLS.length;d.material.color.setHex(m==='night'?(br?0x2a2222:0x0c1a1a):(br?0xc8a8a0:0x4a7a78));});});
_mark('sea');
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26; here, after ATMOS.init): wet: a Ring Sea isle, monsoon rain and storms. The
// sand already takes the rain through its shore wetting above (WATER.wetGround with the surface), so no ground is passed twice.
// It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:[]});
