// TARGET: city — Marr camera presets. [camX,camY,camZ, targetX,targetY,targetZ]
// Tagged [G data] in PORT.md: no DOM, no Three.js, no numeric || defaults.
const _marEye = (x, z, tx, tz) => [x, terrainH(x, z) + 1.8, z, tx, terrainH(tx, tz) + 3.2, tz];
const VIEWS = {
 'Opening — Harbour & Delta Overview': [0, 260, -490, 0, 12, 60],
 'Overview': [0, 820, 620, 0, 0, 80],
 'I. Poinda de Navigadarz — Forta & Gilda': [-310, 72, -310, -195, 12, -175],
 'II. Porta & Dokaz — Breakwater & Customs Quay': [45, 52, -265, -20, 8, -110],
 'III. Isla de Sidi Olda — Templa, Isqer Greta & Palas de Govarnar': [75, 58, -18, -46, 12, 10],
 'Palas de Govarnar — Grand Forecourt': [12, 26, 34, -46, 12, 34],
 'Isla de Marchondaz & Markita de Porta': [155, 52, -95, 86, 8, -38],
 'Isla de Kanal & Gardon de Kanal': [158, 56, 285, 80, 8, 175],
 'IV. De Xedaz — Rropaguoka & Tenements': [325, 68, -185, 240, 10, 25],
 'Om de Landarnaz (the Courtesans Quarter)': [205, 24, -18, 254, 9, 12],
 'V. Qartar de Gardonz — Mansion Estates & Paseo': [-210, 74, -145, -235, 10, 80],
 'Paseo de Gardonz — Eye Level': _marEye(-212, 18, -212, 95),
 'Knal Greta & Poinda Greta — Canal Eye Level': [0, 8.5, -55, 0, 6.5, 40],
 'VI. Qartar Lo & Muraya de Tera (Steeper South U-Extension)': [0, 135, 525, 0, 8, 290],
 'Arka de Agua & Porta de Iziz — South Water-Gate': [0, 34, 445, 0, 8, 365],
 'Extramuros Fincas — Citrus, Cane & Indigo Estates': [-180, 75, 540, -140, 6, 440]
};
