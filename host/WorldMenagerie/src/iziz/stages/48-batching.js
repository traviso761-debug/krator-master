// ---------- batching: static meshes that share a geometry and material become one InstancedMesh ----------
await stage('batch');
section('batch',()=>{
  scene.updateMatrixWorld(true);
  const isDyn=o=>{for(let p=o;p;p=p.parent)if(p.userData.dynamic)return true;return false;};
  const buckets=new Map();let before=0;
  scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;before++;if(isDyn(o)||Array.isArray(o.material))return;
    const k=o.geometry.uuid+'|'+o.material.uuid+'|'+o.castShadow+o.receiveShadow;let b=buckets.get(k);if(!b){b=[];buckets.set(k,b);}b.push(o);});
  let removed=0,made=0;
  for(const list of buckets.values()){if(list.length<2)continue;
    const im=new THREE.InstancedMesh(list[0].geometry,list[0].material,list.length);
    list.forEach((o,i)=>{im.setMatrixAt(i,o.matrixWorld);o.parent.remove(o);});
    im.instanceMatrix.needsUpdate=true;im.castShadow=list[0].castShadow;im.receiveShadow=list[0].receiveShadow;
    scene.add(im);removed+=list.length;made++;}
  ctx.batch={meshesBefore:before,batched:removed,instancedMeshesAdded:made};
});
