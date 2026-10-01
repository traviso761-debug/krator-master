/* ==== STATIC LANTERN FIXTURES ==== */
reseed(720001);

var STATIC_LANTERNS = [];
function lanternAdd(x,z,y){ STATIC_LANTERNS.push({ x:x, z:z, y:(y!=null?y:terrainH(x,z)+2.6) }); }
function lanternPost(x,y,z,h){ CYL(x, y, z, 0.16, h||2.2, 0, 0x5a4028, 'wood'); }
function lanternBracket(x,y,z,ry){ BOX(x, y, z, 0.9, 0.25, 0.6, ry, 0x3a3a3a, 'metal'); }

/* ==== clan compound entrances: one lantern each side of the gate, on its ==== */
COMPOUNDS.forEach(function(c){
  [-1,1].forEach(function(s){
    var p = loc(c.x, c.z, c.wallFx*0.96, s*c.wallFz*0.55, c.ry);
    var py = c.y + 0.3;
    lanternPost(p[0], py, p[1], 2.6);
    lanternAdd(p[0], p[1], py+2.6);
  });
});

/* ==== silt strider stations: the shelter already has its own posts (66 ==== */
if(typeof LIFE_STRIDER_STATIONS !== 'undefined'){
  LIFE_STRIDER_STATIONS.forEach(function(s){
    var p = loc(s.x, s.z, 18-1.8, 9-1.8, s.ry);   /* same post-corner formula as striderStationBuild() */
    lanternAdd(p[0], p[1], terrainH(s.x,s.z)+7.6);
  });
}
/* ==== ferry stations: a small post beside each dock, landward of the ==== */
LIFE_FERRY_STOPS.forEach(function(s){
  var p = loc(s.x, s.z, -3, 0, s.ry);
  var py = terrainH(p[0], p[1]);
  lanternPost(p[0], py, p[1], 2.6);
  lanternAdd(p[0], p[1], py+2.6);
});

/* ==== intact gates and towers: a bracket lantern each side of a standing ==== */
(window._newGates||[]).forEach(function(g){
  if(!(g.health > 0)) return;
  var gy = terrainH(g.x,g.z);
  [-1,1].forEach(function(s){
    var p = loc(g.x, g.z, 0, s*7.2, g.ry);
    lanternBracket(p[0], gy+9.0, p[1], g.ry);
    lanternAdd(p[0], p[1], gy+9.4);
  });
});

(window._newTowers||[]).forEach(function(t){
  if(t.health !== 2) return;
  if(t.perch){
    var lp = loc(t.x, t.z, t.perch.side*(t.perch.hw-1.0), 0, t.ry);
    lanternBracket(lp[0], t.perch.y+1.2, lp[1], t.ry);
    lanternAdd(lp[0], lp[1], t.perch.y+1.7);
  }else{
    lanternBracket(t.x, t.y+54.0, t.z, t.ry);
    lanternAdd(t.x, t.z, t.y+54.5);
  }
});

/* ==== bridges: a post at BOTH ends (canton edge), not just one midpoint ==== */
if(typeof SPANS !== 'undefined'){
  SPANS.forEach(function(sp){
    var A = CANTONS[sp.a], B = CANTONS[sp.b];
    [[A,B],[B,A]].forEach(function(pair){
      var c = pair[0], other = pair[1];
      var ey = cantonEdgeY(c.n); if(ey==null) return;
      var dx = other.x-c.x, dz = other.z-c.z, L = Math.hypot(dx,dz)||1;
      var px = c.x+dx/L*c.r*0.85, pz = c.z+dz/L*c.r*0.85;
      lanternPost(px, ey, pz, 2.4);
      lanternAdd(px, pz, ey+2.4);
    });
  });
}

/* ==== harbor piers: front (shore root, x0/z0) and back (water tip, ==== */
if(typeof PIERS !== 'undefined'){
  PIERS.forEach(function(p){
    lanternPost(p.x0, SEA+2.2, p.z0, 2.4);
    lanternAdd(p.x0, p.z0, SEA+4.6);
    lanternPost(p.x1, SEA+2.2, p.z1, 2.4);
    lanternAdd(p.x1, p.z1, SEA+4.6);
  });
}

window._staticLanterns = STATIC_LANTERNS.length;
