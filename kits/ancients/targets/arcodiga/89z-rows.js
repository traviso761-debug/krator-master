// TARGET: arcodiga — Paolo Soleri's Arcodiga dam arcology, in three states:
//   x = -2600 (d = 0)  Intact Ancient dam arcology at its peak (~257k-280k people)
//   x =     0 (d = 3)  Refurbished settlement centerpiece (~26k people in the active Stiffening Wing, Axial Spine,
//                      Crest Promenade, VTOL Airport, Powerhouse & inner ribs; 12 outer ribs sealed behind bulkheads)
//   x = +2600 (d = 1)  Cataclysm-breached ruin with 211 m Notch cascade, severed west wing, and seated debris
const TITLE = 'Arcodiga — dam arcology and refurbished centerpiece';
const GROUND_C = 0;
const DECAYS = [0, 1, 3];
const ROWS = {
  arcodiga: { z: 0, s: 2600, r: 1100 }
};
const RUINS = [[-2600, 0, 950], [0, 0, 1050], [2600, 0, 1100]];
const EXTRA_BUILDERS = { arcodiga: buildArcodiga };
