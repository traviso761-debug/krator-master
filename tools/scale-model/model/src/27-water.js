  // water surface: one mesh, each lake at its own level (ring sea 0, highland lakes ~1.75 km, salt lakes -2.4 km)
  const wgeo=new THREE.PlaneGeometry(Wkm,Hkm,VW-1,VH-1); wgeo.rotateX(-Math.PI/2);
  const wpos=wgeo.attributes.position;
  const wcol=new Float32Array(wpos.count*3);
  for(let i=0;i<wpos.count;i++){ const salt=wlev[i]<-2000, hi=wlev[i]>800; const c=salt?[0.62,0.50,0.32]:hi?[0.36,0.62,0.66]:[0.25,0.44,0.66]; wcol[i*3]=c[0];wcol[i*3+1]=c[1];wcol[i*3+2]=c[2]; }
  wgeo.setAttribute('color',new THREE.BufferAttribute(wcol,3));
  const wmat=new THREE.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:0.6,roughness:0.25,metalness:0.1,depthWrite:false});
  const waterMesh=new THREE.Mesh(wgeo,wmat); scene.add(waterMesh);

