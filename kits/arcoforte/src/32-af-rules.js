/* ================================================================= ARCOFORTE — invariants & rules ([G data])
   Plain functions over the layout (`ARCOFORTE.plan`) and interior records (`AF_INT.buildPlans`).
   Run identically in Node (`tests/test-arcoforte.js`), blueprint generation (`arcoforte_blueprint.py`), and the browser
   (`verify.py --assert` via `hostChecks` / `hostNegatives`). No Three.js, no DOM. */
const AF_RULES = (function () {
  'use strict';
  const VALID_STATES = { refurbished: 1, intact: 1, ruined: 1 };
  const VALID_SECTORS = { living: 1, work: 1, rec: 1, infra: 1 };

  function aabbOf(s) {
    if (s[0] === 'box') return [s[1], s[2], s[3], s[4]];
    const r = s[3];
    return [s[1] - r, s[1] + r, s[2] - r, s[2] + r];
  }

  function boxesOverlap(a, b, tol) {
    const t = tol == null ? 0.5 : tol;
    return a[0] + t < b[1] - t && b[0] + t < a[1] - t && a[2] + t < b[3] - t && b[2] + t < a[3] - t;
  }

  function checks(P, built) {
    const out = [];
    const push = (name, pass, detail) => out.push({ name: name, pass: !!pass, detail: String(detail || '') });

    /* 1. Unique stable part ids & valid states */
    const seen = {}, badState = [], dup = [];
    (P.parts || []).forEach(p => {
      if (!p.id || seen[p.id]) dup.push(p.id || '(empty)');
      seen[p.id] = 1;
      if (!VALID_STATES[p.state]) badState.push(p.id + ':' + p.state);
    });
    push('unique part ids and valid states', dup.length === 0 && badState.length === 0 && P.parts.length >= 30,
      P.parts.length + ' parts, dups ' + dup.length + ', bad states ' + badState.length);

    /* 2. Seven cliff skyscrapers stand on the sea-cliff plinth band, do not overlap each other, and meet the 300 m Sky-Crown */
    const T = P.towers || [], towBad = [];
    if (T.length !== 7) towBad.push('count ' + T.length);
    for (let i = 0; i < T.length; i++) {
      const ti = T[i];
      if (!(ti.yBase >= 20 && ti.yBase <= 60)) towBad.push(ti.id + ' base ' + ti.yBase);
      if (ti.yTop !== P.skyCrown.y0) towBad.push(ti.id + ' top ' + ti.yTop + ' != crown ' + P.skyCrown.y0);
      for (let j = i + 1; j < T.length; j++) {
        const tj = T[j], d = Math.hypot(ti.x - tj.x, ti.z - tj.z);
        if (d < 34) towBad.push(ti.id + '/' + tj.id + ' dist ' + d.toFixed(1));
      }
    }
    const peakOk = P.skyCrown && P.skyCrown.top === 300;
    push('seven sea-cliff skyscrapers meet the 300 m sky-crown without overlap', towBad.length === 0 && peakOk,
      T.length + ' towers, crown top ' + (P.skyCrown && P.skyCrown.top) + ' m' + (towBad.length ? '; ' + towBad.join(', ') : ''));

    /* 3. Nine battered bastions, 13 skylight wells inside the City Center ring, 6 belvederes, and Rotunda clear of ring */
    const B = P.bastions || [], SK = (P.cityCenter && P.cityCenter.skylights) || [], PV = (P.promenade && P.promenade.pavilions) || [];
    const ringBad = [];
    if (B.length !== 9) ringBad.push('bastions ' + B.length);
    if (SK.length !== 13) ringBad.push('skylights ' + SK.length);
    if (PV.length !== 6) ringBad.push('pavilions ' + PV.length);
    SK.forEach(s => {
      const rr = Math.hypot(s.x - P.dim.RING_CX, s.z - P.dim.RING_CZ);
      if (rr - s.size / 2 < P.dim.R_IN || rr + s.size / 2 > P.dim.R_MID) ringBad.push(s.id + ' off city ring r=' + rr.toFixed(1));
    });
    /* Rotunda must not collide with any tower or Linear City bar */
    const rot = P.rotunda;
    T.forEach(t => {
      if (Math.hypot(t.x - rot.x, t.z - rot.z) < rot.R + t.d / 2 + 6) ringBad.push('rotunda hits ' + t.id);
    });
    push('horseshoe neocliff geometry (9 bastions, 13 oculus skylights, 6 belvederes, rotunda clear)', ringBad.length === 0,
      B.length + ' bastions, ' + SK.length + ' skylights, ' + PV.length + ' belvederes' + (ringBad.length ? '; ' + ringBad.join(', ') : ''));

    /* 4. Coarse walk graph connects every part from BOTH the Sea Harbour (`af.harbour.platform`) and Land Gate (`af.linear.drum.2`) */
    const adj = {};
    (P.parts || []).forEach(p => { adj[p.id] = []; });
    (P.links || []).forEach(e => {
      if (adj[e[0]] && adj[e[1]]) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); }
    });
    function bfsFrom(start) {
      const vis = {}, q = [start];
      if (adj[start]) vis[start] = 1;
      while (q.length) {
        const u = q.shift();
        (adj[u] || []).forEach(v => { if (!vis[v]) { vis[v] = 1; q.push(v); } });
      }
      return (P.parts || []).filter(p => !vis[p.id]).map(p => p.id);
    }
    const missSea = bfsFrom('af.harbour.platform'), missLand = bfsFrom('af.linear.drum.2');
    push('every zone reachable from both the sea harbour and the linear-city land gate',
      missSea.length === 0 && missLand.length === 0,
      'missed from sea: ' + missSea.length + ', from land: ' + missLand.length);

    /* 5. Waterway stream monotonically falls from Linear City -> Park Pools -> Cliff Sluice -> Ocean */
    const sw = (P.ways || []).find(w => w.id === 'af.way.stream');
    let waterMono = !!(sw && sw.pts && sw.pts.length >= 4);
    if (waterMono) {
      for (let i = 1; i < sw.pts.length; i++) {
        if (!(sw.pts[i][2] < sw.pts[i - 1][2])) waterMono = false;
      }
      if (!(P.park.sluice.yLip <= sw.pts[sw.pts.length - 1][2] + 0.2 && P.park.sluice.yToe < 3 && P.park.sluice.yToe > 0)) waterMono = false;
    }
    push('waterways descend monotonically from linear canal through park pools to sea cascade', waterMono,
      sw ? ('head ' + sw.pts[0][2] + ' m -> lip ' + P.park.sluice.yLip + ' m -> toe ' + P.park.sluice.yToe + ' m') : 'no stream');

    /* 6. Linear City bars do not overlap central canal or each other; sub-cliff works and automated vaults sit on the bench */
    const lb = P.linearCity ? P.linearCity.bars : [];
    const linOk = lb.length === 2 && !boxesOverlap(aabbOf(['box', lb[0].x0, lb[0].x1, lb[0].z0, lb[0].z1]), aabbOf(['box', lb[1].x0, lb[1].x1, lb[1].z0, lb[1].z1]), 0) &&
      Math.abs(ARCOFORTE.groundAt(P, 0, -225) - P.dim.BENCH) < 0.5;
    push('linear city spine clear of canal and sub-cliff halls seated on harbour bench', linOk,
      'bench y=' + ARCOFORTE.groundAt(P, 0, -225).toFixed(2) + ' m');

    /* 7. Interior plans (when supplied): all 3 settlement sectors (living, work, rec) planned, valid sectors, peak ~20,000 */
    if (built && built.units) {
      const A = AF_INT.areaSummary(P, built);
      const badSec = [];
      built.units.forEach(u => u.storeys.forEach(st => st.rooms.forEach(r => {
        if (!VALID_SECTORS[r.sector]) badSec.push(r.id + ':' + r.sector);
      })));
      const hasSectors = A.bySectorM2.living > 120000 && A.bySectorM2.work > 60000 && A.bySectorM2.rec > 25000;
      const popInBand = A.peakPopulation >= 16000 && A.peakPopulation <= 24500;
      const refurbVaultSealed = P.state !== 'refurbished' || (built.units.find(u => u.id === 'auto_vaults') && !built.units.find(u => u.id === 'auto_vaults').kept &&
        built.units.filter(u => u.id !== 'auto_vaults').every(u => u.kept));
      push('interiors cover living, work, and rec in Soleri 20k population band with refurbished sealing rule',
        badSec.length === 0 && hasSectors && popInBand && refurbVaultSealed && built.units.length === 12,
        'gross ' + A.grossM2 + ' m2 (living ' + A.bySectorM2.living + ', work ' + A.bySectorM2.work + ', rec ' + A.bySectorM2.rec +
        '), peak pop ' + A.peakPopulation + ', refurb pop ' + A.refurbishedPopulation);
    }

    return out;
  }

  const API = { checks, aabbOf, boxesOverlap };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  return API;
})();
