// ================================================================= CORE — karst: a solution cave's plan and the land over it (KKARST)  [G data]
// Limestone caverns (the owner, 2026-11-03: "build whatever modules we would likely need for limestone caverns"; the Rift rim's
// gypsum mazes and lake-limestone caves, biomes/riftrim/PLAN.md "Caverns"; swhighlands' river cave and sinkhole chain; nwbay's
// and Ys's karst). KCAVERN carves voids from primitives and KSPELEO dresses them; nothing laid a cave out the way water does.
// KKARST does, as plain records, and hands them on: the passages and chambers to KCAVERN, the dolines and cenotes to KRELIEF,
// the streams and sumps to core/water's arguments, the drowning and the falls to core/hazard.
//   - passages follow BEDDING (a level: one height a level, or KSTRATA's soluble beds) and JOINTS (a jittered lattice at an angle)
//   - 'branch': BRANCHWORK. Sinks (swallets) on the surface feed passages that join downstream and run to one spring (a
//     resurgence), the floor falling toward it by `gradient`; 'maze': a NETWORK MAZE on the joints (Optymistychna's gypsum), each
//     joint passage open by a hash, the piece joined to the spring kept
//   - over the water table a passage carrying a stream is a KEYHOLE (a tube with a vadose canyon cut in its floor); under it a
//     SUMP (flooded); chambers where passages meet; upper (older, dry) levels joined to the one below by shafts
//   - the surface: a DOLINE (a bowl) over every sink with its shaft, a CENOTE (a steep collapse) where a chamber's roof is thin,
//     the spring's mouth a door in the hillside
// Opt-in; needs core/rand. KKARST.build needs 39-core-cavern.js; KKARST.relief's records draw once KRELIEF is loaded (this file
// adds the 'doline' kind to it, as 38b adds the lava forms). No THREE, no DOM; test-karst.js. Every draw is KRAND.hash of (world,
// level, i, j, salt): the same box and world give the same cave. A cave is one system (a branch's walk runs to its spring across
// the box), so a tile is not built alone: build the cave's box once and crop its records.
//
//   const N = KKARST.network({box:[x0,z0,x1,z1], ground (x,z)=>y, world, kind ('branch'|'maze'), level (y of the main level's floor),
//            levels ([{y, kind, p}]: older dry levels above, each its own network), table (the water table: level + 1 by default),
//            joints ({angle (rad), sp (40 m)}), spring ([x, z]: the resurgence; default the box's lowest-ground edge middle),
//            sinks ({cell (160 m), p (.5)}), p (.55: a maze joint's chance), gradient (.008), w ([2, 6]), h ([1.6, 4]),
//            chamber ({p (.25), r: [8, 22], h: [5, 14]}), canyon ([1, 3.5] m), thin (8 m: a chamber's roof under this has fallen)})
//     -> {format:'krator-karst', version:1, nodes:[{id, x, y, z, level, deg}], passages:[{id, a, b (node ids), level, w, h, section
//         ('keyhole'|'phreatic'|'sump'), canyon, stream (true where water runs)}], chambers:[{id, node, c:[x,y,z], rx, rz, h, flooded}],
//         shafts:[{id, c:[x,z], y0, y1, r, kind ('sink'|'level')}], sinks:[{id, x, z, node}], spring:{x, z, node, y},
//         dolines:[{id, kind:'doline', form ('bowl'|'cenote'), x, z, r, depth, floor}], table, world}
//   KKARST.build(C, N, {rock})   adds every passage (C.tube), keyhole canyon (C.trench), chamber (C.hall), shaft (C.shaft), sink
//            well and spring door (C.opening) to an unbuilt KCAVERN; -> {ids}
//   KKARST.water(N)   {streams:[{id, pts:[[x,y,z]...], w}], sumps:[{id, a:[x,y,z], b:[x,y,z], level}], pools:[{id, c:[x,z], r, level}],
//            spring:{at:[x,z], dir:[dx,dz]} (WATER.karstSpring's at and dir)}: the arguments, the drawing is core/water's
//   KKARST.hazards(N)   [{id, at, r, h, tags:{hazard}}]: 'drown' over each sump and flooded chamber, 'fall' down each shaft
//   KKARST.relief(N)    the dolines as KRELIEF records (kind 'doline'): KRELIEF.shape, at and apply take them once this file is loaded
//   KKARST.add strata: a KSTRATA recipe 'karst' (thick grey limestone, marl partings, chert bands) when KSTRATA is loaded
// Godot: the export is the record; KCAVERN's export is the cave.
(function(root){
  'use strict';
  function KR(){var K=root.KRAND;if(!K)throw new Error('KKARST: load core/rand/08-core-rand.js first');return K;}
  function d(v,x){return v==null?x:v;}
  function pair(a,w){if(!Array.isArray(a)||a.length!==2||!(a[0]<=a[1]))throw new Error('KKARST: '+w+' is [lo, hi]');return a;}
  function fin(v,w){if(typeof v!=='number'||!isFinite(v))throw new Error('KKARST: '+w+' must be a finite number');return v;}
  function sm(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}

  /* one level's network on the joint lattice: nodes at the joints' crossings (jittered by hash), edges along the joints */
  function level(o,L,lv,K,W){var an=d(o.joints&&o.joints.angle,0),sp=d(o.joints&&o.joints.sp,40),ca=Math.cos(an),sa=Math.sin(an),B=o.box,salt=0x4b00+lv*16;
    if(!(sp>0))throw new Error('KKARST: joints.sp must be above 0');
    var cs=[[B[0],B[1]],[B[2],B[1]],[B[0],B[3]],[B[2],B[3]]],u0=1e30,u1=-1e30,v0=1e30,v1=-1e30;
    cs.forEach(function(p){var u=p[0]*ca+p[1]*sa,v=-p[0]*sa+p[1]*ca;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);});
    var i0=Math.floor(u0/sp),i1=Math.ceil(u1/sp),j0=Math.floor(v0/sp),j1=Math.ceil(v1/sp),nodes={};
    function u(i,j,s){return K.unit(K.hash(W,lv,i,j,salt+s));}
    for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){var uu=(i+.3*(u(i,j,1)-.5))*sp,vv=(j+.3*(u(i,j,2)-.5))*sp,x=uu*ca-vv*sa,z=uu*sa+vv*ca;
      if(x<B[0]||x>B[2]||z<B[1]||z>B[3])continue;nodes[i+','+j]={id:'n'+lv+':'+i+','+j,i:i,j:j,x:x,z:z,level:lv,nb:[]};}
    return {nodes:nodes,u:u,sp:sp,key:function(i,j){return i+','+j;}};}
  function link(E,a,b,lv){var k=a.id<b.id?a.id+'|'+b.id:b.id+'|'+a.id;if(E[k])return false;E[k]={a:a,b:b,level:lv};a.nb.push(b);b.nb.push(a);return true;}
  function nearestNode(G,x,z){var best=null,bd=1e30;for(var k in G.nodes){var n=G.nodes[k],dd=Math.hypot(n.x-x,n.z-z);if(dd<bd){bd=dd;best=n;}}return best;}

  function network(o){o=o||{};var K=KR(),B=o.box;if(!Array.isArray(B)||B.length!==4||!(B[2]>B[0])||!(B[3]>B[1]))throw new Error('KKARST.network: box is [x0, z0, x1, z1]');
    if(typeof o.ground!=='function')throw new Error('KKARST.network: ground(x, z)');var W=d(o.world,0)>>>0,kind=d(o.kind,'branch');
    if(kind!=='branch'&&kind!=='maze')throw new Error('KKARST.network: kind is branch or maze');
    var y0=fin(o.level,'level'),table=d(o.table,y0+1),grad=d(o.gradient,.008),wr=pair(o.w||[2,6],'w'),hr=pair(o.h||[1.6,4],'h'),cnr=pair(o.canyon||[1,3.5],'canyon');
    var CH=o.chamber===false?null:(o.chamber||{}),chP=d(CH&&CH.p,.25),chR=pair((CH&&CH.r)||[8,22],'chamber r'),chH=pair((CH&&CH.h)||[5,14],'chamber h'),thin=d(o.thin,8);
    var spring=o.spring||(function(){var cand=[[(B[0]+B[2])/2,B[1]],[(B[0]+B[2])/2,B[3]],[B[0],(B[1]+B[3])/2],[B[2],(B[1]+B[3])/2]],best=cand[0];
      cand.forEach(function(c){if(o.ground(c[0],c[1])<o.ground(best[0],best[1]))best=c;});return best;})();
    var levels=[{y:y0,kind:kind,p:o.p}].concat((o.levels||[]).map(function(l){return {y:fin(l.y,'a level\'s y'),kind:d(l.kind,'maze'),p:l.p};}));
    var allN=[],E={},sinks=[],shafts=[],chambers=[],dolines=[],springNode=null;
    levels.forEach(function(Lv,lv){var G=level(o,Lv,lv,K,W),ks=Object.keys(G.nodes).sort();if(!ks.length)return;
      var S=nearestNode(G,spring[0],spring[1]),here={};
      if(Lv.kind==='maze'){var p=d(Lv.p,.55);ks.forEach(function(k){var n=G.nodes[k],r=G.nodes[G.key(n.i+1,n.j)],t=G.nodes[G.key(n.i,n.j+1)];
          if(r&&G.u(n.i,n.j,3)<p)link(E,n,r,lv);if(t&&G.u(n.i,n.j,4)<p)link(E,n,t,lv);});
        /* keep the piece joined to the spring's node */
        var seen={},q=[S];seen[S.id]=1;while(q.length){var c=q.shift();c.nb.forEach(function(m){if(!seen[m.id]){seen[m.id]=1;q.push(m);}});}
        Object.keys(E).forEach(function(k){if(E[k].level===lv&&!seen[E[k].a.id])delete E[k];});ks.forEach(function(k){var n=G.nodes[k];if(seen[n.id])here[n.id]=n;else n.nb=[];});
        ks.forEach(function(k){var n=G.nodes[k];n.nb=n.nb.filter(function(m){return seen[m.id];});});}
      else{/* branchwork: each sink walks the joints toward the spring and stops on the network it meets */
        var sc=d(o.sinks&&o.sinks.cell,160),sp2=d(o.sinks&&o.sinks.p,.5),inN={};inN[S.id]=1;here[S.id]=S;
        for(var sj=Math.floor(B[1]/sc);sj*sc<B[3];sj++)for(var si=Math.floor(B[0]/sc);si*sc<B[2];si++){if(K.unit(K.hash(W,lv,si,sj,0x4c01))>=sp2)continue;
          var sx=(si+.15+.7*K.unit(K.hash(W,lv,si,sj,0x4c02)))*sc,sz=(sj+.15+.7*K.unit(K.hash(W,lv,si,sj,0x4c03)))*sc;if(sx<B[0]||sx>B[2]||sz<B[1]||sz>B[3])continue;
          var n=nearestNode(G,sx,sz);if(!n||inN[n.id])continue;var start=n,steps=0;sinks.push({id:'sink:'+si+','+sj,x:n.x,z:n.z,node:n.id,level:lv});
          while(!inN[n.id]&&steps++<500){var opts=[[1,0],[-1,0],[0,1],[0,-1]].map(function(dv){return G.nodes[G.key(n.i+dv[0],n.j+dv[1])];}).filter(Boolean);
            opts.sort(function(a,b){return Math.hypot(a.x-S.x,a.z-S.z)-Math.hypot(b.x-S.x,b.z-S.z)||(a.id<b.id?-1:1);});
            var pick=opts.length>1&&G.u(n.i,n.j,5)<.25&&Math.hypot(opts[1].x-S.x,opts[1].z-S.z)<Math.hypot(n.x-S.x,n.z-S.z)?opts[1]:opts[0];
            if(!pick)break;link(E,n,pick,lv);inN[n.id]=1;here[n.id]=n;here[pick.id]=pick;n=pick;}
          inN[start.id]=1;}}
      /* the floors: the spring's level, rising upstream by the gradient along the passages (the water runs down to the spring) */
      S.y=Lv.y;var q2=[S],dn={};dn[S.id]=1;while(q2.length){var c2=q2.shift();c2.nb.forEach(function(m){if(dn[m.id])return;dn[m.id]=1;m.y=c2.y+grad*Math.hypot(m.x-c2.x,m.z-c2.z);q2.push(m);});}
      Object.keys(here).forEach(function(id){var n=here[id];if(n.y==null)n.y=Lv.y;allN.push(n);});
      if(lv===0)springNode=S;
      else{/* an upper level joins the one below by a shaft at its node nearest a lower node */
        var lower=allN.filter(function(n){return n.level===lv-1;}),best=null,bd=1e30;Object.keys(here).forEach(function(id){var n=here[id];lower.forEach(function(m){var dd=Math.hypot(n.x-m.x,n.z-m.z);if(dd<bd){bd=dd;best=[n,m];}});});
        if(best)shafts.push({id:'shaft:level'+lv,c:[best[0].x,best[0].z],y0:best[1].y,y1:best[0].y+.2,r:Math.max(1.2,wr[0]*.6),kind:'level',from:best[0].id,to:best[1].id});}});
    if(!springNode)throw new Error('KKARST.network: no joint crossing inside the box (box smaller than joints.sp?)');
    var byId={};allN.forEach(function(n){byId[n.id]=n;n.deg=n.nb.length;});
    var passages=Object.keys(E).sort().map(function(k){var e=E[k],a=e.a,b=e.b,u=function(s){return K.unit(K.hash(W,e.level,a.i*7919+b.i,a.j*7919+b.j,0x4d00+s));};
      var w=wr[0]+(wr[1]-wr[0])*u(1),h=hr[0]+(hr[1]-hr[0])*u(2),top=Math.max(a.y,b.y)+h,low=Math.min(a.y,b.y),stream=e.level===0&&kind==='branch';
      var sec=top<table?'sump':low<table?'phreatic':stream?'keyhole':'phreatic';
      return {id:'p:'+k,a:a.id,b:b.id,level:e.level,w:w,h:h,section:sec,canyon:sec==='keyhole'?cnr[0]+(cnr[1]-cnr[0])*u(3):0,stream:stream};});
    allN.forEach(function(n){if(n.deg<3||!CH)return;var u=function(s){return K.unit(K.hash(W,n.level,n.i,n.j,0x4e00+s));};if(u(0)>=chP)return;
      var rx=chR[0]+(chR[1]-chR[0])*u(1),rz=rx*(.6+.4*u(2)),h=chH[0]+(chH[1]-chH[0])*u(3),g=o.ground(n.x,n.z);
      var C={id:'ch:'+n.id,node:n.id,c:[n.x,n.y,n.z],rx:rx,rz:rz,h:h,flooded:n.y<table};chambers.push(C);
      if(g-(n.y+h)<thin)dolines.push({id:'cenote:'+n.id,kind:'doline',form:'cenote',x:n.x,z:n.z,r:Math.min(rx,rz)*.8,depth:Math.max(0,g-Math.max(n.y,table)),floor:Math.max(n.y,table),over:C.id});});
    sinks.forEach(function(s){var n=byId[s.node],g=o.ground(n.x,n.z),u=function(k){return K.unit(K.hash(W,9,n.i,n.j,0x4f00+k));};
      shafts.push({id:'shaft:'+s.id,c:[n.x,n.z],y0:n.y,y1:g+2,r:Math.max(1,wr[0]*.5+u(0)),kind:'sink',sink:s.id});
      dolines.push({id:'doline:'+s.id,kind:'doline',form:'bowl',x:n.x,z:n.z,r:8+22*u(1),depth:2+6*u(2),floor:null,over:s.id});});
    var sg=o.ground(springNode.x,springNode.z);
    return {format:'krator-karst',version:1,world:W,kind:kind,table:table,box:B.slice(),
      nodes:allN.map(function(n){return {id:n.id,x:n.x,y:n.y,z:n.z,level:n.level,deg:n.deg};}),passages:passages,chambers:chambers,shafts:shafts,sinks:sinks,
      spring:{x:springNode.x,z:springNode.z,node:springNode.id,y:springNode.y,ground:sg},dolines:dolines};}
  function nodeMap(N){var m={};N.nodes.forEach(function(n){m[n.id]=n;});return m;}
  function build(C,N,o){o=o||{};if(!C||typeof C.tube!=='function'||typeof C.build!=='function')throw new Error('KKARST.build: an unbuilt KCAVERN');
    if(!N||N.format!=='krator-karst')throw new Error('KKARST.build: a KKARST.network');var M=nodeMap(N),ids=[],rock=o.rock||'tuff';
    N.passages.forEach(function(P){var a=M[P.a],b=M[P.b];C.tube({id:P.id,owner:'karst',pts:[[a.x,a.y,a.z],[b.x,b.y,b.z]],w:P.w,h:P.h,rock:rock,blend:1.5});ids.push(P.id);
      if(P.canyon>0){var dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),nx=-dz/L*P.w*.18,nz=dx/L*P.w*.18,lo=Math.min(a.y,b.y);
        C.trench({id:P.id+':canyon',owner:'karst',poly:[[a.x+nx,a.z+nz],[b.x+nx,b.z+nz],[b.x-nx,b.z-nz],[a.x-nx,a.z-nz]],y0:lo-P.canyon,y1:lo+.3,rock:rock});ids.push(P.id+':canyon');}});
    N.chambers.forEach(function(H){C.hall({id:H.id,owner:'karst',c:H.c.slice(),rx:H.rx,rz:H.rz,h:H.h,belly:.2,rock:rock});ids.push(H.id);});
    N.shafts.forEach(function(S){C.shaft({id:S.id,owner:'karst',c:S.c.slice(),y0:S.y0,y1:S.y1,r0:S.r,r1:S.r*1.1,rock:rock});ids.push(S.id);
      if(S.kind==='sink')C.opening({id:S.id+':well',c:S.c.slice(),r:S.r*1.1,kind:'well'});});
    N.dolines.forEach(function(D){if(D.form==='cenote')C.opening({id:D.id+':well',c:[D.x,D.z],r:D.r,kind:'well'});});
    var sp=N.spring;C.opening({id:'spring:door',kind:'door',c:[sp.x,sp.z],y:sp.y,r:3});ids.push('spring:door');
    return {ids:ids};}
  function water(N){var M=nodeMap(N),streams=[],sumps=[],pools=[];
    N.passages.forEach(function(P){var a=M[P.a],b=M[P.b];
      if(P.section==='sump'||P.section==='phreatic'&&Math.min(a.y,b.y)<N.table)sumps.push({id:P.id+':sump',a:[a.x,a.y,a.z],b:[b.x,b.y,b.z],level:N.table});
      else if(P.stream){var lo=P.canyon>0?-P.canyon:0;streams.push({id:P.id+':stream',pts:[[a.x,a.y+lo+.05,a.z],[b.x,b.y+lo+.05,b.z]],w:Math.max(.4,P.canyon>0?P.w*.3:P.w*.5)});}});
    N.chambers.forEach(function(H){if(H.flooded)pools.push({id:H.id+':pool',c:[H.c[0],H.c[2]],r:Math.min(H.rx,H.rz)*.85,level:N.table});});
    var sp=N.spring,box=N.box,cx=(box[0]+box[2])/2,cz=(box[1]+box[3])/2,dx=sp.x-cx,dz=sp.z-cz,L=Math.hypot(dx,dz)||1;
    return {streams:streams,sumps:sumps,pools:pools,spring:{at:[sp.x,sp.z],dir:[dx/L,dz/L]}};}
  function hazards(N){var out=[],Wt=water(N);
    Wt.sumps.forEach(function(S){var x=(S.a[0]+S.b[0])/2,z=(S.a[2]+S.b[2])/2,y=Math.min(S.a[1],S.b[1]),L=Math.hypot(S.b[0]-S.a[0],S.b[2]-S.a[2]);
      out.push({id:S.id+':drown',at:[x,y,z],ry:-Math.atan2(S.b[2]-S.a[2],S.b[0]-S.a[0]),tags:{hazard:{kind:'drown',shape:{type:'box',w:L,d:6,h:Math.max(.5,S.level-y)}}}});});
    Wt.pools.forEach(function(P){out.push({id:P.id+':drown',at:[P.c[0],P.level-4,P.c[1]],r:P.r,tags:{hazard:{kind:'drown',shape:{type:'cyl',r:P.r,h:4}}}});});
    N.shafts.forEach(function(S){out.push({id:S.id+':fall',at:[S.c[0],S.y0,S.c[1]],r:S.r,tags:{hazard:{kind:'fall',danger:S.y1-S.y0>6?1:.7,shape:{type:'cyl',r:S.r,h:S.y1-S.y0}}}});});
    return out;}
  // ---- the dolines on KRELIEF: a bowl (soil slumping into the sink), or a cenote (a collapse: walls near sheer down to its floor)
  function dolH(D,x,z,g){var dd=Math.hypot(x-D.x,z-D.z);if(dd>=D.r)return g;var f=dd/D.r;
    if(D.form==='bowl'){var k=1-f*f;return g-D.depth*k*k;}
    var bot=D.floor==null?g-D.depth:D.floor;return Math.min(g,bot+(g-bot)*sm(.82,1,f));}
  function dolAt(D,x,z){var dd=Math.hypot(x-D.x,z-D.z);if(dd>=D.r)return null;return {part:D.form==='cenote'?(dd<D.r*.82?'floor':'wall'):(dd<D.r*.4?'floor':'slope')};}
  function relief(N){return N.dolines.map(function(D){return {kind:'doline',id:D.id,form:D.form,x:D.x,z:D.z,r:D.r,depth:D.depth,floor:D.floor};});}
  function hookRelief(){var R=root.KRELIEF;if(!R||!R.shape||R._karst)return;var s0=R.shape,a0=R.at,k0=R.kinds;
    R.shape=function(Rr,x,z,g){return Rr&&Rr.kind==='doline'?dolH(Rr,x,z,g):s0(Rr,x,z,g);};
    R.at=function(Rr,x,z,g){return Rr&&Rr.kind==='doline'?dolAt(Rr,x,z):a0(Rr,x,z,g);};
    R.apply=function(ground,recs){return function(x,z){var g=ground(x,z);for(var i=0;i<recs.length;i++)g=R.shape(recs[i],x,z,g);return g;};};
    R.kinds=function(){return k0().concat(['doline']);};R._karst=true;}
  hookRelief();
  // ---- a karst column for KSTRATA: thick grey limestone, thin marl partings (the passages' bedding planes), chert bands
  if(root.KSTRATA&&root.KSTRATA.add&&!root.KSTRATA.RECIPES.karst)root.KSTRATA.add({name:'karst',main:'lime',kinds:{
    lime:{p:.62,th:[3,18],col:[0xb4b0a6,0xc2bdb2,0xa9a59b,0xbcb6a8],hard:.8,xbed:0,varnish:.12},
    marl:{p:.22,th:[.2,1.2],col:[0x8d8676,0x968f7e,0x84806f],hard:.25,xbed:0,varnish:0,between:true},
    chert:{p:.08,th:[.1,.4],col:[0x5d5a55,0x4f4c48],hard:.95,xbed:0,varnish:0},
    dolo:{p:.08,th:[2,8],col:[0xc9b9a0,0xbfae93],hard:.85,xbed:0,varnish:.1}},fx:{}});
  root.KKARST={network:network,build:build,water:water,hazards:hazards,relief:relief,hookRelief:hookRelief,dolineH:dolH};
})(typeof window!=='undefined'?window:globalThis);
