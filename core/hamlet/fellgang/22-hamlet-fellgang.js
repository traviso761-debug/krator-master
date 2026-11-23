/* ==================== core/hamlet 22 (opt-in): the Fellgang row, and the fowling and ice focuses (plain data, [G data]) ==================== */
/* kits/tungang/PLAN.md section 3.3.1 (the owner, 2026-11-11: "the `fellgang` row moves into core/hamlet with fowling and ice
   focuses"). OPT-IN: this file sits in a subfolder no build lists unless it asks for it by name, so no other page's bytes
   change (core/hamlet/fellgang/README.md). Load it after 20-hamlet-cultures.js; it registers at load:
     KHAMLET.CULTURES.fellgang   the riftrim stand-ins' row (biomes/riftrim stations/fowlers/84f-host-fellgang.js FELLGANG.ROW),
                                 its keys and numbers unchanged, its works keyed by the two new focuses instead of borrowing
                                 `ranch` (the Fowlers) and `quarry` (the Ice-cutters)
     KHAMLET.FOCI                + 'fowling' (works fg-ropehouse, fg-eggstore, fg-pens: its resource a cliff with nest ledges,
                                 its reach measured to the wall's foot) and 'ice' (works fg-icehouse, fg-sledgeshed: its
                                 resource a lake frozen in winter, the cutting weeks its season)
     KHAMLET.FOCUS_INFO          what each new focus works on, for a host's labels and checks
   A row that has no works for a focus makes a village with no works (core/hamlet 30 reads row.works[focus] || []): the two
   focuses belong to the Fellgang row only. The village a station gets with focus 'fowling' on this row is the one it got
   with 'ranch' on FELLGANG.ROW (the focus name enters no seed): core/hamlet/test-hamlet.js proves the digests equal. */
(function () {
  if (typeof KHAMLET === 'undefined' || !KHAMLET.CULTURES || !KHAMLET.FOCI) throw new Error('core/hamlet/fellgang: load core/hamlet 10 and 20 first');
  KHAMLET.CULTURES.fellgang = {
    kit: 'fellgang', household: 5, workShare: 0.5, slopeMax: 0.22,
    religious: 'fg-cairnhall', civic: 'fg-meethall', general: 'fg-store', food: 'fg-smokehouse', warehouse: 'fg-barn',
    services: {religious: 1, civic: 2, general: 1, food: 2, warehouse: 2},
    houses: {
      poor: [['fg-hut', 1, 3], ['fg-house', 2, 2]],
      middling: [['fg-longhouse', 3, 2], ['fg-house', 2, 1]],
      head: [['fg-headhouse', 1, 1]],
      middlingShare: 0.3
    },
    works: {
      fowling: [{key: 'fg-ropehouse', jobs: 8, share: 0.55}, {key: 'fg-eggstore', jobs: 5, share: 0.3}, {key: 'fg-pens', jobs: 3, share: 0.15}],
      ice: [{key: 'fg-icehouse', jobs: 8, share: 0.75}, {key: 'fg-sledgeshed', jobs: 6, share: 0.25}],
      farming: [{key: 'fg-barn', jobs: 6, share: 0.4}, {key: 'fg-granary', jobs: 4, share: 0.2}, {key: 'fg-smokehouse', jobs: 3, share: 0.18}, {key: 'fg-pens', jobs: 3, share: 0.22}],
      ranch: [{key: 'fg-pens', jobs: 4, share: 0.6}, {key: 'fg-barn', jobs: 4, share: 0.4}],
      quarry: [{key: 'fg-sledgeshed', jobs: 6, share: 0.6}, {key: 'fg-store', jobs: 3, share: 0.4}],
      stair: [{key: 'fg-ropehouse', jobs: 8, share: 0.4}, {key: 'fg-sledgeshed', jobs: 6, share: 0.3}, {key: 'fg-smithy', jobs: 4, share: 0.15}, {key: 'fg-store', jobs: 4, share: 0.15}],
      copper: [{key: 'fg-smithy', jobs: 6, share: 0.55}, {key: 'fg-store', jobs: 4, share: 0.25}, {key: 'fg-barn', jobs: 4, share: 0.2}],
      gold: [{key: 'fg-smithy', jobs: 5, share: 0.45}, {key: 'fg-store', jobs: 4, share: 0.35}, {key: 'fg-pens', jobs: 3, share: 0.2}],
      pass: [{key: 'fg-halting-house', jobs: 6, share: 0.35}, {key: 'fg-ropehouse', jobs: 6, share: 0.3}, {key: 'fg-smokehouse', jobs: 4, share: 0.2}, {key: 'fg-store', jobs: 3, share: 0.15}]
    },
    focusJobs: {fowling: 48, ice: 48, farming: 60, ranch: 45, quarry: 40, stair: 55, copper: 52, gold: 44, pass: 46},
    reach: {fowling: 260, ice: 260, farming: 500, ranch: 700, quarry: 300, stair: 200, copper: 340, gold: 320, pass: 280},
    pending: {}
  };
  ['fowling', 'ice', 'stair', 'copper', 'gold', 'pass'].forEach(function (f) { if (KHAMLET.FOCI.indexOf(f) < 0) KHAMLET.FOCI.push(f); });
  KHAMLET.FOCUS_INFO = KHAMLET.FOCUS_INFO || {};
  KHAMLET.FOCUS_INFO.fowling = {resource: 'a cliff with nest ledges (the flyers\' eggs and young, wall honey)', reach: 'to the wall\'s foot', rows: ['fellgang']};
  KHAMLET.FOCUS_INFO.ice = {resource: 'a lake frozen in winter (blocks cut, packed and carried)', season: 'the cutting weeks', rows: ['fellgang']};
  KHAMLET.FOCUS_INFO.stair = {resource: 'a gorge stair and lowering pitch (gin wheels, pack break-bulk and rope splice)', reach: 'to the stair lip', rows: ['fellgang']};
  KHAMLET.FOCUS_INFO.copper = {resource: 'native glacier skarn copper (cold-worked into wire, sheet and windings)', reach: 'to the skarn drift', rows: ['fellgang']};
  KHAMLET.FOCUS_INFO.gold = {resource: 'high summer fell gold veins (worked in the shieling months)', season: 'summer shielings', rows: ['fellgang']};
  KHAMLET.FOCUS_INFO.pass = {resource: 'a high river pass and fishery (halting house, guide ropes and smoked catch)', reach: 'to the ford and pass foot', rows: ['fellgang']};
})();
