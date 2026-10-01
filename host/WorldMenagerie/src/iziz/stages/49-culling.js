// ---------- culling: r128 would cull an InstancedMesh by its base geometry at the origin, so each static set gets bounds computed from its instances; the biggest sets are cut into sectors so the far side of the city is skipped; unused instance slots are freed ----------
await stage('cull');
section('cull',()=>{
  const isDyn=o=>{for(let p=o;p;p=p.parent)if(p.userData.dynamic||p.userData.life)return true;return false;};
  const ident=new THREE.Matrix4(),tm=new THREE.Matrix4(),v=new THREE.Vector3(),c=new THREE.Vector3();
  const geoUse=new Map();scene.traverse(o=>{if(o.geometry)geoUse.set(o.geometry,(geoUse.get(o.geometry)||0)+1);});
  const sliceAttr=(a,idx)=>{const it=a.itemSize,arr=new a.array.constructor(idx.length*it);for(let d=0;d<idx.length;d++){const s0=idx[d]*it;for(let k=0;k<it;k++)arr[d*it+k]=a.array[s0+k];}const b=new THREE.InstancedBufferAttribute(arr,it);b.normalized=a.normalized;return b;};
  const shareGeo=g=>{const g2=new THREE.BufferGeometry();g2.setIndex(g.index);for(const k in g.attributes)g2.setAttribute(k,g.attributes[k]);g2.userData.edgeOf=g.userData.edgeOf||g.uuid;return g2;};   // same vertex buffers, its own bounds
  const part=(o,idx)=>{const g=shareGeo(o.geometry);for(const k in o.geometry.attributes){const a=o.geometry.attributes[k];if(a.isInstancedBufferAttribute)g.setAttribute(k,sliceAttr(a,idx));}
    const p=new THREE.InstancedMesh(g,o.material,idx.length);p.instanceMatrix=sliceAttr(o.instanceMatrix,idx);if(o.instanceColor)p.instanceColor=sliceAttr(o.instanceColor,idx);
    p.castShadow=o.castShadow;p.receiveShadow=o.receiveShadow;p.renderOrder=o.renderOrder;p.layers.mask=o.layers.mask;p.userData=Object.assign({},o.userData,{sector:false,partOf:o.uuid});return p;};
  let split=0,trimmed=0,freed=0,culled=0;
  const list=[];scene.traverse(o=>{if(o.isInstancedMesh&&!o.userData.isWire)list.push(o);});
  for(const o of list){const dyn=isDyn(o);
    if(!dyn&&o.userData.sector&&o.count>=1500&&o.matrixWorld.equals(ident)){const K=8,bins=Array.from({length:K},()=>[]),M=o.instanceMatrix.array;
      for(let i=0;i<o.count;i++)bins[Math.min(K-1,Math.floor((Math.atan2(M[i*16+14],M[i*16+12])+Math.PI)/(2*Math.PI)*K))].push(i);
      for(const idx of bins)if(idx.length)scene.add(part(o,idx));o.parent.remove(o);split++;continue;}
    if(!dyn&&o.count>0&&o.instanceMatrix.count>=500&&o.count<o.instanceMatrix.count*0.9){const idx=Array.from({length:o.count},(_,i)=>i);freed+=(o.instanceMatrix.count-o.count)*64;
      o.instanceMatrix=sliceAttr(o.instanceMatrix,idx);if(o.instanceColor)o.instanceColor=sliceAttr(o.instanceColor,idx);
      if(geoUse.get(o.geometry)===1)for(const k in o.geometry.attributes){const a=o.geometry.attributes[k];if(a.isInstancedBufferAttribute&&a.count>o.count)o.geometry.setAttribute(k,sliceAttr(a,idx));}
      trimmed++;}}
  scene.traverse(o=>{if(!o.isInstancedMesh||o.userData.isWire)return;
    if(isDyn(o)||o.count===0||!o.matrixWorld.equals(ident)){o.frustumCulled=false;return;}   // moving sets keep their instances anywhere
    const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const r0=g.boundingSphere.radius,c0=g.boundingSphere.center,M=o.instanceMatrix.array,n=o.count,cs=new Float32Array(n*4);
    c.set(0,0,0);for(let i=0;i<n;i++){tm.fromArray(M,i*16);v.copy(c0).applyMatrix4(tm);const s=Math.max(Math.hypot(M[i*16],M[i*16+1],M[i*16+2]),Math.hypot(M[i*16+4],M[i*16+5],M[i*16+6]),Math.hypot(M[i*16+8],M[i*16+9],M[i*16+10]));cs[i*4]=v.x;cs[i*4+1]=v.y;cs[i*4+2]=v.z;cs[i*4+3]=r0*s;c.add(v);}
    c.multiplyScalar(1/n);let rad=0;for(let i=0;i<n;i++)rad=Math.max(rad,Math.hypot(cs[i*4]-c.x,cs[i*4+1]-c.y,cs[i*4+2]-c.z)+cs[i*4+3]);
    const bs=new THREE.Sphere(c.clone(),rad*1.02);
    if(geoUse.get(g)===1&&!o.userData.partOf)g.boundingSphere=bs;else{const g2=shareGeo(g);g2.boundingSphere=bs;o.geometry=g2;}
    o.frustumCulled=true;culled++;});
  ctx.cull={split,trimmed,freedKB:Math.round(freed/1024),culled};
});
