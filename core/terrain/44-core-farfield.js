// ================================================================= CORE — the far field (KFAR: real relief beyond the ground square)  [G data]
// HEIGHT-RESEARCH.md item 3 (2026-10-26, the final rebuild's R3): one or more vertex-coloured grids from the edge of a page's
// ground out to 10-60 km, read from the page's terrainH carried on past the map, its own far function, or the scale model.
// Generalised from nwlowlands' Inner Wall range (biomes/nwlowlands/src/83-host-range.js) and nhighlands' far country
// (biomes/nhighlands/src/82-host-sky.js): both are a rectilinear lattice of grid lines, cells skipped inside the ground
// square and past a radius, a height and a colour per vertex. Optional, each off unless asked for:
//   exag   vertical exaggeration beyond a distance (x1.1-1.3: a far range reads as tall as it is)
//   curve  the planet's curvature: y drops by r^2 / 2R (Krator: R ~4,810 km, 84 km a degree, core/atmos skymodel)
//   crest  a crest pass: a vertex standing above the mean of its four neighbours is lifted by k times the excess, so
//          ridgelines stay sharp on a coarse lattice (dense lattices only: it needs the neighbours)
//
// No THREE, no DOM: plain maths, node-tested (test-farfield.js). The drawing is core/terrain/host/44h-core-farfield-draw.js
// (KFAR.mesh). Axes: y up, metres, x east, z south.
//
//   KFAR.lines({cell, inner, out, grow})  grid line positions, the same for x and z: every cell (integer multiples of
//        cell, so a square edge on a multiple falls on a line) out to +-inner, then (grow > 1) each step grow times the
//        last out to +-out. -> [..] ascending
//   KFAR.grid(o)  the lattice and its triangles:
//        o.lines    grid line positions (KFAR.lines), or o.cell + o.n (lines (k-n)*cell for k 0..2n)
//        o.h(x, z, i, j)        the height at a lattice point (i, j index o.lines along x and z)
//        o.skip(x0, z0, x1, z1, i, j)  true leaves the cell out (the ground square, beyond the radius, the land side)
//        o.color(x, z, y, c)    [r, g, b] (linear) for a vertex; c = {i, j, h (the height before exag, curve and crest),
//                               r (distance from o.centre), slope (dense only)}
//        o.attrs {name: {size, fn(x, z, y, c)}}  extra per-vertex attributes (a detail weight, a uv)
//        o.dense    false: only the vertices a kept cell uses, made in cell order (x outer, z inner; a cell's corners
//                   (i,j) (i+1,j) (i,j+1) (i+1,j+1)); true: every lattice point, row by row (z outer), the slope and the
//                   crest available
//        o.centre   [x, z] the distances are from (default [0, 0])
//        o.exag     {from, to, k, base}: y = base + (y - base) * (1 + (k - 1) * smooth(from, to, r)); base default 0
//        o.curve    {R, from}: y -= (r^2 - from^2) / (2R) past from (default 0: the page's centre); R default 4.81e6.
//                   Applied after exag; KFAR.shape(o, x, z, y) applies the two to any other height (a lake)
//        o.crest    {k, from, to}: (dense) y += k * max(0, y - mean of the 4 neighbours) * smooth(from, to, r); first
//        -> {pos, col, idx (Uint32), attrs {name: Float32Array}, lines, count {verts, tris}, H (heights as drawn, dense),
//            at(x, z) (dense: the drawn height, bilinear on the lattice)}
//   KFAR.hash(g)   a determinism hash of the arrays
(function(root){
  var KR=root.KRAND;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sm(a,b,v){if(a===b)return v<a?0:1;var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function lines(o){var c=o.cell,inner=o.inner==null?c*32:o.inner,out=o.out==null?inner:o.out,g=o.grow==null?1:o.grow,ni=Math.round(inner/c),L=[];
    if(!(c>0))throw new Error('KFAR.lines: cell must be > 0');
    for(var k=-ni;k<=ni;k++)L.push(k*c);
    if(out>inner&&g>1){var R=[],v=ni*c,st=c;while(v<out){st*=g;v=Math.min(out,v+st);R.push(v);}
      L=R.map(function(a){return -a;}).reverse().concat(L,R);}
    return L;}
  function grid(o){
    if(!o||typeof o.h!=='function')throw new Error('KFAR.grid: o.h(x,z) is required');
    var L=o.lines;if(!L){if(!(o.cell>0)||!(o.n>0))throw new Error('KFAR.grid: o.lines, or o.cell and o.n');L=[];for(var k=0;k<=2*o.n;k++)L.push((k-o.n)*o.cell);}
    var N=L.length,cx=o.centre?o.centre[0]:0,cz=o.centre?o.centre[1]:0,dense=!!o.dense,ex=o.exag||null,cu=o.curve||null,cr=o.crest||null;
    if(cr&&!dense)throw new Error('KFAR.grid: the crest pass needs a dense lattice');
    function rOf(x,z){return Math.hypot(x-cx,z-cz);}
    function shape(x,z,h){return shapeY(o,x,z,h);}
    var pos=[],col=[],idx=[],AT=o.attrs||{},names=Object.keys(AT),ext={};names.forEach(function(n){ext[n]=[];});
    var H0=null,H=null;
    function emit(i,j,y,h0,slope){var x=L[i],z=L[j],c={i:i,j:j,h:h0,r:rOf(x,z),slope:slope};pos.push(x,y,z);
      var cc=o.color?o.color(x,z,y,c):[1,1,1];col.push(cc[0],cc[1],cc[2]);
      for(var q=0;q<names.length;q++){var A=AT[names[q]],v=A.fn(x,z,y,c);if(A.size>1)for(var s=0;s<A.size;s++)ext[names[q]].push(v[s]);else ext[names[q]].push(v);}}
    if(dense){H0=new Float32Array(N*N);H=new Float32Array(N*N);   /* float32, as the drawn positions are */
      for(var j=0;j<N;j++)for(var i=0;i<N;i++){var h=o.h(L[i],L[j],i,j);H0[j*N+i]=h;H[j*N+i]=shape(L[i],L[j],h);}
      if(cr){var Hc=H.slice();for(j=1;j<N-1;j++)for(i=1;i<N-1;i++){var kk=j*N+i,mn=(H[kk-1]+H[kk+1]+H[kk-N]+H[kk+N])/4,ex2=H[kk]-mn;
        if(ex2>0)Hc[kk]=H[kk]+cr.k*ex2*sm(cr.from==null?0:cr.from,cr.to==null?(cr.from==null?0:cr.from):cr.to,rOf(L[i],L[j]));}H=Hc;}
      for(j=0;j<N;j++)for(i=0;i<N;i++){var i0=Math.max(0,i-1),i1=Math.min(N-1,i+1),j0=Math.max(0,j-1),j1=Math.min(N-1,j+1);
        var sl=Math.hypot((H0[j*N+i1]-H0[j*N+i0])/(L[i1]-L[i0]),(H0[j1*N+i]-H0[j0*N+i])/(L[j1]-L[j0]));emit(i,j,H[j*N+i],H0[j*N+i],sl);}
      for(j=0;j<N-1;j++)for(i=0;i<N-1;i++){if(o.skip&&o.skip(L[i],L[j],L[i+1],L[j+1],i,j))continue;var a=j*N+i,b=a+1,d=a+N,e=d+1;idx.push(a,d,b,b,d,e);}}
    else{var at=new Map();
      var vert=function(i,j){var key=j*N+i,v=at.get(key);if(v!==undefined)return v;var h=o.h(L[i],L[j],i,j);v=pos.length/3;at.set(key,v);emit(i,j,shape(L[i],L[j],h),h,null);return v;};
      for(i=0;i<N-1;i++)for(j=0;j<N-1;j++){if(o.skip&&o.skip(L[i],L[j],L[i+1],L[j+1],i,j))continue;var A=vert(i,j),B=vert(i+1,j),D=vert(i,j+1),E=vert(i+1,j+1);idx.push(A,D,B,B,D,E);}}
    var out={pos:new Float32Array(pos),col:new Float32Array(col),idx:new Uint32Array(idx),attrs:{},lines:L,count:{verts:pos.length/3,tris:idx.length/3}};
    names.forEach(function(n){out.attrs[n]=new Float32Array(ext[n]);});
    if(dense){out.H=H;out.at=function(x,z){var fi=locate(L,x),fj=locate(L,z);if(fi<0||fj<0)return NaN;var i=Math.floor(fi),j=Math.floor(fj),a=fi-i,b=fj-j;
      if(i>=N-1){i=N-2;a=1;}if(j>=N-1){j=N-2;b=1;}return H[j*N+i]*(1-a)*(1-b)+H[j*N+i+1]*a*(1-b)+H[(j+1)*N+i]*(1-a)*b+H[(j+1)*N+i+1]*a*b;};}
    return out;}
  // the options' change to one height (exag, then curve; no crest): for what a page draws beside the lattice (a lake)
  function shapeY(o,x,z,h){var ex=o.exag,cu=o.curve,r=Math.hypot(x-(o.centre?o.centre[0]:0),z-(o.centre?o.centre[1]:0)),y=h;
    if(ex){var b=ex.base==null?0:ex.base;y=b+(y-b)*(1+(ex.k-1)*sm(ex.from,ex.to==null?ex.from*2:ex.to,r));}
    if(cu){var R=cu.R==null?4.81e6:cu.R,f=cu.from==null?0:cu.from;if(r>f)y-=(r*r-f*f)/(2*R);}
    return y;}
  // the fractional index of v on ascending lines (-1 off them)
  function locate(L,v){if(v<L[0]||v>L[L.length-1])return -1;var lo=0,hi=L.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(L[m]<=v)lo=m;else hi=m;}return lo+(v-L[lo])/((L[hi]-L[lo])||1);}
  function hash(g){var h=KR?KR.hash(7,g.pos.length,g.idx.length):(g.pos.length*31+g.idx.length)>>>0;
    var mix=function(a,b){return KR?KR.hash(a,b):((a*16777619)^b)>>>0;};
    for(var i=0;i<g.pos.length;i+=5)h=mix(h,Math.round(g.pos[i]*100));for(i=0;i<g.col.length;i+=7)h=mix(h,Math.round(g.col[i]*1e4));for(i=0;i<g.idx.length;i+=11)h=mix(h,g.idx[i]);return h>>>0;}
  root.KFAR={lines:lines,grid:grid,shape:shapeY,hash:hash,locate:locate,R:4.81e6};
})(typeof globalThis!=='undefined'?globalThis:this);
