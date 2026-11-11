/* ==================== core/hamlet 21: the Iziz Vernacular's row (plain data, [G data]) ==================== */
/* core/hamlet/PLAN.md section 3; the shape is 20-hamlet-cultures.js's. The Empire's farming and ranching villages, built
   from the Iziz Vernacular (kits/iziz-vernacular: the settlers' houses, farms and trades, drawn through the Ancients core;
   a host takes it as settlements/isle-demo/bundles.py's IZV). First wanted by the Iziz cluster's open-world region
   (openworld/iziz-cluster, 2026-11-11: Talia's countryside, the Talei long assimilated to Iziz). It is its own fragment
   so that the pages that list 20 (the isle demo's) are not changed by it; a host that wants Iziz villages lists it after 20.
   The Vernacular has no shrine yet: `vern_shrine` is pending (a declared box; the host draws a stand-in). The Talei keep
   their own architecture in the city (kits/talia); in the villages they build as the Empire's settlers do. */
KHAMLET.CULTURES = KHAMLET.CULTURES || {};
KHAMLET.CULTURES.iziz = {
  kit: 'iziz', household: 5, workShare: 0.45, slopeMax: 0.25,
  religious: 'vern_shrine', civic: 'vern_watch_house', general: 'vern_shops', food: 'vern_provisioner', warehouse: 'vern_silos',
  services: {religious: 2, civic: 3, general: 3, food: 3, warehouse: 3},
  houses: {
    poor: [['vern_house_poor_c', 1, 3], ['vern_house_poor_a', 1, 2], ['vern_house_poor_b', 1, 1]],
    middling: [['vern_house_mid_a', 2, 2], ['vern_house_mid_b', 2, 2], ['vern_house_mid_c', 3, 1]],
    head: [['vern_house_rich_a', 1, 1]],
    middlingShare: 0.35
  },
  works: {
    farming: [{key: 'vern_farmhouse', jobs: 10, share: 0.8}, {key: 'vern_silos', jobs: 5, share: 0.2}],
    ranch: [{key: 'vern_farmhouse', jobs: 8, share: 0.4}, {key: 'vern_byre', jobs: 6, share: 0.35}, {key: 'vern_pens', jobs: 3, share: 0.25}]
  },
  focusJobs: {farming: 90, ranch: 50},
  reach: {farming: 420, ranch: 520},
  pending: {
    'vern_shrine': {w: 9, d: 12, h: 8, what: 'a village shrine of the Izani state religion (kits/iziz-vernacular has none yet)'}
  }
};
