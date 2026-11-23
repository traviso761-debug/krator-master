/* ================================================================= URUNDASHI CAMERA VIEWS
   [G data] Curated inspection and acceptance views across Urundashi's bastioned KCITY.grid qasba, wet moat & gate bridges,
   4th-Regiment Keep, Crossroads Qubbas & Bazaar, East Historian/Iziz Wikala, SW Cavalry Stud & Copper Stills, and steppe ring.
   Note: strictly alphanumeric, spaces, and hyphens in view keys (tools/check_views.py). */

(function () {
  for (const k in VIEWS) delete VIEWS[k];
  Object.assign(VIEWS, {
    'Opening': [-485, 195, 495, -20, 68, -10],
    'Overview': [-790, 560, 860, 15, 58, 25],
    'Babu al-Sarq East Gate and Moat Bridge': [445, 98, -125, 295, 72, -38],
    'Qappu al-Fursan Fourth Regiment Keep': [-365, 132, -345, -165, 76, -155],
    'Suq al-Rikab Crossroads and Qubba Domes': [92, 108, 128, -12, 74, -45],
    'Rabad al-Sarq Historian and Iziz Wikala': [625, 118, 95, 415, 68, -28],
    'Rabad al-Dubnu Cavalry Stud and Copper Stills': [-210, 96, 615, 35, 36, 415],
    'Harat al-Hadid Metallurgy and Powder Ward': [-355, 124, 295, -155, 68, 165],
    'Babu Amaru West Highway Gate': [-475, 96, 135, -295, 70, 32]
  });
})();
