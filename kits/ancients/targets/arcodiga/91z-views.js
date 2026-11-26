// TARGET: arcodiga — view presets (file-safe names: no colons or apostrophes).
// First entry opens on the Refurbished Settlement Centerpiece (x = 0, d = 3).
// Presets with an 8th element open that organ's furnished cut-away interior automatically.
BUDGET.type.arcodiga = 'mega';

const VIEWS = {
  'Refurbished centerpiece': [240, 380, 1280, 0, 195, 40],
  'Refurbished highway prow': [-360, 210, 680, -40, 185, 200],
  'Sealed outer ribs': [520, 315, 105, 390, 195, -55],
  'Upstream VTOL airport': [-240, 490, -860, 0, 370, -440],
  'Powerhouse and waterways': [180, 125, 760, 0, 38, 120],
  'Intact Arcodiga': [-ROWS.arcodiga.s + 240, 380, 1280, -ROWS.arcodiga.s, 195, 40],
  'Intact reservoir and crest': [-ROWS.arcodiga.s + 320, 520, -760, -ROWS.arcodiga.s, 340, -240],
  'Arcodiga ruin and cascade': [ROWS.arcodiga.s - 120, 260, 1080, ROWS.arcodiga.s - 180, 180, 40],
  'Breach cascade closeup': [ROWS.arcodiga.s - 120, 95, 520, ROWS.arcodiga.s - 265, 165, 20],
  'All three states': [0, 1150, 3800, 0, 180, 0],
  'Refurbished night': [260, 340, 1180, 0, 195, 40, true],
  'Interior Wing Hub': [48, 218, 242, 0, 177, 198, false, { site: 'arcodiga/3/wing', storey: 0 }],
  'Interior City Spine': [46, 224, 58, 0, 184, 5, false, { site: 'arcodiga/3/spine', storey: 2 }],
  'Interior Powerhouse': [58, 52, 66, 0, 5, 10, false, { site: 'arcodiga/3/works', storey: 0 }]
};
