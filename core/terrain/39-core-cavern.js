// ================================================================= CORE — cavern (an underground of voids in rock)  [G data]
// Shared by every build with a real underground (kits/zeijani, settlements/dhelv first; kits/zeijani/PLAN.md section 7).
// The rock is everything below the ground (a heightfield the host gives) or inside a MASS (rock standing on the ground: a
// cliff, a fairy chimney, the kit sheet's blocks), and outside every void. Voids are records: signed-distance primitives
// (tube, hall, room, shaft, stair, trench) and monoliths (rock left standing inside a void), composed IN THE ORDER ADDED
// (a monolith fills what was carved before it; a room added after it is carved into it: Kailasa's chambers).
// Tubes and halls join by a smooth minimum (lava tubes braid; a junction has a radius); rooms, shafts, stairs and
// trenches join hard. The PLAN is the one source: the mesh is made from it, and the floors are written to core/walk
// from it (not read off the mesh), as the plan is built.
//
// No THREE, no DOM: plain maths, node-tested (test-cavern.js). Every draw is integer-hashed (core/rand), so the meshes
// are the same bit for bit wherever it runs. The host turns a chunk's arrays into geometry; Godot reads the exported
// meshes (no GDScript twin needed to draw; `sdf` is the one query a game would port if it digs).
// Axes: y up, metres, x east, z south.
//
//   const C=KCAVERN.create({ground:(x,z)=>y, cell:.5, chunk:16, seed:1, walk:KWALK|null, minRock:.8})
//   C.tube({id, owner, pts:[[x,y,z],...] (the floor's centreline), w (full width), h (floor to crown),
//           spring (.45: the walls' share of h), ledge:{v (height above the floor), d (how far it stands out)},
//           blend (2: the junction radius), rock:'basalt', finish:'raw', walkW (floor width walked; default w-.6)})
//   C.hall({id, owner, c:[x,y,z] (the floor's centre), rx, rz (the floor's half-axes), h (floor to crown), belly (.25),
//           throat:{r0, r1, top} (a light well: radius where it leaves the crown, at the top, and the top's y), blend})
//   C.room({id, owner, poly:[[x,z],...] (the void's plan), y (floor), h (wall height), ceil:'flat'|'vault'|'dome',
//           rise (the crown above h), r (corner radius), rock:'tuff', finish:'hewn'|'plaster'|'polished'|'raw'})
//   C.shaft({id, owner, c:[x,z], y0, y1, r0, r1 (radius at y0 and y1), floor:false})
//   C.stair({id, owner, a:[x,y,z], b:[x,y,z] (the floor at each end), w, h (clear height over the flight)})
//   C.trench({id, owner, poly, y0 (its floor), y1 (its top, often a hall's floor)})
//   C.monolith({id, owner, poly, y0, y1, taper (0: the top shrunk by this share), cap (a dome over y1), block (true: a walk block)})
//                      rock kept in a void (Kailasa)
//   C.mass({id, owner, poly, y0, y1, taper, cap})   rock standing on the ground, meshed here (the host draws only the ground)
//   C.opening({id, c:[x,z], r, rim (3), kind:'well'})   where a void may meet the sky through the GROUND (a light well, a
//                      collapse pit): the host's ground gets a hole of radius r+rim (holeAt), the cavern meshes the ground inside it
//   C.opening({id, c:[x,z], y, r, h, kind:'door'})   where a void meets the open air through a FACE (a doorway in a mass or a
//                      cliff, the portal): no hole in the ground; the sky check lets the void out there
//   C.fixture({id, owner, box:[x0,x1,z0,z1,y0,y1], tag})   carved furniture and pillars: a core/walk block
//   C.build()          checks the plan, writes every floor and block to `walk`, sets the chunk list; returns C
//   C.sdf(x,y,z)       signed distance to the rock: positive in the open (a void, or the sky), negative in rock
//   C.voidSD(x,y,z)    the voids alone (negative inside one); C.ownerAt(x,y,z) the primitive nearest
//   C.inRock(x,y,z)    C.ceilingAt(x,z,y): the rock above (x,y,z) (null: the sky)   C.holeAt(x,z): in a hole
//   C.thickness(idA,idB)  the least rock between two primitives' voids (sampled on A's surface); C.roof(id): to the sky
//   C.chunks           ['i,j,k', ...] that may hold surface, sorted;  C.meshChunk(key) -> a chunk's arrays (below)
//   C.meshAll()        every chunk;  KCAVERN.hash(meshes) a fingerprint (determinism)
//   C.export()         {format:'krator-cavern', version:1, convention, cell, chunk, seed, prims, openings, fixtures}
//   KCAVERN.load(export, {ground, walk})   the same cavern again (the same meshes, bit for bit)
//
// A chunk: {key, cell, origin:[x,y,z], pos (Float32, x y z), nrm (Float32), idx (Uint32), occ (Float32, 0 shut .. 1 open),
// w (Float32, 4 per vertex: lining, breakdown, rare, crust), hue (Float32: the rare colour, 0..1), mat (Uint8: C.MATS),
// ground (Uint8: 1 where the vertex is the ground's surface inside an opening's rim), prim (Uint16: C.prims index, 65535 the ground)}. Seams: every chunk samples the
// one world lattice and owns the lattice edges whose lower corner is inside it, so its neighbours' shared vertices are
// computed by the same arithmetic and match exactly (test-cavern.js welds them and counts every edge twice).
// One cell size per cavern: mixing sizes cracks the seams; 0.5 m costs about 2M triangles for Dhelv, drawn by chunk
// near the camera (PLAN.md section 7 asked for 1 m in tubes: KNOWN_ISSUES in kits/zeijani says why not).
(function(root){
  'use strict';
  var KR=root.KRAND;
  var MATS=['basalt-raw','basalt-polished','tuff-raw','tuff-hewn','tuff-plaster','tuff-polished'];
  function matOf(rock,finish){
    if(rock==='basalt')return finish==='polished'?1:0;
    return finish==='hewn'?3:finish==='plaster'?4:finish==='polished'?5:2;
  }
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sstep(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function smin(a,b,k){if(k<=0)return Math.min(a,b);var h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;}
  function num(v,what){if(typeof v!=='number'||!isFinite(v))throw new Error('KCAVERN: '+what+' must be a finite number');return v;}

  // ---- 2D polygon helpers (plan views)
  function sdPoly(P,x,z){// exact signed distance to a simple polygon, negative inside (iq)
    var d=1e30,s=1,n=P.length;
    for(var i=0,j=n-1;i<n;j=i++){var a=P[i],b=P[j],ex=b[0]-a[0],ez=b[1]-a[1],wx=x-a[0],wz=z-a[1];
      var t=clamp((wx*ex+wz*ez)/(ex*ex+ez*ez),0,1),bx=wx-ex*t,bz=wz-ez*t;d=Math.min(d,bx*bx+bz*bz);
      var c1=z>=a[1],c2=z<b[1],c3=ex*wz>ez*wx;if((c1&&c2&&c3)||(!c1&&!c2&&!c3))s=-s;}
    return s*Math.sqrt(d);
  }
  function area2(P){var a=0;for(var i=0;i<P.length;i++){var p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a;}
  function insetPoly(P,r){// each edge moved r inward, neighbours re-intersected (fine for the rounded rooms' gentle shapes)
    if(!r)return P.map(function(p){return [p[0],p[1]];});
    var n=P.length,sg=area2(P)>0?1:-1,L=[];
    for(var i=0;i<n;i++){var a=P[i],b=P[(i+1)%n],ex=b[0]-a[0],ez=b[1]-a[1],l=Math.hypot(ex,ez),nx=-ez/l*sg,nz=ex/l*sg;
      L.push([a[0]+nx*r,a[1]+nz*r,ex,ez]);}
    var out=[];
    for(var k=0;k<n;k++){var A=L[(k+n-1)%n],B=L[k],den=A[2]*B[3]-A[3]*B[2];
      if(Math.abs(den)<1e-12){out.push([B[0],B[1]]);continue;}
      var t=((B[0]-A[0])*B[3]-(B[1]-A[1])*B[2])/den;out.push([A[0]+A[2]*t,A[1]+A[3]*t]);}
    return out;
  }
  function bbox2(P){var b=[1e30,-1e30,1e30,-1e30];P.forEach(function(p){b[0]=Math.min(b[0],p[0]);b[1]=Math.max(b[1],p[0]);b[2]=Math.min(b[2],p[1]);b[3]=Math.max(b[3],p[1]);});return b;}

  // ---- the primitives: each prepares itself once (prep) and answers sd(x,y,z) with S.v (the height above its own
  // floor, for the material weights) and S.top (its ledge or spring height) left in a scratch record
  var S={v:0,top:0};
  var KINDS={
    tube:{hard:false,
      prep:function(P){
        if(!P.pts||P.pts.length<2)throw new Error('KCAVERN.tube '+P.id+': pts needs two or more [x,y,z]');
        P.w=num(P.w,'tube w');P.h=num(P.h,'tube h');P.spring=P.spring==null?.45:P.spring;P.blend=P.blend==null?2:P.blend;
        P.b=P.w/2;P.hs=P.h*P.spring;P.lv=P.ledge?P.ledge.v:0;P.ld=P.ledge?P.ledge.d:0;
        P.segs=[];for(var i=0;i<P.pts.length-1;i++){var A=P.pts[i],B=P.pts[i+1],dx=B[0]-A[0],dz=B[2]-A[2],L=Math.hypot(dx,dz);
          if(L<1e-6)throw new Error('KCAVERN.tube '+P.id+': two points at one place');
          P.segs.push({A:A,B:B,L:L,tx:dx/L,tz:dz/L});}
        var bb=[1e30,-1e30,1e30,-1e30,1e30,-1e30];P.pts.forEach(function(p){bb[0]=Math.min(bb[0],p[0]);bb[1]=Math.max(bb[1],p[0]);bb[2]=Math.min(bb[2],p[1]);bb[3]=Math.max(bb[3],p[1]);bb[4]=Math.min(bb[4],p[2]);bb[5]=Math.max(bb[5],p[2]);});
        var g=P.b+1;P.box=[bb[0]-g,bb[1]+g,bb[2]-1,bb[3]+P.h+1,bb[4]-g,bb[5]+g];P.top=P.lv||P.hs;},
      sd:function(P,x,y,z){// one continuous frame: s is the distance to the whole centreline, the floor its height at the
        // nearest point (a union of per-segment sections leaves slivers of rock on the outside of every bend)
        var bd=1e30,bs=0,bfy=0,cap=-1e30,n=P.segs.length;
        for(var i=0;i<n;i++){var g=P.segs[i],px=x-g.A[0],pz=z-g.A[2],a=px*g.tx+pz*g.tz,u=clamp(a/g.L,0,1);
          var qx=px-g.tx*g.L*u,qz=pz-g.tz*g.L*u,d=Math.hypot(qx,qz);
          if(d<bd){bd=d;bfy=g.A[1]+(g.B[1]-g.A[1])*u;bs=d;
            if(i===0&&a<0){bs=Math.abs(px*-g.tz+pz*g.tx);cap=-a;}else if(i===n-1&&a>g.L){bs=Math.abs(px*-g.tz+pz*g.tx);cap=a-g.L;}else cap=-1e30;}}
        var s=bs,v=y-bfy,bl=P.b-P.ld,vl=P.lv;
        // the section: a narrow column from the floor to the springline, the full width from the ledge to the springline,
        // the whole ellipse of the arch (cut at the floor). The parts OVERLAP: parts that only touch leave the field exactly
        // zero on their shared plane, a membrane of rock inside the void that the mesher turns into non-manifold edges
        var d1=Math.max(s-bl,-v,v-P.hs);
        var d2=Math.max(s-P.b,vl-v,v-P.hs);
        var ra=P.h-P.hs,el=(Math.hypot(s/P.b,(v-P.hs)/ra)-1)*Math.min(P.b,ra),d3=Math.max(el,-v);
        S.v=v;S.top=P.top;return Math.max(Math.min(d1,d2,d3),cap);}},
    hall:{hard:false,
      prep:function(P){P.h=num(P.h,'hall h');P.belly=P.belly==null?.25:P.belly;P.blend=P.blend==null?6:P.blend;
        var e=P.belly*P.h,Ry=P.h-e,k=Math.sqrt(1-(e/Ry)*(e/Ry));P.cy=P.c[1]+e;P.R=[num(P.rx,'hall rx')/k,Ry,num(P.rz,'hall rz')/k];
        var T=P.throat,top=T?T.top:P.c[1]+P.h;P.box=[P.c[0]-P.R[0]-1,P.c[0]+P.R[0]+1,P.c[1]-1,top+1,P.c[2]-P.R[2]-1,P.c[2]+P.R[2]+1];P.top=P.h*.3;},
      sd:function(P,x,y,z){var R=P.R,px=x-P.c[0],py=y-P.cy,pz=z-P.c[2];
        var k0=Math.hypot(px/R[0],py/R[1],pz/R[2]),k1=Math.hypot(px/(R[0]*R[0]),py/(R[1]*R[1]),pz/(R[2]*R[2]));
        var d=k1>0?k0*(k0-1)/k1:-Math.min(R[0],R[1],R[2]);d=Math.max(d,P.c[1]-y);
        var T=P.throat;if(T){var y0=P.c[1]+P.h*.6,t=clamp((y-y0)/(T.top-y0),0,1),r=T.r0+(T.r1-T.r0)*t;
          var dt=Math.max(Math.hypot(px,pz)-r,y0-y,y-T.top);d=smin(d,dt,T.blend==null?8:T.blend);}
        S.v=y-P.c[1];S.top=P.top;return d;}},
    room:{hard:true,
      prep:function(P){if(!P.poly||P.poly.length<3)throw new Error('KCAVERN.room '+P.id+': poly needs three or more [x,z]');
        P.y=num(P.y,'room y');P.h=num(P.h,'room h');P.ceil=P.ceil||'flat';P.rise=P.rise||0;P.r=P.r||0;
        P.core=insetPoly(P.poly,P.r);var b=bbox2(P.poly);P.box=[b[0]-1,b[1]+1,P.y-1,P.y+P.h+P.rise+1,b[2]-1,b[3]+1];
        var I=0;for(var x=b[0];x<=b[1];x+=.25)for(var z=b[2];z<=b[3];z+=.25)I=Math.max(I,-sdPoly(P.poly,x,z));P.inr=Math.max(I,.1);
        if(P.ceil==='vault'){// along the longest edge; across it, the half-width
          var L=0,ax=1,az=0;for(var i=0;i<P.poly.length;i++){var p=P.poly[i],q=P.poly[(i+1)%P.poly.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l>L){L=l;ax=(q[0]-p[0])/l;az=(q[1]-p[1])/l;}}
          var cx=0,cz=0;P.poly.forEach(function(p){cx+=p[0];cz+=p[1];});cx/=P.poly.length;cz/=P.poly.length;
          var W=0;P.poly.forEach(function(p){W=Math.max(W,Math.abs((p[0]-cx)*-az+(p[1]-cz)*ax));});P.vault={cx:cx,cz:cz,nx:-az,nz:ax,W:W};}
        P.top=P.h;},
      ceilAt:function(P,x,z,sd2){if(P.ceil==='flat'||!P.rise)return P.y+P.h;
        var u;if(P.ceil==='vault'){var V=P.vault;u=clamp(1-Math.abs((x-V.cx)*V.nx+(z-V.cz)*V.nz)/V.W,0,1);}else u=clamp(-sd2/P.inr,0,1);
        return P.y+P.h+P.rise*Math.sqrt(Math.max(0,1-(1-u)*(1-u)));},
      sd:function(P,x,y,z){var sd2=P.r?sdPoly(P.core,x,z)-P.r:sdPoly(P.poly,x,z);
        S.v=y-P.y;S.top=P.h;return Math.max(sd2,P.y-y,y-KINDS.room.ceilAt(P,x,z,sd2));}},
    shaft:{hard:true,
      prep:function(P){P.y0=num(P.y0,'shaft y0');P.y1=num(P.y1,'shaft y1');P.r0=num(P.r0,'shaft r0');P.r1=P.r1==null?P.r0:P.r1;
        var R=Math.max(P.r0,P.r1);P.box=[P.c[0]-R-1,P.c[0]+R+1,P.y0-1,P.y1+1,P.c[1]-R-1,P.c[1]+R+1];P.top=P.y1-P.y0;},
      sd:function(P,x,y,z){var t=clamp((y-P.y0)/(P.y1-P.y0),0,1),r=P.r0+(P.r1-P.r0)*t;S.v=y-P.y0;S.top=P.top;
        return Math.max(Math.hypot(x-P.c[0],z-P.c[1])-r,P.y0-y,y-P.y1);}},
    stair:{hard:true,
      prep:function(P){var A=P.a,B=P.b,dx=B[0]-A[0],dz=B[2]-A[2],L=Math.hypot(dx,dz);if(L<.1)throw new Error('KCAVERN.stair '+P.id+': too short in plan');
        P.L=L;P.tx=dx/L;P.tz=dz/L;P.w=num(P.w,'stair w');P.h=num(P.h,'stair h');
        P.box=[Math.min(A[0],B[0])-P.w-1,Math.max(A[0],B[0])+P.w+1,Math.min(A[1],B[1])-1,Math.max(A[1],B[1])+P.h+1,Math.min(A[2],B[2])-P.w-1,Math.max(A[2],B[2])+P.w+1];P.top=P.h;},
      sd:function(P,x,y,z){var px=x-P.a[0],pz=z-P.a[2],a=px*P.tx+pz*P.tz,s=Math.abs(px*-P.tz+pz*P.tx),u=clamp(a/P.L,0,1),fy=P.a[1]+(P.b[1]-P.a[1])*u,v=y-fy;
        S.v=v;S.top=P.h;return Math.max(s-P.w/2,-v,v-P.h,-a,a-P.L);}},
    trench:{hard:true,
      prep:function(P){P.y0=num(P.y0,'trench y0');P.y1=num(P.y1,'trench y1');var b=bbox2(P.poly);P.box=[b[0]-1,b[1]+1,P.y0-1,P.y1+1,b[2]-1,b[3]+1];P.top=P.y1-P.y0;},
      sd:function(P,x,y,z){S.v=y-P.y0;S.top=P.top;return Math.max(sdPoly(P.poly,x,z),P.y0-y,y-P.y1);}},
    monolith:{hard:true,solid:true,prep:function(P){prepSolid(P,'monolith');},sd:function(P,x,y,z){return sdSolid(P,x,y,z);}},
    mass:{hard:true,solid:true,prep:function(P){prepSolid(P,'mass');},sd:function(P,x,y,z){return sdSolid(P,x,y,z);}}
  };
  // a solid: a plan extruded from y0 to y1, its sides drawn in by `taper` toward the top, a dome of height `cap` over it
  function prepSolid(P,what){P.y0=num(P.y0,what+' y0');P.y1=num(P.y1,what+' y1');P.taper=P.taper||0;P.cap=P.cap||0;var b=bbox2(P.poly);
    P.box=[b[0]-1,b[1]+1,P.y0-1,P.y1+P.cap+1,b[2]-1,b[3]+1];var I=0;for(var x=b[0];x<=b[1];x+=.25)for(var z=b[2];z<=b[3];z+=.25)I=Math.max(I,-sdPoly(P.poly,x,z));P.inr=Math.max(I,.1);P.top=P.y1-P.y0;}
  function sdSolid(P,x,y,z){var t=clamp((y-P.y0)/(P.y1-P.y0),0,1),sd2=sdPoly(P.poly,x,z)+P.taper*P.inr*t,top=P.y1;
    if(P.cap){var u=clamp(-sd2/(P.inr*(1-P.taper)),0,1);top+=P.cap*Math.sqrt(Math.max(0,1-(1-u)*(1-u)));}
    return Math.max(sd2,P.y0-y,y-top);}
  // a primitive's box in the order the field reads: [x0,x1,y0,y1,z0,z1]

  function create(o){
    o=o||{};
    if(typeof o.ground!=='function')throw new Error('KCAVERN.create: ground(x,z) required');
    var ground=o.ground,cell=o.cell||.5,CH=o.chunk||16,seed=(o.seed||1)>>>0,walk=o.walk||null,minRock=o.minRock==null?.8:o.minRock;
    /* the lattice sits half a cell up: a floor at a whole or half metre then lies mid-cell, where surface nets puts it
       exactly; on a lattice plane the walls sharing its cells pull it up by a fifth of a metre (narrow doorways) */
    var YOFF=o.yOffset==null?cell/2:o.yOffset;
    var NC=Math.round(CH/cell);if(Math.abs(NC*cell-CH)>1e-9)throw new Error('KCAVERN: chunk must be a whole number of cells');
    var prims=[],byId={},openings=[],fixtures=[],built=false,C={};
    var seedRare=KR.child(seed,'cavern.rare'),seedHue=KR.child(seed,'cavern.hue'),seedDrip=KR.child(seed,'cavern.drip');

    function add(kind,P){
      if(built)throw new Error('KCAVERN: add before build()');
      if(!P||!P.id)throw new Error('KCAVERN.'+kind+': id required');
      if(byId[P.id])throw new Error('KCAVERN: duplicate id '+P.id);
      var Q=Object.assign({},P);Q.kind=kind;Q.owner=P.owner||P.id;Q.rock=P.rock||(kind==='tube'||kind==='hall'?'basalt':'tuff');
      Q.finish=P.finish||(kind==='room'?'hewn':'raw');Q.mat=matOf(Q.rock,Q.finish);KINDS[kind].prep(Q);Q.i=prims.length;
      prims.push(Q);byId[Q.id]=Q;return Q;
    }
    ['tube','hall','room','shaft','stair','trench','monolith','mass'].forEach(function(k){C[k]=function(P){return add(k,P);};});
    C.opening=function(P){if(!P.id||!P.c)throw new Error('KCAVERN.opening: id and c required');
      var Q={id:P.id,kind:P.kind||'well',c:P.c.slice(),r:num(P.r,'opening r'),rim:P.kind==='door'?0:(P.rim==null?3:P.rim),y:P.y==null?null:num(P.y,'door y'),h:P.h==null?Math.max(2.6,num(P.r,'opening r')*1.6):num(P.h,'door h')};
      if(Q.kind==='door'&&Q.y===null)throw new Error('KCAVERN.opening '+P.id+': a door needs y (its sill)');openings.push(Q);return Q;};
    function wells(){return openings.filter(function(Q){return Q.kind==='well';});}
    var SINK=o.sink==null?.06:o.sink;
    function inWellRim(x,z){for(var i=0;i<openings.length;i++){var Q=openings[i];if(Q.kind==='well'&&Math.hypot(x-Q.c[0],z-Q.c[1])<Q.r+Q.rim+cell*2)return true;}return false;}
    function inOpening(x,y,z){for(var i=0;i<openings.length;i++){var Q=openings[i],d=Math.hypot(x-Q.c[0],z-Q.c[1]);
      if(Q.kind==='well'?d<Q.r+Q.rim:(d<Q.r&&y>Q.y-1&&y<Q.y+Q.h+.4))return Q;}return null;}
    C.fixture=function(P){if(!P.box||P.box.length!==6)throw new Error('KCAVERN.fixture: box [x0,x1,z0,z1,y0,y1] required');
      var Q={id:P.id||('fixture'+fixtures.length),owner:P.owner||'',box:P.box.slice(),tag:P.tag||'fixture'};fixtures.push(Q);return Q;};

    // ---- the field
    function within(P,x,y,z,g){var b=P.box;return x>=b[0]-g&&x<=b[1]+g&&y>=b[2]-g&&y<=b[3]+g&&z>=b[4]-g&&z<=b[5]+g;}
    var OWN=null;
    function voidOf(list,x,y,z){// the voids in the order added, in two unions: the SOFT voids (tubes, halls) by smooth minimum
      // among themselves (a braid's junctions), the HARD ones (rooms, stairs, shafts, trenches) by minimum, so a tube's fillet
      // never eats under a stair's floor; a monolith fills both unions as they stand when it is added
      var ds=1e30,dh=1e30,best=1e30,own=null,i,P,v;
      for(i=0;i<list.length;i++){P=list[i];if(P.kind==='mass')continue;
        if(!within(P,x,y,z,P.blend||1))continue;
        v=KINDS[P.kind].sd(P,x,y,z);
        if(P.kind==='monolith'){if(-v>ds)ds=-v;if(-v>dh)dh=-v;if(-v>Math.min(ds,dh)-1e-9&&-v>best){own=P;best=-v;}continue;}
        if(KINDS[P.kind].hard)dh=Math.min(dh,v);else ds=smin(ds,v,P.blend);
        if(v<best){best=v;own=P;}}
      OWN=own;return Math.min(ds,dh);
    }
    var OWNM=null;
    function massOf(list,x,y,z){var s=1e30,own=null;for(var i=0;i<list.length;i++){var P=list[i];if(P.kind!=='mass'||!within(P,x,y,z,1))continue;
      var v=KINDS.mass.sd(P,x,y,z);if(v<s){s=v;own=P;}}OWNM=own;return s;}
    // the open air: the voids, and the sky over the ground outside every mass, joined by a small smooth minimum (RIM) so an
    // opening's lip is rounded: a worn rim, and no sliver of rock thinner than a cell where a shaft meets the sloping ground
    // Only round a WELL's lip: elsewhere (a doorway whose floor is flush with the ground outside) the same rounding digs a
    // trough at the threshold
    var RIM=o.rim==null?.6:o.rim;
    function rimK(x,z){for(var i=0;i<openings.length;i++){var Q=openings[i];if(Q.kind==='well'&&Math.hypot(x-Q.c[0],z-Q.c[1])<Q.r+Q.rim+3)return RIM;}return 0;}
    function openOf(list,x,y,z){return Math.max(ground(x,z)-y,-massOf(list,x,y,z));}
    function airOf(list,x,y,z){var dv=voidOf(list,x,y,z);return smin(dv,openOf(list,x,y,z),rimK(x,z));}
    C.voidSD=function(x,y,z){return voidOf(prims,x,y,z);};
    C.sdf=function(x,y,z){return -airOf(prims,x,y,z);};
    C.inRock=function(x,y,z){return airOf(prims,x,y,z)>0;};
    C.ownerAt=function(x,y,z){voidOf(prims,x,y,z);return OWN?OWN.id:null;};
    C.holeAt=function(x,z){var W=wells();for(var i=0;i<W.length;i++){var Q=W[i];if(Math.hypot(x-Q.c[0],z-Q.c[1])<Q.r+Q.rim)return Q;}return null;};
    C.inMass=function(x,y,z){return massOf(prims,x,y,z)<0;};
    C.ceilingAt=function(x,z,y){// march up through the open to the first rock; null when the sky is reached
      var gy=ground(x,z);if(y>gy)return null;var t=y,s;
      for(var n=0;n<4000;n++){s=airOf(prims,x,t,z);if(s>0){var a=t-Math.min(.5,Math.max(.02,s)),b=t;for(var k=0;k<20;k++){var m=(a+b)/2;if(airOf(prims,x,m,z)>0)b=m;else a=m;}return b;}
        if(t>gy+.01)return null;t+=Math.max(.02,Math.min(.5,-s*.8));}
      return null;
    };

    // ---- sampling a primitive's surface (the thickness and sky checks)
    function surfaceSamples(P,step){
      var out=[],b=P.box;step=step||cell;
      for(var x=b[0];x<=b[1];x+=step)for(var z=b[4];z<=b[5];z+=step)for(var y=b[2];y<=b[3];y+=step){
        var v=KINDS[P.kind].sd(P,x,y,z);if(v<=0&&v>-step*.87)out.push([x,y,z]);}
      return out;
    }
    C.thickness=function(idA,idB){var A=byId[idA],B=byId[idB];if(!A||!B)throw new Error('KCAVERN.thickness: no '+(A?idB:idA));
      var g=1e30,pts=surfaceSamples(A);for(var i=0;i<pts.length;i++){var p=pts[i];if(!within(B,p[0],p[1],p[2],g<1e29?g:20))continue;
        g=Math.min(g,KINDS[B.kind].sd(B,p[0],p[1],p[2]));}return g;};
    C.roof=function(id){// the least rock between a primitive's void and the open air (the sky over the ground, or a mass's
      // face), outside every opening
      // openOf is a bound, not a distance, where the ground's rock and a mass overlap (a block sunk into the ground): march
      // 26 rays from each sample, sphere-tracing with it, to the first open point
      var P=byId[id],r=1e30,pts=surfaceSamples(P),D=[];
      for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++)for(var dz=-1;dz<=1;dz++)if(dx||dy||dz){var l=Math.hypot(dx,dy,dz);D.push([dx/l,dy/l,dz/l]);}
      for(var i=0;i<pts.length;i++){var p=pts[i];if(inOpening(p[0],p[1],p[2]))continue;var o0=openOf(prims,p[0],p[1],p[2]);if(o0>=r)continue;
        for(var k=0;k<D.length;k++){var t=0;for(var n=0;n<200&&t<r;n++){var q=openOf(prims,p[0]+D[k][0]*t,p[1]+D[k][1]*t,p[2]+D[k][2]*t);if(q<=0)break;t+=Math.max(q,.05);}
          r=Math.min(r,t);}}
      return r;};
    C.skyLeaks=function(step){// points of a void in the open air (above the ground and outside every mass) outside every opening
      var out=[];prims.forEach(function(P){if(P.kind==='monolith'||P.kind==='mass')return;var b=P.box,s=step||1;
        for(var x=b[0];x<=b[1];x+=s)for(var z=b[4];z<=b[5];z+=s)for(var y=b[2];y<=b[3];y+=s){
          if(KINDS[P.kind].sd(P,x,y,z)>=0||openOf(prims,x,y,z)>=0||inOpening(x,y,z))continue;out.push([x,y,z,P.id]);y=1e30;}});
      return out;
    };

    // ---- build: check the plan, write the floors, list the chunks
    C.build=function(){
      if(built)return C;built=true;
      prims.forEach(function(P){var W=walk;if(!W||P.floor===false)return;var tag='cavern:'+P.kind,nm=P.id;
        if(P.kind==='tube'){var ww=P.walkW||Math.max(.6,2*(P.b-P.ld)-.6);P.segs.forEach(function(g,i){
          W.strip({a:[g.A[0],g.A[2],g.A[1]],b:[g.B[0],g.B[2],g.B[1]],w:ww,name:nm+'#'+i,tag:tag});});}
        else if(P.kind==='hall'){var pts=[],k=Math.sqrt(1-Math.pow(P.belly*P.h/P.R[1],2));
          for(var i=0;i<32;i++){var a=i*Math.PI/16;pts.push([P.c[0]+Math.cos(a)*(P.R[0]*k-.6),P.c[2]+Math.sin(a)*(P.R[2]*k-.6),P.c[1]]);}
          W.poly({pts:pts,name:nm,tag:tag});}
        else if(P.kind==='room'){var ins=insetPoly(P.poly,.3);W.poly({pts:ins.map(function(p){return [p[0],p[1],P.y];}),name:nm,tag:tag});}
        else if(P.kind==='stair')W.strip({a:[P.a[0],P.a[2],P.a[1]],b:[P.b[0],P.b[2],P.b[1]],w:Math.max(.6,P.w-.6),name:nm,tag:tag});
        else if(P.kind==='trench'){var t2=insetPoly(P.poly,.3);W.poly({pts:t2.map(function(p){return [p[0],p[1],P.y0];}),name:nm,tag:tag});}
        else if(P.kind==='shaft'&&P.floor){var c=[];for(var j=0;j<16;j++){var b2=j*Math.PI/8;c.push([P.c[0]+Math.cos(b2)*(P.r0-.3),P.c[1]+Math.sin(b2)*(P.r0-.3),P.y0]);}W.poly({pts:c,name:nm,tag:tag});}
      });
      if(walk){prims.forEach(function(P){if(P.kind!=='monolith'||P.block===false)return;var b=bbox2(P.poly);walk.block([b[0],b[1],b[2],b[3],P.y0,P.y1],'cavern:monolith');});
        fixtures.forEach(function(F){walk.block(F.box,F.tag);});}
      // chunks: every chunk a primitive's box (grown by its blend and two cells) touches
      var set={},keys=[];
      prims.forEach(function(P){var g=(P.blend||1)+2*cell,b=P.box;
        var i0=Math.floor((b[0]-g)/CH),i1=Math.floor((b[1]+g)/CH),j0=Math.floor((b[2]-g)/CH),j1=Math.floor((b[3]+g)/CH),k0=Math.floor((b[4]-g)/CH),k1=Math.floor((b[5]+g)/CH);
        for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++)for(var k=k0;k<=k1;k++){var key=i+','+j+','+k;if(!set[key]){set[key]=1;keys.push([i,j,k]);}}});
      keys.sort(function(a,b){return a[0]-b[0]||a[1]-b[1]||a[2]-b[2];});
      C.chunks=keys.map(function(k){return k.join(',');});
      return C;
    };

    // ---- meshing one chunk: surface nets on the world lattice
    var CORNER=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],EDGES=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
    C.meshChunk=function(key){
      if(!built)throw new Error('KCAVERN.meshChunk: build() first');
      var ijk=key.split(',').map(Number),N=NC,x0=ijk[0]*CH,y0=ijk[1]*CH,z0=ijk[2]*CH;
      // the lattice: points -1..N (one cell of apron on the low side, so the edges at the chunk's low faces have their cells)
      var g=(1+2)*cell,list=prims.filter(function(P){var b=P.box,m=(P.blend||1)+g;return b[0]-m<=x0+CH&&b[1]+m>=x0-cell&&b[2]-m<=y0+CH&&b[3]+m>=y0-cell&&b[4]-m<=z0+CH&&b[5]+m>=z0-cell;});
      var empty={key:key,cell:cell,origin:[x0,y0,z0],pos:new Float32Array(0),nrm:new Float32Array(0),idx:new Uint32Array(0),occ:new Float32Array(0),w:new Float32Array(0),hue:new Float32Array(0),mat:new Uint8Array(0),ground:new Uint8Array(0),prim:new Uint16Array(0)};
      if(!list.length)return empty;
      // a quick refusal: far from every surface at the chunk's centre (the fields are bounds, give them a margin)
      var cx=x0+CH/2,cy=y0+CH/2+YOFF,cz=z0+CH/2,fc=airOf(list,cx,cy,cz);if(Math.abs(fc)>CH*1.8)return empty;
      var M=N+2,F=new Float64Array(M*M*M),G=new Float64Array(M*M);
      var id=function(i,j,k){return ((k+1)*M+(j+1))*M+(i+1);};
      for(var k=-1;k<=N;k++)for(var i=-1;i<=N;i++)G[(k+1)*M+(i+1)]=ground(x0+i*cell,z0+k*cell);
      var anyIn=false,anyOut=false;
      var hasMass=list.some(function(P){return P.kind==='mass';});
      for(k=-1;k<=N;k++)for(var j=-1;j<=N;j++)for(i=-1;i<=N;i++){var X=x0+i*cell,Y=y0+j*cell+YOFF,Z=z0+k*cell,dv=voidOf(list,X,Y,Z),dg=G[(k+1)*M+(i+1)]-Y;
        if(hasMass)dg=Math.max(dg,-massOf(list,X,Y,Z));var f=smin(dv,dg,rimK(X,Z));
        F[id(i,j,k)]=f;if(f<0)anyIn=true;else anyOut=true;}
      if(!anyIn||!anyOut)return empty;
      // vertices: cells -1..N-1 in each axis (the apron cells' vertices are shared with the low neighbour)
      var VX=new Int32Array(M*M*M).fill(-1),cid=function(i,j,k){return ((k+1)*M+(j+1))*M+(i+1);};
      var pos=[],nrm=[],own=[],vv=[],tops=[],gnd=[];
      for(k=-1;k<N;k++)for(j=-1;j<N;j++)for(i=-1;i<N;i++){
        var v=[],m=0,a;for(a=0;a<8;a++){var c=CORNER[a],q=F[id(i+c[0],j+c[1],k+c[2])];v.push(q);if(q<0)m|=1<<a;}
        if(m===0||m===255)continue;
        var sx=0,sy=0,sz=0,n=0;for(var e=0;e<12;e++){var E=EDGES[e],va=v[E[0]],vb=v[E[1]];if((va<0)===(vb<0))continue;var t=va/(va-vb),A=CORNER[E[0]],B=CORNER[E[1]];
          sx+=A[0]+(B[0]-A[0])*t;sy+=A[1]+(B[1]-A[1])*t;sz+=A[2]+(B[2]-A[2])*t;n++;}
        sx/=n;sy/=n;sz/=n;
        // the normal: the trilinear field's gradient at the vertex, out of the rock (toward the open)
        var gx=(1-sy)*(1-sz)*(v[1]-v[0])+sy*(1-sz)*(v[3]-v[2])+(1-sy)*sz*(v[5]-v[4])+sy*sz*(v[7]-v[6]);
        var gy=(1-sx)*(1-sz)*(v[2]-v[0])+sx*(1-sz)*(v[3]-v[1])+(1-sx)*sz*(v[6]-v[4])+sx*sz*(v[7]-v[5]);
        var gz=(1-sx)*(1-sy)*(v[4]-v[0])+sx*(1-sy)*(v[5]-v[1])+(1-sx)*sy*(v[6]-v[2])+sx*sy*(v[7]-v[3]);
        var gl=Math.hypot(gx,gy,gz)||1;
        var PX=x0+(i+sx)*cell,PY=y0+(j+sy)*cell+YOFF,PZ=z0+(k+sz)*cell;
        VX[cid(i,j,k)]=pos.length/3;pos.push(PX,PY,PZ);nrm.push(-gx/gl,-gy/gl,-gz/gl);
        var dv2=voidOf(list,PX,PY,PZ),ow=OWN,sv=S.v,st=S.top,dg2=ground(PX,PZ)-PY,ms=hasMass?massOf(list,PX,PY,PZ):1e30,op=Math.max(dg2,-ms);
        /* the active term: the void, a mass's face, or the ground (only the ground's own surface is the host's to draw) */
        /* a tie (a doorway's floor flush with the ground outside) goes to the open air's surface: the host draws its ground */
        if(op<=dv2+1e-6){if(dg2>=-ms){own.push(null);gnd.push(1);}else{own.push(OWNM);gnd.push(0);}vv.push(PY-(OWNM?OWNM.y0:0));tops.push(1e3);}
        else{own.push(ow);gnd.push(0);vv.push(sv);tops.push(st);}
        /* the host ground's own surface where a rock face meets it (not in a well's rim, which the cavern draws) sinks SINK
           under the ground: the host's ground covers that skirt, and no lit seam shows at the foot of the face */
        if(gnd[gnd.length-1]&&!inWellRim(PX,PZ))pos[pos.length-2]=Math.min(PY,ground(PX,PZ)-SINK);}
      // quads: one per sign-changing lattice edge whose low corner is in this chunk (0..N-1), the four cells round it
      var idx=[],keep=function(a,b,c,d){// a quad of the ground's surface stays only inside an opening's rim (the host draws the rest)
        if(gnd[a]&&gnd[b]&&gnd[c]&&gnd[d]){var mx=(pos[a*3]+pos[c*3])/2,mz=(pos[a*3+2]+pos[c*3+2])/2,hit=false,W2=wells();
          for(var o2=0;o2<W2.length;o2++){var Q=W2[o2];if(Math.hypot(mx-Q.c[0],mz-Q.c[1])<Q.r+Q.rim+cell*1.5){hit=true;break;}}if(!hit)return false;}
        return true;};
      /* the winding faces the open air (this field is negative in the air, the carve module's the other way round) */
      var quad=function(a,b,c,d,flip){if(a<0||b<0||c<0||d<0)return;if(!keep(a,b,c,d))return;if(flip)idx.push(a,c,b,a,d,c);else idx.push(a,b,c,a,c,d);};
      for(k=0;k<N;k++)for(j=0;j<N;j++)for(i=0;i<N;i++){var s0=F[id(i,j,k)]<0;
        if(s0!==(F[id(i+1,j,k)]<0))quad(VX[cid(i,j-1,k-1)],VX[cid(i,j,k-1)],VX[cid(i,j,k)],VX[cid(i,j-1,k)],s0);
        if(s0!==(F[id(i,j+1,k)]<0))quad(VX[cid(i-1,j,k-1)],VX[cid(i-1,j,k)],VX[cid(i,j,k)],VX[cid(i,j,k-1)],s0);
        if(s0!==(F[id(i,j,k+1)]<0))quad(VX[cid(i-1,j-1,k)],VX[cid(i,j-1,k)],VX[cid(i,j,k)],VX[cid(i-1,j,k)],s0);}
      // drop the vertices no kept quad uses, then the per-vertex attributes
      var used=new Int32Array(pos.length/3).fill(-1),nv=0;for(var u=0;u<idx.length;u++)if(used[idx[u]]<0)used[idx[u]]=nv++;
      var out={key:key,cell:cell,origin:[x0,y0,z0],pos:new Float32Array(nv*3),nrm:new Float32Array(nv*3),idx:new Uint32Array(idx.length),
        occ:new Float32Array(nv),w:new Float32Array(nv*4),hue:new Float32Array(nv),mat:new Uint8Array(nv),ground:new Uint8Array(nv),prim:new Uint16Array(nv)};
      for(u=0;u<idx.length;u++)out.idx[u]=used[idx[u]];
      for(var s=0;s<used.length;s++){var d2=used[s];if(d2<0)continue;
        var X2=pos[s*3],Y2=pos[s*3+1],Z2=pos[s*3+2],nx=nrm[s*3],ny=nrm[s*3+1],nz=nrm[s*3+2];
        out.pos[d2*3]=X2;out.pos[d2*3+1]=Y2;out.pos[d2*3+2]=Z2;out.nrm[d2*3]=nx;out.nrm[d2*3+1]=ny;out.nrm[d2*3+2]=nz;
        out.ground[d2]=gnd[s];var P=own[s];out.mat[d2]=P?P.mat:2;out.prim[d2]=P?P.i:65535;
        // occlusion: how open the field is along the normal at three reaches (the SDF's own ambient occlusion)
        var o3=0;for(var r=0,RS=[.6,1.6,3.6];r<3;r++){var dd=RS[r],fq=-airOf(list,X2+nx*dd,Y2+ny*dd,Z2+nz*dd);o3+=clamp(fq/dd,0,1);}
        out.occ[d2]=.25+.75*o3/3;
        // the weights (kits/zeijani PLAN.md 6.1): the glazed LINING low on the walls below the ledge; the oxidised
        // BREAKDOWN above it and on everything facing down; RARE colours where a slow field rises; white CRUST down drip lines
        var lining=0,brk=0,rare=0,crust=0,hue=0;
        if(!gnd[s]&&ny<.7&&P&&P.rock==='basalt'){var top=tops[s]||1,hv=vv[s];
          /* the lining on the walls below the ledge (none on what faces down), the breakdown above it and on every overhang */
          var down=sstep(.3,.6,-ny);lining=(1-sstep(top-.4,top+.4,hv))*(1-down);brk=Math.max(1-lining,down);
          rare=sstep(.6,.78,KR.vnoise(X2/9,Y2/9,Z2/9,seedRare))*brk;hue=KR.vnoise(X2/23,Y2/23,Z2/23,seedHue);
          var dl=Math.abs(KR.vnoise(X2/1.3,Y2/40,Z2/1.3,seedDrip)-.5);crust=(1-sstep(.015,.05,dl))*(1-sstep(.2,.6,ny))*.8;}
        else if(!gnd[s]&&ny<.7&&P&&P.kind!=='mass'){/* tuff rooms: only the drip lines' faint crust */
          var dl2=Math.abs(KR.vnoise(X2/1.3,Y2/40,Z2/1.3,seedDrip)-.5);crust=(1-sstep(.01,.03,dl2))*(1-sstep(.2,.6,ny))*.35;}
        out.w[d2*4]=lining;out.w[d2*4+1]=brk;out.w[d2*4+2]=rare;out.w[d2*4+3]=crust;out.hue[d2]=hue;}
      return out;
    };
    C.meshAll=function(){return C.chunks.map(C.meshChunk).filter(function(m){return m.idx.length>0;});};
    C.export=function(){
      return {format:'krator-cavern',version:1,convention:{units:'m',up:'+y',x:'east',z:'south',handed:'right'},cell:cell,chunk:CH,seed:seed,mats:MATS.slice(),
        prims:prims.map(function(P){var o={id:P.id,owner:P.owner,kind:P.kind,rock:P.rock,finish:P.finish};
          ['pts','w','h','spring','ledge','blend','c','rx','rz','belly','throat','poly','y','ceil','rise','r','y0','y1','r0','r1','a','b','taper','cap','block','joins','floor'].forEach(function(k){if(P[k]!==undefined)o[k]=JSON.parse(JSON.stringify(P[k]));});return o;}),
        openings:openings.map(function(Q){return {id:Q.id,kind:Q.kind,c:Q.c.slice(),r:Q.r,rim:Q.rim,y:Q.y,h:Q.h};}),
        fixtures:fixtures.map(function(F){return {id:F.id,owner:F.owner,box:F.box.slice(),tag:F.tag};})};
    };
    C.prims=prims;C.byId=byId;C.openings=openings;C.fixtures=fixtures;C.cell=cell;C.chunk=CH;C.MATS=MATS;C.minRock=minRock;C.chunks=[];
    return C;
  }
  function hash(meshes){// FNV-1a over every chunk's key, positions (to the millimetre) and indices
    var h=2166136261>>>0;function mix(v){h^=v&255;h=Math.imul(h,16777619);h^=(v>>>8)&255;h=Math.imul(h,16777619);h^=(v>>>16)&255;h=Math.imul(h,16777619);h^=(v>>>24)&255;h=Math.imul(h,16777619);}
    meshes.forEach(function(m){for(var i=0;i<m.key.length;i++)mix(m.key.charCodeAt(i));for(var j=0;j<m.pos.length;j++)mix(Math.round(m.pos[j]*1000));for(var k=0;k<m.idx.length;k++)mix(m.idx[k]);});
    return (h>>>0).toString(16);
  }
  // a cavern from its export (a Godot import, a probe's broken copy): the same plan, the same meshes. o: create()'s options
  function load(ex,o){if(!ex||ex.format!=='krator-cavern')throw new Error('KCAVERN.load: not a krator-cavern export');
    var C=create(Object.assign({cell:ex.cell,chunk:ex.chunk,seed:ex.seed},o||{}));
    ex.prims.forEach(function(P){var Q=JSON.parse(JSON.stringify(P));delete Q.kind;C[P.kind](Q);});
    ex.openings.forEach(function(Q){var R={id:Q.id,kind:Q.kind,c:Q.c,r:Q.r,rim:Q.rim};if(Q.y!=null)R.y=Q.y;if(Q.h!=null)R.h=Q.h;C.opening(R);});
    ex.fixtures.forEach(function(F){C.fixture(F);});return C;}
  root.KCAVERN={create:create,load:load,hash:hash,MATS:MATS,sdPoly:sdPoly,insetPoly:insetPoly,smin:smin};
})(typeof window!=='undefined'?window:globalThis);
