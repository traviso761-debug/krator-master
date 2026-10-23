// ================================================================= CORE — basin: the old water bodies of a heightfield world
// [G data] Plain maths of (x, z, h): no THREE, no DOM, no Math.random, no Math.sin or exp (only + - * / floor sqrt), the
// draws from core/rand (KRAND), so a Godot port reproduces it. Needs KRAND (core/rand/08-core-rand.js) loaded first.
// The overlay "the dam basins" and the flood lake of "the scablands" read it (biomes/nsemiarid/PLAN.md, sections 2, 5, 6):
// a lake that stood and is gone leaves its marks by HEIGHT, so everything here is a function of the ground's height h
// at a point and of which old lakes covered that point (a member function the world gives, from palaeo.png).
//
//   const B = KBASIN.create({lakes:[...], seed, age:1000, recession:600, wind:[1,0]})
//     a lake: {name, kind:'dam'|'flood', level (m), sill (m: the level a dam lake drained to in the flood; a flood lake
//              has none), ring (m: the bathtub ring under a dam lake's level, its yearly drawdown), remnant (m: the level
//              of its largest lake today), member:(x,z)->0..1 (the point lay in its basin)}
//     age        years since the flood; recession: the years the trapped water took to evaporate to today's lakes
//     wind       the prevailing wind (any length): yardangs run along it
//   B.lakes[k].strands   its strandlines, top to bottom: [{level, s (strength 0..1), w (half-height, m), year}]
//   B.sample(x,z,h,out)  what the old water left at a point, into out (one object, reused if given):
//     lake   the lake whose water left the point last (-1: none). Where two cover a point (the flood lake filled the
//            west dam basin), the one that dried later decides the band, the strand and the years; under a dam lake's
//            sill its own recession decides, from the year the flood lake fell to that sill
//     depth  that lake's level over h (m); band: BAND.* (below); bed 0..1 (lay under any old lake)
//     ring   0..1 the bathtub ring (a dam lake, between its level and ring m under it)
//     shore  0..1 the old full level's line: a long-held one (dam) leaves a bench and a beach ridge, a short one (flood)
//            a wrack line
//     strand 0..1 on a strandline (its strength); strandD: metres above the nearest one (negative: below)
//     silt 0..1 lake sediment; salt 0..1 (rising toward today's water in the slow recession); yard 0..1 where wind
//     cuts yardangs in the silt; dry: years since the point came out of the water (0..age)
//   B.land(x,z,h)        h with the basin's marks: the strandlines and the full level as benches (a monotone map of h,
//                        so it makes no new hollows), the beach ridge under a long-held level, yardangs in dry silt
//   KBASIN.BAND          {none:0, ring:1, drain:2, recession:3, high:4, water:5}
//                        ring: under a dam lake's level, its drawdown band; drain: between the ring and the sill, left
//                        in days when the dam broke (no strandlines; slumps); recession: under the sill (or under a flood
//                        lake's high line), left over centuries (strandlines); high: a flood lake's high-water line;
//                        water: under the level of its lake today
//   KBASIN.fromRegion(P, member, opt)  the lakes from region.json "palaeo" (extract_region.py): member(bit,x,z) -> 0..1
(function(root){
  'use strict';
  var R=root.KRAND;
  var BAND={none:0,ring:1,drain:2,recession:3,high:4,water:5};
  var HIGH_M=6;          // m: a flood lake's high-water line, under its level
  var SHORE_M=4;         // m: the full level's line, either side
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function smooth(a,b,x){var t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);}
  // the bench profile: T(h) = h + a*w*q(u), u = (h - L)/w, q(u) = -u(1-u^2)^2 on |u| < 1. T'(h) = 1 + a q'(u), and q'
  // lies in [-1, .52], so with a <= .9 the map stays monotone: flat at L (a bench), steeper round it (the riser)
  function bench(u){if(u<=-1||u>=1)return 0;var v=1-u*u;return -u*v*v;}

  function strands(L,k,seed,o){
    // the recession's pauses: from the top of the slow fall down to its lake today, closer near the water (the fall
    // slows as the lake shrinks into its deepest hollow); each pause's strength drawn per line, keyed by lake and index
    var top=L.kind==='flood'?L.level-HIGH_M:L.sill,bot=L.remnant+2,out=[];
    if(!(top>bot))return out;
    var y=top,i=0,sp0=o.top,sp1=o.bottom;
    while(y>bot&&i<4000){
      var t=(top-y)/(top-bot),u=R.unit(R.hash(seed,k,i,1)),sp=(sp0+(sp1-sp0)*t)*(1+o.jitter*(u-.5)*2);
      y-=sp;if(y<=bot)break;
      var s=.3+.7*R.unit(R.hash(seed,k,i,2));
      out.push({level:y,s:s,w:Math.min(o.wmax,.4*sp),year:0});i++;}
    return out;}

  function create(o){
    if(!R)throw new Error('KBASIN needs core/rand (KRAND) loaded first');
    o=o||{};var seed=o.seed==null?1:o.seed,age=o.age==null?1000:o.age,rec=o.recession==null?600:o.recession;
    var so=Object.assign({top:12,bottom:3,jitter:.45,wmax:4,a:.75},o.strand||{});
    var wx=(o.wind||[1,0])[0],wz=(o.wind||[1,0])[1],wl=Math.sqrt(wx*wx+wz*wz)||1;wx/=wl;wz/=wl;
    var yo=Object.assign({h:7,len:420,gap:55},o.yardang||{});
    var lakes=(o.lakes||[]).map(function(L,k){
      if(L.level==null||L.remnant==null)throw new Error('KBASIN: lake '+k+' needs a level and a remnant');
      if(L.kind!=='flood'&&L.sill==null)throw new Error('KBASIN: dam lake '+(L.name||k)+' needs its sill');
      var Lk=Object.assign({kind:'dam',ring:30},L);Lk.strands=strands(Lk,k,seed,so);
      var top=Lk.kind==='flood'?Lk.level:Lk.sill;
      Lk.strands.forEach(function(S){S.year=yearOf(Lk,S.level);});
      Lk._top=top;return Lk;});
    // when the water left height h in lake L, in years after the flood: a dam lake's ring and drain band at once (0);
    // under its sill (a flood lake: under its level) evenly over the recession down to its lake today
    function yearOf(L,h){var top=L.kind==='flood'?L.level:L.sill;if(h>=top)return 0;
      return rec*clamp((top-h)/(top-L.remnant),0,1);}
    var NONE={lake:-1,depth:0,band:0,bed:0,ring:0,shore:0,strand:0,strandD:1e9,silt:0,salt:0,yard:0,dry:0,m:0};
    function nearest(L,h){   // the strandline nearest h: binary search on the descending levels
      var a=L.strands,lo=0,hi=a.length-1;if(hi<0)return null;
      while(hi-lo>1){var mid=(lo+hi)>>1;if(a[mid].level>h)lo=mid;else hi=mid;}
      return Math.abs(a[lo].level-h)<=Math.abs(a[hi].level-h)?a[lo]:a[hi];}
    function sample(x,z,h,out){
      out=out||{};for(var key in NONE)out[key]=NONE[key];
      var best=-1,bestT=-1,bestK=-1,bed=0,bm=0,t0=0,under=false;
      // a flood lake that filled a dam basin: once it fell to that basin's sill, the water under the sill was the
      // basin's own and fell on its own from then (t0); the flood lake does not reach under the sill
      for(var k0=0;k0<lakes.length;k0++){var D0=lakes[k0];if(D0.kind==='flood'||!(D0.member(x,z)>0)||h>=D0.sill)continue;under=true;
        for(var k1=0;k1<lakes.length;k1++){var F0=lakes[k1];if(F0.kind==='flood'&&F0.member(x,z)>0&&F0.level>D0.sill)t0=Math.max(t0,yearOf(F0,D0.sill));}}
      for(var k=0;k<lakes.length;k++){var L=lakes[k],m=L.member(x,z);if(!(m>0))continue;
        var d=L.level-h;if(d<-SHORE_M)continue;
        bed=Math.max(bed,m*smooth(-1,2,d));
        if(d<0||(under&&L.kind==='flood'))continue;
        var t=yearOf(L,h)+(L.kind==='flood'?0:(h<L.sill?t0:0)),tk=t+(d>0?1e-6:0);if(tk>bestK){bestK=tk;bestT=t;best=k;bm=m;}}
      out.bed=bed;
      // the full level's line, either side of it (also above the water, where the beach ridge stands)
      for(var j=0;j<lakes.length;j++){var Lj=lakes[j],mj=Lj.member(x,z);if(!(mj>0))continue;
        var sh=mj*(1-smooth(0,SHORE_M,Math.abs(h-Lj.level)));if(sh>out.shore)out.shore=sh;}
      if(best<0)return out;
      var L2=lakes[best],dep=L2.level-h;
      out.lake=best;out.depth=dep;out.m=bm;out.dry=Math.max(0,age-Math.max(0,bestT));
      if(h<L2.remnant)out.band=BAND.water;
      else if(L2.kind==='flood')out.band=dep<HIGH_M?BAND.high:BAND.recession;
      else out.band=dep<L2.ring?BAND.ring:h>=L2.sill?BAND.drain:BAND.recession;
      if(L2.kind!=='flood')out.ring=bm*smooth(0,2,dep)*(1-smooth(L2.ring-2,L2.ring+2,dep));
      var S=out.band===BAND.recession?nearest(L2,h):null;
      if(S){out.strandD=h-S.level;out.strand=bm*S.s*(1-smooth(0,S.w,Math.abs(h-S.level)));}
      // lake sediment: thicker where the water stood deep; the fast drain's slopes keep less of it
      out.silt=bm*smooth(0,30,dep)*(out.band===BAND.drain||out.band===BAND.ring?.6:1);
      // salt: the slow recession concentrated it toward today's water; the flood lake's water was fresher
      if(out.band===BAND.recession||out.band===BAND.water){var f=clamp((L2._top-h)/(L2._top-L2.remnant),0,1);
        out.salt=bm*f*f*(L2.kind==='flood'?.5:1);}
      out.yard=out.silt*smooth(150,500,out.dry)*(1-smooth(.55,.9,out.salt));
      return out;}
    var SMP={};
    function land(x,z,h){
      var s=sample(x,z,h,SMP),y=h;
      if(s.lake<0&&s.shore<=0)return h;
      // the full levels: a bench, and a beach ridge just over a long-held one
      for(var k=0;k<lakes.length;k++){var L=lakes[k],m=L.member(x,z);if(!(m>0))continue;
        var long=L.kind!=='flood',wb=long?3:1.5,u=(h-L.level)/wb;
        y+=m*(long?.75:.4)*wb*bench(u);
        if(long){var r=(h-L.level-2)/1.8;if(r>-1&&r<1){var v=1-r*r;y+=m*2*v*v;}}}
      if(s.lake<0)return y;
      var L2=lakes[s.lake];
      if(s.band===BAND.recession){var S=nearest(L2,h);
        // only a strandline whose bench lies wholly on its lake's side of a sill: where a flood lake hands over to a dam
        // basin's own water, neither side's bench crosses the sill, so the ground is continuous there
        var lo=-1e9,hi=1e9;
        for(var k2=0;k2<lakes.length;k2++){var D=lakes[k2];if(D.kind==='flood'||!(D.member(x,z)>0))continue;
          if(L2===D)hi=Math.min(hi,D.sill);else if(L2.kind==='flood'&&D.sill<L2.level)lo=Math.max(lo,D.sill);}
        if(S&&S.level-S.w>=lo&&S.level+S.w<=hi)y+=s.m*so.a*S.s*S.w*bench((h-S.level)/S.w);}
      // yardangs: long ridges along the wind in the dry silt, a gap of silt between each (h only adds)
      if(s.yard>0){var al=x*wx+z*wz,ac=-x*wz+z*wx;
        var n=R.vnoise(al/yo.len,ac/yo.gap,0,R.hash(seed,77));
        y+=s.yard*yo.h*smooth(.45,.7,n);}
      return y;}
    return {lakes:lakes,sample:sample,land:land,yearOf:function(k,h){return yearOf(lakes[k],h);},
            FIELDS:['bed','ring','shore','strand','silt','salt','yard','dry','band']};}

  function fromRegion(P,member,opt){
    opt=opt||{};
    var lakes=(P.lakes||[]).map(function(L){
      var rem=L.remnants&&L.remnants.length?L.remnants[0].level_m:(L.sill_m!=null?L.sill_m:L.level_m)-50;
      return {name:L.name,kind:L.kind==='flood lake'?'flood':'dam',level:L.level_m,sill:L.sill_m,ring:L.ring_m==null?30:L.ring_m,
              remnant:rem,bit:L.bit,member:function(x,z){return member(L.bit,x,z);}};});
    return create(Object.assign({},opt,{lakes:lakes}));}

  root.KBASIN={create:create,fromRegion:fromRegion,BAND:BAND,bench:bench};
})(typeof window!=='undefined'?window:globalThis);
