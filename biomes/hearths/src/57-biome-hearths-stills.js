// ================================================================= HEARTHS — the Stills: the hot-country cousin round boiling water (biomes/hearths/PLAN.md 7b)
// HEARTH.stills(o): the still trees ring each boiling spring at its rim and each geyser at its spray line, their feet in the water's edge; glass stills
// stand by the springs that went cold; spray mats cover the scalded ground inside a cone's spray line; sail cups line the warm run-off (40-80 degC). Placed
// by the host's own water records (the geyser kit's layout: GEYSER.R), never by a noise: every ring's trees from KRAND.hash(seed, ring, index, salt), every
// cell from KRAND.cell, so nothing hangs on how many draws came before.
//   o: {springs [{key, x, z, r, level, temp (0..1 of 33..100 degC)}], geysers [{key, x, z, sprayR, base, kind}], runoff [[x, z, degC, dx, dz], ...] (the
//       channels' points, downstream), wind [x, z] (where the sea wind blows to), ground (x, z) -> y, seed, q (the host's quality), hot (.75: a spring's
//       temp from which it boils at the Steampits' 1.9 atm), cold (.55: under it a spring is the glass stills')}
//   -> {trees [{x, z, y, H, ring, heading}], counts, rings [{key, item, n}]}
// THE SAILS: HEARTH.stillParts(geyser keys) defines one sail item per geyser ring (its own fold key) and one for the springs; aP1.y is the tree's heading,
// set so the sail's plane stands across the wind (its face to the wind); the page's tick turns them all edge-on to the sun by day (HEARTH.sailTurn) and
// folds a ring on its geyser's warning and column (HEARTH.sailFold). Each tree and mat is a core/tags record before it is drawn.
// [G data]: records and BIO.put only.
HEARTH.stills=function(o){const {TAU,clamp,smooth,mix}=BIO.fn,D=HEARTH.DRESS.hot,seed=o.seed==null?7130:o.seed,q=o.q==null?1:o.q,G=o.ground||BIO.terrainH;
 const U=(r,i,salt)=>KRAND.unit(KRAND.hash(seed+r*977,i,salt)),T3=BIO.host.THREE,C=h=>new T3.Color(h),HOT=o.hot==null?.75:o.hot,COLD=o.cold==null?.55:o.cold;
 const W=o.wind||[.62,-.42],wl=Math.hypot(W[0],W[1])||1,wx=W[0]/wl,wz=W[1]/wl;
 /* the sail's heading: local z (its width) along the across-wind axis p = (-wz, wx); the turn's yaw maps local z to (sin a, cos a) */
 const across=Math.atan2(-wz,wx);
 const keys=HEARTH.stillParts((o.geysers||[]).filter(g=>g.kind!=='spouter').map(g=>g.key));
 const out={trees:[],counts:{still:0,sails:0,glass:0,spraymat:0,sailcup:0,tallow:0},rings:[]};
 const STALK=C(0x2e2b29),FOOT=C(0x3a3430),BLACK=C(0x161618),GLASS=C(0xe6ebe8),WAX=C(0xe8dcc0),MAT=C(0x1e1d1b);
 const tree=(x,z,ring,i,item,yFoot)=>{const y=yFoot==null?G(x,z):yFoot,H=mix(D.stalk[0],D.stalk[1],U(ring,i,1))*q+(1-q)*D.stalk[0],fr=mix(.9,1.6,U(ring,i,2));
  BIO.register({name:'A still tree',key:'still',kit:'hearths',x,z,y:y-.5,r:fr+3,h:H+2,tags:{heat:100+19*U(ring,i,3)}});
  BIO.put('sfoot',[x,y-.12,z],BIO.fn.qEuler(0,U(ring,i,4)*TAU,0),[fr,fr*1.2,fr],FOOT.clone().lerp(C(0x5a4a3c),.35*U(ring,i,5)));
  BIO.put('sstalk',[x,y,z],BIO.fn.qEuler((U(ring,i,6)-.5)*.04,0,(U(ring,i,7)-.5)*.04),[1,H,1],STALK);
  /* the sails: 4-6 tiers down the top third of the stalk, each a panel of three fans; the heading across the wind with a little of each tree's own */
  const nt=Math.round(mix(4,6,U(ring,i,8))),L=mix(D.fanL[0],D.fanL[1],U(ring,i,9)),hd=across+(U(ring,i,10)-.5)*.3;
  for(let k=0;k<nt;k++){const v=mix(.66,.96,k/(nt-1)),s=L*mix(1,.7,k/(nt-1));
   BIO.put(item,[x,y+H*v-s*.15,z],null,s,BLACK.clone().lerp(C(0x2a3a30),D.green*U(ring,i,20+k)),{aP0:[0,0,0,1],aP1:[0,hd+(k%2?Math.PI:0),0,0]});out.counts.sails++;}
  if(U(ring,i,11)<.5){const r=mix(.5,1.1,U(ring,i,12)),a=U(ring,i,13)*TAU;BIO.put('stallow',[x+Math.cos(a)*fr*.9,y+.01,z+Math.sin(a)*fr*.9],BIO.fn.qEuler(0,a,0),[r,.06,r],WAX);out.counts.tallow++;}
  out.trees.push({x,z,y,H,ring,heading:hd});out.counts.still++;};
 // the springs: a ring at the rim of each boiling one, a glass still or two by each that went cold
 (o.springs||[]).forEach((s,si)=>{const ring=1+si;
  if(s.temp>=HOT){const R=s.r*1.02+.6,n=Math.max(3,Math.round(TAU*R/mix(9,6,clamp((s.temp-HOT)/(1-HOT),0,1))*q));let m=0;
   for(let i=0;i<n;i++){const a=(i+.35*U(ring,i,30))/n*TAU,r=R+mix(-.3,1.2,U(ring,i,31)),x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r;tree(x,z,ring,i,'ssail',Math.min(G(x,z),s.level+.05));m++;}
   out.rings.push({key:s.key,item:'ssail',n:m});}
  else if(s.temp<COLD){const n=1+Math.floor(U(ring,0,40)*2);for(let i=0;i<n;i++){const a=U(ring,i,41)*TAU,r=s.r+mix(.5,2.5,U(ring,i,42)),x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r,y=G(x,z),H=mix(10,24,U(ring,i,43));
    BIO.register({name:'A glass still',key:'stillglass',kit:'hearths',x,z,y:y-.4,r:1.2,h:H+1});
    BIO.put('sglass',[x,y-.2,z],BIO.fn.qEuler((U(ring,i,44)-.5)*.1,U(ring,i,45)*TAU,(U(ring,i,46)-.5)*.1),[1.05,H,1.05],GLASS.clone().lerp(C(0xb8c8c4),.4*U(ring,i,47)));out.counts.glass++;}}});
 // the geysers: a ring at the spray line (outside it), its own sail item (it folds on its geyser); the spray mats inside it
 (o.geysers||[]).forEach((g,gi)=>{const ring=101+gi,item=g.kind==='spouter'?'ssail':'ssail:'+g.key,R=g.sprayR*1.08+2,n=Math.max(4,Math.round(TAU*R/8*q));let m=0;
  for(let i=0;i<n;i++){const a=(i+.3*U(ring,i,50))/n*TAU,r=R+mix(0,3,U(ring,i,51)),x=(g.sx==null?g.x:g.sx)+Math.cos(a)*r,z=(g.sz==null?g.z:g.sz)+Math.sin(a)*r;
   if(o.mask&&o.mask(x,z)<=0)continue;tree(x,z,ring,i,item);m++;}
  out.rings.push({key:g.key,item,n:m});
  const N=Math.round(g.sprayR*g.sprayR*.12*q);for(let i=0;i<N;i++){const a=U(ring,i,60)*TAU,r=Math.sqrt(U(ring,i,61))*g.sprayR*.92,x=(g.sx==null?g.x:g.sx)+Math.cos(a)*r,z=(g.sz==null?g.z:g.sz)+Math.sin(a)*r;
   if(o.mask&&o.mask(x,z)<=0)continue;const rr=mix(.5,1.3,U(ring,i,62));BIO.put('sspray',[x,G(x,z)+.015,z],BIO.fn.qEuler(0,U(ring,i,63)*TAU,0),[rr,.08,rr],MAT.clone().lerp(C(0x2c2a24),U(ring,i,64)*.5));out.counts.spraymat++;}
  if(N)BIO.register({name:'Spray mats inside the spray line',key:'spraymat',kit:'hearths',x:g.sx==null?g.x:g.sx,z:g.sz==null?g.z:g.sz,y:(g.base==null?G(g.x,g.z):g.base)-1,r:g.sprayR,h:2});});
 // the sail cups: down the warm run-off, 40-80 degC, their lips' fans across the wind
 (o.runoff||[]).forEach((P,ci)=>{const ring=301+ci,mine=[];for(let i=0;i<P.length;i++){const p=P[i];if(p[2]<40||p[2]>80||U(ring,i,70)>.5*q)continue;
   const side=U(ring,i,71)<.5?-1:1,off=mix(.3,1.2,U(ring,i,72))*side,x=p[0]-p[4]*off,z=p[1]+p[3]*off,y=G(x,z),s=mix(.35,.75,U(ring,i,73));
   BIO.put('scup',[x,y-.05,z],BIO.fn.qEuler(0,U(ring,i,74)*TAU,0),[s,s*.8,s],C(0x2a2622));
   BIO.put('scupfan',[x,y+s*.45,z],BIO.fn.qEuler(0,-across+Math.PI/2,-.25),[s*1.2,s*1.2,s*1.2],BLACK);out.counts.sailcup++;mine.push([x,y,z]);}
  /* one volume over this channel's own cups (none when it has none) */
  if(mine.length){let cx=0,cz=0,lo=1e9;mine.forEach(p=>{cx+=p[0];cz+=p[2];lo=Math.min(lo,p[1]);});cx/=mine.length;cz/=mine.length;let r=0;mine.forEach(p=>{r=Math.max(r,Math.hypot(p[0]-cx,p[2]-cz));});
   BIO.register({name:'Sail cups along the run-off',key:'sailcup',kit:'hearths',x:cx,z:cz,y:lo-1,r:r+1.5,h:3});}});
 return out;};
// THE SAILS' TWO SCALARS, one write a frame each (the page's tick):
// sailTurn(sunAz, sunAlt, wind): the yaw that turns the sails from across the wind toward edge-on to the sun by day (a sail edge-on to the sun is in its
//   plane: its width along the sun's bearing), as BIO.breathState('stills:turn').value (yaw / 2 pi). sunAz the sun's direction's angle atan2(dz, dx).
// sailFold(state): a ring's fold from its geyser's state (WATER.geyser S.state(t)): shut through the warning (pre) and the column, opening through
//   the steam, as BIO.breathState('stills:<key>').value
HEARTH.sailTurn=function(sunAz,sunAlt,wind){const {smooth}=BIO.fn,W=wind||[.62,-.42],across=Math.atan2(-W[1],W[0]);
 let want=Math.atan2(Math.cos(sunAz),Math.sin(sunAz));   /* local z (width) along the sun's bearing (sin a, cos a) = (cos az, sin az) */
 let d=want-across;d=Math.atan2(Math.sin(d),Math.cos(d));if(d>Math.PI/2)d-=Math.PI;if(d<-Math.PI/2)d+=Math.PI;   /* a sail is two-sided: the nearer of the two */
 const k=smooth(-2,25,sunAlt)*.75;return d*k/(2*Math.PI);};
HEARTH.sailFold=function(st){if(!st)return 0;if(st.phase==='pre'||st.phase==='column')return 1;
 if(st.phase==='steam')return BIO.fn.clamp(((st.steam==null?.1:st.steam)-.1)/.9,0,1);return 0;};   /* the steam phase's roar falls from 1 to .1: the sails open with it */
