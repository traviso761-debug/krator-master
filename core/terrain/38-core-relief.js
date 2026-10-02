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

  root.KRELIEF={range:range,join:join,volcano:volcano,fields:fields,river:river,noise:noise,hash:hash};
})(typeof window!=='undefined'?window:globalThis);
