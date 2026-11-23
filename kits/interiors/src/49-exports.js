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

  /* ROOM LIGHT (K2, GRAPHICS-TERRAIN-PROPOSAL.md 12d; I1-I4 of section 8): core/interiors/10-core-roomlight.js (KROOMLIGHT,
     bundled ahead of the core as src/05-roomlight.js) over the ROOM() records, so every kit with an interior set gets the
     room-graph daylight table, the room-gated light pool and the corner AO, on the web and in the Godot export.
       IX.lightRoom(room, plan?)        the room as KROOMLIGHT reads it: its box (the polygon's bounds, floor to ceiling), its
                                        doors (to another ROOM: a portal; to anything else, 'street' or a court: out), its
                                        windows, its src's skylights / vault / outdoor flags, and the plan's lights as lamps
       IX.roomLight(rooms?, plans?, o?) KROOMLIGHT.buildTable over the rooms (default every ROOM()); plans: {room id: plan};
                                        o.shut(room, door) as buildTable's. null without KROOMLIGHT
       IX.lightPool(o)                  KROOMLIGHT.pickPool with the plans' lamps and the rooms' windows filled in:
                                        o = {eye, eyeRoom, table, rooms?, plans?, sunUp, count, heroShadows}
       IX.exportInteriors(rooms?, plans?, o?)  interiors.json v2: {version: 2, rooms, portals, room_table, plans}, plain JSON */
  const RL = typeof KROOMLIGHT !== 'undefined' ? KROOMLIGHT : null;
  IX.ROOMLIGHT = RL;
  function src(room, k) { return room.src && room.src[k]; }
  IX.lightRoom = function (room, plan) {
    const bb = room.bbox;
    return {
      id: room.id, box: [bb[0], room.y, bb[1], bb[2], room.y + room.h, bb[3]],
      doors: room.doors.map(function (d) {
        const linked = d.to !== room.id && IX.roomById[d.to];
        return linked ? { to: d.to, w: d.w, shut: !!d.shut } : { out: true, w: d.w, shut: !!d.shut };
      }),
      windows: room.windows.map(function (w) { return { w: w.w, h: w.h, aperture: w.aperture == null ? 1 : w.aperture }; }),
      skylights: src(room, 'skylights') || [], vault: !!src(room, 'vault'), outdoor: !!src(room, 'outdoor'),
      lamps: plan && plan.lights ? plan.lights.map(function (l) { return { amp: l.intensity == null ? 1 : l.intensity, r: l.distance == null ? 8 : l.distance }; }) : []
    };
  };
  function listOf(rooms) { return rooms || IX.rooms; }
  IX.roomLight = function (rooms, plans, o) {
    if (!RL) return null;
    plans = plans || {};
    return RL.buildTable({ rooms: listOf(rooms).map(function (r) { return IX.lightRoom(r, plans[r.id]); }), shut: o && o.shut });
  };
  IX.lightPool = function (o) {
    if (!RL || !o) return [];
    const rooms = listOf(o.rooms), plans = o.plans || {}, wins = [], lamps = [];
    rooms.forEach(function (r) {
      r.windows.forEach(function (w) { wins.push({ room: r.id, x: w.at[0], y: r.y + w.sill + w.h / 2, z: w.at[1], aperture: w.aperture == null ? 1 : w.aperture }); });
      const P = plans[r.id];
      if (P && P.lights) P.lights.forEach(function (l) { lamps.push({ room: r.id, x: l.x, y: l.y, z: l.z, amp: l.intensity == null ? 1 : l.intensity, r: l.distance == null ? 8 : l.distance }); });
    });
    return RL.pickPool({ eye: o.eye, eyeRoom: o.eyeRoom, table: o.table || IX.roomLight(rooms, plans), windows: wins, lamps: lamps,
      sunUp: o.sunUp, count: o.count, heroShadows: o.heroShadows, maxWindows: o.maxWindows, skyFill: o.skyFill });
  };
  IX.exportInteriors = function (rooms, plans, o) {
    rooms = listOf(rooms); plans = plans || {};
    const table = IX.roomLight(rooms, plans, o), seen = {}, portals = [];
    rooms.forEach(function (r) {
      r.doors.forEach(function (d) {
        if (d.to === r.id || !IX.roomById[d.to]) return;
        const k = [r.id, d.to].sort().join('|');
        if (seen[k]) return; seen[k] = 1;
        portals.push({ a: r.id, b: d.to, w: IX.round(d.w), at: [IX.round(d.at[0]), IX.round(d.at[1])], y: r.y });
      });
    });
    return {
      version: 2,
      rooms: rooms.map(function (r) { const L = IX.lightRoom(r); return { id: r.id, building: r.building, kind: r.kind, level: r.level, box: L.box.map(function (v) { return IX.round(v); }) }; }),
      portals: portals, room_table: table,
      plans: rooms.filter(function (r) { return plans[r.id] && plans[r.id].placements; }).map(function (r) { return IX.exportPlan(plans[r.id]); })
    };
  };
  IX.exportPlan = function (plan) {
    return {
      room: plan.room, kind: plan.kind, culture: plan.culture, seed: plan.seed, opts: plan.opts,
      placements: plan.placements.map(function (p) {
        return { id: p.id, key: p.key, variant: p.variant, seed: p.seed, x: p.x, z: p.z, ry: p.ry, y: p.y, anchor: p.anchor,
          type: p.type, catRole: p.catRole, culture: p.culture, need: p.need, host: p.host, lights: p.lights };
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
