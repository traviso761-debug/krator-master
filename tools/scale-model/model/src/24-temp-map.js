  const tcv=document.createElement('canvas'); tcv.width=tmImg.width; tcv.height=tmImg.height;
  const tgx=tcv.getContext('2d'); const ttex=new THREE.CanvasTexture(tcv); ttex.anisotropy=8;
  function buildTemp(mode){
    const src = mode==='hi'?TH : (mode==='lo'?TL : TM);
    const id=tgx.createImageData(tcv.width,tcv.height);
    for(let i=0;i<src.length;i++){
      const v=src[i];
      if(v<=-89 || zone[i]===2){ id.data[i*4]=shp[i*4]; id.data[i*4+1]=shp[i*4+1]; id.data[i*4+2]=shp[i*4+2]; id.data[i*4+3]=255; continue; }
      const c=tcol(v), s=0.55+0.70*(shp[i*4]/255);
      id.data[i*4]=Math.min(255,c[0]*s); id.data[i*4+1]=Math.min(255,c[1]*s); id.data[i*4+2]=Math.min(255,c[2]*s); id.data[i*4+3]=255;
    }
    tgx.putImageData(id,0,0); ttex.needsUpdate=true;
  }
  buildTemp('mean');
