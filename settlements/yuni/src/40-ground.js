/* ============================== 9. GROUND CANVAS + MASK ==============================
   PLANNER-OWNED. The single source of truth for what the ground IS inside the detailed
   box (+-CITY_EXT): every street, plaza, park, field, waterway and reserved site is
   painted twice — once in colour (GROUND_CANVAS, draped over the terrain by 75-terrain.js)
   and once as a category (MASK, read by placement, flora and, later, the life layer).
     maskAt(x,z): 0 free · 1 street · 2 plaza · 3 park · 4 reserved site · 5 wall/gate
                  6 rock or water · 7 farmland + ditch                                  */
reseed(400001);

var GC_RES = FAST ? 2048 : 4096, MASK_RES = 2200;
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
/* the farm plots the belt is divided into — published so the farm pass can use them directly */
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
  g.clearRect(0,0,GC_RES,GC_RES); m.fillStyle='#000'; m.fillRect(0,0,MASK_RES,MASK_RES);

  /* ---- 1. THE FARM BELT: the irrigated land the canal commands. Laid out as real plots
          with baulks between them, so the farm pass has a grid to fill and nothing else
          builds here. ---- */
  (function(){
    var rings=[[FARMBELT.rIn, 846],[854, 916],[966, 1032],[1040, 1114],[1122, FARMBELT.rOut]];
    rings.forEach(function(R,ri){
      var rm=(R[0]+R[1])/2, arc=34+8*((ri+1)%3), span=FARMBELT.a1-FARMBELT.a0, n=Math.max(6, Math.round(span*rm/arc));
      for(var k=0;k<n;k++){
        var a0=FARMBELT.a0+span*k/n+0.0035, a1=FARMBELT.a0+span*(k+1)/n-0.0035;
        var cx=Math.cos((a0+a1)/2)*rm, cz=Math.sin((a0+a1)/2)*rm;
        if(canalDist(cx,cz) < CANAL_W[3]+3) continue;
        if(riverDist(cx,cz) < 34) continue;
        if(onStreet(cx,cz,7)) continue;                    /* the highways run straight through the belt */
        var kind=Math.floor(phash(k*7, ri*3, 5, 11)*4);
        FARM_PLOTS.push({ a0:a0, a1:a1, r0:R[0]+1.5, r1:R[1]-1.5, x:cx, z:cz, kind:kind });
        both(function(c,isMask){
          c.beginPath(); c.arc(0,0,R[1]-1.5,a0,a1); c.arc(0,0,R[0]+1.5,a1,a0,true); c.closePath();
          c.fillStyle = isMask ? code(7) : hex(PAL.field[kind]); c.fill();
          if(isMask) return;
          c.strokeStyle='rgba(120,104,66,0.45)'; c.lineWidth=1.1; c.stroke();
          c.save(); c.clip(); c.strokeStyle='rgba(255,255,255,0.09)'; c.lineWidth=1.6;    /* furrows */
          for(var q=0;q<9;q++){ var aq=a0+(a1-a0)*(q+0.5)/9; c.beginPath(); c.moveTo(Math.cos(aq)*R[0],Math.sin(aq)*R[0]); c.lineTo(Math.cos(aq)*R[1],Math.sin(aq)*R[1]); c.stroke(); }
          c.restore();
        });
      }
    });
  })();

  /* ---- 2. parks (streets paint over their edges) ---- */
  PARKS.forEach(function(P,pi){ both(function(c,isMask){
    c.beginPath();
    for(var k=0;k<=40;k++){ var a=k/40*TAU, r=P.r*(1+0.10*Math.sin(a*3+pi)+0.06*Math.sin(a*5+2*pi)); c[k?'lineTo':'moveTo'](P.x+Math.cos(a)*r, P.z+Math.sin(a)*r); }
    c.closePath(); c.fillStyle = isMask ? code(3) : hex(PAL.shrub[pi%4]); c.fill();
    if(!isMask){ c.strokeStyle=hex(PAL.pavingRich[1]); c.lineWidth=3; c.lineCap='round';
      for(var w=0;w<2;w++){ c.beginPath(); for(var t=0;t<=30;t++){ var f=t/30, a2=f*TAU*0.9+w*2.2+pi, rr2=P.r*(0.15+0.7*f); c[t?'lineTo':'moveTo'](P.x+Math.cos(a2)*rr2*(w?0.8:1), P.z+Math.sin(a2)*rr2); } c.stroke(); }
      c.fillStyle=hex(PAL.mosaicBlue[1]); c.beginPath(); c.arc(P.x,P.z,5,0,TAU); c.fill(); }
  }); });

  /* ---- 3. reserved yards: the caravanserai, and the canal basin ---- */
  [[CARAVANSERAI, PAL.lane[1]], [BASIN, PAL.canalC[0]]].forEach(function(row){
    both(function(c,isMask){ var Q=row[0]; c.save(); c.translate(Q.x,Q.z); c.rotate(-Q.ry);
      c.fillStyle = isMask ? code(4) : hex(row[1]); c.fillRect(-Q.w/2,-Q.d/2,Q.w,Q.d);
      if(!isMask){ c.strokeStyle=hex(PAL.adobeDark[0]); c.lineWidth=1.6; c.strokeRect(-Q.w/2,-Q.d/2,Q.w,Q.d); }
      c.restore(); });
  });

  /* ---- 4. the waterways: the river, the canal and its ditches ---- */
  both(function(c,isMask){
    var i;
    if(isMask){
      stroke(c, RIVER, 2*RIVER_HALF+26, code(6));
      stroke(c, CANAL, 2*CANAL_W[2], code(6));
      DITCHES.forEach(function(D){ stroke(c, [[D.x0,D.z0],[D.x1,D.z1]], 7, code(7)); });
      return;
    }
    stroke(c, RIVER, 2*RIVER_HALF+30, hex(PAL.soil[3]));               /* the shingle margins */
    stroke(c, RIVER, 2*RIVER_HALF+4, hex(PAL.riverShallow));
    stroke(c, CANAL, 2*CANAL_W[2]+2, hex(PAL.soil[0]));                /* the towpath banks */
    stroke(c, CANAL, 2*CANAL_W[1], hex(PAL.dryGrass[3]));
    stroke(c, CANAL, 2*CANAL_HALF+1.5, hex(PAL.canalC[0]));
    DITCHES.forEach(function(D){ stroke(c, [[D.x0,D.z0],[D.x1,D.z1]], 6.5, hex(PAL.soil[1]));
                                 stroke(c, [[D.x0,D.z0],[D.x1,D.z1]], 2.2, hex(PAL.canalC[0])); });
  });

  /* ---- 5. streets: kerb stroke, then surface; widest last so junctions read cleanly ---- */
  var order=['lane','alley','street','road','boulevard','ring','highway'];
  var surf={ lane:PAL.lane[0], alley:PAL.lane[2], street:PAL.paving[1], road:PAL.lane[2], boulevard:PAL.paving[0], ring:PAL.paving[2], highway:PAL.paving[3] };
  function strokeClass(c, cls, extra, style){
    c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=style; c.beginPath();
    ST.edges.forEach(function(e){ if(e.cls!==cls) return; var A=ST.nodes[e.a], B=ST.nodes[e.b];
      if(Math.max(Math.abs(A.x),Math.abs(A.z)) > CITY_EXT+60 && Math.max(Math.abs(B.x),Math.abs(B.z)) > CITY_EXT+60) return;
      c.moveTo(A.x,A.z); c.lineTo(B.x,B.z); });
    c.lineWidth = ST_CLASS[cls].w + extra; c.stroke();
  }
  order.forEach(function(cls){ both(function(c,isMask){
    if(isMask){ strokeClass(c, cls, 1.0, code(1)); return; }
    strokeClass(c, cls, 1.6, 'rgba(90,72,50,0.55)');
    strokeClass(c, cls, 0, hex(surf[cls]));
    if(cls==='boulevard'||cls==='ring'||cls==='highway'){ c.setLineDash([0.8,5.2]); strokeClass(c, cls, -ST_CLASS[cls].w+1.0, 'rgba(120,100,70,0.35)'); c.setLineDash([]); }
  }); });

  /* ---- 6. plazas ---- */
  function plaza(P, rings, colA, colB, accent){ both(function(c,isMask){
    c.beginPath(); c.arc(P.x,P.z,P.r,0,TAU); c.fillStyle = isMask ? code(2) : hex(colA); c.fill();
    if(isMask) return;
    for(var k=rings;k>=1;k--){ c.beginPath(); c.arc(P.x,P.z,P.r*k/(rings+0.5),0,TAU); c.fillStyle=hex(k%2?colB:colA); c.fill(); }
    c.strokeStyle=hex(accent); c.lineWidth=1.4; c.beginPath(); c.arc(P.x,P.z,P.r-1.2,0,TAU); c.stroke();
    for(var s=0;s<12;s++){ var a=s/12*TAU; c.beginPath(); c.moveTo(P.x+Math.cos(a)*P.r*0.18, P.z+Math.sin(a)*P.r*0.18); c.lineTo(P.x+Math.cos(a)*(P.r-2), P.z+Math.sin(a)*(P.r-2)); c.lineWidth=0.6; c.stroke(); }
  }); }
  plaza(CENTER_PLAZA, 3, PAL.pavingRich[0], PAL.pavingRich[2], PAL.mosaicBlue[0]);
  plaza(MARKET, 5, PAL.paving[0], PAL.paving[2], PAL.mosaicWarm[1]);
  GATES.forEach(function(G){ plaza({ x:G.x-G.ox*24, z:G.z-G.oz*24, r:17 }, 1, PAL.pavingRich[1], PAL.pavingRich[2], PAL.mosaicBlue[2]);
                             plaza({ x:G.x+G.ox*26, z:G.z+G.oz*26, r:19 }, 1, PAL.paving[0], PAL.paving[2], PAL.mosaicBlue[2]); });
  /* the forecourt: an apse of rich paving in front of the slot, the slot floor itself, and a mosaic carpet up the axis */
  both(function(c,isMask){
    c.fillStyle = isMask ? code(2) : hex(PAL.pavingRich[1]);
    c.beginPath(); c.arc(FORECOURT.x,FORECOURT.z,FORECOURT.r,0,TAU); c.fill();
    c.fillRect(-VAULT.halfW-4, FORECOURT.z-6, 2*VAULT.halfW+8, VAULT.zf-FORECOURT.z+10);
    if(isMask) return;
    for(var k=4;k>=1;k--){ c.beginPath(); c.arc(FORECOURT.x,FORECOURT.z,FORECOURT.r*k/4.4,0,TAU); c.fillStyle=hex(k%2?PAL.pavingRich[0]:PAL.pavingRich[2]); c.fill(); }
    c.fillStyle=hex(PAL.mosaicBlue[2]); c.fillRect(-7, FORECOURT.z-FORECOURT.r+4, 14, VAULT.zf-FORECOURT.z+FORECOURT.r-44);
    c.fillStyle=hex(PAL.mosaicBlue[3]); c.fillRect(-5, FORECOURT.z-FORECOURT.r+4, 10, VAULT.zf-FORECOURT.z+FORECOURT.r-44);
    c.fillStyle=hex(PAL.mosaicWarm[0]); for(var q=0;q<26;q++){ c.save(); c.translate(0, FORECOURT.z-FORECOURT.r+8+q*4.2); c.rotate(Math.PI/4); c.fillRect(-1.3,-1.3,2.6,2.6); c.restore(); }
  });

  /* ---- 7. mask only: the wall, the gate passages, and the rock of the butte ---- */
  m.save(); m.scale(MS,MS); m.translate(CITY_EXT,CITY_EXT);
  var bp=[]; for(var bk=0;bk<=128;bk++){ var ba=bk/128*TAU, br=butteR(ba, Math.max(0,GV_Y-GROUND0)); bp.push([BUTTE.x+Math.cos(ba)*br, BUTTE.z+Math.sin(ba)*br]); }
  m.fillStyle=code(6); m.beginPath(); m.moveTo(bp[0][0],bp[0][1]); for(bk=1;bk<bp.length;bk++) m.lineTo(bp[bk][0],bp[bk][1]); m.closePath(); m.fill();
  m.strokeStyle=code(5); m.lineWidth=WALL.thick+5; m.beginPath(); m.arc(0,0,RW,WALL.a0,WALL.a1); m.stroke();
  WALL_TOWERS.forEach(function(T){ m.fillStyle=code(5); m.beginPath(); m.arc(T.x,T.z,T.r+2.5,0,TAU); m.fill(); });
  GATES.forEach(function(G){ m.strokeStyle=code(1); m.lineWidth=G.w; m.beginPath(); m.moveTo(G.x-G.ox*8,G.z-G.oz*8); m.lineTo(G.x+G.ox*8,G.z+G.oz*8); m.stroke(); });
  m.restore();

  MASK_DATA = m.getImageData(0,0,MASK_RES,MASK_RES).data;
  window._mask = { res:MASK_RES, at:maskAt, farmPlots:FARM_PLOTS.length, ditches:DITCHES.length };
})();
