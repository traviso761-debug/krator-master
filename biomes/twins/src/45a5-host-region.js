// ================================================================= HOST — the station's region (scale model 5.1)
// station.json "region" inlines REGION_DATA (biomes/godthrone/tools/region.py --kit biomes/twins: the raster's heights on a 2 km lattice round
// the site, relative to the site's cell). REGION.h(x, z) is that relief in the page's frame, bilinear; REGION.smooth(x, z) the same
// averaged over a 520 m cross (the lattice is 2 km: bilinear, it creases at every line); REGION.blend(local, x, z, r0, r1, y0) keeps a
// station's own ground model inside r0 of the site and eases to the map's relief past r1, so the far country (82-host-far.js) is the
// map's real one. Every station has one (the Twins' pages all stand on the map).
const REGION=typeof REGION_DATA==='undefined'?null:(function(D){const n=D.n,c=D.cell,A=D.dh;
 const h=(x,z)=>{const u=clamp((x-D.x0)/c,0,n-1.001),v=clamp((z-D.z0)/c,0,n-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*n+i;
  return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+n]*(1-fu)*fv+A[k+n+1]*fu*fv;};
 const sm=(x,z)=>(h(x+260,z)+h(x-260,z)+h(x,z+260)+h(x,z-260))*.25;
 return{D,h,smooth:sm,y0:D.y0,blend:(local,x,z,r0,r1,y0)=>{const r=Math.max(Math.abs(x),Math.abs(z)),k=smooth(r0,r1,r);return k<=0?local:local+(y0+h(x,z)-local)*k;}};})(typeof REGION_DATA==='undefined'?null:REGION_DATA);
if(!REGION)reportErr('stage: no REGION_DATA (station.json "region"): the Twins\' stations stand on the map');
