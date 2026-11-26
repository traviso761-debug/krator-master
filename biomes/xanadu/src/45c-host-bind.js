// ================================================================= HOST - the binding: the field cache and BIO.init, on the land (45b's contract)
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
// ---------------------------------------------------------------- the field cache (18 m lattice; terrainH stays exact)
const FC=(function(){const N=400,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,a={wet:new Float32Array(N*N),up:new Float32Array(N*N),mist:new Float32Array(N*N),flow:new Float32Array(N*N),sd:new Float32Array(N*N),slope:new Float32Array(N*N),h:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=TERR.X0+i/(N-1)*SX,z=TERR.Z0+j/(N-1)*SZ,k=j*N+i;
  a.wet[k]=FIELD_RAW.wet(x,z);a.up[k]=FIELD_RAW.upland(x,z);a.mist[k]=FIELD_RAW.mist(x,z);a.flow[k]=FIELD_RAW.flow(x,z);a.sd[k]=LAND.sd(x,z);a.slope[k]=slopeAt(x,z);a.h[k]=terrainH(x,z);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>0,upland:(x,z)=>FC.at(FC.a.up,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),mist:(x,z)=>FC.at(FC.a.mist,x,z)};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
const SPINE=LAND.spine;
/* THE GROUND AS DRAWN (the final rebuild, core/terrain KSEAT; swlowlands' lines): the biome core seats every plant on drawnH, the ground mesh's own
   triangles (46), not on terrainH, which rides over or under the 10 m cells between their vertices. placeH keeps every placement DECISION on terrainH
   (the mask, the fields), so no plant moves in x or z. Before the ground is built drawnH is terrainH; ?seat=0 for the old feet */
let GROUND_SEAT=null;
function drawnH(x,z){const h=GROUND_SEAT?KSEAT.down(GROUND_SEAT,x,z):null;return h?h.y:terrainH(x,z);}
BIO.init({tags:'xanadu',THREE:THREE,scene:scene,terrainH:XQ_ON('seat')?drawnH:terrainH,placeH:terrainH,
 mask:(x,z)=>{const h=terrainH(x,z)-(LAND.waterY==null?0:LAND.waterY);if(h<.15)return 0;if(!LAND.mask(x,z))return 0;
 const w=h<.6?(h-.15)/.45:1;const up=FC.at(FC.a.up,x,z),lim=mix(1.45,.95,smooth(.5,.8,up));return w*smooth(lim,lim*.55,FC.at(FC.a.slope,x,z));},   // nothing rooted under water or on a cliff; the mountains' faces stay bare rock
 obstacles:OBSTACLES,ticks:tick,seed:23,
 origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
BIO.setSun([-1200,950,-600]);
