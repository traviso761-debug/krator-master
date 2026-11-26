/* ================================================================= ARCKIBUZ — target row configuration
   [G data] Intact (d = 0 at x = -960), Refurbished Settlement Centerpiece (d = 3 at x = 0), Ruined (d = 1 at x = +960). */
const TITLE = 'Arckibuz — desert arcology';
const GROUND_C = 0;
const DECAYS = [0, 1, 3];
const ROWS = { arckibuz: { z: 0, s: 960, r: 420 } };
const RUINS = [[960, 0, 260]];
const EXTRA_BUILDERS = { arckibuz: buildArckibuz };
