/* ============================== 29. PROBE ==============================
   Read-only surface for the verifier and for debugging from the console. */
window._api = { terrainH:terrainH, riverDist:riverDist, riverLevel:riverLevel, trunkR:trunkR,
  TREES:TREES, FARTREES:FARTREES, TOWERS:TOWERS, SLOTS:SLOTS, PLATS:PLATS, BRIDGES:BRIDGES, LIFTS:LIFTS, ROOSTS:ROOSTS,
  PLOTS:PLOTS, HOUSES:HOUSES, STALLS:STALLS, HALL:HALL, GATES:GATES, PALISADE:PALISADE, NAV:NAV, BRANCHES:BRANCHES, SITES:SITES,
  NL_LAMPS:NL_LAMPS, NL_WINDOWS:NL_WINDOWS, lamps:glowLamps, BUDGET:BUDGET, bridgeY:bridgeY, stairPts:stairPts, skyHour:skyHour, skySetHour:skySetHour };
/* the buildings' marks (45-kit.js PORT, core/ports): kits/beast-riders/verify.py measures the ported buildings here */
window._ports = GPORT ? { n:GPORT.marks.length, box:GPORT.box, furn:GPORT.furn, find:function(d){ return GPORT.find(d).map(function(m){ return { kind:m.kind, id:m.id, frame:m.frame }; }); } } : null;
