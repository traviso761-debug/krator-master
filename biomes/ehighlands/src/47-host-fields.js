// ================================================================= HOST — the climate fields, cached, and the host binding (every station)
// The kit reads the world's fields (biomes/WORLD.md) through BIO.host: the land (46-host-land.js) defines them at a point
// (fieldsAt), this caches them on a 420 x 420 grid over the stage's square and binds the kit (BIO.init) to the land's
// terrain, water, LOD spine and windows. A station's land adds its own fields by naming them (STAGE.fields: the wet
// face's `forest`, the Lesser Throne's `warm`); a field a land does not return reads 0.
const FNAMES=['wet','flow','upland','rock','slope','cold','bog','mother','geo','gully','sun','tarn','tor','canyon','rim','dune','oasis','abyss','salt','barren'].concat(STAGE.fields||[]);
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope,hx,hz);FNAMES.forEach(n=>a[n][k]=F[n]||0);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
// the Mother's own field is read at full resolution (the kit drapes its cushion over it, 2 m a cell)
if(MOTHER)FIELD.mother=(x,z)=>{const M=motherAt(x,z);if(M.m<=0)return 0;return M.m*smooth(2.5,6,rillD(x,z));};
/* a station's fields too fine for the cache, read at full resolution (STAGE.exact {name: (x, z) -> value}; the Lesser Throne's warmth, 2026-11-08) */
if(STAGE.exact)for(const n in STAGE.exact)FIELD[n]=STAGE.exact[n];

// ---------------------------------------------------------------- the host binding
BIO.init({tags:'ehighlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:37,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:STAGE.lod||{hero:300,mid:820,far:2500,floor:[260,640]},windows:STAGE.windows||{}});
BIO.setSun(SUNP);
