// ================================================================= CORE — stacks: the contour of a drawn tower (2026-10-27)
// [G data] An opt-in companion of 37-core-stacks.js (load it, and core/rand, first): KSTACKS.contour moves a drawn mesh's
// vertices about the body's axis, each by a function of its angle and its height alone, so the walls, the beds' notches and
// the tops move together. Made for the pillar rim (settlements/span's stand-in pillars; the owner, 2026-10-27, with Spider
// Rock, Adrspach and Cao Grande for reference: "thinning in and out along the sides and real contour"). A build that does
// not list this file draws exactly as before; one that lists it and does not call it, too.
//
//   KSTACKS.contour(B, m, o)   m (KSTACKS.mesh(B)) contoured in place and returned; B (the record) is not changed, so
//                              KSTACKS.at, topAt and wall answer for the uncontoured body (the page's checks read the
//                              drawn mesh where they must). Call it before KSTACKS.weather. Its terms, each from B.seed
//                              (o.seed overrides) by KRAND, none from a stream's position:
//     profile (.16)            the width wandering in and out up the height (KRAND fbm, ~3 swells a body), a share of r
//     flare (.12)              the foot widened, fading over the lowest 14 % of the height
//     crown (.28)              the top drawn in over the highest 22 % (0: a flat-headed tower)
//     wander (1.8)             metres the axis wanders sideways up the height
//     joints ([5,8])           vertical joints cut in as grooves, n drawn in that range; jointW ([.8,2.2]) their half-width
//                              in metres of arc, jointD ([4,9]) their depth in metres, each opening and closing up the face
//     cleft (true)             one deep cleft down from the crown (a split spire: .5 of the radius at the top), from
//                              cleftFrom ([.35,.6]) of the height
//     keep (0)                 metres under the top over which every term fades to nothing, and no crown and no cleft:
//                              the top stays the record's (something stands on it: a post, a deck)
//     floor (.25)              a vertex is never drawn nearer the axis than this share of its radius
(function(root){
  'use strict';
  var KR=root.KRAND,K=root.KSTACKS;
  if(!KR||!K) throw new Error('37b-core-stacks-contour: load core/rand/08-core-rand.js and core/terrain/37-core-stacks.js first');
  var TAU=Math.PI*2;
  function sm(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
  function num(x,d){return x==null?d:x;}
  function rng(r,d){return r==null?d:r;}
  function contour(B,m,o){o=o||{};var sd=num(o.seed,B.seed)>>>0,H=B.top-B.y0,keep=num(o.keep,0);
    var prof=num(o.profile,.16),flare=num(o.flare,.12),crown=keep>0?0:num(o.crown,.28),wan=num(o.wander,1.8),fl=num(o.floor,.25);
    var jn=rng(o.joints,[5,8]),jw=rng(o.jointW,[.8,2.2]),jd=rng(o.jointD,[4,9]),cf=rng(o.cleftFrom,[.35,.6]);
    var u=function(k){return KR.unit(KR.hash(sd,k,77));},nz=function(k,t){return (KR.fbm(t,k*1.7,.5,3,sd+k)-.5)*2;};
    var J=[],nj=jn[0]+(KR.hash(sd,0,78)%(jn[1]-jn[0]+1));
    for(var j=0;j<nj;j++)J.push({a:u(10+j)*TAU,w:jw[0]+(jw[1]-jw[0])*u(20+j),d:jd[0]+(jd[1]-jd[0])*u(30+j),k:40+j});
    var cleft=(keep>0||o.cleft===false)?null:{a:u(5)*TAU,w:1.5+1.5*u(6),from:cf[0]+(cf[1]-cf[0])*u(7)};
    var P=m.pos;
    for(var v=0;v<P.length/3;v++){var x=P[3*v],y=P[3*v+1],z=P[3*v+2],t=(y-B.y0)/H,kp=keep>0?1-sm(H-keep,H-keep/4,y-B.y0):1;
      var dx=x-B.x,dz=z-B.z,r=Math.hypot(dx,dz);if(r<1e-6)continue;var a=Math.atan2(dz,dx);
      var ox=wan*nz(1,t*2.2)*kp,oz=wan*nz(2,t*2.2)*kp;
      var p=(1+prof*nz(3,t*2.8)+flare*(1-sm(0,.14,t)))*(1-crown*sm(.78,1,t)),R=r*(1+(p-1)*kp);
      for(j=0;j<J.length;j++){var g=J[j],d=a-g.a;d=Math.atan2(Math.sin(d),Math.cos(d));var s=d*r/g.w;R-=g.d*(.55+.45*nz(g.k,t*4))*Math.exp(-s*s)*kp;}
      if(cleft&&t>cleft.from){var dc=a-cleft.a;dc=Math.atan2(Math.sin(dc),Math.cos(dc));var sc=dc*r/cleft.w;R-=r*.5*sm(cleft.from,cleft.from+.12,t)*Math.exp(-sc*sc);}
      R=Math.max(R,r*fl);P[3*v]=B.x+ox+dx/r*R;P[3*v+2]=B.z+oz+dz/r*R;}
    return m;}
  K.contour=contour;
})(typeof globalThis!=='undefined'?globalThis:this);
