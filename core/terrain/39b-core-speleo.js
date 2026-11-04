// ================================================================= CORE — speleothems: what grows in a cavern's voids (KSPELEO)  [G data]
// The Hearths' section 6 and station 2 (2026-11-03): the hold is a hypogene chamber, "huge chambers, gypsum blocks and
// chandeliers, few entrances, warm and wet" (biomes/riftrim/PLAN.md, "Caverns"). KCAVERN carves the voids and nothing stood in
// them. This module places speleothems on a built KCAVERN by its own queries (C.sdf, C.ceilingAt), each a plain record, and
// meshes them as plain arrays, as KCAVERN's chunks are. Opt-in; needs core/rand and 39-core-cavern.js.
// No THREE, no DOM: plain maths, node-tested (test-speleo.js). Every draw is KRAND.hash(world, cell i, cell j, salt): a tile
// placed alone gets the records a whole cavern gets there. Axes: y up, metres, x east, z south.
//
//   const R = KSPELEO.place(C, {box:[x0, z0, x1, z1], y (a height inside the voids to look from), cell (4 m), world, kinds, accept})
//     kinds   {name: {p (a cell's chance), len:[a, b], r:[a, b], arms:[a, b] (chandelier), minGap (m of open below it)}}; default
//             KSPELEO.HYPOGENE: gypsum chandeliers, a few stalactites and stalagmites, columns where the two would meet;
//             KSPELEO.LIMESTONE (a solution cave, KKARST's): dripstone, soda straws {n, r: the cluster's spread}, curtains {r: the span,
//             folds}, flowstone mounds, rimstone dams {n, slope: the floor's least fall} on a sloping floor;
//             the crystal caves' (2026-11-03): KSPELEO.SELENITE (Naica: beams {el: [a, b] rad} rising from the floor across the
//             void, stopping at the rock they reach; blocks {n}; druse), KSPELEO.AMETHYST (a basalt geode's lining), KSPELEO.CALCITE
//             (Mississippi Valley: calcite druse and blocks, celestine beams), KSPELEO.VUG (a thunderegg's or a rhyolite vug's
//             quartz points, a topaz or two). A cell takes the first kind its hash falls in, in the order chandelier, stalactite,
//             straw, curtain, flowstone, rimstone, beam, block, druse; every crystal record carries its mineral
//     accept  (rec) -> bool: the kit's last word (a hazard's taboo, a path kept clear)
//   -> [{id, kind, x, y (where it is fixed: the ceiling, or the floor), z, len, r, roof, floor, arms?, seed}]. A point under the sky
//      (no roof), or in rock, gets nothing. kind: 'chandelier' (selenite blades fanning down from the roof), 'stalactite'
//      (a cone down), 'stalagmite' (a cone up from the floor), 'column' (floor to roof: where a stalactite and its stalagmite meet),
//      'beam' {az, el, mineral} (a four-sided prism from the floor), 'block' {parts: [{dx, dz, y, len, r, tilt, az}], mineral},
//      'druse' {pts: [{dx, dz, y, len, up}], mineral} (six-sided points on each point's own floor or roof)
//   KSPELEO.mesh(recs, {seg (6)}) -> {pos (Float32), nrm (Float32), idx (Uint32), kind (Uint8 a vertex: KSPELEO.KINDS' index)}
//   KSPELEO.blocks(recs) -> [{id, box:[x0, x1, z0, z1, y0, y1]}]: the ones a walker cannot pass (stalagmites, columns, beams, blocks), in
//      C.fixture's box order, for core/walk
//   KSPELEO.export(recs) -> {format:'krator-speleo', version:1, records}
// Godot: the records and the mesh arrays cross as data (an ArrayMesh), no twin needed to draw.
(function(root){
  'use strict';
  function KR(){var K=root.KRAND;if(!K)throw new Error('KSPELEO: load core/rand/08-core-rand.js first');return K;}
  function d(v,x){return v==null?x:v;}
  var KINDS=['chandelier','stalactite','stalagmite','column','straw','curtain','flowstone','rimstone','beam','block','druse'];
  var HYPOGENE={chandelier:{p:.22,len:[1.5,4.5],r:[.6,1.6],arms:[7,14],minGap:3},stalactite:{p:.12,len:[.6,2.4],r:[.08,.3],minGap:1},
    stalagmite:{p:.5,len:[.3,1.6],r:[.15,.45]}};
  /* a limestone cave's dress (2026-11-03, KKARST's caves): the dripstone, soda straws in clusters, curtains along a sloping roof,
     flowstone mounds, and rimstone dams across a sloping floor */
  var LIMESTONE={stalactite:{p:.16,len:[.4,3],r:[.06,.35],minGap:1},stalagmite:{p:.6,len:[.3,2.5],r:[.12,.5]},
    straw:{p:.12,len:[.15,.9],r:[.4,1.6],n:[6,20]},curtain:{p:.08,len:[.6,3],r:[1.5,6],folds:[3,7],minGap:2},
    flowstone:{p:.07,len:[.4,1.6],r:[1.5,5]},rimstone:{p:.1,len:[.08,.3],r:[1,4],n:[2,5],slope:.03}};
  /* the crystal caves' dress (2026-11-03, biomes/CRYSTAL-CAVES-5.1.md): a crystal grows huge where warm water stays saturated in an
     open void for a very long time. beam: a megacrystal from the floor across the void (Naica's selenite, to 14 m; longer at
     0.75 g); block: stubby crystals clustered on the floor; druse: crystal points lining the floor and the roof (a geode's or a
     vug's lining). Every record carries its mineral for the dressing. Each preset is a kinds object for place() */
  var SELENITE={beam:{p:.14,len:[4,14],r:[.25,1],el:[.05,.55],minGap:3,mineral:'selenite'},block:{p:.2,len:[.4,1.8],r:[.3,1.2],n:[2,6],mineral:'selenite'},
    druse:{p:.15,len:[.05,.3],r:[.8,2],n:[10,30],mineral:'gypsum'}};
  var AMETHYST={druse:{p:.9,len:[.04,.35],r:[.8,2],n:[20,50],mineral:'amethyst'},block:{p:.05,len:[.2,.6],r:[.2,.5],n:[1,3],mineral:'calcite'}};
  var CALCITE={beam:{p:.04,len:[1,3],r:[.08,.25],el:[.2,1.2],minGap:2,mineral:'celestine'},block:{p:.2,len:[.3,1.4],r:[.3,1],n:[2,5],mineral:'calcite'},
    druse:{p:.35,len:[.1,.6],r:[.8,2.5],n:[10,30],mineral:'calcite'}};
  var VUG={druse:{p:.9,len:[.02,.12],r:[.3,.9],n:[10,30],mineral:'quartz'},block:{p:.04,len:[.05,.2],r:[.05,.15],n:[1,2],mineral:'topaz'}};
  var CRYSTAL=['beam','block','druse'];
  /* the crystal kinds a cell may hold once every other kind passed it: each its share of `pick` after theirs */
  function crystal(KS,C,o,x,z,g,gap,pick,acc,u,id,seed,K){
    function rng(a,t){return a[0]+(a[1]-a[0])*t;}
    for(var q=0;q<CRYSTAL.length;q++){var k=CRYSTAL[q],S=KS[k];if(!S)continue;if(pick>=acc+S.p){acc+=S.p;continue;}var mn=S.mineral||(k==='druse'?'quartz':'selenite');
      if(k==='beam'){if(gap<d(S.minGap,3))return null;var az=u(20)*2*Math.PI,el=rng(S.el||[.05,.55],u(21)),L0=rng(S.len,u(22)),r=rng(S.r,u(23));
        var dx=Math.cos(el)*Math.cos(az),dy=Math.sin(el),dz=Math.cos(el)*Math.sin(az),y0=g[0]+r*.5,t=0;
        /* march along the beam while the void holds it: a beam ends at the rock it reaches, or at its length */
        while(t<L0&&C.sdf(x+dx*(t+.5),y0+dy*(t+.5),z+dz*(t+.5))>r*.5)t+=.5;if(t<S.len[0]*.5)return null;
        return {id:id,kind:'beam',x:x,y:g[0],z:z,len:t,r:r,az:az,el:el,mineral:mn};}
      if(k==='block'){var n=Math.round(rng(S.n||[2,6],u(20))),sp=rng(S.r,u(21)),parts=[];
        for(var a=0;a<n;a++){var w=function(s){return K.unit(K.hash(seed,a,0x5300+s));},an=w(1)*2*Math.PI,dd=sp*Math.sqrt(w(2));
          var qx=Math.cos(an)*dd,qz=Math.sin(an)*dd,gb=gapAt(C,x+qx,o.y,z+qz);if(!gb)continue;
          parts.push({dx:qx,dz:qz,y:gb[0],len:Math.min(rng(S.len,w(3)),(gb[1]-gb[0])*.5),r:sp*(.25+.25*w(4)),tilt:.35*w(5),az:w(6)*2*Math.PI});}
        if(!parts.length)return null;
        return {id:id,kind:'block',x:x,y:g[0],z:z,len:Math.max.apply(null,parts.map(function(m){return m.len;})),r:sp,parts:parts,mineral:mn};}
      var nd=Math.round(rng(S.n||[10,30],u(20))),sd=rng(S.r,u(21)),pts=[];
      for(var b=0;b<nd;b++){var v=function(s){return K.unit(K.hash(seed,b,0x5400+s));},ab=v(1)*2*Math.PI,db=sd*Math.sqrt(v(2));
        var px=Math.cos(ab)*db,pz=Math.sin(ab)*db,gg=gapAt(C,x+px,o.y,z+pz),up=v(4)<.5;if(!gg)continue;   /* each point on its own floor or roof */
        pts.push({dx:px,dz:pz,len:Math.min(rng(S.len,v(3)),(gg[1]-gg[0])*.2),up:up,y:up?gg[0]:gg[1]});}
      if(!pts.length)return null;
      return {id:id,kind:'druse',x:x,y:g[1],z:z,len:Math.max.apply(null,pts.map(function(m){return m.len;})),r:sd,pts:pts,mineral:mn};}
    return null;}
  /* the limestone kinds a cell may hold once neither a chandelier nor a stalactite took it: each its share of `pick` after theirs */
  function limestone(KS,C,o,x,z,g,gap,pick,acc,u,id,seed,K){var order=['straw','curtain','flowstone','rimstone'];
    function rng(a,t){return a[0]+(a[1]-a[0])*t;}
    for(var q=0;q<order.length;q++){var k=order[q],S=KS[k];if(!S)continue;if(pick>=acc+S.p){acc+=S.p;continue;}
      if(k==='straw'){if(gap<1)return null;var n=Math.round(rng(S.n||[6,20],u(12))),sp=rng(S.r,u(13)),arms=[];
        for(var a=0;a<n;a++){var w=function(s){return K.unit(K.hash(seed,a,0x5100+s));},an=w(1)*2*Math.PI,dd=sp*Math.sqrt(w(2));arms.push({dx:Math.cos(an)*dd,dz:Math.sin(an)*dd,len:Math.min(rng(S.len,w(3)),gap*.8)});}
        return {id:id,kind:'straw',x:x,y:g[1],z:z,len:Math.max.apply(null,arms.map(function(m){return m.len;})),r:sp,arms:arms};}
      if(k==='curtain'){if(gap<d(S.minGap,2))return null;return {id:id,kind:'curtain',x:x,y:g[1],z:z,len:Math.min(rng(S.len,u(12)),gap*.6),r:rng(S.r,u(13)),az:u(14)*Math.PI,folds:Math.round(rng(S.folds||[3,7],u(15))),amp:.08+.12*u(16)};}
      if(k==='flowstone')return {id:id,kind:'flowstone',x:x,y:g[0],z:z,len:Math.min(rng(S.len,u(12)),gap*.4),r:rng(S.r,u(13))};
      /* rimstone: the floor must fall; dams cross it downslope of the cell's point, each a low arc */
      var e=1,gx=gapAt(C,x+e,o.y,z),gz=gapAt(C,x,o.y,z+e);if(!gx||!gz)return null;var sx=(gx[0]-g[0])/e,sz=(gz[0]-g[0])/e,sl=Math.hypot(sx,sz);
      if(sl<d(S.slope,.03))return null;var dir=Math.atan2(-sz,-sx),nd=Math.round(rng(S.n||[2,5],u(12))),R=rng(S.r,u(13)),dams=[];
      for(var m=0;m<nd;m++){var off=m*R*.45;dams.push({off:off,w:R*(.5+.3*K.unit(K.hash(seed,m,0x5200))),h:rng(S.len,K.unit(K.hash(seed,m,0x5201))),y:g[0]-sl*off});}
      return {id:id,kind:'rimstone',x:x,y:g[0],z:z,len:Math.max.apply(null,dams.map(function(m){return m.h;})),r:R,dir:dir,slope:sl,dams:dams};}
    return null;}
  function pairOf(o,k){var a=o[k];if(!Array.isArray(a)||a.length!==2||!(a[0]<=a[1]))throw new Error('KSPELEO: '+k+' is [lo, hi]');return a;}
  /* the open column through (x, z) at y: [floor, roof], or null in rock or under the sky */
  function gapAt(C,x,y,z){if(!(C.sdf(x,y,z)>0))return null;var roof=C.ceilingAt(x,z,y);if(roof==null)return null;
    var t=y,s,prev=y;for(var n=0;n<4000;n++){s=C.sdf(x,t,z);if(s<=0)break;prev=t;t-=Math.max(.02,Math.min(.5,s*.8));}if(s>0)return null;
    var a=t,b=prev;for(var k=0;k<24;k++){var m=(a+b)/2;if(C.sdf(x,m,z)>0)b=m;else a=m;}return [b,roof];}
  function place(C,o){o=o||{};var K=KR();if(!C||typeof C.sdf!=='function'||typeof C.ceilingAt!=='function')throw new Error('KSPELEO.place: a built KCAVERN');
    var B=o.box;if(!Array.isArray(B)||B.length!==4||!(B[2]>B[0])||!(B[3]>B[1]))throw new Error('KSPELEO.place: box is [x0, z0, x1, z1]');
    if(typeof o.y!=='number'||!isFinite(o.y))throw new Error('KSPELEO.place: y, a height inside the voids');
    var cs=d(o.cell,4);if(!(cs>0))throw new Error('KSPELEO.place: cell must be above 0');var W=d(o.world,0)>>>0,KS=o.kinds||HYPOGENE,out=[];
    Object.keys(KS).forEach(function(k){if(KINDS.indexOf(k)<0||k==='column')throw new Error('KSPELEO.place: a kind is '+KINDS.filter(function(q){return q!=='column';}).join(', ')+' (columns come of stalactite and stalagmite), not '+k);
      pairOf(KS[k],'len');pairOf(KS[k],'r');if(k==='chandelier'&&KS[k].arms)pairOf(KS[k],'arms');});
    var i0=Math.floor(B[0]/cs),i1=Math.floor((B[2]-1e-9)/cs),j0=Math.floor(B[1]/cs),j1=Math.floor((B[3]-1e-9)/cs);
    function u(i,j,s){return K.unit(K.hash(W,i,j,s));}
    function rng(a,t){return a[0]+(a[1]-a[0])*t;}
    for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){var x=(i+u(i,j,1))*cs,z=(j+u(i,j,2))*cs;if(x<B[0]||x>=B[2]||z<B[1]||z>=B[3])continue;
      var g=gapAt(C,x,o.y,z);if(!g)continue;var gap=g[1]-g[0],seed=K.hash(W,i,j,7),id='speleo:'+i+','+j,rec=null,pick=u(i,j,3);
      var ch=KS.chandelier,sc=KS.stalactite,sm=KS.stalagmite;
      if(ch&&pick<ch.p&&gap>=d(ch.minGap,3)){var len=Math.min(rng(ch.len,u(i,j,4)),gap*.45),na=Math.round(rng(ch.arms||[7,14],u(i,j,5))),arms=[];
        for(var a=0;a<na;a++){var q=function(s){return K.unit(K.hash(seed,a,s));};arms.push({az:(a+.4*q(1))/na*2*Math.PI,tilt:.35+.85*q(2),len:len*(.55+.45*q(3)),w:.05+.07*q(4)});}
        rec={id:id,kind:'chandelier',x:x,y:g[1],z:z,len:len,r:rng(ch.r,u(i,j,6)),arms:arms};}
      else if(sc&&pick<d(ch&&ch.p,0)+sc.p&&gap>=d(sc.minGap,1)){var L1=rng(sc.len,u(i,j,4)),r1=rng(sc.r,u(i,j,6));
        if(sm&&u(i,j,8)<sm.p){var L2=rng(sm.len,u(i,j,9)),r2=rng(sm.r,u(i,j,10));
          if(L1+L2>=gap)rec={id:id,kind:'column',x:x,y:g[0],z:z,len:gap,r:Math.max(r1,r2),roof:g[1],floor:g[0]};
          else{var rs={id:id+':up',kind:'stalagmite',x:x,y:g[0],z:z,len:L2,r:r2,roof:g[1],floor:g[0],seed:K.hash(W,i,j,11)};if(!o.accept||o.accept(rs))out.push(rs);}}
        if(!rec)rec={id:id,kind:'stalactite',x:x,y:g[1],z:z,len:Math.min(L1,gap*.9),r:r1};}
      else rec=limestone(KS,C,o,x,z,g,gap,pick,d(ch&&ch.p,0)+d(sc&&sc.p,0),function(s){return u(i,j,s);},id,seed,K);
      if(!rec&&(KS.beam||KS.block||KS.druse)){var acc=d(ch&&ch.p,0)+d(sc&&sc.p,0);['straw','curtain','flowstone','rimstone'].forEach(function(q){if(KS[q])acc+=KS[q].p;});
        if(pick>=acc)rec=crystal(KS,C,o,x,z,g,gap,pick,acc,function(s){return u(i,j,s);},id,seed,K);}
      if(!rec)continue;rec.roof=g[1];rec.floor=g[0];rec.seed=seed;if(!o.accept||o.accept(rec))out.push(rec);}
    return out;}
  // ---- the meshes: a cone (stalactite down, stalagmite up), a column waisted in the middle, a chandelier's blades (flat
  // four-sided prisms, a selenite blade's section) fanning down and out from a small boss on the roof
  function mesh(R,o){o=o||{};var seg=Math.max(3,d(o.seg,6)),P=[],N=[],I=[],Kd=[];
    function v(p,n,k){P.push(p[0],p[1],p[2]);var l=Math.hypot(n[0],n[1],n[2])||1;N.push(n[0]/l,n[1]/l,n[2]/l);Kd.push(k);return P.length/3-1;}
    /* a ring-to-ring tube along a polyline of [x, y, z, radius] */
    function tube(rings,k){var base=P.length/3,n=rings.length;
      for(var a=0;a<n;a++){var c=rings[a],nx=a<n-1?rings[a+1]:c,pv=a>0?rings[a-1]:c,ax=[nx[0]-pv[0],nx[1]-pv[1],nx[2]-pv[2]],al=Math.hypot(ax[0],ax[1],ax[2])||1;ax=[ax[0]/al,ax[1]/al,ax[2]/al];
        var ref=Math.abs(ax[1])<.9?[0,1,0]:[1,0,0],e1=[ax[1]*ref[2]-ax[2]*ref[1],ax[2]*ref[0]-ax[0]*ref[2],ax[0]*ref[1]-ax[1]*ref[0]],el=Math.hypot(e1[0],e1[1],e1[2]);e1=[e1[0]/el,e1[1]/el,e1[2]/el];
        var e2=[ax[1]*e1[2]-ax[2]*e1[1],ax[2]*e1[0]-ax[0]*e1[2],ax[0]*e1[1]-ax[1]*e1[0]];
        for(var s=0;s<seg;s++){var t=s/seg*2*Math.PI,cn=Math.cos(t),sn=Math.sin(t),nn=[e1[0]*cn+e2[0]*sn,e1[1]*cn+e2[1]*sn,e1[2]*cn+e2[2]*sn];v([c[0]+nn[0]*c[3],c[1]+nn[1]*c[3],c[2]+nn[2]*c[3]],nn,k);}}
      for(a=0;a<n-1;a++)for(s=0;s<seg;s++){var p0=base+a*seg+s,p1=base+a*seg+(s+1)%seg,q0=p0+seg,q1=p1+seg;I.push(p0,q0,p1,p1,q0,q1);}}
    R.forEach(function(r){var k=KINDS.indexOf(r.kind);if(k<0)throw new Error('KSPELEO.mesh: unknown kind '+r.kind);var x=r.x,z=r.z,eps=.01;
      if(r.kind==='stalactite')tube([[x,r.y+.05,z,r.r],[x,r.y-r.len*.5,z,r.r*.45],[x,r.y-r.len,z,eps]],k);
      else if(r.kind==='stalagmite')tube([[x,r.y-.05,z,r.r],[x,r.y+r.len*.6,z,r.r*.55],[x,r.y+r.len,z,r.r*.2]],k);
      else if(r.kind==='column')tube([[x,r.y-.05,z,r.r*1.3],[x,r.y+r.len*.5,z,r.r*.7],[x,r.y+r.len+.05,z,r.r*1.3]],k);
      else if(r.kind==='straw'){var sv=seg;seg=3;r.arms.forEach(function(A){tube([[x+A.dx,r.y+.03,z+A.dz,.014],[x+A.dx,r.y-A.len*.6,z+A.dz,.01],[x+A.dx,r.y-A.len,z+A.dz,.005]],k);});seg=sv;}
      else if(r.kind==='flowstone')tube([[x,r.y-.05,z,r.r],[x,r.y+r.len*.45,z,r.r*.7],[x,r.y+r.len,z,r.r*.12]],k);
      else if(r.kind==='rimstone'){var sv2=seg;seg=4;var cd=Math.cos(r.dir),sd=Math.sin(r.dir);r.dams.forEach(function(D){var pts=[];
          for(var a=-3;a<=3;a++){var t=a/3,along=D.off+D.w*.35*(1-t*t),across=t*D.w;pts.push([x+cd*along-sd*across,D.y+D.h*.5,z+sd*along+cd*across,D.h*.5]);}tube(pts,k);});seg=sv2;}
      else if(r.kind==='curtain'){/* a sheet hanging from the roof along az, folded across itself; drawn both sides */
        var ca=Math.cos(r.az),sa=Math.sin(r.az),nu=Math.max(8,r.folds*6),nv=4;
        for(var side=0;side<2;side++){var sb=P.length/3,sg=side?-1:1;
          for(var iu=0;iu<=nu;iu++){var tu=iu/nu,s=(tu-.5)*r.r,ph=tu*r.folds*2*Math.PI,off=Math.sin(ph)*r.amp,dn=Math.cos(ph);
            for(var iv=0;iv<=nv;iv++){var tv=iv/nv,drop=r.len*tv*(.75+.25*Math.sin(tu*Math.PI));
              v([x+ca*s-sa*off*(1+tv),r.y+.03-drop,z+sa*s+ca*off*(1+tv)],[-sa*sg*(1-.5*Math.abs(dn)),0,ca*sg*(1-.5*Math.abs(dn))],k);}}
          for(iu=0;iu<nu;iu++)for(iv=0;iv<nv;iv++){var p0=sb+iu*(nv+1)+iv,p1=p0+nv+1;if(side)I.push(p0,p0+1,p1,p1,p0+1,p1+1);else I.push(p0,p1,p0+1,p0+1,p1,p1+1);}}
        }
      else if(r.kind==='beam'){/* a four-sided prism (a selenite blade's section), its foot sunk in the floor, its end a low point */
        var bx=Math.cos(r.el)*Math.cos(r.az),by=Math.sin(r.el),bz=Math.cos(r.el)*Math.sin(r.az),y0=r.y+r.r*.5,sv3=seg;seg=4;
        tube([[x-bx*r.r,y0-by*r.r-r.r*.4,z-bz*r.r,r.r],[x+bx*r.len*.9,y0+by*r.len*.9,z+bz*r.len*.9,r.r*.9],[x+bx*r.len,y0+by*r.len,z+bz*r.len,r.r*.25]],k);seg=sv3;}
      else if(r.kind==='block'){var sv4=seg;seg=4;r.parts.forEach(function(B){var tx=Math.sin(B.tilt)*Math.cos(B.az),tz=Math.sin(B.tilt)*Math.sin(B.az),ty=Math.cos(B.tilt),bx0=x+B.dx,bz0=z+B.dz;
          tube([[bx0,B.y-.05,bz0,B.r],[bx0+tx*B.len*.8,B.y+ty*B.len*.8,bz0+tz*B.len*.8,B.r*.95],[bx0+tx*B.len,B.y+ty*B.len,bz0+tz*B.len,B.r*.3]],k);});seg=sv4;}
      else if(r.kind==='druse'){/* six-sided points: up from the floor and down from the roof */
        var sv5=seg;seg=6;r.pts.forEach(function(D){var py=D.y,sg=D.up?1:-1,w=Math.max(.01,D.len*.28);
          tube([[x+D.dx,py-sg*.02,z+D.dz,w],[x+D.dx,py+sg*D.len*.7,z+D.dz,w],[x+D.dx,py+sg*D.len,z+D.dz,eps]],k);});seg=sv5;}
      else{tube([[x,r.y+.05,z,r.r*.35],[x,r.y-r.r*.3,z,r.r*.3],[x,r.y-r.r*.6,z,eps]],k);
        r.arms.forEach(function(A){var dx=Math.cos(A.az)*Math.sin(A.tilt),dz=Math.sin(A.az)*Math.sin(A.tilt),dy=-Math.cos(A.tilt),o0=[x+dx*r.r*.25,r.y-r.r*.2,z+dz*r.r*.25];
          var save=seg;seg=4;tube([[o0[0],o0[1],o0[2],A.w],[o0[0]+dx*A.len*.7,o0[1]+dy*A.len*.7,o0[2]+dz*A.len*.7,A.w*.8],[o0[0]+dx*A.len,o0[1]+dy*A.len,o0[2]+dz*A.len,eps]],k);seg=save;});}});
    return {pos:new Float32Array(P),nrm:new Float32Array(N),idx:new Uint32Array(I),kind:new Uint8Array(Kd)};}
  function blocks(R){return R.filter(function(r){return r.kind==='stalagmite'||r.kind==='column'||r.kind==='block'||r.kind==='beam';}).map(function(r){
    if(r.kind==='beam'){var ex=r.x+Math.cos(r.el)*Math.cos(r.az)*r.len,ez=r.z+Math.cos(r.el)*Math.sin(r.az)*r.len,ey=r.y+r.r*.5+Math.sin(r.el)*r.len;
      return {id:r.id,box:[Math.min(r.x,ex)-r.r,Math.max(r.x,ex)+r.r,Math.min(r.z,ez)-r.r,Math.max(r.z,ez)+r.r,r.y,Math.max(r.y+r.r*2,ey+r.r)]};}
    var w=r.kind==='column'?r.r*1.3:r.kind==='block'?r.r*1.25:r.r;
    return {id:r.id,box:[r.x-w,r.x+w,r.z-w,r.z+w,r.y,r.y+r.len]};});}
  function exp(R){return {format:'krator-speleo',version:1,convention:{units:'m',up:'+y',x:'east',z:'south'},kinds:KINDS.slice(),records:JSON.parse(JSON.stringify(R))};}
  root.KSPELEO={place:place,mesh:mesh,blocks:blocks,export:exp,KINDS:KINDS,HYPOGENE:HYPOGENE,LIMESTONE:LIMESTONE,
    SELENITE:SELENITE,AMETHYST:AMETHYST,CALCITE:CALCITE,VUG:VUG,gapAt:gapAt};
})(typeof window!=='undefined'?window:globalThis);
