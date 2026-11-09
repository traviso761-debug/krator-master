// ================================================================= HOST — the station's region (scale model 5.1), when it has one
// station.json "region" inlines REGION_DATA (tools/region.py: the raster's heights on a 2 km lattice round the site, relative to the
// site's cell). REGION.h(x, z) is that relief in the page's frame (x east, z south, metres), bilinear; REGION.blend(local, x, z, r0,
// r1) keeps a station's own ground model inside r0 of the site and eases to the model's relief past r1, so the far country (KFAR,
// 82-host-sky.js) is the map's real one (the Vale 3.7 km under the bloodfalls) and the map is the station's. Null with no region.
const REGION=typeof REGION_DATA==='undefined'?null:(function(D){const n=D.n,c=D.cell,A=D.dh;
 const h=(x,z)=>{const u=clamp((x-D.x0)/c,0,n-1.001),v=clamp((z-D.z0)/c,0,n-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*n+i;
  return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+n]*(1-fu)*fv+A[k+n+1]*fu*fv;};
 return{D,h,y0:D.y0,blend:(local,x,z,r0,r1,y0)=>{const r=Math.max(Math.abs(x),Math.abs(z)),k=smooth(r0,r1,r);return k<=0?local:local+(y0+h(x,z)-local)*k;}};})(REGION_DATA);
