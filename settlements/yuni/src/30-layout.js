/* ============================== 8. LAYOUT ==============================
   PLANNER-OWNED. Builds NO geometry. Owns every position in Yuni: the wall,
   its five gates and sentry towers, the Grand Vault and its antechamber, the
   districts, reserved sites (market circle, caravanserai, parks, forecourt),
   the whole street network (with the connectivity pass) and the walk graph.
   Everything else reads it.                                                */
reseed(300001);

var GV_Y = GROUND0 + 2.4;                 /* forecourt / vault threshold level */
var WALL = { R:RW, h:11.5, thick:4.2, a0:101*Math.PI/180, a1:(360+79)*Math.PI/180, walkY:0 };
/* the wall runs INTO the rock at both ends: find where its centre line meets the butte and carry on 2 degrees */
(function(){ if(SHEET) return; var d=Math.PI/180, a;
  for(a=125*d; a>91*d; a-=0.25*d){ if(inButte(Math.cos(a)*RW, Math.sin(a)*RW, GROUND0+8, -2)){ WALL.a0=a-2*d; break; } }
  for(a=55*d; a<89*d; a+=0.25*d){ if(inButte(Math.cos(a)*RW, Math.sin(a)*RW, GROUND0+8, -2)){ WALL.a1=2*Math.PI+a+2*d; break; } } })();
var RING_R = RW + 26;                     /* centre line of the ring road outside the wall */
var RING_W = 16;

/* ---- districts ------------------------------------------------------------
   clock 6.5-10 prosperous · 10-12 market · 12-6 poor, poorer toward 6.
   wealth 0..1 drives paint/mosaic density later; chaos 0..1 drives the streets. */
function districtAt(x,z){
  var r=Math.hypot(x,z), h=clockOf(x,z);
  if(r < RW) return { key:'core', name:'Inner city', wealth:0.9, chaos:0.0 };
  if(h >= 6.5 && h < 10) return { key:'prosper', name:'Prosperous quarter', wealth:0.62, chaos:0.07 };
  if(h >= 10) return { key:'market', name:'Market district', wealth:0.72, chaos:0.16 };
  var t = clamp(h/6, 0, 1);                                   /* 0 at 12 o'clock .. 1 at 6 */
  if(h >= 6) t = 1;
  return { key:'poor', name: t<0.4?'North-east quarter': t<0.75?'East side':'The Thatch (slums)', wealth:mix(0.42,0.04,t), chaos:mix(0.22,0.80,t) };
}
function districtEdgeR(h){                                     /* how far the built-up area reaches, by clock */
  if(h >= 6.5 && h < 10) return 705;
  if(h >= 10) return 735;
  return mix(700, 610, clamp(h/6,0,1));
}

/* ---- gates: five, equidistant from each other and from the Vault (every 60 deg) ---- */
var GATES = [8,10,12,2,4].map(function(h, i){
  var a = clockA(h), names = ['Shepherds\' Gate (SW)','Caravan Gate (NW)','North Gate','River Gate (NE)','Potters\' Gate (SE)'];
  return { id:i, clock:h, a:a, name:names[i], x:Math.cos(a)*RW, z:Math.sin(a)*RW, ox:Math.cos(a), oz:Math.sin(a), w:9.5, hOpen:11, highway:['SW','NW',null,'NE','SE'][i] };
});
/* sentry towers: every 15 deg between the gates; two larger ones flank each gate */
var WALL_TOWERS = (function(){
  var out=[], n=0;
  for(var deg=105; deg<=435; deg+=15){
    var a=deg*Math.PI/180, isGate=false;
    GATES.forEach(function(g){ if(angDist(a,g.a) < 0.02) isGate=true; });
    if(isGate) continue;
    out.push({ id:n++, a:a, x:Math.cos(a)*RW, z:Math.sin(a)*RW, r:6.2, h:24, kind:'sentry', name:'Sentry tower '+(n) });
  }
  GATES.forEach(function(g){ [-1,1].forEach(function(s){
    var a=g.a + s*(g.w/2+7.5)/RW;
    out.push({ id:n++, a:a, x:Math.cos(a)*RW, z:Math.sin(a)*RW, r:7.6, h:30, kind:'gatetower', gate:g.id, name:g.name+' tower' });
  }); });
  return out;
})();

/* ---- reserved sites ---- */
var MARKET = (function(){ var g=GATES[1], d=RING_R+8+92; return { x:g.ox*d, z:g.oz*d, r:78, name:'Great Market circle' }; })();
var CENTER_PLAZA = { x:0, z:0, r:27, name:'Hub plaza' };
var FORECOURT = { x:0, z:VAULT.zf-74, r:58, name:'Vault forecourt' };
var CARAVANSERAI = (function(){ var a=clockA(10.55), d=610; return { x:Math.cos(a)*d, z:Math.sin(a)*d, w:96, d:72, ry:-a, name:'Caravanserai (site)' }; })();
var PARKS = [ [7.35,468,48,'Serpent Park'], [8.75,598,56,'Park of the Hundred Columns'], [9.45,462,44,'Lizard Stair Garden'] ].map(function(p){
  var a=clockA(p[0]); return { x:Math.cos(a)*p[1], z:Math.sin(a)*p[1], r:p[2], name:p[3]+' (site)' }; });
var BRIDGES = [];                          /* filled where a highway crosses the river or the canal */
var BASIN = { x:CANAL_BASIN.x, z:CANAL_BASIN.z, w:CANAL_BASIN.w, d:CANAL_BASIN.d, ry:CANAL_BASIN.ry, name:'The Basin (canal reservoir)' };

/* ============================== THE INNER-CITY PLOT SCHEDULE ==============================
   The Ancients were here first. Their works stand inside the wall as SUPERBLOCKS and Yuni's
   radial grid is laid around them: the ring streets run on, the spokes stop at a superblock
   and resume on the far side.

   IN_RINGS are the inner city's ring streets. The band 184 -> 288 is the ANCIENT BELT,
   104 m deep — the depth of the academic quadrangle, and exactly three comb-wall slabs
   with 13 m courts between them. Inside the belt the spoke granularity drops from 7.5 to
   15 degrees, because a 7.5 degree bay out there is 31 m and nothing the Ancients built
   fits in 31 m.

   Each plot is an ARC: {r0,r1,a0,a1} in metres and degrees, packed round the circle by
   PLOTPACK, which steps over the gate boulevards and the processional way rather than
   straddling them. 68-place.js turns each into world coordinates and builds it.       */
var IN_RINGS = [72, 128, 184, 236, 288, 312];
var BELT = { r0:184, r1:288 };
var NORTH_A0 = 250, NORTH_A1 = 345;          /* the fine-grained ordinary town, in degrees */
function inNorthHalf(deg){ deg=((deg%360)+360)%360; return deg >= NORTH_A0 && deg <= NORTH_A1; }

var PLOTS = [];
(function(){
  if(SHEET) return;
  var D=Math.PI/180;
  /* corridors no plot may cross: the processional way, and every gate's boulevard */
  var PROC = [82, 98];
  function corridors(rMid){
    var half = 11 / (rMid*D);                                  /* 22 m of boulevard + verge */
    var out = [[PROC[0], PROC[1]]];
    GATES.forEach(function(g){ var d=((Math.round(g.a/D)%360)+360)%360; out.push([d-half, d+half]); });
    return out;
  }
  function norm(a){ while(a<0) a+=360; while(a>=360) a-=360; return a; }
  /* pack a run of plots into one band, starting at a0 and sweeping forward */
  /* A rectangle set on a curve needs MORE arc than w/r: its inner corners swing widest,
     so the angle it really occupies is 2*atan((w/2) / rIn), where rIn is the radius of
     its inner face. Packing on w/r is what let the quadrangle's corner cut 12 m into the
     hospital's. rPlace mirrors exactly what 68-place.js will do with the same plot. */
  function needDeg(it, r0, r1){
    if(it.arc != null) return it.arc;
    var w=it.w, d=it.d||w, rMid=(r0+r1)/2, rc;
    if(it.arrange==='radialBank') rc = r0 + 6 + d/2;                 /* the innermost slab */
    else if(it.arrange==='facingPair'){ rc = rMid; d = it.dRad || d; }
    else { rc = r0 + 9 + d/2; if(rc + d/2 > r1 - 4) rc = rMid; }
    var rIn = Math.max(20, rc - d/2);
    return 2*Math.atan((w/2)/rIn) / D;
  }
  /* PACK sweeps forward from startDeg, stepping over anything already claimed: the gate
     boulevards, the processional way, and — the part that matters once more than one run
     shares a radial band — every plot already scheduled whose band overlaps this one. A
     run that cannot fit a plot before endDeg refuses it and says so rather than wrapping
     round the circle and landing on top of something. */
  var PLOT_OVERFLOW = [];
  function PACK(r0, r1, startDeg, endDeg, items, gapDeg){
    var rMid=(r0+r1)/2, cs=corridors(rMid), a=startDeg, gap=gapDeg==null?2.0:gapDeg;
    items.forEach(function(it){
      var need = needDeg(it, r0, r1);
      for(var guard=0; guard<40; guard++){
        var hit=null;
        function block(c0, c1){ for(var k=-1;k<=1;k++){ var q0=c0+k*360, q1=c1+k*360;
          if(a < q1 && a+need > q0 && (hit==null || q1 > hit)) hit = q1; } }
        cs.forEach(function(c){ block(c[0], c[1]); });
        PLOTS.forEach(function(Q){ if(Q.r1 <= r0 || Q.r0 >= r1) return; block(Q.a0 - gap, Q.a1 + gap); });
        if(hit==null) break; a = hit + gap;
      }
      if(a + need > endDeg){ PLOT_OVERFLOW.push(it.name + ' (' + need.toFixed(1) + ' deg, no room before ' + endDeg + ')'); return; }
      PLOTS.push({ key:it.key, variant:it.variant||0, name:it.name, r0:r0, r1:r1, a0:a, a1:a+need, d:it.d,
                   count:it.count||1, arrange:it.arrange||'single', face:it.face||'in', tag:it.tag||'ancient' });
      a += need + gap;
    });
    return a;
  }

  /* ---- THE ANCIENT BELT, 184 -> 288 (104 m deep) ---- */
  /* east arm: the Foundry out by the Potters' Gate where the goods go, then the working
     yards, then the laboratory nearest the processional way */
  PACK(184, 288, 340, 442, [
    { key:'ancient_factory',  variant:1, w:146, d:92, name:'The Foundry' },
    { key:'ancient_fuel',     variant:0, w:56,  d:54, name:'Ancient fuel station' },
    { key:'ancient_radar',    variant:1, w:36,  d:38, name:'Ancient radar tower' },
    { key:'ancient_lab_compact', variant:0, w:40, d:40, name:'The Reliquary' }
  ]);
  /* west arm: the Cloisters (the Geomancers' Guild), the hospital, then the two Ancient
     apartment groups out toward the Caravan side */
  PACK(184, 288, 98, 250, [
    { key:'ancient_quad',     variant:0, w:124, d:104, name:'The Cloisters \u2014 Geomancers\u2019 Guild' },
    { key:'ancient_hospital', variant:1, w:68,  d:54, name:'Ancient hospital' },
    { key:'ancient_apartments_comb', variant:0, w:74, d:26, count:3, arrange:'radialBank', name:'Comb-wall apartments' },
    { key:'ancient_apartments_comb_short', variant:0, w:120, d:120, dRad:64, count:2, arrange:'facingPair', name:'Comb-block apartments' }
  ]);

  /* ---- BAND 128 -> 184 (56 m deep): the Order's precinct east of the way, the ruined
          Ancient library, the corn-cob cluster and the Library of Yuni west of it ---- */
  PACK(128, 184, 334, 442, [
    { key:'civic_archive',      variant:0, w:60, d:44, name:'Archive of the Order', tag:'state' },
    { key:'civic_chapter_house',variant:0, w:56, d:48, name:'Chapter house of the Historians', tag:'state' },
    { key:'civic_school',       variant:0, w:46, d:30, name:'School of the Order', tag:'state' }
  ]);
  PACK(128, 184, 98, 250, [
    { key:'ancient_library',            variant:2, w:74, d:47, name:'Ancient library (ruin)' },
    { key:'ancient_apartments_cobs',    variant:0, w:48, d:42, name:'Corn-cob cluster' },
    { key:'civic_library',              variant:0, w:64, d:52, name:'Library of Yuni', tag:'state' },
    { key:'rich_emir_palace',           variant:0, w:70, d:56, name:'The Emir\u2019s Palace', tag:'state' }
  ]);

  window.__plotOverflow = PLOT_OVERFLOW;
  /* a point is inside a plot if it is inside its arc, with a margin */
  window.__plots = PLOTS;
})();
function inPlot(x,z,margin){
  if(!PLOTS.length) return false;
  var r=Math.hypot(x,z), deg=Math.atan2(z,x)*180/Math.PI, m=margin||0;
  for(var i=0;i<PLOTS.length;i++){ var P=PLOTS[i];
    if(r < P.r0-m || r > P.r1+m) continue;
    var am = m/(Math.max(1,r)*Math.PI/180);
    for(var k=-1;k<=1;k++){ var d=deg+k*360; if(d > P.a0-am && d < P.a1+am) return true; }
  }
  return false;
}

if(!SHEET){
  TERRAIN_PADS.push([FORECOURT.x, FORECOURT.z+36, 100, 160, GV_Y]);
  TERRAIN_PADS.push([MARKET.x, MARKET.z, MARKET.r+6, MARKET.r+60, terrainH(MARKET.x,MARKET.z)]);
}
function wallWalkY(a){ if(SHEET) return 10; var s=0; for(var k=-2;k<=2;k++) s += terrainH(Math.cos(a+k*0.06)*RW, Math.sin(a+k*0.06)*RW); return s/5 + WALL.h - 1.4; }
WALL.walkY = GV_Y + WALL.h - 1.4;

/* ---- the Grand Vault and the antechamber beneath the butte ----
   The facade stands in the slot (10-core.js) at z = VAULT.zf, 2*halfW wide and
   VAULT.top high. Its great door opens on a ramped tunnel running due south,
   down to a round antechamber centred under the butte.                    */
var VAULTSITE = { x:0, z:VAULT.zf, y:GV_Y, plinth:5.0, doorW:16, doorH:24, name:'The Grand Vault' };
VAULTSITE.doorY = GV_Y + VAULTSITE.plinth;
var ANTE = { x:BUTTE.x, z:BUTTE.z+10, R:46, floorY:GV_Y-24, H:34, name:'Antechamber' };
var TUNNEL = { x0:0, z0:VAULT.zf+6, y0:VAULTSITE.doorY, x1:0, z1:ANTE.z-ANTE.R+2, y1:ANTE.floorY, w:14, h:16, name:'Vault tunnel' };

/* ============================== STREET NETWORK ==============================
   ST.nodes[{id,x,z,y,tag}], ST.edges[{a,b,cls,w,len}].
   cls priority (door orientation pass): highway > boulevard > ring > street > alley > lane */
var ST_CLASS = { highway:{w:14,pri:6}, boulevard:{w:12,pri:5}, ring:{w:RING_W,pri:5}, street:{w:7.5,pri:3}, alley:{w:4,pri:2}, lane:{w:3.2,pri:1}, road:{w:8,pri:4} };
var ST = { nodes:[], edges:[], adj:[] };
function stNode(x,z,tag){ var n={ id:ST.nodes.length, x:x, z:z, y:0, tag:tag||'street' }; ST.nodes.push(n); return n; }
var ST_EKEY = {};
function stEdge(a,b,cls){
  if(!a||!b||a===b) return null; var k = a.id<b.id ? a.id+'_'+b.id : b.id+'_'+a.id; if(ST_EKEY[k]) return ST_EKEY[k];
  var e={ id:ST.edges.length, a:a.id, b:b.id, cls:cls, w:ST_CLASS[cls].w, len:Math.hypot(a.x-b.x,a.z-b.z) }; ST.edges.push(e); ST_EKEY[k]=e; return e;
}
function stBlocked(x,z){
  if(inButte(x,z,GV_Y+2,10)) return true;
  if(riverDist(x,z) < 26) return true;
  var bd=Math.hypot(x-BUTTE.x,z-BUTTE.z);
  /* the talus. Lanes may climb the lower apron — the slums do exactly that — so only the
     steep upper skirt is barred, and the cleared north face is open all the way in. */
  if(bd < 430 && Math.hypot(x,z) > RW+60 && angDist(Math.atan2(z-BUTTE.z,x-BUTTE.x), -Math.PI/2) > 1.15) return true;
  return false;
}
var HIGHWAYS = [];                         /* [{name, pts:[[x,z]...], nodes:[...]}] for the ribbons beyond the painted box */
(function(){
  if(SHEET) return;
  var D2R=Math.PI/180, SP=3.75;            /* spoke granularity, degrees */
  var NSP = Math.round(360/SP);
  /* ---------- A. the inner city: a rigid radial grid ---------- */
  var hub = stNode(0,0,'hub');
  var inRings=IN_RINGS, inner=[];       /* inner[i][j] for spoke j (SP deg each) */
  function spokeClassIn(j){ var deg=j*SP; if(Math.abs(deg%60-30)<0.01) return 'main'; if(Math.abs(deg%30)<0.01) return 'sec'; if(Math.abs(deg%15)<0.01) return 'ter'; if(Math.abs(deg%7.5)<0.01) return 'arc'; return null; }
  inRings.forEach(function(r,i){
    inner[i]=[];
    var fullRing = r !== 236;                                              /* ring 236 exists in the north half only */
    for(var j=0;j<NSP;j++){ var sc=spokeClassIn(j); if(!sc) continue;
      var deg=j*SP, a=deg*D2R, x=r*Math.cos(a), z=r*Math.sin(a);
      if(stBlocked(x,z)) continue;
      if(!fullRing && !inNorthHalf(deg)) continue;
      /* the southern two-thirds is coarse: 15 degree spokes, because a 7.5 degree bay out
         in the Ancient belt is 31 m and nothing the Ancients built fits in 31 m */
      if(!inNorthHalf(deg) && sc==='arc' && r >= 184) continue;
      if(inPlot(x,z,3)) continue;                                          /* the superblocks swallow their nodes */
      if(i===inRings.length-1 && angDist(a,Math.PI/2) < 22*D2R) continue;   /* the wall lane stops at the forecourt */
      inner[i][j]=stNode(x,z,'inner'); }
  });
  var LAST = inRings.length-1;
  inRings.forEach(function(r,i){
    /* ring edges — the ring streets run on past a superblock, which is what makes the
       Ancient quarter legible: you can always walk round a thing you cannot walk through */
    var prev=null;
    for(var j=0;j<=NSP;j++){ var n=inner[i][j%NSP]; if(!n){ if(spokeClassIn(j%NSP)) prev=null; continue; }
      if(prev) stEdge(prev,n, i===LAST?'alley':'street'); prev=n; }
    /* radial edges. Where a ring is missing (ring 236 in the south, or a node swallowed by
       a superblock) the spoke reaches back to the nearest ring that IS there, so the radial
       chain is never broken by the hole a superblock leaves. */
    for(var j2=0;j2<NSP;j2++){ var sc=spokeClassIn(j2); if(!sc||sc==='arc') continue;
      if(!inner[i][j2]) continue;
      var from=null;
      if(i===0){ if(sc==='main') from=hub; }
      else { for(var b=i-1; b>=0 && !from; b--) if(inner[b][j2]) from=inner[b][j2];
             if(!from && sc==='main') from=hub; }
      if(sc==='sec' && i===0) from=null; if(sc==='ter' && i<2) from=null;
      if(from) stEdge(from, inner[i][j2], sc==='main'?'boulevard':(sc==='sec'?'street':'alley')); }
  });
  /* the processional way: hub -> forecourt (the 6 o'clock main radial) */
  var jWay=Math.round(90/SP), vaultWay=null;
  for(var iw=LAST; iw>=0 && !vaultWay; iw--) if(inner[iw][jWay]) vaultWay=inner[iw][jWay];
  var fc = stNode(FORECOURT.x, FORECOURT.z, 'forecourt');
  if(vaultWay) stEdge(vaultWay, fc, 'boulevard');
  [[-1],[1]].forEach(function(s){ var j=Math.round((90+s[0]*22.5)/SP), n=inner[LAST][j]||inner[LAST-1][j]; if(n) stEdge(n, fc, 'street'); });
  ST.forecourt = fc; ST.hub = hub;

  /* ---------- B. gates and the ring road ---------- */
  var ringNodes=[], ringA0=116, ringA1=360+64;
  for(var deg=ringA0; deg<=ringA1+0.01; deg+=SP){ var a=deg*D2R; ringNodes.push({ deg:deg, n:stNode(RING_R*Math.cos(a), RING_R*Math.sin(a), 'ringroad') }); }
  for(var q=1;q<ringNodes.length;q++) stEdge(ringNodes[q-1].n, ringNodes[q].n, 'ring');
  function ringAt(deg){ deg=((deg%360)+360)%360; for(var i=0;i<ringNodes.length;i++){ if(Math.abs((((ringNodes[i].deg%360)+360)%360)-deg) < 0.01) return ringNodes[i].n; } return null; }
  GATES.forEach(function(g){
    var deg=Math.round(g.a/D2R), jg=Math.round((((deg%360)+360)%360)/SP), jn=null;
    for(var ig=LAST; ig>=0 && !jn; ig--) if(inner[ig][jg]) jn=inner[ig][jg];
    g.node = stNode(g.x, g.z, 'gate'); g.inNode=jn; g.outNode=ringAt(deg);
    stEdge(jn, g.node, 'boulevard'); stEdge(g.node, g.outNode, 'boulevard');
  });

  /* ---------- C. the districts outside the wall: a polar lattice, bent by chaos ---------- */
  var outRings=[398,425,452,479,506,533,560,587,614,641,668,695,722], lat=[];
  function poorRing(i){ return i%2===1; }                     /* the in-between rings exist only where chaos is high: the lanes of the poor quarters */
  function spokeOn(i,j){ return (outRings[i] >= 540 || poorRing(i)) ? true : (j%2===0); }
  function isGateSpoke(j){ var deg=j*SP; for(var g=0;g<GATES.length;g++){ if(Math.abs(((Math.round(GATES[g].a/D2R)%360)+360)%360 - deg) < 0.01) return GATES[g]; } return null; }
  outRings.forEach(function(r,i){
    lat[i]=[];
    for(var j=0;j<NSP;j++){ if(!spokeOn(i,j)) continue;
      var a=j*SP*D2R, gsp=isGateSpoke(j), x=r*Math.cos(a), z=r*Math.sin(a), D=districtAt(x,z), h=clockOf(x,z);
      if(r > districtEdgeR(h) + (gsp?60:0)) continue;
      if(poorRing(i) && !gsp && D.chaos < 0.18) continue;
      if(poorRing(i) && !gsp && (j%2===1) && D.chaos < 0.34) continue;
      if(!gsp){ var jit=D.chaos*24; x += (phash(i,j,1,3)-0.5)*2*jit; z += (phash(i,j,2,7)-0.5)*2*jit; }
      if(stBlocked(x,z)) continue;
      if(!gsp && Math.hypot(x-MARKET.x,z-MARKET.z) < MARKET.r+14) continue;
      if(gsp===GATES[1] && Math.hypot(x-MARKET.x,z-MARKET.z) < MARKET.r-4) continue;
      var inPark=false; PARKS.forEach(function(P){ if(Math.hypot(x-P.x,z-P.z) < P.r+6) inPark=true; }); if(inPark) continue;
      if(Math.abs(loc(0,0,x-CARAVANSERAI.x,z-CARAVANSERAI.z,-CARAVANSERAI.ry)[0]) < CARAVANSERAI.w/2+5 && Math.abs(loc(0,0,x-CARAVANSERAI.x,z-CARAVANSERAI.z,-CARAVANSERAI.ry)[1]) < CARAVANSERAI.d/2+5) continue;
      lat[i][j]=stNode(x,z, gsp?'boulevard':'district'); lat[i][j].chaos=D.chaos; lat[i][j].gsp=!!gsp; }
  });
  function latCls(n1,n2){ if(n1.gsp&&n2.gsp) return 'boulevard'; var c=Math.max(n1.chaos||0,n2.chaos||0); return c>0.62?'lane':(c>0.40?'alley':'street'); }
  outRings.forEach(function(r,i){
    /* around the ring */
    var prev=null, prevJ=-1;
    for(var j=0;j<=NSP;j++){ var n=lat[i][j%NSP];
      if(!n){ if(spokeOn(i,j%NSP)) prev=null; continue; }
      if(prev){ var c=Math.max(prev.chaos,n.chaos); if(!(phash(i,j,5,11) < c*0.42)) stEdge(prev,n,latCls(prev,n)==='boulevard'?'street':latCls(prev,n)); }
      prev=n; }
    /* outward */
    for(var j2=0;j2<NSP;j2++){ var n2=lat[i][j2]; if(!n2) continue;
      var from = i===0 ? ringAt(j2*SP) : (lat[i-1][j2] || (i>1 ? lat[i-2][j2] : null));
      if(!from && i>0 && !spokeOn(i-1,j2)){ from = null; }               /* half-spokes start on their own ring */
      if(from){ var c2=Math.max(from.chaos||0,n2.chaos); if(n2.gsp || !(phash(i,j2,6,13) < c2*0.38)) stEdge(from,n2,latCls(from,n2)); }
      /* slum diagonals */
      if(i>0 && n2.chaos>0.45 && phash(i,j2,8,17) < n2.chaos*0.35){ var dj=lat[i-1][(j2+2)%NSP]||lat[i-1][(j2+1)%NSP]; if(dj) stEdge(dj,n2,'lane'); }
    }
  });
  /* the Great Market: a rim street round the circle, the Caravan boulevard straight through it */
  var mk=[], mc=stNode(MARKET.x,MARKET.z,'market'); ST.market=mc;
  for(var m=0;m<20;m++){ var ma=m/20*TAU; mk.push(stNode(MARKET.x+Math.cos(ma)*(MARKET.r+5), MARKET.z+Math.sin(ma)*(MARKET.r+5), 'marketrim')); }
  for(m=0;m<20;m++) stEdge(mk[m], mk[(m+1)%20], 'street');
  ST.nodes.forEach(function(n){ if(n.tag!=='district'&&n.tag!=='boulevard'&&n.tag!=='ringroad') return;
    var best=null,bd=1e9; mk.forEach(function(k){ var d=Math.hypot(k.x-n.x,k.z-n.z); if(d<bd){bd=d;best=k;} });
    if(bd < 62) stEdge(n,best, n.tag==='boulevard'||n.tag==='ringroad' ? 'boulevard':'street'); });
  [0,5,10,15].forEach(function(k){ stEdge(mc, mk[k], 'street'); });
  (function(){ var g=GATES[1], best0=null,b0=1e9,best1=null,b1=1e9;
    mk.forEach(function(k){ var t=(k.x-MARKET.x)*g.ox+(k.z-MARKET.z)*g.oz, off=Math.abs(-(k.x-MARKET.x)*g.oz+(k.z-MARKET.z)*g.ox);
      if(t<0&&off<b0){b0=off;best0=k;} if(t>0&&off<b1){b1=off;best1=k;} });
    stEdge(best0,mc,'boulevard'); stEdge(mc,best1,'boulevard'); stEdge(best0,g.outNode,'boulevard'); })();

  /* ---------- D. the highways: NW (major), NE, SE, SW — out to the edge of the map ---------- */
  function lastOnSpoke(g){ var j=Math.round((((Math.round(g.a/D2R)%360)+360)%360)/SP), n=null; for(var i=0;i<outRings.length;i++) if(lat[i][j]) n=lat[i][j]; return n; }
  /* THE HIGHWAY SPINE. The out-of-town run starts at the outermost lattice node on the gate's own
     spoke, but that spoke can have gaps in it (a park, the market, the talus), which used to leave
     the highway hanging off the end of a broken chain instead of running to the gate. So before the
     run is laid, stitch the gate -> outNode -> every surviving spoke node into ONE unbroken radial
     chain and class the whole of it as the highway, so a cart can drive from the gate to the map edge. */
  function spine(g){
    var j=Math.round((((Math.round(g.a/D2R)%360)+360)%360)/SP), cls = g.highway ? 'highway' : 'road';
    var chain=[g.node, g.outNode];
    for(var i=0;i<outRings.length;i++) if(lat[i][j]) chain.push(lat[i][j]);
    chain = chain.filter(function(n,i2,arr){ return n && arr.indexOf(n)===i2; })
                 .sort(function(a,b){ return Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z); });
    for(var k2=0;k2<chain.length-1;k2++){
      var e=stEdge(chain[k2], chain[k2+1], cls);
      if(e){ e.cls=cls; e.w=ST_CLASS[cls].w; e.spine=g.id; }
    }
    g.spine = chain;
    return chain[chain.length-1];
  }
  GATES.forEach(function(g){
    var start=spine(g)||lastOnSpoke(g)||g.outNode, dirs={ NW:[-0.7071,-0.7071], NE:[0.7071,-0.7071], SE:[0.7071,0.7071], SW:[-0.7071,0.7071] };
    var tgt = g.highway ? dirs[g.highway] : [g.ox,g.oz], cls = g.highway ? 'highway' : 'road';
    var x=start.x, z=start.z, dx=g.ox, dz=g.oz, prev=start, pts=[[x,z]], nodes=[start], reach = g.highway ? HW*1.05 : 1180, k=0;
    /* re-class the boulevard spoke of a highway gate as highway from the ring road out */
    while(Math.max(Math.abs(x),Math.abs(z)) < reach && k++ < 200){
      var turn = 0.06; dx = mix(dx,tgt[0],turn); dz = mix(dz,tgt[1],turn);
      var wob = 0.10*sig(x+g.id*900, z-g.id*700, 0.0016); var c=Math.cos(wob), s=Math.sin(wob), ddx=dx*c-dz*s, ddz=dx*s+dz*c, L=Math.hypot(ddx,ddz);
      var step = Math.hypot(x,z) < 1300 ? 45 : 90; x += ddx/L*step; z += ddz/L*step;
      var n = stNode(x,z,cls); stEdge(prev,n,cls); prev=n; pts.push([x,z]); nodes.push(n);
    }
    HIGHWAYS.push({ name: g.highway ? (g.highway==='NW'?'Great Desert Road (NW)':g.highway+' highway') : 'North farm road', cls:cls, gate:g.id, pts:pts, nodes:nodes });
    g.hwy = HIGHWAYS[HIGHWAYS.length-1];
    /* bridges: wherever the run crosses the river or the canal */
    [['river',RIVER,96,4],['canal',CANAL,46,4]].forEach(function(W){
      var poly=W[1], done=false;
      for(var i2=0;i2<pts.length-1 && !done;i2++) for(var r2=0;r2<poly.length-1;r2++){
        if(segCross(pts[i2][0],pts[i2][1],pts[i2+1][0],pts[i2+1][1], poly[r2][0],poly[r2][1],poly[r2+1][0],poly[r2+1][1])){
          var mx=(poly[r2][0]+poly[r2+1][0])/2, mz=(poly[r2][1]+poly[r2+1][1])/2;
          var bdx=pts[i2+1][0]-pts[i2][0], bdz=pts[i2+1][1]-pts[i2][1], bl=Math.hypot(bdx,bdz);
          BRIDGES.push({ id:BRIDGES.length, kind:W[0], x:mx, z:mz, dx:bdx/bl, dz:bdz/bl, L:W[2], nA:W[3], w:ST_CLASS[cls].w+3,
                         name:(g.highway||'North farm road')+' '+(W[0]==='canal'?'canal':'river')+' bridge' });
          done=true; break; } }
    });
  });
  /* the gate->edge boulevard of each highway gate carries the highway's class */
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b]; if(e.cls!=='boulevard') return;
    GATES.forEach(function(g){ if(!g.highway) return; var ta=A.x*g.ox+A.z*g.oz, tb=B.x*g.ox+B.z*g.oz, oa=Math.abs(-A.x*g.oz+A.z*g.ox), ob=Math.abs(-B.x*g.oz+B.z*g.ox);
      if(ta>=RING_R-1 && tb>=RING_R-1 && oa<3 && ob<3){ e.cls='highway'; e.w=ST_CLASS.highway.w; } }); });

  /* ---------- E. CONNECTIVITY PASS: no disconnected portions ---------- */
  function components(){
    var par=ST.nodes.map(function(n,i){ return i; });
    function f(i){ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; }
    ST.edges.forEach(function(e){ if(e.dead) return; var a=f(e.a), b=f(e.b); if(a!==b) par[a]=b; });
    var root=f(hub.id), groups={};
    ST.nodes.forEach(function(n){ if(n.dead) return; var r=f(n.id); if(r!==root) (groups[r]||(groups[r]=[])).push(n); });
    return { root:root, f:f, groups:groups };
  }
  var C0=components(), before=Object.keys(C0.groups).length+1, joined=0, removed=0, guard=0;
  while(guard++ < 400){
    var C=components(), keys=Object.keys(C.groups); if(!keys.length) break;
    var G=C.groups[keys[0]], best=null, bd=1e9;
    G.forEach(function(n){ ST.nodes.forEach(function(m){ if(m.dead || C.f(m.id)!==C.root) return; var d=Math.hypot(n.x-m.x,n.z-m.z); if(d<bd){ bd=d; best=[n,m]; } }); });
    if(best && bd < 130){ stEdge(best[0],best[1], latCls(best[0],best[1])==='boulevard'?'street':latCls(best[0],best[1])); joined++; }
    else { G.forEach(function(n){ n.dead=true; removed++; }); ST.edges.forEach(function(e){ if(ST.nodes[e.a].dead||ST.nodes[e.b].dead) e.dead=true; }); }
  }
  /* prune dead ends shorter than a plot in the orderly districts (keeps slum culs-de-sac) */
  ST.edges = ST.edges.filter(function(e){ return !e.dead; });
  var Cf=components();
  ST.report = { nodes:ST.nodes.filter(function(n){return !n.dead;}).length, edges:ST.edges.length, componentsBefore:before, joined:joined, removedNodes:removed,
                componentsAfter:Object.keys(Cf.groups).length+1, connected:Object.keys(Cf.groups).length===0 };
})();
ST.nodes.forEach(function(n){ n.y = terrainH(n.x,n.z); });
ST.edges.forEach(function(e,i){ e.id=i; e.len=Math.hypot(ST.nodes[e.a].x-ST.nodes[e.b].x, ST.nodes[e.a].z-ST.nodes[e.b].z); });
window._streets = ST.report || {};

/* nearest street to a point, weighted by class priority — the door-orientation pass (highways >
   boulevards > side streets > alleys) will call this once buildings are placed. */
function nearestStreet(x,z,maxD){
  var best=null, bs=-1e9; maxD=maxD||60;
  for(var i=0;i<ST.edges.length;i++){ var e=ST.edges[i], A=ST.nodes[e.a], B=ST.nodes[e.b];
    if(Math.min(A.x,B.x)-maxD > x || Math.max(A.x,B.x)+maxD < x || Math.min(A.z,B.z)-maxD > z || Math.max(A.z,B.z)+maxD < z) continue;
    var d=segDist(x,z,A.x,A.z,B.x,B.z) - e.w/2; if(d>maxD) continue;
    var score = ST_CLASS[e.cls].pri*14 - d; if(score>bs){ bs=score; best={ edge:e, d:d }; } }
  if(best){ var A2=ST.nodes[best.edge.a], B2=ST.nodes[best.edge.b], vx=B2.x-A2.x, vz=B2.z-A2.z, L=vx*vx+vz*vz, t=L?clamp(((x-A2.x)*vx+(z-A2.z)*vz)/L,0,1):0;
    best.px=A2.x+vx*t; best.pz=A2.z+vz*t; }
  return best;
}
function onStreet(x,z,margin){ var m=margin||0;
  for(var i=0;i<ST.edges.length;i++){ var e=ST.edges[i], A=ST.nodes[e.a], B=ST.nodes[e.b], pad=e.w/2+m;
    if(Math.min(A.x,B.x)-pad > x || Math.max(A.x,B.x)+pad < x || Math.min(A.z,B.z)-pad > z || Math.max(A.z,B.z)+pad < z) continue;
    if(segDist(x,z,A.x,A.z,B.x,B.z) < pad) return true; }
  return false;
}

/* ============================== WALK GRAPH (life-layer framework) ==============================
   NAV = streets + wall-walk + the Vault route down to the antechamber. No population yet. */
var NAV = { nodes:[], edges:[], adj:[] };
function navNode(x,y,z,tag,extra){ var n={ id:NAV.nodes.length, x:x, y:y, z:z, tag:tag }; if(extra) for(var k in extra) n[k]=extra[k]; NAV.nodes.push(n); NAV.adj.push([]); return n; }
function navEdge(a,b,kind,extra){ var e={ id:NAV.edges.length, a:a.id, b:b.id, kind:kind, len:Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z) }; if(extra) for(var k in extra) e[k]=extra[k];
  NAV.edges.push(e); NAV.adj[a.id].push(e.id); NAV.adj[b.id].push(e.id); return e; }
(function(){
  if(SHEET) return;
  var map={};
  ST.nodes.forEach(function(n){ if(n.dead) return; map[n.id]=navNode(n.x, n.y, n.z, n.tag, { st:n.id }); });
  ST.edges.forEach(function(e){ navEdge(map[e.a], map[e.b], 'ground', { cls:e.cls }); });
  NAV.hub = map[ST.hub.id];
  /* the wall-walk, with a stair down inside each gate tower pair */
  var ww=[], a;
  for(a=WALL.a0+0.03; a<=WALL.a1-0.03; a+=5*Math.PI/180) ww.push(navNode(Math.cos(a)*RW, wallWalkY(a), Math.sin(a)*RW, 'wallwalk'));
  for(var i=1;i<ww.length;i++) navEdge(ww[i-1], ww[i], 'wallwalk');
  GATES.forEach(function(g){ var best=null, bd=1e9; ww.forEach(function(w){ var d=Math.hypot(w.x-g.x,w.z-g.z); if(d<bd){bd=d;best=w;} }); navEdge(map[g.inNode.id], best, 'stair'); g.walkNode=best.id; });
  /* forecourt -> steps -> great door -> tunnel -> antechamber */
  var fc=map[ST.forecourt.id], steps=navNode(0, GV_Y, VAULT.zf-34, 'vaultsteps'), door=navNode(0, VAULTSITE.doorY, VAULT.zf+1, 'vaultdoor');
  navEdge(fc, steps, 'ground'); navEdge(steps, door, 'stair');
  var prev=door;
  for(var t=1;t<=6;t++){ var f=t/6, n=navNode(mix(TUNNEL.x0,TUNNEL.x1,f), mix(TUNNEL.y0,TUNNEL.y1,f)+0.0, mix(TUNNEL.z0,TUNNEL.z1,f), 'tunnel'); navEdge(prev,n,'underground'); prev=n; }
  var ac=navNode(ANTE.x, ANTE.floorY, ANTE.z, 'antechamber');
  var ringN=[]; for(var k=0;k<12;k++){ var ka=k/12*TAU; ringN.push(navNode(ANTE.x+Math.cos(ka)*ANTE.R*0.7, ANTE.floorY, ANTE.z+Math.sin(ka)*ANTE.R*0.7, 'antechamber')); }
  for(k=0;k<12;k++){ navEdge(ringN[k], ringN[(k+1)%12], 'underground'); navEdge(ringN[k], ac, 'underground'); }
  navEdge(prev, ringN[9], 'underground');      /* k=9 -> angle 270 deg = the north side, where the tunnel arrives */
  NAV.vaultDoor=door.id; NAV.ante=ac.id;
  /* reachability from the hub */
  var seen={}, stack=[NAV.hub.id], cnt=0; seen[NAV.hub.id]=1;
  while(stack.length){ var c=stack.pop(); cnt++; NAV.adj[c].forEach(function(ei){ var e=NAV.edges[ei], o=e.a===c?e.b:e.a; if(!seen[o]){ seen[o]=1; stack.push(o); } }); }
  NAV.reachable=cnt;
})();

/* path-viz: the static networks, by class (the life layer will add its own populations later) */
[['highway','Streets: highways'],['boulevard','Streets: boulevards + ring road'],['street','Streets: side streets'],['alley','Streets: alleys + lanes']].forEach(function(row, ri){
  PATHVIZ.push({ key:'st_'+row[0], label:row[1], color:PAL.pathviz[[4,0,2,6][ri]], paths:function(){
    return NAV.edges.filter(function(e){ var c=e.cls; if(e.kind!=='ground') return false;
        return row[0]==='highway' ? (c==='highway'||c==='road') : row[0]==='boulevard' ? (c==='boulevard'||c==='ring') : row[0]==='street' ? c==='street' : (c==='alley'||c==='lane'); })
      .map(function(e){ var a=NAV.nodes[e.a], b=NAV.nodes[e.b]; return [[a.x,a.y,a.z],[b.x,b.y,b.z]]; }); } });
});
PATHVIZ.push({ key:'wallwalk', label:'Wall-walk + stairs', color:PAL.pathviz[1], paths:function(){ return NAV.edges.filter(function(e){ return e.kind==='wallwalk'||e.kind==='stair'; }).map(function(e){ var a=NAV.nodes[e.a], b=NAV.nodes[e.b]; return [[a.x,a.y,a.z],[b.x,b.y,b.z]]; }); } });
PATHVIZ.push({ key:'under', label:'Vault + underground', color:PAL.pathviz[3], paths:function(){ return NAV.edges.filter(function(e){ return e.kind==='underground'; }).map(function(e){ var a=NAV.nodes[e.a], b=NAV.nodes[e.b]; return [[a.x,a.y,a.z],[b.x,b.y,b.z]]; }); } });

/* the farm belt: the irrigated land between the wall and the canal, and again out to the river.
   Nothing is built here — the placement pass will put farms in it later. */
var FARMBELT = { rIn:770, rOut:1195, a0:-150*Math.PI/180, a1:20*Math.PI/180 };
function inFarmBelt(x,z){
  var r=Math.hypot(x,z); if(r < FARMBELT.rIn || r > FARMBELT.rOut) return false;
  var a=Math.atan2(z,x); return wrapPi(a-FARMBELT.a0) >= 0 && wrapPi(a-FARMBELT.a1) <= 0;
}
/* short distributary ditches off the canal: alternately inward (to the town-side fields) and outward */
var DITCHES = (function(){
  if(SHEET) return [];
  var out=[];
  for(var k=0;k<14;k++){
    var s = CANAL_LEN*(0.16 + 0.062*k), C=canalAt(s), inward = (k%2===0);
    var nx=-C.tz, nz=C.tx;                                  /* the canal's left normal */
    var toTown = ((-C.x)*nx + (-C.z)*nz) > 0 ? 1 : -1;      /* which side the town is on */
    var sgn = inward ? toTown : -toTown, L = inward ? 108 : 150;
    out.push({ x0:C.x+nx*sgn*16, z0:C.z+nz*sgn*16, x1:C.x+nx*sgn*(16+L), z1:C.z+nz*sgn*(16+L), s:s, inward:inward });
  }
  return out;
})();

/* published viewpoints (the flora pass keeps these sightlines clear) */
var VIEWPOINTS = [];
