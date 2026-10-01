/* ==== ARENA COMBAT: THE BUILT HALF ==== */

var ARENA_SITE;

function arenaHash2(i,j){ var s = Math.sin(i*39.3468 + j*11.1352) * 24634.6345; return s - Math.floor(s); }

var ARENA_SKIN = 0x8c8394;
var ARENA_SEATS;
function arenaSpectator(x, y, z, ry, tunicCol){
  if(!ARENA_SEATS) ARENA_SEATS = [];
  ARENA_SEATS.push({ x:x, y:y, z:z, ry:ry, col:tunicCol });
}

function arenaBucketTotal(){ var n=0; for(var k in BUCKET) n += BUCKET[k].list.length; return n; }

function arenaCombatDeck(c, y, outerHalf, fieldHalf, steps, stepH, bank, pillarPos, pillarR){
  var instBefore = arenaBucketTotal();
  var stoneCol = shade(c.tone, -0.10);
  var darkCol  = shade(c.tone, -0.34);
  var ironCol  = shade(GREYC[0], -0.30);
  var plankCol = shade(TRUNKC[0], -0.06);
  var sandCol  = 0x9a8f74;                       /* the field floor's own colour, reused verbatim */
  var TUNIC = TONES_POOR, BANNERS = BANNERC;

  var pitHalfW = 24, pitWallT = 2.0, pitDepth = 15, pitH = 16.5;
  var benchSkipNorth = pitHalfW + pitWallT + 3.5;

  /* ==== 1. raised spectator benches, full inner perimeter ==== */
  var segTarget = 9.0, benchN = 0, crowdN = 0;

  function pillarClash(px, pz, halfLen){
    var q, p;
    for(q=0;q<pillarPos.ns.length;q++){
      p = pillarPos.ns[q];
      if(Math.abs(pz-p[1]) < pillarR+1.4 && Math.abs(px-p[0]) < pillarR+halfLen) return true;
    }
    for(q=0;q<pillarPos.ew.length;q++){
      p = pillarPos.ew[q];
      if(Math.abs(px-p[0]) < pillarR+1.4 && Math.abs(pz-p[1]) < pillarR+halfLen) return true;
    }
    return false;
  }

  for(var i=1;i<steps;i++){
    var rMid = outerHalf - i*bank - bank*0.5;
    var yTop = y + (steps-i)*stepH;
    var seatD = bank*0.80, riserD = bank*0.55;

    for(var sz=-1; sz<=1; sz+=2){
      var L = rMid*2, n = Math.max(4, Math.round(L/segTarget)), segL = L/n;
      for(var k=0;k<n;k++){
        var bx = c.x - L*0.5 + (k+0.5)*segL, bz = c.z + sz*rMid;
        if(sz < 0 && Math.abs(bx-c.x) < benchSkipNorth) continue;
        if(pillarClash(bx, bz, segL*0.5)) continue;
        BOX(bx, yTop, bz, segL*0.96, 0.52, riserD, 0, darkCol);
        BOX(bx, yTop+0.52, bz, segL*0.96, 0.34, seatD, 0, plankCol, 'wood');
        benchN += 2;

        for(var s2=0;s2<3;s2++){
          var hh = arenaHash2(bx*0.37 + s2*7.13, bz*0.41 + i*3.7);
          if(hh > 0.62) continue;
          arenaSpectator(bx + (s2-1)*segL*0.30, yTop+0.86, bz + (sz<0 ? 0.30 : -0.30),
                         sz<0 ? 0 : Math.PI, TUNIC[Math.floor(hh*997) % TUNIC.length]);
          crowdN++;
        }
      }
    }
    for(var sx2=-1; sx2<=1; sx2+=2){
      var L2 = rMid*2 - bank*2, n2 = Math.max(4, Math.round(L2/segTarget)), segL2 = L2/n2;
      for(var k2=0;k2<n2;k2++){
        var bz2 = c.z - L2*0.5 + (k2+0.5)*segL2, bx2 = c.x + sx2*rMid;
        if(pillarClash(bx2, bz2, segL2*0.5)) continue;
        BOX(bx2, yTop, bz2, riserD, 0.52, segL2*0.96, 0, darkCol);
        BOX(bx2, yTop+0.52, bz2, seatD, 0.34, segL2*0.96, 0, plankCol, 'wood');
        benchN += 2;
        for(var s3=0;s3<3;s3++){
          var hh2 = arenaHash2(bx2*0.43 + i*5.1, bz2*0.31 + s3*9.7);
          if(hh2 > 0.62) continue;
          arenaSpectator(bx2 + (sx2<0 ? 0.30 : -0.30), yTop+0.86, bz2 + (s3-1)*segL2*0.30,
                         sx2<0 ? Math.PI*0.5 : -Math.PI*0.5,
                         TUNIC[Math.floor(hh2*997) % TUNIC.length]);
          crowdN++;
        }
      }
    }
  }

  /* ==== 2. the pit entrance, built into the north arena wall ==== */
  var backZ = c.z - fieldHalf;
  var frontZ = backZ + pitDepth;
  var midZ = (backZ + frontZ) * 0.5;

  BOX(c.x, y, backZ - 0.3 + pitWallT*0.5, (pitHalfW+pitWallT)*2, pitH, pitWallT, 0, stoneCol);
  for(var ws=-1; ws<=1; ws+=2){
    BOX(c.x + ws*(pitHalfW+pitWallT*0.5), y, midZ, pitWallT, pitH, pitDepth, 0, stoneCol);
  }

  BOX(c.x, y, frontZ - 4.2, pitHalfW*2, pitH-2.6, 1.6, 0, shade(BASALTC[0], -0.25));

  var jambW = 5.0, gateHalf = pitHalfW - jambW, gateH = pitH - 3.2;
  for(var js=-1; js<=1; js+=2){
    BOX(c.x + js*(pitHalfW - jambW*0.5), y, frontZ - 0.7, jambW, gateH, pitWallT*1.5, 0, shade(stoneCol,-0.08));
  }
  BOX(c.x, y + gateH, frontZ - 0.7, (pitHalfW+pitWallT)*2, pitH-gateH, pitWallT*1.7, 0, shade(stoneCol,-0.16));
  var nBars = 17;
  for(var b=0;b<nBars;b++){
    CYL(c.x + ((b+0.5)/nBars - 0.5) * gateHalf*2, y, frontZ - 0.7, 0.30, gateH, 0, ironCol, 'metal');
  }
  [0.10, 0.50, 0.90].forEach(function(f){
    BOX(c.x, y + gateH*f, frontZ - 0.7, gateHalf*2, 0.36, 0.52, 0, shade(ironCol,0.08), 'metal');
  });

  function arenaSkullBoss(sx, sz, y0, r){
    var bone = shade(MARBLEC[0], -0.30), hole = shade(BASALTC[0], -0.28);
    DOME(sx, y0, sz + 0.30, r, r*0.62, 0, bone, 'dome');
    BOX(sx, y0 - r*0.62, sz + 0.30, r*1.55, r*0.62, r*0.72, 0, bone);

    [-1,1].forEach(function(e){
      BOX(sx + e*r*0.40, y0 + r*0.06, sz + 0.30 + r*0.88, r*0.34, r*0.30, 0.16, 0, hole);
    });
    BOX(sx, y0 - r*0.52, sz + 0.30 + r*0.40, r*0.70, r*0.22, 0.16, 0, hole);
  }
  [-1,0,1].forEach(function(s){
    arenaSkullBoss(c.x + s*pitHalfW*0.52, frontZ - 0.7 + pitWallT*0.85, y + gateH + 1.5, 0.95);
  });
  [-1,1].forEach(function(s){
    arenaSkullBoss(c.x + s*(pitHalfW - jambW*0.5), frontZ - 0.7 + pitWallT*0.75, y + gateH*0.62, 1.15);
  });

  BOX(c.x, y-0.30, frontZ + 3.4, gateHalf*2 + 6, 0.42, 7.5, 0, shade(sandCol,-0.06));

  /* roof slab — also the VIP box's floor */
  var roofY = y + pitH;
  BOX(c.x, roofY, midZ - 0.15, (pitHalfW+pitWallT)*2 + 2.4, 1.35, pitDepth + 2.4, 0, shade(stoneCol,-0.20));

  /* ==== 3. the VIP box on top of the pit entrance ==== */
  var vipY = roofY + 1.35;
  var vipHalfW = pitHalfW + pitWallT + 1.2, vipHalfD = (pitDepth + 2.4)*0.5;
  var vipCz = midZ - 0.15;
  var vipFrontZ = vipCz + vipHalfD;
  BOX(c.x, vipY, vipFrontZ - 0.55, vipHalfW*2, 1.25, 1.1, 0, shade(stoneCol,0.05));                  /* front parapet */
  for(var ps=-1; ps<=1; ps+=2){
    BOX(c.x + ps*(vipHalfW-0.55), vipY, vipCz, 1.1, 1.25, vipHalfD*2, 0, shade(stoneCol,0.05));      /* side parapets */
  }
  var vipColH = 7.2;
  for(var vc=0; vc<6; vc++){
    var vx = c.x + ((vc+0.5)/6 - 0.5) * (vipHalfW*2 - 3.0);
    CYL(vx, vipY, vipFrontZ - 1.6, 0.80, vipColH, 0, MARBLEC[0]);
    CYL(vx, vipY, vipCz - vipHalfD*0.55, 0.80, vipColH, 0, MARBLEC[0]);
  }
  BOX(c.x, vipY+vipColH, vipCz, vipHalfW*2, 1.1, vipHalfD*2, 0, shade(stoneCol,-0.06));              /* entablature */
  FR8(c.x, vipY+vipColH+1.1, vipCz, vipHalfW*2*0.99, 2.8, vipHalfD*2*0.99, 0, ROOFS[0], 'roof');     /* canopy */

  for(var vb=0; vb<6; vb++){
    BOX(c.x + ((vb+0.5)/6 - 0.5) * (vipHalfW*2 - 2.0), vipY - 5.4, vipFrontZ - 0.05,
        4.2, 5.6, 0.14, 0, BANNERS[vb % BANNERS.length], 'cloth');
  }

  for(var ts=-1; ts<=1; ts+=2){
    BOX(c.x + ts*5.0, vipY, vipCz - vipHalfD*0.20, 2.8, 1.1, 2.4, 0, shade(TRUNKC[0],-0.12), 'wood');
    BOX(c.x + ts*5.0, vipY+1.1, vipCz - vipHalfD*0.20 - 1.0, 2.8, 2.6, 0.5, 0, shade(TRUNKC[0],-0.22), 'wood');
    arenaSpectator(c.x + ts*5.0, vipY+1.1, vipCz - vipHalfD*0.20, 0, BANNERS[ts>0?0:1]);
  }

  BOX(c.x, vipY, vipCz - vipHalfD*0.62, vipHalfW*2 - 3.0, 0.75, 3.2, 0, shade(stoneCol,-0.04));
  for(var va=0; va<4; va++){
    var vax = c.x + (va<2 ? -1 : 1) * (10.0 + (va%2)*7.0);
    arenaSpectator(vax, vipY + 0.75, vipCz - vipHalfD*0.62, 0, shade(GREYC[0],-0.10));
  }

  inspectClaim(c.x, midZ, pitHalfW+pitWallT, pitDepth*0.5, 0, 'arenapit', 'Arena pit entrance');
  inspectClaim(c.x, vipCz, vipHalfW, vipHalfD, 0, 'arenavip', 'Arena VIP box');

  ARENA_SITE = {
    x: c.x, z: c.z, y: y, tone: c.tone,
    fieldHalf: fieldHalf, outerHalf: outerHalf,
    fieldY: y - 0.15,                        /* top of arenaDeckSquare()'s own field slab */
    gateX: c.x, gateZ: frontZ + 2.6,         /* mouth of the barred gate, out on the sand apron */
    pitHalfW: pitHalfW, pitDepth: pitDepth, pitH: pitH,
    vipY: vipY,
    benchInstances: benchN, crowdInstances: crowdN
  };
  window._arenaBuilt = { benches: benchN, crowd: crowdN,
                         seats: ARENA_SEATS ? ARENA_SEATS.length : 0,  /* bench crowd + the 6 in the VIP box; all live, none baked */
                         pitH: pitH, vipY: vipY,
                         staticInstances: arenaBucketTotal() - instBefore,
                         pit: [Math.round(c.x), Math.round(midZ)],
                         gate: [Math.round(c.x), Math.round(frontZ + 2.6)] };   /* diagnostic */
}
/* ==== SILT STRIDER STATIONS (static) ==== */
reseed(660001);

var STRIDER_R1_STATIONS_RAW = [
  { x:-1806.4, z:2278.8, tx:-0.8320502943378437, tz:-0.5547001962252291, label:'Route 1 Stop 1' },
  { x:107.0,   z:2065.2, tx:0.217518812610881,   tz:0.9760561285911545,  label:'Route 1 Stop 2' },
  { x:791.3,   z:1489.4, tx:0.9019646069836713,  tz:-0.4318099671716614, label:'Route 1 Stop 3' },
  { x:1181.1,  z:1453.2, tx:0.8893017314745645,  tz:-0.4573209271357934, label:'Route 1 Stop 4' },
  { x:1938.9,  z:1701.5, tx:0.8642872019638728,  tz:0.5029986406755586,  label:'Route 1 Stop 5' },
  { x:2949.4,  z:1710.7, tx:0.980823374416306,   tz:0.19489871266535125, label:'Route 1 Stop 6 (Eastern Nucleus)' }
];

var LIFE_STRIDER_STATIONS = [];
function striderFindStation(x,z,tol){
  tol = tol || 25;
  for(var i=0;i<LIFE_STRIDER_STATIONS.length;i++){
    var s = LIFE_STRIDER_STATIONS[i];
    if(Math.hypot(s.x-x,s.z-z) < tol) return s;
  }
  return null;
}
function striderRegisterStation(x,z,ry,label){
  var existing = striderFindStation(x,z);
  if(existing) return existing;

  var st = { x:x, z:z, ry:ry, label:label, cat:'strider', cap:99, active:0, entryCount:0, queueCount:0 };
  LIFE_STRIDER_STATIONS.push(st);
  return st;
}

function striderStationBuild(st){
  var x=st.x, z=st.z, ry=st.ry;
  var halfLen=18, halfWid=9;
  var col = shade(pick(TONES), -0.04);
  var yb = plinth(x,z,halfLen,halfWid,ry,col);
  BOX(x, yb, z, halfLen*2, 1.1, halfWid*2, ry, col);
  BOX(x, yb+1.1, z, halfLen*2*1.02, 0.4, halfWid*2*1.02, ry, shade(col,-0.12));   /* deck lip */
  var postH = 7.4;
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(s){
    var p = loc(x,z, s[0]*(halfLen-1.8), s[1]*(halfWid-1.8), ry);
    CYL(p[0], yb+1.1, p[1], 0.55, postH, 0, 0x5a4028, 'wood');
  });
  /* peaked shelter roof, centred over the platform */
  CONE(x, yb+1.1+postH, z, Math.max(halfLen,halfWid)*0.80, 5.4, ry, pick(ROOFS));
  /* a plain crossbeam under the roof, tying the 4 posts together */
  BOX(x, yb+1.1+postH-0.3, z, halfLen*1.7, 0.5, halfWid*1.7, ry, 0x4a3520, 'wood');
  /* 3-step stone ramp up from ground level, road-facing side */
  var deckTopY = yb+1.5;
  for(var i=0;i<3;i++){
    var stepY = deckTopY - 2.4 + i*0.8;
    var off = -halfLen - 1.6 - (2-i)*2.1;
    var p2 = loc(x,z, off, 0, ry);
    BOX(p2[0], stepY-0.8, p2[1], 3.4, 0.9, 2.1, ry, shade(col,-0.10));
  }
  /* a small waiting bench under the shelter */
  var benchP = loc(x,z,0,-halfWid*0.55,ry);
  benchPlain(benchP[0], yb+1.5, benchP[1], ry+Math.PI/2, shade(col,-0.15));
}

var STRIDER_R1_STATIONS = STRIDER_R1_STATIONS_RAW.map(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  var st = striderRegisterStation(p.x, p.z, ry, p.label);
  striderStationBuild(st);
  return st;
});

/* ==== eastern nucleus: shrine ==== */
(function(){
  var nuc = STRIDER_R1_STATIONS_RAW[5];
  var ry = Math.atan2(nuc.tx, nuc.tz);
  var sp = loc(nuc.x, nuc.z, 4, 34, ry);
  var sy = terrainH(sp[0], sp[1]);
  shrineTriptych(sp[0], sy, sp[1], ry+Math.PI/2, shade(pick(TONES), 0.08), {w:11, d:4});
})();

/* ==== SILT STRIDER STATIONS (Route 2) ==== */
var STRIDER_R2_STATIONS_RAW = [
  { x:2275.3,  z:-1364.7, tx:1,                    tz:0,                    label:'Route 2 Stop 1' },
  { x:1413.8,  z:-957.1,  tx:-0.20317289800387703, tz:0.9791428769677621,   label:'Route 2 Stop 2' },
  { x:759.2,   z:-411.3,  tx:0.19082757228688982,  tz:-0.9816235722796656,  label:'Route 2 Stop 3' },
  { x:-790.5,  z:-307.4,  tx:0.6686019937136221,   tz:0.7436204502312789,   label:'Route 2 Stop 4' },
  { x:-1751.4, z:-1036.0, tx:-0.7682761317017722,  tz:-0.6401185714048304,  label:'Route 2 Stop 5' }
];

var STRIDER_R2_STATIONS = STRIDER_R2_STATIONS_RAW.map(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  var existing = striderFindStation(p.x, p.z);
  var st = striderRegisterStation(p.x, p.z, ry, p.label);
  if(!existing) striderStationBuild(st);
  return st;
});

/* ==== SILT STRIDER STATIONS (Route 3) ==== */
var STRIDER_R3_STATIONS_RAW = [
  { x:2280.8, z:-1356.9, tx:1,                     tz:0,                     label:'Route 3 Stop 1 (shared w/ Route 2 Stop 1)' },
  { x:1416.3, z:-957.1,  tx:-0.20317289800387703,  tz:0.9791428769677621,    label:'Route 3 Stop 2 (shared w/ Route 2 Stop 2)' },
  { x:764.6,  z:-410.6,  tx:0.19082757228688982,   tz:-0.9816235722796656,   label:'Route 3 Stop 3 (shared w/ Route 2 Stop 3)' },
  { x:878.7,  z:182.0,   tx:0.9559034445674892,    tz:-0.2936811275244105,   label:'Route 3 Stop 4' },
  { x:1212.6, z:995.4,   tx:0.537715394629288,     tz:-0.8431264166058784,   label:'Route 3 Stop 5' },
  { x:1187.7, z:1453.9,  tx:0.959769663622615,     tz:0.28078851969005536,   label:'Route 3 Stop 6 (shared w/ Route 1 Stop 4)' },
  { x:795.1,  z:1487.9,  tx:0.9019646069836713,    tz:-0.4318099671716614,   label:'Route 3 Stop 7 (shared w/ Route 1 Stop 3)' },
  { x:111.5,  z:2065.2,  tx:0.217518812610881,     tz:0.9760561285911545,    label:'Route 3 Stop 8 (shared w/ Route 1 Stop 2)' },
  { x:212.2,  z:2500.0,  tx:-0.07124704998790961,  tz:0.997458699830735,     label:'Route 3 Stop 9 (nudged inside CITY_LIM, see comment above)' }
];
var STRIDER_R3_STATIONS = STRIDER_R3_STATIONS_RAW.map(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  var existing = striderFindStation(p.x, p.z);
  var st = striderRegisterStation(p.x, p.z, ry, p.label);
  if(!existing) striderStationBuild(st);
  return st;
});

window._striderStations = LIFE_STRIDER_STATIONS.map(function(s){ return {x:s.x,z:s.z,label:s.label}; });
