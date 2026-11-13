  // ---- temperature layer: the embedded rasters, coloured and shaded by the relief ----
  const TRAMP=[[-60,[43,26,94]],[-40,[42,74,158]],[-20,[58,143,208]],[-5,[127,212,224]],[5,[185,232,176]],[15,[232,224,122]],[25,[240,169,74]],[35,[226,97,46]],[45,[184,31,31]],[55,[110,12,28]]];
  function tcol(v){
    if(v<=TRAMP[0][0]) return TRAMP[0][1];
    for(let i=1;i<TRAMP.length;i++){ const a=TRAMP[i-1],b=TRAMP[i];
      if(v<=b[0]){ const t=(v-a[0])/(b[0]-a[0]); return [a[1][0]+(b[1][0]-a[1][0])*t,a[1][1]+(b[1][1]-a[1][1])*t,a[1][2]+(b[1][2]-a[1][2])*t]; } }
    return TRAMP[TRAMP.length-1][1];
  }
  const shadeImg=await loadImg('data:image/jpeg;base64,'+DATA.t); const shp=pixels(shadeImg);
