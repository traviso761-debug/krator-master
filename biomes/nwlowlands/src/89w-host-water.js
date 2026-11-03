// ================================================================= HOST - the lake, the bayou and the river on core/water
// core/water (core/water/README.md), 2026-10-20, migration phase 3; one surface since 2026-10-21. The page's one plane (vertex colours by depth and place, ripples in its own shader) is
// ONE open surface at y=0 over the map's box (2.2 R, the bed baked once at 8 m from terrainH): the lake (WATER.open with a shore grid, the CDLOD mesh, a calm swell and a share of the shared wave field,
// the bed's depth tint, the sky in the water from core/atmos's skylight) with a TINT FIELD that turns it tea-dark over the bayou, the delta, the river's lowland reach and a soft plume off the delta.
// The river through the hills is RIVER's ribbon (45-host-stage.js). The sky in the water is a capture of this page's dome and giant, given to the water only (WENV: the page's own materials keep
// their lighting). CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a6a4a)});}
// the river through the hills is a lowland river (the old ribbon had no rapids): foam only where it really steepens (the flow's own rapids band, 2026-10-21; it was a page-wide preset)
// the surfaces' records are 86-host-fields.js's: the flora and the ground read the water's own fields, so the records stand before the build
const SEA_DRAW=WATER.draw(SEA_WATER,{renderOrder:1,roughness:.26,metalness:.05,envMapIntensity:.22,surf:false,
 shallow:lin(SEA_SHALLOW.clone().lerp(SEA_MID,.3)),deep:lin(SEA_DEEP.clone().multiplyScalar(.75))});
SEA_DRAW.mesh.userData.inspectLabel='The lake';
const RIVER_DRAW=WATER.drawFlow(RIVER,{rapids:[.08,.3],shallow:lin(RIVER_COL),deep:lin(BAYOU_COL),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:24,across:6,margin:1.2,renderOrder:2});
RIVER_DRAW.mesh.userData.inspectLabel='The river';
// THE GORGE'S WATER (core/water ext/54's looks, the row's clear-water look; refs/01): the marl's reach of the river runs turquoise over its pale clay floor, a ribbon of its own over the page's
const GORGE_DRAW=GORGE_FLOW?WATER.drawFlow(GORGE_FLOW,WATER.lookDraw('proglacial','flow',{step:24,across:6,margin:1.2,renderOrder:3,roughness:.14,envMapIntensity:.3,shallow:lin(0x2da2ad),deep:lin(0x0c5363),color:0xffffff})):null;
if(GORGE_DRAW)GORGE_DRAW.mesh.userData.inspectLabel='The marl gorge';
// natural ripples (ext/56; TODO.md's ride-along, taken here on this kit's own surfaces)
WATER.breakupAll();WATER.breakupFlows();
// THE FLOOD (station 2, core/water's seasonal still, the hyperjungle lake's mechanism): the lake's level rises over the flats in the rains, 60 days behind them; the ground is drawn to the high water's
// line, so the gallery and the grass stand in it half the year. The floating meadows ride it
if(MG){const c=[[-1700,-3300],[900,-3300],[900,3300],[-1700,3300]].map(p=>xzOf(p[0],p[1])),FLOOD=window._flood=WATER.still({name:'The flood',poly:c,seasonal:{low:-.35,high:.95,lagD:60,sharp:1.5}});
 const D=WATER.drawStill(FLOOD,{color:lin(0x3a4a3e).getHex(),roughness:.1,metalness:.08,envMapIntensity:.5,depthBias:[-1.5,-6]});D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel='The flood (its level follows the season)';
 tick(()=>{if(typeof KHOST==='undefined'||!KHOST.host)return;WATER.stepSeasons(KHOST.host.clock);scene.traverse(o=>{if(o.name==='biome:floatmat')o.position.y=Math.max(0,FLOOD.level);});});}
