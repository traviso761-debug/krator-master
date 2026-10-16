/* ============================== 9. GROUND CANVAS + MASK — MUNGO (Locus's, re-pointed at Mungo's layout) ==============================
   PLANNER-OWNED. The single source of truth for what the ground IS inside the detailed box
   (+-CITY_EXT). Painted twice: once in colour (GROUND_CANVAS, draped over the terrain by
   75-terrain.js; where nothing is painted the canvas is transparent and the terrain's own
   marsh / salt / hill tones show) and once as a category (MASK, read by placement, the biome
   host and the life layer):
     maskAt(x,z): 0 free · 1 street · 2 plaza / yard · 3 park · 4 reserved site · 6 water · 7 farmland */
reseed(400001);

var GC_RES = FAST ? 2048 : 4096, MASK_RES = 2400;
var GROUND_CANVAS = document.createElement('canvas'); GROUND_CANVAS.width = GROUND_CANVAS.height = GC_RES;
var MASK_CANVAS = KMASK.xform(KMASK.canvas(MASK_RES, MASK_RES));   /* core/mask: hard-edged, the same bytes on any machine and in Godot */
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

  /* ---- 1. the river (mask only: the terrain and the water plane show it) ---- */
  both(function(c,isMask){ if(!isMask) return; stroke(c, RIVER, 2*RIVER_HALF*1.6+8, code(6)); });
  /* ---- 2. the market square: concentric paving in the abyssal pastels ---- */
  both(function(c,isMask){ var M=MARKET; c.beginPath(); c.arc(M.x,M.z,M.r,0,TAU); c.fillStyle = isMask ? code(2) : hex(PAL.paving[0]); c.fill();
    if(isMask) return;
    for(var k=4;k>=1;k--){ c.beginPath(); c.arc(M.x,M.z,M.r*k/4.6,0,TAU); c.fillStyle=hex(k%2?PAL.paving[2]:PAL.paving[0]); c.fill(); }
    c.strokeStyle=hex(PAL.pastelDeep[0]); c.lineWidth=1.4; c.beginPath(); c.arc(M.x,M.z,M.r-1.2,0,TAU); c.stroke();
    for(var s=0;s<16;s++){ var a=s/16*TAU; c.beginPath(); c.moveTo(M.x+Math.cos(a)*6, M.z+Math.sin(a)*6); c.lineTo(M.x+Math.cos(a)*(M.r-2), M.z+Math.sin(a)*(M.r-2)); c.lineWidth=0.6; c.stroke(); } });
  /* ---- 3. the yards: the buggy park (oil-dark packed gravel, painted bays) and the logging landings (churned earth, sawdust) ---- */
  YARDS.forEach(function(Q){ both(function(c,isMask){
    if(isMask){ c.fillStyle=code(2); rect(c, Q, 0.5); return; }
    if(Q.tag==='parking'){ c.fillStyle=hex(shade(PAL.mudBrown[3],-0.22)); rect(c, Q, 0.6);
      c.save(); c.translate(Q.x,Q.z); c.rotate(-Q.ry); c.strokeStyle='rgba(226,214,180,0.55)'; c.lineWidth=0.18;
      for(var b=0;b<=6;b++){ var bx=-Q.w/2+2+b*(Q.w-4)/6; c.beginPath(); c.moveTo(bx,-Q.d/2+1); c.lineTo(bx,-Q.d/2+6.5); c.stroke(); c.beginPath(); c.moveTo(bx,Q.d/2-1); c.lineTo(bx,Q.d/2-6.5); c.stroke(); }
      for(var s2=0;s2<40;s2++){ c.fillStyle='rgba(16,12,10,'+(0.10+0.15*phash(s2,Q.x,1,2)).toFixed(2)+')'; c.beginPath(); c.ellipse(-Q.w/2+Q.w*phash(s2,1,Q.z,3), -Q.d/2+Q.d*phash(s2,2,Q.x,4), 0.6+1.4*phash(s2,3,5,6), 0.4+0.8*phash(s2,4,6,7), 0, 0, TAU); c.fill(); }
      c.restore(); return; }
    c.fillStyle=hex(shade(PAL.mudBrown[2],-0.05)); rect(c, Q, 1.0);
    c.save(); c.translate(Q.x,Q.z); c.rotate(-Q.ry); for(var s3=0;s3<60;s3++){ c.fillStyle='rgba(214,180,120,'+(0.18+0.25*phash(s3,Q.x,7,8)).toFixed(2)+')'; c.fillRect(-Q.w/2+Q.w*phash(s3,1,Q.z,9), -Q.d/2+Q.d*phash(s3,2,Q.x,10), 0.5, 0.3); } c.restore();
  }); });
  /* ---- 4. the sites: a swept yard under every scheduled building ---- */
  SITES_L.forEach(function(Q){ if(Q.tag==='prop') return;
    if(Q.water) return;   /* a fishing dock stands in the lake */
    both(function(c,isMask){ c.fillStyle = isMask ? code(4) : (Q.tag==='farm' ? 'rgba(0,0,0,0)' : hex(Q.tag==='geo' ? shade(PAL.lane[1],-0.08) : PAL.lane[1])); rect(c, Q, 1.2); });
  });
  /* ---- 5. streets: kerb stroke, then surface; widest last so junctions read cleanly ---- */
  var order=['track','lane','alley','street','road','quay','boulevard','ring','highway','main'];
  var surf={ track:PAL.lane[0], lane:PAL.lane[0], alley:PAL.lane[2], street:PAL.paving[1], road:PAL.lane[2], quay:PAL.paving[2], boulevard:PAL.paving[0], ring:shade(PAL.mudBrown[4],0.1), highway:PAL.paving[3], main:PAL.paving[0] };
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
    if(cls==='boulevard'||cls==='ring'||cls==='highway'||cls==='main'){ c.setLineDash([0.8,5.2]); strokeClass(c, cls, -ST_CLASS[cls].w+1.0, 'rgba(110,92,64,0.35)'); c.setLineDash([]); }
  }); });
  /* ---- 6. the farmland (mask only: the farms draw their own paddies) ---- */
  FARMS.forEach(function(Q){ both(function(c,isMask){ if(!isMask) return; c.fillStyle=code(7); rect(c, Q, 0); }); FARM_PLOTS.push({ x:Q.x, z:Q.z, w:Q.w, d:Q.d, ry:Q.ry }); });

  MASK_DATA = m.getImageData(0,0,MASK_RES,MASK_RES).data;
  window._mask = { res:MASK_RES, at:maskAt, farmPlots:FARM_PLOTS.length };
})();
