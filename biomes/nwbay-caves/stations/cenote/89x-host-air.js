// ================================================================= HOST — the water, the light and the air: core/atmos bound, the cenote's shaft, the surface
// core/atmos on this page's ticks, ground and camera (no sky: the haze is the scene's fog). Then:
//   THE SHAFT OF DAYLIGHT  a fading cone from the rim down through the water (ATMOS.spotCone) and the spot (49), by the hour: day 6-18, none at night
//   THE SURFACE            the table in the cenote (core/water's still WATER.open on the floor read off the cavern), drawn from both sides: seen from
//                          under it, it is the bright ceiling of the water
//   THE HAZE               each frame by the eye's height: under the table the sea's close blue-green (SITE.water.fog), over it the shaft's warm air
const hourNow=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:12;
const daylight=h=>smooth(5.6,7.4,h)*(1-smooth(17.4,19.2,h));
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:hourNow,seed:7643,viewH:()=>innerHeight});
const AIR=(function(){const out={cone:null,water:null};
 const len=CE.rim-CE.floor+4,o={len,rad:CE.r*.7,opacity:.09,on:0,off:40,color:0xf4fff0,glow:5};
 out.cone=ATMOS.spotCone(CE.x,CE.rim+3,CE.z,[0,-1,0],o);out.cone.userData.probeSkip=true;out.cone.userData.inspectLabel='Daylight down the cenote';
 const lin=c=>new THREE.Color(c).convertSRGBToLinear(),WS=SITE.water,r=CE.hall.rx+2,b=[CE.x-r,CE.z-r,CE.x+r,CE.z+r];
 const S=WATER.open({name:'The cenote\'s water (the sea\'s level, brackish)',level:WS.level,field:.04,bounds:b,bed:terrainH,bedBox:b,
  shore:{cell:2,band:10,seeds:[[CE.x,CE.z]],land:(x,z)=>terrainH(x,z)>WS.level+.2}});
 const D=WATER.draw(S,{renderOrder:1,roughness:.08,metalness:.05,envMapIntensity:0,surf:false,breakers:false,pick:true,shallow:lin(WS.shallow),deep:lin(WS.deep)});
 D.mesh.material.side=THREE.DoubleSide;D.mesh.userData.inspectLabel=S.name;D.mesh.userData.probeSkip=true;out.water=D;
 const air=new THREE.Color(WS.air),sea=new THREE.Color(WS.fog);let under=null;
 tick(function hazeAndLight(){const k=daylight(hourNow());o.opacity=Math.max(1e-4,.09*k);CENOTE_SUN.intensity=4.2*k;
  const u=camera.position.y<WS.level;if(u!==under){under=u;scene.fog.color.copy(u?sea:air);scene.background.copy(u?sea:air);scene.fog.density=u?WS.fogD:WS.airD;
   HEMI.color.set(u?0x5f9aa0:0xb8b090);}});
 return out;})();
window._air={cone:!!AIR.cone,water:!!AIR.water};
