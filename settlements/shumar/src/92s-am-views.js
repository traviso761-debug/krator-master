/* ================================================================= AMARO CAMERA VIEWS (Step A2)
   [G data] Curated inspection and acceptance views across Amaro's 4-tier ablaq canyon, skyline necropolis, terraced
   customs shelf, confluence bridge, citadel prow, forge ledges, bazaar spine, and plateau ring hamlets.
   Note: strictly alphanumeric, spaces, and hyphens in view keys (tools/check_views.py). */

(function () {
  for (const k in VIEWS) delete VIEWS[k];
  Object.assign(VIEWS, {
    'Opening': [-210, 294, -565, 65, 198, -415],
    'Overview': [-840, 680, -1340, 40, 145, -340],
    'Cliff Lip Overlook': [-18, 256, -376, 42, 28, -895],
    'Madinat al-Qubab Skyline': [735, 174, -815, 795, 258, -420],
    'Payaru-Gisr Gorge Bridge': [-58, 26, -1012, 68, 18, -892],
    'Customs Shelf Babu-Dalab and Babu-Iziz': [315, 238, -748, 250, 204, -578],
    'Qappu al-Subaru Citadel Prow': [-925, 302, -505, -705, 262, -295],
    'Darb al-Kir Forge Ledges': [-335, 156, -792, -148, 96, -612],
    'Qasaba Bazaar Spine': [10, 246, -150, 0, 246, -335],
    'Hall of Blades Court': [784, 262, -348, 822, 262, -420],
    'Ring Hamlet Terrace Farm': [-590, 286, 1590, -680, 248, 1480]
  });
})();
