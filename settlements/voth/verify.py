#!/usr/bin/env python3
"""Verify Voth headless: load a built page, wait for it, check it.

    python3 verify.py dist/voth-city.html --assert [--shot out.png]    # the city plan (core/city on the Voth site)
    python3 verify.py dist/voth-site.html --assert [--shot out.png]    # the site editor

The city plan loads with ?lite=1 (buildings built, not drawn: software GL cannot draw ten million triangles quickly).
--assert fails on a page error, a kit piece that did not build, overlapping buildings (exact footprints, 0.3 m),
buildings in water, on the wall or on a highway, and each rule of the owner's the page logs (see CITY_CHECK).
"""
import argparse, functools, http.server, json, os, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=HERE))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('page', nargs='?', default='dist/voth-city.html')
    ap.add_argument('--assert', dest='check', action='store_true')
    ap.add_argument('--shot')
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    port, errors = serve(), []
    rel = os.path.relpath(os.path.abspath(a.page), HERE).replace(os.sep, '/')
    if 'voth-site' in rel:
        return verify_site(a, port, rel, sync_playwright)
    if 'voth-city' in rel:
        return verify_city(a, port, rel, sync_playwright)
    sys.exit('verify.py: no check for ' + rel + ' (dist/voth-city.html or dist/voth-site.html)')


SITE_CHECK = r"""() => {
  const out = { err: _site.error || null, from: _site.from, cantons: _site.cantons || [], all: VOTH.CANTONS.map(c => c.n), bridges: Object.assign({}, _site.bridges, _site.view.causewayCount) };
  /* the tools, end to end, on a scratch copy of the site: draw a park, place two markers, undo, redo */
  const keep = JSON.stringify(SITE.data), m0 = SITE.data.markers.length, a0 = SITE.data.avenues.length, c0 = SITE.causeways().length, s0 = SITE.stations().length, r0 = SITE.data.routes.length;
  const d = SITE.addDistrict('park', [[1400, 330], [1730, 140], [1870, 615], [1550, 765]]);
  const M1 = SITE.addMarker(1470, 1258), M2 = SITE.addMarker(900, -480);
  out.tools = { district: d.name, area: Math.round(SITE.area(d.poly)), newMarkers: M1.id !== M2.id ? 2 : 1 };
  SITE.doUndo(); out.tools.afterUndo = SITE.data.markers.length - m0; SITE.doRedo(); out.tools.afterRedo = SITE.data.markers.length - m0;
  /* a ferry stop and an elephant bug station, and a line between two stops */
  const F = SITE.addStation('ferry', 200, 900), S1 = SITE.addStation('strider', 1600, 300), S2 = SITE.addStation('strider', 1700, 800);
  SITE.addRoute('strider', [S1.id, S2.id]);
  out.tools.stations = SITE.stations().length - s0; out.tools.routes = SITE.data.routes.length - r0; out.tools.dockStops = SITE.vothStations().length;
  /* an avenue, a drawn causeway, a raise and a smooth stroke; the ground moves, undo puts it back */
  const h0 = TERR.h(1500, 400);
  SITE.addLine('avenue', [[1300, 300], [1600, 420], [1800, 600]]);
  SITE.addLine('causeway', [[631, 443], [900, 520]]);
  TOOL.terrLive = false; SITE.edit(S => { S.terrain.push({ m: 'raise', r: 80, s: 6, pts: [[1500, 400]] }); });
  const h1 = TERR.h(1500, 400);
  SITE.edit(S => { S.terrain.push({ m: 'smooth', r: 80, s: 0.5, pts: [[1500, 400]] }); });
  out.tools.avenues = SITE.data.avenues.length - a0; out.tools.causeways = SITE.causeways().length - c0; out.tools.cwPrims = VIEW.causewayCount.prims;
  out.tools.raised = +(h1 - h0).toFixed(2); SITE.doUndo(); SITE.doUndo(); out.tools.undoneGround = +(TERR.h(1500, 400) - h0).toFixed(2);
  SITE.load(JSON.parse(keep));
  /* the ground is Voth's: a canton centre is under water, the river mouth too, the east shore dry */
  out.ground = { palaceBed: +VOTH.terrainH(VOTH.CIDX.Palace.x, VOTH.CIDX.Palace.z).toFixed(1), eastShore: +VOTH.terrainH(1600, 400).toFixed(1) };
  return out;
}"""


CITY_CHECK = r"""() => {
  const P = _vc.plan, R = SL.R, out = { err: _vc.error || null, log: P.log, ms: P.stats.ms, failed: Object.keys(_vc.failed || {}) };
  const alive = P.lots.filter(L => L.died == null);
  out.lots = alive.length; out.ways = {}; P.ways.forEach(w => out.ways[w.cls] = (out.ways[w.cls] || 0) + 1);
  out.named = (_vc.wall ? _vc.wall.gates.filter(g => g.named).map(g => g.name + (g.crossed ? '' : '?')) : []);
  /* buildings: none overlapping, none in the water, none on the wall */
  const fp = alive.map(L => ({ L, c: [L.x, L.z], u: L.bo ? L.bo.u : [Math.cos(L.ry), -Math.sin(L.ry)], v: L.bo ? L.bo.v : [Math.sin(L.ry), Math.cos(L.ry)], hw: L.w / 2, hd: L.d / 2 }));
  const grid = new Map(), key = (x, z) => Math.floor(x / 60) + ',' + Math.floor(z / 60);
  fp.forEach((f, i) => { const k = key(f.c[0], f.c[1]); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
  let pairs = 0, wet = 0, onWall = 0;
  fp.forEach((A, i) => {
    const gx = Math.floor(A.c[0] / 60), gz = Math.floor(A.c[1] / 60);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) (grid.get((gx + dx) + ',' + (gz + dz)) || []).forEach(j => { if (j > i && SL.pen(A, fp[j]) > 0.3) pairs++; });
    if (baseH(A.c[0], A.c[1]) < 0 && !A.L.deck && !A.L.berth) wet++;   /* a canton deck's and the coast-guard berth's stand over the water */
    if (_vc.wall && _vc.wall.segs.some(s => segDist(A.c, [s.ax, s.az], [s.bx, s.bz]) < Math.min(A.hw, A.hd))) onWall++;
  });
  out.overlapPairs = pairs; out.wet = wet; out.onWall = onWall;
  /* the wall keeps clear of the avenues, except where one passes through a gate */
  let clear = Infinity;
  if (_vc.wall) _vc.wall.segs.forEach(s => { for (let t = 0.1; t < 0.95; t += 0.1) { const p = [s.ax + (s.bx - s.ax) * t, s.az + (s.bz - s.az) * t];
    if (_vc.wall.gates.some(g => Math.hypot(g.x - p[0], g.z - p[1]) < 60)) continue;
    P.ways.forEach(w => { if (w.cls === 'avenue') clear = Math.min(clear, w.F.nearest(p).d); }); } });
  out.wallClear = +clear.toFixed(1);
  out.transit = _vc.transit ? { stations: _vc.transit.stations.length, lines: _vc.transit.lines.length } : null;
  /* owner, 2026-10-09 */
  const hw = P.ways.filter(w => w.cls === 'highway');
  out.highwayVia = hw.filter(w => w.via).map(w => w.via.id + ' ' + w.via.d + ' m');
  out.lotsOnHighways = alive.filter(L => L.way >= 0 && P.ways[L.way] && P.ways[L.way].cls === 'highway').length;
  out.buildingsOnHighways = fp.filter(f => hw.some(w => { const q = w.F.nearest(f.c); return q.d < w.w / 2 + Math.min(f.hw, f.hd) * 0.8; })).length;
  out.wall = _vc.wall ? { ruined: _vc.wall.nodes.filter(n => n.health !== 2).length + _vc.wall.segs.filter(sg => sg.health !== 2).length,
    gatesOffRoad: _vc.wall.nodes.filter(n => n.kind === 'gate' && n.way && n.way.F.nearest([n.gx, n.gz]).d > 1).length } : null;
  out.clans = alive.filter(L => L.cls === 'clan').length;
  const nochin = P.site.filter(d => d.role === 'nochin');
  out.chinInExclusion = VC.prims.chinampas.list.filter(q => nochin.some(d => inPoly([q[1], q[3]], d.poly))).length;
  const mon = VC.monastery || { counts: {} }, parks = P.site.filter(d => d.role === 'park');
  out.monastery = mon.counts; out.monasteryInParks = VC.prims.monastery ? VC.prims.monastery.list.filter(q => parks.some(d => inPoly([q[1], q[3]], d.poly))).length : -1;
  out.fishDocks = VOTH.PIERS.filter(q => q.fish).length;
  out.riverQuaysSkew = VOTH.PIERS.filter(q => q.river && !q.barge).map(q => { const r = VOTH.riverAt(0); let best = 1e9, t = null; for (let u = 0; u < 8000; u += 15) { const p = VOTH.riverAt(u), d = Math.hypot(p.x - q.x0, p.z - q.z0); if (d < best) { best = d; t = [p.tx, p.tz]; } }
    const L = Math.hypot(q.x1 - q.x0, q.z1 - q.z0); return Math.abs(((q.x1 - q.x0) * t[0] + (q.z1 - q.z0) * t[1]) / L); }).reduce((m, v) => Math.max(m, v), 0);
  out.avenueLow = Math.min.apply(null, SITE.data.avenues.map(a => { let lo = 99; const Pp = resample(a.pts, 6, false), F = plFrame(Pp); for (let s = 0; s < F.len; s += 6) { const p = F.at(s), n = V.perp(F.tan(s, 4)); [-6, 0, 6].forEach(o => { const q = V.add(p, V.mul(n, o)); lo = Math.min(lo, TERR.h(q[0], q[1])); }); } return lo; }));
  out.lotsOnBridgeEnds = alive.filter(L => L.bo && VOTH.RBRIDGES.some(b => { const ry = Math.atan2(b.bx - b.ax, b.bz - b.az), u = [Math.cos(ry), -Math.sin(ry)];
    return [[b.ax, b.az], [b.bx, b.bz]].some(e => SL.pen(obb(e, u, b.w * 1.1, b.w * 1.1), L.bo) > 0.3); })).length;
  out.bridgeApproaches = P.ways.filter(w => w.tag === 'bridge approach').length;
  const C = P.country || {};
  out.country = { lots: C.lots, fields: C.fields, suburb: alive.filter(L => L.country === 'suburb').length, farms: alive.filter(L => L.cls === 'farm').length,
    villages: (C.villages || []).map(v => v.id + ' ' + v.houses), orchard: VC.prims.orchards ? VC.prims.orchards.list.length : 0 };
  /* the lines are core/simulation transport routes; a vehicle's pose is a pure function of time */
  const T = SIM.all('transport');
  out.flora = VC.floraStats || {};
  out.barges = VC.bargeAudit || {};
  /* elephant bugs and bridges: an elephant bug's path sampled every 2 m never enters the water the nav closed beside a river
     bridge's deck or under a canton span, and where it is on a deck it is drawn at the deck's height */
  { const N = VC.NAV; let under = 0, decks = 0, low = 0;
    Object.values(SIM.R.transport).filter(t => t.layer === 'strider').forEach(t => t.legs.forEach(g => { const P = g.path && g.path.pts; if (!P) return;
      for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], L = Math.hypot(b[0] - a[0], b[2] - a[2]);
        for (let u = 0; u <= L; u += 2) { const x = a[0] + (b[0] - a[0]) * u / (L || 1), z = a[2] + (b[2] - a[2]) * u / (L || 1);
          if (N.under[N.cell(x, z)]) under++;
          const dk = VOTH.lifeBridgeY(x, z); if (dk != null && N.road[N.cell(x, z)] === 2) decks++; } }
      P.forEach(q => { const dk = VOTH.lifeBridgeY(q[0], q[2]); if (dk != null && N.road[N.cell(q[0], q[2])] === 2 && Math.abs(q[1] - dk) > 0.5) low++; }); }));
    out.striderBridges = { under, onDecks: decks, offDeckHeight: low }; }
  out.light = PLAN.light || {};
  out.embassies = { drawn: (VC.embassies || []).map(g => g.userData.culture), wanted: TUNE.decks.embassies.length };
  out.ferryAudit = (_vc.transit.ferryAudit || []).filter(a => !a.dock || !a.anchored || !a.reachable).map(a => a.id + (a.dock ? '' : ' no dock') + (a.dock && !a.anchored ? ' not joined to anything' : '') + (a.dock && !a.reachable ? ' tip out of reach' : ''));
  out.sim = { routes: T.length, bad: (_vc.transit.lines || []).filter(l => !l.ok).map(l => l.name + ': ' + l.failed.join(', ')), vehicles: T.reduce((s, R) => s + R.vehicles, 0),
    problems: SIM.problems.length, pure: T.every(R => { const a = SIM.vehiclePose(R.id, 0, 1234.5), b = SIM.vehiclePose(R.id, 0, 1234.5), c = SIM.vehiclePose(R.id, 0, 1234.5 + (R.sched ? R.horizonS : R.period)); return a && a.x === b.x && Math.abs(a.x - c.x) < 1e-6; }),
    berthClash: (() => { let n = 0; for (let t = 0; t < 20000; t += 30) { const at = {}; T.forEach(R => { for (let k = 0; k < R.vehicles; k++) { const p = SIM.vehiclePose(R.id, k, t); if (p && p.at) { at[p.at] = (at[p.at] || 0) + 1; if (at[p.at] > (R.berths || 1)) n++; } } }); } return n; })(),
    ports: SIM.all('port').map(p => p.id) };
  /* owner, 2026-10-09: the cantons walkable from a ferry to the top (the interiors' routes; the bridges, the terrace
     chains, the Ancestry's spiral and catacombs), walked in 0.25 m steps on core/walk with the walker's own rules */
  out.walkInt = (() => {
  const W = KWALK, Tw = TUNE.walk, out = {};
  const stand = (x, z, y) => { const g = VIEW.surf(x, z), f = W.floorBelow(x, z, y, Tw.step); return f && f[0] >= g - 0.3 ? f[0] : g; };
  /* walk from A=[x,z,y] to each waypoint [x,z] in 0.25 m steps with the page's rules; report where it stuck */
  const walk = (start, wps) => {
    let p = start.slice(), log = [];
    for (let i = 0; i < wps.length; i++) {
      const T = wps[i]; let guard = 0;
      while (Math.hypot(T[0] - p[0], T[1] - p[1]) > 0.3 && guard++ < 4000) {
        const d = Math.hypot(T[0] - p[0], T[1] - p[1]), s = Math.min(0.25, d), x = p[0] + (T[0] - p[0]) / d * s, z = p[1] + (T[1] - p[1]) / d * s;
        let y = stand(x, z, p[2]);
        if (p[2] - y > Tw.drop) return { ok: false, at: i, why: 'ledge', p: p.map(v => +v.toFixed(1)), y: +y.toFixed(1), log };
        if (W.blocked(x, y, z, Tw.r, Tw.h)) { const b = W.blocked(x, y, z, Tw.r, Tw.h); return { ok: false, at: i, why: 'blocked ' + (b.tag || ''), p: p.map(v => +v.toFixed(1)), box: b.box.map(v => +v.toFixed(1)), log }; }
        p = [x, z, y];
      }
      log.push(p[2].toFixed(1));
    }
    return { ok: true, end: p.map(v => +v.toFixed(1)), log };
  };
  Object.keys(VC.INT.cantons).forEach(cn => {
    const P = VC.INT.cantons[cn]; if (P.catacombs) return;
    const dock = CANT.flights.filter(f => f.canton === cn && (f.kind === 'dock' || f.kind === 'mole'))[0];
    if (!dock) { out[cn] = 'no dock'; return; }
    const dd = [dock.a[0] - dock.b[0], dock.a[1] - dock.b[1]], fn = Math.abs(dd[0]) > Math.abs(dd[1]) ? [Math.sign(dd[0]), 0] : [0, Math.sign(dd[1])];
    const D = P.doorsOut.filter(d => d.n[0] === fn[0] && d.n[1] === fn[1])[0] || P.doorsOut[0];
    const n = D.n, wp = [dock.b, [D.x + n[0] * 3, D.z + n[1] * 3], [D.x - n[0] * 4, D.z - n[1] * 4]];
    /* along the tunnel and the passage to the hall, then to the core */
    /* the tunnel's inner end, the passage's far end (if any), the hall's end, the core */
    const M = P.M, tg = [-n[1], n[0]], along = (D.x - M.x) * tg[0] + (D.z - M.z) * tg[1], cA = (P.core.x - M.x) * tg[0] + (P.core.z - M.z) * tg[1], R0 = P.storeys[0].R;
    const at = (r, a) => [M.x + n[0] * r + tg[0] * a, M.z + n[1] * r + tg[1] * a];
    const rIn = R0 - 1 - TUNE.interiors.tunnelW / 2 - 0.5;
    wp.push(at(rIn, along));
    if (Math.abs(along - cA) > TUNE.interiors.hall / 2) wp.push(at(rIn, cA));
    wp.push(at(Math.min(rIn, R0 - 4), cA));
    const cr = (P.core.x - M.x) * n[0] + (P.core.z - M.z) * n[1];
    wp.push(at(cr + (cr < rIn ? 1 : -1) * (TUNE.interiors.core - 1), cA));
    wp.push([P.core.x - P.axis[0] * (TUNE.interiors.well[1] + 1.2) - P.perp[0] * TUNE.interiors.well[0] / 2, P.core.z - P.axis[1] * (TUNE.interiors.well[1] + 1.2) - P.perp[1] * TUNE.interiors.well[0] / 2]);
    P.flights.filter(f => !(P.storeys[f.storey] || {}).dungeon).forEach((f, i) => { wp.push(f.a, f.b); if (i % 2 === 0) { const L = P.floors.filter(q => q.kind === 'landing' && q.storey === f.storey)[0]; if (L) wp.push([(L.x0 + L.x1) / 2, (L.z0 + L.z1) / 2]); } });
    wp.push(P.house.door, [P.house.door[0] + P.house.n[0] * 4, P.house.door[1] + P.house.n[1] * 4]);
    const r = walk([dock.a[0], dock.a[1], dock.y0], wp);
    out[cn] = r.ok ? 'OK, top at ' + r.end[2] + ' (deck ' + P.M.top.y.toFixed(1) + ')' : JSON.stringify(r);
  });
  return out;
})();
  out.walkOut = (() => {
  const W = KWALK, Tw = TUNE.walk, out = { bridges: {}, chains: {}, ancestry: null, catacombs: null };
  const stand = (x, z, y) => { const g = VIEW.surf(x, z), f = W.floorBelow(x, z, y, Tw.step); return f && f[0] >= g - 0.3 ? f[0] : g; };
  const walk = (start, wps) => {
    let p = start.slice();
    for (let i = 0; i < wps.length; i++) {
      const T = wps[i]; let guard = 0;
      while (Math.hypot(T[0] - p[0], T[1] - p[1]) > 0.3 && guard++ < 8000) {
        const d = Math.hypot(T[0] - p[0], T[1] - p[1]), s = Math.min(0.25, d), x = p[0] + (T[0] - p[0]) / d * s, z = p[1] + (T[1] - p[1]) / d * s;
        const y = stand(x, z, p[2]);
        if (p[2] - y > Tw.drop) return { ok: false, at: i, of: wps.length, why: 'ledge', p: p.map(v => +v.toFixed(1)), y: +y.toFixed(1) };
        const b = W.blocked(x, y, z, Tw.r, Tw.h); if (b) return { ok: false, at: i, of: wps.length, why: 'blocked ' + b.tag, p: p.map(v => +v.toFixed(1)) };
        p = [x, z, y];
      }
    }
    return { ok: true, end: p.map(v => +v.toFixed(1)) };
  };
  const fmt = r => r.ok ? 'OK ' + r.end[2] : JSON.stringify(r);
  CANT.spans.forEach(S => { out.bridges[S.a + '-' + S.b] = fmt(walk([S.la[0], S.la[1], S.ya], [[S.ax, S.az], [S.bx, S.bz], S.lb])); });
  /* round a canton's square at radius r: the corner points between p and q, the shorter way */
  const ring = (M, r, p, q) => {
    const per = (x, z) => { const lx = x - M.x, lz = z - M.z, R = Math.max(Math.abs(lx), Math.abs(lz)) || 1; let s; if (lx >= R - 1e-6) s = (lz + R) / (8 * R); else if (lz >= R - 1e-6) s = 0.25 + (R - lx) / (8 * R); else if (lx <= -R + 1e-6) s = 0.5 + (R - lz) / (8 * R); else s = 0.75 + (lx + R) / (8 * R); return s; };
    const C = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(c => [M.x + c[0] * r, M.z + c[1] * r]), cs = [0.25, 0.5, 0.75, 1.0];
    let a = per(p[0], p[1]), b = per(q[0], q[1]), out = [], fwd = ((b - a) + 1) % 1 <= 0.5;
    if (fwd) { for (let k = 0; k < 4; k++) { const c = cs[k] % 1; if (((c - a + 1) % 1) < ((b - a + 1) % 1) && ((c - a + 1) % 1) > 0) out.push([C[k], (c - a + 1) % 1]); } out.sort((u, v) => u[1] - v[1]); }
    else { for (let k = 0; k < 4; k++) { const c = cs[k] % 1; if (((a - c + 1) % 1) < ((a - b + 1) % 1) && ((a - c + 1) % 1) > 0) out.push([C[k], (a - c + 1) % 1]); } out.sort((u, v) => u[1] - v[1]); }
    return out.map(o => o[0]);
  };
  CANT.chains.forEach(ch => {
    const M = CANT.by[ch.canton], dock = CANT.flights.filter(f => f.canton === M.n && (f.kind === 'dock' || f.kind === 'mole'))[0];
    let p = dock ? [dock.b[0], dock.b[1], dock.y1] : [ch.flights[0].a[0], ch.flights[0].a[1], ch.flights[0].y0];
    const wps = [];
    ch.flights.forEach(f => {
      const lev = M.levels[f.lev], rm = lev.ri ? (lev.ro + Math.max(lev.ri, M.levels[f.lev + 1].ro)) / 2 : lev.ro - 3;
      const from = wps.length ? wps[wps.length - 1] : [p[0], p[1]];
      const rIn = [from[0] + (M.x - from[0]) * 0.0, from[1]];
      /* step in to the ring's middle, round it, out to the flight's foot */
      const toRing = pt => { const lx = pt[0] - M.x, lz = pt[1] - M.z, R = Math.max(Math.abs(lx), Math.abs(lz)); return [M.x + lx * rm / R, M.z + lz * rm / R]; };
      wps.push(toRing(from)); ring(M, rm, toRing(from), toRing(f.a)).forEach(c => wps.push(c)); wps.push(toRing(f.a), f.a, f.b, [f.b[0] - f.n[0] * (f.w / 2 + 2.5), f.b[1] - f.n[1] * (f.w / 2 + 2.5)]);
    });
    out.chains[M.n] = fmt(walk(p, wps)) + ' (top ' + M.top.y.toFixed(1) + ')';
  });
  /* the Ancestry: its dock, round the apron to the ramp's foot, up every face, the summit flight */
  const A = CANT.by.Ancestry, ad = CANT.flights.filter(f => f.canton === 'Ancestry' && f.kind === 'dock')[0];
  if (A && ad) {
    const rm = (A.apron.ro + 116) / 2, F = A.faces, su = CANT.flights.filter(f => f.kind === 'summit')[0];
    const toRing = pt => { const lx = pt[0] - A.x, lz = pt[1] - A.z, R = Math.max(Math.abs(lx), Math.abs(lz)); return [A.x + lx * rm / R, A.z + lz * rm / R]; };
    const p0 = F[0].p0, wps = [toRing(ad.b)].concat(ring(A, rm, toRing(ad.b), toRing(p0)), [toRing(p0), p0]);
    F.forEach(f => wps.push(f.p1));
    if (su) wps.push(su.a, su.b);
    out.ancestry = fmt(walk([ad.b[0], ad.b[1], ad.y1], wps)) + ' (summit ' + (su ? su.y1.toFixed(1) : '?') + ')';
    const P = VC.INT.cantons.Ancestry, D = CANT.doors.filter(d => d.canton === 'Ancestry')[0];
    if (P && D) out.catacombs = fmt(walk([ad.b[0], ad.b[1], ad.y1], [toRing(ad.b)].concat(ring(A, rm, toRing(ad.b), toRing([D.x, D.z])), [toRing([D.x, D.z]), [D.x + D.n[0] * 2, D.z + D.n[1] * 2], [D.x - D.n[0] * 6, D.z - D.n[1] * 6], [D.x - D.n[0] * 60, D.z - D.n[1] * 60]])));
  }
  return out;
})();
  out.spans = CANT.audit.spans.map(s => ({ id: s.id, ok: s.ok, grade: s.grade, big: s.big.length, levels: s.levels }));
  out.cantonFlights = CANT.audit.flights.filter(f => !f.ok).map(f => f.canton);
  out.interiors = Object.keys(VC.INT.cantons).map(n => { const P = VC.INT.cantons[n]; return n + ' ' + P.storeys.length + 's ' + P.rooms.length + 'r'; });
  { const furn = {}; P.districts.forEach(d => (d.art || []).forEach(a => { if (/market_stall|bench|lantern|well|brazier/.test(a.key)) furn[a.key] = (furn[a.key] || 0) + 1; }));
    out.furnish = { pieces: furn, walks: (VC.parkWalks || []).length, parkFlora: (VC.parkFlora || []).length }; }
  out.vessels = VC.vesselStats || {};
  out.floraEdit = { tracked: VC.FL.list.length, unmapped: VC.FL.list.filter(e => !e.hide.length).length };
  /* every lot building's interior (41-vc-building-interiors.js): the report, and one unit of each type drawn (the cutaway's group) */
  { const R = VC.IX.report, want = alive.filter(L => VC.ixProgram(L)).length;
    out.ix = R ? { err: VC.IX.error || null, want, units: R.units, types: R.types, rooms: R.rooms, pieces: R.pieces, residents: R.residents, homes: R.homes, need: R.need, have: R.have,
      short: R.short, shells: R.shells, failed: R.failed, dropped: R.dropped, ms: [VC.IXD.probeMs, VC.IXD.planMs],
      byClass: Object.keys(R.byClass).map(k => [k, R.byClass[k].homes, R.byClass[k].residents, R.byClass[k].need, R.byClass[k].beds, R.byClass[k].short, R.byClass[k].shortResidents]),
      byDistrict: Object.keys(R.byDistrict).sort((a, b) => R.byDistrict[b].shortResidents - R.byDistrict[a].shortResidents).slice(0, 12).map(k => [k, R.byDistrict[k].homes, R.byDistrict[k].residents, R.byDistrict[k].shortResidents]),
      jobs: Object.keys(R.jobs).map(k => [k, R.jobs[k].units, R.jobs[k].jobs, R.jobs[k].target, R.jobs[k].posts, Object.keys(R.jobs[k].kinds).map(f => f + ' ' + R.jobs[k].kinds[f].n).join(', ')]),
      fallback: R.typeList.filter(t => t.shell === 'fallback').map(t => t.type), lotUnits: VC.IX.lotUnits,
      sites: R.sites, spare: R.spare, kit: (R.kit || []).map(k => [k.key, k.cls, k.storeys, k.rooms, k.pieces, k.beds, k.posts, k.fail]) } : { err: VC.IX.error || 'no report' };
    if (R) {
      const seen = {}, drawErr = []; let drawn = 0;
      VC.IX.units.forEach(u => { if (seen[u.type] || drawn >= 12) return; seen[u.type] = 1; try { const g = VC.ixDraw(u.i); if (!g || !g.userData.stats.rooms) drawErr.push(u.type); else drawn++; VC.ixShow(u.i, false); } catch (e) { drawErr.push(u.type + ': ' + e.message); } });
      const u = VC.IX.units.find(q => q.residents && q.short == null && VC.IX.types[q.type].storeys > 1);
      if (u) { VC.cutTo(u.i, 1); out.ix.cut = { unit: u.i, storey: VC.INTD.cut.storey, shown: VC.IXD.groups[u.i].visible, bar: document.getElementById('cut-storey').innerText.trim().slice(0, 120) }; VC.cutOff(); out.ix.cut.off = !VC.IXD.groups[u.i].visible; }
      out.ix.drawn = drawn; out.ix.drawErr = drawErr;
      VC.ixDensityToggle(); out.ix.density = document.getElementById('ixlegend').innerText.split('\n')[0]; VC.ixDensityToggle(); VC.ixDensityToggle();
      out.ix.densityWork = document.getElementById('ixlegend').innerText.split('\n').slice(0, 4).join(' | '); VC.ixDensityToggle(); out.ix.densityOff = VC.IXD.density === 0;
    }
  }
  /* phase B (42-vc-sim-places.js): the citizens' buildings, the wells, the places, the 90% rule */
  { const S = VC.SIMB || {}, A = S.audit || { rows: [], total: {} }, T = TUNE.sim.place;
    const trades = {}; T.trades.forEach(tr => trades[tr.key] = [(S.placed && S.placed.trades[tr.key] || []).length, tr.n]);
    const byKind = {}; (S.list || []).forEach(o => { const g = /^ix\./.test(o.id) ? 'building:' + o.kind : /^room\./.test(o.id) ? 'canton room' : /^well\./.test(o.id) ? 'well' : /^open\./.test(o.id) ? 'open:' + o.kind : 'work:' + o.kind; byKind[g] = (byKind[g] || 0) + 1; });
    const censusRows = Object.keys(P.census.byJob).filter(k => P.census.byJob[k].n > 0);
    out.simb = { err: S.error || null, log: S.log, wells: S.wellCount, wellPieces: (S.wells || []).length, places: S.places, simPlaces: SIM.all ? SIM.all('place').length : null, byKind, trades,
      watch: (S.placed && S.placed.watch || []).length, caravanserai: S.placed && S.placed.caravanserai != null, berth: S.placed && S.placed.berth != null,
      fortressWatch: (S.list || []).some(o => o.kind === 'watch'), total: A.total, rows: A.rows.map(r => [r.job, r.workplaces, r.target, r.posts, r.building, r.canton, r.outdoor, r.short, (r.room || []).slice(0, 3).map(x => x.name + ' (' + x.district + ', ' + x.floor + ' m2, ' + x.posts + ' posts)').join('; ')]),
      noPlace: censusRows.filter(k => !A.rows.some(r => r.job === k && r.places)), census: [P.census.population, P.census.workforce, P.census.jobs],
      spots: (S.list || []).reduce((a, o) => [a[0] + (o.spots && o.spots.length ? 1 : 0), a[1] + (o.spots ? o.spots.length : 0)], [0, 0]),
      workNoSpot: (S.list || []).filter(o => /^ix\./.test(o.id) && o.posts >= 1 && !(o.spots && o.spots.length)).length,
      sized: (S.list || []).filter(o => /^ix\./.test(o.id) && o.kind === 'tavern').slice(0, 1).map(o => o.activities) };
  }
  /* phase C (43-vc-sim-nav.js, 44-vc-sim-people.js): the pedestrian layer, the citizens, their jobs and commutes */
  { const D = VC.PED || {}, R = VC.PEOPLE;
    out.simc = { err: D.error || null, audit: D.audit || null, ms: D.ms, crossings: D.crossings, joins: D.joins, reached: D.reached, islands: D.islands, plazas: D.plazas, cant: D.cant,
      people: R ? Object.assign({}, R, { byJob: Object.keys(R.byJob).map(k => [k, R.byJob[k].posts, R.byJob[k].filled, R.byJob[k].how, R.unfilledByJob[k] ? R.unfilledByJob[k].posts : 0, R.byJob[k].commute]),
        byClass: Object.keys(R.byClass).map(k => [k, R.byClass[k].people, R.byClass[k].workers, R.byClass[k].employed, R.byClass[k].gentry || 0, R.byClass[k].commute]) }) : null,
      actors: SIM.all ? SIM.all('actor').filter(a => !a.driven && !a.transient && !a.animal).length : 0, check: SIM.check ? SIM.check() : null,
      walk: R ? VC.simWalkSample(300) : null, d8: R ? VC.simDecideSample(200, 8) : null, d2: R ? VC.simDecideSample(200, 2) : null,
      html: R ? /Phase C/.test(VC.peopleReportHTML()) : false };
    /* the outside stairs: the walker stands on each sampled one mid-flight at its height (core/walk KWALK) */
    const St = D.audit && D.audit.stairs, SE = (D.edges || []).filter(e => e.kind === 'stairs');
    let wk = 0, wkOk = 0; for (let i = 0; i < SE.length; i += Math.max(1, Math.floor(SE.length / 80))) { const a = D.nodes[SE[i].a], b = D.nodes[SE[i].b], y = (a.y + b.y) / 2; wk++;
      if (KWALK.floorsAt((a.x + b.x) / 2, (a.z + b.z) / 2).some(f => /^stair/.test(f[1].tag) && Math.abs(f[0] - y) < 0.3)) wkOk++; }
    out.simc.stairs = St ? Object.assign({}, St, { walkerSampled: wk, walkerOk: wkOk }) : null;
    /* phase C session 2: the week run headless: a workday (day 1) through, the rest day's morning; who is essential */
    if (R && VC.simDay) {
      const lf0 = SIM.LOG.length, rf0 = SIM.routeFail.length;
      out.simc.workday = VC.simDay(1, 0, 24, [3, 10, 15, 20]);
      /* phase C session 3: a second workday on from the first (the meters carried over): do the needs hold steady? */
      out.simc.workday2 = SIM.NEED ? VC.simDay(2, 0, 24, [10, 20]) : null;
      out.simc.needs = VC.simNeedsReport ? VC.simNeedsReport() : null;
      out.simc.items = VC.simItemsReport ? VC.simItemsReport() : null;   /* phase D: after the two workdays */
      if (out.simc.items) out.simc.items.legsBy = SIM.legsBy;
      out.simc.econ = VC.simEconomyReport ? VC.simEconomyReport() : null;   /* phase E: after the two workdays */
      out.simc.animals = VC.simAnimalsReport ? VC.simAnimalsReport() : null;   /* the animals: after the two workdays */
      out.simc.buckets = VC.SIMBUCKETS ? { offsets: VC.SIMBUCKETS.offsets, workers: VC.SIMBUCKETS.workers, others: VC.SIMBUCKETS.others, lag: SIM.LAG } : null;
      if (out.simc.needs) { const NR = out.simc.needs, top = o => Object.keys(o).sort((p, q) => o[p].happy - o[q].happy).slice(0, 6).map(k => [k, o[k].n, o[k].happy, o[k].eff]);
        out.simc.needs = { all: NR.all, byClass: Object.keys(NR.byClass).map(k => [k, NR.byClass[k].n, NR.byClass[k].happy]), worstTrades: top(NR.byTrade), atWork: Object.keys(NR.atWork).length,
          deficits: NR.deficits, full: NR.full, traits: [...new Set(SIM.all('actor').map(a => a.trait))].length }; }
      out.simc.restday = VC.simDay(1 + ((TUNE.sim.week.rest - 1 + 7) % 7), 7, 12, [8, 10, 11]);
      out.simc.stuck = SIM.LOG.filter(e => e.kind === 'stuck').length; out.simc.nopath = SIM.LOG.filter(e => e.kind === 'nopath').length; out.simc.routeFail = SIM.routeFail.length - rf0;
      const restOf = a => { const Ro = SIM.R.role[a.role]; return Ro.week && Ro.week[TUNE.sim.week.rest]; };
      out.simc.restWorkers = SIM.all('actor').filter(a => a.activity === 'WORK' && restOf(a) === 'rest').length;   /* the slaves' half shift ('half') works */
      out.simc.slavesHalf = SIM.all('actor').filter(a => a.cls === 'slave' && restOf(a) === 'half').length;
      out.simc.worship = VC.simWorshipNeed ? VC.simWorshipNeed() : null; out.simc.slaves = R.slaves;
      /* the rest day's buildings and shrines (owner, 2026-10-12) */
      const B = VC.SIMB || {}, clans = VC.IX.units.filter(u => u.cls === 'clan');
      out.simc.faith = { temples: (B.temples || []).filter(t => t.lot != null && PLAN.lots[t.lot].died == null).map(t => t.key + ' ' + t.side), templeWhy: (B.temples || []).filter(t => t.lot == null).map(t => t.key + ': ' + t.why),
        chapels: ((B.placed || {}).chapels || []).length, shrines: B.shrines || null, clans: clans.length,
        clanShrines: clans.filter(u => (VC.IX.types[u.type].pieces || []).some(p => /^voth_shrine_/.test(p.key))).length,
        villageShrines: (B.villageShrines || []).filter(q => q.lot != null && PLAN.lots[q.lot].died == null && SIM.all('place').some(p => p.kind === 'shrine' && p.activities.WORSHIP > 0 && Math.hypot(p.x - q.x, p.z - q.z) < 25)).length,
        villageWhy: (B.villageShrines || []).filter(q => q.lot == null).map(q => q.why), villageWant: TUNE.sim.place.villageShrine.n, worshipShort: B.worshipShort || null };
      /* the benched squares by the cantons (owner, 2026-10-12): every canton listed has one, each a place with seats, none
         under a standing building */
      const SQ = B.squares || {}, sqBy = {}, sqHit = [];
      Object.keys(SQ).forEach(gid => { const G = PLAN.greens[gid], o = obb(polyCentroid(G.poly), V.norm(V.sub(G.poly[1], G.poly[0])), V.dist(G.poly[0], G.poly[1]) / 2 - 0.5, V.dist(G.poly[1], G.poly[2]) / 2 - 0.5);
        sqBy[SQ[gid].canton] = (sqBy[SQ[gid].canton] || 0) + 1;
        PLAN.lots.forEach(L => { if (L.died == null && L.bo && Math.hypot(L.x - o.c[0], L.z - o.c[1]) < 80 && SL.pen(o, L.bo) > 0.3) sqHit.push(gid + ':' + L.id); }); });
      /* the shipwright's docks (owner, 2026-10-13: "make sure the river shipwright doesn't actually block the river"):
         each placed, open water beyond its slip, no ferry's way over its slip (the routes as baked) */
      const SW = (B.shipwrights || []).filter(q => q.lot != null), lanes = [];
      SIM.all('transport').forEach(T => { if (T.layer === 'water') (T.legs || []).forEach(L => { if (L.path && L.path.pts) lanes.push(L.path.pts); }); });
      out.simc.shipwrights = { placed: SW.length, want: TUNE.sim.place.shipwright.roles.length, why: (B.shipwrights || []).filter(q => q.lot == null).map(q => q.why),
        docks: SW.map(q => { const o = q.slip, hit = lanes.reduce((n, P) => { for (let i = 0; i < P.length; i++) if (VC.simInObb([P[i][0], P[i][2]], o, TUNE.sim.place.shipwright.laneClear - 1)) n++; return n; }, 0);
          return { role: q.role, open: q.open, laneHits: hit }; }) };
      out.simc.squares = { by: sqBy, want: TUNE.sim.place.squares.cantons.map(c => c[0]), hit: sqHit.slice(0, 10), places: SIM.all('place').filter(p => /^Benched square/.test(p.name || '') && p.activities.SOCIALIZE > 0 && (p.spots || []).length).length, n: Object.keys(SQ).length };
      out.simc.roles = SIM.all('role').length; out.simc.firstJumpMs = VC.SIMRUN.jumpMs; out.simc.bodies = !!(VC.SIMBODY && VC.SIMBODY.mesh);
    }
  }
  return out;
}"""


def week_bad(sc):
    """phase C session 2: a workday and the rest day, run headless: asleep at 3, everyone who wants to work at work by 10
    with next to nothing waiting (0.5%: with needs, wishes change all day), the rest day's work only the essential kinds' (fewer than half the workday's), the steps
    bounded, nothing stuck or unroutable"""
    w, r = sc['workday'], sc['restday']; s3, s10, r10 = w['samples'].get('3') or w['samples'].get(3), w['samples'].get('10') or w['samples'].get(10), r['samples'].get('10') or r['samples'].get(10)
    n = sum(s3['by'].values())
    bad = s3['by'].get('SLEEP', 0) < 0.9 * n or s10['pending'] > 0.005 * n or s10['by'].get('WORK', 0) < 0.98 * s10['wantWork'] \
        or r10['by'].get('WORK', 0) >= 0.5 * s10['by'].get('WORK', 1) or sc['restWorkers'] or w['p50'] > 120 or w['max'] > 4000 \
        or sc['stuck'] or sc['nopath'] or sc['routeFail'] or not sc['bodies'] or sc.get('slavesHalf', 0) != sc.get('slaves', -1) \
        or len(sc['faith']['temples']) < 2 or sc['faith']['chapels'] < 3 or not (sc['faith']['shrines'] or {}).get('pocket') or sc['faith']['clanShrines'] != sc['faith']['clans'] \
        or sc['worship']['short'] or sc['faith'].get('villageShrines', 0) < sc['faith'].get('villageWant', 2) \
        or any(not sc['squares']['by'].get(c) for c in sc['squares']['want']) or sc['squares']['hit'] or sc['squares']['places'] != sc['squares']['n'] \
        or sc['shipwrights']['placed'] < sc['shipwrights']['want'] or any(d['open'] < 40 or d['laneHits'] for d in sc['shipwrights']['docks'])
    return bad


def needs_bad(sc):
    """phase C session 3: the needs: everyone has meters and a trait, nothing NaN; at 20:00 on the second workday the mean
    happiness is between 40 and 99 and within 8 of the first workday's (the meters hold steady), no need's mean at 70 or
    more (material waits for phase D); labourers leave work for a drink at 10:00 on both workdays (the well trip)"""
    n, w1, w2 = sc.get('needs'), sc.get('workday'), sc.get('workday2')
    if not n or not w2: return 'no needs'
    g = lambda d, h: (d['samples'].get(str(h)) or d['samples'].get(h) or {})
    a, b = g(w1, 20).get('needs'), g(w2, 20).get('needs')
    if not a or not b: return 'no needs sampled'
    if any(v != v for v in [b['happy']] + list(b['mean'].values())): return 'NaN'
    if not (40 <= b['happy'] <= 99) or abs(b['happy'] - a['happy']) > 8: return 'happiness %s then %s' % (a['happy'], b['happy'])
    over = [k for k, v in b['mean'].items() if v >= 70]
    if over: return 'needs at 70 or more: %s' % over
    if not g(w1, 10).get('by', {}).get('DRINK') or not g(w2, 10).get('by', {}).get('DRINK'): return 'no well trips at 10:00'
    if n['traits'] < 8: return 'traits %s' % n['traits']
    return None


def items_bad(sc):
    """phase D: after two workdays: every slot holds by the rules; next to nobody (0.1%: on their way to buy) is missing a
    worn shirt, legs or feet; food,
    clothes, a tool replaced during work time and a poultice were bought; most meals are full meals, some eaten out, next
    to none (0.2%) scraps; every item has a seller; the chinampa growers go by kayak"""
    it = sc.get('items')
    if not it: return 'no items'
    if it['slotErrors']: return 'slot errors %d' % it['slotErrors']
    bare, n = sum(k['bare'] for k in it['kept'].values()), sum(k['n'] for k in it['kept'].values())
    if bare > 0.001 * n: return 'missing a worn item: %d' % bare   # a few are on their way to buy one
    b = it['bought']
    if not any(b.get(f) for f in ('corn', 'peppers', 'mushrooms', 'fish', 'eggs', 'bread')): return 'no food bought'
    if not any(b.get(c) for c in ('shirt', 'trousers', 'dress', 'shoes')): return 'no clothes bought'
    if not it['tools']['replacedAtWork']: return 'no tool replaced during work time'
    if not it['hurt']['poultices']: return 'no poultice bought'
    m = it['meals']; tot = m['meal'] + m['single'] + m['none'] + m['bought'] + m['mess']
    if not tot or (m['meal'] + m['bought'] + m['mess']) < 0.7 * tot: return 'full meals %s of %s' % (m['meal'] + m['bought'] + m['mess'], tot)
    if not isinstance(it.get('unsold'), list): return 'no list of items no shop sells'
    if it['unsold']: return 'no shop sells %s' % it['unsold']
    if not m['bought']: return 'nobody ate out'
    if m['none'] > 0.002 * tot: return 'scraps %d of %d meals' % (m['none'], tot)
    k = (it.get('setup') or {}).get('kayaks') or {}
    if not k.get('people') or not (it.get('legsBy') or {}).get('kayak'): return 'no kayak trips (%s, legs %s)' % (json.dumps(k), json.dumps(it.get('legsBy')))
    return None


FOODS = ('corn', 'peppers', 'mushrooms', 'fish', 'eggs', 'bread')


def econ_bad(sc):
    """phase E: after two workdays: every kind of producer, the warehouses and the 50 carts are set up; every food was
    made and hauled; no food ran out in the warehouses (short under 1% of what was used) or lasts under a day; the
    kitchens made nearly every meal (0.2%); an import sent was delivered or is on its way; the road's caravans and the
    sea's ships are set up, and imports come by carrier"""
    e = sc.get('econ')
    if not e: return 'no economy'
    su = e.get('setup') or {}
    pr = su.get('producers') or {}
    miss = [k for k in ('field', 'chinampa', 'mushfarm', 'fishdock', 'ranch', 'voth_bldg_bakery', 'voth_bldg_weaver', 'mine') if not pr.get(k)]
    if miss: return 'no producers: %s' % miss
    if su.get('carts') != 50 or not su.get('warehouses'): return 'carts %s, warehouses %s' % (su.get('carts'), su.get('warehouses'))
    g = e['goods']
    for f in FOODS:
        G = g[f]
        if not G['made'] or not G['hauled']: return '%s made %s, hauled %s' % (f, G['made'], G['hauled'])
        if G['short'] > 0.01 * max(1, G['used']): return '%s short %s of %s used' % (f, G['short'], G['used'])
        if G['days'] is not None and G['days'] < 1: return '%s lasts %s days' % (f, G['days'])
    if e.get('mealsOut', 0) > 0.002 * max(1, sum(g[f]['used'] for f in FOODS) / 4): return 'kitchens short %s meals' % e.get('mealsOut')
    imp = sum(G['imported'] for G in g.values())
    if e['sent'] and not imp and not e['inflight']: return 'imports sent %s, none delivered or on the way' % e['sent']
    cr = su.get('carriers') or {}
    if 'road' not in cr or 'sea' not in cr: return 'carriers %s (by timer: %s)' % (sorted(cr), json.dumps(su.get('noCarrier')))
    ld = e.get('landed') or {}
    if imp and not ld.get('carrier'): return 'no import came by a carrier (%s)' % json.dumps(ld)
    return None


def animals_bad(sc):
    """the animals (owner, 2026-10-13): after two workdays: every kind of pen has its herd and the arena its beasts; they
    feed, drink and rest by their needs (a good share doing each over the run is not checked: what they do now is one
    sample) and are in fair condition (happiness 50 or more on average); milk and cheese were made; meat animals are
    slaughtered once grown, a newborn in their place; the arena held its bouts and each was decided"""
    an = sc.get('animals')
    if not an: return 'no animals'
    su = an.get('setup') or {}
    he = su.get('herds') or {}
    miss = [k for k in ('beetle', 'cow', 'pig', 'duck') if not he.get(k)]
    if miss: return 'no herds of %s' % miss
    if not (su.get('arena') or {}).get('beasts'): return 'no arena beasts (%s)' % json.dumps(su.get('why'))
    bad = [k for k, B in an['bySpecies'].items() if B['happy'] < 50]
    if bad: return 'animals in poor condition: %s' % json.dumps({k: an['bySpecies'][k] for k in bad})
    e = sc.get('econ') or {}
    g = e.get('goods') or {}
    nomade = [k for k in ('milk', 'cheese') if not (g.get(k) or {}).get('made')]
    if nomade: return 'not made: %s' % nomade
    # slaughter and birth (owner, 2026-10-13): meat animals are slaughtered once grown, a newborn a year from grown in each
    # one's place; the young of pigs and ducks exist; a slaughter happened, or the next is due within a day
    sl = an.get('slaughter') or {}
    if an.get('badAges'): return 'young not a year from grown: %s' % an['badAges']
    if not (an.get('young') or {}).get('pig') or not (an.get('young') or {}).get('duck'): return 'no young pigs or ducks: %s' % json.dumps(an.get('young'))
    if not sum(v['n'] for v in sl.values()) and not (an.get('nextSlaughterMins') is not None and an['nextSlaughterMins'] <= 1440): return 'no slaughter, the next in %s minutes' % an.get('nextSlaughterMins')
    if sl.get('pig') and not (g.get('pork') or {}).get('made'): return 'pigs slaughtered, no pork'
    # the pets (owner, 2026-10-13): a dog and a cat for every 40 citizens; they roam and mingle by day, sleep at home, eat nothing
    pe, ph = an.get('pets') or {}, an.get('petHours') or {}
    want = (an.get('citizens') or 0) // (an.get('petsPer') or 40)
    bk = sc.get('buckets') or {}
    if bk.get('workers') and max(bk['workers']) > 1.1 * min(bk['workers']): return 'buckets unbalanced: %s' % bk['workers']
    if not want or pe.get('dog') != want or pe.get('cat') != want: return 'pets %s, want %s of each' % (json.dumps(pe), want)
    if not ph.get('ROAM') or not ph.get('MINGLE') or not ph.get('BED'): return 'pets do not roam, mingle and sleep: %s' % json.dumps(ph)
    if ph.get('EAT') or ph.get('FEED') or ph.get('DRINK'): return 'pets ate or drank: %s' % json.dumps(ph)
    if any(ph.get(k) for k in ('SOCIALIZE', 'REST', 'IDLE', 'RELAX')): return 'pets in the citizens\' places: %s' % json.dumps(ph)
    if len(an['bouts']) < 2 or any(not B['won'] for B in an['bouts'][:-1]): return 'bouts %s' % json.dumps(an['bouts'])
    return None


def verify_city(a, port, rel, sync_playwright):
    errors = []
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        page = b.new_page(viewport={'width': 1000, 'height': 760})
        page.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        page.goto('http://127.0.0.1:%d/%s?lite=1' % (port, rel))
        page.wait_for_function('window._vc && window._vc.ready', timeout=900000)
        r = page.evaluate(CITY_CHECK)
        if a.shot:
            page.evaluate("() => { document.getElementById('v-map').onclick(); HOST.layers.lots = true; HOST.applyStep(); }")
            page.wait_for_timeout(3000)
            page.screenshot(path=a.shot)
        b.close()
    print('\n'.join(r['log']))
    print('pass ms', r['ms'])
    print('standing lots', r['lots'], '; ways', json.dumps(r['ways']), '; named gates', r['named'])
    print('overlapping building pairs %d, buildings in water %d, on the wall %d; wall to nearest avenue %s m' % (r['overlapPairs'], r['wet'], r['onWall'], r['wallClear']))
    print('transit', json.dumps(r['transit']), '; SIM', json.dumps(r['sim']))
    print('highways by', r['highwayVia'], '; lots on highways', r['lotsOnHighways'], ', buildings on them', r['buildingsOnHighways'], '; wall', json.dumps(r['wall']))
    print('clan compounds', r['clans'], '; chinampa pieces in the exclusion', r['chinInExclusion'], '; monastery', json.dumps(r['monastery']), ', pieces in parks', r['monasteryInParks'])
    print('fishing docks', r['fishDocks'], '; river quays: largest |cos| to the current %.2f' % r['riverQuaysSkew'], '; lowest avenue ground %.2f m' % r['avenueLow'],
          '; lots on bridge ends', r['lotsOnBridgeEnds'], ', bridge approaches', r['bridgeApproaches'])
    print('embassies', r['embassies']['drawn'])
    print('barges', json.dumps(r['barges']))
    print('elephant bugs and bridges', json.dumps(r['striderBridges']))
    print('flora', json.dumps(r['flora']), '; light', json.dumps(r['light']))
    print('country', json.dumps(r['country']), '; ferry docks failing the audit', r['ferryAudit'])
    print('walks: interiors', json.dumps(r['walkInt']), '; outside', json.dumps(r['walkOut']))
    print('canton bridges', json.dumps(r['spans']), '; cantons whose flights failed', r['cantonFlights'])
    print('interiors', r['interiors'], '; park and market furniture', json.dumps(r['furnish']), '; vessels', json.dumps(r['vessels']), '; flora editor', json.dumps(r['floraEdit']))
    ix = r['ix']
    if ix.get('units'):
        pc = lambda a, b: '%d%%' % round(100 * a / b) if b else '-'
        print('interiors: %d buildings (%d with a programme) of %d types, %d rooms, %d pieces; probe %s ms, plan and furnish %s ms; shells %s; fallback shells: %s' %
              (ix['units'], ix['want'], ix['types'], ix['rooms'], ix['pieces'], ix['ms'][0], ix['ms'][1], json.dumps(ix['shells']), ', '.join(ix['fallback']) or 'none'))
        print('  homes %d, residents %d; beds %d of %d (%s), item stores %d (%s), food stores %d (%s); %d homes short, %d short of beds, about %d residents without a bed; %d without a dining room' %
              (ix['homes'], ix['residents'], ix['have']['beds'], ix['need']['beds'], pc(ix['have']['beds'], ix['need']['beds']), ix['have']['items'], pc(ix['have']['items'], ix['need']['items']),
               ix['have']['food'], pc(ix['have']['food'], ix['need']['food']), ix['short']['units'], ix['short']['bedUnits'], ix['short']['residents'], ix['short']['dining']))
        print('  by class [class, homes, residents, beds needed, beds held, homes short, residents without a bed]: ' + '; '.join(' '.join(str(x) for x in c) for c in ix['byClass']))
        print('  by district, worst first [district, homes, residents, residents without a bed]: ' + '; '.join(' '.join(str(x) for x in c) for c in ix['byDistrict']))
        print('  job table [kind of work, buildings, workplaces, 90%, posts: furniture kinds]:')
        for j in ix['jobs']: print('    %s: %d buildings, %d workplaces, target %d, %d posts%s (%s)' % (j[0], j[1], j[2], j[3], j[4], '' if j[4] >= j[3] else ' SHORT', j[5]))
        print('  buildings off the lots [kind: buildings, rooms, pieces, beds, residents, workplaces, posts]: ' + '; '.join(
            '%s %d, %d, %d, %d, %d, %d, %d' % (k, e['units'], e['rooms'], e['pieces'], e['beds'], e['residents'], e['jobs'], e['posts']) for k, e in sorted(ix['sites'].items())))
        print('  beds where the census houses nobody: ' + ('; '.join('%s %d in %d' % (k, e['beds'], e['units']) for k, e in sorted(ix['spare'].items())) or 'none'))
        print('  new kit models (not placed) [key, class, storeys, rooms, pieces, beds, posts, fail]:')
        for k in ix['kit']: print('    ' + ' | '.join(str(x) for x in k))
        print('  drawn %d types, errors %s; cutaway %s; density %s' % (ix.get('drawn', 0), ix.get('drawErr'), json.dumps(ix.get('cut')), ix.get('density')))
    else:
        print('interiors: ' + str(ix.get('err')))
    sb = r['simb']
    print('phase B: ' + '; '.join(sb['log'] or []) + ' (census now %d people, %d working, %d workplaces)' % tuple(sb['census']))
    print('  wells: %d placed %s; places: %d (SIM holds %s): %s' % (sb['wellPieces'], json.dumps(sb['wells']), sb['places'] or 0, sb['simPlaces'], ', '.join('%s %d' % kv for kv in sorted(sb['byKind'].items()))))
    t = sb['total'] or {}
    print('  the 90%% rule: %d workplaces, 90%% is %d, posts meeting it %d; by kind of work [workplaces, 90%%, posts (buildings, canton rooms, outdoor), short, where there is room for more]:' % (t.get('workplaces', 0), t.get('target', 0), t.get('posts', 0)))
    for w in sb['rows']: print('    %s: %d, %d, %d (%d, %d, %d)%s%s' % (w[0], w[1], w[2], w[3], w[4], w[5], w[6], ' SHORT %d' % w[7] if w[7] else '', ' -> ' + w[8] if w[8] else ''))
    if sb['noPlace']: print('  kinds of work with no place: ' + ', '.join(sb['noPlace']))
    print('  spots: %d places have them, %d in all; buildings with work posts and no spot: %d; a tavern\'s activities %s; density work mode: %s' % (sb['spots'][0], sb['spots'][1], sb['workNoSpot'], json.dumps(sb['sized']), ix.get('densityWork')))
    sc = r['simc']; pc = sc['people'] or {}; au = sc['audit'] or {}
    if pc:
        print('phase C: %d citizens (census %d) in %d homes, %d of working age, %d dependants, %d slaves (quarters not built at %d sites); employed %d %s, out of work %d (none within %d m: %d), gentry on their means %d, posts unfilled %d; %d sleep on the floor; deal %d searches, %d ms' % (
            pc['citizens'], pc['census'], pc['homes'], pc['workers'], pc['dependants'], pc['slaves'], pc['quarters'], pc['employed'], json.dumps(pc['how']), pc['unemployed'], pc['walkMax'], pc['noneInReach'], pc['gentry'], pc['unfilled'], pc['floorSleepers'], pc['rounds'], pc['ms']))
        print('  commute m walked (all employed): %s; out of work by district: %s' % (json.dumps(pc['commute']), ', '.join('%s %d' % (x[0], x[1]) for x in pc['unemployedBy'])))
        print('  by class [class, people, of working age, employed, on their means, commute p50/p90]:')
        for c in pc['byClass']: print('    %s: %d, %d, %d, %d, %s' % (c[0], c[1], c[2], c[3], c[4], '%d/%d' % (c[5]['p50'], c[5]['p90']) if c[5] else '-'))
        print('  by kind of work [posts, filled, how, unfilled, commute p50/p90]:')
        for j in pc['byJob']: print('    %s: %d, %d, %s, %d, %s' % (j[0], j[1], j[2], json.dumps(j[3]), j[4], '%d/%d' % (j[5]['p50'], j[5]['p90']) if j[5] else '-'))
    print('  pedestrian layer: %s nodes, %s edges, %s bodies, %s crossings, %s joins, %s reached, %s islands joined, %s plaza hubs, %s ms; cantons %s; off the network %s; canton rooms not joined %s, chinampa huts %s' % (
        au.get('nodes'), au.get('edges'), au.get('bodies'), sc['crossings'], sc['joins'], sc['reached'], sc['islands'], sc['plazas'], sc['ms'], json.dumps(sc['cant']), json.dumps(au.get('far')), au.get('cantonRooms'), au.get('chinampaHuts')))
    print('  outside stairs and ladders: %s' % json.dumps(sc['stairs']))
    for k in ('workday', 'workday2', 'restday'):
        d = sc.get(k)
        if d:
            print('  %s (day %d, weekday %d): steps p50 %s ms, p90 %s, max %s; slowest %s' % (k, d['day'], d['weekday'], d['p50'], d['p90'], d['max'], d['top']))
            for h, c in sorted(d['samples'].items(), key=lambda kv: int(kv[0])):
                print('    %s:00 %s; visiting (company at home) %d; wanted, not had %s; waiting %d; walking %d; want to work %d' % (h, json.dumps(c['by']), c.get('visiting', 0), json.dumps(c['unmet']), c['pending'], c['moving'], c['wantWork']))
                if c.get('needs'): print('      needs: happiness %s, efficiency %s, bands %s, means %s, at 70+ %s' % (c['needs']['happy'], c['needs']['eff'], json.dumps(c['needs']['bands']), json.dumps(c['needs']['mean']), json.dumps(c['needs']['high'])))
    if sc.get('needs'):
        nr = sc['needs']
        print('  needs at the second workday\'s end: by class %s; the unhappiest trades %s; trades at work now %d; traits %d' % (json.dumps(nr['byClass']), json.dumps(nr['worstTrades']), nr['atWork'], nr['traits']))
        print('    deficits %s; full now %s; needs check: %s' % (json.dumps(nr['deficits']), json.dumps(nr['full']), needs_bad(sc) or 'OK'))
    if sc.get('items'):
        it = sc['items']
        print('  things (phase D): setup %s' % json.dumps(it['setup']))
        print('    kept by class %s' % json.dumps(it['kept']))
        print('    bought %s; by kind of shop %s' % (json.dumps(it['bought']), json.dumps(it['byShopKind'])))
        print('    trips %s; errands now %d; failed %s; no shop sells %s (wanted %s); worn out %s' % (json.dumps(it['trip']), it['errandsNow'], json.dumps(it['failed']), it['unsold'], json.dumps(it['noShop']), json.dumps(it['worn'])))
        print('    tools %s; hurt %s; meals %s; stores %s (empty %s); legs by layer %s; slot errors %d; items check: %s' % (json.dumps(it['tools']), json.dumps(it['hurt']), json.dumps(it['meals']), json.dumps(it['stores']), it.get('emptyStores'), json.dumps(it.get('legsBy')), it['slotErrors'], items_bad(sc) or 'OK'))
    if sc.get('econ'):
        e = sc['econ']
        print('  economy (phase E): producers %s; %s warehouses, %s carts (%s), %d loads, %d imports sent, in flight %s' % (json.dumps(e['setup']['producers']), e['setup']['warehouses'], e['setup']['carts'], json.dumps(e['carts']), e['trips'], e['sent'], json.dumps(e['inflight'])))
        for k, G in e['goods'].items():
            print('    %-10s stock %8d at sites %8d  made %7d used %7d imported %6d exported %6d a day  days left %s  short %d' % (k, G['stock'], G['atSites'], G['madeDay'], G['usedDay'], G['importedDay'], G.get('exportedDay', 0), G['days'], G['short']))
        print('    carriers %s; by timer %s; landed %s; under way %s' % (json.dumps(e['setup'].get('carriers')), json.dumps(e['setup'].get('noCarrier')), json.dumps(e.get('landed')), json.dumps(e.get('carriers'))))
        print('    held up %s; out of stock %s; meals the kitchens could not make %s; economy check: %s' % (json.dumps(e['blocked']), json.dumps(e.get('outOf')), e.get('mealsOut'), econ_bad(sc) or 'OK'))
    if sc.get('buckets'):
        bk = sc['buckets']
        print('  the trades in buckets %s (lag %s): workers %s, others %s' % (bk['offsets'], bk['lag'], bk['workers'], bk['others']))
    if sc.get('animals'):
        an = sc['animals']
        print('  animals: setup %s' % json.dumps(an['setup']))
        print('    slaughtered %s; young %s; the next grown in %s minutes' % (json.dumps(an.get('slaughter')), json.dumps(an.get('young')), an.get('nextSlaughterMins')))
        print('    pets %s (one of each per %s of %s citizens); pet-hours %s' % (json.dumps(an.get('pets')), an.get('petsPer'), an.get('citizens'), json.dumps(an.get('petHours'))))
        print('    by species %s; doing %s; bouts %d (%s); healing %d; animals check: %s' % (json.dumps(an['bySpecies']), json.dumps(an['doing']), len(an['bouts']), json.dumps(an['bouts'][-3:]), an['hurt'], animals_bad(sc) or 'OK'))
    if sc.get('worship'):
        wo = sc['worship']
        print('  worship on the rest day at %d:00: %d want it, room for %d at once %s; a shrine holds %d, the largest place %d' % (wo['hour'], wo['want'], wo['room'], json.dumps(wo['byKind']), wo['shrineRoom'], wo['largestRoom']))
        for o in wo['options']: print('    %d service(s), %d%% attend: %d at once, short %d: %s more shrines, or %s more of the largest' % (o['services'], round(o['attend'] * 100), o['atOnce'], o['short'], o['shrines'], o['largest']))
    if sc.get('faith'): print('  the rest day\'s buildings: %s' % json.dumps(sc['faith']))
    if sc.get('squares'): print('  benched squares by the cantons: %s' % json.dumps(sc['squares']))
    if sc.get('shipwrights'): print('  shipwright\'s docks: %s' % json.dumps(sc['shipwrights']))
    if sc.get('worship'): print('    the busiest service: %d want it at %d:00, room %d, short %d; per service %s' % (sc['worship']['want'], sc['worship']['hour'], sc['worship']['room'], sc['worship']['short'], json.dumps(sc['worship']['perService'])))
    if sc.get('workday'): print('  the run: %d roles, the first jump %s ms, stuck %d, no path %d, route failures %d, working on the rest day outside the essential kinds %d, slaves on the half shift %d of %d, bodies %s' % (sc['roles'], sc['firstJumpMs'], sc['stuck'], sc['nopath'], sc['routeFail'], sc['restWorkers'], sc.get('slavesHalf', 0), sc.get('slaves', 0), sc['bodies']))
    print('  A* check %s; decisions at 8 %s; at 2 %s; SIM.check %s; actors %d' % (json.dumps(sc['walk']), json.dumps(sc['d8']), json.dumps(sc['d2']), json.dumps(sc['check']), sc['actors']))
    for e in errors: print('ERROR', e)
    if a.check:
        bad = []
        if r['err'] or errors: bad.append('page errors')
        if r['failed']: bad.append('kit pieces failed')
        if sb['err'] or any(v[0] < v[1] for v in sb['trades'].values()) or sb['watch'] < 3 or not sb['fortressWatch'] or not sb['caravanserai'] or not sb['berth']:
            bad.append('phase B buildings: ' + json.dumps({k: v for k, v in sb['trades'].items() if v[0] < v[1]}) + (' watchhouses %d' % sb['watch'] if sb['watch'] < 3 else '') + ('' if sb['caravanserai'] else ' no caravanserai') + ('' if sb['berth'] else ' no berth'))
        if sb['wellPieces'] < 100 or not sb['places'] or (sb['simPlaces'] or 0) < sb['places'] or sb['noPlace'] or not sb['rows'] or not sb['spots'][1] or sb['workNoSpot'] or not ix.get('densityOff') or 'Work posts' not in (ix.get('densityWork') or ''):
            bad.append('phase B places (wells %d, places %s of SIM %s, kinds of work with no place %s)' % (sb['wellPieces'], sb['places'], sb['simPlaces'], sb['noPlace']))
        c = ix.get('cut') or {}
        if ix.get('err') or not ix.get('units') or ix['lotUnits'] < ix['want'] or ix['failed'] or ix.get('drawErr') or not c.get('shown') or not c.get('off') or not ix['have']['beds'] or len(ix['jobs']) < 8:
            bad.append('building interiors (VC.IX)')
        st = ix.get('sites') or {}
        if any(not st.get(k, {}).get('units') for k in ('dorm', 'chapel', 'hall', 'shrine', 'lighthouse', 'funerary', 'hut', 'healing')):
            bad.append('interiors of the buildings off the lots: ' + ', '.join(k for k in ('dorm', 'chapel', 'hall', 'shrine', 'lighthouse', 'funerary', 'hut', 'healing') if not st.get(k, {}).get('units')))
        if any(k[7] or not k[4] for k in ix.get('kit', [])) or len(ix.get('kit', [])) < 8:
            bad.append('new kit models without an interior')
        if sc['err'] or not pc or au.get('bodies') != 1 or au.get('cutOff') or pc['citizens'] != pc['census'] or sc['actors'] != pc['citizens'] + pc['slaves'] or sc['check'] \
                or pc['unemployed'] > 0.1 * pc['workers'] or not sc['walk'] or sc['walk']['fail'] or not sc['html'] \
                or sc['d8']['wrong'] or sc['d8']['failed'] or sc['d8']['none'] or sc['d2']['wrong'] or sc['d2']['failed'] or sc['d2']['none'] or sc['d2']['pinned'] < 0.95 * sc['d2']['asked'] \
                or not sc['stairs'] or not sc['stairs']['stairs'] or sc['stairs']['headsOnMain'] != sc['stairs']['heads'] or sc['stairs']['routed'] != sc['stairs']['tried'] \
                or not sc['stairs']['walkerSampled'] or sc['stairs']['walkerOk'] != sc['stairs']['walkerSampled'] \
                or not sc.get('workday') or week_bad(sc) or needs_bad(sc) or items_bad(sc) or econ_bad(sc) or animals_bad(sc):
            bad.append('phase C: citizens and the pedestrian layer (bodies %s, cut off %s, citizens %s of %s, out of work %s, A* fails %s, decisions %s / %s, stairs %s)' % (
                au.get('bodies'), json.dumps(au.get('cutOff')), pc.get('citizens'), pc.get('census'), pc.get('unemployed'), sc['walk'] and sc['walk']['fail'], json.dumps(sc['d8']), json.dumps(sc['d2']), json.dumps(sc['stairs'])))
        if len([g for g in r['named'] if not g.endswith('?')]) < 3: bad.append('named gates')
        if r['ways'].get('highway', 0) < 5: bad.append('highways')
        if r['overlapPairs'] or r['wet'] or r['onWall']: bad.append('buildings overlap, stand in water or on the wall')
        if r['wallClear'] < 15: bad.append('wall too close to an avenue')
        for k in ('avenue', 'main', 'side', 'alley', 'lane'):
            if not r['ways'].get(k): bad.append('no ' + k)
        if len(r['highwayVia']) < 2 or any(int(v.split()[1]) > 70 for v in r['highwayVia']): bad.append('highways by S10 and S11')
        if r['lotsOnHighways'] or r['buildingsOnHighways']: bad.append('buildings on or along the highways')
        if not r['wall'] or r['wall']['ruined'] or r['wall']['gatesOffRoad']: bad.append('wall ruined, or a gate off its road')
        if r['clans'] < 7: bad.append('fewer than 7 clan compounds')
        if r['chinInExclusion']: bad.append('chinampas in the exclusion')
        m = r['monastery']
        if r['monasteryInParks'] or m.get('dorm', 0) < 4 or m.get('coop', 0) < 6 or m.get('field', 0) < 10: bad.append('monastery')
        if r['fishDocks'] < 4: bad.append('fishing docks')
        if r['riverQuaysSkew'] > 0.5: bad.append('river quays not square to the current')
        if r['avenueLow'] < 0.5: bad.append('an avenue in the water')
        if r['lotsOnBridgeEnds'] or r['bridgeApproaches'] < 2: bad.append('bridge ends')
        c = r['country']
        if not (c['suburb'] and c['farms'] and c['fields'] and c['orchard'] and len(c['villages']) >= 3): bad.append('country')
        f = r['flora']
        if f.get('error') or not f.get('trees') or not f.get('inParks') or not f.get('bySpecies', {}).get('baobab'): bad.append('flora (swbay): parks and savannah')
        if r['striderBridges']['under'] or r['striderBridges']['offDeckHeight']: bad.append('elephant bugs under or beside a bridge')
        if r['barges'].get('clash'): bad.append('river barges touching piers')
        lt = r['light']
        if lt.get('powerHouses', 0) < 1 or not lt.get('lamps', {}).get('fancy') or not lt.get('lamps', {}).get('electric'): bad.append('power and light')
        if len(r['embassies']['drawn']) < r['embassies']['wanted']: bad.append('embassies: ' + ', '.join(r['embassies']['drawn']))
        if r['ferryAudit']: bad.append('ferry docks: ' + ', '.join(r['ferryAudit']))
        wi, wo = r['walkInt'], r['walkOut']
        bad_walks = [k for k, v in wi.items() if not str(v).startswith('OK')] + [k for k, v in list(wo['bridges'].items()) + list(wo['chains'].items()) if not str(v).startswith('OK')] + \
            [k for k in ('ancestry', 'catacombs') if not str(wo.get(k)).startswith('OK')]
        if bad_walks: bad.append('cantons not walkable: ' + ', '.join(bad_walks))
        if any(not s['ok'] or s['big'] or (s['grade'] or 0) > 0.11 for s in r['spans']): bad.append('canton bridges (grade, clearance)')
        if r['cantonFlights']: bad.append('terrace flights: ' + ', '.join(r['cantonFlights']))
        fu = r['furnish']
        if not fu['pieces'].get('voth_market_stall') or not fu['pieces'].get('voth_lantern_fixture') or not fu['walks'] or not fu['parkFlora']: bad.append('market stalls and park walks')
        if not r['vessels'].get('moored', {}).get('vothJunk') or not r['vessels'].get('moored', {}).get('vothDhow'): bad.append('Ring Sea vessels')
        if not r['floraEdit']['tracked'] or r['floraEdit']['unmapped']: bad.append('flora editor: trees not mapped to their meshes')
        sm = r['sim']
        if sm['routes'] != r['transit']['lines'] or sm['bad'] or sm['problems'] or not sm['pure'] or not sm['vehicles'] or sm['berthClash']: bad.append('transit routes (core/simulation)')
        if bad:
            sys.exit('FAIL: ' + ', '.join(bad))
        print('OK')


def verify_site(a, port, rel, sync_playwright):
    errors = []
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        page = b.new_page(viewport={'width': 1000, 'height': 760})
        page.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        page.goto('http://127.0.0.1:%d/%s' % (port, rel))
        page.wait_for_function('window._site && window._site.ready', timeout=600000)
        r = page.evaluate(SITE_CHECK)
        if a.shot:
            page.evaluate("() => document.getElementById('v-map').onclick()")
            page.wait_for_timeout(3000)
            page.screenshot(path=a.shot)
        b.close()
    print('site loaded from', r['from'], '; cantons placed %d of %d: %s' % (len(r['cantons']), len(r['all']), ', '.join(r['cantons'])))
    print('tools', json.dumps(r['tools']), '; ground', json.dumps(r['ground']))
    print('bridges', json.dumps(r['bridges']))
    for e in errors: print('ERROR', e)
    if a.check:
        bad = []
        if r['err'] or errors: bad.append('page errors')
        if len(r['cantons']) != len(r['all']): bad.append('cantons missing')
        t = r['tools']
        if t['newMarkers'] != 2 or t['afterUndo'] != 1 or t['afterRedo'] != 2: bad.append('tools')
        if t['stations'] != 3 or t['routes'] != 1 or t['dockStops'] != 11: bad.append('stations/routes')
        if t['avenues'] != 1 or t['causeways'] != 1 or not t['cwPrims'] or t['raised'] < 5 or abs(t['undoneGround']) > 0.01: bad.append('avenue/causeway/terrain tools')
        if not (r['ground']['palaceBed'] < 0 < r['ground']['eastShore']): bad.append('ground')
        bb = r['bridges'] or {}
        if not (bb.get('spans') and bb.get('causeways') and bb.get('river') and bb.get('prims')): bad.append('bridges')
        if bad:
            sys.exit('FAIL: ' + ', '.join(bad))
        print('OK')


if __name__ == '__main__':
    main()
