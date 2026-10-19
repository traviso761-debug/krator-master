/* ============================== 6c. HOST: THE DEV TOOLS (paths, the pin, the editor) ============================== */
/* [web] Three tools the owner asked for on the city plan (2026-10-09):
   - "Paths": Voth's path visualizer (settlements/voth/src/87-pathviz.js, lifted by build.py) with the city's own
     populations registered: the streets by class, the elephant bug and ferry lines with their stations and where each
     vehicle is right now, and the owner's painted streets.
   - the pin (Dhelv's, kits/zeijani/src/92-camera.js): core/host's since step 6a (90-host-camera.js); inside a canton it
     lands on the floor under the interior (VC.pickInterior, VC.interiorStand, handed to the host in 97-vc-host-take.js).
   - the editor: core/host's since step 6b (98-host-edit.js, B; 97-vc-host-take.js hands it Voth's world). What stays here
     is Voth's: the kit buildings it offers (VC.edKits), a building aligned to the nearest street (VC.edAlign) and drawn
     on its own (VC.edBuild, VC.edDrop); the layout applies the saved edits (35-vc-steps.js VC.editsFromLog). */

VC.typing = function (e) { var t = e.target; return t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable); };

/* ---------------------------------------------------------------- inside a canton (owner, 2026-10-16: "click eg inside the
   throne room and be able to start walk mode there ... it drops me in the sea or on the outside of the bldg"; "the
   inspector ... not correctly displaying the name of each room"). With a canton's interior shown (the cutaway, or walking
   in it), a click or a double-click is picked against the interior as drawn, under the cut: the walls, floors and pieces
   of the storeys shown (56-vc-interiors-host.js marks them probeSkip, so the host's own pick passed through them to the
   canton's shell or the sea). The pin lands on the walkable floor under the hit (core/walk KWALK); the inspector names
   the room it is in (a blueprint room by its sheet name, 40d-vc-blueprint.js) and the piece under the cursor */
VC.pickInterior = function (ray) {
  var I = VC.INTD; if (!I || !I.groups) return null;
  var C = I.cut, cutY = C.on && I.planes ? I.planes[0].constant : Infinity, meshes = [], at = null;
  Object.keys(I.groups).forEach(function (cn) {
    var g = I.groups[cn]; if (!g.visible) return;
    g.traverse(function (o) { if ((o.isMesh || o.isInstancedMesh) && o.visible && o.userData && (o.userData.kind === 'interior' || o.userData.kind === 'furniture')) meshes.push(o); });
  });
  if (!meshes.length) return null;
  var R = new THREE.Raycaster(ray.origin.clone(), ray.direction.clone().normalize(), 0, 20000);
  var hits = R.intersectObjects(meshes, false);
  for (var i = 0; i < hits.length; i++) {
    var h = hits[i];
    /* what the cut hides is not there (the raycast ignores the clipping planes): above the cut, or outside the cut's box */
    if (h.point.y > cutY + 0.05) continue;
    if (C.on && I.planes && (h.point.x < I.planes[1].constant - 0.05 || h.point.x > -I.planes[2].constant + 0.05 || h.point.z < I.planes[3].constant - 0.05 || h.point.z > -I.planes[4].constant + 0.05)) continue;
    at = h; break;
  }
  if (!at) return null;
  var ud = at.object.userData, cn = ud.canton, item = ud.items && at.instanceId != null ? ud.items[at.instanceId] : null;
  return { point: at.point, canton: cn, storey: ud.storey, item: item, object: at.object };
};
/* the floor a person stands on under a point inside: the highest KWALK floor at or a little above the hit */
VC.interiorStand = function (p) {
  var W = typeof KWALK !== 'undefined' ? KWALK : null; if (!W) return [p.x, p.y, p.z];
  var f = W.floorBelow(p.x, p.z, p.y, 0.6);   /* (its step: how far above the point a floor may stand) */
  return [p.x, f ? f[0] : p.y, p.z];
};
/* the room, hall or passage a point is in: the smallest that holds it on the storey whose floor is under it */
VC.interiorRoomAt = function (cn, x, y, z) {
  var P = VC.INT && VC.INT.cantons[cn]; if (!P) return null;
  var best = null, ba = Infinity, pad = 0.35;
  var test = function (o, what) {
    var oy = o.y != null ? o.y : (P.storeys[o.storey] || {}).y, oh = o.h != null ? o.h : (P.storeys[o.storey] || {}).h;
    if (oy == null || y < oy - 0.6 || y > oy + (oh || 6) + 0.4) return;
    if (x < o.x0 - pad || x > o.x1 + pad || z < o.z0 - pad || z > o.z1 + pad) return;
    var a = (o.x1 - o.x0) * (o.z1 - o.z0); if (a < ba) { ba = a; best = { o: o, what: what }; }
  };
  P.rooms.forEach(function (r) { test(r, 'room'); });
  if (!best) P.halls.concat(P.tunnels).forEach(function (o) { test(o, o.kind); });
  return best;
};
VC.interiorKindName = function (k) { return String(k || '').replace(/_/g, ' '); };
/* a suite's big room under the blueprint: its name on the sheet its storey takes (the rows of the same kind) */
VC.interiorSheetName = function (P, o) {
  var L = P && P.bpLog, sid = L && L.sheets && L.sheets[o.storey], sh = sid && typeof VC.PALACE_PLAN !== 'undefined' && VC.PALACE_PLAN.sheets[sid];
  if (!sh || !(o.great || o.kind === 'suite')) return null;
  var k = o.kind === 'suite' ? null : o.kind, row = sh.rooms.filter(function (r) { return r[2] === k; })[0];
  return row ? row[1] : null;
};
VC.interiorHTML = function (hit) {
  var P = VC.INT.cantons[hit.canton], p = hit.point, A = VC.interiorRoomAt(hit.canton, p.x, p.y, p.z), h = '';
  var Sx = A && A.o.storey != null ? A.o.storey : hit.storey, S = P && P.storeys[Sx];
  var where = hit.canton + ' canton' + (S ? ', storey ' + (S.i + 1) + ' of ' + P.storeys.length + (S.dungeon ? ' (the dungeon)' : '') : '');
  if (hit.item) {
    var FA = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[hit.item.key]) || {};
    h += '<b>' + (FA.name || hit.item.key) + '</b> <span class="k">' + hit.item.key + '</span><br>';
    if (hit.item.room && P) { var rr = P.rooms.filter(function (q) { return q.id === hit.item.room; })[0]; if (rr) A = { o: rr, what: 'room' }; }
  }
  if (A) {
    var o = A.o, nm = o.name || VC.interiorSheetName(P, o) || (A.what === 'room' ? VC.interiorKindName(o.kind) : A.what === 'tunnel' ? (o.exit ? 'way out onto the terrace' : 'tunnel in from the door') : VC.interiorKindName(o.suite || o.kind));
    var D = ['bare', 'plain', 'fine', 'rich', 'sumptuous'], a = Math.round((o.x1 - o.x0) * (o.z1 - o.z0));
    h += (hit.item ? 'in ' : '') + '<b>' + nm.charAt(0).toUpperCase() + nm.slice(1) + '</b><br>' + where;
    var bits = [];
    if (A.what === 'room') bits.push(VC.interiorKindName(o.bpKind && o.bpKind !== o.kind ? o.bpKind + ' (' + o.kind + ')' : o.kind));
    else bits.push(A.what === 'suite' ? 'state room' : A.what);
    if (o.decor != null) bits.push(D[o.decor]);
    bits.push(a + ' m²');
    if (o.tallTo != null && P) bits.push('through ' + (o.tallTo - o.storey + 1) + ' storeys');
    h += '<br>' + bits.join(' &middot; ');
    var cen = A.what === 'room' && TUNE.census && TUNE.census.rooms && TUNE.census.rooms[o.kind];
    if (cen && (cen[0] || cen[1])) h += '<br><span class="k">' + (cen[0] ? cen[0] + ' at work (' + cen[2] + ')' : '') + (cen[0] && cen[1] ? ', ' : '') + (cen[1] ? cen[1] + ' sleep here' : '') + '</span>';
  } else h += (hit.item ? '' : '<b>Inside</b><br>') + where;
  return h + '<br><span class="k">' + p.x.toFixed(0) + ', ' + p.z.toFixed(0) + ' &middot; ' + p.y.toFixed(1) + ' m</span>';
};
/* the hover tip (I) names the room too, ahead of the lots and the ground (a citizen under the cursor still comes first) */
(function () {
  var describe = VC.describe;
  VC.describe = function (r) {
    var hit = null; try { hit = VC.pickInterior(r); } catch (e) { console.warn('pickInterior: ' + e.message); }
    if (!hit) return describe(r);
    var body = null; try { body = VC.pickBody && VC.pickBody(r); } catch (e) { }
    if (body) return describe(r);
    VC.DESC = { kind: 'room', at: [hit.point.x, hit.point.z] }; VC.INSP.a = null;   /* no citizen's card (56d) */
    return VC.interiorHTML(hit);
  };
})();

/* ---------------------------------------------------------------- Paths: the city's populations */
VC.PATHCOL = { highway: 0xffb21e, avenue: 0xff3df0, main: 0x36d1ff, side: 0x7dff5a, alley: 0xb38bff, lane: 0xc8a060, strider: 0xd9792b, ferry: 0x3a9ad9, painted: 0xffffff };
VC.pathviz = function () {
  if (typeof pathvizRegister === 'undefined') return;
  var y = function (x, z) { return VIEW.surf(x, z) + 0.6; };
  var polyline = function (arr, P, every) {
    for (var i = every; i < P.length + every - 1; i += every) {
      var a = P[i - every], b = P[Math.min(i, P.length - 1)];
      pathvizPushSeg(arr, a[0], y(a[0], a[1]), a[1], b[0], y(b[0], b[1]), b[1]);
    }
  };
  ['highway', 'avenue', 'main', 'side', 'alley', 'lane'].forEach(function (cls) {
    if (!PLAN.ways.some(function (w) { return w.cls === cls; })) return;
    pathvizRegister({ key: 'street-' + cls, label: 'Streets: ' + cls + (cls === 'lane' ? ' (country lanes)' : ''), color: VC.PATHCOL[cls],
      lines: function (arr) { PLAN.ways.forEach(function (w) { if (w.cls === cls && w.born <= HOST.step && w.tag !== 'painted street') polyline(arr, w.pts, 3); }); } });
  });
  ['strider', 'ferry'].forEach(function (kind) {
    var lines = function () { return PLAN.transit ? PLAN.transit.lines.filter(function (l) { return l.kind === kind; }) : []; };
    if (!lines().length) return;
    pathvizRegister({ key: kind + '-lines', label: (kind === 'ferry' ? 'Ferry' : 'Elephant bug') + ' lines, stations, vehicles now', color: VC.PATHCOL[kind], postR: 10,
      lines: function (arr) {
        if (HOST.step < SL.TRANSIT) return;
        lines().forEach(function (l) {
          polyline(arr, l.pts, 1);
          for (var k = 0; k < (l.vehicles || 0); k++) {
            var p = SIM.vehiclePose(l.id, k, VC.motionT || 0);
            if (p && !p.offMap) pathvizGlow(arr, p.x, y(p.x, p.z) + 4, p.z, kind === 'ferry' ? 14 : 10);
          }
        });
      },
      posts: function () { return HOST.step < SL.TRANSIT || !PLAN.transit ? [] : PLAN.transit.stations.filter(function (s) { return s.kind === kind; }).map(function (s) { return { x: s.x, z: s.z, y: y(s.x, s.z) }; }); } });
  });
  pathvizRegister({ key: 'painted', label: 'Streets: painted by the owner', color: VC.PATHCOL.painted,
    lines: function (arr) { if (VC.REC) VC.REC.way.forEach(function (s) { polyline(arr, s.pts, 1); }); } });   /* the painted streets standing (97-vc-host-take.js) */
  /* the picture follows the step slider */
  var apply = HOST.applyStep;
  HOST.applyStep = function () { apply(); if (typeof PATHVIZ_ON !== 'undefined' && PATHVIZ_ON) pathvizShow($('pathvizSel').value); };
};

/* ---------------------------------------------------------------- where a person stands (the pin, G, F and the walker are core/host's,
   90-host-camera.js); the highest walkable floor (core/walk KWALK: a canton's levels, its bridges and stairs, the
   causeways) at or under `below`, or the ground (59-vc-flora-edit.js plants on it) */
VC.standY = function (x, z, below) {
  var g = VIEW.surf(x, z); if (typeof KWALK === 'undefined') return g;
  var fs = KWALK.floorsAt(x, z);
  for (var i = 0; i < fs.length; i++) if (below == null || fs[i][0] <= below) return Math.max(g, fs[i][0]);
  return g;
};

/* ---------------------------------------------------------------- the editor's Voth side (core/host 98-host-edit.js is the editor) */
VC.edKits = function () {
  return ASSETS.filter(function (A) { return A.culture === 'voth' && A.build && A.w && A.d; })
    .sort(function (a, b) { return (a.family || '').localeCompare(b.family || '') || (a.name || a.key).localeCompare(b.name || b.key); });
};
/* where a building faces the nearest street, and stands back off it if it was dropped on the carriageway */
VC.edAlign = function (b) {
  var q = VC.nearestWayPt([b.x, b.z]); if (!q) return b;
  /* dropped on a street's centre line: face it from its left side */
  var D = SL.dims(b.key, b.v) || { d: 10 }, f = q.d < 0.5 ? V.mul(V.perp(q.way.F.tan(q.s, 4)), -1) : V.norm(V.sub(q.p, [b.x, b.z])), need = q.way.w / 2 + TUNE.lot.setback + D.d / 2;
  b.ry = +Math.atan2(f[0], f[1]).toFixed(4);
  if (q.d < need) { b.x = +(q.p[0] - f[0] * need).toFixed(1); b.z = +(q.p[1] - f[1] * need).toFixed(1); }
  /* stepping back can bring another street (a corner's) too close: step off that one too, keeping the facing */
  for (var it = 0; it < 4; it++) {
    var r = VC.nearestWayPt([b.x, b.z]), nd = r && r.way.w / 2 + TUNE.lot.setback + D.d / 2;
    if (!r || r.d >= nd - 0.05 || r.d < 0.01) break;
    var a = V.norm(V.sub([b.x, b.z], r.p));
    b.x = +(r.p[0] + a[0] * nd).toFixed(1); b.z = +(r.p[1] + a[1] * nd).toFixed(1);
  }
  return b;
};
VC.edBuild = function (b) {
  var D = SL.dims(b.key, b.v) || { w: 10, d: 10 }, f = [Math.sin(b.ry), Math.cos(b.ry)], bo = obb([b.x, b.z], V.perp(f), D.w / 2, D.d / 2);
  var g = buildAsset(b.key, b.x, b.z, b.ry, { variant: b.v, seed: 7 + b.v * 13, wealth: 0.6, y: baseY(bo) });
  if (g) g.userData.edit = b;
  return g;
};
VC.edDrop = function (g) { if (!g) return; scene.remove(g); var i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1); };

VC.tools = function () { VC.pathviz(); };
