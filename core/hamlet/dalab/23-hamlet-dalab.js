/* ==================== core/hamlet 23 (opt-in): the Dalab row, and the gene focus (plain data, [G data]) ==================== */
/* settlements/nulab/PLAN.md sections 4.2 and 7 (the basin's 135 villages: "no Dalab row ... `core/hamlet/dalab/` as an opt-in
   subfolder, like `fellgang/`, with Dalab's houses, stores, shrine, `landing` (a jetty) and works by focus; a `gene` focus").
   OPT-IN: this file sits in a subfolder no build lists unless it asks for it by name, so no other page's bytes change
   (core/hamlet/dalab/README.md). Load it after 20-hamlet-cultures.js; it registers at load:
     KHAMLET.CULTURES.dalab   the Realm of Dalab's village, in the Dalab set's pieces (settlements/dalab/src: 70 dwellings, 71
                              trade, 71c town, 73 sacred, 74 ranch). Peasants in round earth huts and post houses, family
                              compounds and terrace rows for the middling, the village priest's house the head's (the priests
                              rule: LORE 6.1); the wayside shrine, the well court, the shop row, the tavern and the granaries
     KHAMLET.FOCI             + 'gene' (the genepriests' breeding stations, Daranch's pattern: the gene beds, the priests' house,
                              the granaries for the seed stock)
     KHAMLET.FOCUS_INFO.gene  what the focus works on, for a host's labels and checks
   The keys the Dalab set lacks are `pending` with a declared box (the host draws a stand-in until the set has them): the gene
   beds, the boat shed, the fish racks and the jetty (the harbour set settlements/nulab/PLAN.md section 7 asks of the Dalab set),
   the charcoal yard and the adit. Every number is the plan's estimate (est.), marked proposed there. */
(function () {
  if (typeof KHAMLET === 'undefined' || !KHAMLET.CULTURES || !KHAMLET.FOCI) throw new Error('core/hamlet/dalab: load core/hamlet 10 and 20 first');
  KHAMLET.CULTURES.dalab = {
    kit: 'dalab', household: 6, workShare: 0.5, slopeMax: 0.22,
    religious: 'dalab_shrine', civic: 'dalab_well', general: 'dalab_shops', food: 'dalab_tavern', warehouse: 'dalab_granaries',
    services: {religious: 1, civic: 1, general: 3, food: 3, warehouse: 2},
    houses: {
      poor: [['dalab_hut_a', 1, 4], ['dalab_hut_b', 1, 2], ['dalab_hut_c', 1, 2]],
      middling: [['dalab_compound', 3, 2], ['dalab_rowhouse', 3, 1]],
      head: [['dalab_priest_house', 1, 1]],
      middlingShare: 0.25
    },
    works: {
      farming: [{key: 'dalab_compound', jobs: 10, share: 0.6}, {key: 'dalab_granaries', jobs: 5, share: 0.25}, {key: 'dalab_windmill', jobs: 6, share: 0.15}],
      fishing: [{key: 'nl_boatshed', jobs: 8, share: 0.55}, {key: 'nl_fishracks', jobs: 4, share: 0.45}],
      gene: [{key: 'nl_genebeds', jobs: 10, share: 0.6}, {key: 'dalab_priest_house', jobs: 4, share: 0.15}, {key: 'dalab_granaries', jobs: 5, share: 0.25}],
      ranch: [{key: 'dalab_ranch', jobs: 14, share: 0.75}, {key: 'dalab_granaries', jobs: 4, share: 0.25}],
      lumber: [{key: 'nl_charcoal', jobs: 8, share: 0.6}, {key: 'dalab_workshop', jobs: 6, share: 0.4}],
      clay: [{key: 'dalab_earthyard', jobs: 8, share: 0.6}, {key: 'dalab_potter', jobs: 6, share: 0.4}],
      mine: [{key: 'nl_adit', jobs: 8, share: 0.6}, {key: 'dalab_smithy', jobs: 5, share: 0.4}]
    },
    focusJobs: {farming: 100, fishing: 70, gene: 50, ranch: 50, lumber: 40, clay: 36, mine: 40},
    reach: {farming: 420, fishing: 260, gene: 360, ranch: 520, lumber: 400, clay: 300, mine: 400},
    landing: {key: 'nl_jetty', jobs: 3},
    pending: {}
  };
  if (KHAMLET.FOCI.indexOf('gene') < 0) KHAMLET.FOCI.push('gene');
  KHAMLET.FOCUS_INFO = KHAMLET.FOCUS_INFO || {};
  KHAMLET.FOCUS_INFO.gene = {resource: 'the genepriests\' breeding stock (rim crops, the lizards, the rim\'s flora from Ledge\'s gene bank)', reach: 'the station\'s own ground', rows: ['dalab']};
})();
