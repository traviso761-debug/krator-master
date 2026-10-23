// ================================================================= CORE — scour: a megaflood's channels on a heightfield world
// [G data] Plain maths of (x, z, h): no THREE, no DOM, no Math.random, no Math.sin or exp (only + - * / floor sqrt), the
// draws from core/rand (KRAND), so a Godot port reproduces it. Needs KRAND (core/rand/08-core-rand.js) loaded first.
// The overlay "the scablands" reads it (biomes/nsemiarid/PLAN.md, sections 4 and 6): a flood that tore down a course
// (the scale model's DATA.floods, in metres in region.json "palaeo".floods) and is gone. The heights the world already
// has hold the channel at 4 km; this adds what lies under a cell: the scoured floor, butte-and-basin, streamlined
// islands, dry falls with the basins below them, potholes, bars and giant current ripples, and the rock they cut.
//
//   const S = KSCOUR.create({courses:[{name, pts:[[x,z],...], bed:[m,...], floor, walls, depth, islandL, islandW, fan}],
//                            seed, strata:{...}, falls:{count, spacing, slope, steepen, min, max, taper}})
//     pts        the course downstream, metres; bed: its bed's heights, spread evenly along it first to last
//     floor      the channel floor's full width (m); walls: how far the scour reaches past it each side (m)
//     depth      the flood's depth over the bed (m, default 150): the water surface that drew the scour
//     islandL, islandW  the streamlined islands' scale along and across the flow (m, default 9000 and 2600: the world's;
//                a station a few km across takes smaller); fan: how far up from the course's end its fan of bars reaches
//                (m, default 12000; 0 for none: a station's course that ends at its edge, not in a basin)
//   S.courses[k].falls   the dry falls: [{s, x, z, h (m), r (the horseshoe's radius, m)}], found where the bed steepens
//   S.locate(x,z,out)    the nearest course within its reach: {k, s (m along), d (m across, + to the right going
//                        downstream), tx, tz (its direction), bed, surf (the flood's surface)}, or out.k = -1
//   S.sample(x,z,h,out)  the scour at a point: scour 0..1 (the floor 1, the walls fading), island 0..1 (a streamlined
//                        hill the flood went round: its ground and flora untouched), bar 0..1 (gravel: the channel's
//                        margins and the fan where the flood spread out), ripple 0..1 (a current ripple's crest),
//                        pothole 0..1, fall 0..1 (the cliff of a dry fall), pool 0..1 (the basin under a fall), and
//                        k, s, d as locate
//   S.land(x,z,h)        h with the scour: butte-and-basin cut in steps of the rock's flows, the falls and their basins,
//                        potholes, bars with ripples on them; the islands kept at the ground's own height
//   S.potholes(x0,z0,x1,z1)  the potholes whose centres lie in the box: [{x, z, r, v}] (v their strength, 0.4..1)
//   S.rock(h,out)        the rock at a height (KSCOUR.strata(opt) makes the same table on its own): {kind:'cover'|
//                        'basalt'|'interbed'|'sandstone'|'limestone', flow (index), colonnade 0..1 (the regular columns at
//                        a flow's foot; the rest of the flow is the hackly entablature)}
(function(root){
  'use strict';
  var R=root.KRAND;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function smooth(a,b,x){var t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);}

  // ---------------------------------------------------------------- the rock: flood basalt over a sedimentary basement
  // (the owner, 2026-10-20: igneous and sedimentary both; as under Washington's scablands). From basaltBase up to
  // basaltTop, flows flowMin..flowMax m thick, each topped by an interbed (a red weathered bed) `interbed` m thick;
  // below, sandstone and limestone in beds 20..60 m; above basaltTop, cover (loess and soil)
  function strata(o){
    o=Object.assign({basaltTop:1400,basaltBase:600,flowMin:15,flowMax:50,interbed:3,seed:7},o||{});
    var tops=[],y=o.basaltBase,k=0;
    while(y<o.basaltTop&&k<1000){y+=o.flowMin+(o.flowMax-o.flowMin)*R.unit(R.hash(o.seed,k,11));tops.push(Math.min(y,o.basaltTop));k++;}
    var beds=[],yb=o.basaltBase,j=0;
    while(yb>o.basaltBase-4000&&j<1000){yb-=20+40*R.unit(R.hash(o.seed,j,12));beds.push(yb);j++;}
    function rock(h,out){out=out||{};out.flow=-1;out.colonnade=0;
      if(h>=o.basaltTop){out.kind='cover';return out;}
      if(h<o.basaltBase){var b=0;while(b<beds.length&&beds[b]>h)b++;out.kind=b%2?'limestone':'sandstone';out.flow=b;return out;}
      var lo=0,hi=tops.length-1;while(lo<hi){var mid=(lo+hi)>>1;if(tops[mid]>h)hi=mid;else lo=mid+1;}
      var top=tops[lo],bot=lo?tops[lo-1]:o.basaltBase;
      out.flow=lo;out.kind=top-h<o.interbed?'interbed':'basalt';out.colonnade=out.kind==='basalt'?1-smooth(.28,.38,(h-bot)/(top-bot)):0;
      return out;}
    return {rock:rock,tops:tops,opt:o};}

  function create(o){
    if(!R)throw new Error('KSCOUR needs core/rand (KRAND) loaded first');
    o=o||{};var seed=o.seed==null?1:o.seed;
    var fo=Object.assign({count:3,spacing:15000,slope:.002,steepen:2,min:40,max:110,taper:3000},o.falls||{});
    var ST=strata(Object.assign({seed:seed},o.strata||{}));
    var CELL=4000,grid={};   // a bucket of segments per 4 km cell, so locate looks at a few
    var courses=(o.courses||[]).map(function(c,k){
      if(!c.pts||c.pts.length<2)throw new Error('KSCOUR: course '+k+' needs two points or more');
      if(!c.bed||c.bed.length<2)throw new Error('KSCOUR: course '+k+' needs its bed');
      var C={name:c.name,pts:c.pts,bed:c.bed,floor:c.floor==null?12000:c.floor,walls:c.walls==null?8000:c.walls,
             depth:c.depth==null?150:c.depth,islandL:c.islandL||9000,islandW:c.islandW||2600,fan:c.fan==null?12000:c.fan,cum:[0]};
      C.seed=R.child(seed,c.name||('course '+k));   // keyed on the course's name, not its place in the list
      for(var i=1;i<c.pts.length;i++){var dx=c.pts[i][0]-c.pts[i-1][0],dz=c.pts[i][1]-c.pts[i-1][1];
        C.cum.push(C.cum[i-1]+Math.sqrt(dx*dx+dz*dz));}
      C.len=C.cum[C.cum.length-1];
      if(!(C.len>0))throw new Error('KSCOUR: course '+k+' has no length');
      C.reach=C.floor/2+C.walls;
      var r=Math.ceil(C.reach/CELL);
      for(var j=1;j<c.pts.length;j++){var a=c.pts[j-1],b=c.pts[j];
        var i0=Math.floor(Math.min(a[0],b[0])/CELL)-r,i1=Math.floor(Math.max(a[0],b[0])/CELL)+r;
        var j0=Math.floor(Math.min(a[1],b[1])/CELL)-r,j1=Math.floor(Math.max(a[1],b[1])/CELL)+r;
        for(var gi=i0;gi<=i1;gi++)for(var gj=j0;gj<=j1;gj++){var key=gi+','+gj;(grid[key]||(grid[key]=[])).push([k,j]);}}
      return C;});
    function bedAt(C,s){var n=C.bed.length-1,u=clamp(s/C.len,0,1)*n,i=Math.min(n-1,Math.floor(u));return C.bed[i]+(C.bed[i+1]-C.bed[i])*(u-i);}
    function pointAt(C,s){s=clamp(s,0,C.len);var i=1;while(i<C.cum.length-1&&C.cum[i]<s)i++;
      var a=C.pts[i-1],b=C.pts[i],t=(s-C.cum[i-1])/((C.cum[i]-C.cum[i-1])||1);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
    // the dry falls: where the bed falls steepest over a reach of `spacing`, at least `steepen` times the course's mean
    // fall and at least `slope`, up to `count` per course, no two within `spacing`; a fall's height grows with how much
    // steeper the reach is. From the data alone: no draws
    courses.forEach(function(C){
      var n=Math.max(2,Math.floor(C.len/(fo.spacing/4))),cand=[],mean=(C.bed[0]-C.bed[C.bed.length-1])/C.len,thr=Math.max(fo.slope,fo.steepen*mean);
      for(var i=0;i<=n;i++){var s=C.len*i/n,s0=Math.max(0,s-fo.spacing/2),s1=Math.min(C.len,s+fo.spacing/2);
        var sl=(bedAt(C,s0)-bedAt(C,s1))/((s1-s0)||1);if(sl>=thr)cand.push({s:s,sl:sl});}
      cand.sort(function(a,b){return b.sl-a.sl||a.s-b.s;});
      C.falls=[];
      for(var c=0;c<cand.length&&C.falls.length<fo.count;c++){var f=cand[c];
        if(f.s<fo.taper||f.s>C.len-fo.taper)continue;
        if(C.falls.some(function(g){return Math.abs(g.s-f.s)<fo.spacing;}))continue;
        var p=pointAt(C,f.s),hgt=clamp(fo.min+(fo.max-fo.min)*(f.sl-thr)/(thr*2),fo.min,fo.max);
        C.falls.push({s:f.s,x:p[0],z:p[1],h:hgt,r:C.floor*.35});}
      C.falls.sort(function(a,b){return a.s-b.s;});});
    var LOC={k:-1};
    function locate(x,z,out){
      out=out||LOC;out.k=-1;var cell=grid[Math.floor(x/CELL)+','+Math.floor(z/CELL)];if(!cell)return out;
      var bd=1e18;
      for(var q=0;q<cell.length;q++){var k=cell[q][0],j=cell[q][1],C=courses[k],a=C.pts[j-1],b=C.pts[j];
        var ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez,t=clamp(((x-a[0])*ex+(z-a[1])*ez)/(L2||1),0,1);
        var px=a[0]+ex*t,pz=a[1]+ez*t,dd=(x-px)*(x-px)+(z-pz)*(z-pz);
        if(dd<bd&&dd<=C.reach*C.reach){bd=dd;var l=Math.sqrt(L2)||1;
          out.k=k;out.tx=ex/l;out.tz=ez/l;out.s=C.cum[j-1]+t*l;
          out.d=(x-px)*(-out.tz)+(z-pz)*out.tx;}}
      if(out.k>=0){var C2=courses[out.k];out.bed=bedAt(C2,out.s);out.surf=out.bed+C2.depth;}
      return out;}
    var SL={};
    function sample(x,z,h,out){
      out=out||{};out.scour=0;out.island=0;out.bar=0;out.ripple=0;out.pothole=0;out.fall=0;out.pool=0;out.k=-1;
      var p=locate(x,z,SL);if(p.k<0)return out;
      var C=courses[p.k],ad=Math.abs(p.d),half=C.floor/2;
      out.k=p.k;out.s=p.s;out.d=p.d;
      // the scour: under the flood's surface, the floor in full, the walls fading out
      var sub=smooth(0,25,p.surf-h);
      out.scour=sub*(1-smooth(half,half+C.walls,ad));
      if(out.scour<=0)return out;
      // streamlined islands: blobs drawn out along the flow (anisotropic noise in course coordinates), in the floor
      var n=R.fbm(p.s/C.islandL,p.d/C.islandW,0,3,R.hash(C.seed,21));
      out.island=smooth(.6,.68,n)*(1-smooth(half*.85,half,ad));
      // bars: the floor's margins, and the fan where the course ends and the flood spread out
      out.bar=smooth(half*.45,half*.7,ad)*(1-smooth(half*.95,half*1.1,ad))+(C.fan>0?smooth(C.len-C.fan,C.len,p.s):0);
      out.bar=clamp(out.bar,0,1)*(1-out.island);
      // giant current ripples on the bars: crests across the flow, spaced by the flood's depth (~.6 of it)
      var lam=clamp(C.depth*.6,50,150),w=R.vnoise(p.s/600,p.d/600,0,R.hash(C.seed,22))*lam*.6;
      var ph=(p.s+w)/lam;ph-=Math.floor(ph);
      out.ripple=out.bar*(ph<.75?ph/.75:(1-ph)/.25);
      // the falls: the lip's horseshoe, its basin downstream
      for(var f=0;f<C.falls.length;f++){var F=C.falls[f],u=p.s-F.s,v=p.d/F.r;
        if(u<-F.r||u>fo.taper)continue;
        var lip=-F.r*(1-v*v)*.6;             // the lip bows upstream in the middle: the fall ate back headward
        if(ad<F.r){out.fall=Math.max(out.fall,(1-smooth(0,40,Math.abs(u-lip)))*(1-smooth(.85,1,Math.abs(v))));
          if(u>lip)out.pool=Math.max(out.pool,(1-smooth(fo.taper*.25,fo.taper*.6,u-lip))*(1-smooth(.6,1,Math.abs(v))));}}
      out.pothole=potholeAt(x,z)*out.scour*(1-out.island);
      return out;}
    // potholes (kolks): one chance in four per 120 m cell, its centre and size drawn from the cell (keyed on position);
    // a bowl 6..25 m across the radius, 4..15 m deep
    var PC=120;
    // the pothole of cell (i, j), or null: its centre, radius and strength at the centre (0.4..1)
    function kolk(i,j){var hs=R.hash(seed,i,j,31);if(R.unit(hs)>.25)return null;
      return {x:(i+.15+.7*R.unit(R.hash(hs,1)))*PC,z:(j+.15+.7*R.unit(R.hash(hs,2)))*PC,r:6+19*R.unit(R.hash(hs,3)),v:.4+.6*R.unit(R.hash(hs,4))};}
    function potholeAt(x,z){var ci=Math.floor(x/PC),cj=Math.floor(z/PC),best=0;
      for(var di=-1;di<=1;di++)for(var dj=-1;dj<=1;dj++){var K=kolk(ci+di,cj+dj);if(!K)continue;
        var dx=x-K.x,dz=z-K.z,q=(dx*dx+dz*dz)/(K.r*K.r);if(q<1){var v=(1-q)*K.v;if(v>best)best=v;}}
      return best;}
    // every pothole whose centre lies in the box, as {x, z, r, v}: where the field could hold one (the scour decides
    // whether it is cut: sample's pothole at the centre)
    function potholes(x0,z0,x1,z1){var out=[];
      for(var i=Math.floor(x0/PC);i<=Math.floor(x1/PC);i++)for(var j=Math.floor(z0/PC);j<=Math.floor(z1/PC);j++){var K=kolk(i,j);
        if(K&&K.x>=x0&&K.x<=x1&&K.z>=z0&&K.z<=z1)out.push(K);}
      return out;}
    var SM={},RK={};
    function land(x,z,h){
      var s=sample(x,z,h,SM);if(s.scour<=0)return h;
      var C=courses[s.k],y=h;
      // butte-and-basin: the floor cut down by up to 45 m, in steps of the rock's flows (a cut stops on a flow's top);
      // not under the bars, which the flood laid down
      var n=R.fbm(x/1800,z/1800,0,3,R.hash(C.seed,41)),cut=s.scour*(1-s.island)*(1-s.bar)*45*smooth(.3,.75,n);
      if(cut>0){var r=ST.rock(h-cut,RK),step=r.kind==='basalt'||r.kind==='interbed'?ST.tops[r.flow]-(r.flow?ST.tops[r.flow-1]:ST.opt.basaltBase):20;
        var q=cut/step,fq=q-Math.floor(q);cut=(Math.floor(q)+smooth(.7,1,fq))*step;cut=Math.min(cut,45*s.scour);}
      y-=cut;
      // the falls: the ground below the lip lowered by the fall's height, coming back up over `taper`: its basin
      for(var f=0;f<C.falls.length;f++){var F=C.falls[f],u=s.s-F.s,v=s.d/F.r;if(Math.abs(v)>=1||u<-F.r||u>fo.taper)continue;
        var lip=-F.r*(1-v*v)*.6;if(u<=lip-20)continue;
        var t=u-lip,drop=F.h*smooth(-20,20,t)*(1-smooth(fo.taper*.3,fo.taper,t))*(1-smooth(.8,1,Math.abs(v)));
        y-=drop;}
      y-=s.pothole*(4+11*s.pothole);
      // bars: gravel heaped up to 18 m on the margins and the fan, with the ripples 2..6 m on them
      y+=s.bar*18*(1-s.fall)+s.ripple*(2+4*s.bar);
      return y;}
    return {courses:courses,locate:locate,sample:sample,land:land,rock:ST.rock,strata:ST,potholes:potholes,
            FIELDS:['scour','island','bar','ripple','pothole','fall','pool']};}

  function fromRegion(P,opt){
    opt=opt||{};
    var courses=(P.floods||[]).map(function(f){return {name:f.name,pts:f.m,bed:f.bed_m,
      floor:f.floor_km==null?null:f.floor_km*1000,walls:f.walls_km==null?null:f.walls_km*1000,depth:opt.depth};});
    return create(Object.assign({},opt,{courses:courses}));}

  root.KSCOUR={create:create,fromRegion:fromRegion,strata:strata};
})(typeof window!=='undefined'?window:globalThis);
