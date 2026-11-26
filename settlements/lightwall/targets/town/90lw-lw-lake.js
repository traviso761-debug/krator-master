// ================================================================= LĀIṬWĀL — the great lake on core/water (KNOWN_ISSUES.md: "the lake is a plane")
// The middle terrace's great lake (PLAN.md 1: about 14 by 12 km, its water milky turquoise with the silica in suspension:
// biomes/opalvalley) is core/water's open water: one WATER.open surface at LW.LAKE, a share of the shared wave field (core/atmos)
// on the one clock, drawn by WATER.draw on the CDLOD mesh out to the horizon, the sky in it from core/atmos's skylight (a capture
// of KratorSky's dome only, given to the water). Along the town's shore (the bench's mesh, LWG's width, out 500 m) its bed is a
// shore grid (WATER.shoreGrid through WATER.open's `shore`): the water stops where the flood from the open lake stops, its waves
// shoal and break along the shoreline, and WATER.heightAt is its CPU twin (the quays and boats read it). The plane in 90l stays
// only when core/water is missing. [web]: three.js.
let LW_LAKE=null,LW_LAKE_DRAW=null;
if(typeof WATER!=='undefined'&&WATER.open&&typeof ATMOS!=='undefined'){
 try{
  ATMOS.init({THREE,scene,camera,hour:()=>LW_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:LW.SEED+70,
   err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
  const env=new THREE.Scene(),g=LW_SKYG.clone();g.position.set(0,0,0);env.add(g);
  ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x4a5a46)});
  /* the bed: the bench's ground near the town (a shore grid at 4 m), the lake's own floor beyond (90l's bed plane, 16.5 m down) */
  const shoreBox=[LWG.x0,LW.SHORE-60,LWG.x1,LW.SHORE+520];
  LW_LAKE=WATER.open({name:'the great lake (Opal Valley)',level:LW.LAKE,field:.22,tilt:1.6,
   bounds:[-8000,LW.SHORE-60,8000,LW.SHORE+9000],bed:(x,z)=>terrainH(x,z),bedBox:shoreBox,
   shore:{cell:4,band:60,seeds:[[0,LW.SHORE+480],[-1000,LW.SHORE+480],[1000,LW.SHORE+480]]}});
  LW_LAKE_DRAW=WATER.draw(LW_LAKE,{color:new THREE.Color(.17,.42,.40),roughness:.2,metalness:.06,envMapIntensity:.35});
  LW_LAKE_DRAW.mesh.name='the great lake';LW_LAKE_DRAW.mesh.userData.probeSkip=true;LW_LAKE_DRAW.mesh.userData.inspectLabel='The great lake of Opal Valley (core/water)';
 }catch(e){reportErr('lightwall: the lake on core/water: '+(e&&e.stack||e));}
}
window._lightwallLake=LW_LAKE?{level:LW.LAKE,shore:!!(LW_LAKE.bed&&LW_LAKE.bed.dist),drawn:!!LW_LAKE_DRAW}:null;
