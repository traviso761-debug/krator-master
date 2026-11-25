// ================================================================= CORE — floating pontoon & bascule gangway Three.js host  [web]
// Browser companion to core/city/float/44-city-float.js. Moves pontoon ward Groups, paktong roller-collars, and hinged
// bascule bridges smoothly as lagoonY changes, and updates shared InstancedMesh lot matrices on floating wards.
(function(root){
  'use strict';
  var K=(typeof KCITY!=='undefined')?KCITY:(root.KCITY=root.KCITY||{});
  if(K.hostFloat)return;

  K.hostFloat=function(spec){
    spec=spec||{};
    var wards=spec.wards||[];
    var links=spec.links||[];
    var fixedY=spec.fixedY||{};
    var wardGroups=spec.wardGroups||{};
    var basculeMeshes=spec.basculeMeshes||{};
    var instancedSlots=spec.instancedSlots||[];
    var _m=new THREE.Matrix4(),_p=new THREE.Vector3(),_q=new THREE.Quaternion(),_s=new THREE.Vector3(1,1,1),_up=new THREE.Vector3(0,1,0);

    function update(lagoonY){
      var A=K.auditFloatFleet(wards,links,lagoonY,fixedY,spec.opts);
      for(var id in A.poses){
        var P=A.poses[id],G=wardGroups[id];
        if(G){
          G.position.y=P.deckY;
          G.updateMatrixWorld(true);
        }
      }
      for(var i=0;i<A.bascules.length;i++){
        var B=A.bascules[i],BM=basculeMeshes[B.id];
        if(BM){
          BM.position.y=B.midY;
          BM.rotation.x=B.pitchRad;
          BM.updateMatrixWorld(true);
        }
      }
      var touched=new Set();
      for(var s=0;s<instancedSlots.length;s++){
        var sl=instancedSlots[s];
        var wp=A.poses[sl.wardId];
        if(!wp||!sl.mesh)continue;
        _q.setFromAxisAngle(_up,sl.ry);
        _p.set(sl.x,wp.deckY+(sl.localY==null?0:sl.localY),sl.z);
        _m.compose(_p,_q,_s);
        sl.mesh.setMatrixAt(sl.index,_m);
        touched.add(sl.mesh);
      }
      touched.forEach(function(im){im.instanceMatrix.needsUpdate=true;});
      return A;
    }

    return {update:update};
  };
})(typeof window!=='undefined'?window:globalThis);
