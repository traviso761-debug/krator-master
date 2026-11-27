// ================================================================= ARCODIGA — Asymmetric Partial-Refurbishment Delta (ADG_CROOK_DELTA) [G data]
// Adapts kits/ancients/targets/arcodiga without forking a single line of kits/ancients:
//   - Foundation Datum: yOffset = -95.0 m (worldY = localY - 95.0 m) across the Southern Basalt Gorge-Throat (px 88.5, 608).
//   - Submerged Belt (-95..-49 m): Power House (5 chutes) & Automated Industries completely drowned beneath clear seawater.
//   - Abandoned Western & Central Ruin (88% of arcology floor): Notch scar (worldY +117 m), severed West Wing (-348..-182 m),
//     VTOL lagoon monolith (+337 m), and 14 sealed/ruined Living-Working ribs (W1..W8, E3..E8).
//   - Reclaimed Eternian East Wing Enclave (12% of arcology floor, worldY +81..+227 m — strictly > +65 m tsunami trimline!):
//     East Stiffening Wing (wing.learning + east wing.hub, x >= +38 m) & inner East Buttresses (E1..E2), sealed at x = +38 m
//     by the Bronze Eternian Ancestor-Lintel Bulkhead and furnished in 'eternian' via ADG_INTERIORS.
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_CROOK_DELTA = (function(){
 const Y_OFFSET = -95.0;
 const BULKHEAD_X = 38.0;
 const TRIMLINE_M = 65.0;

 function isReclaimedUnit(u){
  if (!u) return false;
  if (u.area === 'wing' && u.x0 >= 30) return true;
  if (u.area === 'ribs' && u.x0 >= 35 && u.y0 >= 165) return true;
  return false;
 }

 function buildDelta(arcPlanMod, arcIntMod){
  const AP = arcPlanMod || (typeof ARCODIGA !== 'undefined' ? ARCODIGA : null);
  const AI = arcIntMod || (typeof ADG_INTERIORS !== 'undefined' ? ADG_INTERIORS : null);
  if (!AP || !AP.plan) return null;

  const P = AP.plan({ seed: 12700 });
  const D = P.dim;
  const RU = AP.ruin(P);

  let totalFloorM2 = 0;
  let reclaimedFloorM2 = 0;
  let submergedFloorM2 = 0;
  const organStates = [];

  /* 1. Evaluate all main Soleri organs in worldY = localY + Y_OFFSET */
  for (let i = 0; i < P.organs.length; i++) {
   const org = P.organs[i];
   const wy0 = +(org.at[1] - org.size[2] * 0.5 + Y_OFFSET).toFixed(1);
   const wy1 = +(org.at[1] + org.size[2] * 0.5 + Y_OFFSET).toFixed(1);
   totalFloorM2 += org.floor;

   let state = 'ruined';
   let culture = 'ancient';
   let recShare = 0.0;
   if (org.id === 'arcodiga.power' || org.id === 'arcodiga.ind.w' || org.id === 'arcodiga.ind.e') {
    state = 'submerged';
    submergedFloorM2 += org.floor;
   } else if (org.id === 'arcodiga.wing.learning') {
    state = 'reclaimed';
    culture = 'eternian';
    recShare = 1.0;
   } else if (org.id === 'arcodiga.wing.hub') {
    state = 'split-bulkhead';
    culture = 'eternian';
    recShare = (110.0 - BULKHEAD_X) / 220.0;
   }
   reclaimedFloorM2 += org.floor * recShare;
   organStates.push({
    id: org.id,
    name: org.name,
    worldY: [wy0, wy1],
    floorM2: org.floor,
    reclaimedM2: Math.round(org.floor * recShare),
    state: state,
    culture: culture
   });
  }

  /* 2. Prows & 16 Radial Buttress Ribs (only E1 & E2 upper decks reclaimed; W1..W8 and E3..E8 ruined/bulkheaded) */
  for (let i = 0; i < P.prows.length; i++) {
   const pr = P.prows[i];
   totalFloorM2 += pr.floor;
   const recShare = pr.x >= BULKHEAD_X ? 0.14 : 0.0;
   reclaimedFloorM2 += pr.floor * recShare;
  }

  const reclaimedRibs = [];
  const abandonedRibs = [];
  for (let i = 0; i < P.ribs.length; i++) {
   const rb = P.ribs[i];
   totalFloorM2 += rb.floor;
   if (rb.side > 0 && rb.j <= 2) {
    reclaimedRibs.push(rb.id);
    reclaimedFloorM2 += rb.floor * 0.62;
   } else {
    abandonedRibs.push(rb.id);
   }
  }

  /* 3. Interior room units partitioned into Eternian-socketed East Wing vs Ruined/Submerged sockets */
  const allUnits = (AI && AI.units) ? AI.units(1) : [];
  const reclaimedUnits = [];
  const abandonedUnits = [];
  let minReclaimedWorldY = 1e9;

  for (let i = 0; i < allUnits.length; i++) {
   const u = allUnits[i];
   const wy = +(u.y0 + Y_OFFSET).toFixed(2);
   if (isReclaimedUnit(u)) {
    reclaimedUnits.push({ id: u.id, area: u.area, name: u.name, x0: u.x0, x1: u.x1, worldY0: wy, storeys: u.n });
    if (wy < minReclaimedWorldY) minReclaimedWorldY = wy;
   } else {
    abandonedUnits.push({ id: u.id, area: u.area, worldY0: wy });
   }
  }

  const abandonedShare = (totalFloorM2 - reclaimedFloorM2) / Math.max(1, totalFloorM2);
  const reclaimedShare = reclaimedFloorM2 / Math.max(1, totalFloorM2);

  return {
   yOffset: Y_OFFSET,
   bulkhead: {
    id: 'arcodiga.bulkhead.east_spine_seal',
    name: 'Bronze Eternian Ancestor-Lintel Bulkhead Seal',
    x: BULKHEAD_X,
    worldY: +(D.WING.yHwy + Y_OFFSET).toFixed(1),
    z: D.WING.zC,
    w: 18.0,
    h: 12.5
   },
   bands: {
    powerhouseWorldY: [+(0 + Y_OFFSET).toFixed(1), +(D.POWER.h + Y_OFFSET).toFixed(1)],
    notchSillWorldY: +(D.NOTCH.sill + Y_OFFSET).toFixed(1),
    eastHighwayWorldY: +(D.WING.yHwy + Y_OFFSET).toFixed(1),
    eastWingCrestWorldY: +(D.WING.yTop1 + Y_OFFSET).toFixed(1),
    vtolTopWorldY: +(D.VTOL.yDeck1 + Y_OFFSET).toFixed(1),
    wingBreakX: [D.NOTCH.wingBreak0, D.NOTCH.wingBreak1]
   },
   stats: {
    totalFloorM2: Math.round(totalFloorM2),
    reclaimedFloorM2: Math.round(reclaimedFloorM2),
    submergedFloorM2: Math.round(submergedFloorM2),
    abandonedPct: +(abandonedShare * 100).toFixed(1),
    reclaimedPct: +(reclaimedShare * 100).toFixed(1),
    reclaimedRibs: reclaimedRibs,
    abandonedRibs: abandonedRibs,
    reclaimedUnitCount: reclaimedUnits.length,
    abandonedUnitCount: abandonedUnits.length,
    minReclaimedWorldY: minReclaimedWorldY < 1e8 ? minReclaimedWorldY : 81.0,
    debrisCount: RU.debris.length
   },
   organStates: organStates,
   reclaimedUnits: reclaimedUnits,
   abandonedUnits: abandonedUnits
  };
 }

 function auditDelta(delta){
  if (!delta || !delta.stats) return { ok: false, faults: ['missing delta'] };
  const faults = [];
  const s = delta.stats, b = delta.bands;
  if (!(b.powerhouseWorldY[1] <= -48.0)) faults.push('Powerhouse not submerged below -48 m (' + b.powerhouseWorldY[1] + ')');
  if (!(b.eastHighwayWorldY >= TRIMLINE_M)) faults.push('East Wing highway below +65 m trimline (' + b.eastHighwayWorldY + ')');
  if (!(s.minReclaimedWorldY >= TRIMLINE_M)) faults.push('Reclaimed Eternian interior unit below +65 m (' + s.minReclaimedWorldY + ')');
  if (!(s.abandonedPct >= 85.0 && s.abandonedPct <= 91.0)) faults.push('Abandoned arcology share outside 85..91% target (' + s.abandonedPct + '%)');
  if (!(s.reclaimedRibs.length === 2 && s.abandonedRibs.length === 14)) faults.push('Expected 2 reclaimed inner East ribs and 14 sealed/ruined ribs');
  return { ok: faults.length === 0, faults: faults };
 }

 return {
  Y_OFFSET: Y_OFFSET,
  BULKHEAD_X: BULKHEAD_X,
  TRIMLINE_M: TRIMLINE_M,
  isReclaimedUnit: isReclaimedUnit,
  buildDelta: buildDelta,
  auditDelta: auditDelta
 };
})();
