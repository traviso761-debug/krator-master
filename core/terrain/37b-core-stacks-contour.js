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
//   KSTACKS.archRound(B, m, o) an arch's drawn opening bent from its box to an ellipse (o.band .6); below
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
  // KSTACKS.archRound(B, m, o): an arch's drawn opening bent from its box to an ellipse (biomes/swhighlands station 4; the owner,
  // 2026-10-27: real rock arches, refs Delicate Arch and a natural bridge in forest). In the plane across the opening (a along its
  // ry, y up), each vertex at normalised (a / half-width, (y - y0) / rise) whose box radius m = max(|a'|, y') is under 1 + band
  // (.6) is moved along its ray from the opening's foot so its ring of the box lands on the circle of the same radius, fully at
  // m <= 1 (the opening's edge) and fading to nothing at 1 + band: the soffit's corners come down into a curve, the legs' inner
  // faces lean in to meet it, the lintel's top and the legs' outsides do not move. Only B.opening's arches; the record is not
  // changed. Call it before KSTACKS.weather
  function archRound(B,m,o){o=o||{};var Op=B.opening;if(!Op)return m;var band=num(o.band,.6),ux=Math.cos(Op.ry),uz=Math.sin(Op.ry),hw=Op.w0/2,rise=Op.y1-Op.y0,P=m.pos;
    if(!(hw>0&&rise>0))return m;
    for(var v=0;v<P.length/3;v++){var x=P[3*v],y=P[3*v+1],z=P[3*v+2],dx=x-Op.x,dz=z-Op.z,a=dx*ux+dz*uz,c=-dx*uz+dz*ux,an=a/hw,yn=(y-Op.y0)/rise;
      if(yn<=0)continue;var mm=Math.max(Math.abs(an),yn);if(mm>=1+band)continue;var hy=Math.hypot(an,yn);if(hy<1e-9)continue;
      var w=1-sm(1,1+band,mm),f=1+(mm/hy-1)*w,a2=an*f*hw,y2=Op.y0+yn*f*rise;P[3*v]=Op.x+a2*ux-c*uz;P[3*v+1]=y2;P[3*v+2]=Op.z+a2*uz+c*ux;}
    return m;}
  K.contour=contour;K.archRound=archRound;
})(typeof globalThis!=='undefined'?globalThis:this);
