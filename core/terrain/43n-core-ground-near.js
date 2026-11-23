// ================================================================= CORE — the near ground (KGROUND.near: a fine patch of the ground round the camera)
// [G data] Plain arrays, no THREE and no DOM; the drawing is host/43n-core-ground-near-draw.js (KGROUND.nearMesh).
// Why (the owner, 2026-11-03, on ebadlands' banded flanks: "too uniformly bright, looks painted on"; core/terrain/GROUND.md, "Not done"):
// a biome page draws its ground as one N x N grid of 8-14 m cells, so the height function's small forms (KSTRATA's ledges, 0.3-2 m steps
// of hard and soft beds; a wadi's cut bank; a talus lip) fall between the vertices, and the shading has only a smooth band to light.
// KGROUND's relief bumps the normal, but a bump has no step and no lit riser. This module re-meshes a box of the page's own grid, a whole
// number of its cells, at a fine step from the page's height function, and cuts those cells out of the coarse index; the patch's rim
// takes the coarse surface's own height (exactly, on the coarse triangles' edges), easing to the true height over `blend` metres, so no
// crack and no step shows where the two meet. Every per-vertex attribute (zone weights, cavities, masks) is the coarse grid's,
// interpolated on the same triangles, so the paint is the coarse ground's and only the shape is finer. Opt-in: a page lists this file.
//
//   KGROUND.near.grid({N, x0, z0, cs, pos, attrs})      the coarse grid: N cells a side from (x0, z0), cs metres a cell, pos its
//                                                       (N+1)^2 xyz, attrs {name: {array, size}}; cells split a,b,d / b,c,d (THREE's
//                                                       PlaneGeometry and every biome ground: a (i,j), b (i,j+1), c (i+1,j+1), d (i+1,j))
//   KGROUND.near.at(G, x, z)                            the coarse triangle under (x, z): {k: [3 vertex ids], w: [3 weights]}
//   KGROUND.near.box(G, x, z, n)                        the n x n cell box centred on the cell under (x, z), kept inside the grid: {i0, j0, n}
//   KGROUND.near.build(G, box, o)                       the patch: o.h(x, z) the height, o.sub fine cells a coarse cell (or o.cell m),
//                                                       o.blend (m, cs: the rim's ease) -> {M, nx, pos, normal (the rim's coarse normal
//                                                       and its weight: ramp), ramp, idx, attrs {name: Float32Array}}; o.rows [from, to)
//                                                       builds part of it into o.into (an earlier build's arrays): a page spreads it over frames
//   KGROUND.near.cut(index, G, box, saved, o)           degenerates the box's cells in the coarse index after restoring `saved` (the last
//                                                       cut's); o.offset(i, j) the cell's first index (default (j*N+i)*6, six a cell) ->
//                                                       {box, vals, lo, hi} (lo..hi the index range touched)
//   KGROUND.near.uncut(index, saved)                    restores it
//   KGROUND.near.rough(pos, nx, G)                      the patch's departure from the coarse surface: {mean, max} metres (the page check)
(function(root){
  var K=root.KGROUND||(root.KGROUND={});
  function grid(o){if(!(o.N>0&&o.cs>0&&o.pos))throw new Error('KGROUND.near.grid: N, cs and pos are required');
    var nx=o.N+1;if(o.pos.length<nx*nx*3)throw new Error('KGROUND.near.grid: pos holds '+(o.pos.length/3|0)+' vertices, the grid '+nx*nx);
    return {N:o.N,nx:nx,x0:o.x0,z0:o.z0,cs:o.cs,pos:o.pos,nrm:o.normal||null,attrs:o.attrs||{}};}
  // the coarse triangle under a point: the cell, then which half (u+v<=1: a,b,d; else b,c,d)
  function at(G,x,z){var fx=(x-G.x0)/G.cs,fz=(z-G.z0)/G.cs,i=Math.min(G.N-1,Math.max(0,Math.floor(fx))),j=Math.min(G.N-1,Math.max(0,Math.floor(fz)));
    var u=Math.min(1,Math.max(0,fx-i)),v=Math.min(1,Math.max(0,fz-j)),a=j*G.nx+i,b=a+G.nx,c=b+1,d=a+1;
    if(u+v<=1)return {k:[a,b,d],w:[1-u-v,v,u]};
    return {k:[b,c,d],w:[1-u,u+v-1,1-v]};}
  function lerp3(arr,size,T,out,o){for(var c=0;c<size;c++)out[o+c]=arr[T.k[0]*size+c]*T.w[0]+arr[T.k[1]*size+c]*T.w[1]+arr[T.k[2]*size+c]*T.w[2];}
  function box(G,x,z,n){var i=Math.floor((x-G.x0)/G.cs),j=Math.floor((z-G.z0)/G.cs),h=Math.floor(n/2);n=Math.min(n,G.N);
    return {i0:Math.min(G.N-n,Math.max(0,i-h)),j0:Math.min(G.N-n,Math.max(0,j-h)),n:n};}
  function sstep(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
  function subOf(G,o){return o.sub!=null?Math.max(1,o.sub|0):Math.max(1,Math.round(G.cs/(o.cell==null?.5:o.cell)));}
  function build(G,bx,o){o=o||{};if(typeof o.h!=='function')throw new Error('KGROUND.near.build: o.h(x, z) is required');
    var sub=subOf(G,o),M=bx.n*sub,nx=M+1,fc=G.cs/sub,X0=G.x0+bx.i0*G.cs,Z0=G.z0+bx.j0*G.cs,bl=o.blend==null?G.cs:o.blend,
      names=Object.keys(G.attrs),r0=o.rows?o.rows[0]:0,r1=o.rows?Math.min(nx,o.rows[1]):nx,P=o.into;
    if(!P){P={M:M,nx:nx,sub:sub,fc:fc,x0:X0,z0:Z0,box:bx,pos:new Float32Array(nx*nx*3),normal:new Float32Array(nx*nx*3),ramp:new Float32Array(nx*nx),attrs:{}};
      names.forEach(function(n){P.attrs[n]=new Float32Array(nx*nx*G.attrs[n].size);});
      var idx=new Uint32Array(M*M*6),t=0;for(var j=0;j<M;j++)for(var i=0;i<M;i++){var a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
      P.idx=idx;}
    var span=M*fc,cn=[0,0,0];
    for(var jj=r0;jj<r1;jj++)for(var ii=0;ii<nx;ii++){var k=jj*nx+ii,x=X0+ii*fc,z=Z0+jj*fc,T=at(G,x,z),
        yc=G.pos[T.k[0]*3+1]*T.w[0]+G.pos[T.k[1]*3+1]*T.w[1]+G.pos[T.k[2]*3+1]*T.w[2],
        e=Math.min(ii,jj,M-ii,M-jj)*fc,r=e<=0?0:(bl>0?sstep(0,bl,e):1);
      P.pos[k*3]=x;P.pos[k*3+2]=z;P.pos[k*3+1]=r>0?yc+(o.h(x,z)-yc)*r:yc;P.ramp[k]=r;
      if(G.nrm){lerp3(G.nrm,3,T,cn,0);var L=Math.hypot(cn[0],cn[1],cn[2]);if(!(L>0))L=1;P.normal[k*3]=cn[0]/L;P.normal[k*3+1]=cn[1]/L;P.normal[k*3+2]=cn[2]/L;}
      for(var q=0;q<names.length;q++){var A=G.attrs[names[q]];lerp3(A.array,A.size,T,P.attrs[names[q]],k*A.size);}}
    P.done=r1>=nx;return P;}
  function offDefault(G){return function(i,j){return (j*G.N+i)*6;};}
  function uncut(index,saved){if(!saved)return null;var c=saved.cells,v=saved.vals,w=saved.per;
    for(var q=0;q<c.length;q++)for(var s=0;s<w;s++)index[c[q]+s]=v[q*w+s];return saved;}
  function cut(index,G,bx,saved,o){o=o||{};var off=o.offset||offDefault(G),per=o.per==null?6:o.per,lo=Infinity,hi=-1;
    if(saved){uncut(index,saved);lo=saved.lo;hi=saved.hi;}
    var cells=[],vals=new Uint32Array(bx.n*bx.n*per),q=0,l2=Infinity,h2=-1;
    for(var j=bx.j0;j<bx.j0+bx.n;j++)for(var i=bx.i0;i<bx.i0+bx.n;i++){var f=off(i,j);cells.push(f);
      for(var s=0;s<per;s++)vals[q*per+s]=index[f+s];var v0=index[f];for(s=0;s<per;s++)index[f+s]=v0;q++;
      if(f<l2)l2=f;if(f+per>h2)h2=f+per;}
    return {box:bx,cells:cells,vals:vals,per:per,lo:Math.min(lo,l2),hi:Math.max(hi,h2),cutLo:l2,cutHi:h2};}
  function rough(pos,nx,G){var s=0,m=0,n=0;for(var k=0;k<nx*nx;k++){var x=pos[k*3],z=pos[k*3+2],T=at(G,x,z),
      yc=G.pos[T.k[0]*3+1]*T.w[0]+G.pos[T.k[1]*3+1]*T.w[1]+G.pos[T.k[2]*3+1]*T.w[2],d=Math.abs(pos[k*3+1]-yc);s+=d;if(d>m)m=d;n++;}
    return {mean:n?s/n:0,max:m};}
  K.near={grid:grid,at:at,box:box,build:build,cut:cut,uncut:uncut,rough:rough,sub:subOf};
})(typeof globalThis!=='undefined'?globalThis:this);
