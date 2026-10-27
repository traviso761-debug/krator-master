// ================================================================= CORE — relief: ranges, volcanoes, fields and rivers
// Height and layout functions for a heightfield world, all plain maths of (x,z) and a seed: no THREE, no DOM,
// no Math.random, so the same seed gives the same land in three.js and in a Godot port (call them at export,
// or port the few lines each). The patterns come from the Mordor, Shire, Isengard and Rivendell generators
// listed in TODO.md. Axes: y up, metres, x east, z south. One shared object, KRELIEF; nothing to create.
//
//   KRELIEF.range({a:[x,z], b:[x,z], h, w, crest:.26, toe:.15, serr:.08, seed})  -> (x,z)=>height
//        a wall of mountains along a-b: w is the half-width at the foot. The cross-profile is f^crest
//        (f = 1 at the spine, 0 at the foot), so the sides are steep and the top broad; its toe is eased in
//        over `toe` of the width so the foot meets the plain without a crease; the crest is serrated by noise
//        along the spine (serr, a fraction of h), and the ends taper over one width.
//   KRELIEF.join([h1,h2,...])     where ranges meet: the tallest counts in full and the others add a quarter of
//                                 theirs, so a junction is a knot, not a stack of twice the height
//   KRELIEF.volcano({c:[x,z], h, r, k:3, crater:{r, d}, gullies:14, gully:.06, seed}) -> (x,z)=>height
//        a concave stratovolcano: an exponential flank (steep near the top, long apron), radial gullies cut
//        into the upper flank, and a sunken crater inside a rim
//   KRELIEF.fields({seed, angle:14 (deg), spacing:[100,340], warp:30, warpScale:1/600, drop:.28,
//                   kinds:[['pasture',3],['arable',2],['hay',1]]})
//        an enclosure lattice: two families of field boundaries, rotated by `angle` and bent by noise, at
//        irregular spacing; about `drop` of the hedges are missing, and a field whose west or north hedge is
//        missing takes its neighbour's kind, so neighbouring fields merge.
//        F.at(x,z)          {id:'i,j', i, j, kind, rows} (rows: the direction crop rows run, radians from +x)
//        F.hedges([x0,x1,z0,z1], step=8)  the hedges in a box: [{pts:[[x,z],...], i, j, dir:'u'|'v'}]
//   KRELIEF.river(pts, groundH, {depth:1.5, sample:8})
//        a river's water along a polyline [[x,z],...] running downstream: each vertex gets the lowest bed under
//        the channel there, and the surface never climbs downstream (y_i <= y_{i-1}). Returns
//        [{x,z,y,slope}]: slope is the drop per metre to the next vertex, for foam (whitewater where it is steep)
//   KRELIEF.noise(seed) -> {vn(x,z), fbm(x,z,oct=4)}   value noise in [0,1], hashed from integers
//
// THE LANDFORM KINDS (2026-10-26; need core/rand): each a plain record (KRAND-hashed by slot, JSON-safe), drawn by
// KRELIEF.shape(rec, x, z, g) (the height given the ground g there) and read by KRELIEF.at(rec, x, z, g) (the part:
// floor, bar, bank, fan, bench, face, wall, talus...); KRELIEF.apply(ground, [recs]) composes them. Each is documented
// at its function below.
//   KRELIEF.meander(a, b, {amp, wave, seed})   a sinuous line for a wadi, a rille or a tube
//   KRELIEF.wadi({pts, ground, w, bank, bankW, braids, pools, fan, seed})   a dry river: braided cobble floor, cut banks, a fan
//   KRELIEF.talus({footD | bodies, h, reach, seed})   Korona's apron against a wall's or a stack's foot -> (x,z)=>m
//   KRELIEF.pit({c, r, depth, benches, e, ry, face, ground | y, spoil, adits, seed})   an open-cast pit: benches, spoil, adits
//   KRELIEF.pavement({h, wadis, slope, patch, seed}) -> (x,z)=>0..1; KRELIEF.paintCover(field, name, fn, {thr, over})
//   KRELIEF.stair({a, b, steps:[{y, at}], w, lobes, slope, tongues, flows, riser, colonnade, wrinkle, seed})   the god's
//        stair: ponded flats, lobate terraced fronts, lava falls; flowTops and KRELIEF.flowAt(rec, y) (the strata hook)
//   KRELIEF.rille({pts, ground, w, depth, tops, ...})   a sinuous lava canyon, its walls stepping on the flows' tops
//   KRELIEF.tube({pts, ground, r, roof, ridge, every, p, sky, seed})   a lava tube, its pit chain, KCAVERN's passage and openings
//   KRELIEF.columns({w, jitter, angle, seed})   columnar jointing in plan: cell(x,z), relief(x,z)
//   KRELIEF.gap({a, b, w, floor, wind, ...})   a water gap or a wind gap notched through a ridge
//   KRELIEF.joints({world, angle, sp}) and KRELIEF.tableland({joints, zone, top, floor, z0, slot})   the pillar rim's table
//        (its towers: KSTACKS.pillars on the same joints and zone)
(function(root){
  'use strict';
  function hash(i,j,s){var h=Math.imul(i|0,0x27d4eb2d)^Math.imul(j|0,0x165667b1)^Math.imul(s|0,0x9e3779b1);
    h=Math.imul(h^(h>>>15),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);return ((h^(h>>>16))>>>0)/4294967296;}
  function noise(seed){
    var s=seed|0;
    function vn(x,z){var i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
      var a=hash(i,j,s),b=hash(i+1,j,s),c=hash(i,j+1,s),d=hash(i+1,j+1,s);
      return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
    function fbm(x,z,oct){var n=oct||4,t=0,amp=.5,norm=0;for(var k=0;k<n;k++){t+=amp*vn(x,z);norm+=amp;x=x*2.03+17.1;z=z*2.03-9.7;amp*=.5;}return t/norm;}
    return {vn:vn,fbm:fbm};
  }
  function clamp01(v){return v<0?0:v>1?1:v;}
  function smooth(a,b,v){var t=clamp01((v-a)/(b-a));return t*t*(3-2*t);}

  function range(o){
    var a=o.a,b=o.b,h=o.h,w=o.w,crest=o.crest===undefined?.26:o.crest,toe=o.toe===undefined?.15:o.toe;
    var serr=o.serr===undefined?.08:o.serr,N=noise(o.seed||1);
    var dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(!(L>0)||!(w>0))throw new Error('KRELIEF.range: a and b must differ and w be positive');
    var ux=dx/L,uz=dz/L;
    return function(x,z){
      var px=x-a[0],pz=z-a[1],s=px*ux+pz*uz,q=-px*uz+pz*ux;            // s along the spine, q across it
      var sc=s<0?-s:s>L?s-L:0,d=Math.hypot(sc,q);if(d>=w)return 0;
      var f=1-d/w,prof=Math.pow(f,crest)*smooth(0,toe,f);
      var crestN=1+serr*(2*N.fbm(s/(w*.35),3.7)-1);                  // serration along the spine
      var end=smooth(-w,w*.5,Math.min(s,L-s));                         // taper the ends
      return h*prof*crestN*end;
    };
  }
  function join(hs){var m=0,sum=0;for(var i=0;i<hs.length;i++){var v=hs[i]>0?hs[i]:0;sum+=v;if(v>m)m=v;}return m+.25*(sum-m);}

  function volcano(o){
    var c=o.c,h=o.h,r=o.r,k=o.k||3,N=noise(o.seed||2),ng=o.gullies===undefined?14:o.gullies,gd=o.gully===undefined?.06:o.gully;
    var cr=o.crater&&o.crater.r||r*.06,cd=o.crater&&o.crater.d||h*.08,e=Math.exp(-k);
    return function(x,z){
      var dx=x-c[0],dz=z-c[1],d=Math.hypot(dx,dz),u=d/r;if(u>=1)return 0;
      var y=h*(Math.exp(-k*u)-e)/(1-e);                                 // concave: steep top, long apron
      if(ng>0){var ang=Math.atan2(dz,dx),wob=N.fbm(ang*2+5,u*3)*2.4;
        var g=Math.pow(.5+.5*Math.cos(ang*ng+wob),3);y*=1-gd*g*smooth(.04,.35,u)*(1-smooth(.5,.9,u));}
      var ur=cr/r;if(u<ur){var rim=h*(Math.exp(-k*ur)-e)/(1-e),t=u/ur;y=rim-cd*(1-t*t);}   // the crater, sunk inside its rim
      return y;
    };
  }

  function fields(o){
    o=o||{};var seed=o.seed||3,ang=(o.angle===undefined?14:o.angle)*Math.PI/180,ca=Math.cos(ang),sa=Math.sin(ang);
    var sp=o.spacing||[100,340],S=(sp[0]+sp[1])/2,J=(sp[1]-sp[0])/2,warp=o.warp===undefined?30:o.warp,ws=o.warpScale||1/600;
    var drop=o.drop===undefined?.28:o.drop,kinds=o.kinds||[['pasture',3],['arable',2],['hay',1]],tot=0;
    kinds.forEach(function(k){tot+=k[1];});
    var Nu=noise(seed*7+1),Nv=noise(seed*7+2);
    // a line of the u family: u = Lu(i); its position jitters about i*S by up to J, so spacing runs sp[0]..sp[1]
    function Lu(i){return i*S+(hash(i,0,seed*13+1)-.5)*J;}
    function Lv(j){return j*S+(hash(0,j,seed*13+2)-.5)*J;}
    function rot(x,z){return [x*ca+z*sa,-x*sa+z*ca];}
    function unrot(u,v){return [u*ca-v*sa,u*sa+v*ca];}
    function warped(x,z){var p=rot(x,z);return [p[0]+warp*(2*Nu.fbm(x*ws,z*ws)-1),p[1]+warp*(2*Nv.fbm(x*ws+31,z*ws-17)-1)];}
    function cellOf(t,L){var i=Math.floor(t/S);while(L(i)>t)i--;while(L(i+1)<=t)i++;return i;}
    function hedgeU(i,j){return hash(i,j,seed*13+3)>=drop;}           // the hedge on line u=Lu(i), beside cell row j
    function hedgeV(i,j){return hash(i,j,seed*13+4)>=drop;}
    function kindOf(i,j,depth){
      if(depth<8){if(!hedgeU(i,j))return kindOf(i-1,j,depth+1);if(!hedgeV(i,j))return kindOf(i,j-1,depth+1);}
      var t=hash(i,j,seed*13+5)*tot;for(var k=0;k<kinds.length;k++){t-=kinds[k][1];if(t<0)return [kinds[k][0],i,j];}
      return [kinds[kinds.length-1][0],i,j];
    }
    function at(x,z){var w=warped(x,z),i=cellOf(w[0],Lu),j=cellOf(w[1],Lv),k=kindOf(i,j,0);
      var rows=ang+(hash(k[1],k[2],seed*13+6)<.5?0:Math.PI/2);
      return {id:k[1]+','+k[2],i:i,j:j,kind:k[0],rows:rows};}
    // a world point on the warped line (family 'u': warped u == c) at unwarped coordinate v
    function onLine(fam,c,v){
      var u=c,p;for(var it=0;it<6;it++){p=fam==='u'?unrot(u,v):unrot(v,u);var w=warped(p[0],p[1]);u+=c-(fam==='u'?w[0]:w[1]);}
      return fam==='u'?unrot(u,v):unrot(v,u);
    }
    function hedges(box,step){
      var st=step||8,out=[],corners=[rot(box[0],box[2]),rot(box[1],box[2]),rot(box[0],box[3]),rot(box[1],box[3])];
      var u0=Infinity,u1=-Infinity,v0=Infinity,v1=-Infinity;
      corners.forEach(function(p){u0=Math.min(u0,p[0]);u1=Math.max(u1,p[0]);v0=Math.min(v0,p[1]);v1=Math.max(v1,p[1]);});
      u0-=warp;u1+=warp;v0-=warp;v1+=warp;
      function inBox(p){return p[0]>=box[0]&&p[0]<=box[1]&&p[1]>=box[2]&&p[1]<=box[3];}
      ['u','v'].forEach(function(fam){
        var L=fam==='u'?Lu:Lv,M=fam==='u'?Lv:Lu,a0=fam==='u'?u0:v0,a1=fam==='u'?u1:v1,b0=fam==='u'?v0:u0,b1=fam==='u'?v1:u1;
        for(var i=cellOf(a0,L);L(i)<=a1;i++)for(var j=cellOf(b0,M);M(j)<=b1;j++){
          if(!(fam==='u'?hedgeU(i,j):hedgeV(j,i)))continue;
          var s0=M(j),s1=M(j+1),n=Math.max(2,Math.ceil((s1-s0)/st)),pts=[];
          for(var k=0;k<=n;k++){var p=onLine(fam,L(i),s0+(s1-s0)*k/n);if(inBox(p))pts.push(p);else if(pts.length>1){out.push({pts:pts,i:fam==='u'?i:j,j:fam==='u'?j:i,dir:fam});pts=[];}else pts=[];}
          if(pts.length>1)out.push({pts:pts,i:fam==='u'?i:j,j:fam==='u'?j:i,dir:fam});}
      });
      return out;
    }
    return {at:at,hedges:hedges};
  }

  function river(pts,groundH,o){
    o=o||{};var depth=o.depth===undefined?1.5:o.depth,sample=o.sample===undefined?8:o.sample,out=[],prev=Infinity;
    for(var i=0;i<pts.length;i++){var p=pts[i],q=pts[Math.min(i+1,pts.length-1)],r=pts[Math.max(i-1,0)];
      var tx=q[0]-r[0],tz=q[1]-r[1],tl=Math.hypot(tx,tz)||1,nx=-tz/tl,nz=tx/tl,bed=Infinity;
      for(var k=-2;k<=2;k++)bed=Math.min(bed,groundH(p[0]+nx*sample*k/2,p[1]+nz*sample*k/2));
      var y=Math.min(prev,bed+depth);out.push({x:p[0],z:p[1],y:y,slope:0});prev=y;}
    for(var i2=0;i2+1<out.length;i2++){var A=out[i2],B=out[i2+1],L=Math.hypot(B.x-A.x,B.z-A.z)||1;A.slope=(A.y-B.y)/L;}
    if(out.length>1)out[out.length-1].slope=out[out.length-2].slope;
    return out;
  }

  // ================================================================= THE DRY, THE VOLCANIC AND THE FOLDED FORMS (2026-10-26)
  // For the planned biomes: the outlands' C4 (biomes/outlands/PLAN.md section 12), Godstep's flows (biomes/godstep/PLAN.md
  // section 4) and the SW highlands' folds and tableland (biomes/swhighlands/PLAN.md section 4). Each form is a RECORD
  // first (plain data, JSON-safe: every draw from core/rand's KRAND.hash of (seed, slot index, salt), never from how many
  // draws came before it), then the ground it leaves: KRELIEF.shape(rec, x, z, g) -> the height at (x,z) given the ground g
  // there, and KRELIEF.at(rec, x, z, g) -> what part of the form (x,z) is on (for cover, strata and placement), or null.
  // These forms need core/rand loaded; the older functions above still need nothing.
  var TAU=Math.PI*2;
  function KRq(){var K=root.KRAND;if(!K)throw new Error('KRELIEF: the landform kinds need core/rand (08-core-rand.js) loaded first');return K;}
  function u01(K,seed,a,b,c){return K.unit(K.hash(seed,a,b,c));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function hidden(R,k,v){Object.defineProperty(R,k,{value:v,enumerable:false,configurable:true,writable:true});return v;}   // a cache JSON leaves out
  // a polyline [[x,z],...] indexed for nearest-point queries: its segments bucketed on a grid, each bucket holding every
  // segment within `reach` of it. near(x,z) -> {i, t, s (arc length), q (signed across: + on the side of n = (-uz, ux), u
  // the flow's direction), d (the distance to the line), end (-1 before its start, 1 past its end, else 0)} or null
  function polyIndex(P,reach){
    var n=P.length,S=[0],i;for(i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    var C=Math.max(16,reach),G=new Map();
    for(i=0;i+1<n;i++){var a=P[i],b=P[i+1],x0=Math.floor((Math.min(a[0],b[0])-reach)/C),x1=Math.floor((Math.max(a[0],b[0])+reach)/C),z0=Math.floor((Math.min(a[1],b[1])-reach)/C),z1=Math.floor((Math.max(a[1],b[1])+reach)/C);
      for(var gx=x0;gx<=x1;gx++)for(var gz=z0;gz<=z1;gz++){var k=gx+','+gz,L=G.get(k);if(!L)G.set(k,L=[]);L.push(i);}}
    function near(x,z){var L=G.get(Math.floor(x/C)+','+Math.floor(z/C));if(!L)return null;var best=null,bd=Infinity;
      for(var m=0;m<L.length;m++){var j=L[m],a=P[j],b=P[j+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=((x-a[0])*dx+(z-a[1])*dz)/l2;
        var tc=t<0?0:t>1?1:t,d=Math.hypot(x-a[0]-dx*tc,z-a[1]-dz*tc);if(d<bd-1e-9){bd=d;best=[j,tc,t,dx,dz];}}
      if(!best||bd>reach)return null;var j2=best[0],l=Math.sqrt(best[3]*best[3]+best[4]*best[4])||1,ux=best[3]/l,uz=best[4]/l,a2=P[j2];
      var end=j2===0&&best[2]<0?-1:j2===n-2&&best[2]>1?1:0;
      return {i:j2,t:best[1],s:S[j2]+best[1]*l,q:-uz*(x-a2[0])+ux*(z-a2[1]),d:bd,end:end,ux:ux,uz:uz};}
    return {near:near,S:S,L:S[n-1]};}
  function ptsXZ(R){return R.pts.map(function(p){return [p.x,p.z];});}
  function idx(R){return R._ix||hidden(R,'_ix',polyIndex(ptsXZ(R),R.reach));}
  function along(R,k,p){var a=R.pts[p.i],b=R.pts[Math.min(p.i+1,R.pts.length-1)];return lerp(a[k],b[k],p.t);}
  // a channel's floor along a polyline: at each vertex the lowest ground across it (5 samples over +-half) less depth, and
  // never climbing downstream (river's rule)
  function bedLevels(P,g,half,depth){var out=[],prev=Infinity;
    for(var i=0;i<P.length;i++){var p=P[i],q=P[Math.min(i+1,P.length-1)],r=P[Math.max(i-1,0)],tx=q[0]-r[0],tz=q[1]-r[1],tl=Math.hypot(tx,tz)||1,nx=-tz/tl,nz=tx/tl,lo=Infinity;
      for(var k=-2;k<=2;k++)lo=Math.min(lo,g(p[0]+nx*half*k/2,p[1]+nz*half*k/2));var y=Math.min(prev,lo-depth);out.push(y);prev=y;}
    return out;}
  function needPts(o,name){if(!o||!o.pts||o.pts.length<2)throw new Error('KRELIEF.'+name+': pts needs two points or more');if(!o.ground)throw new Error('KRELIEF.'+name+': ground(x,z) is needed (the form is set into it)');}

  // ---------------------------------------------------------------- KRELIEF.meander(a, b, {amp, wave, step, seed})
  // a sinuous line from a to b, [[x,z],...]: amp the swing either side (m, L*.06), wave its length along the line (L/5); two
  // trains of bends of hashed phase and length plus value noise, eased to nothing at both ends (a and b stay put)
  function meander(a,b,o){o=o||{};var K=KRq(),seed=(o.seed==null?1:o.seed)>>>0,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
    if(!(L>0))throw new Error('KRELIEF.meander: a and b must differ');
    var amp=o.amp==null?L*.06:o.amp,wave=o.wave==null?L/5:o.wave,st=o.step==null?Math.max(2,wave/16):o.step,n=Math.max(2,Math.ceil(L/st)),ux=dx/L,uz=dz/L,out=[];
    var p1=u01(K,seed,1,0,0x3E1)*TAU,p2=u01(K,seed,2,0,0x3E1)*TAU,w2=wave*(.37+.2*u01(K,seed,3,0,0x3E1));
    for(var i=0;i<=n;i++){var s=L*i/n,f=i/n,env=smooth(0,.15,f)*smooth(1,.85,f);
      var off=amp*env*(.7*Math.sin(TAU*s/wave+p1)+.3*Math.sin(TAU*s/w2+p2)+.4*(2*K.fbm(s/wave*2,.5,3.5,2,seed)-1));
      out.push([a[0]+ux*s-uz*off,a[1]+uz*s+ux*off]);}
    return out;}

  // ---------------------------------------------------------------- KRELIEF.wadi: a dry river (the outlands' Z7, C4)
  // KRELIEF.wadi({pts (downstream), ground, w (12: the floor's half-width), bank (2.5: the cut, m below the lowest ground
  //   across), bankW (3: the bank's run; the outer bank of a bend a third of it, cut steep, the inner, a point bar, twice),
  //   braids (2.5 bars per 100 m), barH:[.3,.9], pools (.3: the chance of a pool every 300 m), fan:{r, slope (.035), spread
  //   (.9 rad either side), channels (3..5)} | false, seed})
  //   -> {kind:'wadi', pts:[{x,z,y (the floor), w, bL, bR (the bank's run on the +n and -n sides)}], bars:[slot -> {s, q, len,
  //       wid, h} | null], barSp, pools:[{x, z, s, q, r, d, y (the water after rain)}], fan:{x, z, y (the apex), r, dir, spread,
  //       slope, lift, ch:[angle offsets]} | null, reach}
  //   The floor is cobble, braided by lens-shaped gravel bars between the channels; it never climbs downstream (river's rule).
  //   The fan is the bajada's piece: where the wadi leaves its wall the floor spills on to a cone of fill falling `slope`
  //   from the apex, raised over the plain only where its surface stands above the ground, its distributaries cut into it
  function wadi(o){var K=KRq();needPts(o,'wadi');
    var P=o.pts,seed=(o.seed==null?1:o.seed)>>>0,w=o.w==null?12:o.w,bank=o.bank==null?2.5:o.bank,bw=o.bankW==null?3:o.bankW;
    var Y=bedLevels(P,o.ground,w+bw,bank),IX=polyIndex(P,1),S=IX.S,L=IX.L,n=P.length;
    var turn=P.map(function(p,i){if(i===0||i===n-1)return 0;var a=P[i-1],b=P[i+1],ax=p[0]-a[0],az=p[1]-a[1],bx=b[0]-p[0],bz=b[1]-p[1];return Math.atan2(ax*bz-az*bx,ax*bx+az*bz);});
    var pts=P.map(function(p,i){var tr=(turn[Math.max(0,i-1)]+2*turn[i]+turn[Math.min(n-1,i+1)])/4,c=clamp01(Math.abs(tr)/.35);
      var ww=w*(1+.25*(2*K.fbm(S[i]/90,1.5,.5,2,seed)-1)),inner=bw*(1+1.2*c),outer=bw*(1-.65*c);   // the bend turns toward +n when tr > 0: its outer bank is -n
      return {x:p[0],z:p[1],y:Y[i],w:ww,bL:tr>0?inner:outer,bR:tr>0?outer:inner};});
    var br=o.braids==null?2.5:o.braids,sp=br>0?100/br:0,bh=o.barH||[.3,.9],bars=[];
    if(sp>0)for(var k=0;k*sp<L;k++){var r=KR_s(K,seed,k,0x7A1);if(!r.chance(.8)){bars.push(null);continue;}
      bars.push({s:(k+r.next())*sp,q:(2*r.next()-1)*.6*w,len:sp*(.45+.6*r.next()),wid:w*(.18+.25*r.next()),h:bh[0]+(bh[1]-bh[0])*r.next()});}
    var R={kind:'wadi',seed:seed,pts:pts,bars:bars,barSp:sp,pools:[],fan:null,reach:0};
    var pp=o.pools==null?.3:o.pools;
    for(k=0;k*300<L;k++){var rp=KR_s(K,seed,k,0x7A3);if(!rp.chance(pp))continue;var s=(k+.15+.7*rp.next())*300;if(s>=L)continue;
      var at=atS(S,s),q=(2*rp.next()-1)*.3*w,pr=w*(.25+.25*rp.next()),pd=.35+.3*rp.next(),a=P[at.i],b=P[at.i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l;
      var px=lerp(a[0],b[0],at.t)-uz*q,pz=lerp(a[1],b[1],at.t)+ux*q,fy=lerp(Y[at.i],Y[at.i+1],at.t);
      R.pools.push({x:px,z:pz,s:s,q:q,r:pr,d:pd,y:fy-pd*.3});}
    if(o.fan!==false){var F=o.fan||{},e=P[n-1],e0=P[n-2],fl=Math.hypot(e[0]-e0[0],e[1]-e0[1])||1,rf=KR_s(K,seed,0,0x7A5),nc=F.channels==null?rf.int(3,5):F.channels,ch=[];
      var spread=F.spread==null?.9:F.spread;for(var c2=0;c2<nc;c2++)ch.push((2*rf.next()-1)*spread*.8);
      R.fan={x:e[0],z:e[1],y:Y[n-1],r:F.r==null?Math.max(8*w,120):F.r,dir:Math.atan2(e[1]-e0[1],e[0]-e0[0]),spread:spread,slope:F.slope==null?.035:F.slope,lift:bank*.6,ch:ch,cw:w*.4};}
    R.reach=w*1.3+bw*2.4+2;return R;}
  function KR_s(K,seed,k,salt){return K.stream(K.hash(seed,k,salt));}
  function atS(S,s){var lo=0,hi=S.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(S[m]<=s)lo=m;else hi=m;}return {i:lo,t:(s-S[lo])/((S[lo+1]-S[lo])||1)};}
  function wadiBars(R,s,q){if(!R.barSp)return 0;var k0=Math.floor(s/R.barSp),h=0;
    for(var k=k0-1;k<=k0+1;k++){var b=R.bars[k];if(!b)continue;var u=(s-b.s)/(b.len/2),v=(q-b.q)/(b.wid/2),r2=u*u+v*v;if(r2<1){var f=1-r2;h=Math.max(h,b.h*f*f);}}
    return h;}
  function wadiPools(R,x,z){var d=0;for(var i=0;i<R.pools.length;i++){var p=R.pools[i],dd=Math.hypot(x-p.x,z-p.z);if(dd<p.r){var f=1-(dd/p.r)*(dd/p.r);d=Math.max(d,p.d*f);}}return d;}
  function fanAt(F,x,z,g){if(!F)return null;var dx=x-F.x,dz=z-F.z,d=Math.hypot(dx,dz);if(d>=F.r)return null;
    var da=Math.atan2(Math.sin(Math.atan2(dz,dx)-F.dir),Math.cos(Math.atan2(dz,dx)-F.dir)),wa=smooth(F.spread,F.spread*.6,Math.abs(da));if(wa<=0)return null;
    var surf=F.y+F.lift-d*F.slope,dep=(surf-g)*wa*(1-smooth(.7*F.r,F.r,d));if(dep<=0)return null;
    var act=0;for(var i=0;i<F.ch.length;i++){var off=Math.abs(Math.sin(da-F.ch[i]))*d;act=Math.max(act,Math.exp(-(off/F.cw)*(off/F.cw)));}
    return {dep:dep-Math.min(dep,.45*act*(1-d/F.r)),active:act};}
  function wadiH(R,x,z,g){var p=idx(R).near(x,z),y=g;
    if(p){var a=R.pts[p.i],b=R.pts[Math.min(p.i+1,R.pts.length-1)],fy=lerp(a.y,b.y,p.t),ww=lerp(a.w,b.w,p.t),bq=p.q>=0?lerp(a.bL,b.bL,p.t):lerp(a.bR,b.bR,p.t);
      var e=(p.end?p.d:Math.abs(p.q))-ww,surf=fy+wadiBars(R,p.s,p.q)-wadiPools(R,x,z);
      if(e<=0)y=Math.min(g,surf);else if(e<bq&&g>surf)y=surf+(g-surf)*smooth(0,1,e/bq);}
    var f=fanAt(R.fan,x,z,g);if(f)y=Math.max(y,g+f.dep);
    return y;}
  function wadiAt(R,x,z,g){var p=idx(R).near(x,z);
    if(p){var a=R.pts[p.i],b=R.pts[Math.min(p.i+1,R.pts.length-1)],ww=lerp(a.w,b.w,p.t),bq=p.q>=0?lerp(a.bL,b.bL,p.t):lerp(a.bR,b.bR,p.t),e=(p.end?p.d:Math.abs(p.q))-ww;
      if(e<=0){if(wadiPools(R,x,z)>.02)return {part:'pool',s:p.s,q:p.q,cobble:0};var bh=wadiBars(R,p.s,p.q);return {part:bh>.05?'bar':'floor',s:p.s,q:p.q,cobble:bh>.05?.6:1};}
      if(e<bq)return {part:'bank',s:p.s,q:p.q,cobble:.3,outer:bq<(a.bL+a.bR+b.bL+b.bR)/4};}
    var f=fanAt(R.fan,x,z,g==null?-Infinity:g);if(f)return {part:'fan',active:f.active,cobble:.5*f.active};
    return null;}

  // ---------------------------------------------------------------- KRELIEF.talus: aprons against walls and stacks
  // lifted from Korona (biomes/korona/src/47-host-land.js, `talus`): the rock's fall banked up against a wall's foot, the
  // wall going down into it. KRELIEF.talus({footD | bodies, h (30), reach (55), curve (1.6), rough (.5), scale (.012), seed})
  //   -> (x,z) => metres to add to the floor. footD(x,z) is the signed distance to the wall's foot (KSTACKS.foot's d; a
  //   page's own for a heightfield scarp); bodies (KSTACKS records) builds it from KSTACKS.foot. Korona's own is h 30, reach
  //   55 (its cut at 60 is past reach: the apron is 0 there anyway)
  function talus(o){var K=KRq();o=o||{};var fd=o.footD;
    if(!fd&&o.bodies){var KS=root.KSTACKS;if(!KS)throw new Error('KRELIEF.talus: bodies need core/terrain/37-core-stacks.js loaded');var list=o.bodies;fd=function(x,z){var f=KS.foot(list,x,z);return f?f.d:Infinity;};}
    if(!fd)throw new Error('KRELIEF.talus: give footD(x,z) or bodies');
    var h=o.h==null?30:o.h,reach=o.reach==null?55:o.reach,cv=o.curve==null?1.6:o.curve,rg=o.rough==null?.5:o.rough,sc=o.scale==null?.012:o.scale,seed=(o.seed==null?44:o.seed)>>>0;
    return function(x,z){var d=fd(x,z);if(!(d<reach))return 0;return h*Math.pow(smooth(reach,0,d),cv)*(1-rg/2+rg*K.fbm(x*sc,z*sc,.5,2,seed));};}

  // ---------------------------------------------------------------- KRELIEF.pit: open-cast workings (the gem hills, S4)
  // KRELIEF.pit({c:[x,z], r (120: the rim's radius along its long axis... a mean radius, the ellipse e about it), depth (r/2),
  //   benches (one per ~10 m of depth, not counting the floor), e (1.25), ry (drawn), face (65 deg), floorR (r*.18), ground | y (the rim), lob (.03),
  //   spoil:{n (2..5), dist:[1.3,2], r:[.2,.4] of r, h:[6,18]} | false, adits (0..2 drawn), seed})
  //   -> {kind:'pit', c, r, e, ry, rimY, depth, n, dy, run, bw, floorR, lob, seed, spoil:[{x,z,r,h}], adits:[{x,y,z,nx,nz,k}]}
  //   Benches step down from the rim: a face falling dy over run (face's angle), a flat bench bw wide, n times, then the last
//   face to the floor.
  //   The first face starts at the ground itself, so the rim has no step. Spoil heaps are tipped outside the rim (flat tops,
  //   sides at 36 degrees), on the ground; an adit is a point on a face with its normal, for KCARVE to drive
  function pit(o){var K=KRq();if(!o||!o.c)throw new Error('KRELIEF.pit: c is needed');
    var seed=(o.seed==null?1:o.seed)>>>0,c=o.c,r=o.r==null?120:o.r,D=o.depth==null?r*.5:o.depth,n=o.benches==null?Math.max(2,Math.round(D/10)):o.benches;
    var e=o.e==null?1.25:o.e,ry=o.ry==null?u01(K,seed,0,0,0x9B0)*TAU:o.ry,face=(o.face==null?65:o.face)*Math.PI/180,rf=o.floorR==null?r*.18:o.floorR;
    var dy=D/(n+1),run=dy/Math.tan(face),bw=(r-rf-(n+1)*run)/n;   // n benches between n+1 faces, the last face down to the floor
    if(!(bw>=1.5))throw new Error('KRELIEF.pit: '+n+' benches of '+dy.toFixed(1)+' m do not fit a '+r+' m pit (each bench '+bw.toFixed(2)+' m wide): fewer benches, a gentler face or a wider pit');
    var R={kind:'pit',seed:seed,c:[c[0],c[1]],r:r,e:e,ry:ry,rimY:0,depth:D,n:n,dy:dy,run:run,bw:bw,floorR:rf,lob:o.lob==null?.03:o.lob,spoil:[],adits:[]};
    if(o.y!=null)R.rimY=o.y;else if(o.ground){var lo=Infinity;for(var i=0;i<48;i++){var a=i/48*TAU,q=ellPt(R,a,r);lo=Math.min(lo,o.ground(q[0],q[1]));}R.rimY=lo;}
    else throw new Error('KRELIEF.pit: ground(x,z) or y (the rim) is needed');
    if(o.spoil!==false){var SP=o.spoil||{},rs=KR_s(K,seed,0,0x9B1),ns=SP.n==null?rs.int(2,5):SP.n,dr=SP.dist||[1.3,2],rr=SP.r||[.2,.4],hr=SP.h||[6,18];
      for(var t=0;t<ns;t++){for(var tr=0;tr<8;tr++){var s2=KR_s(K,seed,t*8+tr,0x9B2),ang=s2.next()*TAU,dd=r*(dr[0]+(dr[1]-dr[0])*s2.next()),rad=r*(rr[0]+(rr[1]-rr[0])*s2.next()),hh=hr[0]+(hr[1]-hr[0])*s2.next();
          var pc=ellPt(R,ang,dd),ok=pitRho(R,pc[0],pc[1])-rad>r*1.05;
          for(var m=0;m<R.spoil.length&&ok;m++)if(Math.hypot(R.spoil[m].x-pc[0],R.spoil[m].z-pc[1])<R.spoil[m].r+rad)ok=false;
          if(ok){R.spoil.push({x:pc[0],z:pc[1],r:rad,h:Math.min(hh,rad*.7)});break;}}}}
    var na=o.adits==null?KR_s(K,seed,0,0x9B3).int(0,2):o.adits;
    for(t=0;t<na;t++){var s3=KR_s(K,seed,t,0x9B4),kk=Math.min(n,1+Math.floor(s3.next()*n)),an=s3.next()*TAU,lb=pitLob(R,an,K),rho=(r-kk*(run+bw)-run*.5)/lb;
      var p3=ellPt(R,an,rho),y3=R.rimY-kk*dy-dy*.5,nx=c[0]-p3[0],nz=c[1]-p3[1],nl=Math.hypot(nx,nz)||1;R.adits.push({x:p3[0],y:y3,z:p3[1],nx:nx/nl,nz:nz/nl,k:kk});}
    return R;}
  // the pit's frame: an ellipse of semi-axes r*sqrt(e) along ry and r/sqrt(e) across, rho = r on its rim
  function ellPt(R,a,rho){var se=Math.sqrt(R.e),lx=Math.cos(a)*rho*se,lz=Math.sin(a)*rho/se,c=Math.cos(R.ry),s=Math.sin(R.ry);return [R.c[0]+lx*c-lz*s,R.c[1]+lx*s+lz*c];}
  function pitLocal(R,x,z){var dx=x-R.c[0],dz=z-R.c[1],c=Math.cos(R.ry),s=Math.sin(R.ry),lx=dx*c+dz*s,lz=-dx*s+dz*c,se=Math.sqrt(R.e);return [lx/se,lz*se];}
  function pitLob(R,a,K){return 1+R.lob*(2*K.fbm(Math.cos(a)*2+5,Math.sin(a)*2+5,.5,2,R.seed)-1);}
  function pitRho(R,x,z){var l=pitLocal(R,x,z);return Math.hypot(l[0],l[1]);}
  function spoilH(R,x,z){var h=0;for(var i=0;i<R.spoil.length;i++){var S2=R.spoil[i],d=Math.hypot(x-S2.x,z-S2.z);if(d<S2.r)h=Math.max(h,Math.min(S2.h,(S2.r-d)*.73));}return h;}
  function pitProf(R,x,z,g){var K=KRq(),l=pitLocal(R,x,z),rho=Math.hypot(l[0],l[1])*pitLob(R,Math.atan2(l[1],l[0]),K),de=R.r-rho;if(de<=0)return null;
    var per=R.run+R.bw,m=Math.min(R.n,Math.floor(de/per)),f=de-m*per;if(m===R.n&&f>=R.run)return {y:R.rimY-R.depth,part:'floor',k:R.n};
    var top=m===0?Math.max(g,R.rimY):R.rimY-m*R.dy;
    if(f<R.run)return {y:top+(R.rimY-(m+1)*R.dy-top)*(f/R.run),part:'face',k:m};return {y:R.rimY-(m+1)*R.dy,part:'bench',k:m};}
  function pitH(R,x,z,g){var dx=x-R.c[0],dz=z-R.c[1],B=R.r*Math.sqrt(R.e)*2.5+R.r;if(dx>B||dx<-B||dz>B||dz<-B)return g;
    var p=pitProf(R,x,z,g);if(p)return Math.min(g,p.y);return g+spoilH(R,x,z);}
  function pitAt(R,x,z,g){var p=pitProf(R,x,z,g==null?R.rimY:g);if(p)return {part:p.part,k:p.k};return spoilH(R,x,z)>0?{part:'spoil'}:null;}

  // ---------------------------------------------------------------- KRELIEF.pavement and KRELIEF.paintCover
  // desert pavement (the outlands' N2): packed, varnished pebbles on old flat ground: where the slope is under slope[0]
  // (.06) in full, none past slope[1] (.18), never in a wadi's channel or bank or an active fan channel, in patches (patch:
  // the share left bare, .45, at scale 1/90). KRELIEF.pavement({h (the finished ground), ground (the ground under the wadis' fill: h if
//   not given), slope, wadis:[rec], patch, scale, step (3), seed})
  //   -> (x,z) => 0..1. KRELIEF.paintCover(field, name, fn, {thr:.5, over:[names] (only class 0 by default)}) writes a
  //   class into a KFIELD's cover grid where fn >= thr: the class is added to coverNames (['none'] made first if the field
  //   has none), and only cells of the `over` classes are written. -> {id, n (cells written)}
  function pavement(o){var K=KRq();if(!o||!o.h)throw new Error('KRELIEF.pavement: h(x,z) is needed');
    var h=o.h,g0=o.ground||h,st=o.step==null?3:o.step,s0=o.slope?o.slope[0]:.06,s1=o.slope?o.slope[1]:.18,sc=o.scale==null?1/90:o.scale,pa=o.patch==null?.45:o.patch,W=o.wadis||[],seed=(o.seed==null?5:o.seed)>>>0;
    return function(x,z){var gx=(h(x+st,z)-h(x-st,z))/(2*st),gz=(h(x,z+st)-h(x,z-st))/(2*st),f=1-smooth(s0,s1,Math.hypot(gx,gz));if(f<=0)return 0;
      for(var i=0;i<W.length;i++){var a=wadiAt(W[i],x,z,g0(x,z));if(!a)continue;if(a.part!=='fan')return 0;f*=1-smooth(.3,.7,a.active);}
      return f*smooth(pa-.12,pa+.12,K.fbm(x*sc,z*sc,7.5,3,seed));};}
  function paintCover(F,name,fn,o){o=o||{};if(!F||!F.setCover)throw new Error('KRELIEF.paintCover: a KFIELD field is needed');
    var thr=o.thr==null?.5:o.thr,names=F.coverNames?F.coverNames.slice():['none'],id=names.indexOf(name);if(id<0){id=names.length;names.push(name);}
    if(id>255)throw new Error('KRELIEF.paintCover: a cover grid holds 256 classes');
    var over=(o.over||[names[0]]).map(function(n2){return names.indexOf(n2);}),C=F.cover?new Uint8Array(F.cover):new Uint8Array(F.nx*F.nz),cnt=0;
    for(var j=0;j<F.nz;j++)for(var i=0;i<F.nx;i++){var k=j*F.nx+i;if(over.indexOf(C[k])<0)continue;if(fn(F.x0+i*F.step,F.z0+j*F.step)>=thr){C[k]=id;cnt++;}}
    F.setCover(C,names);return {id:id,n:cnt};}

  // ---------------------------------------------------------------- KRELIEF.stair: the god's stair (Godstep's flow fronts)
  // KRELIEF.stair({a:[x,z] (the head), b:[x,z] (the low end), steps:[{y (its floor), at (m along a->b: its lip)}] from the
  //   head down, w (the valley's half-width across: tongues are drawn over +-w; L/2), lobes:{amp (120), wave (700)}, slope
  //   (32 deg: a front's face), tongues:{per (1.2 per km of front), len:[150,600], w:[60,200]}, flows:[6,25] (each flow's
  //   thickness), riser (.3: the share of a flow's run its own lobe front takes: the front is terraced, a bench on each flow's
//   top; 0 a smooth slope), colonnade (.4: a flow's lower share that cools into columns), wrinkle (1.5 m: the mare floors' low ridges),
  //   seed})
  //   -> {kind:'stair', a, b, L, w, steps:[{y, at, D (its drop to the next), run, ph, tongues:[{q, w, len}]}], lobes, wrinkle,
  //       flowTops:[ascending y], colonnade, seed}
  //   Each step's floor is a flat ponded flow; its front is lobate (the lip wanders by amp over wave, across the valley) and
  //   drops D over run, rounded at the lip and eased at the toe; a TONGUE is where the flow poured over the next lip: there
  //   the front runs out `len` further as a frozen lava fall. shape(rec, x, z, g) is max(g, the flows): older ground
  //   standing above the flows (a kipuka) stands out. flowTops are the tops of the flows in the pile, each step's floor one of
  //   them: a rille's walls step on them (KRELIEF.rille tops), and KRELIEF.flowAt(rec, y) says which flow y is in and whether
  //   in its colonnade or its entablature (THE STRATA HOOK for columnar tibasalt: a strata recipe can take the same tops)
  function stair(o){var K=KRq();if(!o||!o.a||!o.b||!o.steps||!o.steps.length)throw new Error('KRELIEF.stair: a, b and steps are needed');
    var seed=(o.seed==null?1:o.seed)>>>0,L=Math.hypot(o.b[0]-o.a[0],o.b[1]-o.a[1]);if(!(L>0))throw new Error('KRELIEF.stair: a and b must differ');
    var w=o.w==null?L/2:o.w,lb=o.lobes||{},amp=lb.amp==null?120:lb.amp,wave=lb.wave==null?700:lb.wave,sl=(o.slope==null?32:o.slope)*Math.PI/180;
    var TG=o.tongues||{},per=TG.per==null?1.2:TG.per,tl=TG.len||[150,600],tw=TG.w||[60,200],st=o.steps,out=[];
    for(var i=0;i<st.length;i++){if(i&&!(st[i].y<st[i-1].y&&st[i].at>st[i-1].at))throw new Error('KRELIEF.stair: steps run from the head down: each lower (y) and further (at) than the last');
      var D=i<st.length-1?st[i].y-st[i+1].y:0,run=D/Math.tan(sl),tg=[],sp=1000/Math.max(1e-6,per);
      if(i<st.length-1&&per>0)for(var k=0;k*sp<2*w;k++){var r=KR_s(K,seed,i*4096+k,0x57A);if(!r.chance(.6))continue;tg.push({q:-w+(k+r.next())*sp,w:tw[0]+(tw[1]-tw[0])*r.next(),len:tl[0]+(tl[1]-tl[0])*r.next()});}
      out.push({y:st[i].y,at:st[i].at,D:D,run:run,ph:u01(K,seed,i,0,0x57B)*97,tongues:tg});}
    var fr=o.flows||[6,25],tops=[],lo=st[st.length-1].y-200;
    for(var j=st.length-1;j>=0;j--){var y0=j===st.length-1?lo:st[j+1].y,y1=st[j].y,yy=y0,m=0;
      while(yy<y1-1e-6){var hgt=fr[0]+(fr[1]-fr[0])*u01(K,seed,j,m++,0x57C);if(y1-yy-hgt<fr[0]*.5)hgt=y1-yy;yy=Math.min(y1,yy+hgt);tops.push(yy);}}
    return {kind:'stair',seed:seed,a:[o.a[0],o.a[1]],b:[o.b[0],o.b[1]],L:L,w:w,steps:out,lobes:{amp:amp,wave:wave},wrinkle:o.wrinkle==null?1.5:o.wrinkle,flowTops:tops,flowBase:lo,colonnade:o.colonnade==null?.4:o.colonnade,riser:o.riser==null?.3:o.riser};}
  function stairSQ(R,x,z){var ux=(R.b[0]-R.a[0])/R.L,uz=(R.b[1]-R.a[1])/R.L,dx=x-R.a[0],dz=z-R.a[1];return [dx*ux+dz*uz,-uz*dx+ux*dz];}
  function stairProf(R,x,z){var K=KRq(),sq=stairSQ(R,x,z),s=sq[0],q=sq[1],N=R.steps.length;
    for(var i=0;i<N;i++){var T=R.steps[i],F=T.at+R.lobes.amp*(2*K.fbm(q/R.lobes.wave+T.ph,.5,i+.5,2,R.seed)-1);
      if(i===N-1||s<=F)return {i:i,part:'top',y:T.y+(R.wrinkle?R.wrinkle*Math.pow(1-Math.abs(2*K.fbm(x/400,z/400,i+.5,2,R.seed+1)-1),3):0)};
      var run=T.run,tg=0;for(var k=0;k<T.tongues.length;k++){var t=T.tongues[k],v=(q-t.q)/t.w,g=Math.exp(-v*v);if(g>tg)tg=g;run+=t.len*g;}
      if(s<=F+run){var u=(s-F)/run,y=R.steps[i+1].y+T.D*(1-smooth(0,1,u));
        if(R.riser>0&&tg<1)y=lerp(terrace(R,y),y,tg);   // the front's own flows: a bench on each top, a steep lobe front below it; smooth on a lava fall
        return {i:i,part:tg>.5?'tongue':'front',y:y};}}
    return null;}
  function terrace(R,y){var T=R.flowTops,lo=R.flowBase;for(var k=0;k<T.length;k++)if(y<=T[k]){var y0=k?T[k-1]:lo,u=(y-y0)/(T[k]-y0);return y0+(T[k]-y0)*smooth(1-R.riser,1,u);}return y;}
  function stairH(R,x,z){return stairProf(R,x,z).y;}
  function flowAt(R,y){var T=R.flowTops,lo=R.flowBase;if(y<lo)return null;for(var k=0;k<T.length;k++){if(y<=T[k]){var y0=k?T[k-1]:lo;return {k:k,y0:y0,y1:T[k],part:(y-y0)/(T[k]-y0)<R.colonnade?'colonnade':'entablature'};}}return null;}

  // ---------------------------------------------------------------- KRELIEF.rille: a sinuous lava-carved canyon (dry)
  // Hadley's kind: KRELIEF.rille({pts (downstream: KRELIEF.meander makes them), ground, w (700: the half-width at the rim),
  //   depth (220: the floor under the lowest ground across), floorW (.12 of w), talus (.3: the share of the depth that is a
  //   scree apron at the foot), talusA (32 deg), face (72 deg: the colonnaded cliff), bench (12 m), tops ([ascending y]: the
  //   flows' tops, a stair's flowTops, where the cliff steps back as a bench: the trap staircase), seed})
  //   -> {kind:'rille', pts:[{x,z,y (the floor)}], w, floorW, talus, talusA, face, bench, tops, reach}
  //   The cross-profile is built from the floor up at each point (the depth is the ground there less the floor): the floor,
  //   the talus, then risers at the face's angle with a bench at each flow top, to the rim at w. Where the natural profile
  //   is narrower than w the talus spreads to fill it (an older, gentler apron); where it is wider, the whole is pressed in.
  //   The floor never climbs downstream
  function rille(o){needPts(o,'rille');KRq();var P=o.pts,w=o.w==null?700:o.w,dp=o.depth==null?220:o.depth,Y=bedLevels(P,o.ground,w,dp);
    return {kind:'rille',seed:(o.seed==null?1:o.seed)>>>0,pts:P.map(function(p,i){return {x:p[0],z:p[1],y:Y[i]};}),w:w,floorW:(o.floorW==null?.12:o.floorW)*w,talus:o.talus==null?.3:o.talus,
      talusA:(o.talusA==null?32:o.talusA)*Math.PI/180,face:(o.face==null?72:o.face)*Math.PI/180,bench:o.bench==null?12:o.bench,tops:o.tops?o.tops.slice():null,reach:w};}
  function rilleProf(R,fy,g,aq){var D=g-fy;if(D<=0||aq>=R.w)return null;var wf=R.floorW;if(aq<=wf)return {y:fy,part:'floor'};
    var tal=D*R.talus,tr=tal/Math.tan(R.talusA),V=[[0,tal,'talus']],x=0,yp=tal,tf=Math.tan(R.face);
    if(R.tops)for(var k=0;k<R.tops.length;k++){var hk=R.tops[k]-fy;if(hk<=yp+.5||hk>=D-.5)continue;x+=(hk-yp)/tf;V.push([x,hk,'wall',k]);x+=R.bench;V.push([x,hk,'bench',k]);yp=hk;}
    x+=(D-yp)/tf;V.push([x,D,'wall']);
    var room=R.w-wf,cr=x,sc=1,trw=tr;if(cr+tr>room){sc=room/(cr+tr);trw=tr*sc;}else trw=room-cr;   // the talus fills what the cliff leaves; pressed in when the whole is too wide
    var px=aq-wf;if(px<=trw)return {y:fy+tal*(px/trw),part:'talus'};
    var cx=(px-trw)/sc,prevX=0,prevY=tal;
    for(var i=1;i<V.length;i++){if(cx<=V[i][0]){var t=(cx-prevX)/((V[i][0]-prevX)||1);return {y:fy+lerp(prevY,V[i][1],t),part:V[i][2],k:V[i][3]};}prevX=V[i][0];prevY=V[i][1];}
    return {y:g,part:'rim'};}
  function rilleH(R,x,z,g){var p=idx(R).near(x,z);if(!p)return g;var fy=along(R,'y',p),r=rilleProf(R,fy,g,p.end?p.d:Math.abs(p.q));return r?Math.min(g,r.y):g;}
  function rilleAt(R,x,z,g){var p=idx(R).near(x,z);if(!p)return null;var fy=along(R,'y',p),r=rilleProf(R,fy,g,p.end?p.d:Math.abs(p.q));if(!r)return null;r.s=p.s;r.q=p.q;return r;}

  // ---------------------------------------------------------------- KRELIEF.tube: a lava tube and its pit chain
  // KRELIEF.tube({pts (downstream), ground, r (5: the tube's half-width), roof (4: rock over its crown), ridge (1.2 m: the
  //   swell over it), every (70 m: one pit slot), p (.4: a slot's chance of a pit), sky (.35: the share of pits that are
  //   skylights, the rest collapses), seed})
  //   -> {kind:'tube', pts:[{x,z,y (its floor)}], r, roof, ridge, every, pits:[slot -> {x, z, s, r, y (its floor), kind:
  //       'collapse'|'skylight'} | null], passage:{pts:[[x,y,z]], w, h} (KCAVERN.tube's arguments), openings:[{id, c:[x,z],
  //       r, kind:'well'}] (KCAVERN.opening's, one per pit: the cavern meshes the hole), reach}
  //   The floor runs under the lowest ground across less roof and the tube's height, never climbing. A collapse pit falls to
  //   a breakdown pile a third up the tube; a skylight is a small hole through the roof (the cavern draws it): on the
  //   heightfield only its sagging rim
  function tube(o){var K=KRq();needPts(o,'tube');var P=o.pts,seed=(o.seed==null?1:o.seed)>>>0,r=o.r==null?5:o.r,roof=o.roof==null?4:o.roof,hgt=2*r*.85;
    var Y=bedLevels(P,o.ground,r*1.5,roof+hgt),IX=polyIndex(P,1),S=IX.S,L=IX.L,ev=o.every==null?70:o.every,p=o.p==null?.4:o.p,sky=o.sky==null?.35:o.sky,pits=[],op=[];
    for(var k=0;k*ev<L;k++){var s=KR_s(K,seed,k,0x7B1);if(!s.chance(p)){pits.push(null);continue;}var at=(k+.2+.6*s.next())*ev;if(at>=L){pits.push(null);continue;}
      var ix=atS(S,at),a=P[ix.i],b=P[ix.i+1],x=lerp(a[0],b[0],ix.t),z=lerp(a[1],b[1],ix.t),fy=lerp(Y[ix.i],Y[ix.i+1],ix.t),isSky=s.chance(sky);
      var pr=isSky?r*(.25+.25*s.next()):r*(.9+.7*s.next());pits.push({x:x,z:z,s:at,r:pr,y:isSky?fy:fy+hgt*.35,kind:isSky?'skylight':'collapse'});op.push({id:'pit'+k,c:[x,z],r:pr,kind:'well'});}
    return {kind:'tube',seed:seed,pts:P.map(function(q,i){return {x:q[0],z:q[1],y:Y[i]};}),r:r,roof:roof,ridge:o.ridge==null?1.2:o.ridge,every:ev,pits:pits,
      passage:{pts:P.map(function(q,i){return [q[0],Y[i],q[1]];}),w:2*r,h:hgt},openings:op,reach:Math.max(3*r,r*1.7*1.7)};}
  function tubeH(R,x,z,g){var p=idx(R).near(x,z);if(!p)return g;var aq=p.end?p.d:Math.abs(p.q),y=g+R.ridge*Math.exp(-(aq/(1.6*R.r))*(aq/(1.6*R.r)));
    var k0=Math.floor(p.s/R.every);for(var k=k0-1;k<=k0+1;k++){var q=R.pits[k];if(!q)continue;var d=Math.hypot(x-q.x,z-q.z);
      if(q.kind==='collapse'){if(d<q.r){var f=d/q.r,rub=f<.6?.4*R.r*(1-(f/.6)*(f/.6)):0;y=Math.min(y,q.y+rub+(g-q.y)*smooth(.6,1,f));}}
      else if(d<q.r*1.6)y-=.4*(1-d/(q.r*1.6));}
    return y;}
  function tubeAt(R,x,z){var p=idx(R).near(x,z);if(!p)return null;var k0=Math.floor(p.s/R.every);
    for(var k=k0-1;k<=k0+1;k++){var q=R.pits[k];if(q&&Math.hypot(x-q.x,z-q.z)<q.r)return {part:q.kind,pit:k};}
    return Math.abs(p.q)<1.6*R.r?{part:'ridge'}:null;}

  // ---------------------------------------------------------------- KRELIEF.columns: columnar jointing in plan
  // KRELIEF.columns({w (1.6 m: a column's width), jitter (.28), angle, seed}) a jittered hexagonal lattice of columns, keyed
  //   by lattice cell: C.cell(x,z) -> {id, i, j, cx, cz, d (the distance in to the column's edge, the joint), h (the column's
  //   own 0..1)}; C.relief(x,z, amp (w/4), groove (w*.06)) the metres a column's top stands up or down, the joint grooved:
  //   a causeway on a flow's top, a ponded floor's colonnade seen from above. Its faces on a cliff: KSTACKS' columns option
  function columns(o){o=o||{};var K=KRq(),seed=(o.seed==null?1:o.seed)>>>0,W=o.w==null?1.6:o.w,jit=o.jitter==null?.28:o.jitter,an=o.angle||0,ca=Math.cos(an),sa=Math.sin(an),H=W*Math.sqrt(3)/2;
    function ctr(i,j){var h=K.hash(seed,i,j,0xC01);return [(i+(j&1)*.5)*W+(K.unit(h)-.5)*jit*W,j*H+(K.unit(K.hash(h,1))-.5)*jit*W];}
    function cell(x,z){var u=x*ca+z*sa,v=-x*sa+z*ca,j0=Math.round(v/H),best=null,d1=Infinity,d2=Infinity;
      for(var j=j0-1;j<=j0+1;j++){var i0=Math.round(u/W-(j&1)*.5);for(var i=i0-1;i<=i0+1;i++){var c=ctr(i,j),d=Math.hypot(u-c[0],v-c[1]);if(d<d1){d2=d1;d1=d;best=[i,j,c];}else if(d<d2)d2=d;}}
      var c2=best[2];return {id:best[0]+','+best[1],i:best[0],j:best[1],cx:c2[0]*ca-c2[1]*sa,cz:c2[0]*sa+c2[1]*ca,d:(d2-d1)/2,h:K.unit(K.hash(seed,best[0],best[1],0xC02))};}
    function relief(x,z,amp,groove){var c=cell(x,z),a=amp==null?W*.25:amp,gw=groove==null?W*.06:groove;return a*(c.h-.5)-a*.5*(1-smooth(0,gw,c.d));}
    return {cell:cell,relief:relief,w:W};}

  // ---------------------------------------------------------------- KRELIEF.gap: water gaps and wind gaps through a ridge
  // KRELIEF.gap({a:[x,z], b:[x,z] (the line through the ridge, a upstream), w (400: the half-width at the ridge's top),
  //   floor: y | [ya, yb] (a water gap's floor at a and at b: the river's grade), wind (false), wall (deg: 34 a water gap's
  //   V, 20 a wind gap's U), floorW (m: a water gap's channel, max(8, w*.05); a wind gap's col, w*.3), drop (a wind gap's
  //   fall each way from its col: w*.08), rough (.12), seed})
  //   -> {kind:'gap', a, b, L, w, wind, floorW, wall, ya, yb, drop, rough, seed, stream:[[x,z,y]] (a water gap's thalweg, for
  //       WATER.flow) | null, col:{x,z,y} (a wind gap's saddle) | null}
  //   shape(rec, x, z, h) lowers the ridge h to the notch (it never raises): a gap is a notch cut in whatever stands there
  function gap(o){KRq();if(!o||!o.a||!o.b||o.floor==null)throw new Error('KRELIEF.gap: a, b and floor are needed');
    var L=Math.hypot(o.b[0]-o.a[0],o.b[1]-o.a[1]);if(!(L>0))throw new Error('KRELIEF.gap: a and b must differ');
    var wind=!!o.wind,w=o.w==null?400:o.w,ya=Array.isArray(o.floor)?o.floor[0]:o.floor,yb=Array.isArray(o.floor)?o.floor[1]:o.floor;
    var R={kind:'gap',seed:(o.seed==null?1:o.seed)>>>0,a:[o.a[0],o.a[1]],b:[o.b[0],o.b[1]],L:L,w:w,wind:wind,floorW:o.floorW==null?(wind?w*.3:Math.max(8,w*.05)):o.floorW,
      wall:(o.wall==null?(wind?20:34):o.wall)*Math.PI/180,ya:ya,yb:yb,drop:o.drop==null?w*.08:o.drop,rough:o.rough==null?.12:o.rough,stream:null,col:null};
    if(wind)R.col={x:(o.a[0]+o.b[0])/2,z:(o.a[1]+o.b[1])/2,y:ya};
    else{R.stream=[];for(var i=0;i<=16;i++){var t=i/16;R.stream.push([lerp(o.a[0],o.b[0],t),lerp(o.a[1],o.b[1],t),lerp(ya,yb,t)]);}}
    return R;}
  function gapFloor(R,s){if(R.wind){var u=2*s/R.L-1;return R.ya-R.drop*u*u;}return lerp(R.ya,R.yb,clamp01(s/R.L));}
  function gapNotch(R,x,z){var K=KRq(),ux=(R.b[0]-R.a[0])/R.L,uz=(R.b[1]-R.a[1])/R.L,dx=x-R.a[0],dz=z-R.a[1],s=dx*ux+dz*uz,q=-uz*dx+ux*dz;
    if(s<-R.w||s>R.L+R.w||Math.abs(q)>R.w*1.5)return null;
    var e=Math.max(0,Math.abs(q)-R.floorW),past=s<0?-s:s>R.L?s-R.L:0,tw=Math.tan(R.wall);
    return {y:gapFloor(R,clamp01(s/R.L)*R.L)+(e+past*2)*tw*(1+R.rough*(2*K.fbm(x/60,z/60,.5,2,R.seed)-1)),e:e,s:s,q:q};}
  function gapH(R,x,z,h){var n=gapNotch(R,x,z);return n?Math.min(h,n.y):h;}
  function gapAt(R,x,z,h){var n=gapNotch(R,x,z);if(!n||(h!=null&&n.y>=h))return null;return {part:n.e<=0?'floor':'side',s:n.s,q:n.q};}

  // ---------------------------------------------------------------- KRELIEF.joints and KRELIEF.tableland: the pillar rim
  // The SW highlands' Span tableland (`pillar` sandstone): two vertical joint sets cut the table into blocks; inward the
  // joints are SLOTS, toward the rim they widen until the blocks stand free as towers (KSTACKS.pillars, from the same
  // joints and zone), past it the floor.
  // KRELIEF.joints({world, angle (rad: the first set's strike), sp:[30,70] (the spacing, m)}) -> J: J.at(x,z) {i, j, id, du,
  //   dv (to the nearest joint of each set), d (the nearer)}; J.block(i,j) and J.blocks([x0,z0,x1,z1]) -> [{id, i, j, cx, cz,
  //   w (across the first set), l, ry}] (a block is in the box when its centre is)
  function joints(o){o=o||{};var K=KRq(),wd=(o.world==null?0:o.world)>>>0,an=o.angle||0,ca=Math.cos(an),sa=Math.sin(an),sp=o.sp||[30,70],S=(sp[0]+sp[1])/2,J=(sp[1]-sp[0])/2;
    function Lu(i){return i*S+(u01(K,wd,i,0,0x5A1)-.5)*J;}function Lv(j){return j*S+(u01(K,wd,0,j,0x5A2)-.5)*J;}
    function cellOf(t,L){var i=Math.floor(t/S);while(L(i)>t)i--;while(L(i+1)<=t)i++;return i;}
    function at(x,z){var u=x*ca+z*sa,v=-x*sa+z*ca,i=cellOf(u,Lu),j=cellOf(v,Lv),du=Math.min(u-Lu(i),Lu(i+1)-u),dv=Math.min(v-Lv(j),Lv(j+1)-v);return {i:i,j:j,id:i+','+j,du:du,dv:dv,d:Math.min(du,dv)};}
    function block(i,j){var u=(Lu(i)+Lu(i+1))/2,v=(Lv(j)+Lv(j+1))/2;return {id:i+','+j,i:i,j:j,cx:u*ca-v*sa,cz:u*sa+v*ca,w:Lu(i+1)-Lu(i),l:Lv(j+1)-Lv(j),ry:an};}
    function blocks(box){var cs=[[box[0],box[1]],[box[2],box[1]],[box[0],box[3]],[box[2],box[3]]],u0=Infinity,u1=-Infinity,v0=Infinity,v1=-Infinity,out=[];
      cs.forEach(function(p){var u=p[0]*ca+p[1]*sa,v=-p[0]*sa+p[1]*ca;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);});
      for(var j=cellOf(v0,Lv)-1;Lv(j)<=v1;j++)for(var i=cellOf(u0,Lu)-1;Lu(i)<=u1;i++){var B=block(i,j);if(B.cx>=box[0]&&B.cx<box[2]&&B.cz>=box[1]&&B.cz<box[3])out.push(B);}
      return out;}
    return {at:at,block:block,blocks:blocks,world:wd,angle:an,sp:[sp[0],sp[1]]};}
  // KRELIEF.tableland({joints, zone(x,z) (0 deep in the table .. 1 the floor), top (y or fn), floor(x,z), z0 (.3: where the
  //   table ends: the cliff; KSTACKS.pillars stands its towers from z0), edge (.015 of the zone: the rim's rounding), slot:{w
  //   (2: a slot's half-width deep in the table), grow (3: its widening by the rim), depth (.35 of the table's height)}})
  //   -> (x,z) => height: the table, its slots on the joints, a cliff at z0, the floor past it
  function tableland(o){if(!o||!o.joints||!o.zone||o.top==null||!o.floor)throw new Error('KRELIEF.tableland: joints, zone, top and floor are needed');
    var J=o.joints,Z=o.zone,T=o.top,F=o.floor,z0=o.z0==null?.3:o.z0,ed=o.edge==null?.015:o.edge,sl=o.slot||{},sw=sl.w==null?2:sl.w,gr=sl.grow==null?3:sl.grow,dp=sl.depth==null?.35:sl.depth;
    return function(x,z){var zz=Z(x,z),fl=F(x,z);if(zz>=z0)return fl;var t=typeof T==='function'?T(x,z):T,y=lerp(t,fl,smooth(z0-ed,z0,zz)),f=zz/z0,w2=sw*(1+(gr-1)*f),a=J.at(x,z);
      if(a.d<w2)y=Math.min(y,t-Math.min(t-fl,dp*(t-fl)*(.5+.5*f))*(1-Math.pow(a.d/w2,6)));
      return y;};}

  var SHAPES={wadi:wadiH,pit:pitH,rille:rilleH,tube:tubeH,gap:gapH,stair:function(R,x,z,g){return Math.max(g==null?-Infinity:g,stairH(R,x,z));}};
  var PARTS={wadi:wadiAt,pit:pitAt,rille:rilleAt,tube:tubeAt,gap:gapAt,stair:function(R,x,z){var p=stairProf(R,x,z);return p?{part:p.part,step:p.i}:null;}};
  function shape(R,x,z,g){var f=R&&SHAPES[R.kind];if(!f)throw new Error('KRELIEF.shape: not a landform record ('+(R&&R.kind)+')');return f(R,x,z,g);}
  function partAt(R,x,z,g){var f=R&&PARTS[R.kind];if(!f)throw new Error('KRELIEF.at: not a landform record ('+(R&&R.kind)+')');return f(R,x,z,g);}
  // KRELIEF.apply(ground, [records]) -> (x,z) => the ground with each form applied in order
  function apply(ground,recs){return function(x,z){var g=ground(x,z);for(var i=0;i<recs.length;i++)g=shape(recs[i],x,z,g);return g;};}

  root.KRELIEF={range:range,join:join,volcano:volcano,fields:fields,river:river,noise:noise,hash:hash,
    meander:meander,wadi:wadi,talus:talus,pit:pit,pavement:pavement,paintCover:paintCover,stair:stair,flowAt:flowAt,rille:rille,tube:tube,columns:columns,
    gap:gap,joints:joints,tableland:tableland,shape:shape,at:partAt,apply:apply,kinds:function(){return Object.keys(SHAPES);}};
})(typeof window!=='undefined'?window:globalThis);
