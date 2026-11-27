/* ================================================================= QOOLD LHEEK: the rules its layout keeps  [G data]
   Plain functions over QOOLD_LAYOUT (30-ql-layout.js) and KCITY.covered (core/city/36-city-covered.js), so Node tests,
   qoold_blueprint.py, the sim and Godot verify one plan. Every rule has a negative in tests/test-qoold-lheek.js.

     QOOLD.checks(L)        [{name, pass, detail}], one per rule
     QOOLD.coveredNet(L)    {ways, junctions} from KCITY.covered over every winterNet building's door
     QOOLD.groundAt(L,u,v)  height y (m above Cold Lake's 5,680.41 m surface) across the site landform
     QOOLD.area(L)          roof/floor area by part and by district
     QOOLD.toPx(L, u, v)    scale-model pixel [px, py] (u east +px, v north -py) */
if (typeof KCITY === 'undefined' && typeof require !== 'undefined') {
  require('../../../core/city/36-city-covered.js');
}
const QOOLD = (function () {
  'use strict';

  const corners = b => [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]];
  const centre = b => [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2];
  const overlap = (p, q, e) => Math.min(p[1], q[1]) - Math.max(p[0], q[0]) > e && Math.min(p[3], q[3]) - Math.max(p[2], q[2]) > e;
  const boxGap = (a, b) => Math.hypot(Math.max(0, a[0] - b[1], b[0] - a[1]), Math.max(0, a[2] - b[3], b[2] - a[3]));

  function inPoly(poly, p) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }

  function segHitsBox(ax, az, bx, bz, box, pad) {
    const x0 = box[0] - pad, x1 = box[1] + pad, z0 = box[2] - pad, z1 = box[3] + pad;
    const steps = Math.max(4, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.75));
    for (let k = 1; k < steps; k++) {
      const t = k / steps, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      if (x > x0 && x < x1 && z > z0 && z < z1) return true;
    }
    return false;
  }

  function segHitsZones(L, ax, az, bx, bz, badZones) {
    const steps = Math.max(4, Math.ceil(Math.hypot(bx - ax, bz - az) / 2.0));
    for (let k = 1; k < steps; k++) {
      const t = k / steps, p = [ax + (bx - ax) * t, az + (bz - az) * t];
      for (let i = 0; i < badZones.length; i++) {
        const z = L.zones[badZones[i]];
        if (z && inPoly(z.poly, p)) return true;
      }
    }
    return false;
  }

  /* Deterministic terrain surface y(u, v) in metres above Cold Lake (5,680.41 m ASL), harmonized with the 5.1 landform */
  function groundAt(L, u, v) {
    if (inPoly(L.zones.lake.poly, [u, v])) return 0;
    /* distance to the shoreline trend u - v = 220 and coulee spine u + 0.85*v = 160 */
    const shoreD = Math.max(0, 225 - (u - 0.85 * v));
    let y = Math.min(62, 2.5 + shoreD * 0.068);
    if (inPoly(L.zones.apron.poly, [u, v])) y = 4.2 + Math.max(0, 220 - u) * 0.032;
    else if (inPoly(L.zones.pasture.poly, [u, v])) y = 4.0 + Math.max(0, -v - 250) * 0.004 + Math.max(0, -u - 80) * 0.012;
    else if (inPoly(L.zones.state.poly, [u, v])) y = 21.6 + (v + 48) * 0.022;
    else if (inPoly(L.zones.town.poly, [u, v])) y = 13.5 + (v + 246) * 0.026 + Math.max(0, -u) * 0.014;
    else if (inPoly(L.zones.sunbench.poly, [u, v])) y = 26.0 + (-u - 198) * 0.042 + Math.max(0, v + 50) * 0.015;
    else if (inPoly(L.zones.watchbrow.poly, [u, v])) y = 48.0 + (-u - 468) * 0.055;
    else if (inPoly(L.zones.tombridge.poly, [u, v])) y = 48.5 + (u - 210 + v - 240) * 0.024;
    else if (inPoly(L.zones.northbank.poly, [u, v])) y = 17.5 + (u + v - 180) * 0.052;
    if (inPoly(L.zones.coulee.poly, [u, v])) y = Math.max(1.2, 2.0 + Math.max(0, 230 - u) * 0.041);
    return +y.toFixed(2);
  }

  /* Build the winter tunnel network across all `winterNet` buildings via core/city's KCITY.covered */
  function coveredNet(L) {
    const nodes = L.parts.filter(p => p.winterNet && p.door).map(p => ({ id: p.id, x: p.door[0], z: p.door[1] }));
    const boxes = L.parts.filter(p => p.level === 0).map(p => p.box);
    const blocked = (ax, az, bx, bz) => {
      for (let i = 0; i < boxes.length; i++) {
        if (segHitsBox(ax, az, bx, bz, boxes[i], 0.35)) return true;
      }
      return segHitsZones(L, ax, az, bx, bz, ['lake', 'coulee', 'pasture']);
    };
    return KCITY.covered(nodes, { w: 1.7, section: 'full', warmEvery: 80, endGap: 2.5, root: 'quunsul.hall', blocked: blocked });
  }

  /* Shortest angular difference in degrees (0..180) */
  function angDiff(a, b) {
    const d = Math.abs(((a - b) % 360 + 540) % 360 - 180);
    return d;
  }

  const RULES = {
    'every part, snow fence, leat, way and sight has a unique id': L => {
      const ids = [].concat(
        L.parts.map(p => p.id),
        L.snowFences.map(f => f.id),
        L.leats.map(l => l.id),
        L.ways.map(w => w.id),
        L.sights.map(s => s.id)
      );
      return ids.filter((x, i) => ids.indexOf(x) !== i).map(x => x + ' twice');
    },

    'every Yeti kit part uses a registered kit key and its exact (w, d) footprint': L => {
      const out = [];
      L.parts.forEach(p => {
        if (!p.kit) return;
        const K = L.kit[p.kit];
        if (!K) { out.push(p.id + ' unknown kit ' + p.kit); return; }
        const ew = p.turn === 'E' || p.turn === 'W';
        const wantW = ew ? K.d : K.w, wantD = ew ? K.w : K.d;
        const gotW = p.box[1] - p.box[0], gotD = p.box[3] - p.box[2];
        if (Math.abs(gotW - wantW) > 0.05 || Math.abs(gotD - wantD) > 0.05) {
          out.push(p.id + ' box ' + gotW.toFixed(2) + 'x' + gotD.toFixed(2) + ' != ' + wantW.toFixed(2) + 'x' + wantD.toFixed(2));
        }
      });
      return out;
    },

    'every part stands wholly inside its terrain zone (and town parts stay outside state)': L => {
      const out = [];
      L.parts.forEach(p => {
        const Z = L.zones[p.zone];
        if (!Z) { out.push(p.id + ' unknown zone ' + p.zone); return; }
        if (!corners(p.box).every(c => inPoly(Z.poly, c))) out.push(p.id + ' spills out of ' + p.zone);
        if (p.zone === 'town' && corners(p.box).some(c => inPoly(L.zones.state.poly, c))) {
          out.push(p.id + ' intrudes into state terrace');
        }
      });
      return out;
    },

    'no two parts on the same level overlap': L => {
      const out = [], ps = L.parts;
      ps.forEach((p, i) => {
        ps.forEach((q, j) => {
          if (j > i && p.level === q.level && overlap(p.box, q.box, 0.08)) out.push(p.id + ' overlaps ' + q.id);
        });
      });
      return out;
    },

    'permafrost & flood rule: no heated building stands on thaw-unstable ground or lacks a ventilated plinth': L => {
      const out = [];
      L.parts.forEach(p => {
        if (!p.heated) return;
        const Z = L.zones[p.zone];
        if (!Z || !Z.thawStable || Z.flood) out.push(p.id + ' is heated on unstable/flood zone ' + p.zone);
        if (p.plinth !== 'ventilated_gravel') out.push(p.id + ' lacks ventilated_gravel plinth (' + p.plinth + ')');
      });
      return out;
    },

    'ice & pycrete rule: quarries sit on Cold Lake ice (y <= 0.5) and pycrete works sit on the apron near ice & aufeis': L => {
      const out = [];
      const quarries = L.parts.filter(p => p.kit === 'yt_ice_quarry');
      const aufeis = L.parts.find(p => p.id === 'aufeis.yard');
      if (!quarries.length || !aufeis) return ['missing ice quarry or aufeis yard'];
      quarries.forEach(q => {
        if (q.zone !== 'lake' || q.y > 0.5) out.push(q.id + ' not on lake ice (zone=' + q.zone + ', y=' + q.y + ')');
      });
      L.parts.filter(p => p.kit === 'yt_pycrete_works').forEach(pw => {
        if (pw.zone !== 'apron') out.push(pw.id + ' not on lakefront gravel apron');
        const c = centre(pw.box), ca = centre(aufeis.box);
        const dq = Math.min(...quarries.map(q => { const cq = centre(q.box); return Math.hypot(c[0] - cq[0], c[1] - cq[1]); }));
        const da = Math.hypot(c[0] - ca[0], c[1] - ca[1]);
        if (dq > 145) out.push(pw.id + ' is ' + Math.round(dq) + ' m from lake-ice quarry (>145 m)');
        if (da > 205) out.push(pw.id + ' is ' + Math.round(da) + ' m from coulee aufeis (>205 m)');
      });
      return out;
    },

    'southern-hemisphere sun rule (27.8S, sun in north): crops & windows face north; ice cellars & larch take shaded south slopes': L => {
      const out = [];
      L.parts.forEach(p => {
        const Z = L.zones[p.zone];
        if (!Z) return;
        if (p.id.indexOf('crop.') === 0 && (Z.aspect !== 'N' || p.windowAspect !== 'N')) {
          out.push(p.id + ' crop pocket not on north-aspect sunbench');
        }
        if (p.kit === 'yt_ice_cellar' && (Z.aspect !== 'S' || p.windowAspect !== 'S')) {
          out.push(p.id + ' ice cellar not on shaded south-facing slope');
        }
        if (p.id === 'larch.coppice' && Z.aspect !== 'S') {
          out.push('larch.coppice not on shaded snow-holding south-facing slope');
        }
        if (p.heated && p.windowAspect !== 'N') {
          out.push(p.id + ' heated room ice-lens does not face the northern sun (' + p.windowAspect + ')');
        }
      });
      return out;
    },

    'katabatic wind & snow-drift rule: no door faces into the 300 deg WNW gale and no part stands in a snow-fence drift band': L => {
      const out = [], wind = L.frame.katabaticFromDeg;
      L.parts.forEach(p => {
        if (p.doorYaw != null && angDiff(p.doorYaw, wind) < 42) {
          out.push(p.id + ' doorYaw ' + p.doorYaw + ' faces into ' + wind + ' deg katabatic wind');
        }
        L.snowFences.forEach(f => {
          if (overlap(p.box, f.driftBox, 0.05)) out.push(p.id + ' stands inside leeward snow-drift band of ' + f.id);
        });
      });
      return out;
    },

    'smell & smoke rule: every tannery stands downwind (east/south-east) of the State Heart and clan seats': L => {
      const out = [];
      const seats = L.parts.filter(p => p.zone === 'state' || p.kit === 'yt_clan_compound');
      L.parts.filter(p => p.kit === 'yt_tannery').forEach(t => {
        const tc = centre(t.box);
        seats.forEach(s => {
          const sc = centre(s.box);
          /* Wind blows FROM 300 deg WNW TOWARD 120 deg ESE (+0.866 u, -0.5 v): tannery must lie leeward along wind vector */
          const along = (tc[0] - sc[0]) * 0.866 + (tc[1] - sc[1]) * (-0.5);
          if (along < 35) out.push(t.id + ' is not safely downwind of ' + s.id + ' (along=' + Math.round(along) + ' m)');
        });
      });
      return out;
    },

    'shared thermal-mass rule: every bathhouse stands within 5 m of a smithy or civic hall to share waste heat': L => {
      const out = [];
      const partners = L.parts.filter(p => p.kit === 'yt_smithy' || p.kit === 'yt_quunsul_hall' || p.kit === 'yt_kitchen_house');
      L.parts.filter(p => p.kit === 'yt_bathhouse').forEach(b => {
        const d = Math.min(...partners.map(q => boxGap(b.box, q.box)));
        if (d > 5.0) out.push(b.id + ' stands ' + d.toFixed(1) + ' m from nearest heat partner (>5 m)');
      });
      return out;
    },

    'winter covered-way rule (KCITY.covered): every winterNet building joins one unblocked tunnel tree with warming domes': L => {
      const out = [];
      const want = L.parts.filter(p => p.winterNet);
      if (want.length < 30) out.push('fewer than 30 winterNet buildings (' + want.length + ')');
      want.forEach(p => { if (!p.door) out.push(p.id + ' winterNet lacks door'); });
      const net = coveredNet(L);
      net.ways.forEach(w => { if (w.blocked) out.push(w.id + ' (' + w.a + ' -> ' + w.b + ') is blocked by a building or wet zone'); });
      /* Verify graph connectivity from quunsul.hall across net.ways */
      const adj = {};
      net.ways.forEach(w => {
        (adj[w.a] = adj[w.a] || []).push(w.b);
        (adj[w.b] = adj[w.b] || []).push(w.a);
      });
      const seen = new Set(['quunsul.hall']), q = ['quunsul.hall'];
      while (q.length) {
        const cur = q.shift();
        (adj[cur] || []).forEach(nx => { if (!seen.has(nx)) { seen.add(nx); q.push(nx); } });
      }
      want.forEach(p => { if (!seen.has(p.id)) out.push(p.id + ' unreachable in KCITY.covered network'); });
      const longWays = net.ways.filter(w => w.len >= 80);
      const warmings = net.junctions.filter(j => j.kind === 'warming');
      if (longWays.length > 0 && warmings.length < longWays.length) {
        out.push('long tunnel runs lack warming domes (' + warmings.length + ' for ' + longWays.length + ')');
      }
      return out;
    },

    'funerary & seven-clans rule: each of the seven clans has one corbelled tomb on dry bedrock above +46 m': L => {
      const out = [];
      const tombs = L.parts.filter(p => p.kit === 'yt_clan_tomb');
      if (tombs.length !== L.clans.length) out.push('expected ' + L.clans.length + ' clan tombs, got ' + tombs.length);
      L.clans.forEach(c => {
        if (!tombs.some(t => t.clan === c)) out.push('clan ' + c + ' has no tomb');
      });
      tombs.forEach(t => {
        if (t.zone !== 'tombridge' || t.y < 46) out.push(t.id + ' not on dry tombridge above +46 m (zone=' + t.zone + ', y=' + t.y + ')');
      });
      return out;
    },

    'watch & sightline rule: every required sightline from a watch tower or cairn clears terrain by 12 m or more': L => {
      const out = [];
      L.sights.filter(s => s.must).forEach(s => {
        const src = L.parts.find(p => p.id === s.from);
        if (!src) out.push(s.id + ' missing watch post ' + s.from);
        if (!(s.clear >= 12)) out.push(s.id + ' clear by ' + s.clear + ' m (<12 m)');
      });
      return out;
    },

    'everyone has a warm place to sleep: the parts account for all 2,200 permanent citizens': L => {
      const got = {}, out = [], n = k => got[k] == null ? 0 : got[k];
      L.parts.forEach(p => Object.keys(p.sleeps == null ? {} : p.sleeps).forEach(k => { got[k] = n(k) + p.sleeps[k]; }));
      Object.keys(L.census).forEach(k => {
        if (n(k) !== L.census[k]) out.push(k + ': ' + n(k) + ' places for ' + L.census[k]);
      });
      Object.keys(got).filter(k => L.census[k] == null).forEach(k => out.push(k + ' not in census'));
      const total = Object.keys(L.census).reduce((a, k) => a + L.census[k], 0);
      if (total !== L.urbanPop) out.push('census sums to ' + total + ', not ' + L.urbanPop);
      return out;
    }
  };

  function checks(L) {
    return Object.keys(RULES).map(name => {
      const f = RULES[name](L);
      return { name: name, pass: f.length === 0, detail: f.join('; ') };
    });
  }

  function area(L) {
    const byZone = {}, byRole = {};
    let enclosed = 0;
    const OPEN = ['garden', 'quarry', 'court', 'drill', 'cistern'];
    L.parts.forEach(p => {
      if (OPEN.indexOf(p.kind) >= 0) return;
      const a = (p.box[1] - p.box[0]) * (p.box[3] - p.box[2]) * (p.circ ? Math.PI / 4 : 1);
      byZone[p.zone] = (byZone[p.zone] == null ? 0 : byZone[p.zone]) + a;
      byRole[p.kind] = (byRole[p.kind] == null ? 0 : byRole[p.kind]) + a;
      enclosed += a;
    });
    Object.keys(byZone).forEach(k => { byZone[k] = Math.round(byZone[k]); });
    Object.keys(byRole).forEach(k => { byRole[k] = Math.round(byRole[k]); });
    return { enclosed: Math.round(enclosed), byZone: byZone, byRole: byRole };
  }

  function toPx(L, u, v) {
    const mPerPx = L.frame.kmPerPx * 1000;
    return [+(L.frame.px[0] + u / mPerPx).toFixed(4), +(L.frame.px[1] - v / mPerPx).toFixed(4)];
  }

  return { RULES, checks, coveredNet, groundAt, area, toPx, inPoly, boxGap };
})();
if (typeof module !== 'undefined') module.exports = QOOLD;
