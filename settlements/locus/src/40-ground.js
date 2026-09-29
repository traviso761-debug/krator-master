/* ============================== 9. GROUND CANVAS + MASK — LOCUS ==============================
   PLANNER-OWNED. The single source of truth for what the ground IS inside the detailed box
   (+-CITY_EXT). Painted twice: once in colour (GROUND_CANVAS, draped over the terrain by
   75-terrain.js; where nothing is painted the canvas is transparent and the terrain's own
   marsh / salt / hill tones show) and once as a category (MASK, read by placement, the biome
   host and the life layer):
     maskAt(x,z): 0 free · 1 street · 2 plaza / yard · 3 park · 4 reserved site · 6 water · 7 farmland */
reseed(400001);

var GC_RES = FAST ? 2048 : 4096, MASK_RES = 2400;
var GROUND_CANVAS = document.createElement('canvas'); GROUND_CANVAS.width = GROUND_CANVAS.height = GC_RES;
var MASK_CANVAS = document.createElement('canvas'); MASK_CANVAS.width = MASK_CANVAS.height = MASK_RES;
var MASK_DATA = null;
function maskAt(x,z){
  if(!MASK_DATA) return 0;
  var i=Math.floor((x+CITY_EXT)/(2*CITY_EXT)*MASK_RES), j=Math.floor((z+CITY_EXT)/(2*CITY_EXT)*MASK_RES);
  if(i<0||j<0||i>=MASK_RES||j>=MASK_RES) return 0;
  var v=MASK_DATA[(j*MASK_RES+i)*4]; return v<10 ? 0 : Math.min(7, Math.round(v/32));
}
function maskFree(x,z,rad){ rad=rad||0; if(maskAt(x,z)) return false; if(!rad) return true;
  for(var k=0;k<8;k++){ var a=k/8*TAU; if(maskAt(x+Math.cos(a)*rad, z+Math.sin(a)*rad)) return false; } return true; }
var FARM_PLOTS = [];

(function(){
  if(SHEET) return;
  var g=GROUND_CANVAS.getContext('2d'), m=MASK_CANVAS.getContext('2d');
  var S=GC_RES/(2*CITY_EXT), MS=MASK_RES/(2*CITY_EXT);
  function hex(c){ return '#'+('000000'+c.toString(16)).slice(-6); }
  function both(fn){ g.save(); g.scale(S,S); g.translate(CITY_EXT,CITY_EXT); fn(g,false); g.restore();
                     m.save(); m.scale(MS,MS); m.translate(CITY_EXT,CITY_EXT); fn(m,true); m.restore(); }
  function code(c){ return 'rgb('+(c*32)+',0,0)'; }
  function stroke(c, poly, w, style){ c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=style; c.lineWidth=w;
    c.beginPath(); c.moveTo(poly[0][0],poly[0][1]); for(var i=1;i<poly.length;i++) c.lineTo(poly[i][0],poly[i][1]); c.stroke(); }
  function rect(c, Q, pad){ c.save(); c.translate(Q.x,Q.z); c.rotate(-Q.ry); c.fillRect(-Q.w/2-pad,-Q.d/2-pad,Q.w+2*pad,Q.d+2*pad); c.restore(); }
  g.clearRect(0,0,GC_RES,GC_RES); m.fillStyle='#000'; m.fillRect(0,0,MASK_RES,MASK_RES);

  /* ---- 1. the waterways (mask only: the terrain and the water plane show them) ---- */
  both(function(c,isMask){
    if(!isMask){ stroke(c, CANAL, 2*CANAL_W[2]+2, 'rgba(96,82,58,0.55)'); stroke(c, CANAL, 2*CANAL_W[1], 'rgba(70,64,44,0.70)'); return; }
    stroke(c, RIVER, 2*RIVER_HALF+8, code(6)); DISTRIB.forEach(function(D,i){ stroke(c, D, 2*DISTRIB_HALF[i]+10, code(6)); });
    stroke(c, CANAL, 2*CANAL_W[2], code(6));
  });
  /* ---- 2. the refinery yard inside the ring: oil-dark packed earth ---- */
  both(function(c,isMask){ c.beginPath(); c.arc(0,0,RING0_R-RING_W/2,0,TAU); c.fillStyle = isMask ? code(4) : hex(shade(PAL.mudBrown[3],-0.25)); c.fill();
    if(isMask) return;
    for(var s=0;s<90;s++){ var a=phash(s,1,3,5)*TAU, r=Math.sqrt(phash(s,2,4,6))*(RING0_R-10); c.fillStyle='rgba(20,16,12,'+(0.10+0.18*phash(s,3,5,7)).toFixed(2)+')'; c.beginPath(); c.ellipse(Math.cos(a)*r, Math.sin(a)*r, 2+6*phash(s,4,6,8), 1.5+4*phash(s,5,7,9), a, 0, TAU); c.fill(); } });
  /* ---- 3. the park and the market square ---- */
  both(function(c,isMask){ var P=PARK; c.beginPath(); c.arc(P.x,P.z,P.r,0,TAU); c.fillStyle = isMask ? code(3) : hex(PAL.shrub[2]); c.fill();
    if(isMask) return;
    c.strokeStyle=hex(PAL.pavingRich[1]); c.lineWidth=2.6; c.lineCap='round';
    for(var w=0;w<3;w++){ c.beginPath(); for(var t=0;t<=30;t++){ var f=t/30, a2=f*TAU*0.8+w*2.1, r2=P.r*(0.18+0.72*f); c[t?'lineTo':'moveTo'](P.x+Math.cos(a2)*r2, P.z+Math.sin(a2)*r2); } c.stroke(); }
    c.fillStyle=hex(PAL.pavingRich[0]); c.beginPath(); c.arc(P.x,P.z,9,0,TAU); c.fill(); });
  both(function(c,isMask){ var M=MARKET; c.beginPath(); c.arc(M.x,M.z,M.r,0,TAU); c.fillStyle = isMask ? code(2) : hex(PAL.paving[0]); c.fill();
    if(isMask) return;
    for(var k=4;k>=1;k--){ c.beginPath(); c.arc(M.x,M.z,M.r*k/4.6,0,TAU); c.fillStyle=hex(k%2?PAL.paving[2]:PAL.paving[0]); c.fill(); }
    c.strokeStyle=hex(PAL.pastelDeep[0]); c.lineWidth=1.4; c.beginPath(); c.arc(M.x,M.z,M.r-1.2,0,TAU); c.stroke();
    for(var s=0;s<16;s++){ var a=s/16*TAU; c.beginPath(); c.moveTo(M.x+Math.cos(a)*6, M.z+Math.sin(a)*6); c.lineTo(M.x+Math.cos(a)*(M.r-2), M.z+Math.sin(a)*(M.r-2)); c.lineWidth=0.6; c.stroke(); } });
  /* ---- 4. the sites: a swept yard under every scheduled building ---- */
  SITES_L.forEach(function(Q){ if(Q.tag==='prop') return;
    both(function(c,isMask){ c.fillStyle = isMask ? code(4) : (Q.tag==='farm' ? 'rgba(0,0,0,0)' : hex(Q.tag==='pumpjack' ? shade(PAL.mudBrown[1],-0.1) : PAL.lane[1])); rect(c, Q, Q.tag==='pumpjack'?2:1.2); });
  });
  /* ---- 5. streets: kerb stroke, then surface; widest last so junctions read cleanly ---- */
  var order=['track','lane','alley','street','road','boulevard','ring','highway'];
  var surf={ track:PAL.lane[0], lane:PAL.lane[0], alley:PAL.lane[2], street:PAL.paving[1], road:PAL.lane[2], boulevard:PAL.paving[0], ring:shade(PAL.mudBrown[4],0.1), highway:PAL.paving[3] };
  function strokeClass(c, cls, extra, style){
    c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=style; c.beginPath();
    ST.edges.forEach(function(e){ if(e.cls!==cls) return; var A=ST.nodes[e.a], B=ST.nodes[e.b];
      if(Math.max(Math.abs(A.x),Math.abs(A.z)) > CITY_EXT+60 && Math.max(Math.abs(B.x),Math.abs(B.z)) > CITY_EXT+60) return;
      c.moveTo(A.x,A.z); c.lineTo(B.x,B.z); });
    c.lineWidth = ST_CLASS[cls].w + extra; c.stroke();
  }
  order.forEach(function(cls){ both(function(c,isMask){
    if(isMask){ strokeClass(c, cls, 1.0, code(1)); return; }
    strokeClass(c, cls, cls==='track'?0.8:1.6, 'rgba(84,70,48,0.50)');
    strokeClass(c, cls, 0, hex(surf[cls]));
    if(cls==='track'){ c.setLineDash([1.2,2.4]); strokeClass(c, cls, -ST_CLASS[cls].w+0.9, 'rgba(60,48,34,0.35)'); c.setLineDash([]); }       /* wheel ruts */
    if(cls==='boulevard'||cls==='ring'||cls==='highway'){ c.setLineDash([0.8,5.2]); strokeClass(c, cls, -ST_CLASS[cls].w+1.0, 'rgba(110,92,64,0.35)'); c.setLineDash([]); }
  }); });
  /* ---- 6. the farmland (mask only: the farms draw their own paddies) ---- */
  FARMS.forEach(function(Q){ both(function(c,isMask){ if(!isMask) return; c.fillStyle=code(7); rect(c, Q, 0); }); FARM_PLOTS.push({ x:Q.x, z:Q.z, w:Q.w, d:Q.d, ry:Q.ry }); });

  MASK_DATA = m.getImageData(0,0,MASK_RES,MASK_RES).data;
  window._mask = { res:MASK_RES, at:maskAt, farmPlots:FARM_PLOTS.length };
})();
