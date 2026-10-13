// ================================================================= WATER - data: the shore (Phase 2 of core/atmos/WATER.md)
// [G data]: no THREE, no DOM. Adds to WATER (20-core-water.js, which must load first):
//
//   WATER.shoreGrid({ground, level, box, cell, seeds, land, band, clip})  -> a SHORE GRID: the ground sampled at cell
//        centres over box, the cells under `level` that the water REACHES (a 4-connected flood from `seeds`: points
//        [[x,z],...] or a predicate (x,z)=>bool; null = every cell under the level), and the SIGNED DISTANCE to the
//        shoreline in metres (+ out on the water, - inland or in a hollow the flood never reached), exact (the
//        Felzenszwalb-Huttenlocher squared distance transform: what a jump flood approximates). `ground` is a function
//        (x,z)=>y or anything with .h(x,z) (a KFIELD); `land` (x,z)=>true marks a cell dry whatever its height (a
//        core/mask raster read through its own transform: WATER.maskLand). The grid is bytes, as the bed's are, so the GPU
//        texture and the CPU twin read the same numbers: R, G the depth below the level (PRESETS.bed's two channels), B
//        the signed distance over [-band, +band], A the depth again, linear over PRESETS.shore.mid (-2..14 m, 6 cm a
//        step): a shore grid reads its depth from A, and from R only deeper than that, where nothing shoals. (The fine
//        channel G clamps at 3 m, so where one of the four texels a sample filters is deeper, G's value is biased by up
//        to half a metre and the GPU and the CPU can pick different channels: A is linear across the whole shoaling range.)
//   An open surface takes one with WATER.open({..., bed, bedBox, shore: {seeds, land, band, clip, cell}}): its bed IS the
//   grid, and the surface then
//    * stops where the flood stopped: S.wetAt(x,z) (shore distance > -clip cells); the drawing discards the rest, and the
//      CDLOD selection drops nodes with no wet cell (S.wetIn). A lake in a box no longer floods the lower hollow next door;
//    * SHOALS: its waves grow by Green's law toward the shore (S.shoalK(depth)), then calm to nothing at the waterline;
//    * SURFS: a breaker train runs in along the shore distance (S.surfAt: crests parallel to the coast, a whole number of
//      cycles per wave period, their fronts steepened (the lip leaning shoreward), born at the band's edge, dying at the
//      waterline), with foam where they break (S.surfFoamAt);
//    * WETS THE SAND: S.wetGroundAt(x, z, groundY, t) -> [wet, film]: the band of beach the swash reaches stays dark and
//      the swash's own film glistens (the ground's shader takes it: 51-core-water-kinds.js WATER.wetGround).
//   WATER.wetGroundRain(wet, ny) the rain's share (Phase 4: W.wet on an up-facing surface)
(function(){const W=WATER,TAU=Math.PI*2,ss=W.ss,fr=W.fr,cl=(x,a,b)=>x<a?a:x>b?b:x;
 // the presets (every number the twins and the shaders read)
 W.PRESETS.shore={band:100,clip:1,cell:4,mid:[-2,14],
  // shoaling: K = (depth0 / depth)^(1/4) under depth0 m (Green's law), capped at max
  shoal:{depth:12,max:1.8,min:.5},
  // the breaker train: height m, wavelength m, its period (whole cycles per wave period: n = round(period / sec)), the
  // front's steepening at the break (the second harmonic's share), the depths it breaks over [start, waterline], the share
  // of the band it is born over (from the band's edge inward), its foam, and the step (m) of the slope's differences
  surf:{amp:.3,lambda:26,sec:9,skew:.32,depth:[2.6,.08],born:.45,foam:.85,h:.25},
  // the wet sand: how high the swash runs up the beach (m above the level) and the band inland that can be wet (m)
  wet:{runup:1.1,band:40,dark:.45,gloss:.75}};
 const P=()=>W.PRESETS.shore;

 // ---- the squared distance transform (1D, Felzenszwalb-Huttenlocher). f: sources 0, others INF; exact in doubles
 // (INF + q^2 is exact while q < 2^21), so kwater.gd's twin gives the same numbers
 const INF=1e12;
 function dt1(f,n,d,v,z){let k=0;v[0]=0;z[0]=-Infinity;z[1]=Infinity;
  for(let q=1;q<n;q++){let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);while(s<=z[k]){k--;s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);}k++;v[k]=q;z[k]=s;z[k+1]=Infinity;}
  k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;d[q]=(q-v[k])*(q-v[k])+f[v[k]];}}
 // the squared distance (cells) from every cell to the nearest cell where src is set: columns, then rows
 W.edt=(src,nx,nz)=>{const N=Math.max(nx,nz),f=new Float64Array(N),d=new Float64Array(N),v=new Int32Array(N),z=new Float64Array(N+1),out=new Float64Array(nx*nz);
  for(let i=0;i<nx;i++){for(let j=0;j<nz;j++)f[j]=src[j*nx+i]?0:INF;dt1(f,nz,d,v,z);for(let j=0;j<nz;j++)out[j*nx+i]=d[j];}
  for(let j=0;j<nz;j++){for(let i=0;i<nx;i++)f[i]=out[j*nx+i];dt1(f,nx,d,v,z);for(let i=0;i<nx;i++)out[j*nx+i]=d[i];}
  return out;};
 W.EDT_INF=INF;

 // ---- the grid
 W.shoreGrid=o=>{const Q=P(),B=W.PRESETS.bed,c=o.cell==null?Q.cell:o.cell,box=o.box,level=o.level,band=o.band==null?Q.band:o.band,
   nx=Math.max(2,Math.ceil((box[2]-box[0])/c)),nz=Math.max(2,Math.ceil((box[3]-box[1])/c)),n=nx*nz;
  const gfn=typeof o.ground==='function'?o.ground:(x,z)=>o.ground.h(x,z);
  const ground=new Float64Array(n),below=new Uint8Array(n),wet=new Uint8Array(n);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=box[0]+(i+.5)*c,z=box[1]+(j+.5)*c,k=j*nx+i,g=gfn(x,z);ground[k]=g;
   below[k]=g<level&&!(o.land&&o.land(x,z))?1:0;}
  // the flood: from the seed cells under the level, 4-connected, in a fixed order (a queue)
  const S=o.seeds;
  if(S==null)wet.set(below);
  else{const q=new Int32Array(n);let h=0,t=0;const push=k=>{if(below[k]&&!wet[k]){wet[k]=1;q[t++]=k;}};
   if(typeof S==='function'){for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(S(box[0]+(i+.5)*c,box[1]+(j+.5)*c))push(j*nx+i);}
   else for(const p of S){const i=Math.floor((p[0]-box[0])/c),j=Math.floor((p[1]-box[1])/c);if(i>=0&&j>=0&&i<nx&&j<nz)push(j*nx+i);}
   while(h<t){const k=q[h++],i=k%nx,j=(k-i)/nx;if(i>0)push(k-1);if(i<nx-1)push(k+1);if(j>0)push(k-nx);if(j<nz-1)push(k+nx);}}
  // the signed distance (m): + on the water (to the nearest cell not wet), - elsewhere (to the nearest wet cell); the
  // shoreline between two cell centres is at 0
  const dry=new Uint8Array(n);for(let k=0;k<n;k++)dry[k]=wet[k]?0:1;
  const din=W.edt(dry,nx,nz),dout=W.edt(wet,nx,nz),dist=new Float64Array(n),data=new Uint8Array(n*4),D=B.deep,F=B.fine;
  for(let k=0;k<n;k++){const s=wet[k]?(din[k]>=INF/2?band:(Math.sqrt(din[k])-.5)*c):(dout[k]>=INF/2?-band:-(Math.sqrt(dout[k])-.5)*c);dist[k]=s;
   const dd=level-ground[k],o4=k*4;data[o4]=Math.round(255*Math.sqrt(cl((dd-D[0])/(D[1]-D[0]),0,1)));data[o4+1]=Math.round(255*cl((dd-F[0])/(F[1]-F[0]),0,1));
   data[o4+2]=Math.round(255*cl(.5+s/(2*band),0,1));data[o4+3]=Math.round(255*cl((dd-Q.mid[0])/(Q.mid[1]-Q.mid[0]),0,1));}
  const G={x0:box[0],z0:box[1],cell:c,nx,nz,data,level,shore:true,band,clip:o.clip==null?Q.clip:o.clip,wet,dist,
   wetCells:wet.reduce((a,b)=>a+b,0),seeded:S!=null};
  // the cells the surface may draw over (shore distance > -(clip + 1) cells: a node holding none is dropped), as a
  // summed-area table, so S.wetIn(box) is four lookups
  const sat=new Int32Array((nx+1)*(nz+1)),lim=-(G.clip+1)*c;
  for(let j=0;j<nz;j++){let row=0;for(let i=0;i<nx;i++){row+=dist[j*nx+i]>lim?1:0;sat[(j+1)*(nx+1)+i+1]=sat[j*(nx+1)+i+1]+row;}}
  G.sat=sat;return G;};
 // a core/mask raster as land: (x,z)=>true where the mask's red channel at toPx(x,z) is over thresh (a KMASK.canvas's own
 // bytes, mask.data: no canvas is read)
 W.maskLand=(mask,toPx,thresh)=>{const w=mask.width,h=mask.height,d=mask.data,t=thresh==null?127:thresh;
  return(x,z)=>{const p=toPx(x,z),i=Math.floor(p[0]),j=Math.floor(p[1]);return i>=0&&j>=0&&i<w&&j<h&&d[(j*w+i)*4]>t;};};

 // ---- a shore WINDOW (WATER.open with shore.window): a grid that follows the camera
 // its grid before the first bake: open water everywhere (deep, far from any shore), every cell drawable
 W.shoreBlank=S=>{const Q=S.shoreWin,n=Q.n,data=new Uint8Array(n*n*4).fill(255),sat=new Int32Array((n+1)*(n+1));
  for(let j=1;j<=n;j++)for(let i=1;i<=n;i++)sat[j*(n+1)+i]=i*j;
  return{x0:-n*Q.cell/2,z0:-n*Q.cell/2,cell:Q.cell,nx:n,nz:n,data,level:S.base,shore:true,band:Q.band,clip:Q.clip==null?P().clip:Q.clip,wetCells:n*n,seeded:Q.seeds!=null,sat,blank:true};};
 // its box centred on (cx, cz), snapped to its cells (so a move re-samples the same lattice)
 W.shoreBox=(S,cx,cz)=>{const Q=S.shoreWin,h=Q.n*Q.cell/2,x0=Math.round((cx-h)/Q.cell)*Q.cell,z0=Math.round((cz-h)/Q.cell)*Q.cell;return[x0,z0,x0+Q.n*Q.cell,z0+Q.n*Q.cell];};
 // re-bake it there now
 W.moveShore=(S,cx,cz)=>{const Q=S.shoreWin;S.bed=W.shoreGrid({ground:Q.ground,level:S.base,box:W.shoreBox(S,cx,cz),cell:Q.cell,seeds:Q.seeds,land:Q.land,band:Q.band,clip:Q.clip});
  if(S.onShore)S.onShore(S.bed);return S.bed;};
 // ... or a job that samples the ground a slice at a time (step(n): n samples, -> true when the new grid is in place; the
 // host decides how many fit its frame), so a streamed world re-bakes as the camera moves without a long frame; the
 // flood, the transform and the bytes run in the last step
 W.shoreJob=(S,cx,cz)=>{const Q=S.shoreWin,box=W.shoreBox(S,cx,cz),n=Q.n,c=Q.cell,gfn=typeof Q.ground==='function'?Q.ground:(x,z)=>Q.ground.h(x,z),H=new Float64Array(n*n);let k=0;
  return{box,done:false,left:()=>n*n-k,step(m){const end=Math.min(n*n,k+Math.max(1,m==null?n*n:m));
   while(k<end){const i=k%n,j=(k-i)/n;H[k]=gfn(box[0]+(i+.5)*c,box[1]+(j+.5)*c);k++;}if(k<n*n)return false;
   S.bed=W.shoreGrid({ground:(x,z)=>H[Math.min(n-1,Math.floor((z-box[1])/c))*n+Math.min(n-1,Math.floor((x-box[0])/c))],level:S.base,box,cell:c,seeds:Q.seeds,land:Q.land,band:Q.band,clip:Q.clip});
   if(S.onShore)S.onShore(S.bed);this.done=true;return true;}};};

 // ---- the twins on a grid (G as W.shoreGrid makes it, or as an export carries it: the bytes are the truth)
 // channel k (0..3) bilinear over the texel centres, clamped at the edges, as the GPU filters; null outside the box
 W.gridSample=(G,x,z,k)=>{const u=(x-G.x0)/(G.cell*G.nx),v=(z-G.z0)/(G.cell*G.nz);if(u<0||v<0||u>1||v>1)return null;
  const fx=u*G.nx-.5,fz=v*G.nz-.5,i0=Math.floor(fx),j0=Math.floor(fz),ax=fx-i0,az=fz-j0,ch=(i,j)=>G.data[(cl(j,0,G.nz-1)*G.nx+cl(i,0,G.nx-1))*4+k]/255;
  return(ch(i0,j0)*(1-ax)+ch(i0+1,j0)*ax)*(1-az)+(ch(i0,j0+1)*(1-ax)+ch(i0+1,j0+1)*ax)*az;};
 // the signed shore distance (m) at (x,z) from the bytes: +band outside the grid (open water, far from any shore)
 W.shoreDist=(G,x,z)=>{const b=W.gridSample(G,x,z,2);return b==null?G.band:(b-.5)*2*G.band;};
 // Green's law: the waves' growth over a bed `depth` m down (1 offshore)
 W.shoalK=depth=>{const Q=P().shoal;return depth>=Q.depth?1:Math.min(Q.max,Math.pow(Q.depth/Math.max(depth,Q.min),.25));};
 // the breaker train's whole cycles per period
 W.surfCycles=()=>Math.max(1,Math.round(W.period()/P().surf.sec));
 // the breaker's phase (rad) at shore distance d (m) and time t: crests run in toward d = 0
 W.surfPhase=(d,t)=>TAU*(fr(d/P().surf.lambda)+fr(t*W.surfCycles()/W.period()));
 // its envelope: born over the outer `born` of the band, shoaled, gone at the waterline; and how far it has broken (0..1)
 W.surfEnv=(d,depth,band)=>{const Q=P().surf;return ss(band,band*(1-Q.born),d)*ss(Q.depth[1],Q.depth[0],depth);};
 W.surfBreak=depth=>{const Q=P().surf;return 1-ss(Q.depth[0]*.4,Q.depth[0],depth);};
 // the height the breakers add at (x,z) (a world point: they move nothing sideways, so heightAt's inverse is unchanged):
 // A * env * K * (sin psi + skew * brk * sin 2 psi): the second harmonic steepens the shoreward face as it breaks
 W.surfAt=(G,x,z,t,depth)=>{const Q=P().surf,d=W.shoreDist(G,x,z),e=W.surfEnv(d,depth,G.band);if(e<=0)return 0;
  const a=W.surfPhase(d,t),b=W.surfBreak(depth);return Q.amp*e*W.shoalK(depth)*(Math.sin(a)+Q.skew*b*Math.sin(2*a));};
 // their slope at (x,z): central differences h = PRESETS.shore.surf.h m either side (the fragment takes the same four)
 W.surfSlope=(S,x,z,t)=>{const h=P().surf.h;return[(S.surfAt(x+h,z,t)-S.surfAt(x-h,z,t))/(2*h),(S.surfAt(x,z+h,t)-S.surfAt(x,z-h,t))/(2*h)];};
 // the foam where they break: on the crest and its front, in the breaking depths
 W.surfFoamAt=(G,x,z,t,depth)=>{const Q=P().surf,d=W.shoreDist(G,x,z),e=W.surfEnv(d,depth,G.band);if(e<=0)return 0;
  const a=W.surfPhase(d,t),pr=(Math.sin(a)+Q.skew*Math.sin(2*a))/(1+Q.skew);return Q.foam*W.surfBreak(depth)*ss(.15,.85,pr)*ss(0,.25,e);};
 // the beach: [wet, film] for ground at height gy (m) at (x,z): wet where the swash reaches (gy - level under the
 // runup, inside the wet band), film where the swash is now (its edge runs up and back once per breaker)
 W.wetGroundAt=(G,x,z,gy,t,level)=>{const Q=P().wet,d=W.shoreDist(G,x,z),r=gy-level;if(d<-Q.band||r>Q.runup)return[0,0];
  const sw=Q.runup*(.2+.8*(.5+.5*Math.sin(TAU*fr(t*W.surfCycles()/W.period())-.6)));
  return[ss(Q.runup,Q.runup*.25,r)*ss(-Q.band,-Q.band*.6,d),r<0?0:ss(sw,sw-.12,r)];};
 // the rain's share of a surface's wetness (Phase 4): W.wet on what faces up
 W.wetGroundRain=(wet,ny)=>wet*ss(.35,.8,ny);
})();
