// ================================================================= STATION caverns — the Hykkousoi karst under the bay: its plan (KKARST)
// The owner, 2026-11-03: "NW bay gets limestone caverns, maybe as a new station". biomes/KARST-SITES-5.1.md site 1 (the Hykkousoi karst,
// shared with Ys and k-guilin): thick grey limestone, hot, wet and dense-aired, the fastest-dissolving climate on the map. In the bay the karst
// is DROWNED: its passages lie under the sea's level, so they are sumps, and the people who breathe water (the Hykkousoi) use them as roads.
// This fragment runs before 45-host-stage.js: 45 calls NWBAY_KARST once the open ground (groundBase0) is known, and draws the ground from the
// surface it returns (the sinks' dolines on KRELIEF). The drawing is 89x-host-caverns.js. No THREE here: records only.
//
//   the network     KKARST.network on the site's bay call: level L - 25, table L + 1 (L = 0, the sea), sinks every 150 m (p .5),
//                   gradient .006, chambers p .25 (8-22 m, 5-14 m high), thin 10. The spring is a SHORE RESURGENCE at the foot of stack 6
//                   (the shore tower SW of the mouth) at the waterline, where the site says the bay's springs come out
//   the box         the three sinkholes, the shore and the spring: x -1150..1250, z -450..1400 (2.4 x 1.85 km), cropped from no larger system:
//                   the cave is one system, built once (KKARST's header)
//   the tiankeng    the page's KRELIEF-style hole is kept and the network runs under it (the site's second choice): its alcove nearest the
//                   spring's bearing becomes the mouth of a river passage, falling from the tiankeng's floor to the nearest node of the
//                   network: the cave under it. The tiankeng is the network's biggest collapse, older than the drowning
//   the cenotes     the page's two flooded shafts (18-28 m to the water table, a pool at 0) each get a FLOODED CHAMBER under their bed,
//                   joined by a shaft through the bed and a sump to the nearest node: the cave under each
//   the sinks       a sink stays only on dry land off the page's features (the river and its terraces, the tsingy, the stacks, the lava
//                   tongues, the basalt, the shelf pools, the sinkholes): its shaft and its doline go with it; a sink under the sea is
//                   dropped (its passage stays: a drowned branch from a lower sea). The dolines are the surface (KRELIEF 'doline')
// Every number below is from the site's suggested call, or the page's own records; nothing draws a random number but KKARST (KRAND).
var NWBAY_KARST=function(P){
 if(typeof KKARST==='undefined'||typeof KRELIEF==='undefined')return null;
 const TAU=Math.PI*2,t0=performance.now(),L=0,W=20261103,ground=P.ground,BOX=[-1150,-450,1250,1400];
 // the spring: on the shore below stack 6 (u 900, v -480), toward the bay's middle, where the ground is 0.2 .. 1.2 m over the sea
 const S6=P.STACKS[5],dx0=P.BAY.c[0]-S6.x,dz0=P.BAY.c[1]-S6.z,dl0=Math.hypot(dx0,dz0),ux=dx0/dl0,uz=dz0/dl0;let spring=null;
 for(let r=S6.r*S6.e*1.1;r<S6.r*S6.e*1.1+260&&!spring;r+=2){const x=S6.x+ux*r,z=S6.z+uz*r,g=ground(x,z);if(g<1.2&&g>.2)spring=[x,z];}
 if(!spring)spring=[S6.x+ux*S6.r*S6.e*1.3,S6.z+uz*S6.r*S6.e*1.3];
 const N=KKARST.network({box:BOX,ground,world:W,kind:'branch',level:L-25,table:L+1,spring,sinks:{cell:150,p:.5},gradient:.006,
  chamber:{p:.25,r:[8,22],h:[5,14]},thin:10});
 const byId={};N.nodes.forEach(n=>{byId[n.id]=n;n.nb=0;});N.passages.forEach(p=>{byId[p.a].nb++;byId[p.b].nb++;});
 const nearest=(x,z,f)=>{let b=null,bd=1e30;N.nodes.forEach(n=>{if(f&&!f(n))return;const d=Math.hypot(n.x-x,n.z-z);if(d<bd){bd=d;b=n;}});return b;};
 const add=[];   // the station's own records, kept apart for the checks
 // ---- the sinks: keep the dry ones off the page's features
 const offFeatures=(x,z)=>{const g=ground(x,z);if(g<1.5)return false;if(P.riverD(x,z)<60)return false;if(P.tsingyK(x,z)>.05)return false;
  if(P.lavaK(x,z)>.2||P.basaltK(x,z)>.05||P.shelfK(x,z)>.05)return false;
  for(const S of P.STACKS)if(Math.hypot(x-S.x,z-S.z)<S.r*S.e*1.6+30)return false;
  const Q=P.sinkAt(x,z);if(Q&&Q.d<40)return false;return true;};
 const dropSink={};N.sinks.forEach(s=>{if(!offFeatures(s.x,s.z))dropSink[s.id]=1;});
 N.sinks=N.sinks.filter(s=>!dropSink[s.id]);
 N.shafts=N.shafts.filter(s=>!(s.kind==='sink'&&dropSink[s.sink]));
 N.dolines=N.dolines.filter(D=>D.form==='bowl'?!dropSink[D.over]:offFeatures(D.x,D.z));
 // ---- the tiankeng: its alcove nearest the spring's bearing (the alcoves are 45's, hashed the same way: KRAND.hash(0xA1C0, sd, i, k)),
 // the mouth at the alcove's back, a passage falling from the floor to the nearest node
 const TK=P.SINKS[0],R=TK.r*TK.e,top=ground(TK.x,TK.z),floorY=TK.floor!=null?TK.floor:top-TK.depth,h=k=>i=>KRAND.unit(KRAND.hash(0xA1C0,TK.sd,i,k));
 const brg=Math.atan2(spring[1]-TK.z,spring[0]-TK.x);let best=null;
 for(let i=0;i<5;i++){const a=(i+.2+.6*h(1)(i))/5*TAU,da=Math.abs(Math.atan2(Math.sin(a-brg),Math.cos(a-brg)));
  const A={i,a,t:mix(.5,.74,h(2)(i)),w:mix(12,20,h(3)(i)),hh:mix(5,8,h(4)(i)),d:mix(10,17,h(5)(i))};if(!best||da<best.da)best=Object.assign(A,{da});}
 const R0=P.sinkRad(TK,best.a);
 // the alcove's mouth stands at t on the wall (t 0 rim .. 1 floor): its floor a little under the alcove's middle
 const yM=mix(top,floorY+TK.talus,best.t)-best.hh*.45,ax=Math.cos(best.a),az=Math.sin(best.a);
 const mouth={x:TK.x+ax*(R0*(1+TK.bell)+best.d*.5),y:yM,z:TK.z+az*(R0*(1+TK.bell)+best.d*.5)};
 // the passage: from the mouth through the wall, then down round the tiankeng (a quarter turn toward the spring at R0 + 45 m, the floor
 // falling as a vadose canyon) into the OLD RIVER CHAMBER under its floor (the hall the tiankeng's roof fell into: its crown 8 m under the
 // floor's breakdown), and from it a sump to the nearest node of the network
 const tkPts=[],chH=22,chR=[34,28],chY=floorY-8-chH,chC={x:TK.x+Math.cos(brg)*R*.25,z:TK.z+Math.sin(brg)*R*.25};
 const tch={id:'nw:tiankeng:chamber',node:'nw:tiankeng:ch',c:[chC.x,chY,chC.z],rx:chR[0],rz:chR[1],h:chH,flooded:chY<N.table,station:'tiankeng'};
 {const nodes=[{id:'nw:tiankeng:mouth',x:TK.x+ax*R0*.92,y:yM,z:TK.z+az*R0*.92}],turn=Math.atan2(Math.sin(brg-best.a),Math.cos(brg-best.a))>0?1:-1,RR=R0*(1+TK.bell)+45;
  nodes.push({id:'nw:tiankeng:in',x:TK.x+ax*(R0*(1+TK.bell)+best.d+12),y:yM-1.5,z:TK.z+az*(R0*(1+TK.bell)+best.d+12)});
  const n=6;for(let k=1;k<=n;k++){const t=k/n,a=best.a+turn*t*Math.PI*.5,rr=mix(RR,chR[0]*.6+R*.25,Math.pow(t,1.6));
   nodes.push({id:'nw:tiankeng:'+k,x:TK.x+Math.cos(a)*rr,y:mix(yM-1.5,chY+.5,Math.pow(t,.9)),z:TK.z+Math.sin(a)*rr});}
  nodes[nodes.length-1].id='nw:tiankeng:ch';nodes[nodes.length-1].x=chC.x;nodes[nodes.length-1].z=chC.z;nodes[nodes.length-1].y=chY;
  nodes.forEach(q=>{q.level=0;q.deg=2;N.nodes.push(q);byId[q.id]=q;});
  for(let k=0;k+1<nodes.length;k++){const a=nodes[k],b=nodes[k+1],w=k===0?best.w*.55:mix(7,5,k/(nodes.length-2)),hh=k===0?best.hh*.9:mix(6.5,4,k/(nodes.length-2));
   const sc=Math.max(a.y,b.y)+hh<N.table?'sump':Math.min(a.y,b.y)>N.table?'keyhole':'phreatic';
   const pp={id:'nw:tiankeng:p'+k,a:a.id,b:b.id,level:0,w,h:hh,section:sc,canyon:sc==='keyhole'&&k>0?1.8:0,stream:sc==='keyhole'&&k>0,station:'tiankeng'};N.passages.push(pp);add.push(pp);}
  N.chambers.push(tch);add.push(tch);
  const m=nearest(chC.x,chC.z,q=>!/^nw:/.test(q.id)),ps={id:'nw:tiankeng:sump',a:'nw:tiankeng:ch',b:m.id,level:0,w:6,h:4,section:chY+4<N.table?'sump':'phreatic',canyon:0,stream:false,station:'tiankeng'};
  N.passages.push(ps);add.push(ps);tkPts.push(...nodes.map(q=>[q.x,q.y,q.z]));}
 // ---- the cenotes: a flooded chamber under each bed, a shaft through the bed, a sump to the nearest node
 const cen=P.SINKS.filter(S=>S.kind==='cenote').map((S,ci)=>{const bed=S.floor,u=k=>KRAND.unit(KRAND.hash(W,0xCE70,ci,k)),rx=mix(12,18,u(1)),rz=rx*mix(.7,1,u(2)),hh=mix(8,12,u(3));
  const c=[S.x,bed-hh-4,S.z],node={id:'nw:cenote'+ci+':ch',x:S.x,y:c[1],z:S.z,level:0,deg:2};N.nodes.push(node);byId[node.id]=node;
  const ch={id:'nw:cenote'+ci+':chamber',node:node.id,c,rx,rz,h:hh,flooded:c[1]+hh<N.table||c[1]<N.table,station:'cenote'};N.chambers.push(ch);add.push(ch);
  const sh={id:'nw:cenote'+ci+':shaft',c:[S.x,S.z],y0:c[1]+hh*.7,y1:bed+.6,r:Math.min(S.r*.16,3.6),kind:'cenote',station:'cenote'};N.shafts.push(sh);add.push(sh);
  const m=nearest(S.x,S.z,n=>!/^nw:/.test(n.id)),p={id:'nw:cenote'+ci+':sump',a:node.id,b:m.id,level:0,w:mix(4,6,u(4)),h:mix(2.6,3.6,u(5)),section:'sump',canyon:0,stream:false,station:'cenote'};
  N.passages.push(p);add.push(p);return {S,ch,sh,p,m:m.id};});
 // ---- the spring's riser: from the spring's node up to under the shore pool (its boil is core/water's, 89x)
 {const sn=byId[N.spring.node],g=ground(spring[0],spring[1]),top={id:'nw:spring:riser',x:spring[0],y:g-2.2,z:spring[1],level:0,deg:1};N.nodes.push(top);byId[top.id]=top;
  const p={id:'nw:spring:p',a:sn.id,b:top.id,level:0,w:3.2,h:2.6,section:'sump',canyon:0,stream:false,station:'spring'};N.passages.push(p);add.push(p);}
 // ---- the surface: the kept dolines on KRELIEF over the open ground
 const recs=KKARST.relief(N);const surf=recs.length?KRELIEF.apply(ground,recs):null;
 return {N,surf,recs,spring,tiankeng:{mouth,alcove:best,pts:tkPts,R0,chamber:tch,floorY},cenotes:cen,box:BOX,add,ms:Math.round(performance.now()-t0),
  dropped:Object.keys(dropSink).length};
 function mix(a,b,t){return a+(b-a)*t;}};
