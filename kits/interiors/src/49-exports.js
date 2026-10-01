/* ======================== Build, export and the global names ========================
   IX.buildRoom(plan, catalog, room?) builds every placement through catalog.build() and
   returns the host objects in placement order (plan.objects keeps them too).
   IX.exportPlan(plan) is the plan as plain JSON for a game export: placements, the grid as
   rows of 0/1, the door swing zones as rectangles, and the report.
   Globals: ROOM() and furnishRoom() (SPEC), and KratorInteriors.
   ====================================================================== */
(function (IX) {
  'use strict';
  IX.buildRoom = function (plan, catalog, room) {
    room = room || IX.roomById[plan.room];
    plan.objects = plan.placements.map(function (p) { return catalog.build(p, room); });
    return plan.objects;
  };
  function rectJSON(r) { return { x: IX.round(r.x), z: IX.round(r.z), ry: IX.round(r.ry, 4), w: IX.round(r.hw * 2), d: IX.round(r.hd * 2) }; }
  IX.exportPlan = function (plan) {
    return {
      room: plan.room, kind: plan.kind, culture: plan.culture, seed: plan.seed, opts: plan.opts,
      placements: plan.placements.map(function (p) {
        return { id: p.id, key: p.key, variant: p.variant, seed: p.seed, x: p.x, z: p.z, ry: p.ry, y: p.y, anchor: p.anchor,
          type: p.type, culture: p.culture, need: p.need, host: p.host };
      }),
      doorZones: plan.zones.doors.map(rectJSON),
      grid: plan.grid.toJSON(),
      report: plan.report
    };
  };
})(KratorInteriors);
var ROOM = KratorInteriors.ROOM;
var furnishRoom = KratorInteriors.furnishRoom;
if (typeof module !== 'undefined' && module.exports) module.exports = KratorInteriors;
