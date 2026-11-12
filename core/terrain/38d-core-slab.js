// ================================================================= CORE — relief: a tilted slab's cliff of spurs and gullies  [G data]
// KRELIEF.slab: the leading edge of a thrust-tilted block (biomes/slabfields/PLAN.md sections 3.4 and 15, item 5; Io's mountains on a
// heat-pipe world): a cliff that is not one profile but a row of SPURS, each its own, with GULLIES cut back between them, scree CONES
// at the gullies' mouths, LEDGES where hard flows stand out (wandering and fading along the strike), the odd fresh collapse SCAR, a
// ragged crest, and behind the rim the slab's RAMP falling at its dip. KRELIEF.scarp draws one smoothstep profile along a line, so a
// long face reads as a few broad panels; here every spur draws its own run, power, height, projection and the fall of its top to its
// nose, and the face between two spurs recedes into a gully whose head cuts back into the plateau.
//
//   const S = KRELIEF.slab({pts:[[x,z],...] (the RIM, as scarp's), side:1 (the slab on n = (-uz, ux)), h, run, power:1.3,
//     dip:.12 (the ramp's fall a metre behind the rim), seed,
//     spurs:{sp:420 (mean spacing), spread:[.6,1.4] (each gap sp x a draw in it), w:[.55,.85] (a spur's share of its spacing), out:[40,220] (how far it stands out, m),
//            run:[.7,1.5], power:[1,1.9] (its profile: factors of run, absolute powers), dh:[-.07,.03] (its height, share of h),
//            tip:[.02,.1] (its top's fall to its nose, share of h)},
//     gullies:{back:[40,180] (how far a gully's head cuts behind the rim, m)},
//     cones:{h:[40,140], reach:[150,380]} (scree at each gully's mouth; false none),
//     skirt:{h:.04, reach:.35} (a talus skirt along the whole foot: h a share of h, reach a share of run; false none),
//     ledges:{n:5, w:.1 (share of h), wander:.035, k:[.7,2] (strength: base + gain x noise in -.5..+.5, kept in 0..1.25; over 1 a bench tilts back)},
//     scars:[{s (m along the rim), w (half-width, m), back (m), run (factor: <1 steeper, fresh)}],
//     rough:{face:.03, flute:.018, crest:.05}})   -> a record {kind:'slab', ...} (plain data, JSON-safe)
//   KRELIEF.shape(S, x, z, g)   the ground with the slab on it (g the ground without it: the floor before the slab, the plain)
//   KRELIEF.slabExport(S)       the record as plain JSON (format 'krator-slab'): the GDScript twin core/terrain/kslab.gd samples it the same
//   KRELIEF.at(S, x, z)         {part:'plateau'|'spur'|'face'|'ledge'|'gully'|'scar'|'cone'|'skirt', s, d, dd, share, spur, fresh} or null
//   KRELIEF.slabProfile(S, s, n) the height over g (no noise) at n points across the face at arc length s, for the model's side
// Every draw is KRAND.hash(seed, slot, salt); the noise is KRAND.fbm on (s, d) and (x, z). Opt-in; needs core/rand and
// 38-core-relief.js (and composes with 38c-core-landforms.js loaded or not). No THREE, no DOM; node core/terrain/test-slab.js.
// Axes: y up, metres, x east, z south. Defaults are written x == null ? d : x.
(function(root){
  'use strict';
  var KR=root.KRELIEF;
  if(!KR||!KR.shape||!KR.scarp)throw new Error('core/terrain 38d-core-slab.js: load 38-core-relief.js first (KRELIEF)');
  if(KR._slab)return;
  function KRq(){var K=root.KRAND;if(!K)throw new Error('KRELIEF.slab: load core/rand/08-core-rand.js first');return K;}
  var TAU=Math.PI*2;
  function d(v,x){return v==null?x:v;}
  function c01(v){return v<0?0:v>1?1:v;}
  function sm(a,b,v){var t=c01((v-a)/(b-a));return t*t*(3-2*t);}
  function lerp(a,b,t){return a+(b-a)*t;}
  function u01(K,seed,i,c,salt){return K.hash(seed,i*16+c,salt)/4294967296;}
  function rng2(K,seed,i,c,salt,r){return lerp(r[0],r[1],u01(K,seed,i,c,salt));}
  function fin(v,n){v=+v;if(!(v===v)||!isFinite(v))throw new Error('KRELIEF.slab: '+n+' must be a finite number');return v;}

  function slab(o){var K=KRq();if(!o||!o.pts||o.pts.length<2)throw new Error('KRELIEF.slab: pts needs two points or more');
    var seed=d(o.seed,1)>>>0,h=fin(d(o.h,1200),'h'),run=fin(d(o.run,600),'run');if(!(h>0)||!(run>0))throw new Error('KRELIEF.slab: h and run must be over 0');
    var P=o.pts.map(function(p){return [fin(p[0],'pts'),fin(p[1],'pts')];}),A=[0],i;
    for(i=1;i<P.length;i++)A.push(A[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));var L=A[A.length-1];if(!(L>0))throw new Error('KRELIEF.slab: the line has no length');
    var SP=o.spurs||{},sp=fin(d(SP.sp,420),'spurs.sp');if(!(sp>0))throw new Error('KRELIEF.slab: spurs.sp must be over 0');
    var rw=SP.w||[.55,.85],ro=SP.out||[40,220],rr=SP.run||[.7,1.5],rp=SP.power||[1,1.9],rd=SP.dh||[-.07,.03],rt=SP.tip||[.02,.1];
    var GO=o.gullies||{},rb=GO.back||[40,180];
    // the spurs: centres from before the line's start to past its end, spaced sp x (.6..1.4)
    var spurs=[],s=-sp*u01(K,seed,0,0,0x5A0);i=0;
    var spr=SP.spread||[.6,1.4];
    while(s<L+sp){var gap=sp*lerp(spr[0],spr[1],u01(K,seed,i,1,0x5A0));
      spurs.push({s:s,hw:Math.max(10,gap*rng2(K,seed,i,2,0x5A0,rw)/2),out:rng2(K,seed,i,3,0x5A0,ro),run:run*rng2(K,seed,i,4,0x5A0,rr),pw:rng2(K,seed,i,5,0x5A0,rp),
        dh:rng2(K,seed,i,6,0x5A0,rd),tip:rng2(K,seed,i,7,0x5A0,rt),back:rng2(K,seed,i,8,0x5A0,rb)});
      s+=gap;i++;if(i>100000)throw new Error('KRELIEF.slab: too many spurs (spurs.sp too small for the line)');}
    var CO=o.cones===false?null:(o.cones||{}),cones=[];
    if(CO){var rch=CO.h||[40,140],rcr=CO.reach||[150,380];
      for(i=0;i+1<spurs.length;i++){var a=spurs[i],b=spurs[i+1],sg=(a.s+a.hw+b.s-b.hw)/2;
        cones.push({s:sg,h:rng2(K,seed,i,0,0x5A1,rch),reach:rng2(K,seed,i,1,0x5A1,rcr)});}}
    var LE=o.ledges===false?null:(o.ledges||{}),ledges=[];
    if(LE){var ln=d(LE.n,5),lw=d(LE.w,.1);for(i=0;i<ln;i++)ledges.push({L:(i+1)/(ln+1.2),w:lw,seed:(seed+101+i*7)>>>0});}
    var SK=o.skirt===false?null:Object.assign({h:.04,reach:.35},o.skirt||{});
    var RG=Object.assign({face:.03,flute:.018,crest:.05},o.rough||{});
    var scars=(o.scars||[]).map(function(q){return {s:fin(q.s,'scars.s'),w:Math.max(5,fin(d(q.w,150),'scars.w')),back:fin(d(q.back,120),'scars.back'),run:fin(d(q.run,.6),'scars.run')};});
    return {kind:'slab',seed:seed,pts:P,S:A,L:L,side:d(o.side,1),h:h,run:run,power:d(o.power,1.3),dip:fin(d(o.dip,.12),'dip'),spurs:spurs,cones:cones,ledges:ledges,
      ledgeWander:d(LE&&LE.wander,.035),ledgeK:(LE&&LE.k)||[.7,2],skirt:SK,rough:RG,scars:scars};}

  // where (x,z) is: s along the rim, d the metres from the rim toward the floor (negative on the slab), as scarp measures it
  function local(R,x,z){var best=Infinity,bs=0,bq=0,P=R.pts;
    for(var i=0;i+1<P.length;i++){var a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=(R.S[i+1]-R.S[i])||1,ux=dx/l,uz=dz/l,ax=x-a[0],az=z-a[1],t=ax*ux+az*uz,
      tc=t<0?0:t>l?l:t,ex=ax-ux*tc,ez=az-uz*tc,dd=Math.sqrt(ex*ex+ez*ez);if(dd<best-1e-9){best=dd;bs=R.S[i]+tc;bq=-uz*ax+ux*az;}}
    var sg=(bq>=0?1:-1)*R.side;return {s:bs,d:-sg*best};}
  // the spurs over arc length s: the two nearest (a binary search on the sorted centres)
  function near(R,s){var A=R.spurs,lo=0,hi=A.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(A[m].s<=s)lo=m;else hi=m;}return [A[lo],A[hi]];}
  // the face's parameters at s: each spur weighted cos^2 over its half-width; where no spur reaches, the gully between the two
  function params(R,s){var N=near(R,s),a=N[0],b=N[1],wa=0,wb=0,ua=(s-a.s)/a.hw,ub=(s-b.s)/b.hw;
    if(Math.abs(ua)<1)wa=Math.pow(Math.cos(Math.PI/2*ua),2);if(Math.abs(ub)<1)wb=Math.pow(Math.cos(Math.PI/2*ub),2);
    /* kb: how far toward b the parameters lie; the spurs' own blend where they reach, the gap's straight line where they do not,
       mixed by the gully's weight g so nothing jumps at a spur's edge */
    var B=wa+wb,g=1-Math.min(1,B),kl=c01((s-a.s)/((b.s-a.s)||1)),kb=(B>0?wb/B:kl)*(1-g)+kl*g,mid=function(k){return a[k]*(1-kb)+b[k]*kb;};
    var F=wa*a.out+wb*b.out-g*(a.back+b.back)/2,run=mid('run'),pw=mid('pw'),dh=mid('dh'),tip=mid('tip'),out=Math.max(1,mid('out'));
    var sc=0,i;for(i=0;i<R.scars.length;i++){var q=R.scars[i],u=(s-q.s)/q.w;if(Math.abs(u)<1){var k=Math.pow(Math.cos(Math.PI/2*u),2);if(k>sc)sc=k;F-=k*q.back;run*=1-(1-q.run)*k;}}
    return {F:F,run:run,pw:pw,dh:dh,tip:tip,out:out,B:B,g:g,spur:wa>=wb?a:b,scar:sc};}
  function ledgeShift(R,s,sh){var K=KRq(),dsh=0,best=0;for(var i=0;i<R.ledges.length;i++){var E=R.ledges[i],L=E.L+R.ledgeWander*(2*K.fbm(s*.0009,.5,i,2,E.seed)-1),u=(sh-L)/E.w;
      if(Math.abs(u)>=.5)continue;var k=Math.min(1.25,Math.max(0,R.ledgeK[0]+R.ledgeK[1]*(K.fbm(s*.0011,.5,i,2,E.seed+40)-.5)));   /* base + gain x noise, in 0..1.25 */
      dsh-=k*E.w*Math.sin(TAU*u)/TAU;if(k>.6&&Math.abs(u)<.15)best=1;}return {d:dsh,on:best};}
  // the height over g (no noise) and what it is, at (s, d)
  function core(R,s,dd0){var p=params(R,s),dd=dd0-p.F,H=R.h*(1+p.dh),top,sh,part;
    /* a spur's top falls tip x h to its nose over its full projection (out): one that barely stands out falls that little */
    var edgeDrop=p.F>0?p.tip*R.h*c01(p.F/p.out):0,edgeDip=R.dip*Math.max(0,-p.F);
    if(dd<=0){   /* the slab: its ramp behind the rim; out on a spur, its top falling to its nose */
      var tipFall=p.F>0&&dd0>0?p.tip*R.h*c01(Math.min(dd0,p.F)/p.out):0;top=H-tipFall-R.dip*Math.max(0,-dd0);
      return {y:top,part:dd0>0?'spur':'plateau',share:1,dd:dd,p:p,H:H};}
    var Te=H-edgeDrop-edgeDip;
    /* the profile: steep from the rim (a cliff, not a rounded brow; the lip eased over its first 3%), easing into the foot: (1 - t)^power */
    if(dd<p.run){var t=dd/p.run;sh=1-(1-Math.pow(1-t,p.pw))*sm(0,.03,t);part=p.scar>.3?'scar':p.g>.7?'gully':'face';}else{sh=0;part=null;}
    var y=0,ls={d:0,on:0};if(sh>0&&sh<1&&R.ledges.length){ls=ledgeShift(R,s,sh);if(ls.on&&part==='face')part='ledge';}
    y=Te*c01(sh+ls.d);
    var ty=0;
    if(R.skirt){var rch=R.skirt.reach*p.run,t=(dd-p.run*.75)/rch;if(t>-.4&&t<1){var sk=R.skirt.h*R.h*Math.pow(1-c01(t),1.6)*sm(-.4,0,t);if(sk>y){ty=sk;}}}
    /* a cone: its apex against the foot of the gully (90% of the run out), falling away outward and along the line over its reach */
    if(R.cones.length){var N=nearCone(R,s);if(N&&dd>p.run*.5){var dist=Math.hypot(s-N.s,Math.max(0,dd-p.run*.9));if(dist<N.reach){var c=N.h*Math.pow(1-dist/N.reach,1.4);if(c>ty)ty=c;}}}
    if(ty>y){y=ty;if(sh<.15)part=ty>(R.skirt?R.skirt.h*R.h*.6:0)&&R.cones.length?'cone':'skirt';}
    return {y:y,part:part,share:sh,dd:dd,p:p,H:H};}
  function nearCone(R,s){var A=R.cones;if(!A.length)return null;var lo=0,hi=A.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(A[m].s<=s)lo=m;else hi=m;}
    return Math.abs(A[lo].s-s)<Math.abs(A[hi].s-s)?A[lo]:A[hi];}
  // the noise: the face rough and fluted, the crest ragged; none on the floor, none on the ramp past 200 m
  function noise(R,x,z,s,c){var K=KRq(),sh=c.share,h=R.h,n=0,band=sh>0&&sh<1?sm(.02,.2,sh)*sm(1,.85,sh):0;
    if(band>0)n+=band*h*(R.rough.face*(2*K.fbm(x/70,.5,z/70,3,R.seed+7)-1)+R.rough.flute*(2*K.fbm(s*.022,.5,0,2,R.seed+8)-1)+R.rough.flute*.35*(2*K.fbm(s*.07,.5,0,2,R.seed+9)-1));
    if(sh>0)n+=Math.pow(Math.min(sh,1),3)*h*R.rough.crest*(2*K.fbm(s*.0042,.5,0,3,R.seed+10)-1)*(c.dd<=0?sm(-200,0,c.dd):1);
    return n;}
  function shapeSlab(R,x,z,g){var q=local(R,x,z),c=core(R,q.s,q.d);var base=g==null?0:g;
    if(c.part===null&&c.y<=0)return base;return base+c.y+noise(R,x,z,q.s,c);}
  function atSlab(R,x,z){var q=local(R,x,z),c=core(R,q.s,q.d);if(!c.part)return null;
    return {part:c.part,s:q.s,d:q.d,dd:c.dd,share:c.share,spur:R.spurs.indexOf(c.p.spur),fresh:c.p.scar};}
  function slabProfile(R,s,n){n=n||32;var o=[],p=params(R,s),d0=Math.min(-50,p.F-50),d1=p.F+p.run*1.6;
    for(var i=0;i<n;i++){var dd=lerp(d0,d1,i/(n-1));o.push([dd,core(R,s,dd).y]);}return o;}

  // compose onto KRELIEF as 38c does (the other kinds answer exactly as before)
  var shape0=KR.shape,at0=KR.at,kinds0=KR.kinds,waters0=KR.waters;
  KR.shape=function(R,x,z,g){return R&&R.kind==='slab'?shapeSlab(R,x,z,g):shape0(R,x,z,g);};
  KR.at=function(R,x,z,g){return R&&R.kind==='slab'?atSlab(R,x,z):at0(R,x,z,g);};
  KR.apply=function(ground,recs){return function(x,z){var g=ground(x,z);for(var i=0;i<recs.length;i++)g=KR.shape(recs[i],x,z,g);return g;};};
  KR.kinds=function(){return kinds0().concat(['slab']);};
  KR.waters=function(R,ground){if(R&&R.kind==='slab')return [];return waters0?waters0(R,ground):[];};
  /* the record as plain data for Godot (core/terrain/kslab.gd reads it; golden-slab.json holds the two to the same heights) */
  function slabExport(R){if(!R||R.kind!=='slab')throw new Error('KRELIEF.slabExport: not a slab record');
    return JSON.parse(JSON.stringify(Object.assign({format:'krator-slab',version:1},R)));}
  KR.slab=slab;KR.slabProfile=slabProfile;KR.slabExport=slabExport;KR._slab=true;
})(typeof window!=='undefined'?window:globalThis);
