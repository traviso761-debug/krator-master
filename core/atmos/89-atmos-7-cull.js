// ================================================================= ATMOS — culling for InstancedMeshes
// three r128 culls an InstancedMesh by its base geometry's sphere at the origin, so every set built with frustumCulled
// on vanishes when the origin leaves the view, and every set built with it off (the kits) is drawn always. cull():
//  1. splits each big static set (count >= o.split, identity world matrix, not o.keep(mesh)) into K bearing sectors, so the
//     far side of the map is skipped;
//  2. gives every static set a bounding sphere computed from its instances, on a geometry of its own that shares the
//     vertex buffers, and turns frustum culling on;
//  3. keeps raycasting right: an InstancedMesh raycast tests each instance against the geometry's sphere, so the sets
//     put the base sphere back for the duration of a raycast.
// o.skip(mesh): leave a mesh alone entirely (moving sets, ones the host animates per instance).
(function(){const A=ATMOS;
 A.cull=(scene,o)=>{o=o||{};const T=A.T,K=o.sectors||8,SPLIT=o.split||1500,ident=new T.Matrix4();scene.updateMatrixWorld(true);
  const sliceAttr=(a,idx)=>{const it=a.itemSize,arr=new a.array.constructor(idx.length*it);for(let d=0;d<idx.length;d++){const s0=idx[d]*it;for(let k=0;k<it;k++)arr[d*it+k]=a.array[s0+k];}const b=new T.InstancedBufferAttribute(arr,it);b.normalized=a.normalized;return b;};
  const shareGeo=g=>{const g2=new T.BufferGeometry();g2.setIndex(g.index);for(const k in g.attributes)g2.setAttribute(k,g.attributes[k]);g2.groups=g.groups;
   if(!g.boundingSphere)g.computeBoundingSphere();g2.userData.baseSphere=g.boundingSphere.clone();g2.userData.baseBox=g.boundingBox?g.boundingBox.clone():null;return g2;};
  const fixRay=im=>{im.raycast=function(rc,out){const g=this.geometry,bs=g.boundingSphere;if(g.userData.baseSphere)g.boundingSphere=g.userData.baseSphere;try{T.InstancedMesh.prototype.raycast.call(this,rc,out);}finally{g.boundingSphere=bs;}};};
  const list=[];scene.traverse(m=>{if(m.isInstancedMesh)list.push(m);});let split=0,bound=0;
  for(const m of list){if(o.skip&&o.skip(m))continue;if(m.count>=SPLIT&&m.matrixWorld.equals(ident)&&!(o.keep&&o.keep(m))){
    const bins=Array.from({length:K},()=>[]),M=m.instanceMatrix.array;for(let i=0;i<m.count;i++)bins[Math.min(K-1,Math.floor((Math.atan2(M[i*16+14],M[i*16+12])+Math.PI)/(2*Math.PI)*K))].push(i);
    const parent=m.parent;for(const idx of bins){if(!idx.length)continue;const g=shareGeo(m.geometry);for(const k in m.geometry.attributes){const a=m.geometry.attributes[k];if(a.isInstancedBufferAttribute)g.setAttribute(k,sliceAttr(a,idx));}
     const p=new T.InstancedMesh(g,m.material,idx.length);p.instanceMatrix=sliceAttr(m.instanceMatrix,idx);if(m.instanceColor)p.instanceColor=sliceAttr(m.instanceColor,idx);
     p.name=m.name;p.renderOrder=m.renderOrder;p.userData=Object.assign({},m.userData,{sectorOf:m.name});p.visible=m.visible;parent.add(p);}
    parent.remove(m);split++;}}
  const v=new T.Vector3(),c=new T.Vector3(),tm=new T.Matrix4();
  scene.traverse(m=>{if(!m.isInstancedMesh||(o.skip&&o.skip(m))||!m.count||!m.matrixWorld.equals(ident))return;if(!m.geometry.userData.baseSphere)m.geometry=shareGeo(m.geometry);
   const g=m.geometry,r0=g.userData.baseSphere.radius,c0=g.userData.baseSphere.center,M=m.instanceMatrix.array,n=m.count,cs=new Float32Array(n*4);c.set(0,0,0);
   for(let i=0;i<n;i++){tm.fromArray(M,i*16);v.copy(c0).applyMatrix4(tm);const s=Math.max(Math.hypot(M[i*16],M[i*16+1],M[i*16+2]),Math.hypot(M[i*16+4],M[i*16+5],M[i*16+6]),Math.hypot(M[i*16+8],M[i*16+9],M[i*16+10]));
    cs[i*4]=v.x;cs[i*4+1]=v.y;cs[i*4+2]=v.z;cs[i*4+3]=r0*s;c.add(v);}c.multiplyScalar(1/n);let rad=0;for(let i=0;i<n;i++)rad=Math.max(rad,Math.hypot(cs[i*4]-c.x,cs[i*4+1]-c.y,cs[i*4+2]-c.z)+cs[i*4+3]);
   g.boundingSphere=new T.Sphere(c.clone(),rad*1.02+(o.pad||0));m.frustumCulled=true;fixRay(m);bound++;});
  A.stats.cull={split,bound};return A.stats.cull;};
})();
