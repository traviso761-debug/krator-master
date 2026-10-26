// ================================================================= HOST - the fountain
// "From this chasm, with ceaseless turmoil seething ... a mighty fountain momently was forced": at the river's head a column of water and
// spray is thrown up in bursts, every few seconds, and falls back into the chasm. 2026-10-25 (migration phase 4): a WATER.geyser of style
// 'fountain' (core/water/geyser/), drawn by WATER.drawGeyser: one Points, the drops' randoms from core/rand's hash of (world, key, index),
// the burst cycle a pure function of the clock (period 4.8 s, the column 3 s), 99 m at the top of a burst as the old jet's 44 m/s.
const FOUNTAIN_W=WATER.geyser({key:'xanadu-fountain',name:'The fountain',vents:[[RIV.P[0][0],RIV.P[0][1]]],top:RIV.bed[0]+.6,H:99,style:'fountain',spread:.2,
 period:4.8,pre:.6,dur:3,steam:.3,off:0,pool:3,world:23});
const FOUNTAIN_U={uScale:{value:900}};
const FOUNTAIN=WATER.drawGeyser(FOUNTAIN_W,{THREE,scene,uniforms:FOUNTAIN_U,fog:scene.fog,wind:[.5,-.3],gravity:9.8,mats:new Map()}).points;
FOUNTAIN.userData.inspectLabel='The fountain';
TICKS.push(()=>{FOUNTAIN_U.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
