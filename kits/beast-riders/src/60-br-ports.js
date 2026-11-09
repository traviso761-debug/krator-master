/* ======================================================================
   The ports: Girder's and Mav's Refuge's own buildings as catalog ASSETs (culture 'beast-rider'). Each town's engine and
   builders run sealed in a closure (BR_GIRDER, BR_MAVS: towns.py, towns/hook.js) exactly as on the town's page, and
   give each building of the port table (towns/<town>-ports.js) once, as a group in its local frame: origin the centre
   of its footprint on its floor, front +z. An ASSET's build places a copy of that group (its geometry and materials
   shared) at the frame the catalog gives it, so buildAsset(key, x, z, ry, {variant, y}) works as for any building.
   The declared box of each variant is DIMS below (w, d, h; verify.py checks the measured box against it).
   BR_PORTS: { key: [ { name, group, def, box, furn, doors, panes } ] }, and each town's tracker, for the in-town check
   (verify.py).
   The openings are the towns' own (their 54-openings.js and core/door, sealed: towns.py): the walls are cut for the doors
   and windows, each pane is KGLASS, and each door leaf is a mesh of its own posed as its town built it (Girder's stand
   open, Mav's are shut). A page that wants the doors to open hands each placed copy to BR_PORTS.host(g, base): every door
   of the copy becomes a record in the page's KDOOR (core/door/10-core-door.js), its id base + '/' + the town's id, in
   the page's world, and its leaf is posed by the page's KDOORHOST (90-core-door-host.js) as it swings. A page that does
   not (the isle demo) shows the leaves as built.
   ====================================================================== */
var BR_PORTS = (function(){
  /* the box each variant declares [w, d, h] (metres): the measured box rounded up (verify.py checks it, +1.6 m) */
  var DIMS = {
    br_port_girder_hall: [[39,39,38]],
    br_port_girder_dwelling: [[8.5,8,4],[6,9.5,4],[7.5,10,4],[6.5,10,4],[7,6.5,4],[10,9.5,8.5]],
    br_port_girder_house: [[25.5,19.5,11],[25.5,19.5,11],[19.5,25.5,11]],
    br_port_girder_roost_deck: [[82.5,82.5,23.5]],
    br_port_girder_palisade: [[28,8,13.5],[36,8,17.5]],
    br_port_girder_stall: [[4,3,3],[5,3,3],[4,3,3],[5,3,3]],
    br_port_mavs_lot: [[12.5,18,13],[13.5,19.5,18],[12.5,19,14.5],[13,20.5,18.5],[11.5,20,19.5],[17.5,19.5,16],[16,19.5,20],[16,19.5,16],[11.5,21,15],[13,17.5,12.5]],
    br_port_mavs_shrine: [[11,17,17]],
    br_port_mavs_council: [[93,93,51.5]],
    br_port_mavs_rain_canopy: [[212.5,212,30.5]],
    br_port_mavs_roost: [[12.5,18.5,13],[9,13,5],[4,13.5,4.5]],
    br_port_mavs_room_front: [[8.5,0.5,4.5],[12,6.5,7],[12.5,6.5,5.5],[12.5,9.5,7.5]],
    br_port_mavs_gate_facade: [[11.5,4,29],[8,4,16.5],[7,4,7],[9.5,6,27],[8,4.5,6],[9,4.5,29.5],[9.5,3.5,25.5]]
  };
  var out = { towns: { girder: BR_GIRDER, 'mavs-refuge': BR_MAVS }, built: {}, keys: [], errors: [] };
  /* a placed copy's doors as the page's KDOOR records (the copy's place: g.position, g.rotation.y), each leaf posed by
     KDOORHOST about the copy's own frame; returns the records */
  out.host = function(g, base){
    var ry = g.rotation.y, c = Math.cos(ry), s = Math.sin(ry), P = g.position, leaf = {}, recs = [];
    function W(p){ return [P.x + p[0]*c + p[2]*s, P.y + p[1], P.z - p[0]*s + p[2]*c]; }
    g.traverse(function(m){ if(m.userData && m.userData.brDoorId != null) leaf[m.userData.brDoorId] = m; });
    (g.userData.brDoors || []).forEach(function(L){
      var D = KDOOR.add({ id: base + '/' + L.id, at: W(L.at), hinge: W(L.hinge), p0: W(L.p0), yaw: L.yaw + ry, sign: L.sign, w: L.w, h: L.h, t: L.t,
        kind: L.kind, locked: L.locked, open: L.open, key: base, s: L.s, town: L.id, leafless: !L.leaf });
      var m = leaf[L.id];
      if(m) KDOORHOST.posed(D, function(D2, pose, Ls){ var q = Ls[0], dx = q.p[0] - P.x, dz = q.p[2] - P.z;
        m.position.set(dx*c - dz*s, q.p[1] - P.y, dx*s + dz*c); m.rotation.set(0, L.yaw + q.ang, 0); });
      D.mesh = m || null; recs.push(D);
    });
    return recs;
  };
  [BR_GIRDER, BR_MAVS].forEach(function(T){
    var B; try { B = T.build(); } catch (e) { out.errors.push(T.town + ': ' + (e && e.stack || e)); return; }
    T.defs.forEach(function(D){
      var vs = B[D.key] || [];
      if(!vs.length){ out.errors.push(D.key + ': no variant built'); return; }
      out.built[D.key] = vs;
      var dims = DIMS[D.key] || [], vd = vs.map(function(v, i){ var d = dims[i] || [0, 0, 0]; return { w: d[0], d: d[1], h: d[2] }; });
      ASSET({ key: D.key, name: D.name, culture: 'beast-rider', family: D.family, types: D.types,
        w: Math.max.apply(null, vd.map(function(d){ return d.w; })), d: Math.max.apply(null, vd.map(function(d){ return d.d; })),
        h: Math.max.apply(null, vd.map(function(d){ return d.h; })),
        variants: vs.length, variantNames: vs.map(function(v){ return v.name; }), variantDims: vd,
        port: { town: T.town },
        build: function(F){
          var V = vs[F.variant % vs.length], g = V.group.clone();      /* clone(): the geometry and materials are shared */
          g.position.set(F.x, F.y, F.z); g.rotation.y = F.ry; g.name = 'port:' + D.key + ':' + F.variant;
          g.userData.port = { key: D.key, town: T.town, variant: F.variant, name: V.name };
          _target.add(g);
          F.furniture = V.furn.map(function(r){ return r.key; }); F.missing = [];
        } });
      out.keys.push(D.key);
    });
  });
  return out;
})();
