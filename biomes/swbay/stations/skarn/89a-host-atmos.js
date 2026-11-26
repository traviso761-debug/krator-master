// ================================================================= HOST - the atmosphere (core/atmos), bound (station 3, the skarn-marble cliffs)
// As the bay's page (src/89a): core/atmos's one-time init on this page's frame ticks, ground and camera; the foliage in its wind (R8),
// the cut-outs by alpha-to-coverage (R7); the wet ground and puddles in the rain (R9) on the drawn ground, none in the sea or the spring
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:6,seed:8107,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
const SKARN_BOX=[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1];
if(Q.get('wet')!=='0'){
 const WET_HOLLOWS=WATER.hollows({h:(x,z)=>HL.h(x,z),box:SKARN_BOX,cell:(SKARN_BOX[2]-SKARN_BOX[0])/512,blur:20,depth:.5,
  mask:(x,z)=>HL.h(x,z)<.8||Math.hypot(x-SPRING.x,z-SPRING.z)<20?0:1});
 WATER.wetGround(MAT_GROUND,{rain:true,porosity:.5,puddles:WET_HOLLOWS});}
