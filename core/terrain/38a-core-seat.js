// ================================================================= CORE — the surface as drawn: seat, contact, clearance, doors, stairs  [G data]
// CORE-IMPROVEMENTS.md item 1 (the most common recurring bug, about 17 biomes and 30 kits or settlements): things placed on
// the height or outline the code COMPUTES (terrainH, KSTACKS.topAt, footR, a record's radius) while the page DRAWS another
// surface (a ground of 10 to 44 m cells, a KSTACKS wall of at most 160 segments standing up to 12 m inside its outline, a
// weathered or contoured body, a carve). So they float, sink, stand inside rock, or block a door. KSEAT answers every
// question against the triangles the page draws, and its sweeps measure placed records against them (Pinnacle Rock's
// ROCKRAY, the method lifted; memory: "check against the drawn mesh").
//
// No THREE, no DOM: plain maths on flat arrays, node-tested (test-seat.js), so Godot can port it. Opt-in: a build lists
// '38a-core-seat.js' in CORE_TERRAIN (core/host's 95b-host-seat.js puts the sweeps on the probe). Axes: y up, metres, x east,
// z south. Faces wind CCW seen from OUTSIDE (the drawn convention: back faces culled; KSTACKS.mesh, a PlaneGeometry ground
// laid flat with rotateX(-PI/2)): "inside" is read from which side of the first face a ray meets.
//
// SURFACES (what was drawn)
//   KSEAT.tris(pos, idx?, o?)       a surface from a drawn mesh's arrays: pos flat [x,y,z, ...] (a BufferGeometry's position
//                                   array), idx its index (null: triangle soup). o.matrix: 16 numbers, column-major (three's
//                                   matrixWorld.elements) taking pos to the world; o.id, o.cls ('ground', 'rock', 'built' ...);
//                                   o.cell (the xz bucket, metres; from the triangles' size when not given)
//   KSEAT.grid(h, box, cell, o?)    the ground AS DRAWN by a displaced grid: h(x,z) (or a KFIELD: its h) sampled at the grid's
//                                   vertices only, box [x0,z0,x1,z1], cell metres (or {nx, nz} segments). Between vertices it
//                                   reads the drawn triangle, not h: the 44 m cell that loses the brook loses it here too.
//                                   o.diag: 'pg' (default; a THREE.PlaneGeometry rotated -PI/2 about x: each cell split from
//                                   (x0,z1) to (x1,z0)) or 'nw' (split from (x0,z0) to (x1,z1))
//   KSEAT.stacks(list, opt?, post?) the KSTACKS bodies as drawn: KSTACKS.mesh(B, opt) each (opt the page's own: step, segMax,
//                                   top), post(B, m) the page's own afterwards (KSTACKS.contour, KSTACKS.weather); cls 'rock'
//   KSEAT.lazy(items)               a surface made of items {id, cls, box:[x0,y0,z0,x1,y1,z1], make: () => surface}, each made
//                                   the first time a query reaches its box (the probe's scene: a mesh is bucketed when asked)
//   Anywhere a surface is taken, an array of surfaces is too. o.skip (a Set or array of ids) leaves surfaces out of a query.
//
// QUERIES
//   KSEAT.down(S, x, z, from?, o?)  {y, n:[x,y,z], id, cls} the first drawn face a ray down from `from` (default: above
//                                   everything) meets, its unit normal; or null
//   KSEAT.ray(S, p, d, far?, o?)    {t, x, y, z, n, id, cls, back} the first face along p + t d (d need not be unit; t in d's
//                                   lengths), back true when the ray met it from behind (it started inside that body); or null.
//                                   Faces seen edge-on (|cos| < o.edge, .02) are skipped, as ROCKRAY does
//   KSEAT.under(S, x, y, z, o?)     how deep (x,y,z) is under the drawn surface: up through every face met from behind (in
//                                   the rock, under the ground; a body's hidden bed tops are drawn inside it) to where the
//                                   point comes out, else 0
//   KSEAT.gap(S, x, y, z, dx, dz, o?)  the level distance from the point to the drawn surface along (dx,dz): cast from o.back
//                                   (8 m) behind, so positive in the air, negative in the rock; null when nothing is met
//
// SEATING (a placer calls this in place of terrainH)
//   KSEAT.seat(S, foot, o?)         foot {x, z, r?, w?, d?, ry?, n?, sink?, from?}: r a round footprint (n samples round it, 8),
//                                   or w by d turned by ry (corners and edge middles); sink metres into the surface (0).
//      -> {y, lo, hi, yc, spread, n, tilt, id, cls, hits, miss} or null when nothing is drawn under the centre.
//         y = lo - sink: the LOWEST of the footprint (Farside's rule), so no edge floats and the uphill edge is buried by
//         spread; n the plane fitted through the samples (the face's own normal for a point foot), tilt its angle from up
//
// THE SWEEPS (plain functions over records; core/host's 95b-host-seat.js runs them on the drawn scene)
//   A record is a core/tags record ({id, class, at:[x,y,z], ry, size:[w,d,h] | r, h}) or the same fields flat (x, y, z).
//   KSEAT.contact(S, rec, o?)       one placed foot against the drawn surface: {id, status, gap, depth, h}. rec.foot =
//                                   {r | w,d, tol (.3), reach (2: how far over the foot the rays start), clear (.5: the
//                                   headroom that must be out of rock)}; a foot with no r or w is a point.
//                                   status 'buried' (every sample under the drawn surface by more than tol: depth),
//                                   'off' (nothing drawn under it within o.drop, 50 m), 'float' (every sample's surface more
//                                   than tol under the foot: gap), 'inside' (the foot is on a surface, but the point `clear`
//                                   over it is in a body: placed between a wall's rows), else 'ok'
//   KSEAT.contactSweep(S, recs, o?) every record carrying a foot (o.all: every record; o.filter(rec)) checked:
//                                   {n, ok, fails:[contact...], by:{float, buried, inside, off}, worst:{gap, depth}, neg}.
//                                   o.neg (default true) is the negative control: the first passing record lifted 2 m must
//                                   read 'float' (neg true), so a sweep that sees nothing cannot pass
//   KSEAT.clearSweep(recs, o?)      boxes of DIFFERENT classes that overlap: oriented boxes from at, ry, size (a round thing
//                                   from r), with their heights; o.pairs [['building','street'], ...] limits the class pairs,
//                                   o.tol (.15 m: boxes that touch are apart). {n, pairs, fails:[{a, b, depth}], worst}.
//                                   The broad phase is core/space (KSPACE) when it is loaded
//   KSEAT.doorSweep(S, doors, o?)   a door {id, at:[x,y,z] (the sill's middle), ry (the door faces +z turned by ry: out is
//                                   (sin ry, cos ry)), w (1), h (2), depth (the wall, .6), reach (1.2: clear that far in past
//                                   the wall)}: nine rays in through the opening (3 heights by 3 across, inset 15%) from 1.5 m
//                                   out; blocked when the middle ray or 3 of the 9 meet something before depth + reach (Ys's
//                                   ray probe: its own building's skin), and 'no step' when nothing is drawn within o.tol
//                                   (.4) of the sill 1 m outside. {n, ok, fails:[{id, status, rays}]}
//   KSEAT.stairSweep(S, stairs, o?) a stair {id, head:[x,y,z], foot:[x,y,z], pts?}: the head's and the foot's floor drawn
//                                   within o.tol (.4) of them ('short'), and every metre of the flight (pts, the treads'
//                                   line from foot to head; else the straight line) with o.heads ([1, 1.8]) of headroom out
//                                   of the drawn bodies ('into wall', at the point). {n, ok, fails:[{id, status, at}]}
//   In every sweep the thing's own drawing is left out by o.skip (the ids of its surfaces), or by building S without it.
//
// DRAWERS' PROBE POINTS (item 6: a registered volume reads empty when the probe samples a merged mesh at its box centre)
//   With this fragment loaded, KSTACKS.mesh(B, opt) returns m.probe as well: a flat [x,y,z] at the body's middle bed, half way
//   up (KSTACKS.hash reads pos and idx only, so a mesh's hash is unchanged); KSEAT.points(meshes) joins several into one flat
//   array for a merged mesh's userData.probePoints. KCARVE.mesh (and every KCARVE.create()) sets userData.probePoints on each
//   patch mesh: the patch's mouth, half way up its void.
(function(root){
'use strict';
var EPS=1e-9;
function num(v,d){return v==null||!isFinite(v)?d:+v;}
function skipSet(o){var s=o&&o.skip;if(!s)return null;return s instanceof Set?s:new Set(s);}

// ---------------------------------------------------------------- the ray and one triangle (Moller-Trumbore)
// returns t (in d's lengths) or -1; R holds the face normal (not unit) of the hit
function triHit(px,py,pz,dx,dy,dz,ax,ay,az,bx,by,bz,cx,cy,cz,R){
  var e1x=bx-ax,e1y=by-ay,e1z=bz-az,e2x=cx-ax,e2y=cy-ay,e2z=cz-az;
  var hx=dy*e2z-dz*e2y,hy=dz*e2x-dx*e2z,hz=dx*e2y-dy*e2x,a=e1x*hx+e1y*hy+e1z*hz;
  if(a>-EPS&&a<EPS)return -1;
  var f=1/a,sx=px-ax,sy=py-ay,sz=pz-az,u=f*(sx*hx+sy*hy+sz*hz);
  if(u<-1e-7||u>1+1e-7)return -1;
  var qx=sy*e1z-sz*e1y,qy=sz*e1x-sx*e1z,qz=sx*e1y-sy*e1x,v=f*(dx*qx+dy*qy+dz*qz);
  if(v<-1e-7||u+v>1+1e-7)return -1;
  var t=f*(e2x*qx+e2y*qy+e2z*qz);
  if(t<0)return -1;
  R[0]=e1y*e2z-e1z*e2y;R[1]=e1z*e2x-e1x*e2z;R[2]=e1x*e2y-e1y*e2x;
  return t;}

// the xz cells a segment (x0,z0)-(x1,z1) passes through on a lattice of `c` metres from (ox,oz), padded one cell, as [i,j]
function cellsAlong(ox,oz,c,x0,z0,x1,z1,fn){
  var L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/(c*.5))),seen={};
  for(var k=0;k<=n;k++){var x=x0+(x1-x0)*k/n,z=z0+(z1-z0)*k/n,i=Math.floor((x-ox)/c),j=Math.floor((z-oz)/c);
    for(var di=-1;di<=1;di++)for(var dj=-1;dj<=1;dj++){var key=(i+di)+','+(j+dj);if(seen[key])continue;seen[key]=1;if(fn(i+di,j+dj))return;}}}

// ---------------------------------------------------------------- surfaces
// every surface: {kind, id, cls, box:[x0,y0,z0,x1,y1,z1], tris(x0,z0,x1,z1, fn(ax..cz) -> stop?)} and cast(p, d, far, R)
function tris(pos,idx,o){o=o||{};var M=o.matrix,nv=pos.length/3,P=new Float64Array(nv*3);
  for(var i=0;i<nv;i++){var x=+pos[i*3],y=+pos[i*3+1],z=+pos[i*3+2];
    if(M){P[i*3]=M[0]*x+M[4]*y+M[8]*z+M[12];P[i*3+1]=M[1]*x+M[5]*y+M[9]*z+M[13];P[i*3+2]=M[2]*x+M[6]*y+M[10]*z+M[14];}
    else{P[i*3]=x;P[i*3+1]=y;P[i*3+2]=z;}}
  var I=idx?idx:null,nt=I?Math.floor(I.length/3):Math.floor(nv/3);
  var vi=function(t,k){return I?I[t*3+k]:t*3+k;};
  var box=[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity],area=0,used=0;
  for(var t=0;t<nt;t++){var x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
    for(var k=0;k<3;k++){var v=vi(t,k)*3;x0=Math.min(x0,P[v]);x1=Math.max(x1,P[v]);z0=Math.min(z0,P[v+2]);z1=Math.max(z1,P[v+2]);
      box[1]=Math.min(box[1],P[v+1]);box[4]=Math.max(box[4],P[v+1]);}
    box[0]=Math.min(box[0],x0);box[3]=Math.max(box[3],x1);box[2]=Math.min(box[2],z0);box[5]=Math.max(box[5],z1);
    if(isFinite(x0)){area+=(x1-x0)+(z1-z0);used++;}}
  // the bucket: about two triangles' span, kept between 1 and 64 m
  var c=o.cell!=null?+o.cell:Math.min(64,Math.max(1,used?area/used:4)),B=new Map(),ox=isFinite(box[0])?box[0]:0,oz=isFinite(box[2])?box[2]:0;
  for(t=0;t<nt;t++){var a=vi(t,0)*3,b=vi(t,1)*3,cc=vi(t,2)*3;
    var i0=Math.floor((Math.min(P[a],P[b],P[cc])-ox)/c),i1=Math.floor((Math.max(P[a],P[b],P[cc])-ox)/c),
        j0=Math.floor((Math.min(P[a+2],P[b+2],P[cc+2])-oz)/c),j1=Math.floor((Math.max(P[a+2],P[b+2],P[cc+2])-oz)/c);
    if(!isFinite(i0)||!isFinite(j0))continue;
    for(var ii=i0;ii<=i1;ii++)for(var jj=j0;jj<=j1;jj++){var key=ii+','+jj,L=B.get(key);if(!L)B.set(key,L=[]);L.push(t);}}
  var S={kind:'tris',id:o.id==null?'tris':o.id,cls:o.cls==null?null:o.cls,box:box,cell:c,ntri:nt,P:P};
  S.cast=function(p,d,far,R,best){var x1=p[0]+d[0]*far,z1=p[2]+d[2]*far,stamp={};
    cellsAlong(ox,oz,c,p[0],p[2],x1,z1,function(i,j){var L=B.get(i+','+j);if(!L)return false;
      for(var q=0;q<L.length;q++){var t=L[q];if(stamp[t])continue;stamp[t]=1;
        var a=vi(t,0)*3,b=vi(t,1)*3,e=vi(t,2)*3,
            h=triHit(p[0],p[1],p[2],d[0],d[1],d[2],P[a],P[a+1],P[a+2],P[b],P[b+1],P[b+2],P[e],P[e+1],P[e+2],R);
        if(h>=0&&h<=far&&h<best.t&&edgeOk(d,R,best.edge)){best.t=h;best.n=[R[0],R[1],R[2]];best.S=S;}}
      return false;});};
  return S;}
function edgeOk(d,n,edge){var dl=Math.hypot(d[0],d[1],d[2]),nl=Math.hypot(n[0],n[1],n[2]);if(!dl||!nl)return false;
  return Math.abs((d[0]*n[0]+d[1]*n[1]+d[2]*n[2])/(dl*nl))>=edge;}

function grid(h,box,cell,o){o=o||{};var fn=typeof h==='function'?h:function(x,z){return h.h(x,z);};
  var x0=box[0],z0=box[1],W=box[2]-box[0],D=box[3]-box[1],nx,nz;
  if(cell&&typeof cell==='object'){nx=Math.max(1,Math.round(cell.nx));nz=Math.max(1,Math.round(cell.nz));}
  else{nx=Math.max(1,Math.round(W/cell));nz=Math.max(1,Math.round(D/cell));}
  var cx=W/nx,cz=D/nz,H=new Float64Array((nx+1)*(nz+1)),lo=Infinity,hi=-Infinity,nw=o.diag==='nw';
  for(var j=0;j<=nz;j++)for(var i=0;i<=nx;i++){var y=+fn(x0+i*cx,z0+j*cz);H[j*(nx+1)+i]=y;if(y<lo)lo=y;if(y>hi)hi=y;}
  var at=function(i,j){return H[j*(nx+1)+i];};
  var S={kind:'grid',id:o.id==null?'ground':o.id,cls:o.cls==null?'ground':o.cls,box:[x0,lo,z0,x0+W,hi,z0+D],nx:nx,nz:nz,cx:cx,cz:cz};
  // the drawn height at (x,z), exactly the triangle the page draws, or NaN off the grid
  S.h=function(x,z){var u=(x-x0)/cx,v=(z-z0)/cz;if(u<0||v<0||u>nx||v>nz)return NaN;
    var i=Math.min(nx-1,Math.floor(u)),j=Math.min(nz-1,Math.floor(v));u-=i;v-=j;
    var a=at(i,j),b=at(i,j+1),c=at(i+1,j+1),d=at(i+1,j);
    if(nw){return u>=v?a+(d-a)*u+(c-d)*v:a+(b-a)*v+(c-b)*u;}
    return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);};
  S.cast=function(p,d,far,R,best){var x1=p[0]+d[0]*far,z1=p[2]+d[2]*far;
    var visit=function(i,j){if(i<0||j<0||i>=nx||j>=nz)return false;
      var ax=x0+i*cx,az=z0+j*cz,bx=ax,bz=az+cz,qx=ax+cx,qz=az+cz,ex=ax+cx,ez=az,
          ya=at(i,j),yb=at(i,j+1),yc=at(i+1,j+1),yd=at(i+1,j),T;
      /* the two triangles as the page winds them (normal up) */
      T=nw?[[ax,ya,az,qx,yc,qz,ex,yd,ez],[ax,ya,az,bx,yb,bz,qx,yc,qz]]:[[ax,ya,az,bx,yb,bz,ex,yd,ez],[bx,yb,bz,qx,yc,qz,ex,yd,ez]];
      for(var k=0;k<2;k++){var g=T[k],hh=triHit(p[0],p[1],p[2],d[0],d[1],d[2],g[0],g[1],g[2],g[3],g[4],g[5],g[6],g[7],g[8],R);
        if(hh>=0&&hh<=far&&hh<best.t&&edgeOk(d,R,best.edge)){best.t=hh;best.n=[R[0],R[1],R[2]];best.S=S;}}
      return false;};
    if(Math.abs(d[0])<EPS&&Math.abs(d[2])<EPS){var u=(p[0]-x0)/cx,v=(p[2]-z0)/cz;
      if(u>=0&&v>=0&&u<=nx&&v<=nz){var i=Math.min(nx-1,Math.floor(u)),j=Math.min(nz-1,Math.floor(v));visit(i,j);
        /* on a cell's edge: the neighbours too */
        if(u-i<1e-9&&i>0)visit(i-1,j);if(v-j<1e-9&&j>0)visit(i,j-1);}
      return;}
    cellsAlong(x0,z0,Math.min(cx,cz),p[0],p[2],x1,z1,function(ii,jj){
      /* cellsAlong walks a square lattice; map back to this grid's cells */
      var X=x0+(ii+.5)*Math.min(cx,cz),Z=z0+(jj+.5)*Math.min(cx,cz);return visit(Math.floor((X-x0)/cx),Math.floor((Z-z0)/cz));});};
  return S;}

function stacks(list,opt,post){var K=root.KSTACKS;if(!K)throw new Error('38a-core-seat: KSEAT.stacks needs core/terrain/37-core-stacks.js');
  var out=[];for(var i=0;i<list.length;i++){var B=list[i],m=K.mesh(B,opt);if(post)post(B,m);
    out.push(tris(m.pos,m.idx,{id:B.id==null?'stack'+i:B.id,cls:'rock'}));}
  return out;}

function lazy(items){var S={kind:'lazy',id:'lazy',cls:null,items:items,box:[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity]};
  items.forEach(function(it){var b=it.box;for(var k=0;k<3;k++){S.box[k]=Math.min(S.box[k],b[k]);S.box[k+3]=Math.max(S.box[k+3],b[k+3]);}});
  S.made=0;
  /* many items: their xz squares on core/space (KSPACE), a ray's square queried; few, or no KSPACE: every item */
  var KS=root.KSPACE,SP=null,cand=[];
  if(KS&&items.length>64){var dd=items.map(function(it){return Math.max(it.box[3]-it.box[0],it.box[5]-it.box[2]);}).filter(isFinite).sort(function(a,b){return a-b;});
    SP=KS.create({cell:Math.min(256,Math.max(4,dd.length?dd[dd.length>>1]*2:16))});
    items.forEach(function(it,i){var b=it.box;SP.insert(i,(b[0]+b[3])/2,(b[2]+b[5])/2,Math.max(b[3]-b[0],b[5]-b[2])/2);});}
  S.cast=function(p,d,far,R,best){
    var e=[p[0]+d[0]*far,p[1]+d[1]*far,p[2]+d[2]*far],lo=[Math.min(p[0],e[0]),Math.min(p[1],e[1]),Math.min(p[2],e[2])],hi=[Math.max(p[0],e[0]),Math.max(p[1],e[1]),Math.max(p[2],e[2])];
    var ids=null;if(SP&&isFinite(far)&&far<1e5){SP.query((lo[0]+hi[0])/2,(lo[2]+hi[2])/2,Math.max(hi[0]-lo[0],hi[2]-lo[2])/2,cand);ids=cand;}
    else if(SP&&Math.abs(d[0])<EPS&&Math.abs(d[2])<EPS){SP.query(p[0],p[2],0,cand);ids=cand;}
    var N=ids?ids.length:items.length;
    for(var q=0;q<N;q++){var i=ids?ids[q]:q,it=items[i],b=it.box;
      if(best.skip&&best.skip.has(it.id))continue;
      if(b[0]>hi[0]||b[3]<lo[0]||b[1]>hi[1]||b[4]<lo[1]||b[2]>hi[2]||b[5]<lo[2])continue;
      if(!it.S){it.S=it.make();S.made++;if(it.S&&it.S.id==='tris')it.S.id=it.id;if(it.S&&it.S.cls==null)it.S.cls=it.cls==null?null:it.cls;}
      if(it.S)castOne(it.S,p,d,far,R,best);}};
  return S;}

function castOne(S,p,d,far,R,best){if(best.skip&&best.skip.has(S.id))return;var b=S.box;
  /* the surface's box against the segment's: a cheap reject */
  var ex=p[0]+d[0]*far,ey=p[1]+d[1]*far,ez=p[2]+d[2]*far;
  if(isFinite(b[0])&&(Math.max(p[0],ex)<b[0]-1e-6||Math.min(p[0],ex)>b[3]+1e-6||Math.max(p[1],ey)<b[1]-1e-6||Math.min(p[1],ey)>b[4]+1e-6||Math.max(p[2],ez)<b[2]-1e-6||Math.min(p[2],ez)>b[5]+1e-6))return;
  S.cast(p,d,far,R,best);}
function list(S){return Array.isArray(S)?S:[S];}
function topOf(S){var y=-Infinity;list(S).forEach(function(s){if(isFinite(s.box[4]))y=Math.max(y,s.box[4]);});return y;}

// ---------------------------------------------------------------- queries
function ray(S,p,d,far,o){far=far==null?1e6:far;var R=[0,0,0],best={t:Infinity,n:null,S:null,edge:o&&o.edge!=null?o.edge:.02,skip:skipSet(o)};
  var L=list(S);for(var i=0;i<L.length;i++)castOne(L[i],p,d,far,R,best);
  if(!best.S)return null;var n=best.n,nl=Math.hypot(n[0],n[1],n[2])||1,dl=Math.hypot(d[0],d[1],d[2])||1;n=[n[0]/nl,n[1]/nl,n[2]/nl];
  var hitId=best.S.id,hitCls=best.S.cls;
  return {t:best.t,x:p[0]+d[0]*best.t,y:p[1]+d[1]*best.t,z:p[2]+d[2]*best.t,n:n,id:hitId,cls:hitCls,back:(d[0]*n[0]+d[1]*n[1]+d[2]*n[2])/dl>0};}
function down(S,x,z,from,o){var y0=from==null?topOf(S)+1:from;if(!isFinite(y0))return null;
  var far=o&&o.drop!=null?o.drop:1e6;
  /* a vertical ray needs no edge-on rejection (a wall is skipped by its own geometry) */
  var oo={edge:1e-6,skip:o&&o.skip};
  var h=ray(S,[x,y0,z],[0,-1,0],from==null?1e6:far,oo);
  return h?{y:h.y,n:h.n,id:h.id,cls:h.cls,back:h.back}:null;}
/* through every face met from behind (a body's hidden bed tops are drawn inside it), to the last before a face met from the
   front or open sky: the depth to where the point comes out */
function under(S,x,y,z,o){var far=o&&o.far!=null?o.far:1e6,oo={edge:1e-6,skip:o&&o.skip},t=0,h=ray(S,[x,y,z],[0,1,0],far,oo);
  if(!h||!h.back)return 0;
  for(var k=0;k<64&&h&&h.back;k++){t=h.y-y;h=ray(S,[x,h.y+1e-4,z],[0,1,0],far,oo);}
  return t;}
function gap(S,x,y,z,dx,dz,o){var L=Math.hypot(dx,dz)||1,bk=o&&o.back!=null?o.back:8;dx/=L;dz/=L;
  var h=ray(S,[x-dx*bk,y,z-dz*bk],[dx,0,dz],o&&o.far!=null?o.far:60,o);return h?h.t-bk:null;}

// ---------------------------------------------------------------- the footprint's sample points
function samples(f){var x=+f.x,z=+f.z,out=[[x,z]];
  if(f.w!=null&&f.d!=null){var ry=num(f.ry,0),c=Math.cos(ry),s=Math.sin(ry),hw=f.w/2,hd=f.d/2;
    /* three's rotation.y: local +x -> (cos, -sin), local +z -> (sin, cos) */
    [[-1,-1],[1,-1],[1,1],[-1,1],[0,-1],[1,0],[0,1],[-1,0]].forEach(function(q){var a=q[0]*hw,b=q[1]*hd;out.push([x+c*a+s*b,z-s*a+c*b]);});}
  else if(f.r>0){var n=Math.max(3,num(f.n,8));for(var i=0;i<n;i++){var a2=i/n*Math.PI*2;out.push([x+Math.cos(a2)*f.r,z+Math.sin(a2)*f.r]);}}
  return out;}
// the plane y = a x + b z + c through the points, least squares; its unit normal
function planeN(P){if(P.length<3)return null;var mx=0,mz=0,my=0;P.forEach(function(p){mx+=p[0];my+=p[1];mz+=p[2];});mx/=P.length;my/=P.length;mz/=P.length;
  var sxx=0,sxz=0,szz=0,sxy=0,szy=0;P.forEach(function(p){var X=p[0]-mx,Y=p[1]-my,Z=p[2]-mz;sxx+=X*X;sxz+=X*Z;szz+=Z*Z;sxy+=X*Y;szy+=Z*Y;});
  var det=sxx*szz-sxz*sxz;if(Math.abs(det)<1e-12)return null;var a=(sxy*szz-szy*sxz)/det,b=(szy*sxx-sxy*sxz)/det,l=Math.hypot(a,1,b);return [-a/l,1/l,-b/l];}

function seat(S,f,o){o=o||{};var P=samples(f),from=f.from==null?o.from:f.from,pts=[],c=null,miss=0;
  for(var i=0;i<P.length;i++){var h=down(S,P[i][0],P[i][1],from,o);if(!h){if(i===0)return null;miss++;continue;}if(i===0)c=h;pts.push([P[i][0],h.y,P[i][1]]);}
  var lo=Infinity,hi=-Infinity;pts.forEach(function(p){lo=Math.min(lo,p[1]);hi=Math.max(hi,p[1]);});
  var n=pts.length>=3?planeN(pts):null;if(!n)n=c.n;
  return {y:lo-num(f.sink,0),lo:lo,hi:hi,yc:c.y,spread:hi-lo,n:n,tilt:Math.acos(Math.max(-1,Math.min(1,n[1]))),id:c.id,cls:c.cls,hits:pts.length,miss:miss};}

// ---------------------------------------------------------------- records
function recAt(r){var a=r.at;return a?[+a[0],+a[1],+a[2]]:[+r.x,+(r.y==null?0:r.y),+r.z];}
function contact(S,rec,o){o=o||{};var f=rec.foot||{},at=recAt(rec),tol=num(f.tol,num(o.tol,.3)),reach=num(f.reach,num(o.reach,2)),clear=num(f.clear,num(o.clear,.5));
  var foot={x:at[0],z:at[2],r:f.r,w:f.w,d:f.d,ry:f.ry==null?rec.ry:f.ry,n:f.n},P=samples(foot),y=at[1],id=rec.id;
  var drop=num(o.drop,50),skip=o.skip,hs=[],under0=Infinity,underAll=true;
  for(var i=0;i<P.length;i++){var u=under(S,P[i][0],y+.01,P[i][1],{skip:skip});
    if(u>0){under0=Math.min(under0,u);}else underAll=false;
    var h=down(S,P[i][0],P[i][1],y+reach,{drop:reach+drop,skip:skip});if(h)hs.push(h.y);}
  if(underAll&&under0-.01>tol)return {id:id,status:'buried',depth:under0-.01,gap:null,h:null};
  if(!hs.length)return {id:id,status:'off',depth:0,gap:null,h:null};
  var top=Math.max.apply(null,hs),g=y-top;
  if(g>tol)return {id:id,status:'float',gap:g,depth:0,h:top};
  /* in a body: rock over the point `clear` above the foot AND a drawn floor under it (a foot between a wall's rows); under
     the ground of its own slope there is no floor under that point, so a seated foot on a steep face is not counted */
  if(under(S,at[0],y+clear,at[2],{skip:skip})>0&&down(S,at[0],at[2],y+clear,{drop:clear+reach,skip:skip}))return {id:id,status:'inside',gap:g,depth:0,h:top};
  return {id:id,status:'ok',gap:g,depth:underAll?under0-.01:0,h:top};}
function contactSweep(S,recs,o){o=o||{};var out={n:0,ok:0,fails:[],by:{float:0,buried:0,inside:0,off:0},worst:{gap:0,depth:0},neg:null},first=null;
  for(var i=0;i<recs.length;i++){var r=recs[i];if(!r||r.removed)continue;if(!o.all&&!r.foot)continue;if(o.filter&&!o.filter(r))continue;
    var c=contact(S,r,o);out.n++;
    if(c.status==='ok'){out.ok++;if(!first)first=r;continue;}
    out.by[c.status]++;out.fails.push(c);
    if(c.gap!=null&&c.status==='float')out.worst.gap=Math.max(out.worst.gap,c.gap);if(c.status==='buried')out.worst.depth=Math.max(out.worst.depth,c.depth);}
  if(o.neg!==false&&first){var a=recAt(first),lifted={id:first.id,at:[a[0],a[1]+2,a[2]],ry:first.ry,foot:first.foot||{}};out.neg=contact(S,lifted,o).status==='float';}
  return out;}

// oriented boxes in xz with a y range: {c, u, v, hw, hd, y0, y1}
function boxOf(r){var a=recAt(r),ry=num(r.ry,0),c=Math.cos(ry),s=Math.sin(ry),w,d,h;
  if(r.size){w=+r.size[0];d=+r.size[1];h=+r.size[2];}else if(r.r!=null){w=d=2*r.r;h=r.h;}else return null;
  return {c:[a[0],a[2]],u:[c,-s],v:[s,c],hw:w/2,hd:d/2,y0:a[1],y1:a[1]+num(h,0),R:Math.hypot(w,d)/2,round:!r.size};}
// the overlap depth of two boxes along the separating axes (<= 0 apart)
function overlap(A,B){var depth=Infinity,ax=[A.u,A.v,B.u,B.v];
  for(var k=0;k<4;k++){var n=ax[k],pa=A.c[0]*n[0]+A.c[1]*n[1],pb=B.c[0]*n[0]+B.c[1]*n[1],
      ra=A.hw*Math.abs(A.u[0]*n[0]+A.u[1]*n[1])+A.hd*Math.abs(A.v[0]*n[0]+A.v[1]*n[1]),rb=B.hw*Math.abs(B.u[0]*n[0]+B.u[1]*n[1])+B.hd*Math.abs(B.v[0]*n[0]+B.v[1]*n[1]);
    depth=Math.min(depth,ra+rb-Math.abs(pa-pb));if(depth<=0)return depth;}
  if(A.round&&B.round)depth=Math.min(depth,A.hw+B.hw-Math.hypot(A.c[0]-B.c[0],A.c[1]-B.c[1]));
  var dy=Math.min(A.y1,B.y1)-Math.max(A.y0,B.y0);if(A.y1>A.y0&&B.y1>B.y0)depth=Math.min(depth,dy);
  return depth;}
function clearSweep(recs,o){o=o||{};var tol=num(o.tol,.15),pairs=o.pairs?o.pairs.map(function(p){return p[0]+'|'+p[1];}):null;
  var R=[],out={n:0,pairs:0,fails:[],worst:0};
  recs.forEach(function(r){if(!r||r.removed)return;var b=boxOf(r);if(b){b.rec=r;R.push(b);}});out.n=R.length;
  var want=function(a,b){var ca=a.rec.class,cb=b.rec.class;if(ca===cb)return false;if(!pairs)return true;return pairs.indexOf(ca+'|'+cb)>=0||pairs.indexOf(cb+'|'+ca)>=0;};
  var test=function(i,j){var a=R[i],b=R[j];if(!want(a,b))return;out.pairs++;var d=overlap(a,b);
    if(d>tol){out.fails.push({a:a.rec.id,b:b.rec.id,ca:a.rec.class,cb:b.rec.class,depth:d});out.worst=Math.max(out.worst,d);}};
  var KS=root.KSPACE;
  if(KS&&R.length>64){var dd=R.map(function(b){return 2*b.R;}).sort(function(a,b){return a-b;}),med=dd[dd.length>>1]||8;
    var SP=KS.create({cell:Math.min(256,Math.max(4,med*2))}),cand=[];R.forEach(function(b,i){SP.insert(i,b.c[0],b.c[1],b.R);});
    R.forEach(function(b,i){SP.query(b.c[0],b.c[1],b.R,cand);for(var k=0;k<cand.length;k++)if(cand[k]>i)test(i,cand[k]);});}
  else for(var i=0;i<R.length;i++)for(var j=i+1;j<R.length;j++)test(i,j);
  return out;}

function doorSweep(S,doors,o){o=o||{};var tol=num(o.tol,.4),out={n:0,ok:0,fails:[]};
  doors.forEach(function(D){if(!D)return;var a=recAt(D),ry=num(D.ry,0),nx=Math.sin(ry),nz=Math.cos(ry),tx=Math.cos(ry),tz=-Math.sin(ry),
      w=num(D.w,1),h=num(D.h,2),dep=num(D.depth,.6),reach=num(D.reach,1.2),blocked=0,mid=false;out.n++;
    for(var hi=0;hi<3;hi++)for(var wi=0;wi<3;wi++){var yy=a[1]+h*(.15+.35*hi),s=(wi-1)*w*.35,
        px=a[0]+tx*s+nx*1.5,pz=a[2]+tz*s+nz*1.5,hit=ray(S,[px,yy,pz],[-nx,0,-nz],1.5+dep+reach,o);
      if(hit){blocked++;if(hi===1&&wi===1)mid=true;}}
    var st=null;if(mid||blocked>=3)st='blocked';
    else{var g=down(S,a[0]+nx,a[2]+nz,a[1]+tol,{drop:2*tol,skip:o.skip});if(!g||Math.abs(g.y-a[1])>tol)st='no step';}
    if(st)out.fails.push({id:D.id,status:st,rays:blocked});else out.ok++;});
  return out;}

function stairSweep(S,stairs,o){o=o||{};var tol=num(o.tol,.4),heads=o.heads||[1,1.8],out={n:0,ok:0,fails:[]};
  stairs.forEach(function(T){if(!T)return;out.n++;var H=T.head,F=T.foot,bad=null,at=null;
    [['head',H],['foot',F]].forEach(function(e){if(bad)return;var p=e[1],g=down(S,p[0],p[2],p[1]+tol,{drop:2*tol,skip:o.skip});
      if(!g||Math.abs(g.y-p[1])>tol){bad='short';at=e[0];}});
    var path=T.pts&&T.pts.length>1?T.pts:[F,H];
    for(var s=0;s+1<path.length&&!bad;s++){var A=path[s],Bp=path[s+1],L=Math.hypot(Bp[0]-A[0],Bp[1]-A[1],Bp[2]-A[2]),n=Math.max(1,Math.ceil(L));
      for(var k=0;k<=n&&!bad;k++){var t=k/n,x=A[0]+(Bp[0]-A[0])*t,y=A[1]+(Bp[1]-A[1])*t,z=A[2]+(Bp[2]-A[2])*t;
        for(var q=0;q<heads.length;q++)if(under(S,x,y+heads[q],z,{skip:o.skip})>0){bad='into wall';at=[+x.toFixed(2),+y.toFixed(2),+z.toFixed(2)];break;}}}
    if(bad)out.fails.push({id:T.id,status:bad,at:at});else out.ok++;});
  return out;}

// ---------------------------------------------------------------- the drawers' probe points (item 6)
function points(ms){var out=[];(ms||[]).forEach(function(m){var p=m&&(m.probe||m);if(p&&p.length)for(var i=0;i+2<p.length;i+=3)out.push(p[i],p[i+1],p[i+2]);});return out;}
function stackPoint(B){var bs=B.beds||[];if(!bs.length)return [B.x,num(B.y0,0)+(num(B.top,0)-num(B.y0,0))/2,B.z];
  var b=bs[bs.length>>1];return [b.cx+(b.tx||0)*.5,b.y+b.h/2,b.cz+(b.tz||0)*.5];}
(function wrapDrawers(){
  var K=root.KSTACKS;
  if(K&&K.mesh&&!K.mesh._seat){var m0=K.mesh,m1=function(B,opt){var m=m0.apply(this,arguments);if(m&&!m.probe)m.probe=stackPoint(B);return m;};m1._seat=true;K.mesh=m1;K.probePoint=stackPoint;}
  var C=root.KCARVE;
  var wrapC=function(c){if(!c||!c.mesh||c.mesh._seat)return c;var cm=c.mesh,w=function(){var out=cm.apply(c,arguments);
      (out||[]).forEach(function(ms){var u=ms&&ms.userData;if(!u||u.probePoints)return;var Q=c.get&&c.get(u.carve);if(!Q)return;
        u.probePoints=[Q.c[0],num(Q.floorY,0)+num(Q.h,2)/2,Q.c[1]];});
      return out;};w._seat=true;c.mesh=w;return c;};
  if(C){wrapC(C);if(C.create&&!C.create._seat){var cr=C.create,c2=function(){return wrapC(cr.apply(C,arguments));};c2._seat=true;C.create=c2;}}
})();

root.KSEAT={version:1,tris:tris,grid:grid,stacks:stacks,lazy:lazy,down:down,ray:ray,under:under,gap:gap,seat:seat,samples:samples,
  contact:contact,contactSweep:contactSweep,clearSweep:clearSweep,doorSweep:doorSweep,stairSweep:stairSweep,boxOf:boxOf,overlap:overlap,
  points:points,stackPoint:stackPoint};
})(typeof window!=='undefined'?window:globalThis);
