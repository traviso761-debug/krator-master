/* ============================== 29. PROBE ==============================
   Read-only surface for the verifier and for debugging from the console. */
window._api = { terrainH:terrainH, riverDist:riverDist, riverLevel:riverLevel, trunkR:trunkR, platXZ:platXZ,
  TREES:TREES, FARTREES:FARTREES, PLATS:PLATS, PIDX:PIDX, BRIDGES:BRIDGES, SPIRALS:SPIRALS, LIFTS:LIFTS, LADDERS:LADDERS,
  ROOSTS:ROOSTS, NAV:NAV, BRANCH_REQ:BRANCH_REQ, SITES:SITES, NL_LAMPS:NL_LAMPS, NL_WINDOWS:NL_WINDOWS,
  BUDGET:BUDGET, bridgeY:bridgeY, helixPoint:helixPoint, stairOf:stairOf, skyHour:skyHour, skySetHour:skySetHour };
/* the buildings' marks (45-kit.js PORT, core/ports): kits/beast-riders/verify.py measures the ported buildings here */
window._ports = MPORT ? { n:MPORT.marks.length, box:MPORT.box, furn:MPORT.furn, find:function(d){ return MPORT.find(d).map(function(m){ return { kind:m.kind, id:m.id, frame:m.frame }; }); } } : null;
