// ================================================================= HOST - the lake, the bayou and the river on core/water
// core/water (core/water/README.md), 2026-10-20, migration phase 3; one surface since 2026-10-21. The page's one plane (vertex colours by depth and place, ripples in its own shader) is
// ONE open surface at y=0 over the map's box (2.2 R, the bed baked once at 8 m from terrainH): the lake (WATER.open with a shore grid, the CDLOD mesh, a calm swell and a share of the shared wave field,
// the bed's depth tint, the sky in the water from core/atmos's skylight) with a TINT FIELD that turns it tea-dark over the bayou, the delta, the river's lowland reach and a soft plume off the delta.
// The river through the hills is RIVER's ribbon (45-host-stage.js). The sky in the water is a capture of this page's dome and giant, given to the water only (WENV: the page's own materials keep
// their lighting). CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a6a4a)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
// the river through the hills is a lowland river (the old ribbon had no rapids): foam only where it really steepens (the flow's own rapids band, 2026-10-21; it was a page-wide preset)
const WATER_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],WATER_CELL=8,WATER_NX=Math.ceil((WATER_BOX[2]-WATER_BOX[0])/WATER_CELL);
// the ground at the bed's cell centres, once: the shore grid and the masks read this array (bakeBed and shoreGrid sample at those centres)
const WATER_G=new Float32Array(WATER_NX*WATER_NX);
for(let j=0;j<WATER_NX;j++)for(let i=0;i<WATER_NX;i++)WATER_G[j*WATER_NX+i]=terrainH(WATER_BOX[0]+(i+.5)*WATER_CELL,WATER_BOX[1]+(j+.5)*WATER_CELL);
const waterBed=(x,z)=>WATER_G[Math.min(WATER_NX-1,Math.max(0,Math.floor((z-WATER_BOX[1])/WATER_CELL)))*WATER_NX+Math.min(WATER_NX-1,Math.max(0,Math.floor((x-WATER_BOX[0])/WATER_CELL)))];
// ONE open surface (2026-10-21; it was a sea with a shore grid plus a second masked, bed-less tea-dark surface at the same level): the shore grid is flooded from the middle of the
// water AND from every inland hollow (a predicate seed: inland of the shore, where the bayou, its oxbows and the river's lowland reach lie), so the surface stops where the water does;
// the bayou's, the delta's and the river's tea-dark colour is a tint field over it (alpha 1 inland, fading 120 m out over the delta's plume instead of the old hard step at the mask edge).
// surf is off: the bed is the true bed (no 1.4 m clamp) and a lap of white on the bayou's shallows is wrong; the sea's beach loses its lap line with it.
const INLAND_COL=lin(BAYOU_COL.clone().lerp(RIVER_COL,.5).multiplyScalar(.8)),INLAND_HEX=((Math.round(INLAND_COL.r*255)<<16)|(Math.round(INLAND_COL.g*255)<<8)|Math.round(INLAND_COL.b*255));
const ss01=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const SEA_SEED=xzOf(-2600,0);
const WATER_TINT={box:WATER_BOX,cell:2*WATER_CELL,at:(x,z)=>{const si=seaIn(x,z);if(si>=0)return{c:INLAND_HEX,a:1};if(si<=-120)return null;
 const a=ss01(-120,-30,si)*(1-ss01(15,60,riverD(x,z)));return a>.004?{c:INLAND_HEX,a}:null;}};
const SEA_WATER=WATER.open({name:'The lake',level:0,swell:[[.06,45,300,0,.04],[.035,18,260,1.3,.03]],field:.12,bounds:WATER_BOX,
 bed:waterBed,bedBox:WATER_BOX,bedCell:WATER_CELL,shore:{seeds:(x,z)=>seaIn(x,z)>=0||Math.hypot(x-SEA_SEED[0],z-SEA_SEED[1])<40},tint:WATER_TINT});
const SEA_DRAW=WATER.draw(SEA_WATER,{renderOrder:1,roughness:.26,metalness:.05,envMapIntensity:.22,surf:false,
 shallow:lin(SEA_SHALLOW.clone().lerp(SEA_MID,.3)),deep:lin(SEA_DEEP.clone().multiplyScalar(.75))});
SEA_DRAW.mesh.userData.inspectLabel='The lake';
const RIVER_DRAW=WATER.drawFlow(RIVER,{rapids:[.08,.3],shallow:lin(RIVER_COL),deep:lin(BAYOU_COL),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:24,across:6,margin:1.2,renderOrder:2});
RIVER_DRAW.mesh.userData.inspectLabel='The river';
