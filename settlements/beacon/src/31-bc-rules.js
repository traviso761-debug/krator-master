/* ================================================================= THE BEACON: the rules its layout keeps  [G data]
   Plain functions over BEACON_LAYOUT (30-bc-layout.js), so Godot, the sim and the sheets read one plan. Each rule has a
   negative in test-beacon.js: a copy of the layout broken in that one way must fail it.

     BEACON.checks(L)      [{name, pass, detail}], one per rule
     BEACON.reach(L, from, avoid)   the zones reached from `from` through the gates, never entering `avoid`
     BEACON.area(L)        floor area by part (box x storeys) and by owner
     BEACON.toPx(L, u, v)  a frame point on the scale model (px; u runs south, v east) */
const BEACON = (function () {
  'use strict';
  const near = (a, b, e) => Math.hypot(a[0] - b[0], a[1] - b[1]) < e;
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
  const tbox = t => [t.at[0] - t.w / 2, t.at[0] + t.w / 2, t.at[1] - t.w / 2, t.at[1] + t.w / 2];
  const ON_WALL = ['gatehouse', 'pavilion'];
  /* a box against a wall's band: walk the wall's centre line every 0.25 m, the box grown by half the wall's thickness */
  const inWall = (b, w) => {
    const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), n = Math.max(1, Math.ceil(L / 0.25)), e = w.t / 2 - 0.05;
    for (let k = 0; k <= n; k++) {
      const p = [w.a[0] + (w.b[0] - w.a[0]) * k / n, w.a[1] + (w.b[1] - w.a[1]) * k / n];
      if (p[0] > b[0] - e && p[0] < b[1] + e && p[1] > b[2] - e && p[1] < b[3] + e) return true;
    }
    return false;
  };
  const GOLD = { pavilion: 'pavilion', chapel: 'plinth', crown: 'hosted' };

  function reach(L, from, avoid) {
    const seen = new Set([from]), q = [from];
    while (q.length) {
      const z = q.shift();
      L.gates.forEach(g => {
        const o = g.from === z ? g.to : g.to === z ? g.from : null;
        if (o && !seen.has(o) && o !== avoid) { seen.add(o); q.push(o); }
      });
    }
    return seen;
  }

  const RULES = {
    'every part, wall, gate and way has a unique id': L => {
      const ids = [].concat(L.parts.map(p => p.id), L.walls.map(w => w.id), L.gates.map(g => g.id), L.ways.map(w => w.id));
      return ids.filter((x, i) => ids.indexOf(x) !== i).map(x => x + ' twice');
    },
    'every part stands in its zone': L => L.parts.filter(p => {
      const poly = L.zones[p.zone]; if (!poly) return true;
      if (ON_WALL.indexOf(p.kind) >= 0) return !inPoly(poly, centre(p.box)) && !L.walls.some(w => segDist(centre(p.box), w.a, w.b) < 2);
      if (!corners(p.box).every(c => inPoly(poly, c))) return true;
      return p.zone === 'site' && ['precinct', 'lampward', 'fort'].some(z => corners(p.box).some(c => inPoly(L.zones[z], c)));
    }).map(p => p.id + ' is not in ' + p.zone),
    'no two parts on one level overlap, nor a part and a fort tower': L => {
      const out = [], ps = L.parts;
      ps.forEach((p, i) => {
        ps.forEach((q, j) => { if (j > i && p.level === q.level && overlap(p.box, q.box, 0.1)) out.push(p.id + ' overlaps ' + q.id); });
        if (p.level === 0) L.fort.towers.forEach(t => { if (overlap(p.box, tbox(t), 0.1)) out.push(p.id + ' overlaps the tower ' + t.id); });
      });
      return out;
    },
    'no building stands in a wall': L => {
      const out = [];
      L.parts.forEach(p => { if (ON_WALL.indexOf(p.kind) < 0 && p.level === 0) L.walls.forEach(w => { if (inWall(p.box, w)) out.push(p.id + ' stands in ' + w.id); }); });
      return out;
    },
    "Gyantse's walls join the fort's corner towers to the precinct's corners": L => {
      const tw = L.fort.towers.filter(t => t.kind === 'corner'), pc = L.zones.precinct;
      return L.walls.filter(w => w.join).filter(w => !(pc.some(c => near(w.a, c, 1.5)) && tw.some(t => near(w.b, t.at, t.w / 2 + 1.5)))).map(w => w.id + ' does not join');
    },
    'every gate is on its wall': L => L.gates.filter(g => {
      if (!g.wall) return false;
      const w = L.walls.find(x => x.id === g.wall); return !w || segDist(g.at, w.a, w.b) > 1;
    }).map(g => g.id + ' is off ' + g.wall),
    'the fort is reached without passing the cloister, the cloister without passing the fort': L => {
      const out = [];
      if (!reach(L, 'site', 'cloister').has('fort')) out.push('the Sultan\'s men must cross the cloister to reach their fort');
      if (!reach(L, 'site', 'fort').has('cloister')) out.push('the monks must pass the fort to reach their own hall');
      const all = reach(L, 'site', null);
      Object.keys(L.zones).filter(z => !all.has(z)).forEach(z => out.push(z + ' is reached by no gate'));
      return out;
    },
    'the hosted monastery stands clear of the precinct wall by 4 m': L => {
      const m = L.parts.find(p => p.kind === 'hosted'); if (!m) return ['no hosted monastery'];
      const out = [];
      L.walls.filter(w => w.id.indexOf('precinct') === 0).forEach(w => {
        const d = Math.min(...corners(m.box).map(c => segDist(c, w.a, w.b))) - w.t / 2;
        if (d < 4 - 1e-6) out.push('the monastery ' + d.toFixed(1) + ' m from ' + w.id);
      });
      return out;
    },
    'the cable runs from the engines to the plinth, into the fort only through its gate': L => {
      const out = [], C = L.cable, pts = C.pts;
      const inBox = (p, b) => p[0] >= b[0] && p[0] <= b[1] && p[1] >= b[2] && p[1] <= b[3];
      const from = L.parts.find(p => p.id === C.from), to = L.parts.find(p => p.id === C.to);
      if (!from || !inBox(pts[0], from.box)) out.push('the cable does not start in the generator house');
      if (!to || !inBox(pts[pts.length - 1], to.box)) out.push('the cable does not end in the plinth');
      const g = L.gates.find(x => x.id === 'gate.fort');
      L.walls.filter(w => w.owner === 'sultan').forEach(w => {
        for (let i = 0; i + 1 < pts.length; i++) {
          const a = pts[i], b = pts[i + 1];
          for (let k = 0; k <= 40; k++) {
            const p = [a[0] + (b[0] - a[0]) * k / 40, a[1] + (b[1] - a[1]) * k / 40];
            if (segDist(p, w.a, w.b) < w.t / 2 && !(g && Math.hypot(p[0] - g.at[0], p[1] - g.at[1]) < g.w / 2)) { out.push('the cable crosses ' + w.id + ' outside the gate'); return; }
          }
        }
      });
      return out;
    },
    'the lamp sees every place the order must reach, by 10 m or more': L => L.lamp.sights.filter(s => s.must && !(s.clear >= 10)).map(s => s.name + ' clear by ' + s.clear + ' m'),
    'a station the lamp cannot see is reached through a relay or a station it sees': L => {
      const out = [], sight = id => L.lamp.sights.find(s => s.id === id), relay = id => (L.lamp.relays == null ? [] : L.lamp.relays).find(r => r.id === id);
      L.lamp.sights.filter(s => s.via != null).forEach(s => {
        const r = relay(s.via), v = sight(s.via);
        if (r) { if (!(r.seeLamp >= 10 && r.seeFar >= 10) || r.to !== s.id) out.push(s.name + ': its relay ' + r.id + ' does not see both ends by 10 m'); }
        else if (v) { if (!(v.clear >= 10) && !v.via) out.push(s.name + ': its relay ' + v.id + ' is not seen'); }
        else out.push(s.name + ': no relay ' + s.via);
      });
      return out;
    },
    "the lamp's year fits the oil the tune sends": L => {
      const have = L.power.oilKgYr * L.power.kWhPerKg, need = L.lamp.kw * L.lamp.nightHours * 365;
      return need <= have ? [] : ['the lamp draws ' + Math.round(need) + ' kWh a year against ' + Math.round(have)];
    },
    'the lamp stands on the plinth\'s roof, the plinth in the keep\'s place': L => {
      const D = L.draw, P = D.plinth, out = [], pl = L.parts.find(p => p.id === 'plinth');
      const sum = P.storeys.reduce((a, b) => a + b, 0) + P.chapel;
      if (Math.abs(sum - P.h) > 0.01) out.push('the plinth\'s storeys and chapel make ' + sum + ' m, not its ' + P.h);
      if (!pl || pl.h !== P.h || JSON.stringify(pl.box) !== JSON.stringify(P.box)) out.push('the plinth part and the draw record disagree');
      const c = P.h + D.mount.h + D.mount.yoke;
      if (Math.abs(c - L.lamp.h) > 0.25) out.push('the lamp\'s centre at ' + c + ' m, the sights taken at ' + L.lamp.h);
      if (!(L.lamp.at[0] >= P.box[0] && L.lamp.at[0] <= P.box[1] && L.lamp.at[1] >= P.box[2] && L.lamp.at[1] <= P.box[3])) out.push('the lamp is off the plinth');
      return out;
    },
    'gold only on the gate pavilion, the chapel and the holy crown': L => L.parts.filter(p => p.gold && GOLD[p.gold] !== p.kind).map(p => p.id + ' is gilt (' + p.gold + ')'),
    'everyone has a bed: the census sleeps where the parts say': L => {
      const got = {}, out = [], n = k => got[k] == null ? 0 : got[k];
      L.parts.forEach(p => Object.keys(p.sleeps == null ? {} : p.sleeps).forEach(k => { got[k] = n(k) + p.sleeps[k]; }));
      Object.keys(L.census).forEach(k => { if (n(k) !== L.census[k]) out.push(k + ': ' + n(k) + ' beds for ' + L.census[k]); });
      Object.keys(got).filter(k => L.census[k] == null).forEach(k => out.push(k + ' sleeps here but is not in the census'));
      const sum = gs => gs.reduce((a, k) => a + L.census[k], 0);
      if (sum(L.orderGroups) !== 300) out.push('the order is ' + sum(L.orderGroups) + ', not the owner\'s 300');
      if (sum(L.fortGroups) !== 150) out.push('the fort is ' + sum(L.fortGroups) + ', not the tune\'s 150');
      return out;
    }
  };

  function checks(L) { return Object.keys(RULES).map(name => { const f = RULES[name](L); return { name, pass: f.length === 0, detail: f.join('; ') }; }); }

  function area(L) {
    const by = {}, owner = { order: 0, sultan: 0 }, OPEN = ['court', 'garden', 'yard', 'stair_way', 'terrace', 'field', 'threshing', 'midden', 'tank', 'chorten', 'oil_pit', 'pavilion'];
    L.parts.forEach(p => {
      if (OPEN.indexOf(p.kind) >= 0 || p.zone === 'site') return;
      const a = (p.box[1] - p.box[0]) * (p.box[3] - p.box[2]) * (p.circ ? Math.PI / 4 : 1) * (p.storeys == null ? 1 : p.storeys);
      by[p.id] = Math.round(a); owner[p.zone === 'fort' && p.id !== 'plinth' ? 'sultan' : 'order'] += a;
    });
    return { by, order: Math.round(owner.order), sultan: Math.round(owner.sultan) };
  }

  function toPx(L, u, v) { const k = L.frame.kmPerPx * 1000; return [L.frame.px[0] + v / k, L.frame.px[1] + u / k]; }

  return { RULES, checks, reach, area, toPx, segDist, inPoly };
})();
if (typeof module !== 'undefined') module.exports = BEACON;
