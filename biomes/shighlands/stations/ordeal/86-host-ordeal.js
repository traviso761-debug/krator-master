// ================================================================= HOST — STATION 5's Urudiru Ordeal trail site records
// PLAN-STATIONS.md station 5: empty core/tags site records (cls 'feature', role 'ordeal-way') marking the initiate trail climbing south-east toward
// Godthrone, kept clear of boulders and shrubs via OBSTACLES so kits/shumari can dress cairns and the Ordeal gate onto them. Each site carries a
// ground-level probe point (as 84-host-ground.js does for bare tors) so core/host's registered-volumes-non-empty probe verifies the volume on land.
const ORDEAL_SITES=(function(){const W=STATION_LAND.WAY||[],pts=[];
 W.forEach(w=>{const y=terrainH(w.x,w.z);
  OBSTACLES.push({x:w.x,z:w.z,r:w.r*.65});
  REGISTER({name:w.name,cls:'feature',kind:w.kind,x:w.x,y:y-2,z:w.z,r:w.r,h:w.h,
   tags:{role:'ordeal-way',types:['religious','infrastructure'],landmark:true}});
  pts.push(w.x,y+.6,w.z);});
 if(pts.length){const o=new THREE.Object3D();o.name='ordeal trail probe points';o.userData.probePoints=pts;scene.add(o);}
 window._ordealWay=W.length;
 return W;})();
