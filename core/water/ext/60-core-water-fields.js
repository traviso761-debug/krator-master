// ================================================================= WATER - ext: the water as fields, and the land side of its edge
// [G data]: no THREE, no DOM. Adds to WATER (20, 22; 21 for an open surface's shore). Opt-in by path. PRACTICE.md section 2.
//
// Ground wetness and flora drew their own idea of the shore (a distance to a line, a mask): the wet band and the plants' clearance then follow that,
// not the water the eye sees. These fields are the water's own numbers, where water is what WATER.audit calls water: a surface holds the point and
// its level there is over the ground (so a ribbon's real edge is where the ground comes up through it, or its own edge if that comes first).
//   WATER.fields({box, cell, ground, surfaces}) -> F, a raster on nodes: box [x0, z0, x1, z1], cell (m, 4), ground (x, z) -> y, surfaces (default all but
//        falls). Seconds for a biome's box at 4 m: bake it once and read it. Plain arrays, so a port reads the same record:
//        F.shore  m to the water's edge, signed: over 0 on land, under 0 in the water
//        F.depth  m of water over the ground (0 on land)
//        F.flow   m to the nearest running water (a flow's water; 0 in it; F.none where the box has no flow)
//   WATER.fieldAt(F, x, z) -> {shore, depth, flow}, bilinear; off the box the box's nearest edge node
//   WATER.fieldFns(F) -> {shore, depth, flow}: each (x, z) -> number, for a host's field table (BIO.field and the like)
// THE LAND SIDE: WATER.edgeAudit({field, plants, wet, band, wide, clear, tol}) -> findings in WATER.audit's shape (auditSummary reads them):
//   plant-in-water   a plant ({x, z, r, name}) inside the water or nearer it than r + clear (0 m), unless plant.aquatic (by: m short)
//   wet-short        land within `band` (4 m) of the real edge whose wet (x, z) -> 0..1 is under tol.low (.3): the wet band stops short of the water (by: m from the edge)
//   wet-wide         with `wide` (m), land past it whose wet is over tol.high (.7): the band follows something other than this water (a mask, an old line)
//   A kit's other wet sources (seeps, rain) are outside this: give `wet` the water's share alone, or o.allow(x, z) -> true where another source owns the ground.
(function(){const W=WATER,cl=(x,a,b)=>x<a?a:x>b?b:x;
 const levelAt=(S,x,z)=>S.kind==='flow'?S.heightAt(x,z):S.kind==='still'?S.level:S.levelAt(0);
 // a box round a surface's water (null: all of it), so only its own nodes ask it
 const boxOf=S=>{if(S.kind==='flow'){const mw=Math.max(...S.pts.map(p=>p.w||0));let b=[1e18,1e18,-1e18,-1e18];for(const p of S.pts)b=[Math.min(b[0],p.x-mw),Math.min(b[1],p.z-mw),Math.max(b[2],p.x+mw),Math.max(b[3],p.z+mw)];return b;}
  if(S.kind==='still'&&S.poly){const P=S.poly.map(p=>Array.isArray(p)?p:[p.x,p.z]);return[Math.min(...P.map(p=>p[0])),Math.min(...P.map(p=>p[1])),Math.max(...P.map(p=>p[0])),Math.max(...P.map(p=>p[1]))];}
  if(S.kind==='open'){const M=S.mask;return S.bounds||(M?[M.x0,M.z0,M.x0+M.cell*M.nx,M.z0+M.cellZ*M.nz]:null);}return null;};
 // the squared distance in cells to the nearest node where on(k) (Felzenszwalb's lower envelope, a pass a line, down the columns and along the rows)
 const INF=1e20;
 const pass=(f,n,get,set,v,z,d)=>{let k=0;for(let q=0;q<n;q++)f[q]=get(q);v[0]=0;z[0]=-Infinity;z[1]=Infinity;
  const cut=(q,p)=>((f[q]+q*q)-(f[p]+p*p))/(2*q-2*p);
  for(let q=1;q<n;q++){let s=cut(q,v[k]);while(s<=z[k]){k--;s=cut(q,v[k]);}k++;v[k]=q;z[k]=s;z[k+1]=Infinity;}
  k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;const p=v[k];d[q]=f[p]+(q-p)*(q-p);}for(let q=0;q<n;q++)set(q,d[q]);};
 const dist=(on,nx,nz)=>{const D=new Float64Array(nx*nz),m=Math.max(nx,nz),f=new Float64Array(m),d=new Float64Array(m),v=new Int32Array(m),z=new Float64Array(m+1);
  for(let i=0;i<D.length;i++)D[i]=on(i)?0:INF;
  for(let i=0;i<nx;i++)pass(f,nz,q=>D[q*nx+i],(q,y)=>{D[q*nx+i]=y;},v,z,d);
  for(let j=0;j<nz;j++)pass(f,nx,q=>D[j*nx+q],(q,y)=>{D[j*nx+q]=y;},v,z,d);return D;};
 W.fields=o=>{const b=o.box,c=o.cell==null?4:o.cell,ground=o.ground,nx=Math.ceil((b[2]-b[0])/c)+1,nz=Math.ceil((b[3]-b[1])/c)+1,N=nx*nz;
  const Y=new Float64Array(N),depth=new Float32Array(N),run=new Uint8Array(N),had=new Uint8Array(N);
  for(let j=0,k=0;j<nz;j++)for(let i=0;i<nx;i++,k++)Y[k]=ground(b[0]+i*c,b[1]+j*c);
  for(const S of(o.surfaces||W.surfaces)){if(S.kind==='fall'||S.kind==='shore')continue;const B=boxOf(S)||b,i0=cl(Math.floor((B[0]-b[0])/c),0,nx-1),i1=cl(Math.ceil((B[2]-b[0])/c),0,nx-1),j0=cl(Math.floor((B[1]-b[1])/c),0,nz-1),j1=cl(Math.ceil((B[3]-b[1])/c),0,nz-1);
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=b[0]+i*c,z=b[1]+j*c,k=j*nx+i;if(!S.contains(x,z))continue;const e=levelAt(S,x,z)-Y[k];if(e<=0)continue;if(e>depth[k])depth[k]=e;had[k]=1;if(S.kind==='flow')run[k]=1;}}
  const toWater=dist(k=>had[k],nx,nz),toLand=dist(k=>!had[k],nx,nz),toRun=dist(k=>run[k],nx,nz),none=(nx+nz)*c,shore=new Float32Array(N),flow=new Float32Array(N);
  /* half a cell off each side: the edge lies between a wet node and a dry one */
  for(let k=0;k<N;k++){shore[k]=had[k]?-(Math.sqrt(toLand[k])-.5)*c:(Math.sqrt(toWater[k])-.5)*c;flow[k]=run[k]?0:toRun[k]>=INF?none:Math.sqrt(toRun[k])*c;}
  return{x0:b[0],z0:b[1],cell:c,nx,nz,shore,depth,flow,none};};
 const bi=(F,A,x,z)=>{const u=cl((x-F.x0)/F.cell,0,F.nx-1),v=cl((z-F.z0)/F.cell,0,F.nz-1),i=Math.min(F.nx-2,Math.floor(u)),j=Math.min(F.nz-2,Math.floor(v)),fu=u-i,fv=v-j,k=j*F.nx+i;
  return(A[k]*(1-fu)+A[k+1]*fu)*(1-fv)+(A[k+F.nx]*(1-fu)+A[k+F.nx+1]*fu)*fv;};
 W.fieldAt=(F,x,z)=>({shore:bi(F,F.shore,x,z),depth:bi(F,F.depth,x,z),flow:bi(F,F.flow,x,z)});
 W.fieldFns=F=>({shore:(x,z)=>bi(F,F.shore,x,z),depth:(x,z)=>bi(F,F.depth,x,z),flow:(x,z)=>bi(F,F.flow,x,z)});
 W.edgeAudit=o=>{const F=o.field,band=o.band==null?4:o.band,clear=o.clear==null?0:o.clear,tol=Object.assign({low:.3,high:.7},o.tol||{}),out=[];
  const add=(rule,x,z,by,name)=>out.push({rule,surface:name||'the water\'s edge',id:-1,x:+x.toFixed(2),z:+z.toFixed(2),by:+(+by).toFixed(3)});
  for(const P of(o.plants||[])){if(P.aquatic)continue;const s=bi(F,F.shore,P.x,P.z),need=(P.r||0)+clear;if(s<need)add('plant-in-water',P.x,P.z,need-s,P.name);}
  if(o.wet)for(let j=0,k=0;j<F.nz;j++)for(let i=0;i<F.nx;i++,k++){const s=F.shore[k];if(s<=0)continue;const x=F.x0+i*F.cell,z=F.z0+j*F.cell;if(o.allow&&o.allow(x,z))continue;
   if(s<=band){const v=o.wet(x,z);if(v<tol.low)add('wet-short',x,z,s);}else if(o.wide!=null&&s>o.wide){const v=o.wet(x,z);if(v>tol.high)add('wet-wide',x,z,s);}}
  return out;};
})();
