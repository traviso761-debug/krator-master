/* ============================== PINNACLE ROCK — the flyers out of the sandbox ==============================
   PRFLY.update(dt, hour)   one frame (the host's hour ticks call it: 99-host-take.js)
   PRFLY.sim(seconds, hour) advance the simulation without drawing (the checks)
   PRFLY.land(platId, sp)   bring one beast in to a free bay on that deck from 300 m out (the checks: a quetzal on an east fin)
   PRFLY.stats()            counts, bays, circuits, the routes' accept and reject tallies */
/* the inspector's words and the page's layer for each mesh */
for(var _fi=0; _fi<5; _fi++){ flyMesh[_fi].userData.inspectLabel = _fi < 4 ? FLY_LABEL[_fi] + ' (one of Girder\'s flyers, on the roosts)' : 'A beast-rider and his saddle'; flyMesh[_fi].userData.flyers = true; }
flyWingMesh.userData.inspectLabel = 'Giant dragonfly (its wings)'; flyWingMesh.userData.flyers = true; flyGlints.userData.flyers = true; flyGlints.userData.probeSkip = true;
function flyNightK(h){ return 1 - smooth(5.0, 6.8, h) + smooth(17.6, 19.4, h); }
_PRFLY_OUT = {
  update: function(dt, hour){ flyUpdate(dt, hour, clamp(flyNightK(hour), 0, 1)); },
  sim: function(seconds, hour){ var n = Math.ceil(seconds/0.1); for(var i=0;i<n;i++) flySim(0.1, hour == null ? 12 : hour); flyRender(0); },
  land: function(platId, sp, hour){ var P = PLATS.find(function(p){ return p.id === platId; }); if(!P) return null;
    return flySpawnArrival(P, sp == null ? FLY_Q : sp, 300, hour == null ? 12 : hour, null); },
  list: function(){ return flyList; }, bays: flyBays, plats: PLATS, circuits: flyCircuits, SP: { Q:FLY_Q, B:FLY_B, A:FLY_A, D:FLY_D }, LABEL: FLY_LABEL,
  meshes: function(){ return flyMesh.concat([flyWingMesh, flyGlints]); },
  stats: function(){ flyCount(); var bk = { ok:0, blocked:0 }; flyBays.forEach(function(B){ bk[B.ok ? 'ok' : 'blocked']++; });
    return { animals:flyList.length, aloft:flyCnt.aloft, perched:flyCnt.perched, bySp:flyCnt.bySp.slice(), bays:bk, usable:flyUsable,
      circuits:flyCircuits.map(function(c){ return c.label; }), totals:JSON.parse(JSON.stringify(flyTotals)), paths:JSON.parse(JSON.stringify(flyPathStats)), simT:flySimT }; }
};
