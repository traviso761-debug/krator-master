/* ============================== 16b. GROUND TRAILS ==============================
   PLANNER-OWNED. Wires the forest floor into the walk graph: a foot trail from
   the South Gate's lift yard to the log bridge, ALONG THE TOP OF THE LOG across
   the river, and on to the East Gate's yard — so a few walkers are always down
   on the jungle floor and crossing the log. Runs after 62-jungle.js (LOGS) and
   before 78-life.js (which reads NAV at load).                              */
reseed(630001);
(function(){
  var G = null; (typeof LOGS!=='undefined' ? LOGS : []).forEach(function(L){ if(L.bridge) G = L; });
  if(!G){ window._trails = { log:false }; return; }
  function trail(ax,az,bx,bz, first){
    var L=Math.hypot(bx-ax,bz-az), n=Math.max(2,Math.round(L/32)), prev=first, px=-(bz-az)/L, pz=(bx-ax)/L;
    for(var i=1;i<n;i++){ var t=i/n, w=34*Math.sin(t*Math.PI)*sig(ax+i*31,az-i*17,0.01);
      var x=mix(ax,bx,t)+px*w, z=mix(az,bz,t)+pz*w;
      TREES.forEach(function(T){ var d=Math.hypot(x-T.x,z-T.z), need=T.rb*2.1+8; if(d<need){ x=T.x+(x-T.x)/d*need; z=T.z+(z-T.z)/d*need; } });
      var nd=navNode(x, terrainH(x,z), z, null, -2, 'ground'); navEdge(prev, nd, 'ground'); prev=nd; }
    return prev;
  }
  /* nodes along the log's crown, skipping the buried butt and the twiggy tip */
  var top=[], pts=G.pts;
  for(var i=0;i<pts.length;i++){ var p=pts[i]; if(p.r < 3.2) continue; if(p.y + p.r < terrainH(p.x,p.z) + 1.0) continue; top.push(p); }
  if(top.length < 3){ window._trails = { log:false }; return; }
  var logNodes = top.map(function(p){ return navNode(p.x, p.y + p.r*0.96, p.z, null, -2, 'log'); });
  for(var k=1;k<logNodes.length;k++) navEdge(logNodes[k-1], logNodes[k], 'ground');
  var endA=logNodes[0], endB=logNodes[logNodes.length-1];
  /* step-off nodes on the ground beside each end */
  function stepOff(nd, p){ var gx=p.x+(p.x-G.cx)/Math.hypot(p.x-G.cx,p.z-G.cz)*(p.r+4), gz=p.z+(p.z-G.cz)/Math.hypot(p.x-G.cx,p.z-G.cz)*(p.r+4);
    var g=navNode(gx, terrainH(gx,gz), gz, null, -2, 'ground'); navEdge(nd, g, 'ground'); return g; }
  var gA=stepOff(endA, top[0]), gB=stepOff(endB, top[top.length-1]);
  var south = gA.z > gB.z ? gA : gB, north = gA.z > gB.z ? gB : gA;
  var liftS=null, liftE=null; LIFTS.forEach(function(Lf){ if(Lf.plat===P_G2) liftS=Lf; if(Lf.plat===P_G3) liftE=Lf; });
  navEdge(trail(south.x,south.z, liftS.ground.x,liftS.ground.z, south), liftS.ground, 'ground');
  navEdge(trail(north.x,north.z, liftE.ground.x,liftE.ground.z, north), liftE.ground, 'ground');
  REGISTER({ name:'Log bridge', kind:'log', label:'Foot trail over the river', x:G.cx, z:G.cz, y:0, h:60, r:12 });
  (function(){ var seen=new Uint8Array(NAV.nodes.length), q=[0], c=1; seen[0]=1;
    while(q.length){ var u=q.pop(); NAV.adj[u].forEach(function(eid){ var e=NAV.edges[eid], v=e.a===u?e.b:e.a; if(!seen[v]){ seen[v]=1; c++; q.push(v); } }); }
    NAV.reachable = c; })();
  window._trails = { log:true, logNodes:logNodes.length, navNodes:NAV.nodes.length };
  PATHVIZ.push({ key:'trails', label:'Forest-floor trail + log bridge', color:0xc2a24e, paths:function(){
    return NAV.edges.filter(function(e){ return e.kind==='ground'; }).map(function(e){ var a=NAV.nodes[e.a], b=NAV.nodes[e.b]; return [[a.x,a.y,a.z],[b.x,b.y,b.z]]; }); } });
})();
