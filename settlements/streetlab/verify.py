#!/usr/bin/env python3
"""Verify Streetlab headless: load a built page, wait for it, check it.

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
    if (baseH(A.c[0], A.c[1]) < 0 && !A.L.deck) wet++;
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
  return out;
}"""


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
    for e in errors: print('ERROR', e)
    if a.check:
        bad = []
        if r['err'] or errors: bad.append('page errors')
        if r['failed']: bad.append('kit pieces failed')
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
