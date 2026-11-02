  // region overlay: same geometry, painted canvas draped on top
  const OW=DATA.fullW, OH=DATA.fullH;
  const oc=document.createElement('canvas'); oc.width=OW; oc.height=OH; const og=oc.getContext('2d');
  const otex=new THREE.CanvasTexture(oc); otex.anisotropy=8;
  const omat=new THREE.MeshBasicMaterial({map:otex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const overlay=new THREE.Mesh(geo,omat); scene.add(overlay);
  const handles=new THREE.Group(); scene.add(handles);

