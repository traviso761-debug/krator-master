/* ================================================================= THE FLASHING EYE: the rules its layout keeps, and its ground  [G data]
   Plain functions over FE_LAYOUT (30-fe-layout.js), so Godot, the sim, the sheets and the page read one plan. Each rule has a
   negative in test-flashing-eye.js: a copy of the layout broken in that one way must fail it.

     FLASHING_EYE.checks(L)            [{name, pass, detail}], one per rule
     FLASHING_EYE.reach(L, from, skip) the zones reached from `from` through the gates and the ways, never by the way `skip`
     FLASHING_EYE.area(L)              floor area by part (box x storeys), and the bench's total
     FLASHING_EYE.water(L)             {roof, paved, supply, need, store} m2 and m3 a year
     FLASHING_EYE.toPx(L, u, v)        a frame point on the scale model (px; u runs south, v east)
     FLASHING_EYE.ground(L, u, v, m)   the page's ground (frame y) over the model's `m` there: the bench filled to its level (and
                                       cut level inside the precinct), the band's face, talus and apron cut in front of the Lip,
                                       the crater's rampart and bowl. Sign-safe outside the precinct: behind the Lip it only
                                       raises, in front only lowers; it meets the model at its edges */
const FLASHING_EYE = (function () {
  'use strict';
  const segDist = (p, a, b) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz;
    const t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2)) : 0;
    return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t);
  };
  const inPoly = (poly, p) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  };
  const corners = b => [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]];
  const centre = b => [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2];
  const overlap = (p, q, e) => Math.min(p[1], q[1]) - Math.max(p[0], q[0]) > e && Math.min(p[3], q[3]) - Math.max(p[2], q[2]) > e;
  const sm = (a, b, x) => { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
  const lipU = (L, v) => -L.band.lipK * v * v;
  const ON_WALL = ['gatehouse', 'corner_tower'];
  const OPEN = ['court', 'terrace', 'threshing', 'midden', 'tank', 'chorten', 'hives', 'cave', 'stair_way'];
  const GOLD = { crown: 'hosted', sanctum: 'ember_hall' };
  const inWall = (b, w) => {
    const n = Math.max(1, Math.ceil(Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) / 0.25)), e = w.t / 2 - 0.05;
    for (let k = 0; k <= n; k++) {
      const p = [w.a[0] + (w.b[0] - w.a[0]) * k / n, w.a[1] + (w.b[1] - w.a[1]) * k / n];
      if (p[0] > b[0] - e && p[0] < b[1] + e && p[1] > b[2] - e && p[1] < b[3] + e) return true;
    }
    return false;
  };
  /* the terrace's level at u (behind the Lip): the precinct steps up the slope; north of it the upper terrace's level */
  const terraceY = (L, u) => { const T = L.terraces == null ? [] : L.terraces; for (const t of T) if (u >= t.u0 && u < t.u1) return t.y; return T.length && u < T[T.length - 1].u0 ? T[T.length - 1].y : 0; };
  const segX = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
  /* the Way of Shrines' bridges: [from [u, v, y], to [u, v, y], span (m, in plan), rise] */
  function bridges(L) {
    const B = L.bridgeway; if (!B) return [];
    const out = [], S = B.stacks;
    for (let i = 0; i < S.length; i++) {
      const a = [S[i].u, S[i].v, S[i].top], b = i + 1 < S.length ? [S[i + 1].u, S[i + 1].v, S[i + 1].landing] : [B.end.at[0], B.end.at[1], B.end.y];
      out.push({ from: S[i].id, to: i + 1 < S.length ? S[i + 1].id : B.end.gate, a, b, span: Math.hypot(b[0] - a[0], b[1] - a[1]), rise: b[2] - a[2] });
    }
    return out;
  }
  /* the spur's spine: [u, v, crest] from its nose through each stack's landing and each bridge's notch into the Lip under the gate */
  function spine(L) {
    const B = L.bridgeway; if (!B || !B.spur) return [];
    const S = B.stacks, SP = B.spur, br = bridges(L), out = [];
    const c0 = S[0].landing - SP.crestBelow, dn = Math.hypot(SP.nose[0] - S[0].u, SP.nose[1] - S[0].v);
    out.push([SP.nose[0], SP.nose[1], c0 - 0.55 * dn]);
    S.forEach((st, i) => {
      const c = st.landing - SP.crestBelow, b = br[i], deck = (b.a[2] + b.b[2]) / 2 - B.sagK * b.span;
      const cn = i + 1 < S.length ? S[i + 1].landing - SP.crestBelow : B.end.y - 2;
      out.push([st.u, st.v, c]);
      out.push([(b.a[0] + b.b[0]) / 2, (b.a[1] + b.b[1]) / 2, Math.min(deck - SP.notch, (c + cn) / 2)]);
    });
    out.push([B.end.at[0] + 3, B.end.at[1], B.end.y - 2]);
    return out;
  }
  /* the spur's surface over (u, v) on ground `base`: the crest, the flanks at `flank`, the talus fan; -Infinity off it */
  function spurY(L, u, v, base, SPN) {
    const SP = L.bridgeway && L.bridgeway.spur; if (!SP) return -Infinity;
    const P = SPN == null ? spine(L) : SPN; let best = -Infinity;
    for (let i = 0; i + 1 < P.length; i++) {
      const a = P[i], b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
      const t = l2 ? Math.max(0, Math.min(1, ((u - a[0]) * dx + (v - a[1]) * dz) / l2)) : 0, d = Math.hypot(u - a[0] - dx * t, v - a[1] - dz * t);
      if (d > 260) continue;
      const crest = a[2] + (b[2] - a[2]) * t, H = crest - base; if (H <= 0) continue;
      const y1 = crest - SP.flank * Math.max(0, d - SP.crestW / 2);
      const y2 = base + SP.talusFrac * H - SP.talusSlope * Math.max(0, d - (SP.crestW / 2 + (1 - SP.talusFrac) * H / SP.flank));
      best = Math.max(best, Math.min(crest, Math.max(y1, y2)));
    }
    return best;
  }
  const wayLen = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
  const near = (a, b, e) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= e;
  const inBox = (p, b, e) => p[0] >= b[0] - e && p[0] <= b[1] + e && p[1] >= b[2] - e && p[1] <= b[3] + e;

  function reach(L, from, skip) {
    const seen = new Set([from]), q = [from];
    const edges = L.gates.map(g => [g.from, g.to]).concat(L.links.filter(k => k.way !== skip).map(k => [k.from, k.to]));
    while (q.length) {
      const z = q.shift();
      edges.forEach(([a, b]) => { const o = a === z ? b : b === z ? a : null; if (o && !seen.has(o)) { seen.add(o); q.push(o); } });
    }
    return seen;
  }

  function water(L) {
    let roof = 0, paved = 0;
    L.parts.filter(p => p.zone === 'bench').forEach(p => {
      const a = (p.box[1] - p.box[0]) * (p.box[3] - p.box[2]) * (p.circ ? Math.PI / 4 : 1);
      if (p.kind === 'court') paved += a; else if (OPEN.indexOf(p.kind) < 0) roof += a;
    });
    const W = L.water, bench = L.benchGroups.reduce((s, k) => s + L.census[k], 0);
    const supply = (roof + paved) * W.rainM * W.runoff, need = (bench + W.guestsAvg) * W.litresDay / 1000 * 365;
    const store = W.cisterns.reduce((s, c) => s + c.m3, 0);
    return { roof: Math.round(roof), paved: Math.round(paved), supply: Math.round(supply), need: Math.round(need), store };
  }

  const RULES = {
    'every part, wall, gate and way has a unique id': L => {
      const ids = [].concat(L.parts.map(p => p.id), L.walls.map(w => w.id), L.gates.map(g => g.id), L.ways.map(w => w.id));
      return ids.filter((x, i) => ids.indexOf(x) !== i).map(x => x + ' twice');
    },
    'every part stands in its zone': L => L.parts.filter(p => {
      if (ON_WALL.indexOf(p.kind) >= 0) return !L.walls.some(w => segDist(centre(p.box), w.a, w.b) < 1.5);
      const poly = L.zones[p.zone]; if (!poly) return true;
      return !corners(p.box).every(c => inPoly(poly, c));
    }).map(p => p.id + ' is not in ' + p.zone),
    'no two parts on one level overlap': L => {
      const out = [];
      L.parts.forEach((p, i) => L.parts.forEach((q, j) => { if (j > i && p.level === q.level && overlap(p.box, q.box, 0.1)) out.push(p.id + ' overlaps ' + q.id); }));
      return out;
    },
    'no building stands in a wall': L => {
      const out = [];
      L.parts.forEach(p => { if (ON_WALL.indexOf(p.kind) < 0 && p.level === 0 && p.range !== 'lip') L.walls.forEach(w => { if (inWall(p.box, w)) out.push(p.id + ' stands in ' + w.id); }); });
      return out;
    },
    'every gate is on its wall': L => L.gates.filter(g => { const w = L.walls.find(x => x.id === g.wall); return !w || segDist(g.at, w.a, w.b) > 1; }).map(g => g.id + ' is off ' + g.wall),
    'every zone is reached from the Foot House, and the mules reach the bench without the Way of Shrines': L => {
      const out = [], all = reach(L, 'foot', null);
      Object.keys(L.zones).filter(z => !all.has(z)).forEach(z => out.push(z + ' is reached by no gate or way'));
      if (!reach(L, 'foot', 'bridges').has('bench')) out.push('the mules can reach the bench only over the rope bridges');
      if (!reach(L, 'bench', null).has('rim')) out.push('the rim is not reached from the bench');
      return out;
    },
    'the hosted monastery stands clear of the precinct wall by 4 m, its gate to the south': L => {
      const m = L.parts.find(p => p.kind === 'hosted'); if (!m) return ['no hosted monastery'];
      const out = [];
      if (!m.host || m.host.front !== 'south') out.push('the monastery does not face the Rift');
      L.walls.forEach(w => { const d = Math.min(...corners(m.box).map(c => segDist(c, w.a, w.b))) - w.t / 2; if (d < 4 - 1e-6) out.push('the monastery ' + d.toFixed(1) + ' m from ' + w.id); });
      return out;
    },
    'the Lip Range stands on the Lip, about 120 m long': L => {
      const R = L.parts.filter(p => p.range === 'lip'); if (!R.length) return ['no Lip Range'];
      const out = [], v0 = Math.min(...R.map(p => p.box[2])), v1 = Math.max(...R.map(p => p.box[3]));
      if (v1 - v0 < 110 || v1 - v0 > 130) out.push('the range is ' + (v1 - v0) + ' m long');
      R.forEach(p => [p.box[2], p.box[3]].forEach(v => { const d = Math.abs(p.box[1] - lipU(L, v)); if (d > 3) out.push(p.id + '\'s front stands ' + d.toFixed(1) + ' m off the Lip at v ' + v); }));
      return out;
    },
    'nothing within 12 m of the Lip but the Lip Range and its gate': L => L.parts.filter(p => p.zone === 'bench' && p.range !== 'lip' && !p.onLip && ON_WALL.indexOf(p.kind) < 0 && corners(p.box).some(c => c[0] > lipU(L, c[1]) - 12)).map(p => p.id + ' is within 12 m of the Lip'),
    'the Hall of the Ember stands on the axis, north of the monastery, toward the crater': L => {
      const e = L.parts.find(p => p.kind === 'ember_hall'), m = L.parts.find(p => p.kind === 'hosted'); if (!e || !m) return ['no Hall of the Ember or no monastery'];
      const ce = centre(e.box), cm = centre(m.box), out = [];
      if (Math.abs(ce[1] - cm[1]) > 2) out.push('the hall is ' + (ce[1] - cm[1]).toFixed(1) + ' m off the axis');
      if (!(ce[0] < m.box[0])) out.push('the hall is not north of the monastery');
      const b = Math.atan2(L.crater.centre[1] - ce[1], -(L.crater.centre[0] - ce[0])) * 180 / Math.PI;
      if (Math.abs(b) > 3) out.push('the crater stands ' + b.toFixed(1) + ' deg off the hall\'s north window');
      return out;
    },
    'no building in the crater; the rim\'s buildings stand on its rim': L => {
      const C = L.crater, out = [];
      L.parts.forEach(p => {
        const d = Math.min(...corners(p.box).map(c => Math.hypot(c[0] - C.centre[0], c[1] - C.centre[1])));
        if (d < C.r - 10) out.push(p.id + ' stands ' + (C.r - d).toFixed(0) + ' m inside the crater');
        if (p.zone === 'rim' && d > C.r + 80) out.push(p.id + ' is ' + (d - C.r).toFixed(0) + ' m off the rim');
      });
      return out;
    },
    'the ways climb at 10 % or less, the Cleft Stair excepted': L => {
      const out = [];
      L.ways.filter(w => !w.steep).forEach(w => {
        for (let i = 1; i < w.pts.length; i++) {
          const a = w.pts[i - 1], b = w.pts[i], run = Math.hypot(b[0] - a[0], b[1] - a[1]), g = run > 0 ? Math.abs(b[2] - a[2]) / run : 0;
          if (g > 0.1 + 1e-9) { out.push(w.id + ' climbs ' + (g * 100).toFixed(1) + ' % at its leg ' + i); return; }
        }
      });
      return out;
    },
    'each way joins what it serves': L => {
      const out = [], way = id => L.ways.find(w => w.id === id), part = id => L.parts.find(p => p.id === id), gate = id => L.gates.find(g => g.id === id);
      const ends = [['breath', gate('gate.breath').at, part('threshold').box], ['bridges', part('stairhead').box, gate('gate.rift').at],
        ['mule', part('stairhead').box, gate('gate.mule').at], ['stair', part('foothouse').box, part('stairhead').box]];
      ends.forEach(([id, a, b]) => {
        const w = way(id); if (!w) { out.push('no way ' + id); return; }
        const p0 = w.pts[0], p1 = w.pts[w.pts.length - 1], hit = (p, t) => t.length === 4 ? inBox(p, t, 8) : near(p, t, 8);
        if (!hit(p0, a) || !hit(p1, b)) out.push(id + ' does not run from its start to its end');
      });
      return out;
    },
    'the pilgrims\' way stops at the Threshold Chorten, outside the rim\'s fumes': L => {
      const out = [], C = L.crater, th = L.parts.find(p => p.id === 'threshold');
      if (!th) return ['no Threshold Chorten'];
      const dt = Math.hypot(centre(th.box)[0] - C.centre[0], centre(th.box)[1] - C.centre[1]);
      if (dt < C.r + 25) out.push('the Threshold Chorten is ' + (dt - C.r).toFixed(0) + ' m from the rim');
      L.ways.filter(w => w.pilgrims).forEach(w => w.pts.forEach(p => { if (Math.hypot(p[0] - C.centre[0], p[1] - C.centre[1]) < dt - 6) out.push(w.id + ' takes pilgrims past the Threshold'); }));
      return out.filter((x, i, a) => a.indexOf(x) === i);
    },
    'the balcony and the Eye Post see every station the Order must reach, by 10 m or more': L => {
      const out = [];
      Object.keys(L.sights).forEach(k => L.sights[k].list.filter(s => s.must && !(s.clear >= 10)).forEach(s => out.push(k + ': ' + s.name + ' clear by ' + s.clear + ' m')));
      return out;
    },
    'a station the Eye cannot see is reached through one it sees': L => {
      const out = [];
      Object.keys(L.sights).forEach(k => { const S = L.sights[k].list;
        S.filter(s => s.via != null).forEach(s => { const v = S.find(x => x.id === s.via) || L.sights.post.list.find(x => x.id === s.via);
          const viaOk = v && (v.clear >= 10 || (v.via != null && S.concat(L.sights.post.list).some(x => x.id === v.via && x.clear >= 10)));
          if (!viaOk) out.push(k + ': ' + s.name + ' via ' + s.via + ', which is not seen'); }); });
      return out;
    },
    'the line carries every message the Order sends: each hop clear by 10 m': L => {
      const out = [], H = L.line.hops;
      H.filter(h => !(h.clear >= 10)).forEach(h => out.push(h.a + ' to ' + h.b + ' clear by ' + h.clear + ' m'));
      const linked = (a, b) => { const seen = new Set([a]), q = [a]; while (q.length) { const z = q.shift(); H.filter(h => h.clear >= 10).forEach(h => { const o = h.a === z ? h.b : h.b === z ? h.a : null; if (o && !seen.has(o)) { seen.add(o); q.push(o); } }); } return seen.has(b); };
      L.line.must.forEach(([a, b]) => { if (!linked(a, b)) out.push('no line from ' + a + ' to ' + b); });
      return out;
    },
    'no oil burned on the mountain: every fire is lit from the Ember': L => L.parts.filter(p => (p.fire != null && p.fire !== 'ember' && p.fire !== 'juniper') || ['generator', 'oil_pit', 'butter_lamps'].indexOf(p.kind) >= 0).map(p => p.id + ' burns ' + (p.fire == null ? p.kind : p.fire)),
    'the roof water covers the year and the cisterns a season': L => {
      const W = water(L), out = [];
      if (W.supply < W.need) out.push('the roofs give ' + W.supply + ' m3 for a need of ' + W.need);
      if (W.store < W.need * L.water.reserveDays / 365) out.push('the cisterns hold ' + W.store + ' m3, under ' + L.water.reserveDays + ' days');
      return out;
    },
    'gold only on the Assembly Hall\'s crown and the Hall of the Ember\'s sanctum': L => L.parts.filter(p => p.gold && GOLD[p.gold] !== p.kind).map(p => p.id + ' is gilt (' + p.gold + ')'),
    'everyone has a bed: 280 on the bench and 40 at the Foot House': L => {
      const got = {}, out = [], n = k => got[k] == null ? 0 : got[k];
      L.parts.forEach(p => Object.keys(p.sleeps == null ? {} : p.sleeps).forEach(k => { got[k] = n(k) + p.sleeps[k]; }));
      Object.keys(L.census).forEach(k => { if (n(k) !== L.census[k]) out.push(k + ': ' + n(k) + ' beds for ' + L.census[k]); });
      Object.keys(got).filter(k => L.census[k] == null).forEach(k => out.push(k + ' sleeps here but is not in the census'));
      const sum = gs => gs.reduce((a, k) => a + L.census[k], 0);
      if (sum(L.benchGroups) !== 280) out.push('the bench holds ' + sum(L.benchGroups) + ', not 280');
      if (sum(L.footGroups) !== 40) out.push('the Foot House holds ' + sum(L.footGroups) + ', not 40');
      L.parts.filter(p => p.zone === 'foot').forEach(p => Object.keys(p.sleeps || {}).forEach(k => { if (L.footGroups.indexOf(k) < 0) out.push(k + ' sleeps at the Foot House'); }));
      return out;
    },
    'every building on the bench stands on one terrace': L => L.parts.filter(p => p.zone === 'bench' && ON_WALL.indexOf(p.kind) < 0 && p.level === 0 &&
      !(L.terraces == null ? [] : L.terraces).some(t => p.box[0] >= t.u0 - 1e-9 && p.box[1] <= t.u1 + 1e-9)).map(p => p.id + ' straddles a terrace\'s edge'),
    'the Way of Shrines: a shrine on every stack, each step 30 m up, every bridge short and gentle enough, the last at the Gate of the Rift': L => {
      const B = L.bridgeway, out = []; if (!B) return ['no Way of Shrines'];
      const S = B.stacks, br = bridges(L);
      S.forEach((st, i) => {
        const sh = L.parts.find(p => p.kind === 'shrine' && Math.abs(centre(p.box)[0] - st.u) < 0.5 && Math.abs(centre(p.box)[1] - st.v) < 0.5);
        if (!sh || sh.y !== st.top) out.push(st.id + ' has no shrine on its top');
        if (i && st.top - S[i - 1].top !== B.rise + B.stairRise) out.push(st.id + ' is ' + (st.top - S[i - 1].top) + ' m above the last step');
        if (i && st.top - st.landing !== B.stairRise) out.push(st.id + '\'s stair climbs ' + (st.top - st.landing) + ' m');
        const d = st.u - lipU(L, st.v); if (d < st.r + 20) out.push(st.id + ' stands ' + d.toFixed(0) + ' m from the Lip');
        S.forEach((o, j) => { if (j > i && Math.hypot(o.u - st.u, o.v - st.v) < st.r + o.r + 8) out.push(st.id + ' crowds ' + o.id); });
      });
      br.forEach(b => {
        if (b.span > B.maxSpan) out.push('the bridge from ' + b.from + ' spans ' + b.span.toFixed(0) + ' m');
        if (b.rise / b.span > B.maxGrade + 1e-9 || b.rise < 0) out.push('the bridge from ' + b.from + ' climbs ' + (100 * b.rise / b.span).toFixed(0) + ' %');
      });
      br.forEach((p, i) => br.forEach((q, j) => { if (j > i + 1 && segX(p.a, p.b, q.a, q.b)) out.push('the bridges from ' + p.from + ' and ' + q.from + ' cross'); }));
      const last = br[br.length - 1], g = L.gates.find(x => x.id === B.end.gate);
      if (!last || !g || Math.hypot(last.b[0] - g.at[0], last.b[1] - g.at[1]) > 1 || last.b[2] !== 0) out.push('the last bridge does not land at the Gate of the Rift');
      const sh = L.parts.find(p => p.id === 'stairhead'), from = B.spur ? B.spur.nose : [S[0].u, S[0].v];
      if (!sh || Math.hypot(centre(sh.box)[0] - from[0], centre(sh.box)[1] - from[1]) > 30) out.push('the Way of Shrines does not start by the Stair of the Eye\'s head');
      return out;
    },
    'the Stair of the Eye: 9 to 16 km of switchbacks on the spur\'s crest, uncrossed, turning at the Rest House\'s gate at about 1,080 m, laid on the page\'s ground': L => {
      const w = L.ways.find(x => x.id === 'stair'), R = L.parts.find(p => p.id === 'resthouse'), out = [];
      if (!w || !R) return [w ? 'no Rest House' : 'no Stair of the Eye'];
      const P = w.pts, len = wayLen(P), S = L.stair || {}, A = S.A == null ? 200 : S.A, b = R.box, gate = [(b[0] + b[1]) / 2, b[2]];
      if (len < 9000 || len > 16000) out.push('the Stair is ' + (len / 1000).toFixed(1) + ' km');
      let dg = Infinity, through = false;
      for (let i = 1; i < P.length; i++) {
        dg = Math.min(dg, segDist(gate, P[i - 1], P[i]));
        const n = Math.ceil(Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
        for (let k = 0; k <= n; k++) if (inBox([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k / n, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k / n], b, 0)) through = true;
      }
      if (dg > 8) out.push('the Stair passes ' + dg.toFixed(0) + ' m from the Rest House\'s gate');
      if (through) out.push('the Stair runs through the Rest House');
      if (L.stairY) { const y = L.frame.ground + L.stairY(...centre(b)); if (y < 1040 || y > 1120) out.push('the Rest House stands at ' + y.toFixed(0) + ' m'); }
      P.forEach((p, i) => { if (i > 0 && i < P.length - 1 && Math.abs(p[1]) > A + 1 && !near(p, gate, 8)) out.push('corner ' + i + ' stands ' + Math.abs(p[1]).toFixed(0) + ' m off the crest');
        if (L.stairY && Math.abs(p[2] - L.stairY(p[0], p[1])) > 0.5) out.push('corner ' + i + ' is ' + (p[2] - L.stairY(p[0], p[1])).toFixed(1) + ' m off the ground'); });
      for (let i = 1; i < P.length; i++) for (let j = i + 2; j < P.length; j++) if (segX(P[i - 1], P[i], P[j - 1], P[j])) out.push('legs ' + i + ' and ' + j + ' cross');
      /* every 20 m of every leg at 10 % or less on the crest's surface (the page smooths the crest to it: stairGround) */
      if (L.stairY) for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], r = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(r / 20));
        for (let k = 1; k <= n; k++) { const g = Math.abs(L.stairY(a[0] + (b[0] - a[0]) * (k - 1) / n, a[1] + (b[1] - a[1]) * (k - 1) / n) - L.stairY(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n)) / (r / n);
          if (g > 0.1 + 1e-9) { out.push('leg ' + i + ' climbs ' + (g * 100).toFixed(1) + ' % over 20 m on the crest'); break; } } }
      return out.slice(0, 6);
    },
    'the band is the owner\'s 100-300 m high, about 1.5 km long, facing the Rift': L => {
      const B = L.band, out = [];
      if (B.h < 100 || B.h > 300) out.push('the band is ' + B.h + ' m high');
      if (B.halfLen * 2 < 1200 || B.halfLen * 2 > 1800) out.push('the band is ' + B.halfLen * 2 + ' m long');
      const turn = Math.atan(2 * B.lipK * B.halfLen) * 180 / Math.PI;   /* the face's normal turns this far at each end */
      if (180 - turn < 155 || 180 + turn > 205) out.push('the face turns ' + turn.toFixed(0) + ' deg from south at its ends');
      if (Math.abs(180 - turn - B.face[0]) > 2 || Math.abs(180 + turn - B.face[1]) > 2) out.push('the face\'s bearings ' + B.face.join('-') + ' are not the Lip\'s');
      return out;
    }
  };

  function checks(L) { return Object.keys(RULES).map(name => { const f = RULES[name](L); return { name, pass: f.length === 0, detail: f.join('; ') }; }); }

  function area(L) {
    const by = {}; let bench = 0;
    L.parts.forEach(p => {
      if (OPEN.indexOf(p.kind) >= 0 || ['cap', 'rim', 'spur', 'foot', 'apron', 'band'].indexOf(p.zone) >= 0) return;
      const a = (p.box[1] - p.box[0]) * (p.box[3] - p.box[2]) * (p.circ ? Math.PI / 4 : 1) * (p.storeys == null ? 1 : p.storeys);
      by[p.id] = Math.round(a); bench += a;
    });
    return { by, bench: Math.round(bench) };
  }

  function toPx(L, u, v) { const k = L.frame.kmPerPx * 1000; return [L.frame.px[0] + v / k, L.frame.px[1] + u / k]; }

  /* the ground: m is the model's height in frame y (metres over the bench's 1,660) at (u, v) */
  function ground(L, u, v, m) {
    const B = L.band, C = L.crater, lu = lipU(L, v);
    let y = m;
    /* the bench: behind the Lip, filled up to its level over the precinct and a wide skirt (raise only), and inside the precinct
       cut level too where the cap rises above it (its north and west walls retain the cut; a 25 m bank behind them) */
    const wB = sm(-262, -150, u) * (1 - sm(160, 360, Math.abs(v))), wP = sm(-175, -150, u) * (1 - sm(100, 125, Math.abs(v)));
    const tY = terraceY(L, u);
    if (u <= lu && y < tY) y += (tY - y) * wB;
    if (u <= lu && y > tY) y += (tY - y) * wP;
    /* the band: in front of the Lip, the face, the talus leaning on it and the apron easing out (lower only) */
    if (u > lu) {
      /* the cut fades back into the model between merge[0] and merge[1] m out from the Lip, so the apron rejoins the flank: without
         it the face's 200 m and the apron's slow fall ran on down the spur's sides to the Foot House, a trench either side of the crest */
      const d = u - lu, t = (1 - sm(B.halfLen - B.taper, B.halfLen, Math.abs(v))) * (B.merge ? 1 - sm(B.merge[0], B.merge[1], d) : 1);
      if (t > 0) {
        const top = m < 0 ? m + (0 - m) * (1 - sm(160, 360, Math.abs(v))) : m, foot = top - B.h, d0 = B.batter + B.talusRun;
        const F = top - B.h * d / B.batter, G = foot + B.talusH - B.talusH * (d - B.batter) / B.talusRun, A = foot - B.apronGrade * Math.max(0, d - d0);
        const T = Math.max(F, G, A);
        if (d < 2) y = Math.max(y, top);   /* the Lip's own edge stands at the bench's top */
        if (T < y) y += (T - y) * t;
      }
    }
    /* the crater: a spatter rampart round the rim, the bowl inside it down to the floor */
    /* the spur of the Way of Shrines: an arete of the coulee's columns out of the band (raise only) */
    if (L.bridgeway && L.bridgeway.spur && u > -20 && u < 420 && v < 0) { if (!L._spine) Object.defineProperty(L, '_spine', { value: spine(L), enumerable: false });
      const sp = spurY(L, u, v, y, L._spine); if (sp > y) y = sp; }
    const dc = Math.hypot(u - C.centre[0], v - C.centre[1]);
    /* the rampart's crest is a few metres inside the rim, so the rim's buildings stand on it; the bowl falls from 15 m inside */
    if (dc < C.r + 160) {
      y += C.rimH * Math.exp(-Math.pow((dc - (C.r - 5)) / 45, 2));
      const ri = C.r - 15;
      if (dc < ri) { const crest = m + C.rimH, floor = m - C.depth, bowl = floor + (crest - floor) * Math.pow(dc / ri, 2.4); if (bowl < y) y = bowl; }
    }
    return y;
  }

  /* the Stair's corridor: the spur's crest under the Stair smoothed to the layout's ground table (L.stairY, bilinear on
     stair.ground), so the legs keep on the drawn ground the grade they were laid at; faded back to y over stair.smooth.skirt m
     beyond halfW either side of the crest and over `ramp` m at its ends. The model's own detail (bumps of 10-30 m a hundred
     metres apart) stays outside it */
  function stairGround(L, u, v, y) {
    const S = L.stair, Z = S && S.smooth; if (!Z || !L.stairY) return y;
    const w = sm(Z.u[0], Z.u[0] + Z.ramp, u) * (1 - sm(Z.u[1] - Z.ramp, Z.u[1], u)) * (1 - sm(Z.halfW, Z.halfW + Z.skirt, Math.abs(v)));
    return w > 0 ? y + (L.stairY(u, v) - y) * w : y;
  }

  return { RULES, checks, reach, area, water, toPx, ground, stairGround, lipU, terraceY, bridges, spine, spurY, segDist, inPoly, wayLen };
})();
if (typeof module !== 'undefined') module.exports = FLASHING_EYE;
