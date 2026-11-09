// ================================================================= DAM BASINS — the n semiarid kit bound on the graveyard's ground (PLAN.md, D2)
// FRAGMENT NUMBER IS LOAD-BEARING: BIO.init runs after the scene, the terrain and the wrecks (90, 91a-e: the ground is final) and
// BEFORE the kit's species (91m-bio-50), which build their textures and materials against BIO.host.THREE at load. The kit is the
// overlay's flora (nsemiarid/PLAN.md, section 5: "the n semiarid kit, read in place (its fields from KBASIN.sample)"); it keeps
// its own PRNG, so nothing of the port lineage moves. Prefixed 91m-bio- so the port's rule check leaves it to the biome's rules.
//   THE FIELDS (the kit's names, BIOME-API.md): the basin's marks from KBASIN.sample (salt, bed, silt, strand, ring, shore, band,
//   dry); upland and cold from the absolute height (this frame's y = 0 is 900 m); slope and rock from the ground; scour the
//   outflow's channel (gyChanK: scoured gravel, near bare); wet the west dam's country (scale model 5.1 round dams.json's west
//   dam: BSh and Csa, 440-630 mm: wet ~ rain / 1800 as the kit's own page reads it), drier on the bed's silt and the scoured
//   gravel; no water anywhere (flow 0). Cached on a 16 m lattice over the flora's window.
//   THE MASK: nothing roots under a hulk (its keel's disks and 6 m), on the dam's ends, in the gap or beyond it.
const DB_FL=(()=>{const R=2600,C0=[gyAxis(-900),-900],N=Math.ceil(2*R/16)+1,X0=C0[0]-R,Z0=C0[1]-R,S={};
 const FN=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','bed','silt','strand','ring','shore','band','scour','dry'],A={};
 FN.forEach(n=>A[n]=new Float32Array(N*N));
 const H=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++)H[j*N+i]=terrainH(X0+i*16,Z0+j*16);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=X0+i*16,z=Z0+j*16,h=H[k],abs=h+DB.full;
  const hx=H[j*N+Math.min(N-1,i+1)]-H[j*N+Math.max(0,i-1)],hz=H[Math.min(N-1,j+1)*N+i]-H[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/32*1.6,0,1);
  const B=DB_BASIN.sample(x,z,h,S),sc=gyChanK(x,z);
  A.wet[k]=clamp(.27-.1*B.bed-.12*sc+.04*(fbm(x/700,z/700,1.3,2)-.5),0,1);A.upland[k]=clamp((abs-650)/800,0,1);A.cold[k]=clamp((abs-900)/2600,0,1);
  A.slope[k]=slope;A.rock[k]=clamp(Math.max(gySm(.38,.7,slope)*.9,sc*gySm(.25,.5,slope)*.8),0,1);A.scour[k]=sc;
  A.salt[k]=B.salt;A.bed[k]=B.bed;A.silt[k]=B.silt;A.strand[k]=B.strand;A.ring[k]=B.ring;A.shore[k]=B.shore;A.band[k]=B.band;A.dry[k]=B.dry/1000;}
 const at=(a,x,z)=>{const u=clamp((x-X0)/16,0,N-1.001),v=clamp((z-Z0)/16,0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*N+i;
  return a[k]*(1-fu)*(1-fv)+a[k+1]*fu*(1-fv)+a[k+N]*(1-fu)*fv+a[k+N+1]*fu*fv;};
 const fields={};FN.forEach(n=>fields[n]=(x,z)=>at(A[n],x,z));
 const hull=(x,z,pad)=>((PORT_LAYOUT.db&&PORT_LAYOUT.db.pile)||[]).some(p=>p.D.some(b=>Math.hypot(x-b[0],z-b[1])<b[2]+pad));
 const mask=(x,z)=>{if(z>GY.damZ0-150||Math.hypot(x-C0[0],z-C0[1])>R)return 0;if(hull(x,z,6))return 0;return 1;};
 const obstacles=[];((PORT_LAYOUT.db&&PORT_LAYOUT.db.pile)||[]).forEach(p=>p.D.forEach(b=>obstacles.push({x:b[0],z:b[1],r:b[2]+2,y0:-1e4,y1:1e4})));
 // the LOD spine: the pile and the channel up from it, the flanks' rings either side
 const spine=[C0];for(let z=-2600;z<=-200;z+=400)spine.push([gyAxis(z),z]);[-1,1].forEach(s=>spine.push([gyAxis(-2000)+s*gyW(-2000)*.9,-2000]));
 return {R,C0,fields,mask,obstacles,spine,A,at};})();
BIO.init({tags:DB_TAGS,THREE:THREE,scene:scene,terrainH:(x,z)=>terrainH(x,z),waterH:()=>-1e9,mask:DB_FL.mask,obstacles:DB_FL.obstacles,
 ticks:fn=>{PORT_FRAME.push(fn);},seed:23,origin:DB_FL.spine,center:DB_FL.C0,fields:DB_FL.fields,register:r=>REGISTER(r),err:m=>reportErr('biome: '+m),
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]}});
BIO.setSun([-1200,900,900]);   /* the kit's sun (90-scene.js) */
BIO.host.bodyLeaf=false;
