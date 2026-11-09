// ================================================================= ANCIENT TRANSIT — drawing the street dress  [draw]
// KTRANSIT.dress's pieces (and KTRANSIT.dressGrid's) built by the furniture bundle and merged into one mesh a family: a street of a
// hundred pieces is a handful of draw calls. The street surface itself (asphalt, lines, pavements and kerbs) is KTRANSIT.draw.road.
//
//   KTRANSIT.draw.dress(D, o) -> Group     o.furn (KratorTransitFurniture, required), o.shadow; userData: {tris, pieces, failed}
//   KTRANSIT.draw.street(street, D, o)     the road surface and the dress together: {pts, width, ground, shift} + the dress records; o.road (a KTRANSIT.road
//                                          record: drawn at its graded level), o.ground (the host's carved ground the surface samples), o.tilt (the level the
//                                          pieces lean with)
(function () {
  const T = KTRANSIT;
  /* a piece's frame on the ground: its yaw, and, with o.tilt (a level function), the pitch and roll of the slope under it */
  T.draw.pieceFrame = function (p, tilt) {
    if (!tilt) return T.frame(p.x, p.y, p.z, p.yaw, 0, 0);
    const d = 0.6, gx = (tilt(p.x + d, p.z) - tilt(p.x - d, p.z)) / (2 * d), gz = (tilt(p.x, p.z + d) - tilt(p.x, p.z - d)) / (2 * d), fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
    return T.frame(p.x, p.y, p.z, p.yaw, Math.atan(Math.max(-0.6, Math.min(0.6, gx * fx + gz * fz))), Math.atan(Math.max(-0.6, Math.min(0.6, gx * fz - gz * fx))));
  };
  T.draw.dress = function (D, o) {
    o = o || {}; const furn = o.furn; if (!furn) throw new Error('KTRANSIT.draw.dress: o.furn (KratorTransitFurniture) is required');
    const B = T.builder(), cache = {}; let failed = 0, n = 0;
    D.pieces.forEach(p => {
      const key = p.kind + '.' + p.state + '.' + p.variant + '.' + p.seed + '.' + (p.span == null ? 0 : p.span);
      let g = cache[key];
      if (g === undefined) { try { g = furn.build(p.kind, { state: p.state, variant: p.variant, seed: p.seed, span: p.span }); } catch (e) { g = null; if (o.err) o.err('dress ' + key + ': ' + (e && e.message || e)); } cache[key] = g; }
      if (!g) { failed++; return; }
      const m = T.draw.pieceFrame(p, o.tilt); g.children.forEach(ch => B.mesh(null, ch, m)); n++;
    });
    const G = B.finish('dress ' + (D.id == null ? 'grid' : D.id)); G.userData.pieces = n; G.userData.failed = failed; G.userData.id = D.id;
    if (o.shadow) o.shadow.cast(G);
    return G;
  };
  /* the war along a street: the scorch marks (dark discs on the ground), the crater rims and the thrown slabs (one instanced mesh), the strewn
     pieces, the barricades and the military positions (the furniture bundle, merged). The craters themselves are the host's ground (KTRANSIT.craterH) */
  T.draw.war = function (W, o) {
    o = o || {}; const furn = o.furn; if (!furn) throw new Error('KTRANSIT.draw.war: o.furn (KratorTransitFurniture) is required');
    const B = T.builder(), col = T.COL, ground = W.path.ground, soot = [col.soot[0] * 0.9, col.soot[1] * 0.9, col.soot[2] * 0.9];
    W.scorch.concat(W.craters.map(c => ({ x: c.x, z: c.z, r: c.r * 1.6, deep: true }))).forEach(sc => { const n = sc.deep ? 24 : 14, rings = sc.deep ? [0.2, 0.45, 0.7, 0.85, 1] : [0.5, 1], at = (q, a) => { const x = sc.x + Math.cos(a) * sc.r * q, z = sc.z + Math.sin(a) * sc.r * q; return [x, ground(x, z) + 0.07, z]; }, c = [sc.x, ground(sc.x, sc.z) + 0.07, sc.z];
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2; B.tri('line', c, at(rings[0], a), at(rings[0], b), soot, { face: [0, 1, 0] });
        for (let k = 0; k + 1 < rings.length; k++) B.quad('line', at(rings[k], a), at(rings[k], b), at(rings[k + 1], b), at(rings[k + 1], a), soot, { face: [0, 1, 0] }); } });
    let failed = 0, n = 0; const cache = {};
    W.pieces.forEach(p => { const key = p.kind + '.' + p.state + '.' + p.variant + '.' + p.seed; let g = cache[key];
      if (g === undefined) { try { g = furn.build(p.kind, { state: p.state, variant: p.variant, seed: p.seed }); } catch (e) { g = null; if (o.err) o.err('war ' + key + ': ' + (e && e.message || e)); } cache[key] = g; }
      if (!g) { failed++; return; } const m = T.draw.pieceFrame(p, o.tilt); g.children.forEach(ch => B.mesh(null, ch, m)); n++; });
    const vk = T.draw.vehicles(B, [].concat(...(W.blockades || []).map(bk => bk.vehicles)), o);
    const G = B.finish('war ' + W.id), im = T.draw.rubble(W.rubble, { seed: W.seed, name: 'war ' + W.id + '.rubble' }); if (im) { G.add(im); G.userData.tris += 12 * W.rubble.length; }
    G.userData.vehicles = vk.real; G.userData.hulks = vk.hulks; G.userData.blockades = (W.blockades || []).length;
    G.userData.pieces = n; G.userData.failed = failed; G.userData.craters = W.craters.length; G.userData.positions = W.positions.length; G.userData.id = W.id;
    if (o.shadow) o.shadow.cast(G);
    return G;
  };
  T.draw.street = function (street, D, o) {
    o = o || {}; const B = T.builder();
    T.draw.road(B, o.road || { pts: street.pts, width: street.width, shift: street.shift }, o.ground || street.ground, { pavement: o.pavement == null ? (o.road && o.road.pavement != null ? o.road.pavement : 3.5) : o.pavement, network: o.network, road: o.roadIndex });
    const G = B.finish('street ' + (street.id == null ? '' : street.id)); if (D) { const F = T.draw.dress(D, o); G.add(F); G.userData.tris += F.userData.tris; G.userData.pieces = F.userData.pieces; G.userData.failed = F.userData.failed; }
    if (o.shadow) o.shadow.cast(G);
    return G;
  };
})();
