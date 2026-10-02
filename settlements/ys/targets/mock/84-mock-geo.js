// ================================================================= YS MOCK — the ground: ten metres of sea, a shore to the west
// The gate's stage (PLAN.md P1): open water over a flat seabed where the drowned tower stands, a sandbar for the three
// houses (a fill stamp in 89z-rows.js), and a beach rising to land in the west so the shots have a shore in them.
const MOCK={shoreX:-330,beachW:170};
function YS_NAT(x,z){const t=clamp((MOCK.shoreX-x)/MOCK.beachW,0,1);const s=t*t*(3-2*t);
 const sea=-10+(fbm(x/140,z/140,3.3,2)-.5)*1.6;const land=3.6+(MOCK.shoreX-MOCK.beachW-x)*.03+(fbm(x/260,z/260,1.9,3)-.5)*6;
 return sea+(land-sea)*s;}
