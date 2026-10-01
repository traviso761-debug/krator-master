/* ============================== STATIC LANTERN FIXTURES =====================
   Owner: "Put similar lanterns by clan compound entrances, shrine/temple/
   chapel entrances, silt strider and ferry stations, intact gates and
   towers, at both ends of bridges and causeways, and at the front and back
   of each large harbor pier — now and going forward... Integrate the light
   source into building architecture as fitting."

   This file builds the small PHYSICAL fixture (a wood post or a metal wall
   bracket — both already-live (shape,family) pairs: CYL 'wood' and BOX
   'metal' are already used elsewhere in the city, e.g. benchPlain/gate
   ironwork) at every new lantern position, and collects the position list
   itself into STATIC_LANTERNS for 82-daynight.js to fold into its existing
   NIGHT_LIGHTS/nlMesh pool — one shared InstancedMesh, toggled by the
   existing dusk-to-dawn opacity uniform, zero new draw calls (see that
   file's own header for the full pattern this reuses).

   Shrine/temple entrances and causeways are NOT duplicated here — 82-
   daynight.js's existing NIGHT_LIGHTS builder already lights every
   LIFE_SHRINE_STOPS/TEMPLE_ALTAR position and both ends of every causeway;
   this file only adds the categories that weren't covered yet.

   Must load before 75-terrain.js's emitBuckets() (this pushes real static
   BOX/CYL geometry into BUCKET) and after every layout array it reads
   (COMPOUNDS/GATES/towers: 60-land.js; SPANS/CANTONS/PIERS: 30-layout.js;
   ferry stops: 65-facade.js; strider stations: 66-striders.js) — hence
   order 72, between 71-industry.js and 75-terrain.js. */
reseed(720001);   /* fragment head seed — build.py enforces this. */

var STATIC_LANTERNS = [];
function lanternAdd(x,z,y){ STATIC_LANTERNS.push({ x:x, z:z, y:(y!=null?y:terrainH(x,z)+2.6) }); }
function lanternPost(x,y,z,h){ CYL(x, y, z, 0.16, h||2.2, 0, 0x5a4028, 'wood'); }
function lanternBracket(x,y,z,ry){ BOX(x, y, z, 0.9, 0.25, 0.6, ry, 0x3a3a3a, 'metal'); }

/* ---- clan compound entrances: one lantern each side of the gate, on its
   own short post — the gate itself always sits on the compound's local
   +wallFx face (API.md's own documented convention). ---- */
COMPOUNDS.forEach(function(c){
  [-1,1].forEach(function(s){
    var p = loc(c.x, c.z, c.wallFx*0.96, s*c.wallFz*0.55, c.ry);
    var py = c.y + 0.3;
    lanternPost(p[0], py, p[1], 2.6);
    lanternAdd(p[0], p[1], py+2.6);
  });
});

/* ---- silt strider stations: the shelter already has its own posts (66-
   striders.js, halfLen 18 x halfWid 9) — mount the glow at one post's own
   top rather than dead-centre under the roof peak; centred, it sat behind
   the peaked CONE roof's own opaque geometry from most angles (found live
   — the glow's material depth-tests normally, so anything placed inside a
   solid shape is invisible from outside it, exactly like a real light
   bulb inside a lampshade would be if the shade were solid stone). ---- */
if(typeof LIFE_STRIDER_STATIONS !== 'undefined'){
  LIFE_STRIDER_STATIONS.forEach(function(s){
    var p = loc(s.x, s.z, 18-1.8, 9-1.8, s.ry);   /* same post-corner formula as striderStationBuild() */
    lanternAdd(p[0], p[1], terrainH(s.x,s.z)+7.6);
  });
}
/* ---- ferry stations: a small post beside each dock, landward of the
   waterline. ---- */
LIFE_FERRY_STOPS.forEach(function(s){
  var p = loc(s.x, s.z, -3, 0, s.ry);
  var py = terrainH(p[0], p[1]);
  lanternPost(p[0], py, p[1], 2.6);
  lanternAdd(p[0], p[1], py+2.6);
});

/* ---- intact gates and towers: a bracket lantern each side of a standing
   gate opening, and one atop each intact (health===2, full corncob) tower
   — mounted at watchtower()'s own second-tier band (baseH+h2+h3+2 = 26.5,
   65-facade.js), not a flat guess. Ruined-to-rubble (health<=0) gets
   nothing — there is no structure left to mount a fixture on. ---- */
(window._newGates||[]).forEach(function(g){
  if(!(g.health > 0)) return;
  var gy = terrainH(g.x,g.z);
  [-1,1].forEach(function(s){
    var p = loc(g.x, g.z, 0, s*7.2, g.ry);
    lanternBracket(p[0], gy+9.0, p[1], g.ry);
    lanternAdd(p[0], p[1], gy+9.4);
  });
});
/* the tower lantern now hangs on the SENTRY PERCH's own parapet (the perch
   record watchtower() hands back through window._newTowers, 60-land.js),
   beside the ordinator posted there — not at the old flat y+27, which was
   the 1x tower's second-tier band and, at the 2x scale, is now buried
   inside the shaft. Falls back to the scaled band height if a tower ever
   reports no perch. */
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

/* ---- bridges: a post at BOTH ends (canton edge), not just one midpoint
   torch — supersedes the old single-midpoint placement (82-daynight.js's
   own SPANS loop is trimmed to match, see that file). ---- */
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

/* ---- harbor piers: front (shore root, x0/z0) and back (water tip,
   x1/z1) of each of the 8 large harbor piers. ---- */
if(typeof PIERS !== 'undefined'){
  PIERS.forEach(function(p){
    lanternPost(p.x0, SEA+2.2, p.z0, 2.4);
    lanternAdd(p.x0, p.z0, SEA+4.6);
    lanternPost(p.x1, SEA+2.2, p.z1, 2.4);
    lanternAdd(p.x1, p.z1, SEA+4.6);
  });
}

window._staticLanterns = STATIC_LANTERNS.length;
