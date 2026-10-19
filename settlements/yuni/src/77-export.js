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
     interiors  empty for now: Yuni's rooms, walls, stairs and furniture go out building-local through
                KRATOR_EXPORT.building(id).interior (GAME_EXPORT.md), not yet in the kits/interiors ROOM() shape the
                section wants. The contributor answers null, so a profile may list `interiors?` and the section
                reads empty, not stub.

   Nothing here draws or changes anything: it runs at export time (EXPORT.world) and reads plain data. The buildings
   are registry records already (FIX_BUILDING_BEGIN), so a fixture's parent resolves there, and the registry adapter
   keeps the parent of every fixture in the box. Street fixtures (parent null) stand on their own.
   settlements/yuni/verify.py --assert checks the profile over EXPORT_BOX (registry, fixtures, interiors?). */
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
reg('interiors', function(){ return null; });
})();
