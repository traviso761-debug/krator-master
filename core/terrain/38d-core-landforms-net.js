// ================================================================= CORE — relief: the three-trend graben net, giant flood ripples  [G data]
// Two more KRELIEF kinds the unbuilt plans owed (2026-11-09; LANDFORMS.md beside this file):
//   grabenNet  a net of grabens on intersecting fault trends, as KRELIEF.stepcut records with tapered chasm heads, and the
//              horst blocks (bastions) left between them (biomes/labyrinth PLAN.md section 7, amendment 3: the Labyrinth's maze
//              of corridors and bastions; the Siphon Pits' graben stamps; the Loom-Chasms' horst-and-graben)
//   ripples    giant current ripples on a flood floor: asymmetric crests across the flow, sinuous, bifurcating (biomes/outlandgate
//              PLAN.md amendment 3: the Missoula and Altai floods' ripple fields; crests 2-15 m high, 60-150 m apart)
// Records first (plain data, JSON-safe; every draw KRAND.hash(world, trend, line, segment, salt) or KRAND.hash(seed, cell, salt),
// never from how many draws came before), on KRELIEF's composition as 38c does it: once this file is loaded, KRELIEF.shape, at,
// apply and kinds take the two, and every other kind answers exactly as before. KRELIEF.waters lists nothing for either.
//
//   KRELIEF.grabenNet({box:[x0, z0, x1, z1], world (or seed; 1), id ('net': the cuts' ids are '<id>:<trend>:<line>,<segment>'),
//     trends:[{az (rad: the faults' strike), spacing (m between parallel fault lines; required), offset (0: the lines' phase across),
//       jitter (.25 x spacing: each line's across offset, +-), w:[20, 40] (a cut's floor half-width), depth:[40, 80], len:[2, 4] x
//       spacing (a segment's length), gap:[.1, .3] x len[0] (between segments along a line), stagger (w[1]: each segment's own
//       across offset, +-, so the segments stand en echelon), p (.85: the chance a segment is cut at all)}],
//     steps (3), tread (12), riser (1.5), warp (as stepcut's; none), heads ({share (.25 of a cut's length), len (m: overrides
//     share), amph (.6), wall (0)} | false: square-ended cuts; a cut's heads are at both ends, 38c's stepcut head),
//     keep ((x, z) -> bool: where cuts may go, e.g. outside the dome's polygon; a segment is trimmed to its kept runs, each run's
//     cut end pulled in by the outline's half-width so no wall enters the masked ground), ground ((x, z) -> y: for a bastion's
//     top), bastions (true), cell (25 m: the bastions' grid), minArea (4 cells)})
//   -> {kind:'grabenNet', id, world, box, cuts:[stepcut records, each with id, trend, lineNo, seg], corridors:[{id, trend, pts, w,
//       out (the outline's half-width), depth}], bastions:[{id, pts (outline polygon), area, c:[x, z], top, edge (it touches the box:
//       clipped)}], nodes:[{id, x, z, cuts:[id, id]}] (where two cuts' lines cross)}
//   shape(net, x, z, g): the cuts unioned (the deepest wins where they cross: applying the cuts one by one instead adds their
//   depths at a crossing). at(): the deepest cut's part (stepcut's) with its id ({cut}) or null.
//   A box chooses which segments to keep (any whose outline reaches the box), never moves one: a tile's net has the very cuts the
//   whole box has there. Bastions are found on the box's grid, so they are clipped at its edge (edge: true).
//
//   KRELIEF.ripples({poly:[[x, z]...] | line:{pts, w (the half-width)}, flow (rad, the current's direction, for a poly; a line's
//     flow runs along it, first point to last, unless reverse), wl (100 m: crest to crest), h (6 m: trough to crest), stoss (.75:
//     the upstream face's share of a wavelength; the lee is the rest, so the lee is the steeper), sinuous (.25: the crests' wander,
//     in wavelengths), bif (.5: the chance per 8-wavelength cell of a crest inserted between two forks), vary (.25: crest height
//     varying along the crest), fade (wl/2 m: the bedform fades to nothing at the area's edge), seed})
//   -> {kind:'ripples', form:'poly' | 'line', poly | line, flow, wl, h, stoss, sinuous, bif, vary, fade, seed, forks:[{a:[x, z],
//       b:[x, z], sg}] (the inserted crests' ends, from the area's bounds)}
//   shape: g plus the bedform (mean-free: the floor's volume is kept), exactly g outside. at(): {part:'crest' | 'stoss' | 'lee' |
//   'trough', t (0..1 through a wavelength, trough to trough), fade} or null outside.
//
// Opt-in; needs core/rand, 38-core-relief.js and 38c-core-landforms.js. No THREE, no DOM; node core/terrain/test-landforms-net.js.
// Axes: y up, metres, x east, z south. Defaults are written x == null ? d : x.
(function(root){
  'use strict';
  var KR=root.KRELIEF;
  if(!KR||!KR._landforms||!KR.stepcut)throw new Error('core/terrain 38d-core-landforms-net.js: load 38c-core-landforms.js first (KRELIEF.stepcut)');
  if(KR._landformsNet)return;
  function KRq(){var K=root.KRAND;if(!K)throw new Error('KRELIEF net: load core/rand/08-core-rand.js first');return K;}
  var TAU=Math.PI*2;
  function d(v,x){return v==null?x:v;}
  function c01(v){return v<0?0:v>1?1:v;}
  function sm(a,b,v){var t=c01((v-a)/(b-a));return t*t*(3-2*t);}
  function lerp(a,b,t){return a+(b-a)*t;}
  function u01(K,seed,a,b,c,e,s){return K.unit(K.hash(seed,a,b,c,e,s));}
  function hidden(R,k,v){Object.defineProperty(R,k,{value:v,enumerable:false,configurable:true,writable:true});return v;}
  function pair(v,a,b,name){if(v==null)return [a,b];if(typeof v==='number')return [v,v];if(!(v.length===2&&v[0]<=v[1]))throw new Error('KRELIEF.'+name+': a range is [min, max]');return [+v[0],+v[1]];}
  function segDist(x,z,a,b){var dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=((x-a[0])*dx+(z-a[1])*dz)/l2;t=t<0?0:t>1?1:t;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}

  // ---------------------------------------------------------------- KRELIEF.grabenNet
  function grabenNet(o){var K=KRq();if(!o||!o.box||o.box.length!==4)throw new Error('KRELIEF.grabenNet: a box [x0, z0, x1, z1] is needed');
    if(!o.trends||!o.trends.length)throw new Error('KRELIEF.grabenNet: trends are needed (one or more {az, spacing})');
    var box=o.box.map(Number),world=(o.world!=null?o.world:o.seed!=null?o.seed:1)>>>0,id=o.id==null?'net':String(o.id);
    var steps=d(o.steps,3),tread=d(o.tread,12),riser=d(o.riser,1.5),warp=o.warp||null,wa=warp&&warp.amp?warp.amp:0,keep=o.keep||null;
    var heads=o.heads===false?null:Object.assign({share:.25,amph:.6,wall:0},o.heads||{});
    var edgeMax=(steps-1)*tread*1.3+steps*riser,cuts=[];
    for(var t=0;t<o.trends.length;t++){var T=o.trends[t];if(!(T.spacing>0)||typeof T.az!=='number')throw new Error('KRELIEF.grabenNet: trend '+t+' needs az (rad) and spacing > 0');
      var az=+T.az,ux=Math.cos(az),uz=Math.sin(az),nx=-uz,nz=ux,sp=T.spacing,W=pair(T.w,20,40,'grabenNet'),Dp=pair(T.depth,40,80,'grabenNet'),
        Ln=pair(T.len,2*sp,4*sp,'grabenNet'),Gp=pair(T.gap,.1*Ln[0],.3*Ln[0],'grabenNet'),jit=d(T.jitter,.25*sp),stag=d(T.stagger,W[1]),
        pc=d(T.p,.85),off=d(T.offset,0),P=Ln[1]+Gp[1],Mg=W[1]+edgeMax+jit+stag+wa+4;
      if(!(Ln[0]>0))throw new Error('KRELIEF.grabenNet: trend '+t+' needs len > 0');
      var pn=[],pu=[];[[box[0],box[1]],[box[2],box[1]],[box[0],box[3]],[box[2],box[3]]].forEach(function(c){pn.push(c[0]*nx+c[1]*nz);pu.push(c[0]*ux+c[1]*uz);});
      var k0=Math.floor((Math.min.apply(null,pn)-Mg-off)/sp),k1=Math.ceil((Math.max.apply(null,pn)+Mg-off)/sp),
        j0=Math.floor((Math.min.apply(null,pu)-Mg)/P)-1,j1=Math.ceil((Math.max.apply(null,pu)+Mg)/P);
      for(var k=k0;k<=k1;k++){var cl=off+k*sp+jit*(2*u01(K,world,t,k,0,0,0x6E31)-1);
        for(var j=j0;j<=j1;j++){if(u01(K,world,t,k,j,0,0x6E32)>=pc)continue;
          var L=lerp(Ln[0],Ln[1],u01(K,world,t,k,j,0,0x6E33)),a=j*P+u01(K,world,t,k,j,0,0x6E34)*Math.max(0,P-L-Gp[0]),
            c=cl+stag*(2*u01(K,world,t,k,j,0,0x6E35)-1),w=lerp(W[0],W[1],u01(K,world,t,k,j,0,0x6E36)),
            dep=lerp(Dp[0],Dp[1],u01(K,world,t,k,j,0,0x6E37)),seed=K.hash(world,t,k,j,0x6E38);
          var runs=[[a,a+L]];if(keep)runs=keptRuns(keep,ux,uz,nx,nz,c,a,a+L,w+edgeMax+wa);
          for(var r=0;r<runs.length;r++){var A=runs[r][0],B=runs[r][1],Wo=w+edgeMax;if(B-A<Math.max(2*Wo,.25*Ln[0]))continue;
            var pA=[A*ux+c*nx,A*uz+c*nz],pB=[B*ux+c*nx,B*uz+c*nz],rch=Wo+wa+4;
            if(Math.max(pA[0],pB[0])+rch<box[0]||Math.min(pA[0],pB[0])-rch>box[2]||Math.max(pA[1],pB[1])+rch<box[1]||Math.min(pA[1],pB[1])-rch>box[3])continue;
            var so={line:{pts:[pA,pB],w:w},depth:dep,steps:steps,tread:tread,riser:riser,seed:seed};if(warp)so.warp=warp;
            if(heads)so.head={at:'both',len:Math.min(heads.len!=null?heads.len:heads.share*(B-A),.45*(B-A)),amph:heads.amph,wall:heads.wall};
            var C=KR.stepcut(so);C.id=id+':'+t+':'+k+','+j+(runs.length>1?'/'+r:'');C.trend=t;C.lineNo=k;C.seg=j;cuts.push(C);}}}}
    var N={kind:'grabenNet',id:id,world:world,box:box,cuts:cuts,
      corridors:cuts.map(function(C){return {id:C.id,trend:C.trend,pts:C.line.pts.map(function(p){return [p[0],p[1]];}),w:C.line.w,out:C.line.w+C.edge,depth:C.depth};}),
      nodes:netNodes(cuts),bastions:[]};
    if(o.bastions!==false)N.bastions=netBastions(N,o,keep,d(o.cell,25),d(o.minArea,4));
    return N;}
  // the kept runs of a segment: a station is kept where keep holds on the line and at both sides of the outline; a run's end
  // that the mask cut is pulled in by the outline's half-width (Wo)
  function keptRuns(keep,ux,uz,nx,nz,c,a,b,Wo){var n=Math.max(2,Math.ceil((b-a)/8)),ds=(b-a)/n,ok=[],runs=[],i;
    for(i=0;i<=n;i++){var s=a+ds*i,x=s*ux+c*nx,z=s*uz+c*nz;ok.push(!!(keep(x,z)&&keep(x+nx*Wo,z+nz*Wo)&&keep(x-nx*Wo,z-nz*Wo)));}
    for(i=0;i<=n;i++){if(!ok[i])continue;var i0=i;while(i+1<=n&&ok[i+1])i++;
      var A=a+ds*i0+(i0>0?Wo:0),B=a+ds*i-(i<n?Wo:0);if(B>A)runs.push([A,B]);}
    return runs;}
  function netNodes(cuts){var out=[];
    for(var i=0;i<cuts.length;i++)for(var j=i+1;j<cuts.length;j++){var A=cuts[i],B=cuts[j];if(A.trend===B.trend)continue;
      var p=A.line.pts[0],q=A.line.pts[1],r=B.line.pts[0],s=B.line.pts[1],ax=q[0]-p[0],az=q[1]-p[1],bx=s[0]-r[0],bz=s[1]-r[1],den=ax*bz-az*bx;
      if(Math.abs(den)<1e-9)continue;var ta=((r[0]-p[0])*bz-(r[1]-p[1])*bx)/den,tb=((r[0]-p[0])*az-(r[1]-p[1])*ax)/den;
      if(ta<0||ta>1||tb<0||tb>1)continue;var a=A.id<B.id?A:B,b=a===A?B:A;
      out.push({id:a.id+'x'+b.id,x:p[0]+ax*ta,z:p[1]+az*ta,cuts:[a.id,b.id]});}
    out.sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0;});return out;}
  // the bastions: the grid's cells no cut's outline reaches (a cut's outline lies inside its line's capsule of radius
  // w + edge, heads and all, so a bastion cell is wholly untouched), in 4-connected regions, each traced to its outline
  function netBastions(N,o,keep,cs,minA){var bx=N.box,i0=Math.floor(bx[0]/cs),j0=Math.floor(bx[1]/cs),nx=Math.ceil(bx[2]/cs)-i0,nz=Math.ceil(bx[3]/cs)-j0;
    if(nx*nz>4e6)throw new Error('KRELIEF.grabenNet: the bastions\' grid is '+nx+' x '+nz+': a coarser cell, or bastions: false');
    var free=new Uint8Array(nx*nz),lab=new Int32Array(nx*nz),half=cs*Math.SQRT1_2,i,j,ix=netIndex(N);
    for(j=0;j<nz;j++)for(i=0;i<nx;i++){var x=(i0+i+.5)*cs,z=(j0+j+.5)*cs,hit=false,L=ix.at(x,z);
      for(var m=0;m<L.length&&!hit;m++){var C=N.cuts[L[m]];if(segDist(x,z,C.line.pts[0],C.line.pts[1])<=C.line.w+C.edge+(C.warp.amp||0)+3+half)hit=true;}
      free[j*nx+i]=!hit&&(!keep||keep(x,z))?1:0;}
    var out=[],nl=0,stack=[];
    for(j=0;j<nz;j++)for(i=0;i<nx;i++){var q=j*nx+i;if(!free[q]||lab[q])continue;nl++;var cells=[],edge=false;lab[q]=nl;stack.push(q);
      while(stack.length){var c=stack.pop(),ci=c%nx,cj=(c-ci)/nx;cells.push(c);if(ci===0||cj===0||ci===nx-1||cj===nz-1)edge=true;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(D){var a=ci+D[0],b=cj+D[1];if(a<0||b<0||a>=nx||b>=nz)return;var e=b*nx+a;if(free[e]&&!lab[e]){lab[e]=nl;stack.push(e);}});}
      if(cells.length<minA)continue;
      var top=null,sx=0,sz=0;cells.forEach(function(c){var ci=c%nx,cj=(c-ci)/nx,x=(i0+ci+.5)*cs,z=(j0+cj+.5)*cs;sx+=x;sz+=z;
        if(o.ground){var y=o.ground(x,z);if(top==null||y>top)top=y;}});
      out.push({id:N.id+':b:'+(i0+i)+','+(j0+j),pts:trace(lab,nl,nx,nz).map(function(p){return [(i0+p[0])*cs,(j0+p[1])*cs];}),area:cells.length*cs*cs,
        c:[sx/cells.length,sz/cells.length],top:top,edge:edge});}
    return out;}
  // a region's outer outline on the cell lattice: its cells' sides with no same-region neighbour, chained (left turns first at a
  // pinch); the loop of largest area, with collinear points dropped
  function trace(lab,l,nx,nz){var ed={},I=function(a,b){return a>=0&&b>=0&&a<nx&&b<nz&&lab[b*nx+a]===l;},add=function(a,b,c,e){var k=a+','+b;(ed[k]=ed[k]||[]).push([c,e]);};
    for(var j=0;j<nz;j++)for(var i=0;i<nx;i++){if(lab[j*nx+i]!==l)continue;
      if(!I(i,j-1))add(i,j,i+1,j);if(!I(i+1,j))add(i+1,j,i+1,j+1);if(!I(i,j+1))add(i+1,j+1,i,j+1);if(!I(i-1,j))add(i,j+1,i,j);}
    var best=null,bestA=-1;
    for(var key in ed){while(ed[key]&&ed[key].length){var s=key.split(',').map(Number),loop=[s],cur=s,px=0,pz=0,first=true,guard=0;
        while(guard++<1e7){var k2=cur[0]+','+cur[1],L=ed[k2];if(!L||!L.length)break;var pick=0;
          if(L.length>1&&!first){var bs=-9;for(var m=0;m<L.length;m++){var dx=L[m][0]-cur[0],dz=L[m][1]-cur[1],cr=px*dz-pz*dx,dt=px*dx+pz*dz,sc=cr>0?2:dt>0?1:0;if(sc>bs){bs=sc;pick=m;}}}
          var nxt=L.splice(pick,1)[0];px=nxt[0]-cur[0];pz=nxt[1]-cur[1];first=false;cur=nxt;if(cur[0]===s[0]&&cur[1]===s[1])break;loop.push(cur);}
        var A=0;for(var q=0;q<loop.length;q++){var p1=loop[q],p2=loop[(q+1)%loop.length];A+=p1[0]*p2[1]-p2[0]*p1[1];}
        if(Math.abs(A)>bestA){bestA=Math.abs(A);best=loop;}}}
    if(!best)return [];var o=[];for(var q2=0;q2<best.length;q2++){var a=best[(q2+best.length-1)%best.length],b=best[q2],c=best[(q2+1)%best.length];
      if((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])!==0)o.push([b[0],b[1]]);}
    return o;}
  // a coarse grid over the cuts' reaches, built once per record (hidden: the record stays JSON-safe)
  function netIndex(N){if(N._ix)return N._ix;var G=200,m={},cuts=N.cuts;
    for(var c=0;c<cuts.length;c++){var C=cuts[c],p=C.line.pts,r=C.line.w+C.edge+(C.warp.amp||0)+4,
        x0=Math.floor((Math.min(p[0][0],p[1][0])-r)/G),x1=Math.floor((Math.max(p[0][0],p[1][0])+r)/G),
        z0=Math.floor((Math.min(p[0][1],p[1][1])-r)/G),z1=Math.floor((Math.max(p[0][1],p[1][1])+r)/G);
      for(var i=x0;i<=x1;i++)for(var j=z0;j<=z1;j++){var k=i+','+j;(m[k]=m[k]||[]).push(c);}}
    var none=[];return hidden(N,'_ix',{at:function(x,z){return m[Math.floor(x/G)+','+Math.floor(z/G)]||none;}});}
  function netH(N,x,z,g){g=g==null?0:g;var L=netIndex(N).at(x,z),lo=0,hi=0;
    for(var i=0;i<L.length;i++){var v=KR.shape(N.cuts[L[i]],x,z,g)-g;if(v<lo)lo=v;else if(v>hi)hi=v;}
    return lo<0?g+lo:g+hi;}
  function netAt(N,x,z,g){g=g==null?0:g;var L=netIndex(N).at(x,z),best=null,bv=Infinity;
    for(var i=0;i<L.length;i++){var C=N.cuts[L[i]],a=KR.at(C,x,z,g);if(!a)continue;var v=KR.shape(C,x,z,g);if(v<bv){bv=v;best=Object.assign({cut:C.id},a);}}
    return best;}

  // ---------------------------------------------------------------- KRELIEF.ripples
  function ripples(o){var K=KRq();if(!o)throw new Error('KRELIEF.ripples: options are needed');var seed=(o.seed==null?1:o.seed)>>>0,R,i;
    var wl=d(o.wl,100),h=d(o.h,6),st=d(o.stoss,.75);if(!(wl>0)||!(h>=0))throw new Error('KRELIEF.ripples: wl > 0 and h >= 0');
    if(!(st>0&&st<1))throw new Error('KRELIEF.ripples: stoss is a share of the wavelength, between 0 and 1');
    R={kind:'ripples',seed:seed,wl:wl,h:h,stoss:st,sinuous:d(o.sinuous,.25),bif:d(o.bif,.5),vary:d(o.vary,.25),fade:d(o.fade,wl/2),forks:[]};
    var bb;
    if(o.poly){if(o.poly.length<3)throw new Error('KRELIEF.ripples: a poly needs three points or more');
      if(o.flow==null)throw new Error('KRELIEF.ripples: a poly needs flow (rad: the current\'s direction)');
      R.form='poly';R.poly=o.poly.map(function(p){return [+p[0],+p[1]];});R.flow=+o.flow;
      bb=R.poly.reduce(function(b,p){return [Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])];},[Infinity,Infinity,-Infinity,-Infinity]);}
    else if(o.line){var P=o.line.pts;if(!P||P.length<2)throw new Error('KRELIEF.ripples: a line needs two points or more');
      var pts=(o.reverse?P.slice().reverse():P).map(function(p){return [+p[0],+p[1]];}),S=[0];
      for(i=1;i<pts.length;i++)S.push(S[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
      if(!(S[S.length-1]>0))throw new Error('KRELIEF.ripples: the line has no length');
      R.form='line';R.line={pts:pts,S:S,w:d(o.line.w,300)};R.flow=null;var w=R.line.w;
      bb=pts.reduce(function(b,p){return [Math.min(b[0],p[0]-w),Math.min(b[1],p[1]-w),Math.max(b[2],p[0]+w),Math.max(b[3],p[1]+w)];},[Infinity,Infinity,-Infinity,-Infinity]);}
    else throw new Error('KRELIEF.ripples: a poly (with flow) or a line {pts, w} is needed');
    // the forks: per 8-wavelength cell of the (s, c) frame, a crest inserted between two dislocations of opposite sign, along the crest
    var cs=8*wl,cn=R.form==='line'?[[0,-R.line.w],[R.line.S[R.line.S.length-1],R.line.w]]:[[bb[0],bb[1]],[bb[2],bb[1]],[bb[0],bb[3]],[bb[2],bb[3]]].map(function(p){return rLocal0(R,p[0],p[1]);}),
      s0=Math.floor(Math.min.apply(null,cn.map(function(q){return q[0];}))/cs),s1=Math.floor(Math.max.apply(null,cn.map(function(q){return q[0];}))/cs),
      c0=Math.floor(Math.min.apply(null,cn.map(function(q){return q[1];}))/cs),c1=Math.floor(Math.max.apply(null,cn.map(function(q){return q[1];}))/cs);
    if((s1-s0+1)*(c1-c0+1)>2e5)throw new Error('KRELIEF.ripples: the area is over 200,000 fork cells: a longer wl');
    for(var a=s0;a<=s1;a++)for(var b=c0;b<=c1;b++){if(K.unit(K.hash(seed,a,b,0x5251))>=R.bif)continue;
      var ss=(a+.2+.6*K.unit(K.hash(seed,a,b,0x5252)))*cs,cc=(b+.2+.6*K.unit(K.hash(seed,a,b,0x5253)))*cs,D=wl*(1.5+1.5*K.unit(K.hash(seed,a,b,0x5254)));
      R.forks.push({a:[ss,cc-D/2],b:[ss,cc+D/2],sg:K.unit(K.hash(seed,a,b,0x5255))<.5?-1:1});}
    return R;}
  // the frame: s along the flow, c across it (for a line, its arc length and the signed distance off it; m outside a line's ends)
  function rLocal0(R,x,z){if(R.form==='poly'){var cf=Math.cos(R.flow),sf=Math.sin(R.flow);return [x*cf+z*sf,-x*sf+z*cf];}
    var N=rNear(R.line,x,z);return [N.s,(N.q>=0?1:-1)*N.dist];}
  function rNear(Ln,x,z){var P=Ln.pts,S=Ln.S,best=Infinity,o={s:0,q:0,dist:0,past:0};
    for(var i=0;i+1<P.length;i++){var a=P[i],b=P[i+1],l=(S[i+1]-S[i])||1,ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,ax=x-a[0],az=z-a[1],t=ax*ux+az*uz,
      tc=t<0?0:t>l?l:t,ex=ax-ux*tc,ez=az-uz*tc,dd=Math.sqrt(ex*ex+ez*ez);
      if(dd<best-1e-9){best=dd;o.s=S[i]+tc;o.q=-uz*ax+ux*az;o.past=t<0&&i===0?-t:t>l&&i+2===P.length?t-l:0;}}
    o.dist=best;return o;}
  // metres in from the area's edge (<= 0 outside)
  function rIn(R,x,z){if(R.form==='line'){var N=rNear(R.line,x,z),L=R.line.S[R.line.S.length-1];if(N.past>0)return -N.past;return Math.min(R.line.w-N.dist,N.s,L-N.s);}
    var P=R.poly,n=P.length,ins=false,dm=Infinity;
    for(var i=0,j=n-1;i<n;j=i++){var a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])ins=!ins;dm=Math.min(dm,segDist(x,z,a,b));}
    return ins?dm:-dm;}
  // the phase, in wavelengths: s/wl, the crests' wander, and each fork's subtended angle (a jump of exactly one wavelength across
  // the inserted crest's span, so the profile is seamless; faded far off, where the angle is small and smooth)
  function forkIx(R){if(R._fx)return R._fx;var cs=8*R.wl,m={};R.forks.forEach(function(F){var k=Math.floor((F.a[0]+F.b[0])/2/cs)+','+Math.floor((F.a[1]+F.b[1])/2/cs);(m[k]=m[k]||[]).push(F);});return hidden(R,'_fx',m);}
  function rPhase(R,x,z){var K=KRq(),q=rLocal0(R,x,z),s=q[0],c=q[1],wl=R.wl,ph=s/wl+R.sinuous*2*(2*K.fbm(s/(3*wl),c/(4*wl),.5,3,R.seed+11)-1),
      M=forkIx(R),ca=Math.floor(s/(8*wl)),cb=Math.floor(c/(8*wl)),L=[];
    for(var a=ca-3;a<=ca+3;a++)for(var b=cb-3;b<=cb+3;b++){var E=M[a+','+b];if(E)L=L.concat(E);}
    for(var i=0;i<L.length;i++){var F=L[i],mx=(F.a[0]+F.b[0])/2,mz=(F.a[1]+F.b[1])/2,D=Math.hypot(F.b[0]-F.a[0],F.b[1]-F.a[1]),r=Math.hypot(s-mx,c-mz);
      if(r>6*D)continue;var ax=F.a[0]-s,az=F.a[1]-c,bx=F.b[0]-s,bz=F.b[1]-c,ang=Math.atan2(ax*bz-az*bx,ax*bx+az*bz);
      ph+=F.sg*ang/TAU*(1-sm(4*D,6*D,r));}
    return ph;}
  function rProf(R,t){var a=R.stoss;return t<a?(1-Math.cos(Math.PI*t/a))/2:(1+Math.cos(Math.PI*(t-a)/(1-a)))/2;}
  function ripplesH(R,x,z,g){g=g==null?0:g;var e=rIn(R,x,z);if(!(e>0))return g;var K=KRq(),ph=rPhase(R,x,z),t=ph-Math.floor(ph),
      q=rLocal0(R,x,z),amp=R.h*(1-R.vary+R.vary*2*K.fbm(q[0]/(2*R.wl),q[1]/(2*R.wl),.5,2,R.seed+29));
    return g+amp*(rProf(R,t)-.5)*sm(0,R.fade,e);}
  function ripplesAt(R,x,z){var e=rIn(R,x,z);if(!(e>0))return null;var ph=rPhase(R,x,z),t=ph-Math.floor(ph),a=R.stoss,
      part=Math.abs(t-a)<.06?'crest':(t<.06||t>.94)?'trough':t<a?'stoss':'lee';
    return {part:part,t:t,fade:sm(0,R.fade,e)};}

  // ---------------------------------------------------------------- the composition
  var EXT={grabenNet:[netH,netAt],ripples:[ripplesH,ripplesAt]};
  var shape0=KR.shape,at0=KR.at,kinds0=KR.kinds,waters0=KR.waters;
  KR.shape=function(R,x,z,g){var e=R&&EXT[R.kind];return e?e[0](R,x,z,g):shape0(R,x,z,g);};
  KR.at=function(R,x,z,g){var e=R&&EXT[R.kind];return e?e[1](R,x,z,g):at0(R,x,z,g);};
  KR.kinds=function(){return kinds0().concat(Object.keys(EXT));};
  KR.waters=function(R,ground){var e=R&&EXT[R.kind];if(e)return [];return waters0(R,ground);};
  KR.grabenNet=grabenNet;KR.ripples=ripples;KR._landformsNet=true;
})(typeof window!=='undefined'?window:globalThis);
