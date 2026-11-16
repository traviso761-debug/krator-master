// ================================================================= CORE — geodes: where they lie, and a walk-in one (KGEODE)  [G data]
// biomes/CRYSTAL-CAVES-5.1.md site 3 (2026-11-09; the scablands' coulee first: biomes/scablands/PLAN.md, "Geodes"). A flood basalt's gas
// bubbles rise to the top of each flow and are filled, ages later, by silica groundwater: an agate rind, amethyst points inside. So geodes lie
// in a BAND under each flow's top, show in a cliff that cuts it, and weather out onto the ground below. This module places them as plain
// records from the host's bands and ground, and builds the one walk-in geode a station shows: a fallen block of a flow top, split open along
// its geode, carved in a KCAVERN (a mass and a hall), lined by KGEODE.line. No THREE, no DOM: plain maths, node-tested
// (test-geode.js). Every draw is KRAND.hash(world, cell i, cell j, salt): a tile placed alone gets what the whole box gets there.
// Axes: y up, metres, x east, z south.
//
//   const R = KGEODE.scatter({box:[x0, z0, x1, z1], world, cell (5), bands:[{y0, y1, id}], ground (x, z) => y, normal (x, z) => [nx, ny, nz],
//        near (x, z) => bool (a cheap filter: the cells worth a look; all), wall {p (.3), steep (.5)}, loose {p (.12), steep (.32), below (60)},
//        r [.12, .45] (m), split (.45: a loose geode's chance to lie broken), minerals ({amethyst: 1}: weights over KGEODE.MINERALS' ids, the
//        host's palette for its rock), accept (rec) => bool})
//     wall:  a cell whose point is in a band, its ground steeper than `steep` (1 - ny): a geode broken open by the cut, half its shell left in
//            the rock, its cut face out along the ground's normal
//     loose: a cell whose ground is gentler than `steep` and lies within `below` m under a band's foot: a geode weathered out and fallen,
//            whole or (by `split`) in halves
//     -> [{id, kind ('wall'|'loose'), x, y, z (on the ground), r, split, n [nx, ny, nz] (the cut face's or the ground's), az, tilt, rind (m),
//         mineral (a KGEODE.MINERALS id, drawn from `minerals`), shape [1, sz] (its cross-section: an oval, not a ball), pair {x, y, z} (a loose
//         broken one's other half on the ground beside it, half the time), band (its id)}]
//   KGEODE.MINERALS {id: {crust, rind, natural, note}} what fills a geode: `crust` the crystals' habit (points, blades, pillars, prisms, hoppers),
//        `rind` the band palette round the cavity (agate, chalk, chrysocolla, watermelon, aura, metal), `natural` false for the two a basalt
//        never grows (aura and bismuth hoppers: a fantasy or an Ancient anomaly's palette). KGEODE.ORDER: their ids in the order a palette
//        draws them (fixed, so a palette's pick is the same in any engine).
//   KGEODE.around({sources: [{x, z, R, s}], world, ground, normal, n [0, 3] (pockets a source: s (0..1, its strength) scales the
//        count), reach (.6: of R), r [.1, .3], minerals ({bismuth: 1}), steep (.6: none on ground steeper), accept})
//     pockets broken open round a set of sources (a vent's fumaroles: no flow band, the heat decides): each a 'vent' record as a
//     broken loose geode's, its `source` the index it came from. Drawn by KGEODE.draw as any broken one.
//     -> [{id, kind:'vent', x, y, z, r, split: true, n, az, tilt, rind, mineral, shape, source}]
//   KGEODE.block(C, {id, x, z, ground, face (rad: the broken face's outward bearing, x toward z), w (9), d (8), h (7), r (2.3), ph (4.4),
//        world, name})   an unbuilt KCAVERN: adds the block (C.mass, irregular in plan, capped), the pocket (C.hall: a round geode cavity its
//        broken face cuts open) and a door opening on that face. Call before C.build().
//     -> {id, kind:'block', name, x, z, y (the ground at its middle), poly, y0, y1, face, n [nx, nz], pocket: {id, c [x, y, z], r, h,
//         door [x, z], y (its floor)}}
//   KGEODE.line(C, block, {n (900), len [.06, .38], world, mineral ('amethyst')})   a built KCAVERN and KGEODE.block's record: the pocket's lining, amethyst points on
//        its wall aimed at its middle (rays from the middle to the block's rock; those out of the broken face grow nothing)
//     -> [{id, kind:'point', x, y, z, d [dx, dy, dz] (inward), len, w (its width over its length), spin, depth (0 at the broken face's rim,
//         1 at the back of the pocket: the points grow longer and darker inward, the rim a white quartz band), mineral}]
//   KGEODE.export(recs) -> {format:'krator-geodes', version:1, records}
// Godot: the records cross as data; the drawing is core/terrain/host/39g-core-geode-draw.js's (instanced pieces), the block KCAVERN's export.
(function(root){
  'use strict';
  function KR(){var K=root.KRAND;if(!K)throw new Error('KGEODE: load core/rand/08-core-rand.js first');return K;}
  function d(v,x){return v==null?x:v;}
  function rng(a,t){return a[0]+(a[1]-a[0])*t;}
  var MINERALS={
    amethyst:{crust:'points',rind:'agate',natural:true,note:'the flood basalts own (Uruguay, Brazil): white quartz at the rim, purple deepening inward'},
    quartz:{crust:'points',rind:'agate',natural:true,note:'clear and milky quartz points'},
    celestine:{crust:'blades',rind:'chalk',natural:true,note:'pale blue bladed crystals (sedimentary: rare in a basalt)'},
    chalcedony:{crust:'pillars',rind:'chrysocolla',natural:true,note:'botryoidal blue chalcedony in stalactite pillars, a green crust outside'},
    watermelon:{crust:'prisms',rind:'watermelon',natural:true,note:'pink and green bands round lavender druse, tourmaline prisms green at the foot and pink at the tip'},
    aura:{crust:'points',rind:'aura',natural:false,note:'an iridescent film on the rind and points (a coated quartz: never a basalt geode)'},
    bismuth:{crust:'hoppers',rind:'metal',natural:false,note:'stepped hopper crystals in oxide colours (grown from a melt, never in a geode)'}};
  var ORDER=['amethyst','quartz','celestine','chalcedony','watermelon','aura','bismuth'];
  function pickMineral(W,t){if(!W)return 'amethyst';var tot=0,i;for(i=0;i<ORDER.length;i++)tot+=Math.max(0,+W[ORDER[i]]||0);if(!(tot>0))return 'amethyst';
    var a=t*tot;for(i=0;i<ORDER.length;i++){var w=Math.max(0,+W[ORDER[i]]||0);if(w<=0)continue;if(a<w)return ORDER[i];a-=w;}
    for(i=ORDER.length-1;i>=0;i--)if((+W[ORDER[i]]||0)>0)return ORDER[i];return 'amethyst';}
  function scatter(o){var K=KR();o=o||{};
    if(!o.box||o.box.length!==4)throw new Error('KGEODE.scatter: box [x0, z0, x1, z1]');if(typeof o.ground!=='function'||typeof o.normal!=='function')throw new Error('KGEODE.scatter: ground and normal');
    var B=o.bands||[],cell=d(o.cell,5),W=o.wall||{},L=o.loose||{},pw=d(W.p,.3),sw=d(W.steep,.5),pl=d(L.p,.12),sl=d(L.steep,.32),below=d(L.below,60),
      R=o.r||[.12,.45],sp=d(o.split,.45),world=d(o.world,1),out=[];
    if(!(cell>0))throw new Error('KGEODE.scatter: cell > 0');
    if(o.minerals)Object.keys(o.minerals).forEach(function(k){if(!MINERALS[k])throw new Error('KGEODE.scatter: no mineral '+k);});
    var i0=Math.floor(o.box[0]/cell),i1=Math.floor(o.box[2]/cell),j0=Math.floor(o.box[1]/cell),j1=Math.floor(o.box[3]/cell);
    for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++){var h=K.hash(world,i,j,0x6E0),u=function(k){return K.unit(K.hash(h,k));};
      var x=(i+u(1))*cell,z=(j+u(2))*cell;if(x<o.box[0]||x>o.box[2]||z<o.box[1]||z>o.box[3])continue;if(o.near&&!o.near(x,z))continue;
      var pick=u(3);if(pick>=Math.max(pw,pl))continue;   /* most cells hold none: decided before the ground is read */
      var y=o.ground(x,z),n=o.normal(x,z),steep=1-n[1],band=null,k;
      for(k=0;k<B.length;k++)if(y>=B[k].y0&&y<=B[k].y1){band=B[k];break;}
      var rec=null,r=rng(R,u(4)),az=u(5)*2*Math.PI;
      if(band&&steep>=sw&&pick<pw)rec={kind:'wall',split:true,n:n.slice(),band:band.id};
      else if(steep<=sl&&pick<pl){var bb=null;for(k=0;k<B.length;k++){var dy=B[k].y0-y;if(dy>0&&dy<=below&&(!bb||dy<bb.dy))bb={b:B[k],dy:dy};}
        if(bb)rec={kind:'loose',split:u(6)<sp,n:n.slice(),band:bb.b.id};}
      if(!rec)continue;
      rec.id='geode:'+i+','+j;rec.x=x;rec.y=y;rec.z=z;rec.r=rec.kind==='wall'?r*1.4:r;rec.az=az;rec.tilt=rec.kind==='loose'?u(7)*.9:0;
      rec.rind=rec.r*(.12+.1*u(8));rec.mineral=pickMineral(o.minerals,u(9));rec.shape=[1,.62+.38*u(10)];
      /* a loose broken geode: half the time both halves lie on the ground, side by side (the second's place and ground read here: the drawing decides nothing) */
      if(rec.kind==='loose'&&rec.split&&u(11)<.5){var pa=az+Math.PI/2,px=x+Math.cos(pa)*rec.r*2.4,pz=z+Math.sin(pa)*rec.r*2.4;rec.pair={x:px,y:o.ground(px,pz),z:pz};}
      if(o.accept&&!o.accept(rec))continue;out.push(rec);}
    return out;}
  function block(C,o){var K=KR();o=o||{};if(!C||typeof C.mass!=='function'||typeof C.hall!=='function')throw new Error('KGEODE.block: an unbuilt KCAVERN');
    if(typeof o.ground!=='function')throw new Error('KGEODE.block: ground');
    var id=o.id||'geode-block',w=d(o.w,9),dd=d(o.d,8),hh=d(o.h,7),r=d(o.r,2.3),ph=d(o.ph,4.4),world=d(o.world,1),fa=d(o.face,0);
    var nx=Math.cos(fa),nz=Math.sin(fa),tx=-nz,tz=nx,u=function(k){return K.unit(K.hash(world,0x6E1,k));};
    /* the block in plan: a box knocked irregular (its corners pulled in by a hash), the face side along +n */
    var corners=[[1,1],[-1,1],[-1,-1],[1,-1]],poly=[];
    corners.forEach(function(c,k){var a=c[0]*dd/2*(1-.18*u(10+k)),b=c[1]*w/2*(1-.18*u(20+k));poly.push([o.x+nx*a+tx*b,o.z+nz*a+tz*b]);
      var m=corners[(k+1)%4],a2=(c[0]+m[0])/2*dd/2,b2=(c[1]+m[1])/2*w/2,j=1-.12*u(30+k);poly.push([o.x+nx*a2*j+tx*b2*j,o.z+nz*a2*j+tz*b2*j]);});
    var gmin=1e9,gmax=-1e9;poly.forEach(function(p){var g=o.ground(p[0],p[1]);gmin=Math.min(gmin,g);gmax=Math.max(gmax,g);});
    var g0=o.ground(o.x,o.z),y0=gmin-1.5,y1=gmax+hh;
    C.mass({id:id,owner:'geode',poly:poly,y0:y0,y1:y1,taper:.1,cap:1.2});
    /* the pocket: a round cavity whose front the broken face cuts away; its floor a little over the ground at the face, so one steps in */
    /* its floor over the ground everywhere under it (a host's drawn ground runs on under the block: on a slope it would cross the pocket) */
    var fd=dd/2*(1-.09),cx=o.x+nx*(fd-r*.55),cz=o.z+nz*(fd-r*.55),fx=o.x+nx*fd,fz=o.z+nz*fd,gu=Math.max(o.ground(fx,fz),gmin);
    for(var a2=0;a2<16;a2++)for(var rr=0;rr<=r*1.25;rr+=r*.25)gu=Math.max(gu,o.ground(cx+Math.cos(a2/16*2*Math.PI)*rr,cz+Math.sin(a2/16*2*Math.PI)*rr));
    var fy=gu+.35;
    /* belly .42: round, its widest a little under half way up (KCAVERN's hall needs belly < .5: at .5 its half-axes divide by zero) */
    C.hall({id:id+':pocket',owner:'geode',c:[cx,fy,cz],rx:r,rz:r,h:ph,belly:.42,blend:1});
    C.opening({id:id+':door',kind:'door',c:[fx,fz],y:fy,r:r,h:ph});
    return {id:id,kind:'block',name:o.name||'A fallen block of a flow top, split open along its geode',x:o.x,z:o.z,y:g0,poly:poly,y0:y0,y1:y1,face:fa,n:[nx,nz],
      pocket:{id:id+':pocket',c:[cx,fy,cz],r:r,h:ph,door:[fx,fz],y:fy}};}
  function around(o){var K=KR();o=o||{};if(!o.sources||typeof o.ground!=='function'||typeof o.normal!=='function')throw new Error('KGEODE.around: sources, ground and normal');
    if(o.minerals)Object.keys(o.minerals).forEach(function(k){if(!MINERALS[k])throw new Error('KGEODE.around: no mineral '+k);});
    var world=d(o.world,1),NR=o.n||[0,3],reach=d(o.reach,.6),R=o.r||[.1,.3],st=d(o.steep,.6),pal=o.minerals||{bismuth:1},out=[];
    o.sources.forEach(function(S,si){var h=K.hash(world,0x6E3,si),u=function(k){return K.unit(K.hash(h,k));},s=S.s==null?1:S.s,
      n=Math.floor((NR[0]+(NR[1]+1-NR[0])*u(0))*s);
      for(var k=0;k<n;k++){var a=u(10+k)*2*Math.PI,dd=Math.sqrt(u(20+k))*S.R*reach,x=S.x+Math.cos(a)*dd,z=S.z+Math.sin(a)*dd,nn=o.normal(x,z);
        if(1-nn[1]>st)continue;
        var rr=rng(R,u(30+k)),rec={id:'vent:'+si+':'+k,kind:'vent',x:x,y:o.ground(x,z),z:z,r:rr,split:true,n:nn.slice(),az:u(40+k)*2*Math.PI,tilt:u(50+k)*.7,
          rind:rr*(.1+.08*u(60+k)),mineral:pickMineral(pal,u(70+k)),shape:[1,.6+.4*u(80+k)],source:si};
        if(o.accept&&!o.accept(rec))continue;out.push(rec);}});
    return out;}
  /* the lining: points on a Fibonacci sphere of directions out from the pocket's middle, each marched to the rock it meets (within 1.7 r: a
     ray that leaves by the broken face finds none and grows nothing), set on the wall aimed back at the middle, as a geode's crystals grow.
     (KSPELEO's druse stands up or hangs down, and KCAVERN's ceilingAt reads a void above the ground as under the sky, so KSPELEO does not
     dress a pocket in a mass: KGEODE lines its own) */
  function inPoly(Pl,x,z){var s=false;for(var i=0,j=Pl.length-1;i<Pl.length;j=i++){var a=Pl[i],b=Pl[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])s=!s;}return s;}
  function line(C,Bk,o){var K=KR();o=o||{};if(!C||typeof C.sdf!=='function')throw new Error('KGEODE.line: a built KCAVERN');if(!Bk||!Bk.pocket||!Bk.poly)throw new Error('KGEODE.line: a KGEODE.block record');
    var P=Bk.pocket,nx=Bk.n[0],nz=Bk.n[1],n=d(o.n,900),L=o.len||[.06,.38],world=d(o.world,1),c=[P.c[0],P.y+P.h*.45,P.c[2]],out=[],ga=Math.PI*(3-Math.sqrt(5));
    for(var i=0;i<n;i++){var yy=1-2*(i+.5)/n,rr=Math.sqrt(1-yy*yy),a=i*ga,dx=Math.cos(a)*rr,dy=yy,dz=Math.sin(a)*rr,t=0,s=1,hit=false;
      for(var k=0;k<200&&t<P.r*1.7;k++){s=C.sdf(c[0]+dx*t,c[1]+dy*t*(P.h*.5/P.r),c[2]+dz*t);if(s<=.02){hit=true;break;}t+=Math.max(.03,s*.8);}
      if(!hit)continue;
      /* the rock it met is the block's: inside its plan (the pocket's floor may be under the ground on a slope: still the block's); a ray out of
         the broken face meets the ground outside it, and nothing grows there */
      if(!inPoly(Bk.poly,c[0]+dx*(t+.15),c[2]+dz*(t+.15)))continue;
      var h=K.hash(world,0x6E2,i),u=function(q){return K.unit(K.hash(h,q));};
      /* its depth: how far back from the broken face's plane (through the door), over the pocket's reach behind it */
      var px=c[0]+dx*t,pz=c[2]+dz*t,back=-((px-P.door[0])*nx+(pz-P.door[1])*nz),dp=Math.max(0,Math.min(1,back/(P.r*1.55)));
      out.push({id:P.id+':pt'+i,kind:'point',x:px,y:c[1]+dy*t*(P.h*.5/P.r),z:pz,d:[-dx,-dy,-dz],len:rng(L,u(1)*u(2))*(.45+.85*dp),w:.5+.3*u(3),spin:u(4)*2*Math.PI,depth:dp,mineral:o.mineral||'amethyst'});}
    return out;}
  root.KGEODE={MINERALS:MINERALS,ORDER:ORDER,pick:pickMineral,scatter:scatter,around:around,block:block,line:line,export:function(R){return {format:'krator-geodes',version:1,records:JSON.parse(JSON.stringify(R))};}};
})(typeof window!=='undefined'?window:globalThis);
