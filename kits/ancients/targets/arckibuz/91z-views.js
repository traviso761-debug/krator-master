/* ================================================================= ARCKIBUZ — preset camera views & triangle budget class
   [G data] File-safe preset names (no ':' or "'"). Eighth element opens interior cut-away views automatically. */
BUDGET.type.arckibuz = 'mega';

const VIEWS = {
  'Arckibuz':                   [-210, 148, 255,    0,  58,   0],
  'Intact ancient arcology':    [-1175, 148, 255, -960, 58,   0],
  'Arckibuz ruin':              [1185, 142, 245,  960,  52,   8],
  'All three states':           [0,    460, 1180,   0,  45,   0],
  'Sunken court and promenade': [78,    38,  86,    0,  22, -16],
  'Polygonal vegetable gardens':[-285, 128, 215, -145,  28,  45],
  'Community council bowl':     [8,     48,  20,    0,  36,  -3],
  'Shelter shaft and highway':  [292,   64, 118,  186,  28,   8],
  'Roof tents and reservoir':   [118,  142,  98,   18,  98, -16],
  'Refurbished at night':       [-195, 132, 235,    0,  58,   0, true],
  'Cutaway community center':   [74,   114,  82,    0,  38,   0, false, { site: 'arckibuz/3/community', storey: 2 }],
  'Cutaway housing wing':       [48,   118, -96,    0,  68, -44, false, { site: 'arckibuz/3/housing-n', storey: 1 }],
  'Cutaway pit crop works':     [-88,   92,  86,  -24,   2,   8, false, { site: 'arckibuz/3/pit', storey: 0 }]
};
