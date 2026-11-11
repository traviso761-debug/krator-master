// ================================================================= CORE — relief: slumps, runouts, gullies, terraces, maars, relays, stepped cuts  [G data]
// The landform kinds the unbuilt biome plans still owed (audit of 2026-11-03; LANDFORMS.md beside this file):
//   slump     back-tilted blocks under a head scarp, uphill-facing scarps, sag ponds, sackung behind the crown
//             (biomes/wouterwall/PLAN.md section 4, the slump terraces; its stations 2-3)
//   runout    a sturzstrom lobe: hummocks, longitudinal grooves, megablocks, a raised rim, a lake dammed behind it (wouterwall)
//   gully     sheer loess gullies with amphitheatre (box-canyon) heads, and the yuan / liang / mao tablelands between them
//             (wouterwall stations 1 and 4)
//   terraces  contour-terraced fields: treads on the height lines, risers, bunds (wouterwall; loom-chasms' Cradle)
//   maar      a breached maar-diatreme: tuff ring, crater, breccia pipe and baked country rock in its walls, a fault cleaving one
//             rim open, an optional warm spring and its outflow (Mid Basin, tools/scale-model/smodel/se_provinces.py from l.108;
//             the Siphon Pits' pit floors)
//   relay     tilted fault blocks and the relay ramps between en-echelon scarps (Mid Basin's three basalt benches)
//   stepcut   a cut with sheer stepped walls and no falloff: a graben along a line, a pit round a centre (the Siphon Pits)
// Each is a RECORD first (plain data, JSON-safe; every draw KRAND.hash(seed, slot, ..., salt), never from how many draws came
// before), then the ground it leaves, on KRELIEF's composition as 38b-core-relief-lava.js does it: once this file is loaded,
// KRELIEF.shape, at, apply and kinds take the seven, and every other kind answers exactly as before. KRELIEF.waters(rec, ground)
// lists a record's standing water ({x, z, r, y, part}: sag ponds, the dammed lake, the maar's spring pool), [] for the others.
// Opt-in; needs core/rand and 38-core-relief.js. No THREE, no DOM; node core/terrain/test-landforms.js. Axes: y up, metres,
// x east, z south (north is -z, so a direction of -PI/2 points north). Defaults are written x == null ? d : x.
(function(root){
  'use strict';
  var KR=root.KRELIEF;
  if(!KR||!KR.shape||!KR.scarp)throw new Error('core/terrain 38c-core-landforms.js: load 38-core-relief.js first (KRELIEF)');
  if(KR._landforms)return;
  function KRq(){var K=root.KRAND;if(!K)throw new Error('KRELIEF landforms: load core/rand/08-core-rand.js first');return K;}
  var TAU=Math.PI*2;
  function d(v,x){return v==null?x:v;}
  function c01(v){return v<0?0:v>1?1:v;}
  function sm(a,b,v){var t=c01((v-a)/(b-a));return t*t*(3-2*t);}
  function lerp(a,b,t){return a+(b-a)*t;}
  function u01(K,seed,a,b,c){return K.unit(K.hash(seed,a,b,c));}
  function hidden(R,k,v){Object.defineProperty(R,k,{value:v,enumerable:false,configurable:true,writable:true});return v;}
  function seedOf(o){return (o.seed==null?1:o.seed)>>>0;}
  function pts2(p,name){if(!p||p.length<2)throw new Error('KRELIEF.'+name+': pts needs two points or more');
    var P=p.map(function(q){return [+q[0],+q[1]];}),S=[0];for(var i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    if(!(S[S.length-1]>0))throw new Error('KRELIEF.'+name+': the line has no length');return {pts:P,S:S,L:S[S.length-1]};}
  // nearest point on a polyline: s (arc length), q (signed across: + on n = (-uz, ux)), dist, past (m beyond an end), qa (the
  // across distance signed by the nearest segment, measured to the line's extension past an end: a wall's ends stay straight)
  function near(P,S,x,z){var best=Infinity,o={s:0,q:0,dist:0,past:0,qa:0,i:0};
    for(var i=0;i+1<P.length;i++){var a=P[i],b=P[i+1],l=(S[i+1]-S[i])||1,ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,ax=x-a[0],az=z-a[1],t=ax*ux+az*uz,
      tc=t<0?0:t>l?l:t,ex=ax-ux*tc,ez=az-uz*tc,dd=Math.sqrt(ex*ex+ez*ez);
      if(dd<best-1e-9){best=dd;o.i=i;o.s=S[i]+tc;o.q=-uz*ax+ux*az;o.past=t<0&&i===0?-t:t>l&&i+2===P.length?t-l:0;}}
    o.dist=best;o.qa=o.past>0?o.q:(o.q>=0?1:-1)*best;return o;}
  function ptAt(P,S,s){var i=0;while(i<P.length-2&&S[i+1]<s)i++;var a=P[i],b=P[i+1],l=(S[i+1]-S[i])||1,t=(s-S[i])/l;
    return {x:lerp(a[0],b[0],t),z:lerp(a[1],b[1],t),ux:(b[0]-a[0])/l,uz:(b[1]-a[1])/l};}
  function spill(R,ground,x,z,r){var lo=Infinity;for(var k=0;k<12;k++){var a=TAU*k/12,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;lo=Math.min(lo,KR.shape(R,px,pz,ground(px,pz)));}return lo;}

  // ---------------------------------------------------------------- KRELIEF.slump: the crater's rim slumping inward
  // KRELIEF.slump({pts (the crown: the head scarp's line), side (1: the slope falls toward n = (-uz, ux)), n (3 blocks), bw (600: a
  //   block's width downslope), h (120: each block's drop at its head scarp), tilt (8 deg: the block's top rises toward its front),
  //   face (h*.4: the head scarp's run; small is sheer), anti {at (.55 of the block), h (.3 of h), w (h*.15)} | false (the
  //   uphill-facing scarp across each block: the ground steps UP going downslope, and with the block's front a double crest),
  //   front (.12 of bw: the block's broken front edge, where landslip pinnacles stand), ponds {every (400 m along each block's
  //   back), p (.5), len:[80,240], w:[20,50], d:[2,6]} | false, sackung {d (bw*.5 behind the crown), w (60), depth (h*.2)} | false,
  //   toe {h (h*.35), w (bw*.6)}, wobble (.12 of bw: the block edges wander along the line), ends (bw: the slump dies past the
  //   line's ends), seed})
  //   -> {kind:'slump', pts, S, L, side, n, bw, h, tiltH, face, anti, front, sack, toe, wobble, ends, ponds:[{k (block), s, x, z,
  //       len, w, d, ry}], seed}
  //   shape(rec, x, z, g): g plus the slump's change (lowered blocks, a toe bulge past the last). at(): {part:'trench' | 'head' |
  //   'anti' | 'block' | 'front' | 'pond' | 'toe', k (the block), t (0..1 across it), s, d (m downslope of the crown)} or null
  function slump(o){var K=KRq();if(!o)throw new Error('KRELIEF.slump: options are needed');var L0=pts2(o.pts,'slump'),seed=seedOf(o);
    var n=d(o.n,3),bw=d(o.bw,600),h=d(o.h,120);if(!(n>=1)||!(bw>0)||!(h>0))throw new Error('KRELIEF.slump: n >= 1, bw > 0 and h > 0 are needed');
    var A=o.anti===false?null:Object.assign({at:.55,h:.3,w:h*.15},o.anti||{});
    var R={kind:'slump',seed:seed,pts:L0.pts,S:L0.S,L:L0.L,side:d(o.side,1),n:n|0,bw:bw,h:h,tiltH:bw*Math.tan(d(o.tilt,8)*Math.PI/180),face:d(o.face,h*.4),
      anti:A,front:d(o.front,.12)*bw,wobble:d(o.wobble,.12),ends:d(o.ends,bw),
      sack:o.sackung===false?null:Object.assign({d:bw*.5,w:60,depth:h*.2},o.sackung||{}),toe:Object.assign({h:h*.35,w:bw*.6},o.toe||{}),ponds:[]};
    if(R.face>=bw*.5)throw new Error('KRELIEF.slump: the head scarp\'s face must be under half a block');
    var PO=o.ponds===false?null:Object.assign({every:400,p:.5,len:[80,240],w:[20,50],d:[2,6]},o.ponds||{});
    if(PO)for(var k=0;k<R.n;k++)for(var j=0;j*PO.every<R.L;j++){var u=function(c){return u01(K,seed,k*4096+j,c,0x51A);};if(u(0)>=PO.p)continue;
      var s=(j+.15+.7*u(1))*PO.every;if(s>=R.L)continue;var w=lerp(PO.w[0],PO.w[1],u(2)),dd=slEdge(R,k,s)+R.face+w*1.2,p=ptAt(R.pts,R.S,s),nx=-p.uz*R.side,nz=p.ux*R.side;
      R.ponds.push({k:k,s:s,x:p.x+nx*dd,z:p.z+nz*dd,len:lerp(PO.len[0],PO.len[1],u(3)),w:w,d:lerp(PO.d[0],PO.d[1],u(4)),ry:Math.atan2(p.uz,p.ux)});}
    return R;}
  // block k's back edge (m downslope of the crown) at s along the line: k*bw, wandering by wobble
  function slEdge(R,k,s){if(k<=0)return 0;var K=KRq();return k*R.bw+R.wobble*R.bw*(2*K.fbm(s/R.bw*1.7,k*3.1,.5,2,R.seed)-1);}
  function slRead(R,x,z){var N=near(R.pts,R.S,x,z),dd=N.qa*R.side,end=N.past>0?1-sm(0,R.ends,N.past):1,s=N.s,out={d:dd,s:s,end:end,y:0,part:null,k:-1,t:0};
    if(end<=0)return out;var h=R.h,y=0;
    if(dd<0){if(R.sack){var S2=R.sack,e=(dd+S2.d)/S2.w;if(e>-1&&e<1){y=-S2.depth*(e<0?sm(-1,0,e):1-sm(0,.5,e));out.part='trench';}}out.y=y*end;return out;}
    var k=0;while(k<R.n&&slEdge(R,k+1,s)<=dd)k++;
    if(k>=R.n){var e0=slEdge(R,R.n,s),u=(dd-e0)/R.toe.w,lastF=-R.n*h;if(u>=1){out.y=0;return out;}
      y=u<.5?lerp(lastF,R.toe.h,sm(0,.5,u)):lerp(R.toe.h,0,sm(.5,1,u));out.part='toe';out.k=R.n-1;out.y=y*end;return out;}
    var e1=slEdge(R,k,s),e2=slEdge(R,k+1,s),t=(dd-e1)/(e2-e1),front=-(k+1)*h,back=front-R.tiltH,prev=k?-k*h:0;
    y=lerp(back,front,t);
    if(R.anti){var aw=R.anti.w/(e2-e1);y-=R.anti.h*h*(1-sm(R.anti.at-aw,R.anti.at+aw,t));}
    var into=dd-e1;out.k=k;out.t=t;
    if(into<R.face){var f=Math.pow(sm(0,R.face,into),.6);y=lerp(prev,y,f);out.part='head';}
    else if(R.anti&&Math.abs(t-R.anti.at)<R.anti.w/(e2-e1))out.part='anti';
    else if(e2-dd<R.front)out.part='front';
    else out.part='block';
    for(var i=0;i<R.ponds.length;i++){var P=R.ponds[i];if(P.k!==k)continue;var cx=x-P.x,cz=z-P.z,c=Math.cos(P.ry),sn=Math.sin(P.ry),a=(cx*c+cz*sn)/P.len,b=(-cx*sn+cz*c)/P.w,r2=a*a+b*b;
      if(r2<1){y-=P.d*(1-r2);out.part='pond';out.pond=i;break;}}
    out.y=y*end;return out;}
  function slumpH(R,x,z,g){return (g==null?0:g)+slRead(R,x,z).y;}
  function slumpAt(R,x,z){var q=slRead(R,x,z);if(!q.part)return null;var o={part:q.part,k:q.k,t:q.t,s:q.s,d:q.d};if(q.pond!=null)o.i=q.pond;return o;}
  function slumpWaters(R,ground){return R.ponds.map(function(P,i){return {part:'pond',i:i,x:P.x,z:P.z,r:Math.max(P.len,P.w),rx:P.len,rz:P.w,ry:P.ry,
    y:spill(R,ground,P.x,P.z,0)+P.d*.6};});}

  // ---------------------------------------------------------------- KRELIEF.runout: a sturzstrom's lobe
  // KRELIEF.runout({a:[x,z] (the breakaway's foot), b:[x,z] (the middle of the distal front), w (L*.16: the lobe's half-width
  //   at its widest), h (40: the deposit's thickness), rim (.5: the margins stand h*(1+rim)), lobes (3..5 distal lobes),
  //   hummocks {sp (L/45), h (.45 of h)}, grooves {sp (w/7), d (.3 of h)}, blocks {n (L/1500), size:[30,110] (m: a megablock's
  //   radius), h:[.6,1.4] (of h, over the deposit)}, lake {at:[x,z] | s (.7 of L) and side (1), r (w*.7), y | depth (.6 of h)} |
  //   false, fresh (true: an old one's hummocks and grooves are softened), seed})
  //   -> {kind:'runout', a, b, L, w, h, rim, lobes:[{q, a}], hum, groove, blocks:[{x, z, r, h, ry}], lake:{x, z, r, y | null,
  //       depth} | null, fresh, seed}
  //   shape: g plus the deposit's thickness (it lies on the ground). at(): {part:'lobe' | 'rim' | 'groove' | 'hummock' |
  //   'megablock' | 'lake', s (0..1 down the runout), q (across, m), i (a block)} or null
  function runout(o){var K=KRq();if(!o||!o.a||!o.b)throw new Error('KRELIEF.runout: a and b are needed');var seed=seedOf(o);
    var L=Math.hypot(o.b[0]-o.a[0],o.b[1]-o.a[1]);if(!(L>0))throw new Error('KRELIEF.runout: a and b must differ');
    var w=d(o.w,L*.16),h=d(o.h,40),nl=o.lobes==null?3+Math.floor(u01(K,seed,0,0,0x52A)*3):o.lobes,fresh=o.fresh==null?true:!!o.fresh;
    var R={kind:'runout',seed:seed,a:[o.a[0],o.a[1]],b:[o.b[0],o.b[1]],L:L,w:w,h:h,rim:d(o.rim,.5)*(fresh?1:.6),fresh:fresh,lobes:[],blocks:[],lake:null};
    for(var i=0;i<nl;i++)R.lobes.push({q:((i+.5)/nl*2-1)*.8+(u01(K,seed,i,1,0x52A)-.5)*.2,a:.15+.2*u01(K,seed,i,2,0x52A)});
    var H=o.hummocks||{},G=o.grooves||{},soft=fresh?1:.5;
    R.hum={sp:d(H.sp,L/45),h:d(H.h,.45)*h*soft};R.groove={sp:d(G.sp,w/7),d:d(G.d,.3)*h*(fresh?1:.3)};
    var B=o.blocks||{},nb=B.n==null?Math.round(L/1500):B.n,bs=B.size||[30,110],bh=B.h||[.6,1.4];
    for(i=0;i<nb;i++){var u=function(c){return u01(K,seed,i,c,0x52B);},s=.15+.7*u(0),q=(2*u(1)-1)*.55*roW(R,s);
      var P=roPt(R,s*L,q);R.blocks.push({x:P[0],z:P[1],r:lerp(bs[0],bs[1],u(2)),h:lerp(bh[0],bh[1],u(3))*h,ry:u(4)*Math.PI});}
    if(o.lake){var LK=o.lake===true?{}:o.lake,lr=d(LK.r,w*.7),c;
      if(LK.at)c=[LK.at[0],LK.at[1]];else{var ls=d(LK.s,.7),sd=d(LK.side,1);c=roPt(R,ls*L,sd*(roW(R,ls)+lr*1.1));}
      R.lake={x:c[0],z:c[1],r:lr,y:LK.y==null?null:LK.y,depth:d(LK.depth,.6*h)};}
    return R;}
  function roW(R,s){return R.w*(.3+.7*sm(0,.35,s));}
  function roPt(R,s,q){var ux=(R.b[0]-R.a[0])/R.L,uz=(R.b[1]-R.a[1])/R.L;return [R.a[0]+ux*s-uz*q,R.a[1]+uz*s+ux*q];}
  function roRead(R,x,z){var K=KRq(),ux=(R.b[0]-R.a[0])/R.L,uz=(R.b[1]-R.a[1])/R.L,dx=x-R.a[0],dz=z-R.a[1],s=(dx*ux+dz*uz)/R.L,q=-uz*dx+ux*dz;
    if(s<-.05||s>1.4)return null;var W=R.w,qn=q/W,lob=0;
    for(var i=0;i<R.lobes.length;i++){var e=(qn-R.lobes[i].q)/.35;lob=Math.max(lob,R.lobes[i].a*Math.exp(-e*e));}
    var front=1+lob-.12,v=Math.abs(q)/roW(R,c01(s)),us=s<.6?0:(s-.6)/(front-.6),r=Math.pow(Math.pow(v,4)+Math.pow(us>0?us:0,4),.25);
    if(r>=1||s<0)return {r:2,s:s,q:q};
    var edge=Math.pow(sm(1,.94,r),.5)*sm(0,.05,s),rimK=R.rim*Math.exp(-Math.pow((r-.9)/.07,2)),T=R.h*edge*(1+rimK);
    var hs=R.hum.sp,ci=Math.floor(x/hs),cj=Math.floor(z/hs),hum=0;
    if(R.hum.h>0)for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++){var hi=ci+a,hj=cj+b,px=(hi+.2+.6*u01(K,R.seed,hi,hj,0x52C))*hs,pz=(hj+.2+.6*u01(K,R.seed,hi,hj,0x52D))*hs,
      rr=Math.hypot(x-px,z-pz)/(hs*.55);if(rr<1){var f=1-rr*rr;hum=Math.max(hum,R.hum.h*(.4+.6*u01(K,R.seed,hi,hj,0x52E))*f*f);}}
    hum*=sm(.15,.45,s)*edge;
    var gp=.5+.5*Math.cos(TAU*q/R.groove.sp+3*K.fbm(s*4,.5,.5,2,R.seed)),gr=R.groove.d*gp*gp*sm(.05,.2,s)*(1-sm(.55,.9,s))*edge;
    var y=T+hum-gr,mb=-1;
    for(i=0;i<R.blocks.length;i++){var M=R.blocks[i],dm=Math.hypot(x-M.x,z-M.z);if(dm<M.r){var top=T+M.h*Math.pow(sm(M.r,M.r*.7,dm),.5);if(top>y){y=top;mb=i;}}}
    return {r:r,s:s,q:q,y:y,T:T,rimK:rimK,hum:hum,gr:gr,mb:mb};}
  function runoutH(R,x,z,g){var q=roRead(R,x,z);return (g==null?0:g)+(q&&q.r<1?q.y:0);}
  function runoutAt(R,x,z,g){var q=roRead(R,x,z);
    if(R.lake&&Math.hypot(x-R.lake.x,z-R.lake.z)<R.lake.r&&(!q||q.r>=1)&&(R.lake.y==null||g==null||g<R.lake.y))return {part:'lake'};
    if(!q||q.r>=1)return null;var o={s:q.s,q:q.q};
    if(q.mb>=0){o.part='megablock';o.i=q.mb;}else if(q.rimK>.3)o.part='rim';else if(q.gr>q.hum&&q.gr>.25*R.groove.d)o.part='groove';else if(q.hum>.3*R.hum.h)o.part='hummock';else o.part='lobe';
    return o;}
  function runoutWaters(R,ground){if(!R.lake)return [];var Lk=R.lake;return [{part:'lake',x:Lk.x,z:Lk.z,r:Lk.r,y:Lk.y!=null?Lk.y:ground(Lk.x,Lk.z)+Lk.depth}];}

  // ---------------------------------------------------------------- KRELIEF.gully: loess gullies and the tablelands between
  // KRELIEF.gully({pts (the trunk's thalweg, downstream: to the bench's edge), ground, depth (150 at the mouth; a head is cut
  //   .55 of that), w (18: the floor's half-width), wall (.1: the wall's run over its height: sheer), branches (5 a km of the
  //   trunk), blen:[120,420], bangle (.95 rad off the trunk), orders (2: side gullies off the branches; 1 none), head (1.9: an
  //   amphitheatre head's half-width over w), tops ('liang': rounded ridges; 'yuan': flat tables, sheer rims, fewer branches;
  //   'mao': the ridges broken into round knolls), shoulder (.3 of depth: how far a liang's or mao's top rounds over at the
  //   rim), knoll (160 m: a mao's spacing), seed})
  //   -> {kind:'gully', lines:[{id, order, parent, pts:[[x, z, y (the floor)]], w}], heads:[{line, x, z, y, dir}] (a box head:
  //       a spring and a fall at each), depth, w, wall, head, tops, shoulder, knoll, reach, seed}
  //   shape: the ground cut to each line's floor between sheer walls; at(): {part:'floor' | 'head' | 'wall' | 'rim' | 'yuan' |
  //   'liang' | 'mao', line, s, e (m from the nearest gully's edge)}; null far from every gully (the open table: a page's yuan)
  function gully(o){var K=KRq();if(!o||!o.ground)throw new Error('KRELIEF.gully: ground(x,z) is needed (the gullies are cut into it)');
    var T0=pts2(o.pts,'gully'),seed=seedOf(o),G=o.ground,tops=o.tops==null?'liang':o.tops;
    if(tops!=='liang'&&tops!=='yuan'&&tops!=='mao')throw new Error('KRELIEF.gully: tops is yuan, liang or mao');
    var D=d(o.depth,150),w=d(o.w,18),br=d(o.branches,tops==='yuan'?2.5:5),bl=o.blen||[120,420],ba=d(o.bangle,.95),ord=d(o.orders,tops==='yuan'?1:2);
    var R={kind:'gully',seed:seed,depth:D,w:w,wall:d(o.wall,.1),head:d(o.head,1.9),tops:tops,shoulder:tops==='yuan'?0:d(o.shoulder,.3),knoll:d(o.knoll,160),lines:[],heads:[]};
    // the trunk's floor: deepening toward the mouth, never climbing downstream
    var tr=T0.pts.map(function(p,i){return [p[0],p[1],G(p[0],p[1])-D*(.55+.45*T0.S[i]/T0.L)];});
    for(var i=1;i<tr.length;i++)tr[i][2]=Math.min(tr[i][2],tr[i-1][2]);
    R.lines.push({id:0,order:0,parent:-1,pts:tr,w:w});
    function branchesOf(L,order){if(order>ord)return;var P=L.pts.map(function(p){return [p[0],p[1]];}),S=[0];for(var j=1;j<P.length;j++)S.push(S[j-1]+Math.hypot(P[j][0]-P[j-1][0],P[j][1]-P[j-1][1]));
      var len=S[S.length-1],sp=1000/(br*(order>1?.6:1)),nb=Math.floor(len/sp);
      for(var k=0;k<nb;k++){var u=function(c){return u01(K,seed,L.id*1024+k,order*16+c,0x53A);};if(u(0)<.15)continue;
        var s=(k+.2+.6*u(1))*sp;if(s<w*R.head*2||s>len-w*3)continue;var p=ptAt(P,S,s),side=(k+L.id)%2?1:-1,an=Math.atan2(p.uz,p.ux)+Math.PI+side*ba*(.75+.5*u(2));
        var bl0=lerp(bl[0],bl[1],u(3))*(order>1?.55:1),bend=(u(4)-.5)*.6,m=[p.x+Math.cos(an+bend)*bl0*.5,p.z+Math.sin(an+bend)*bl0*.5],e=[m[0]+Math.cos(an)*bl0*.5,m[1]+Math.sin(an)*bl0*.5];
        // the floor: .55 of the depth at the head, never climbing toward the junction (river's rule)
        var yj=lerpY(L.pts,S,s),yh=G(e[0],e[1])-D*.55,ym=Math.max(Math.min(lerp(yh,yj,.5),G(m[0],m[1])-D*.3),yj),pts=[[e[0],e[1],Math.max(yh,ym)],[m[0],m[1],ym],[p.x,p.z,yj]];
        var B={id:R.lines.length,order:order,parent:L.id,pts:pts,w:w*(order>1?.7:.85)};R.lines.push(B);
        R.heads.push({line:B.id,x:e[0],z:e[1],y:pts[0][2],dir:Math.atan2(m[1]-e[1],m[0]-e[0])});
        branchesOf(B,order+1);}}
    branchesOf(R.lines[0],1);
    R.heads.unshift({line:0,x:tr[0][0],z:tr[0][1],y:tr[0][2],dir:Math.atan2(tr[1][1]-tr[0][1],tr[1][0]-tr[0][0])});
    R.reach=w*R.head*1.3+D*(R.wall+R.shoulder*3)+4;if(tops==='mao')R.reach=Math.max(R.reach,D*3+R.knoll);return R;}
  function lerpY(P,S,s){var i=0;while(i<P.length-2&&S[i+1]<s)i++;var t=c01((s-S[i])/((S[i+1]-S[i])||1));return lerp(P[i][2],P[i+1][2],t);}
  // the segment index (cached, not in the JSON): cells of `reach`, each with the segments that come within reach of it
  function guIndex(R){if(R._gx)return R._gx;var C=Math.max(32,R.reach),M=new Map(),segs=[];
    R.lines.forEach(function(L,li){var S=[0];for(var j=1;j<L.pts.length;j++)S.push(S[j-1]+Math.hypot(L.pts[j][0]-L.pts[j-1][0],L.pts[j][1]-L.pts[j-1][1]));hidden(L,'_S',S);
      for(j=0;j+1<L.pts.length;j++){var a=L.pts[j],b=L.pts[j+1],id=segs.length;segs.push([li,j]);
        for(var gx=Math.floor((Math.min(a[0],b[0])-R.reach)/C);gx<=Math.floor((Math.max(a[0],b[0])+R.reach)/C);gx++)
          for(var gz=Math.floor((Math.min(a[1],b[1])-R.reach)/C);gz<=Math.floor((Math.max(a[1],b[1])+R.reach)/C);gz++){var k=gx+','+gz,A=M.get(k);if(!A)M.set(k,A=[]);A.push(id);}}});
    return hidden(R,'_gx',{C:C,M:M,segs:segs});}
  function guRead(R,x,z,g){var I=guIndex(R),A=I.M.get(Math.floor(x/I.C)+','+Math.floor(z/I.C)),best={y:g,e:Infinity,line:-1,s:0,part:null};if(!A)return best;
    var seen={},lowY=g,lowPart=null;for(var m=0;m<A.length;m++){var li=I.segs[A[m]][0];if(seen[li])continue;seen[li]=1;
      var L=R.lines[li],o=nearXYZ(L.pts,L._S,x,z),fy=o.y,hw=L.w*(1+(R.head-1)*(1-sm(0,L.w*R.head*2.5,o.s))),e=o.dist-hw,isHead=o.s<L.w*R.head*2;
      if(e<best.e){best.e=e;best.line=li;best.s=o.s;}
      if(e>R.reach||fy>=g)continue;
      var top=g;if(R.shoulder>0){var run0=Math.max(1,R.wall*(g-fy)),sw=R.shoulder*R.depth*3;top=g-R.shoulder*R.depth*.3*Math.pow(1-sm(0,sw,e-run0),2);}
      var Hh=top-fy,run=Math.max(1,R.wall*Hh),y,part;
      if(e<=0){y=fy;part=isHead?'head':'floor';}else if(e<run){y=fy+Hh*Math.pow(sm(0,run,e),.5);part=isHead?'head':'wall';}else{y=top;part=e<run+3?'rim':null;}
      if(y<lowY-1e-9||(part&&!lowPart&&y<=lowY+1e-9)){lowY=y;lowPart=part;}}
    best.y=lowY;best.part=lowPart;
    if(R.tops==='mao'&&best.e<R.depth*3&&best.y>=g-R.depth*.31){var K=KRq(),kn=R.knoll,ci=Math.floor(x/kn),cj=Math.floor(z/kn),dm=Infinity;
      for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++){var px=(ci+a+.25+.5*u01(K,R.seed,ci+a,cj+b,0x53B))*kn,pz=(cj+b+.25+.5*u01(K,R.seed,ci+a,cj+b,0x53C))*kn;dm=Math.min(dm,Math.hypot(x-px,z-pz));}
      var low=R.depth*.25*Math.pow(c01(dm/(kn*.7)),2)*(1-sm(R.depth,R.depth*3,best.e));best.y=Math.min(best.y,g-low);}
    return best;}
  function nearXYZ(P,S,x,z){var best=Infinity,o={s:0,dist:0,y:0};
    for(var i=0;i+1<P.length;i++){var a=P[i],b=P[i+1],l=(S[i+1]-S[i])||1,ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,t=(x-a[0])*ux+(z-a[1])*uz,tc=t<0?0:t>l?l:t,
      dd=Math.hypot(x-a[0]-ux*tc,z-a[1]-uz*tc);if(dd<best-1e-9){best=dd;o.s=S[i]+tc;o.y=lerp(a[2],b[2],tc/l);}}
    o.dist=best;return o;}
  function gullyH(R,x,z,g){return guRead(R,x,z,g==null?0:g).y;}
  function gullyAt(R,x,z,g){var q=guRead(R,x,z,g==null?0:g);if(q.line<0)return null;var o={line:q.line,s:q.s,e:q.e};
    if(q.part){o.part=q.part;return o;}o.part=R.tops==='yuan'||q.e>R.depth*4?'yuan':R.tops;return o;}

  // ---------------------------------------------------------------- KRELIEF.terraces: contour-terraced fields
  // KRELIEF.terraces({rise (2.5 m: a step's height), riser (.25: the bank's share of each step), base (0: a tread's level),
  //   wobble (.12 of rise: the levels wander, so a tread is not a perfect isoline), fill (.5: cut and fill balanced; 0 all cut),
  //   bund (.25 m: the lip at a tread's outer edge), field (40 m: a field's length along the contour), zone {poly:[[x,z],...] |
  //   c:[x,z], r} (none: everywhere), fade (30 m: the terraces ease out at the zone's edge), band [y0, y1] (the heights they are
  //   cut between) and bandFade (15 m), seed})
  //   -> {kind:'terraces', rise, riser, base, wobble, fill, bund, field, zone, fade, band, bandFade, seed}
  //   shape: the ground quantised to treads and risers, mixed back to it toward the zone's and band's edges. at(): {part:'tread'
  //   | 'riser' | 'bund', level (the tread's index), field ('level:i,j': one field's id), w (the terracing's weight)} or null
  function terraces(o){o=o||{};var R={kind:'terraces',seed:seedOf(o),rise:d(o.rise,2.5),riser:d(o.riser,.25),base:d(o.base,0),wobble:d(o.wobble,.12),fill:d(o.fill,.5),
      bund:d(o.bund,.25),field:d(o.field,40),zone:o.zone?JSON.parse(JSON.stringify(o.zone)):null,fade:d(o.fade,30),band:o.band?[o.band[0],o.band[1]]:null,bandFade:d(o.bandFade,15)};
    if(!(R.rise>0)||!(R.riser>0&&R.riser<1))throw new Error('KRELIEF.terraces: rise > 0 and 0 < riser < 1 are needed');
    if(R.zone&&!R.zone.poly&&!(R.zone.c&&R.zone.r>0))throw new Error('KRELIEF.terraces: a zone is {poly} or {c, r}');
    return R;}
  function polyD(P,x,z){var ins=false,best=Infinity;for(var i=0,j=P.length-1;i<P.length;j=i++){var a=P[i],b=P[j];
      if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))ins=!ins;
      var dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=c01(((x-a[0])*dx+(z-a[1])*dz)/l2);best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}
    return ins?best:-best;}
  function teW(R,x,z,g){var w=1;if(R.zone){var e=R.zone.poly?polyD(R.zone.poly,x,z):R.zone.r-Math.hypot(x-R.zone.c[0],z-R.zone.c[1]);w=sm(0,R.fade,e);}
    if(R.band&&w>0)w*=sm(R.band[0]-R.bandFade,R.band[0],g)*(1-sm(R.band[1],R.band[1]+R.bandFade,g));return w;}
  function teRead(R,x,z,g){var K=KRq(),w=teW(R,x,z,g);if(w<=0)return null;
    var off=R.wobble*R.rise*(2*K.fbm(x/90,z/90,.5,2,R.seed)-1),u=(g-R.base-off)/R.rise,k=Math.floor(u),f=u-k,rs=R.riser,prof=sm(1-rs,1,f);
    var y=R.base+off+R.rise*(k+prof+R.fill*(1-rs)),part=f<1-rs?'tread':'riser',lip=0;
    if(R.bund>0){var bf=f/(.04+.06*(1-rs));if(bf>=0&&bf<1){lip=R.bund*(1-bf)*sm(0,.25,bf);if(bf<.6)part='bund';}}
    return {y:y+lip,w:w,k:k,part:part};}
  function terracesH(R,x,z,g){g=g==null?0:g;var q=teRead(R,x,z,g);return q?g+(q.y-g)*q.w:g;}
  function terracesAt(R,x,z,g){var q=teRead(R,x,z,g==null?0:g);if(!q||q.w<.5)return null;
    return {part:q.part,level:q.k,field:q.k+':'+Math.floor(x/R.field)+','+Math.floor(z/R.field),w:q.w};}

  // ---------------------------------------------------------------- KRELIEF.maar: a breached maar-diatreme amphitheatre
  // KRELIEF.maar({c:[x,z], r (600: the crater's radius at its rim, along the breach), e (.85: across the breach over along),
  //   dir (the way the breach opens, radians from +x toward +z; north is -PI/2: Mid Basin's open north), ground (needed: the
  //   surface it was blown through), depth (r*.28: the floor under that surface) | floor (an absolute y), floorK (.5: the flat
  //   floor's share of the radius), wallP (.55: the wall's power; lower is steeper at the rim), lobe (.08: the rim's scallops),
  //   ring {h (r*.14), w (r*.3: its half-width), at (1.08)} | false, breach {w (r*.16: the gorge's half-width), len (r: past
  //   the rim), drop (r*.12), bend (r*.05), throw (0: the fault's throw, for KSTRATA)} | false, pipe {r (r*.42 at the floor),
  //   flare (.45: wider by this share at the rim)}, baked (r*.04: the baked aureole's width), spring {r (r*.3), d (6), out (24
  //   points down the gorge)} | false, seed})
  //   -> {kind:'maar', c, r, e, dir, g0 (the old surface at c), floorY, rimY, floorK, wallP, lobe, ring, breach, pipe, baked,
  //       spring:{x, z, r, d, y (the pool's water), out:[[x, z, y]] (its outflow, for WATER.flow)} | null, fault:{a, b, throw, w}
  //       (for KSTRATA.create's faults), seed}
  //   shape: the tuff ring raised round the crater, the crater cut to its floor, the gorge cut through the breached rim, the
  //   spring's pool dished into the floor. at(): {part:'pool' | 'floor' | 'wall' | 'gorge' | 'ring', rock:'breccia' | 'baked' |
  //   'country' | 'tuff', fault (true on the fault's trace), rn (the plan radius over r)} or null
  function maar(o){var K=KRq();if(!o||!o.c||!o.ground)throw new Error('KRELIEF.maar: c and ground(x,z) are needed');var seed=seedOf(o),G=o.ground;
    var r=d(o.r,600),dir=d(o.dir,-Math.PI/2);if(!(r>0))throw new Error('KRELIEF.maar: r must be over 0');
    var g0=0;for(var k=0;k<16;k++){var a=TAU*k/16;g0+=G(o.c[0]+Math.cos(a)*r*1.4,o.c[1]+Math.sin(a)*r*1.4)/16;}
    var floorY=o.floor!=null?o.floor:g0-d(o.depth,r*.28);if(!(floorY<g0))throw new Error('KRELIEF.maar: the floor must lie under the ground');
    var RG=o.ring===false?null:Object.assign({h:r*.14,w:r*.3,at:1.08},o.ring||{}),BR=o.breach===false?null:Object.assign({w:r*.16,len:r,drop:r*.12,bend:r*.05,throw:0},o.breach||{});
    var R={kind:'maar',seed:seed,c:[o.c[0],o.c[1]],r:r,e:d(o.e,.85),dir:dir,g0:g0,floorY:floorY,rimY:g0+(RG?RG.h*Math.exp(-Math.pow((1-RG.at)*r/RG.w,2)):0),
      floorK:d(o.floorK,.5),wallP:d(o.wallP,.55),lobe:d(o.lobe,.08),ring:RG,breach:BR,pipe:Object.assign({r:r*.42,flare:.45},o.pipe||{}),baked:d(o.baked,r*.04),spring:null,
      ph:[u01(K,seed,0,0,0x54A)*TAU,u01(K,seed,1,0,0x54A)*TAU]};
    var ux=Math.cos(dir),uz=Math.sin(dir),fl=(BR?BR.len*2+r:r*2);R.fault={a:[R.c[0]-ux*fl,R.c[1]-uz*fl],b:[R.c[0]+ux*fl,R.c[1]+uz*fl],throw:BR?BR.throw:0,w:BR?BR.w*.3:r*.05};
    if(o.spring){var SP=o.spring===true?{}:o.spring,sr=d(SP.r,r*.3),sd=d(SP.d,6),nOut=d(SP.out,24),out=[];
      R.spring={x:R.c[0],z:R.c[1],r:sr,d:sd,y:floorY-.2,out:out};
      if(BR&&nOut>0)for(var i=0;i<=nOut;i++){var u=sr+(r+BR.len-sr)*i/nOut,v=maBend(R,u),px=R.c[0]+ux*u-uz*v,pz=R.c[1]+uz*u+ux*v;out.push([px,pz,Math.min(R.spring.y,maGorgeY(R,u))+.1]);}}
    return R;}
  function maBend(R,u){return R.breach?R.breach.bend*Math.sin(u/R.r*2.2+R.ph[1]):0;}
  function maGorgeY(R,u){var B=R.breach;return R.floorY-B.drop*c01((u-R.r*.5)/(B.len+R.r*.5));}
  function maRead(R,x,z,g){var K=KRq(),dx=x-R.c[0],dz=z-R.c[1],ux=Math.cos(R.dir),uz=Math.sin(R.dir),u=dx*ux+dz*uz,v=-uz*dx+ux*dz,r=R.r,B=R.breach;
    var ext=r*(1.6+(R.ring?R.ring.w/r*2:0))+(B?B.len:0);if(u>ext||u<-ext||v>ext||v<-ext)return null;
    var th=Math.atan2(v,u),lob=1+R.lobe*(Math.cos(2*th+R.ph[0])*.6+Math.sin(3*th+R.ph[1])*.4)+R.lobe*.5*(2*K.fbm(Math.cos(th)*2+4,Math.sin(th)*2+4,.5,2,R.seed)-1);
    var rn=Math.hypot(u/r,v/(r*R.e))*lob,gap=1,tuff=0;
    if(B){var dv=Math.abs(v-maBend(R,u))/B.w;gap=1-.92*sm(r*.2,r*.6,u)*(1-sm(.6,1.6,dv));}
    if(R.ring){var Rg=R.ring;tuff=Rg.h*Math.exp(-Math.pow((rn-Rg.at)*r/Rg.w,2))*gap*sm(.85,1,rn);}
    var top=g+tuff,y=top,part=tuff>.05*(R.ring?R.ring.h:1)?'ring':null,fy=R.floorY;
    if(rn<1&&top>fy){y=fy+(top-fy)*Math.pow(sm(R.floorK,1,rn),R.wallP);part=rn<R.floorK?'floor':'wall';}
    var gorge=false;
    if(B&&u>-B.w&&u<r+B.len+B.w*3){var bv=Math.abs(v-maBend(R,u)),eg=bv-B.w,gy=maGorgeY(R,u)+Math.max(0,u-r-B.len)*2;
      if(eg<B.w*1.2&&gy<y){var yg=eg<=0?gy:gy+(y-gy)*Math.pow(sm(0,B.w*1.2,eg),.6);if(yg<y-1e-9){y=yg;gorge=true;part=eg<=0||rn>=R.floorK?'gorge':part;}}}
    if(R.spring){var dp=Math.hypot(dx,dz)/R.spring.r;if(dp<1){var py=R.spring.y-R.spring.d*(1-dp*dp);if(py<y){y=py;part='pool';}}}
    return {y:y,part:part,rn:rn,u:u,v:v,gorge:gorge};}
  function maarH(R,x,z,g){var q=maRead(R,x,z,g==null?0:g);return q?q.y:(g==null?0:g);}
  function maarAt(R,x,z,g){g=g==null?R.g0:g;var q=maRead(R,x,z,g);if(!q||!q.part)return null;
    var o={part:q.part,rn:q.rn,fault:!!R.breach&&Math.abs(q.v-maBend(R,q.u))<R.fault.w&&q.u>-R.r*1.2};
    var h=R.g0-R.floorY,rp=R.pipe.r*(1+R.pipe.flare*c01((q.y-R.floorY)/h)),pr=Math.hypot(q.u,q.v/R.e);
    o.rock=q.part==='ring'?'tuff':pr<rp?'breccia':pr<rp+R.baked?'baked':q.y>g-.5&&q.part!=='gorge'?'tuff':'country';
    return o;}
  function maarWaters(R){return R.spring?[{part:'pool',x:R.spring.x,z:R.spring.z,r:R.spring.r,y:R.spring.y,out:R.spring.out}]:[];}

  // ---------------------------------------------------------------- KRELIEF.relay: tilted blocks and relay ramps
  // KRELIEF.relay({faults:[{pts:[[x,z],...] (gently arcuate is fine), throw (m), side (1: the downthrown block lies toward n =
  //   (-uz, ux)), tip (.3 of the fault's length: the throw tapers to nothing over this at each end), face (throw*.5: the
  //   scarp's run)}], tilt (.12: the downthrown block's sag at the scarp's foot, a share of the throw: back-tilted benches),
  //   tiltW (700 m), lip (.04: the footwall's crest raised, a share), lipW (120 m), rough (.015 of the throw, on the faces), seed})
  //   -> {kind:'relay', faults:[{pts, S, L, throw, side, tip, face}], tilt, tiltW, lip, lipW, rough, seed}
  //   Where two faults overlap en echelon, each one's throw tapering out is the ramp between their benches: the throws add, so
  //   the ramp is continuous by construction. shape: g lowered by the summed throws. at(): {part:'scarp' | 'crest' | 'ramp' |
  //   'foot' | 'bench', i (the fault), bench (how many faults' throw stands above, rounded)} or null (above the first scarp)
  function relay(o){KRq();if(!o||!o.faults||!o.faults.length)throw new Error('KRELIEF.relay: faults are needed');
    var R={kind:'relay',seed:seedOf(o),tilt:d(o.tilt,.12),tiltW:d(o.tiltW,700),lip:d(o.lip,.04),lipW:d(o.lipW,120),rough:d(o.rough,.015),faults:[]};
    o.faults.forEach(function(F,i){var Ln=pts2(F.pts,'relay (fault '+i+')');if(!(F.throw>0))throw new Error('KRELIEF.relay: fault '+i+' needs a throw over 0');
      R.faults.push({pts:Ln.pts,S:Ln.S,L:Ln.L,throw:F.throw,side:d(F.side,1),tip:d(F.tip,.3)*Ln.L,face:d(F.face,F.throw*.5)});});
    return R;}
  function reRead(R,x,z){var K=KRq(),D=0,lip=0,parts=[];
    for(var i=0;i<R.faults.length;i++){var F=R.faults[i],N=near(F.pts,F.S,x,z),dd=N.qa*F.side,tp=N.past>0?0:sm(0,F.tip,N.s)*sm(F.L,F.L-F.tip,N.s);
      if(tp<=0){parts.push(null);continue;}
      var st=Math.pow(sm(0,F.face,dd),.55),sag=R.tilt*sm(0,F.face,dd)*(1-sm(F.face,F.face+R.tiltW,dd)),rough=dd>0&&dd<F.face?R.rough*(2*K.fbm(x/40,z/40,.5,2,R.seed+i)-1):0;
      D+=F.throw*tp*(st+sag+rough);if(dd<0)lip+=F.throw*R.lip*tp*Math.exp(-Math.pow(dd/R.lipW,2));
      parts.push({dd:dd,tp:tp,st:st,F:F});}
    return {D:D,lip:lip,parts:parts};}
  function relayH(R,x,z,g){var q=reRead(R,x,z);return (g==null?0:g)-q.D+q.lip;}
  function relayAt(R,x,z){var q=reRead(R,x,z),b=0,any=false,i,p;
    for(i=0;i<q.parts.length;i++){p=q.parts[i];if(!p)continue;b+=p.tp*p.st;if(p.dd>0)any=true;}
    for(i=0;i<q.parts.length;i++){p=q.parts[i];if(!p||p.tp<.05)continue;
      if(p.dd>0&&p.dd<p.F.face)return {part:'scarp',i:i,bench:Math.round(b)};
      if(p.dd<=0&&p.dd>-R.lipW)return {part:'crest',i:i,bench:Math.round(b)};}
    for(i=0;i<q.parts.length;i++){p=q.parts[i];if(p&&p.dd>p.F.face&&p.tp>.05&&p.tp<.95)return {part:'ramp',i:i,bench:Math.round(b)};}
    for(i=0;i<q.parts.length;i++){p=q.parts[i];if(p&&p.dd>p.F.face&&p.dd<p.F.face+R.tiltW*.25&&p.tp>.5)return {part:'foot',i:i,bench:Math.round(b)};}
    return any?{part:'bench',bench:Math.round(b)}:null;}

  // ---------------------------------------------------------------- KRELIEF.stepcut: sheer stepped walls, no falloff
  // KRELIEF.scarp's face and KFIELD's brushes are smooth by design; the Siphon Pits' graben and pits are not. KRELIEF.stepcut({
  //   line:{pts, w (the floor's half-width)} (a graben) | disc:{c:[x,z], r} | ell:{c, rx, rz, ry} (a pit; r the outer edge),
  //   depth (60 m under the ground) | floor (an absolute y: the treads then lie between the ground and it), steps (3: risers,
  //   the last landing on the floor), tread (12 m: each tread's width, jittered .7..1.3), riser (1.5 m: a riser's run in plan;
  //   under a field cell it is a sheer step), share (each riser's share of the depth, jittered: [.7,1.3] then normalised),
  //   rim (0: a lip, m, at the edge), warp {amp (0), scale (1/200)}: the edge wandering,
  //   head {len, minW (.35)} (a line only, opt-in: THE CHASM HEAD, Mid Basin's amendment 3 and the Loom-Chasms' slots): over the last len m of the
  //   line at each end the cut's depth tapers to nothing (smoothstep on the distance along the line from its end) and its floor narrows to minW of
  //   w, so the graben pinches out into the plateau instead of closing round its end at full depth; without head the cut is exactly as before), seed})
  //   -> {kind:'stepcut', form:'line' | 'disc' | 'ell', line | disc | ell, depth, floor, treads:[w], drops:[share], riser, rim,
  //       warp, edge (the outline's distance from the floor's edge: the treads and risers summed), seed}
  //   shape: g cut down by the steps. at(): {part:'rim' | 'riser' | 'tread' | 'floor', i (the step), e (m in from the edge)} or null
  function stepcut(o){var K=KRq();if(!o)throw new Error('KRELIEF.stepcut: options are needed');var seed=seedOf(o),form=o.line?'line':o.disc?'disc':o.ell?'ell':null;
    if(!form)throw new Error('KRELIEF.stepcut: a line, a disc or an ell is needed');
    var n=d(o.steps,3),tw=d(o.tread,12),rr=d(o.riser,1.5),sh=o.share||[.7,1.3];if(!(n>=1)||!(rr>0))throw new Error('KRELIEF.stepcut: steps >= 1 and riser > 0');
    var R={kind:'stepcut',seed:seed,form:form,depth:o.floor!=null?null:d(o.depth,60),floor:o.floor!=null?o.floor:null,riser:rr,rim:d(o.rim,0),
      warp:Object.assign({amp:0,scale:1/200},o.warp||{}),treads:[],drops:[]};
    if(form==='line'){var Ln=pts2(o.line.pts,'stepcut');R.line={pts:Ln.pts,S:Ln.S,w:d(o.line.w,40)};
      if(o.head){if(!(o.head.len>0))throw new Error('KRELIEF.stepcut: head.len must be over 0');R.head={len:o.head.len,minW:d(o.head.minW,.35)};}}
    else if(o.head)throw new Error('KRELIEF.stepcut: a head is a line\'s');
    else if(form==='disc'){if(!(o.disc.r>0))throw new Error('KRELIEF.stepcut: a disc needs r');R.disc={c:[o.disc.c[0],o.disc.c[1]],r:o.disc.r};}
    else{if(!(o.ell.rx>0&&o.ell.rz>0))throw new Error('KRELIEF.stepcut: an ell needs rx and rz');R.ell={c:[o.ell.c[0],o.ell.c[1]],rx:o.ell.rx,rz:o.ell.rz,ry:d(o.ell.ry,0)};}
    var tot=0,i;for(i=0;i<n;i++){R.drops.push(lerp(sh[0],sh[1],u01(K,seed,i,0,0x55A)));tot+=R.drops[i];if(i<n-1)R.treads.push(tw*(.7+.6*u01(K,seed,i,1,0x55A)));}
    R.drops=R.drops.map(function(v){return v/tot;});R.edge=R.treads.reduce(function(a,b){return a+b;},0)+n*rr;
    var inner=form==='disc'?R.disc.r:form==='ell'?Math.min(R.ell.rx,R.ell.rz):R.line.w+R.edge;
    if(form!=='line'&&inner<=R.edge)throw new Error('KRELIEF.stepcut: the steps ('+R.edge.toFixed(1)+' m) do not fit inside the pit: fewer or narrower treads');
    return R;}
  // e: metres in from the outline (negative outside); _hf: the head's depth share at the last point scE read (1 without a head)
  var _hf=1;
  function scE(R,x,z){_hf=1;if(R.warp.amp){var K=KRq(),W=R.warp;x+=W.amp*(2*K.fbm(x*W.scale,z*W.scale,.5,3,R.seed+3)-1);z+=W.amp*(2*K.fbm(x*W.scale+31,z*W.scale-17,.5,3,R.seed+4)-1);}
    if(R.form==='disc')return R.disc.r-Math.hypot(x-R.disc.c[0],z-R.disc.c[1]);
    if(R.form==='ell'){var E=R.ell,dx=x-E.c[0],dz=z-E.c[1],c=Math.cos(E.ry),s=Math.sin(E.ry),lx=dx*c+dz*s,lz=-dx*s+dz*c,rn=Math.hypot(lx/E.rx,lz/E.rz);
      return (1-rn)*Math.min(E.rx,E.rz);}
    var N=near(R.line.pts,R.line.S,x,z),w=R.line.w;
    if(R.head){var Lt=R.line.S[R.line.S.length-1],se=N.past>0?0:Math.min(N.s,Lt-N.s);_hf=sm(0,R.head.len,se);w*=R.head.minW+(1-R.head.minW)*_hf;
      if(N.past>0)return -1e9;}   /* past a headed line's end: no cut (the head has already pinched it out) */
    return w+R.edge-Math.hypot(N.past,N.past>0?N.q:N.dist);}
  function scRead(R,x,z){var e=scE(R,x,z),hf=_hf,n=R.drops.length;if(e<=-3)return null;if(e<=0)return {sh:0,part:R.rim?'rim':null,i:-1,e:e};
    var at=0,acc=0;for(var i=0;i<n;i++){if(e<at+R.riser)return {sh:(acc+R.drops[i]*sm(0,R.riser,e-at))*hf,part:'riser',i:i,e:e};at+=R.riser;acc+=R.drops[i];
      if(i<n-1){if(e<at+R.treads[i])return {sh:acc*hf,part:'tread',i:i,e:e};at+=R.treads[i];}}
    return {sh:hf,part:'floor',i:n,e:e};}
  function stepcutH(R,x,z,g){g=g==null?0:g;var q=scRead(R,x,z);if(!q)return g;var lip=R.rim&&q.e<=0?R.rim*sm(-3,0,q.e):0;
    if(R.floor!=null)return Math.min(g,lerp(g,R.floor,q.sh))+lip;return g-R.depth*q.sh+lip;}
  function stepcutAt(R,x,z){var q=scRead(R,x,z);if(!q||!q.part)return null;return {part:q.part,i:q.i,e:q.e};}

  // ---------------------------------------------------------------- the composition
  var EXT={slump:[slumpH,slumpAt,slumpWaters],runout:[runoutH,runoutAt,runoutWaters],gully:[gullyH,gullyAt],terraces:[terracesH,terracesAt],
    maar:[maarH,maarAt,maarWaters],relay:[relayH,relayAt],stepcut:[stepcutH,stepcutAt]};
  var shape0=KR.shape,at0=KR.at,kinds0=KR.kinds,waters0=KR.waters;
  KR.shape=function(R,x,z,g){var e=R&&EXT[R.kind];return e?e[0](R,x,z,g):shape0(R,x,z,g);};
  KR.at=function(R,x,z,g){var e=R&&EXT[R.kind];return e?e[1](R,x,z,g):at0(R,x,z,g);};
  KR.apply=function(ground,recs){return function(x,z){var g=ground(x,z);for(var i=0;i<recs.length;i++)g=KR.shape(recs[i],x,z,g);return g;};};
  KR.kinds=function(){return kinds0().concat(Object.keys(EXT));};
  // KRELIEF.waters(rec, ground) -> [{part, x, z, r, y, ...}]: the standing water a record holds (y absolute; ground is the
  // surface the record is applied to)
  KR.waters=function(R,ground){var e=R&&EXT[R.kind];if(e)return e[2]?e[2](R,ground):[];return waters0?waters0(R,ground):[];};
  KR.slump=slump;KR.runout=runout;KR.gully=gully;KR.terraces=terraces;KR.maar=maar;KR.relay=relay;KR.stepcut=stepcut;KR._landforms=true;
})(typeof window!=='undefined'?window:globalThis);
