/* ======================== Build, export and the global names ========================
   IX.buildRoom(plan, catalog, room?) builds every placement through catalog.build() and
   returns the host objects in placement order (plan.objects keeps them too).
   IX.exportPlan(plan) is the plan as plain JSON for a game export: placements, the lights the
   pieces carry (data, not lights: a host lights the room from them), the grid as rows of 0/1,
   each door's keep-free zone as convex polygons (a quarter disc and a threshold band for an
   inward door), and the report. IX.exportBuilding (46-planner.js) does the same for a building.
   Globals: ROOM() and furnishRoom() (SPEC), and KratorInteriors.
   ====================================================================== */
(function (IX) {
  'use strict';
  IX.buildRoom = function (plan, catalog, room) {
    room = room || IX.roomById[plan.room];
    plan.objects = plan.placements.map(function (p) { return catalog.build(p, room); });
    return plan.objects;
  };
  function polyJSON(P) { return P.map(function (p) { return [IX.round(p[0]), IX.round(p[1])]; }); }
  IX.exportPlan = function (plan) {
    return {
      room: plan.room, kind: plan.kind, culture: plan.culture, seed: plan.seed, opts: plan.opts,
      placements: plan.placements.map(function (p) {
        return { id: p.id, key: p.key, variant: p.variant, seed: p.seed, x: p.x, z: p.z, ry: p.ry, y: p.y, anchor: p.anchor,
          type: p.type, culture: p.culture, need: p.need, host: p.host, lights: p.lights };
      }),
      lights: plan.lights || [],
      doorZones: plan.zones.doors.map(function (zs) { return zs.map(polyJSON); }),
      grid: plan.grid.toJSON(),
      report: plan.report
    };
  };
})(KratorInteriors);
var ROOM = KratorInteriors.ROOM;
var furnishRoom = KratorInteriors.furnishRoom;
if (typeof module !== 'undefined' && module.exports) module.exports = KratorInteriors;
