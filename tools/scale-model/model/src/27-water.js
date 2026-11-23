  // water surface: one mesh, each lake at its own level (ring sea 0, highland lakes ~1.75 km, salt lakes -2.4 km)
  const wgeo=new THREE.PlaneGeometry(Wkm,Hkm,MW-1,MH-1); wgeo.rotateX(-Math.PI/2);
  const wpos=wgeo.attributes.position;
  const wcol=new Float32Array(wpos.count*3);
  const wNearLev=new Float32Array(wpos.count);
  const wHasNear=new Uint8Array(wpos.count);
  for(let j=0;j<MH;j++) for(let i=0;i<MW;i++){
    const sx=Math.min(VW-1,i*MSTRIDE), sy=Math.min(VH-1,j*MSTRIDE), sidx=sy*VW+sx, vidx=j*MW+i;
    let useIdx=sidx;
    if(!whas[sidx]){
      for(let dj=-1;dj<=1&&useIdx===sidx;dj++) for(let di=-1;di<=1;di++){
        const ni=i+di, nj=j+dj;
        if(ni>=0&&ni<MW&&nj>=0&&nj<MH){
          const nsx=Math.min(VW-1,ni*MSTRIDE), nsy=Math.min(VH-1,nj*MSTRIDE), nidx=nsy*VW+nsx;
          if(whas[nidx]){ useIdx=nidx; wHasNear[vidx]=1; wNearLev[vidx]=wlev[nidx]; break; }
        }
      }
    }
    const salt=wlev[useIdx]<-2000, hi=wlev[useIdx]>800;
    const c=salt?[0.62,0.50,0.32]:hi?[0.30,0.58,0.65]:[0.25,0.44,0.66];
    wcol[vidx*3]=c[0]; wcol[vidx*3+1]=c[1]; wcol[vidx*3+2]=c[2];
  }
  wgeo.setAttribute('color',new THREE.BufferAttribute(wcol,3));
  const wmat=new THREE.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:0.6,roughness:0.25,metalness:0.1,depthWrite:false});
  const waterMesh=new THREE.Mesh(wgeo,wmat); scene.add(waterMesh);

