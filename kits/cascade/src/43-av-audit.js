// ================================================================= ARCVILLAGE — structural & plan audit  [G data]
// Verifies structural continuity, octagonal bounds, central light well clearance, interior room integrity across
// living/work/rec/civic categories, portal reachability, and ruin debris seating. No THREE, no DOM.
var AV = typeof AV !== 'undefined' ? AV : {};
(function () {
  'use strict';

  AV.audit = function (P, AI_arg) {
    var fails = [];
    if (!P || !P.dim) return { ok: false, fails: ['no plan'], rooms: 0, categories: {} };
    var D = P.dim;

    // 1. Height and footprint match Soleri's 220 m / ~12.25 ha envelope
    if (!(P.lantern && Math.abs(P.lantern.y1 - 220.0) < 0.01)) {
      fails.push('crown tip height is ' + (P.lantern && P.lantern.y1) + ', expected 220.0 m');
    }
    if (!(P.footprint && P.footprint.areaHa > 10.5 && P.footprint.areaHa < 14.0)) {
      fails.push('footprint areaHa ' + (P.footprint && P.footprint.areaHa) + ' outside 10.5..14.0 ha');
    }

    // 2. Eight carved apses & 12 cylindrical column-towers
    if (P.apses.length !== 8) fails.push('expected 8 apses, got ' + P.apses.length);
    if (P.towers.length !== 12) fails.push('expected 12 cylindrical column-towers, got ' + P.towers.length);
    P.towers.forEach(function (T) {
      var d = Math.hypot(T.x, T.z);
      if (d - T.r < D.WELL_HALF + 2.0) fails.push(T.id + ' intrudes into the central light well');
      if (!AV.inOct(T.x, T.z, 1.0, T.r + 2.0)) fails.push(T.id + ' protrudes outside the base octagon');
      if (!(T.y0 === 0 && T.y1 >= 120.0)) fails.push(T.id + ' vertical span invalid: ' + T.y0 + '..' + T.y1);
      (T.shafts || []).forEach(function (s) {
        if (Math.hypot(s.dx, s.dz) + Math.max(s.w, s.d) * 0.5 > T.coreR + 0.5) {
          fails.push(s.id + ' lies outside tower coreR ' + T.coreR);
        }
      });
    });

    // 3. Portals: 3 tailrace/basin canal portals + 5 street portals (+ 1 elevated headrace aqueduct portal in refurbished)
    var isRep = P.state === 'refurbished';
    var canalP = (P.portals || []).filter(function (q) { return q.kind === 'canal'; });
    var aqP = (P.portals || []).filter(function (q) { return q.kind === 'aqueduct'; });
    if (canalP.length !== 3) fails.push('expected 3 canal portals (E, S, W), got ' + canalP.length);
    if (isRep && aqP.length !== 1) fails.push('expected 1 elevated south aqueduct portal in refurbished, got ' + aqP.length);
    if (!isRep && aqP.length !== 0) fails.push('unexpected aqueduct portal on non-refurbished state ' + P.state);

    // 3b. Ancient Prime Toroidal Dynamo & Superconducting Power-Spine Relics (all 3 states)
    var AR = P.ancientRelics;
    if (!AR || !AR.primeDynamo) {
      fails.push('missing ancientRelics or primeDynamo');
    } else {
      var pd = AR.primeDynamo;
      if (!(pd.torusR >= 5.0 && pd.yTop <= 32.0)) fails.push('ancient primeDynamo dimensions out of bounds');
      if (!AR.busTrunks || AR.busTrunks.length !== 4) fails.push('expected 4 ancient column-tower busTrunks');
      if (!AR.capacitors || AR.capacitors.length !== 6) fails.push('expected 6 ancient harmonic capacitor monoliths');
      if (isRep && (!pd.stabilized || !AR.statorCradle)) fails.push('refurbished state must stabilize failed Ancient dynamo and cradle unbolted stator arc');
    }

    // 3c. Hydropower Replacement Setup (present in refurbished to replace the failed Ancient dynamo; absent in intact/ruined)
    var HH = P.hydroHall;
    if (isRep) {
      if (!HH || !HH.aqueduct) {
        fails.push('missing hydroHall or elevated headrace aqueduct in refurbished state');
      } else {
        if (!(HH.aqueduct.yWater >= 24.0 && HH.aqueduct.yWater <= 45.0)) {
          fails.push('aqueduct water head ' + HH.aqueduct.yWater + ' outside 24..45 m');
        }
        if (HH.replacesRelic !== 'av.relic.prime_dynamo') fails.push('hydroHall must reference replaced Ancient prime_dynamo');
        if (!HH.cataracts || HH.cataracts.length < 3) fails.push('expected 3 central cataracts/chutes');
        if (!HH.wheels || HH.wheels.length < 4) fails.push('expected 4 overshot waterwheels in central hall');
        if (!HH.gearTowers || HH.gearTowers.length < 4) fails.push('expected 4 bevel-gear drive-shaft towers');
        if (!HH.dynamos || HH.dynamos.length < 4) fails.push('expected 4 scroll-case hydro-dynamos');
        if (!HH.tripHammers || HH.tripHammers.length < 2) fails.push('expected 2 water-powered trip-hammers');
        if (!HH.cupolas || HH.cupolas.length < 2) fails.push('expected 2 blast cupola smelting furnaces');
        /* Verify overhead north line-shaft clears the Failed Ancient Prime Dynamo envelope (|z - pd.z| >= 6.0 m) */
        (HH.lineShafts || []).forEach(function (ls) {
          if (ls.axis === 'x' && AR && AR.primeDynamo && Math.abs(ls.z - AR.primeDynamo.z) < 6.0) {
            fails.push(ls.id + ' collides with Ancient Prime Dynamo at z=' + AR.primeDynamo.z);
          }
        });
      }
    } else if (HH !== null) {
      fails.push('non-refurbished state ' + P.state + ' should not carry Republican hydroHall retrofit');
    }

    // 4. Interior decks & rooms (when AI is available)
    var AI = AI_arg || (typeof KratorAncientsInteriors !== 'undefined' ? KratorAncientsInteriors : null);
    var roomCount = 0, cats = { living: 0, work: 0, rec: 0, civic: 0 };
    if (AI && typeof AV.storey === 'function') {
      P.decks.forEach(function (dk) {
        var st = AV.storey(P, dk.k, AI);
        if (!st.rooms.length) fails.push('deck ' + dk.id + ' produced 0 rooms');
        st.rooms.forEach(function (R) {
          if (R.kind === 'corridor' || R.kind === 'core') return;
          roomCount++;
          cats[R.category || 'civic'] = (cats[R.category || 'civic'] || 0) + 1;
          if (!R.poly || R.poly.length < 3) fails.push(R.id + ': degenerate polygon');
          else if (AV.polyArea(R.poly) < 6.0) fails.push(R.id + ': room area under 6 m2');
          if (!R.open && (!R.doors || !R.doors.length)) fails.push(R.id + ': room has no door');
          if (R.poly && R.poly.length) {
            var c = AI.polyCentroid(R.poly);
            // Light-well & Central Cataract clearance on decks L1..L10
            if (dk.k >= 1 && dk.k <= 10 && Math.abs(c[0]) < D.WELL_HALF - 4.0 && Math.abs(c[1]) < D.WELL_HALF - 4.0) {
              fails.push(R.id + ': intrudes into central industrial cataract / light well');
            }
            // South Headrace Aqueduct clearance on decks L1..L3 in refurbished state (y = 6..38 m, |x| < 9.5 m, z > 16 m)
            if (isRep && dk.k >= 1 && dk.k <= 3 && Math.abs(c[0]) < 9.5 && c[1] > 16.0) {
              fails.push(R.id + ': blocks South Headrace Aqueduct corridor');
            }
          }
        });
      });
      if (P.state !== 'ruined') {
        ['living', 'work', 'rec', 'civic'].forEach(function (cat) {
          if (!(cats[cat] >= 6)) fails.push('insufficient ' + cat + ' rooms (' + (cats[cat] || 0) + ')');
        });
      }
    }

    // 5. Ruin debris mounds clear of canals and outside base walls
    (P.debris || []).forEach(function (M) {
      if (Math.hypot(M.x, M.z) < D.APOTHEM_CARD + 4.0) fails.push(M.id + ' overlaps standing base');
      if (Math.abs(M.x) < 24 && M.z > 0) fails.push(M.id + ' blocks south aqueduct / tailrace canal');
      if (Math.abs(M.z) < 24 && Math.abs(M.x) > 40) fails.push(M.id + ' blocks east/west tailrace canal');
    });

    return { ok: fails.length === 0, fails: fails, rooms: roomCount, categories: cats };
  };
})();
