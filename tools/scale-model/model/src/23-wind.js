  // --- wind layer -------------------------------------------------------------
  const wdImg=await loadImg('data:image/png;base64,'+DATA.wd); const wdp=pixels(wdImg);
  const WDW=wdImg.width, WDH=wdImg.height;
  const WDMAX=DATA.wdmax||3000, WDGAM=DATA.wdgam||2.2, WDVMAX=DATA.wdvmax||25;
  const WPOW=new Float32Array(WDW*WDH), WVEL=new Float32Array(WDW*WDH), WDEAD=new Uint8Array(WDW*WDH);
  for(let i=0;i<WDW*WDH;i++){
    WPOW[i]=WDMAX*Math.pow(wdp[i*4]/255,WDGAM);
    WVEL[i]=WDVMAX*(wdp[i*4+1]/255);
    WDEAD[i]=wdp[i*4+2]>127?1:0;
  }
  const WRAMP=[[0,[247,240,223]],[200,[242,219,166]],[400,[233,188,107]],[700,[217,148,47]],[1000,[185,108,22]],[1300,[141,74,16]],[1600,[90,42,11]]];
  function windCol(v){
    if(v<=WRAMP[0][0]) return WRAMP[0][1];
    for(let i=1;i<WRAMP.length;i++){ const a=WRAMP[i-1],b=WRAMP[i];
      if(v<=b[0]){ const t=(v-a[0])/(b[0]-a[0]); return [a[1][0]+(b[1][0]-a[1][0])*t,a[1][1]+(b[1][1]-a[1][1])*t,a[1][2]+(b[1][2]-a[1][2])*t]; } }
    return WRAMP[WRAMP.length-1][1];
  }
  const wdcv=document.createElement('canvas'); wdcv.width=WDW; wdcv.height=WDH;
  const wdgx=wdcv.getContext('2d'); const wdtex=new THREE.CanvasTexture(wdcv); wdtex.anisotropy=8;
  (function buildWind(){
    const id=wdgx.createImageData(WDW,WDH);
    const sw=shadeImg.width, sh_=shadeImg.height;
    for(let y=0;y<WDH;y++) for(let x=0;x<WDW;x++){
      const i=y*WDW+x;
      const si=(Math.min(sh_-1,(y*sh_/WDH)|0)*sw+Math.min(sw-1,(x*sw/WDW)|0))*4;
      if(WDEAD[i]){ id.data[i*4]=shp[si]; id.data[i*4+1]=shp[si+1]; id.data[i*4+2]=shp[si+2]; id.data[i*4+3]=255; continue; }
      const c=windCol(WPOW[i]), s=0.55+0.70*(shp[si]/255);
      id.data[i*4]=Math.min(255,c[0]*s); id.data[i*4+1]=Math.min(255,c[1]*s); id.data[i*4+2]=Math.min(255,c[2]*s); id.data[i*4+3]=255;
    }
    wdgx.putImageData(id,0,0); wdtex.needsUpdate=true;
  })();
