// ================================================================= HOST - the lake, the bayou and the river on core/water
// core/water (core/water/README.md), 2026-10-20, migration phase 3. The page's one plane (vertex colours by depth and place, ripples in its own shader) is two
// open surfaces at y=0 that share the map's box (2.2 R, the bed baked once at 8 m from terrainH): the lake (WATER.open with a shore grid flooded from
// its middle, the CDLOD mesh, a calm swell and a share of the shared wave field on the module clock, the bed's depth tint, surf where it is under 1.4 m,
// the sky in the water from core/atmos's skylight) over the cells off the inland water; and the INLAND water (the bayou pools and oxbows, the delta, the
// river's lowland reach and a short plume off the delta: a flat tea-dark surface of its own, drawn only over the cells that hold it). The two masks are
// complements, so no cell is drawn twice; the tint changes at the shore (the old plane blended it over 90 m: KNOWN_ISSUES.md). The river through the hills is RIVER's
// ribbon (45-host-stage.js). The sky in the water is a capture of this page's dome and giant, given to the water only (WENV: the page's own materials keep
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
// the inland water's cells (16 m): any of their four 8 m ground cells under 0.4 m, inland of the shore or in the delta's plume (within 45 m of a channel and 120 m off the shore)
const INLAND_MASK=(function(){const c=2*WATER_CELL,nx=WATER_NX>>1,d=new Uint8Array(nx*nx),G=WATER_G,N=WATER_NX;
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=2*j*N+2*i,h=Math.min(G[k],G[k+1],G[k+N],G[k+N+1]);if(h>=.4)continue;
  const x=WATER_BOX[0]+(i+.5)*c,z=WATER_BOX[1]+(j+.5)*c,si=seaIn(x,z);
  if(si>=0||(si>-120&&riverD(x,z)<45))d[j*nx+i]=255;}
 return{x0:WATER_BOX[0],z0:WATER_BOX[1],cell:c,nx,nz:nx,data:d};})();
const SEA_MASK={x0:INLAND_MASK.x0,z0:INLAND_MASK.z0,cell:INLAND_MASK.cell,nx:INLAND_MASK.nx,nz:INLAND_MASK.nz,data:INLAND_MASK.data.map(v=>255-v)};
// the lake: calm (the old plane was flat with a ripple normal), the bed's shallows over sand, the deep beyond
const SEA_WATER=WATER.open({name:'The lake',level:0,swell:[[.06,45,300,0,.04],[.035,18,260,1.3,.03]],field:.12,bounds:WATER_BOX,
 bed:waterBed,bedBox:WATER_BOX,bedCell:WATER_CELL,shore:{seeds:[xzOf(-2600,0)]},mask:SEA_MASK});
const SEA_DRAW=WATER.draw(SEA_WATER,{renderOrder:1,roughness:.26,metalness:.05,envMapIntensity:.22,
 shallow:lin(SEA_SHALLOW.clone().lerp(SEA_MID,.3)),deep:lin(SEA_DEEP.clone().multiplyScalar(.75))});
SEA_DRAW.mesh.userData.inspectLabel='The lake';
// the inland water: three-centimetre ripples on a flat surface, one tea-dark colour between the bayou's and the river's
const INLAND_WATER=WATER.open({name:'The bayou and the river',level:0,swell:[[.015,6,35,0,.02],[.01,3.5,-50,1.3,.02]],field:0,bounds:WATER_BOX,mask:INLAND_MASK});
const INLAND_DRAW=WATER.draw(INLAND_WATER,{renderOrder:1,roughness:.14,metalness:.05,envMapIntensity:.35,color:lin(BAYOU_COL.clone().lerp(RIVER_COL,.5).multiplyScalar(.8))});
INLAND_DRAW.mesh.userData.inspectLabel='The bayou and the river';
const RIVER_DRAW=WATER.drawFlow(RIVER,{rapids:[.08,.3],shallow:lin(RIVER_COL),deep:lin(BAYOU_COL),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:24,across:6,margin:1.2,renderOrder:2});
RIVER_DRAW.mesh.userData.inspectLabel='The river';
