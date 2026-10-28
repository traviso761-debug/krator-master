  // zone texture (built from zone raster)
  const zc=document.createElement('canvas'); zc.width=zImg.width; zc.height=zImg.height;
  const zg=zc.getContext('2d'); const zd=zg.createImageData(zc.width,zc.height);
  for(let i=0;i<zone.length;i++){const c=ZCOL[zone[i]]||[0,0,0]; zd.data[i*4]=c[0];zd.data[i*4+1]=c[1];zd.data[i*4+2]=c[2];zd.data[i*4+3]=255;}
  zg.putImageData(zd,0,0); const ztex=new THREE.CanvasTexture(zc);
  const mat=new THREE.MeshStandardMaterial({map:tex,roughness:0.95,metalness:0,flatShading:false});
  const mesh=new THREE.Mesh(geo,mat); scene.add(mesh);
