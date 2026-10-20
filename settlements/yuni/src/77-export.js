/* ============================== 20c. CORE/EXPORT: YUNI'S PART ==============================
   Yuni's contribution to core/export's krator-world container (core/export/README.md, "Stubs" and "Profiles";
   ROADMAP.md section 11). The page keeps its own route too: KRATOR_EXPORT (51-fixtures.js, GAME_EXPORT.md), which
   the Godot spike's yuni case reads (godot/tools/export_spike.py). Both read the same registries, so the ids and
   uids agree: a fixture here is the core/tags record 51-fixtures.js made (FIX_TAGS, KTAGS.page), which the registry
   section carries beside its building, plus its host.

     fixtures   the doors, windows and lights whose `at` lies in the box (every one when there is no box), as the
                registry's records (id, uid, class fixture, kind, parent, at, ry, size, tags) with host {wall, side,
                sill}: wall the id of the shell wall of the building's interior plan that holds the opening
                (64-interiors.js), null when the building has no plan or the fixture is a light; side 'outside' (a
                door to the building's own court: 'court'; a street light: 'street'); sill the height above the
                building's base (a window's own sill; a door's and a light's y less the building's; a street light's
                its y)
     interiors  the krator-interiors contract (core/export/README.md, "Interiors"), one building per interior plan in
                the box, building-local: storeys and their rooms (polygon, floor, height, door ids), links (doors,
                stairs, ladders: room to room, with the walk graph's two ends), walls with col, and the yard (the
                footprint at the base, where the exterior doors open). The same records KRATOR_EXPORT.building(id)
                .interior carries (GAME_EXPORT.md), in the section's shape; the ids agree, so a room's exterior door
                is a record of the fixtures section (EXPORT.check joins them). Since 2026-10-18 (before: empty).

   Nothing here draws or changes anything: it runs at export time (EXPORT.world) and reads plain data. The buildings
   are registry records already (FIX_BUILDING_BEGIN), so a fixture's parent resolves there, and the registry adapter
   keeps the parent of every fixture in the box. Street fixtures (parent null) stand on their own.
   settlements/yuni/verify.py --assert checks the profile over EXPORT_BOX (registry, fixtures, interiors). */
(function(){
'use strict';
var BY = { by:'yuni' };
function reg(section, fn){
  if(typeof EXPORT !== 'undefined') EXPORT.register(section, fn, BY);
  else (window.EXPORT_QUEUE = window.EXPORT_QUEUE || []).push([section, fn, BY]);
}
/* fixture id -> the id of the shell wall whose opening holds it, from the building's interior plan (interiorPlan
   caches the plan; a building without one gives an empty map) */
var WALL_OF = {};
function wallOf(bid){
  if(bid in WALL_OF) return WALL_OF[bid];
  var m = {}, P = (typeof interiorPlan === 'function') ? interiorPlan(bid) : null;
  if(P && P.walls) P.walls.forEach(function(w){ (w.openings||[]).forEach(function(o){
    if(o.door) m[o.door] = w.id; if(o.window) m[o.window] = w.id; }); });
  WALL_OF[bid] = m; return m;
}
function hostOf(r){
  var o = FIX.byId[r.id], b = (o && o.building) ? FIX.byId[o.building] : null;
  var base = b ? b.y : 0, sill, side = 'outside', wall = null;
  if(!o) return null;
  if(r.kind === 'window') sill = (o.sill != null) ? o.sill : (o.y - o.h/2 - base);
  else sill = o.y - base;
  if(r.kind === 'door' && o.to === 'court') side = 'court';
  if(r.kind === 'light' && !b) side = 'street';
  if(b && r.kind !== 'light') wall = wallOf(b.id)[r.id] || null;
  return { wall:wall, side:side, sill:+sill.toFixed(3) };
}
reg('fixtures', function(ctx){
  var T = (typeof KTAGS !== 'undefined') ? KTAGS.page : null;
  if(!T || typeof FIX === 'undefined' || !FIX.buildings.length) return null;
  var recs = T.records.filter(function(r){ return r['class'] === 'fixture' && !r.removed && !r.set && r.at && ctx.inBox(r.at[0], r.at[2]); })
    .map(function(r){ var c = {}; for(var k in r) c[k] = r[k]; c.host = hostOf(r); return c; });
  return { format:'krator-fixtures', version:1, build:T.build, schema:FIX_SCHEMA,
    note:"Yuni's doors, windows and lights (51-fixtures.js): the registry's fixture records with their host, children of their buildings (parent; a street light's is null); local +z is out (ry its yaw); at is a door's threshold centre on the outer face at its sill, a window's pane base, a light's fitting; host.sill is above the building's base. The same ids and uids as KRATOR_EXPORT.fixtures() and KRATOR_EXPORT.tags()",
    records:recs };
});
/* ---- interiors: the krator-interiors contract from the interior plans (64-interiors.js), building-local ----
   One entry per building in the box that has a plan: storeys (the plan's levels: y the floor top, rooms with their
   polygon, height and door ids), links (every door of the plan as a room-to-room link, a stair or ladder as a
   level-to-level link: a and b room ids, 'outside' or 'court' past an exterior door; at the threshold, from and to
   the walk graph's two ends), walls (shell and partition, col true: the -col hint of KRATOR_EXPORT's wall nodes),
   and the yard: the building's footprint at its base, where its exterior doors open, so an engine can walk from one
   room to another through the doors. Ids are the plan's: an exterior door's is its fixture record (the fixtures
   section), an interior door's names only its link here; EXPORT.check joins both. */
function roomOfNode(P, byId, nid){
  for(var i=0;i<P.nav.edges.length;i++){ var e=P.nav.edges[i]; if(e.kind!=='room') continue;
    var o = e.a===nid ? byId[e.b] : e.b===nid ? byId[e.a] : null; if(o && o.room) return o.room; }
  return null;
}
function interiorOf(b, P){
  var byId = {}; P.nav.nodes.forEach(function(n){ byId[n.id]=n; });
  var pt = function(n){ return [n.x, n.y, n.z]; };
  var doorsOf = {}; P.doors.forEach(function(d){ d.rooms.forEach(function(r){ if(r){ (doorsOf[r] = doorsOf[r] || []).push(d.id); } }); });
  var byLvl = {}, order = [];
  P.rooms.forEach(function(r){ var k = r.lvl|0; if(!byLvl[k]){ byLvl[k]=[]; order.push(k); } byLvl[k].push(r); });
  order.sort(function(a,c){ return a-c; });
  var storeys = order.map(function(k){ var L = P.levels[k], rooms = byLvl[k];
    return { k:k, y: L ? L.y : rooms[0].y, h: L ? L.H : rooms[0].h, rooms: rooms.map(function(r){
      return { id:r.id, kind:r.kind, poly:r.poly, y:r.y, h:r.h, floor:r.floor||null, doors: doorsOf[r.id] || [] }; }) }; });
  var roomY = {}; P.rooms.forEach(function(r){ roomY[r.id] = r.y; });
  var links = P.doors.map(function(d){
    var o = null, i = null; P.nav.nodes.forEach(function(n){ if(n.door!==d.id) return; if(n.tag==='door') o=n; else if(n.tag==='doorway'){ if(!i) i=n; else if(!o) o=n; } });
    var to = d.rooms[1] == null ? null : d.rooms[1], thr = [d.at[0], d.y, d.at[1]];
    /* the inner end stands on its room's floor (a custom plan's walk graph keeps the doorway at the door's sill, below a
       raised floor), so an engine joins it to the room, not to the yard beneath */
    var from = i ? pt(i) : thr.slice(); if(d.rooms[0] && roomY[d.rooms[0]] != null) from[1] = roomY[d.rooms[0]];
    var out = o ? pt(o) : (i ? pt(i) : thr.slice()); if(d.kind !== 'exterior' && to && roomY[to] != null) out[1] = roomY[to];
    return { id:d.id, kind:'door', a:d.rooms[0]||null, b:to, door:d.kind, fixture:d.fixture||null, style:d.style, w:d.w, h:d.h,
      at:thr, from:from, to:out }; });
  var ns = 0;   /* the k-th stair edge is the k-th stair: each group emits its stair, then its walk graph (emitGroup) */
  P.nav.edges.forEach(function(e){ if(e.kind!=='stair' && e.kind!=='ladder') return; var na=byId[e.a], nb=byId[e.b]; if(!na||!nb) return;
    var s = P.stairs[ns++] || null;
    links.push({ id: s ? s.id : b.id+'.'+e.kind+'.'+e.a, kind:e.kind, a:roomOfNode(P, byId, e.a), b:roomOfNode(P, byId, e.b),
      at:pt(na), from:pt(na), to:pt(nb) }); });
  var walls = P.walls.map(function(w){ return { id:w.id, kind:w.kind, a:w.a, b:w.b, y:w.y, h:w.h, thick:w.thick, col:true,
    openings:(w.openings||[]).map(function(o){ return { u:o.u, w:o.w, y0:o.y0, y1:o.y1, door:o.door||null, window:o.window||null }; }) }; });
  var hw = b.w/2, hd = b.d/2;
  return { id:b.id, storeys:storeys, links:links, walls:walls,
    yard:{ y:0, poly:[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]] } };
}
reg('interiors', function(ctx){
  if(typeof FIX === 'undefined' || typeof interiorPlan !== 'function' || !FIX.buildings.length) return null;
  var out = [];
  FIX.buildings.forEach(function(b){ if(!ctx.inBox(b.x, b.z)) return; var P = interiorPlan(b.id); if(P && P.rooms.length) out.push(interiorOf(b, P)); });
  if(!out.length) return null;
  return { format:'krator-interiors', version:1, frame:'building-local (parent under the building record: at its base centre, turned by ry)',
    note:"Yuni's interior plans (64-interiors.js) for the buildings in the box: storeys with their rooms (polygon, floor y, height, door ids), links (a door between two rooms, or a room and outside or court; a stair or ladder between two storeys: at the threshold, from and to the walk graph's ends), walls (shell and partition, col: KRATOR_EXPORT's -col nodes) and the yard (the footprint at the base, where the exterior doors open). The same ids as KRATOR_EXPORT.building(id).interior",
    buildings:out };
});
})();
