// ================================================================= HOST - the bay, the river, the cataracts and the outer water on core/water
// core/water (core/water/README.md), 2026-10-20, migration phase 3: the bay and the lowland reach of the river are ONE open surface (BAY_WATER: the CDLOD
// mesh, a calm swell and a share of the shared wave field on the module clock, the bed baked from terrainH over the old plane's 2.2 R square, a shore grid
// flooded from the bay's middle so the water stops where the beach is and laps a white edge where it is under 1.4 m, the sky in the water from core/atmos's
// skylight); the far country's water is a second, flat surface under it (OUTER_WATER, a metre-wide step below, masked off over the bay); the river is
// RIVER's ribbon (ripples carried down the current, white where it steepens, along the banks), the cataracts RIVER_FALLS' curtains with their plunge
// pools. The page's own plane, ribbon, foam cards and shader are gone (45-host-stage.js). The sky in the water is a capture of the shared sky (its
// giant, ring and clouds at the hour), given to the water only (WENV: the page's own materials keep their lighting). CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is unchanged.
{const WENV={environment:null};   /* the shared sky's own scene (89s-host-sky.js), recaptured as the hour moves */
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
// the old ribbon's foam cards began at a 6% grade and were full at 14%: that is the river's rapids band (the flow's own option, 2026-10-21; it was a page-wide preset)
const BAY_WATER=WATER.open({name:'The bay',level:0,swell:[[.06,45,225,0,.04],[.035,18,200,1.3,.03]],field:.12,bounds:BAY_BOX,
 bed:terrainH,bedBox:BAY_BOX,bedCell:8,shore:{seeds:[[BAY.c[0],BAY.c[1]]]},
 /* the fresh river water where it meets the bay (the old foam cards' delta tint, lost in phase 3; 2026-10-25): the river's colour over the delta, softest at its edge */
 /* the water takes the bytes as linear colour, RIVER_COL is in the working (linear) space */
 tint:{box:[MOUTH_XZ[0]-560,MOUTH_XZ[1]-560,MOUTH_XZ[0]+560,MOUTH_XZ[1]+560],cell:16,at:(x,z)=>{const k=deltaK(x,z);return k>.01?{c:(Math.round(RIVER_COL.r*255)<<16)|(Math.round(RIVER_COL.g*255)<<8)|Math.round(RIVER_COL.b*255),a:.4*k}:null;}}});
const BAY_DRAW=WATER.draw(BAY_WATER,{renderOrder:1,roughness:.16,metalness:.05,envMapIntensity:.22,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.3)),deep:lin(WATER_DEEP.clone().multiplyScalar(.75))});
BAY_DRAW.mesh.userData.inspectLabel='The bay';
// the outer water: the far country's sea, flat, 0.15 m under the bay's, drawn only where the bay's surface is not (a mask of 50 m cells, open 60 m inside the bay's box)
const OUTER_BOX=[CENTER[0]-9000,CENTER[1]-9000,CENTER[0]+9000,CENTER[1]+9000];
const OUTER_WATER=WATER.open({name:'The outer water',level:-.15,swell:[],field:0,bounds:OUTER_BOX,
 mask:(function(){const c=50,nx=360,nz=360,d=new Uint8Array(nx*nz),m=60;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=OUTER_BOX[0]+(i+.5)*c,z=OUTER_BOX[1]+(j+.5)*c;
   const inside=x>BAY_BOX[0]+m+c&&x<BAY_BOX[2]-m-c&&z>BAY_BOX[1]+m+c&&z<BAY_BOX[3]-m-c;d[j*nx+i]=inside?0:255;}
  return{x0:OUTER_BOX[0],z0:OUTER_BOX[1],cell:c,nx,nz,data:d};})()});
const OUTER_DRAW=WATER.draw(OUTER_WATER,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.5,color:lin(WATER_DEEP)});
OUTER_DRAW.mesh.userData.inspectLabel='The outer water';
const RIVER_DRAW=WATER.drawFlow(RIVER,{rapids:[.06,.14],shallow:lin(RIVER_COL),deep:lin(RIVER_COL.clone().lerp(WATER_DEEP,.3)),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.5,step:10,across:6,margin:1.2,renderOrder:2});
RIVER_DRAW.mesh.userData.inspectLabel='The river';
// the river steps down in 37 terraces: ALL their curtains are one mesh and all their plunge pools another (WATER.drawFalls, core/water/ext: two draw calls in all; it was two per fall with a per-frame
// tick that showed only those within 900 m). The curtains land on the chute foot fallsOf found (fit: true in 45-host-stage).
const FALL_DRAW=WATER.drawFalls(RIVER_FALLS,{name:'The cataracts',color:lin(0xdce8e6),opacity:.9,spray:false,envMapIntensity:.25,renderOrder:3});
FALL_DRAW.mesh.userData.inspectLabel='The cataracts';if(FALL_DRAW.plunge)FALL_DRAW.plunge.userData.inspectLabel='The cataracts';
